import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, TrendingUp, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface CourseData {
  id: string;
  course_name: string;
  course_id: string;
  credits: number;
  mid_term_marks: number;
  attendance: number;
  assignments: number;
  predicted_end_term_marks: number | null;
  predicted_grade: string | null;
}

export const StudentCoursesTable = () => {
  const { profile } = useAuth();
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [sgpa, setSgpa] = useState<number | null>(null);

  useEffect(() => {
    if (profile?.email) {
      fetchCourses();
    }
  }, [profile]);

  const fetchCourses = async () => {
    try {
      const studentId = profile?.email.split('@')[0];
      const { data, error } = await supabase
        .from('student_courses')
        .select('*')
        .eq('student_id', studentId);

      if (error) throw error;

      setCourses(data || []);
      calculateSGPA(data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateSGPA = (coursesData: CourseData[]) => {
    if (coursesData.length === 0) {
      setSgpa(null);
      return;
    }

    const totalCredits = coursesData.reduce((sum, course) => sum + course.credits, 0);
    const weightedGradePoints = coursesData.reduce((sum, course) => {
      const gradePoint = getGradePoint(course.predicted_grade || 'F');
      return sum + (gradePoint * course.credits);
    }, 0);

    setSgpa(totalCredits > 0 ? weightedGradePoints / totalCredits : null);
  };

  const getGradePoint = (grade: string): number => {
    const gradePoints: { [key: string]: number } = {
      'A+': 10, 'A': 9, 'B+': 8, 'B': 7, 'C+': 6, 'C': 5, 'D': 4, 'F': 0
    };
    return gradePoints[grade] || 0;
  };

  const getGradeBadgeVariant = (grade: string | null) => {
    if (!grade) return 'secondary';
    if (['A+', 'A'].includes(grade)) return 'default';
    if (['B+', 'B'].includes(grade)) return 'secondary';
    return 'destructive';
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            My Courses
          </CardTitle>
        </CardHeader>
        <CardContent>
          {courses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No course data available yet.</p>
              <p className="text-sm mt-2">Your faculty will upload course information soon.</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course Name</TableHead>
                    <TableHead>Course ID</TableHead>
                    <TableHead className="text-center">Credits</TableHead>
                    <TableHead className="text-center">Mid Term</TableHead>
                    <TableHead className="text-center">Attendance</TableHead>
                    <TableHead className="text-center">Assignments</TableHead>
                    <TableHead className="text-center">Predicted End Term</TableHead>
                    <TableHead className="text-center">Predicted Grade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courses.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell className="font-medium">{course.course_name}</TableCell>
                      <TableCell>{course.course_id}</TableCell>
                      <TableCell className="text-center">{course.credits}</TableCell>
                      <TableCell className="text-center">{course.mid_term_marks}</TableCell>
                      <TableCell className="text-center">{course.attendance}%</TableCell>
                      <TableCell className="text-center">{course.assignments}</TableCell>
                      <TableCell className="text-center">
                        {course.predicted_end_term_marks || '-'}
                      </TableCell>
                      <TableCell className="text-center">
                        {course.predicted_grade ? (
                          <Badge variant={getGradeBadgeVariant(course.predicted_grade)}>
                            {course.predicted_grade}
                          </Badge>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {courses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Academic Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <span className="font-medium">Predicted SGPA:</span>
              <span className="text-2xl font-bold">
                {sgpa ? sgpa.toFixed(2) : 'N/A'}
              </span>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Recommendations:</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                {courses.some(c => c.attendance < 75) && (
                  <div className="flex items-start gap-2 p-3 bg-destructive/10 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
                    <p>Your attendance is below 75% in some courses. Please improve to meet requirements.</p>
                  </div>
                )}
                {courses.some(c => (c.predicted_grade && ['D', 'F'].includes(c.predicted_grade))) && (
                  <div className="flex items-start gap-2 p-3 bg-destructive/10 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
                    <p>You have low predicted grades in some courses. Consider seeking help from faculty or peers.</p>
                  </div>
                )}
                {sgpa && sgpa >= 8.5 && (
                  <div className="flex items-start gap-2 p-3 bg-green-500/10 rounded-lg">
                    <TrendingUp className="h-4 w-4 text-green-600 mt-0.5" />
                    <p>Excellent performance! Keep up the good work to maintain your high SGPA.</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

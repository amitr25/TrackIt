import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, Award, BookOpen, Target } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface CourseData {
  id: string;
  course_name: string;
  course_id: string;
  credits: number;
  semester: number;
  mid_term_marks: number;
  attendance: number;
  assignments: number;
  predicted_end_term_marks: number | null;
  predicted_grade: string | null;
  quiz_score: number;
}

export const StudentAnalytics = () => {
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

    let totalCredits = 0;
    let weightedGradePoints = 0;

    coursesData.forEach(course => {
      if (course.predicted_grade) {
        const gpMatch = course.predicted_grade.match(/GP:\s*(\d+)/);
        if (gpMatch) {
          const gp = parseInt(gpMatch[1]);
          weightedGradePoints += course.credits * gp;
          totalCredits += course.credits;
        }
      }
    });

    setSgpa(totalCredits > 0 ? weightedGradePoints / totalCredits : null);
  };

  const getMarksDistribution = () => {
    return courses.map(course => ({
      name: course.course_name.substring(0, 15) + '...',
      'Mid Term': course.mid_term_marks,
      'Assignments': course.assignments,
      'Attendance': course.attendance / 10, // Scale to 10
      'Quiz': course.quiz_score / 10, // Scale to 10
      'Predicted End Term': course.predicted_end_term_marks || 0,
    }));
  };

  const extractGradeInfo = (predictedGrade: string | null) => {
    if (!predictedGrade) return { grade: '-', gp: '-', total: '-' };
    
    const gradeMatch = predictedGrade.match(/^([A-Z+]+)/);
    const gpMatch = predictedGrade.match(/GP:\s*(\d+)/);
    const totalMatch = predictedGrade.match(/Total:\s*([\d.]+)/);
    
    return {
      grade: gradeMatch ? gradeMatch[1] : '-',
      gp: gpMatch ? gpMatch[1] : '-',
      total: totalMatch ? totalMatch[1] : '-',
    };
  };

  const getGradeColor = (grade: string) => {
    if (grade === 'O' || grade === 'A+' || grade === 'A') return 'text-secondary';
    if (grade === 'B+' || grade === 'B') return 'text-primary';
    if (grade === 'C' || grade === 'P') return 'text-accent';
    return 'text-destructive';
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold mb-2">Performance Analytics</h1>
        <p className="text-muted-foreground">
          Comprehensive view of your academic performance and predicted grades
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Award className="h-5 w-5 text-primary" />
              Predicted SGPA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {sgpa ? sgpa.toFixed(2) : 'N/A'}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Out of 10.0
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="h-5 w-5 text-secondary" />
              Total Courses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-secondary">
              {courses.length}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              This semester
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="h-5 w-5 text-accent" />
              Total Credits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent">
              {courses.reduce((sum, course) => sum + course.credits, 0)}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Credit hours
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Marks Distribution Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Marks Distribution Across Courses
          </CardTitle>
          <CardDescription>
            Visual breakdown of your performance in different components
          </CardDescription>
        </CardHeader>
        <CardContent>
          {courses.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={getMarksDistribution()}>
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end" 
                  height={100}
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Bar dataKey="Mid Term" fill="hsl(var(--primary))" />
                <Bar dataKey="Assignments" fill="hsl(var(--secondary))" />
                <Bar dataKey="Attendance" fill="hsl(var(--accent))" />
                <Bar dataKey="Quiz" fill="hsl(var(--analytics-blue))" />
                <Bar dataKey="Predicted End Term" fill="hsl(var(--performance-green))" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[400px] flex items-center justify-center text-muted-foreground">
              No course data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Predicted Grades Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-secondary" />
            Predicted Grades & Performance
          </CardTitle>
          <CardDescription>
            AI-predicted grades based on your current performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          {courses.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course Name</TableHead>
                    <TableHead className="text-center">Credits</TableHead>
                    <TableHead className="text-center">Predicted Grade</TableHead>
                    <TableHead className="text-center">Grade Point</TableHead>
                    <TableHead className="text-center">Total Marks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courses.map((course) => {
                    const gradeInfo = extractGradeInfo(course.predicted_grade);
                    return (
                      <TableRow key={course.id}>
                        <TableCell className="font-medium">
                          {course.course_name}
                        </TableCell>
                        <TableCell className="text-center">{course.credits}</TableCell>
                        <TableCell className="text-center">
                          <Badge 
                            variant="outline" 
                            className={getGradeColor(gradeInfo.grade)}
                          >
                            {gradeInfo.grade}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center font-semibold">
                          {gradeInfo.gp}
                        </TableCell>
                        <TableCell className="text-center">
                          {gradeInfo.total}/100
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No predicted grades available yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

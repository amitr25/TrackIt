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
import { Button } from "@/components/ui/button";
import { GraduationCap, TrendingUp, AlertCircle, Brain, Award, BookOpen, BarChart3, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts";
import { useToast } from "@/hooks/use-toast";

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
  student_id: string;
}

export const StudentCoursesTable = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [sgpa, setSgpa] = useState<number | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<CourseData | null>(null);
  const [isCourseDialogOpen, setIsCourseDialogOpen] = useState(false);
  const [aiInsights, setAiInsights] = useState<string>("");
  const [detailedInsights, setDetailedInsights] = useState<string>("");
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [showDetailed, setShowDetailed] = useState(false);

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
        // Extract GP from predicted_grade string: "O (GP: 10, Total: 95.00/100)"
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

  const extractGradeFromPrediction = (predictedGrade: string | null) => {
    if (!predictedGrade) return '-';
    const gradeMatch = predictedGrade.match(/^([A-Z+]+)/);
    return gradeMatch ? gradeMatch[1] : '-';
  };

  const generateInsights = async (detailed: boolean = false) => {
    if (courses.length === 0) {
      toast({
        title: "No Data Available",
        description: "You need course data to generate insights.",
        variant: "destructive",
      });
      return;
    }

    setLoadingInsights(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-student-insights', {
        body: { courses, detailed }
      });

      if (error) {
        throw error;
      }

      if (detailed) {
        setDetailedInsights(data.insights);
        setShowDetailed(true);
      } else {
        setAiInsights(data.insights);
      }

      toast({
        title: "Insights Generated",
        description: detailed ? "Detailed insights are ready!" : "AI insights generated successfully!",
      });
    } catch (error: any) {
      console.error('Error generating insights:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate insights. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingInsights(false);
    }
  };

  const CoursePerformanceCard = ({ course }: { course: CourseData }) => {
  const performanceData = [
      { name: 'Mid Term', value: course.mid_term_marks, fill: 'hsl(var(--primary))' },
      { name: 'Attendance', value: course.attendance, fill: 'hsl(var(--secondary))' },
      { name: 'Assignments', value: course.assignments, fill: 'hsl(var(--accent))' },
      { name: 'Quiz', value: course.quiz_score, fill: 'hsl(var(--analytics-blue))' },
    ];

    return (
      <div className="space-y-4">
        <div className="space-y-1">
          <h4 className="font-semibold text-lg text-foreground">{course.course_name}</h4>
          <p className="text-sm text-muted-foreground">Course ID: {course.course_id}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
            <BookOpen className="h-3 w-3" />
            <span>{course.credits} Credits</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            <h5 className="text-sm font-semibold text-foreground">Performance Breakdown</h5>
          </div>
          
          <div className="h-[160px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData}>
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  domain={[0, 100]} 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {performanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
            <div className="space-y-1 p-2 rounded-md bg-primary/5">
              <div className="flex items-center gap-1.5">
                <Award className="h-3.5 w-3.5 text-primary" />
                <p className="text-xs font-medium text-muted-foreground">Predicted Grade</p>
              </div>
              <p className="text-2xl font-bold text-primary">
                {course.predicted_grade || 'N/A'}
              </p>
            </div>
            <div className="space-y-1 p-2 rounded-md bg-accent/5">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-accent" />
                <p className="text-xs font-medium text-muted-foreground">End Term</p>
              </div>
              <p className="text-2xl font-bold text-accent">
                {course.predicted_end_term_marks || 'N/A'}
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-border">
            <h5 className="text-xs font-medium text-muted-foreground mb-2">Detailed Metrics:</h5>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-xs p-2 rounded bg-muted/50">
                <span className="text-muted-foreground">Mid Term:</span>
                <span className="font-semibold ml-1">{course.mid_term_marks}%</span>
              </div>
              <div className="text-xs p-2 rounded bg-muted/50">
                <span className="text-muted-foreground">Attendance:</span>
                <span className="font-semibold ml-1">{course.attendance}%</span>
              </div>
              <div className="text-xs p-2 rounded bg-muted/50">
                <span className="text-muted-foreground">Assignments:</span>
                <span className="font-semibold ml-1">{course.assignments}%</span>
              </div>
              <div className="text-xs p-2 rounded bg-muted/50">
                <span className="text-muted-foreground">Quiz Score:</span>
                <span className="font-semibold ml-1">{course.quiz_score}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
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
                    <TableHead className="text-center">Semester</TableHead>
                    <TableHead className="text-center">Mid Term</TableHead>
                    <TableHead className="text-center">Attendance</TableHead>
                    <TableHead className="text-center">Assignments</TableHead>
                    <TableHead className="text-center">Predicted End Term</TableHead>
                    <TableHead className="text-center">Predicted Grade</TableHead>
                    <TableHead className="text-center">Quiz</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courses.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell className="font-medium">
                        <Button
                          variant="link"
                          className="p-0 h-auto font-normal hover:text-primary"
                          onClick={() => {
                            setSelectedCourse(course);
                            setIsCourseDialogOpen(true);
                          }}
                        >
                          {course.course_name}
                        </Button>
                      </TableCell>
                      <TableCell>{course.course_id}</TableCell>
                      <TableCell className="text-center">{course.credits}</TableCell>
                      <TableCell className="text-center">{course.semester}</TableCell>
                      <TableCell className="text-center">{course.mid_term_marks}</TableCell>
                      <TableCell className="text-center">{course.attendance}%</TableCell>
                      <TableCell className="text-center">{course.assignments}</TableCell>
                      <TableCell className="text-center">
                        {course.predicted_end_term_marks || '-'}
                      </TableCell>
                    <TableCell className="text-center">
                      {course.predicted_grade ? (
                        <Badge variant="outline" className="font-medium">
                          {extractGradeFromPrediction(course.predicted_grade)}
                        </Badge>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {course.quiz_score > 0 ? (
                        <span className="text-sm font-medium text-foreground">
                          {course.quiz_score}%
                        </span>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => navigate(`/quiz?course=${encodeURIComponent(course.course_name)}&courseId=${course.course_id}&studentId=${course.student_id}`)}
                          className="gap-2"
                        >
                          <Brain className="h-4 w-4" />
                          Take Quiz
                        </Button>
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

      {/* Course Performance Dialog */}
      <Dialog open={isCourseDialogOpen} onOpenChange={setIsCourseDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Course Performance</DialogTitle>
          </DialogHeader>
          {selectedCourse && <CoursePerformanceCard course={selectedCourse} />}
        </DialogContent>
      </Dialog>

      {courses.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Academic Insights
              </CardTitle>
              <Button
                onClick={() => generateInsights(false)}
                disabled={loadingInsights}
                size="sm"
                className="gap-2"
              >
                <Sparkles className="h-4 w-4" />
                {loadingInsights ? "Generating..." : "Generate AI Insights"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <span className="font-medium">Predicted SGPA:</span>
              <span className="text-2xl font-bold">
                {sgpa ? sgpa.toFixed(2) : 'N/A'}
              </span>
            </div>

            {aiInsights && (
              <div className="space-y-3 p-4 bg-primary/5 rounded-lg border border-primary/20">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    AI-Generated Insights
                  </h4>
                  <Button
                    onClick={() => generateInsights(true)}
                    disabled={loadingInsights}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    Get Detailed Analysis
                  </Button>
                </div>
                <div className="prose prose-sm max-w-none text-foreground whitespace-pre-line">
                  {aiInsights}
                </div>
              </div>
            )}

            {showDetailed && detailedInsights && (
              <div className="space-y-3 p-4 bg-accent/5 rounded-lg border border-accent/20">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Brain className="h-4 w-4 text-accent" />
                    In-Depth Analysis
                  </h4>
                  <Button
                    onClick={() => setShowDetailed(false)}
                    variant="ghost"
                    size="sm"
                  >
                    {showDetailed ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </div>
                <div className="prose prose-sm max-w-none text-foreground whitespace-pre-line">
                  {detailedInsights}
                </div>
              </div>
            )}

            <div className="space-y-3">
              <h4 className="font-medium">Quick Recommendations:</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                {courses.some(c => c.attendance < 75) && (
                  <div className="flex items-start gap-2 p-3 bg-destructive/10 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
                    <p>Your attendance is below 75% in some courses. Please improve to meet requirements.</p>
                  </div>
                )}
                {courses.some(c => (c.predicted_grade && extractGradeFromPrediction(c.predicted_grade) === 'F')) && (
                  <div className="flex items-start gap-2 p-3 bg-destructive/10 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
                    <p>You have low predicted grades in some courses. Consider seeking help from faculty or peers.</p>
                  </div>
                )}
                {sgpa && sgpa >= 8.5 && (
                  <div className="flex items-start gap-2 p-3 bg-secondary/10 rounded-lg">
                    <TrendingUp className="h-4 w-4 text-secondary mt-0.5" />
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

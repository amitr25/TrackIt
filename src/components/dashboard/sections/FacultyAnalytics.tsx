import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bar, BarChart, Line, LineChart, XAxis, YAxis, CartesianGrid, Legend, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { BarChart3, TrendingUp, Award, Target, BookOpen } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface CourseDifficulty {
  course_name: string;
  avg_mid_term: number;
  difficulty: string;
  student_count: number;
}

interface SemesterPerformance {
  semester: number;
  avg_sgpa: number;
  course_count: number;
  student_count: number;
}

interface CoursePerformance {
  course_name: string;
  avg_sgpa: number;
  credits: number;
  student_count: number;
  avg_mid_term: number;
  avg_attendance: number;
  avg_assignments: number;
}

export const FacultyAnalytics = () => {
  const { profile } = useAuth();
  const [courseDifficulty, setCourseDifficulty] = useState<CourseDifficulty[]>([]);
  const [semesterPerformance, setSemesterPerformance] = useState<SemesterPerformance[]>([]);
  const [coursePerformance, setCoursePerformance] = useState<CoursePerformance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        const { data: courses, error } = await supabase
          .from('student_courses')
          .select('*')
          .eq('faculty_id', profile?.user_id);

        if (error) throw error;

        if (courses && courses.length > 0) {
          // 1. Course Difficulty Trends
          const courseMap: Record<string, { total_mid_term: number; count: number }> = {};
          
          courses.forEach(course => {
            const name = course.course_name;
            if (!courseMap[name]) {
              courseMap[name] = { total_mid_term: 0, count: 0 };
            }
            courseMap[name].total_mid_term += Number(course.mid_term_marks) || 0;
            courseMap[name].count++;
          });

          const difficultyData: CourseDifficulty[] = Object.entries(courseMap).map(([course, data]) => {
            const avg = data.total_mid_term / data.count;
            let difficulty = 'Medium';
            if (avg >= 15) difficulty = 'Easy';
            else if (avg < 10) difficulty = 'Hard';
            
            return {
              course_name: course,
              avg_mid_term: Math.round(avg * 10) / 10,
              difficulty,
              student_count: data.count,
            };
          }).sort((a, b) => a.avg_mid_term - b.avg_mid_term);

          setCourseDifficulty(difficultyData);

          // 2. Semester-wise Performance
          const semesterMap: Record<number, { total_gp: number; total_credits: number; student_set: Set<string>; course_set: Set<string> }> = {};
          
          courses.forEach(course => {
            const semester = course.semester;
            if (!semesterMap[semester]) {
              semesterMap[semester] = { total_gp: 0, total_credits: 0, student_set: new Set(), course_set: new Set() };
            }
            
            if (course.predicted_grade) {
              const gpMatch = course.predicted_grade.match(/GP:\s*(\d+)/);
              if (gpMatch) {
                const gp = parseInt(gpMatch[1]);
                semesterMap[semester].total_gp += gp * course.credits;
                semesterMap[semester].total_credits += course.credits;
              }
            }
            
            semesterMap[semester].student_set.add(course.student_id);
            semesterMap[semester].course_set.add(course.course_name);
          });

          const semesterData: SemesterPerformance[] = Object.entries(semesterMap)
            .map(([semester, data]) => ({
              semester: parseInt(semester),
              avg_sgpa: data.total_credits > 0 ? Math.round((data.total_gp / data.total_credits) * 100) / 100 : 0,
              course_count: data.course_set.size,
              student_count: data.student_set.size,
            }))
            .sort((a, b) => a.semester - b.semester);

          setSemesterPerformance(semesterData);

          // 3. Course-wise Average SGPA
          const coursePerformanceMap: Record<string, { 
            total_gp: number; 
            total_credits: number; 
            credits: number;
            student_count: number;
            total_mid_term: number;
            total_attendance: number;
            total_assignments: number;
            count: number;
          }> = {};
          
          courses.forEach(course => {
            const name = course.course_name;
            if (!coursePerformanceMap[name]) {
              coursePerformanceMap[name] = { 
                total_gp: 0, 
                total_credits: 0, 
                credits: course.credits,
                student_count: 0,
                total_mid_term: 0,
                total_attendance: 0,
                total_assignments: 0,
                count: 0
              };
            }
            
            if (course.predicted_grade) {
              const gpMatch = course.predicted_grade.match(/GP:\s*(\d+)/);
              if (gpMatch) {
                const gp = parseInt(gpMatch[1]);
                coursePerformanceMap[name].total_gp += gp * course.credits;
                coursePerformanceMap[name].total_credits += course.credits;
              }
            }
            
            coursePerformanceMap[name].total_mid_term += Number(course.mid_term_marks) || 0;
            coursePerformanceMap[name].total_attendance += Number(course.attendance) || 0;
            coursePerformanceMap[name].total_assignments += Number(course.assignments) || 0;
            coursePerformanceMap[name].student_count++;
            coursePerformanceMap[name].count++;
          });

          const coursePerf: CoursePerformance[] = Object.entries(coursePerformanceMap).map(([course, data]) => ({
            course_name: course,
            avg_sgpa: data.total_credits > 0 ? Math.round((data.total_gp / data.total_credits) * 100) / 100 : 0,
            credits: data.credits,
            student_count: data.student_count,
            avg_mid_term: Math.round((data.total_mid_term / data.count) * 10) / 10,
            avg_attendance: Math.round(data.total_attendance / data.count),
            avg_assignments: Math.round((data.total_assignments / data.count) * 10) / 10,
          })).sort((a, b) => b.avg_sgpa - a.avg_sgpa);

          setCoursePerformance(coursePerf);
        }
      } catch (error) {
        console.error('Error fetching analytics data:', error);
        toast.error('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };

    if (profile?.user_id) {
      fetchAnalyticsData();
    }
  }, [profile?.user_id]);

  const getDifficultyColor = (difficulty: string) => {
    if (difficulty === 'Easy') return 'hsl(var(--secondary))';
    if (difficulty === 'Medium') return 'hsl(var(--primary))';
    return 'hsl(var(--destructive))';
  };

  const getDifficultyBadgeVariant = (difficulty: string): "default" | "secondary" | "destructive" => {
    if (difficulty === 'Easy') return 'secondary';
    if (difficulty === 'Medium') return 'default';
    return 'destructive';
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="h-10 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-32 bg-muted animate-pulse rounded" />
          <div className="h-32 bg-muted animate-pulse rounded" />
          <div className="h-32 bg-muted animate-pulse rounded" />
        </div>
        <div className="h-96 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold mb-2">Faculty Analytics & Insights</h1>
        <p className="text-muted-foreground">
          Course difficulty trends, student performance patterns, and SGPA analysis
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="h-5 w-5 text-primary" />
              Total Courses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {coursePerformance.length}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Across all semesters
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Award className="h-5 w-5 text-secondary" />
              Average SGPA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-secondary">
              {coursePerformance.length > 0 
                ? (coursePerformance.reduce((sum, c) => sum + c.avg_sgpa, 0) / coursePerformance.length).toFixed(2)
                : 'N/A'
              }
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Overall performance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="h-5 w-5 text-accent" />
              Total Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent">
              {coursePerformance.reduce((sum, c) => sum + c.student_count, 0)}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Enrolled students
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Course Difficulty Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Course Difficulty Trends
          </CardTitle>
          <CardDescription>
            Based on average mid-term marks across all students
          </CardDescription>
        </CardHeader>
        <CardContent>
          {courseDifficulty.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={courseDifficulty}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="course_name" 
                  angle={-45} 
                  textAnchor="end" 
                  height={120}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <YAxis 
                  label={{ value: 'Avg Mid-Term Marks (out of 20)', angle: -90, position: 'insideLeft' }}
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="avg_mid_term" name="Avg Mid-Term">
                  {courseDifficulty.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getDifficultyColor(entry.difficulty)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[400px] flex items-center justify-center text-muted-foreground">
              No course difficulty data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Semester Performance Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-secondary" />
            Semester-wise Performance Patterns
          </CardTitle>
          <CardDescription>
            Average SGPA trends across different semesters
          </CardDescription>
        </CardHeader>
        <CardContent>
          {semesterPerformance.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={semesterPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="semester" 
                  label={{ value: 'Semester', position: 'insideBottom', offset: -5 }}
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  domain={[0, 10]}
                  label={{ value: 'Average SGPA', angle: -90, position: 'insideLeft' }}
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="avg_sgpa" 
                  name="Average SGPA"
                  stroke="hsl(var(--secondary))" 
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--secondary))', r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[350px] flex items-center justify-center text-muted-foreground">
              No semester performance data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Course-wise Average SGPA Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Average SGPA by Course
          </CardTitle>
          <CardDescription>
            Detailed performance metrics for each course
          </CardDescription>
        </CardHeader>
        <CardContent>
          {coursePerformance.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course Name</TableHead>
                    <TableHead className="text-center">Credits</TableHead>
                    <TableHead className="text-center">Students</TableHead>
                    <TableHead className="text-center">Avg SGPA</TableHead>
                    <TableHead className="text-center">Avg Mid-Term</TableHead>
                    <TableHead className="text-center">Avg Attendance</TableHead>
                    <TableHead className="text-center">Avg Assignments</TableHead>
                    <TableHead className="text-center">Difficulty</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coursePerformance.map((course, index) => {
                    const difficulty = course.avg_mid_term >= 15 ? 'Easy' : course.avg_mid_term < 10 ? 'Hard' : 'Medium';
                    return (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{course.course_name}</TableCell>
                        <TableCell className="text-center">{course.credits}</TableCell>
                        <TableCell className="text-center">{course.student_count}</TableCell>
                        <TableCell className="text-center">
                          <span className="font-semibold text-secondary">
                            {course.avg_sgpa.toFixed(2)}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">{course.avg_mid_term}/20</TableCell>
                        <TableCell className="text-center">{course.avg_attendance}%</TableCell>
                        <TableCell className="text-center">{course.avg_assignments}/10</TableCell>
                        <TableCell className="text-center">
                          <Badge variant={getDifficultyBadgeVariant(difficulty)}>
                            {difficulty}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No course performance data available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, TrendingUp, AlertTriangle, BarChart3, Activity } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface DashboardStats {
  totalStudents: number;
  uniqueCourses: number;
  atRiskStudents: number;
  avgAttendance: number;
  gradeDistribution: { grade: string; count: number }[];
  coursePerformance: { course: string; avgMarks: number }[];
}

export const FacultyOverview = () => {
  const { profile } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    uniqueCourses: 0,
    atRiskStudents: 0,
    avgAttendance: 0,
    gradeDistribution: [],
    coursePerformance: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!profile?.user_id) return;
      
      try {
        const { data: courses, error } = await supabase
          .from('student_courses')
          .select('*')
          .eq('faculty_id', profile.user_id);

        if (error) throw error;

        if (courses && courses.length > 0) {
          // Calculate stats
          const uniqueStudents = new Set(courses.map(c => c.student_id)).size;
          const uniqueCourses = new Set(courses.map(c => c.course_id)).size;
          
          // At-risk: P, F grades
          const atRisk = courses.filter(c => 
            c.predicted_grade?.match(/^[PF]\s/i)
          ).length;
          
          // Average attendance
          const avgAtt = courses.reduce((sum, c) => sum + Number(c.attendance), 0) / courses.length;
          
          // Grade distribution
          const gradeMap = new Map<string, number>();
          courses.forEach(c => {
            const grade = c.predicted_grade?.match(/^([A-Z+]+)/)?.[1] || 'N/A';
            gradeMap.set(grade, (gradeMap.get(grade) || 0) + 1);
          });
          const gradeDist = Array.from(gradeMap.entries()).map(([grade, count]) => ({
            grade,
            count
          }));
          
          // Course performance
          const courseMap = new Map<string, number[]>();
          courses.forEach(c => {
            if (!courseMap.has(c.course_name)) {
              courseMap.set(c.course_name, []);
            }
            courseMap.get(c.course_name)!.push(Number(c.mid_term_marks));
          });
          const coursePerf = Array.from(courseMap.entries())
            .map(([course, marks]) => ({
              course: course.substring(0, 15) + (course.length > 15 ? '...' : ''),
              avgMarks: Math.round(marks.reduce((a, b) => a + b, 0) / marks.length)
            }))
            .slice(0, 5);
          
          setStats({
            totalStudents: uniqueStudents,
            uniqueCourses,
            atRiskStudents: atRisk,
            avgAttendance: Math.round(avgAtt),
            gradeDistribution: gradeDist,
            coursePerformance: coursePerf
          });
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [profile]);

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))', 'hsl(var(--chart-1))', 'hsl(var(--chart-2))'];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Header */}
      <div className="bg-slate-300 p-8 rounded-xl shadow-lg">
        <h1 className="text-4xl font-bold text-blue-800 mb-2">
          Welcome, Prof. {profile?.display_name}
        </h1>
        <p className="text-red-700 text-lg">
          Your complete teaching dashboard at a glance
        </p>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-all hover:scale-105 border-l-4 border-l-primary cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{loading ? '...' : stats.totalStudents}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Across all your courses
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all hover:scale-105 border-l-4 border-l-secondary cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
            <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-secondary" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{loading ? '...' : stats.uniqueCourses}</p>
            <p className="text-xs text-muted-foreground mt-1">This semester</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all hover:scale-105 border-l-4 border-l-destructive cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">At-Risk Students</CardTitle>
            <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{loading ? '...' : stats.atRiskStudents}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Need immediate attention
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all hover:scale-105 border-l-4 border-l-accent cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Attendance</CardTitle>
            <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
              <Activity className="h-5 w-5 text-accent" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{loading ? '...' : `${stats.avgAttendance}%`}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Overall attendance rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Course Performance Chart */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Course Performance Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                Loading data...
              </div>
            ) : stats.coursePerformance.length > 0 ? (
              <ChartContainer
                config={{
                  avgMarks: {
                    label: "Average Marks",
                    color: "hsl(var(--primary))",
                  },
                }}
                className="h-64"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.coursePerformance}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="course" className="text-xs" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="avgMarks" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Grade Distribution Chart */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-secondary" />
              Grade Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                Loading data...
              </div>
            ) : stats.gradeDistribution.length > 0 ? (
              <ChartContainer
                config={{
                  count: {
                    label: "Students",
                    color: "hsl(var(--secondary))",
                  },
                }}
                className="h-64"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.gradeDistribution}
                      dataKey="count"
                      nameKey="grade"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={(entry) => `${entry.grade}: ${entry.count}`}
                    >
                      {stats.gradeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, TrendingUp, AlertCircle, Target, BarChart3, Activity } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, ResponsiveContainer } from "recharts";

interface StudentStats {
  totalCourses: number;
  predictedSGPA: number;
  avgAttendance: number;
  atRiskCourses: number;
  courseProgress: { course: string; marks: number }[];
  performanceTrend: { metric: string; value: number }[];
}

export const StudentOverview = () => {
  const { profile } = useAuth();
  const [stats, setStats] = useState<StudentStats>({
    totalCourses: 0,
    predictedSGPA: 0,
    avgAttendance: 0,
    atRiskCourses: 0,
    courseProgress: [],
    performanceTrend: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!profile?.email) return;
      
      try {
        const studentId = profile.email.split('@')[0];
        const { data: courses, error } = await supabase
          .from('student_courses')
          .select('*')
          .eq('student_id', studentId);

        if (error) throw error;

        if (courses && courses.length > 0) {
          // Calculate SGPA
          let totalCreditsGP = 0;
          let totalCredits = 0;
          courses.forEach(c => {
            const gpMatch = c.predicted_grade?.match(/GP:\s*(\d+)/);
            if (gpMatch) {
              const gp = parseInt(gpMatch[1]);
              totalCreditsGP += c.credits * gp;
              totalCredits += c.credits;
            }
          });
          const sgpa = totalCredits > 0 ? totalCreditsGP / totalCredits : 0;
          
          // Average attendance
          const avgAtt = courses.reduce((sum, c) => sum + Number(c.attendance), 0) / courses.length;
          
          // At-risk courses (P, F)
          const atRisk = courses.filter(c => 
            c.predicted_grade?.match(/^[PF]\s/i)
          ).length;
          
          // Course progress (mid-term marks)
          const courseProgress = courses.map(c => ({
            course: c.course_name.substring(0, 12) + (c.course_name.length > 12 ? '...' : ''),
            marks: Number(c.mid_term_marks)
          })).slice(0, 6);
          
          // Performance trend
          const performanceTrend = [
            { metric: 'Attendance', value: Math.round(avgAtt) },
            { metric: 'Assignments', value: Math.round(courses.reduce((sum, c) => sum + Number(c.assignments), 0) / courses.length) },
            { metric: 'Mid-Term', value: Math.round(courses.reduce((sum, c) => sum + Number(c.mid_term_marks), 0) / courses.length) }
          ];
          
          setStats({
            totalCourses: courses.length,
            predictedSGPA: parseFloat(sgpa.toFixed(2)),
            avgAttendance: Math.round(avgAtt),
            atRiskCourses: atRisk,
            courseProgress,
            performanceTrend
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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Header */}
      <div className="bg-slate-300 p-8 rounded-xl shadow-lg">
        <h1 className="text-4xl font-bold text-blue-800 mb-2">
          Welcome back, {profile?.display_name}! 🎓
        </h1>
        <p className="text-red-700 text-lg">
          Your personalized academic dashboard
        </p>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-all hover:scale-105 border-l-4 border-l-primary cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Courses</CardTitle>
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{loading ? '...' : stats.totalCourses}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Active this semester
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all hover:scale-105 border-l-4 border-l-secondary cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Predicted SGPA</CardTitle>
            <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center">
              <Target className="h-5 w-5 text-secondary" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{loading ? '...' : stats.predictedSGPA}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Current semester
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all hover:scale-105 border-l-4 border-l-accent cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance</CardTitle>
            <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
              <Activity className="h-5 w-5 text-accent" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{loading ? '...' : `${stats.avgAttendance}%`}</p>
            <p className="text-xs text-muted-foreground mt-1">Average attendance</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all hover:scale-105 border-l-4 border-l-destructive cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">At-Risk Courses</CardTitle>
            <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-destructive" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{loading ? '...' : stats.atRiskCourses}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Need improvement
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Course Progress Chart */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Course Performance (Mid-Term)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                Loading data...
              </div>
            ) : stats.courseProgress.length > 0 ? (
              <ChartContainer
                config={{
                  marks: {
                    label: "Marks",
                    color: "hsl(var(--primary))",
                  },
                }}
                className="h-64"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.courseProgress}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="course" className="text-xs" />
                    <YAxis domain={[0, 100]} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="marks" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
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

        {/* Performance Trend Chart */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-secondary" />
              Overall Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                Loading data...
              </div>
            ) : stats.performanceTrend.length > 0 ? (
              <ChartContainer
                config={{
                  value: {
                    label: "Score",
                    color: "hsl(var(--secondary))",
                  },
                }}
                className="h-64"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.performanceTrend}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="metric" />
                    <YAxis domain={[0, 100]} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="hsl(var(--secondary))" 
                      strokeWidth={3}
                      dot={{ fill: "hsl(var(--secondary))", r: 6 }}
                    />
                  </LineChart>
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

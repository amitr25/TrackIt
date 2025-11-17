import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Mail, User, BookOpen, TrendingUp, Award } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface StudentDetailModalProps {
  studentId: string;
  studentName: string;
  isOpen: boolean;
  onClose: () => void;
}

interface CourseData {
  id: string;
  course_name: string;
  course_id: string;
  semester: number;
  credits: number;
  attendance: number;
  assignments: number;
  mid_term_marks: number;
  predicted_end_term_marks: number | null;
  predicted_grade: string | null;
  quiz_score: number | null;
}

export const StudentDetailModal = ({
  studentId,
  studentName,
  isOpen,
  onClose,
}: StudentDetailModalProps) => {
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentEmail, setStudentEmail] = useState("");

  useEffect(() => {
    if (isOpen && studentId) {
      fetchStudentData();
    }
  }, [isOpen, studentId]);

  const fetchStudentData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("student_courses")
        .select("*")
        .eq("student_id", studentId)
        .order("semester", { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        setCourses(data);
        setStudentEmail(data[0].student_email);
      }
    } catch (error) {
      console.error("Error fetching student data:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateOverallStats = () => {
    if (courses.length === 0) return null;

    const avgAttendance =
      courses.reduce((sum, course) => sum + course.attendance, 0) /
      courses.length;
    const avgAssignments =
      courses.reduce((sum, course) => sum + course.assignments, 0) /
      courses.length;
    const avgMidTerm =
      courses.reduce((sum, course) => sum + course.mid_term_marks, 0) /
      courses.length;
    const totalCredits = courses.reduce(
      (sum, course) => sum + course.credits,
      0
    );

    return {
      avgAttendance: avgAttendance.toFixed(1),
      avgAssignments: avgAssignments.toFixed(1),
      avgMidTerm: avgMidTerm.toFixed(1),
      totalCredits,
      totalCourses: courses.length,
    };
  };

  const getPerformanceData = () => {
    return courses.map((course) => ({
      name: course.course_id,
      attendance: course.attendance,
      assignments: course.assignments,
      midTerm: course.mid_term_marks,
      predicted: course.predicted_end_term_marks || 0,
    }));
  };

  const getRiskBadge = (course: CourseData) => {
    const riskScore =
      (course.attendance < 75 ? 1 : 0) +
      (course.assignments < 60 ? 1 : 0) +
      (course.mid_term_marks < 50 ? 1 : 0);

    if (riskScore >= 2)
      return <Badge variant="destructive">High Risk</Badge>;
    if (riskScore === 1) return <Badge className="bg-accent">Medium Risk</Badge>;
    return <Badge className="bg-secondary">On Track</Badge>;
  };

  const stats = calculateOverallStats();
  const performanceData = getPerformanceData();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Student Profile</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Student Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Student Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-semibold">{studentName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Student ID</p>
                  <p className="font-semibold">{studentId}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    Email
                  </p>
                  <p className="font-semibold text-sm truncate">{studentEmail}</p>
                </div>
              </CardContent>
            </Card>

            {/* Overall Statistics */}
            {stats && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Overall Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">
                        {stats.totalCourses}
                      </p>
                      <p className="text-sm text-muted-foreground">Courses</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">
                        {stats.totalCredits}
                      </p>
                      <p className="text-sm text-muted-foreground">Credits</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-secondary">
                        {stats.avgAttendance}%
                      </p>
                      <p className="text-sm text-muted-foreground">Avg Attendance</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-secondary">
                        {stats.avgAssignments}%
                      </p>
                      <p className="text-sm text-muted-foreground">Avg Assignments</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-secondary">
                        {stats.avgMidTerm}
                      </p>
                      <p className="text-sm text-muted-foreground">Avg Mid-Term</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Performance Trends Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Performance Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="attendance"
                      stroke="hsl(var(--primary))"
                      name="Attendance %"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="assignments"
                      stroke="hsl(var(--secondary))"
                      name="Assignments %"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="midTerm"
                      stroke="hsl(var(--accent))"
                      name="Mid-Term Marks"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Separator />

            {/* Course Details Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Course Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course</TableHead>
                      <TableHead>Semester</TableHead>
                      <TableHead>Credits</TableHead>
                      <TableHead>Attendance</TableHead>
                      <TableHead>Assignments</TableHead>
                      <TableHead>Mid-Term</TableHead>
                      <TableHead>Predicted Grade</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {courses.map((course) => (
                      <TableRow key={course.id}>
                        <TableCell className="font-medium">
                          <div>
                            <p className="font-semibold">{course.course_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {course.course_id}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{course.semester}</TableCell>
                        <TableCell>{course.credits}</TableCell>
                        <TableCell>
                          <span
                            className={
                              course.attendance < 75
                                ? "text-destructive font-semibold"
                                : ""
                            }
                          >
                            {course.attendance}%
                          </span>
                        </TableCell>
                        <TableCell>
                          <span
                            className={
                              course.assignments < 60
                                ? "text-destructive font-semibold"
                                : ""
                            }
                          >
                            {course.assignments}%
                          </span>
                        </TableCell>
                        <TableCell>
                          <span
                            className={
                              course.mid_term_marks < 50
                                ? "text-destructive font-semibold"
                                : ""
                            }
                          >
                            {course.mid_term_marks}
                          </span>
                        </TableCell>
                        <TableCell>
                          {course.predicted_grade || "N/A"}
                        </TableCell>
                        <TableCell>{getRiskBadge(course)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

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
import { Users, Search, Pencil, Trash2, TrendingUp, Award, BookCheck, BarChart3, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartContainer, ChartConfig } from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StudentDetailModal } from "./StudentDetailModal";

interface StudentRecord {
  id: string;
  student_id: string;
  student_name: string;
  student_email: string;
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

export const FacultyStudentRecordsTable = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [records, setRecords] = useState<StudentRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<StudentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingRecord, setEditingRecord] = useState<StudentRecord | null>(null);
  const [deletingRecordId, setDeletingRecordId] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [isPerformanceDialogOpen, setIsPerformanceDialogOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [selectedStudent, setSelectedStudent] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Calculate pagination
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRecords = filteredRecords.slice(startIndex, endIndex);

  const handleStudentClick = (studentId: string, studentName: string) => {
    setSelectedStudent({ id: studentId, name: studentName });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedStudent(null);
  };

  useEffect(() => {
    if (user) {
      fetchRecords();
    }
  }, [user]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = records.filter(record => 
        record.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.student_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.course_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredRecords(filtered);
      setCurrentPage(1); // Reset to first page when filtering
    } else {
      setFilteredRecords(records);
    }
  }, [searchTerm, records]);

  const fetchRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('student_courses')
        .select('*')
        .eq('faculty_id', user?.id)
        .order('student_id', { ascending: true });

      if (error) throw error;

      setRecords(data || []);
      setFilteredRecords(data || []);
    } catch (error) {
      console.error('Error fetching student records:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record: StudentRecord) => {
    setEditingRecord(record);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (recordId: string) => {
    setDeletingRecordId(recordId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingRecordId) return;

    try {
      const { error } = await supabase
        .from('student_courses')
        .delete()
        .eq('id', deletingRecordId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Record deleted successfully",
      });

      fetchRecords();
    } catch (error) {
      console.error('Error deleting record:', error);
      toast({
        title: "Error",
        description: "Failed to delete record",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setDeletingRecordId(null);
    }
  };

  const handleUpdateRecord = async () => {
    if (!editingRecord) return;

    try {
      const { error } = await supabase
        .from('student_courses')
        .update({
          student_name: editingRecord.student_name,
          student_email: editingRecord.student_email,
          course_name: editingRecord.course_name,
          course_id: editingRecord.course_id,
          credits: editingRecord.credits,
          mid_term_marks: editingRecord.mid_term_marks,
          attendance: editingRecord.attendance,
          assignments: editingRecord.assignments,
          predicted_end_term_marks: editingRecord.predicted_end_term_marks,
          predicted_grade: editingRecord.predicted_grade,
          quiz_score: editingRecord.quiz_score,
        })
        .eq('id', editingRecord.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Record updated successfully",
      });

      fetchRecords();
      setIsEditDialogOpen(false);
      setEditingRecord(null);
    } catch (error) {
      console.error('Error updating record:', error);
      toast({
        title: "Error",
        description: "Failed to update record",
        variant: "destructive",
      });
    }
  };

  const extractGradeFromPrediction = (predictedGrade: string | null): string => {
    if (!predictedGrade) return '-';
    const gradeMatch = predictedGrade.match(/^([A-Z+]+)/);
    return gradeMatch ? gradeMatch[1] : '-';
  };

  // Get all courses for a specific student
  const getStudentCourses = (studentId: string) => {
    return records.filter(r => r.student_id === studentId);
  };

  // Calculate average metrics for a student across all courses
  const getStudentMetrics = (studentId: string) => {
    const studentCourses = getStudentCourses(studentId);
    if (studentCourses.length === 0) return null;

    const totalAttendance = studentCourses.reduce((sum, c) => sum + c.attendance, 0);
    const totalQuiz = studentCourses.reduce((sum, c) => sum + c.quiz_score, 0);
    const totalMidTerm = studentCourses.reduce((sum, c) => sum + c.mid_term_marks, 0);
    const totalAssignments = studentCourses.reduce((sum, c) => sum + c.assignments, 0);

    return {
      avgAttendance: Math.round(totalAttendance / studentCourses.length),
      avgQuiz: Math.round(totalQuiz / studentCourses.length),
      avgMidTerm: Math.round(totalMidTerm / studentCourses.length),
      avgAssignments: Math.round(totalAssignments / studentCourses.length),
      totalCourses: studentCourses.length,
      courses: studentCourses,
    };
  };

  const StudentPerformanceCard = ({ studentId, studentName }: { studentId: string, studentName: string }) => {
    const metrics = getStudentMetrics(studentId);
    if (!metrics) return null;

    const performanceData = [
      { name: 'Attendance', value: metrics.avgAttendance, fill: 'hsl(var(--secondary))' },
      { name: 'Quiz', value: metrics.avgQuiz, fill: 'hsl(var(--accent))' },
      { name: 'Mid Term', value: metrics.avgMidTerm, fill: 'hsl(var(--primary))' },
      { name: 'Assignments', value: metrics.avgAssignments, fill: 'hsl(var(--analytics-blue))' },
    ];

    return (
      <div className="w-80 space-y-4">
        <div className="space-y-1">
          <h4 className="font-semibold text-base text-foreground">{studentName}</h4>
          <p className="text-sm text-muted-foreground">ID: {studentId}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
            <BookCheck className="h-3 w-3" />
            <span>Enrolled in {metrics.totalCourses} course{metrics.totalCourses !== 1 ? 's' : ''}</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            <h5 className="text-sm font-semibold text-foreground">Overall Performance</h5>
          </div>
          
          <div className="h-[140px]">
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
                <TrendingUp className="h-3.5 w-3.5 text-primary" />
                <p className="text-xs font-medium text-muted-foreground">Avg Attendance</p>
              </div>
              <p className="text-xl font-bold text-primary">{metrics.avgAttendance}%</p>
            </div>
            <div className="space-y-1 p-2 rounded-md bg-accent/5">
              <div className="flex items-center gap-1.5">
                <Award className="h-3.5 w-3.5 text-accent" />
                <p className="text-xs font-medium text-muted-foreground">Avg Quiz</p>
              </div>
              <p className="text-xl font-bold text-accent">{metrics.avgQuiz}%</p>
            </div>
          </div>

          <div className="pt-2 border-t border-border">
            <p className="text-xs font-medium text-muted-foreground mb-2">Courses:</p>
            <div className="space-y-1 max-h-24 overflow-y-auto">
              {metrics.courses.map((course, idx) => (
                <div key={idx} className="text-xs p-1.5 rounded bg-muted/50 flex items-center justify-between">
                  <span className="font-medium truncate flex-1">{course.course_name}</span>
                  {course.predicted_grade && (
                    <span className="text-xs font-medium text-foreground">
                      {extractGradeFromPrediction(course.predicted_grade)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return <Skeleton className="h-96 w-full" />;
  }

  return (
    <>
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Student Records ({filteredRecords.length})
              </CardTitle>
              <div className="flex items-center gap-2 mt-4">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by student name, ID, or course..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
            </div>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="ml-4">
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
          </div>
        </CardHeader>
        <CollapsibleContent>
          <CardContent>
        {filteredRecords.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>
              {searchTerm 
                ? "No records found matching your search."
                : "No student data uploaded yet. Upload a CSV/Excel file to get started."}
            </p>
          </div>
        ) : (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Course ID</TableHead>
                  <TableHead className="text-center">Credits</TableHead>
                  <TableHead className="text-center">Semester</TableHead>
                  <TableHead className="text-center">Mid Term</TableHead>
                  <TableHead className="text-center">Attendance</TableHead>
                  <TableHead className="text-center">Assignments</TableHead>
                  <TableHead className="text-center">Predicted End Term</TableHead>
                  <TableHead className="text-center">Grade</TableHead>
                  <TableHead className="text-center">Quiz Score</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.student_id}</TableCell>
                    <TableCell>
                      <button
                        onClick={() =>
                          handleStudentClick(
                            record.student_id,
                            record.student_name
                          )
                        }
                        className="font-normal text-primary hover:underline cursor-pointer text-left"
                      >
                        {record.student_name}
                      </button>
                    </TableCell>
                    <TableCell>{record.student_email}</TableCell>
                    <TableCell>{record.course_name}</TableCell>
                    <TableCell>{record.course_id}</TableCell>
                    <TableCell className="text-center">{record.credits}</TableCell>
                    <TableCell className="text-center">{record.semester}</TableCell>
                    <TableCell className="text-center">{record.mid_term_marks}</TableCell>
                    <TableCell className="text-center">{record.attendance}%</TableCell>
                    <TableCell className="text-center">{record.assignments}</TableCell>
                    <TableCell className="text-center">
                      {record.predicted_end_term_marks || '-'}
                    </TableCell>
                    <TableCell className="text-center">
                      {record.predicted_grade ? (
                        <span className="text-sm font-medium text-foreground">
                          {extractGradeFromPrediction(record.predicted_grade)}
                        </span>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-sm font-medium text-foreground">
                        {record.quiz_score}%
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(record)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(record.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        
        {/* Pagination Controls */}
        {filteredRecords.length > 0 && (
          <div className="flex items-center justify-between mt-4 px-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredRecords.length)} of {filteredRecords.length} records
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Rows per page:</span>
                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={(value) => {
                    setItemsPerPage(Number(value));
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="15">15</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>

      {/* Student Performance Dialog */}
      <Dialog open={isPerformanceDialogOpen} onOpenChange={setIsPerformanceDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Student Performance</DialogTitle>
          </DialogHeader>
          {selectedStudentId && (
            <StudentPerformanceCard 
              studentId={selectedStudentId} 
              studentName={records.find(r => r.student_id === selectedStudentId)?.student_name || ''}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Student Record</DialogTitle>
            <DialogDescription>
              Update the student course information below.
            </DialogDescription>
          </DialogHeader>
          {editingRecord && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="student_name">Student Name</Label>
                  <Input
                    id="student_name"
                    value={editingRecord.student_name}
                    onChange={(e) => setEditingRecord({ ...editingRecord, student_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="student_email">Student Email</Label>
                  <Input
                    id="student_email"
                    value={editingRecord.student_email}
                    onChange={(e) => setEditingRecord({ ...editingRecord, student_email: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="course_name">Course Name</Label>
                  <Input
                    id="course_name"
                    value={editingRecord.course_name}
                    onChange={(e) => setEditingRecord({ ...editingRecord, course_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="course_id">Course ID</Label>
                  <Input
                    id="course_id"
                    value={editingRecord.course_id}
                    onChange={(e) => setEditingRecord({ ...editingRecord, course_id: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="credits">Credits</Label>
                  <Input
                    id="credits"
                    type="number"
                    value={editingRecord.credits}
                    onChange={(e) => setEditingRecord({ ...editingRecord, credits: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="semester">Semester</Label>
                  <Input
                    id="semester"
                    type="number"
                    min="1"
                    max="8"
                    value={editingRecord.semester}
                    onChange={(e) => setEditingRecord({ ...editingRecord, semester: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mid_term_marks">Mid Term Marks (out of 20)</Label>
                  <Input
                    id="mid_term_marks"
                    type="number"
                    value={editingRecord.mid_term_marks}
                    onChange={(e) => setEditingRecord({ ...editingRecord, mid_term_marks: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="attendance">Attendance (%)</Label>
                  <Input
                    id="attendance"
                    type="number"
                    value={editingRecord.attendance}
                    onChange={(e) => setEditingRecord({ ...editingRecord, attendance: parseFloat(e.target.value) })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="assignments">Assignments (out of 10)</Label>
                  <Input
                    id="assignments"
                    type="number"
                    value={editingRecord.assignments}
                    onChange={(e) => setEditingRecord({ ...editingRecord, assignments: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quiz_score">Quiz Score (%)</Label>
                  <Input
                    id="quiz_score"
                    type="number"
                    value={editingRecord.quiz_score}
                    onChange={(e) => setEditingRecord({ ...editingRecord, quiz_score: parseFloat(e.target.value) })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="predicted_end_term_marks">Predicted End Term Marks</Label>
                  <Input
                    id="predicted_end_term_marks"
                    type="number"
                    value={editingRecord.predicted_end_term_marks || ''}
                    onChange={(e) => setEditingRecord({ ...editingRecord, predicted_end_term_marks: e.target.value ? parseFloat(e.target.value) : null })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="predicted_grade">Predicted Grade</Label>
                  <Input
                    id="predicted_grade"
                    value={editingRecord.predicted_grade || ''}
                    onChange={(e) => setEditingRecord({ ...editingRecord, predicted_grade: e.target.value || null })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="quiz_score">Quiz Score (%)</Label>
                <Input
                  id="quiz_score"
                  type="number"
                  value={editingRecord.quiz_score}
                  onChange={(e) => setEditingRecord({ ...editingRecord, quiz_score: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateRecord}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the student record
              from the database and remove it from the student's dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingRecordId(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        </CollapsibleContent>
      </Card>
    </Collapsible>

    {selectedStudent && (
      <StudentDetailModal
        studentId={selectedStudent.id}
        studentName={selectedStudent.name}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    )}
    </>
  );
};

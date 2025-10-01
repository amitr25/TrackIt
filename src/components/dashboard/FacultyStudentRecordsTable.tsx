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
import { Users, Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";

interface StudentRecord {
  id: string;
  student_id: string;
  student_name: string;
  student_email: string;
  course_name: string;
  course_id: string;
  credits: number;
  mid_term_marks: number;
  attendance: number;
  assignments: number;
  predicted_end_term_marks: number | null;
  predicted_grade: string | null;
}

export const FacultyStudentRecordsTable = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState<StudentRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<StudentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

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

  const getGradeBadgeVariant = (grade: string | null) => {
    if (!grade) return 'secondary';
    if (['A+', 'A'].includes(grade)) return 'default';
    if (['B+', 'B'].includes(grade)) return 'secondary';
    return 'destructive';
  };

  if (loading) {
    return <Skeleton className="h-96 w-full" />;
  }

  return (
    <Card>
      <CardHeader>
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
      </CardHeader>
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
                  <TableHead className="text-center">Mid Term</TableHead>
                  <TableHead className="text-center">Attendance</TableHead>
                  <TableHead className="text-center">Assignments</TableHead>
                  <TableHead className="text-center">Predicted End Term</TableHead>
                  <TableHead className="text-center">Grade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.student_id}</TableCell>
                    <TableCell>{record.student_name}</TableCell>
                    <TableCell>{record.student_email}</TableCell>
                    <TableCell>{record.course_name}</TableCell>
                    <TableCell>{record.course_id}</TableCell>
                    <TableCell className="text-center">{record.credits}</TableCell>
                    <TableCell className="text-center">{record.mid_term_marks}</TableCell>
                    <TableCell className="text-center">{record.attendance}%</TableCell>
                    <TableCell className="text-center">{record.assignments}</TableCell>
                    <TableCell className="text-center">
                      {record.predicted_end_term_marks || '-'}
                    </TableCell>
                    <TableCell className="text-center">
                      {record.predicted_grade ? (
                        <Badge variant={getGradeBadgeVariant(record.predicted_grade)}>
                          {record.predicted_grade}
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
  );
};

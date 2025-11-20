import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  message?: string;
}

export const StudentDataUpload = () => {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const validFiles = Array.from(files).filter(file => {
      const isValidType = file.type.includes('csv') || 
                         file.type.includes('excel') || 
                         file.type.includes('spreadsheet') ||
                         file.name.endsWith('.csv') ||
                         file.name.endsWith('.xlsx') ||
                         file.name.endsWith('.xls');
      
      if (!isValidType) {
        toast({
          title: "Invalid File Type",
          description: `${file.name} is not a supported format. Please upload CSV or Excel files.`,
          variant: "destructive",
        });
        return false;
      }

      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: "File Too Large",
          description: `${file.name} exceeds the 10MB limit.`,
          variant: "destructive",
        });
        return false;
      }

      return true;
    });

    const newUploadFiles: UploadFile[] = validFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      progress: 0,
      status: 'uploading'
    }));

    setUploadFiles(prev => [...prev, ...newUploadFiles]);

    // Process each file
    newUploadFiles.forEach(uploadFile => {
      processCSVFile(uploadFile.id, uploadFile.file);
    });
  };

  const processCSVFile = async (fileId: string, file: File) => {
    try {
      const text = await file.text();
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

      // Validate required columns
      const requiredColumns = ['student_id', 'name', 'email', 'course_name', 'course_id', 'credits', 'semester', 'mid_term_marks', 'attendance', 'assignments'];
      const missingColumns = requiredColumns.filter(col => !headers.includes(col));

      if (missingColumns.length > 0) {
        throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
      }

      const records = [];
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const values = line.split(',').map(v => v.trim());
        const record: any = {};
        
        headers.forEach((header, index) => {
          record[header] = values[index];
        });

          // Validate and prepare data
        const midTermMarks = parseFloat(record.mid_term_marks);
        const assignments = parseFloat(record.assignments);
        const attendance = parseFloat(record.attendance);
        const credits = parseInt(record.credits);
        const semester = parseInt(record.semester);

        // Validate ranges
        if (midTermMarks < 0 || midTermMarks > 20) {
          throw new Error(`Invalid mid_term_marks for ${record.name}: Must be between 0-20`);
        }
        if (assignments < 0 || assignments > 10) {
          throw new Error(`Invalid assignments for ${record.name}: Must be between 0-10`);
        }
        if (attendance < 0 || attendance > 100) {
          throw new Error(`Invalid attendance for ${record.name}: Must be between 0-100`);
        }
        if (credits < 1 || credits > 6) {
          throw new Error(`Invalid credits for ${record.course_name}: Must be between 1-6`);
        }
        if (semester < 1 || semester > 8) {
          throw new Error(`Invalid semester for ${record.name}: Must be between 1-8`);
        }

        records.push({
          student_id: record.student_id,
          student_name: record.name,
          student_email: record.email,
          course_name: record.course_name,
          course_id: record.course_id,
          credits: credits,
          semester: semester,
          mid_term_marks: midTermMarks,
          attendance: attendance,
          assignments: assignments,
          faculty_id: user?.id,
          predicted_end_term_marks: null,
          predicted_grade: null
        });

        // Update progress
        const progress = ((i + 1) / lines.length) * 90;
        setUploadFiles(prev => 
          prev.map(f => f.id === fileId ? { ...f, progress } : f)
        );
      }

      // Upsert into database (insert or update if exists)
      const { error } = await supabase
        .from('student_courses')
        .upsert(records, {
          onConflict: 'student_id,course_id',
          ignoreDuplicates: false
        });

      if (error) throw error;

      // Success
      setUploadFiles(prev =>
        prev.map(f => f.id === fileId ? {
          ...f,
          progress: 100,
          status: 'success',
          message: `Successfully uploaded ${records.length} student records`
        } : f)
      );

      toast({
        title: "Upload Successful",
        description: `${records.length} student records have been added.`,
      });

    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadFiles(prev =>
        prev.map(f => f.id === fileId ? {
          ...f,
          progress: 100,
          status: 'error',
          message: error.message || 'Failed to process file'
        } : f)
      );

      toast({
        title: "Upload Failed",
        description: error.message || 'Failed to process the file. Please check the format.',
        variant: "destructive",
      });
    }
  };

  const removeFile = (fileId: string) => {
    setUploadFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          Student Data Upload
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Upload CSV or Excel files containing student information, grades, or attendance data.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload Area */}
        <div
          className={`
            border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
            ${isDragOver 
              ? 'border-primary bg-primary/5' 
              : 'border-muted-foreground/25 hover:border-muted-foreground/50'
            }
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Upload Student Data</h3>
          <p className="text-muted-foreground mb-4">
            Drag and drop your CSV or Excel files here, or click to browse
          </p>
          <Button variant="outline">
            Select Files
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            Supported formats: .csv, .xlsx, .xls (Max size: 10MB)
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".csv,.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />
        </div>

        {/* Upload Progress */}
        {uploadFiles.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-medium">Upload Progress</h4>
            {uploadFiles.map((uploadFile) => (
              <div key={uploadFile.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{uploadFile.file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(uploadFile.file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      uploadFile.status === 'success' ? 'default' :
                      uploadFile.status === 'error' ? 'destructive' :
                      'secondary'
                    }>
                      {uploadFile.status === 'success' && <CheckCircle className="h-3 w-3 mr-1" />}
                      {uploadFile.status === 'error' && <AlertCircle className="h-3 w-3 mr-1" />}
                      {uploadFile.status === 'success' ? 'Success' :
                       uploadFile.status === 'error' ? 'Error' :
                       'Uploading'}
                    </Badge>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => removeFile(uploadFile.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {uploadFile.status === 'uploading' && (
                  <Progress value={uploadFile.progress} className="h-2" />
                )}
                
                {uploadFile.message && (
                  <p className={`text-xs ${
                    uploadFile.status === 'success' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {uploadFile.message}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Guidelines */}
        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="font-medium mb-2">File Format Guidelines</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• CSV files should have headers in the first row</li>
            <li>• Required columns: student_id, name, email, course_name, course_id, credits, semester, mid_term_marks, attendance, assignments</li>
            <li>• Column names must match exactly (case-insensitive)</li>
            <li>• Student IDs should be numbers only (email domain will be auto-appended)</li>
            <li>• Semester: 1-8 (integer)</li>
            <li>• Mid-term marks: 0-20 (out of 20)</li>
            <li>• Assignments: 0-10 (out of 10)</li>
            <li>• Attendance: 0-100 (percentage)</li>
            <li>• Credits: 1-6 (integer)</li>
            <li>• File size limit: 10MB</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
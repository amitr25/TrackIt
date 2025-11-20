import { FacultyStudentRecordsTable } from "../FacultyStudentRecordsTable";
import { AtRiskStudents } from "../AtRiskStudents";

export const FacultyStudents = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold mb-2">Student Management</h1>
        <p className="text-muted-foreground">
          View and manage student records and performance
        </p>
      </div>
      <FacultyStudentRecordsTable />
      <AtRiskStudents />
    </div>
  );
};

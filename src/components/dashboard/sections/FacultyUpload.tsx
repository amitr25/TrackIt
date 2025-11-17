import { StudentDataUpload } from "../StudentDataUpload";

export const FacultyUpload = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold mb-2">Upload Student Data</h1>
        <p className="text-muted-foreground">
          Upload and manage student course data and performance records
        </p>
      </div>
      <StudentDataUpload />
    </div>
  );
};

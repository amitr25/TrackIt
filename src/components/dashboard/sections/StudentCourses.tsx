import { StudentCoursesTable } from "../StudentCoursesTable";

export const StudentCourses = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold mb-2">My Courses</h1>
        <p className="text-muted-foreground">
          View and manage all your enrolled courses
        </p>
      </div>
      <StudentCoursesTable />
    </div>
  );
};

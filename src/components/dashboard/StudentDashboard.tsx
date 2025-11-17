import { useState } from "react";
import { DashboardLayout } from "./DashboardLayout";
import { StudentOverview } from "./sections/StudentOverview";
import { StudentCourses } from "./sections/StudentCourses";
import { StudentAnalytics } from "./sections/StudentAnalytics";
import { Settings } from "./sections/Settings";

export const StudentDashboard = () => {
  const [activeSection, setActiveSection] = useState("overview");

  const renderSection = () => {
    switch (activeSection) {
      case "overview":
        return <StudentOverview />;
      case "courses":
        return <StudentCourses />;
      case "analytics":
        return <StudentAnalytics />;
      case "settings":
        return <Settings />;
      default:
        return <StudentOverview />;
    }
  };

  return (
    <DashboardLayout
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      role="student"
    >
      {renderSection()}
    </DashboardLayout>
  );
};
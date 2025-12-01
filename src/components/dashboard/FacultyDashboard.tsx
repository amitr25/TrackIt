import { useState } from "react";
import { DashboardLayout } from "./DashboardLayout";
import { FacultyOverview } from "./sections/FacultyOverview";
import { FacultyStudents } from "./sections/FacultyStudents";
import { FacultyUpload } from "./sections/FacultyUpload";
import { FacultyAnalytics } from "./sections/FacultyAnalytics";
import { Settings } from "./sections/Settings";

export const FacultyDashboard = () => {
  const [activeSection, setActiveSection] = useState("overview");

  const renderSection = () => {
    switch (activeSection) {
      case "overview":
        return <FacultyOverview />;
      case "students":
        return <FacultyStudents />;
      case "upload":
        return <FacultyUpload />;
      case "analytics":
        return <FacultyAnalytics />;
      case "settings":
        return <Settings />;
      default:
        return <FacultyOverview />;
    }
  };

  return (
    <DashboardLayout
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      role="faculty"
    >
      {renderSection()}
    </DashboardLayout>
  );
};

import { ProfileSection } from "../ProfileSection";

export const Settings = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Manage your profile and account settings
        </p>
      </div>
      <ProfileSection />
    </div>
  );
};

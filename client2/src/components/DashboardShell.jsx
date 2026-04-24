import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/context/AuthContext";

const STUDENT_LINKS = [
  { to: "/student", label: "Dashboard", end: true },
  { to: "/student/complaints", label: "Complaints" },
  { to: "/student/service-request", label: "Service Requests" },
];

export const DashboardShell = ({ children, title, subtitle, action }) => {
  const { user } = useAuth();

  return (
    <DashboardLayout role="student" user={user} topLinks={STUDENT_LINKS} title={title} subtitle={subtitle} action={action}>
      {children}
    </DashboardLayout>
  );
};

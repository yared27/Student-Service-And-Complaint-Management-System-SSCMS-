import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes, useParams } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/routes/ProtectedRoute";
import Index from "./pages/Index.jsx";
import Login from "./pages/auth/Login.jsx";
import StudentDirectory from "./pages/student/Directory.jsx";
import StudentDashboard from "./pages/student/StudentDashboard.jsx";
import StudentMyComplaints from "./pages/student/MyComplaints.jsx";
import StudentMyRequests from "./pages/student/MyRequests.jsx";
import StudentNewComplaint from "./pages/student/NewComplaint.jsx";
import StudentNewServiceRequest from "./pages/student/NewServiceRequest.jsx";
import StudentServiceCatalog from "./pages/student/ServiceCatalog.jsx";
import StudentSubmissionDetail from "./pages/student/SubmissionDetail.jsx";
import StudentTrackStatus from "./pages/student/TrackStatus.jsx";
import FieldStaffTaskQueue from "./pages/staff/FieldStaffTaskQueue.jsx";
import InvestigatorConsole from "./pages/investigator/InvestigatorConsole.jsx";
import ComplaintManagerDashboard from "./pages/manager/ComplaintManagerDashboard.jsx";
import ServiceManagerDashboard from "./pages/manager/ServiceManagerDashboard.jsx";
import ServiceManagerReports from "./pages/manager/ServiceManagerReports.jsx";
import ComplaintManagerDetail from "./pages/manager/ComplaintManagerDetail.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminReports from "./pages/admin/Reports.jsx";
import AdminUsers from "./pages/admin/Users.jsx";
import AdminLogs from "./pages/admin/Logs.jsx";
import Notifications from "./pages/shared/Notifications.jsx";
import Profile from "./pages/shared/Profile.jsx";
import Settings from "./pages/shared/Settings.jsx";
import SupportCenter from "./pages/shared/SupportCenter.jsx";
import Unauthorized from "./pages/Unauthorized.jsx";
import NotFound from "./pages/NotFound.jsx";
const queryClient = new QueryClient();
const AUTH_ROLES = ["student", "service_manager", "field_staff", "staff", "complaint_manager", "investigator", "admin"];
const STUDENT_ROLES = ["student"];
const NOTIFICATION_ROLES = ["student", "service_manager", "field_staff", "staff", "complaint_manager"];
const SUPPORT_ROLES = ["student", "field_staff", "staff", "complaint_manager"];

function getDashboardPathByRole(role) {
  const roleToPath = {
    student: "/student/dashboard",
    investigator: "/investigator/dashboard",
    field_staff: "/field-staff/dashboard",
    staff: "/field-staff/dashboard",
    complaint_manager: "/complaint-manager/dashboard",
    service_manager: "/service-manager/dashboard",
    admin: "/admin/dashboard",
  };

  return roleToPath[role] || "/unauthorized";
}

function DashboardHomeRedirect() {
  const { user } = useAuth();
  const role = String(user?.role || "").toLowerCase();

  return <Navigate to={getDashboardPathByRole(role)} replace />;
}

function StudentPathOrDashboardRedirect({ studentPath }) {
  const { user } = useAuth();
  const role = String(user?.role || "").toLowerCase();

  if (role === "student") {
    return <Navigate to={studentPath} replace />;
  }

  return <Navigate to={getDashboardPathByRole(role)} replace />;
}

function LegacySubmissionRedirect() {
  const { id } = useParams();

  return <StudentPathOrDashboardRedirect studentPath={`/student/submission/${id}`} />;
}

const App = () => (<QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />}/>
            <Route path="/login" element={<Login />}/>
            <Route path="/dashboard" element={<ProtectedRoute allowedRoles={AUTH_ROLES}>
                  <DashboardHomeRedirect />
                </ProtectedRoute>} />
            <Route path="/dashboard/complaints" element={<ProtectedRoute allowedRoles={AUTH_ROLES}>
                  <StudentPathOrDashboardRedirect studentPath="/student/complaints" />
                </ProtectedRoute>} />
            <Route path="/dashboard/complaints/new" element={<ProtectedRoute allowedRoles={AUTH_ROLES}>
              <StudentPathOrDashboardRedirect studentPath="/student/complaint/new" />
                </ProtectedRoute>} />
            <Route path="/dashboard/services" element={<ProtectedRoute allowedRoles={AUTH_ROLES}>
              <StudentPathOrDashboardRedirect studentPath="/student/requests" />
                </ProtectedRoute>} />
            <Route path="/student" element={<ProtectedRoute allowedRoles={STUDENT_ROLES}>
                  <Navigate to="/student/dashboard" replace />
                </ProtectedRoute>}/>
            <Route path="/student/dashboard" element={<ProtectedRoute allowedRoles={STUDENT_ROLES}>
                  <StudentDashboard />
                </ProtectedRoute>}/>
            <Route path="/student/requests" element={<ProtectedRoute allowedRoles={STUDENT_ROLES}>
              <StudentMyRequests />
                </ProtectedRoute>}/>
            <Route path="/student/request/new" element={<ProtectedRoute allowedRoles={STUDENT_ROLES}>
              <StudentNewServiceRequest />
                </ProtectedRoute>}/>
            <Route path="/student/complaint/new" element={<ProtectedRoute allowedRoles={STUDENT_ROLES}>
              <StudentNewComplaint />
                </ProtectedRoute>}/>
            <Route path="/student/complaints" element={<ProtectedRoute allowedRoles={STUDENT_ROLES}>
              <StudentMyComplaints />
                </ProtectedRoute>}/>
            <Route path="/student/service-catalog" element={<ProtectedRoute allowedRoles={STUDENT_ROLES}>
              <StudentServiceCatalog />
                </ProtectedRoute>}/>
            <Route path="/student/directory" element={<ProtectedRoute allowedRoles={STUDENT_ROLES}>
              <StudentDirectory />
                </ProtectedRoute>}/>
            <Route path="/student/submission/:id" element={<ProtectedRoute allowedRoles={STUDENT_ROLES}>
              <StudentSubmissionDetail />
                </ProtectedRoute>}/>
            <Route path="/student/track-status" element={<ProtectedRoute allowedRoles={STUDENT_ROLES}>
              <StudentTrackStatus />
                </ProtectedRoute>}/>
            <Route path="/new-service-request" element={<ProtectedRoute allowedRoles={AUTH_ROLES}>
                  <StudentPathOrDashboardRedirect studentPath="/student/request/new" />
                </ProtectedRoute>} />
            <Route path="/new-complaint" element={<ProtectedRoute allowedRoles={AUTH_ROLES}>
                  <StudentPathOrDashboardRedirect studentPath="/student/complaint/new" />
                </ProtectedRoute>} />
            <Route path="/directory" element={<ProtectedRoute allowedRoles={AUTH_ROLES}>
                  <StudentPathOrDashboardRedirect studentPath="/student/directory" />
                </ProtectedRoute>} />
            <Route path="/submission/:id" element={<ProtectedRoute allowedRoles={AUTH_ROLES}>
              <LegacySubmissionRedirect />
                </ProtectedRoute>}/>
            <Route path="/track-status" element={<ProtectedRoute allowedRoles={AUTH_ROLES}>
              <StudentPathOrDashboardRedirect studentPath="/student/requests" />
                </ProtectedRoute>} />
            <Route path="/student/service-request" element={<Navigate to="/student/requests" replace />} />
            <Route path="/student/new-service-request" element={<Navigate to="/student/request/new" replace />} />
            <Route path="/student/complaint-submission" element={<Navigate to="/student/complaint/new" replace />} />
            <Route path="/notifications" element={<ProtectedRoute allowedRoles={NOTIFICATION_ROLES}>
                  <Notifications />
                </ProtectedRoute>}/>
            <Route path="/profile" element={<ProtectedRoute allowedRoles={AUTH_ROLES}>
                  <Profile />
                </ProtectedRoute>}/>
            <Route path="/settings" element={<ProtectedRoute allowedRoles={AUTH_ROLES}>
                  <Settings />
                </ProtectedRoute>}/>
            <Route path="/support-center" element={<ProtectedRoute allowedRoles={SUPPORT_ROLES}>
                  <SupportCenter />
                </ProtectedRoute>}/>
            <Route path="/support" element={<ProtectedRoute allowedRoles={SUPPORT_ROLES}>
                  <Navigate to="/support-center" replace />
                </ProtectedRoute>} />
            <Route path="/field-staff" element={<ProtectedRoute allowedRoles={["field_staff", "staff", "admin"]}>
              <Navigate to="/field-staff/dashboard" replace />
                </ProtectedRoute>}/>
            <Route path="/field-staff/tasks" element={<Navigate to="/field-staff/dashboard" replace />} />
            <Route path="/field-staff/dashboard" element={<ProtectedRoute allowedRoles={["field_staff", "staff", "admin"]}>
                  <FieldStaffTaskQueue />
                </ProtectedRoute>}/>
            <Route path="/complaint-manager" element={<ProtectedRoute allowedRoles={["complaint_manager", "admin"]}>
              <Navigate to="/complaint-manager/dashboard" replace />
                </ProtectedRoute>}/>
            <Route path="/complaint-manager/complaints" element={<Navigate to="/complaint-manager/dashboard" replace />} />
            <Route path="/complaint-manager/dashboard" element={<ProtectedRoute allowedRoles={["complaint_manager", "admin"]}>
                  <ComplaintManagerDashboard />
                </ProtectedRoute>}/>
            <Route path="/complaint-manager/complaints/:id" element={<ProtectedRoute allowedRoles={["complaint_manager", "admin"]}>
                  <ComplaintManagerDetail />
                </ProtectedRoute>}/>
            <Route path="/service-manager" element={<ProtectedRoute allowedRoles={["service_manager", "admin"]}>
              <Navigate to="/service-manager/dashboard" replace />
                </ProtectedRoute>}/>
            <Route path="/service-manager/requests" element={<Navigate to="/service-manager/dashboard" replace />} />
            <Route path="/service-manager/dashboard" element={<ProtectedRoute allowedRoles={["service_manager", "admin"]}>
                  <ServiceManagerDashboard />
                </ProtectedRoute>}/>
            <Route path="/service-manager/reports" element={<ProtectedRoute allowedRoles={["service_manager", "admin"]}>
                  <ServiceManagerReports />
                </ProtectedRoute>}/>
            <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]}>
              <Navigate to="/admin/dashboard" replace />
                </ProtectedRoute>}/>
            <Route path="/admin/analytics" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={["admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>}/>
            <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={["admin"]}>
                  <AdminReports />
                </ProtectedRoute>}/>
            <Route path="/admin/users" element={<ProtectedRoute allowedRoles={["admin"]}>
                  <AdminUsers />
                </ProtectedRoute>}/>
            <Route path="/admin/analytics/logs" element={<ProtectedRoute allowedRoles={["admin"]}>
                  <AdminLogs />
                </ProtectedRoute>}/>
            <Route path="/investigator" element={<Navigate to="/investigator/dashboard" replace />} />
            <Route path="/investigator/dashboard" element={<ProtectedRoute allowedRoles={["investigator", "admin"]}>
                  <InvestigatorConsole />
                </ProtectedRoute>}/>
            <Route path="/investigator/tasks" element={<ProtectedRoute allowedRoles={["investigator", "admin"]}>
                  <InvestigatorConsole />
                </ProtectedRoute>}/>
            <Route path="/manager/dashboard" element={<ProtectedRoute allowedRoles={AUTH_ROLES}>
                  <DashboardHomeRedirect />
                </ProtectedRoute>} />
            <Route path="/manager/pending" element={<ProtectedRoute allowedRoles={AUTH_ROLES}>
                  <DashboardHomeRedirect />
                </ProtectedRoute>} />
            <Route path="/staff/dashboard" element={<ProtectedRoute allowedRoles={AUTH_ROLES}>
                  <DashboardHomeRedirect />
                </ProtectedRoute>} />
            <Route path="/staff/tasks/:id" element={<ProtectedRoute allowedRoles={AUTH_ROLES}>
                  <DashboardHomeRedirect />
                </ProtectedRoute>} />
            <Route path="/unauthorized" element={<Unauthorized />}/>
            <Route path="*" element={<NotFound />}/>
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>);
export default App;

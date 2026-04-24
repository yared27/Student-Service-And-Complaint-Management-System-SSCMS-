import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/routes/ProtectedRoute";
import Index from "./pages/Index.jsx";
import Login from "./pages/auth/Login.jsx";
import StudentDashboard from "./pages/student/StudentDashboard.jsx";
import StudentDirectory from "./pages/student/Directory.jsx";
import StudentMyComplaints from "./pages/student/MyComplaints.jsx";
import StudentMyRequests from "./pages/student/MyRequests.jsx";
import StudentNewComplaint from "./pages/student/NewComplaint.jsx";
import StudentNewServiceRequest from "./pages/student/NewServiceRequest.jsx";
import StudentServiceCatalog from "./pages/student/ServiceCatalog.jsx";
import StudentSubmissionDetail from "./pages/student/SubmissionDetail.jsx";
import StudentTrackStatus from "./pages/student/TrackStatus.jsx";
import FieldStaffTaskQueue from "./pages/staff/FieldStaffTaskQueue.jsx";
import ComplaintManagerDashboard from "./pages/manager/ComplaintManagerDashboard.jsx";
import ServiceManagerDashboard from "./pages/manager/ServiceManagerDashboard.jsx";
import InvestigatorConsole from "./pages/investigator/InvestigatorConsole.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminUsers from "./pages/admin/Users.jsx";
import AdminLogs from "./pages/admin/Logs.jsx";
import Notifications from "./pages/shared/Notifications.jsx";
import Profile from "./pages/shared/Profile.jsx";
import Settings from "./pages/shared/Settings.jsx";
import SupportCenter from "./pages/shared/SupportCenter.jsx";
import Unauthorized from "./pages/Unauthorized.jsx";
import NotFound from "./pages/NotFound.jsx";
const queryClient = new QueryClient();
const AUTH_ROLES = ["student", "service_manager", "field_staff", "complaint_manager", "investigator", "admin"];
const App = () => (<QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />}/>
            <Route path="/login" element={<Login />}/>
            <Route path="/dashboard" element={<Navigate to="/student" replace />} />
            <Route path="/dashboard/complaints" element={<Navigate to="/student/complaints" replace />} />
            <Route path="/dashboard/complaints/new" element={<Navigate to="/student/complaint-submission" replace />} />
            <Route path="/dashboard/services" element={<Navigate to="/student/service-request" replace />} />
            <Route path="/student" element={<ProtectedRoute allowedRoles={AUTH_ROLES}>
                  <StudentDashboard />
                </ProtectedRoute>}/>
            <Route path="/student/complaints" element={<ProtectedRoute allowedRoles={AUTH_ROLES}>
              <StudentMyComplaints />
                </ProtectedRoute>}/>
            <Route path="/student/service-request" element={<ProtectedRoute allowedRoles={AUTH_ROLES}>
              <StudentMyRequests />
                </ProtectedRoute>}/>
            <Route path="/student/complaint-submission" element={<ProtectedRoute allowedRoles={AUTH_ROLES}>
              <StudentNewComplaint />
                </ProtectedRoute>}/>
            <Route path="/student/new-service-request" element={<ProtectedRoute allowedRoles={AUTH_ROLES}>
              <StudentNewServiceRequest />
                </ProtectedRoute>}/>
            <Route path="/student/service-catalog" element={<ProtectedRoute allowedRoles={AUTH_ROLES}>
              <StudentServiceCatalog />
                </ProtectedRoute>}/>
            <Route path="/student/directory" element={<ProtectedRoute allowedRoles={AUTH_ROLES}>
              <StudentDirectory />
                </ProtectedRoute>}/>
            <Route path="/student/submission/:id" element={<ProtectedRoute allowedRoles={AUTH_ROLES}>
              <StudentSubmissionDetail />
                </ProtectedRoute>}/>
            <Route path="/student/track-status" element={<ProtectedRoute allowedRoles={AUTH_ROLES}>
              <StudentTrackStatus />
                </ProtectedRoute>}/>
            <Route path="/new-service-request" element={<Navigate to="/student/new-service-request" replace />} />
            <Route path="/new-complaint" element={<Navigate to="/student/complaint-submission" replace />} />
            <Route path="/directory" element={<Navigate to="/student/directory" replace />} />
            <Route path="/submission/:id" element={<ProtectedRoute allowedRoles={AUTH_ROLES}>
                  <StudentSubmissionDetail />
                </ProtectedRoute>}/>
            <Route path="/track-status" element={<Navigate to="/student/track-status" replace />} />
            <Route path="/notifications" element={<ProtectedRoute allowedRoles={AUTH_ROLES}>
                  <Notifications />
                </ProtectedRoute>}/>
            <Route path="/profile" element={<ProtectedRoute allowedRoles={AUTH_ROLES}>
                  <Profile />
                </ProtectedRoute>}/>
            <Route path="/settings" element={<ProtectedRoute allowedRoles={AUTH_ROLES}>
                  <Settings />
                </ProtectedRoute>}/>
            <Route path="/support-center" element={<ProtectedRoute allowedRoles={AUTH_ROLES}>
                  <SupportCenter />
                </ProtectedRoute>}/>
            <Route path="/support" element={<Navigate to="/support-center" replace />} />
            <Route path="/field-staff" element={<ProtectedRoute allowedRoles={["field_staff", "admin"]}>
                  <FieldStaffTaskQueue />
                </ProtectedRoute>}/>
            <Route path="/complaint-manager" element={<ProtectedRoute allowedRoles={["complaint_manager", "admin"]}>
                  <ComplaintManagerDashboard />
                </ProtectedRoute>}/>
            <Route path="/service-manager" element={<ProtectedRoute allowedRoles={["service_manager", "admin"]}>
                  <ServiceManagerDashboard />
                </ProtectedRoute>}/>
            <Route path="/investigator" element={<ProtectedRoute allowedRoles={["investigator", "admin"]}>
                  <InvestigatorConsole />
                </ProtectedRoute>}/>
            <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>}/>
            <Route path="/admin/users" element={<ProtectedRoute allowedRoles={["admin"]}>
                  <AdminUsers />
                </ProtectedRoute>}/>
            <Route path="/admin/logs" element={<ProtectedRoute allowedRoles={["admin"]}>
                  <AdminLogs />
                </ProtectedRoute>}/>
            <Route path="/manager/dashboard" element={<Navigate to="/service-manager" replace />} />
            <Route path="/manager/pending" element={<Navigate to="/service-manager" replace />} />
            <Route path="/staff/dashboard" element={<Navigate to="/field-staff" replace />} />
            <Route path="/staff/tasks/:id" element={<Navigate to="/field-staff" replace />} />
            <Route path="/unauthorized" element={<Unauthorized />}/>
            <Route path="*" element={<NotFound />}/>
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>);
export default App;

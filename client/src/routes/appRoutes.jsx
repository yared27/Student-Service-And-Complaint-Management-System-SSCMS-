import { Navigate, Route, Routes } from "react-router-dom";
import { LoginPage } from "../pages/auth/LoginPage";
import { RegisterStudentPage } from "../pages/auth/RegisterStudentPage";
import { VerifyEmailPage } from "../pages/auth/VerifyEmailPage";
import { FieldStaffDashboard } from "../pages/dashboards/FieldStaffDashboard";
import { ServiceManagerDashboard } from "../pages/dashboards/ServiceManagerDashboard";
import { StudentDashboard } from "../pages/dashboards/StudentDashboard";
import { StudentUnionDashboard } from "../pages/dashboards/StudentUnionDashboard";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register/student" element={<RegisterStudentPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/student" element={<StudentDashboard />} />
      <Route path="/student-union" element={<StudentUnionDashboard />} />
      <Route path="/service-manager" element={<ServiceManagerDashboard />} />
      <Route path="/field-staff" element={<FieldStaffDashboard />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

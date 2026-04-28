import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getStoredAuth } from "@/lib/authStorage";

function FullPageSpinner() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <div className="inline-flex items-center gap-2 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span>Loading...</span>
      </div>
    </div>
  );
}

export function ProtectedRoute({ children, allowedRoles = [], allowedDepts = [] }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const storedAuth = getStoredAuth();
  const currentUser = user || storedAuth?.user || null;

  if (loading && !currentUser) {
    return <FullPageSpinner />;
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  const normalizedRoles = Array.isArray(allowedRoles) ? allowedRoles.map((item) => String(item).toLowerCase()) : [];
  const normalizedDepts = Array.isArray(allowedDepts) ? allowedDepts.map((item) => String(item).toLowerCase()) : [];
  const currentRole = String(currentUser?.role || "").toLowerCase();
  const currentDept = String(currentUser?.dept || currentUser?.department || "").toLowerCase();

  const roleMatched = !Array.isArray(allowedRoles) || normalizedRoles.length === 0 || normalizedRoles.includes(currentRole);

  const deptMatched = !Array.isArray(allowedDepts) || normalizedDepts.length === 0 || normalizedDepts.includes(currentDept);

  if (!roleMatched || !deptMatched) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

export default ProtectedRoute;

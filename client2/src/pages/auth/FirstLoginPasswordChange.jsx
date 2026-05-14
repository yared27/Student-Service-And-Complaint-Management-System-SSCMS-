import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";

const API_BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE_URL) ||
  "http://localhost:5000/api";

export default function FirstLoginPasswordChange({ loginData }) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const auth = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    temporaryPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.temporaryPassword) {
      newErrors.temporaryPassword = "Temporary password is required";
    }

    if (!formData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters";
    }

    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/users/change-password-first-login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${loginData.token}`,
        },
        body: JSON.stringify({
          temporaryPassword: formData.temporaryPassword,
          newPassword: formData.newPassword,
        }),
      });

      const responseText = await response.text();
      let data = {};

      if (responseText) {
        try {
          data = JSON.parse(responseText);
        } catch {
          data = { message: response.ok ? "Password changed successfully." : "Failed to change password" };
        }
      }

      if (!response.ok) {
        console.error("[FirstLoginPasswordChange] Server returned non-ok status:", response.status, data);
        throw new Error(data.message || "Failed to change password");
      }

      console.log("[FirstLoginPasswordChange] Password change succeeded with status 200");
      toast({ title: "Success", description: "Password changed successfully.", variant: "default" });

      // Attempt to sign in using the new password so the user is redirected to their dashboard.
      try {
        const identifier = loginData.user?.username || loginData.user?.email || loginData.user?.id;
        console.log("[FirstLoginPasswordChange] Attempting re-login with identifier:", identifier);

        const loginResp = await axios.post(`${API_BASE_URL}/auth/login`, {
          identity: "auto",
          identifier,
          password: formData.newPassword,
          rememberMe: true,
        });

        const respData = loginResp?.data || {};
        const nextUser = respData.user;
        const token = respData.token;
        const refreshToken = respData.refreshToken;

        console.log("[FirstLoginPasswordChange] Re-login response:", { hasUser: !!nextUser, hasToken: !!token });

        if (nextUser && token) {
          console.log("[FirstLoginPasswordChange] Re-login successful, setting auth and redirecting");
          if (typeof auth.login === "function") {
            auth.login({ user: nextUser, token, refreshToken });
          } else {
            localStorage.setItem("sscms-auth", JSON.stringify({ user: nextUser, token, refreshToken }));
          }

          const role = String(nextUser?.role || loginData?.role || "").toLowerCase();
          const ROLE_REDIRECT = {
            student: "/student/dashboard",
            service_manager: "/service-manager/dashboard",
            complaint_manager: "/complaint-manager/dashboard",
            field_staff: "/field-staff/dashboard",
            staff: "/field-staff/dashboard",
            investigator: "/investigator/dashboard",
            admin: "/admin/dashboard",
          };

          const target = ROLE_REDIRECT[role] || "/student/dashboard";
          console.log("[FirstLoginPasswordChange] Navigating to dashboard:", target);
          navigate(target, { replace: true });
          return;
        } else {
          console.warn("[FirstLoginPasswordChange] Re-login response missing user or token");
        }
      } catch (loginError) {
        // If re-login fails, fall back to redirecting to login page
        console.error("[FirstLoginPasswordChange] Re-login failed:", loginError?.message || loginError);
      }

      // Fallback: clear stored login data and go to login page
      console.log("[FirstLoginPasswordChange] Falling back to /login");
      try {
        localStorage.removeItem("sscms-auth");
      } catch {}
      navigate("/login");
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to change password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Change Password
            </h1>
            <p className="text-gray-600">
              This is your first login. Please change your temporary password to continue.
            </p>
          </div>

          {/* Warning Alert */}
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex gap-3">
              <div className="text-amber-600 text-xl">⚠️</div>
              <div>
                <p className="font-semibold text-amber-900 mb-1">Important</p>
                <p className="text-sm text-amber-800">
                  Your temporary password expires in 48 hours. Change it now to secure your account.
                </p>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="mb-6 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <span className="font-semibold text-gray-900">{loginData.user?.name}</span>
            </p>
            <p className="text-sm text-gray-600">
              Role: <span className="font-semibold text-gray-900">{loginData.role}</span>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Temporary Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Temporary Password
              </label>
              <input
                type="password"
                name="temporaryPassword"
                value={formData.temporaryPassword}
                onChange={handleChange}
                placeholder="Enter your temporary password"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.temporaryPassword
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                disabled={isLoading}
              />
              {errors.temporaryPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.temporaryPassword}
                </p>
              )}
            </div>

            {/* New Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Create a strong new password"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.newPassword ? "border-red-500" : "border-gray-300"
                }`}
                disabled={isLoading}
              />
              {errors.newPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.newPassword}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                At least 8 characters recommended
              </p>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your new password"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.confirmPassword
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                disabled={isLoading}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-2 px-4 rounded-lg font-medium text-white transition-colors ${
                isLoading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Changing password...
                </span>
              ) : (
                "Change Password"
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-sm text-gray-500">
            After changing your password, you will be redirected to login.
          </p>
        </div>
      </div>
    </div>
  );
}

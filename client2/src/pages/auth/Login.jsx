import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import FirstLoginPasswordChange from "./FirstLoginPasswordChange";
import heroImg from "@/assets/hero-campus.jpg";
import { Navigate } from "react-router-dom";

const ROLE_REDIRECT = {
  student: "/student/dashboard",
  service_manager: "/service-manager/dashboard",
  complaint_manager: "/complaint-manager/dashboard",
  field_staff: "/field-staff/dashboard",
  staff: "/field-staff/dashboard",
  investigator: "/investigator/dashboard",
  admin: "/admin/dashboard",
};

const API_BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE_URL) ||
  "http://localhost:5000/api";

function getErrorMessage(error) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    "Login failed. Please check your credentials and try again."
  );
}

export default function Login() {
  const navigate = useNavigate();
  const auth = useAuth();
  const storedAuth = localStorage.getItem("sscms-auth");

if (storedAuth) {
  try {
    const parsed = JSON.parse(storedAuth);
    const role = String(parsed?.user?.role || "").toLowerCase();
    const target = ROLE_REDIRECT[role] || "/student/dashboard";

    return <Navigate to={target} replace />;
  } catch {
    // ignore parse error
  }
}
  const [showPassword, setShowPassword] = useState(false);
  const [loginData, setLoginData] = useState(null);
  const [requiresPasswordChange, setRequiresPasswordChange] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    const identifier = String(values.username || "").trim();
    const password = String(values.password || "");

    try {
      const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
        identity: "auto",
        identifier,
        password,
        rememberMe: true,
      });

      const user = loginResponse?.data?.user;
      const token = loginResponse?.data?.token;
      const refreshToken = loginResponse?.data?.refreshToken;
      const requiresChange = loginResponse?.data?.requiresPasswordChange || false;

      if (!user || !token) {
        throw new Error("Invalid authentication response.");
      }

      // Check if user needs to change password on first login
      if (requiresChange) {
        // Store login data temporarily for the password change component
        setLoginData({
          user,
          token,
          refreshToken,
          role: loginResponse?.data?.role,
          tempPasswordExpiration: loginResponse?.data?.tempPasswordExpiration,
        });
        setRequiresPasswordChange(true);
        return;
      }

      // Normal login flow
      if (typeof auth.dispatch === "function") {
        auth.dispatch({
          type: "LOGIN_SUCCESS",
          payload: { user, token },
        });
      } else if (typeof auth.login === "function") {
        auth.login({ user, token, refreshToken });
      } else {
        localStorage.setItem("sscms-auth", JSON.stringify({ user, token, refreshToken }));
      }

      toast.success("Welcome back.");
      const normalizedRole = String(user.role || "").trim().toLowerCase();
      const target = ROLE_REDIRECT[normalizedRole] || "/student/dashboard";
      navigate(target, { replace: true });
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  });

  const helperText = useMemo(
    () => "Use your assigned username and password to access the dashboard.",
    [],
  );

  // Show password change form if required
  if (requiresPasswordChange && loginData) {
    return <FirstLoginPasswordChange loginData={loginData} />;
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="flex flex-col p-6 sm:p-8 md:p-12 bg-background">
        <Logo />

        <div className="flex-1 flex items-center py-8">
          <div className="w-full max-w-md mx-auto animate-fade-up">
            <span className="text-xs uppercase tracking-[0.25em] text-accent font-semibold">Sign in</span>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mt-3 leading-tight">Welcome back.</h1>
            <p className="text-muted-foreground mt-3">{helperText}</p>

            <form onSubmit={onSubmit} className="mt-8 sm:mt-10 space-y-5" noValidate>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  className="h-12"
                  placeholder="Enter your username"
                  autoComplete="username"
                  aria-invalid={Boolean(errors.username)}
                  {...register("username", { required: "Username is required" })}
                />
                {errors.username ? (
                  <p className="text-sm text-destructive">{errors.username.message}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className="h-12 pr-12"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    aria-invalid={Boolean(errors.password)}
                    {...register("password", { required: "Password is required" })}
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password ? (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                ) : null}
              </div>

              <Button type="submit" variant="default" size="lg" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>

      <div className="hidden lg:block relative bg-primary">
        <img src={heroImg} alt="" className="absolute inset-0 w-full h-full object-cover opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-12 text-white">
          <p className="font-display text-3xl md:text-4xl font-semibold leading-snug max-w-md text-balance">
            "Faster login, faster resolution."
          </p>
          <p className="mt-4 text-sm uppercase tracking-widest text-accent">SSCMS · AMU 2026</p>
        </div>
      </div>
    </div>
  );
}

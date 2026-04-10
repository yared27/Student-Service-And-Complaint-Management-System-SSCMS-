import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthCard } from "../../components/auth/AuthCard";
import { AuthHeader } from "../../components/auth/AuthHeader";
import { AuthLayout } from "../../components/auth/AuthLayout";
import { LoginIdentityTabs } from "../../components/auth/LoginIdentityTabs";
import { Alert } from "../../components/ui/Alert";
import { Button } from "../../components/ui/Button";
import { Checkbox } from "../../components/ui/Checkbox";
import { Input } from "../../components/ui/Input";
import { PasswordInput } from "../../components/ui/PasswordInput";
import {
  normalizeUpper,
  validateAmuEmail,
  validateEmployeeId,
  validatePassword,
  validateStudentId,
} from "../../lib/validators/authValidators";
import { loginRequest } from "../../lib/api/authApi";

const IDENTITY_META = {
  student: {
    key: "student",
    label: "Student ID",
    placeholder: "NSR/1234/23 or SSR/1234/23",
    validate: validateStudentId,
    normalize: true,
  },
  staff: {
    key: "staff",
    label: "University Email",
    placeholder: "name@amu.edu.et",
    validate: validateAmuEmail,
    normalize: false,
  },
  field: {
    key: "field",
    label: "Employee ID",
    placeholder: "ELC-023",
    validate: validateEmployeeId,
    normalize: true,
  },
};

const roleRoutes = {
  STUDENT: "/student",
  COMPLAINT_MANAGER: "/student-union",
  SERVICE_MANAGER: "/service-manager",
  STAFF: "/field-staff",
  ADMIN: "/service-manager",
  INVESTIGATOR: "/service-manager",
};

export function LoginPage() {
  const navigate = useNavigate();
  const [identity, setIdentity] = useState("student");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState({
    variant: "info",
    title: "Sign in",
    message: "Choose your identity and enter credentials.",
  });

  const activeIdentity = IDENTITY_META[identity];

  const onIdentityChange = (next) => {
    setIdentity(next);
    setIdentifier("");
    setPassword("");
    setErrors({});
    setAlert({
      variant: "info",
      title: "Identity changed",
      message: "Update your identifier and continue.",
    });
  };

  const onIdentifierChange = (event) => {
    const raw = event.target.value;
    const nextValue = activeIdentity.normalize ? normalizeUpper(raw) : raw;
    setIdentifier(nextValue);
    setErrors((prev) => ({ ...prev, identifier: undefined }));
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!identifier.trim()) {
      nextErrors.identifier = `${activeIdentity.label} is required.`;
    } else if (!activeIdentity.validate(identifier.trim())) {
      nextErrors.identifier = `Invalid ${activeIdentity.label.toLowerCase()} format.`;
    }

    if (!validatePassword(password)) {
      nextErrors.password = "Password must be at least 8 characters.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) {
      setAlert({
        variant: "error",
        title: "Validation failed",
        message: "Please correct highlighted fields and try again.",
      });
      return;
    }

    setLoading(true);
    setAlert({
      variant: "info",
      title: "Authenticating",
      message: "Verifying credentials...",
    });

    try {
      const data = await loginRequest({
        identity,
        identifier,
        password,
        rememberMe,
      });

      localStorage.setItem("sscms-token", data.token);
      localStorage.setItem("sscms-user", JSON.stringify(data.user));

      const destination = roleRoutes[data.user?.role] || "/student";
      setLoading(false);
      navigate(destination);
    } catch (error) {
      setLoading(false);
      setAlert({
        variant: "error",
        title: "Login failed",
        message: error.message || "Unable to sign in right now.",
      });
    }
  };

  return (
    <AuthLayout>
      <AuthCard>
        <div className="space-y-6">
          <AuthHeader title="Sign in to SSCMS" description="Use your authorized identity to continue." />

          <Alert variant={alert.variant} title={alert.title}>
            {alert.message}
          </Alert>

          <LoginIdentityTabs value={identity} onChange={onIdentityChange} />

          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <Input
              label={activeIdentity.label}
              name="identifier"
              value={identifier}
              onChange={onIdentifierChange}
              placeholder={activeIdentity.placeholder}
              hasError={Boolean(errors.identifier)}
              error={errors.identifier}
              required
            />

            <PasswordInput
              label="Password"
              name="password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setErrors((prev) => ({ ...prev, password: undefined }));
              }}
              placeholder="Enter your password"
              hasError={Boolean(errors.password)}
              error={errors.password}
              required
            />

            <div className="flex flex-wrap items-center justify-between gap-3">
              <Checkbox
                label="Remember me"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
              />
              <button
                type="button"
                className="text-sm font-medium text-slate-700 transition hover:text-slate-900 hover:underline"
              >
                Forgot password?
              </button>
            </div>

            <Button type="submit" isLoading={loading} disabled={loading}>
              Sign in
            </Button>
          </form>

          <p className="text-center text-sm text-slate-600">
            Student-only public registration is available for Arba Minch University.
            <Link
              className="ml-2 inline-flex items-center gap-1 font-semibold text-slate-900 hover:underline"
              to="/register/student"
            >
              Register as student
              <ArrowRight className="h-4 w-4" />
            </Link>
          </p>
        </div>
      </AuthCard>
    </AuthLayout>
  );
}

import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthCard } from "../../components/auth/AuthCard";
import { AuthHeader } from "../../components/auth/AuthHeader";
import { AuthLayout } from "../../components/auth/AuthLayout";
import { Alert } from "../../components/ui/Alert";
import { Button } from "../../components/ui/Button";
import { Checkbox } from "../../components/ui/Checkbox";
import { Input } from "../../components/ui/Input";
import { PasswordInput } from "../../components/ui/PasswordInput";
import { Select } from "../../components/ui/Select";
import { normalizeUpper, validatePassword, validateStudentId } from "../../lib/validators/authValidators";
import { registerStudentRequest } from "../../lib/api/authApi";

const campusOptions = [
  { label: "Select campus", value: "" },
  { label: "Arba Minch (Main Campus)", value: "ARBA_MINCH_MAIN" },
  { label: "Kulfo Campus", value: "KULFO" },
  { label: "Abaya Campus", value: "ABAYA" },
  { label: "Chamo Campus", value: "CHAMO" },
  { label: "Sawla Campus", value: "SAWLA" },
  { label: "Nech Sar Campus", value: "NECH_SAR" },
];

export function RegisterStudentPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    studentId: "",
    campus: "",
    department: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const isValid = useMemo(() => {
    return (
      form.fullName.trim().length > 0 &&
      validateStudentId(form.studentId) &&
      form.campus.trim().length > 0 &&
      validatePassword(form.password) &&
      form.confirmPassword === form.password &&
      form.acceptTerms
    );
  }, [form]);

  const setField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined, form: undefined }));
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!form.fullName.trim()) {
      nextErrors.fullName = "Full name is required.";
    }
    if (!validateStudentId(form.studentId)) {
      nextErrors.studentId = "Student ID must match NSR/1234/23 or SSR/1234/23 (including Social Science SSR IDs).";
    }
    if (!form.campus.trim()) {
      nextErrors.campus = "Campus is required.";
    }
    if (!validatePassword(form.password)) {
      nextErrors.password = "Password must be at least 8 characters.";
    }
    if (form.confirmPassword !== form.password) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }
    if (!form.acceptTerms) {
      nextErrors.acceptTerms = "You must accept terms to continue.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) {
      return;
    }

    setErrors((prev) => ({ ...prev, form: undefined }));
    setLoading(true);
    try {
      const data = await registerStudentRequest({
        fullName: form.fullName,
        studentId: form.studentId,
        campus: form.campus,
        department: form.department,
        password: form.password,
      });

      setLoading(false);
      setSuccessMessage(data.message || "Account created successfully. Please login.");
      setTimeout(() => navigate("/login"), 900);
    } catch (error) {
      setLoading(false);
      setErrors((prev) => ({
        ...prev,
        form: error.message || "Unable to create account.",
      }));
    }
  };

  return (
    <AuthLayout>
      <AuthCard>
        <div className="space-y-6">
          <AuthHeader title="Student registration" description="Public self-registration is only available for Arba Minch University students." />

          {successMessage ? (
            <Alert variant="success" title="Registration successful">
              {successMessage}
            </Alert>
          ) : null}

          {errors.form ? (
            <Alert variant="error" title="Registration failed">
              {errors.form}
            </Alert>
          ) : null}

          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <Input
              label="Full Name"
              name="fullName"
              value={form.fullName}
              onChange={(event) => setField("fullName", event.target.value)}
              placeholder="Enter your full name"
              hasError={Boolean(errors.fullName)}
              error={errors.fullName}
              required
            />

            <Input
              label="Student ID"
              name="studentId"
              value={form.studentId}
              onChange={(event) => setField("studentId", normalizeUpper(event.target.value))}
              placeholder="NSR/1234/23"
              hasError={Boolean(errors.studentId)}
              error={errors.studentId}
              required
            />

            <Select
              label="Campus"
              name="campus"
              value={form.campus}
              onChange={(event) => setField("campus", event.target.value)}
              options={campusOptions}
              error={errors.campus}
            />

            <Input
              label="Department"
              name="department"
              value={form.department}
              onChange={(event) => setField("department", event.target.value)}
              placeholder="Optional"
            />

            <PasswordInput
              label="Password"
              name="password"
              value={form.password}
              onChange={(event) => setField("password", event.target.value)}
              placeholder="Minimum 8 characters"
              hasError={Boolean(errors.password)}
              error={errors.password}
              required
            />

            <PasswordInput
              label="Confirm Password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={(event) => setField("confirmPassword", event.target.value)}
              placeholder="Re-enter password"
              hasError={Boolean(errors.confirmPassword)}
              error={errors.confirmPassword}
              required
            />

            <div>
              <Checkbox
                label="I agree to the Terms and Conditions"
                checked={form.acceptTerms}
                onChange={(event) => setField("acceptTerms", event.target.checked)}
              />
              {errors.acceptTerms ? (
                <p className="mt-1 text-xs text-red-600">{errors.acceptTerms}</p>
              ) : null}
            </div>

            <Button type="submit" isLoading={loading} disabled={!isValid || loading}>
              Create student account
            </Button>
          </form>

          <p className="text-center text-sm text-slate-600">
            Already have an account?
            <Link className="ml-2 font-semibold text-slate-900 hover:underline" to="/login">
              Back to login
            </Link>
          </p>
        </div>
      </AuthCard>
    </AuthLayout>
  );
}

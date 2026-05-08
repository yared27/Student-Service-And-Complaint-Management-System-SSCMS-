import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, ChevronLeft, Eye, EyeOff, Key, Loader2, LogOut, Mail, Settings, Shield, Upload, User } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api/httpClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function roleBadgeClass(role) {
  switch (String(role || "").toLowerCase()) {
    case "student":
      return "bg-emerald-50 text-emerald-700 border-emerald-100";
    case "service_manager":
    case "complaint_manager":
      return "bg-blue-50 text-blue-700 border-blue-100";
    case "field_staff":
    case "staff":
      return "bg-orange-50 text-orange-700 border-orange-100";
    case "admin":
      return "bg-slate-900 text-white border-slate-800";
    default:
      return "bg-slate-50 text-slate-600 border-slate-200";
  }
}

function strongPasswordOk(value) {
  const text = String(value || "");
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{10,}$/.test(text);
}

export default function Profile() {
  const navigate = useNavigate();
  const { auth, user, login, logout } = useAuth();
  const fileInputRef = useRef(null);
  const passwordSectionRef = useRef(null);

  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedPreview, setSelectedPreview] = useState("");
  const [changePasswordOpen, setChangePasswordOpen] = useState(true);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const currentUser = user || {};
  const displayName = currentUser.name || currentUser.username || "User";
  const roleLabel = String(currentUser.role || "Student").replaceAll("_", " ");
  const department = currentUser.department || "General";
  const email = currentUser.email || "-";
  const profileImage = selectedPreview || currentUser.profileImage || "";
  const initials = useMemo(() => displayName.slice(0, 1).toUpperCase(), [displayName]);

  async function persistProfileImage(imageUrl) {
    const response = await apiRequest("/users/profile-image", {
      method: "POST",
      body: JSON.stringify({ profileImage: imageUrl }),
    });

    const nextUser = response?.data?.user || response?.user || currentUser;
    const nextAuth = {
      ...(auth || {}),
      user: nextUser,
    };

    login(nextAuth);
    return nextUser;
  }

  async function handleImageChange(event) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }

    setUploadingImage(true);
    const previewUrl = URL.createObjectURL(file);
    setSelectedPreview(previewUrl);

    try {
      const formData = new FormData();
      formData.append("files", file);

      const uploadResponse = await apiRequest("/uploads/images", {
        method: "POST",
        body: formData,
      });

      const uploadedUrl = uploadResponse?.files?.[0]?.url;
      if (!uploadedUrl) {
        throw new Error("Upload did not return an image URL.");
      }

      await persistProfileImage(uploadedUrl);
      toast.success("Profile image updated.");
    } catch (error) {
      toast.error(error?.message || "Failed to upload profile image.");
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  async function handlePasswordChange(event) {
    event.preventDefault();

    const currentPassword = passwordForm.currentPassword.trim();
    const newPassword = passwordForm.newPassword.trim();
    const confirmPassword = passwordForm.confirmPassword.trim();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("All password fields are required.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New password and confirmation must match.");
      return;
    }

    if (!strongPasswordOk(newPassword)) {
      toast.error("Password must be at least 10 characters and include uppercase, lowercase, number, and symbol.");
      return;
    }

    setSavingPassword(true);
    try {
      await apiRequest("/users/change-password", {
        method: "POST",
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      toast.success("Password changed. Please sign in again.");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      await logout();
      navigate("/login", { replace: true });
    } catch (error) {
      toast.error(error?.message || "Failed to change password.");
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 lg:px-10">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-500 transition-colors hover:text-slate-900"
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="text-xs font-semibold uppercase tracking-[0.24em]">Back</span>
          </button>

          <div className="hidden md:block text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">SSCMS</p>
            <h1 className="text-sm font-semibold tracking-[0.18em] text-slate-900">Account Profile</h1>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate("/settings")}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate("/notifications")}>
              <Bell className="mr-2 h-4 w-4" />
              Notifications
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-8 lg:px-10">
        <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <div className="h-36 bg-gradient-to-r from-slate-950 via-blue-950 to-cyan-800" />
          <div className="px-6 pb-8 sm:px-8 lg:px-10">
            <div className="-mt-16 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div className="flex flex-col gap-5 md:flex-row md:items-end">
                <div className="relative h-32 w-32 rounded-[1.75rem] border-4 border-white bg-white p-2 shadow-lg">
                  <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-[1.25rem] bg-slate-100">
                    {profileImage ? (
                      <img src={profileImage} alt={displayName} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-4xl font-bold text-slate-400">{initials}</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-2 -right-2 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg transition hover:bg-blue-700 disabled:opacity-60"
                    disabled={uploadingImage}
                  >
                    {uploadingImage ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleImageChange} />
                </div>

                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-3xl font-bold text-slate-950">{displayName}</h2>
                    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${roleBadgeClass(currentUser.role)}`}>
                      <Shield className="mr-1 h-3.5 w-3.5" />
                      {roleLabel}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500">{currentUser.username || "-"}</p>
                  <p className="max-w-2xl text-sm text-slate-600">
                    Keep your account information current, upload a profile photo, and manage your password from one place.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={() => passwordSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}>
                  <Key className="mr-2 h-4 w-4" />
                  Change Password
                </Button>
                <Button variant="destructive" onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Profile Details</h3>
            <div className="mt-6 space-y-5">
              <div className="flex items-center gap-4 rounded-2xl bg-slate-50 px-4 py-4">
                <User className="h-5 w-5 text-slate-500" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Name</p>
                  <p className="font-medium text-slate-950">{displayName}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 rounded-2xl bg-slate-50 px-4 py-4">
                <Mail className="h-5 w-5 text-slate-500" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Email</p>
                  <p className="font-medium text-slate-950">{email}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 rounded-2xl bg-slate-50 px-4 py-4">
                <Shield className="h-5 w-5 text-slate-500" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Department</p>
                  <p className="font-medium text-slate-950">{department}</p>
                </div>
              </div>
            </div>
          </div>

          <div ref={passwordSectionRef} className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Security</h3>
                <p className="mt-2 text-lg font-semibold text-slate-950">Change password</p>
              </div>
              <button
                type="button"
                onClick={() => setChangePasswordOpen((current) => !current)}
                className="text-sm font-medium text-blue-700 hover:underline"
              >
                {changePasswordOpen ? "Hide" : "Show"}
              </button>
            </div>

            {changePasswordOpen ? (
              <form onSubmit={handlePasswordChange} className="mt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      value={passwordForm.currentPassword}
                      onChange={(event) => setPasswordForm((prev) => ({ ...prev, currentPassword: event.target.value }))}
                      placeholder="Enter current password"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword((current) => !current)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900"
                      aria-label={showCurrentPassword ? "Hide current password" : "Show current password"}
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New password</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={passwordForm.newPassword}
                      onChange={(event) => setPasswordForm((prev) => ({ ...prev, newPassword: event.target.value }))}
                      placeholder="At least 10 characters"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword((current) => !current)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900"
                      aria-label={showNewPassword ? "Hide new password" : "Show new password"}
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(event) => setPasswordForm((prev) => ({ ...prev, confirmPassword: event.target.value }))}
                    placeholder="Re-enter new password"
                    autoComplete="new-password"
                  />
                </div>

                <p className="text-xs text-slate-500">Use a strong password with uppercase, lowercase, number, and symbol.</p>

                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" })}
                    disabled={savingPassword}
                  >
                    Clear
                  </Button>
                  <Button type="submit" disabled={savingPassword}>
                    {savingPassword ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </span>
                    ) : (
                      "Update password"
                    )}
                  </Button>
                </div>
              </form>
            ) : null}
          </div>
        </section>
      </main>
    </div>
  );
}

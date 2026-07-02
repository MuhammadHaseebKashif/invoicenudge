"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  UserCircle,
  Mail,
  Lock,
  ShieldCheck,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  FileText,
  Image as ImageIcon,
  Upload,
} from "lucide-react";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [userId, setUserId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [createdAt, setCreatedAt] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [initialState, setInitialState] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    setUserId(user.id);
    setEmail(user.email || "");
    setCreatedAt(user.created_at || "");

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (!error && data) {
      setName(data.name || "");
      setDescription(data.description || "");
      setAvatarUrl(data.avatar_url || "");

      setInitialState(
        JSON.stringify({
          name: data.name || "",
          description: data.description || "",
          avatarUrl: data.avatar_url || "",
        })
      );
    }

    setLoading(false);
  }

  const currentState = JSON.stringify({
    name,
    description,
    avatarUrl,
  });

  const hasUnsavedChanges = initialState && currentState !== initialState;

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setUploadingAvatar(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;

      console.log("Uploading to storage:", fileName);
      console.log("User ID:", userId);

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { upsert: true });

      if (uploadError) {
        console.error("Storage error:", uploadError);
        toast.error(`Upload failed: ${uploadError.message}`);
        setUploadingAvatar(false);
        return;
      }

      // Get public URL
      const { data: publicUrl } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      const avatarPublicUrl = publicUrl.publicUrl;
      console.log("Avatar URL:", avatarPublicUrl);

      // Save to database with UPSERT
      const { error: updateError } = await supabase
        .from("profiles")
        .upsert(
          {
            id: userId,
            avatar_url: avatarPublicUrl,
          },
          {
            onConflict: "id",
          }
        );

      if (updateError) {
        console.error("Database error:", updateError);
        toast.error(`Save failed: ${updateError.message}`);
        setUploadingAvatar(false);
        return;
      }

      setAvatarUrl(avatarPublicUrl);
      setInitialState(
        JSON.stringify({
          name,
          description,
          avatarUrl: avatarPublicUrl,
        })
      );

      toast.success("Avatar uploaded successfully!");
    } catch (err: any) {
      console.error("Upload error:", err);
      toast.error(`Error: ${err.message}`);
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function updateProfile() {
    if (!name.trim()) {
      toast.error("Please enter your name.");
      return;
    }

    setSaving(true);

    try {
      const { error } = await supabase.from("profiles").upsert({
        id: userId,
        name,
        description,
        avatar_url: avatarUrl,
        email,
      });

      if (error) {
        toast.error(error.message);
        setSaving(false);
        return;
      }

      setInitialState(currentState);
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  function getPasswordStrength(pwd: string) {
    if (!pwd) return { label: "", score: 0, color: "" };

    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 10) score++;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 2) return { label: "Weak", score, color: "bg-red-500" };
    if (score <= 3) return { label: "Fair", score, color: "bg-yellow-500" };
    if (score <= 4) return { label: "Good", score, color: "bg-blue-500" };
    return { label: "Strong", score, color: "bg-green-500" };
  }

  const strength = getPasswordStrength(newPassword);
  const passwordsMatch =
    confirmPassword.length > 0 && newPassword === confirmPassword;
  const passwordsMismatch =
    confirmPassword.length > 0 && newPassword !== confirmPassword;

  async function updatePassword() {
    if (!newPassword || !confirmPassword) {
      toast.error("Please fill both password fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    setUpdatingPassword(true);

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    setUpdatingPassword(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    setNewPassword("");
    setConfirmPassword("");
    toast.success("Password updated successfully.");
  }

  function formatJoinDate(dateStr: string) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  function getInitials(fullName: string, fallbackEmail: string) {
    if (fullName.trim()) {
      return fullName
        .trim()
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
    }
    return fallbackEmail?.[0]?.toUpperCase() || "U";
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="h-40 animate-pulse rounded-2xl bg-gray-100" />
        <div className="h-72 animate-pulse rounded-2xl bg-gray-100" />
        <div className="h-72 animate-pulse rounded-2xl bg-gray-100" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-24">
      {/* Profile header banner */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
        <div className="h-24 bg-gradient-to-r from-blue-600 to-blue-400" />
        <div className="flex flex-col gap-4 px-8 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-4">
            {avatarUrl ? (
              <img
                key={avatarUrl}
                src={avatarUrl}
                alt={name}
                className="-mt-10 h-20 w-20 rounded-2xl border-4 border-white object-cover shadow-md"
              />
            ) : (
              <div className="-mt-10 flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-white bg-blue-600 text-2xl font-bold text-white shadow-md">
                {getInitials(name, email)}
              </div>
            )}
            <div className="pb-1">
              <h1 className="text-xl font-bold text-gray-900">
                {name || "Unnamed User"}
              </h1>
              <p className="text-sm text-gray-500">{email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 pb-1 text-xs text-gray-400">
            <ShieldCheck size={14} className="text-green-500" />
            Member since {formatJoinDate(createdAt)}
          </div>
        </div>
      </div>

      {/* Account info section */}
      <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-100">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
            <UserCircle className="text-blue-600" size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Account Information
            </h2>
            <p className="text-sm text-gray-500">
              Update your profile information.
            </p>
          </div>
        </div>

        <div className="grid gap-5">
          {/* Avatar Upload */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700">
              <ImageIcon size={14} className="text-gray-400" />
              Profile Picture
            </label>
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={name}
                    className="h-16 w-16 rounded-lg border border-gray-200 object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-gray-200 bg-gray-100">
                    <UserCircle className="text-gray-400" size={32} />
                  </div>
                )}
              </div>
              <label className="flex-1 cursor-pointer">
                <div className="flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-200 px-4 py-6 hover:border-blue-400 hover:bg-blue-50 transition">
                  <Upload size={16} className="text-gray-400" />
                  <span className="text-sm text-gray-500">
                    {uploadingAvatar ? "Uploading..." : "Click to upload"}
                  </span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={uploadingAvatar}
                  className="hidden"
                />
              </label>
            </div>
            <p className="mt-1.5 text-xs text-gray-400">
              PNG, JPG up to 5MB. Max 1000x1000px.
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full rounded-lg border border-gray-200 p-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700">
              <FileText size={14} className="text-gray-400" />
              Bio / Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell us about yourself..."
              rows={4}
              className="w-full rounded-lg border border-gray-200 p-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700">
              Email Address
              <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-normal uppercase tracking-wide text-gray-400">
                Locked
              </span>
            </label>
            <div className="relative">
              <Mail
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="email"
                value={email}
                disabled
                className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-50 p-3 pl-10 text-sm text-gray-500"
              />
            </div>
            <p className="mt-1.5 text-xs text-gray-400">
              Contact support if you need to change your email address.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            {hasUnsavedChanges && (
              <span className="text-sm text-orange-600 font-medium">
                Unsaved changes
              </span>
            )}
            <button
              onClick={updateProfile}
              disabled={saving || !hasUnsavedChanges}
              className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>

      {/* Password section */}
      <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-100">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50">
            <Lock className="text-green-600" size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Change Password
            </h2>
            <p className="text-sm text-gray-500">
              Choose a strong password to keep your account secure.
            </p>
          </div>
        </div>

        <div className="grid gap-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full rounded-lg border border-gray-200 p-3 pr-10 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {newPassword && (
              <div className="mt-2">
                <div className="flex h-1.5 gap-1">
                  {[1, 2, 3, 4, 5].map((seg) => (
                    <div
                      key={seg}
                      className={`flex-1 rounded-full transition ${
                        seg <= strength.score
                          ? strength.color
                          : "bg-gray-200"
                      }`}
                    />
                  ))}
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Strength:{" "}
                  <span className="font-medium">{strength.label}</span>
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className={`w-full rounded-lg border p-3 pr-10 text-sm outline-none transition focus:ring-2 ${
                  passwordsMismatch
                    ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                    : "border-gray-200 focus:border-blue-500 focus:ring-blue-100"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? (
                  <EyeOff size={16} />
                ) : (
                  <Eye size={16} />
                )}
              </button>
            </div>

            {passwordsMatch && (
              <p className="mt-1.5 flex items-center gap-1 text-xs text-green-600">
                <CheckCircle2 size={13} />
                Passwords match
              </p>
            )}
            {passwordsMismatch && (
              <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500">
                <XCircle size={13} />
                Passwords do not match
              </p>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={updatePassword}
              disabled={updatingPassword}
              className="rounded-lg bg-green-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {updatingPassword ? "Updating..." : "Update Password"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
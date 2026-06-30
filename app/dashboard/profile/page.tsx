"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import {
  UserCircle,
  Mail,
  Lock,
  ShieldCheck,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const [userId, setUserId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [createdAt, setCreatedAt] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
    }

    setLoading(false);
  }

  async function updateProfile() {
    if (!name.trim()) {
      toast.error("Please enter your name.");
      return;
    }

    setSaving(true);

    const { error } = await supabase.from("profiles").upsert({
      id: userId,
      name,
      email,
    });

    setSaving(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Profile updated successfully.");
  }

  // Password strength logic
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
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Profile header banner */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
        <div className="h-24 bg-gradient-to-r from-blue-600 to-blue-400" />
        <div className="flex flex-col gap-4 px-8 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-4">
            <div className="-mt-10 flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-white bg-blue-600 text-2xl font-bold text-white shadow-md">
              {getInitials(name, email)}
            </div>
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
              Update your name and view your account email.
            </p>
          </div>
        </div>

        <div className="grid gap-5">
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

          <div className="flex justify-end pt-2">
            <button
              onClick={updateProfile}
              disabled={saving}
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
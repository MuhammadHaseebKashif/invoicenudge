"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { UserCircle } from "lucide-react";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [userId, setUserId] = useState("");

  const [name, setName] = useState("");

  const [email, setEmail] = useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

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
      alert("Please enter your name.");
      return;
    }

    setSaving(true);
        const { error } = await supabase
      .from("profiles")
      .upsert({
        id: userId,
        name,
        email,
      });

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Profile updated successfully.");
  }

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl rounded-2xl bg-white p-8 shadow-xl">
      <div className="mb-8 flex items-center gap-4">
        <UserCircle
          size={60}
          className="text-blue-600"
        />

        <div>
          <h1 className="text-3xl font-bold">
            My Profile
          </h1>

          <p className="text-gray-500">
            Update your account information.
          </p>
        </div>
      </div>

      <div className="grid gap-6">

        <div>
          <label className="mb-2 block font-semibold">
            Full Name
          </label>

          <input
            type="text"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
            className="w-full rounded-lg border p-3 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-2 block font-semibold">
            Email Address
          </label>

          <input
            type="email"
            value={email}
            disabled
            className="w-full rounded-lg border bg-gray-100 p-3"
          />
        </div>

        <button
          onClick={updateProfile}
          disabled={saving}
          className="rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:bg-gray-400"
        >
          {saving
            ? "Updating..."
            : "Update Profile"}
        </button>
      </div>

      <hr className="my-10" />
            <div>
        <h2 className="mb-6 text-2xl font-bold">
          Change Password
        </h2>

        <div className="grid gap-6">

          <div>
            <label className="mb-2 block font-semibold">
              New Password
            </label>

            <input
              type="password"
              value={newPassword}
              onChange={(e) =>
                setNewPassword(e.target.value)
              }
              className="w-full rounded-lg border p-3 focus:border-blue-500 focus:outline-none"
              placeholder="Enter new password"
            />
          </div>

          <div>
            <label className="mb-2 block font-semibold">
              Confirm Password
            </label>

            <input
              type="password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
              className="w-full rounded-lg border p-3 focus:border-blue-500 focus:outline-none"
              placeholder="Confirm new password"
            />
          </div>

          <button
            onClick={async () => {
              if (!newPassword || !confirmPassword) {
                alert("Please fill both password fields.");
                return;
              }

              if (newPassword !== confirmPassword) {
                alert("Passwords do not match.");
                return;
              }

              if (newPassword.length < 6) {
                alert("Password must be at least 6 characters.");
                return;
              }

              const { error } = await supabase.auth.updateUser({
                password: newPassword,
              });

              if (error) {
                alert(error.message);
                return;
              }

              setNewPassword("");
              setConfirmPassword("");

              alert("Password updated successfully.");
            }}
            className="rounded-lg bg-green-600 py-3 font-semibold text-white transition hover:bg-green-700"
          >
            Update Password
          </button>

        </div>
      </div>
    </div>
  );
}
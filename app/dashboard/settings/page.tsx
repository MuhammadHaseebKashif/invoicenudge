"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { Settings, Save } from "lucide-react";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [userId, setUserId] = useState("");

  const [companyName, setCompanyName] =
    useState("");

  const [companyLogo, setCompanyLogo] =
    useState("");

  const [currency, setCurrency] =
    useState("USD");

  const [defaultTone, setDefaultTone] =
    useState("friendly");

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    setUserId(user.id);

    const { data, error } = await supabase
      .from("settings")
      .select("*")
      .eq("id", user.id)
      .single();

    if (!error && data) {
      setCompanyName(
        data.company_name || ""
      );

      setCompanyLogo(
        data.company_logo || ""
      );

      setCurrency(
        data.currency || "USD"
      );

      setDefaultTone(
        data.default_tone || "friendly"
      );
    }

    setLoading(false);
  }

  async function saveSettings() {
    setSaving(true);

    const { error } = await supabase
      .from("settings")
      .upsert({
        id: userId,
        company_name: companyName,
        company_logo: companyLogo,
        currency,
        default_tone: defaultTone,
      });

    setSaving(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Settings updated successfully!");
  }

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl rounded-2xl bg-white p-8 shadow-xl">

      <div className="mb-8 flex items-center gap-4">

        <Settings
          size={50}
          className="text-blue-600"
        />

        <div>

          <h1 className="text-3xl font-bold">
            Settings
          </h1>

          <p className="text-gray-500">
            Configure your InvoiceNudge preferences.
          </p>

        </div>

      </div>

      <div className="grid gap-6 md:grid-cols-2">
                <div>
          <label className="mb-2 block font-semibold">
            Company Name
          </label>

          <input
            type="text"
            value={companyName}
            onChange={(e) =>
              setCompanyName(e.target.value)
            }
            className="w-full rounded-lg border p-3 focus:border-blue-500 focus:outline-none"
            placeholder="Enter company name"
          />
        </div>

        <div>
          <label className="mb-2 block font-semibold">
            Company Logo URL
          </label>

          <input
            type="text"
            value={companyLogo}
            onChange={(e) =>
              setCompanyLogo(e.target.value)
            }
            className="w-full rounded-lg border p-3 focus:border-blue-500 focus:outline-none"
            placeholder="https://example.com/logo.png"
          />
        </div>

        <div>
          <label className="mb-2 block font-semibold">
            Currency
          </label>

          <select
            value={currency}
            onChange={(e) =>
              setCurrency(e.target.value)
            }
            className="w-full rounded-lg border p-3 focus:border-blue-500 focus:outline-none"
          >
            <option value="USD">USD ($)</option>
            <option value="PKR">PKR (Rs)</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block font-semibold">
            Default Reminder Tone
          </label>

          <select
            value={defaultTone}
            onChange={(e) =>
              setDefaultTone(e.target.value)
            }
            className="w-full rounded-lg border p-3 focus:border-blue-500 focus:outline-none"
          >
            <option value="friendly">Friendly</option>
            <option value="formal">Formal</option>
            <option value="firm">Firm</option>
            <option value="final notice">
              Final Notice
            </option>
          </select>
        </div>

        {companyLogo && (
          <div className="md:col-span-2">
            <label className="mb-2 block font-semibold">
              Logo Preview
            </label>

            <div className="rounded-xl border bg-gray-50 p-5">

              <img
                src={companyLogo}
                alt="Company Logo"
                className="h-24 w-24 rounded-lg object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />

            </div>
          </div>
        )}

      </div>

      <div className="mt-10">

        <button
          onClick={saveSettings}
          disabled={saving}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-4 text-lg font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          <Save size={20} />

          {saving
            ? "Saving Settings..."
            : "Save Settings"}

        </button>

      </div>

    </div>
  );
}
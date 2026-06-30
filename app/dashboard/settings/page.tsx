"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import {
  Settings,
  Save,
  Building2,
  Image as ImageIcon,
  Wallet,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";

const TONES = [
  {
    value: "friendly",
    label: "Friendly",
    desc: "Warm and casual, great for first reminders.",
    sample: "Hey! Just a gentle nudge about your invoice 😊",
  },
  {
    value: "formal",
    label: "Formal",
    desc: "Professional and neutral business tone.",
    sample: "This is a reminder regarding your outstanding invoice.",
  },
  {
    value: "firm",
    label: "Firm",
    desc: "Direct and assertive, for repeated delays.",
    sample: "Your invoice is overdue. Please arrange payment promptly.",
  },
  {
    value: "final notice",
    label: "Final Notice",
    desc: "Strong, urgent — last reminder before escalation.",
    sample: "FINAL NOTICE: Immediate payment is required.",
  },
];

const CURRENCIES = [
  { value: "USD", label: "US Dollar", symbol: "$" },
  { value: "PKR", label: "Pakistani Rupee", symbol: "Rs" },
];

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [userId, setUserId] = useState("");

  const [companyName, setCompanyName] = useState("");
  const [companyLogo, setCompanyLogo] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [defaultTone, setDefaultTone] = useState("friendly");
  const [logoStatus, setLogoStatus] = useState<"idle" | "valid" | "invalid">(
    "idle"
  );

  const [initialState, setInitialState] = useState("");

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
      setCompanyName(data.company_name || "");
      setCompanyLogo(data.company_logo || "");
      setCurrency(data.currency || "USD");
      setDefaultTone(data.default_tone || "friendly");

      setInitialState(
        JSON.stringify({
          companyName: data.company_name || "",
          companyLogo: data.company_logo || "",
          currency: data.currency || "USD",
          defaultTone: data.default_tone || "friendly",
        })
      );
    }

    setLoading(false);
  }

  const currentState = JSON.stringify({
    companyName,
    companyLogo,
    currency,
    defaultTone,
  });
  const hasUnsavedChanges = initialState && currentState !== initialState;

  async function saveSettings() {
    setSaving(true);

    const { error } = await supabase.from("settings").upsert({
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

    setInitialState(currentState);
    toast.success("Settings updated successfully!");
  }

  const selectedTone = TONES.find((t) => t.value === defaultTone);
  const selectedCurrency = CURRENCIES.find((c) => c.value === currency);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="h-28 animate-pulse rounded-2xl bg-gray-100" />
        <div className="h-64 animate-pulse rounded-2xl bg-gray-100" />
        <div className="h-64 animate-pulse rounded-2xl bg-gray-100" />
        <div className="h-48 animate-pulse rounded-2xl bg-gray-100" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center gap-4 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-100">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50">
          <Settings className="text-blue-600" size={26} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500">
            Configure your InvoiceNudge preferences and branding.
          </p>
        </div>
      </div>

      {/* Company info */}
      <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-100">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50">
            <Building2 className="text-purple-600" size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Company Information
            </h2>
            <p className="text-sm text-gray-500">
              This appears on reminder emails sent to your clients.
            </p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Company Name
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Acme Studio"
              className="w-full rounded-lg border border-gray-200 p-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700">
              <ImageIcon size={14} className="text-gray-400" />
              Company Logo URL
            </label>
            <input
              type="text"
              value={companyLogo}
              onChange={(e) => {
                setCompanyLogo(e.target.value);
                setLogoStatus("idle");
              }}
              placeholder="https://example.com/logo.png"
              className="w-full rounded-lg border border-gray-200 p-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        {companyLogo && (
          <div className="mt-5">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Logo Preview
            </label>
            <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-gray-50 p-5">
              <img
                src={companyLogo}
                alt="Company Logo"
                className="h-20 w-20 rounded-lg border border-gray-200 bg-white object-contain p-1"
                onLoad={() => setLogoStatus("valid")}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  setLogoStatus("invalid");
                }}
              />
              <div className="text-sm">
                {logoStatus === "valid" && (
                  <p className="flex items-center gap-1.5 font-medium text-green-600">
                    <CheckCircle2 size={15} />
                    Logo loaded successfully
                  </p>
                )}
                {logoStatus === "invalid" && (
                  <p className="flex items-center gap-1.5 font-medium text-red-500">
                    <AlertCircle size={15} />
                    Couldn&apos;t load image from this URL
                  </p>
                )}
                {logoStatus === "idle" && (
                  <p className="text-gray-400">
                    This logo will appear in client-facing emails.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Currency */}
      <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-100">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50">
            <Wallet className="text-green-600" size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Currency</h2>
            <p className="text-sm text-gray-500">
              Used across invoices, reminders, and reports.
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {CURRENCIES.map((curr) => (
            <button
              key={curr.value}
              onClick={() => setCurrency(curr.value)}
              className={`flex items-center justify-between rounded-xl border p-4 text-left transition ${
                currency === curr.value
                  ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {curr.label}
                </p>
                <p className="text-xs text-gray-500">
                  Symbol: {curr.symbol}
                </p>
              </div>
              {currency === curr.value && (
                <CheckCircle2 className="text-blue-600" size={20} />
              )}
            </button>
          ))}
        </div>

        {selectedCurrency && (
          <p className="mt-4 text-xs text-gray-400">
            Example: invoices will show as{" "}
            <span className="font-medium text-gray-600">
              {selectedCurrency.symbol}1,250.00
            </span>
          </p>
        )}
      </div>

      {/* Default tone */}
      <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-100">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50">
            <MessageSquare className="text-orange-600" size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Default Reminder Tone
            </h2>
            <p className="text-sm text-gray-500">
              Applied by default to new invoices — can be changed per invoice.
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {TONES.map((tone) => (
            <button
              key={tone.value}
              onClick={() => setDefaultTone(tone.value)}
              className={`rounded-xl border p-4 text-left transition ${
                defaultTone === tone.value
                  ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-900">
                  {tone.label}
                </p>
                {defaultTone === tone.value && (
                  <CheckCircle2 className="text-blue-600" size={18} />
                )}
              </div>
              <p className="mt-1 text-xs text-gray-500">{tone.desc}</p>
            </button>
          ))}
        </div>

        {selectedTone && (
          <div className="mt-5 rounded-lg border border-gray-100 bg-gray-50 p-4">
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-400">
              Preview
            </p>
            <p className="text-sm italic text-gray-600">
              &ldquo;{selectedTone.sample}&rdquo;
            </p>
          </div>
        )}
      </div>

      {/* Sticky save bar */}
      <div className="sticky bottom-6 z-10">
        <div className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-lg ring-1 ring-gray-200">
          <p className="text-sm text-gray-500">
            {hasUnsavedChanges ? (
              <span className="flex items-center gap-1.5 font-medium text-orange-500">
                <AlertCircle size={14} />
                You have unsaved changes
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-gray-400">
                <CheckCircle2 size={14} />
                All changes saved
              </span>
            )}
          </p>

          <button
            onClick={saveSettings}
            disabled={saving || !hasUnsavedChanges}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            <Save size={16} />
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>
    </div>
  );
}
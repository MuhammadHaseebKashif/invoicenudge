"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { Mail, Send, Calendar, User, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

interface Invoice {
  id: number;
  client_name: string;
  client_email: string;
  amount: number;
  due_date: string;
  status: string;
  tone: string;
}

export default function RemindersPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState<number | null>(null);
  const [currency, setCurrency] = useState("USD");

  useEffect(() => {
    loadInvoices();
    loadCurrency();
  }, []);

  async function loadCurrency() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data } = await supabase
      .from("settings")
      .select("currency")
      .eq("id", user.id)
      .single();

    if (data?.currency) {
      setCurrency(data.currency);
    }
  }

  async function loadInvoices() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("invoices")
      .select("*")
      .eq("user_id", user.id)
      .neq("status", "paid")
      .order("due_date", { ascending: true });

    if (error) {
      toast.error(error.message);
    } else {
      setInvoices(data || []);
    }

    setLoading(false);
  }

  function formatAmount(amount: number) {
    const symbol = currency === "PKR" ? "Rs " : "$";
    return `${symbol}${amount.toLocaleString()}`;
  }

  function isOverdue(dueDate: string) {
    return new Date(dueDate) < new Date(new Date().toDateString());
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  async function sendReminder(invoice: Invoice) {
    setSending(invoice.id);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("User not logged in.");
      setSending(null);
      return;
    }

    const symbol = currency === "PKR" ? "Rs " : "$";
    const subject = `Payment Reminder - Invoice #${invoice.id}`;

    const message = `Dear ${invoice.client_name},

This is a reminder regarding your invoice.

Invoice Amount: ${symbol}${invoice.amount}

Due Date: ${invoice.due_date}

Please make your payment as soon as possible.

Thank you.`;

    const { error } = await supabase.from("reminder_logs").insert([
      {
        invoice_id: invoice.id,
        user_id: user.id,
        client_name: invoice.client_name,
        client_email: invoice.client_email,
        subject,
        message,
        status: "Sent",
        sent_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      setSending(null);
      toast.error(error.message);
      return;
    }

    const response = await fetch("/api/send-reminder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: invoice.client_email,
        clientName: invoice.client_name,
        amount: invoice.amount,
        dueDate: invoice.due_date,
        tone: invoice.tone,
        currency,
      }),
    });

    const result = await response.json();
    setSending(null);

    if (!response.ok) {
      toast.error(result.error || "Email sending failed.");
      return;
    }

    toast.success("Reminder email sent successfully!");
    loadInvoices();
  }

  const overdueCount = invoices.filter((i) => isOverdue(i.due_date)).length;

  return (
    <div className="rounded-xl bg-white p-8 shadow-sm ring-1 ring-gray-100">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 border-b border-gray-100 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
            <Mail className="text-blue-600" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Send Reminders
            </h1>
            <p className="text-sm text-gray-500">
              Follow up with clients on pending invoices.
            </p>
          </div>
        </div>

        {!loading && invoices.length > 0 && (
          <div className="flex gap-3">
            <div className="rounded-lg bg-gray-50 px-4 py-2 text-sm">
              <span className="font-semibold text-gray-900">
                {invoices.length}
              </span>{" "}
              <span className="text-gray-500">pending</span>
            </div>
            {overdueCount > 0 && (
              <div className="rounded-lg bg-red-50 px-4 py-2 text-sm">
                <span className="font-semibold text-red-600">
                  {overdueCount}
                </span>{" "}
                <span className="text-red-500">overdue</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Loading */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-xl bg-gray-100"
            />
          ))}
        </div>
      ) : invoices.length === 0 ? (
        /* Empty state */
        <div className="rounded-xl border-2 border-dashed border-gray-200 py-16 text-center">
          <Mail size={56} className="mx-auto mb-4 text-gray-300" />
          <h2 className="text-lg font-semibold text-gray-800">
            No Pending Invoices
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            All invoices are already paid. Nice work.
          </p>
        </div>
      ) : (
        /* Invoice list */
        <div className="space-y-4">
          {invoices.map((invoice) => {
            const overdue = isOverdue(invoice.due_date);

            return (
              <div
                key={invoice.id}
                className={`flex flex-col justify-between gap-5 rounded-xl border p-5 transition hover:shadow-md lg:flex-row lg:items-center ${
                  overdue
                    ? "border-red-200 bg-red-50/40"
                    : "border-gray-200 bg-white"
                }`}
              >
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900">
                      <User size={16} className="text-gray-400" />
                      {invoice.client_name}
                    </h2>

                    {overdue && (
                      <span className="flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">
                        <AlertCircle size={12} />
                        Overdue
                      </span>
                    )}
                  </div>

                  <p className="mt-0.5 text-sm text-gray-500">
                    {invoice.client_email}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-600">
                    <span className="font-semibold text-gray-900">
                      {formatAmount(invoice.amount)}
                    </span>

                    <span className="flex items-center gap-1.5">
                      <Calendar size={14} className="text-gray-400" />
                      {formatDate(invoice.due_date)}
                    </span>

                    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium capitalize text-gray-600">
                      {invoice.status}
                    </span>

                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium capitalize text-blue-600">
                      {invoice.tone} tone
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => sendReminder(invoice)}
                  disabled={sending === invoice.id}
                  className="flex shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  {sending === invoice.id ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Send Reminder
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
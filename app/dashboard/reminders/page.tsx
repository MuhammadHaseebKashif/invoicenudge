"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { Mail, Send, Calendar, User } from "lucide-react";
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
      .order("due_date", {
        ascending: true,
      });

    if (error) {
      toast.error(error.message);
    } else {
      setInvoices(data || []);
    }

    setLoading(false);
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

    const symbol =
      currency === "PKR" ? "Rs " : "$";

    const subject = `Payment Reminder - Invoice #${invoice.id}`;

    const message = `Dear ${invoice.client_name},

This is a reminder regarding your invoice.

Invoice Amount: ${symbol}${invoice.amount}

Due Date: ${invoice.due_date}

Please make your payment as soon as possible.

Thank you.`;
    // Save reminder log
    const { error } = await supabase
      .from("reminder_logs")
      .insert([
        {
          invoice_id: invoice.id,
          user_id: user.id,
          client_name: invoice.client_name,
          client_email: invoice.client_email,
          subject,
          message,
        },
      ]);

    if (error) {
      setSending(null);
      toast.error(error.message);
      return;
    }

    // Send email
    const response = await fetch("/api/send-reminder", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
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

  return (
    <div className="rounded-xl bg-white p-8 shadow-lg">

      <div className="mb-8 flex items-center gap-3">
        <Mail className="text-blue-600" size={34} />

        <div>
          <h1 className="text-3xl font-bold">
            Send Reminders
          </h1>

          <p className="text-gray-500">
            Send payment reminders to clients with pending invoices.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>

          <p className="mt-4 text-gray-500">
            Loading invoices...
          </p>
        </div>
      ) : invoices.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-300 py-16 text-center">

          <Mail
            size={70}
            className="mx-auto mb-5 text-gray-300"
          />

          <h2 className="text-2xl font-bold">
            No Pending Invoices
          </h2>

          <p className="mt-2 text-gray-500">
            All invoices are already paid.
          </p>

        </div>
      ) : (
        <div className="space-y-5">

          {invoices.map((invoice) => (

            <div
              key={invoice.id}
              className="flex flex-col justify-between gap-6 rounded-xl border p-6 transition hover:shadow-lg lg:flex-row lg:items-center"
            >

              <div className="flex-1">

                <h2 className="flex items-center gap-2 text-xl font-bold">
                  <User
                    size={20}
                    className="text-blue-600"
                  />
                  {invoice.client_name}
                </h2>

                <p className="mt-1 text-gray-500">
                  {invoice.client_email}
                </p>

                <div className="mt-4 flex flex-wrap gap-5 text-sm text-gray-600">

                  <span>
                    💰 {currency === "PKR"
                      ? `Rs ${invoice.amount}`
                      : `$${invoice.amount}`}
                  </span>

                  <span className="flex items-center gap-1">
                    <Calendar size={15} />
                    {invoice.due_date}
                  </span>

                  <span className="capitalize">
                    Status:
                    <strong className="ml-1">
                      {invoice.status}
                    </strong>
                  </span>

                  <span className="capitalize">
                    Tone:
                    <strong className="ml-1">
                      {invoice.tone}
                    </strong>
                  </span>

                </div>

              </div>

              <button
                onClick={() => sendReminder(invoice)}
                disabled={sending === invoice.id}
                className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
              >

                <Send size={18} />

                {sending === invoice.id
                  ? "Sending..."
                  : "Send Reminder"}

              </button>

            </div>

          ))}

        </div>
      )}

    </div>
  );
}
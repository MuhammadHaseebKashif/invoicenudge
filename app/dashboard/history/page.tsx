"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { History, Search, Mail, Calendar, Inbox } from "lucide-react";

interface ReminderLog {
  id: number;
  invoice_id: number;
  client_name: string;
  client_email: string;
  subject: string;
  message: string;
  status: string;
  sent_at: string;
  created_at: string;
}

export default function ReminderHistoryPage() {
  const [logs, setLogs] = useState<ReminderLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchReminderLogs();
  }, []);

  async function fetchReminderLogs() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("reminder_logs")
      .select("*")
      .eq("user_id", user.id)
      .order("sent_at", { ascending: false });

    if (error) {
      alert(error.message);
    } else {
      setLogs(data || []);
    }

    setLoading(false);
  }

  const filteredLogs = useMemo(() => {
    return logs.filter(
      (log) =>
        log.client_name.toLowerCase().includes(search.toLowerCase()) ||
        log.client_email.toLowerCase().includes(search.toLowerCase()) ||
        log.subject.toLowerCase().includes(search.toLowerCase())
    );
  }, [logs, search]);

  const sentCount = logs.filter((l) => l.status === "Sent").length;
  const failedCount = logs.filter((l) => l.status !== "Sent").length;

  function formatDate(dateStr: string | null) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  return (
    <div className="rounded-xl bg-white p-8 shadow-sm ring-1 ring-gray-100">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
            <History className="text-blue-600" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Reminder History
            </h1>
            <p className="text-sm text-gray-500">
              All reminders sent to your clients.
            </p>
          </div>
        </div>

        <div className="relative w-full lg:w-80">
          <Search
            size={17}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search by name, email, or subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-100 bg-gray-50 p-5">
          <p className="text-sm text-gray-500">Total Reminders</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">
            {logs.length}
          </p>
        </div>
        <div className="rounded-xl border border-green-100 bg-green-50 p-5">
          <p className="text-sm text-green-700">Successfully Sent</p>
          <p className="mt-1 text-3xl font-bold text-green-600">
            {sentCount}
          </p>
        </div>
        <div className="rounded-xl border border-red-100 bg-red-50 p-5">
          <p className="text-sm text-red-700">Failed</p>
          <p className="mt-1 text-3xl font-bold text-red-600">
            {failedCount}
          </p>
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-14 animate-pulse rounded-lg bg-gray-100" />
          ))}
        </div>
      ) : filteredLogs.length === 0 ? (
        /* Empty state */
        <div className="rounded-xl border-2 border-dashed border-gray-200 py-16 text-center">
          {search ? (
            <>
              <Search size={56} className="mx-auto mb-4 text-gray-300" />
              <h2 className="text-lg font-semibold text-gray-800">
                No matching results
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Try a different search term.
              </p>
            </>
          ) : (
            <>
              <Inbox size={56} className="mx-auto mb-4 text-gray-300" />
              <h2 className="text-lg font-semibold text-gray-800">
                No Reminder History
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                You haven&apos;t sent any reminders yet.
              </p>
            </>
          )}
        </div>
      ) : (
        /* Table */
        <div className="overflow-hidden rounded-xl border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-3.5 text-left font-medium text-gray-500">
                    Client
                  </th>
                  <th className="px-5 py-3.5 text-left font-medium text-gray-500">
                    Email
                  </th>
                  <th className="px-5 py-3.5 text-left font-medium text-gray-500">
                    Subject
                  </th>
                  <th className="px-5 py-3.5 text-left font-medium text-gray-500">
                    Status
                  </th>
                  <th className="px-5 py-3.5 text-left font-medium text-gray-500">
                    Sent At
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="transition hover:bg-gray-50"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50">
                          <Mail size={14} className="text-blue-600" />
                        </div>
                        <span className="font-medium text-gray-900">
                          {log.client_name}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-gray-500">
                      {log.client_email}
                    </td>

                    <td className="max-w-xs truncate px-5 py-4 text-gray-600">
                      {log.subject}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                          log.status === "Sent"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} className="text-gray-400" />
                        {formatDate(log.sent_at)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { History, Search, Mail, Calendar } from "lucide-react";

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
      .order("sent_at", {
        ascending: false,
      });

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
        log.client_name
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        log.client_email
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        log.subject
          .toLowerCase()
          .includes(search.toLowerCase())
    );
  }, [logs, search]);
    return (
    <div className="rounded-xl bg-white p-8 shadow-lg">

      {/* Header */}

      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

        <div className="flex items-center gap-3">

          <History
            size={36}
            className="text-blue-600"
          />

          <div>

            <h1 className="text-3xl font-bold">
              Reminder History
            </h1>

            <p className="text-gray-500">
              View all reminders sent to your clients.
            </p>

          </div>

        </div>

        <div className="relative w-full lg:w-80">

          <Search
            size={18}
            className="absolute left-3 top-4 text-gray-400"
          />

          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="w-full rounded-lg border py-3 pl-10 pr-4 outline-none focus:border-blue-500"
          />

        </div>

      </div>

      {/* Stats */}

      <div className="mb-8 rounded-xl bg-blue-50 p-6">

        <h2 className="text-xl font-semibold">
          Total Reminders Sent
        </h2>

        <p className="mt-2 text-4xl font-bold text-blue-600">
          {filteredLogs.length}
        </p>

      </div>

      {loading ? (

        <div className="py-16 text-center">

          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>

          <p className="mt-4 text-gray-500">
            Loading reminder history...
          </p>

        </div>

      ) : filteredLogs.length === 0 ? (

        <div className="rounded-xl border-2 border-dashed border-gray-300 py-16 text-center">

          <History
            size={70}
            className="mx-auto mb-5 text-gray-300"
          />

          <h2 className="text-2xl font-bold">
            No Reminder History
          </h2>

          <p className="mt-2 text-gray-500">
            You haven't sent any reminders yet.
          </p>

        </div>

      ) : (

        <div className="overflow-x-auto rounded-xl border">

          <table className="w-full">

            <thead className="bg-gray-100">

              <tr>

                <th className="px-5 py-4 text-left">
                  Client
                </th>

                <th>Email</th>

                <th>Subject</th>

                <th>Status</th>

                <th>Sent At</th>

              </tr>

            </thead>

            <tbody>
                              {filteredLogs.map((log) => (

                <tr
                  key={log.id}
                  className="border-t hover:bg-gray-50"
                >

                  <td className="px-5 py-4 font-semibold">

                    <div className="flex items-center gap-2">

                      <Mail
                        size={18}
                        className="text-blue-600"
                      />

                      {log.client_name}

                    </div>

                  </td>

                  <td>{log.client_email}</td>

                  <td>{log.subject}</td>

                  <td>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold text-white ${
                        log.status === "Sent"
                          ? "bg-green-500"
                          : "bg-red-500"
                      }`}
                    >
                      {log.status}
                    </span>

                  </td>

                  <td>

                    <div className="flex items-center gap-2">

                      <Calendar
                        size={16}
                        className="text-gray-500"
                      />

                      {log.sent_at
                        ? new Date(
                            log.sent_at
                          ).toLocaleString()
                        : "-"}

                    </div>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      )}

    </div>
  );
}
            
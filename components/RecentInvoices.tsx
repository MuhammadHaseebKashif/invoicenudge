"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabase";

interface Invoice {
  id: number;
  client_name: string;
  client_email: string;
  amount: number;
  due_date: string;
  status: string;
}

export default function RecentInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoices();
  }, []);

  async function fetchInvoices() {
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
      .order("id", { ascending: false })
      .limit(5);

    if (!error && data) {
      setInvoices(data);
    }

    setLoading(false);
  }

  return (
    <div className="rounded-xl bg-white p-6 shadow-md">

      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          Recent Invoices
        </h2>

        <Link
          href="/dashboard/invoices"
          className="rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
        >
          View All
        </Link>
      </div>

      {loading ? (
        <div className="py-10 text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>

          <p className="mt-4 text-gray-500">
            Loading...
          </p>
        </div>
      ) : invoices.length === 0 ? (
        <div className="py-12 text-center">

          <h3 className="text-xl font-semibold">
            No invoices found
          </h3>

          <p className="mt-2 text-gray-500">
            Create your first invoice.
          </p>

        </div>
      ) : (
        <table className="w-full">

          <thead>

            <tr className="border-b text-left">

              <th className="pb-4">Client</th>

              <th className="pb-4">Email</th>

              <th className="pb-4">Amount</th>

              <th className="pb-4">Status</th>

              <th className="pb-4">Due Date</th>

            </tr>

          </thead>

          <tbody>

            {invoices.map((invoice) => (

              <tr
                key={invoice.id}
                className="border-b hover:bg-gray-50"
              >

                <td className="py-4 font-medium">
                  {invoice.client_name}
                </td>

                <td>{invoice.client_email}</td>

                <td>${invoice.amount}</td>

                <td>

                  <span
                    className={`rounded-full px-3 py-1 text-sm text-white ${
                      invoice.status === "paid"
                        ? "bg-green-500"
                        : invoice.status === "pending"
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                  >
                    {invoice.status}
                  </span>

                </td>

                <td>{invoice.due_date}</td>

              </tr>

            ))}

          </tbody>

        </table>
      )}

    </div>
  );
}
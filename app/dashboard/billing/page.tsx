"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../lib/supabase";
import BillingStats from "../../../components/BillingStats";
import BillingChart from "../../../components/BillingChart";

interface Invoice {
  id: number;
  amount: number;
  status: string;
  due_date: string;
}

export default function BillingPage() {
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    loadBilling();
  }, []);

  async function loadBilling() {
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
      .eq("user_id", user.id);

    if (!error && data) {
      setInvoices(data);
    }

    setLoading(false);
  }

  const totalRevenue = invoices.reduce(
    (sum, invoice) => sum + Number(invoice.amount),
    0
  );

  const paidInvoices = invoices.filter(
    (i) => i.status === "paid"
  ).length;

  const pendingInvoices = invoices.filter(
    (i) => i.status === "pending"
  ).length;

  const overdueInvoices = invoices.filter(
    (i) => i.status === "overdue"
  ).length;

  const chartData = useMemo(() => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const revenue = new Array(12).fill(0);

    invoices.forEach((invoice) => {
      const month = new Date(invoice.due_date).getMonth();

      revenue[month] += Number(invoice.amount);
    });

    return months.map((month, index) => ({
      month,
      amount: revenue[index],
    }));
  }, [invoices]);
    function exportCSV() {
    const rows = [
      ["ID", "Amount", "Status", "Due Date"],
      ...invoices.map((invoice) => [
        invoice.id,
        invoice.amount,
        invoice.status,
        invoice.due_date,
      ]),
    ];

    const csv = rows.map((row) => row.join(",")).join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "billing-report.csv";

    link.click();
  }

  return (
    <div className="space-y-8">

      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">

        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Billing Dashboard
          </h1>

          <p className="mt-2 text-gray-500">
            Revenue analytics and invoice summary.
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
        >
          Export CSV
        </button>

      </div>

      {loading ? (

        <div className="rounded-xl bg-white p-10 text-center shadow">
          Loading Billing...
        </div>

      ) : (

        <>
          <BillingStats
            totalRevenue={totalRevenue}
            paid={paidInvoices}
            pending={pendingInvoices}
            overdue={overdueInvoices}
          />

          <BillingChart
            data={chartData}
          />

          <div className="rounded-xl bg-white p-6 shadow">

            <h2 className="mb-6 text-2xl font-bold">
              Invoice Summary
            </h2>

            {invoices.length === 0 ? (

              <div className="py-12 text-center text-gray-500">
                No invoices found.
              </div>

            ) : (

              <table className="w-full">

                <thead>

                  <tr className="border-b">

                    <th className="py-3 text-left">
                      Invoice ID
                    </th>

                    <th className="text-left">
                      Amount
                    </th>

                    <th className="text-left">
                      Status
                    </th>

                    <th className="text-left">
                      Due Date
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {invoices.map((invoice) => (

                    <tr
                      key={invoice.id}
                      className="border-b hover:bg-gray-50"
                    >

                      <td className="py-4">
                        #{invoice.id}
                      </td>

                      <td>
                        ${invoice.amount}
                      </td>

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

                      <td>
                        {invoice.due_date}
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            )}

          </div>

        </>

      )}

    </div>
  );
}   

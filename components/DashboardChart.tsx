"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function DashboardChart() {

  const [loading, setLoading] = useState(true);

  const [data, setData] = useState([
    { month: "Jan", value: 0 },
    { month: "Feb", value: 0 },
    { month: "Mar", value: 0 },
    { month: "Apr", value: 0 },
    { month: "May", value: 0 },
    { month: "Jun", value: 0 },
    { month: "Jul", value: 0 },
    { month: "Aug", value: 0 },
    { month: "Sep", value: 0 },
    { month: "Oct", value: 0 },
    { month: "Nov", value: 0 },
    { month: "Dec", value: 0 },
  ]);

  useEffect(() => {
    fetchRevenue();
  }, []);

  async function fetchRevenue() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data: invoices } = await supabase
      .from("invoices")
      .select("amount,due_date")
      .eq("user_id", user.id);

    if (!invoices) {
      setLoading(false);
      return;
    }

    const months = [
      { month: "Jan", value: 0 },
      { month: "Feb", value: 0 },
      { month: "Mar", value: 0 },
      { month: "Apr", value: 0 },
      { month: "May", value: 0 },
      { month: "Jun", value: 0 },
      { month: "Jul", value: 0 },
      { month: "Aug", value: 0 },
      { month: "Sep", value: 0 },
      { month: "Oct", value: 0 },
      { month: "Nov", value: 0 },
      { month: "Dec", value: 0 },
    ];

    invoices.forEach((invoice: any) => {
      const month = new Date(invoice.due_date).getMonth();
      months[month].value += Number(invoice.amount);
    });

    setData(months);
    setLoading(false);
  }

  const max = Math.max(...data.map((d) => d.value), 1);
    return (
    <div className="rounded-xl bg-white p-6 shadow-md">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Monthly Revenue
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Revenue generated from invoices
          </p>
        </div>

        <div className="rounded-lg bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600">
          {new Date().getFullYear()}
        </div>
      </div>

      {loading ? (
        <div className="flex h-72 items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        </div>
      ) : (
        <div className="flex h-72 items-end justify-between gap-2">

          {data.map((item) => (
            <div
              key={item.month}
              className="flex flex-1 flex-col items-center"
            >
              <span className="mb-2 text-xs font-semibold text-gray-600">
                ${item.value}
              </span>

              <div
                className="w-full rounded-t-xl bg-blue-600 transition-all duration-300 hover:bg-blue-700"
                style={{
                  height: `${(item.value / max) * 220}px`,
                  minHeight: "8px",
                }}
              />

              <p className="mt-3 text-sm font-semibold text-gray-700">
                {item.month}
              </p>
            </div>
          ))}

        </div>
      )}
    </div>
  );
}
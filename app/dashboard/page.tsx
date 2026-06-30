"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

import StatCard from "../../components/StatCard";
import RecentInvoices from "../../components/RecentInvoices";
import QuickActions from "../../components/QuickActions";
import DashboardChart from "../../components/DashboardChart";

import {
  FileText,
  Clock3,
  CircleDollarSign,
  AlertTriangle,
} from "lucide-react";

export default function Dashboard() {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    paid: 0,
    overdue: 0,
  });

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from("invoices")
      .select("*")
      .eq("user_id", user.id);

    if (error) {
      console.log(error.message);
      return;
    }

    setStats({
      total: data.length,
      pending: data.filter((i) => i.status === "pending").length,
      paid: data.filter((i) => i.status === "paid").length,
      overdue: data.filter((i) => i.status === "overdue").length,
    });
  }

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Dashboard
          </h1>

          <p className="mt-2 text-gray-500">
            Welcome back 👋
          </p>
        </div>

        <Link
          href="/dashboard/new"
          className="rounded-lg bg-blue-600 px-5 py-3 text-white hover:bg-blue-700"
        >
          + Add Invoice
        </Link>
      </div>

      <div className="mb-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">

        <StatCard
          title="Total Invoices"
          value={stats.total.toString()}
          icon={FileText}
          color="bg-blue-500"
        />

        <StatCard
          title="Pending"
          value={stats.pending.toString()}
          icon={Clock3}
          color="bg-yellow-500"
        />

        <StatCard
          title="Paid"
          value={stats.paid.toString()}
          icon={CircleDollarSign}
          color="bg-green-500"
        />

        <StatCard
          title="Overdue"
          value={stats.overdue.toString()}
          icon={AlertTriangle}
          color="bg-red-500"
        />

      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-3">

        <div className="lg:col-span-2">
          <DashboardChart />
        </div>

        <QuickActions />

      </div>

      <RecentInvoices />

    </>
  );
}
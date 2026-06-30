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

type Stats = {
  total: number;
  pending: number;
  paid: number;
  overdue: number;
};

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You need to be signed in to view this dashboard.");
      return;
    }

    const { data, error: fetchError } = await supabase
      .from("invoices")
      .select("*")
      .eq("user_id", user.id);

    if (fetchError) {
      setError("Couldn't load your invoices. Please try again.");
      return;
    }

    setStats({
      total: data.length,
      pending: data.filter((i) => i.status === "pending").length,
      paid: data.filter((i) => i.status === "paid").length,
      overdue: data.filter((i) => i.status === "overdue").length,
    });
  }

  const isLoading = stats === null && !error;

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-gray-500">
            Here&apos;s an overview of your invoices.
          </p>
        </div>

        <Link
          href="/dashboard/new"
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
        >
          + Add Invoice
        </Link>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
          <button
            onClick={loadDashboard}
            className="ml-3 font-medium underline underline-offset-2"
          >
            Retry
          </button>
        </div>
      )}

      <div className="mb-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Invoices"
          value={isLoading ? "—" : stats!.total.toString()}
          icon={FileText}
          color="bg-blue-500"
          loading={isLoading}
        />
        <StatCard
          title="Pending"
          value={isLoading ? "—" : stats!.pending.toString()}
          icon={Clock3}
          color="bg-yellow-500"
          loading={isLoading}
        />
        <StatCard
          title="Paid"
          value={isLoading ? "—" : stats!.paid.toString()}
          icon={CircleDollarSign}
          color="bg-green-500"
          loading={isLoading}
        />
        <StatCard
          title="Overdue"
          value={isLoading ? "—" : stats!.overdue.toString()}
          icon={AlertTriangle}
          color="bg-red-500"
          loading={isLoading}
        />
      </div>

      {!isLoading && stats?.total === 0 ? (
        <div className="mb-8 rounded-xl border border-dashed border-gray-300 bg-white py-16 text-center">
          <FileText className="mx-auto mb-3 h-10 w-10 text-gray-300" />
          <h3 className="text-base font-medium text-gray-700">
            No invoices yet
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Create your first invoice to start tracking payments.
          </p>
          <Link
            href="/dashboard/new"
            className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            + Add Invoice
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-8 grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <DashboardChart />
            </div>
            <QuickActions />
          </div>

          <RecentInvoices />
        </>
      )}
    </>
  );
}
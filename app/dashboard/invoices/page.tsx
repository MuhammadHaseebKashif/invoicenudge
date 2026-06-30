"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "../../../lib/supabase";
import {
  Pencil,
  Trash2,
  CheckCircle,
  Download,
  Plus,
  Search,
  Eye,
} from "lucide-react";

interface Invoice {
  id: number;
  client_name: string;
  client_email: string;
  amount: number;
  due_date: string;
  status: string;
  tone: string;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("none");

  // ✅ Currency from Settings
  const [currency, setCurrency] = useState("USD");

  useEffect(() => {
    fetchInvoices();
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
      .order("id", { ascending: false });

    if (error) {
      alert(error.message);
    } else {
      setInvoices(data || []);
    }

    setLoading(false);
  }

  async function markAsPaid(id: number) {
    const { error } = await supabase
      .from("invoices")
      .update({ status: "paid" })
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    fetchInvoices();
  }

  async function deleteInvoice(id: number) {
    if (!confirm("Delete this invoice?")) return;

    const { error } = await supabase
      .from("invoices")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    fetchInvoices();
  }

  function exportCSV(data: Invoice[]) {
    const headers = [
      "Client",
      "Email",
      "Amount",
      "Due Date",
      "Status",
      "Tone",
    ];

    const rows = data.map((invoice) => [
      invoice.client_name,
      invoice.client_email,
      invoice.amount,
      invoice.due_date,
      invoice.status,
      invoice.tone,
    ]);

    const csv =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows]
        .map((row) => row.join(","))
        .join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csv);
    link.download = "Invoices.csv";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const filteredInvoices = useMemo(() => {
    let data = [...invoices];

    if (search) {
      data = data.filter(
        (invoice) =>
          invoice.client_name
            .toLowerCase()
            .includes(search.toLowerCase()) ||
          invoice.client_email
            .toLowerCase()
            .includes(search.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      data = data.filter(
        (invoice) =>
          invoice.status === statusFilter
      );
    }

    if (sortBy === "amount") {
      data.sort((a, b) => a.amount - b.amount);
    }

    if (sortBy === "due") {
      data.sort(
        (a, b) =>
          new Date(a.due_date).getTime() -
          new Date(b.due_date).getTime()
      );
    }

    return data;
  }, [invoices, search, statusFilter, sortBy]);
  return (
  <div className="rounded-2xl bg-white p-8 shadow-lg">

    {/* Header */}
    <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          All Invoices
        </h1>

        <p className="mt-2 text-gray-500">
          Manage, edit and track your invoices.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">

        <button
          onClick={() => exportCSV(filteredInvoices)}
          className="flex items-center gap-2 rounded-lg bg-green-600 px-5 py-3 text-white hover:bg-green-700"
        >
          <Download size={18} />
          Export CSV
        </button>

        <Link
          href="/dashboard/new"
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-white hover:bg-blue-700"
        >
          <Plus size={18} />
          Add Invoice
        </Link>

      </div>

    </div>

    {/* Filters */}

    <div className="mb-8 grid gap-4 md:grid-cols-3">

      <div className="relative">

        <Search
          size={18}
          className="absolute left-3 top-4 text-gray-400"
        />

        <input
          type="text"
          placeholder="Search invoices..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border py-3 pl-10 pr-4 focus:border-blue-500 focus:outline-none"
        />

      </div>

      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="rounded-lg border p-3"
      >
        <option value="all">All Status</option>
        <option value="pending">Pending</option>
        <option value="paid">Paid</option>
        <option value="overdue">Overdue</option>
      </select>

      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
        className="rounded-lg border p-3"
      >
        <option value="none">No Sorting</option>
        <option value="amount">Sort by Amount</option>
        <option value="due">Sort by Due Date</option>
      </select>

    </div>

    {loading ? (

      <div className="py-20 text-center">

        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>

        <p className="mt-5 text-gray-500">
          Loading invoices...
        </p>

      </div>

    ) : filteredInvoices.length === 0 ? (

      <div className="rounded-xl border-2 border-dashed border-gray-300 py-20 text-center">

        <h2 className="text-2xl font-bold">
          No Invoices Found
        </h2>

        <p className="mt-2 text-gray-500">
          Create your first invoice.
        </p>

        <Link
          href="/dashboard/new"
          className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
        >
          Add Invoice
        </Link>

      </div>

    ) : (

      <div className="overflow-x-auto rounded-xl border">

        <table className="w-full">

          <thead className="bg-gray-100">

            <tr>

              <th className="px-4 py-4 text-left">Client</th>
              <th>Email</th>
              <th>Amount</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Tone</th>
              <th className="text-center">Actions</th>

            </tr>

          </thead>

          <tbody>
            {filteredInvoices.map((invoice) => (

  <tr
    key={invoice.id}
    className="border-t hover:bg-gray-50"
  >

    <td className="px-4 py-4 font-medium">
      {invoice.client_name}
    </td>

    <td>{invoice.client_email}</td>

    <td className="font-semibold text-green-600">
      {currency === "PKR"
        ? `Rs ${invoice.amount}`
        : `$${invoice.amount}`}
    </td>

    <td>{invoice.due_date}</td>

    <td>

      <span
        className={`rounded-full px-3 py-1 text-xs font-semibold text-white ${
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

    <td className="capitalize">
      {invoice.tone}
    </td>

    <td>

      <div className="flex justify-center gap-2">

        <Link
          href={`/dashboard/invoices/${invoice.id}`}
          className="rounded-lg bg-indigo-600 p-2 text-white hover:bg-indigo-700"
          title="View"
        >
          <Eye size={18} />
        </Link>

        <Link
          href={`/dashboard/invoices/edit/${invoice.id}`}
          className="rounded-lg bg-blue-600 p-2 text-white hover:bg-blue-700"
          title="Edit"
        >
          <Pencil size={18} />
        </Link>

        {invoice.status !== "paid" && (
          <button
            onClick={() => markAsPaid(invoice.id)}
            className="rounded-lg bg-green-600 p-2 text-white hover:bg-green-700"
            title="Mark as Paid"
          >
            <CheckCircle size={18} />
          </button>
        )}

        <button
          onClick={() => deleteInvoice(invoice.id)}
          className="rounded-lg bg-red-600 p-2 text-white hover:bg-red-700"
          title="Delete"
        >
          <Trash2 size={18} />
        </button>

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
         
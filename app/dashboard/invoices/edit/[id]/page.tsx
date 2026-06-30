"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "../../../../../lib/supabase";
import toast from "react-hot-toast";

export default function EditInvoicePage() {
  const router = useRouter();
  const params = useParams();

  const id = params.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    client_name: "",
    client_email: "",
    amount: "",
    due_date: "",
    status: "pending",
    tone: "friendly",
  });

  useEffect(() => {
    fetchInvoice();
  }, []);

  async function fetchInvoice() {
    const { data, error } = await supabase
      .from("invoices")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      toast.error(error.message);
      router.push("/dashboard/invoices");
      return;
    }

    setFormData({
      client_name: data.client_name,
      client_email: data.client_email,
      amount: data.amount.toString(),
      due_date: data.due_date,
      status: data.status,
      tone: data.tone,
    });

    setLoading(false);
  }

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setSaving(true);
        const { error } = await supabase
      .from("invoices")
      .update({
        client_name: formData.client_name,
        client_email: formData.client_email,
        amount: Number(formData.amount),
        due_date: formData.due_date,
        status: formData.status,
        tone: formData.tone,
      })
      .eq("id", id);

    setSaving(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Invoice updated successfully!");

    router.push("/dashboard/invoices");
  }

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl rounded-2xl bg-white p-10 shadow-xl">

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Edit Invoice
        </h1>

        <p className="mt-2 text-gray-500">
          Update your invoice information below.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid gap-6 md:grid-cols-2"
      >

        <div>
          <label className="mb-2 block font-semibold">
            Client Name
          </label>

          <input
            type="text"
            name="client_name"
            value={formData.client_name}
            onChange={handleChange}
            className="w-full rounded-lg border p-3 focus:border-blue-500 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="mb-2 block font-semibold">
            Client Email
          </label>

          <input
            type="email"
            name="client_email"
            value={formData.client_email}
            onChange={handleChange}
            className="w-full rounded-lg border p-3 focus:border-blue-500 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="mb-2 block font-semibold">
            Amount
          </label>

          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            className="w-full rounded-lg border p-3 focus:border-blue-500 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="mb-2 block font-semibold">
            Due Date
          </label>

          <input
            type="date"
            name="due_date"
            value={formData.due_date}
            onChange={handleChange}
            className="w-full rounded-lg border p-3 focus:border-blue-500 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="mb-2 block font-semibold">
            Status
          </label>

          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full rounded-lg border p-3 focus:border-blue-500 focus:outline-none"
          >
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block font-semibold">
            Reminder Tone
          </label>

          <select
            name="tone"
            value={formData.tone}
            onChange={handleChange}
            className="w-full rounded-lg border p-3 focus:border-blue-500 focus:outline-none"
          >
            <option value="friendly">Friendly</option>
            <option value="formal">Formal</option>
            <option value="firm">Firm</option>
            <option value="final notice">Final Notice</option>
          </select>
        </div>

        <div className="md:col-span-2 flex gap-4 pt-4">

          <button
            type="submit"
            disabled={saving}
            className="flex-1 rounded-lg bg-blue-600 py-4 text-lg font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {saving ? "Updating Invoice..." : "Save Changes"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/dashboard/invoices")}
            className="rounded-lg border border-gray-300 px-8 py-4 font-semibold text-gray-700 transition hover:bg-gray-100"
          >
            Cancel
          </button>

        </div>

      </form>

    </div>
  );
}
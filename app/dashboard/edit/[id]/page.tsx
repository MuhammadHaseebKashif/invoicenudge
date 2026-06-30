"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../../lib/supabase";

export default function EditInvoicePage() {
  const { id } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(false);

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

    if (!error && data) {
      setFormData({
        client_name: data.client_name,
        client_email: data.client_email,
        amount: String(data.amount),
        due_date: data.due_date,
        status: data.status,
        tone: data.tone,
      });
    }
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);

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

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Invoice Updated Successfully!");

    router.push("/dashboard/invoices");
  }

  return (
    <div className="mx-auto max-w-4xl rounded-xl bg-white p-8 shadow">
      <h1 className="mb-8 text-3xl font-bold">
        Edit Invoice
      </h1>

      <form
        onSubmit={handleSubmit}
        className="grid gap-6 md:grid-cols-2"
      >
        <input
          className="rounded-lg border p-3"
          placeholder="Client Name"
          name="client_name"
          value={formData.client_name}
          onChange={handleChange}
        />

        <input
          className="rounded-lg border p-3"
          placeholder="Client Email"
          name="client_email"
          value={formData.client_email}
          onChange={handleChange}
        />

        <input
          className="rounded-lg border p-3"
          type="number"
          placeholder="Amount"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
        />

        <input
          className="rounded-lg border p-3"
          type="date"
          name="due_date"
          value={formData.due_date}
          onChange={handleChange}
        />

        <select
          className="rounded-lg border p-3"
          name="status"
          value={formData.status}
          onChange={handleChange}
        >
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
        </select>

        <select
          className="rounded-lg border p-3"
          name="tone"
          value={formData.tone}
          onChange={handleChange}
        >
          <option value="friendly">Friendly</option>
          <option value="formal">Formal</option>
          <option value="firm">Firm</option>
        </select>

        <div className="md:col-span-2">
          <button
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-3 text-white hover:bg-blue-700"
          >
            {loading ? "Updating..." : "Update Invoice"}
          </button>
        </div>
      </form>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import toast from "react-hot-toast";

export default function AddInvoicePage() {
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
    loadSettings();
  }, []);

  async function loadSettings() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data } = await supabase
      .from("settings")
      .select("default_tone")
      .eq("id", user.id)
      .single();

    if (data?.default_tone) {
      setFormData((prev) => ({
        ...prev,
        tone: data.default_tone,
      }));
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (
      !formData.client_name ||
      !formData.client_email ||
      !formData.amount ||
      !formData.due_date
    ) {
      toast.error("Please fill all required fields.");
      return;
    }

    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("Please login first.");
      setLoading(false);
      return;
    }
        const { error } = await supabase.from("invoices").insert([
      {
        client_name: formData.client_name,
        client_email: formData.client_email,
        amount: Number(formData.amount),
        due_date: formData.due_date,
        status: formData.status,
        tone: formData.tone,
        user_id: user.id,
      },
    ]);

    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Invoice added successfully!");

    router.push("/dashboard/invoices");
  };

  return (
    <div className="mx-auto max-w-5xl rounded-2xl bg-white p-10 shadow-xl">

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Add New Invoice
        </h1>

        <p className="mt-2 text-gray-500">
          Fill the details below to create a new invoice.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid gap-6 md:grid-cols-2"
      >

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Client Name
          </label>

          <input
            type="text"
            name="client_name"
            value={formData.client_name}
            onChange={handleChange}
            placeholder="John Doe"
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-black outline-none focus:border-blue-600"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Client Email
          </label>

          <input
            type="email"
            name="client_email"
            value={formData.client_email}
            onChange={handleChange}
            placeholder="john@gmail.com"
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-black outline-none focus:border-blue-600"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Invoice Amount
          </label>

          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            placeholder="500"
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-black outline-none focus:border-blue-600"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Due Date
          </label>

          <input
            type="date"
            name="due_date"
            value={formData.due_date}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-black outline-none focus:border-blue-600"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Status
          </label>

          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-black outline-none focus:border-blue-600"
          >
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Reminder Tone
          </label>

          <select
            name="tone"
            value={formData.tone}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-black outline-none focus:border-blue-600"
          >
            <option value="friendly">Friendly</option>
            <option value="formal">Formal</option>
            <option value="firm">Firm</option>
            <option value="final notice">Final Notice</option>
          </select>
        </div>

        <div className="mt-4 md:col-span-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-4 text-lg font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {loading ? "Saving Invoice..." : "Save Invoice"}
          </button>
        </div>

      </form>

    </div>
  );
}
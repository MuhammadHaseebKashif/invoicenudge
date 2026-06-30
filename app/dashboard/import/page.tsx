"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import * as Papa from "papaparse";

export default function ImportCSVPage() {
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  async function importCSV() {
    if (!file) {
      alert("Please select a CSV file.");
      return;
    }

    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Please login first.");
      setLoading(false);
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,

      complete: async (results: any) => {
        try {
          const invoices = results.data.map((row: any) => ({
            client_name: row.client_name,
            client_email: row.client_email,
            amount: Number(row.amount),
            due_date: row.due_date,
            status: row.status || "pending",
            tone: row.tone || "friendly",
            user_id: user.id,
          }));

          const { error } = await supabase
            .from("invoices")
            .insert(invoices);

          setLoading(false);

          if (error) {
            alert(error.message);
            return;
          }

          alert(`${invoices.length} invoices imported successfully!`);

          router.push("/dashboard/invoices");
        } catch (err) {
          setLoading(false);
          alert("Invalid CSV format.");
        }
      },

      error() {
        setLoading(false);
        alert("Unable to read CSV file.");
      },
    });
  }

  return (
    <div className="mx-auto max-w-5xl rounded-2xl bg-white p-10 shadow-xl">

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Import Invoices
        </h1>

        <p className="mt-2 text-gray-500">
          Upload a CSV file and import multiple invoices at once.
        </p>
      </div>

      <label
        htmlFor="csv"
        className="flex h-72 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-blue-400 bg-blue-50 transition hover:bg-blue-100"
      >
        <div className="text-6xl">📄</div>

        <h2 className="mt-4 text-2xl font-bold">
          Drag & Drop CSV File
        </h2>

        <p className="mt-2 text-gray-500">
          Click here to browse your computer
        </p>

        <input
          id="csv"
          type="file"
          hidden
          accept=".csv"
          onChange={(e) => {
            if (e.target.files?.length) {
              setFile(e.target.files[0]);
            }
          }}
        />
      </label>

      {file && (
        <div className="mt-6 rounded-xl border border-green-300 bg-green-50 p-5">

          <h3 className="font-semibold text-green-700">
            Selected File
          </h3>

          <p className="mt-2 text-gray-700">
            {file.name}
          </p>

          <p className="text-sm text-gray-500">
            Ready to import.
          </p>

        </div>
      )}

      <button
        onClick={importCSV}
        disabled={loading}
        className="mt-8 w-full rounded-xl bg-blue-600 py-4 text-lg font-semibold text-white transition hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? "Importing..." : "Import CSV"}
      </button>

      <div className="mt-10 rounded-xl border bg-gray-50 p-6">
        <h2 className="mb-3 text-lg font-bold">
          Required CSV Format
        </h2>

        <pre className="overflow-x-auto text-sm text-gray-700">
{`client_name,client_email,amount,due_date,status,tone
Ali,ali@gmail.com,500,2026-07-01,pending,friendly
Ahmed,ahmed@gmail.com,900,2026-07-10,paid,formal
Sara,sara@gmail.com,300,2026-07-15,overdue,firm`}
        </pre>
      </div>

    </div>
  );
}
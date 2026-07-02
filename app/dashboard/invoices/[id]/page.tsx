"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import toast from "react-hot-toast";
import InvoiceTemplate from "@/components/InvoiceTemplate";
import { Download, Edit2, Save, X, Plus, Trash2, Printer } from "lucide-react";

interface InvoiceItem {
  id: string;
  description: string;
  details: string;
  rate: number;
  qty: number;
  price: number;
}

interface Invoice {
  id: string;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  client_name: string;
  client_email: string;
  client_address: string;
  description: string;
  items: InvoiceItem[];
  subtotal: number;
  vat: number;
  total: number;
  notes: string;
  status: string;
}

interface UserProfile {
  name: string;
  email: string;
  avatar_url: string;
  company_name?: string;
  company_phone?: string;
  company_address?: string;
  company_website?: string;
}

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = params.id as string;
  const invoiceRef = useRef<HTMLDivElement>(null);

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState<Invoice | null>(null);

  useEffect(() => {
    loadData();
  }, [invoiceId]);

  async function loadData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/");
        return;
      }

      // Load user profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileData) {
        setUserProfile(profileData);
      }

      // Load invoice
      const { data: invoiceData, error } = await supabase
        .from("invoices")
        .select("*")
        .eq("id", invoiceId)
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error("Invoice load error:", error);
        toast.error("Failed to load invoice");
        router.push("/dashboard/invoices");
        return;
      }

      setInvoice(invoiceData);
      setFormData(invoiceData);
      setIsEditing(false);
    } catch (err) {
      console.error("Error loading data:", err);
      toast.error("Error loading invoice");
    } finally {
      setLoading(false);
    }
  }

  async function handleDownloadPDF() {
    if (!invoiceRef.current || !invoice) {
      toast.error("Invoice data not ready");
      return;
    }

    setDownloading(true);

    try {
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgData = canvas.toDataURL("image/png");
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`invoice-${invoice.invoice_number}.pdf`);
      toast.success("Invoice downloaded successfully!");
    } catch (err) {
      console.error("PDF download error:", err);
      toast.error("Failed to download PDF");
    } finally {
      setDownloading(false);
    }
  }

  async function handlePrintPDF() {
    if (!invoiceRef.current || !invoice) {
      toast.error("Invoice data not ready");
      return;
    }

    try {
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const printWindow = window.open("", "");
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Invoice #${invoice.invoice_number}</title>
              <style>
                body { margin: 0; padding: 0; }
                img { width: 100%; height: auto; }
                @media print {
                  body { margin: 0; }
                }
              </style>
            </head>
            <body>
              <img src="${canvas.toDataURL()}" />
              <script>window.print(); window.close();</script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
      toast.success("Opening print dialog...");
    } catch (err) {
      console.error("Print error:", err);
      toast.error("Failed to print");
    }
  }

  async function handleDeleteInvoice() {
    if (!confirm("Are you sure you want to delete this invoice? This action cannot be undone.")) {
      return;
    }

    setDeleting(true);

    try {
      const { error } = await supabase
        .from("invoices")
        .delete()
        .eq("id", invoiceId);

      if (error) {
        toast.error("Failed to delete invoice");
        return;
      }

      toast.success("Invoice deleted successfully!");
      router.push("/dashboard/invoices");
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Error deleting invoice");
    } finally {
      setDeleting(false);
    }
  }

  async function handleSave() {
    if (!formData) return;
    setSaving(true);

    try {
      const { error } = await supabase
        .from("invoices")
        .update({
          invoice_number: formData.invoice_number,
          issue_date: formData.issue_date,
          due_date: formData.due_date,
          client_name: formData.client_name,
          client_email: formData.client_email,
          client_address: formData.client_address,
          description: formData.description,
          items: formData.items,
          subtotal: formData.subtotal,
          vat: formData.vat,
          total: formData.total,
          notes: formData.notes,
        })
        .eq("id", invoiceId);

      if (error) {
        console.error("Save error:", error);
        toast.error("Failed to save invoice");
        return;
      }

      setInvoice(formData);
      setIsEditing(false);
      toast.success("Invoice updated successfully!");
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Error saving invoice");
    } finally {
      setSaving(false);
    }
  }

  function calculateTotals(items: InvoiceItem[]) {
    const subtotal = items.reduce((sum, item) => sum + item.price, 0);
    const vat = subtotal * 0.03;
    const total = subtotal + vat;
    return { subtotal, vat, total };
  }

  function updateItem(index: number, field: string, value: any) {
    if (!formData) return;

    const updatedItems = [...formData.items];

    if (field === "rate" || field === "qty") {
      const rate = field === "rate" ? parseFloat(value) || 0 : updatedItems[index].rate;
      const qty = field === "qty" ? parseInt(value) || 1 : updatedItems[index].qty;
      updatedItems[index] = {
        ...updatedItems[index],
        [field]: field === "rate" ? parseFloat(value) || 0 : parseInt(value) || 1,
        price: rate * qty,
      };
    } else {
      updatedItems[index] = { ...updatedItems[index], [field]: value };
    }

    const { subtotal, vat, total } = calculateTotals(updatedItems);

    setFormData({
      ...formData,
      items: updatedItems,
      subtotal,
      vat,
      total,
    });
  }

  function addItem() {
    if (!formData) return;

    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: "New Item",
      details: "",
      rate: 0,
      qty: 1,
      price: 0,
    };

    const updatedItems = [...formData.items, newItem];
    const { subtotal, vat, total } = calculateTotals(updatedItems);

    setFormData({
      ...formData,
      items: updatedItems,
      subtotal,
      vat,
      total,
    });
  }

  function removeItem(index: number) {
    if (!formData) return;

    const updatedItems = formData.items.filter((_, i) => i !== index);
    const { subtotal, vat, total } = calculateTotals(updatedItems);

    setFormData({
      ...formData,
      items: updatedItems,
      subtotal,
      vat,
      total,
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!invoice || !formData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Invoice not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      {/* Header with Title and 3 Action Buttons */}
      <div className="flex items-center justify-between bg-white p-6 rounded-xl shadow-sm ring-1 ring-gray-100">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Invoice #{invoice.invoice_number}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Status: <span className="font-medium capitalize">{invoice.status}</span>
          </p>
        </div>

        {/* 3 Buttons on Right Side */}
        <div className="flex gap-3">
          {!isEditing ? (
            <>
              {/* Edit Button */}
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition"
                title="Edit Invoice"
              >
                <Edit2 size={18} />
                Edit
              </button>

              {/* Print PDF Button */}
              <button
                onClick={handlePrintPDF}
                className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700 transition"
                title="Print Invoice"
              >
                <Printer size={18} />
                Print
              </button>

              {/* Download PDF Button */}
              <button
                onClick={handleDownloadPDF}
                disabled={downloading}
                className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                title="Download PDF"
              >
                <Download size={18} />
                {downloading ? "..." : "Download"}
              </button>

              {/* Delete Button */}
              <button
                onClick={handleDeleteInvoice}
                disabled={deleting}
                className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                title="Delete Invoice"
              >
                <Trash2 size={18} />
                {deleting ? "..." : "Delete"}
              </button>
            </>
          ) : (
            <>
              {/* Save Button */}
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={18} />
                {saving ? "Saving..." : "Save"}
              </button>

              {/* Cancel Button */}
              <button
                onClick={() => {
                  setIsEditing(false);
                  setFormData(invoice);
                }}
                className="flex items-center gap-2 rounded-lg bg-gray-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-700 transition"
              >
                <X size={18} />
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      {/* Invoice Preview and Edit Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Invoice Template (Left) */}
        <div className="lg:col-span-2 rounded-xl bg-white shadow-sm ring-1 ring-gray-100 overflow-hidden">
          <div className="overflow-auto max-h-screen">
            <InvoiceTemplate
              ref={invoiceRef}
              invoiceNumber={formData.invoice_number}
              issueDate={formData.issue_date}
              dueDate={formData.due_date}
              companyName={userProfile?.company_name || userProfile?.name || "Your Company"}
              companyEmail={userProfile?.email || "email@company.com"}
              companyPhone={userProfile?.company_phone || "+1234567890"}
              companyWebsite={userProfile?.company_website || "www.company.com"}
              companyAddress={userProfile?.company_address || "123 Business St"}
              clientName={formData.client_name}
              clientEmail={formData.client_email}
              clientAddress={formData.client_address}
              description={formData.description}
              items={formData.items}
              subtotal={formData.subtotal}
              vat={formData.vat}
              total={formData.total}
              notes={formData.notes}
            />
          </div>
        </div>

        {/* Edit Form (Right) - Only show when editing */}
        {isEditing && (
          <div className="space-y-4 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100 h-fit sticky top-6">
            <h3 className="font-bold text-lg text-gray-900">Edit Invoice</h3>

            <div>
              <label className="text-sm font-medium text-gray-700">Invoice #</label>
              <input
                type="text"
                value={formData.invoice_number}
                onChange={(e) =>
                  setFormData({ ...formData, invoice_number: e.target.value })
                }
                className="w-full rounded border border-gray-200 p-2.5 text-sm mt-1 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Issue Date</label>
                <input
                  type="date"
                  value={formData.issue_date}
                  onChange={(e) =>
                    setFormData({ ...formData, issue_date: e.target.value })
                  }
                  className="w-full rounded border border-gray-200 p-2.5 text-sm mt-1 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Due Date</label>
                <input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) =>
                    setFormData({ ...formData, due_date: e.target.value })
                  }
                  className="w-full rounded border border-gray-200 p-2.5 text-sm mt-1 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Client Name</label>
              <input
                type="text"
                value={formData.client_name}
                onChange={(e) =>
                  setFormData({ ...formData, client_name: e.target.value })
                }
                className="w-full rounded border border-gray-200 p-2.5 text-sm mt-1 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Client Email</label>
              <input
                type="email"
                value={formData.client_email}
                onChange={(e) =>
                  setFormData({ ...formData, client_email: e.target.value })
                }
                className="w-full rounded border border-gray-200 p-2.5 text-sm mt-1 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Client Address</label>
              <textarea
                value={formData.client_address}
                onChange={(e) =>
                  setFormData({ ...formData, client_address: e.target.value })
                }
                className="w-full rounded border border-gray-200 p-2.5 text-sm mt-1 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
                rows={2}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full rounded border border-gray-200 p-2.5 text-sm mt-1 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
                rows={2}
              />
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-sm text-gray-900">Items</h4>
                <button
                  onClick={addItem}
                  className="flex items-center gap-1 rounded bg-blue-50 px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-100"
                >
                  <Plus size={14} />
                  Add
                </button>
              </div>

              <div className="space-y-3 max-h-64 overflow-y-auto">
                {formData.items.map((item, idx) => (
                  <div key={item.id} className="p-3 bg-gray-50 rounded space-y-2">
                    <div className="flex justify-between items-start">
                      <input
                        type="text"
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) =>
                          updateItem(idx, "description", e.target.value)
                        }
                        className="flex-1 rounded border border-gray-200 p-1.5 text-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                      />
                      <button
                        onClick={() => removeItem(idx)}
                        className="ml-2 text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="number"
                        placeholder="Rate"
                        value={item.rate}
                        onChange={(e) =>
                          updateItem(idx, "rate", e.target.value)
                        }
                        className="rounded border border-gray-200 p-1.5 text-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                      />
                      <input
                        type="number"
                        placeholder="Qty"
                        value={item.qty}
                        onChange={(e) =>
                          updateItem(idx, "qty", e.target.value)
                        }
                        className="rounded border border-gray-200 p-1.5 text-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                      />
                      <input
                        type="number"
                        placeholder="Price"
                        value={item.price}
                        disabled
                        className="rounded border border-gray-200 bg-gray-100 p-1.5 text-xs text-gray-500 cursor-not-allowed"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">${formData.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">VAT (3%):</span>
                <span className="font-medium">${formData.vat.toFixed(2)}</span>
              </div>
              <div className="flex justify-between bg-gray-100 p-2 rounded font-bold">
                <span>Total:</span>
                <span>${formData.total.toFixed(2)}</span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                className="w-full rounded border border-gray-200 p-2.5 text-sm mt-1 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
                rows={2}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
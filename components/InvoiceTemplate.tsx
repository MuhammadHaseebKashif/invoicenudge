import React from "react";

interface InvoiceItem {
  id: string;
  description: string;
  details: string;
  rate: number;
  qty: number;
  price: number;
}

interface InvoiceTemplateProps {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  companyWebsite: string;
  companyAddress: string;
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  description: string;
  items: InvoiceItem[];
  subtotal: number;
  vat: number;
  total: number;
  notes: string;
  status?: string;
  currency?: string;
}

function getCurrencySymbol(currency?: string) {
  switch (currency) {
    case "PKR":
      return "Rs ";
    case "EUR":
      return "€";
    case "GBP":
      return "£";
    case "USD":
    default:
      return "$";
  }
}

const InvoiceTemplate = React.forwardRef<HTMLDivElement, InvoiceTemplateProps>(
  (props, ref) => {
    const items = props.items || [];
    const subtotal = props.subtotal || 0;
    const vat = props.vat || 0;
    const total = props.total || 0;
    const isDraft = props.status !== "paid";
    const symbol = getCurrencySymbol(props.currency);

    return (
      <div
        ref={ref}
        style={{
          width: "794px",
          minHeight: "1123px",
          backgroundColor: "#f7f7f5",
          padding: "56px",
          boxSizing: "border-box",
          fontFamily: "inherit",
        }}
        className="relative text-gray-900"
      >
        {/* Draft Ribbon */}
        {isDraft && (
          <div className="pointer-events-none absolute -right-16 top-8 w-56 rotate-45 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-300">
              draft
            </p>
          </div>
        )}

        {/* Header: Logo + Company Info */}
        <div className="mb-16 flex items-start justify-between">
          <div>
            <p className="text-2xl font-black leading-tight tracking-tight">
              {props.companyName}
            </p>
          </div>
          <div className="text-right text-sm leading-relaxed text-gray-700">
            {props.companyAddress && <p>{props.companyAddress}</p>}
            {props.companyPhone && <p>{props.companyPhone}</p>}
            {props.companyWebsite && <p>{props.companyWebsite}</p>}
          </div>
        </div>

        {/* Invoice Title */}
        <h1 className="mb-10 text-6xl font-light tracking-tight text-gray-900">
          Invoice
        </h1>

        {/* Invoice # / Dates / Issued To */}
        <div className="mb-12 flex items-start justify-between">
          <div className="space-y-1 text-sm">
            <p className="font-bold text-gray-900">#{props.invoiceNumber}</p>
            <p className="text-gray-600">
              Issue Date:{" "}
              <span className="font-medium text-gray-800">
                {props.issueDate || "—"}
              </span>
            </p>
            <p className="text-gray-600">
              Due Date:{" "}
              <span className="font-medium text-gray-800">
                {props.dueDate || "—"}
              </span>
            </p>
          </div>

          <div className="text-right text-sm" style={{ maxWidth: "260px" }}>
            <p className="mb-1.5 font-bold uppercase tracking-wide text-gray-900">
              Issued To
            </p>
            <p className="font-semibold text-gray-800">{props.clientName}</p>
            {props.clientEmail && (
              <p className="break-words text-gray-600">{props.clientEmail}</p>
            )}
            {props.clientAddress && (
              <p className="break-words text-gray-600">
                {props.clientAddress}
              </p>
            )}
          </div>
        </div>

        {/* Description */}
        {props.description && (
          <div className="mb-10">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-900">
              Description
            </p>
            <p className="text-sm text-gray-700">{props.description}</p>
          </div>
        )}

        {/* Items Table */}
        <div className="mb-8">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-300 text-xs font-bold uppercase tracking-wide text-gray-500">
                <th className="w-16 py-3 text-left">No.</th>
                <th className="py-3 text-left">Service</th>
                <th className="py-3 text-right">Rate</th>
                <th className="py-3 text-right">Qty.</th>
                <th className="py-3 text-right">Price</th>
              </tr>
            </thead>
            <tbody>
              {items.length > 0 ? (
                items.map((item, index) => (
                  <tr key={item.id} className="border-b border-gray-200">
                    <td className="py-4 text-sm text-gray-500">
                      #{index + 1}
                    </td>
                    <td className="py-4">
                      <p className="text-sm font-semibold text-gray-900">
                        {item.description}
                      </p>
                      {item.details && (
                        <p className="mt-0.5 text-xs text-gray-500">
                          {item.details}
                        </p>
                      )}
                    </td>
                    <td className="py-4 text-right text-sm text-gray-700">
                      {symbol}
                      {(item.rate || 0).toFixed(2)}
                    </td>
                    <td className="py-4 text-right text-sm text-gray-700">
                      {item.qty || 0}
                    </td>
                    <td className="py-4 text-right text-sm font-semibold text-gray-900">
                      {symbol}
                      {(item.price || 0).toFixed(2)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="py-8 text-center text-sm text-gray-400"
                  >
                    No items added
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="mb-12 flex justify-end">
          <div style={{ width: "300px" }}>
            <div className="flex justify-between border-b border-gray-200 py-3 text-sm">
              <span className="font-medium text-gray-600">Subtotal</span>
              <span className="font-semibold text-gray-900">
                {symbol}
                {subtotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between border-b border-gray-200 py-3 text-sm">
              <span className="font-medium text-gray-600">V.A.T. (3%)</span>
              <span className="font-semibold text-gray-900">
                {symbol}
                {vat.toFixed(2)}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between bg-gray-900 px-4 py-4 text-white">
              <span className="text-sm font-bold uppercase tracking-wide">
                Total
              </span>
              <span className="text-2xl font-bold">
                {symbol}
                {total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 pt-6 text-center text-xs text-gray-400">
          <p>{props.notes || "Thank you for your business."}</p>
        </div>
      </div>
    );
  }
);

InvoiceTemplate.displayName = "InvoiceTemplate";

export default InvoiceTemplate;
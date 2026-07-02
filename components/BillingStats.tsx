"use client";

interface Props {
  totalRevenue: number;
  paid: number;
  pending: number;
  overdue: number;
  currency?: string;
}

export default function BillingStats({
  totalRevenue,
  paid,
  pending,
  overdue,
  currency = "USD",
}: Props) {
  const symbol = currency === "PKR" ? "Rs " : "$";

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

      <div className="rounded-xl bg-white p-6 shadow">
        <h3 className="text-gray-500">
          Total Revenue
        </h3>

        <h1 className="mt-3 text-3xl font-bold text-green-600">
          {symbol}{totalRevenue}
        </h1>
      </div>

      <div className="rounded-xl bg-white p-6 shadow">
        <h3 className="text-gray-500">
          Paid
        </h3>

        <h1 className="mt-3 text-3xl font-bold text-green-500">
          {paid}
        </h1>
      </div>

      <div className="rounded-xl bg-white p-6 shadow">
        <h3 className="text-gray-500">
          Pending
        </h3>

        <h1 className="mt-3 text-3xl font-bold text-yellow-500">
          {pending}
        </h1>
      </div>

      <div className="rounded-xl bg-white p-6 shadow">
        <h3 className="text-gray-500">
          Overdue
        </h3>

        <h1 className="mt-3 text-3xl font-bold text-red-500">
          {overdue}
        </h1>
      </div>

    </div>
  );
}
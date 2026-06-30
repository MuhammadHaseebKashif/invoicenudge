import { LucideIcon } from "lucide-react";

interface Props {
  title: string;
  value: string;
  icon: LucideIcon;
  color: string;
  loading?: boolean;
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  color,
  loading = false,
}: Props) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-md transition hover:shadow-xl">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500">{title}</p>

          {loading ? (
            <div className="mt-2 h-8 w-16 animate-pulse rounded bg-gray-200" />
          ) : (
            <h2 className="mt-2 text-3xl font-bold">
              {value}
            </h2>
          )}
        </div>

        <div
          className={`rounded-full p-4 ${color} ${
            loading ? "animate-pulse opacity-60" : ""
          }`}
        >
          <Icon
            className="text-white"
            size={28}
          />
        </div>
      </div>
    </div>
  );
}
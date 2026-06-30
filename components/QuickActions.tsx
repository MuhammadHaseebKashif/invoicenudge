import Link from "next/link";
import {
  PlusCircle,
  Upload,
  Mail,
  Settings,
  ArrowRight,
} from "lucide-react";

export default function QuickActions() {
  const actions = [
    {
      title: "Add Invoice",
      description: "Create a new invoice",
      href: "/dashboard/new",
      icon: PlusCircle,
      color: "bg-blue-500",
    },
    {
      title: "Import CSV",
      description: "Upload invoices from CSV",
      href: "/dashboard/import",
      icon: Upload,
      color: "bg-green-500",
    },
    {
      title: "Send Reminder",
      description: "Send payment reminders",
      href: "/dashboard/reminders",
      icon: Mail,
      color: "bg-yellow-500",
    },
    {
      title: "Settings",
      description: "Manage your account",
      href: "/dashboard/settings",
      icon: Settings,
      color: "bg-purple-500",
    },
  ];

  return (
    <div className="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Quick Actions
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Access the most frequently used features.
        </p>
      </div>

      <div className="grid gap-4">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.title}
              href={action.href}
              className="group flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 transition-all duration-300 hover:border-blue-500 hover:shadow-lg hover:-translate-y-1"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${action.color}`}
                >
                  <Icon
                    size={22}
                    className="text-white"
                  />
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800">
                    {action.title}
                  </h3>

                  <p className="text-sm text-gray-500">
                    {action.description}
                  </p>
                </div>
              </div>

              <ArrowRight
                size={20}
                className="text-gray-400 transition group-hover:translate-x-1 group-hover:text-blue-600"
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
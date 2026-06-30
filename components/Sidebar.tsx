"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Mail,
  History,
  CreditCard,
  UserCircle,
  Settings,
  LogOut,
} from "lucide-react";

const menuItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Invoices",
    href: "/dashboard/invoices",
    icon: FileText,
  },
  {
    name: "Reminders",
    href: "/dashboard/reminders",
    icon: Mail,
  },
  {
    name: "Reminder History",
    href: "/dashboard/history",
    icon: History,
  },
  {
    name: "Billing",
    href: "/dashboard/billing",
    icon: CreditCard,
  },
  {
    name: "Profile",
    href: "/dashboard/profile",
    icon: UserCircle,
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 flex-col justify-between bg-slate-900 text-white">
      <div>
        <div className="border-b border-slate-700 p-6">
          <h1 className="text-2xl font-bold text-blue-400">
            InvoiceNudge
          </h1>

          <p className="mt-1 text-sm text-slate-400">
            Smart Invoice Reminders
          </p>
        </div>

        <nav className="mt-6 space-y-2 px-4">
          {menuItems.map((item) => {
            const Icon = item.icon;

            const active =
              pathname === item.href ||
              pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 transition ${
                  active
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon size={20} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-slate-700 p-4">
        <button className="flex w-full items-center gap-3 rounded-lg px-4 py-3 transition hover:bg-red-600">
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </aside>
  );
}
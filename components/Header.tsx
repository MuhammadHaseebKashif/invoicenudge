"use client";

import { Bell, Search } from "lucide-react";

export default function Header() {
  return (
    <header className="flex items-center justify-between border-b bg-white px-8 py-5">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Dashboard
        </h1>
        <p className="text-gray-500">
          Welcome back 👋
        </p>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative">
          <Search
            className="absolute left-3 top-3 text-gray-400"
            size={18}
          />

          <input
            type="text"
            placeholder="Search invoices..."
            className="rounded-lg border py-2 pl-10 pr-4 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button className="relative rounded-full bg-gray-100 p-3 hover:bg-gray-200">
          <Bell size={20} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500"></span>
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white">
            H
          </div>

          <div>
            <h3 className="font-semibold">Haseeb</h3>
            <p className="text-sm text-gray-500">
              Admin
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
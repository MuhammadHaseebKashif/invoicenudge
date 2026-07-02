"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";
import {
  Bell,
  Search,
  ChevronDown,
  LogOut,
  User,
  Settings,
  CheckCheck,
  FileText,
  Clock3,
} from "lucide-react";

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

const notifications = [
  {
    id: 1,
    icon: Clock3,
    color: "text-yellow-600 bg-yellow-50",
    title: "Invoice #102 is due tomorrow",
    time: "2h ago",
    unread: true,
  },
  {
    id: 2,
    icon: FileText,
    color: "text-blue-600 bg-blue-50",
    title: "New invoice created for Sarah Khan",
    time: "5h ago",
    unread: true,
  },
  {
    id: 3,
    icon: CheckCheck,
    color: "text-green-600 bg-green-50",
    title: "Invoice #098 marked as paid",
    time: "1d ago",
    unread: false,
  },
];

export default function Header({
  title = "Dashboard",
  subtitle = "Welcome back",
}: HeaderProps) {
  const router = useRouter();

  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => n.unread).length;

  useEffect(() => {
    loadUser();

    // Refresh user data every 3 seconds to catch avatar updates
    const interval = setInterval(() => {
      loadUser();
    }, 3000);

    function handleClickOutside(e: MouseEvent) {
      if (
        notifRef.current &&
        !notifRef.current.contains(e.target as Node)
      ) {
        setNotifOpen(false);
      }
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target as Node)
      ) {
        setProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      clearInterval(interval);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  async function loadUser() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      setUserEmail(user.email || "");

      const { data } = await supabase
        .from("profiles")
        .select("name, avatar_url")
        .eq("id", user.id)
        .single();

      if (data) {
        setUserName(data.name || user.email?.split("@")[0] || "User");
        setAvatarUrl(data.avatar_url || "");
      }
    } catch (err) {
      console.error("Error loading user:", err);
    }
  }

  function getInitials(name: string) {
    if (!name) return "U";
    return name
      .trim()
      .split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-gray-100 bg-white/80 px-8 py-4 backdrop-blur-md">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="text-sm text-gray-500">
          {subtitle}
          {userName ? `, ${userName.split(" ")[0]}` : ""} 👋
        </p>
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden sm:block">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={17}
          />
          <input
            type="text"
            placeholder="Search invoices, clients..."
            className="w-56 rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:w-72 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              setNotifOpen((v) => !v);
              setProfileOpen(false);
            }}
            className="relative rounded-full bg-gray-50 p-2.5 text-gray-600 transition hover:bg-gray-100"
          >
            <Bell size={19} />
            {unreadCount > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500"></span>
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                <p className="text-sm font-semibold text-gray-900">
                  Notifications
                </p>
                {unreadCount > 0 && (
                  <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600">
                    {unreadCount} new
                  </span>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto">
                {notifications.map((n) => {
                  const Icon = n.icon;
                  return (
                    <div
                      key={n.id}
                      className={`flex items-start gap-3 border-b border-gray-50 px-4 py-3 transition hover:bg-gray-50 ${
                        n.unread ? "bg-blue-50/30" : ""
                      }`}
                    >
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${n.color}`}
                      >
                        <Icon size={15} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-800">{n.title}</p>
                        <p className="mt-0.5 text-xs text-gray-400">
                          {n.time}
                        </p>
                      </div>
                      {n.unread && (
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                      )}
                    </div>
                  );
                })}
              </div>

              <button className="w-full border-t border-gray-100 py-2.5 text-center text-xs font-medium text-blue-600 hover:bg-gray-50">
                View all notifications
              </button>
            </div>
          )}
        </div>

        {/* Profile dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => {
              setProfileOpen((v) => !v);
              setNotifOpen(false);
            }}
            className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-2 transition hover:bg-gray-50"
          >
            {/* Avatar or Initials */}
            {avatarUrl ? (
              <img
                key={avatarUrl}
                src={avatarUrl}
                alt={userName}
                className="h-10 w-10 rounded-full border-2 border-blue-200 object-cover shadow-sm"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-blue-400 text-sm font-bold text-white shadow-sm">
                {getInitials(userName)}
              </div>
            )}

            <div className="hidden text-left sm:block">
              <h3 className="text-sm font-semibold text-gray-900">
                {userName || "Loading..."}
              </h3>
              <p className="text-xs text-gray-400">Admin</p>
            </div>
            <ChevronDown
              size={15}
              className={`text-gray-400 transition ${
                profileOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl">
              <div className="border-b border-gray-100 px-4 py-3">
                <p className="text-sm font-semibold text-gray-900">
                  {userName}
                </p>
                <p className="truncate text-xs text-gray-400">
                  {userEmail}
                </p>
              </div>

              <div className="py-1">
                <button
                  onClick={() => router.push("/dashboard/profile")}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50"
                >
                  <User size={15} className="text-gray-400" />
                  My Profile
                </button>
                <button
                  onClick={() => router.push("/dashboard/settings")}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Settings size={15} className="text-gray-400" />
                  Settings
                </button>
              </div>

              <div className="border-t border-gray-100 py-1">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut size={15} />
                  Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
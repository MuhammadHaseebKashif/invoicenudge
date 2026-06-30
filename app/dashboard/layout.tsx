import { ReactNode } from "react";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import { Toaster } from "react-hot-toast";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex flex-1 flex-col">
        <Header />

        <main className="flex-1 p-8">
          {children}
        </main>

        <Toaster
          position="top-right"
          reverseOrder={false}
          toastOptions={{
            duration: 3000,

            success: {
              style: {
                background: "#16a34a",
                color: "#fff",
              },
            },

            error: {
              style: {
                background: "#dc2626",
                color: "#fff",
              },
            },
          }}
        />
      </div>
    </div>
  );
}
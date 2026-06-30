"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: "http://localhost:3000/dashboard",
      },
    });

    if (error) {
      alert(error.message);
    } else {
      alert("Magic link sent! Check your email.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-96 rounded-lg border p-6 shadow-lg">
        <h1 className="mb-4 text-2xl font-bold">InvoiceNudge Login</h1>

        <input
          type="email"
          placeholder="Enter your email"
          className="mb-4 w-full rounded border p-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="w-full rounded bg-blue-600 p-2 text-white"
        >
          Send Magic Link
        </button>
      </div>
    </div>
  );
}
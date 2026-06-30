"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true); // Toggle state
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert(error.message);
      else router.push("/dashboard");
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) alert(error.message);
      else alert("Check your email for confirmation link!");
    }
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-[#050816] flex items-center justify-center relative overflow-hidden p-6">
      <div className="absolute top-[-100px] left-[-100px] h-[300px] w-[300px] rounded-full bg-blue-600/20 blur-[100px]"></div>
      <div className="absolute bottom-[-100px] right-[-100px] h-[300px] w-[300px] rounded-full bg-purple-600/20 blur-[100px]"></div>

      <div className="relative z-10 w-full max-w-md bg-white/5 border border-white/10 backdrop-blur-2xl p-10 rounded-3xl shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">{isLogin ? "Welcome Back" : "Create Account"}</h1>
          <p className="text-white/50 mt-2">
            {isLogin ? "Sign in to manage your invoices" : "Join us and start tracking today"}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-5">
          <input
            type="email"
            placeholder="Email Address"
            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 transition"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 transition"
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-4 rounded-xl hover:scale-[1.02] transition shadow-lg shadow-blue-500/20"
          >
            {loading ? "Processing..." : isLogin ? "Sign In" : "Sign Up"}
          </button>
        </form>

        <p className="text-center text-white/50 mt-6">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button 
            onClick={() => setIsLogin(!isLogin)} 
            className="text-blue-400 font-bold hover:underline"
          >
            {isLogin ? "Sign Up" : "Sign In"}
          </button>
        </p>
      </div>
    </main>
  );
}
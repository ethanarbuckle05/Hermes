"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError(error.message);
      } else {
        window.location.href = "/";
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        setError(error.message);
      } else {
        setMessage("Check your email to confirm your account.");
      }
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-xs">
        <div className="text-center mb-12">
          <h1 className="text-3xl tracking-tight">Hermes</h1>
          <p className="text-earth-muted text-sm mt-2">Training log</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-xs text-earth-muted mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 border border-earth-border rounded text-sm
                         focus:outline-none focus:border-earth-text bg-white"
              placeholder="you@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs text-earth-muted mb-1.5">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2.5 border border-earth-border rounded text-sm
                         focus:outline-none focus:border-earth-text bg-white"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-sm text-red-700 px-3 py-2 bg-red-50/50 rounded">{error}</p>
          )}
          {message && (
            <p className="text-sm text-earth-sage px-3 py-2 bg-[#E8EDE4]/50 rounded">{message}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-earth-sage text-white text-sm rounded
                       hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "..." : mode === "login" ? "Log in" : "Sign up"}
          </button>
        </form>

        <p className="text-center text-xs text-earth-muted mt-6">
          {mode === "login" ? "No account? " : "Already have an account? "}
          <button
            onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); setMessage(""); }}
            className="text-earth-text underline underline-offset-2"
          >
            {mode === "login" ? "Sign up" : "Log in"}
          </button>
        </p>
      </div>
    </div>
  );
}

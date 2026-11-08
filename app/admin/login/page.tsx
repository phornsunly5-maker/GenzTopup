"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      router.push("/admin");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Premium Background Effects */}
      <div className="pointer-events-none absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-brand-primary/10 blur-[120px] animate-float" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 h-[400px] w-[400px] rounded-full bg-brand-accent/10 blur-[120px] animate-float-slow" />

      <div className="w-full max-w-md relative z-10">
        <Link href="/" className="flex items-center gap-2 justify-center mb-8 group">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-brand-primary to-brand-accent flex items-center justify-center shadow-lg shadow-brand-primary/30 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
            <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7 text-white">
              <path d="M12 2L3 7v6c0 5 3.5 9 9 10 5.5-1 9-5 9-10V7l-9-5z" stroke="currentColor" strokeWidth="2" />
            </svg>
          </div>
          <span className="font-display text-3xl font-bold tracking-tight">
            GENZ<span className="text-brand-primary">TOPUP</span>
          </span>
        </Link>

        <div className="card p-8 border-brand-border/60 shadow-2xl backdrop-blur-xl bg-brand-card/80">
          <h1 className="font-display text-2xl font-bold mb-2">Admin Login</h1>
          <p className="text-sm text-brand-muted mb-6">Sign in to manage orders and products.</p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@genztopup.com"
                required
                autoFocus
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                type="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-red-400"></span>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 mt-2">
              {loading ? (
                <>
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <p className="text-xs text-brand-muted text-center mt-8">
            Authorized personnel only. <br /> &copy; {new Date().getFullYear()} GenzTopup.
          </p>
        </div>
      </div>
    </div>
  );
}

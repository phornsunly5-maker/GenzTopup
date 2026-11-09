"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Zap } from "lucide-react";

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
    <div className="min-h-screen flex items-center justify-center p-4 bg-anime-4d relative">
      <div className="bg-grid-4d" />
      
      <div className="w-full max-w-md relative z-10">
        <Link href="/" className="flex items-center justify-center gap-3 mb-10 group">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-brand-primary to-brand-accent flex items-center justify-center shadow-glow-primary group-hover:scale-110 transition-transform">
            <Zap className="h-8 w-8 text-white" />
          </div>
          <span className="font-display text-4xl font-bold tracking-tight">
            ZENNLYY<span className="text-brand-primary">STORE</span>
          </span>
        </Link>

        <div className="glass-card p-8 border-white/10">
          <div className="text-center mb-8">
            <h1 className="font-display text-2xl font-bold mb-2 flex items-center justify-center gap-2">
              <ShieldCheck className="h-6 w-6 text-brand-accent" /> Secure Login
            </h1>
            <p className="text-sm text-brand-muted">Access the ZennLyyStore command center.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="label">Email Address</label>
              <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@zennlyystore.com" required />
            </div>
            <div>
              <label className="label">Password</label>
              <input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400 flex items-center gap-2 animate-pulse">
                <span className="h-2 w-2 rounded-full bg-red-500"></span> {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-base mt-2">
              {loading ? "Authenticating..." : "Enter System"}
            </button>
          </form>
          <p className="text-xs text-brand-muted/50 text-center mt-8 font-mono">© {new Date().getFullYear()} ZennLyyStore Core.</p>
        </div>
      </div>
    </div>
  );
}
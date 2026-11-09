"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, ShieldBan, ShieldAlert } from "lucide-react";

interface Blocked {
  id: string;
  type: string;
  value: string;
  reason: string | null;
  createdAt: string;
}

const TYPES = ["email", "phone", "ip", "uid"] as const;

export default function BanlistPage() {
  const [items, setItems] = useState<Blocked[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ type: "email", value: "", reason: "" });
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/banlist");
    if (res.ok) setItems(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function add() {
    setSaving(true);
    const res = await fetch("/api/admin/banlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) { setForm({ type: form.type, value: "", reason: "" }); await load(); }
    else {
      const d = await res.json().catch(() => null);
      alert(d?.error || "Failed");
    }
    setSaving(false);
  }

  async function remove(id: string) {
    if (!confirm("Remove from banlist?")) return;
    await fetch(`/api/admin/banlist/${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold mb-2 flex items-center gap-3">
          <ShieldBan className="h-8 w-8 text-red-500" /> Security Banlist
        </h1>
        <p className="text-brand-muted text-sm">Block malicious emails, phones, IPs, and UIDs from placing orders.</p>
      </div>

      <div className="glass-card p-6 mb-8 border-red-500/20 bg-red-500/[0.02]">
        <h2 className="text-sm font-bold uppercase tracking-wider mb-4 text-red-400 flex items-center gap-2">
          <ShieldAlert className="h-4 w-4" /> Add New Restriction
        </h2>
        <div className="grid sm:grid-cols-4 gap-4">
          <select className="input border-red-500/20 focus:border-red-500 focus:ring-red-500/30" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            {TYPES.map((t) => <option key={t} value={t} className="bg-brand-surface">{t.toUpperCase()}</option>)}
          </select>
          <input className="input sm:col-span-2 border-red-500/20 focus:border-red-500 focus:ring-red-500/30" placeholder="Value (e.g. baduser@email.com)" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} />
          <input className="input border-red-500/20 focus:border-red-500 focus:ring-red-500/30" placeholder="Reason (optional)" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
        </div>
        <div className="mt-5">
          <button onClick={add} disabled={saving || !form.value} className="rounded-xl bg-red-500/10 border border-red-500/30 px-5 py-2.5 text-sm font-bold text-red-400 hover:bg-red-500/20 transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
            <Plus className="h-4 w-4" /> {saving ? "Blocking..." : "Block Entity"}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-brand-muted text-sm animate-pulse">Scanning database...</div>
      ) : items.length === 0 ? (
        <div className="glass-card p-12 text-center text-brand-muted text-sm">No bans in place. System is clean.</div>
      ) : (
        <div className="glass-card overflow-x-auto">
          <table className="table-modern">
            <thead>
              <tr>
                <th>Type</th>
                <th>Value</th>
                <th>Reason</th>
                <th>Date Added</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((b) => (
                <tr key={b.id}>
                  <td>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 uppercase tracking-widest">
                      {b.type}
                    </span>
                  </td>
                  <td className="font-mono text-white">{b.value}</td>
                  <td className="text-brand-muted">{b.reason || "--"}</td>
                  <td className="text-xs text-brand-muted font-mono">{new Date(b.createdAt).toLocaleString()}</td>
                  <td className="text-right">
                    <button onClick={() => remove(b.id)} className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
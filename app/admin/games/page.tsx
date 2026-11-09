"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Plus, Edit, Trash2, Gamepad2, ArrowUp, ArrowDown, 
  Star, Image as ImageIcon, Save, X, UploadCloud 
} from "lucide-react";

export default function AdminGamesPage() {
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);
  const [creating, setCreating] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/games");
    if (res.ok) setGames(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function toggleActive(game: any) {
    await fetch(`/api/admin/games/${game.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !game.active }),
    });
    await load();
  }

  async function toggleFeatured(game: any) {
    await fetch(`/api/admin/games/${game.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ featured: !game.featured }),
    });
    await load();
  }

  async function deleteGame(game: any) {
    if (!confirm(`Delete "${game.name}" and all its products/orders? This cannot be undone.`)) return;
    await fetch(`/api/admin/games/${game.id}`, { method: "DELETE" });
    await load();
  }

  async function reorder(id: string, direction: "up" | "down") {
    await fetch("/api/admin/games/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, direction }),
    });
    await load();
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold mb-2 flex items-center gap-3">
            <Gamepad2 className="h-8 w-8 text-brand-primary" /> Game Management
          </h1>
          <p className="text-brand-muted text-sm">Manage the games available for top-up on ZennLyyStore.</p>
        </div>
        <button 
          onClick={() => { setCreating(true); setEditing(null); }} 
          className="btn-primary"
        >
          <Plus className="h-5 w-5" /> Add New Game
        </button>
      </div>

      {(creating || editing) && (
        <GameForm
          initial={editing}
          onCancel={() => { setCreating(false); setEditing(null); }}
          onSaved={async () => {
            setCreating(false);
            setEditing(null);
            await load();
          }}
        />
      )}

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-modern">
            <thead>
              <tr>
                <th className="w-16 text-center">Order</th>
                <th>Game Name</th>
                <th>Publisher</th>
                <th className="text-center">Products</th>
                <th className="text-center">Orders</th>
                <th className="text-center">Featured</th>
                <th className="text-center">Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-brand-muted animate-pulse">
                    Loading game database...
                  </td>
                </tr>
              ) : games.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-20 text-center">
                    <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-white/5 mb-4">
                      <Gamepad2 className="h-10 w-10 text-brand-muted/50" />
                    </div>
                    <p className="text-white font-bold text-lg mb-1">No games found</p>
                    <p className="text-brand-muted text-sm mb-6">Add your first game to start selling top-ups.</p>
                    <button 
                      onClick={() => setCreating(true)} 
                      className="btn-primary py-2 px-6 text-sm"
                    >
                      + Add Game
                    </button>
                  </td>
                </tr>
              ) : (
                games.map((g, idx) => (
                  <tr key={g.id} className="group">
                    <td className="text-center">
                      <div className="flex flex-col items-center gap-1">
                        <button
                          onClick={() => reorder(g.id, "up")}
                          disabled={idx === 0}
                          className="p-1 text-brand-muted hover:text-brand-primary disabled:opacity-20 transition-colors"
                          title="Move up"
                        >
                          <ArrowUp className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => reorder(g.id, "down")}
                          disabled={idx === games.length - 1}
                          className="p-1 text-brand-muted hover:text-brand-primary disabled:opacity-20 transition-colors"
                          title="Move down"
                        >
                          <ArrowDown className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                    <td>
                      <div className="font-bold text-white text-base">{g.name}</div>
                      <div className="font-mono text-[10px] text-brand-muted mt-1 bg-white/5 inline-block px-2 py-0.5 rounded">/{g.slug}</div>
                    </td>
                    <td className="text-brand-muted">{g.publisher}</td>
                    <td className="text-center font-mono font-bold text-brand-accent bg-brand-accent/10 rounded-lg py-1 px-2 inline-block mt-2">{g._count.products}</td>
                    <td className="text-center font-mono font-bold text-brand-primary bg-brand-primary/10 rounded-lg py-1 px-2 inline-block mt-2">{g._count.orders}</td>
                    <td className="text-center">
                      <button 
                        onClick={() => toggleFeatured(g)} 
                        className={`p-2 rounded-xl transition-all ${g.featured ? "text-yellow-400 bg-yellow-400/10 shadow-[0_0_10px_rgba(250,204,21,0.2)]" : "text-brand-muted hover:bg-white/5"}`}
                      >
                        <Star className="h-5 w-5" fill={g.featured ? "currentColor" : "none"} />
                      </button>
                    </td>
                    <td className="text-center">
                      <button onClick={() => toggleActive(g)}>
                        <span className={`inline-block h-6 w-11 rounded-full relative transition-colors ${g.active ? "bg-green-500/80 shadow-[0_0_10px_rgba(34,197,94,0.4)]" : "bg-white/10"}`}>
                          <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform shadow-md ${g.active ? "translate-x-6" : "translate-x-1"}`} />
                        </span>
                      </button>
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          href={`/admin/products?gameId=${g.id}`} 
                          className="px-3 py-1.5 text-xs font-bold text-brand-accent bg-brand-accent/10 rounded-lg hover:bg-brand-accent/20 transition-colors"
                        >
                          Products
                        </Link>
                        <button 
                          onClick={() => { setEditing(g); setCreating(false); window.scrollTo(0, 0); }} 
                          className="p-2 rounded-lg bg-white/5 text-brand-primary hover:bg-brand-primary/20 transition-colors"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => deleteGame(g)} 
                          className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// GAME FORM COMPONENT
// ==========================================

function GameForm({ initial, onCancel, onSaved }: { initial: any; onCancel: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    slug: initial?.slug || "",
    name: initial?.name || "",
    publisher: initial?.publisher || "",
    description: initial?.description || "",
    imageUrl: initial?.imageUrl || "",
    bannerUrl: initial?.bannerUrl || "",
    currencyName: initial?.currencyName || "",
    uidLabel: initial?.uidLabel || "Player ID",
    uidExample: initial?.uidExample || "",
    requiresServer: initial?.requiresServer || false,
    servers: (() => { try { return (JSON.parse(initial?.servers || "[]") as string[]).join(", "); } catch { return ""; } })(),
    featured: initial?.featured || false,
    active: initial?.active ?? true,
    sortOrder: initial?.sortOrder || 0,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const payload = {
      ...form,
      servers: JSON.stringify(form.servers.split(",").map((s: string) => s.trim()).filter(Boolean)),
      bannerUrl: form.bannerUrl || undefined,
      description: form.description || undefined,
      uidExample: form.uidExample || undefined,
    };
    const url = initial ? `/api/admin/games/${initial.id}` : "/api/admin/games";
    const method = initial ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to save");
      setSaving(false);
      return;
    }
    onSaved();
  }

  return (
    <form onSubmit={save} className="glass-card p-6 sm:p-8 mb-10 border-brand-primary/30 bg-brand-primary/[0.02]">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
        <h3 className="font-display text-2xl font-bold text-white flex items-center gap-3">
          {initial ? <Edit className="h-6 w-6 text-brand-accent" /> : <Plus className="h-6 w-6 text-brand-primary" />}
          {initial ? "Edit Game Details" : "Add New Game"}
        </h3>
        <button type="button" onClick={onCancel} className="text-brand-muted hover:text-white bg-white/5 p-2 rounded-lg transition-colors">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div>
          <label className="label">Game Name *</label>
          <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Mobile Legends" />
        </div>
        <div>
          <label className="label">Slug (URL-safe) *</label>
          <input
            className="input font-mono text-brand-accent"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })}
            disabled={!!initial}
            required
            placeholder="mobile-legends"
          />
        </div>
        <div>
          <label className="label">Publisher *</label>
          <input className="input" value={form.publisher} onChange={(e) => setForm({ ...form, publisher: e.target.value })} required placeholder="e.g. Moonton" />
        </div>
        <div>
          <label className="label">Currency Name *</label>
          <input className="input" value={form.currencyName} onChange={(e) => setForm({ ...form, currencyName: e.target.value })} required placeholder="e.g. Diamonds" />
        </div>
        <div className="md:col-span-2">
          <label className="label">Description (Optional)</label>
          <input className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Short description of the game..." />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <div className="space-y-4">
          <label className="label">Game Icon (Square Cover) *</label>
          <ImageField value={form.imageUrl} onChange={(v) => setForm({ ...form, imageUrl: v })} required />
        </div>
        <div className="space-y-4">
          <label className="label">Banner (Wide, Optional)</label>
          <ImageField value={form.bannerUrl} onChange={(v) => setForm({ ...form, bannerUrl: v })} />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8 p-6 bg-black/30 rounded-2xl border border-white/5">
        <div>
          <label className="label">UID Label</label>
          <input className="input" value={form.uidLabel} onChange={(e) => setForm({ ...form, uidLabel: e.target.value })} placeholder="Player ID" />
        </div>
        <div>
          <label className="label">UID Example</label>
          <input className="input" value={form.uidExample} onChange={(e) => setForm({ ...form, uidExample: e.target.value })} placeholder="12345678" />
        </div>
        <div>
          <label className="label">Servers (comma-separated)</label>
          <input className="input" value={form.servers} onChange={(e) => setForm({ ...form, servers: e.target.value })} placeholder="Asia, America, Europe" disabled={!form.requiresServer} />
        </div>
      </div>

      <div className="flex flex-wrap gap-6 mb-8 p-5 glass-card bg-white/[0.02]">
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" className="w-5 h-5 accent-brand-primary" checked={form.requiresServer} onChange={(e) => setForm({ ...form, requiresServer: e.target.checked })} />
          <span className="text-sm font-bold text-white">Requires Server Selection</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" className="w-5 h-5 accent-yellow-500" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
          <span className="text-sm font-bold text-white flex items-center gap-1"><Star className="h-4 w-4 text-yellow-400" /> Featured Game</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" className="w-5 h-5 accent-green-500" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
          <span className="text-sm font-bold text-white">Active on Site</span>
        </label>
        <div className="ml-auto flex items-center gap-2">
           <span className="text-sm text-brand-muted font-bold">Sort Order:</span>
           <input type="number" className="input py-1 px-3 w-20 text-center" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} />
        </div>
      </div>

      {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400 mb-6 flex items-center gap-2 animate-pulse"><X className="h-4 w-4" /> {error}</div>}

      <div className="flex gap-4 border-t border-white/5 pt-6">
        <button type="submit" disabled={saving} className="btn-primary px-8">
          <Save className="h-5 w-5" /> {saving ? "Saving..." : initial ? "Update Game" : "Create Game"}
        </button>
        <button type="button" onClick={onCancel} className="btn-ghost px-8">Cancel</button>
      </div>
    </form>
  );
}

// ==========================================
// IMAGE UPLOAD FIELD COMPONENT
// ==========================================

function ImageField({
  value,
  onChange,
  required,
}: {
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleFile(file: File) {
    setErr(null);
    if (file.size > 5 * 1024 * 1024) {
      setErr("File size must be less than 5MB.");
      return;
    }
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      onChange(data.url);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        {value ? (
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black/50 shadow-lg group">
            <img src={value} alt="Preview" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute inset-0 bg-red-500/80 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="h-6 w-6" />
            </button>
          </div>
        ) : (
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl border-2 border-dashed border-white/20 bg-white/[0.02] text-brand-muted">
            <ImageIcon className="h-8 w-8 opacity-50" />
          </div>
        )}
        
        <div className="flex-1">
          <label className={`btn-ghost cursor-pointer inline-flex border-white/10 hover:border-brand-accent/50 hover:bg-brand-accent/10 hover:text-brand-accent ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
            {uploading ? (
              <><UploadCloud className="h-5 w-5 animate-bounce" /> Uploading...</>
            ) : (
              <><ImageIcon className="h-5 w-5" /> Choose Image</>
            )}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
              className="hidden"
              disabled={uploading}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
                e.target.value = "";
              }}
            />
          </label>
          <p className="text-[10px] text-brand-muted mt-2">PNG, JPG, WEBP up to 5MB.</p>
        </div>
      </div>
      
      <div className="relative">
        <input
          className="input font-mono text-xs pl-10 border-white/5 focus:border-brand-primary/50 bg-black/40"
          placeholder="Or paste image URL here..."
          value={value}
          required={required}
          onChange={(e) => onChange(e.target.value)}
        />
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
        </div>
      </div>
      
      {err && <div className="text-xs text-red-400 bg-red-500/10 p-2 rounded border border-red-500/20">{err}</div>}
    </div>
  );
}
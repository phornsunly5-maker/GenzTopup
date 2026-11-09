"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, Edit, Trash2, Gem } from "lucide-react";

function ProductsAdminContent() {
  const searchParams = useSearchParams();
  const gameIdFilter = searchParams.get("gameId") || "";

  const [games, setGames] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedGame, setSelectedGame] = useState(gameIdFilter);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);
  const [creating, setCreating] = useState(false);

  async function loadAll() {
    setLoading(true);
    const [gRes, pRes] = await Promise.all([
      fetch("/api/admin/games").then((r) => r.json()),
      fetch(`/api/admin/products${selectedGame ? `?gameId=${selectedGame}` : ""}`).then((r) => r.json()),
    ]);
    setGames(gRes);
    setProducts(pRes);
    setLoading(false);
  }

  useEffect(() => { loadAll(); }, [selectedGame]);

  async function toggleActive(p: any) {
    await fetch(`/api/admin/products/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !p.active }),
    });
    await loadAll();
  }

  async function deleteProduct(p: any) {
    if (!confirm(`Delete "${p.name}"?`)) return;
    await fetch(`/api/admin/products/${p.id}`, { method: "DELETE" });
    await loadAll();
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold mb-2 flex items-center gap-3">
            <Gem className="h-8 w-8 text-brand-primary" /> Products
          </h1>
          <p className="text-brand-muted text-sm">Configure top-up packages and pricing.</p>
        </div>
        <button onClick={() => setCreating(true)} className="btn-primary"><Plus className="h-5 w-5" /> Add Product</button>
      </div>

      <div className="glass-card p-5 mb-8 flex items-center gap-4">
        <label className="text-sm font-bold text-white whitespace-nowrap">Filter by Game:</label>
        <select className="input max-w-xs bg-black/40 border-white/10" value={selectedGame} onChange={(e) => setSelectedGame(e.target.value)}>
          <option value="">All Games</option>
          {games.map((g) => <option key={g.id} value={g.id} className="bg-brand-surface">{g.name}</option>)}
        </select>
      </div>

      {(creating || editing) && (
        <ProductForm
          games={games} defaultGameId={selectedGame} initial={editing}
          onCancel={() => { setCreating(false); setEditing(null); }}
          onSaved={async () => { setCreating(false); setEditing(null); await loadAll(); }}
        />
      )}

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-modern">
            <thead>
              <tr>
                <th>Game</th>
                <th>Package Name</th>
                <th className="text-right">Amount</th>
                <th className="text-right">Bonus</th>
                <th className="text-right">Price (USD)</th>
                <th className="text-center">Badge</th>
                <th className="text-center">Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="px-6 py-12 text-center text-brand-muted animate-pulse">Loading catalog...</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={8} className="px-6 py-20 text-center">
                  <div className="text-4xl mb-3 opacity-50">💎</div>
                  <p className="text-brand-muted text-lg mb-1">No products yet</p>
                  <p className="text-sm text-brand-muted/60 mb-4">Add packages for customers to purchase.</p>
                  <button onClick={() => setCreating(true)} className="btn-primary py-2 px-4 text-sm">+ Add Product</button>
                </td></tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id}>
                    <td className="text-brand-muted font-medium">{p.game.name}</td>
                    <td className="font-bold text-white">{p.name}</td>
                    <td className="text-right font-mono text-brand-text">{p.amount.toLocaleString()}</td>
                    <td className="text-right font-mono text-brand-accent">{p.bonus > 0 ? `+${p.bonus}` : "--"}</td>
                    <td className="text-right font-mono font-bold text-brand-primary">${p.priceUsd.toFixed(2)}</td>
                    <td className="text-center">
                      {p.badge ? (
                        <span className="text-[10px] bg-brand-accent/20 text-brand-accent px-2 py-0.5 rounded border border-brand-accent/30 uppercase tracking-wider">{p.badge}</span>
                      ) : "--"}
                    </td>
                    <td className="text-center">
                      <button onClick={() => toggleActive(p)}>
                        <span className={`inline-block h-6 w-11 rounded-full relative transition-colors ${p.active ? "bg-green-500/80 shadow-[0_0_10px_rgba(34,197,94,0.4)]" : "bg-white/10"}`}>
                          <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform shadow-md ${p.active ? "translate-x-6" : "translate-x-1"}`} />
                        </span>
                      </button>
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setEditing(p)} className="p-2 rounded-lg bg-white/5 text-brand-accent hover:bg-brand-accent/20 transition-colors"><Edit className="h-4 w-4" /></button>
                        <button onClick={() => deleteProduct(p)} className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-colors"><Trash2 className="h-4 w-4" /></button>
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

export default function AdminProductsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-brand-muted">Loading products...</div>}>
      <ProductsAdminContent />
    </Suspense>
  );
}

function ProductForm({ games, defaultGameId, initial, onCancel, onSaved }: any) {
  const [form, setForm] = useState({
    gameId: initial?.gameId || defaultGameId || games[0]?.id || "",
    name: initial?.name || "", amount: initial?.amount ?? 0, bonus: initial?.bonus ?? 0,
    priceUsd: initial?.priceUsd ?? 0, badge: initial?.badge || "", active: initial?.active ?? true, sortOrder: initial?.sortOrder ?? 0,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setError(null);
    const payload = { ...form, amount: Number(form.amount), bonus: Number(form.bonus), priceUsd: Number(form.priceUsd), sortOrder: Number(form.sortOrder), badge: form.badge || null };
    const url = initial ? `/api/admin/products/${initial.id}` : "/api/admin/products";
    const method = initial ? "PATCH" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (!res.ok) { const data = await res.json(); setError(data.error || "Failed"); setSaving(false); return; }
    onSaved();
  }

  return (
    <form onSubmit={save} className="glass-card p-6 mb-8 border-brand-primary/20 bg-brand-primary/[0.02]">
      <h3 className="font-display text-xl font-bold text-white mb-6">{initial ? "Edit Product Details" : "Create New Product"}</h3>
      
      <div className="grid md:grid-cols-3 gap-5 mb-6">
        <div className="md:col-span-3">
          <label className="label">Associated Game</label>
          <select className="input" value={form.gameId} onChange={(e) => setForm({ ...form, gameId: e.target.value })} disabled={!!initial} required>
            <option value="">-- select game --</option>
            {games.map((g: any) => <option key={g.id} value={g.id} className="bg-brand-surface">{g.name}</option>)}
          </select>
        </div>
        <div className="md:col-span-3">
          <label className="label">Package Name (e.g. 86 Diamonds)</label>
          <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="e.g. 100 + 10 Bonus Diamonds" />
        </div>
        <div>
          <label className="label">Amount (0 for passes)</label>
          <input className="input" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
        </div>
        <div>
          <label className="label">Bonus Amount</label>
          <input className="input" type="number" value={form.bonus} onChange={(e) => setForm({ ...form, bonus: e.target.value })} />
        </div>
        <div>
          <label className="label">Price (USD)</label>
          <input className="input border-brand-primary/30 focus:border-brand-primary" type="number" step="0.01" value={form.priceUsd} onChange={(e) => setForm({ ...form, priceUsd: e.target.value })} required />
        </div>
        <div>
          <label className="label">Badge (Hot, Best Value, Pass)</label>
          <input className="input" value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} placeholder="Optional" />
        </div>
        <div>
          <label className="label">Sort Order</label>
          <input className="input" type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} />
        </div>
        <div className="flex items-end pb-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" className="w-5 h-5 accent-brand-primary" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
            <span className="text-sm font-bold text-white">Active for sale</span>
          </label>
        </div>
      </div>

      {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400 mb-6">{error}</div>}

      <div className="flex gap-3 border-t border-white/5 pt-6">
        <button type="submit" disabled={saving} className="btn-primary">{saving ? "Saving..." : initial ? "Update Product" : "Create Product"}</button>
        <button type="button" onClick={onCancel} className="btn-ghost">Cancel</button>
      </div>
    </form>
  );
}
"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { Search, Download, Trash2, ShieldAlert, FileText } from "lucide-react";

const STATUSES = ["ALL", "PENDING", "PAID", "PROCESSING", "DELIVERED", "FAILED", "REFUNDED", "CANCELLED"];

const PILL_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  PAID: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  PROCESSING: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
  DELIVERED: "bg-green-500/10 text-green-400 border-green-500/30",
  FAILED: "bg-red-500/10 text-red-400 border-red-500/30",
  REFUNDED: "bg-brand-muted/10 text-brand-muted border-brand-border",
  CANCELLED: "bg-brand-muted/10 text-brand-muted border-brand-border",
};

function AdminOrdersContent() {
  const [orders, setOrders] = useState<any[]>([]);
  const [status, setStatus] = useState("ALL");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);

  async function load() {
    setLoading(true);
    const params = new URLSearchParams({ status, page: String(page) });
    if (q) params.set("q", q);
    const res = await fetch(`/api/admin/orders?${params}`);
    const data = await res.json();
    setOrders(data.orders);
    setTotalPages(data.totalPages);
    setLoading(false);

    try {
      const countRes = await fetch(`/api/admin/orders?status=PAID&page=1`);
      const countData = await countRes.json();
      setPendingCount(countData.total ?? countData.orders?.length ?? 0);
    } catch { /* ignore */ }
  }

  async function clearAllOrders() {
    const scope = status === "ALL" ? "ALL orders (every status)" : `all ${status} orders`;
    const typed = window.prompt(`This will PERMANENTLY DELETE ${scope} from the database.\n\nType DELETE to confirm.`);
    if (typed !== "DELETE") return;

    const res = await fetch("/api/admin/orders/bulk", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirm: "DELETE", status }),
    });
    const data = await res.json();
    if (!res.ok) { window.alert(data.error || "Failed to delete orders."); return; }
    window.alert(`Deleted ${data.deleted} order(s).`);
    setPage(1);
    load();
  }

  useEffect(() => { load(); }, [status, page]);

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold mb-2 flex items-center gap-3">
            <FileText className="h-8 w-8 text-brand-accent" /> Order Management
          </h1>
          <p className="text-brand-muted text-sm">Monitor and fulfill customer top-up requests.</p>
        </div>
        <a
          href={`/api/admin/orders/export?${new URLSearchParams({ ...(status !== "ALL" && { status }), ...(q && { q }) }).toString()}`}
          className="btn-ghost text-sm border-white/10 hover:border-brand-accent/50"
        >
          <Download className="h-4 w-4" /> Export CSV
        </a>
      </div>

      {pendingCount > 0 && status !== "PAID" && (
        <button
          onClick={() => { setStatus("PAID"); setPage(1); }}
          className="w-full mb-8 group relative overflow-hidden rounded-2xl border border-brand-primary/40 bg-brand-primary/10 px-6 py-5 text-left transition-all hover:bg-brand-primary/20 hover:shadow-[0_0_30px_rgba(168,85,247,0.2)]"
        >
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-4">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-primary opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-brand-primary" />
              </span>
              <div>
                <div className="font-display text-lg font-bold text-white group-hover:text-brand-primary transition-colors">
                  {pendingCount} order{pendingCount === 1 ? "" : "s"} awaiting fulfillment
                </div>
                <div className="text-sm text-brand-muted mt-0.5">Click here to filter by PAID and process them.</div>
              </div>
            </div>
            <span className="text-brand-primary group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </button>
      )}

      <div className="glass-card p-4 mb-6 flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => { setStatus(s); setPage(1); }}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-300 ${
                status === s 
                ? "bg-brand-primary text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]" 
                : "bg-white/5 text-brand-muted hover:bg-white/10 hover:text-white"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <form
          className="flex gap-2 w-full lg:w-auto"
          onSubmit={(e) => { e.preventDefault(); setPage(1); load(); }}
        >
          <div className="relative w-full lg:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-muted" />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search Order #, UID..."
              className="input pl-10 text-sm py-2.5"
            />
          </div>
          <button type="submit" className="btn-ghost text-sm px-4">Search</button>
        </form>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-modern">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Game</th>
                <th>Product</th>
                <th>UID</th>
                <th className="text-right">Amount</th>
                <th className="text-center">Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-brand-muted animate-pulse">Scanning database...</td></tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center">
                    <div className="text-4xl mb-3 opacity-50">📦</div>
                    <p className="text-brand-muted font-medium text-lg mb-1">No orders found</p>
                    <p className="text-sm text-brand-muted/60">Try adjusting the filters or search query.</p>
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id} className={o.status === "PAID" ? "bg-brand-primary/5" : ""}>
                    <td>
                      <Link href={`/admin/orders/${o.orderNumber}`} className="font-mono text-brand-primary hover:text-brand-accent transition-colors font-bold">
                        {o.orderNumber}
                      </Link>
                    </td>
                    <td className="font-medium text-white">{o.game.name}</td>
                    <td className="text-brand-muted">{o.product.name}</td>
                    <td className="font-mono text-xs text-brand-text/70">{o.playerUid}</td>
                    <td className="text-right font-mono font-semibold text-white">${o.amountUsd.toFixed(2)}</td>
                    <td className="text-center">
                      <span className={`inline-block rounded-md border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${PILL_COLORS[o.status]}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="text-brand-muted text-xs whitespace-nowrap">
                      {new Date(o.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t border-white/5 flex justify-between items-center text-sm bg-white/[0.02]">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn-ghost text-xs py-1.5 px-4 disabled:opacity-30">
              ← Prev
            </button>
            <span className="text-brand-muted font-mono text-xs">Page {page} / {totalPages}</span>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-ghost text-xs py-1.5 px-4 disabled:opacity-30">
              Next →
            </button>
          </div>
        )}
      </div>

      <div className="mt-10 glass-card border-red-500/20 bg-red-500/[0.02] p-6">
        <h2 className="font-display text-lg font-bold text-red-400 mb-2 flex items-center gap-2">
          <ShieldAlert className="h-5 w-5" /> Danger Zone
        </h2>
        <p className="text-sm text-brand-muted mb-5 max-w-2xl">
          Permanently delete orders from the database. This action is irreversible and is recorded in the audit log. The current filter (<span className="text-white font-bold">{status === "ALL" ? "ALL statuses" : status}</span>) will be used.
        </p>
        <button onClick={clearAllOrders} className="rounded-xl border border-red-500/40 bg-red-500/10 px-5 py-2.5 text-sm font-bold text-red-400 hover:bg-red-500 hover:text-white transition-all flex items-center gap-2">
          <Trash2 className="h-4 w-4" /> Delete {status === "ALL" ? "All Orders" : `${status} Orders`}
        </button>
      </div>
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={<div className="p-8 text-brand-muted">Loading orders...</div>}>
      <AdminOrdersContent />
    </Suspense>
  );
}
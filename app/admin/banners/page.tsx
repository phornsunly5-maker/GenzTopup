"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Save, X, Image as ImageIcon, LayoutTemplate } from "lucide-react";

interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  linkUrl: string | null;
  ctaLabel: string | null;
  active: boolean;
  sortOrder: number;
}

const empty = {
  title: "", subtitle: "", imageUrl: "", linkUrl: "", ctaLabel: "", active: true, sortOrder: 0,
};

export default function BannersAdminPage() {
  const [items, setItems] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/banners");
    if (res.ok) setItems(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openNew() { setEditing(null); setForm(empty); }

  function openEdit(b: Banner) {
    setEditing(b);
    setForm({
      title: b.title, subtitle: b.subtitle ?? "", imageUrl: b.imageUrl,
      linkUrl: b.linkUrl ?? "", ctaLabel: b.ctaLabel ?? "", active: b.active, sortOrder: b.sortOrder,
    });
  }

  async function upload(file: File) {
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    if (res.ok) {
      const data = await res.json();
      setForm((f) => ({ ...f, imageUrl: data.url }));
    }
    setUploading(false);
  }

  async function save() {
    setSaving(true);
    const url = editing ? `/api/admin/banners/${editing.id}` : "/api/admin/banners";
    const method = editing ? "PATCH" : "POST";
    const res = await fetch(url, {
      method, headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, subtitle: form.subtitle || null, linkUrl: form.linkUrl || null, ctaLabel: form.ctaLabel || null }),
    });
    if (res.ok) { setForm(empty); setEditing(null); await load(); }
    else alert("Save failed");
    setSaving(false);
  }

  async function remove(id: string) {
    if (!confirm("Delete this banner permanently?")) return;
    await fetch(`/api/admin/banners/${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold mb-2 flex items-center gap-3">
            <LayoutTemplate className="h-8 w-8 text-brand-accent" /> Hero Banners
          </h1>
          <p className="text-brand-muted text-sm">Manage the 4D Anime slides for the homepage carousel.</p>
        </div>
        <button onClick={openNew} className="btn-primary"><Plus className="h-5 w-5" /> New Banner</button>
      </div>

      {/* Editor */}
      <div className="glass-card p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white">{editing ? `Editing: ${editing.title}` : "Create New Banner"}</h2>
          {editing && (
            <button onClick={openNew} className="text-xs font-bold text-brand-muted hover:text-white flex items-center gap-1">
              <X className="h-4 w-4" /> Cancel Edit
            </button>
          )}
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <label className="label">Title *</label>
            <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. 50% OFF Free Fire" />
          </div>
          <div>
            <label className="label">Subtitle</label>
            <input className="input" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} placeholder="Limited time offer" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Image URL *</label>
            <div className="flex items-center gap-3">
              <input type="text" className="input flex-1" placeholder="https://... or /uploads/..." value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
              <label className="btn-ghost cursor-pointer bg-white/5 hover:bg-white/10 border-white/10">
                <ImageIcon className="h-5 w-5" />
                {uploading ? "Wait..." : "Upload"}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
              </label>
            </div>
            {form.imageUrl && (
              <div className="mt-4 relative rounded-xl overflow-hidden border border-white/10 group">
                <img src={form.imageUrl} alt="Preview" className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
            )}
          </div>
          <div>
            <label className="label">Link URL</label>
            <input className="input" value={form.linkUrl} onChange={(e) => setForm({ ...form, linkUrl: e.target.value })} placeholder="/games/pubg-mobile" />
          </div>
          <div>
            <label className="label">Button Label (CTA)</label>
            <input className="input" value={form.ctaLabel} onChange={(e) => setForm({ ...form, ctaLabel: e.target.value })} placeholder="Top up now" />
          </div>
          <div>
            <label className="label">Sort Order</label>
            <input type="number" className="input" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })} />
          </div>
          <div className="flex items-end pb-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <div className="relative">
                <input type="checkbox" className="sr-only" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
                <div className={`block w-10 h-6 rounded-full transition-colors ${form.active ? 'bg-brand-primary' : 'bg-white/10'}`}></div>
                <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${form.active ? 'translate-x-4' : ''}`}></div>
              </div>
              <span className="text-sm font-medium">Active on site</span>
            </label>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/5">
          <button onClick={save} disabled={saving || !form.title || !form.imageUrl} className="btn-primary">
            <Save className="h-5 w-5" /> {saving ? "Saving..." : editing ? "Update Banner" : "Publish Banner"}
          </button>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="text-brand-muted animate-pulse">Loading banners...</div>
      ) : items.length === 0 ? (
        <div className="glass-card p-12 text-center text-brand-muted text-sm">No banners active. The site will use default gradients.</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((b) => (
            <div key={b.id} className="glass-card overflow-hidden group">
              <div className="relative h-48 overflow-hidden">
                <img src={b.imageUrl} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute top-3 right-3">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-md backdrop-blur-md border ${b.active ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-black/50 text-white/50 border-white/10"}`}>
                    {b.active ? "LIVE" : "HIDDEN"}
                  </span>
                </div>
                <div className="absolute bottom-3 left-4 right-4">
                  <h3 className="font-display font-bold text-white text-lg leading-tight truncate">{b.title}</h3>
                </div>
              </div>
              <div className="p-4 flex items-center justify-between border-t border-white/5 bg-white/[0.02]">
                <button onClick={() => openEdit(b)} className="text-sm font-medium text-brand-accent hover:text-white transition-colors">Edit Settings</button>
                <button onClick={() => remove(b.id)} className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Save, X, HelpCircle } from "lucide-react";

interface Faq {
  id: string; question: string; answer: string; category: string; active: boolean; sortOrder: number;
}

const empty = { question: "", answer: "", category: "general", active: true, sortOrder: 0 };

export default function FaqsAdminPage() {
  const [items, setItems] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Faq | null>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/faqs");
    if (res.ok) setItems(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function save() {
    setSaving(true);
    const url = editing ? `/api/admin/faqs/${editing.id}` : "/api/admin/faqs";
    const method = editing ? "PATCH" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (res.ok) { setForm(empty); setEditing(null); await load(); }
    else alert("Save failed");
    setSaving(false);
  }

  async function remove(id: string) {
    if (!confirm("Delete this FAQ?")) return;
    await fetch(`/api/admin/faqs/${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold mb-2 flex items-center gap-3">
            <HelpCircle className="h-8 w-8 text-brand-primary" /> FAQ Manager
          </h1>
          <p className="text-brand-muted text-sm">Manage questions shown on the public FAQ page.</p>
        </div>
        <button onClick={() => { setEditing(null); setForm(empty); }} className="btn-primary"><Plus className="h-5 w-5" /> New FAQ</button>
      </div>

      <div className="glass-card p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">{editing ? "Edit FAQ" : "Create New FAQ"}</h2>
          {editing && <button onClick={() => { setEditing(null); setForm(empty); }} className="text-brand-muted hover:text-white"><X className="h-5 w-5" /></button>}
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="label">Question *</label>
            <input className="input" value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Answer *</label>
            <textarea className="input min-h-[100px]" value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} />
          </div>
          <div>
            <label className="label">Category</label>
            <input className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="general" />
          </div>
          <div className="flex items-center gap-6">
             <div>
                <label className="label">Sort</label>
                <input type="number" className="input" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })} />
             </div>
             <label className="flex items-center gap-2 mt-6 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 accent-brand-primary" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
                <span className="text-sm font-bold text-white">Active</span>
             </label>
          </div>
        </div>
        <div className="mt-6 pt-4 border-t border-white/5">
          <button onClick={save} disabled={saving || !form.question || !form.answer} className="btn-primary"><Save className="h-4 w-4" /> Save FAQ</button>
        </div>
      </div>

      {loading ? <div className="text-brand-muted animate-pulse">Loading...</div> : items.length === 0 ? <div className="text-brand-muted">No FAQs yet.</div> : (
        <div className="space-y-3">
          {items.map((f) => (
            <div key={f.id} className="glass-card p-5 flex items-start gap-4 hover:border-brand-primary/30 transition-colors">
              <div className="flex-1">
                <h3 className="font-bold text-white text-lg">{f.question}</h3>
                <p className="text-sm text-brand-muted mt-2 line-clamp-2">{f.answer}</p>
                <div className="flex gap-2 mt-3">
                   <span className="text-[10px] uppercase font-bold bg-white/5 px-2 py-1 rounded text-brand-muted">{f.category}</span>
                   {!f.active && <span className="text-[10px] uppercase font-bold bg-red-500/10 px-2 py-1 rounded text-red-400">Hidden</span>}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setEditing(f); setForm({ question: f.question, answer: f.answer, category: f.category, active: f.active, sortOrder: f.sortOrder }); window.scrollTo(0,0); }} className="btn-ghost text-xs py-1.5 px-3">Edit</button>
                <button onClick={() => remove(f.id)} className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
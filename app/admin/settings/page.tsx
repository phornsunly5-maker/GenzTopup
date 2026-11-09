"use client";

import { useEffect, useState } from "react";
import { Settings as SettingsIcon, Save, ShieldCheck } from "lucide-react";

export default function AdminSettingsPage() {
  const [form, setForm] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings").then((r) => r.json()).then(setForm);
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setSaved(false);
    await fetch("/api/admin/settings", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        siteName: form.siteName, exchangeRate: Number(form.exchangeRate),
        supportTelegram: form.supportTelegram, supportEmail: form.supportEmail,
        maintenanceMode: form.maintenanceMode, maintenanceMessage: form.maintenanceMessage || null,
        announcement: form.announcement || null, announcementTone: form.announcementTone || "info",
        telegramBotToken: form.telegramBotToken || null, telegramChatId: form.telegramChatId || null,
      }),
    });
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (!form) return <div className="p-8 text-brand-muted animate-pulse">Loading settings...</div>;

  return (
    <div className="p-4 sm:p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold mb-2 flex items-center gap-3">
          <SettingsIcon className="h-8 w-8 text-brand-muted" /> System Settings
        </h1>
        <p className="text-brand-muted text-sm">Configure ZennLyyStore global variables.</p>
      </div>

      <form onSubmit={save} className="glass-card p-6 sm:p-8 space-y-6">
        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <label className="label">Site Name</label>
            <input className="input" value={form.siteName || ""} onChange={(e) => setForm({ ...form, siteName: e.target.value })} />
          </div>
          <div>
            <label className="label">Exchange Rate (KHR per $1)</label>
            <input className="input" type="number" value={form.exchangeRate || 4100} onChange={(e) => setForm({ ...form, exchangeRate: e.target.value })} />
          </div>
          <div>
            <label className="label">Support Telegram Handle</label>
            <input className="input" value={form.supportTelegram || ""} onChange={(e) => setForm({ ...form, supportTelegram: e.target.value })} placeholder="@zennlyystore" />
          </div>
          <div>
            <label className="label">Support Email</label>
            <input className="input" type="email" value={form.supportEmail || ""} onChange={(e) => setForm({ ...form, supportEmail: e.target.value })} />
          </div>
        </div>

        <div className="pt-6 border-t border-white/5">
          <label className="label">Site-wide Announcement</label>
          <textarea className="input mb-3" rows={2} value={form.announcement || ""} onChange={(e) => setForm({ ...form, announcement: e.target.value })} placeholder="e.g. Server maintenance at 12 AM!" />
          <div className="flex gap-2">
            {(["info", "warning", "promo"] as const).map((t) => (
              <button key={t} type="button" onClick={() => setForm({ ...form, announcementTone: t })}
                className={`text-xs px-4 py-1.5 rounded-full border font-bold uppercase tracking-wider transition-colors ${
                  (form.announcementTone || "info") === t ? "border-brand-primary bg-brand-primary text-white" : "border-white/10 text-brand-muted hover:bg-white/5"
                }`}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <label className="flex items-center gap-4 p-5 rounded-2xl border border-red-500/20 bg-red-500/[0.02] cursor-pointer">
          <input type="checkbox" className="w-5 h-5 accent-red-500" checked={form.maintenanceMode} onChange={(e) => setForm({ ...form, maintenanceMode: e.target.checked })} />
          <div className="flex-1">
            <div className="font-bold text-white flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-red-400"/> Maintenance Mode</div>
            <div className="text-xs text-brand-muted mt-1">Blocks all new orders instantly. Use with caution.</div>
          </div>
        </label>

        {form.maintenanceMode && (
          <div>
            <label className="label text-red-400">Maintenance Message</label>
            <input className="input border-red-500/30 focus:border-red-500" value={form.maintenanceMessage || ""} onChange={(e) => setForm({ ...form, maintenanceMessage: e.target.value })} placeholder="We will be back shortly..." />
          </div>
        )}

        <div className="pt-6 border-t border-white/5">
          <h2 className="font-display font-bold text-lg text-white mb-2">Telegram Notifications</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Bot Token</label>
              <input className="input font-mono text-xs" value={form.telegramBotToken || ""} onChange={(e) => setForm({ ...form, telegramBotToken: e.target.value })} placeholder="123456:ABC..." />
            </div>
            <div>
              <label className="label">Chat ID</label>
              <input className="input font-mono text-xs" value={form.telegramChatId || ""} onChange={(e) => setForm({ ...form, telegramChatId: e.target.value })} placeholder="-100..." />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 pt-6">
          <button type="submit" disabled={saving} className="btn-primary">
            <Save className="h-5 w-5" /> {saving ? "Saving..." : "Save All Settings"}
          </button>
          {saved && <span className="text-sm font-bold text-green-400 animate-pulse">✓ Settings Saved</span>}
        </div>
      </form>
    </div>
  );
}
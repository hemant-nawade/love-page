'use client';

import { useEffect, useState } from 'react';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/settings').then((r) => r.json()).then((d) => setSettings(d.settings));
  }, []);

  function update(key: string, value: any) {
    setSettings((s: any) => ({ ...s, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    const res = await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        store_name: settings.store_name,
        support_email: settings.support_email,
        delivery_charge: Number(settings.delivery_charge),
        store_active: settings.store_active,
        instagram_url: settings.instagram_url || '',
        whatsapp_number: settings.whatsapp_number || '',
        homepage_headline: settings.homepage_headline,
        homepage_subtext: settings.homepage_subtext,
      }),
    });
    setMessage(res.ok ? 'Settings saved.' : 'Could not save settings.');
    setSaving(false);
  }

  if (!settings) return <p className="text-sm text-charcoal">Loading…</p>;

  return (
    <div className="max-w-xl space-y-4">
      <h1 className="font-display text-xl font-semibold text-ink">Settings</h1>

      <div className="card-lp space-y-3 p-5">
        <label className="block text-sm font-medium text-ink">Store Name</label>
        <input value={settings.store_name} onChange={(e) => update('store_name', e.target.value)} className="w-full rounded-lg border border-rose-200 px-3 py-2 text-sm" />

        <label className="block text-sm font-medium text-ink">Support Email</label>
        <input value={settings.support_email} onChange={(e) => update('support_email', e.target.value)} className="w-full rounded-lg border border-rose-200 px-3 py-2 text-sm" />

        <label className="block text-sm font-medium text-ink">Delivery Charge (₹)</label>
        <input type="number" value={settings.delivery_charge} onChange={(e) => update('delivery_charge', e.target.value)} className="w-full rounded-lg border border-rose-200 px-3 py-2 text-sm" />

        <label className="flex items-center gap-2 text-sm text-charcoal">
          <input type="checkbox" checked={settings.store_active} onChange={(e) => update('store_active', e.target.checked)} /> Store accepting orders
        </label>

        <label className="block text-sm font-medium text-ink">Instagram URL</label>
        <input value={settings.instagram_url || ''} onChange={(e) => update('instagram_url', e.target.value)} className="w-full rounded-lg border border-rose-200 px-3 py-2 text-sm" />

        <label className="block text-sm font-medium text-ink">WhatsApp Number</label>
        <input value={settings.whatsapp_number || ''} onChange={(e) => update('whatsapp_number', e.target.value)} className="w-full rounded-lg border border-rose-200 px-3 py-2 text-sm" />

        <label className="block text-sm font-medium text-ink">Homepage Headline</label>
        <input value={settings.homepage_headline} onChange={(e) => update('homepage_headline', e.target.value)} className="w-full rounded-lg border border-rose-200 px-3 py-2 text-sm" />

        <label className="block text-sm font-medium text-ink">Homepage Subtext</label>
        <input value={settings.homepage_subtext} onChange={(e) => update('homepage_subtext', e.target.value)} className="w-full rounded-lg border border-rose-200 px-3 py-2 text-sm" />
      </div>

      {message && <p className="text-sm font-medium text-green-700">{message}</p>}
      <button onClick={handleSave} disabled={saving} className="btn-primary">{saving ? 'Saving…' : 'Save Settings'}</button>
    </div>
  );
}

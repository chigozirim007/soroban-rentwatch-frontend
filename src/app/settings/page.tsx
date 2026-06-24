"use client";

import { useState } from "react";

export default function SettingsPage() {
  const [webhookUrl, setWebhookUrl] = useState("https://discord.com/api/webhooks/...");
  const [threshold, setThreshold] = useState("15000");
  const [extendTo, setExtendTo] = useState("100000");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">
          Configure your notification preferences and default extension parameters.
        </p>
      </div>

      {/* Notification Settings */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 space-y-6">
        <h2 className="text-sm font-semibold text-white">Notifications</h2>
        <div>
          <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-2 block">
            Webhook URL (Discord / Slack)
          </label>
          <input
            type="url"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            placeholder="https://discord.com/api/webhooks/..."
            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
          />
          <p className="text-[11px] text-slate-600 mt-1.5">
            Receive alerts for CRITICAL, NEAR_EXPIRY, EXTENSION_SUCCESS, LOW_BALANCE events.
          </p>
        </div>
      </div>

      {/* Default Extension Settings */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 space-y-6">
        <h2 className="text-sm font-semibold text-white">Default Extension Parameters</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-2 block">
              Warning Threshold (ledgers)
            </label>
            <input
              type="number"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-300 focus:outline-none focus:border-indigo-500/50 transition-colors"
            />
            <p className="text-[11px] text-slate-600 mt-1.5">
              ~{(parseInt(threshold || "0") / 17280).toFixed(1)} days
            </p>
          </div>
          <div>
            <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-2 block">
              Extend To (ledgers)
            </label>
            <input
              type="number"
              value={extendTo}
              onChange={(e) => setExtendTo(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-300 focus:outline-none focus:border-indigo-500/50 transition-colors"
            />
            <p className="text-[11px] text-slate-600 mt-1.5">
              ~{(parseInt(extendTo || "0") / 17280).toFixed(1)} days
            </p>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        className="px-6 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:opacity-90 transition-opacity"
      >
        {saved ? "✓ Saved!" : "Save Changes"}
      </button>

      {/* Danger Zone */}
      <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.03] p-6 space-y-4">
        <h2 className="text-sm font-semibold text-red-400">Danger Zone</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-300">Delete Account</p>
            <p className="text-xs text-slate-500 mt-0.5">
              Permanently delete your account and all monitored keys.
            </p>
          </div>
          <button className="px-4 py-2 rounded-xl border border-red-500/30 text-sm text-red-400 hover:bg-red-500/10 transition-all">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}

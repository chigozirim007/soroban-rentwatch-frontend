"use client";

import { useEffect, useState } from "react";
import { useWallet } from "../../components/WalletProvider";
import { FiLoader } from "react-icons/fi";

export default function SettingsPage() {
  const { address } = useWallet();
  const [webhookUrl, setWebhookUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load current settings
  useEffect(() => {
    if (!address) return;
    setLoading(true);
    fetch(`/api/settings?publicKey=${address}`)
      .then((r) => r.json())
      .then((d) => setWebhookUrl(d.webhookUrl ?? ""))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [address]);

  const handleSave = async () => {
    if (!address) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicKey: address, webhookUrl }),
      });
      if (!res.ok) throw new Error("Failed to save settings");
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!address) {
    return (
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-16 text-center max-w-2xl">
        <p className="text-slate-500 text-sm">Connect your wallet to manage settings.</p>
      </div>
    );
  }

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
        {loading ? (
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <FiLoader className="animate-spin" /> Loading settings...
          </div>
        ) : (
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
              Receive alerts for CRITICAL, NEAR_EXPIRY, EXTENSION_SUCCESS, and LOW_BALANCE events.
            </p>
          </div>
        )}
      </div>

      {/* Default thresholds — informational note */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 space-y-3">
        <h2 className="text-sm font-semibold text-white">Default Extension Parameters</h2>
        <p className="text-sm text-slate-500">
          Warning threshold and extension targets are set per monitored key when you add it.
          You can adjust them by removing and re-adding the key with your preferred values.
        </p>
        <div className="grid grid-cols-2 gap-4 pt-1">
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4">
            <p className="text-[11px] text-slate-500 uppercase tracking-wider mb-1">Default Warning</p>
            <p className="text-lg font-bold text-white">15,000 <span className="text-sm font-normal text-slate-500">ledgers</span></p>
            <p className="text-xs text-slate-600 mt-0.5">~4.3 days</p>
          </div>
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4">
            <p className="text-[11px] text-slate-500 uppercase tracking-wider mb-1">Default Extend To</p>
            <p className="text-lg font-bold text-white">100,000 <span className="text-sm font-normal text-slate-500">ledgers</span></p>
            <p className="text-xs text-slate-600 mt-0.5">~28.9 days</p>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">
          {error}
        </p>
      )}

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={saving || loading}
        className="px-6 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        {saving ? (
          <><FiLoader className="animate-spin w-4 h-4" /> Saving...</>
        ) : saved ? (
          "✓ Saved!"
        ) : (
          "Save Changes"
        )}
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

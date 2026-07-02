"use client";

import { useState } from "react";
import { useWallet } from "./WalletProvider";
import { FiX, FiLoader } from "react-icons/fi";

interface Props {
  onSuccess: () => void;
  onClose: () => void;
}

const STORAGE_KINDS = [
  { value: "INSTANCE", label: "Instance Storage", desc: "The contract instance entry — most common" },
  { value: "PERSISTENT", label: "Persistent Data", desc: "A named persistent storage key" },
  { value: "CONTRACT_CODE", label: "Contract Code (WASM)", desc: "The contract's WASM bytecode entry" },
];

export default function AddKeyModal({ onSuccess, onClose }: Props) {
  const { address } = useWallet();
  const [contractId, setContractId] = useState("");
  const [storageKind, setStorageKind] = useState("INSTANCE");
  const [symbol, setSymbol] = useState("");
  const [thresholdLedgers, setThresholdLedgers] = useState("15000");
  const [extendToLedgers, setExtendToLedgers] = useState("100000");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          publicKey: address,
          contractId: contractId.trim(),
          storageKind,
          symbol: storageKind === "PERSISTENT" ? symbol.trim() : undefined,
          thresholdLedgers: parseInt(thresholdLedgers),
          extendToLedgers: parseInt(extendToLedgers),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to add key");

      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-[#0f1117] border border-white/[0.08] rounded-2xl shadow-2xl p-6 space-y-5 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Add Contract Key</h2>
            <p className="text-xs text-slate-500 mt-0.5">Monitor a Soroban ledger key for TTL expiry</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-all"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Contract ID */}
          <div>
            <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1.5 block">
              Contract ID <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={contractId}
              onChange={(e) => setContractId(e.target.value)}
              placeholder="C... (56-character Soroban contract address)"
              required
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-mono text-slate-300 placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
            />
          </div>

          {/* Storage Kind */}
          <div>
            <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1.5 block">
              Storage Type <span className="text-red-400">*</span>
            </label>
            <div className="space-y-2">
              {STORAGE_KINDS.map((kind) => (
                <label
                  key={kind.value}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    storageKind === kind.value
                      ? "border-indigo-500/40 bg-indigo-500/10"
                      : "border-white/[0.06] bg-white/[0.02] hover:border-white/10"
                  }`}
                >
                  <input
                    type="radio"
                    name="storageKind"
                    value={kind.value}
                    checked={storageKind === kind.value}
                    onChange={() => setStorageKind(kind.value)}
                    className="mt-0.5 accent-indigo-500"
                  />
                  <div>
                    <p className="text-sm font-medium text-white">{kind.label}</p>
                    <p className="text-xs text-slate-500">{kind.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Symbol — only for PERSISTENT */}
          {storageKind === "PERSISTENT" && (
            <div>
              <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1.5 block">
                Storage Key Symbol <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                placeholder="e.g. Balance, UserData, Config"
                required
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-mono text-slate-300 placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
              />
            </div>
          )}

          {/* Thresholds */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1.5 block">
                Warning Threshold
              </label>
              <input
                type="number"
                value={thresholdLedgers}
                onChange={(e) => setThresholdLedgers(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-300 focus:outline-none focus:border-indigo-500/50 transition-colors"
              />
              <p className="text-[10px] text-slate-600 mt-1">
                ~{(parseInt(thresholdLedgers || "0") / 17280).toFixed(1)} days
              </p>
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1.5 block">
                Extend To (ledgers)
              </label>
              <input
                type="number"
                value={extendToLedgers}
                onChange={(e) => setExtendToLedgers(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-300 focus:outline-none focus:border-indigo-500/50 transition-colors"
              />
              <p className="text-[10px] text-slate-600 mt-1">
                ~{(parseInt(extendToLedgers || "0") / 17280).toFixed(1)} days
              </p>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !contractId.trim()}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <><FiLoader className="animate-spin w-4 h-4" /> Adding Key...</>
            ) : (
              "Add Contract Key"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

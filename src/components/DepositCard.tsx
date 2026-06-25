"use client";

import { useState } from "react";
import { FiAlertTriangle } from "react-icons/fi";

export default function DepositCard() {
  const [copied, setCopied] = useState<"address" | "memo" | null>(null);

  // These would come from the API / user context
  const depositAddress = "GABCDEFGHIJKLMNOPQRSTUVWXYZ234567890ABCDEFGHIJKLMNOPQR";
  const depositMemo = "a1b2c3d4e5f6g7h8";
  const balance = "4.2000000";

  const copyToClipboard = async (text: string, type: "address" | "memo") => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Balance Display */}
      <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 to-purple-500/5 p-8 text-center">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Available Balance</p>
        <p className="text-5xl font-bold text-white tracking-tight">
          {balance}
          <span className="text-2xl ml-2 text-indigo-400/70">XLM</span>
        </p>
      </div>

      {/* Deposit Instructions */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 space-y-5">
        <h3 className="text-sm font-semibold text-white">Deposit XLM</h3>
        <p className="text-sm text-slate-400">
          Send XLM to the address below with your unique memo. Your balance will be credited automatically.
        </p>

        {/* Deposit Address */}
        <div>
          <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1.5 block">
            Deposit Address
          </label>
          <div className="flex items-center gap-2">
            <div className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 font-mono text-sm text-slate-300 truncate">
              {depositAddress}
            </div>
            <button
              onClick={() => copyToClipboard(depositAddress, "address")}
              className="px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm text-slate-300 hover:bg-white/10 transition-all flex-shrink-0"
            >
              {copied === "address" ? "✓ Copied" : "Copy"}
            </button>
          </div>
        </div>

        {/* Deposit Memo */}
        <div>
          <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1.5 block">
            Your Unique Memo <span className="text-red-400">(Required)</span>
          </label>
          <div className="flex items-center gap-2">
            <div className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-amber-500/30 font-mono text-sm text-amber-300">
              {depositMemo}
            </div>
            <button
              onClick={() => copyToClipboard(depositMemo, "memo")}
              className="px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm text-slate-300 hover:bg-white/10 transition-all flex-shrink-0"
            >
              {copied === "memo" ? "✓ Copied" : "Copy"}
            </button>
          </div>
          <p className="text-[11px] text-amber-500/80 mt-1.5 flex items-center gap-1">
            <FiAlertTriangle className="w-3 h-3" /> Deposits without this memo cannot be credited to your account
          </p>
        </div>

        {/* Freighter One-Click Deposit */}
        <button className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
          Deposit via Freighter
        </button>
      </div>
    </div>
  );
}

"use client";
import React, { useEffect, useState } from "react";
import { FiCheckCircle, FiDollarSign, FiAlertTriangle, FiXCircle, FiLoader } from "react-icons/fi";

interface LogItem {
  id: string;
  contractId: string;
  status: string;
  xlmCost: string | null;
  txHash: string;
  errorMessage: string | null;
  createdAt: string;
}

const typeConfig = {
  SUCCESS: { icon: <FiCheckCircle />, color: "text-emerald-400", bg: "bg-emerald-500/10", label: "Extended" },
  FAILED: { icon: <FiXCircle />, color: "text-red-400", bg: "bg-red-500/10", label: "Failed" },
  PENDING: { icon: <FiAlertTriangle />, color: "text-amber-400", bg: "bg-amber-500/10", label: "Pending" },
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? "s" : ""} ago`;
  return `${Math.floor(hrs / 24)} day${Math.floor(hrs / 24) > 1 ? "s" : ""} ago`;
}

export default function ActivityFeed({ publicKey }: { publicKey?: string | null }) {
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!publicKey) return;

    async function fetchLogs() {
      setLoading(true);
      try {
        const res = await fetch(`/api/logs?publicKey=${publicKey}&limit=8`);
        if (res.ok) {
          const data = await res.json();
          setLogs(data.logs ?? []);
        }
      } catch (err) {
        console.error("Failed to load activity:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchLogs();
  }, [publicKey]);

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
      <div className="px-5 py-4 border-b border-white/[0.06]">
        <h3 className="text-sm font-semibold text-white">Recent Activity</h3>
      </div>
      <div className="divide-y divide-white/[0.04]">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-8 text-slate-500 text-sm">
            <FiLoader className="animate-spin" /> Loading activity...
          </div>
        ) : logs.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-slate-500 text-sm">
            {publicKey ? "No activity yet." : "Connect wallet to view activity."}
          </div>
        ) : (
          logs.map((log) => {
            const cfg = typeConfig[log.status as keyof typeof typeConfig] ?? typeConfig.PENDING;
            const short = `${log.contractId.slice(0, 6)}...${log.contractId.slice(-4)}`;
            const message =
              log.status === "SUCCESS"
                ? `Extended ${short} — ${log.xlmCost ? `${log.xlmCost} XLM` : ""}`
                : log.status === "FAILED"
                ? `Failed: ${short} — ${log.errorMessage ?? "unknown error"}`
                : `Pending: ${short}`;

            return (
              <div
                key={log.id}
                className="flex items-start gap-3 px-5 py-3.5 hover:bg-white/[0.02] transition-colors"
              >
                <div className={`w-8 h-8 rounded-lg ${cfg.bg} flex items-center justify-center text-sm flex-shrink-0 mt-0.5 ${cfg.color}`}>
                  {cfg.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm ${cfg.color}`}>{message}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] text-slate-600">{timeAgo(log.createdAt)}</span>
                    {log.txHash && (
                      <a
                        href={`https://stellar.expert/explorer/testnet/tx/${log.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-indigo-500 hover:text-indigo-400 transition-colors"
                      >
                        View tx →
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

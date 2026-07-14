"use client";

import { useEffect, useState, useCallback } from "react";
import { useWallet } from "../../components/WalletProvider";
import { FiLoader, FiRefreshCw } from "react-icons/fi";

interface TxRow {
  id: string;
  createdAt: string;
  contractId: string;
  status: "SUCCESS" | "FAILED";
  xlmCost: string | null;
  extendedTo: number | null;
  txHash: string;
  errorMessage: string | null;
}

interface LogsData {
  logs: TxRow[];
  total: number;
  page: number;
  totalPages: number;
}

interface Summary {
  total: number;
  totalSpent: number;
  successRate: number;
}

const txStatusConfig = {
  SUCCESS: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  FAILED: "bg-red-500/15 text-red-400 border-red-500/30",
};

export default function LogsPage() {
  const { address } = useWallet();
  const [data, setData] = useState<LogsData | null>(null);
  const [summary, setSummary] = useState<Summary>({ total: 0, totalSpent: 0, successRate: 0 });
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);

  const fetchLogs = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    try {
      const status = statusFilter === "All" ? "" : `&status=${statusFilter}`;
      const res = await fetch(`/api/logs?publicKey=${address}&page=${page}&limit=20${status}`);
      const json = await res.json();
      setData(json);

      // Calculate summary from all logs (page 1, high limit)
      const allRes = await fetch(`/api/logs?publicKey=${address}&limit=1000`);
      const allJson = await allRes.json();
      const allLogs: TxRow[] = allJson.logs ?? [];
      const successful = allLogs.filter((l) => l.status === "SUCCESS");
      const totalSpent = successful.reduce((sum, l) => sum + parseFloat(l.xlmCost ?? "0"), 0);
      setSummary({
        total: allJson.total ?? 0,
        totalSpent,
        successRate: allJson.total > 0 ? (successful.length / allJson.total) * 100 : 0,
      });
    } catch (err) {
      console.error("Failed to fetch logs:", err);
    } finally {
      setLoading(false);
    }
  }, [address, statusFilter, page]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  if (!address) {
    return (
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-16 text-center">
        <p className="text-slate-500 text-sm">Connect your wallet to view transaction logs.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Transaction Logs</h1>
          <p className="text-sm text-slate-500 mt-1">
            Full audit trail of every automated TTL extension attempt.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {["All", "SUCCESS", "FAILED"].map((f) => (
            <button
              key={f}
              onClick={() => { setStatusFilter(f); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                statusFilter === f
                  ? "bg-white/10 text-white"
                  : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
              }`}
            >
              {f}
            </button>
          ))}
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 transition-colors"
            title="Refresh"
          >
            <FiRefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Transactions", value: summary.total.toLocaleString(), color: "text-white" },
          { label: "Total Spent", value: `${summary.totalSpent.toFixed(7)} XLM`, color: "text-purple-400" },
          { label: "Success Rate", value: `${summary.successRate.toFixed(1)}%`, color: "text-emerald-400" },
        ].map((item) => (
          <div key={item.label} className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-5 py-4">
            <p className="text-[11px] text-slate-500 uppercase tracking-wider mb-1">{item.label}</p>
            <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
          </div>
        ))}
      </div>

      {/* Logs Table */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
        {loading && !data ? (
          <div className="py-16 flex items-center justify-center gap-2 text-slate-500 text-sm">
            <FiLoader className="animate-spin" /> Loading logs...
          </div>
        ) : (data?.logs ?? []).length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-sm">
            No transaction logs yet. Logs appear after the relayer runs.
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Contract</th>
                  <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">XLM Cost</th>
                  <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Extended To</th>
                  <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Tx Hash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {(data?.logs ?? []).map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3.5 text-sm text-slate-500">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm font-mono text-slate-300">
                        {log.contractId.slice(0, 6)}...{log.contractId.slice(-4)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${txStatusConfig[log.status]}`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm font-mono text-slate-400">
                        {log.xlmCost ? `${parseFloat(log.xlmCost).toFixed(7)} XLM` : "—"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm text-slate-400 font-mono">
                        {log.extendedTo ? log.extendedTo.toLocaleString() : "—"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      {log.txHash && log.txHash !== "SIMULATION_FAILED" && log.txHash !== "ERROR" ? (
                        <a
                          href={`https://stellar.expert/explorer/testnet/tx/${log.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-mono text-indigo-400 hover:text-indigo-300 transition-colors"
                        >
                          {log.txHash.slice(0, 10)}...
                        </a>
                      ) : (
                        <span className="text-sm text-red-400/60 text-xs">{log.txHash ?? "—"}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {(data?.totalPages ?? 0) > 1 && (
              <div className="px-5 py-3 border-t border-white/[0.06] flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Page {data?.page} of {data?.totalPages} ({data?.total} total)
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1 rounded-lg text-xs text-slate-500 hover:text-white hover:bg-white/5 transition-all disabled:opacity-30"
                  >
                    ← Prev
                  </button>
                  {Array.from({ length: Math.min(5, data?.totalPages ?? 1) }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`px-3 py-1 rounded-lg text-xs transition-all ${
                        page === p ? "bg-white/10 text-white" : "text-slate-500 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage((p) => Math.min(data?.totalPages ?? 1, p + 1))}
                    disabled={page === (data?.totalPages ?? 1)}
                    className="px-3 py-1 rounded-lg text-xs text-slate-500 hover:text-white hover:bg-white/5 transition-all disabled:opacity-30"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

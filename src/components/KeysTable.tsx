"use client";

import { useEffect, useState, useCallback } from "react";
import { useWallet } from "./WalletProvider";
import StatusBadge from "./StatusBadge";
import { FiLoader, FiTrash2, FiRefreshCw } from "react-icons/fi";

interface KeyRow {
  id: string;
  contractId: string;
  storageKind: "INSTANCE" | "PERSISTENT" | "CONTRACT_CODE";
  status: "HEALTHY" | "NEAR_EXPIRY" | "CRITICAL" | "ARCHIVED";
  remaining: number | null;
  thresholdLedgers: number;
  extendToLedgers: number;
  updatedAt: string;
}

function ledgersToTime(ledgers: number): string {
  const seconds = ledgers * 5;
  const hours = seconds / 3600;
  const days = hours / 24;
  if (days >= 1) return `~${days.toFixed(1)}d`;
  if (hours >= 1) return `~${hours.toFixed(1)}h`;
  return `~${(seconds / 60).toFixed(0)}m`;
}

interface Props {
  refreshTrigger?: number;
  statusFilter?: string;
}

export default function KeysTable({ refreshTrigger, statusFilter }: Props) {
  const { address } = useWallet();
  const [keys, setKeys] = useState<KeyRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchKeys = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/keys?publicKey=${address}`);
      const data = await res.json();
      setKeys(data.keys ?? []);
    } catch (err) {
      console.error("Failed to fetch keys:", err);
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys, refreshTrigger]);

  const handleDelete = async (keyId: string) => {
    if (!address || !confirm("Remove this monitored key?")) return;
    setDeletingId(keyId);
    try {
      await fetch(`/api/keys?id=${keyId}&publicKey=${address}`, { method: "DELETE" });
      setKeys((prev) => prev.filter((k) => k.id !== keyId));
    } catch (err) {
      console.error("Failed to delete key:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredKeys =
    statusFilter && statusFilter !== "All"
      ? keys.filter((k) => k.status === statusFilter.toUpperCase().replace(" ", "_"))
      : keys;

  if (!address) {
    return (
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-16 text-center">
        <p className="text-slate-500 text-sm">Connect your wallet to view monitored keys.</p>
      </div>
    );
  }

  if (loading && keys.length === 0) {
    return (
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-16 flex items-center justify-center gap-2 text-slate-500 text-sm">
        <FiLoader className="animate-spin" /> Loading keys...
      </div>
    );
  }

  if (!loading && filteredKeys.length === 0) {
    return (
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-16 text-center">
        <div className="text-5xl mb-4">📋</div>
        <h3 className="text-base font-semibold text-white mb-2">No keys registered yet</h3>
        <p className="text-sm text-slate-500">Add your first contract key to begin monitoring.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.06]">
              <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Contract</th>
              <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Storage</th>
              <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Remaining</th>
              <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Time Left</th>
              <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Last Updated</th>
              <th className="text-right px-5 py-3.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {filteredKeys.map((key) => (
              <tr key={key.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-5 py-3.5">
                  <span className="text-sm font-mono text-slate-300">
                    {key.contractId.slice(0, 6)}...{key.contractId.slice(-4)}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <span className="text-xs text-slate-400 bg-white/5 px-2 py-1 rounded-md">
                    {key.storageKind.replace("_", " ")}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <StatusBadge status={key.status} />
                </td>
                <td className="px-5 py-3.5">
                  <span className="text-sm text-slate-300 font-mono">
                    {key.remaining !== null ? key.remaining.toLocaleString() : "—"}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <span className="text-sm text-slate-400">
                    {key.remaining !== null ? ledgersToTime(key.remaining) : "—"}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <span className="text-sm text-slate-500">
                    {new Date(key.updatedAt).toLocaleString()}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <button
                    onClick={() => handleDelete(key.id)}
                    disabled={deletingId === key.id}
                    className="p-1.5 rounded-lg text-red-400/50 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50"
                    title="Remove key"
                  >
                    {deletingId === key.id ? (
                      <FiLoader className="w-4 h-4 animate-spin" />
                    ) : (
                      <FiTrash2 className="w-4 h-4" />
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-5 py-3 border-t border-white/[0.06] flex items-center justify-between">
        <span className="text-xs text-slate-500">{filteredKeys.length} key{filteredKeys.length !== 1 ? "s" : ""} monitored</span>
        <button
          onClick={fetchKeys}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
        >
          <FiRefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@/components/WalletProvider";
import StatCard from "../components/StatCard";
import ActivityFeed from "../components/ActivityFeed";
import { FiCheckCircle, FiAlertTriangle, FiXCircle, FiDollarSign } from "react-icons/fi";

interface DashboardStats {
  healthy: number;
  nearExpiry: number;
  critical: number;
  xlmBalance: string;
  keys: {
    id: string;
    contractId: string;
    status: string;
    liveUntilLedger: number | null;
    lastCheckedLedger: number | null;
    extendToLedgers: number;
  }[];
}

export default function DashboardPage() {
  const { address, isConnected } = useWallet();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!address) return;

    async function fetchDashboard() {
      setLoading(true);
      try {
        const [balanceRes, keysRes] = await Promise.all([
          fetch(`/api/balance`),
          fetch(`/api/keys`),
        ]);

        const balanceData = balanceRes.ok ? await balanceRes.json() : null;
        const keysData = keysRes.ok ? await keysRes.json() : { keys: [] };

        const keys = keysData.keys ?? [];
        const healthy = keys.filter((k: any) => k.status === "HEALTHY").length;
        const nearExpiry = keys.filter((k: any) => k.status === "NEAR_EXPIRY").length;
        const critical = keys.filter((k: any) => k.status === "CRITICAL").length;

        setStats({
          healthy,
          nearExpiry,
          critical,
          xlmBalance: balanceData?.xlmBalance ?? "0.00",
          keys,
        });
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, [address]);

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
          <FiDollarSign className="w-8 h-8 text-slate-500" />
        </div>
        <div>
          <h2 className="text-white font-semibold">Connect your wallet</h2>
          <p className="text-sm text-slate-500 mt-1">Connect your Freighter wallet to view your dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">
          Monitor your Soroban contract storage health in real-time.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <StatCard label="Healthy" value={loading ? "—" : stats?.healthy ?? 0} icon={<FiCheckCircle />} color="green" />
        <StatCard label="Near Expiry" value={loading ? "—" : stats?.nearExpiry ?? 0} icon={<FiAlertTriangle />} color="yellow" />
        <StatCard label="Critical" value={loading ? "—" : stats?.critical ?? 0} icon={<FiXCircle />} color="red" />
        <StatCard label="XLM Balance" value={loading ? "—" : stats?.xlmBalance ?? "0.00"} icon={<FiDollarSign />} color="purple" suffix="XLM" />
      </div>

      {/* TTL Health Overview + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* TTL Health Chart */}
        <div className="lg:col-span-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
          <h3 className="text-sm font-semibold text-white mb-4">TTL Health Overview</h3>
          {loading ? (
            <div className="flex items-center justify-center h-24 text-slate-500 text-sm">Loading keys...</div>
          ) : stats?.keys.length === 0 ? (
            <div className="flex items-center justify-center h-24 text-slate-500 text-sm">
              No monitored keys yet. Add a contract key to get started.
            </div>
          ) : (
            <div className="space-y-3">
              {stats?.keys.map((key) => {
                const remaining = key.liveUntilLedger && key.lastCheckedLedger
                  ? Math.max(0, key.liveUntilLedger - key.lastCheckedLedger)
                  : 0;
                const max = key.extendToLedgers || 100000;
                const pct = Math.min(100, (remaining / max) * 100);
                const statusColor =
                  key.status === "CRITICAL"
                    ? "bg-gradient-to-r from-red-500 to-red-400"
                    : key.status === "NEAR_EXPIRY"
                    ? "bg-gradient-to-r from-amber-500 to-amber-400"
                    : "bg-gradient-to-r from-emerald-500 to-emerald-400";

                return (
                  <div key={key.id} className="flex items-center gap-4">
                    <span className="text-xs font-mono text-slate-400 w-28 flex-shrink-0 truncate">
                      {key.contractId.slice(0, 6)}...{key.contractId.slice(-4)}
                    </span>
                    <div className="flex-1 h-3 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${statusColor}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-500 w-12 text-right flex-shrink-0">
                      {pct.toFixed(0)}%
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Activity Feed */}
        <div className="lg:col-span-2">
          <ActivityFeed publicKey={address} />
        </div>
      </div>
    </div>
  );
}

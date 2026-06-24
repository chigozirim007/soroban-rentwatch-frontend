"use client";

import StatusBadge from "./StatusBadge";

interface KeyRow {
  id: string;
  contractId: string;
  storageKind: "INSTANCE" | "PERSISTENT" | "CONTRACT_CODE";
  status: "HEALTHY" | "NEAR_EXPIRY" | "CRITICAL" | "ARCHIVED";
  remaining: number | null;
  thresholdLedgers: number;
  extendToLedgers: number;
  lastChecked: string | null;
}

// Demo data
const demoKeys: KeyRow[] = [
  { id: "1", contractId: "CABCDEF1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF12", storageKind: "INSTANCE", status: "HEALTHY", remaining: 85420, thresholdLedgers: 15000, extendToLedgers: 100000, lastChecked: "2 min ago" },
  { id: "2", contractId: "CDEFGH1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF12", storageKind: "PERSISTENT", status: "NEAR_EXPIRY", remaining: 12500, thresholdLedgers: 15000, extendToLedgers: 100000, lastChecked: "2 min ago" },
  { id: "3", contractId: "CGHIJK1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF12", storageKind: "INSTANCE", status: "CRITICAL", remaining: 3200, thresholdLedgers: 15000, extendToLedgers: 100000, lastChecked: "2 min ago" },
  { id: "4", contractId: "CLMNOP1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF12", storageKind: "CONTRACT_CODE", status: "HEALTHY", remaining: 92100, thresholdLedgers: 15000, extendToLedgers: 100000, lastChecked: "2 min ago" },
];

function ledgersToTime(ledgers: number): string {
  const seconds = ledgers * 5;
  const hours = seconds / 3600;
  const days = hours / 24;
  if (days >= 1) return `~${days.toFixed(1)}d`;
  if (hours >= 1) return `~${hours.toFixed(1)}h`;
  return `~${(seconds / 60).toFixed(0)}m`;
}

export default function KeysTable() {
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
              <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Time</th>
              <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Last Checked</th>
              <th className="text-right px-5 py-3.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {demoKeys.map((key) => (
              <tr key={key.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-5 py-3.5">
                  <span className="text-sm font-mono text-slate-300">
                    {key.contractId.slice(0, 4)}...{key.contractId.slice(-4)}
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
                    {key.remaining?.toLocaleString() ?? "—"}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <span className="text-sm text-slate-400">
                    {key.remaining ? ledgersToTime(key.remaining) : "—"}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <span className="text-sm text-slate-500">{key.lastChecked ?? "Never"}</span>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <button className="text-xs text-red-400/60 hover:text-red-400 transition-colors">
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

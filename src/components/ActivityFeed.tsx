"use client";
import React from 'react';
import { FiCheckCircle, FiDollarSign, FiAlertTriangle, FiXCircle } from 'react-icons/fi';

interface ActivityItem {
  id: string;
  type: "extension" | "deposit" | "warning" | "error";
  message: string;
  timestamp: string;
  txHash?: string;
}

// Demo data — replace with real API data via SWR
const demoActivity: ActivityItem[] = [
  { id: "1", type: "extension", message: "Extended CABC...D1F2 — +100,000 ledgers", timestamp: "2 min ago", txHash: "abc123" },
  { id: "2", type: "warning", message: "NEAR_EXPIRY: CDEF...A3B4 — ~2.1 days remaining", timestamp: "15 min ago" },
  { id: "3", type: "deposit", message: "Deposit received: 5.0000000 XLM", timestamp: "1 hour ago", txHash: "def456" },
  { id: "4", type: "extension", message: "Extended CGHI...E5F6 — +100,000 ledgers", timestamp: "3 hours ago", txHash: "ghi789" },
  { id: "5", type: "error", message: "Extension failed for CJKL...G7H8 — insufficient balance", timestamp: "5 hours ago" },
];

const typeConfig = {
  extension: { icon: <FiCheckCircle />, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  deposit: { icon: <FiDollarSign />, color: "text-blue-400", bg: "bg-blue-500/10" },
  warning: { icon: <FiAlertTriangle />, color: "text-amber-400", bg: "bg-amber-500/10" },
  error: { icon: <FiXCircle />, color: "text-red-400", bg: "bg-red-500/10" },
};

export default function ActivityFeed() {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
      <div className="px-5 py-4 border-b border-white/[0.06]">
        <h3 className="text-sm font-semibold text-white">Recent Activity</h3>
      </div>
      <div className="divide-y divide-white/[0.04]">
        {demoActivity.map((item) => {
          const cfg = typeConfig[item.type];
          return (
            <div
              key={item.id}
              className="flex items-start gap-3 px-5 py-3.5 hover:bg-white/[0.02] transition-colors"
            >
              <div className={`w-8 h-8 rounded-lg ${cfg.bg} flex items-center justify-center text-sm flex-shrink-0 mt-0.5`}>
                {cfg.icon}
              </div>
              <div className="min-w-0 flex-1">
                <p className={`text-sm ${cfg.color}`}>{item.message}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[11px] text-slate-600">{item.timestamp}</span>
                  {item.txHash && (
                    <a
                      href={`https://stellar.expert/explorer/testnet/tx/${item.txHash}`}
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
        })}
      </div>
    </div>
  );
}

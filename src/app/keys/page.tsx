"use client";

import { useState } from "react";
import KeysTable from "../../components/KeysTable";
import AddKeyModal from "../../components/AddKeyModal";

const FILTERS = ["All", "Healthy", "Near Expiry", "Critical", "Archived"];

export default function KeysPage() {
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleSuccess = () => {
    setShowModal(false);
    setRefreshTrigger((n) => n + 1);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Monitored Keys</h1>
          <p className="text-sm text-slate-500 mt-1">
            All Soroban ledger keys being tracked for TTL expiry.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="group relative px-5 py-2.5 rounded-xl font-semibold text-sm overflow-hidden transition-all duration-300 hover:scale-[1.02]"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-90 group-hover:opacity-100 transition-opacity" />
          <span className="relative text-white flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Contract Key
          </span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-3">
        {FILTERS.map((filter) => (
          <button
            key={filter}
            onClick={() => setStatusFilter(filter)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              statusFilter === filter
                ? "bg-white/10 text-white"
                : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Keys Table */}
      <KeysTable refreshTrigger={refreshTrigger} statusFilter={statusFilter} />

      {/* Modal */}
      {showModal && (
        <AddKeyModal onSuccess={handleSuccess} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}

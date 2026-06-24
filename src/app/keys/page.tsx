import KeysTable from "../../components/KeysTable";

export default function KeysPage() {
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
        <button className="group relative px-5 py-2.5 rounded-xl font-semibold text-sm overflow-hidden transition-all duration-300 hover:scale-[1.02]">
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
        {["All", "Healthy", "Near Expiry", "Critical", "Archived"].map((filter) => (
          <button
            key={filter}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              filter === "All"
                ? "bg-white/10 text-white"
                : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Keys Table */}
      <KeysTable />

      {/* Empty State (hidden when data present) */}
      <div className="hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-16 text-center">
        <div className="text-5xl mb-4">📋</div>
        <h3 className="text-base font-semibold text-white mb-2">No keys registered yet</h3>
        <p className="text-sm text-slate-500">
          Add your first contract key to begin monitoring.
        </p>
      </div>
    </div>
  );
}

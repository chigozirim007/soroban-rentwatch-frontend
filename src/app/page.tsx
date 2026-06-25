import StatCard from "../components/StatCard";
import ActivityFeed from "../components/ActivityFeed";
import { FiCheckCircle, FiAlertTriangle, FiXCircle, FiDollarSign } from 'react-icons/fi';

export default function DashboardPage() {
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
        <StatCard label="Healthy" value={12} icon={<FiCheckCircle />} color="green" />
        <StatCard label="Near Expiry" value={3} icon={<FiAlertTriangle />} color="yellow" />
        <StatCard label="Critical" value={1} icon={<FiXCircle />} color="red" />
        <StatCard label="XLM Balance" value="4.20" icon={<FiDollarSign />} color="purple" suffix="XLM" />
      </div>

      {/* TTL Health Overview + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* TTL Health Chart */}
        <div className="lg:col-span-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
          <h3 className="text-sm font-semibold text-white mb-4">TTL Health Overview</h3>
          <div className="space-y-3">
            {[
              { contract: "CABC...D1F2", remaining: 85420, max: 100000, status: "healthy" },
              { contract: "CDEF...A3B4", remaining: 12500, max: 100000, status: "warning" },
              { contract: "CGHI...E5F6", remaining: 3200, max: 100000, status: "critical" },
              { contract: "CJKL...G7H8", remaining: 92100, max: 100000, status: "healthy" },
              { contract: "CMNP...I9J0", remaining: 45000, max: 100000, status: "healthy" },
            ].map((item) => (
              <div key={item.contract} className="flex items-center gap-4">
                <span className="text-xs font-mono text-slate-400 w-24 flex-shrink-0">
                  {item.contract}
                </span>
                <div className="flex-1 h-3 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${
                      item.status === "critical"
                        ? "bg-gradient-to-r from-red-500 to-red-400"
                        : item.status === "warning"
                        ? "bg-gradient-to-r from-amber-500 to-amber-400"
                        : "bg-gradient-to-r from-emerald-500 to-emerald-400"
                    }`}
                    style={{ width: `${(item.remaining / item.max) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-slate-500 w-16 text-right flex-shrink-0">
                  {((item.remaining / item.max) * 100).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="lg:col-span-2">
          <ActivityFeed />
        </div>
      </div>
    </div>
  );
}

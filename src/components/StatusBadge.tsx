interface StatusBadgeProps {
  status: "HEALTHY" | "NEAR_EXPIRY" | "CRITICAL" | "ARCHIVED";
}

const statusConfig = {
  HEALTHY: {
    label: "Healthy",
    classes: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    dot: "bg-emerald-400",
  },
  NEAR_EXPIRY: {
    label: "Near Expiry",
    classes: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    dot: "bg-amber-400",
  },
  CRITICAL: {
    label: "Critical",
    classes: "bg-red-500/15 text-red-400 border-red-500/30",
    dot: "bg-red-400 animate-pulse",
  },
  ARCHIVED: {
    label: "Archived",
    classes: "bg-slate-500/15 text-slate-400 border-slate-500/30",
    dot: "bg-slate-500",
  },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${config.classes}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}

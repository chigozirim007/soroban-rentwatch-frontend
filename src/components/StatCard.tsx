import React from 'react';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: "green" | "yellow" | "red" | "blue" | "purple";
  suffix?: string;
}

const colorMap = {
  green: {
    bg: "from-emerald-500/10 to-emerald-500/5",
    border: "border-emerald-500/20",
    text: "text-emerald-400",
    glow: "shadow-emerald-500/10",
    iconBg: "bg-emerald-500/15",
  },
  yellow: {
    bg: "from-amber-500/10 to-amber-500/5",
    border: "border-amber-500/20",
    text: "text-amber-400",
    glow: "shadow-amber-500/10",
    iconBg: "bg-amber-500/15",
  },
  red: {
    bg: "from-red-500/10 to-red-500/5",
    border: "border-red-500/20",
    text: "text-red-400",
    glow: "shadow-red-500/10",
    iconBg: "bg-red-500/15",
  },
  blue: {
    bg: "from-blue-500/10 to-blue-500/5",
    border: "border-blue-500/20",
    text: "text-blue-400",
    glow: "shadow-blue-500/10",
    iconBg: "bg-blue-500/15",
  },
  purple: {
    bg: "from-purple-500/10 to-purple-500/5",
    border: "border-purple-500/20",
    text: "text-purple-400",
    glow: "shadow-purple-500/10",
    iconBg: "bg-purple-500/15",
  },
};

export default function StatCard({ label, value, icon, color, suffix }: StatCardProps) {
  const c = colorMap[color];

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border ${c.border} bg-gradient-to-br ${c.bg} p-5 shadow-lg ${c.glow} hover:scale-[1.02] transition-transform duration-300`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">{label}</p>
          <p className={`text-3xl font-bold ${c.text} tracking-tight`}>
            {value}
            {suffix && <span className="text-lg ml-1 opacity-70">{suffix}</span>}
          </p>
        </div>
        <div className={`w-10 h-10 rounded-xl ${c.iconBg} flex items-center justify-center text-xl`}>
          {icon}
        </div>
      </div>
      {/* Decorative gradient orb */}
      <div className={`absolute -bottom-4 -right-4 w-24 h-24 rounded-full ${c.iconBg} blur-2xl opacity-40`} />
    </div>
  );
}

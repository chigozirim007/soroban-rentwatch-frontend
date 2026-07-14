"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiBarChart2, FiList, FiDollarSign, FiFileText, FiSettings } from "react-icons/fi";
import { useWallet } from "./WalletProvider";

const navItems = [
  { href: "/", label: "Dashboard", icon: <FiBarChart2 /> },
  { href: "/keys", label: "Monitored Keys", icon: <FiList /> },
  { href: "/fund", label: "Fund Balance", icon: <FiDollarSign /> },
  { href: "/logs", label: "Transaction Logs", icon: <FiFileText /> },
  { href: "/settings", label: "Settings", icon: <FiSettings /> },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { address } = useWallet();
  
  const networkName = process.env.NEXT_PUBLIC_STELLAR_NETWORK === "PUBLIC" ? "Public Network" : "Testnet";

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 flex flex-col border-r border-white/[0.06] bg-[#0a0b0f]/80 backdrop-blur-2xl z-40">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <img src="/icon.svg" alt="RentWatch Logo" className="w-9 h-9 shadow-lg shadow-indigo-500/20" />
          <div>
            <h1 className="text-base font-bold text-white tracking-tight">RentWatch</h1>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">Soroban</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? "bg-white/[0.08] text-white shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              <span className={`text-base transition-transform duration-200 ${isActive ? "scale-110" : "group-hover:scale-110"}`}>
                {item.icon}
              </span>
              {item.label}
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-white/[0.06]">
        {address ? (
          <div className="flex items-center gap-2 text-[11px] text-slate-600">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>{networkName} Connected</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-[11px] text-slate-600">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-500" />
            <span>Not Connected</span>
          </div>
        )}
      </div>
    </aside>
  );
}

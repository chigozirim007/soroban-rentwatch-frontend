import DepositCard from "../../components/DepositCard";

interface DepositRow {
  amount: string;
  source: string;
  txHash: string;
  date: string;
}

const demoDeposits: DepositRow[] = [
  { amount: "5.0000000", source: "GABC...D1F2", txHash: "aabbcc", date: "June 23, 2026 09:15" },
  { amount: "10.0000000", source: "GABC...D1F2", txHash: "ddeeff", date: "June 21, 2026 14:30" },
  { amount: "2.5000000", source: "GXYZ...A9B8", txHash: "112233", date: "June 18, 2026 08:00" },
];

export default function FundPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Fund Balance</h1>
        <p className="text-sm text-slate-500 mt-1">
          Deposit XLM to fund automated TTL extension transactions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Deposit Card */}
        <div className="lg:col-span-3">
          <DepositCard />
        </div>

        {/* Info Panel */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 space-y-4">
            <h3 className="text-sm font-semibold text-white">How it works</h3>
            <div className="space-y-3">
              {[
                { step: "1", text: "Send XLM to the deposit address with your unique memo" },
                { step: "2", text: "Your balance is credited automatically within seconds" },
                { step: "3", text: "The relayer deducts gas fees from your balance when extending TTLs" },
                { step: "4", text: "Receive webhook notifications for every transaction" },
              ].map((item) => (
                <div key={item.step} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-[11px] font-bold text-indigo-400 flex-shrink-0 mt-0.5">
                    {item.step}
                  </div>
                  <p className="text-sm text-slate-400">{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Min balance warning */}
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
            <p className="text-xs text-amber-400">
              ⚠️ Minimum 1.0 XLM required to enable automatic TTL extensions.
            </p>
          </div>
        </div>
      </div>

      {/* Deposit History */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Deposit History</h2>
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">From</th>
                <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Tx Hash</th>
                <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {demoDeposits.map((dep) => (
                <tr key={dep.txHash} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-3.5">
                    <span className="text-sm font-semibold text-emerald-400">+{dep.amount} XLM</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-sm font-mono text-slate-400">{dep.source}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <a
                      href={`https://stellar.expert/explorer/testnet/tx/${dep.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-mono text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      {dep.txHash.slice(0, 8)}...
                    </a>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-sm text-slate-500">{dep.date}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

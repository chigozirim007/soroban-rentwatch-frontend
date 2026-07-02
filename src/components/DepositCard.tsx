"use client";

import { useState, useEffect } from "react";
import { FiAlertTriangle, FiLoader } from "react-icons/fi";
import { useWallet } from "./WalletProvider";

interface BalanceData {
  xlmBalance: string;
  depositMemo: string;
  depositAccount: string;
}

export default function DepositCard() {
  const { address } = useWallet();
  const [copied, setCopied] = useState<"address" | "memo" | null>(null);
  const [data, setData] = useState<BalanceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [sendingTx, setSendingTx] = useState(false);
  const [txStatus, setTxStatus] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState("5");

  useEffect(() => {
    if (!address) return;
    setLoading(true);
    fetch(`/api/balance?publicKey=${address}`)
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [address]);

  const copyToClipboard = async (text: string, type: "address" | "memo") => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleFreighterDeposit = async () => {
    if (!data?.depositAccount || !data?.depositMemo || !address) return;
    setSendingTx(true);
    setTxStatus(null);
    try {
      const freighter = await import("@stellar/freighter-api");

      // Build a simple payment transaction using Horizon
      const StellarSdk = await import("@stellar/stellar-sdk");
      const server = new StellarSdk.Horizon.Server("https://horizon-testnet.stellar.org");

      const account = await server.loadAccount(address);
      const fee = await server.fetchBaseFee();

      const tx = new StellarSdk.TransactionBuilder(account, {
        fee: String(fee),
        networkPassphrase: StellarSdk.Networks.TESTNET,
      })
        .addOperation(
          StellarSdk.Operation.payment({
            destination: data.depositAccount,
            asset: StellarSdk.Asset.native(),
            amount: depositAmount,
          })
        )
        .addMemo(StellarSdk.Memo.text(data.depositMemo))
        .setTimeout(30)
        .build();

      const { signedTxXdr } = await freighter.signTransaction(tx.toXDR(), {
        networkPassphrase: StellarSdk.Networks.TESTNET,
      });

      const signedTx = StellarSdk.TransactionBuilder.fromXDR(
        signedTxXdr,
        StellarSdk.Networks.TESTNET
      );
      const result = await server.submitTransaction(signedTx);
      setTxStatus(`✅ Deposit sent! Tx: ${(result as any).hash?.slice(0, 12)}...`);
    } catch (err: any) {
      setTxStatus(`❌ Failed: ${err?.message ?? "Unknown error"}`);
    } finally {
      setSendingTx(false);
    }
  };

  if (!address) {
    return (
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 text-center text-slate-500 text-sm">
        Connect your wallet to view deposit information.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 flex items-center justify-center gap-2 text-slate-500 text-sm">
        <FiLoader className="animate-spin" /> Loading deposit info...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Balance Display */}
      <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 to-purple-500/5 p-8 text-center">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Available Balance</p>
        <p className="text-5xl font-bold text-white tracking-tight">
          {data?.xlmBalance ?? "0.0000000"}
          <span className="text-2xl ml-2 text-indigo-400/70">XLM</span>
        </p>
      </div>

      {/* Deposit Instructions */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 space-y-5">
        <h3 className="text-sm font-semibold text-white">Deposit XLM</h3>
        <p className="text-sm text-slate-400">
          Send XLM to the address below with your unique memo. Your balance will be credited automatically.
        </p>

        {/* Deposit Address */}
        <div>
          <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1.5 block">
            Deposit Address
          </label>
          <div className="flex items-center gap-2">
            <div className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 font-mono text-sm text-slate-300 truncate">
              {data?.depositAccount ?? "Loading..."}
            </div>
            <button
              onClick={() => data?.depositAccount && copyToClipboard(data.depositAccount, "address")}
              className="px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm text-slate-300 hover:bg-white/10 transition-all flex-shrink-0"
            >
              {copied === "address" ? "✓ Copied" : "Copy"}
            </button>
          </div>
        </div>

        {/* Deposit Memo */}
        <div>
          <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1.5 block">
            Your Unique Memo <span className="text-red-400">(Required)</span>
          </label>
          <div className="flex items-center gap-2">
            <div className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-amber-500/30 font-mono text-sm text-amber-300">
              {data?.depositMemo ?? "Loading..."}
            </div>
            <button
              onClick={() => data?.depositMemo && copyToClipboard(data.depositMemo, "memo")}
              className="px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm text-slate-300 hover:bg-white/10 transition-all flex-shrink-0"
            >
              {copied === "memo" ? "✓ Copied" : "Copy"}
            </button>
          </div>
          <p className="text-[11px] text-amber-500/80 mt-1.5 flex items-center gap-1">
            <FiAlertTriangle className="w-3 h-3" /> Deposits without this memo cannot be credited to your account
          </p>
        </div>

        {/* Amount input */}
        <div>
          <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1.5 block">
            Amount (XLM)
          </label>
          <input
            type="number"
            min="1"
            step="1"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50"
            placeholder="5"
          />
        </div>

        {/* One-Click Freighter Deposit */}
        <button
          onClick={handleFreighterDeposit}
          disabled={sendingTx || !data?.depositAccount}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sendingTx ? (
            <><FiLoader className="animate-spin w-4 h-4" /> Sending...</>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              Deposit {depositAmount} XLM via Freighter
            </>
          )}
        </button>

        {txStatus && (
          <p className={`text-sm text-center font-medium ${txStatus.startsWith("✅") ? "text-emerald-400" : "text-red-400"}`}>
            {txStatus}
          </p>
        )}
      </div>
    </div>
  );
}

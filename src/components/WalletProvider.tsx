"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

// ─── Wallet Context ──────────────────────────────────────────

interface WalletState {
  address: string | null;
  isConnected: boolean;
  isReady: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletState>({
  address: null,
  isConnected: false,
  isReady: false,
  connect: async () => {},
  disconnect: () => {},
});

export function useWallet(): WalletState {
  return useContext(WalletContext);
}

// ─── Provider ────────────────────────────────────────────────

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Only run on client — avoid hydration mismatch
    setIsReady(true);

    // Check if previously connected
    const stored = localStorage.getItem("rw_wallet_address");
    if (stored) {
      setAddress(stored);
    }
  }, []);

  const connect = useCallback(async () => {
    try {
      // Dynamic import to avoid SSR issues
      const freighter = await import("@stellar/freighter-api");

      const accessResult = await freighter.requestAccess();
      if (accessResult.error) {
        console.error("Freighter access denied:", accessResult.error);
        return;
      }

      const addressResult = await freighter.getAddress();
      if (addressResult.error) {
        console.error("Failed to get address:", addressResult.error);
        return;
      }

      const pubKey = addressResult.address;
      setAddress(pubKey);
      localStorage.setItem("rw_wallet_address", pubKey);
    } catch (err) {
      console.error("Wallet connection failed:", err);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    localStorage.removeItem("rw_wallet_address");
  }, []);

  return (
    <WalletContext.Provider
      value={{
        address,
        isConnected: !!address,
        isReady,
        connect,
        disconnect,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

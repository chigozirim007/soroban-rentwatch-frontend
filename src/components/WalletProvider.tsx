"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

// ─── Wallet Context ──────────────────────────────────────────

interface WalletState {
  address: string | null;
  user: any | null; // Holds the real user from the Postgres DB
  isAuthenticating: boolean;
  isConnected: boolean;
  isReady: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletState>({
  address: null,
  user: null,
  isAuthenticating: false,
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
  const [user, setUser] = useState<any | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // Authenticate user against our backend API
  const authenticateUser = async (pubKey: string) => {
    setIsAuthenticating(true);
    try {
      // Use Freighter's signMessage to prove wallet ownership
      const freighter = await import("@stellar/freighter-api");
      const message = `Soroban RentWatch Auth: ${Date.now()}`;
      
      const signResult = await freighter.signMessage(message);
      if (signResult.error) {
        console.error("Signature denied:", signResult.error);
        setIsAuthenticating(false);
        return;
      }

      // signedMessage may be a Buffer or string depending on Freighter version
      const signed = signResult.signedMessage;
      const signatureBase64 = typeof signed === "string"
        ? signed
        : Buffer.from(signed as any).toString("base64");

      // Login to backend to get JWT cookie
      let authRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicKey: pubKey, message, signature: signatureBase64 }),
      });

      if (!authRes.ok) {
        console.error("Failed to authenticate with backend");
        setIsAuthenticating(false);
        return;
      }

      // Fetch user using the newly set HTTP-only cookie
      let res = await fetch(`/api/user`);
      
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        console.error("Failed to authenticate user with backend");
      }
    } catch (err) {
      console.error("Authentication error:", err);
    } finally {
      setIsAuthenticating(false);
    }
  };

  useEffect(() => {
    // Only run on client — avoid hydration mismatch
    setIsReady(true);

    const stored = localStorage.getItem("rw_wallet_address");
    if (stored) {
      setAddress(stored);
      // Check if we already have a valid session before asking to sign again
      fetch("/api/user")
        .then(async (res) => {
          if (res.ok) {
            const data = await res.json();
            setUser(data.user);
          } else {
            // No valid session, ask user to sign in
            authenticateUser(stored);
          }
        })
        .catch(() => {
          authenticateUser(stored);
        });
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
      
      // Auto-register / fetch user after connecting wallet
      await authenticateUser(pubKey);
    } catch (err) {
      console.error("Wallet connection failed:", err);
    }
  }, []);

  const disconnect = useCallback(async () => {
    setAddress(null);
    setUser(null);
    localStorage.removeItem("rw_wallet_address");
    // Clear cookie
    await fetch("/api/auth/login", { method: "DELETE" });
  }, []);

  return (
    <WalletContext.Provider
      value={{
        address,
        user,
        isAuthenticating,
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

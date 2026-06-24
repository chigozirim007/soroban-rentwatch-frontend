import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "../components/WalletProvider";
import Sidebar from "../components/Sidebar";
import ConnectButton from "../components/ConnectButton";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Soroban RentWatch ⏳ — Contract TTL Monitor",
  description:
    "Automated multi-tenant monitoring and state-rent relief system for Stellar Soroban smart contracts. Prevent contract archival with predictive TTL extensions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased bg-[#060710] text-white min-h-screen`}>
        <WalletProvider>
          {/* Sidebar */}
          <Sidebar />

          {/* Main Content */}
          <div className="pl-64 min-h-screen">
            {/* Top Bar */}
            <header className="sticky top-0 z-30 flex items-center justify-between px-8 py-4 border-b border-white/[0.06] bg-[#060710]/80 backdrop-blur-xl">
              <div />
              <ConnectButton />
            </header>

            {/* Page Content */}
            <main className="px-8 py-8">
              {children}
            </main>
          </div>

          {/* Background gradient orbs */}
          <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-indigo-500/[0.03] blur-[120px]" />
            <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-purple-500/[0.03] blur-[120px]" />
          </div>
        </WalletProvider>
      </body>
    </html>
  );
}

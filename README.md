# Soroban RentWatch Frontend 📊

The modern, real-time developer dashboard for managing Soroban smart contract TTL monitoring and automated rent extensions.

## 📖 Overview

**Soroban RentWatch** guarantees that your Soroban smart contract state is never accidentally archived. This frontend dashboard allows developers and protocol teams to register their Soroban contract IDs and specific keys (Instance, Persistent, or Contract Code) to be monitored by our background relayer engine. 

Developers can connect their Stellar wallets, monitor the health of their contracts in real-time, view their activity feed of automated extensions, and fund their virtual balance pools to pay for network fees.

## ✨ Features

* **Real-time Health Dashboard:** View progress bars mapping the remaining ledgers for all your monitored keys, instantly seeing which ones are Healthy, Warning, or Critical.
* **Wallet Integration:** Seamless Web3 login and transaction signing using the `@stellar/freighter-api`.
* **Key Management Table:** Add, remove, and configure specific extension thresholds for your Soroban state entries.
* **Funding Portal:** Generate unique deposit memos to fund your virtual XLM Balance Pool directly from Freighter or centralized exchanges.
* **Activity & Audit Logs:** Review the history of automated `ExtendFootprintTTL` transactions executed on your behalf, including the exact network fee costs.

## 🛠 Tech Stack

* **Framework:** Next.js 16.2 (App Router)
* **UI Library:** React 19
* **Styling:** Tailwind CSS v4
* **Blockchain Integration:** `@stellar/freighter-api`
* **Language:** TypeScript

## ⚙️ Environment Variables

Create a `.env.local` file in the root of the `frontend` directory:

```env
# The URL pointing to your deployed backend API (or localhost)
NEXT_PUBLIC_API_URL="http://localhost:3000/api"

# Stellar Network configuration for Freighter
NEXT_PUBLIC_STELLAR_NETWORK="TESTNET"
NEXT_PUBLIC_HORIZON_URL="https://horizon-testnet.stellar.org"
```

## 🚀 How to Run Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. Make sure your browser has the Freighter Wallet extension installed and configured to the Testnet for the best experience.

## 🚢 Deployment (Vercel)

This frontend is optimized for deployment on Vercel.
1. Import the repository into Vercel.
2. Set the **Root Directory** to `frontend`.
3. Add your `NEXT_PUBLIC_API_URL` pointing to your deployed Render backend in the Environment Variables tab.
4. Click Deploy. Vercel will automatically detect the Next.js framework and configure the build settings.

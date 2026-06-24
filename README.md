# Soroban RentWatch: Frontend Dashboard & Developer Portal

## 1. Executive Summary

Soroban RentWatch is a developer-first platform designed to solve the most critical pain point in the Stellar Soroban ecosystem: state archival due to unpaid rent. While the backend handles the heavy lifting of blockchain monitoring and transaction relaying, this **Frontend Dashboard** serves as the control center for developers and protocol teams. 

Built with Next.js 16 (App Router), React 19, and Tailwind CSS v4, the frontend delivers a real-time, highly responsive, and visually immersive experience. It bridges the gap between complex Web3 infrastructure and modern SaaS UX, allowing users to authenticate via Web3 wallets, monitor thousands of smart contract footprints at a glance, configure automated alerting, and manage virtual balance pools with zero friction.

---

## 2. Core User Experience Philosophy

When designing the RentWatch frontend, three core principles were established:

1. **Information Density without Clutter:** Developers need to monitor hundreds of contract keys simultaneously. The UI leverages dense tables and color-coded progress bars (Healthy, Warning, Critical) to make triage instant, while tucking complex XDR representations and detailed configuration behind modals and drawers.
2. **Web3 Native, Web2 Smooth:** Authentication relies entirely on the Stellar network via the Freighter wallet. There are no passwords to forget. However, the experience feels like a modern Web2 SaaS application, with optimistic UI updates, skeleton loaders, and seamless navigation.
3. **Actionable Insights:** The dashboard doesn't just show data; it demands action when necessary. Critical state expiry warnings and low XLM balance alerts are pushed to the forefront, guiding the developer exactly where intervention is needed.

---

## 3. Application Architecture

The frontend is built utilizing the Next.js App Router paradigm, which enforces a strict separation between Server Components and Client Components, optimizing performance and SEO.

### 3.1 Directory Structure & Routing

```text
src/
├── app/
│   ├── api/          # Next.js Route Handlers (Backend BFF / Proxy)
│   ├── fund/         # Deposit memo generation and balance management
│   ├── keys/         # Comprehensive table for managing Monitored Keys
│   ├── settings/     # Webhook configuration and notification preferences
│   ├── layout.tsx    # Root layout encompassing the Sidebar and WalletProvider
│   └── page.tsx      # The main Dashboard overview
├── components/       # Reusable React components (StatCard, StatusBadge, etc.)
└── public/           # Static assets, SVG icons, and branding
```

### 3.2 The API Layer (BFF)
Instead of the frontend components communicating directly with the external Node.js backend, all requests route through Next.js Route Handlers located in `src/app/api/`. This pattern acts as a Backend-For-Frontend (BFF).
- **CORS Mitigation:** By proxying requests through the Next.js server, we bypass complex cross-origin resource sharing issues.
- **Data Transformation:** The Route Handlers can reshape complex database models into flatter, UI-friendly JSON payloads before they hit the client components.
- **Authentication Injection:** It securely appends necessary headers or signatures before forwarding requests to the core backend.

---

## 4. Deep Dive: Key Interfaces

### 4.1 The Dashboard (`src/app/page.tsx`)
The primary landing zone upon connection.
- **Top-Level Metrics:** A row of `StatCard` components immediately displays the count of Healthy, Near Expiry, and Critical keys, alongside the user's current XLM Balance Pool.
- **TTL Health Chart:** A visually striking, real-time representation of expiring ledgers. It maps the `remaining` ledgers against the `max` threshold, rendering a dynamic gradient progress bar (Emerald for healthy, Amber for warning, Red for critical).
- **Activity Feed:** A rolling log of the latest automated extensions executed by the backend, formatted with relative timestamps (e.g., "2 hours ago") and success/failure indicators.

### 4.2 Key Management (`src/app/keys/page.tsx`)
The operational core where developers register their Soroban state.
- **The Data Grid:** A highly interactive table displaying all monitored keys. It exposes the Contract ID, the specific Key Type (Instance, Persistent), the current TTL status, and the configured extension thresholds.
- **Registration Flow:** Users can add new keys by providing the raw XDR representation of the ledger key. The frontend includes validation to ensure the XDR is well-formed before submission.
- **Threshold Tuning:** Developers can inline-edit the `thresholdLedgers` (when the backend should intervene) and `extendToLedgers` (how much rent to pay) for granular cost control.

### 4.3 Funding & Balance (`src/app/fund/page.tsx`)
To pay for network transaction fees, users must maintain a virtual balance.
- **Memo Generation:** The frontend queries the backend for the user's unique 64-character deposit memo.
- **Deposit Instructions:** It provides clear, copy-pasteable instructions and QR codes detailing exactly how to send XLM from Freighter or centralized exchanges to the operational wallet using the assigned memo.
- **Deposit History:** A historical table fetching from the `DepositLog` model, showing exactly when funds were received and credited to the balance pool.

### 4.4 Webhooks & Settings (`src/app/settings/page.tsx`)
For teams that rely on external alerting (Slack, PagerDuty, Discord).
- **Endpoint Configuration:** A secure form to input a target webhook URL.
- **Event Toggling:** Checkboxes to subscribe to specific events: Successful Extensions, Critical Expiry Warnings, and Low Balance Alerts.
- **Test Ping:** A utility button that triggers a mock payload from the backend to verify the webhook integration is active and correctly parsing data.

---

## 5. Web3 Integration & Freighter

The application leverages the `@stellar/freighter-api` to seamlessly integrate with the Soroban ecosystem.

### 5.1 The `WalletProvider` Component
This is a high-level React Context provider wrapping the entire application tree.
- **State Management:** It globally manages the connection status, the user's active Stellar public key, and the currently selected network (Testnet vs. Mainnet).
- **Session Hydration:** On initial load, it silently checks if Freighter is installed and if a session is already approved, hydrating the UI without requiring a manual click.
- **Network Guards:** If the user switches their Freighter wallet to Mainnet while the dashboard is configured for Testnet, the `WalletProvider` intercepts this and displays a prominent warning banner, preventing accidental transactions.

### 5.2 Transaction Signing
While the backend handles the automated `ExtendFootprintTTL` transactions, the frontend uses Freighter for administrative actions, such as verifying ownership of a contract before allowing a user to register it for monitoring. This utilizes Freighter's `signTransaction` and `signAuthEntry` methods.

---

## 6. Styling and UI Implementation

The visual identity of Soroban RentWatch is built entirely on Tailwind CSS v4.

- **Dark Mode First:** The UI is inherently designed for a dark-mode environment, utilizing a deeply saturated color palette (`zinc-950`, `violet-900`) to reduce eye strain for developers working late hours.
- **Micro-interactions:** Buttons and cards feature subtle scale transformations and border-color transitions on hover, providing tactile feedback without overwhelming the senses.
- **Glassmorphism Elements:** Navigational elements and modal backdrops utilize translucent backgrounds with background-blur, creating a sense of depth and hierarchy within the dashboard.
- **Responsive Design:** Every grid and table is meticulously structured to collapse gracefully from ultra-wide desktop monitors down to mobile devices, ensuring the dashboard is accessible on the go.

---

## 7. State Management and Data Fetching

Instead of relying on heavy global state libraries like Redux, the frontend utilizes React 19's native hooks combined with SWR (State-While-Revalidate) patterns for data fetching.

- **Optimistic UI:** When a user deletes a monitored key or updates a threshold, the UI immediately reflects the change locally while the API request is in flight. If the request fails, the UI gracefully rolls back to the previous state.
- **Polling vs. WebSockets:** To keep the TTL Health bars updating in near real-time, the dashboard employs intelligent long-polling. However, it implements exponential backoff if the user minimizes the tab, preserving browser resources and reducing backend load.

---

## 8. Deployment and CI/CD

The frontend is structurally optimized for Edge deployment, specifically targeting the Vercel platform.

- **Build Process:** Running `npm run build` triggers the Next.js compiler, which statically analyzes the route tree, pre-rendering static pages and optimizing images and fonts.
- **Edge Routing:** The `src/app/api/` route handlers can be configured to run on Vercel's Edge Network, ensuring minimal latency regardless of where the developer is located globally.
- **Environment Configuration:** The deployment pipeline only requires a few environment variables, primarily defining the location of the backend API and the target Stellar network, making staging and production environments trivial to duplicate.

---

## 9. Conclusion

The Soroban RentWatch Frontend is more than just a data visualization tool; it is a comprehensive operational console. By abstracting the complexities of XDR parsing, ledger math, and transaction fee estimation behind a sleek, intuitive interface, it empowers developers to focus on building their protocols, knowing their smart contract infrastructure is meticulously monitored and easily managed.

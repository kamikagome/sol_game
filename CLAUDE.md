# Scrolly GameJam - Codebase Guide

Welcome! This guide will help you understand the structure and patterns used in this Solana dApp built with Next.js.

## What Is This Project?

This is a **Solana dApp scaffold** - a starter template for building decentralized applications on the Solana blockchain. It's built with Next.js 13, React 18, and integrates with Solana wallets to enable blockchain interactions.

Think of it as a foundation that handles all the complex wallet connection logic, blockchain communication, and state management so you can focus on building your dApp's unique features.

## Tech Stack

- **Next.js 13** - React framework for production (handles routing, SSR, and more)
- **React 18** - UI library
- **TypeScript** - Type-safe JavaScript
- **Solana Web3.js** - Library for interacting with Solana blockchain
- **Wallet Adapter** - Connects to various Solana wallets (Phantom, Solflare, etc.)
- **Zustand** - Lightweight state management
- **Tailwind CSS** - Utility-first CSS framework
- **DaisyUI** - Tailwind component library

## Project Structure

```
scrolly-gamejam/
├── src/
│   ├── components/      # Reusable UI components
│   ├── contexts/        # React Context providers for app-wide state
│   ├── hooks/           # Custom React hooks
│   ├── models/          # TypeScript types and interfaces
│   ├── pages/           # Next.js pages (routes)
│   ├── stores/          # Zustand state stores
│   ├── styles/          # Global CSS styles
│   ├── utils/           # Helper functions
│   └── views/           # Page-specific view components
├── public/              # Static assets
└── [config files]
```

### Understanding the Folder Structure

**pages/** - This is Next.js routing. Each `.tsx` file becomes a route:
- [index.tsx](src/pages/index.tsx) → `/` (homepage)
- [basics.tsx](src/pages/basics.tsx) → `/basics` (demo page)
- [_app.tsx](src/pages/_app.tsx) → Wraps all pages with providers and layout

**views/** - Contains the actual page content:
- Pages are thin wrappers with metadata
- Views contain the real UI logic
- Example: [pages/index.tsx](src/pages/index.tsx) renders [views/home/index.tsx](src/views/home/index.tsx)

**components/** - Reusable pieces like buttons, forms, navigation:
- [AppBar.tsx](src/components/AppBar.tsx) - Top navigation bar
- [SendTransaction.tsx](src/components/SendTransaction.tsx) - Transaction component
- [RequestAirdrop.tsx](src/components/RequestAirdrop.tsx) - Get test SOL
- Each component is self-contained and reusable

**contexts/** - React Context for app-wide configuration:
- [ContextProvider.tsx](src/contexts/ContextProvider.tsx) - Main provider wrapping everything
- [NetworkConfigurationProvider.tsx](src/contexts/NetworkConfigurationProvider.tsx) - Network selection (devnet/testnet/mainnet)
- [AutoConnectProvider.tsx](src/contexts/AutoConnectProvider.tsx) - Auto-connect wallet setting

**stores/** - Zustand stores for global state:
- [useUserSOLBalanceStore.tsx](src/stores/useUserSOLBalanceStore.tsx) - Tracks user's SOL balance
- [useNotificationStore.tsx](src/stores/useNotificationStore.tsx) - Manages toast notifications

## Key Concepts

### 1. Wallet Connection Flow

The app uses Solana Wallet Adapter to connect to wallets:

```typescript
// In any component, access wallet like this:
import { useWallet } from '@solana/wallet-adapter-react';

const { publicKey, connected, sendTransaction } = useWallet();
```

**Flow:**
1. User clicks "Connect Wallet" button ([AppBar.tsx:67](src/components/AppBar.tsx#L67))
2. Wallet Adapter shows available wallets
3. User selects wallet and approves connection
4. `publicKey` becomes available throughout the app
5. Components can now interact with blockchain

### 2. Network Configuration

The app can connect to different Solana networks:
- **Devnet** - Development network with free test SOL (default)
- **Testnet** - Public testing network
- **Mainnet** - Real Solana blockchain (real money!)

Check [NetworkConfigurationProvider.tsx:17](src/contexts/NetworkConfigurationProvider.tsx#L17) - uses localStorage to persist selection.

### 3. Blockchain Interactions

See [SendTransaction.tsx](src/components/SendTransaction.tsx) for a complete example:

**Basic transaction flow:**
```typescript
// 1. Create instruction
const instructions = [
  SystemProgram.transfer({
    fromPubkey: publicKey,
    toPubkey: recipientPublicKey,
    lamports: 1_000_000, // 0.001 SOL
  })
];

// 2. Get recent blockhash
const latestBlockhash = await connection.getLatestBlockhash();

// 3. Create transaction message
const message = new TransactionMessage({
  payerKey: publicKey,
  recentBlockhash: latestBlockhash.blockhash,
  instructions,
}).compileToLegacyMessage();

// 4. Create versioned transaction
const transaction = new VersionedTransaction(message);

// 5. Send and confirm
const signature = await sendTransaction(transaction, connection);
await connection.confirmTransaction({ signature, ...latestBlockhash });
```

**Important:** 1 SOL = 1,000,000,000 lamports (like cents to dollars)

### 4. State Management with Zustand

Zustand is simpler than Redux. Example from [useUserSOLBalanceStore.tsx](src/stores/useUserSOLBalanceStore.tsx):

```typescript
// Define the store
const useUserSOLBalanceStore = create<UserSOLBalanceStore>((set) => ({
  balance: 0,
  getUserSOLBalance: async (publicKey, connection) => {
    const balance = await connection.getBalance(publicKey);
    set({ balance: balance / LAMPORTS_PER_SOL });
  },
}));

// Use in components
const balance = useUserSOLBalanceStore((s) => s.balance);
const { getUserSOLBalance } = useUserSOLBalanceStore();
```

**When to use stores:**
- Data needed across multiple components
- Blockchain state (balances, transactions)
- User preferences

**When to use local state:**
- Component-specific UI state
- Form inputs
- Toggles and modals

### 5. Notifications System

See [utils/notifications.tsx](src/utils/notifications.tsx):

```typescript
import { notify } from "../utils/notifications";

// Show success
notify({
  type: 'success',
  message: 'Transaction successful!',
  txid: signature
});

// Show error
notify({
  type: 'error',
  message: 'Transaction failed!',
  description: error.message
});
```

Notifications appear as toasts in the top-right corner.

## Common Development Tasks

### Adding a New Page

1. Create view in [src/views/](src/views/):
```typescript
// src/views/mypage/index.tsx
import { FC } from 'react';

export const MyPageView: FC = () => {
  return <div>My New Page</div>;
};
```

2. Create page in [src/pages/](src/pages/):
```typescript
// src/pages/mypage.tsx
import type { NextPage } from "next";
import Head from "next/head";
import { MyPageView } from "../views/mypage";

const MyPage: NextPage = () => {
  return (
    <div>
      <Head>
        <title>My Page</title>
      </Head>
      <MyPageView />
    </div>
  );
};

export default MyPage;
```

3. Add navigation link in [AppBar.tsx](src/components/AppBar.tsx#L56-L66)

### Creating a New Component

1. Create file in [src/components/](src/components/):
```typescript
import { FC } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

export const MyComponent: FC = () => {
  const { publicKey } = useWallet();

  return (
    <div>
      {publicKey ? (
        <p>Connected: {publicKey.toBase58()}</p>
      ) : (
        <p>Not connected</p>
      )}
    </div>
  );
};
```

2. Import and use in views

### Querying Blockchain Data

```typescript
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react';

const { connection } = useConnection();
const { publicKey } = useWallet();
const [balance, setBalance] = useState(0);

useEffect(() => {
  if (!publicKey) return;

  const getBalance = async () => {
    const bal = await connection.getBalance(publicKey);
    setBalance(bal / LAMPORTS_PER_SOL);
  };

  getBalance();
}, [publicKey, connection]);
```

### Making Transactions

Follow the pattern in [SendTransaction.tsx](src/components/SendTransaction.tsx):
1. Check wallet is connected
2. Create instructions
3. Build transaction message
4. Get recent blockhash
5. Create versioned transaction
6. Send and confirm
7. Handle errors with notifications

## Important Files to Know

### Core Setup
- [_app.tsx](src/pages/_app.tsx) - App wrapper with all providers
- [ContextProvider.tsx](src/contexts/ContextProvider.tsx) - Sets up wallet adapter
- [tailwind.config.js](tailwind.config.js) - Custom theme (dark mode, Solana colors)

### Example Components
- [SendTransaction.tsx](src/components/SendTransaction.tsx) - How to send SOL
- [SendVersionedTransaction.tsx](src/components/SendVersionedTransaction.tsx) - Versioned tx example
- [SignMessage.tsx](src/components/SignMessage.tsx) - Message signing
- [RequestAirdrop.tsx](src/components/RequestAirdrop.tsx) - Get test SOL on devnet

### UI Components
- [AppBar.tsx](src/components/AppBar.tsx) - Navigation with wallet button
- [Footer.tsx](src/components/Footer.tsx) - Page footer
- [Notification.tsx](src/components/Notification.tsx) - Toast notification display

## Development Workflow

### Getting Started
```bash
npm install          # Install dependencies
npm run dev          # Start dev server at localhost:3000
npm run build        # Build for production
npm run lint         # Check for code issues
```

### Making Changes
1. Start dev server (`npm run dev`)
2. Edit files - changes auto-reload
3. Check browser console for errors
4. Test wallet connection with a browser wallet extension
5. Use devnet for testing (free test SOL)

### Debugging Tips

**Wallet won't connect?**
- Install Phantom or Solflare browser extension
- Make sure you're on devnet
- Check browser console for errors

**Transaction failing?**
- Check you have enough SOL (use RequestAirdrop on devnet)
- Verify network is correct (devnet/testnet/mainnet)
- Check console logs for specific error messages
- Ensure publicKey exists before sending

**Component not updating?**
- Check useEffect dependencies array
- Verify state is being set correctly
- Use React DevTools to inspect component state

**Styles not applying?**
- Tailwind uses JIT mode - restart dev server
- Check class names for typos
- DaisyUI classes: `btn`, `card`, `modal`, etc.

## Understanding the Code Flow

### App Initialization
1. [_app.tsx](src/pages/_app.tsx) wraps everything
2. [ContextProvider](src/contexts/ContextProvider.tsx) initializes wallet adapter
3. [NetworkConfigurationProvider](src/contexts/NetworkConfigurationProvider.tsx) loads saved network
4. [AutoConnectProvider](src/contexts/AutoConnectProvider.tsx) auto-connects if enabled
5. [AppBar](src/components/AppBar.tsx) renders with wallet button
6. Page component loads and renders its view

### User Connects Wallet
1. Click WalletMultiButton in [AppBar](src/components/AppBar.tsx#L67)
2. Wallet adapter shows modal with available wallets
3. User selects wallet (e.g., Phantom)
4. Browser extension prompts for approval
5. `publicKey` becomes available via `useWallet()`
6. Components using `useWallet()` re-render
7. [HomeView](src/views/home/index.tsx#L22-L27) fetches SOL balance

### Transaction Flow
1. User clicks transaction button (e.g., in [SendTransaction.tsx](src/components/SendTransaction.tsx#L57-L73))
2. `onClick` callback executes ([SendTransaction.tsx:10](src/components/SendTransaction.tsx#L10))
3. Check wallet connected, create instructions
4. Build and send transaction
5. Wallet prompts user to approve
6. Transaction sent to blockchain
7. Wait for confirmation
8. Show notification with result
9. Update UI state if needed

## Common Patterns

### Conditional Rendering Based on Wallet
```typescript
const { publicKey } = useWallet();

return (
  <>
    {publicKey ? (
      <div>Connected: {publicKey.toBase58()}</div>
    ) : (
      <div>Please connect wallet</div>
    )}
  </>
);
```

### Loading Blockchain Data
```typescript
useEffect(() => {
  if (!publicKey) return;

  const fetchData = async () => {
    // Fetch from blockchain
    const data = await connection.getAccountInfo(publicKey);
    // Update state
  };

  fetchData();
}, [publicKey, connection]);
```

### Error Handling
```typescript
try {
  const signature = await sendTransaction(transaction, connection);
  notify({ type: 'success', message: 'Success!', txid: signature });
} catch (error: any) {
  notify({
    type: 'error',
    message: 'Failed!',
    description: error?.message
  });
  console.error('Error:', error);
}
```

## Styling Guide

This project uses **Tailwind CSS** with **DaisyUI** components:

### Tailwind Utility Classes
```tsx
<div className="flex flex-col items-center justify-center">
  <h1 className="text-4xl font-bold text-white">Title</h1>
  <button className="mt-4 px-6 py-2 bg-blue-500 rounded">
    Click me
  </button>
</div>
```

### DaisyUI Components
```tsx
<button className="btn btn-primary">Primary Button</button>
<div className="card bg-base-100 shadow-xl">
  <div className="card-body">Card Content</div>
</div>
```

### Custom Theme
See [tailwind.config.js:17-47](tailwind.config.js#L17-L47) for the Solana theme colors:
- Primary: Black `#000000`
- Accent: Purple gradient `#9945FF`
- Uses dark mode by default

### Responsive Design
```tsx
<div className="flex flex-col md:flex-row">
  {/* Stacks on mobile, side-by-side on desktop */}
</div>
```

## Resources for Learning

### Solana Development
- [Solana Cookbook](https://solanacookbook.com/) - Code examples and guides
- [Solana Docs](https://docs.solana.com/) - Official documentation
- [Solana Web3.js Docs](https://solana-labs.github.io/solana-web3.js/) - JavaScript library

### Next.js
- [Next.js Docs](https://nextjs.org/docs) - Framework documentation
- [Learn Next.js](https://nextjs.org/learn) - Interactive tutorial

### React
- [React Docs](https://react.dev/) - Official React documentation
- [React Hooks](https://react.dev/reference/react) - useState, useEffect, etc.

### Styling
- [Tailwind CSS Docs](https://tailwindcss.com/docs) - Utility classes
- [DaisyUI Components](https://daisyui.com/components/) - Component library

## Troubleshooting

### Build Errors
- Delete [node_modules/](node_modules/) and [.next/](.next/) folders
- Run `npm install` again
- Clear browser cache

### Wallet Adapter Issues
- Update wallet browser extension
- Try different wallet (Phantom, Solflare, etc.)
- Check network settings match (devnet vs mainnet)

### Transaction Errors
- **Insufficient funds**: Use RequestAirdrop on devnet
- **Blockhash not found**: Transaction expired, try again
- **Signature verification failed**: Wallet didn't sign, check approval

### TypeScript Errors
- Check imports are correct
- Verify types match (PublicKey, Connection, etc.)
- Look for missing null checks on `publicKey`

## Next Steps

Once you understand the basics:

1. **Explore the Basics page** - See transaction examples in action
2. **Modify HomeView** - Try adding your own UI elements
3. **Create a new component** - Practice the component pattern
4. **Build a feature** - Ideas:
   - Display transaction history
   - Show account data
   - Create a token transfer UI
   - Build a simple game or app

5. **Learn Solana programs** - To build custom blockchain logic:
   - [Anchor Framework](https://www.anchor-lang.com/) - Solana development framework
   - [Solana Program Library](https://spl.solana.com/) - Common programs (tokens, etc.)

## Getting Help

- **Console logs**: Check browser DevTools console
- **React DevTools**: Install extension to inspect components
- **Solana Explorer**: View transactions at [explorer.solana.com](https://explorer.solana.com/)
- **Community**: Solana Discord, Stack Overflow

## Summary

This scaffold provides:
- ✅ Wallet connection handling
- ✅ Network switching (devnet/testnet/mainnet)
- ✅ Transaction examples
- ✅ State management setup
- ✅ Notification system
- ✅ Responsive UI with Tailwind
- ✅ TypeScript for type safety

You can focus on building your dApp's unique features without worrying about the foundational blockchain integration!

Happy coding! 🚀

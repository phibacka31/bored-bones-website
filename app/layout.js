'use client'; // This tells Next.js that this part needs to run in the browser

import { WagmiProvider, createConfig, http } from 'wagmi'; // Import WagmiProvider (corrected from WagmiConfig), createConfig, and http
import { mainnet, sepolia } from 'wagmi/chains'; // Import blockchain definitions
import { injected, walletConnect } from '@wagmi/connectors'; // Import functional connectors
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'; // Import QueryClient and QueryClientProvider

import DropdownNav from './components/DropdownNav'; // Keep your navigation import
import BackgroundMusic from './components/BackgroundMusic'; // Add this import
import SkeletonVoid from './components/SkeletonVoid'; // Add this import
import './globals.css'; // Keep your global styles import

// 1. Set up the chains (blockchain networks) your app will support and their transports
const chains = [mainnet, sepolia];

const transports = chains.reduce((acc, chain) => {
  acc[chain.id] = http(); // Use http() transport for each chain
  return acc;
}, {});

const projectId = '4ff05250b009ca648622a23e0e089c6f'; // Your Wallet Connect Project ID

// 2. Set up the wagmi config
const wagmiConfig = createConfig({
  autoConnect: true, // Automatically try to connect if a wallet was connected before
  connectors: [
    injected({ // Use the functional injected connector
      chains, // Tell it which chains it can connect to
      options: {
        name: 'Injected', // Name for the connector
        shimDisconnect: true,
      },
    }),
    walletConnect({ // Add the functional walletConnect connector
      projectId,
      chains,
      showQrModal: true, // Set to true to show the QR code modal automatically
    }),
  ],
  chains, // Add the chains array to the config
  transports, // Add the transports object to the config
});

// 3. Create a QueryClient instance
const queryClient = new QueryClient();

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {/* Wrap with QueryClientProvider */}
        <QueryClientProvider client={queryClient}>
          {/* Wrap with WagmiProvider */}
          <WagmiProvider config={wagmiConfig}>
            {/* Place components that should appear on every page here */}
            <SkeletonVoid /> {/* Add this line */}
            <DropdownNav />
            <BackgroundMusic />

            {/* This is where the content of your individual pages will be rendered */}
            {children}
          </WagmiProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
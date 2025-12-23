// wagmi-config.ts
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'wagmi';
import type { Chain } from 'viem';

// Define local Anvil network for development
export const anvilChain: Chain = {
  id: 31337,
  name: 'Anvil Local',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['http://127.0.0.1:8545'],
    },
  },
} as const;

// Use default chains from RainbowKit for now
export const config = getDefaultConfig({
  appName: 'My Crypto Wallet',
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'fa42d40f07393f50fef277b0fee2b6ab',
  chains: [anvilChain], // Start with just the local chain
  transports: {
    [anvilChain.id]: http(),
  },
  ssr: true,
});

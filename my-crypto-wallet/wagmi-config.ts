// wagmi-config.ts
import { createConfig } from 'wagmi';
import { getDefaultWallets } from '@rainbow-me/rainbowkit';
import { http } from 'wagmi';
import type { Chain } from 'viem';
import { privateKeyConnector } from './src/app/connectors/PrivateKeyConnector';
import {anvilChain } from './chain-config'


// Get default connectors from RainbowKit
const { connectors } = getDefaultWallets({
  appName: 'My Crypto Wallet',
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'fa42d40f07393f50fef277b0fee2b6ab',
});

// Add private key connector
connectors.push(privateKeyConnector);

export const config = createConfig({
  chains: [anvilChain],
  connectors,
  transports: {
    [anvilChain.id]: http(),
  },
  ssr: true,
});

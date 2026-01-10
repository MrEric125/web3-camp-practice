// wagmi-config.ts
import { createConfig } from 'wagmi';
import { getDefaultWallets } from '@rainbow-me/rainbowkit';
import { http } from 'wagmi';
import type { Chain } from 'viem';
import { privateKeyConnector } from './src/app/connectors/wallet/PrivateKeyConnector';
import { mnemonicConnector } from './src/app/connectors/wallet/MnemonicConnector';
import { defaultChains } from './chain-config';

// Get default connectors from RainbowKit
const { connectors } = getDefaultWallets({
  appName: 'My Crypto Wallet',
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'fa42d40f07393f50fef277b0fee2b6ab',
});

// Add connectors
connectors.push(privateKeyConnector);
connectors.push(mnemonicConnector);

// Function to get all chains including custom ones
export function getAllChains(): Chain[] {
  const customNetworks = getCustomNetworks();
  return [...defaultChains, ...customNetworks];
}

// Function to create transport configuration
export function getTransports(chains: Chain[]) {
  const transports: Record<number, any> = {};
  chains.forEach(chain => {
    transports[chain.id] = http(chain.rpcUrls.default.http[0]);
  });
  return transports;
}

// Initial config with default chains
export const config = createConfig({
  chains: [defaultChains[0], ...defaultChains.slice(1)] as const,
  connectors,
  transports: getTransports(defaultChains),
  ssr: true,
});

// Custom network interface
export interface CustomNetwork {
  id: number;
  name: string;
  rpcUrl: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  blockExplorerUrl?: string;
}

// Helper functions for custom networks
export function getCustomNetworks(): Chain[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem('customNetworks');
    if (!stored) return [];
    const customNetworks: CustomNetwork[] = JSON.parse(stored);
    return customNetworks.map(net => ({
      id: net.id,
      name: net.name,
      nativeCurrency: net.nativeCurrency,
      rpcUrls: {
        default: {
          http: [net.rpcUrl],
        },
      },
      blockExplorers: net.blockExplorerUrl ? {
        default: { name: 'Explorer', url: net.blockExplorerUrl },
      } : undefined,
    }));
  } catch {
    return [];
  }
}

export function saveCustomNetwork(network: CustomNetwork) {
  if (typeof window === 'undefined') return;
  try {
    const existing = getCustomNetworks();
    const updated = [...existing, network];
    localStorage.setItem('customNetworks', JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save custom network:', error);
  }
}

export function removeCustomNetwork(chainId: number) {
  if (typeof window === 'undefined') return;
  try {
    const existing = getCustomNetworks();
    const filtered = existing.filter(net => net.id !== chainId);
    localStorage.setItem('customNetworks', JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to remove custom network:', error);
  }
}

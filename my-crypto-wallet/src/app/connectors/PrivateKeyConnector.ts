import { createConnector } from 'wagmi';
import { privateKeyToAccount } from 'viem/accounts';
import { createWalletClient, http } from 'viem';
import type { Chain } from 'viem';
import {anvilChain } from '@/chain-config'

export const privateKeyConnector = createConnector((config) => ({
  id: 'privateKey',
  name: 'Private Key',
  type: 'privateKey' as any,

  connect: async ({ chainId } = {}) => {
    const privateKey = localStorage.getItem('privateKey');
    if (!privateKey) {
      throw new Error('No private key set. Please import a private key first.');
    }

    const account = privateKeyToAccount(privateKey as `0x${string}`);
    return {
      accounts: [account.address] as readonly `0x${string}`[],
      chainId: (chainId || anvilChain.id) as number,
    } as any;
  },

  disconnect: async () => {
    localStorage.removeItem('privateKey');
  },

  getAccounts: async () => {
    const privateKey = localStorage.getItem('privateKey');
    if (!privateKey) return [];
    const account = privateKeyToAccount(privateKey as `0x${string}`);
    return [account.address];
  },

  getChainId: async () => anvilChain.id,

  getProvider: async () => null,

  isAuthorized: async () => !!localStorage.getItem('privateKey'),

  onAccountsChanged: (accounts) => {
    // not implemented
  },

  onChainChanged: (chainId) => {
    // not implemented
  },

  onDisconnect: () => {
    // not implemented
  },

  getWalletClient: async (parameters: { chainId?: number } = {}) => {
    const { chainId } = parameters;
    const privateKey = localStorage.getItem('privateKey');
    if (!privateKey) return null;
    const account = privateKeyToAccount(privateKey as `0x${string}`);
    return createWalletClient({
      account,
      transport: http(anvilChain.rpcUrls.default.http[0]),
      chain: anvilChain,
    });
  },
}));

import { createConnector } from 'wagmi';
import { privateKeyToAccount } from 'viem/accounts';
import { createWalletClient, http } from 'viem';
import type { Chain } from 'viem';
import {anvilChain } from '../../../../chain-config'

export interface Wallet {
  id: string;
  name: string;
  type: 'privateKey' | 'mnemonic';
  privateKey?: string;
  mnemonic?: string;
  derivationPath?: string;
  address: string;
}

const getWallets = (): Wallet[] => {
  const stored = localStorage.getItem('wallets');
  return stored ? JSON.parse(stored) : [];
};

const setWallets = (wallets: Wallet[]) => {
  localStorage.setItem('wallets', JSON.stringify(wallets));
};

const getSelectedWalletId = (): string | null => {
  return localStorage.getItem('selectedWalletId');
};

const setSelectedWalletId = (id: string | null) => {
  if (id) {
    localStorage.setItem('selectedWalletId', id);
  } else {
    localStorage.removeItem('selectedWalletId');
  }
};

export const privateKeyConnector = createConnector((config) => ({
  id: 'privateKey',
  name: 'Private Key',
  type: 'privateKey' as any,

  connect: async ({ chainId } = {}) => {
    const selectedWalletId = getSelectedWalletId();
    if (!selectedWalletId) {
      throw new Error('No wallet selected. Please select a wallet first.');
    }

    const wallets = getWallets();
    const wallet = wallets.find(w => w.id === selectedWalletId);
    if (!wallet) {
      throw new Error('Selected wallet not found.');
    }

    const account = privateKeyToAccount(wallet.privateKey as `0x${string}`);
    return {
      accounts: [account.address] as readonly `0x${string}`[],
      chainId: (chainId || anvilChain.id) as number,
    } as any;
  },

  disconnect: async () => {
    setSelectedWalletId(null);
  },

  getAccounts: async () => {
    const selectedWalletId = getSelectedWalletId();
    if (!selectedWalletId) return [];

    const wallets = getWallets();
    const wallet = wallets.find(w => w.id === selectedWalletId);
    if (!wallet) return [];

    const account = privateKeyToAccount(wallet.privateKey as `0x${string}`);
    return [account.address];
  },

  getChainId: async () => anvilChain.id,

  getProvider: async () => null,

  isAuthorized: async () => !!getSelectedWalletId(),

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
    const selectedWalletId = getSelectedWalletId();
    if (!selectedWalletId) return null;

    const wallets = getWallets();
    const wallet = wallets.find(w => w.id === selectedWalletId);
    if (!wallet) return null;

    const account = privateKeyToAccount(wallet.privateKey as `0x${string}`);
    return createWalletClient({
      account,
      transport: http(anvilChain.rpcUrls.default.http[0]),
      chain: anvilChain,
    });
  },
}));

// Helper functions for wallet management
export const walletManager = {
  getWallets,
  setWallets,
  addPrivateKeyWallet: (name: string, privateKey: string) => {
    const account = privateKeyToAccount(privateKey as `0x${string}`);
    const wallets = getWallets();
    const newWallet: Wallet = {
      id: Date.now().toString(),
      name,
      type: 'privateKey',
      privateKey,
      address: account.address,
    };
    wallets.push(newWallet);
    setWallets(wallets);
    return newWallet;
  },
  removeWallet: (id: string) => {
    const wallets = getWallets().filter(w => w.id !== id);
    setWallets(wallets);
    if (getSelectedWalletId() === id) {
      setSelectedWalletId(null);
    }
  },
  selectWallet: (id: string) => {
    setSelectedWalletId(id);
  },
  getSelectedWallet: () => {
    const selectedId = getSelectedWalletId();
    if (!selectedId) return null;
    return getWallets().find(w => w.id === selectedId) || null;
  },
};

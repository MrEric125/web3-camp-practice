import { createConnector } from 'wagmi';
import { hdKeyToAccount, mnemonicToAccount } from 'viem/accounts';
import { createWalletClient, http } from 'viem';
import type { Chain } from 'viem';
import { generateMnemonic, validateMnemonic } from 'bip39';
import { anvilChain } from '../../../chain-config';
import type { Wallet } from './PrivateKeyConnector';

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

export const mnemonicConnector = createConnector((config) => ({
  id: 'mnemonic',
  name: 'Mnemonic',
  type: 'mnemonic' as any,

  connect: async ({ chainId } = {}) => {
    const selectedWalletId = getSelectedWalletId();
    if (!selectedWalletId) {
      throw new Error('No wallet selected. Please select a wallet first.');
    }

    const wallets = getWallets();
    const wallet = wallets.find(w => w.id === selectedWalletId);
    if (!wallet || wallet.type !== 'mnemonic') {
      throw new Error('Selected wallet not found or not a mnemonic wallet.');
    }

    const account = mnemonicToAccount(wallet.mnemonic as string, {
      path: (wallet.derivationPath || "m/44'/60'/0'/0/0") as `m/44'/60'/${string}`
    });

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
    if (!wallet || wallet.type !== 'mnemonic') return [];

    const account = mnemonicToAccount(wallet.mnemonic as string, {
      path: (wallet.derivationPath || "m/44'/60'/0'/0/0") as `m/44'/60'/${string}`
    });
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
    if (!wallet || wallet.type !== 'mnemonic') return null;

    const account = mnemonicToAccount(wallet.mnemonic as string, {
      path: (wallet.derivationPath || "m/44'/60'/0'/0/0") as `m/44'/60'/${string}`
    });
    return createWalletClient({
      account,
      transport: http(anvilChain.rpcUrls.default.http[0]),
      chain: anvilChain,
    });
  },
}));

// Helper functions for mnemonic wallet management
export const mnemonicWalletManager = {
  generateMnemonicPhrase: () => {
    return generateMnemonic(128); // 12 words
  },

  validateMnemonicPhrase: (mnemonic: string) => {
    return validateMnemonic(mnemonic);
  },

  generateAccountFromMnemonic: (mnemonic: string, index: number = 0) => {
    const path = `m/44'/60'/0'/0/${index}`;
    const account = mnemonicToAccount(mnemonic, { path: path as `m/44'/60'/${string}` });
    return {
      address: account.address,
      path,
      privateKey: account.getHdKey().privateKey
    };
  },

  addMnemonicWallet: (name: string, mnemonic: string, index: number = 0) => {
    if (!validateMnemonic(mnemonic)) {
      throw new Error('Invalid mnemonic phrase');
    }

    const accountInfo = mnemonicWalletManager.generateAccountFromMnemonic(mnemonic, index);
    const wallets = getWallets();

    const newWallet: Wallet = {
      id: Date.now().toString(),
      name,
      type: 'mnemonic',
      mnemonic,
      derivationPath: accountInfo.path,
      address: accountInfo.address,
    };

    wallets.push(newWallet);
    setWallets(wallets);
    return newWallet;
  },

  generateMultipleAccounts: (mnemonic: string, count: number = 5) => {
    const accounts = [];
    for (let i = 0; i < count; i++) {
      accounts.push(mnemonicWalletManager.generateAccountFromMnemonic(mnemonic, i));
    }
    return accounts;
  },

  addMultipleMnemonicWallets: (baseName: string, mnemonic: string, count: number = 5) => {
    if (!validateMnemonic(mnemonic)) {
      throw new Error('Invalid mnemonic phrase');
    }

    const wallets = getWallets();
    const newWallets: Wallet[] = [];

    for (let i = 0; i < count; i++) {
      const accountInfo = mnemonicWalletManager.generateAccountFromMnemonic(mnemonic, i);
      const wallet: Wallet = {
        id: `${Date.now()}-${i}`,
        name: `${baseName} #${i + 1}`,
        type: 'mnemonic',
        mnemonic,
        derivationPath: accountInfo.path,
        address: accountInfo.address,
      };
      newWallets.push(wallet);
    }

    setWallets([...wallets, ...newWallets]);
    return newWallets;
  },
};

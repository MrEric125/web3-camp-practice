// src/types/index.ts
export interface Account {
  id: string;
  name: string;
  address: string;
  privateKey?: string; // 加密存储
  publicKey: string;
  balance: string;
  createdAt: Date;
}

export interface Network {
  id: string;
  name: string;
  rpcUrl: string;
  chainId: number;
  currency: string;
  explorerUrl: string;
  isTestnet: boolean;
}

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  status: 'pending' | 'success' | 'failed';
  timestamp: Date;
  nonce: number;
  gasUsed?: string;
}

export interface WalletState {
  accounts: Account[];
  currentAccount: Account | null;
  currentNetwork: Network;
  isConnected: boolean;
  transactions: Transaction[];
}
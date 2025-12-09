// src/hooks/useWallet.ts - 简化版本
import { useState } from 'react';
import { Account, Network, WalletState } from '../types';
import { NETWORKS, DEFAULT_NETWORK } from '../utils/networks';

// 简化版本，先确保应用能运行
export const useWallet = () => {
  const [state, setState] = useState<WalletState>({
    accounts: [],
    currentAccount: null,
    currentNetwork: DEFAULT_NETWORK,
    isConnected: false,
    transactions: []
  });

  const createNewAccount = async (name: string, password: string) => {
    // 简化实现
    const newAccount: Account = {
      id: `acc-${Date.now()}`,
      name,
      address: `0x${Math.random().toString(16).slice(2, 42)}`,
      publicKey: `0x${Math.random().toString(16).slice(2, 42)}`,
      balance: '0',
      createdAt: new Date()
    };

    setState(prev => ({
      ...prev,
      accounts: [...prev.accounts, newAccount],
      currentAccount: newAccount
    }));

    return newAccount;
  };

  const importAccountByPrivateKey = async (privateKey: string, name: string, password: string) => {
    // 简化实现
    const importedAccount: Account = {
      id: `imp-${Date.now()}`,
      name,
      address: `0x${privateKey.slice(-40)}`,
      publicKey: `0x${privateKey.slice(-40)}`,
      balance: '0',
      createdAt: new Date()
    };

    setState(prev => ({
      ...prev,
      accounts: [...prev.accounts, importedAccount],
      currentAccount: importedAccount
    }));

    return importedAccount;
  };

  const sendTransaction = async (to: string, value: string, password: string) => {
    // 简化实现
    alert(`模拟发送 ${value} ETH 到 ${to}`);
    return { hash: `0x${Math.random().toString(16).slice(2)}`, receipt: {} };
  };

  return {
    ...state,
    createNewAccount,
    importAccountByPrivateKey,
    sendTransaction,
    switchAccount: async (accountId: string) => {
      const account = state.accounts.find(acc => acc.id === accountId);
      if (account) {
        setState(prev => ({ ...prev, currentAccount: account }));
      }
    },
    switchNetwork: async (networkId: string) => {
      const network = NETWORKS.find(n => n.id === networkId);
      if (network) {
        setState(prev => ({ ...prev, currentNetwork: network }));
      }
    },
    connectExternalWallet: async () => {
      const externalAccount: Account = {
        id: `ext-${Date.now()}`,
        name: 'External Wallet',
        address: '0xExternalWalletAddress',
        publicKey: '0xExternalWalletAddress',
        balance: '1.5',
        createdAt: new Date()
      };
      
      setState(prev => ({
        ...prev,
        accounts: [...prev.accounts, externalAccount],
        currentAccount: externalAccount,
        isConnected: true
      }));
      
      return externalAccount;
    },
    exportPrivateKey: () => '0x模拟私钥',
    publicClient: null,
    walletClient: null
  };
};
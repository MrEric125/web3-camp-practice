// src/hooks/useWallet.ts
import { useState, useEffect, useCallback } from 'react';
import { 
  createWalletClient, 
  custom, 
  http, 
  parseEther, 
  formatEther,
  createPublicClient,
  getAddress,
  PublicClient,
  WalletClient
} from 'viem';
import { Account, Transaction, WalletState } from '../types';
import { NETWORKS, DEFAULT_NETWORK } from '../utils/networks';
import { 
  generateAccount, 
  importPrivateKey, 
  importMnemonic,
  decryptPrivateKey,
  encryptPrivateKey 
} from '../utils/walletUtils';
// import CryptoJS from 'crypto-js';

export const useWallet = () => {
  const [state, setState] = useState<WalletState>({
    accounts: [],
    currentAccount: null,
    currentNetwork: DEFAULT_NETWORK,
    isConnected: false,
    transactions: []
  });

  const [publicClient, setPublicClient] = useState<PublicClient | null>(null);
  const [walletClient, setWalletClient] = useState<WalletClient | null>(null);

  // 初始化客户端
  useEffect(() => {
    const initClient = async () => {
      const client = createPublicClient({
        transport: http(state.currentNetwork.rpcUrl)
      });
      setPublicClient(client);

      if (typeof window !== 'undefined' && window.ethereum) {
        const walletClient = createWalletClient({
          transport: custom(window.ethereum)
        });
        setWalletClient(walletClient);
      }
    };

    initClient();
  }, [state.currentNetwork]);

  // 创建新账户
  const createNewAccount = useCallback(async (accountName: string, password: string) => {
    try {
      const { address, privateKey } = generateAccount();
      
      // 加密私钥
      const encryptedPrivateKey = encryptPrivateKey(privateKey, password);
      
      const newAccount: Account = {
        // id: CryptoJS.SHA256(address).toString(),
        id:"",
        name: accountName,
        address: getAddress(address),
        privateKey: encryptedPrivateKey,
        publicKey: address,
        balance: '0',
        createdAt: new Date()
      };

      // 获取余额
      if (publicClient) {
        const balance = await publicClient.getBalance({ address });
        newAccount.balance = formatEther(balance);
      }

      setState(prev => ({
        ...prev,
        accounts: [...prev.accounts, newAccount],
        currentAccount: prev.currentAccount || newAccount
      }));

      return newAccount;
    } catch (error) {
      console.error('Error creating account:', error);
      throw error;
    }
  }, [publicClient]);

  // 导入私钥
  const importAccountByPrivateKey = useCallback(async (
    privateKey: string, 
    accountName: string, 
    password: string
  ) => {
    try {
      const { address } = importPrivateKey(privateKey);
      const encryptedPrivateKey = encryptPrivateKey(privateKey, password);
      
      const importedAccount: Account = {
        id: CryptoJS.SHA256(address).toString(),
        name: accountName,
        address: getAddress(address),
        privateKey: encryptedPrivateKey,
        publicKey: address,
        balance: '0',
        createdAt: new Date()
      };

      // 获取余额
      if (publicClient) {
        const balance = await publicClient.getBalance({ address });
        importedAccount.balance = formatEther(balance);
      }

      setState(prev => ({
        ...prev,
        accounts: [...prev.accounts, importedAccount],
        currentAccount: prev.currentAccount || importedAccount
      }));

      return importedAccount;
    } catch (error) {
      console.error('Error importing account:', error);
      throw error;
    }
  }, [publicClient]);

  // 导入助记词
  const importAccountByMnemonic = useCallback(async (
    mnemonic: string,
    accountName: string,
    password: string,
    index: number = 0
  ) => {
    try {
      const { address, privateKey } = importMnemonic(mnemonic, index);
      const encryptedPrivateKey = encryptPrivateKey(privateKey, password);
      
      const importedAccount: Account = {
        id: CryptoJS.SHA256(address).toString(),
        name: accountName,
        address: getAddress(address),
        privateKey: encryptedPrivateKey,
        publicKey: address,
        balance: '0',
        createdAt: new Date()
      };

      // 获取余额
      if (publicClient) {
        const balance = await publicClient.getBalance({ address });
        importedAccount.balance = formatEther(balance);
      }

      setState(prev => ({
        ...prev,
        accounts: [...prev.accounts, importedAccount],
        currentAccount: prev.currentAccount || importedAccount
      }));

      return importedAccount;
    } catch (error) {
      console.error('Error importing from mnemonic:', error);
      throw error;
    }
  }, [publicClient]);

  // 切换账户
  const switchAccount = useCallback(async (accountId: string) => {
    const account = state.accounts.find(acc => acc.id === accountId);
    if (!account) throw new Error('Account not found');

    // 更新余额
    if (publicClient) {
      const balance = await publicClient.getBalance({ address: account.address as `0x${string}` });
      account.balance = formatEther(balance);
    }

    setState(prev => ({
      ...prev,
      currentAccount: account
    }));
  }, [publicClient, state.accounts]);

  // 切换网络
  const switchNetwork = useCallback(async (networkId: string) => {
    const network = NETWORKS.find(n => n.id === networkId);
    if (!network) throw new Error('Network not found');

    // 更新所有账户余额
    const updatedAccounts = await Promise.all(
      state.accounts.map(async (account) => {
        const client = createPublicClient({
          transport: http(network.rpcUrl)
        });
        try {
          const balance = await client.getBalance({ 
            address: account.address as `0x${string}` 
          });
          return {
            ...account,
            balance: formatEther(balance)
          };
        } catch {
          return account;
        }
      })
    );

    const newClient = createPublicClient({
      transport: http(network.rpcUrl)
    });

    setState(prev => ({
      ...prev,
      currentNetwork: network,
      accounts: updatedAccounts,
      currentAccount: prev.currentAccount 
        ? updatedAccounts.find(acc => acc.id === prev.currentAccount?.id) || null
        : null
    }));

    setPublicClient(newClient);
  }, [state.accounts]);

  // 发送交易
  const sendTransaction = useCallback(async (
    to: string,
    value: string,
    password: string,
    gasLimit?: bigint
  ) => {
    if (!state.currentAccount?.privateKey) {
      throw new Error('No account selected or private key not available');
    }

    if (!publicClient) {
      throw new Error('Public client not initialized');
    }

    try {
      // 解密私钥
      const decryptedPrivateKey = decryptPrivateKey(state.currentAccount.privateKey, password);
      
      // 创建钱包客户端
      const account = importPrivateKey(decryptedPrivateKey);
      
      const walletClient = createWalletClient({
        account,
        transport: http(state.currentNetwork.rpcUrl)
      });

      // 获取nonce
      const nonce = await publicClient.getTransactionCount({ 
        address: state.currentAccount.address as `0x${string}` 
      });

      // 估算gas
      const estimatedGas = await publicClient.estimateGas({
        account: state.currentAccount.address as `0x${string}`,
        to: to as `0x${string}`,
        value: parseEther(value)
      });

      // 构建交易
      const transaction = {
        to: to as `0x${string}`,
        value: parseEther(value),
        gas: gasLimit || estimatedGas,
        nonce
      };

      // 发送交易
      const hash = await walletClient.sendTransaction(transaction);

      // 添加到交易历史
      const newTransaction: Transaction = {
        hash,
        from: state.currentAccount.address,
        to,
        value,
        status: 'pending',
        timestamp: new Date(),
        nonce
      };

      setState(prev => ({
        ...prev,
        transactions: [newTransaction, ...prev.transactions]
      }));

      // 等待交易确认
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      
      // 更新交易状态
      setState(prev => ({
        ...prev,
        transactions: prev.transactions.map(tx => 
          tx.hash === hash 
            ? { 
                ...tx, 
                status: receipt.status === 'success' ? 'success' : 'failed',
                gasUsed: receipt.gasUsed.toString()
              }
            : tx
        )
      }));

      // 更新余额
      const balance = await publicClient.getBalance({ 
        address: state.currentAccount.address as `0x${string}` 
      });
      
      setState(prev => ({
        ...prev,
        accounts: prev.accounts.map(acc => 
          acc.id === state.currentAccount?.id
            ? { ...acc, balance: formatEther(balance) }
            : acc
        ),
        currentAccount: prev.currentAccount
          ? { ...prev.currentAccount, balance: formatEther(balance) }
          : null
      }));

      return { hash, receipt };
    } catch (error) {
      console.error('Error sending transaction:', error);
      throw error;
    }
  }, [state.currentAccount, state.currentNetwork, publicClient]);

  // 连接外部钱包（如 MetaMask）
  const connectExternalWallet = useCallback(async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('No Ethereum provider found');
    }

    try {
      const walletClient = createWalletClient({
        transport: custom(window.ethereum)
      });

      const [address] = await walletClient.requestAddresses();
      
      const externalAccount: Account = {
        id: CryptoJS.SHA256(address).toString(),
        name: 'External Wallet',
        address: getAddress(address),
        publicKey: address,
        balance: '0',
        createdAt: new Date()
      };

      // 获取余额
      if (publicClient) {
        const balance = await publicClient.getBalance({ address });
        externalAccount.balance = formatEther(balance);
      }

      setState(prev => ({
        ...prev,
        accounts: [...prev.accounts, externalAccount],
        currentAccount: externalAccount,
        isConnected: true
      }));

      setWalletClient(walletClient);
      
      return externalAccount;
    } catch (error) {
      console.error('Error connecting external wallet:', error);
      throw error;
    }
  }, [publicClient]);

  // 导出私钥（需要密码）
  const exportPrivateKey = useCallback((accountId: string, password: string) => {
    const account = state.accounts.find(acc => acc.id === accountId);
    if (!account?.privateKey) {
      throw new Error('Account not found or no private key available');
    }

    try {
      return decryptPrivateKey(account.privateKey, password);
    } catch (error) {
      throw new Error('Failed to decrypt private key');
    }
  }, [state.accounts]);

  return {
    ...state,
    createNewAccount,
    importAccountByPrivateKey,
    importAccountByMnemonic,
    switchAccount,
    switchNetwork,
    sendTransaction,
    connectExternalWallet,
    exportPrivateKey,
    publicClient,
    walletClient
  };
};
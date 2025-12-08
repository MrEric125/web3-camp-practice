// src/utils/networks.ts
import { Network } from '../types';

export const NETWORKS: Network[] = [
  {
    id: 'ethereum-mainnet',
    name: 'Ethereum Mainnet',
    rpcUrl: 'https://eth-mainnet.g.alchemy.com/v2/demo',
    chainId: 1,
    currency: 'ETH',
    explorerUrl: 'https://etherscan.io',
    isTestnet: false
  },
  {
    id: 'ethereum-sepolia',
    name: 'Sepolia Testnet',
    rpcUrl: 'https://sepolia.infura.io/v3/',
    chainId: 11155111,
    currency: 'ETH',
    explorerUrl: 'https://sepolia.etherscan.io',
    isTestnet: true
  },
  {
    id: 'polygon-mainnet',
    name: 'Polygon Mainnet',
    rpcUrl: 'https://polygon-mainnet.infura.io/v3/',
    chainId: 137,
    currency: 'MATIC',
    explorerUrl: 'https://polygonscan.com',
    isTestnet: false
  },
  {
    id: 'arbitrum-mainnet',
    name: 'Arbitrum Mainnet',
    rpcUrl: 'https://arbitrum-mainnet.infura.io/v3/',
    chainId: 42161,
    currency: 'ETH',
    explorerUrl: 'https://arbiscan.io',
    isTestnet: false
  }
];

export const DEFAULT_NETWORK = NETWORKS[0];
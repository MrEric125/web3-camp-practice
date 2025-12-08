import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, sepolia } from 'wagmi/chains';
import { http } from 'wagmi';

// 定义本地 Anvil 链（其链ID通常是 31337）
const anvilChain = {
  id: 31337,
  name: 'Anvil Local',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['http://127.0.0.1:8545'] },
  },
} as const;

export const config = getDefaultConfig({
  appName: 'My Crypto Wallet',
  projectId: 'YOUR_WALLETCONNECT_PROJECT_ID',
  chains: [anvilChain], // 重点：只使用本地链
  transports: {
    // 为本地链指定传输方式
    [anvilChain.id]: http(),
  },
  ssr: true,
});
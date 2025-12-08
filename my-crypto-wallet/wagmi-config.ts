// wagmi-config.ts
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { injected } from 'wagmi/connectors'; // 导入注入式连接器
import { http } from 'wagmi';

// 1. 定义你的本地网络（Anvil 的默认链 ID 是 31337）
export const anvilChain = {
  id: 31337, // 这是 Anvil 的默认链 ID，必须完全匹配
  name: 'Anvil Local',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['http://127.0.0.1:8545'], // Anvil 默认的 RPC 地址
    },
  },
} as const; // 使用 `as const` 以获得更精确的类型推断

// 2. 使用这个本地网络创建配置
export const config = getDefaultConfig({
  appName: 'My Crypto Wallet',
  projectId: 'fa42d40f07393f50fef277b0fee2b6ab', // 本地测试可留空或填任意值
  chains: [anvilChain], // 重点：只使用本地链，这样前端就只显示/连接这个网络
  transports: {
    // 为本地链指定传输方式
    [anvilChain.id]: http(), // 简洁写法，等同于 http('http://127.0.0.1:8545')
  },
  ssr: true,
});
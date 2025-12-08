// app/providers.tsx
'use client'; // Next.js App Router 中需要

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains'; // 导入你需要的链
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css'; // 引入样式

// 1. 配置支持的链和钱包
const config = getDefaultConfig({
  appName: 'My Crypto Wallet',
  projectId: 'YOUR_WALLETCONNECT_PROJECT_ID', // 从 walletconnect.com 获取
  chains: [mainnet, sepolia], // 支持的网络
  transports: {
    [mainnet.id]: http('https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY'), // 建议使用服务商RPC
    [sepolia.id]: http('https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY'),
  },
  ssr: true, // 如果你用Next.js且需要服务端渲染，设为true
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
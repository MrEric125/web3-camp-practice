
import type { Chain } from 'viem';
// Define local Anvil network for development
export const anvilChain: Chain = {
  id: 31337,
  name: 'Anvil Local',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['http://127.0.0.1:8545'],
    },
  },
} as const;
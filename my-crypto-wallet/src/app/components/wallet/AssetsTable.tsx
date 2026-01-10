// components/AssetsTable.tsx
'use client';
import { useAccount, useBalance } from 'wagmi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Coins, TrendingUp, Wallet } from 'lucide-react';
import { formatEther } from 'viem';

interface TokenBalance {
  symbol: string;
  balance: string;
  value: string;
  change24h: number;
}

// Mock token data - in a real app, you'd fetch this from APIs
const mockTokens: TokenBalance[] = [
  { symbol: 'ETH', balance: '0.0', value: '$0.00', change24h: 0 },
];

export function AssetsTable() {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });

  const tokens = mockTokens.map(token => ({
    ...token,
    balance: token.symbol === 'ETH' && balance ? parseFloat(formatEther(balance.value)).toFixed(4) : token.balance,
  }));

  const totalValue = tokens.reduce((sum, token) => {
    const value = parseFloat(token.value.replace('$', ''));
    return sum + value;
  }, 0);

  if (!isConnected || !address) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <Wallet className="h-12 w-12 mx-auto text-muted-foreground" />
            <div>
              <h3 className="text-lg font-medium">连接钱包</h3>
              <p className="text-sm text-muted-foreground">
                请先连接您的钱包以查看资产
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="h-5 w-5" />
          资产概览
        </CardTitle>
        <CardDescription>
          您的加密资产余额和价值
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Total Portfolio Value */}
        <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 rounded-lg">
          <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            ${totalValue.toFixed(2)}
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            总资产价值
          </div>
        </div>

        <Separator />

        {/* Assets List */}
        <div className="space-y-4">
          {tokens.map((token, index) => (
            <div key={token.symbol} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  {token.symbol.charAt(0)}
                </div>
                <div>
                  <div className="font-medium">{token.symbol}</div>
                  <div className="text-sm text-muted-foreground">
                    {token.balance} {token.symbol}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium">{token.value}</div>
                <Badge
                  variant={token.change24h >= 0 ? "default" : "destructive"}
                  className="text-xs"
                >
                  <TrendingUp className={`h-3 w-3 mr-1 ${token.change24h < 0 ? 'rotate-180' : ''}`} />
                  {token.change24h >= 0 ? '+' : ''}{token.change24h.toFixed(2)}%
                </Badge>
              </div>
            </div>
          ))}
        </div>

        {/* Note */}
        <div className="text-center text-sm text-muted-foreground">
          <p>此版本仅显示原生代币余额。ERC-20 代币支持即将推出。</p>
        </div>
      </CardContent>
    </Card>
  );
}

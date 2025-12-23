// components/NetworkSwitcher.tsx
'use client';
import { useState } from 'react';
import { useChainId, useSwitchChain } from 'wagmi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, AlertTriangle, Loader2, Network } from 'lucide-react';
import { toast } from 'sonner';

const networks = [
  { id: 31337, name: 'Anvil Local', color: 'bg-gray-500' },
  { id: 1, name: 'Ethereum', color: 'bg-blue-500' },
  { id: 137, name: 'Polygon', color: 'bg-purple-500' },
  { id: 10, name: 'Optimism', color: 'bg-red-500' },
  { id: 42161, name: 'Arbitrum', color: 'bg-green-500' },
  { id: 8453, name: 'Base', color: 'bg-cyan-500' },
];

export function NetworkSwitcher() {
  const chainId = useChainId();
  const { switchChain, isPending, error } = useSwitchChain();
  const [isExpanded, setIsExpanded] = useState(false);

  const currentNetwork = networks.find(net => net.id === chainId);

  const handleSwitchNetwork = async (targetChainId: number) => {
    try {
      await switchChain({ chainId: targetChainId });
      toast.success(`已切换到 ${networks.find(n => n.id === targetChainId)?.name}`);
    } catch (error) {
      toast.error('网络切换失败，请重试');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Network className="h-5 w-5" />
          网络切换
        </CardTitle>
        <CardDescription>
          选择您要连接的区块链网络
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Network */}
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${currentNetwork?.color || 'bg-gray-400'}`}></div>
            <div>
              <p className="font-medium">{currentNetwork?.name || 'Unknown Network'}</p>
              <p className="text-sm text-muted-foreground">Chain ID: {chainId}</p>
            </div>
          </div>
          <Badge variant={chainId === 31337 ? "secondary" : "default"}>
            {chainId === 31337 ? '测试网' : '主网'}
          </Badge>
        </div>

        <Separator />

        {/* Network List */}
        <div className="space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <Network className="h-4 w-4 mr-2" />
            {isExpanded ? '收起' : '显示所有网络'}
          </Button>

          {isExpanded && (
            <div className="space-y-2">
              {networks.map((network) => (
                <Button
                  key={network.id}
                  variant={chainId === network.id ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => handleSwitchNetwork(network.id)}
                  disabled={isPending || chainId === network.id}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className={`w-3 h-3 rounded-full ${network.color}`}></div>
                    <span className="flex-1 text-left">{network.name}</span>
                    {chainId === network.id && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                    {isPending && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                  </div>
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="rounded-lg bg-destructive/15 p-3">
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-4 w-4" />
              <p className="text-sm">网络切换失败</p>
            </div>
            <p className="text-sm text-destructive/80 mt-1">
              {error.message}
            </p>
          </div>
        )}

        {/* Network Status */}
        <div className="rounded-lg bg-green-50 dark:bg-green-950/50 p-3">
          <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
            <CheckCircle className="h-4 w-4" />
            <p className="text-sm font-medium">网络状态正常</p>
          </div>
          <p className="text-sm text-green-600 dark:text-green-400 mt-1">
            您的钱包已连接到区块链网络
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

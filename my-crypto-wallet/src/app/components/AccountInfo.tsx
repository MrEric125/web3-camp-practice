// components/AccountInfo.tsx
'use client';
import { useState } from 'react';
import { useAccount, useBalance, useDisconnect, useChainId } from 'wagmi';
import { useConnect } from 'wagmi';
import { injected } from 'wagmi/connectors'; // 用于连接 MetaMask
import { formatEther } from 'viem';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Copy, LogOut, Wallet, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export function AccountInfo() {
  // Wagmi Hooks
  const { address, isConnected, isConnecting } = useAccount();
  const { data: balance } = useBalance({ address });
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { connect, error: connectError, isPending: isConnectPending } = useConnect();

  // 本地状态
//   const { toast } = useToast();
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  // 处理复制地址
  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast("地址已复制");
    }
  };

  // 处理连接钱包
  const handleConnect = () => {
    connect(
      { connector: injected() },
      {
        onSuccess: () => {
          toast("钱包已成功连接。");
        },
        onError: (err) => {
          toast("请确保已安装 MetaMask 并解锁。");
        },
      }
    );
  };

  // 处理断开连接
  const handleDisconnect = () => {
    setIsDisconnecting(true);
    disconnect();
    // 可以在这里添加断开后的回调，例如清除本地数据
    toast("钱包已断开连接。");
    setIsDisconnecting(false);
  };

  // ========== 渲染逻辑 ==========
  // 状态 1: 连接中
  if (isConnecting || isConnectPending) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-sm text-muted-foreground">正在连接钱包...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 状态 2: 已连接
  if (isConnected && address) {
    return (
      <Card className="w-full shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                钱包账户
              </CardTitle>
              <CardDescription>已连接到本地测试网络</CardDescription>
            </div>
            <Badge variant={chainId === 1 ? "default" : "secondary"}>
              {chainId === 31337 ? 'Local' : `Chain ${chainId}`}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 地址信息 */}
          <div>
            <h4 className="text-sm font-medium mb-2">钱包地址</h4>
            <div className="flex items-center gap-2">
              <code className="relative rounded bg-muted px-3 py-1.5 font-mono text-sm flex-1 overflow-x-auto">
                {address}
              </code>
              <Button
                size="icon"
                variant="outline"
                onClick={handleCopyAddress}
                title="复制地址"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Separator />

          {/* 余额信息 */}
          <div>
            <h4 className="text-sm font-medium mb-2">原生资产余额</h4>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight">
                {balance ? parseFloat(formatEther(balance.value)).toFixed(4) : '0.0000'}
              </span>
              <span className="text-xl font-semibold text-muted-foreground">
                {balance?.symbol || 'ETH'}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {/* 此处可接入汇率 API 显示法币价值 */}
              ≈ $ --
            </p>
          </div>

          <Separator />

          {/* 操作按钮 */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleDisconnect}
              variant="outline"
              disabled={isDisconnecting}
              className="flex-1"
            >
              <LogOut className="mr-2 h-4 w-4" />
              {isDisconnecting ? '断开中...' : '断开连接'}
            </Button>
            {/* 可以在这里添加其他操作按钮，例如“切换账户” */}
          </div>
        </CardContent>
      </Card>
    );
  }

  // 状态 3: 未连接 (默认状态)
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          连接钱包
        </CardTitle>
        <CardDescription>
          连接后即可管理您的加密资产
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 错误提示 */}
        {connectError && (
          <div className="rounded-lg bg-destructive/15 p-4">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <p className="text-sm font-medium">连接失败</p>
            </div>
            <p className="mt-2 text-sm text-destructive">
              {connectError.message || '请检查钱包插件是否已安装并解锁。'}
            </p>
          </div>
        )}

        {/* 主要连接按钮 */}
        <Button
          onClick={handleConnect}
          size="lg"
          className="w-full"
          disabled={isConnectPending}
        >
          <Wallet className="mr-2 h-5 w-5" />
          {isConnectPending ? '连接中...' : '连接 MetaMask'}
        </Button>

        {/* 辅助信息 */}
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            推荐使用 MetaMask 进行连接
          </p>
          <p className="text-xs text-muted-foreground">
            确保你已切换到正确的网络（例如：本地 Anvil 网络）
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
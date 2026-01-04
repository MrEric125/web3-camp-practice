// components/AccountInfo.tsx
'use client';
import { useAccount, useBalance, useDisconnect, useChainId } from 'wagmi';
import { useConnect } from 'wagmi';
import { injected } from 'wagmi/connectors'; // 用于连接 MetaMask
import { formatEther } from 'viem';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, LogOut, Wallet, AlertCircle, Check } from 'lucide-react';
import { toast } from 'sonner';
import { walletManager } from '../connectors/PrivateKeyConnector';

export function AccountInfo() {
  // Wagmi Hooks
  const { address, isConnected, isConnecting } = useAccount();
  const { data: balance } = useBalance({ address });
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { connect, error: connectError, isPending: isConnectPending } = useConnect();

  // 处理复制地址
  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast("地址已复制");
    }
  };

  // 处理连接钱包 (MetaMask)
  const handleConnectMetaMask = () => {
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
    disconnect();
    toast("钱包已断开连接。");
  };

  // ========== 渲染逻辑 ==========
  return (
    <div className="space-y-4">
      {/* 当前连接状态 */}
      {isConnected && address ? (
        <div className="rounded-lg bg-green-50 dark:bg-green-950/20 p-4 border border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
              <Check className="h-4 w-4" />
              <p className="text-sm font-medium">钱包已连接</p>
            </div>
            <Badge variant={chainId === 1 ? "default" : "secondary"}>
              {chainId === 31337 ? '本地网络' : `Chain ${chainId}`}
            </Badge>
          </div>
          <p className="mt-2 text-sm text-green-700 dark:text-green-300">
            {walletManager.getSelectedWallet()?.name || 'MetaMask 连接'}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <code className="text-xs bg-green-100 dark:bg-green-900 px-2 py-1 rounded">
              {address.slice(0, 6)}...{address.slice(-4)}
            </code>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopyAddress}
              className="h-6 px-2"
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
          {/* 显示余额 */}
          <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-700">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold">
                {balance ? parseFloat(formatEther(balance.value)).toFixed(4) : '0.0000'}
              </span>
              <span className="text-sm text-green-700 dark:text-green-300">
                {balance?.symbol || 'ETH'}
              </span>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <Button
              onClick={handleDisconnect}
              variant="outline"
              size="sm"
            >
              <LogOut className="mr-2 h-4 w-4" />
              断开连接
            </Button>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-2 mb-4">
            <Wallet className="h-4 w-4" />
            <p className="text-sm font-medium">未连接钱包</p>
          </div>
          <Button
            onClick={handleConnectMetaMask}
            className="w-full"
            disabled={isConnectPending}
          >
            <Wallet className="mr-2 h-4 w-4" />
            {isConnectPending ? '连接中...' : '连接 MetaMask'}
          </Button>
        </div>
      )}

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
    </div>
  );
}

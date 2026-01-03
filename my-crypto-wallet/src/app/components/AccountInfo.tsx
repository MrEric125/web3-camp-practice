// components/AccountInfo.tsx
'use client';
import { useState, useEffect } from 'react';
import { useAccount, useBalance, useDisconnect, useChainId } from 'wagmi';
import { useConnect } from 'wagmi';
import { injected } from 'wagmi/connectors'; // 用于连接 MetaMask
import { formatEther } from 'viem';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Copy, LogOut, Wallet, AlertCircle, Plus, Trash2, Check } from 'lucide-react';
import { toast } from 'sonner';
import { privateKeyConnector, walletManager, type Wallet as WalletType } from '../connectors/PrivateKeyConnector';

export function AccountInfo() {
  // Wagmi Hooks
  const { address, isConnected, isConnecting } = useAccount();
  const { data: balance } = useBalance({ address });
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { connect, error: connectError, isPending: isConnectPending } = useConnect();

  // 本地状态
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [wallets, setWallets] = useState<WalletType[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<WalletType | null>(null);
  const [showAddWallet, setShowAddWallet] = useState(false);
  const [walletNameInput, setWalletNameInput] = useState('');
  const [privateKeyInput, setPrivateKeyInput] = useState('');

  // 初始化钱包列表
  useEffect(() => {
    const updateWallets = () => {
      const storedWallets = walletManager.getWallets();
      setWallets(storedWallets);
      setSelectedWallet(walletManager.getSelectedWallet());
    };

    updateWallets();

    // 监听存储变化
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'wallets' || e.key === 'selectedWalletId') {
        updateWallets();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

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

  // 处理连接私钥钱包
  const handleConnectPrivateKeyWallet = async (wallet: WalletType) => {
    walletManager.selectWallet(wallet.id);
    setSelectedWallet(wallet);

    try {
      await connect({ connector: privateKeyConnector });
      toast.success(`已切换到钱包: ${wallet.name}`);
    } catch (error) {
      toast.error('连接钱包失败');
    }
  };

  // 处理断开连接
  const handleDisconnect = () => {
    setIsDisconnecting(true);
    disconnect();
    setSelectedWallet(null);
    toast("钱包已断开连接。");
    setIsDisconnecting(false);
  };

  // 处理添加新钱包
  const handleAddWallet = () => {
    if (!walletNameInput.trim()) {
      toast.error('请输入钱包名称');
      return;
    }

    if (!privateKeyInput || !/^0x[0-9a-fA-F]{64}$/.test(privateKeyInput)) {
      toast.error('私钥格式无效。必须是 0x 开头的 64 位十六进制字符。');
      return;
    }

    try {
      const newWallet = walletManager.addWallet(walletNameInput.trim(), privateKeyInput);
      setWallets([...wallets, newWallet]);
      setWalletNameInput('');
      setPrivateKeyInput('');
      setShowAddWallet(false);
      toast.success('钱包添加成功');
    } catch (error) {
      toast.error('添加钱包失败');
    }
  };

  // 处理删除钱包
  const handleRemoveWallet = (walletId: string) => {
    walletManager.removeWallet(walletId);
    setWallets(wallets.filter(w => w.id !== walletId));
    if (selectedWallet?.id === walletId) {
      setSelectedWallet(null);
      if (isConnected) {
        disconnect();
      }
    }
    toast.success('钱包已删除');
  };

  // ========== 渲染逻辑 ==========
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          钱包管理
        </CardTitle>
        <CardDescription>
          管理您的加密钱包账户
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 当前连接状态 */}
        {isConnected && address && (
          <div className="rounded-lg bg-green-50 dark:bg-green-950/20 p-4 border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
              <Check className="h-4 w-4" />
              <p className="text-sm font-medium">已连接</p>
            </div>
            <p className="mt-2 text-sm text-green-700 dark:text-green-300">
              {selectedWallet ? `当前钱包: ${selectedWallet.name}` : 'MetaMask 连接'}
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
          </div>
        )}

        {/* 钱包列表 */}
        {wallets.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-3">我的钱包</h4>
            <div className="space-y-2">
              {wallets.map((wallet) => (
                <div
                  key={wallet.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    selectedWallet?.id === wallet.id
                      ? 'bg-primary/10 border-primary'
                      : 'bg-muted/50 border-border'
                  }`}
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium">{wallet.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedWallet?.id !== wallet.id && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleConnectPrivateKeyWallet(wallet)}
                        disabled={isConnecting}
                      >
                        连接
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveWallet(wallet.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <Separator />

        {/* 添加新钱包 */}
        <div>
          <Button
            onClick={() => setShowAddWallet(true)}
            variant="outline"
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            添加新钱包
          </Button>

          {showAddWallet && (
            <div className="mt-4 space-y-4 p-4 border rounded-lg bg-muted/50">
              <div>
                <Label htmlFor="walletName">钱包名称</Label>
                <Input
                  id="walletName"
                  placeholder="输入钱包名称"
                  value={walletNameInput}
                  onChange={(e) => setWalletNameInput(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="privateKey">私钥</Label>
                <Input
                  id="privateKey"
                  type="password"
                  placeholder="0x..."
                  value={privateKeyInput}
                  onChange={(e) => setPrivateKeyInput(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddWallet} className="flex-1">
                  添加钱包
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddWallet(false);
                    setWalletNameInput('');
                    setPrivateKeyInput('');
                  }}
                >
                  取消
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* 说明文字 */}
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            添加私钥钱包后即可直接在应用内部管理交易，无需第三方钱包软件。
          </p>
        </div>

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

        {/* 断开连接按钮 */}
        {isConnected && (
          <Button
            onClick={handleDisconnect}
            variant="outline"
            disabled={isDisconnecting}
            className="w-full"
          >
            <LogOut className="mr-2 h-4 w-4" />
            {isDisconnecting ? '断开中...' : '断开连接'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

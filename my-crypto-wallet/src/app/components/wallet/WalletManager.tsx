'use client';
import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useConnect } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Key, FileText, Wallet as WalletIcon } from 'lucide-react';
import { toast } from 'sonner';
import { privateKeyConnector, walletManager, type Wallet as WalletType } from '@/src/app/connectors/wallet/PrivateKeyConnector';
import { mnemonicConnector } from '@/src/app/connectors/wallet/MnemonicConnector';
import { AddWalletDialog } from './AddWalletDialog';

export function WalletManager() {
  // Wagmi Hooks
  const { isConnecting } = useAccount();
  const { connect } = useConnect();

  // 本地状态
  const [wallets, setWallets] = useState<WalletType[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<WalletType | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showAddWalletDialog, setShowAddWalletDialog] = useState(false);
  const [addWalletType, setAddWalletType] = useState<'privateKey' | 'mnemonic'>('privateKey');

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

  // 处理连接私钥钱包
  const handleConnectPrivateKeyWallet = async (wallet: WalletType) => {
    walletManager.selectWallet(wallet.id);
    setSelectedWallet(wallet);

    try {
      await connect({ connector: privateKeyConnector });
      toast.success(`已切换到钱包: ${wallet.name}`);
      setIsDialogOpen(false);
    } catch (error) {
      toast.error('连接钱包失败');
    }
  };

  // 处理删除钱包
  const handleRemoveWallet = (walletId: string) => {
    walletManager.removeWallet(walletId);
    setWallets(wallets.filter(w => w.id !== walletId));
    if (selectedWallet?.id === walletId) {
      setSelectedWallet(null);
    }
    toast.success('钱包已删除');
  };

  // 处理连接助记词钱包
  const handleConnectMnemonicWallet = async (wallet: WalletType) => {
    if (wallet.type !== 'mnemonic') return;

    walletManager.selectWallet(wallet.id);
    setSelectedWallet(wallet);

    try {
      await connect({ connector: mnemonicConnector });
      toast.success(`已切换到钱包: ${wallet.name}`);
      setIsDialogOpen(false);
    } catch (error) {
      toast.error('连接助记词钱包失败');
    }
  };

  // 处理钱包添加成功
  const handleWalletAdded = (newWallets: WalletType[]) => {
    setWallets(prevWallets => [...prevWallets, ...newWallets]);
  };

  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <WalletIcon className="h-4 w-4 mr-2" />
            我的钱包 ({wallets.length})
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <WalletIcon className="h-5 w-5" />
              钱包管理
            </DialogTitle>
            <DialogDescription>
              管理您的私钥钱包和助记词钱包
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="privateKey" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="privateKey" className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                私钥钱包
              </TabsTrigger>
              <TabsTrigger value="mnemonic" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                助记词钱包
              </TabsTrigger>
            </TabsList>

            {/* 私钥钱包 Tab */}
            <TabsContent value="privateKey" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">私钥钱包列表</h4>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setAddWalletType('privateKey');
                      setShowAddWalletDialog(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    添加私钥钱包
                  </Button>
                </div>

                <div className="space-y-2">
                  {wallets.filter(w => w.type === 'privateKey').length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Key className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>暂无私钥钱包</p>
                      <p className="text-xs">点击上方按钮添加</p>
                    </div>
                  ) : (
                    wallets.filter(w => w.type === 'privateKey').map((wallet) => (
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
                    ))
                  )}
                </div>
              </div>
            </TabsContent>

            {/* 助记词钱包 Tab */}
            <TabsContent value="mnemonic" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">助记词钱包列表</h4>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setAddWalletType('mnemonic');
                      setShowAddWalletDialog(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    添加助记词钱包
                  </Button>
                </div>

                <div className="space-y-2">
                  {wallets.filter(w => w.type === 'mnemonic').length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>暂无助记词钱包</p>
                      <p className="text-xs">点击上方按钮添加</p>
                    </div>
                  ) : (
                    wallets.filter(w => w.type === 'mnemonic').map((wallet) => (
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
                              onClick={() => handleConnectMnemonicWallet(wallet)}
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
                    ))
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* 说明文字 */}
          <div className="text-center space-y-2 text-xs text-muted-foreground">
            <p>所有钱包信息仅存储在本地浏览器中，确保您的资产安全。</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* 添加钱包弹框 */}
      <AddWalletDialog
        isOpen={showAddWalletDialog}
        onClose={() => setShowAddWalletDialog(false)}
        walletType={addWalletType}
        onWalletAdded={handleWalletAdded}
      />
    </>
  );
}

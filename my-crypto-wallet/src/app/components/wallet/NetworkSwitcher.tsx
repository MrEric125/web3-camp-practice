// components/NetworkSwitcher.tsx
'use client';
import { useState, useEffect } from 'react';
import { useChainId, useSwitchChain } from 'wagmi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, AlertTriangle, Loader2, Network, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { defaultChains } from '../../../../chain-config';
import { getAllChains, CustomNetwork, saveCustomNetwork, removeCustomNetwork } from '../../../../wagmi-config';

const defaultNetworkColors: Record<number, string> = {
  31337: 'bg-gray-500',
  1: 'bg-blue-500',
  137: 'bg-purple-500',
  10: 'bg-red-500',
  42161: 'bg-green-500',
  8453: 'bg-cyan-500',
};

export function NetworkSwitcher() {
  const chainId = useChainId();
  const { switchChain, isPending, error } = useSwitchChain();
  const [isExpanded, setIsExpanded] = useState(false);
  const [allChains, setAllChains] = useState(defaultChains);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newNetwork, setNewNetwork] = useState({
    id: '',
    name: '',
    rpcUrl: '',
    nativeCurrencyName: '',
    nativeCurrencySymbol: '',
    nativeCurrencyDecimals: '18',
    blockExplorerUrl: '',
  });

  // Update chains when component mounts or custom networks change
  useEffect(() => {
    setAllChains(getAllChains());
  }, []);

  // Create network objects for display
  const networks = allChains.map(chain => ({
    id: chain.id,
    name: chain.name,
    color: defaultNetworkColors[chain.id] || 'bg-indigo-500',
    isCustom: !defaultChains.find(dc => dc.id === chain.id),
  }));

  const currentNetwork = networks.find(net => net.id === chainId);

  const handleSwitchNetwork = async (targetChainId: number) => {
    try {
      await switchChain({ chainId: targetChainId });
      toast.success(`已切换到 ${networks.find(n => n.id === targetChainId)?.name}`);
    } catch (error) {
      toast.error('网络切换失败，请重试');
    }
  };

  const handleAddNetwork = () => {
    if (!newNetwork.id || !newNetwork.name || !newNetwork.rpcUrl || !newNetwork.nativeCurrencyName || !newNetwork.nativeCurrencySymbol) {
      toast.error('请填写所有必填字段');
      return;
    }

    const chainId = parseInt(newNetwork.id);
    if (isNaN(chainId) || chainId <= 0) {
      toast.error('Chain ID 必须是正整数');
      return;
    }

    const existingNetwork = allChains.find(chain => chain.id === chainId);
    if (existingNetwork) {
      toast.error('该 Chain ID 已存在');
      return;
    }

    const customNetwork: CustomNetwork = {
      id: chainId,
      name: newNetwork.name,
      rpcUrl: newNetwork.rpcUrl,
      nativeCurrency: {
        name: newNetwork.nativeCurrencyName,
        symbol: newNetwork.nativeCurrencySymbol,
        decimals: parseInt(newNetwork.nativeCurrencyDecimals) || 18,
      },
      blockExplorerUrl: newNetwork.blockExplorerUrl || undefined,
    };

    saveCustomNetwork(customNetwork);
    setAllChains(getAllChains());
    setIsAddDialogOpen(false);
    setNewNetwork({
      id: '',
      name: '',
      rpcUrl: '',
      nativeCurrencyName: '',
      nativeCurrencySymbol: '',
      nativeCurrencyDecimals: '18',
      blockExplorerUrl: '',
    });
    toast.success('自定义网络添加成功');
  };

  const handleRemoveCustomNetwork = (chainId: number) => {
    removeCustomNetwork(chainId);
    setAllChains(getAllChains());
    toast.success('自定义网络已删除');
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
          <div className="flex gap-2">
            <Button
              variant="ghost"
              className="flex-1 justify-start"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <Network className="h-4 w-4 mr-2" />
              {isExpanded ? '收起' : '显示所有网络'}
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>添加自定义网络</DialogTitle>
                  <DialogDescription>
                    添加一个新的区块链网络到您的钱包中
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="chain-id" className="text-right">
                      Chain ID *
                    </Label>
                    <Input
                      id="chain-id"
                      type="number"
                      value={newNetwork.id}
                      onChange={(e) => setNewNetwork(prev => ({ ...prev, id: e.target.value }))}
                      className="col-span-3"
                      placeholder="例如: 56"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="network-name" className="text-right">
                      网络名称 *
                    </Label>
                    <Input
                      id="network-name"
                      value={newNetwork.name}
                      onChange={(e) => setNewNetwork(prev => ({ ...prev, name: e.target.value }))}
                      className="col-span-3"
                      placeholder="例如: BSC Mainnet"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="rpc-url" className="text-right">
                      RPC URL *
                    </Label>
                    <Input
                      id="rpc-url"
                      value={newNetwork.rpcUrl}
                      onChange={(e) => setNewNetwork(prev => ({ ...prev, rpcUrl: e.target.value }))}
                      className="col-span-3"
                      placeholder="https://bsc-dataseed.binance.org/"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="currency-name" className="text-right">
                      货币名称 *
                    </Label>
                    <Input
                      id="currency-name"
                      value={newNetwork.nativeCurrencyName}
                      onChange={(e) => setNewNetwork(prev => ({ ...prev, nativeCurrencyName: e.target.value }))}
                      className="col-span-3"
                      placeholder="例如: BNB"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="currency-symbol" className="text-right">
                      货币符号 *
                    </Label>
                    <Input
                      id="currency-symbol"
                      value={newNetwork.nativeCurrencySymbol}
                      onChange={(e) => setNewNetwork(prev => ({ ...prev, nativeCurrencySymbol: e.target.value }))}
                      className="col-span-3"
                      placeholder="例如: BNB"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="decimals" className="text-right">
                      小数位数
                    </Label>
                    <Input
                      id="decimals"
                      type="number"
                      value={newNetwork.nativeCurrencyDecimals}
                      onChange={(e) => setNewNetwork(prev => ({ ...prev, nativeCurrencyDecimals: e.target.value }))}
                      className="col-span-3"
                      placeholder="18"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="explorer" className="text-right">
                      浏览器 URL
                    </Label>
                    <Input
                      id="explorer"
                      value={newNetwork.blockExplorerUrl}
                      onChange={(e) => setNewNetwork(prev => ({ ...prev, blockExplorerUrl: e.target.value }))}
                      className="col-span-3"
                      placeholder="https://bscscan.com"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddNetwork}>添加网络</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {isExpanded && (
            <div className="space-y-2">
              {networks.map((network) => (
                <div key={network.id} className="flex items-center gap-2">
                  <Button
                    variant={chainId === network.id ? "default" : "outline"}
                    className="flex-1 justify-start"
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
                  {network.isCustom && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveCustomNetwork(network.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
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

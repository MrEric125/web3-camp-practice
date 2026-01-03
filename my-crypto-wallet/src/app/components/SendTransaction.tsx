// components/SendTransaction.tsx
'use client';
import { useState, useEffect } from 'react';
import { useEstimateGas, useBalance, useAccount, useWalletClient } from 'wagmi';
import { parseEther, formatEther, isAddress } from 'viem';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Send, AlertTriangle, CheckCircle, Clock, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { TransactionConfirmation } from './TransactionConfirmation';
import { walletManager } from '../connectors/PrivateKeyConnector';
import {anvilChain}  from '@/chain-config';

export function SendTransaction() {
  const [to, setTo] = useState('');
  const [value, setValue] = useState('');
  const [isValidAddress, setIsValidAddress] = useState(true);
  const [isValidAmount, setIsValidAmount] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const { address, connector } = useAccount();
  const { data: balance } = useBalance({ address });
  const { data: walletClient } = useWalletClient();

  // 检测是否使用私钥钱包
  const isPrivateKeyWallet = connector?.id === 'privateKey';

  // Gas estimation
  const { data: estimatedGas } = useEstimateGas({
    to: isAddress(to) ? to as `0x${string}` : undefined,
    value: value ? parseEther(value) : undefined,
    query: {
      enabled: Boolean(to && value && isAddress(to)),
    },
  });

  // For demo purposes, we'll track transaction status manually
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [transactionStatus, setTransactionStatus] = useState<'pending' | 'confirmed' | null>(null);

  // Validate address
  useEffect(() => {
    setIsValidAddress(!to || isAddress(to));
  }, [to]);

  // Validate amount
  useEffect(() => {
    const numValue = parseFloat(value);
    const maxBalance = balance ? parseFloat(formatEther(balance.value)) : 0;
    setIsValidAmount(!value || (!isNaN(numValue) && numValue > 0 && numValue <= maxBalance));
  }, [value, balance]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidAddress || !isValidAmount) {
      toast.error('请检查输入的地址和金额');
      return;
    }

    // Show confirmation modal instead of sending directly
    setShowConfirmation(true);
  };

  const handleConfirmTransaction = async () => {
    if (!address) {
      toast.error('钱包未连接');
      return;
    }

    setIsProcessing(true);

    try {
      let hash: `0x${string}`;

      if (isPrivateKeyWallet) {
        // 对于私钥钱包，直接创建 wallet client 并发送
        const selectedWallet = walletManager.getSelectedWallet();
        if (!selectedWallet) {
          toast.error('未选择钱包');
          return;
        }

        const { createWalletClient, http } = await import('viem');
        const { privateKeyToAccount } = await import('viem/accounts');
        
        const account = privateKeyToAccount(selectedWallet.privateKey as `0x${string}`);
        const walletClient = createWalletClient({
          account,
          transport: http(anvilChain.rpcUrls.default.http[0]),
          chain: anvilChain,
        });

        hash = await walletClient.sendTransaction({
          to: to as `0x${string}`,
          value: parseEther(value),
          gas: estimatedGas || BigInt(21000),
        });
      } else {
        // 对于其他钱包（比如 MetaMask），使用标准的 wagmi wallet client
        if (!walletClient) {
          toast.error('钱包客户端未初始化');
          return;
        }

        hash = await walletClient.sendTransaction({
          account: address,
          to: to as `0x${string}`,
          value: parseEther(value),
          gas: estimatedGas || BigInt(21000),
        });
      }

      setShowConfirmation(false);
      toast.success('交易已发送到区块链！');

      // Reset form
      setTo('');
      setValue('');

      console.log('Transaction sent with hash:', hash);
    } catch (error) {
      console.error('Transaction failed:', error);
      toast.error('交易失败，请重试');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelTransaction = () => {
    setShowConfirmation(false);
  };

  const formatGasPrice = (gas?: bigint) => {
    if (!gas) return '计算中...';
    return `${(Number(gas) / 1e9).toFixed(2)} Gwei`;
  };

  const maxAmount = balance ? parseFloat(formatEther(balance.value)) : 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            发送资产
          </CardTitle>
          <CardDescription>
            安全地将您的加密资产发送到其他地址
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Recipient Address */}
            <div className="space-y-2">
              <Label htmlFor="recipient">收款地址</Label>
              <Input
                id="recipient"
                type="text"
                placeholder="0x..."
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className={!isValidAddress ? 'border-destructive' : ''}
              />
              {!isValidAddress && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4" />
                  无效的地址格式
                </p>
              )}
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="amount">发送金额 (ETH)</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setValue(maxAmount.toString())}
                  className="text-xs"
                >
                  全部发送
                </Button>
              </div>
              <Input
                id="amount"
                type="number"
                step="0.0001"
                placeholder="0.0"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className={!isValidAmount ? 'border-destructive' : ''}
              />
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>可用余额: {maxAmount.toFixed(4)} ETH</span>
                {!isValidAmount && value && (
                  <span className="text-destructive flex items-center gap-1">
                    <AlertTriangle className="h-4 w-4" />
                    金额无效
                  </span>
                )}
              </div>
            </div>

            <Separator />

            {/* Transaction Summary */}
            {to && value && isValidAddress && isValidAmount && (
              <Card className="bg-muted/50">
                <CardContent className="pt-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>发送到:</span>
                      <code className="text-xs bg-background px-2 py-1 rounded">
                        {to.slice(0, 6)}...{to.slice(-4)}
                      </code>
                    </div>
                    <div className="flex justify-between">
                      <span>金额:</span>
                      <span>{value} ETH</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="flex items-center gap-1">
                        <Zap className="h-4 w-4" />
                        预估 Gas:
                      </span>
                      <span>{formatGasPrice(estimatedGas)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={isProcessing || !to || !value || !isValidAddress || !isValidAmount}
            >
              <Send className="mr-2 h-4 w-4" />
              发送交易
            </Button>
          </form>
        </CardContent>
      </Card>



      {/* Transaction Confirmation Modal */}
      <TransactionConfirmation
        isOpen={showConfirmation}
        onConfirm={handleConfirmTransaction}
        onCancel={handleCancelTransaction}
        transactionData={to && value ? { to, value } : null}
        isLoading={isProcessing}
        isPrivateKeyWallet={isPrivateKeyWallet}
      />
    </div>
  );
}

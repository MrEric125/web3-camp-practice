// components/SendTransaction.tsx
'use client';
import { useState, useEffect } from 'react';
import { useSendTransaction, useWaitForTransactionReceipt, useEstimateGas, useBalance, useAccount } from 'wagmi';
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

export function SendTransaction() {
  const [to, setTo] = useState('');
  const [value, setValue] = useState('');
  const [isValidAddress, setIsValidAddress] = useState(true);
  const [isValidAmount, setIsValidAmount] = useState(true);

  const { address } = useAccount();
  const { data: balance } = useBalance({ address });

  const {
    sendTransaction,
    data: hash,
    isPending,
    error: sendError,
  } = useSendTransaction();

  const { isLoading: isConfirming, isSuccess: isConfirmed, error: confirmError } =
    useWaitForTransactionReceipt({ hash });

  // Gas estimation
  const { data: estimatedGas } = useEstimateGas({
    to: isAddress(to) ? to as `0x${string}` : undefined,
    value: value ? parseEther(value) : undefined,
    query: {
      enabled: Boolean(to && value && isAddress(to)),
    },
  });

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

    try {
      await sendTransaction({
        to: to as `0x${string}`,
        value: parseEther(value),
      });
      toast.success('交易已提交');
    } catch (error) {
      toast.error('交易失败，请重试');
    }
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

            {/* Error Display */}
            {(sendError || confirmError) && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {sendError?.message || confirmError?.message || '交易失败'}
                </AlertDescription>
              </Alert>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={isPending || !to || !value || !isValidAddress || !isValidAmount}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  发送中...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  发送交易
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Transaction Status */}
      {hash && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              {isConfirmed ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  交易成功
                </>
              ) : isConfirming ? (
                <>
                  <Clock className="h-5 w-5 text-blue-500" />
                  确认中
                </>
              ) : (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  交易已提交
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">交易哈希:</span>
                <Badge variant="outline" className="font-mono text-xs">
                  {hash.slice(0, 10)}...{hash.slice(-8)}
                </Badge>
              </div>
              {isConfirming && (
                <p className="text-sm text-muted-foreground">
                  正在等待网络确认，通常需要几秒到几分钟...
                </p>
              )}
              {isConfirmed && (
                <p className="text-sm text-green-600 dark:text-green-400">
                  ✅ 交易已成功确认并写入区块链
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

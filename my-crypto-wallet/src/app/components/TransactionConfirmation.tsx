// components/TransactionConfirmation.tsx
'use client';
import { useState } from 'react';
import { useAccount, useEstimateGas, useBalance } from 'wagmi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowRight, AlertTriangle, CheckCircle, XCircle, Clock, Zap, ExternalLink } from 'lucide-react';
import { formatEther, isAddress } from 'viem';

interface TransactionData {
  to: string;
  value: string;
  data?: `0x${string}`;
}

interface TransactionConfirmationProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  transactionData: TransactionData | null;
  isLoading?: boolean;
}

export function TransactionConfirmation({
  isOpen,
  onConfirm,
  onCancel,
  transactionData,
  isLoading = false
}: TransactionConfirmationProps) {
  const { address } = useAccount();
  const { data: balance } = useBalance({ address });

  // Estimate gas for the transaction
  const { data: estimatedGas } = useEstimateGas({
    to: transactionData?.to ? (transactionData.to as `0x${string}`) : undefined,
    value: transactionData?.value ? BigInt(Math.floor(parseFloat(transactionData.value) * 1e18)) : undefined,
    data: transactionData?.data,
    query: {
      enabled: Boolean(transactionData?.to && transactionData?.value && isOpen),
    },
  });

  if (!isOpen || !transactionData) return null;

  const amount = parseFloat(transactionData.value);
  const gasCost = estimatedGas ? Number(estimatedGas) * 20 * 1e-9 : 0.00042; // Rough estimate
  const totalCost = amount + gasCost;
  const hasEnoughBalance = balance ? parseFloat(formatEther(balance.value)) >= totalCost : false;

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-hidden">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-blue-500" />
            确认交易
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            请仔细检查交易详情，然后确认或取消
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Transaction Overview */}
          <div className="p-4 bg-muted/50 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">发送</span>
              <span className="font-bold text-lg">{amount.toFixed(6)} ETH</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">从</span>
              <code className="bg-background px-2 py-1 rounded text-xs">
                {address ? formatAddress(address) : '未知'}
              </code>
            </div>

            <div className="flex items-center justify-center">
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </div>

            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">到</span>
              <code className="bg-background px-2 py-1 rounded text-xs">
                {formatAddress(transactionData.to)}
              </code>
            </div>
          </div>

          {/* Transaction Details */}
          <div className="space-y-3">
            <h4 className="font-medium">交易详情</h4>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">金额:</span>
                <span>{amount.toFixed(6)} ETH</span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">预估 Gas 费用:</span>
                <span>{gasCost.toFixed(6)} ETH</span>
              </div>

              <Separator />

              <div className="flex justify-between font-medium">
                <span>总计:</span>
                <span>{totalCost.toFixed(6)} ETH</span>
              </div>
            </div>
          </div>

          {/* Gas Information */}
          <div className="p-3 bg-blue-50 dark:bg-blue-950/50 rounded-lg">
            <div className="flex items-start gap-2">
              <Zap className="h-4 w-4 text-blue-500 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-900 dark:text-blue-100">Gas 费用</p>
                <p className="text-blue-700 dark:text-blue-300">
                  预估 Gas 费用: {estimatedGas ? estimatedGas.toString() : '计算中...'} (20 Gwei)
                </p>
              </div>
            </div>
          </div>

          {/* Balance Check */}
          {!hasEnoughBalance && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                您的余额不足以完成此交易。您需要至少 {totalCost.toFixed(6)} ETH。
              </AlertDescription>
            </Alert>
          )}

          {/* Network Information */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">网络:</span>
            <Badge variant="outline">Anvil Local</Badge>
          </div>

          {/* Security Notice */}
          <div className="p-3 bg-yellow-50 dark:bg-yellow-950/50 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yellow-900 dark:text-yellow-100">安全提醒</p>
                <p className="text-yellow-700 dark:text-yellow-300">
                  请确保收款地址正确。区块链交易不可逆。
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1"
            >
              <XCircle className="h-4 w-4 mr-2" />
              取消
            </Button>
            <Button
              onClick={onConfirm}
              disabled={isLoading || !hasEnoughBalance}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  处理中...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  确认
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </div>
    </div>
  );
}

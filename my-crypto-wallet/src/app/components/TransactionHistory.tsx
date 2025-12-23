// components/TransactionHistory.tsx
'use client';
import { useState, useEffect } from 'react';
import { useAccount, usePublicClient, useBlock } from 'wagmi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowUpRight, ArrowDownLeft, Clock, CheckCircle, AlertCircle, ExternalLink, History, Wallet, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { formatEther } from 'viem';

interface Transaction {
  id: string;
  hash: string;
  type: 'send' | 'receive';
  amount: string;
  symbol: string;
  from: string;
  to: string;
  status: 'success' | 'pending' | 'failed';
  timestamp: Date;
  gasUsed?: string;
  gasPrice?: string;
  networkFee?: string;
  blockNumber?: number;
  value?: bigint;
}

interface TransactionDetailModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
}

function TransactionDetailModal({ transaction, isOpen, onClose }: TransactionDetailModalProps) {
  if (!isOpen || !transaction) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'success':
        return '成功';
      case 'pending':
        return '待确认';
      case 'failed':
        return '失败';
      default:
        return '未知';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">交易详情</h3>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          </div>

          <div className="space-y-4">
            {/* Status */}
            <div className="flex items-center gap-2">
              {getStatusIcon(transaction.status)}
              <span className="font-medium">{getStatusText(transaction.status)}</span>
            </div>

            {/* Amount */}
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                {transaction.type === 'send' ? (
                  <ArrowUpRight className="h-5 w-5 text-red-500" />
                ) : (
                  <ArrowDownLeft className="h-5 w-5 text-green-500" />
                )}
                <span className="font-medium">
                  {transaction.type === 'send' ? '发送' : '接收'} {transaction.amount} {transaction.symbol}
                </span>
              </div>
            </div>

            {/* Transaction Hash */}
            <div>
              <label className="text-sm font-medium text-muted-foreground">交易哈希</label>
              <div className="flex items-center gap-2 mt-1">
                <code className="text-xs bg-muted px-2 py-1 rounded flex-1 overflow-x-auto">
                  {transaction.hash}
                </code>
                <Button variant="ghost" size="sm">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* From/To Addresses */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">发送方</label>
                <p className="text-xs font-mono mt-1 break-all">
                  {transaction.from}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">接收方</label>
                <p className="text-xs font-mono mt-1 break-all">
                  {transaction.to}
                </p>
              </div>
            </div>

            {/* Timestamp */}
            <div>
              <label className="text-sm font-medium text-muted-foreground">时间</label>
              <p className="text-sm mt-1">
                {formatDistanceToNow(transaction.timestamp, { addSuffix: true, locale: zhCN })}
              </p>
            </div>

            {/* Gas Information */}
            {transaction.gasUsed && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h4 className="font-medium">Gas 信息</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Gas 使用量:</span>
                      <p>{transaction.gasUsed}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Gas 价格:</span>
                      <p>{transaction.gasPrice} Gwei</p>
                    </div>
                  </div>
                  {transaction.networkFee && (
                    <div>
                      <span className="text-muted-foreground">网络费用:</span>
                      <p>{transaction.networkFee} ETH</p>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Block Number */}
            {transaction.blockNumber && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">区块号</label>
                <p className="text-sm mt-1">#{transaction.blockNumber.toLocaleString()}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Custom hook to fetch transaction history
function useTransactionHistory() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!address || !publicClient) return;

      setIsLoading(true);
      setError(null);

      try {
        // Get the latest block number
        const latestBlock = await publicClient.getBlockNumber();

        // For demonstration, we'll check recent blocks for transactions
        // In a real app, you'd use indexing services like The Graph or Covalent
        const transactions: Transaction[] = [];

        // Check the last 100 blocks for transactions involving this address
        const blocksToCheck = 100;
        const startBlock = latestBlock - BigInt(blocksToCheck);

        for (let i = latestBlock; i >= startBlock && i >= BigInt(0); i--) {
          try {
            const block = await publicClient.getBlock({
              blockNumber: i,
              includeTransactions: true
            });

            // Filter transactions involving our address
            const relevantTxs = block.transactions.filter(tx =>
              tx.from?.toLowerCase() === address?.toLowerCase() ||
              tx.to?.toLowerCase() === address?.toLowerCase()
            );

            for (const tx of relevantTxs) {
              const receipt = await publicClient.getTransactionReceipt({ hash: tx.hash });

              const transaction: Transaction = {
                id: tx.hash,
                hash: tx.hash,
                type: tx.from?.toLowerCase() === address?.toLowerCase() ? 'send' : 'receive',
                amount: formatEther(tx.value || 0n),
                symbol: 'ETH',
                from: tx.from || '',
                to: tx.to || '',
                status: receipt.status === 'success' ? 'success' : 'failed',
                timestamp: new Date(Number(block.timestamp) * 1000),
                gasUsed: receipt.gasUsed?.toString(),
                gasPrice: tx.gasPrice ? (Number(tx.gasPrice) / 1e9).toString() : undefined,
                blockNumber: Number(i),
                value: tx.value,
                networkFee: receipt.gasUsed && tx.gasPrice
                  ? formatEther(receipt.gasUsed * tx.gasPrice)
                  : undefined,
              };

              transactions.push(transaction);

              // Limit to last 50 transactions for performance
              if (transactions.length >= 50) break;
            }

            if (transactions.length >= 50) break;
          } catch (blockError) {
            // Skip blocks that can't be fetched
            continue;
          }
        }

        // Sort by timestamp (newest first)
        transactions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

        setTransactions(transactions);
      } catch (err) {
        setError('获取交易历史失败');
        console.error('Error fetching transaction history:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [address, publicClient]);

  return { transactions, isLoading, error };
}

export function TransactionHistory() {
  const { isConnected } = useAccount();
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { transactions, isLoading, error } = useTransactionHistory();

  const handleTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTransaction(null);
  };

  if (!isConnected) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <History className="h-12 w-12 mx-auto text-muted-foreground" />
            <div>
              <h3 className="text-lg font-medium">交易历史</h3>
              <p className="text-sm text-muted-foreground">
                请先连接您的钱包以查看交易历史
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            交易历史
          </CardTitle>
          <CardDescription>
            您的区块链交易记录
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="text-center py-4">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <ScrollArea className="h-96">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span className="text-sm text-muted-foreground">加载交易历史中...</span>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleTransactionClick(transaction)}
                  >
                    <div className="flex items-center gap-3">
                      {transaction.type === 'send' ? (
                        <ArrowUpRight className="h-5 w-5 text-red-500" />
                      ) : (
                        <ArrowDownLeft className="h-5 w-5 text-green-500" />
                      )}
                      <div>
                        <p className="font-medium">
                          {transaction.type === 'send' ? '发送' : '接收'} {transaction.amount} {transaction.symbol}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatDistanceToNow(transaction.timestamp, { addSuffix: true, locale: zhCN })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          transaction.status === 'success' ? 'default' :
                          transaction.status === 'pending' ? 'secondary' : 'destructive'
                        }
                      >
                        {transaction.status === 'success' ? '成功' :
                         transaction.status === 'pending' ? '待确认' : '失败'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {!isLoading && transactions.length === 0 && !error && (
            <div className="text-center py-8">
              <Wallet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">暂无交易记录</p>
              <p className="text-xs text-muted-foreground mt-2">
                交易记录将在这里显示
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <TransactionDetailModal
        transaction={selectedTransaction}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </>
  );
}

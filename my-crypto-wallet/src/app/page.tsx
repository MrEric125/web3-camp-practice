'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';
// 你的自定义组件
import { AccountInfo } from './components/wallet/AccountInfo';
import { WalletManager } from './components/wallet/WalletManager';
import { SendTransaction } from './components/wallet/SendTransaction';
import { ReceivePayment } from './components/wallet/ReceivePayment';
import { NetworkSwitcher } from './components/wallet/NetworkSwitcher';
import { AssetsTable } from './components/wallet/AssetsTable';
import { TransactionHistory } from './components/wallet/TransactionHistory';
import { ThemeToggle } from './components/wallet/ThemeToggle';
import { TradeVolumeChart } from './components/trade/TradeVolumeChart';
// import { ActivityFeed } from '@/components/ActivityFeed'; // 假设你新增的活动流组件

export default function HomePage() {
  const [selectedView, setSelectedView] = useState('wallet');

  const renderWalletView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 左侧主栏：账户概览与操作 */}
      <div className="lg:col-span-2 space-y-6">
        <Card className="shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                账户概览
              </CardTitle>
              <WalletManager />
            </div>
          </CardHeader>
          <CardContent>
            <AccountInfo />
          </CardContent>
        </Card>

        <Tabs defaultValue="send" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="send">发送资产</TabsTrigger>
            <TabsTrigger value="receive">接收资产</TabsTrigger>
            <TabsTrigger value="history">交易历史</TabsTrigger>
          </TabsList>
          <TabsContent value="send" className="space-y-4 pt-4">
            <Card>
              <CardContent className="pt-6">
                <SendTransaction />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="receive" className="space-y-4 pt-4">
            <ReceivePayment />
          </TabsContent>
          <TabsContent value="history" className="space-y-4 pt-4">
            <TransactionHistory />
          </TabsContent>
        </Tabs>
      </div>

      {/* 右侧边栏：资产与网络信息 */}
      <div className="space-y-6">
        <AssetsTable />
        <NetworkSwitcher />
      </div>
    </div>
  );

  const renderTradeView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 交易主栏 */}
      <div className="lg:col-span-2 space-y-6">
        <TradeVolumeChart />
      </div>

      {/* 交易侧边栏 */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">市场概览</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">ETH/USDT</span>
                <span className="text-sm text-green-600">+2.45%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">BTC/USDT</span>
                <span className="text-sm text-red-600">-1.23%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">BNB/USDT</span>
                <span className="text-sm text-green-600">+0.87%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4 md:p-8">
      <header className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select value={selectedView} onValueChange={setSelectedView}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="选择视图" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="wallet">钱包</SelectItem>
              <SelectItem value="trade">交易</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <ThemeToggle />
      </header>

      <div className="mt-6">
        {selectedView === 'wallet' ? renderWalletView() : renderTradeView()}
      </div>
    </div>
  );
}

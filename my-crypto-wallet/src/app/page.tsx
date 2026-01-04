// app/page.tsx
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
// 你的自定义组件
import { AccountInfo } from './components/AccountInfo';
import { WalletManager } from './components/WalletManager';
import { SendTransaction } from './components/SendTransaction';
import { ReceivePayment } from './components/ReceivePayment';
import { NetworkSwitcher } from './components/NetworkSwitcher';
import { AssetsTable } from './components/AssetsTable';
import { TransactionHistory } from './components/TransactionHistory';
// import { ActivityFeed } from '@/components/ActivityFeed'; // 假设你新增的活动流组件

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4 md:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">我的加密资产管理器</h1>
        <p className="text-slate-600 dark:text-slate-400">安全地查看、发送与管理你的数字资产</p>
      </header>

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

          {/* <Card>
            <CardHeader>
              <CardTitle>资产列表</CardTitle>
            </CardHeader>
            <CardContent>
              <AssetsTable />
            </CardContent>
          </Card> */}
        </div>

        {/* 右侧边栏：资产与网络信息 */}
        <div className="space-y-6">
          <AssetsTable />

          <NetworkSwitcher />
        </div>
      </div>
    </div>
  );
}

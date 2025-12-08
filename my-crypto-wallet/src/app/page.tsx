// app/page.tsx
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
// 你的自定义组件
import { AccountInfo } from './components/AccountInfo';
import { SendTransaction } from './components/SendTransaction';
// import { AssetsTable } from '@/components/AssetsTable'; // 假设你新增的资产列表组件
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
              <CardTitle className="text-xl flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                账户概览
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AccountInfo /> {/* 这个组件内部也需要用新的UI组件重构 */}
            </CardContent>
          </Card>

          <Tabs defaultValue="send" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="send">发送资产</TabsTrigger>
              <TabsTrigger value="receive">接收资产</TabsTrigger>
            </TabsList>
            <TabsContent value="send" className="space-y-4 pt-4">
              <Card>
                <CardContent className="pt-6">
                  <SendTransaction />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="receive">
              <Card>
                <CardContent className="pt-6">
                  {/* 这里可以放收款地址二维码组件 */}
                  <p className="text-sm text-slate-500">展示你的地址二维码以供他人向你转账。</p>
                </CardContent>
              </Card>
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

        {/* 右侧边栏：活动与信息 */}
        <div className="space-y-6">
          {/* <Card>
            <CardHeader>
              <CardTitle>最近活动</CardTitle>
              <CardDescription>你的账户交易记录</CardDescription>
            </CardHeader>
            <CardContent>
              <ActivityFeed />
            </CardContent>
          </Card> */}

          <Card className="bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="text-blue-700 dark:text-blue-300 text-lg">网络状态</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">当前网络</span>
                  <span className="font-medium">Anvil Local</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">链ID</span>
                  <code className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-800 rounded">31337</code>
                </div>
                <Separator className="my-2" />
                <p className="text-xs text-slate-500 dark:text-slate-400">此网络仅用于本地开发与测试。</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
// components/ReceivePayment.tsx
'use client';
import { useState } from 'react';
import { useAccount } from 'wagmi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Copy, Download, QrCode, Wallet } from 'lucide-react';
import { toast } from 'sonner';

export function ReceivePayment() {
  const { address, isConnected } = useAccount();
  const [showQR, setShowQR] = useState(false);

  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast("地址已复制到剪贴板");
    }
  };

  const handleDownloadQR = () => {
    // In a real implementation, you'd generate and download a QR code image
    toast("QR 码下载功能即将推出");
  };

  if (!isConnected || !address) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <Wallet className="h-12 w-12 mx-auto text-muted-foreground" />
            <div>
              <h3 className="text-lg font-medium">连接钱包</h3>
              <p className="text-sm text-muted-foreground">
                请先连接您的钱包以接收付款
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          接收付款
        </CardTitle>
        <CardDescription>
          分享您的地址以接收加密资产
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Address Display */}
        <div className="space-y-2">
          <label className="text-sm font-medium">您的钱包地址</label>
          <div className="flex items-center gap-2">
            <code className="flex-1 p-3 bg-muted rounded-lg font-mono text-sm break-all">
              {address}
            </code>
            <Button
              size="icon"
              variant="outline"
              onClick={handleCopyAddress}
              title="复制地址"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Separator />

        {/* QR Code Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">二维码</h4>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowQR(!showQR)}
            >
              <QrCode className="h-4 w-4 mr-2" />
              {showQR ? '隐藏' : '显示'} 二维码
            </Button>
          </div>

          {showQR && (
            <div className="flex flex-col items-center space-y-4 p-6 border-2 border-dashed border-muted-foreground/25 rounded-lg">
              <div className="w-48 h-48 bg-muted rounded-lg flex items-center justify-center">
                {/* Placeholder for QR Code - in production, use a QR code library */}
                <div className="text-center space-y-2">
                  <QrCode className="h-16 w-16 mx-auto text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">
                    QR 码生成器<br/>即将推出
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadQR}
              >
                <Download className="h-4 w-4 mr-2" />
                下载二维码
              </Button>
            </div>
          )}
        </div>

        <Separator />

        {/* Network Info */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">网络信息</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">网络:</span>
              <Badge variant="secondary" className="ml-2">Anvil Local</Badge>
            </div>
            <div>
              <span className="text-muted-foreground">链ID:</span>
              <code className="ml-2 px-2 py-1 text-xs bg-muted rounded">31337</code>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="rounded-lg bg-blue-50 dark:bg-blue-950/50 p-4">
          <div className="flex items-start gap-3">
            <div className="text-blue-600 dark:text-blue-400 mt-0.5">
              <Wallet className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                安全提醒
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                仅向可信任的地址发送资产。区块链交易不可逆，请谨慎操作。
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

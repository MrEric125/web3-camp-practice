'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { walletManager, type Wallet as WalletType } from '../connectors/PrivateKeyConnector';
import { mnemonicWalletManager } from '../connectors/MnemonicConnector';

interface AddWalletDialogProps {
  isOpen: boolean;
  onClose: () => void;
  walletType: 'privateKey' | 'mnemonic';
  onWalletAdded: (wallets: WalletType[]) => void;
}

export function AddWalletDialog({ isOpen, onClose, walletType, onWalletAdded }: AddWalletDialogProps) {
  const [walletNameInput, setWalletNameInput] = useState('');
  const [privateKeyInput, setPrivateKeyInput] = useState('');
  const [mnemonicInput, setMnemonicInput] = useState('');
  const [accountCount, setAccountCount] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 处理添加私钥钱包
  const handleAddPrivateKeyWallet = async () => {
    if (!walletNameInput.trim()) {
      toast.error('请输入钱包名称');
      return;
    }

    if (!privateKeyInput || !/^0x[0-9a-fA-F]{64}$/.test(privateKeyInput)) {
      toast.error('私钥格式无效。必须是 0x 开头的 64 位十六进制字符。');
      return;
    }

    setIsSubmitting(true);
    try {
      const newWallet = walletManager.addPrivateKeyWallet(walletNameInput.trim(), privateKeyInput);
      onWalletAdded([newWallet]);
      toast.success('私钥钱包添加成功');
      resetForm();
      onClose();
    } catch (error) {
      toast.error('添加私钥钱包失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 处理添加助记词钱包
  const handleAddMnemonicWallet = async () => {
    if (!walletNameInput.trim()) {
      toast.error('请输入钱包名称');
      return;
    }

    if (!mnemonicInput.trim()) {
      toast.error('请输入助记词');
      return;
    }

    if (!mnemonicWalletManager.validateMnemonicPhrase(mnemonicInput.trim())) {
      toast.error('助记词格式无效');
      return;
    }

    setIsSubmitting(true);
    try {
      const newWallets = mnemonicWalletManager.addMultipleMnemonicWallets(
        walletNameInput.trim(),
        mnemonicInput.trim(),
        accountCount
      );
      onWalletAdded(newWallets);
      toast.success(`成功添加 ${newWallets.length} 个助记词钱包`);
      resetForm();
      onClose();
    } catch (error) {
      toast.error('添加助记词钱包失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 处理生成新助记词
  const handleGenerateMnemonic = () => {
    const newMnemonic = mnemonicWalletManager.generateMnemonicPhrase();
    setMnemonicInput(newMnemonic);
    toast.success('新助记词已生成');
  };

  // 重置表单
  const resetForm = () => {
    setWalletNameInput('');
    setPrivateKeyInput('');
    setMnemonicInput('');
    setAccountCount(5);
  };

  // 处理关闭
  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            添加{walletType === 'privateKey' ? '私钥' : '助记词'}钱包
          </DialogTitle>
          <DialogDescription>
            {walletType === 'privateKey'
              ? '输入私钥来添加钱包。私钥将安全存储在本地浏览器中。'
              : '输入助记词来生成多个派生账户。助记词将安全存储在本地浏览器中。'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* 钱包名称 */}
          <div className="space-y-2">
            <Label htmlFor="walletName">钱包名称</Label>
            <Input
              id="walletName"
              placeholder="输入钱包名称"
              value={walletNameInput}
              onChange={(e) => setWalletNameInput(e.target.value)}
            />
          </div>

          {/* 私钥钱包表单 */}
          {walletType === 'privateKey' && (
            <div className="space-y-2">
              <Label htmlFor="privateKey">私钥</Label>
              <Input
                id="privateKey"
                type="password"
                placeholder="0x..."
                value={privateKeyInput}
                onChange={(e) => setPrivateKeyInput(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                私钥必须是0x开头的64位十六进制字符
              </p>
            </div>
          )}

          {/* 助记词钱包表单 */}
          {walletType === 'mnemonic' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mnemonic">助记词</Label>
                <textarea
                  id="mnemonic"
                  placeholder="输入12或24个单词的助记词，用空格分隔"
                  value={mnemonicInput}
                  onChange={(e) => setMnemonicInput(e.target.value)}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  rows={3}
                />
                <div className="flex items-center justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleGenerateMnemonic}
                  >
                    生成新助记词
                  </Button>
                  {mnemonicInput && (
                    <span className="text-xs text-muted-foreground">
                      {mnemonicInput.split(' ').length} 个单词
                    </span>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountCount">生成账户数量 (1-10)</Label>
                <Input
                  id="accountCount"
                  type="number"
                  min={1}
                  max={10}
                  value={accountCount}
                  onChange={(e) => setAccountCount(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                  className="w-32"
                />
                <p className="text-xs text-muted-foreground">
                  将从助记词生成 {accountCount} 个派生账户
                </p>
              </div>
            </div>
          )}

          {/* 按钮组 */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={walletType === 'privateKey' ? handleAddPrivateKeyWallet : handleAddMnemonicWallet}
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? '添加中...' : `添加${walletType === 'privateKey' ? '私钥' : '助记词'}钱包`}
            </Button>
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              取消
            </Button>
          </div>

          {/* 安全提示 */}
          <div className="text-center text-xs text-muted-foreground">
            <p>⚠️ 请妥善保管您的私钥和助记词，所有信息仅存储在本地浏览器中</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

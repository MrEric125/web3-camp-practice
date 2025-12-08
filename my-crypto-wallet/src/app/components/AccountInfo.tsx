// components/AccountInfo.tsx
'use client';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useBalance, useDisconnect } from 'wagmi';
import { formatEther } from 'viem';

export function AccountInfo() {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });
  const { disconnect } = useDisconnect();

  if (!isConnected) return <ConnectButton />;

  return (
    <div>
      <p>地址: {address?.slice(0, 6)}...{address?.slice(-4)}</p>
      <p>余额: {balance ? parseFloat(formatEther(balance.value)).toFixed(4) : '0'} {balance?.symbol}</p>
      <button onClick={() => disconnect()}>断开连接</button>
    </div>
  );
}
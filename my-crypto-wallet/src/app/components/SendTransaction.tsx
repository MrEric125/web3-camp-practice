// components/SendTransaction.tsx
'use client';
import { useState } from 'react';
import { useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';

export function SendTransaction() {
  const [to, setTo] = useState('');
  const [value, setValue] = useState('');

  const {
    sendTransaction,
    data: hash,
    isPending,
    error,
  } = useSendTransaction();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    sendTransaction({ to: to as `0x${string}`, value: parseEther(value) });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={to} onChange={(e) => setTo(e.target.value)} placeholder="收款地址" />
      <input value={value} onChange={(e) => setValue(e.target.value)} placeholder="金额 (ETH)" />
      <button disabled={isPending} type="submit">
        {isPending ? '等待确认...' : '发送'}
      </button>
      {hash && <div>交易哈希: {hash}</div>}
      {isConfirming && <div>等待交易确认...</div>}
      {isConfirmed && <div>交易成功确认!</div>}
      {error && <div>错误: {error.message}</div>}
    </form>
  );
}
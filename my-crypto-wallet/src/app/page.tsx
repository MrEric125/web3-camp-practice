// app/page.tsx
// ‘use client’； // 因为这个页面需要用到交互性和状态（如useState, useAccount），所以需要声明为客户端组件

import { AccountInfo } from './components/AccountInfo';
import { SendTransaction } from './components/SendTransaction';

export default function HomePage() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>我的加密货币钱包</h1>
      {/* 这里会显示连接按钮、地址和余额 */}
      <AccountInfo />
      <hr />
      <h2>发送交易</h2>
      {/* 这里会显示发送交易的表单 */}
      <SendTransaction />
    </div>
  );
}
// src/components/TransactionSender.tsx
import React, { useState } from 'react';
import { useWallet } from '../hooks/useWallet';
import { parseEther } from 'viem';
import { isValidAddress } from '../utils/walletUtils';

const TransactionSender: React.FC = () => {
  const { currentAccount, currentNetwork, sendTransaction, publicClient } = useWallet();
  
  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [password, setPassword] = useState('');
  const [gasPrice, setGasPrice] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSend = async () => {
    if (!currentAccount) {
      setError('No account selected');
      return;
    }

    if (!isValidAddress(toAddress)) {
      setError('Invalid recipient address');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError('Invalid amount');
      return;
    }

    try {
      setIsSending(true);
      setError('');
      setSuccess('');

      const result = await sendTransaction(
        toAddress,
        amount,
        password,
        gasPrice ? BigInt(parseInt(gasPrice)) : undefined
      );

      setSuccess(`Transaction sent! Hash: ${result.hash}`);
      
      // 重置表单
      setToAddress('');
      setAmount('');
      setPassword('');
      setGasPrice('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send transaction');
    } finally {
      setIsSending(false);
    }
  };

  const estimateGas = async () => {
    if (!publicClient || !currentAccount || !toAddress || !amount) return;

    try {
      const gas = await publicClient.estimateGas({
        account: currentAccount.address as `0x${string}`,
        to: toAddress as `0x${string}`,
        value: parseEther(amount)
      });

      setGasPrice(gas.toString());
    } catch (err) {
      console.error('Failed to estimate gas:', err);
    }
  };

  return (
    <div className="transaction-sender">
      <h3>Send Transaction</h3>
      
      <div className="form-group">
        <label>From:</label>
        <input 
          type="text" 
          value={currentAccount?.address || ''} 
          readOnly 
          disabled
        />
      </div>

      <div className="form-group">
        <label>To:</label>
        <input
          type="text"
          placeholder="0x..."
          value={toAddress}
          onChange={(e) => setToAddress(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Amount ({currentNetwork.currency}):</label>
        <div className="amount-input">
          <input
            type="number"
            step="0.000001"
            placeholder="0.0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <button 
            type="button" 
            onClick={() => {
              if (currentAccount?.balance) {
                setAmount((parseFloat(currentAccount.balance) * 0.99).toFixed(6));
              }
            }}
          >
            Max
          </button>
        </div>
        <small>Balance: {currentAccount?.balance || '0'} {currentNetwork.currency}</small>
      </div>

      <div className="form-group">
        <label>Gas Price (Optional):</label>
        <input
          type="text"
          placeholder="Auto"
          value={gasPrice}
          onChange={(e) => setGasPrice(e.target.value)}
        />
        <button type="button" onClick={estimateGas}>Estimate</button>
      </div>

      <div className="form-group">
        <label>Password:</label>
        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <button 
        onClick={handleSend} 
        disabled={isSending || !currentAccount}
        className="send-button"
      >
        {isSending ? 'Sending...' : 'Send Transaction'}
      </button>
    </div>
  );
};

export default TransactionSender;
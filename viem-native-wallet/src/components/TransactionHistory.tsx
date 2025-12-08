// src/components/TransactionHistory.tsx
import React from 'react';
import { useWallet } from '../hooks/useWallet';
import { format } from 'date-fns';

const TransactionHistory: React.FC = () => {
  const { transactions, currentNetwork } = useWallet();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'green';
      case 'failed': return 'red';
      case 'pending': return 'orange';
      default: return 'gray';
    }
  };

  const openExplorer = (hash: string) => {
    window.open(`${currentNetwork.explorerUrl}/tx/${hash}`, '_blank');
  };

  return (
    <div className="transaction-history">
      <h3>Transaction History</h3>
      
      {transactions.length === 0 ? (
        <p className="empty-history">No transactions yet</p>
      ) : (
        <div className="transactions-list">
          {transactions.map((tx) => (
            <div key={tx.hash} className="transaction-item">
              <div className="transaction-header">
                <span 
                  className="transaction-status"
                  style={{ backgroundColor: getStatusColor(tx.status) }}
                >
                  {tx.status.toUpperCase()}
                </span>
                <span className="transaction-time">
                  {format(new Date(tx.timestamp), 'MMM dd, HH:mm')}
                </span>
              </div>
              
              <div className="transaction-details">
                <div className="address-group">
                  <label>From:</label>
                  <span className="address">{tx.from}</span>
                </div>
                <div className="address-group">
                  <label>To:</label>
                  <span className="address">{tx.to}</span>
                </div>
                <div className="amount-group">
                  <label>Amount:</label>
                  <span className="amount">{tx.value} {currentNetwork.currency}</span>
                </div>
                {tx.gasUsed && (
                  <div className="gas-info">
                    <label>Gas Used:</label>
                    <span>{tx.gasUsed}</span>
                  </div>
                )}
              </div>

              <div className="transaction-actions">
                <button 
                  onClick={() => openExplorer(tx.hash)}
                  className="view-button"
                >
                  View on Explorer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;
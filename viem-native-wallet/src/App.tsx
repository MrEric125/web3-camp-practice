// src/App.tsx
import React from 'react';
import { useWallet } from './hooks/useWallet';
import AccountManager from './components/AccountManager';
import NetworkSelector from './components/NetworkSelector';
import TransactionSender from './components/TransactionSender';
import TransactionHistory from './components/TransactionHistory';
import WalletConnect from './components/WalletConnect';

const App: React.FC = () => {
  const { currentAccount, currentNetwork } = useWallet();

  return (
    <div className="web3-wallet">
      <header className="app-header">
        <div className="logo">
          <h1>Web3 Wallet</h1>
        </div>
        <div className="header-right">
          <NetworkSelector />
          <WalletConnect />
        </div>
      </header>

      <div className="app-container">
        <aside className="sidebar">
          <AccountManager />
        </aside>

        <main className="main-content">
          {currentAccount ? (
            <>
              <div className="wallet-info">
                <h2>Wallet Overview</h2>
                <div className="balance-card">
                  <h3>Total Balance</h3>
                  <p className="balance">
                    {currentAccount.balance} {currentNetwork.currency}
                  </p>
                  <p className="address">{currentAccount.address}</p>
                  <p className="network">Network: {currentNetwork.name}</p>
                </div>
              </div>

              <div className="transaction-section">
                <div className="send-transaction">
                  <TransactionSender />
                </div>
                <div className="transaction-history">
                  <TransactionHistory />
                </div>
              </div>
            </>
          ) : (
            <div className="welcome-screen">
              <h2>Welcome to Web3 Wallet</h2>
              <p>Create a new account or import an existing one to get started</p>
              <p>Connect your external wallet for easy access</p>
            </div>
          )}
        </main>
      </div>

      <footer className="app-footer">
        <p>Web3 Wallet &copy; {new Date().getFullYear()}</p>
        <p className="network-info">
          Connected to: {currentNetwork.name} (Chain ID: {currentNetwork.chainId})
        </p>
      </footer>
    </div>
  );
};

export default App;
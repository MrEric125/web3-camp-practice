// src/components/WalletConnect.tsx
import React, { useState } from 'react';
import { useWallet } from '../hooks/useWallet';

const WalletConnect: React.FC = () => {
  const { isConnected, connectExternalWallet } = useWallet();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      await connectExternalWallet();
    } catch (error) {
      console.error('Failed to connect:', error);
      alert('Failed to connect wallet. Make sure MetaMask is installed.');
    } finally {
      setIsConnecting(false);
    }
  };

  if (typeof window === 'undefined' || !window.ethereum) {
    return (
      <button className="wallet-connect disabled" disabled>
        Install MetaMask
      </button>
    );
  }

  return (
    <button
      className={`wallet-connect ${isConnected ? 'connected' : ''}`}
      onClick={handleConnect}
      disabled={isConnecting || isConnected}
    >
      {isConnecting ? 'Connecting...' : 
       isConnected ? 'Connected' : 
       'Connect Wallet'}
    </button>
  );
};

export default WalletConnect;
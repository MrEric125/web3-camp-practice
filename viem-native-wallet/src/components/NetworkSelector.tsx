// src/components/NetworkSelector.tsx
import React, { useState } from 'react';
import { useNetwork } from '../hooks/useNetwork';

const NetworkSelector: React.FC = () => {
  const { currentNetwork, networks, switchNetwork } = useNetwork();
  const [showNetworks, setShowNetworks] = useState(false);

  const handleNetworkSwitch = async (networkId: string) => {
    try {
      await switchNetwork(networkId);
      setShowNetworks(false);
    } catch (error) {
      console.error('Failed to switch network:', error);
    }
  };

  return (
    <div className="network-selector">
      <button 
        className="network-button"
        onClick={() => setShowNetworks(!showNetworks)}
        onBlur={() => setTimeout(() => setShowNetworks(false), 200)}
      >
        <span className="network-indicator"></span>
        {currentNetwork.name}
      </button>

      {showNetworks && (
        <div className="network-dropdown">
          {networks.map(network => (
            <button
              key={network.id}
              className={`network-item ${currentNetwork.id === network.id ? 'active' : ''}`}
              onClick={() => handleNetworkSwitch(network.id)}
              onMouseDown={(e) => e.preventDefault()} // 防止按钮失焦
            >
              <span className={`network-status ${network.isTestnet ? 'testnet' : 'mainnet'}`}>
                {network.isTestnet ? 'Test' : 'Main'}
              </span>
              <div className="network-info">
                <strong>{network.name}</strong>
                <small>Chain ID: {network.chainId}</small>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default NetworkSelector;
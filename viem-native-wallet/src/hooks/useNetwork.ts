// src/hooks/useNetwork.ts
import { useState, useCallback } from 'react';
import { createPublicClient, http } from 'viem';
import { NETWORKS } from '../utils/networks';
import { Network } from '../types';

export const useNetwork = () => {
  const [currentNetwork, setCurrentNetwork] = useState<Network>(NETWORKS[0]);
  const [networks] = useState<Network[]>(NETWORKS);

  const switchNetwork = useCallback(async (networkId: string) => {
    const network = networks.find(n => n.id === networkId);
    if (!network) {
      throw new Error('Network not found');
    }

    try {
      // 测试网络连接
      const client = createPublicClient({
        transport: http(network.rpcUrl)
      });

      // 获取链ID验证网络
      const chainId = await client.getChainId();
      if (chainId !== network.chainId) {
        throw new Error('Network chain ID mismatch');
      }

      setCurrentNetwork(network);
      return network;
    } catch (error) {
      console.error('Failed to switch network:', error);
      throw error;
    }
  }, [networks]);

  const addCustomNetwork = useCallback((network: Omit<Network, 'id'>) => {
    const newNetwork: Network = {
      ...network,
      id: `custom-${network.chainId}`
    };

    // 这里应该将自定义网络保存到本地存储
    const customNetworks = JSON.parse(localStorage.getItem('custom-networks') || '[]');
    const updatedNetworks = [...customNetworks, newNetwork];
    localStorage.setItem('custom-networks', JSON.stringify(updatedNetworks));

    return newNetwork;
  }, []);

  const removeNetwork = useCallback((networkId: string) => {
    const builtInNetwork = NETWORKS.find(n => n.id === networkId);
    if (builtInNetwork && !builtInNetwork.isTestnet) {
      throw new Error('Cannot remove built-in mainnet networks');
    }

    // 从本地存储中移除
    const customNetworks = JSON.parse(localStorage.getItem('custom-networks') || '[]');
    const updatedNetworks = customNetworks.filter((n: Network) => n.id !== networkId);
    localStorage.setItem('custom-networks', JSON.stringify(updatedNetworks));
  }, []);

  // 获取所有网络（包括自定义网络）
  const getAllNetworks = useCallback((): Network[] => {
    const customNetworks = JSON.parse(localStorage.getItem('custom-networks') || '[]');
    return [...NETWORKS, ...customNetworks];
  }, []);

  return {
    currentNetwork,
    networks: getAllNetworks(),
    switchNetwork,
    addCustomNetwork,
    removeNetwork
  };
};
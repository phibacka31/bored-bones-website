// src/hooks/useContractData.js
'use client';

import { useContractRead, useAccount } from 'wagmi';
import { useState, useEffect } from 'react';

export function useContractData(contractAddress) {
  const { address } = useAccount();
  
  // Read total supply
  const { data: totalSupply, isLoading: loadingSupply } = useContractRead({
    address: contractAddress,
    abi: [
      { inputs: [], name: "MAX_SUPPLY", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" }
    ],
    functionName: 'MAX_SUPPLY',
    enabled: !!contractAddress,
  });

  // Read total minted
  const { data: totalMinted, isLoading: loadingMinted } = useContractRead({
    address: contractAddress,
    abi: [
      { inputs: [], name: "totalMinted", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" }
    ],
    functionName: 'totalMinted',
    enabled: !!contractAddress,
  });

  // Read mint active status
  const { data: mintActive, isLoading: loadingMintActive } = useContractRead({
    address: contractAddress,
    abi: [
      { inputs: [], name: "mintActive", outputs: [{ type: "bool" }], stateMutability: "view", type: "function" }
    ],
    functionName: 'mintActive',
    enabled: !!contractAddress,
  });

  // Read mint price
  const { data: mintPrice, isLoading: loadingPrice } = useContractRead({
    address: contractAddress,
    abi: [
      { inputs: [], name: "MINT_PRICE", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" }
    ],
    functionName: 'MINT_PRICE',
    enabled: !!contractAddress,
  });

  // Read user's mint count (if they're connected)
  const { data: userMintCount, isLoading: loadingUserMint } = useContractRead({
    address: contractAddress,
    abi: [
      { inputs: [{ type: "address" }], name: "mintCount", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" }
    ],
    functionName: 'mintCount',
    args: [address],
    enabled: !!contractAddress && !!address,
  });

  // Read collection allocation (example for one collection)
  const { data: collectionAllocation, isLoading: loadingAllocation } = useContractRead({
    address: contractAddress,
    abi: [
      { inputs: [{ type: "address" }], name: "getCollectionAllocation", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" }
    ],
    functionName: 'getCollectionAllocation',
    args: ["0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D"], // BAYC address as example
    enabled: !!contractAddress,
  });

  // Read collection minted count
  const { data: collectionMinted, isLoading: loadingCollectionMinted } = useContractRead({
    address: contractAddress,
    abi: [
      { inputs: [{ type: "address" }], name: "getCollectionMinted", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" }
    ],
    functionName: 'getCollectionMinted',
    args: ["0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D"], // BAYC address as example
    enabled: !!contractAddress,
  });

  // Calculate derived values
  const remaining = (totalSupply || 0) - (totalMinted || 0);
  const progressPercentage = totalSupply ? (totalMinted / totalSupply) * 100 : 0;
  const isLoading = loadingSupply || loadingMinted || loadingMintActive || loadingPrice;

  // Format mint price for display
  const formattedMintPrice = mintPrice ? (Number(mintPrice) / 10**18).toString() : "28";

  return {
    // Contract data
    totalSupply: totalSupply || 4200, // Default to 4200 if not available
    totalMinted: totalMinted || 0,
    remaining,
    progressPercentage,
    mintActive: mintActive || false,
    mintPrice: formattedMintPrice,
    
    // User data
    userMintCount: userMintCount || 0,
    userAddress: address,
    
    // Collection data (example for one collection)
    collectionAllocation: collectionAllocation || 0,
    collectionMinted: collectionMinted || 0,
    
    // Loading states
    isLoading,
    loadingSupply,
    loadingMinted,
    loadingMintActive,
    loadingPrice,
    loadingUserMint,
    loadingAllocation,
    loadingCollectionMinted,
    
    // Helper functions
    canUserMint: () => {
      if (!address) return false;
      if (!mintActive) return false;
      if (userMintCount >= 1) return false; // Assuming 1 per wallet limit
      if (remaining <= 0) return false;
      return true;
    },
    
    // Format functions
    formatAddress: (addr) => {
      if (!addr) return "Not Connected";
      return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    },
    
    formatBalance: (balance) => {
      if (!balance) return "0";
      return (Number(balance) / 10**18).toFixed(2);
    }
  };
}

// Helper function to read multiple collection allocations
export function useCollectionAllocations(contractAddress, collectionAddresses) {
  const [allocations, setAllocations] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAllocations = async () => {
      if (!contractAddress || !collectionAddresses) {
        setIsLoading(false);
        return;
      }

      try {
        // This would need to be implemented based on your contract structure
        // For now, returning mock data
        const mockAllocations = {};
        collectionAddresses.forEach(address => {
          mockAllocations[address] = {
            allocation: 100, // Mock allocation
            minted: Math.floor(Math.random() * 50), // Mock minted count
            remaining: 100 - Math.floor(Math.random() * 50)
          };
        });
        
        setAllocations(mockAllocations);
      } catch (error) {
        console.error('Error fetching allocations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllocations();
  }, [contractAddress, collectionAddresses]);

  return { allocations, isLoading };
}

// Helper function to check if user is on correct network
export function useNetworkCheck() {
  const { chain } = useAccount();
  
  const isCorrectNetwork = chain?.id === 33139; // ApeChain ID
  const networkName = chain?.name || "Unknown";
  
  return {
    isCorrectNetwork,
    networkName,
    chainId: chain?.id
  };
}
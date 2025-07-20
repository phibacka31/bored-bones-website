'use client';

import { useContractRead } from 'wagmi';
import styles from '../styles/AllocationDisplay.module.css';

const ERC721_ABI = [
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{ "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
];

export default function AllocationDisplay() {
  // Individual contract reads for each collection
  const { data: baycSupply } = useContractRead({
    address: "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D",
    abi: ERC721_ABI,
    functionName: 'totalSupply',
    watch: true,
  });
  const { data: maycSupply } = useContractRead({
    address: "0x60E4d786628Fea6478F785A6d7e704777c86a7c6",
    abi: ERC721_ABI,
    functionName: 'totalSupply',
    watch: true,
  });
  const { data: kodaSupply } = useContractRead({
    address: "0xE012Baf811CF9c05c408e879C399960D1f305903",
    abi: ERC721_ABI,
    functionName: 'totalSupply',
    watch: true,
  });
  const { data: otherdeedsSupply } = useContractRead({
    address: "0x790B2cF29Ed4F310bf7641f013C65D4560d28371",
    abi: ERC721_ABI,
    functionName: 'totalSupply',
    watch: true,
  });
  const { data: gobsSupply } = useContractRead({
    address: "0xBEbaa24108d6a03C7331464270b95278bBBE6Ff7",
    abi: ERC721_ABI,
    functionName: 'totalSupply',
    watch: true,
  });
  const { data: fadeSupply } = useContractRead({
    address: "0xD5D99061019fd0ccd8Ce825C91d53FBF1DfAB8fC",
    abi: ERC721_ABI,
    functionName: 'totalSupply',
    watch: true,
  });

  // Build stats array
  const collectionStats = [
    {
      name: "BAYC",
      allocation: 200,
      minted: typeof baycSupply === 'number' ? Number(baycSupply) : 0,
      remaining: typeof baycSupply === 'number' ? 200 - Number(baycSupply) : 200,
    },
    {
      name: "MAYC",
      allocation: 200,
      minted: typeof maycSupply === 'number' ? Number(maycSupply) : 0,
      remaining: typeof maycSupply === 'number' ? 200 - Number(maycSupply) : 200,
    },
    {
      name: "KODA",
      allocation: 200,
      minted: typeof kodaSupply === 'number' ? Number(kodaSupply) : 0,
      remaining: typeof kodaSupply === 'number' ? 200 - Number(kodaSupply) : 200,
    },
    {
      name: "Otherdeeds",
      allocation: 200,
      minted: typeof otherdeedsSupply === 'number' ? Number(otherdeedsSupply) : 0,
      remaining: typeof otherdeedsSupply === 'number' ? 200 - Number(otherdeedsSupply) : 200,
    },
    {
      name: "Gobs",
      allocation: 250,
      minted: typeof gobsSupply === 'number' ? Number(gobsSupply) : 0,
      remaining: typeof gobsSupply === 'number' ? 250 - Number(gobsSupply) : 250,
    },
    {
      name: "Fade",
      allocation: 100,
      minted: typeof fadeSupply === 'number' ? Number(fadeSupply) : 0,
      remaining: typeof fadeSupply === 'number' ? 100 - Number(fadeSupply) : 100,
    },
  ];

  // Calculate totals
  const totalAllocation = collectionStats.reduce((sum, c) => sum + c.allocation, 0);
  const totalMinted = collectionStats.reduce((sum, c) => sum + (c.minted || 0), 0);
  const totalSupply = 4200;
  const remaining = totalSupply - totalMinted;
  const progressPercentage = totalMinted > 0 ? (totalMinted / totalSupply) * 100 : 0;

  return (
    <div className={styles.allocationContainer}>
      {/* Overall Progress */}
      <div className={styles.overallProgress}>
        <h2>Bored Bones Mint Progress</h2>
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill} 
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className={styles.stats}>
          <p>Total Minted: {totalMinted}</p>
          <p>Total Supply: 4,200</p>
          <p>Remaining: {remaining}</p>
          <p>Status: Minting Paused</p>
        </div>
      </div>

      {/* Collection Allocations */}
      <div className={styles.collectionsGrid}>
        <h3>Collection Allocations</h3>
        <div className={styles.allocationSummary}>
          <p>Total Allocation: {totalAllocation} NFTs</p>
          <p>Available for Public: {4200 - totalAllocation} NFTs</p>
        </div>
        <div className={styles.collectionsList}>
          {collectionStats.map((collection) => (
            <div key={collection.name} className={styles.collectionCard}>
              <div className={styles.collectionHeader}>
                <div className={styles.collectionImagePlaceholder}>
                  {collection.name.charAt(0)}
                </div>
                <h4>{collection.name}</h4>
              </div>
              <div className={styles.collectionProgress}>
                <div className={styles.progressBar}>
                  <div 
                    className={styles.progressFill} 
                    style={{ 
                      width: `${collection.minted > 0 ? Math.min((collection.minted / collection.allocation) * 100, 100) : 0}%` 
                    }}
                  />
                </div>
                <div className={styles.collectionStats}>
                  <span>Minted: {collection.minted}</span>
                  <span>Allocation: {collection.allocation}</span>
                  <span>Remaining: {collection.remaining}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mint Information */}
      <div className={styles.mintInfo}>
        <h3>Mint Information</h3>
        <div className={styles.mintDetails}>
          <p>Price: 28 $APE tokens per NFT</p>
          <p>Total Collection Size: 4,200 NFTs</p>
          <p>Per Wallet Limit: 1 NFT (on allowlist)</p>
          <p>Collections with Allocation: {collectionStats.length}</p>
          <p>Total Allocation: {totalAllocation} NFTs</p>
          <p>Public Mint Available: {4200 - totalAllocation} NFTs</p>
        </div>
      </div>
    </div>
  );
}
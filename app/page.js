'use client'; // Add this directive at the top
import Image from 'next/image'; // Keep existing import
import ConnectWalletButton from './components/ConnectWalletButton'; // Import the ConnectWalletButton component
import AllocationDisplay from './components/AllocationDisplay'; // Add this import
import { useAccount, usePrepareWriteContract, useWriteContract } from 'wagmi'; // Import necessary wagmi hooks
import SkullMines from './components/SkullMines'; // Import the new Mines game component
import BoneDash from './components/BoneDash'; // Import the BoneDash component

export default function Page() {
  // Use wagmi hooks here to get connection status and potentially prepare for minting
  const { address, isConnected } = useAccount();

  // --- Placeholder for Minting Logic ---
  // You will define your contract address and ABI here
  const contractAddress = '0x0000000000000000000000000000000000000000'; // Replace with your deployed contract address
  // const contractABI = [ ... ]; // Replace with your contract's ABI

  // Example using usePrepareWriteContract (replace with your actual mint function details)
  // const { config: mintConfig } = usePrepareWriteContract({
  //   address: contractAddress,
  //   abi: contractABI,
  //   functionName: 'mint', // Replace with your mint function name
  //   args: [/* arguments for your mint function, e.g., quantity */],
  //   enabled: isConnected, // Only prepare if a wallet is connected
  // });

  // Example using useWriteContract
  // const { write: mintNFT } = useWriteContract(mintConfig);
  // --- End Placeholder for Minting Logic ---

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-start">
      {/* Header Section */}
      <div className="text-center py-8 w-full">
        {/* Add the Image component here */}
        <div className="flex justify-center mb-2 bored-bones-logo-wrapper" style={{ marginTop: '-64px' }}>
          <Image
            src="/images/boredboneslogo.png"
            alt="Bored Bones Logo"
            width={700}
            height={650}
            priority
            className="rounded-lg shadow-lg bored-bones-logo"
          />
        </div>
        <style jsx>{`
          @media (max-width: 700px) {
            .bored-bones-logo {
              width: 90vw !important;
              height: auto !important;
              max-width: 350px !important;
            }
          }
        `}</style>
        <div style={{ textAlign: 'center', fontSize: '2.8em', fontWeight: 900, margin: '0 0 0.5em 0', letterSpacing: '0.03em', width: '100%' }}>
          The Void Welcomes You...
        </div>
      </div>

      {/* Lore Section - Make this much larger */}
      <div className="max-w-4xl mx-auto px-4 mb-8">
        <div className="bg-gray-900 rounded-lg p-8">
          <p style={{ fontSize: '1.5em', lineHeight: '1.5', marginBottom: '1.2em', fontWeight: 500 }}>
            You didn't stumble here by accident. The bones have been waiting—watching—as cycles turned and chains formed. Now, the signal hums louder. On ApeChain, something stirs. Not a revolution. A reckoning.
          </p>
          <p style={{ fontSize: '1.5em', lineHeight: '1.5', marginBottom: '1.2em', fontWeight: 500 }}>
            Bored Bones is not a collection. It's a fracture in the known.<br />
            4,200 pixel-forged remnants—humanoid, hollow, and haunted—each echoing a forgotten whisper from the Void. They're not minted. They're remembered.
          </p>
          <p style={{ fontSize: '1.5em', lineHeight: '1.5', fontWeight: 500 }}>
            This isn't about utility. It's about inevitability.<br />
            Turn the key. Join the Order. Enter The Void.
          </p>
        </div>
      </div>

      {/* Wallet Connection Section - Replace with coming soon message */}
      <div className="max-w-4xl mx-auto px-4 mb-8">
        <div className="bg-gray-900 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
          <div style={{ fontSize: '1.3em', color: '#ff6b35', fontWeight: 600 }}>
            Wallet connection coming soon.<br />
            Will support delegation.
          </div>
        </div>
      </div>

      {/* Minting Section (Conditionally Displayed) */}
      {isConnected && (
        <div className="max-w-4xl mx-auto px-4 mb-8">
          <div className="bg-gray-900 rounded-lg p-6 text-center">
            <h2 className="text-2xl font-bold mb-4">Mint Your Bored Bone</h2>
            <p className="text-gray-300 mb-4">Wallet Address: {address}</p>
            <p className="text-lg mb-4">
              Price: <span className="text-orange-500 font-bold">28 $APE</span> per NFT
            </p>
            {/* You will add your mint button and logic here */}
            <button 
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-lg text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              disabled
            >
              Mint NFT (Coming Soon)
            </button>
          </div>
        </div>
      )}

      {/* Game Section */}
      <div className="max-w-4xl mx-auto px-4 mb-8">
        <div className="bg-gray-900 rounded-lg p-6">
          <BoneDash />
        </div>
      </div>

      {/* Information Table */}
      <div className="max-w-4xl mx-auto px-4 mb-8">
        <div className="bg-gray-900 rounded-lg p-8">
          <table style={{ width: '100%', color: '#fff', fontSize: '1.25em', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'center', padding: '16px 0', fontWeight: 900, fontSize: '2em', borderBottom: '2px solid #444', letterSpacing: '0.03em' }} colSpan={2}>Collection Features</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={2} style={{ padding: '16px 0', textAlign: 'center', fontWeight: 700, verticalAlign: 'top', fontSize: '1.15em' }}>
                  Collection Size<br />
                  <span style={{ display: 'block', fontWeight: 900, fontSize: '1.25em', marginTop: 6 }}>4,200</span>
                </td>
              </tr>
              <tr>
                <td colSpan={2} style={{ padding: '16px 0', textAlign: 'center', fontWeight: 700, verticalAlign: 'top', fontSize: '1.15em' }}>
                  Mint Price<br />
                  <span style={{ display: 'block', fontWeight: 900, fontSize: '1.25em', marginTop: 6 }}>28 $APE</span>
                </td>
              </tr>
              <tr>
                <td style={{ padding: '16px 0' }} colSpan={2}><strong style={{ fontSize: '1.25em' }}>On-Chain Art</strong><br /><span style={{ color: '#aaa', fontSize: '1.1em' }}>Art stored directly on blockchain</span></td>
              </tr>
              <tr>
                <td style={{ padding: '16px 0' }} colSpan={2}><strong style={{ fontSize: '1.25em' }}>Royalties</strong><br /><span style={{ color: '#aaa', fontSize: '1.1em' }}>Enforced creator royalties</span></td>
              </tr>
              <tr>
                <td style={{ padding: '16px 0' }} colSpan={2}><strong style={{ fontSize: '1.25em' }}>Arcade Games</strong><br /><span style={{ color: '#aaa', fontSize: '1.1em' }}>Play games with your NFTs</span></td>
              </tr>
              <tr>
                <td style={{ padding: '16px 0' }} colSpan={2}><strong style={{ fontSize: '1.25em' }}>Lore System</strong><br /><span style={{ color: '#aaa', fontSize: '1.1em' }}>Rich character backstories</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Collection Allocations - Move to bottom */}
      <div className="max-w-7xl mx-auto px-4 mb-8">
        <AllocationDisplay contractAddress={contractAddress} />
      </div>

      {/* Footer */}
      <footer className="text-center py-8 mt-12 border-t border-gray-800">
        <p className="text-gray-400">
          Built on ApeChain • Powered by $APE
        </p>
      </footer>
    </main>
  );
}
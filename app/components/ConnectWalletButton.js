'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useEffect, useState } from 'react';

export default function ConnectWalletButton() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const { address, isConnected } = useAccount();
  const { connect, connectors, error, isLoading, pendingConnector } = useConnect();
  const { disconnect } = useDisconnect();

  if (!isClient) {
    // Avoid hydration mismatch by not rendering anything until client-side
    return null;
  }

  if (isConnected) {
    return (
      <div>
        <p>Connected to {address}</p>
        <button onClick={() => disconnect()}>Disconnect</button>
      </div>
    );
  }

  return (
    <div>
      <h2>Connect Wallet</h2>
      {connectors.map((connector) => (
        <button
          key={connector.id}
          disabled={!connector.ready || isLoading}
          onClick={() => connect({ connector })}
          style={{ margin: 8 }}
        >
          {isLoading && pendingConnector?.id === connector.id
            ? 'Connecting...'
            : `Connect with ${connector.name} (${connector.id})`}
        </button>
      ))}
      {error && <div>{error.message}</div>}
    </div>
  );
}
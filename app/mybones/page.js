'use client';
import Image from 'next/image';

export default function MyBonesPage() {
  return (
    <main style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'black', color: 'white' }}>
      <h1 style={{ fontSize: '3.5em', fontWeight: 900, letterSpacing: '0.04em', marginBottom: '0.5em', textAlign: 'center' }}>My Bones</h1>
      <Image
        src="/images/My_Bones.png"
        alt="My Bones Image"
        width={600}
        height={300}
        style={{ marginBottom: '2em', borderRadius: 16, boxShadow: '0 4px 24px #000a' }}
      />
      <div style={{ textAlign: 'center', marginTop: '1em' }}>
        <p style={{ fontSize: '1.5em', marginBottom: '1.5em' }}>
          Explore your Bored Bones collection here soon!
        </p>
        <div style={{
          background: '#181818',
          borderRadius: 12,
          padding: '2.5em',
          color: '#fff',
          fontSize: '1.3em',
          boxShadow: '0 2px 8px #0008',
          maxWidth: 500,
          margin: '0 auto',
          textAlign: 'center',
        }}>
          <span role="img" aria-label="bones" style={{ fontSize: '2.5em' }}>🦴🦴🦴</span>
          <div style={{ marginTop: '1.2em', textAlign: 'center' }}>
            Wallet connection and delegation coming soon!<br />
            (After mint, you'll be able to view your Bones and delegate wallets here)
          </div>
        </div>
      </div>
    </main>
  );
}
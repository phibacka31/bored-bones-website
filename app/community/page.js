import Image from 'next/image';

export default function CommunityPage() {
  return (
    <main style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'black', color: 'white' }}>
      <h1 style={{ fontSize: '3.5em', fontWeight: 900, letterSpacing: '0.04em', textAlign: 'center', marginBottom: '1em' }}>Community</h1>
      <a
        href="https://other.page/communities/bored-bones"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'inline-block',
          borderRadius: 24,
          boxShadow: '0 4px 24px #000a',
          background: 'none',
          padding: 0,
          transition: 'transform 0.1s, box-shadow 0.1s',
          marginBottom: 8,
          marginTop: 0,
        }}
        aria-label="Join the Bored Bones Community on OtherPage"
      >
        <Image
          src="/images/boredboneslogo.png"
          alt="Bored Bones Logo"
          width={480}
          height={390}
          style={{ display: 'block', margin: '0 auto', borderRadius: 16, cursor: 'pointer' }}
        />
      </a>
      <div style={{ fontSize: '2em', color: '#aaa', textAlign: 'center', maxWidth: 700, fontWeight: 700, marginTop: 24 }}>
        Join our community on <span style={{ color: '#ff6b35', fontWeight: 700 }}>OtherPage</span> to connect, share, and stay updated with all things Bored Bones!
      </div>
    </main>
  );
} 
import Image from 'next/image';

export default function TeamPage() {
  return (
    <main style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'black', color: 'white' }}>
      <h1 style={{ fontSize: '3.5em', fontWeight: 900, letterSpacing: '0.04em', textAlign: 'center', marginBottom: '1em' }}>The Team</h1>
      <div style={{ margin: '2em 0' }}>
        <Image
          src="/images/boredmic.png"
          alt="Your Team Image"
          width={220}
          height={220}
          style={{ borderRadius: '50%', boxShadow: '0 4px 24px #000a', objectFit: 'cover', background: '#181818' }}
        />
      </div>
      <a
        href="https://x.com/bored_mic"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          fontSize: '1.5em',
          color: '#ff6b35',
          fontWeight: 700,
          textDecoration: 'underline',
          marginBottom: '1.5em',
        }}
      >
        Follow on X (Twitter)
      </a>
      <div style={{ fontSize: '1.3em', color: '#aaa', textAlign: 'center', maxWidth: 600, fontWeight: 500 }}>
        Bored.mic is a passionate builder in the Web3 space, deeply rooted in the Bored Ape Yacht Club and ApeChain communities. The journey began with a spark of inspiration from James, the creator of Gobs on Ape, whose energy and creativity in early 2025 helped ignite a vision for something bigger. That vision became a project grounded in four core pillars: Onchain Art, Lore, Community Vibes, and Fun. Every move is fueled by love for the culture, belief in the tech, and a commitment to building something dope with the ApeChain fam. ONCHAIN.<br /><br />
        Stay Bored.
      </div>
    </main>
  );
} 
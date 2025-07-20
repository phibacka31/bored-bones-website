import Image from 'next/image'; // Import the Image component

export default function LorePage() {
  return (
    <main>
      <h1 style={{ fontSize: '3.5em', fontWeight: 900, letterSpacing: '0.04em', textAlign: 'center', marginBottom: '1em' }}>Book of Lore</h1>
      {/* Add the Lore image here */}
      <div style={{ display: 'flex', justifyContent: 'center', margin: '2em 0' }}>
        <Image
          src="/images/LoreUpdate.png"
          alt="Lore Image"
          width={700}
          height={1100}
        />
      </div>
      {/* End of Lore Image */}
    </main>
  );
}
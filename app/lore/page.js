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
          width={350}
          height={550}
          className="lore-image-responsive"
        />
      </div>
      <style jsx>{`
        .lore-image-responsive {
          max-width: 350px;
          width: 100%;
          height: auto;
        }
        @media (max-width: 700px) {
          .lore-image-responsive {
            max-width: 180px;
            width: 90vw;
          }
        }
      `}</style>
      {/* End of Lore Image */}
    </main>
  );
}
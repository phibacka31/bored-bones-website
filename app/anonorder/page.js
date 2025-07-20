import AnonOrderMystery from '../components/AnonOrderMystery';

export default function AnonOrderPage() {
  return (
    <main style={{ minHeight: '100vh', width: '100vw', background: 'black', overflow: 'hidden', position: 'relative' }}>
      <AnonOrderMystery />
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -120px)',
        zIndex: 2,
        color: '#fff',
        fontSize: '1.2em',
        textAlign: 'center',
        fontStyle: 'italic',
        opacity: 0.7,
        pointerEvents: 'none',
        textShadow: '0 0 12px #000, 0 0 4px #fff2',
      }}>
        <span>Only the patient will see what is hidden.<br />The Void is always watching.</span>
      </div>
    </main>
  );
}
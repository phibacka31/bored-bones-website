import SkullMines from '../components/SkullMines';
import BoneTetris from '../components/BoneTetris';

export default function BoneArcadePage() {
  return (
    <main>
      <h1 style={{ fontSize: '3em', fontWeight: 900, letterSpacing: '0.04em', textAlign: 'center', marginBottom: '1em' }}>Bone Arcade</h1>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <SkullMines />
      </div>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <BoneTetris />
      </div>
    </main>
  );
}
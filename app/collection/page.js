'use client';
import { useState } from 'react';
import Image from 'next/image';
import sampleBones from './sampleBones';

const traitOptions = {
  Background: ['None', 'Fade', 'Apechain'],
  Bone: ['None', 'OG', 'Apecoin'],
  Clothing: ['None', 'Bone Hoodie', 'Chromie Squiggle'],
  Mouth: ['None', 'Gold Grin', 'Rainbow Grin'],
  Eyes: ['None', 'Zombie', '3D Glasses'],
  Headwear: ['None', 'Crown', 'TokenGator'],
  Accessories: ['None', 'Gold Chain', 'BTC Chain'],
};

export default function CollectionPage() {
  const [selectedBone, setSelectedBone] = useState(null);
  const [filters, setFilters] = useState({
    Background: 'None',
    Bone: 'None',
    Clothing: 'None',
    Mouth: 'None',
    Eyes: 'None',
    Headwear: 'None',
    Accessories: 'None',
  });

  // Filtering logic
  const filteredBones = sampleBones.filter(bone =>
    Object.entries(filters).every(([trait, value]) =>
      value === 'None' || bone.traits[trait] === value
    )
  );

  return (
    <main style={{ padding: '2em' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '1em', fontSize: '3.5em', fontWeight: 900, letterSpacing: '0.04em' }}>Bone Explorer</h1>
      {/* Filters UI as dropdowns */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1em', marginBottom: '1em', flexWrap: 'nowrap', maxWidth: 900, marginLeft: 'auto', marginRight: 'auto' }}>
        {['Background', 'Bone', 'Clothing', 'Mouth'].map(trait => (
          <div key={trait} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 120 }}>
            <label htmlFor={trait} style={{ color: '#fff', marginBottom: 4, fontSize: '0.97em' }}>{trait}</label>
            <select
              id={trait}
              value={filters[trait]}
              onChange={e => setFilters(f => ({ ...f, [trait]: e.target.value }))}
              style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid #444', background: '#222', color: '#fff', minWidth: 90 }}
            >
              {traitOptions[trait].map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1em', marginBottom: '2em', flexWrap: 'nowrap', maxWidth: 700, marginLeft: 'auto', marginRight: 'auto' }}>
        {['Eyes', 'Headwear', 'Accessories'].map(trait => (
          <div key={trait} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 120 }}>
            <label htmlFor={trait} style={{ color: '#fff', marginBottom: 4, fontSize: '0.97em' }}>{trait}</label>
            <select
              id={trait}
              value={filters[trait]}
              onChange={e => setFilters(f => ({ ...f, [trait]: e.target.value }))}
              style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid #444', background: '#222', color: '#fff', minWidth: 90 }}
            >
              {traitOptions[trait].map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        ))}
      </div>
      {/* Bone Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2em', maxWidth: 1000, margin: '0 auto' }}>
        {filteredBones.map(bone => (
          <div key={bone.id} style={{ background: '#181818', borderRadius: 12, boxShadow: '0 2px 8px #0008', padding: 16, textAlign: 'center', cursor: 'pointer', transition: 'transform 0.1s', }} onClick={() => setSelectedBone(bone)}>
            <Image src={bone.image} alt={bone.name} width={160} height={160} style={{ borderRadius: 8 }} />
          </div>
        ))}
      </div>
      {/* Modal for Bone Details */}
      {selectedBone && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setSelectedBone(null)}>
          <div style={{ background: '#222', borderRadius: 16, padding: 32, minWidth: 320, maxWidth: 400, boxShadow: '0 4px 24px #000a', position: 'relative' }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedBone(null)} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', color: '#fff', fontSize: 24, cursor: 'pointer' }}>&times;</button>
            <Image src={selectedBone.image} alt={selectedBone.name} width={200} height={200} style={{ borderRadius: 10, marginBottom: 16 }} />
            <h2 style={{ textAlign: 'center', margin: '0.5em 0' }}>{selectedBone.name}</h2>
            <div style={{ fontSize: '1em', color: '#ccc', marginBottom: 16 }}>
              {Object.entries(selectedBone.traits).map(([trait, value]) => (
                <div key={trait}><strong>{trait}:</strong> {value}</div>
              ))}
            </div>
            <div style={{ background: '#181818', borderRadius: 8, padding: 12, color: '#aaa', textAlign: 'center', fontStyle: 'italic' }}>
              Lore submission coming soon! Owners will be able to write and edit lore for each Bone after mint.
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
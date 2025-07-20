'use client';

import { useEffect, useRef, useState } from 'react';

const BackgroundMusic = () => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.1);

  useEffect(() => {
    audioRef.current = new Audio('/sounds/eerie-background.mp3');
    audioRef.current.loop = true;
    audioRef.current.volume = volume;
  }, []);

  const toggleMusic = () => {
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(e => console.log('Audio play failed:', e));
      setIsPlaying(true);
    }
  };

  const handleVolumeChange = (newVolume) => {
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      left: '20px', // Changed from 'right' to 'left'
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start', // Changed from 'flex-end' to 'flex-start'
      gap: '10px'
    }}>
      {/* Volume Slider */}
      <div style={{
        backgroundColor: 'rgba(0,0,0,0.8)',
        padding: '10px',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <span style={{ color: 'white', fontSize: '12px' }}>🔊</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
          style={{ width: '80px' }}
        />
        <span style={{ color: 'white', fontSize: '12px' }}>
          {Math.round(volume * 100)}%
        </span>
      </div>

      {/* Play/Pause Button */}
      <button
        onClick={toggleMusic}
        style={{
          padding: '10px 15px',
          backgroundColor: isPlaying ? '#4CAF50' : '#666',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '16px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
        }}
      >
        {isPlaying ? '⏸️ Pause' : '▶️ Play'}
      </button>
    </div>
  );
};

export default BackgroundMusic;
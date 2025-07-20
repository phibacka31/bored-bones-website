// components/SkeletonVoid.jsx
'use client';

import { useEffect, useRef } from 'react';

const SkeletonVoid = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const debris = [];
    const pixelSize = 3;
    const colors = ['#1a0a1a', '#2a0a2a', '#0a0a0a', '#3a0a3a', '#4a0a4a'];
    const boneShapes = [
      // Skull shape (simplified pixel art)
      [[1,1,1,1,1], [1,0,0,0,1], [1,0,1,0,1], [1,0,0,0,1], [1,1,1,1,1]],
      // Bone shape
      [[0,1,0], [1,1,1], [0,1,0]],
      // Small bone fragment
      [[1,1], [1,0]],
      // Single pixel
      [[1]]
    ];

    // Create skeleton debris
    for (let i = 0; i < 40; i++) {
      const shapeIndex = Math.floor(Math.random() * boneShapes.length);
      const shape = boneShapes[shapeIndex];
      
      debris.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        shape: shape,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedX: (Math.random() - 0.5) * 0.4,
        speedY: (Math.random() - 0.5) * 0.4,
        opacity: Math.random() * 0.7 + 0.3,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02
      });
    }

    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      debris.forEach(item => {
        ctx.save();
        ctx.translate(item.x, item.y);
        ctx.rotate(item.rotation);
        ctx.globalAlpha = item.opacity;
        
        // Draw pixelated bone shape
        item.shape.forEach((row, y) => {
          row.forEach((pixel, x) => {
            if (pixel) {
              ctx.fillStyle = item.color;
              ctx.fillRect(
                x * pixelSize,
                y * pixelSize,
                pixelSize,
                pixelSize
              );
            }
          });
        });

        ctx.restore();

        // Update position
        item.x += item.speedX;
        item.y += item.speedY;
        item.rotation += item.rotationSpeed;

        // Wrap around edges
        if (item.x < -50) item.x = canvas.width + 50;
        if (item.x > canvas.width + 50) item.x = -50;
        if (item.y < -50) item.y = canvas.height + 50;
        if (item.y > canvas.height + 50) item.y = -50;
      });

      ctx.globalAlpha = 1;
      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        pointerEvents: 'none',
        imageRendering: 'pixelated'
      }}
    />
  );
};

export default SkeletonVoid;
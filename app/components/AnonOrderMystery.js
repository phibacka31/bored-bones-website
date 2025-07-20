"use client";
import { useEffect, useRef } from "react";
import Image from 'next/image';

const TEXT = "Anon Order";
const FONT_SIZE = 128; // px (was 64)
const PIXEL_SIZE = 12; // px (was 6)
const DROP_SPEED = 2; // px per frame
const NUM_SKULLS = 7;

// Preload skull image
let skullImg = null;
if (typeof window !== 'undefined') {
  skullImg = new window.Image();
  skullImg.src = '/images/skull-icon.png';
}

export default function AnonOrderMystery() {
  const canvasRef = useRef();
  const skullsRef = useRef(
    Array.from({ length: NUM_SKULLS }).map(() => ({
      x: Math.random() * 900 + 100,
      // Randomly place skulls above, below, or near the text
      y: (() => {
        const h = typeof window !== 'undefined' ? window.innerHeight : 800;
        const band = Math.floor(Math.random() * 3);
        if (band === 0) return Math.random() * (h / 3 - 60) + 20; // top third
        if (band === 1) return Math.random() * (h / 3 - 60) + h / 3 + 60; // middle third (below text)
        return Math.random() * (h / 3 - 60) + (2 * h) / 3 + 60; // bottom third
      })(),
      speed: Math.random() * 0.25 + 0.05, // wider range for more variety
      dir: Math.random() > 0.5 ? 1 : -1,
      scale: Math.random() * 1.2 + 0.5, // scale between 0.5 and 1.7
      opacity: Math.random() * 0.3 + 0.5,
    }))
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // Draw background image
    const bg = new window.Image();
    bg.src = "/images/background.png";

    // Prepare pixel positions for text
    let textPixels = [];
    const offCanvas = document.createElement("canvas");
    offCanvas.width = width;
    offCanvas.height = height;
    const offCtx = offCanvas.getContext("2d");
    offCtx.clearRect(0, 0, width, height);
    offCtx.font = `bold ${FONT_SIZE}px 'Pixelify Sans', monospace`;
    offCtx.textAlign = "center";
    offCtx.textBaseline = "middle";
    offCtx.fillStyle = "#fff";
    offCtx.fillText(TEXT, width / 2, height / 2);
    const imgData = offCtx.getImageData(0, 0, width, height).data;
    for (let y = 0; y < height; y += PIXEL_SIZE) {
      for (let x = 0; x < width; x += PIXEL_SIZE) {
        const idx = (y * width + x) * 4;
        if (imgData[idx + 3] > 128) {
          textPixels.push({ x, y: Math.random() * -height, targetY: y });
        }
      }
    }

    // Animation loop
    let frame = 0;
    function animate() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      // Draw background
      ctx.clearRect(0, 0, width, height);
      if (bg.complete) {
        ctx.drawImage(bg, 0, 0, width, height);
      }
      // Animate falling pixels
      for (let p of textPixels) {
        if (p.y < p.targetY) {
          p.y = Math.min(p.y + DROP_SPEED, p.targetY);
        }
        ctx.fillStyle = '#fff';
        ctx.fillRect(p.x, p.y, PIXEL_SIZE, PIXEL_SIZE);
      }
      // Animate skulls
      skullsRef.current.forEach((s, i) => {
        s.x += s.speed * s.dir;
        if (s.x < -40) s.x = width + 40;
        if (s.x > width + 40) s.x = -40;
        // When a skull loops, randomize its y position again
        if (s.x < -40 || s.x > width + 40) {
          const band = Math.floor(Math.random() * 3);
          if (band === 0) s.y = Math.random() * (height / 3 - 60) + 20;
          else if (band === 1) s.y = Math.random() * (height / 3 - 60) + height / 3 + 60;
          else s.y = Math.random() * (height / 3 - 60) + (2 * height) / 3 + 60;
        }
        if (skullImg && skullImg.complete) {
          ctx.save();
          ctx.globalAlpha = s.opacity;
          ctx.drawImage(
            skullImg,
            s.x,
            s.y,
            38 * s.scale,
            38 * s.scale
          );
          ctx.restore();
        }
      });
      frame++;
      requestAnimationFrame(animate);
    }
    animate();
    // Resize handler
    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
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
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
        imageRendering: 'pixelated',
      }}
    />
  );
} 
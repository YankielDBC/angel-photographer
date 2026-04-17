'use client';

import { useEffect, useRef } from 'react';

interface CanvasBackgroundProps {
  className?: string;
}

export function CanvasBackground({ className }: CanvasBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const draw = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#f5f5f5');
      gradient.addColorStop(1, '#e0e0e0');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = 'rgba(201, 169, 98, 0.3)';
      for(let i = 0; i < 50; i++) {
        const x = (Math.sin(i * 123.456) * 0.5 + 0.5) * canvas.width;
        const y = (Math.cos(i * 789.012) * 0.5 + 0.5) * canvas.height;
        const size = (Math.sin(i * 345.678) * 0.5 + 0.5) * 2 + 1;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    draw();
    
    const handleResize = () => draw();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className={className}
      style={{ position: 'fixed', top: 0, left: 0, zIndex: 0 }}
    />
  );
}
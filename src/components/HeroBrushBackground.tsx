import React, { useRef, useEffect } from 'react';
import { useColorMood } from '../context/ColorMoodContext';

export const HeroBrushBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { currentMood } = useColorMood();
  const mousePos = useRef({ x: 0.5, y: 0.5 });
  const targetPos = useRef({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight * 0.9);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight * 0.9;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      targetPos.current = {
        x: Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)),
        y: Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height)),
      };
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    // Color conversion helper
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
          }
        : { r: 0, g: 89, b: 255 };
    };

    let step = 0;
    const render = () => {
      step += 0.008;
      // Smooth lerp mouse position
      mousePos.current.x += (targetPos.current.x - mousePos.current.x) * 0.05;
      mousePos.current.y += (targetPos.current.y - mousePos.current.y) * 0.05;

      ctx.clearRect(0, 0, width, height);

      const rgb = hexToRgb(currentMood.color);
      const mx = mousePos.current.x * width;
      const my = mousePos.current.y * height;

      // Layer 1: Ambient soft radial glow responding to mouse
      const gradient = ctx.createRadialGradient(
        mx,
        my,
        50,
        width * 0.5,
        height * 0.4,
        Math.max(width, height) * 0.7
      );
      gradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.16)`);
      gradient.addColorStop(0.4, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.06)`);
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Layer 2: Architectural brush stroke wave curves (inspired by wet paint roll & bristle fan)
      const numLines = 3;
      for (let i = 0; i < numLines; i++) {
        ctx.beginPath();
        const yOffset = height * (0.35 + i * 0.18) + Math.sin(step + i) * 20;
        ctx.moveTo(0, yOffset);

        for (let x = 0; x < width; x += 40) {
          const wave =
            Math.sin(x * 0.003 + step * (1 + i * 0.3)) * 35 +
            Math.cos(x * 0.0015 - step * 0.5) * 20 +
            (1 - Math.abs(x - mx) / width) * 25 * (mousePos.current.y - 0.5);
          ctx.lineTo(x, yOffset + wave);
        }

        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();

        const strokeGrad = ctx.createLinearGradient(0, 0, width, height);
        const alpha = 0.035 + i * 0.02;
        strokeGrad.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`);
        strokeGrad.addColorStop(1, `rgba(255, 255, 255, 0)`);

        ctx.fillStyle = strokeGrad;
        ctx.fill();
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [currentMood.color]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10 select-none">
      <canvas
        ref={canvasRef}
        className="w-full h-full opacity-90 transition-opacity duration-700"
      />
      {/* Delicate architectural grain / noise grid */}
      <div className="absolute inset-0 opacity-[0.025] bg-[radial-gradient(#0f172a_1px,transparent_1px)] [background-size:28px_28px]" />
    </div>
  );
};

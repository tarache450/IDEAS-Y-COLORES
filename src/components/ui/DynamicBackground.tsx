import React, { useMemo } from 'react';
import { useColorMood } from '../../context/ColorMoodContext';

interface DynamicBackgroundProps {
  className?: string;
}

export const DynamicBackground: React.FC<DynamicBackgroundProps> = ({ className = '' }) => {
  const { currentMood, activeMood } = useColorMood();

  // Floating particles with deterministic coordinates for smooth SSR/CSR consistency
  const particles = useMemo(
    () => [
      { id: 1, left: '12%', top: '25%', size: 10, delay: '0s', duration: '14s' },
      { id: 2, left: '28%', top: '70%', size: 14, delay: '2.5s', duration: '18s' },
      { id: 3, left: '45%', top: '40%', size: 8, delay: '5s', duration: '12s' },
      { id: 4, left: '62%', top: '85%', size: 12, delay: '1s', duration: '16s' },
      { id: 5, left: '78%', top: '20%', size: 16, delay: '3.8s', duration: '20s' },
      { id: 6, left: '88%', top: '60%', size: 9, delay: '6.2s', duration: '15s' },
    ],
    []
  );

  return (
    <div
      className={`fixed inset-0 -z-50 pointer-events-none w-screen h-screen overflow-hidden dynamic-bg-canvas ${className}`}
      aria-hidden="true"
    >
      {/* 1. Base Multi-tone Architectural Base Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50/90 via-sky-50/40 to-amber-50/30 transition-colors duration-700" />

      {/* 2. Architectural Blueprint / Dot Grid with Gentle Infinite Drift */}
      <div className="absolute inset-0 dynamic-bg-grid opacity-35" />

      {/* 3. Primary Mood-Reactive Orb (Dominant brand tone) */}
      <div
        className="absolute dynamic-blob dynamic-blob-1"
        style={{
          background: `radial-gradient(circle at 35% 35%, ${currentMood.color} 0%, ${currentMood.hoverColor} 45%, transparent 72%)`,
        }}
      />

      {/* 4. Secondary Warm Accent Orb (Coral / Orange energy of Ideas & Colores) */}
      <div
        className="absolute dynamic-blob dynamic-blob-2"
        style={{
          background: `radial-gradient(circle at 40% 40%, #FF5738 0%, #FA8C16 48%, transparent 72%)`,
        }}
      />

      {/* 5. Golden Solar / Radiance Orb (Luminosity & optimism) */}
      <div
        className="absolute dynamic-blob dynamic-blob-3"
        style={{
          background: `radial-gradient(circle at 50% 50%, #FAB82A 0%, #F59E0B 45%, transparent 70%)`,
        }}
      />

      {/* 6. Cyan / Sky Freshness Orb (Clean finishes & airiness) */}
      <div
        className="absolute dynamic-blob dynamic-blob-4"
        style={{
          background: `radial-gradient(circle at 30% 60%, #00A3FF 0%, #0284C7 50%, transparent 72%)`,
        }}
      />

      {/* 7. Deep Indigo / Royal Depth Orb (Grounds contrast & luxury feel) */}
      <div
        className="absolute dynamic-blob dynamic-blob-5"
        style={{
          background: `radial-gradient(circle at 50% 50%, #3B82F6 0%, #1E3A8A 55%, transparent 70%)`,
        }}
      />

      {/* 8. Diagonal Silky Light Sweep for Architectural Sheen */}
      <div className="absolute dynamic-light-beam" />

      {/* 9. Floating Ambient Luminescent Color Specks */}
      <div className="absolute inset-0 overflow-hidden">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full dynamic-particle"
            style={{
              left: p.left,
              top: p.top,
              width: `${p.size}px`,
              height: `${p.size}px`,
              animationDelay: p.delay,
              animationDuration: p.duration,
              backgroundColor:
                p.id % 2 === 0
                  ? currentMood.color
                  : p.id % 3 === 0
                  ? '#FF5738'
                  : '#FAB82A',
            }}
          />
        ))}
      </div>

      {/* 10. Top Soft Blur Vignette to keep content super readable */}
      <div className="absolute inset-0 backdrop-blur-[45px] bg-white/20" />
    </div>
  );
};

export default DynamicBackground;

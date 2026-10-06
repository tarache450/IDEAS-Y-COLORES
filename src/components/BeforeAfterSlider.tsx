import React, { useState, useRef, useCallback } from 'react';
import { ArrowLeftRight } from 'lucide-react';

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  title: string;
  className?: string;
  showQuickButtons?: boolean;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  beforeImage,
  afterImage,
  title,
  className = '',
  showQuickButtons = true,
}) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const position = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(Math.round(position));
  }, []);

  const handleTouchMove = (e: React.TouchEvent) => {
    updatePosition(e.touches[0].clientX);
  };

  const handleMouseDown = () => {
    isDragging.current = true;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    updatePosition(e.clientX);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setSliderPosition((prev) => Math.max(0, prev - 5));
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      setSliderPosition((prev) => Math.min(100, prev + 5));
    } else if (e.key === 'Home') {
      e.preventDefault();
      setSliderPosition(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setSliderPosition(100);
    }
  };

  React.useEffect(() => {
    const handleGlobalMouseUp = () => {
      isDragging.current = false;
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  return (
    <div className="space-y-3">
      <div
        ref={containerRef}
        tabIndex={0}
        role="slider"
        aria-label={`Comparador antes y después para ${title}`}
        aria-valuenow={sliderPosition}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuetext={`${sliderPosition}% antes, ${100 - sliderPosition}% después`}
        onKeyDown={handleKeyDown}
        className={`relative select-none overflow-hidden rounded-3xl bg-slate-900 aspect-[16/10] cursor-ew-resize touch-pan-y focus:outline-none focus:ring-4 focus:ring-amber-400/40 transition-shadow ${className}`}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={(e) => updatePosition(e.touches[0].clientX)}
        onTouchMove={handleTouchMove}
        style={{ touchAction: 'pan-y' }}
      >
        {/* After image (Background full) */}
        <img
          src={afterImage}
          alt={`Resultado final después - ${title}`}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          loading="lazy"
        />

        {/* Before image (Clipped cleanly with clip-path, perfectly 1:1 aligned without stretching) */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
        >
          <img
            src={beforeImage}
            alt={`Estado previo antes - ${title}`}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            loading="lazy"
          />
        </div>

        {/* Divider line and draggable pill */}
        <div
          className="absolute top-0 bottom-0 w-[2px] bg-white shadow-[0_0_16px_rgba(0,0,0,0.8)] pointer-events-none"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white shadow-2xl border-2 border-slate-900 flex items-center justify-center text-slate-950 transition-transform active:scale-95">
            <ArrowLeftRight className="w-4 h-4 stroke-[2.5]" />
          </div>
        </div>

        {/* Labels: ANTES vs DESPUÉS */}
        <span className="absolute top-3.5 left-3.5 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-white text-[11px] font-black uppercase tracking-wider shadow-sm border border-white/20">
          Antes
        </span>
        <span className="absolute top-3.5 right-3.5 px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-[11px] font-black uppercase tracking-wider shadow-md">
          Después
        </span>

        {/* Hint overlay on bottom */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-slate-950/70 backdrop-blur-md text-white/95 text-[10px] font-semibold pointer-events-none hidden sm:inline-flex items-center gap-1.5 border border-white/10">
          <ArrowLeftRight className="w-3 h-3" />
          <span>Arrastra o usa las flechas del teclado</span>
        </div>
      </div>

      {/* Quick Toggle Buttons */}
      {showQuickButtons && (
        <div className="flex items-center justify-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => setSliderPosition(100)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              sliderPosition >= 98
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            Ver Solo Antes
          </button>
          <button
            type="button"
            onClick={() => setSliderPosition(50)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              sliderPosition > 35 && sliderPosition < 65
                ? 'bg-amber-400 text-slate-950 shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            50 / 50
          </button>
          <button
            type="button"
            onClick={() => setSliderPosition(0)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              sliderPosition <= 2
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            Ver Solo Después
          </button>
        </div>
      )}
    </div>
  );
};

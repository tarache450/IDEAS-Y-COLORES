import React, { useState, useRef, useCallback } from 'react';
import { ArrowLeftRight, Eye } from 'lucide-react';

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
    setSliderPosition(position);
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

  return (
    <div className="space-y-2">
      <div
        ref={containerRef}
        className={`relative select-none overflow-hidden rounded-2xl sm:rounded-3xl bg-slate-900 aspect-[16/10] cursor-ew-resize touch-pan-y ${className}`}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchMove={handleTouchMove}
        style={{ touchAction: 'pan-y' }}
        role="region"
        aria-label={`Comparador antes y después para ${title}`}
      >
        {/* After image (Background full) */}
        <img
          src={afterImage}
          alt={`Resultado final después - ${title}`}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          loading="lazy"
        />

        {/* Before image (Clipped to slider position) */}
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none transition-all duration-75"
          style={{ width: `${sliderPosition}%` }}
        >
          <img
            src={beforeImage}
            alt={`Estado previo antes - ${title}`}
            className="absolute inset-0 w-full h-full object-cover max-w-none pointer-events-none"
            style={{
              width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100%',
              minWidth: '100%',
            }}
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/10" />
        </div>

        {/* Divider line and draggable pill */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_12px_rgba(0,0,0,0.7)] pointer-events-none"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-white shadow-2xl border-2 border-slate-900 flex items-center justify-center text-slate-900 transition-transform active:scale-95">
            <ArrowLeftRight className="w-4 h-4 stroke-[2.5]" />
          </div>
        </div>

        {/* Badges */}
        <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md text-white text-[11px] font-bold uppercase tracking-wider shadow-sm">
          Antes
        </span>
        <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-[11px] font-black uppercase tracking-wider shadow-md">
          Después
        </span>

        {/* Hint overlay on bottom */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-slate-950/60 backdrop-blur-md text-white/90 text-[10px] font-medium pointer-events-none hidden sm:inline-flex items-center gap-1.5">
          <ArrowLeftRight className="w-3 h-3" />
          <span>Arrastra el divisor para comparar</span>
        </div>
      </div>

      {/* Quick Toggle Buttons (Requested: "Permitir arrastrar el divisor o alternar con botón") */}
      {showQuickButtons && (
        <div className="flex items-center justify-center gap-1.5 pt-1">
          <button
            type="button"
            onClick={() => setSliderPosition(100)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
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
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              sliderPosition > 35 && sliderPosition < 65
                ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            50 / 50
          </button>
          <button
            type="button"
            onClick={() => setSliderPosition(0)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
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

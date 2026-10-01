import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Eye, EyeOff, Sparkles } from 'lucide-react';
import { ColorSwatch, PaintFinish, LightingMode } from '../../types';

export interface ColorVisualizerProps {
  image: string;
  mask: string;
  foregroundImage?: string;
  roomName: string;
  selectedColor: ColorSwatch;
  finish: PaintFinish;
  lighting: LightingMode;
  showOriginal?: boolean;
  onToggleOriginal?: () => void;
  className?: string;
}

export const ColorVisualizer: React.FC<ColorVisualizerProps> = ({
  image,
  mask,
  foregroundImage,
  roomName,
  selectedColor,
  finish,
  lighting,
  showOriginal = false,
  onToggleOriginal,
  className = '',
}) => {
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const [isPressingOriginal, setIsPressingOriginal] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Preload base image, mask, and foreground
  useEffect(() => {
    setImageLoaded(false);
    const img = new Image();
    img.src = image;
    img.onload = () => setImageLoaded(true);

    const maskImg = new Image();
    maskImg.src = mask;

    if (foregroundImage) {
      const fgImg = new Image();
      fgImg.src = foregroundImage;
    }
  }, [image, mask, foregroundImage]);

  // Lighting overlay styles
  const getLightingStyle = useCallback(() => {
    switch (lighting) {
      case 'atardecer':
        return {
          filter: 'sepia(18%) saturate(118%) brightness(96%) contrast(102%)',
          backgroundColor: 'rgba(245, 158, 11, 0.10)',
        };
      case 'calida':
        return {
          filter: 'sepia(12%) saturate(108%) brightness(101%)',
          backgroundColor: 'rgba(251, 191, 36, 0.07)',
        };
      case 'dia':
      default:
        return {
          filter: 'brightness(100%) contrast(100%)',
          backgroundColor: 'transparent',
        };
    }
  }, [lighting]);

  // Finish sheen effects (contrast, specular reflection)
  const getFinishEffects = useCallback(() => {
    switch (finish) {
      case 'mate':
        return {
          filter: 'brightness(0.99) contrast(0.98)',
          sheenOpacity: 0,
        };
      case 'semibrillante':
        return {
          filter: 'brightness(1.03) contrast(1.05)',
          sheenOpacity: 0.16,
        };
      case 'satinado':
      default:
        return {
          filter: 'brightness(1.01) contrast(1.02)',
          sheenOpacity: 0.07,
        };
    }
  }, [finish]);

  // Light Reflectance Value calculations for layer blending
  const lrv = selectedColor.lrv ?? 50;
  // Multiply layer strength: lower LRV needs deeper pigment multiply, higher LRV needs softer multiply
  const multiplyOpacity = Math.max(0.18, Math.min(0.78, ((100 - lrv) / 100) * 0.82));
  // Soft-light glow for high-LRV whites/pastels so they feel radiant and clean
  const highlightOpacity = lrv > 60 ? ((lrv - 60) / 40) * 0.32 : 0;
  const finishEffects = getFinishEffects();

  const isOriginalActive = showOriginal || isPressingOriginal;

  return (
    <div
      ref={containerRef}
      role="region"
      aria-label={`Visualizador interactivo de color para ${roomName}`}
      className={`relative rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl select-none group aspect-[16/9] ${className}`}
    >
      {/* LAYER 1: Base Architectural Photograph */}
      <img
        src={image}
        alt={`Simulación de color en espacio arquitectónico ${roomName} - Ideas & Colores Guatemala`}
        loading="lazy"
        decoding="async"
        className={`w-full h-full object-cover select-none pointer-events-none transition-opacity duration-300 ${
          imageLoaded ? 'opacity-100' : 'opacity-40'
        }`}
      />

      {/* LAYER 2: Masked Paint Layer (Hidden when comparing to original) */}
      <div
        className={`absolute inset-0 pointer-events-none transition-opacity duration-200 ${
          isOriginalActive ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <div
          className="absolute inset-0"
          style={{
            WebkitMaskImage: `url("${mask}")`,
            maskImage: `url("${mask}")`,
            WebkitMaskSize: 'cover',
            maskSize: 'cover',
            WebkitMaskPosition: 'center',
            maskPosition: 'center',
            WebkitMaskRepeat: 'no-repeat',
            maskRepeat: 'no-repeat',
            ...finishEffects,
          }}
        >
          {/* Sublayer A: Color Hue & Saturation (preserves underlying plaster texture & luminance) */}
          <div
            className="absolute inset-0 transition-colors duration-250"
            style={{
              backgroundColor: selectedColor.hex,
              mixBlendMode: 'color',
              opacity: 0.96,
            }}
          />

          {/* Sublayer B: Multiply for Pigment Depth & Realistic Shadow Occlusion */}
          <div
            className="absolute inset-0 transition-colors duration-250"
            style={{
              backgroundColor: selectedColor.hex,
              mixBlendMode: 'multiply',
              opacity: multiplyOpacity,
            }}
          />

          {/* Sublayer C: LRV Highlight Compensation for Architectural Whites & Pastels */}
          {highlightOpacity > 0 && (
            <div
              className="absolute inset-0 transition-opacity duration-250"
              style={{
                backgroundColor: '#ffffff',
                mixBlendMode: 'soft-light',
                opacity: highlightOpacity,
              }}
            />
          )}

          {/* Sublayer D: Specular Sheen for Satin / Semi-Gloss finishes */}
          {finishEffects.sheenOpacity > 0 && (
            <div
              className="absolute inset-0 transition-opacity duration-250"
              style={{
                background:
                  'linear-gradient(135deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0) 45%, rgba(255,255,255,0.08) 100%)',
                mixBlendMode: 'overlay',
                opacity: finishEffects.sheenOpacity,
              }}
            />
          )}
        </div>
      </div>

      {/* LAYER 3: Pristine Foreground Cutout (Furniture, Vase, Floor, Window View) */}
      {foregroundImage && (
        <img
          src={foregroundImage}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none z-10"
        />
      )}

      {/* Dynamic Environmental Lighting Overlay */}
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-300 z-15"
        style={getLightingStyle()}
      />

      {/* Top Floating Controls */}
      <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between gap-2 pointer-events-auto z-20">
        {/* Room badge with active tone dot */}
        <div className="px-3.5 py-1.5 rounded-full bg-slate-950/85 backdrop-blur-md text-xs font-bold text-white border border-white/10 flex items-center gap-2 shadow-md">
          <span
            className="w-2.5 h-2.5 rounded-full ring-1 ring-white/30 shrink-0 transition-colors duration-300"
            style={{ backgroundColor: selectedColor.hex }}
          />
          <span className="truncate">{roomName}</span>
          <span className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider hidden sm:inline">
            • {selectedColor.code}
          </span>
        </div>

        {/* Hold or click to view original button */}
        <button
          type="button"
          onMouseDown={() => setIsPressingOriginal(true)}
          onMouseUp={() => setIsPressingOriginal(false)}
          onMouseLeave={() => setIsPressingOriginal(false)}
          onTouchStart={() => setIsPressingOriginal(true)}
          onTouchEnd={() => setIsPressingOriginal(false)}
          onClick={onToggleOriginal}
          className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-bold backdrop-blur-md border transition-all flex items-center gap-1.5 shadow-md cursor-pointer select-none ${
            isOriginalActive
              ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-amber-400/20'
              : 'bg-slate-950/85 text-slate-200 hover:text-white border-white/10 hover:bg-slate-900/90'
          }`}
          title="Mantén presionado o haz clic para ver la pared original sin pintar"
          aria-pressed={isOriginalActive}
        >
          {isOriginalActive ? (
            <>
              <EyeOff className="w-3.5 h-3.5" />
              <span>Pared Original</span>
            </>
          ) : (
            <>
              <Eye className="w-3.5 h-3.5" />
              <span>Ver Original</span>
            </>
          )}
        </button>
      </div>

      {/* Bottom Status Pill */}
      <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between text-[11px] font-semibold text-white/85 pointer-events-none z-20">
        <div className="bg-slate-950/75 backdrop-blur-md px-3 py-1 rounded-xl border border-white/10 flex items-center gap-2 shadow-md">
          <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">
            {isOriginalActive ? 'Modo:' : 'Tono aplicado:'}
          </span>
          <span className="font-bold text-white">
            {isOriginalActive ? 'Original de referencia' : `${selectedColor.name} (${selectedColor.code})`}
          </span>
        </div>

        <span className="bg-slate-950/75 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/10 text-[10px] text-slate-300 hidden sm:inline">
          {isOriginalActive ? 'Suelta para volver al color' : 'Mantén "Ver Original" para comparar'}
        </span>
      </div>
    </div>
  );
};

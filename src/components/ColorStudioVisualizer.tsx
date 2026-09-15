import React, { useState } from 'react';
import {
  Palette,
  Sun,
  Sunset,
  Lightbulb,
  Sparkles,
  Copy,
  Check,
  ArrowRight,
  MessageCircle,
  Sliders,
  Layers,
  Info,
  Maximize2,
  RefreshCw,
} from 'lucide-react';
import { COLOR_COLLECTIONS, ROOM_SCENES } from '../data/colorsData';
import { ColorSwatch, PaintFinish, LightingMode, RoomScene } from '../types';
import { BUSINESS_INFO } from '../data/content';

interface ColorStudioVisualizerProps {
  onSelectColorForQuote: (colorName: string, colorCode: string, finish: string, roomName: string) => void;
}

export const ColorStudioVisualizer: React.FC<ColorStudioVisualizerProps> = ({
  onSelectColorForQuote,
}) => {
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>('tendencias');
  const [selectedSwatch, setSelectedSwatch] = useState<ColorSwatch>(
    COLOR_COLLECTIONS[0].swatches[0]
  );
  const [selectedRoom, setSelectedRoom] = useState<RoomScene>(ROOM_SCENES[0]);
  const [finish, setFinish] = useState<PaintFinish>('satinado');
  const [lighting, setLighting] = useState<LightingMode>('dia');
  const [copied, setCopied] = useState(false);
  const [compareColor, setCompareColor] = useState<ColorSwatch | null>(null);
  const [isComparing, setIsComparing] = useState(false);

  const activeCollection =
    COLOR_COLLECTIONS.find((c) => c.id === selectedCollectionId) || COLOR_COLLECTIONS[0];

  const handleCopyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleQuoteClick = () => {
    onSelectColorForQuote(
      selectedSwatch.name,
      selectedSwatch.code,
      finish,
      selectedRoom.name
    );
  };

  // Lighting overlay filter effects
  const getLightingStyle = () => {
    switch (lighting) {
      case 'atardecer':
        return {
          backgroundColor: 'rgba(245, 158, 11, 0.12)',
          filter: 'sepia(15%) saturate(120%) brightness(98%)',
        };
      case 'calida':
        return {
          backgroundColor: 'rgba(251, 191, 36, 0.08)',
          filter: 'sepia(10%) brightness(102%)',
        };
      case 'dia':
      default:
        return {
          backgroundColor: 'transparent',
          filter: 'brightness(100%)',
        };
    }
  };

  // Specular sheen based on finish
  const getFinishSheen = () => {
    switch (finish) {
      case 'mate':
        return 'opacity-90 mix-blend-multiply';
      case 'semibrillante':
        return 'opacity-80 mix-blend-color-burn';
      case 'satinado':
      default:
        return 'opacity-85 mix-blend-multiply';
    }
  };

  return (
    <section
      id="estudio-color"
      className="py-20 bg-slate-900 text-white relative overflow-hidden border-b border-slate-800"
    >
      {/* 21st.dev Ambient chromatic background glow */}
      <div
        className="absolute top-1/4 -left-48 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-700"
        style={{ backgroundColor: selectedSwatch.hex }}
      />
      <div
        className="absolute bottom-1/4 -right-48 w-96 h-96 rounded-full blur-3xl opacity-15 pointer-events-none transition-colors duration-700"
        style={{ backgroundColor: selectedSwatch.hex }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/90 border border-slate-700 text-amber-400 text-xs font-bold uppercase tracking-wider mb-3">
              <Palette className="w-3.5 h-3.5" />
              <span>Estudio Interactivo de Color</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-display text-white">
              Visualiza el color en tu espacio real.
            </h2>
            <p className="mt-2 text-base sm:text-lg text-slate-300 max-w-2xl">
              Prueba tonos arquitectónicos en tiempo real con luz de día, atardecer y acabados
              profesionales antes de abrir el primer galón.
            </p>
          </div>

          {/* Quick Stats or Status Pill */}
          <div className="flex items-center gap-3 bg-slate-800/80 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-700/80">
            <span
              className="w-4 h-4 rounded-full border border-white/40 shadow-sm transition-colors duration-300"
              style={{ backgroundColor: selectedSwatch.hex }}
            />
            <div className="text-xs">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">
                Tono Activo
              </span>
              <span className="font-bold text-white">
                {selectedSwatch.code} • {selectedSwatch.name}
              </span>
            </div>
          </div>
        </div>

        {/* Main Visualizer Stage & Controls Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Interactive Room Simulator (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Room Canvas Stage */}
            <div className="relative rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl aspect-[16/10] sm:aspect-[16/10] group">
              {/* Base realistic room architectural image */}
              <img
                src={selectedRoom.image}
                alt={selectedRoom.name}
                className="w-full h-full object-cover select-none transition-transform duration-700"
              />

              {/* Tinted Wall Layer with Blend Mode Simulator */}
              {!isComparing ? (
                <div
                  className={`absolute inset-0 transition-colors duration-500 pointer-events-none ${getFinishSheen()}`}
                  style={{
                    backgroundColor: selectedSwatch.hex,
                    maskImage:
                      'radial-gradient(ellipse 90% 70% at 50% 40%, black 40%, rgba(0,0,0,0.7) 75%, transparent 100%)',
                    WebkitMaskImage:
                      'radial-gradient(ellipse 90% 70% at 50% 40%, black 40%, rgba(0,0,0,0.7) 75%, transparent 100%)',
                  }}
                />
              ) : (
                /* Split Comparison View (21st.dev style side-by-side color test) */
                <>
                  <div
                    className={`absolute inset-y-0 left-0 w-1/2 transition-colors duration-500 pointer-events-none ${getFinishSheen()}`}
                    style={{
                      backgroundColor: selectedSwatch.hex,
                      maskImage:
                        'radial-gradient(ellipse 80% 60% at 40% 40%, black 40%, rgba(0,0,0,0.7) 70%, transparent 100%)',
                      WebkitMaskImage:
                        'radial-gradient(ellipse 80% 60% at 40% 40%, black 40%, rgba(0,0,0,0.7) 70%, transparent 100%)',
                    }}
                  />
                  <div
                    className={`absolute inset-y-0 right-0 w-1/2 transition-colors duration-500 pointer-events-none ${getFinishSheen()}`}
                    style={{
                      backgroundColor: compareColor?.hex || '#2F3D4C',
                      maskImage:
                        'radial-gradient(ellipse 80% 60% at 60% 40%, black 40%, rgba(0,0,0,0.7) 70%, transparent 100%)',
                      WebkitMaskImage:
                        'radial-gradient(ellipse 80% 60% at 60% 40%, black 40%, rgba(0,0,0,0.7) 70%, transparent 100%)',
                    }}
                  />
                  {/* Divider line */}
                  <div className="absolute inset-y-0 left-1/2 w-0.5 bg-white/70 shadow-lg pointer-events-none">
                    <span className="absolute top-4 -translate-x-1/2 px-2 py-0.5 rounded-full bg-slate-900/90 text-white text-[10px] font-bold">
                      VS
                    </span>
                  </div>
                </>
              )}

              {/* Dynamic lighting environment filter */}
              <div
                className="absolute inset-0 pointer-events-none transition-all duration-500"
                style={getLightingStyle()}
              />

              {/* Top floating controls inside simulator */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2 pointer-events-auto">
                {/* Scene selector badge */}
                <span className="px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md text-xs font-bold text-white border border-white/10 flex items-center gap-1.5 shadow-sm">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: selectedSwatch.hex }}
                  />
                  <span>{selectedRoom.name}</span>
                </span>

                {/* Lighting simulation buttons */}
                <div className="flex items-center gap-1 bg-slate-900/85 backdrop-blur-md p-1 rounded-xl border border-white/10 shadow-sm">
                  <button
                    type="button"
                    onClick={() => setLighting('dia')}
                    title="Luz natural de día (5000K)"
                    className={`p-1.5 rounded-lg text-xs transition-colors ${
                      lighting === 'dia'
                        ? 'bg-amber-400 text-slate-950 font-bold'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <Sun className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setLighting('atardecer')}
                    title="Luz de atardecer dorado (2700K)"
                    className={`p-1.5 rounded-lg text-xs transition-colors ${
                      lighting === 'atardecer'
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <Sunset className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setLighting('calida')}
                    title="Luz interior cálida de noche (3000K)"
                    className={`p-1.5 rounded-lg text-xs transition-colors ${
                      lighting === 'calida'
                        ? 'bg-amber-300 text-slate-950 font-bold'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <Lightbulb className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Bottom information pill overlay inside simulator */}
              <div className="absolute bottom-4 left-4 right-4 p-3.5 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div
                    className="w-7 h-7 rounded-xl border-2 border-white/50 shadow-xs shrink-0"
                    style={{ backgroundColor: selectedSwatch.hex }}
                  />
                  <div>
                    <span className="font-black text-white text-sm">
                      {selectedSwatch.code} {selectedSwatch.name}
                    </span>
                    <span className="text-slate-400 block text-[11px]">
                      Acabado {finish.toUpperCase()} • LRV {selectedSwatch.lrv}% • Respaldo Sherwin-Williams
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopyHex(selectedSwatch.hex)}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                        <span>{selectedSwatch.hex}</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleQuoteClick}
                    className="px-3.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-extrabold flex items-center gap-1 transition-all shadow-sm"
                  >
                    <span>Cotizar este tono</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Room Selector Carousel */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider shrink-0 mr-1">
                Ambiente:
              </span>
              {ROOM_SCENES.map((room) => {
                const isSelected = selectedRoom.id === room.id;
                return (
                  <button
                    key={room.id}
                    type="button"
                    onClick={() => setSelectedRoom(room)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
                      isSelected
                        ? 'bg-white text-slate-950 shadow-md ring-2 ring-amber-400'
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 border border-slate-700/60'
                    }`}
                  >
                    <span>{room.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Finish & Lighting Selector Bar */}
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/70 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Acabado de pintura:
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['mate', 'satinado', 'semibrillante'] as PaintFinish[]).map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFinish(f)}
                      className={`py-2 px-2 text-center rounded-xl text-xs font-bold capitalize transition-all ${
                        finish === f
                          ? 'bg-amber-400 text-slate-950 shadow-xs'
                          : 'bg-slate-900/80 text-slate-300 hover:bg-slate-700 border border-slate-700'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Simulación de luz:
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'dia', label: 'Día' },
                    { id: 'atardecer', label: 'Atardecer' },
                    { id: 'calida', label: 'Cálida' },
                  ].map((l) => (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => setLighting(l.id as LightingMode)}
                      className={`py-2 px-2 text-center rounded-xl text-xs font-bold transition-all ${
                        lighting === l.id
                          ? 'bg-white text-slate-950 shadow-xs'
                          : 'bg-slate-900/80 text-slate-300 hover:bg-slate-700 border border-slate-700'
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Color Collection Swatches & Detailed Spec Card (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            {/* Palette Collection Selector Tabs */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Colecciones de Color Arquitectónico
              </label>
              <div className="flex flex-wrap gap-2">
                {COLOR_COLLECTIONS.map((col) => {
                  const isActive = selectedCollectionId === col.id;
                  return (
                    <button
                      key={col.id}
                      type="button"
                      onClick={() => {
                        setSelectedCollectionId(col.id);
                        setSelectedSwatch(col.swatches[0]);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-amber-400 text-slate-950 shadow-sm'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700/80'
                      }`}
                    >
                      {col.name}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-slate-400 italic">
                {activeCollection.description}
              </p>
            </div>

            {/* Swatches Grid */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Selecciona un tono para pintar en vivo:
              </label>
              <div className="grid grid-cols-5 gap-2.5">
                {activeCollection.swatches.map((swatch) => {
                  const isCurrent = selectedSwatch.id === swatch.id;
                  return (
                    <button
                      key={swatch.id}
                      type="button"
                      onClick={() => setSelectedSwatch(swatch)}
                      className={`group relative rounded-2xl p-1.5 transition-all duration-200 text-left flex flex-col items-center ${
                        isCurrent
                          ? 'bg-slate-800 ring-2 ring-amber-400 scale-105 shadow-lg'
                          : 'bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800'
                      }`}
                      title={`${swatch.code} ${swatch.name}`}
                    >
                      {/* Swatch circle */}
                      <div
                        className="w-full aspect-square rounded-xl border border-white/20 shadow-inner group-hover:scale-105 transition-transform"
                        style={{ backgroundColor: swatch.hex }}
                      />
                      <span className="text-[10px] font-bold text-slate-300 mt-1 truncate w-full text-center">
                        {swatch.code.replace('SW ', '')}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Color Architectural Detail Card (21st.dev style spec sheet) */}
            <div className="rounded-2xl bg-slate-800/90 border border-slate-700/80 p-5 space-y-4 shadow-xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full">
                    Tono Oficial {selectedSwatch.code}
                  </span>
                  <h3 className="text-2xl font-bold font-display text-white mt-1">
                    {selectedSwatch.name}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {selectedSwatch.description}
                  </p>
                </div>

                <div
                  className="w-16 h-16 rounded-2xl border-2 border-white/30 shadow-lg shrink-0"
                  style={{ backgroundColor: selectedSwatch.hex }}
                />
              </div>

              {/* Color Technical Properties */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-700/60 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">
                    Recomendado para
                  </span>
                  <span className="text-slate-200 font-medium">
                    {selectedSwatch.bestFor}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">
                    Índice de Reflexión (LRV)
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex-1 bg-slate-700 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-amber-400 h-full rounded-full"
                        style={{ width: `${selectedSwatch.lrv}%` }}
                      />
                    </div>
                    <span className="text-slate-200 font-bold">{selectedSwatch.lrv}%</span>
                  </div>
                </div>
              </div>

              {/* Complementary Colors Palette */}
              <div className="pt-2 border-t border-slate-700/60">
                <span className="text-slate-400 block text-[10px] uppercase font-bold mb-2">
                  Colores armónicos complementarios
                </span>
                <div className="flex items-center gap-2">
                  {selectedSwatch.complementaryHex.map((hex, i) => (
                    <div
                      key={i}
                      className="flex-1 h-8 rounded-lg border border-white/20 shadow-xs flex items-center justify-center text-[10px] font-mono text-white/80 font-bold"
                      style={{ backgroundColor: hex }}
                      title={`HEX: ${hex}`}
                    >
                      {hex}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch gap-2.5">
                <button
                  type="button"
                  id="btn-visualizer-quote"
                  onClick={handleQuoteClick}
                  className="flex-1 py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Cotizar proyecto con este color</span>
                </button>

                <a
                  href={`https://wa.me/${BUSINESS_INFO.whatsappNumber}?text=Hola%20Ideas%20%26%20Colores%2C%20prob%C3%A9%20el%20color%20${encodeURIComponent(
                    `${selectedSwatch.code} ${selectedSwatch.name}`
                  )}%20en%20el%20visualizador%20(Acabado%20${finish})%20y%20quiero%20cotizarlo.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white transition-colors flex items-center justify-center gap-1.5"
                  title="Preguntar por este color en WhatsApp"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  <span className="sm:hidden text-xs font-bold">WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom advisory banner */}
        <div className="mt-10 p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2.5 text-slate-300">
            <Info className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>¿Dudas de color en tu iluminación real?</strong> Llevamos muestras y abanico físico de color a tu casa u obra en Carretera a El Salvador y toda Guatemala.
            </span>
          </div>
          <a
            href={BUSINESS_INFO.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-400 font-bold underline hover:text-amber-300 shrink-0"
          >
            Solicitar muestra en sitio
          </a>
        </div>
      </div>
    </section>
  );
};

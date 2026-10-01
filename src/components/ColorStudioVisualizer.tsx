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
  Info,
  CheckCircle2,
} from 'lucide-react';
import {
  COLOR_COLLECTIONS,
  ROOM_SCENES,
  findColorByHex,
} from '../data/colorsData';
import { ColorSwatch, PaintFinish, LightingMode, RoomScene } from '../types';
import { BUSINESS_INFO } from '../data/content';
import { ColorVisualizer } from './ui/ColorVisualizer';

interface ColorStudioVisualizerProps {
  onSelectColorForQuote: (
    colorName: string,
    colorCode: string,
    finish: string,
    roomName: string,
    hex?: string
  ) => void;
}

const swatchTextColor = (hex: string) => {
  const value = hex.replace('#', '');
  const channels = [0, 2, 4].map((offset) => parseInt(value.slice(offset, offset + 2), 16) / 255);
  const linear = channels.map((channel) =>
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  );
  const luminance = linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
  return luminance > 0.18 ? '#0f172a' : '#ffffff';
};

export const ColorStudioVisualizer: React.FC<ColorStudioVisualizerProps> = ({
  onSelectColorForQuote,
}) => {
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>('tendencias');
  const [selectedSwatch, setSelectedSwatch] = useState<ColorSwatch>(
    COLOR_COLLECTIONS[1].swatches[0] // SW 9130 Evergreen Fog
  );
  const selectedRoom: RoomScene = ROOM_SCENES[0];
  const [finish, setFinish] = useState<PaintFinish>('satinado');
  const [lighting, setLighting] = useState<LightingMode>('dia');
  const [showOriginal, setShowOriginal] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const activeCollection =
    COLOR_COLLECTIONS.find((c) => c.id === selectedCollectionId) || COLOR_COLLECTIONS[0];

  const handleCopyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Color selection with instant response
  const handleSelectSwatch = (swatch: ColorSwatch) => {
    setSelectedSwatch(swatch);
    if (showOriginal) {
      setShowOriginal(false);
    }
  };

  // Click on a harmonic complementary color:
  // Immediately makes it the active wall color
  const handleSelectHarmonicColor = (hex: string) => {
    const matched = findColorByHex(hex);
    if (matched) {
      if (matched.collection) {
        setSelectedCollectionId(matched.collection);
      }
      setSelectedSwatch(matched);
    } else {
      const customSwatch: ColorSwatch = {
        id: `custom-${hex.replace('#', '')}`,
        code: `HEX ${hex}`,
        name: `Tono Armónico ${hex}`,
        hex: hex,
        collection: selectedCollectionId,
        lrv: 50,
        description: `Matiz armónico complementario formulado para equilibrar la composición visual.`,
        bestFor: 'Muros de acento, carpintería arquitectónica y detalles decorativos.',
        complementaryHex: [selectedSwatch.hex, '#EDECE6', '#434341'],
      };
      setSelectedSwatch(customSwatch);
    }
    if (showOriginal) {
      setShowOriginal(false);
    }
  };

  const handleQuoteClick = () => {
    onSelectColorForQuote(
      selectedSwatch.name,
      selectedSwatch.code,
      finish,
      selectedRoom.name,
      selectedSwatch.hex
    );
  };

  return (
    <section
      id="estudio-color"
      className="py-20 bg-slate-900 text-white relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/90 border border-slate-700 text-amber-400 text-xs font-bold uppercase tracking-wider mb-3 shadow-xs">
              <Palette className="w-3.5 h-3.5" />
              <span>Estudio Interactivo de Color</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-display text-white">
              Visualiza el color en un espacio real.
            </h2>
            <p className="mt-2 text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
              Explora nuestros tonos y descubre cómo pueden transformar un ambiente antes de abrir el primer galón.
            </p>
          </div>

          {/* Active Color Pill Badge */}
          <div className="flex items-center gap-3.5 bg-slate-800/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-700/80 shadow-lg shrink-0">
            <span
              className="w-5 h-5 rounded-full border-2 border-white/60 shadow-sm transition-colors duration-300 shrink-0"
              style={{ backgroundColor: selectedSwatch.hex }}
            />
            <div className="text-xs">
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                Tono Activo en Pared
              </span>
              <span className="font-bold text-white tracking-wide">
                {selectedSwatch.code} • {selectedSwatch.name}
              </span>
            </div>
          </div>
        </div>

        {/* Main Visualizer Stage & Controls Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Visualizer + Acabados + Luz (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Architectural Paint Visualizer Component */}
            <ColorVisualizer
              image={selectedRoom.image}
              mask={selectedRoom.wallMask}
              foregroundImage={selectedRoom.foregroundImage}
              roomName={selectedRoom.name}
              selectedColor={selectedSwatch}
              finish={finish}
              lighting={lighting}
              showOriginal={showOriginal}
              onToggleOriginal={() => setShowOriginal((prev) => !prev)}
            />

            {/* Finish & Lighting Selector Bar */}
            <div className="p-4 rounded-2xl bg-slate-800/70 border border-slate-700/70 grid grid-cols-1 sm:grid-cols-2 gap-4 shadow-lg">
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
                      className={`min-h-[44px] py-2 px-2 text-center rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                        finish === f
                          ? 'bg-amber-400 text-slate-950 shadow-xs'
                          : 'bg-slate-900/80 text-slate-300 hover:bg-slate-700 border border-slate-700'
                      }`}
                      aria-pressed={finish === f}
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
                    { id: 'dia', label: 'Día', icon: Sun },
                    { id: 'atardecer', label: 'Atardecer', icon: Sunset },
                    { id: 'calida', label: 'Cálida', icon: Lightbulb },
                  ].map((l) => {
                    const Icon = l.icon;
                    const isActive = lighting === l.id;
                    return (
                      <button
                        key={l.id}
                        type="button"
                        onClick={() => setLighting(l.id as LightingMode)}
                        className={`min-h-[44px] py-2 px-2 text-center rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          isActive
                            ? 'bg-white text-slate-950 shadow-xs'
                            : 'bg-slate-900/80 text-slate-300 hover:bg-slate-700 border border-slate-700'
                        }`}
                        aria-pressed={isActive}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{l.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Disclaimer pill */}
            <p className="text-[11px] text-slate-400/90 italic px-2">
              * Simulación visual de referencia arquitectónica. El resultado real puede variar según la orientación, la iluminación y la porosidad de la superficie.
            </p>
          </div>

          {/* Right Column: Color Collections + Swatches + Spec Card (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            {/* Palette Collection Selector Tabs */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                1. Colecciones de Color Arquitectónico
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
                        const hasCurrent = col.swatches.some((s) => s.id === selectedSwatch.id);
                        if (!hasCurrent) {
                          handleSelectSwatch(col.swatches[0]);
                        }
                      }}
                      className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-amber-400 text-slate-950 shadow-sm'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700/80'
                      }`}
                      aria-pressed={isActive}
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
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  2. Selecciona un tono para pintar en vivo:
                </label>
                <span className="text-[11px] text-amber-400 font-semibold">
                  {activeCollection.swatches.length} tonos
                </span>
              </div>
              <div className="grid grid-cols-5 gap-2 sm:gap-2.5">
                {activeCollection.swatches.map((swatch) => {
                  const isCurrent = selectedSwatch.id === swatch.id;
                  return (
                    <button
                      key={swatch.id}
                      type="button"
                      onClick={() => handleSelectSwatch(swatch)}
                      className={`group relative rounded-2xl p-1.5 transition-all duration-200 text-left flex flex-col items-center min-h-[58px] cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-amber-400 ${
                        isCurrent
                          ? 'bg-slate-800 ring-2 ring-amber-400 scale-105 shadow-lg'
                          : 'bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800'
                      }`}
                      title={`${swatch.code} ${swatch.name} (LRV ${swatch.lrv}%)`}
                      aria-label={`Seleccionar color ${swatch.name} ${swatch.code}`}
                      aria-pressed={isCurrent}
                    >
                      {/* Swatch circle */}
                      <div
                        className="w-full aspect-square rounded-xl border border-white/20 shadow-inner group-hover:scale-105 transition-transform relative flex items-center justify-center"
                        style={{ backgroundColor: swatch.hex }}
                      >
                        {isCurrent && (
                          <Check
                            className="w-3.5 h-3.5 drop-shadow-md"
                            style={{ color: swatchTextColor(swatch.hex) }}
                          />
                        )}
                      </div>
                      <span className="text-[10px] font-bold text-slate-300 mt-1 truncate w-full text-center">
                        {swatch.code.replace('SW ', '').replace('IC ', '')}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Detailed Spec Card for the Active Color */}
            <div className="rounded-2xl bg-slate-800/90 border border-slate-700/80 p-5 space-y-4 shadow-xl transition-all duration-300">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-amber-400" />
                    <span>{selectedSwatch.code}</span>
                  </span>
                  <h3 className="text-2xl font-bold font-display text-white mt-1">
                    {selectedSwatch.name}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {selectedSwatch.description}
                  </p>
                </div>

                {/* Big Color Preview Box */}
                <div
                  className="w-16 h-16 rounded-2xl border-2 border-white/30 shadow-lg shrink-0 flex items-center justify-center transition-colors duration-300"
                  style={{ backgroundColor: selectedSwatch.hex }}
                  title={selectedSwatch.hex}
                />
              </div>

              {/* Color Technical Properties */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-700/60 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                    Recomendado para
                  </span>
                  <span className="text-slate-200 font-medium leading-snug block mt-0.5">
                    {selectedSwatch.bestFor}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                    Índice de Reflexión (LRV)
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 bg-slate-700 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-amber-400 h-full rounded-full transition-all duration-500"
                        style={{ width: `${selectedSwatch.lrv}%` }}
                      />
                    </div>
                    <span className="text-slate-200 font-bold">{selectedSwatch.lrv}%</span>
                  </div>
                </div>
              </div>

              {/* Interactive Complementary Colors Palette */}
              <div className="pt-3 border-t border-slate-700/60">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                    Colores armónicos (Haz clic para probar en pared):
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {selectedSwatch.complementaryHex.map((hex, i) => {
                    const matched = findColorByHex(hex);
                    const label = matched ? matched.name : hex;
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSelectHarmonicColor(hex)}
                        className="h-9 px-2 rounded-xl border border-white/20 shadow-xs flex items-center justify-center text-[10px] font-mono font-bold transition-all hover:scale-105 hover:ring-2 hover:ring-amber-400 truncate cursor-pointer"
                        style={{ backgroundColor: hex, color: swatchTextColor(hex) }}
                        title={`Probar tono armónico ${label} (${hex})`}
                      >
                        <span className="truncate">{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch gap-2.5">
                {/* Copy HEX Button */}
                <button
                  type="button"
                  onClick={() => handleCopyHex(selectedSwatch.hex)}
                  className="px-3.5 py-3 rounded-xl bg-slate-700/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-600/60 cursor-pointer"
                  title="Copiar código HEX"
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

                {/* Primary CTA: Cotizar proyecto */}
                <button
                  type="button"
                  id="btn-visualizer-quote"
                  onClick={handleQuoteClick}
                  className="flex-1 py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 shrink-0" />
                  <span>Cotizar proyecto con este color</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </button>

                {/* WhatsApp Direct Action */}
                <a
                  href={`https://wa.me/${BUSINESS_INFO.whatsappNumber}?text=${encodeURIComponent(
                    `Hola Ideas & Colores, probé el color ${selectedSwatch.code} ${selectedSwatch.name} (${selectedSwatch.hex}) en el visualizador (Acabado: ${finish.toUpperCase()}) y deseo cotizarlo para mi proyecto.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white transition-colors flex items-center justify-center gap-1.5 border border-slate-600/60 cursor-pointer"
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
        <div className="mt-8 p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
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

import React, { useState, useMemo } from 'react';
import {
  Calculator,
  Layers,
  ArrowRight,
  MessageCircle,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  Percent,
  TrendingDown,
} from 'lucide-react';
import { BUSINESS_INFO } from '../data/content';
import { useColorMood } from '../context/ColorMoodContext';
import { AnimatedTabs } from './ui/AnimatedTabs';
import { SpotlightCard } from './ui/SpotlightCard';

interface PaintCalculatorProps {
  onTransferToQuote: (details: string) => void;
}

type SurfaceType = 'liso' | 'poroso' | 'losa' | 'madera';

export const PaintCalculator: React.FC<PaintCalculatorProps> = ({ onTransferToQuote }) => {
  const { currentMood } = useColorMood();
  const [mode, setMode] = useState<'area' | 'dimensions'>('area');
  const [area, setArea] = useState<number>(75);
  const [width, setWidth] = useState<number>(4);
  const [height, setHeight] = useState<number>(2.7);
  const [wallsCount, setWallsCount] = useState<number>(4);
  const [surface, setSurface] = useState<SurfaceType>('liso');
  const [coats, setCoats] = useState<number>(2);

  const [includeLabor, setIncludeLabor] = useState<boolean>(true);

  // Surface yields per gallon (1 coat) and technical recommendations
  const surfaceYields: Record<
    SurfaceType,
    {
      name: string;
      yieldPerGal: number;
      note: string;
      recommendedPaint: string;
      preparationAndSealant: string;
    }
  > = {
    liso: {
      name: 'Repello liso o Tabla Yeso',
      yieldPerGal: 36,
      note: 'Superficie lisa estándar con sellador previo',
      recommendedPaint: 'Látex Acrílico Arquitectónico Satinado o Mate',
      preparationAndSealant:
        'Lijado suave, resane de imperfecciones y 1 mano de sellador acró-vinílico fijador para evitar absorciones desparejas.',
    },
    poroso: {
      name: 'Block rústico o Ladrillo visto',
      yieldPerGal: 22,
      note: 'Alta absorción inicial de pintura',
      recommendedPaint: 'Recubrimiento Elastomérico de Alto Relleno',
      preparationAndSealant:
        'Limpieza profunda de polvo y eflorescencias, aplicación de sellador penetrante hidrófugo para neutralizar la alta alcalinidad del block.',
    },
    losa: {
      name: 'Losa / Terraza (Impermeabilización)',
      yieldPerGal: 16,
      note: 'Película elástica gruesa protectora contra filtraciones',
      recommendedPaint: 'Membrana Elastomérica Fibratada Termorreflejante',
      preparationAndSealant:
        'Calafateo de grietas con masilla elástica de poliuretano y fondo promotor de adherencia antihumedad.',
    },
    madera: {
      name: 'Madera, Deck o Pérgola',
      yieldPerGal: 26,
      note: 'Poro abierto o barniz protector UV',
      recommendedPaint: 'Esmalte Poliuretano / Barniz con filtro UV Marino',
      preparationAndSealant:
        'Lijado en sentido de la veta, tratamiento antipolilla/antihongos y sellador transparente de poro.',
    },
  };

  // Compute active area
  const computedArea = useMemo(() => {
    if (mode === 'area') {
      return area;
    }
    return Math.round(width * height * wallsCount);
  }, [mode, area, width, height, wallsCount]);

  // Compute paint requirements
  const { totalGallons, buckets, remainingGallons, totalLiters, promoSavingsNote } = useMemo(() => {
    const yieldPerGal = surfaceYields[surface].yieldPerGal;
    const effectiveTotalArea = computedArea * coats;
    const exactGallons = effectiveTotalArea / yieldPerGal;
    const totalGallons = Math.ceil(exactGallons);
    const buckets = Math.floor(totalGallons / 5);
    const remainingGallons = totalGallons % 5;
    const totalLiters = (totalGallons * 3.785).toFixed(1);

    const promoSavingsNote = 'Hasta 20% de ahorro con la promoción del mes';

    return {
      totalGallons,
      buckets,
      remainingGallons,
      totalLiters,
      promoSavingsNote,
    };
  }, [computedArea, coats, surface]);

  const handleApplyPreset = (presetArea: number) => {
    setMode('area');
    setArea(presetArea);
  };

  const handleQuoteClick = () => {
    const text = `Cálculo de solución completa: ${computedArea} m² en superficie de ${surfaceYields[surface].name}, a ${coats} mano(s). Volumen estimado: ${totalGallons} galones (${buckets > 0 ? `${buckets} cubeta(s) y ` : ''}${remainingGallons} galón(es)). Tipo recomendado: ${surfaceYields[surface].recommendedPaint}. Preparación/Sellador: ${surfaceYields[surface].preparationAndSealant}. Mano de obra incluida: ${includeLabor ? 'Sí, cotizar mano de obra' : 'Solo suministro de materiales'}.`;
    onTransferToQuote(text);
  };

  const buildWhatsAppLink = () => {
    const message =
      `*SOLUCIÓN COMPLETA CALCULADA - IDEAS & COLORES*\n\n` +
      `*Área a intervenir:* ${computedArea} m²\n` +
      `*Superficie:* ${surfaceYields[surface].name}\n` +
      `*Manos requeridas:* ${coats}\n` +
      `*Volumen estimado:* ${totalGallons} galones (${buckets} cubeta[s] + ${remainingGallons} gal individual[es])\n` +
      `*Pintura recomendada:* ${surfaceYields[surface].recommendedPaint}\n` +
      `*Preparación/Sellador:* ${surfaceYields[surface].preparationAndSealant}\n` +
      `*Incluir mano de obra profesional:* ${includeLabor ? 'SÍ (Quiero solución completa con garantía)' : 'SOLO MATERIALES'}\n` +
      `*Ahorro promo:* Aplicar hasta 20% de descuento vigente.\n\n` +
      `Por favor indíquenme cotización formal y disponibilidad para Carretera a El Salvador / Ciudad de Guatemala.`;

    return `https://wa.me/${BUSINESS_INFO.whatsappNumber}?text=${encodeURIComponent(message)}`;
  };

  return (
    <section id="calculadora" className="py-20 bg-transparent border-b border-slate-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider mb-3 border border-amber-200">
            <Calculator className="w-3.5 h-3.5 text-amber-600" />
            <span>Herramienta Interactiva de Estimación</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
            Calcula exactamente cuánta pintura necesitas.
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-600">
            Evita comprar de más o quedarte a medias. Conoce los galones o cubetas que requiere tu
            proyecto y cuánto puedes ahorrar hoy con nosotros.
          </p>
        </div>

        {/* 21st.dev Style Interactive Calculator Card Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-5xl mx-auto">
          {/* Controls Column (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-lg space-y-6">
            {/* Mode Selector using AnimatedTabs */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 flex-wrap gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Método de cálculo:
              </span>
              <AnimatedTabs
                tabs={[
                  { id: 'area', label: 'Metros cuadrados (m²)' },
                  { id: 'dimensions', label: 'Por medidas de paredes' },
                ]}
                activeId={mode}
                onChange={(id) => setMode(id as 'area' | 'dimensions')}
                layoutId="calc-mode-indicator"
              />
            </div>

            {/* Mode A: Direct Area Slider */}
            {mode === 'area' ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-slate-900">
                    Área total a pintar:
                  </label>
                  <span className="text-xl font-extrabold text-amber-600 font-display">
                    {area} m²
                  </span>
                </div>

                <input
                  type="range"
                  id="paint-calc-area"
                  name="area"
                  aria-label="Área total a pintar en metros cuadrados"
                  min="10"
                  max="400"
                  step="5"
                  value={area}
                  onChange={(e) => setArea(Number(e.target.value))}
                  className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />

                {/* Quick Presets */}
                <div className="pt-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Plantillas rápidas de proyectos comunes:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { label: 'Habitación (30 m²)', value: 30 },
                      { label: 'Sala/Comedor (75 m²)', value: 75 },
                      { label: 'Casa media (180 m²)', value: 180 },
                      { label: 'Fachada exterior (220 m²)', value: 220 },
                      { label: 'Terraza (90 m²)', value: 90 },
                    ].map((preset) => (
                      <button
                        key={preset.value}
                        type="button"
                        onClick={() => handleApplyPreset(preset.value)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                          area === preset.value
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Mode B: Dimensions Inputs */
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label htmlFor="calc-wall-width" className="text-xs font-bold text-slate-700 block mb-1">
                    Ancho pared (m)
                  </label>
                  <input
                    type="number"
                    id="calc-wall-width"
                    name="wallWidth"
                    min="1"
                    max="50"
                    step="0.5"
                    value={width}
                    onChange={(e) => setWidth(Number(e.target.value))}
                    className="w-full text-sm font-bold px-3 py-2 rounded-xl border border-slate-300 focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="calc-wall-height" className="text-xs font-bold text-slate-700 block mb-1">
                    Alto pared (m)
                  </label>
                  <input
                    type="number"
                    id="calc-wall-height"
                    name="wallHeight"
                    min="1"
                    max="15"
                    step="0.1"
                    value={height}
                    onChange={(e) => setHeight(Number(e.target.value))}
                    className="w-full text-sm font-bold px-3 py-2 rounded-xl border border-slate-300 focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="calc-walls-count" className="text-xs font-bold text-slate-700 block mb-1">
                    Nº de paredes
                  </label>
                  <input
                    type="number"
                    id="calc-walls-count"
                    name="wallsCount"
                    min="1"
                    max="20"
                    value={wallsCount}
                    onChange={(e) => setWallsCount(Number(e.target.value))}
                    className="w-full text-sm font-bold px-3 py-2 rounded-xl border border-slate-300 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Surface Porosity Picker */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                Tipo de superficie y porosidad:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(Object.keys(surfaceYields) as SurfaceType[]).map((st) => {
                  const isSelected = surface === st;
                  const info = surfaceYields[st];
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setSurface(st)}
                      className={`p-3 rounded-2xl text-left border transition-all ${
                        isSelected
                          ? 'border-amber-500 bg-amber-50/60 ring-2 ring-amber-400/40 shadow-xs'
                          : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/60'
                      }`}
                    >
                      <p className="text-xs font-bold text-slate-900">{info.name}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{info.note}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Coats Number Picker */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Número de manos de pintura:
                </label>
                <span className="text-xs font-bold text-slate-900">
                  {coats === 1
                    ? '1 mano (Mantenimiento leve)'
                    : coats === 2
                    ? '2 manos (Recomendado oficial)'
                    : '3 manos (Cambio radical o fondo oscuro)'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setCoats(num)}
                    className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                      coats === num
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {num} {num === 1 ? 'Mano' : 'Manos'}
                  </button>
                ))}
              </div>
            </div>

            {/* Labor Inclusion Toggle */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2 mt-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeLabor}
                    onChange={(e) => setIncludeLabor(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                  />
                  <span>Incluir mano de obra y aplicación profesional</span>
                </label>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Garantía formal
                </span>
              </div>
              <p className="text-[11px] text-slate-500 pl-6 leading-relaxed">
                Personal técnico calificado con protección de áreas, preparación de sustrato y garantía por escrito al concluir.
              </p>
            </div>
          </div>

          {/* Results Summary Column (5 cols) */}
          <SpotlightCard
            spotlightColor="rgba(250, 184, 42, 0.18)"
            className="lg:col-span-5 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 rounded-3xl p-6 sm:p-8 text-white shadow-2xl border border-slate-800 space-y-6 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
                  Estimación técnica
                </span>
                <span className="text-xs text-slate-400">{computedArea} m² netos</span>
              </div>

              <h3 className="text-2xl font-black font-display text-white mb-2">
                Volumen y Especificación
              </h3>
              <p className="text-xs text-slate-300 mb-6">
                Calculado para {surfaceYields[surface].name} con {coats} manos de recubrimiento.
              </p>

              {/* Main Numbers Breakdown Card */}
              <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 space-y-4">
                <div className="flex items-end justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-slate-400 text-xs block">Total galones necesarios:</span>
                    <span className="text-3xl sm:text-4xl font-black text-amber-400 font-display">
                      {totalGallons} Galones
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 pb-1">~{totalLiters} Litros</span>
                </div>

                {/* Packaging breakdown */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">
                      Cubetas (5 Gal)
                    </span>
                    <span className="text-lg font-bold text-white mt-0.5 block">
                      {buckets} {buckets === 1 ? 'Cubeta' : 'Cubetas'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">
                      Galones sueltos
                    </span>
                    <span className="text-lg font-bold text-white mt-0.5 block">
                      {remainingGallons} Galón(es)
                    </span>
                  </div>
                </div>

                {/* Technical Paint Recommendation Box */}
                <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/70 space-y-2 text-xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-0.5">
                      Pintura adecuada recomendada:
                    </span>
                    <p className="font-semibold text-white">
                      {surfaceYields[surface].recommendedPaint}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-700/60">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                      Preparación previa y sellador sugerido:
                    </span>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      {surfaceYields[surface].preparationAndSealant}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Modalidad seleccionada:</span>
                    <span className="font-bold text-emerald-400">
                      {includeLabor ? 'Pintura + Mano de obra' : 'Solo materiales'}
                    </span>
                  </div>
                </div>

                {/* Promo discount callout */}
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2.5 text-xs text-amber-300">
                  <Percent className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    Aplica hasta <strong>20% de descuento</strong> al contratar pintura + aplicación
                    profesional.
                  </span>
                </div>
              </div>
            </div>

            {/* Call to Actions with exact prompt text */}
            <div className="space-y-3 pt-2">
              <a
                href={buildWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                id="btn-calculator-whatsapp"
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 hover:scale-101"
              >
                <MessageCircle className="w-4 h-4 text-slate-950" />
                <span>Quiero esta solución completa</span>
              </a>

              <button
                type="button"
                id="btn-calculator-quote-form"
                onClick={handleQuoteClick}
                className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-colors flex items-center justify-center gap-2"
              >
                <span>Enviar datos al formulario web</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </SpotlightCard>
        </div>
      </div>
    </section>
  );
};

import React, { useState, useMemo } from 'react';
import {
  Calculator,
  ArrowRight,
  MessageCircle,
  Percent,
} from 'lucide-react';
import { BUSINESS_INFO } from '../data/content';
import { AnimatedTabs } from './ui/AnimatedTabs';
import { SpotlightCard } from './ui/SpotlightCard';
import { buildSafeWhatsAppUrl } from '../utils/security';

export interface PaintCalculatorProps {
  onTransferToQuote: (details: string) => void;
}

export type SurfaceType = 'liso' | 'poroso' | 'losa' | 'madera';

export interface SurfaceConfig {
  id: SurfaceType;
  title: string;
  desc: string;
  yieldPerGal: number;
  recommendedPaint: string;
  preparationAndSealant: string;
  getSubtitle: (coats: number) => string;
  buildWhatsAppMessage: (params: {
    area: number;
    volumenMaterial: string;
    coats: number;
    includeLabor: boolean;
  }) => string;
}

export const PRESET_PROJECTS = [
  { label: 'Habitación (30 m²)', value: 30 },
  { label: 'Sala/Comedor (75 m²)', value: 75 },
  { label: 'Casa media (180 m²)', value: 180 },
  { label: 'Fachada exterior (220 m²)', value: 220 },
  { label: 'Terraza (90 m²)', value: 90 },
] as const;

export const COAT_OPTIONS = [
  { value: 1, label: '1 Mano', subtitle: '1 mano (Mantenimiento leve)' },
  { value: 2, label: '2 Manos', subtitle: '2 manos (Recomendado oficial)' },
  { value: 3, label: '3 Manos', subtitle: '3 manos (Cambio radical o fondo oscuro)' },
] as const;

export const formatMaterialVolume = (
  totalGallons: number,
  buckets: number,
  remainingGallons: number
): string => {
  if (buckets > 0 && remainingGallons > 0) {
    return `${totalGallons} galones (${buckets} ${buckets === 1 ? 'cubeta' : 'cubetas'} y ${remainingGallons} ${remainingGallons === 1 ? 'galón' : 'galones'})`;
  }
  if (buckets > 0 && remainingGallons === 0) {
    return `${totalGallons} galones (${buckets} ${buckets === 1 ? 'cubeta' : 'cubetas'})`;
  }
  return `${totalGallons} ${totalGallons === 1 ? 'galón' : 'galones'}`;
};

export const SURFACE_CONFIGS: Record<SurfaceType, SurfaceConfig> = {
  liso: {
    id: 'liso',
    title: 'Repello liso o Tabla Yeso',
    desc: 'Superficie lisa estándar con sellador previo',
    yieldPerGal: 36,
    recommendedPaint: 'Látex Acrílico Arquitectónico Satinado o Mate',
    preparationAndSealant:
      'Lijado suave, resane de imperfecciones y 1 mano de sellador acró-vinílico fijador para evitar absorciones desparejas.',
    getSubtitle: (coats: number) =>
      `Calculado para Repello liso o Tabla Yeso con ${coats} ${coats === 1 ? 'mano' : 'manos'} de recubrimiento.`,
    buildWhatsAppMessage: ({ area, volumenMaterial, coats, includeLabor }) => {
      const manosText = `${coats} ${coats === 1 ? 'mano' : 'manos'}`;
      const laborText = includeLabor
        ? '- Mano de obra profesional con garantía'
        : '- Solo suministro de materiales';

      return (
        `Hola 👋 Quisiera cotizar el servicio completo para un espacio de ${area} m² (sala/comedor en repello liso/tabla yeso).   \n` +
        `Requerimos:\n` +
        `- Pintura: ${volumenMaterial} (${manosText})\n` +
        `- Preparación previa con sellador\n` +
        `${laborText}\n` +
        `   \n` +
        `Es para Carretera a El Salvador / Ciudad de Guatemala. ¿Me podrían compartir precio formal aplicando la promo vigente del 20% y disponibilidad? ¡Gracias!`
      );
    },
  },
  poroso: {
    id: 'poroso',
    title: 'Block rústico o Ladrillo visto',
    desc: 'Alta absorción inicial de pintura',
    yieldPerGal: 22,
    recommendedPaint: 'Recubrimiento Elastomérico de Alto Relleno',
    preparationAndSealant:
      'Limpieza profunda de polvo y eflorescencias, aplicación de sellador penetrante hidrófugo para neutralizar la alta alcalinidad del block.',
    getSubtitle: (coats: number) =>
      `Calculado para Block rústico o Ladrillo visto con ${coats} ${coats === 1 ? 'mano' : 'manos'} de recubrimiento.`,
    buildWhatsAppMessage: ({ area, volumenMaterial, coats, includeLabor }) => {
      const manosText = `${coats} ${coats === 1 ? 'mano' : 'manos'}`;
      const servicioText = includeLabor
        ? 'Solución completa (materiales y mano de obra con garantía).'
        : 'Solo materiales.';

      return (
        `¡Hola, muy buen día! ☀️\n` +
        `Quisiera solicitarles una cotización para pintar y proteger una pared de block rústico / ladrillo visto (${area} m²):\n` +
        `- \n` +
        `Trabajo: Limpieza profunda de la pared, sellado contra humedad/polvillo y ${manosText} de pintura protectora de buen grosor.\n` +
        `- \n` +
        `Material estimado: Aprox. ${volumenMaterial}.\n` +
        `- \n` +
        `Servicio: ${servicioText}\n` +
        `El proyecto es para Carretera a El Salvador / Ciudad de Guatemala.\n` +
        `¿Me podrían compartir el presupuesto formal con el descuento del 20% de la promo y en qué fechas tendrían disponibilidad?\n` +
        `¡Quedo a la espera de sus amables noticias, muchas gracias!`
      );
    },
  },
  losa: {
    id: 'losa',
    title: 'Losa / Terraza (Impermeabilización)',
    desc: 'Película elástica gruesa protectora contra filtraciones',
    yieldPerGal: 16,
    recommendedPaint: 'Membrana Elastomérica Fibratada Termorreflejante',
    preparationAndSealant:
      'Calafateo de grietas con masilla elástica de poliuretano y fondo promotor de adherencia antihumedad.',
    getSubtitle: (coats: number) =>
      `Calculado para Impermeabilización de losa/terraza con ${coats} ${coats === 1 ? 'mano' : 'manos'} de protección elástica.`,
    buildWhatsAppMessage: ({ area, volumenMaterial, coats, includeLabor }) => {
      const manosText = `${coats} ${coats === 1 ? 'mano' : 'manos'}`;
      const servicioText = includeLabor
        ? 'Solución completa con mano de obra y garantía.'
        : 'Solo materiales.';

      return (
        `¡Hola, muy buen día! ☀️\n` +
        `Quisiera solicitarles una cotización para un trabajo completo de impermeabilización para una terraza / losa pequeña (${area} m²):\n` +
        `- \n` +
        `Trabajo: Sellar grietas, preparar bien la superficie contra la humedad y aplicar ${manosText} de impermeabilizante térmico blanco/protector.\n` +
        `- \n` +
        `Material estimado: Aprox. ${volumenMaterial}.\n` +
        `- \n` +
        `Servicio: ${servicioText}\n` +
        `El proyecto es para Carretera a El Salvador / Ciudad de Guatemala.\n` +
        `¿Me podrían compartir el presupuesto formal aplicando la promoción del 20% y para qué fechas tendrían disponibilidad?\n` +
        `¡Quedo a la espera de sus amables noticias, muchas gracias!`
      );
    },
  },
  madera: {
    id: 'madera',
    title: 'Madera, Deck o Pérgola',
    desc: 'Poro abierto o barniz protector UV',
    yieldPerGal: 26,
    recommendedPaint: 'Esmalte Poliuretano / Barniz con filtro UV Marino',
    preparationAndSealant:
      'Lijado en sentido de la veta, tratamiento antipolilla/antihongos y sellador transparente de poro.',
    getSubtitle: (coats: number) =>
      `Calculado para Madera, Deck o Pérgola con ${coats} ${coats === 1 ? 'mano' : 'manos'} de barniz protector.`,
    buildWhatsAppMessage: ({ area, volumenMaterial, coats, includeLabor }) => {
      const manosText = `${coats} ${coats === 1 ? 'mano' : 'manos'}`;
      const servicioText = includeLabor
        ? 'Solución completa (materiales y mano de obra con garantía).'
        : 'Solo materiales.';

      return (
        `¡Hola, muy buen día! ☀️\n` +
        `Quisiera solicitarles una cotización para el tratamiento y barnizado de madera / pérgola (${area} m²):\n` +
        `- \n` +
        `Trabajo: Lijado de la madera, tratamiento contra polilla/humedad, sellado y ${manosText} de barniz protector para exterior (con filtro solar).\n` +
        `- \n` +
        `Material estimado: Aprox. ${volumenMaterial}.\n` +
        `- \n` +
        `Servicio: ${servicioText}\n` +
        `El proyecto es para Carretera a El Salvador / Ciudad de Guatemala.\n` +
        `¿Me podrían compartir el presupuesto formal aplicando la promoción del 20% y para qué fechas tendrían disponibilidad?\n` +
        `¡Quedo a la espera de sus amables noticias, muchas gracias!`
      );
    },
  },
};

export const PaintCalculator: React.FC<PaintCalculatorProps> = ({ onTransferToQuote }) => {
  const [mode, setMode] = useState<'area' | 'dimensions'>('area');
  const [area, setArea] = useState<number>(20);
  const [width, setWidth] = useState<number>(4);
  const [height, setHeight] = useState<number>(2.7);
  const [wallsCount, setWallsCount] = useState<number>(4);
  const [surface, setSurface] = useState<SurfaceType>('liso');
  const [coats, setCoats] = useState<number>(2);
  const [includeLabor, setIncludeLabor] = useState<boolean>(true);

  // Active configuration for selected surface
  const currentSurfaceConfig = SURFACE_CONFIGS[surface];

  // Compute active area
  const computedArea = useMemo(() => {
    if (mode === 'area') {
      return Math.min(400, Math.max(10, area));
    }
    const safeW = Math.min(50, Math.max(1, width));
    const safeH = Math.min(15, Math.max(1, height));
    const safeWalls = Math.min(20, Math.max(1, wallsCount));
    return Math.max(1, Math.round(safeW * safeH * safeWalls));
  }, [mode, area, width, height, wallsCount]);

  // Compute paint requirements
  const { totalGallons, buckets, remainingGallons, totalLiters, materialVolumeText } = useMemo(() => {
    const yieldPerGal = currentSurfaceConfig.yieldPerGal;
    const effectiveTotalArea = computedArea * coats;
    const exactGallons = effectiveTotalArea / yieldPerGal;
    const totalGallons = Math.max(1, Math.ceil(exactGallons));
    const buckets = Math.floor(totalGallons / 5);
    const remainingGallons = totalGallons % 5;
    const totalLiters = (totalGallons * 3.785).toFixed(1);
    const materialVolumeText = formatMaterialVolume(totalGallons, buckets, remainingGallons);

    return {
      totalGallons,
      buckets,
      remainingGallons,
      totalLiters,
      materialVolumeText,
    };
  }, [computedArea, coats, currentSurfaceConfig]);

  const handleApplyPreset = (presetArea: number) => {
    setMode('area');
    setArea(presetArea);
  };

  const handleQuoteClick = () => {
    const details = `Cálculo de solución completa: ${computedArea} m² en superficie de ${currentSurfaceConfig.title}, a ${coats} mano(s). Volumen estimado: ${totalGallons} galones (${buckets > 0 ? `${buckets} cubeta(s) y ` : ''}${remainingGallons} galón(es)). Tipo recomendado: ${currentSurfaceConfig.recommendedPaint}. Preparación/Sellador: ${currentSurfaceConfig.preparationAndSealant}. Modalidad seleccionada: ${includeLabor ? 'Pintura + Mano de obra' : 'Solo material'}.`;
    onTransferToQuote(details);
  };

  // WhatsApp Link reactive computation
  const whatsAppUrl = useMemo(() => {
    const rawMessage = currentSurfaceConfig.buildWhatsAppMessage({
      area: computedArea,
      volumenMaterial: materialVolumeText,
      coats,
      includeLabor,
    });

    return buildSafeWhatsAppUrl(BUSINESS_INFO.whatsappNumber, rawMessage);
  }, [currentSurfaceConfig, computedArea, materialVolumeText, coats, includeLabor]);

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

        {/* Interactive Calculator Card Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-5xl mx-auto">
          {/* Controls Column (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-lg space-y-6">
            {/* Mode Selector using AnimatedTabs */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 flex-wrap gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                MÉTODO DE CÁLCULO:
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
                  <label htmlFor="paint-calc-area" className="text-sm font-bold text-slate-900">
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
                  onChange={(e) => setArea(Math.min(400, Math.max(10, Number(e.target.value) || 10)))}
                  className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />

                {/* Quick Presets */}
                <div className="pt-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    PLANTILLAS RÁPIDAS DE PROYECTOS COMUNES:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_PROJECTS.map((preset) => (
                      <button
                        key={preset.value}
                        type="button"
                        onClick={() => handleApplyPreset(preset.value)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                          area === preset.value && mode === 'area'
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
                    aria-label="Ancho de la pared en metros"
                    min="1"
                    max="50"
                    step="0.5"
                    value={width}
                    onChange={(e) => setWidth(Math.min(50, Math.max(1, Number(e.target.value) || 1)))}
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
                    aria-label="Alto de la pared en metros"
                    min="1"
                    max="15"
                    step="0.1"
                    value={height}
                    onChange={(e) => setHeight(Math.min(15, Math.max(1, Number(e.target.value) || 1)))}
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
                    aria-label="Número de paredes a pintar"
                    min="1"
                    max="20"
                    value={wallsCount}
                    onChange={(e) => setWallsCount(Math.min(20, Math.max(1, Math.round(Number(e.target.value) || 1))))}
                    className="w-full text-sm font-bold px-3 py-2 rounded-xl border border-slate-300 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Surface Porosity Picker */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                TIPO DE SUPERFICIE Y POROSIDAD:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(Object.keys(SURFACE_CONFIGS) as SurfaceType[]).map((st) => {
                  const isSelected = surface === st;
                  const info = SURFACE_CONFIGS[st];
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
                      <p className="text-xs font-bold text-slate-900">{info.title}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{info.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Coats Number Picker */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  NÚMERO DE MANOS DE PINTURA:
                </label>
                <span className="text-xs font-bold text-slate-900">
                  {COAT_OPTIONS.find((c) => c.value === coats)?.subtitle || `${coats} manos`}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {COAT_OPTIONS.map((coat) => (
                  <button
                    key={coat.value}
                    type="button"
                    onClick={() => setCoats(coat.value)}
                    className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                      coats === coat.value
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {coat.label}
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
                  GARANTÍA FORMAL
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
                  ESTIMACIÓN TÉCNICA
                </span>
                <span className="text-xs text-slate-400">{computedArea} m² netos</span>
              </div>

              <h3 className="text-2xl font-black font-display text-white mb-2">
                Volumen y Especificación
              </h3>
              <p className="text-xs text-slate-300 mb-6">
                {currentSurfaceConfig.getSubtitle(coats)}
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
                    <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                      CUBETAS (5 GAL)
                    </span>
                    <span className="text-lg font-bold text-white mt-0.5 block">
                      {buckets} {buckets === 1 ? 'Cubeta' : 'Cubetas'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                      GALONES SUELTOS
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
                      PINTURA ADECUADA RECOMENDADA:
                    </span>
                    <p className="font-semibold text-white">
                      {currentSurfaceConfig.recommendedPaint}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-700/60">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                      PREPARACIÓN PREVIA Y SELLADOR SUGERIDO:
                    </span>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      {currentSurfaceConfig.preparationAndSealant}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Modalidad seleccionada:</span>
                    <span className="font-bold text-emerald-400">
                      {includeLabor ? 'Pintura + Mano de obra' : 'Solo material'}
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
                href={whatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                id="btn-calculator-whatsapp"
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99]"
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
                <span>Enviar datos al formulario web →</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </SpotlightCard>
        </div>
      </div>
    </section>
  );
};

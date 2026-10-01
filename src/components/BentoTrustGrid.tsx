import React, { useState } from 'react';
import {
  ShieldCheck,
  Sparkles,
  Layers,
  FileCheck,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { useColorMood } from '../context/ColorMoodContext';
import { SpotlightCard } from './ui/SpotlightCard';
import { BUSINESS_INFO } from '../data/content';
import FadeIn from './ui/FadeIn';



interface BentoTrustGridProps {
  onQuoteClick: () => void;
}

export const BentoTrustGrid: React.FC<BentoTrustGridProps> = ({ onQuoteClick }) => {
  const { currentMood } = useColorMood();
  const [hoveredPillar, setHoveredPillar] = useState<string | null>(null);

  const iconMap: Record<string, React.ReactNode> = {
    Sparkles: <Sparkles className="w-6 h-6" />,
    ShieldCheck: <ShieldCheck className="w-6 h-6" />,
    Layers: <Layers className="w-6 h-6" />,
    FileCheck: <FileCheck className="w-6 h-6" />,
  };

  return (
    <section id="confianza" className="py-20 sm:py-24 bg-transparent border-b border-slate-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <FadeIn direction="up" distance={24}>
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold uppercase tracking-wider mb-3">
              <span
                className="w-2 h-2 rounded-full transition-colors duration-500"
                style={{ backgroundColor: currentMood.color }}
              />
              <span>Confianza y Respaldo Profesional</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tight font-display">
              Por qué elegir Ideas &amp; Colores Multi-Servicios
            </h2>
            <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
              Eliminamos la incertidumbre en pintura, mantenimiento y remodelación con 4 pilares
              metodológicos, técnicos certificados, marcas avaladas y garantía formal por escrito.
            </p>
          </div>
        </FadeIn>

        {/* 4 Pillars Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Pillar 1: Asesoría técnica personalizada (7 cols) */}
          <SpotlightCard
            onMouseEnter={() => setHoveredPillar('asesoria')}
            onMouseLeave={() => setHoveredPillar(null)}
            spotlightColor={currentMood.glow || 'rgba(0, 89, 255, 0.25)'}
            className="md:col-span-7 rounded-3xl p-8 bg-slate-950 text-white border border-slate-800 shadow-xl flex flex-col justify-between relative overflow-hidden transition-all duration-300"
          >
            {/* Ambient glow */}
            <div
              className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none transition-opacity duration-300"
              style={{ backgroundColor: currentMood.color }}
            />

            <div>
              <div className="flex items-center justify-between mb-6">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white shadow-md transition-colors"
                  style={{ backgroundColor: currentMood.color }}
                >
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-slate-400">01</span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300 bg-amber-400/10 border border-amber-400/20 px-3 py-1 rounded-full">
                    Técnicos certificados
                  </span>
                </div>
              </div>

              <h3 className="text-2xl sm:text-3xl font-bold font-display text-white mb-3">
                Asesoría técnica y diagnóstico en sitio
              </h3>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl mb-6">
                Asesoramiento y soporte personalizado por técnicos certificados en líneas{' '}
                <strong className="text-white">Arquitectónico, Industrial, Automotriz y Madera</strong>.
                Evaluamos cada superficie, humedad, fisuras y recomendamos la solución química y estética precisa.
              </p>

              {/* Technical specialities badges */}
              <div className="flex flex-wrap gap-2 pt-2">
                {[
                  'Diagnóstico en sitio sin costo',
                  'Línea Arquitectónica',
                  'Línea Industrial & Pisos',
                  'Línea Madera & Pérgolas',
                  'Línea Automotriz & Metales',
                ].map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{item}</span>
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Visitas en Carretera a El Salvador y toda Guatemala.</span>
              <button
                type="button"
                onClick={onQuoteClick}
                className="font-bold hover:underline inline-flex items-center gap-1"
                style={{ color: currentMood.color }}
              >
                <span>Solicitar visita técnica</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </SpotlightCard>

          {/* Pillar 2: Personal calificado y materiales confiables (5 cols) */}
          <SpotlightCard
            onMouseEnter={() => setHoveredPillar('calidad')}
            onMouseLeave={() => setHoveredPillar(null)}
            spotlightColor="rgba(245, 158, 11, 0.15)"
            className="md:col-span-5 rounded-3xl p-8 bg-slate-50 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-slate-400">02</span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 bg-white border border-slate-200 px-3 py-1 rounded-full">
                    Marcas reconocidas
                  </span>
                </div>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold font-display text-slate-950 mb-3">
                Personal calificado y materiales originales
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-5">
                Consolidándonos con marcas locales e internacionales de productos y equipos. Garantizamos
                mano de obra calificada, durabilidad extrema y cero diluciones perjudiciales en cada proyecto.
              </p>

              <div className="space-y-2.5 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Personal debidamente uniformado, capacitado y supervisado</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Formulaciones y recubrimientos certificados de fábrica</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Equipos de aplicación airless y de precisión</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-200 text-xs font-semibold text-slate-500">
              Suministro original con ficha técnica del fabricante.
            </div>
          </SpotlightCard>

          {/* Pillar 3: Ejecución de principio a fin (5 cols) */}
          <SpotlightCard
            onMouseEnter={() => setHoveredPillar('ejecucion')}
            onMouseLeave={() => setHoveredPillar(null)}
            spotlightColor="rgba(0, 163, 255, 0.15)"
            className="md:col-span-5 rounded-3xl p-8 bg-slate-50 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-900 flex items-center justify-center font-bold">
                  <Layers className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-slate-400">03</span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-sky-800 bg-sky-50 border border-sky-200 px-3 py-1 rounded-full">
                    Integral y puntual
                  </span>
                </div>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold font-display text-slate-950 mb-3">
                Ejecución pulcra y compromiso de plazos
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-5">
                Ejecución de proyectos desde su concepción hasta el acabado final. Respetamos tu tiempo
                con cronogramas claros, protección meticulosa de pisos y mobiliario, y entrega lista para habitar.
              </p>

              <div className="space-y-2.5 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Preparación profunda, resane de fisuras y sellado base</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Cuidado estricto: plásticos y encintado de alta protección</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Entrega limpia sin salpicaduras y cumplimiento de fechas</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-200 text-xs font-semibold text-slate-500">
              Coordinación centralizada sin subcontratistas dispersos.
            </div>
          </SpotlightCard>

          {/* Pillar 4: Garantía por escrito en productos y mano de obra (7 cols) */}
          <SpotlightCard
            onMouseEnter={() => setHoveredPillar('garantia')}
            onMouseLeave={() => setHoveredPillar(null)}
            spotlightColor="rgba(16, 185, 129, 0.25)"
            className="md:col-span-7 rounded-3xl p-8 bg-gradient-to-br from-slate-900 to-slate-950 text-white border border-slate-800 shadow-xl flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
                  <FileCheck className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-slate-400">04</span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-400/10 border border-emerald-400/20 px-3 py-1 rounded-full">
                    Respaldo formal
                  </span>
                </div>
              </div>

              <h3 className="text-2xl sm:text-3xl font-bold font-display text-white mb-3">
                Garantía por escrito y presupuestos transparentes
              </h3>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl mb-6">
                Entregamos un compromiso formal por escrito para tu tranquilidad: respondemos por la
                adherencia, estabilidad del color y calidad de mano de obra. Presupuesto desglosado sin sorpresas ni sobrecostos.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                  <span className="block text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">
                    Garantía de Producto
                  </span>
                  <p className="text-xs text-slate-300">
                    Respaldo directo de marcas líderes contra descascaramiento prematuro y decoloración solar.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                  <span className="block text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">
                    Garantía de Mano de Obra
                  </span>
                  <p className="text-xs text-slate-300">
                    Certificación de aplicación profesional: responderemos ante cualquier detalle de ejecución.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Facturación contable para particulares, comercios y empresas.</span>
              <button
                type="button"
                onClick={onQuoteClick}
                className="text-emerald-400 font-bold hover:underline flex items-center gap-1"
              >
                <span>Cotizar con garantía</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </SpotlightCard>
        </div>

        {/* Certified Brands Strip */}
        <div className="mt-12 p-6 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Marcas y recubrimientos de confianza
            </span>
            <span className="text-sm font-bold text-slate-900">
              Aplicamos fórmulas avaladas de estándares nacionales e internacionales
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {['Sherwin-Williams', 'Corona', 'Lanco', 'Sika', 'Comex', 'Protecto'].map((brand) => (
              <span
                key={brand}
                className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-2xs"
              >
                {brand}
              </span>
            ))}
          </div>
        </div>

        {/* Local quote fast-lane banner (Integrated from TrustBlock) */}
        <div className="mt-8 rounded-3xl bg-slate-950 text-white p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl border border-slate-800">
          <div className="space-y-1.5 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-bold uppercase tracking-wider">
              <span>Carretera a El Salvador y toda Guatemala</span>
            </div>
            <h4 className="text-xl sm:text-2xl font-bold font-display text-white">
              ¿Listo para planificar tu proyecto con respaldo formal?
            </h4>
            <p className="text-sm text-slate-300 max-w-2xl font-normal">
              Recibe asesoría técnica en sitio, marcas certificadas y un presupuesto claro sin costos ocultos.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onQuoteClick}
              className="px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-md hover:scale-102"
            >
              Cotizar mi proyecto
            </button>
            <a
              href={BUSINESS_INFO.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs sm:text-sm font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <span>Consultar WhatsApp</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

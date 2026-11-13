import React from 'react';
import {
  ShieldCheck,
  Sparkles,
  Layers,
  FileCheck,
  CheckCircle2,
  ArrowRight,
  Award,
} from 'lucide-react';
import { useColorMood } from '../context/ColorMoodContext';
import { SpotlightCard } from './ui/SpotlightCard';
import { BUSINESS_INFO } from '../data/content';
import FadeIn from './ui/FadeIn';
import { NumberTicker } from './ui/NumberTicker';

interface BentoTrustGridProps {
  onQuoteClick: () => void;
}

export const BentoTrustGrid: React.FC<BentoTrustGridProps> = ({ onQuoteClick }) => {
  const { currentMood } = useColorMood();

  return (
    <section id="confianza" className="py-20 sm:py-28 bg-[#F4F5F7] border-b border-[#E8E9EE]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Roofera About Us + Stats Header */}
        <FadeIn direction="up" distance={24}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-end mb-14 pb-10 border-b border-[#E8E9EE]">
            <div className="lg:col-span-7 text-left">
              <div className="inline-flex items-center gap-2.5 text-xs font-extrabold uppercase tracking-[0.18em] text-[#80828C] mb-3">
                <span
                  className="w-2.5 h-2.5 rounded-xs shrink-0 transition-colors"
                  style={{ backgroundColor: currentMood.color }}
                />
                <span>Sobre Nosotros • Desde {BUSINESS_INFO.foundationYear} en Guatemala</span>
              </div>

              <h2 className="text-3xl sm:text-5xl font-black text-[#090E19] tracking-[-0.04em] leading-[1.06] font-display">
                Ejecución de precisión con garantía real
                <span style={{ color: currentMood.color }}>.</span>
              </h2>
              <p className="mt-4 text-sm sm:text-base text-[#525663] leading-relaxed max-w-2xl">
                Eliminamos la dispersión de proveedores y la improvisación técnica con 4 pilares
                metodológicos, técnicos certificados, marcas avaladas y respaldo formal por escrito.
              </p>
            </div>

            {/* Roofera Metric Strip */}
            <div className="lg:col-span-5 grid grid-cols-3 gap-4 sm:gap-6">
              <div className="p-4 rounded-xl bg-white border border-[#E8E9EE] text-left">
                <div className="text-2xl sm:text-3xl font-black text-[#090E19] font-display tracking-tight flex items-baseline">
                  +<NumberTicker value={10} />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#80828C] mt-1 block">
                  Años de experiencia
                </span>
              </div>
              <div className="p-4 rounded-xl bg-white border border-[#E8E9EE] text-left">
                <div className="text-2xl sm:text-3xl font-black text-[#090E19] font-display tracking-tight flex items-baseline">
                  +<NumberTicker value={500} />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#80828C] mt-1 block">
                  Obras entregadas
                </span>
              </div>
              <div className="p-4 rounded-xl bg-[#090E19] border border-[#27324D] text-left">
                <div
                  className="text-2xl sm:text-3xl font-black font-display tracking-tight"
                  style={{ color: currentMood.color }}
                >
                  5.0★
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#B8BCC6] mt-1 block">
                  Google Maps
                </span>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* 4 Pillars Roofera Architectural Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Pillar 1: Dark Obsidian Feature (7 cols) */}
          <SpotlightCard
            spotlightColor={currentMood.glow || 'rgba(255, 92, 0, 0.25)'}
            className="md:col-span-7 rounded-xl p-8 bg-[#090E19] text-white border border-[#27324D] shadow-xl flex flex-col justify-between relative overflow-hidden transition-all duration-300 text-left"
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <div
                  className="w-12 h-12 rounded-md flex items-center justify-center font-bold text-white shadow-md transition-colors"
                  style={{ backgroundColor: currentMood.color }}
                >
                  <Sparkles className="w-6 h-6 text-white" aria-hidden="true" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[#80828C]">01</span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#FFCC99] bg-white/5 border border-white/10 px-3 py-1 rounded-md">
                    Técnicos certificados
                  </span>
                </div>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black font-display text-white tracking-tight mb-3">
                Asesoría técnica y diagnóstico en sitio
              </h3>
              <p className="text-sm sm:text-base text-[#B8BCC6] leading-relaxed max-w-xl mb-6">
                Asesoramiento personalizado por técnicos certificados en líneas{' '}
                <strong className="text-white">Arquitectónico, Industrial, Automotriz y Madera</strong>.
                Evaluamos cada superficie, humedad, fisuras y recomendamos la solución química y estética precisa.
              </p>

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
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#151D30] border border-[#27324D] text-xs text-[#E8E9EE]"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                    <span>{item}</span>
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-[#27324D] flex items-center justify-between text-xs text-[#80828C]">
              <span>Visitas en Carretera a El Salvador y toda Guatemala.</span>
              <button
                type="button"
                onClick={onQuoteClick}
                className="font-bold hover:underline inline-flex items-center gap-1 min-h-[44px] py-2 px-1 cursor-pointer"
                style={{ color: currentMood.color }}
              >
                <span>Solicitar visita técnica</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
          </SpotlightCard>

          {/* Pillar 2: Light Crisp Card (5 cols) */}
          <SpotlightCard
            spotlightColor="rgba(255, 92, 0, 0.1)"
            className="md:col-span-5 rounded-xl p-8 bg-white border border-[#E8E9EE] shadow-xs hover:border-[#090E19]/30 transition-all flex flex-col justify-between text-left"
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-md bg-[#FFF0E6] text-[#090E19] flex items-center justify-center font-bold border border-[#FFD6BF]">
                  <ShieldCheck className="w-6 h-6" style={{ color: currentMood.color }} aria-hidden="true" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[#80828C]">02</span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#090E19] bg-[#F4F5F7] border border-[#E8E9EE] px-3 py-1 rounded-md">
                    Marcas reconocidas
                  </span>
                </div>
              </div>

              <h3 className="text-xl sm:text-2xl font-black font-display text-[#090E19] tracking-tight mb-3">
                Personal calificado y materiales originales
              </h3>
              <p className="text-xs sm:text-sm text-[#525663] leading-relaxed mb-5">
                Consolidándonos con marcas locales e internacionales de productos y equipos. Garantizamos
                mano de obra calificada, durabilidad extrema y cero diluciones perjudiciales en cada proyecto.
              </p>

              <div className="space-y-2.5 text-xs text-[#2B2F3A]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
                  <span>Personal debidamente uniformado, capacitado y supervisado</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
                  <span>Formulaciones y recubrimientos certificados de fábrica</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
                  <span>Equipos de aplicación Airless y de precisión</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-[#E8E9EE] text-xs font-semibold text-[#525663]">
              Suministro original con ficha técnica del fabricante.
            </div>
          </SpotlightCard>

          {/* Pillar 3: Light Crisp Card (5 cols) */}
          <SpotlightCard
            spotlightColor="rgba(9, 14, 25, 0.08)"
            className="md:col-span-5 rounded-xl p-8 bg-white border border-[#E8E9EE] shadow-xs hover:border-[#090E19]/30 transition-all flex flex-col justify-between text-left"
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-md bg-[#F4F5F7] text-[#090E19] flex items-center justify-center font-bold border border-[#E8E9EE]">
                  <Layers className="w-6 h-6" aria-hidden="true" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[#80828C]">03</span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#090E19] bg-[#F4F5F7] border border-[#E8E9EE] px-3 py-1 rounded-md">
                    Integral y puntual
                  </span>
                </div>
              </div>

              <h3 className="text-xl sm:text-2xl font-black font-display text-[#090E19] tracking-tight mb-3">
                Ejecución pulcra y compromiso de plazos
              </h3>
              <p className="text-xs sm:text-sm text-[#525663] leading-relaxed mb-5">
                Ejecución de proyectos desde su concepción hasta el acabado final. Respetamos tu tiempo
                con cronogramas claros, protección meticulosa de pisos y mobiliario, y entrega lista para habitar.
              </p>

              <div className="space-y-2.5 text-xs text-[#2B2F3A]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
                  <span>Preparación profunda, resane de fisuras y sellado base</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
                  <span>Cuidado estricto: plásticos y encintado de alta protección</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
                  <span>Entrega limpia sin salpicaduras y cumplimiento de fechas</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-[#E8E9EE] text-xs font-semibold text-[#525663]">
              Coordinación centralizada sin subcontratistas dispersos.
            </div>
          </SpotlightCard>

          {/* Pillar 4: Dark Obsidian Card (7 cols) */}
          <SpotlightCard
            spotlightColor="rgba(16, 185, 129, 0.2)"
            className="md:col-span-7 rounded-xl p-8 bg-[#151D30] text-white border border-[#27324D] shadow-xl flex flex-col justify-between text-left"
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-md bg-emerald-500 text-[#090E19] flex items-center justify-center font-bold">
                  <FileCheck className="w-6 h-6" aria-hidden="true" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[#80828C]">04</span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-400/10 border border-emerald-400/20 px-3 py-1 rounded-md">
                    Respaldo formal
                  </span>
                </div>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black font-display text-white tracking-tight mb-3">
                Garantía por escrito y Facturación SAT
              </h3>
              <p className="text-sm sm:text-base text-[#B8BCC6] leading-relaxed max-w-xl mb-6">
                Entregamos un compromiso formal por escrito para tu tranquilidad: respondemos por la
                adherencia, estabilidad del color y calidad de mano de obra. Presupuesto desglosado y Factura Electrónica FEL.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-lg bg-[#090E19] border border-[#27324D]">
                  <span className="block text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">
                    Garantía de Producto
                  </span>
                  <p className="text-xs text-[#B8BCC6]">
                    Respaldo directo de marcas líderes contra descascaramiento prematuro y decoloración solar.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-[#090E19] border border-[#27324D]">
                  <span className="block text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">
                    Garantía de Mano de Obra
                  </span>
                  <p className="text-xs text-[#B8BCC6]">
                    Certificación de aplicación profesional: responderemos ante cualquier detalle de ejecución.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-[#27324D] flex items-center justify-between text-xs text-[#80828C]">
              <span>Facturación contable FEL para particulares, comercios y empresas.</span>
              <button
                type="button"
                onClick={onQuoteClick}
                className="text-emerald-400 font-bold hover:underline inline-flex items-center gap-1 min-h-[44px] py-2 px-1 cursor-pointer"
              >
                <span>Cotizar con garantía</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
          </SpotlightCard>
        </div>

        {/* Certified Brands & Guatemalan Identity Strip */}
        <div className="mt-8 p-6 rounded-xl bg-white border border-[#E8E9EE] flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 text-center sm:text-left">
            <div
              className="w-10 h-10 rounded-md text-white hidden sm:flex items-center justify-center font-black shrink-0"
              style={{ backgroundColor: currentMood.color }}
            >
              <Award className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#80828C] block">
                Marcas y recubrimientos certificados • Sede Carretera a El Salvador
              </span>
              <span className="text-sm font-extrabold text-[#090E19]">
                Aplicamos fórmulas avaladas de estándares nacionales e internacionales
              </span>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {['Sherwin-Williams', 'Paleta', 'Corona', 'Lanco', 'Sika', 'Protecto'].map((brand) => (
              <span
                key={brand}
                className="px-3.5 py-1.5 rounded-md bg-[#F4F5F7] border border-[#E8E9EE] text-xs font-bold text-[#090E19]"
              >
                {brand}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

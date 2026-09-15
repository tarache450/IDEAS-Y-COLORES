import React, { useState } from 'react';
import {
  ShieldCheck,
  Sparkles,
  Layers,
  FileCheck,
  CheckCircle2,
  ArrowRight,
  Sparkle,
} from 'lucide-react';
import { BUSINESS_INFO, TRUST_FOUR_PILLARS } from '../data/content';
import { useColorMood } from '../context/ColorMoodContext';

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
    <section id="servicios" className="py-20 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold uppercase tracking-wider mb-3">
            <span
              className="w-2 h-2 rounded-full transition-colors duration-500"
              style={{ backgroundColor: currentMood.color }}
            />
            <span>Confianza y Respaldo Profesional</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tight font-display">
            Un solo equipo para cada etapa de tu proyecto.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
            Eliminamos la improvisación en pintura, mantenimiento y remodelación con 4 pilares
            metodológicos, personal calificado y garantía formal.
          </p>
        </div>

        {/* 4 Pillars Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Pillar 1: Asesoría técnica personalizada (7 cols) */}
          <div
            onMouseEnter={() => setHoveredPillar('asesoria')}
            onMouseLeave={() => setHoveredPillar(null)}
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
                Asesoría técnica personalizada
              </h3>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl mb-6">
                Asesoramiento y soporte personalizado por técnicos certificados en líneas{' '}
                <strong className="text-white">Arquitectónico, Industrial, Automotriz y Madera</strong>.
                Evaluamos cada superficie y recomendamos la solución química y estética precisa.
              </p>

              {/* Technical specialities badges */}
              <div className="flex flex-wrap gap-2 pt-2">
                {[
                  'Diagnóstico en sitio',
                  'Línea Arquitectónica',
                  'Línea Industrial & Pisos',
                  'Línea Madera & Barnices',
                  'Línea Automotriz',
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
              <span>Visita diagnóstica en Carretera a El Salvador y toda Guatemala.</span>
              <button
                type="button"
                onClick={onQuoteClick}
                className="font-bold hover:underline inline-flex items-center gap-1"
                style={{ color: currentMood.color }}
              >
                <span>Solicitar asesoría</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Pillar 2: Personal calificado y materiales confiables (5 cols) */}
          <div
            onMouseEnter={() => setHoveredPillar('calidad')}
            onMouseLeave={() => setHoveredPillar(null)}
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
                Personal calificado y materiales confiables
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-5">
                Consolidándonos con marcas locales e internacionales de productos y equipos, para
                garantizar tanto la mano de obra con personal calificado, como durabilidad y calidad
                de los productos seleccionados en cada proyecto a realizar.
              </p>

              <div className="space-y-2.5 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Personal debidamente capacitado y supervisado</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Formulaciones y recubrimientos probados</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Equipos de aplicación de precisión y seguridad</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-200 text-xs font-semibold text-slate-500">
              Suministro original sin diluciones perjudiciales.
            </div>
          </div>

          {/* Pillar 3: Ejecución de principio a fin (5 cols) */}
          <div
            onMouseEnter={() => setHoveredPillar('ejecucion')}
            onMouseLeave={() => setHoveredPillar(null)}
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
                    Integral
                  </span>
                </div>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold font-display text-slate-950 mb-3">
                Ejecución de principio a fin
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-5">
                Ejecución de proyectos desde su concepción hasta el acabado final. Nos encargamos de
                la preparación de superficies, protección meticulosa de pisos y mobiliario, y
                entrega pulcra lista para usar.
              </p>

              <div className="space-y-2.5 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Preparación profunda, resane y sellado inicial</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Cuidado estricto del mobiliario y áreas adyacentes</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Entrega limpia y cumplimiento de cronogramas</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-200 text-xs font-semibold text-slate-500">
              Coordinación centralizada sin subcontratos dispersos.
            </div>
          </div>

          {/* Pillar 4: Garantía por escrito en productos y mano de obra (7 cols) */}
          <div
            onMouseEnter={() => setHoveredPillar('garantia')}
            onMouseLeave={() => setHoveredPillar(null)}
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
                Garantía por escrito en productos y mano de obra
              </h3>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl mb-6">
                Garantía por escrito tanto de productos como de mano de obra. Entregamos un
                compromiso formal para tu tranquilidad: respondemos por la adherencia, estabilidad
                del color y calidad de la aplicación.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                  <span className="block text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">
                    Garantía de Producto
                  </span>
                  <p className="text-xs text-slate-300">
                    Respaldo directo de marcas locales e internacionales contra defectos de fábrica
                    y rendimiento.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                  <span className="block text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">
                    Garantía de Mano de Obra
                  </span>
                  <p className="text-xs text-slate-300">
                    Certificación de aplicación profesional: sin descascaramiento, ampollamiento ni
                    fallas de preparación.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Facturación contable y formalidad para personas y empresas.</span>
              <button
                type="button"
                onClick={onQuoteClick}
                className="text-emerald-400 font-bold hover:underline flex items-center gap-1"
              >
                <span>Cotizar con garantía</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

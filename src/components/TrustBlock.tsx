import React from 'react';
import {
  Sparkles,
  ShieldCheck,
  Clock,
  Scale,
  Layers,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { WHY_CHOOSE_US, BUSINESS_INFO } from '../data/content';
import { useColorMood } from '../context/ColorMoodContext';

interface TrustBlockProps {
  onQuoteClick: () => void;
}

export const TrustBlock: React.FC<TrustBlockProps> = ({ onQuoteClick }) => {
  const { currentMood } = useColorMood();

  const iconMap: Record<string, React.ReactNode> = {
    Sparkles: <Sparkles className="w-6 h-6 text-blue-600" />,
    ShieldCheck: <ShieldCheck className="w-6 h-6 text-rose-600" />,
    Clock: <Clock className="w-6 h-6 text-amber-500" />,
    Scale: <Scale className="w-6 h-6 text-sky-600" />,
    Layers: <Layers className="w-6 h-6 text-emerald-600" />,
  };

  return (
    <section id="por-que-elegirnos" className="py-20 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-slate-200 text-slate-800 text-xs font-bold uppercase tracking-wider mb-3 shadow-2xs">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: currentMood.color }}
            />
            <span>Bloque de Confianza</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tight font-display">
            Por qué elegir Ideas & Colores
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            Eliminamos la incertidumbre con transparencia absoluta, personal calificado y un único
            responsable de principio a fin.
          </p>
        </div>

        {/* 5 Reasons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          {WHY_CHOOSE_US.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center bg-slate-50 border border-slate-200/80 shadow-2xs group-hover:scale-105 transition-transform"
                    style={{ color: item.accent }}
                  >
                    {iconMap[item.icon] || <Sparkles className="w-6 h-6" />}
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-400">
                    {item.number}
                  </span>
                </div>

                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  {item.badge}
                </span>

                <h3 className="text-lg font-bold text-slate-950 mb-2 font-display">
                  {item.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  {item.desc}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-500">
                <span>Estándar I&C</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              </div>
            </div>
          ))}
        </div>

        {/* Local quote fast-lane banner */}
        <div className="mt-12 rounded-3xl bg-slate-950 text-white p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl border border-slate-800">
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

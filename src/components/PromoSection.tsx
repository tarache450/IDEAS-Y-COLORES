import React from 'react';
import { Tag, ArrowRight, MessageCircle, ShieldCheck, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { PROMOTIONS_LIST, BUSINESS_INFO } from '../data/content';
import { useColorMood } from '../context/ColorMoodContext';
import { SpotlightCard } from './ui/SpotlightCard';

interface PromoSectionProps {
  onQuoteClick: () => void;
}

export const PromoSection: React.FC<PromoSectionProps> = ({ onQuoteClick }) => {
  const { currentMood } = useColorMood();

  return (
    <section id="promociones" className="py-20 bg-transparent border-b border-slate-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Highlight Hero Promo Banner */}
        <div className="rounded-3xl bg-slate-950 text-white p-8 sm:p-12 lg:p-14 shadow-2xl relative overflow-hidden mb-12 border border-slate-800">
          <div className="absolute inset-0 z-0 promo-light pointer-events-none" aria-hidden="true" />
          <div className="absolute inset-0 z-[1] bg-gradient-to-r from-slate-950/90 via-slate-950/70 to-slate-950/40 pointer-events-none" />


          <div className="relative z-10 max-w-3xl">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-sm">
                <Tag className="w-4 h-4" />
                <span>Promoción Oficial</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/90 border border-slate-700/80 text-amber-300 text-xs font-semibold">
                <Clock className="w-3.5 h-3.5" />
                <span>Cupos mensuales limitados por agenda técnica</span>
              </div>
            </div>

            {/* Exact verified headline requested */}
            <h2 className="text-3xl sm:text-5xl font-black font-display tracking-tight text-white leading-tight">
              Color que transforma, ahora con hasta <span className="text-amber-400">20% de descuento</span>.
            </h2>

            {/* Exact secondary text requested */}
            <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
              Pregunta por nuestras promociones en pintura y aplicación.
            </p>

            <p className="mt-2 text-xs sm:text-sm text-slate-400 max-w-xl">
              Asesoría técnica en sitio, suministro de producto de marcas de confianza y aplicación
              con personal calificado respaldado por garantía por escrito.
            </p>

            {/* CTAs requested */}
            <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <button
                type="button"
                id="btn-claim-promo-quote"
                onClick={onQuoteClick}
                className="px-7 py-4 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-[0.98] text-slate-950 font-bold text-sm sm:text-base shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>Solicitar promoción</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <a
                href={`https://wa.me/${BUSINESS_INFO.whatsappNumber}?text=Hola%20Ideas%20%26%20Colores%2C%20quiero%20informaci%C3%B3n%20sobre%20la%20promoci%C3%B3n%20de%20hasta%2020%25%20de%20descuento%20en%20pintura%20y%20aplicaci%C3%B3n.`}
                target="_blank"
                rel="noopener noreferrer"
                id="btn-claim-promo-wa"
                className="px-6 py-4 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-[0.98] text-white font-semibold text-sm sm:text-base border border-slate-700 transition-all flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5 text-emerald-400" />
                <span>Hablar por WhatsApp</span>
              </a>
            </div>

            <div className="mt-6 flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Válido para proyectos residenciales, comerciales e industriales en Guatemala.</span>
            </div>
          </div>
        </div>

        {/* Individual Promo Cards with SpotlightCard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PROMOTIONS_LIST.map((promo) => (
            <SpotlightCard
              key={promo.id}
              className={`rounded-3xl p-6 sm:p-7 border flex flex-col justify-between transition-all duration-300 ${
                promo.highlight
                  ? 'bg-amber-50/70 border-amber-300 shadow-md ring-1 ring-amber-300/60'
                  : 'bg-slate-50/70 border-slate-200/80 hover:bg-white hover:shadow-lg'
              }`}
              spotlightColor={promo.highlight ? 'rgba(251, 191, 36, 0.2)' : 'rgba(0, 89, 255, 0.12)'}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider ${
                      promo.highlight
                        ? 'bg-amber-400 text-slate-950 shadow-xs'
                        : 'bg-slate-200 text-slate-800'
                    }`}
                  >
                    {promo.discount}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{promo.validUntil}</span>
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-900 font-display mb-2">
                  {promo.title}
                </h3>

                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  {promo.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200/60">
                <p className="text-[11px] text-slate-500 mb-3 italic">
                  * {promo.terms}
                </p>
                <a
                  href={`https://wa.me/${BUSINESS_INFO.whatsappNumber}?text=Hola%20Ideas%20%26%20Colores%2C%20deseo%20aplicar%20la%20promoci%C3%B3n%3A%20${encodeURIComponent(
                    promo.title
                  )}.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Aplicar por WhatsApp</span>
                </a>
              </div>
            </SpotlightCard>
          ))}
        </div>
      </div>
    </section>
  );
};

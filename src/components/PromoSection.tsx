import React from 'react';
import { Tag, ArrowRight, MessageCircle, ShieldCheck, Clock } from 'lucide-react';
import { PROMOTIONS_LIST, BUSINESS_INFO } from '../data/content';
import { useColorMood } from '../context/ColorMoodContext';
import { buildSafeWhatsAppUrl } from '../utils/security';

interface PromoSectionProps {
  onQuoteClick: () => void;
}

export const PromoSection: React.FC<PromoSectionProps> = ({ onQuoteClick }) => {
  const { currentMood } = useColorMood();

  return (
    <section id="promociones" className="py-20 sm:py-24 bg-[#F4F5F7] border-b border-[#E8E9EE]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Highlight Hero Promo Banner */}
        <div className="rounded-xl bg-[#090E19] text-white p-8 sm:p-12 lg:p-14 shadow-2xl relative overflow-hidden mb-10 border border-[#27324D] text-left">
          <div className="relative z-10 max-w-3xl">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <div
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md text-white font-extrabold text-xs uppercase tracking-wider shadow-sm"
                style={{ backgroundColor: currentMood.color }}
              >
                <Tag className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Promoción Oficial</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#151D30] border border-[#27324D] text-[#E8E9EE] text-xs font-semibold">
                <Clock className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
                <span>Cupos mensuales limitados por agenda técnica</span>
              </div>
            </div>

            <h2 className="text-3xl sm:text-5xl font-black font-display tracking-[-0.04em] text-white leading-[1.06]">
              Color que transforma, ahora con hasta{' '}
              <span style={{ color: currentMood.color }}>20% de descuento</span>.
            </h2>

            <p className="mt-4 text-base sm:text-lg text-[#B8BCC6] leading-relaxed max-w-2xl">
              Pregunta por nuestras promociones en pintura y aplicación.
            </p>

            <p className="mt-2 text-xs sm:text-sm text-[#80828C] max-w-xl">
              Asesoría técnica en sitio, suministro de producto de marcas de confianza y aplicación
              con personal calificado respaldado por garantía por escrito.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
              <button
                type="button"
                id="btn-claim-promo-quote"
                onClick={onQuoteClick}
                className="inline-flex items-center justify-center gap-3 pl-2 pr-6 py-2 min-h-[48px] rounded-md font-bold text-sm sm:text-base text-white shadow-lg hover:opacity-95 transition-all cursor-pointer"
                style={{ backgroundColor: currentMood.color }}
              >
                <span className="w-8 h-8 rounded-sm bg-white flex items-center justify-center shrink-0">
                  <ArrowRight
                    className="w-4 h-4"
                    style={{ color: currentMood.color }}
                    aria-hidden="true"
                  />
                </span>
                <span>Solicitar promoción</span>
              </button>

              <a
                href={buildSafeWhatsAppUrl(
                  BUSINESS_INFO.whatsappNumber,
                  'Hola Ideas & Colores, quiero información sobre la promoción de hasta 20% de descuento en pintura y aplicación.'
                )}
                target="_blank"
                rel="noopener noreferrer"
                id="btn-claim-promo-wa"
                className="px-6 py-3.5 min-h-[48px] rounded-md bg-[#151D30] hover:bg-black text-white font-bold text-sm sm:text-base border border-[#27324D] transition-all flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5 text-emerald-400" aria-hidden="true" />
                <span>Hablar por WhatsApp</span>
              </a>
            </div>

            <div className="mt-6 flex items-center gap-2 text-xs text-[#80828C]">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
              <span>
                Válido para proyectos residenciales, comerciales e industriales en Guatemala.
              </span>
            </div>
          </div>
        </div>

        {/* Individual Promo Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PROMOTIONS_LIST.map((promo) => (
            <div
              key={promo.id}
              className={`rounded-xl p-6 sm:p-7 border flex flex-col justify-between transition-all duration-200 text-left ${
                promo.highlight
                  ? 'bg-[#FFF0E6] border-[#FF5C00]/50 shadow-sm'
                  : 'bg-white border-[#E8E9EE] hover:border-[#090E19]/30'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`text-xs font-extrabold px-3 py-1 rounded-md uppercase tracking-wider ${
                      promo.highlight ? 'text-white shadow-xs' : 'bg-[#090E19] text-white'
                    }`}
                    style={promo.highlight ? { backgroundColor: currentMood.color } : undefined}
                  >
                    {promo.discount}
                  </span>
                  <span className="text-[11px] font-semibold text-[#525663] flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#80828C]" aria-hidden="true" />
                    <span>{promo.validUntil}</span>
                  </span>
                </div>

                <h3 className="text-xl font-black text-[#090E19] font-display tracking-tight mb-2">
                  {promo.title}
                </h3>

                <p className="text-sm text-[#525663] leading-relaxed mb-4">{promo.description}</p>
              </div>

              <div className="pt-4 border-t border-[#E8E9EE]">
                <p className="text-[11px] text-[#80828C] mb-3 italic">* {promo.terms}</p>
                <a
                  href={buildSafeWhatsAppUrl(
                    BUSINESS_INFO.whatsappNumber,
                    `Hola Ideas & Colores, deseo aplicar la promoción: ${promo.title}.`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 min-h-[44px] rounded-md bg-[#090E19] hover:bg-[#151D30] text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                  <span>Aplicar por WhatsApp</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

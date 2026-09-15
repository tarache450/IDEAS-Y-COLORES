import React from 'react';
import { ArrowRight, MessageCircle, Sparkles, ShieldCheck } from 'lucide-react';
import { BUSINESS_INFO } from '../data/content';

interface FinalCTAProps {
  onQuoteClick: () => void;
}

export const FinalCTA: React.FC<FinalCTAProps> = ({ onQuoteClick }) => {
  const directWhatsAppUrl = `https://wa.me/${BUSINESS_INFO.whatsappNumber}?text=Hola%20Ideas%20%26%20Colores%2C%20quiero%20cotizar%20mi%20proyecto.`;

  return (
    <section className="py-20 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white relative overflow-hidden">
      {/* Chromatic ambient glow */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-48 bg-amber-500/15 blur-3xl pointer-events-none rounded-full" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-wider mb-6">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Ideas & Colores Multi-Servicios</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-black font-display tracking-tight text-white leading-tight">
          {BUSINESS_INFO.sloganPrimary}
        </h2>

        <p className="mt-3 text-lg sm:text-2xl font-medium text-amber-300">
          {BUSINESS_INFO.sloganSecondary}
        </p>

        <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          {BUSINESS_INFO.positioning}
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            type="button"
            id="final-cta-quote"
            onClick={onQuoteClick}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-base shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
          >
            <span>Cotiza tu proyecto</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <a
            href={directWhatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            id="final-cta-whatsapp"
            className="w-full sm:w-auto px-7 py-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-base border border-slate-700 transition-all flex items-center justify-center gap-2.5"
          >
            <MessageCircle className="w-5 h-5 text-emerald-400" />
            <span>Hablar por WhatsApp</span>
          </a>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Atención técnica • Personal calificado • Garantía por escrito en productos y mano de obra</span>
        </div>
      </div>
    </section>
  );
};

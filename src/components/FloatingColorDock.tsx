import React from 'react';
import { Palette, Calculator, Tag, MessageCircle, ChevronUp } from 'lucide-react';
import { BUSINESS_INFO } from '../data/content';

interface FloatingColorDockProps {
  onNavigate: (sectionId: string) => void;
  activeSection: string;
}

export const FloatingColorDock: React.FC<FloatingColorDockProps> = ({
  onNavigate,
  activeSection,
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 hidden 2xl:flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-900/90 backdrop-blur-lg border border-slate-700/80 shadow-2xl text-white">
      {/* Estudio de Color */}
      <button
        type="button"
        onClick={() => onNavigate('estudio-color')}
        className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
          activeSection === 'estudio-color'
            ? 'bg-amber-400 text-slate-950 shadow-sm'
            : 'text-slate-300 hover:text-white hover:bg-slate-800'
        }`}
      >
        <Palette className="w-3.5 h-3.5" />
        <span>Estudio de Color</span>
      </button>

      {/* Calculadora */}
      <button
        type="button"
        onClick={() => onNavigate('calculadora')}
        className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
          activeSection === 'calculadora'
            ? 'bg-amber-400 text-slate-950 shadow-sm'
            : 'text-slate-300 hover:text-white hover:bg-slate-800'
        }`}
      >
        <Calculator className="w-3.5 h-3.5" />
        <span>Calculadora</span>
      </button>

      {/* Proyectos */}
      <button
        type="button"
        onClick={() => onNavigate('proyectos')}
        className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
          activeSection === 'proyectos'
            ? 'bg-amber-400 text-slate-950 shadow-sm'
            : 'text-slate-300 hover:text-white hover:bg-slate-800'
        }`}
      >
        <span>Antes & Después</span>
      </button>

      {/* Promo 20% */}
      <button
        type="button"
        onClick={() => onNavigate('promociones')}
        className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
          activeSection === 'promociones'
            ? 'bg-amber-400 text-slate-950 shadow-sm'
            : 'text-amber-400 hover:bg-slate-800'
        }`}
      >
        <Tag className="w-3.5 h-3.5" />
        <span>Promo -20%</span>
      </button>

      {/* Direct WhatsApp Quick Icon */}
      <a
        href={BUSINESS_INFO.whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors shadow-xs"
        title="WhatsApp Inmediato"
      >
        <MessageCircle className="w-4 h-4" />
      </a>

      {/* Back to top */}
      <button
        type="button"
        onClick={scrollToTop}
        className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        title="Volver arriba"
      >
        <ChevronUp className="w-4 h-4" />
      </button>
    </div>
  );
};

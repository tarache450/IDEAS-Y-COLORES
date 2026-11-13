import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { LOGO_SPECTRUM_GRADIENT, LOGO_SPECTRUM_LIST, NAV_PAGE_ACCENTS } from '../utils/logoPalette';

interface SubpageHeroProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  breadcrumbLabel: string;
  accent?: string;
  activeNavId?: string;
  onBackToHome: () => void;
  onNavigateSubpage: (sectionId: string) => void;
  onQuoteClick: () => void;
}

const SUBPAGE_TABS = [
  { id: 'soluciones', label: 'Servicios', accent: NAV_PAGE_ACCENTS.servicios },
  { id: 'proyectos', label: 'Proyectos', accent: NAV_PAGE_ACCENTS.proyectos },
  { id: 'herramientas', label: 'Color & Calculadora', accent: NAV_PAGE_ACCENTS.herramientas },
  { id: 'confianza', label: 'Nosotros', accent: NAV_PAGE_ACCENTS.nosotros },
  { id: 'contacto', label: 'Contacto', accent: NAV_PAGE_ACCENTS.contacto },
];

export const SubpageHero: React.FC<SubpageHeroProps> = ({
  eyebrow,
  title,
  subtitle,
  breadcrumbLabel,
  accent = '#FF5C00',
  activeNavId,
  onBackToHome,
  onNavigateSubpage,
  onQuoteClick,
}) => {
  const prefersReduced = useReducedMotion();
  const isLightAccent = accent === '#FAB82A' || accent === '#00A3FF' || accent === '#10B981';
  const textOnAccent = isLightAccent ? '#090E19' : '#FFFFFF';
  const arrowTint = accent === '#FAB82A' ? '#B45309' : accent;

  return (
    <section className="bg-[#090E19] text-white pt-24 pb-12 sm:pt-28 sm:pb-16 border-b border-[#27324D] relative overflow-hidden">
      <div
        className="h-1 w-full absolute bottom-0 left-0 right-0"
        style={{ background: LOGO_SPECTRUM_GRADIENT }}
        aria-hidden="true"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Return + Subpage Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#27324D]">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackToHome}
              className="min-h-[42px] inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[#151D30] hover:bg-white/10 text-white border border-[#27324D] text-xs font-bold transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              <span>Volver a Servicios</span>
            </button>
            <nav aria-label="Breadcrumb" className="text-xs text-[#80828C] hidden sm:flex items-center gap-1.5">
              <span>Inicio</span>
              <span>/</span>
              <span className="font-bold text-white">{breadcrumbLabel}</span>
            </nav>
          </div>

          <nav aria-label="Subpáginas del sitio" className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 touch-pan-x">
            {SUBPAGE_TABS.map((tab) => {
              const isCurrent = activeNavId === tab.id;
              const tabLight =
                tab.accent === '#FAB82A' || tab.accent === '#00A3FF' || tab.accent === '#10B981';
              return (
                <a
                  key={tab.id}
                  href={`#${tab.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigateSubpage(tab.id);
                  }}
                  className={`min-h-[40px] px-3.5 py-2 rounded-md text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                    isCurrent
                      ? 'shadow-sm'
                      : 'bg-[#151D30] hover:bg-white/10 text-[#B8BCC6] border-[#27324D]'
                  }`}
                  style={
                    isCurrent
                      ? {
                          backgroundColor: tab.accent,
                          borderColor: tab.accent,
                          color: tabLight ? '#090E19' : '#FFFFFF',
                        }
                      : undefined
                  }
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: isCurrent ? (tabLight ? '#090E19' : '#FFFFFF') : tab.accent }}
                  />
                  <span>{tab.label}</span>
                </a>
              );
            })}
          </nav>
        </div>

        {/* Title & Action */}
        <motion.div
          initial={prefersReduced ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 text-left"
        >
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2.5 text-xs font-extrabold uppercase tracking-[0.16em] text-[#B8BCC6]">
              <span className="inline-flex items-center gap-1" aria-hidden="true">
                {LOGO_SPECTRUM_LIST.map((hex) => (
                  <span key={hex} className="w-2 h-2 rounded-xs" style={{ backgroundColor: hex }} />
                ))}
              </span>
              <span style={{ color: accent }}>{eyebrow}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-[-0.04em] leading-[1.05] font-display">
              {title}
              <span style={{ color: accent }}>.</span>
            </h1>

            <p className="text-sm sm:text-base text-[#B8BCC6] leading-relaxed max-w-2xl">
              {subtitle}
            </p>
          </div>

          <button
            type="button"
            onClick={onQuoteClick}
            className="group inline-flex items-center justify-center gap-2.5 pl-2 pr-5 py-2 min-h-[48px] rounded-md font-bold text-xs sm:text-sm shadow-lg hover:opacity-95 transition-all cursor-pointer shrink-0 self-start lg:self-end"
            style={{ backgroundColor: accent, color: textOnAccent }}
          >
            <span className="w-7 h-7 rounded-sm bg-white flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-95">
              <ArrowRight
                className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5"
                style={{ color: arrowTint }}
                aria-hidden="true"
              />
            </span>
            <span>Cotizar proyecto</span>
          </button>
        </motion.div>
      </div>
    </section>
  );
};

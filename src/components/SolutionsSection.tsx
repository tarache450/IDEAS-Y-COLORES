import React, { useState } from 'react';
import {
  Paintbrush,
  Printer,
  Hammer,
  Droplets,
  Sparkles,
  Wrench,
  ArrowRight,
  MessageCircle,
  Layers,
  ChevronRight,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import { MULTI_SERVICES_CATEGORIES, BUSINESS_INFO } from '../data/content';
import { useColorMood } from '../context/ColorMoodContext';
import { SpotlightCard } from './ui/SpotlightCard';
import { StaggeredText } from './ui/StaggeredText';
import { BlurHighlight } from './ui/BlurHighlight';
import FadeIn from './ui/FadeIn';
import { motion, AnimatePresence } from 'motion/react';

interface SolutionsSectionProps {
  onSelectSolution: (solutionTitle: string) => void;
  onOpenCategoryPage?: (categoryId: string) => void;
}

export const SolutionsSection: React.FC<SolutionsSectionProps> = ({
  onSelectSolution,
  onOpenCategoryPage,
}) => {
  const { currentMood } = useColorMood();
  const [activeServiceId, setActiveServiceId] = useState<string>('pintura');

  const iconMap: Record<string, React.ReactNode> = {
    pintura: <Paintbrush className="w-5 h-5" aria-hidden="true" />,
    impresion: <Printer className="w-5 h-5" aria-hidden="true" />,
    carpinteria: <Hammer className="w-5 h-5" aria-hidden="true" />,
    plomeria: <Droplets className="w-5 h-5" aria-hidden="true" />,
    resinas: <Sparkles className="w-5 h-5" aria-hidden="true" />,
    instalaciones: <Wrench className="w-5 h-5" aria-hidden="true" />,
  };

  const activeService =
    MULTI_SERVICES_CATEGORIES.find((c) => c.id === activeServiceId) ||
    MULTI_SERVICES_CATEGORIES[0];

  return (
    <section id="soluciones" className="py-20 sm:py-24 bg-transparent border-b border-slate-200/50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <FadeIn direction="up" distance={24}>
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-800 shadow-2xs mb-3">
              <Layers className="w-3.5 h-3.5" style={{ color: currentMood.color }} aria-hidden="true" />
              <span>6 Divisiones Especializadas • Páginas Dedicadas</span>
            </div>

            <StaggeredText
              text="Soluciones técnicas integrales para tus espacios."
              as="h2"
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tight font-display"
            />

            <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Ideas &amp; Colores transforma, protege y mantiene espacios con{' '}
              <BlurHighlight color={currentMood.color}>
                un solo interlocutor de confianza con garantía por escrito
              </BlurHighlight>. Explora cada categoría o abre su ficha técnica completa.
            </p>
          </div>
        </FadeIn>

        {/* Interactive List + Sticky Architectural Visual Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column (7 cols): Interactive Services Master List */}
          <div className="lg:col-span-7 space-y-3.5">
            {MULTI_SERVICES_CATEGORIES.map((cat) => {
              const isSelected = activeServiceId === cat.id;
              const icon = iconMap[cat.id];

              return (
                <div
                  key={cat.id}
                  onClick={() => setActiveServiceId(cat.id)}
                  onMouseEnter={() => setActiveServiceId(cat.id)}
                  className={`rounded-3xl border p-5 sm:p-6 transition-all duration-300 cursor-pointer relative overflow-hidden text-left ${
                    isSelected
                      ? 'bg-white border-slate-300 shadow-lg ring-1 ring-slate-200'
                      : 'bg-white/60 hover:bg-white border-slate-200/80 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  {/* Active indicator border strip */}
                  {isSelected && (
                    <motion.div
                      layoutId="active-service-strip"
                      className="absolute left-0 top-0 bottom-0 w-1.5"
                      style={{ backgroundColor: cat.accentColor }}
                      transition={{ duration: 0.25 }}
                    />
                  )}

                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-transform shrink-0 ${
                          isSelected ? 'scale-105 shadow-sm text-white' : 'bg-slate-100 text-slate-700'
                        }`}
                        style={{
                          backgroundColor: isSelected ? cat.accentColor : undefined,
                        }}
                      >
                        {icon}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-slate-400">
                            {cat.number}
                          </span>
                          <h3 className="text-base sm:text-lg font-bold text-slate-950 font-display">
                            {cat.title}
                          </h3>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-500 line-clamp-1 mt-0.5">
                          {cat.tagline}
                        </p>
                      </div>
                    </div>

                    <ChevronRight
                      className={`w-5 h-5 shrink-0 transition-transform duration-200 ${
                        isSelected ? 'rotate-90 text-slate-900' : 'text-slate-300'
                      }`}
                      aria-hidden="true"
                    />
                  </div>

                  {/* Expanded Content when active */}
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="pt-4 mt-4 border-t border-slate-100 overflow-hidden"
                      >
                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                          {cat.description}
                        </p>

                        {/* Mobile only inline image */}
                        <div className="lg:hidden rounded-2xl overflow-hidden aspect-[16/10] mb-4 bg-slate-900">
                          <img
                            src={cat.image}
                            alt={cat.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            decoding="async"
                            width="480"
                            height="300"
                          />
                        </div>

                        {/* Surface / Speciality pills */}
                        <div className="mb-4">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block mb-2">
                            Superficies y aplicaciones principales:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {cat.surfacesOrApps.map((s) => (
                              <span
                                key={s}
                                className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200/60"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex flex-wrap items-center gap-2.5 pt-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectSolution(cat.title);
                            }}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white shadow-sm hover:opacity-95 transition-all"
                            style={{ backgroundColor: cat.accentColor }}
                          >
                            <span>{cat.ctaText}</span>
                            <ArrowRight className="w-4 h-4" aria-hidden="true" />
                          </button>

                          {onOpenCategoryPage && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenCategoryPage(cat.id);
                              }}
                              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-300/80 transition-colors"
                            >
                              <span>Ver subpágina y ficha técnica</span>
                              <ExternalLink className="w-3.5 h-3.5 text-slate-600" aria-hidden="true" />
                            </button>
                          )}

                          <a
                            href={`https://wa.me/${BUSINESS_INFO.whatsappNumber}?text=Hola%20Ideas%20%26%20Colores%2C%20quiero%20cotizar%20el%20servicio%20de%20${encodeURIComponent(
                              cat.title
                            )}.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl font-bold text-xs text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 transition-colors"
                          >
                            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                            <span>WhatsApp</span>
                          </a>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* Right Column (5 cols): Sticky Architectural Live Preview */}
          <div className="hidden lg:block lg:col-span-5 sticky top-24">
            <SpotlightCard
              spotlightColor={`${activeService.accentColor}25`}
              className="rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl relative text-left"
            >
              {/* Photo preview with smooth crossfade */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-950">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeService.id}
                    src={activeService.image}
                    alt={activeService.title}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35 }}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    width="520"
                    height="390"
                  />
                </AnimatePresence>

                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent pointer-events-none" />

                {/* Top service number badge */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                  <span
                    className="text-xs font-black px-3.5 py-1.5 rounded-full text-white shadow-md backdrop-blur-md"
                    style={{ backgroundColor: activeService.accentColor }}
                  >
                    Línea {activeService.number}
                  </span>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white border border-white/20">
                    Ideas &amp; Colores GT
                  </span>
                </div>

                {/* Bottom photo overlay caption */}
                <div className="absolute bottom-4 left-4 right-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300 block mb-1">
                    Especialidad Activa
                  </span>
                  <h4 className="text-xl font-bold font-display text-white">
                    {activeService.title}
                  </h4>
                </div>
              </div>

              {/* Card Body Information */}
              <div className="p-6 space-y-4 text-white bg-slate-950">
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {activeService.tagline}
                </p>

                {/* Lines / Subservices */}
                <div className="pt-2 border-t border-slate-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                    Líneas disponibles:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeService.linesOrServices.map((l) => (
                      <span
                        key={l}
                        className="text-[11px] font-medium px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-200 border border-slate-700"
                      >
                        {l}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Guarantee assurance */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center gap-2 text-xs text-slate-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
                  <span>Personal calificado con garantía por escrito.</span>
                </div>

                {/* Direct Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => onSelectSolution(activeService.title)}
                    className="py-3 px-4 rounded-xl font-bold text-xs text-white shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-1.5"
                    style={{ backgroundColor: activeService.accentColor }}
                  >
                    <span>Cotizar {activeService.shortTitle}</span>
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>

                  {onOpenCategoryPage && (
                    <button
                      type="button"
                      onClick={() => onOpenCategoryPage(activeService.id)}
                      className="py-3 px-4 rounded-xl font-bold text-xs text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 transition-all flex items-center justify-center gap-1.5"
                    >
                      <span>Abrir página dedicada</span>
                      <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  )}
                </div>
              </div>
            </SpotlightCard>
          </div>
        </div>
      </div>
    </section>
  );
};

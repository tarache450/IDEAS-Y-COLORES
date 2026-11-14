import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  ArrowRight,
  MessageCircle,
  ShieldCheck,
  Palette,
  Star,
  ExternalLink,
} from 'lucide-react';
import { BUSINESS_INFO, MULTI_SERVICES_CATEGORIES } from '../data/content';
import { useColorMood } from '../context/ColorMoodContext';
import { MoodColorPicker } from './MoodColorPicker';
import { NumberTicker } from './ui/NumberTicker';
import { assetUrl } from '../utils/asset';
import {
  LOGO_SPECTRUM_GRADIENT,
  LOGO_SPECTRUM_LIST,
  getCategoryLogoTheme,
} from '../utils/logoPalette';

interface HeroProps {
  onQuoteClick: () => void;
  onExploreColorsClick: () => void;
  onExploreServicesClick?: () => void;
  onOpenCategoryPage?: (categoryId: string) => void;
}

export const Hero: React.FC<HeroProps> = ({
  onQuoteClick,
  onExploreColorsClick,
  onExploreServicesClick,
  onOpenCategoryPage,
}) => {
  const { currentMood, activeMood } = useColorMood();
  const prefersReduced = useReducedMotion();

  const moodShowcases = {
    naranja: {
      image: assetUrl('hero-interior-sala-mobile.webp'),
      srcSet: `${assetUrl('hero-interior-sala-mobile.webp')} 800w, ${assetUrl('hero-interior-sala.webp')} 1200w`,
      title: 'Residencia Carretera a El Salvador Km 21.5',
      caption: 'Pintura Airless + Acabados Arquitectónicos',
    },
    azul: {
      image: assetUrl('studio/color-studio-azul-profundo.webp'),
      srcSet: undefined,
      title: 'Estudio Contemporáneo Zona 14',
      caption: 'Azul Naval & Iluminación 3000K',
    },
    amarillo: {
      image: assetUrl('studio/color-studio-neutros-calidos.webp'),
      srcSet: undefined,
      title: 'Condominio Santa Catarina Pinula',
      caption: 'Neutros Cálidos Lavables Bajo Olor',
    },
    celeste: {
      image: assetUrl('studio/color-studio-terracota-coral.webp'),
      srcSet: undefined,
      title: 'Comedor Residencial Fraijanes',
      caption: 'Muros de Acento & Protección UV',
    },
  }[activeMood];

  return (
    <section
      id="inicio"
      className="relative bg-[#090E19] text-white pt-24 pb-16 sm:pt-32 sm:pb-32 lg:pt-36 lg:pb-36 overflow-hidden"
    >
      {/* Mobile-first background framing & guaranteed high-contrast dark scrim */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-[#090E19]" aria-hidden="true">
        <div className="w-full h-full opacity-35 sm:opacity-75 transition-opacity">
          <motion.img
            key={moodShowcases.image}
            initial={prefersReduced ? false : { scale: 1.06 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.25, ease: [0.22, 1, 0.36, 1] }}
            src={moodShowcases.image}
            srcSet={moodShowcases.srcSet}
            sizes="100vw"
            width={1200}
            height={670}
            alt={`${moodShowcases.title} — ${moodShowcases.caption} por Ideas & Colores Guatemala`}
            className="w-full h-full object-cover object-[72%_25%] sm:object-center"
            fetchPriority="high"
            loading="eager"
            decoding="async"
          />
        </div>
        {/* Browser-safe rgba veil so mobile white text stays crisp regardless of iOS/Brave dark-mode engines */}
        <div
          className="sm:hidden absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(9, 14, 25, 0.88) 0%, rgba(9, 14, 25, 0.78) 42%, rgba(9, 14, 25, 0.94) 100%)',
          }}
        />
        <div
          className="sm:hidden absolute inset-0 opacity-20"
          style={{
            background: `radial-gradient(circle at 80% 18%, ${currentMood.color}, transparent 62%)`,
          }}
        />
        {/* Desktop architectural vignette */}
        <div
          className="hidden sm:block absolute inset-0"
          style={{
            background:
              'linear-gradient(90deg, rgba(9, 14, 25, 0.95) 0%, rgba(9, 14, 25, 0.80) 52%, rgba(9, 14, 25, 0.42) 100%)',
          }}
        />
        <div
          className="hidden sm:block absolute inset-0"
          style={{
            background:
              'linear-gradient(0deg, rgba(9, 14, 25, 0.92) 0%, rgba(9, 14, 25, 0) 45%, rgba(9, 14, 25, 0.68) 100%)',
          }}
        />
      </div>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl space-y-5 sm:space-y-6 text-left">
          {/* Multicolor Logo Spectrum Eyebrow Badge */}
          <div
            className="inline-flex items-center gap-2.5 sm:gap-3 px-3 py-1.5 rounded-md backdrop-blur-md border border-white/20 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-100 max-w-full"
            style={{ backgroundColor: 'rgba(15, 23, 42, 0.82)' }}
          >
            <span className="inline-flex items-center gap-1 shrink-0" aria-hidden="true">
              {LOGO_SPECTRUM_LIST.map((hex) => (
                <span
                  key={hex}
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: hex }}
                />
              ))}
            </span>
            <span className="truncate">6 Divisiones • Garantía Escrita</span>
          </div>

          {/* Primary Display H1 */}
          <h1
            className="text-[34px] sm:text-5xl lg:text-[62px] font-black text-white tracking-[-0.04em] leading-[1.06] sm:leading-[1.03] font-display text-balance"
          >
            Color que transforma espacios
            <span style={{ color: currentMood.color }}>.</span>
            <span className="sr-only">
              {' '}
              — Pintura Profesional Airless, Impermeabilización Técnica de Losas, Hidrolavado a
              Presión, Resinas Epóxicas y Entrega de Pintura a Domicilio en Ciudad de Guatemala y
              Carretera a El Salvador | Ideas &amp; Colores Guatemala
            </span>
          </h1>

          {/* Animated Logo Spectrum Accent Rule */}
          <div
            style={{ background: LOGO_SPECTRUM_GRADIENT, transformOrigin: 'left' }}
            className="h-1 w-24 sm:w-32 rounded-full"
            aria-hidden="true"
          />

          {/* Focused Services Lead Copy */}
          <p
            className="text-[15px] sm:text-xl text-slate-200 max-w-2xl font-normal leading-relaxed"
          >
            Pintura con <strong className="text-white font-semibold">sistema Airless</strong>,
            impresión digital, carpintería a medida, plomería técnica, pisos epóxicos e
            instalaciones generales en{' '}
            <strong className="text-white font-semibold">Carretera a El Salvador y toda Guatemala</strong>.
          </p>

          {/* Primary Roofera CTA Row — Zero awkward text wrap on phones */}
          <div
            className="pt-1 flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3.5"
          >
            {onExploreServicesClick ? (
              <button
                type="button"
                id="hero-btn-services"
                onClick={onExploreServicesClick}
                className="group inline-flex items-center justify-center sm:justify-start gap-3 pl-2 pr-5 py-2 min-h-[50px] sm:min-h-[54px] rounded-md font-bold text-sm sm:text-base shadow-xl hover:-translate-y-0.5 active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
                style={{
                  backgroundColor: currentMood.color,
                  color: currentMood.textColorOnAccent,
                }}
              >
                <span
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-sm bg-white flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-95"
                  style={{ backgroundColor: '#FFFFFF' }}
                >
                  <ArrowRight
                    className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5"
                    style={{ color: currentMood.color }}
                    aria-hidden="true"
                  />
                </span>
                <span className="sm:hidden">Ver 6 servicios</span>
                <span className="hidden sm:inline">Explorar nuestros 6 servicios</span>
              </button>
            ) : (
              <button
                type="button"
                id="hero-btn-services"
                onClick={onQuoteClick}
                className="group inline-flex items-center justify-center sm:justify-start gap-3 pl-2 pr-5 py-2 min-h-[50px] sm:min-h-[54px] rounded-md font-bold text-sm sm:text-base shadow-xl hover:-translate-y-0.5 active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
                style={{
                  backgroundColor: currentMood.color,
                  color: currentMood.textColorOnAccent,
                }}
              >
                <span
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-sm bg-white flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-95"
                  style={{ backgroundColor: '#FFFFFF' }}
                >
                  <ArrowRight
                    className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5"
                    style={{ color: currentMood.color }}
                    aria-hidden="true"
                  />
                </span>
                <span>Cotizar gratis</span>
              </button>
            )}

            <div className="grid grid-cols-2 gap-2.5 sm:contents">
              <button
                type="button"
                id="hero-btn-quote"
                onClick={onQuoteClick}
                className="inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-3 min-h-[48px] sm:min-h-[54px] rounded-md text-white font-bold text-xs sm:text-base border border-white/25 transition-all cursor-pointer whitespace-nowrap hover:opacity-90"
                style={{ backgroundColor: 'rgba(15, 23, 42, 0.85)' }}
              >
                <span>Cotizar</span>
                <span className="hidden sm:inline">proyecto</span>
              </button>

              <a
                href={BUSINESS_INFO.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                id="hero-btn-whatsapp"
                className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-3 min-h-[48px] sm:min-h-[54px] rounded-md text-emerald-300 font-bold text-xs sm:text-sm border border-emerald-400/40 transition-all whitespace-nowrap hover:opacity-90"
                style={{ backgroundColor: 'rgba(6, 78, 59, 0.82)' }}
              >
                <MessageCircle className="w-4 h-4 text-emerald-300 shrink-0" aria-hidden="true" />
                <span>WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={onExploreColorsClick}
                className="col-span-2 sm:col-span-1 inline-flex items-center justify-center gap-2 px-4 py-3 min-h-[46px] sm:min-h-[54px] rounded-md text-slate-100 hover:text-white font-semibold text-xs sm:text-sm border border-[#27324D] transition-all cursor-pointer whitespace-nowrap hover:opacity-95"
                style={{ backgroundColor: 'rgba(21, 29, 48, 0.92)' }}
              >
                <Palette className="w-4 h-4 shrink-0" style={{ color: '#00A3FF' }} aria-hidden="true" />
                <span>Simulador de color</span>
              </button>
            </div>
          </div>

          {/* Direct Category Page Quick-Jump Chips: Horizontal swipe rail on mobile, wrap on desktop */}
          {onOpenCategoryPage && (
            <div className="pt-1 sm:pt-2">
              <span className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-300 block mb-2.5">
                Categorías de servicio:
              </span>
              <div className="flex sm:flex-wrap gap-2 overflow-x-auto snap-x snap-mandatory pb-1.5 -mx-4 px-4 sm:mx-0 sm:px-0 touch-pan-x no-scrollbar">
                {MULTI_SERVICES_CATEGORIES.map((cat) => {
                  const catTheme = getCategoryLogoTheme(cat.id, cat.accentColor);
                  return (
                    <a
                      key={cat.id}
                      href={`/servicios/${cat.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        onOpenCategoryPage(cat.id);
                      }}
                      className="group shrink-0 snap-start whitespace-nowrap inline-flex items-center gap-2 px-3 py-2 min-h-[40px] rounded-md bg-[#151D30]/90 hover:bg-[#090E19] border border-white/15 hover:border-white/45 text-xs font-semibold text-white backdrop-blur-md transition-all hover:-translate-y-0.5"
                    >
                      <span
                        className="w-2 h-2 rounded-full shrink-0 transition-transform group-hover:scale-125"
                        style={{ backgroundColor: catTheme.accent }}
                      />
                      <span
                        className="font-mono font-extrabold text-[10px]"
                        style={{ color: catTheme.accent }}
                      >
                        {cat.number}
                      </span>
                      <span>{cat.shortTitle}</span>
                      <ExternalLink
                        className="w-3 h-3 text-slate-400 group-hover:text-white transition-colors"
                        aria-hidden="true"
                      />
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* Metrics & Mood Switcher — Clean 2-column alignment on mobile */}
          <div
            className="pt-4 sm:pt-5 border-t border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6"
          >
            <div className="grid grid-cols-2 sm:flex sm:items-center gap-4 sm:gap-8">
              <div className="flex items-center gap-2">
                <div className="flex items-center text-amber-400 shrink-0" aria-hidden="true">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <div className="text-[11px] sm:text-xs leading-tight">
                  <strong className="text-white block font-bold">
                    {BUSINESS_INFO.googleRating} / 5 Google
                  </strong>
                  <span className="text-slate-300">Verificados</span>
                </div>
              </div>

              <div className="h-7 w-px bg-white/15 hidden sm:block" />

              <div className="flex items-center gap-2 text-[11px] sm:text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
                <div className="leading-tight">
                  <strong className="text-white block font-bold">
                    +<NumberTicker value={500} /> Proyectos
                  </strong>
                  <span className="text-slate-300">Desde {BUSINESS_INFO.foundationYear}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-start gap-3 px-3.5 py-2 rounded-lg bg-[#151D30]/85 border border-[#27324D] backdrop-blur-md">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                Color acento:
              </span>
              <MoodColorPicker variant="compact" className="mobile-mood-picker" />
            </div>
          </div>
        </div>
      </div>

      {/* Roofera Signature Angular Chevron Divider with Official Logo Spectrum Stroke */}
      <div
        className="absolute bottom-0 left-0 right-0 z-10 w-full overflow-hidden leading-none pointer-events-none"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 1440 72"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-10 sm:h-14 lg:h-[68px] block"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="logoChevronGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0059FF" />
              <stop offset="34%" stopColor="#00A3FF" />
              <stop offset="68%" stopColor="#FAB82A" />
              <stop offset="100%" stopColor="#FF5C00" />
            </linearGradient>
          </defs>
          <path d="M0 0L720 62L1440 0V72H0V0Z" fill="#090E19" />
          <path d="M0 0L720 62L1440 0" stroke="url(#logoChevronGrad)" strokeWidth="3.5" />
        </svg>
      </div>
    </section>
  );
};

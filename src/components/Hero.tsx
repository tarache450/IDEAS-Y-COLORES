import React from 'react';
import {
  ArrowRight,
  MessageCircle,
  ShieldCheck,
  Truck,
  CheckCircle2,
  Palette,
  Award,
} from 'lucide-react';
import { BUSINESS_INFO } from '../data/content';
import { useColorMood } from '../context/ColorMoodContext';
import { MoodColorPicker } from './MoodColorPicker';
import { NumberTicker } from './ui/NumberTicker';
import FadeIn from './ui/FadeIn';
import { motion, AnimatePresence } from 'motion/react';

interface HeroProps {
  onQuoteClick: () => void;
  onExploreColorsClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onQuoteClick, onExploreColorsClick }) => {
  const { currentMood, activeMood } = useColorMood();

  // Curated architectural project showcase photos corresponding to the 4 moods
  const moodShowcases = {
    azul: {
      image: '/studio/color-studio-azul-profundo.jpg',
      title: 'Estudio Contemporáneo Zona 14',
      tag: 'Pintura Arquitectónica & Asesoría',
      tone: 'Azul Naval & Nogal Cálido',
      desc: 'Acabado mate de alta cobertura con iluminación arquitectónica 3000K.',
    },
    naranja: {
      image: '/studio/color-studio-terracota-coral.jpg',
      title: 'Comedor Residencial Carretera a El Salvador',
      tag: 'Muros de Acento & Calidez',
      tone: 'Terracota Orgánico & Roble',
      desc: 'Pigmentación uniforme resistente a luz solar con textura aterciopelada.',
    },
    amarillo: {
      image: '/studio/color-studio-neutros-calidos.jpg',
      title: 'Dormitorio Master Condominio',
      tag: 'Luz Natural & Sensación de Amplitud',
      tone: 'Arena Suave & Greige Cálido',
      desc: 'Pintura lavable de ultra bajo olor y acabado sedoso.',
    },
    celeste: {
      image: '/hero-interior-sala.jpg',
      title: 'Sala Panorámica Carretera a El Salvador',
      tag: 'Integración Visual & Armonía',
      tone: 'Off-White & Greige Arquitectónico',
      desc: 'Transición limpia en zócalos, esquinas perfectas y máxima luminosidad.',
    },
  }[activeMood];

  return (
    <section
      id="inicio"
      className="relative overflow-hidden bg-transparent pt-5 pb-16 md:pt-9 md:pb-24 border-b border-white/45 transition-colors duration-700"
    >

      {/* Atmospheric Ambient Glow centered on the active brand mood */}
      <div
        className="absolute top-1/4 left-1/3 w-[550px] h-[550px] rounded-full blur-3xl pointer-events-none transition-all duration-700 -z-10 opacity-60"
        style={{
          background: `radial-gradient(circle, ${currentMood.glow} 0%, transparent 70%)`,
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Core Copy & CTAs — staggered entrance via FadeIn */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Eyebrow badge */}
            <FadeIn delay={0.05} direction="up" distance={20}>
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-slate-200 shadow-xs text-xs font-semibold">
                <span
                  className="w-2.5 h-2.5 rounded-full transition-colors duration-500 animate-pulse"
                  style={{ backgroundColor: currentMood.color }}
                />
                <span className="font-medium text-slate-800">Ideas & Colores Multi-Servicios • Guatemala</span>
                <span className="hidden sm:inline text-slate-300">|</span>
                <span className="hidden sm:inline font-bold" style={{ color: currentMood.color }}>
                  {currentMood.name}
                </span>
              </div>
            </FadeIn>

            {/* Main H1 Title */}
            <FadeIn delay={0.12} direction="up" distance={24}>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-950 tracking-[-0.035em] leading-[1.04] font-display text-balance">
                Color que <br className="hidden sm:inline" />
                <span className="relative inline-block text-slate-950 mr-2">
                  transforma
                  {/* Dynamic brand brush stroke curve underneath */}
                  <svg
                    className="absolute -bottom-2.5 left-0 w-full h-3.5 opacity-90 transition-colors duration-500"
                    style={{ color: currentMood.color }}
                    viewBox="0 0 200 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M2 10C50 3 150 2 198 9"
                      stroke="currentColor"
                      strokeWidth="5"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                <span>espacios.</span>
              </h1>
            </FadeIn>

            {/* Subtitle / Lead Description */}
            <FadeIn delay={0.20} direction="up" distance={20}>
              <div className="space-y-2">
                <p className="text-xl sm:text-2xl text-slate-800 font-semibold tracking-tight">
                  Pintura, mantenimiento y soluciones para cada espacio.
                </p>
                <p className="text-base sm:text-lg text-slate-600 max-w-2xl font-normal leading-relaxed">
                  Transformamos, protegemos y mantenemos tus espacios con asesoría técnica personalizada,
                  suministro de marcas reconocidas y personal calificado de principio a fin.
                </p>
              </div>
            </FadeIn>

            {/* Interactive Mood Selector Bar */}
            <FadeIn delay={0.27} direction="up" distance={16} className="hidden sm:block">
              <MoodColorPicker variant="full" className="max-w-2xl" />
            </FadeIn>

            {/* Value Checkpoints */}
            <FadeIn delay={0.32} direction="up" distance={16} className="hidden sm:block">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Asesoría técnica en sitio</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Garantía por escrito</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <Truck className="w-4 h-4 text-sky-600 shrink-0" />
                  <span>Personal calificado</span>
                </div>
              </div>
            </FadeIn>

            {/* CTAs */}
            <FadeIn delay={0.38} direction="up" distance={16}>
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                {/* Primary CTA with dynamic color and shimmer */}
                <button
                  type="button"
                  id="hero-btn-quote"
                  onClick={onQuoteClick}
                  className="group relative inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl text-base font-bold shadow-[0_12px_22px_-15px_rgba(15,23,42,0.62)] hover:shadow-[0_16px_28px_-16px_rgba(15,23,42,0.7)] transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 overflow-hidden"
                  style={{
                    backgroundColor: currentMood.color,
                    color: currentMood.textColorOnAccent,
                    boxShadow: `0 4px 16px ${currentMood.glow}`,
                  }}
                >
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  <span className="relative">Cotiza tu proyecto</span>
                  <ArrowRight className="w-5 h-5 relative transition-transform duration-200 group-hover:translate-x-0.5" />
                </button>

                {/* Secondary CTA: WhatsApp */}
                <a
                  href={BUSINESS_INFO.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  id="hero-btn-whatsapp"
                  className="inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl text-base font-semibold text-emerald-800 bg-white/72 hover:bg-emerald-50/88 border border-white/75 shadow-[0_10px_22px_-20px_rgba(15,23,42,0.5)] backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
                >
                  <MessageCircle className="w-5 h-5 text-emerald-600" />
                  <span>Hablar por WhatsApp</span>
                </a>
              </div>
            </FadeIn>

            {/* Partner trust note + social proof */}
            <FadeIn delay={0.44} direction="up" distance={12}>
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">Respaldo de marca:</span>
                  <span>
                    Soluciones y recubrimientos oficiales con respaldo {BUSINESS_INFO.partnerBrand}.
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                  <div className="flex items-center gap-1">
                    <span className="text-amber-400 text-sm leading-none">★★★★★</span>
                    <NumberTicker value={4.9} decimals={1} className="font-extrabold text-slate-900 ml-1" />
                    <span className="text-slate-500">/5</span>
                  </div>
                  <span className="text-slate-300">|</span>
                  <div className="flex items-center gap-1 font-medium text-slate-700">
                    <span>+</span>
                    <NumberTicker value={250} className="font-bold text-slate-900" />
                    <span>proyectos entregados en Carretera a El Salvador y toda Guatemala</span>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>

          {/* Right Column: Architectural Visual Composition responding to mood */}
          <FadeIn delay={0.22} direction="right" distance={32} className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Main architectural photo card with smooth crossfade */}
              <div
                className="relative rounded-3xl overflow-hidden shadow-2xl border-4 transition-all duration-700 bg-slate-900 group aspect-[4/4.8] sm:aspect-[4/4.5]"
                style={{
                  borderColor: currentMood.borderColor,
                  boxShadow: `0 20px 40px -15px ${currentMood.glow}`,
                }}
              >
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeMood}
                    src={moodShowcases.image}
                    alt={moodShowcases.title}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="w-full h-full object-cover"
                    loading="eager"
                  />
                </AnimatePresence>

                {/* Subtle vignette gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent pointer-events-none" />

                {/* Top architectural chip */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                  <span
                    className="text-[11px] font-bold px-3 py-1 rounded-full shadow-md backdrop-blur-md transition-colors duration-400"
                    style={{
                      backgroundColor: currentMood.color,
                      color: currentMood.textColorOnAccent,
                    }}
                  >
                    {moodShowcases.tag}
                  </span>
                  <span className="text-[10px] font-semibold text-white/90 bg-slate-900/70 backdrop-blur-md px-2.5 py-1 rounded-full">
                    Guatemala
                  </span>
                </div>

                {/* Bottom detail card */}
                <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-white/40 shadow-lg text-left">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-black text-slate-900 font-display">
                      {moodShowcases.title}
                    </span>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-md"
                      style={{
                        backgroundColor: currentMood.lightBg,
                        color: currentMood.id === 'amarillo' ? '#854D0E' : currentMood.color,
                      }}
                    >
                      {moodShowcases.tone}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug line-clamp-2">
                    {moodShowcases.desc}
                  </p>
                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                    <span>Mano de obra certificada</span>
                    <button
                      type="button"
                      onClick={onExploreColorsClick}
                      className="font-bold hover:underline flex items-center gap-1"
                      style={{ color: currentMood.color }}
                    >
                      <Palette className="w-3 h-3" />
                      <span>Ver paleta completa</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Floating verified badge */}
              <div className="absolute -bottom-5 -left-4 sm:-left-6 bg-white rounded-2xl p-3.5 shadow-xl border border-slate-200/90 flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0 transition-colors duration-400"
                  style={{ backgroundColor: currentMood.color }}
                >
                  <Award className="w-6 h-6" style={{ color: currentMood.textColorOnAccent }} />
                </div>
                <div className="text-left">
                  <div className="text-sm font-black text-slate-900 leading-none">
                    +500 Proyectos
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Ejecutados con garantía por escrito
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
};

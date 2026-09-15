import React from 'react';
import {
  ArrowRight,
  MessageCircle,
  ShieldCheck,
  Truck,
  CheckCircle2,
  Palette,
  Sparkles,
  Award,
} from 'lucide-react';
import { BUSINESS_INFO } from '../data/content';
import { useColorMood } from '../context/ColorMoodContext';
import { HeroBrushBackground } from './HeroBrushBackground';
import { MoodColorPicker } from './MoodColorPicker';

interface HeroProps {
  onQuoteClick: () => void;
  onExploreColorsClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onQuoteClick, onExploreColorsClick }) => {
  const { currentMood, activeMood, setMood, allMoods } = useColorMood();

  // Curated architectural project showcase photos corresponding to the 4 moods
  const moodShowcases = {
    azul: {
      image:
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85',
      title: 'Residencia Carretera a El Salvador',
      tag: 'Pintura Arquitectónica & Asesoría',
      tone: 'Azul Naval & Gris Cemento',
      desc: 'Protección hidrófuga y acabado satinado de alta reflectancia lumínica.',
    },
    naranja: {
      image:
        'https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&w=1200&q=85',
      title: 'Villa Colonial en Antigua Guatemala',
      tag: 'Restauración & Acabados Cálidos',
      tone: 'Terracota Volcánico & Arcilla',
      desc: 'Pigmentos resistentes al clima y humedad con textura mineral mate.',
    },
    amarillo: {
      image:
        'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1200&q=85',
      title: 'Penthouse Contemporáneo Zona 14',
      tag: 'Luz Natural & Sensación de Amplitud',
      tone: 'Latte Cálido & Arena Solar',
      desc: 'Micro-pigmentación sedosa que multiplica la iluminación natural.',
    },
    celeste: {
      image:
        'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=85',
      title: 'Oficinas Corporativas Zona 10',
      tag: 'Espacios Biofílicos & Armonía',
      tone: 'Brisa Andina & Blanco Óptico',
      desc: 'Cero olor, bajo VOC y máxima lavabilidad para áreas de alto tránsito.',
    },
  }[activeMood];

  return (
    <section
      id="inicio"
      className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50/70 to-slate-100/80 pt-8 pb-16 md:pt-14 md:pb-24 border-b border-slate-200/80 transition-colors duration-700"
    >
      {/* 21st.dev Reactive Fluid Brush Shader Background */}
      <HeroBrushBackground />

      {/* Atmospheric Ambient Glow centered on the active brand mood */}
      <div
        className="absolute top-1/4 left-1/3 w-[550px] h-[550px] rounded-full blur-3xl pointer-events-none transition-all duration-700 -z-10 opacity-60"
        style={{
          background: `radial-gradient(circle, ${currentMood.glow} 0%, transparent 70%)`,
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Core Copy & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Eyebrow badge with active color pulse */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-slate-200 shadow-xs text-xs font-semibold">
              <span
                className="w-2.5 h-2.5 rounded-full transition-colors duration-500 animate-pulse"
                style={{ backgroundColor: currentMood.color }}
              />
              <span className="text-slate-800 font-medium">
                Ideas & Colores Multi-Servicios • Guatemala
              </span>
              <span className="hidden sm:inline text-slate-300">|</span>
              <span className="hidden sm:inline font-bold" style={{ color: currentMood.color }}>
                {currentMood.name}
              </span>
            </div>

            {/* Main H1 Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-950 tracking-tight leading-[1.08] font-display">
              Color que <br className="hidden sm:inline" />
              <span className="relative inline-block text-slate-950">
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
              </span>{' '}
              espacios.
            </h1>

            {/* Subtitle / Lead Description (Verified copy from prompt) */}
            <div className="space-y-2">
              <p className="text-xl sm:text-2xl text-slate-800 font-semibold tracking-tight">
                Pintura, mantenimiento y soluciones para cada espacio.
              </p>
              <p className="text-base sm:text-lg text-slate-600 max-w-2xl font-normal leading-relaxed">
                Transformamos, protegemos y mantenemos tus espacios con asesoría técnica personalizada,
                suministro de marcas reconocidas y personal calificado de principio a fin.
              </p>
            </div>

            {/* 21st.dev Interactive Mood Selector Bar right in Hero */}
            <MoodColorPicker variant="full" className="max-w-xl" />

            {/* Value Checkpoints */}
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

            {/* CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
              {/* Primary CTA with dynamic color and shimmer */}
              <button
                type="button"
                id="hero-btn-quote"
                onClick={onQuoteClick}
                className="group relative inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl text-base font-bold shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 overflow-hidden"
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
                className="inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl text-base font-semibold text-emerald-800 bg-white hover:bg-emerald-50 border border-emerald-200 shadow-xs transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
              >
                <MessageCircle className="w-5 h-5 text-emerald-600" />
                <span>Hablar por WhatsApp</span>
              </a>
            </div>

            {/* Partner trust note */}
            <div className="pt-1 flex items-center gap-2 text-xs text-slate-500">
              <span className="font-semibold text-slate-700">Respaldo de marca:</span>
              <span>
                Soluciones y recubrimientos oficiales con respaldo {BUSINESS_INFO.partnerBrand}.
              </span>
            </div>
          </div>

          {/* Right Column: Architectural Visual Composition responding to mood */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Main architectural photo card */}
              <div
                className="relative rounded-3xl overflow-hidden shadow-2xl border-4 transition-all duration-700 bg-slate-900 group aspect-[4/4.8] sm:aspect-[4/4.5]"
                style={{
                  borderColor: currentMood.borderColor,
                  boxShadow: `0 20px 40px -15px ${currentMood.glow}`,
                }}
              >
                <img
                  src={moodShowcases.image}
                  alt={moodShowcases.title}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  loading="eager"
                />

                {/* Subtle vignette gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />

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
          </div>
        </div>
      </div>
    </section>
  );
};

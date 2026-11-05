import React from 'react';
import {
  Building2,
  CheckCircle2,
  Star,
  ExternalLink,
} from 'lucide-react';
import { BUSINESS_INFO, EXPERIENCE_CLIENTS } from '../data/content';
import { useColorMood } from '../context/ColorMoodContext';
import { SpotlightCard } from './ui/SpotlightCard';
import { GoogleIcon } from './ui/GoogleIcon';
import FadeIn from './ui/FadeIn';

export const TestimonialsGuaranteesSection: React.FC = () => {
  const { currentMood } = useColorMood();

  return (
    <section className="py-20 bg-transparent border-b border-slate-200/50" id="garantias">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* 1. Google Business Profile & Client Reviews Direct Action */}
        <FadeIn direction="up" distance={20}>
          <SpotlightCard
            className="rounded-3xl p-6 sm:p-10 bg-gradient-to-br from-white via-slate-50 to-amber-50/40 border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden"
            spotlightColor="rgba(245, 158, 11, 0.14)"
          >
            <div
              className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 rounded-full blur-3xl opacity-25 pointer-events-none"
              style={{ backgroundColor: currentMood.color }}
            />

            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="space-y-3.5 text-center lg:text-left max-w-xl">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 shadow-2xs">
                  <GoogleIcon className="w-4 h-4 shrink-0" />
                  <span className="text-xs font-bold text-slate-800 tracking-tight">
                    Perfil Oficial de Google • Reseñas Verificadas
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-950 tracking-tight">
                  Calificación 5.0 ★ respaldada por nuestros clientes en Guatemala
                </h2>

                <p className="text-sm text-slate-600 leading-relaxed font-normal">
                  ¿Trabajaste con nosotros? Tu opinión sobre la puntualidad, acabados y asesoría de{' '}
                  <strong className="text-slate-900 font-semibold">{BUSINESS_INFO.name}</strong>{' '}
                  respalda nuestro trabajo y orienta a nuevos proyectos en Carretera a El Salvador y Ciudad de Guatemala.
                </p>

                <div className="pt-1 flex flex-wrap items-center justify-center lg:justify-start gap-3 text-xs font-semibold text-slate-600">
                  <div className="flex items-center gap-1.5 bg-white px-3.5 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-amber-500 font-extrabold text-sm">{BUSINESS_INFO.googleRating}</span>
                    <div className="flex items-center text-amber-400" aria-hidden="true">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-slate-300">|</span>
                    <span className="text-slate-700">Calificación 5 Estrellas</span>
                  </div>

                  <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200/80">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                    <span>Opinión pública verificada</span>
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-center lg:items-end gap-4 shrink-0 w-full lg:w-auto">
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs text-center w-full sm:w-auto">
                  <span className="text-xs font-bold text-slate-700 block mb-2">
                    Califica nuestro servicio en un clic:
                  </span>
                  <div className="flex items-center justify-center gap-1.5 mb-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <a
                        key={star}
                        href={BUSINESS_INFO.googleReviewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 rounded-lg hover:bg-amber-50 transition-all hover:scale-125 text-amber-400 hover:text-amber-500 focus:outline-none"
                        aria-label={`Calificar con ${star} estrellas en Google`}
                      >
                        <Star className="w-7 h-7 fill-amber-400 text-amber-400 transition-transform" aria-hidden="true" />
                      </a>
                    ))}
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Haz clic en las estrellas para abrir tu reseña
                  </span>
                </div>

                <a
                  href={BUSINESS_INFO.googleReviewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  id="btn-google-reviews-section"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all group cursor-pointer"
                >
                  <GoogleIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span>Dejar reseña en Google</span>
                  <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" aria-hidden="true" />
                </a>
              </div>
            </div>
          </SpotlightCard>
        </FadeIn>

        {/* 2. Compact Institutional & Corporate Track Record (No Duplicate Project Cards) */}
        <div className="rounded-3xl p-6 sm:p-8 bg-slate-900 text-white border border-slate-800 shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-800">
            <div className="text-left">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-400">
                <Building2 className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Trayectoria Institucional y Comercial</span>
              </span>
              <h3 className="text-xl sm:text-2xl font-bold font-display text-white mt-1">
                {EXPERIENCE_CLIENTS.secondaryBlockTitle || 'Experiencia que respalda nuestro trabajo.'}
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 max-w-md leading-relaxed text-left">
              Ejecución de proyectos para clubes deportivos, colegios, franquicias internacionales y sedes diplomáticas bajo cronogramas rigurosos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            {EXPERIENCE_CLIENTS.previousExperience.map((item) => (
              <SpotlightCard
                key={item.name}
                className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-colors"
                spotlightColor="rgba(251, 191, 36, 0.12)"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    {item.type}
                  </span>
                  <h4 className="text-lg font-bold text-white font-display mb-2">
                    {item.name}
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed font-normal">
                    {item.scope}
                  </p>
                </div>
                <div className="pt-3 mt-4 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                  <span>Estándar corporativo verificado</span>
                </div>
              </SpotlightCard>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

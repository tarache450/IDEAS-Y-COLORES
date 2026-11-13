import React from 'react';
import {
  Building2,
  CheckCircle2,
  Star,
  ExternalLink,
} from 'lucide-react';
import { BUSINESS_INFO, EXPERIENCE_CLIENTS } from '../data/content';
import { useColorMood } from '../context/ColorMoodContext';
import { GoogleIcon } from './ui/GoogleIcon';
import FadeIn from './ui/FadeIn';

export const TestimonialsGuaranteesSection: React.FC = () => {
  const { currentMood } = useColorMood();

  return (
    <section
      className="py-20 sm:py-28 bg-white border-b border-[#E8E9EE]"
      id="garantias"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* 1. Google Business Profile & Client Reviews Card */}
        <FadeIn direction="up" distance={20}>
          <div className="rounded-xl p-6 sm:p-10 bg-[#F4F5F7] border border-[#E8E9EE] relative overflow-hidden">
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="space-y-4 text-center lg:text-left max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-white border border-[#E8E9EE] shadow-2xs">
                  <GoogleIcon className="w-4 h-4 shrink-0" />
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[#090E19]">
                    Perfil Oficial de Google • Reseñas Verificadas
                  </span>
                </div>

                <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-black font-display text-[#090E19] tracking-[-0.04em] leading-[1.06]">
                  Lo que Opinan Nuestros Clientes
                  <span style={{ color: currentMood.color }}>.</span>
                </h2>

                <p className="text-sm sm:text-base text-[#525663] leading-relaxed">
                  Calificación{' '}
                  <strong className="text-[#090E19] font-extrabold">
                    {BUSINESS_INFO.googleRating} ★
                  </strong>{' '}
                  respaldada por clientes en Carretera a El Salvador y Ciudad de Guatemala. Tu
                  opinión sobre la puntualidad, acabados y asesoría de{' '}
                  <strong className="text-[#090E19] font-bold">{BUSINESS_INFO.name}</strong>{' '}
                  respalda nuestro compromiso por escrito.
                </p>

                <div className="pt-1 flex flex-wrap items-center justify-center lg:justify-start gap-3 text-xs font-semibold text-[#525663]">
                  <div className="flex items-center gap-1.5 bg-white px-3.5 py-2 rounded-md border border-[#E8E9EE]">
                    <span className="text-[#090E19] font-black text-sm">
                      {BUSINESS_INFO.googleRating}
                    </span>
                    <div className="flex items-center text-amber-400" aria-hidden="true">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-[#E8E9EE]">|</span>
                    <span className="text-[#090E19] font-bold">Calificación 5 Estrellas</span>
                  </div>

                  <span className="inline-flex items-center gap-1.5 text-emerald-800 bg-emerald-50 px-3.5 py-2 rounded-md border border-emerald-200 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                    <span>Opinión pública verificada</span>
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-center lg:items-end gap-4 shrink-0 w-full lg:w-auto">
                <div className="p-5 rounded-xl bg-white border border-[#E8E9EE] text-center w-full sm:w-auto">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[#090E19] block mb-2.5">
                    Califica nuestro servicio en un clic
                  </span>
                  <div className="flex items-center justify-center gap-1.5 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <a
                        key={star}
                        href={BUSINESS_INFO.googleReviewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-md hover:bg-[#FFF0E6] transition-all hover:scale-110 text-amber-400"
                        aria-label={`Calificar con ${star} estrellas en Google`}
                      >
                        <Star
                          className="w-7 h-7 fill-amber-400 text-amber-400"
                          aria-hidden="true"
                        />
                      </a>
                    ))}
                  </div>
                  <span className="text-[11px] text-[#80828C] font-medium">
                    Haz clic en las estrellas para abrir tu reseña
                  </span>
                </div>

                <a
                  href={BUSINESS_INFO.googleReviewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  id="btn-google-reviews-section"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 min-h-[48px] rounded-md bg-[#090E19] hover:bg-[#151D30] text-white font-bold text-sm shadow-md transition-all"
                >
                  <GoogleIcon className="w-5 h-5" />
                  <span>Dejar reseña en Google</span>
                  <ExternalLink className="w-4 h-4 text-[#80828C]" aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* 2. Institutional & Corporate Track Record */}
        <div className="rounded-xl p-6 sm:p-10 bg-[#090E19] text-white border border-[#27324D] shadow-xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-6 border-b border-[#27324D]">
            <div className="text-left">
              <span
                className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.16em]"
                style={{ color: currentMood.color }}
              >
                <Building2 className="w-4 h-4" aria-hidden="true" />
                <span>Trayectoria Institucional y Comercial</span>
              </span>
              <h3 className="text-2xl sm:text-3xl font-black font-display text-white tracking-tight mt-2">
                {EXPERIENCE_CLIENTS.secondaryBlockTitle ||
                  'Experiencia que respalda nuestro trabajo.'}
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-[#B8BCC6] max-w-md leading-relaxed text-left">
              Ejecución de proyectos para clubes deportivos, colegios, franquicias internacionales y
              sedes diplomáticas bajo cronogramas rigurosos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-left">
            {EXPERIENCE_CLIENTS.previousExperience.map((item) => (
              <div
                key={item.name}
                className="p-6 rounded-xl bg-[#151D30] border border-[#27324D] flex flex-col justify-between hover:border-white/25 transition-colors"
              >
                <div>
                  <span
                    className="text-[10px] font-extrabold uppercase tracking-[0.16em] block mb-1.5"
                    style={{ color: currentMood.color }}
                  >
                    {item.type}
                  </span>
                  <h4 className="text-lg font-black text-white font-display tracking-tight mb-2">
                    {item.name}
                  </h4>
                  <p className="text-xs sm:text-sm text-[#B8BCC6] leading-relaxed">{item.scope}</p>
                </div>
                <div className="pt-4 mt-5 border-t border-[#27324D] text-[11px] text-[#80828C] flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                  <span>Estándar corporativo verificado</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

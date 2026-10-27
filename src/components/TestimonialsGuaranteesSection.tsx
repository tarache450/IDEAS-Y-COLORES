import React from 'react';
import {
  ShieldCheck,
  FileText,
  Truck,
  Sparkles,
  Building2,
  Award,
  CheckCircle2,
  Image as ImageIcon,
  Star,
  ExternalLink,
} from 'lucide-react';
import { BUSINESS_INFO, EXPERIENCE_CLIENTS } from '../data/content';
import { useColorMood } from '../context/ColorMoodContext';
import { SpotlightCard } from './ui/SpotlightCard';
import { GoogleIcon } from './ui/GoogleIcon';
import FadeIn from './ui/FadeIn';

const GUARANTEES = [
  {
    icon: ShieldCheck,
    title: 'Garantía por escrito',
    subtitle: 'En productos y mano de obra',
    desc: 'Compromiso formal firmado al concluir tu proyecto que respalda adherencia, cubrimiento y resistencia.',
    accent: '#0059FF',
  },
  {
    icon: Sparkles,
    title: 'Asesoría técnica en sitio',
    subtitle: 'Técnicos certificados',
    desc: 'Evaluación técnica de superficies en líneas Arquitectónico, Industrial, Automotriz y Madera.',
    accent: '#FF5738',
  },
  {
    icon: FileText,
    title: 'Facturación contable completa',
    subtitle: 'Cumplimiento legal SAT',
    desc: 'Facturación formal y presupuestos desglosados para personas individuales, comercios e instituciones.',
    accent: '#FAB82A',
  },
  {
    icon: Truck,
    title: 'Cobro y entrega a domicilio',
    subtitle: 'Pintura y materiales en obra',
    desc: 'Despacho directo hasta tu puerta o tu obra en Carretera a El Salvador y toda Guatemala con opción contra entrega.',
    accent: '#00A3FF',
  },
];

export const TestimonialsGuaranteesSection: React.FC = () => {
  const { currentMood } = useColorMood();

  return (
    <section className="py-20 sm:py-24 bg-transparent border-b border-slate-200/50" id="garantias">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section 1: Espacios que hemos transformado (Experiencia Sobria y Verificada) */}
        <div className="mb-20">
          <FadeIn direction="up" distance={24}>
            <div className="text-center max-w-3xl mx-auto mb-14">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold uppercase tracking-wider mb-3">
                <Building2 className="w-3.5 h-3.5" style={{ color: currentMood.color }} />
                <span>Trayectoria y Proyectos</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tight font-display">
                {EXPERIENCE_CLIENTS.sectionTitle}
              </h2>

              {/* Exact required statement from prompt */}
              <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
                {EXPERIENCE_CLIENTS.statement}
              </p>
            </div>
          </FadeIn>


          {/* Destacados Grid: El Pulté Golf, FUTECA Gym, Plaza Fraijanes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {EXPERIENCE_CLIENTS.featuredProjects.map((project, idx) => {
              const accents = ['#0059FF', '#FF5738', '#FAB82A'];
              const accent = accents[idx % accents.length];

              return (
                <SpotlightCard
                  key={project.id}
                  className="rounded-3xl p-6 sm:p-7 bg-slate-50 border border-slate-200/90 shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                  spotlightColor="rgba(0, 89, 255, 0.08)"
                >
                  <div>
                    {/* Header tags: Categoría y Estado visual de Proyecto Destacado */}
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-700">
                        {project.category}
                      </span>
                      <span
                        className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full text-white shadow-xs"
                        style={{ backgroundColor: accent }}
                      >
                        {project.status}
                      </span>
                    </div>

                    {/* Image / Project Preview */}
                    <div className="relative aspect-16/10 rounded-2xl overflow-hidden mb-4 bg-slate-200 border border-slate-300/80 group">
                      <img
                        src={project.image}
                        alt={project.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                      <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-[11px] text-white/95 bg-slate-900/80 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-white/20">
                        <span className="flex items-center gap-1.5 font-medium">
                          <ImageIcon className="w-3.5 h-3.5" />
                          <span>Obra ejecutada con garantía</span>
                        </span>
                        <span className="text-[10px] text-slate-300">GT</span>
                      </div>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-bold font-display text-slate-950 mb-2">
                      {project.name}
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal mb-4">
                      {project.scope}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
                    <span className="italic">{project.note}</span>
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Verificado</span>
                    </span>
                  </div>
                </SpotlightCard>
              );
            })}
          </div>

          {/* Segundo Bloque Más Discreto: Experiencia que respalda nuestro trabajo */}
          <div className="rounded-3xl p-6 sm:p-8 bg-slate-900 text-white border border-slate-800 shadow-lg">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-800">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Trayectoria Institucional
                </span>
                <h4 className="text-xl sm:text-2xl font-bold font-display text-white mt-1">
                  {EXPERIENCE_CLIENTS.secondaryBlockTitle || 'Experiencia que respalda nuestro trabajo.'}
                </h4>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 max-w-md leading-relaxed">
                Nuestra experiencia incluye soluciones técnicas y de acabados para marcas y entidades bajo especificaciones y cronogramas rigurosos.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    <h5 className="text-lg font-bold text-white font-display mb-2">
                      {item.name}
                    </h5>
                    <p className="text-xs text-slate-300 leading-relaxed font-normal">
                      {item.scope}
                    </p>
                  </div>
                  <div className="pt-3 mt-4 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>Experiencia comercial e institucional</span>
                  </div>
                </SpotlightCard>
              ))}
            </div>
          </div>
        </div>

        {/* Google Business Profile & Client Reviews Direct API / Action */}
        <FadeIn direction="up" distance={20}>
          <div className="mb-20">
            <SpotlightCard
              className="rounded-3xl p-6 sm:p-10 bg-gradient-to-br from-white via-slate-50 to-amber-50/40 border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden"
              spotlightColor="rgba(245, 158, 11, 0.14)"
            >
              {/* Subtle ambient blur behind card */}
              <div
                className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 rounded-full blur-3xl opacity-25 pointer-events-none"
                style={{ backgroundColor: currentMood.color }}
              />
              <div className="absolute bottom-0 left-1/4 -mb-16 w-56 h-56 rounded-full bg-amber-400/15 blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
                {/* Left: Google Verified Branding & Context */}
                <div className="space-y-3.5 text-center lg:text-left max-w-xl">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 shadow-2xs">
                    <GoogleIcon className="w-4 h-4 shrink-0" />
                    <span className="text-xs font-bold text-slate-800 tracking-tight">
                      Perfil Oficial de Google • Reseñas Verificadas
                    </span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-950 tracking-tight">
                    ¿Trabajaste con nosotros? Comparte tu experiencia en Google
                  </h3>

                  <p className="text-sm text-slate-600 leading-relaxed font-normal">
                    Tu opinión sobre la puntualidad, acabados y asesoría de{' '}
                    <strong className="text-slate-900 font-semibold">{BUSINESS_INFO.name}</strong>{' '}
                    respalda nuestro trabajo y orienta a nuevos proyectos residenciales y comerciales en Carretera a El Salvador y toda Guatemala.
                  </p>

                  <div className="pt-1 flex flex-wrap items-center justify-center lg:justify-start gap-3 text-xs font-semibold text-slate-600">
                    <div className="flex items-center gap-1.5 bg-white px-3.5 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
                      <span className="text-amber-500 font-extrabold text-sm">{BUSINESS_INFO.googleRating}</span>
                      <div className="flex items-center text-amber-400">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <span className="text-slate-300">|</span>
                      <span className="text-slate-700">Calificación 5 Estrellas</span>
                    </div>

                    <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200/80">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Opinión pública e inmediata</span>
                    </span>
                  </div>
                </div>

                {/* Right: Interactive 5-Star Rating & Direct Action Button */}
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
                          title={`Calificar con ${star} estrellas en el perfil de Google`}
                          aria-label={`Calificar con ${star} estrellas en el perfil de Google`}
                        >
                          <Star className="w-7 h-7 fill-amber-400 text-amber-400 transition-transform" />
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
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all hover:scale-102 group cursor-pointer"
                  >
                    <GoogleIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span>Dejar reseña en Google</span>
                    <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                  </a>
                </div>
              </div>
            </SpotlightCard>
          </div>
        </FadeIn>

        {/* Section 2: 4 Clear Guarantees Grid with SpotlightCard */}
        <div className="pt-12 border-t border-slate-200">
          <FadeIn direction="up" distance={20}>
            <div className="text-center max-w-3xl mx-auto mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold uppercase tracking-wider mb-2">
                <Award className="w-3.5 h-3.5 text-amber-500" />
                <span>Compromiso de Calidad</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight font-display">
                Cuatro garantías claras. Cero improvisaciones.
              </h3>
              <p className="mt-2 text-sm sm:text-base text-slate-600 font-normal">
                Eliminamos el estrés de contratar pintura o remodelación con estándares formales de
                ejecución y respaldo por escrito.
              </p>
            </div>
          </FadeIn>


          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {GUARANTEES.map((g) => {
              const Icon = g.icon;
              return (
                <SpotlightCard
                  key={g.title}
                  className="p-6 rounded-3xl bg-slate-50 border border-slate-200/90 shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col justify-between group hover:border-slate-300"
                  spotlightColor={`${g.accent}1f`}
                >
                  <div>
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110 shadow-xs"
                      style={{ backgroundColor: `${g.accent}15`, color: g.accent }}
                    >
                      <Icon className="w-6 h-6 stroke-[2.2]" />
                    </div>

                    <span className="text-[11px] font-bold text-slate-500 block uppercase tracking-wider mb-1">
                      {g.subtitle}
                    </span>
                    <h4 className="text-lg font-extrabold text-slate-950 font-display mb-2">
                      {g.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                      {g.desc}
                    </p>
                  </div>

                  <div className="pt-4 mt-6 border-t border-slate-200/70 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Estándar Ideas & Colores</span>
                  </div>
                </SpotlightCard>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

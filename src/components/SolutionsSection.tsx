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
  CheckCircle2,
  Layers,
} from 'lucide-react';
import { MULTI_SERVICES_CATEGORIES, BUSINESS_INFO } from '../data/content';
import { useColorMood } from '../context/ColorMoodContext';

interface SolutionsSectionProps {
  onSelectSolution: (solutionTitle: string) => void;
}

export const SolutionsSection: React.FC<SolutionsSectionProps> = ({ onSelectSolution }) => {
  const { currentMood } = useColorMood();
  const [selectedFilter, setSelectedFilter] = useState<string>('todos');

  const iconMap: Record<string, React.ReactNode> = {
    pintura: <Paintbrush className="w-5 h-5" />,
    impresion: <Printer className="w-5 h-5" />,
    carpinteria: <Hammer className="w-5 h-5" />,
    plomeria: <Droplets className="w-5 h-5" />,
    resinas: <Sparkles className="w-5 h-5" />,
    instalaciones: <Wrench className="w-5 h-5" />,
  };

  const displayedCategories =
    selectedFilter === 'todos'
      ? MULTI_SERVICES_CATEGORIES
      : MULTI_SERVICES_CATEGORIES.filter((c) => c.id === selectedFilter);

  return (
    <section id="soluciones" className="py-20 sm:py-24 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-800 shadow-2xs mb-3">
            <Layers className="w-3.5 h-3.5" style={{ color: currentMood.color }} />
            <span>Grupo Multi-Servicios</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tight font-display">
            Soluciones para transformar y mantener tus espacios.
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
            Ideas & Colores Multi-Servicios transforma, protege y mantiene espacios con soluciones
            profesionales integrales. Un solo interlocutor de confianza con técnicos certificados y
            garantía por escrito.
          </p>
        </div>

        {/* Quick Category Filter Pills */}
        <div className="flex items-center justify-center flex-wrap gap-2 mb-12">
          <button
            type="button"
            onClick={() => setSelectedFilter('todos')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              selectedFilter === 'todos'
                ? 'bg-slate-950 text-white shadow-sm'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            Todos los servicios (6)
          </button>
          {MULTI_SERVICES_CATEGORIES.map((cat) => {
            const isActive = selectedFilter === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedFilter(cat.id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  isActive
                    ? 'text-white shadow-sm'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
                style={{
                  backgroundColor: isActive ? cat.accentColor : undefined,
                }}
              >
                <span>{iconMap[cat.id]}</span>
                <span>{cat.shortTitle}</span>
              </button>
            );
          })}
        </div>

        {/* Services Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayedCategories.map((service) => {
            const icon = iconMap[service.id];

            return (
              <div
                key={service.id}
                className="group relative rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden"
              >
                {/* Visual Header with Image & Badge */}
                <div className="relative h-52 w-full overflow-hidden bg-slate-900">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />

                  {/* Top badges */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white border border-white/10">
                      {service.number}
                    </span>

                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-white backdrop-blur-md shadow-sm"
                      style={{ backgroundColor: service.accentColor }}
                    >
                      {icon}
                    </div>
                  </div>

                  {/* Category title over image bottom */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-xl sm:text-2xl font-bold font-display text-white tracking-tight leading-tight">
                      {service.title}
                    </h3>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {service.description}
                    </p>

                    {/* Superficies o Aplicaciones */}
                    <div>
                      <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                        Superficies y aplicaciones verificadas:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {service.surfacesOrApps.slice(0, 7).map((surface) => (
                          <span
                            key={surface}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-[11px] font-medium text-slate-700"
                          >
                            <CheckCircle2
                              className="w-3 h-3 shrink-0"
                              style={{ color: service.accentColor }}
                            />
                            <span>{surface}</span>
                          </span>
                        ))}
                        {service.surfacesOrApps.length > 7 && (
                          <span className="px-2 py-1 rounded-lg bg-slate-100 text-[11px] font-semibold text-slate-500">
                            +{service.surfacesOrApps.length - 7} más
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Líneas de servicio */}
                    <div className="pt-2 border-t border-slate-100">
                      <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                        Líneas especializadas:
                      </span>
                      <ul className="space-y-1">
                        {service.linesOrServices.map((line) => (
                          <li
                            key={line}
                            className="text-xs text-slate-600 flex items-center gap-2"
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-full shrink-0"
                              style={{ backgroundColor: service.accentColor }}
                            />
                            <span>{line}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Actions & CTAs */}
                  <div className="pt-4 border-t border-slate-100 space-y-2">
                    <button
                      type="button"
                      onClick={() => onSelectSolution(service.title)}
                      className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-white transition-all duration-200 flex items-center justify-center gap-2 shadow-xs hover:shadow-md hover:opacity-95"
                      style={{
                        backgroundColor: service.accentColor,
                      }}
                    >
                      <span>{service.ctaText}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <a
                      href={`https://wa.me/${BUSINESS_INFO.whatsappNumber}?text=Hola%20Ideas%20%26%20Colores%2C%20quiero%20cotizar%20el%20servicio%20de%3A%20${encodeURIComponent(
                        service.title
                      )}.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Consultar por WhatsApp</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

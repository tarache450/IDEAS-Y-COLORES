import React, { useState } from 'react';
import {
  Compass,
  Palette,
  Paintbrush,
  ShieldCheck,
  Truck,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  Sliders,
  Layers,
  Check,
} from 'lucide-react';
import { EXTENDED_SERVICES, BUSINESS_INFO } from '../data/content';
import { useColorMood } from '../context/ColorMoodContext';
import { ExtendedServiceCategory } from '../types';

interface ServicesSectionProps {
  onQuoteClick: (serviceName?: string) => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ onQuoteClick }) => {
  const { currentMood } = useColorMood();
  const [selectedServiceId, setSelectedServiceId] = useState<string>('asesoria-planificacion');

  const iconMap: Record<string, React.ReactNode> = {
    Compass: <Compass className="w-6 h-6" />,
    Palette: <Palette className="w-6 h-6" />,
    Paintbrush: <Paintbrush className="w-6 h-6" />,
    ShieldCheck: <ShieldCheck className="w-6 h-6" />,
    Truck: <Truck className="w-6 h-6" />,
  };

  const selectedService =
    EXTENDED_SERVICES.find((s) => s.id === selectedServiceId) || EXTENDED_SERVICES[0];

  return (
    <section id="servicios" className="py-20 sm:py-24 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" style={{ color: currentMood.color }} />
            <span>Servicios Ampliados • Ideas & Colores Multi-Servicios</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tight font-display">
            Capacidades técnicas organizadas para tu espacio.
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
            Desde la especificación química y diagnóstico en sitio, hasta la aplicación profesional,
            mantenimiento locativo y logística sin demoras.
          </p>
        </div>

        {/* Bento Grid: 5 Categorías Estructuradas */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-12">
          {/* Card 1: Asesoría y planificación (7 cols) */}
          {(() => {
            const serv = EXTENDED_SERVICES[0];
            const isSelected = selectedServiceId === serv.id;
            return (
              <div
                key={serv.id}
                onClick={() => setSelectedServiceId(serv.id)}
                className={`md:col-span-7 rounded-3xl p-7 sm:p-8 border transition-all duration-300 flex flex-col justify-between cursor-pointer relative overflow-hidden group ${
                  isSelected
                    ? 'bg-slate-950 text-white border-slate-900 shadow-xl'
                    : 'bg-slate-50 hover:bg-white text-slate-950 border-slate-200/90 hover:border-slate-300 hover:shadow-md'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white shadow-sm transition-transform group-hover:scale-105"
                      style={{ backgroundColor: serv.accentColor }}
                    >
                      {iconMap[serv.icon]}
                    </div>
                    <span
                      className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${
                        isSelected
                          ? 'bg-white/10 text-slate-200 border-white/20'
                          : 'bg-white text-slate-700 border-slate-200'
                      }`}
                    >
                      {serv.badge}
                    </span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-bold font-display mb-2">
                    {serv.name}
                  </h3>

                  <p
                    className={`text-sm sm:text-base leading-relaxed mb-5 ${
                      isSelected ? 'text-slate-300' : 'text-slate-600'
                    }`}
                  >
                    {serv.shortDesc}
                  </p>

                  {/* Beneficio Principal */}
                  <div
                    className={`p-4 rounded-2xl border mb-5 ${
                      isSelected
                        ? 'bg-slate-900/90 border-slate-800 text-slate-200'
                        : 'bg-blue-50/70 border-blue-100 text-slate-800'
                    }`}
                  >
                    <span className="text-[11px] font-bold uppercase tracking-wider block text-blue-500 mb-1">
                      Beneficio principal:
                    </span>
                    <p className="text-xs sm:text-sm font-medium leading-relaxed">
                      {serv.mainBenefit}
                    </p>
                  </div>

                  {/* Key Services List */}
                  <div className="space-y-2 mb-6">
                    {serv.keyServices.map((ks) => (
                      <div
                        key={ks}
                        className={`flex items-center gap-2 text-xs sm:text-sm ${
                          isSelected ? 'text-slate-300' : 'text-slate-700'
                        }`}
                      >
                        <CheckCircle2
                          className="w-4 h-4 shrink-0"
                          style={{ color: serv.accentColor }}
                        />
                        <span>{ks}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card CTA */}
                <div
                  className={`pt-5 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isSelected ? 'border-slate-800' : 'border-slate-200'
                  }`}
                >
                  <div className="flex flex-wrap gap-1.5">
                    {serv.materialsOrApps.map((m) => (
                      <span
                        key={m}
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                          isSelected ? 'bg-slate-900 text-slate-400' : 'bg-white text-slate-500 border border-slate-200'
                        }`}
                      >
                        {m}
                      </span>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onQuoteClick(serv.name);
                    }}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-xs transition-transform hover:scale-102 shrink-0"
                  >
                    <span>{serv.ctaText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })()}

          {/* Card 2: Pintura y recubrimientos (5 cols) */}
          {(() => {
            const serv = EXTENDED_SERVICES[1];
            const isSelected = selectedServiceId === serv.id;
            return (
              <div
                key={serv.id}
                onClick={() => setSelectedServiceId(serv.id)}
                className={`md:col-span-5 rounded-3xl p-7 sm:p-8 border transition-all duration-300 flex flex-col justify-between cursor-pointer relative overflow-hidden group ${
                  isSelected
                    ? 'bg-slate-950 text-white border-slate-900 shadow-xl'
                    : 'bg-slate-50 hover:bg-white text-slate-950 border-slate-200/90 hover:border-slate-300 hover:shadow-md'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white shadow-sm transition-transform group-hover:scale-105"
                      style={{ backgroundColor: serv.accentColor }}
                    >
                      {iconMap[serv.icon]}
                    </div>
                    <span
                      className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${
                        isSelected
                          ? 'bg-white/10 text-slate-200 border-white/20'
                          : 'bg-white text-slate-700 border-slate-200'
                      }`}
                    >
                      {serv.badge}
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold font-display mb-2">
                    {serv.name}
                  </h3>

                  <p
                    className={`text-sm leading-relaxed mb-5 ${
                      isSelected ? 'text-slate-300' : 'text-slate-600'
                    }`}
                  >
                    {serv.shortDesc}
                  </p>

                  <div
                    className={`p-4 rounded-2xl border mb-5 ${
                      isSelected
                        ? 'bg-slate-900/90 border-slate-800 text-slate-200'
                        : 'bg-amber-50/70 border-amber-100 text-slate-800'
                    }`}
                  >
                    <span className="text-[11px] font-bold uppercase tracking-wider block text-amber-600 mb-1">
                      Beneficio principal:
                    </span>
                    <p className="text-xs font-medium leading-relaxed">
                      {serv.mainBenefit}
                    </p>
                  </div>

                  <div className="space-y-2 mb-6">
                    {serv.keyServices.slice(0, 4).map((ks) => (
                      <div
                        key={ks}
                        className={`flex items-center gap-2 text-xs ${
                          isSelected ? 'text-slate-300' : 'text-slate-700'
                        }`}
                      >
                        <CheckCircle2
                          className="w-4 h-4 shrink-0"
                          style={{ color: serv.accentColor }}
                        />
                        <span>{ks}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div
                  className={`pt-5 border-t flex items-center justify-between gap-3 ${
                    isSelected ? 'border-slate-800' : 'border-slate-200'
                  }`}
                >
                  <span className="text-xs text-slate-500 font-medium">Marcas de confianza</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onQuoteClick(serv.name);
                    }}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-xs transition-transform hover:scale-102"
                  >
                    <span>{serv.ctaText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })()}

          {/* Row 2: 3 Cards (4 cols each) */}
          {EXTENDED_SERVICES.slice(2).map((serv) => {
            const isSelected = selectedServiceId === serv.id;
            return (
              <div
                key={serv.id}
                onClick={() => setSelectedServiceId(serv.id)}
                className={`md:col-span-4 rounded-3xl p-6 sm:p-7 border transition-all duration-300 flex flex-col justify-between cursor-pointer relative overflow-hidden group ${
                  isSelected
                    ? 'bg-slate-950 text-white border-slate-900 shadow-xl'
                    : 'bg-slate-50 hover:bg-white text-slate-950 border-slate-200/90 hover:border-slate-300 hover:shadow-md'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-white shadow-sm transition-transform group-hover:scale-105"
                      style={{ backgroundColor: serv.accentColor }}
                    >
                      {iconMap[serv.icon]}
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                        isSelected
                          ? 'bg-white/10 text-slate-200 border-white/20'
                          : 'bg-white text-slate-700 border-slate-200'
                      }`}
                    >
                      {serv.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold font-display mb-2">
                    {serv.name}
                  </h3>

                  <p
                    className={`text-xs sm:text-sm leading-relaxed mb-4 ${
                      isSelected ? 'text-slate-300' : 'text-slate-600'
                    }`}
                  >
                    {serv.shortDesc}
                  </p>

                  <div
                    className={`p-3 rounded-xl border mb-4 ${
                      isSelected
                        ? 'bg-slate-900/90 border-slate-800 text-slate-200'
                        : 'bg-white border-slate-200 text-slate-800 shadow-2xs'
                    }`}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider block text-slate-500 mb-0.5">
                      Beneficio principal:
                    </span>
                    <p className="text-xs font-medium leading-relaxed">
                      {serv.mainBenefit}
                    </p>
                  </div>

                  <div className="space-y-1.5 mb-5">
                    {serv.keyServices.slice(0, 3).map((ks) => (
                      <div
                        key={ks}
                        className={`flex items-center gap-2 text-xs ${
                          isSelected ? 'text-slate-300' : 'text-slate-700'
                        }`}
                      >
                        <CheckCircle2
                          className="w-3.5 h-3.5 shrink-0"
                          style={{ color: serv.accentColor }}
                        />
                        <span className="line-clamp-1">{ks}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div
                  className={`pt-4 border-t flex items-center justify-between gap-2 ${
                    isSelected ? 'border-slate-800' : 'border-slate-200'
                  }`}
                >
                  <span className="text-[11px] text-slate-400">Garantía formal</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onQuoteClick(serv.name);
                    }}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-white font-bold text-xs shadow-xs transition-transform hover:scale-102"
                    style={{ backgroundColor: serv.accentColor }}
                  >
                    <span>{serv.ctaText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Banner de Consulta Rápida */}
        <div className="rounded-3xl p-6 sm:p-8 bg-slate-900 text-white border border-slate-800 shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h4 className="text-xl font-bold font-display text-white">
              ¿Requieres una combinación personalizada de servicios?
            </h4>
            <p className="text-sm text-slate-300 max-w-2xl">
              Podemos estructurar una propuesta que integre pintura, carpintería, plomería, resinas epóxicas o impresión en un solo presupuesto unificado.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onQuoteClick('Combinación de Multi-Servicios')}
            className="px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm shadow-md transition-all shrink-0 hover:scale-102"
          >
            Cotizar propuesta integral
          </button>
        </div>
      </div>
    </section>
  );
};

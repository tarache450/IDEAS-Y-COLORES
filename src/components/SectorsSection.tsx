import React, { useState } from 'react';
import {
  Home,
  Building2,
  Store,
  Trophy,
  GraduationCap,
  Factory,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { SECTORS_LIST, BUSINESS_INFO } from '../data/content';
import { SectorType } from '../types';
import { useColorMood } from '../context/ColorMoodContext';

interface SectorsSectionProps {
  onQuoteSector: (sectorTitle: string) => void;
}

export const SectorsSection: React.FC<SectorsSectionProps> = ({ onQuoteSector }) => {
  const [activeSectorId, setActiveSectorId] = useState<SectorType>('residencial');
  const { currentMood } = useColorMood();

  const activeSector =
    SECTORS_LIST.find((s) => s.id === activeSectorId) || SECTORS_LIST[0];

  const iconMap: Record<SectorType, React.ReactNode> = {
    residencial: <Home className="w-5 h-5" />,
    oficinas: <Building2 className="w-5 h-5" />,
    comercios: <Store className="w-5 h-5" />,
    recreativos: <Trophy className="w-5 h-5" />,
    instituciones: <GraduationCap className="w-5 h-5" />,
    industria: <Factory className="w-5 h-5" />,
  };

  return (
    <section
      id="sectores"
      className="py-20 sm:py-24 bg-white border-b border-slate-200 relative overflow-hidden transition-colors duration-500"
    >
      {/* Ambient soft glow matching active sector */}
      <div
        className="absolute top-1/2 right-1/4 w-[600px] h-[600px] rounded-full blur-3xl pointer-events-none opacity-10 transition-all duration-700"
        style={{ backgroundColor: activeSector.accentColor }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-800 mb-3">
            <span
              className="w-2 h-2 rounded-full transition-colors duration-300"
              style={{ backgroundColor: activeSector.accentColor }}
            />
            <span>Cobertura Integral</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tight font-display">
            Sectores que atendemos en Guatemala.
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
            Adaptamos materiales, cuadrillas y horarios a las particularidades de cada entorno,
            garantizando mínima disrupción y máxima durabilidad.
          </p>
        </div>

        {/* Interactive Sector Navigation Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mb-10">
          {SECTORS_LIST.map((sector) => {
            const isActive = activeSectorId === sector.id;
            return (
              <button
                key={sector.id}
                type="button"
                id={`btn-sector-${sector.id}`}
                onClick={() => setActiveSectorId(sector.id)}
                className={`p-4 rounded-2xl text-left border transition-all duration-200 flex flex-col justify-between ${
                  isActive
                    ? 'bg-slate-950 text-white shadow-lg border-slate-900 scale-[1.02]'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 transition-colors ${
                    isActive
                      ? 'text-white'
                      : 'bg-white text-slate-700 shadow-2xs border border-slate-200'
                  }`}
                  style={{
                    backgroundColor: isActive ? sector.accentColor : undefined,
                  }}
                >
                  {iconMap[sector.id]}
                </div>

                <div>
                  <span className="block text-xs font-bold font-display leading-tight mb-0.5">
                    {sector.title}
                  </span>
                  <span
                    className={`text-[10px] font-medium leading-tight ${
                      isActive ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    {sector.badge}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Sector Showcase Card */}
        <div className="rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch">
          {/* Left Column: Information & Relevant Solutions */}
          <div className="lg:col-span-7 p-8 sm:p-10 lg:p-12 flex flex-col justify-between space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase mb-4 bg-white/10 text-white border border-white/15">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: activeSector.accentColor }}
                />
                <span>Sector: {activeSector.title}</span>
              </div>

              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-display text-white tracking-tight mb-3">
                {activeSector.tagline}
              </h3>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
                {activeSector.description}
              </p>
            </div>

            {/* Relevant Verified Solutions for this sector */}
            <div className="pt-4 border-t border-slate-800">
              <span className="block text-xs font-bold uppercase tracking-wider text-amber-400 mb-3">
                Soluciones más relevantes para este sector:
              </span>

              <div className="space-y-2.5">
                {activeSector.relevantSolutions.map((sol) => (
                  <div key={sol} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200">
                    <CheckCircle2
                      className="w-4 h-4 shrink-0 mt-0.5"
                      style={{ color: activeSector.accentColor }}
                    />
                    <span>{sol}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                type="button"
                onClick={() => onQuoteSector(activeSector.title)}
                className="px-6 py-3.5 rounded-xl font-bold text-xs sm:text-sm text-white transition-all shadow-md flex items-center justify-center gap-2 hover:opacity-95"
                style={{ backgroundColor: activeSector.accentColor }}
              >
                <span>Cotizar para {activeSector.title}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href={`https://wa.me/${BUSINESS_INFO.whatsappNumber}?text=Hola%20Ideas%20%26%20Colores%2C%20quisiera%20asesor%C3%ADa%20para%20un%20proyecto%20en%20el%20sector%20de%3A%20${encodeURIComponent(
                  activeSector.title
                )}.`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3.5 rounded-xl font-semibold text-xs sm:text-sm text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors flex items-center justify-center gap-2 border border-slate-700"
              >
                <span>Consultar con un asesor</span>
              </a>
            </div>
          </div>

          {/* Right Column: Sector Imagery Showcase */}
          <div className="lg:col-span-5 relative min-h-[300px] lg:min-h-full overflow-hidden bg-slate-950">
            <img
              src={activeSector.image}
              alt={activeSector.title}
              className="w-full h-full object-cover opacity-85 transition-transform duration-700 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />

            <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 text-xs text-slate-300">
              <p className="font-semibold text-white mb-1">Supervisión técnica directa</p>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Coordinamos mano de obra calificada y materiales certificados para entregar obras en
                tiempo acordado con respaldo formal.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

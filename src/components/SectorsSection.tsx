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
  MessageCircle,
} from 'lucide-react';
import { SECTORS_LIST, BUSINESS_INFO } from '../data/content';
import { SectorType } from '../types';
import { useColorMood } from '../context/ColorMoodContext';
import { StaggeredText } from './ui/StaggeredText';
import { motion, AnimatePresence } from 'motion/react';
import { buildSafeWhatsAppUrl } from '../utils/security';

interface SectorsSectionProps {
  onQuoteSector: (sectorTitle: string) => void;
}

export const SectorsSection: React.FC<SectorsSectionProps> = ({ onQuoteSector }) => {
  const [activeSectorId, setActiveSectorId] = useState<SectorType>('residencial');
  const { currentMood } = useColorMood();

  const activeSector =
    SECTORS_LIST.find((s) => s.id === activeSectorId) || SECTORS_LIST[0];

  const iconMap: Record<SectorType, React.ReactNode> = {
    residencial: <Home className="w-5 h-5" aria-hidden="true" />,
    oficinas: <Building2 className="w-5 h-5" aria-hidden="true" />,
    comercios: <Store className="w-5 h-5" aria-hidden="true" />,
    recreativos: <Trophy className="w-5 h-5" aria-hidden="true" />,
    instituciones: <GraduationCap className="w-5 h-5" aria-hidden="true" />,
    industria: <Factory className="w-5 h-5" aria-hidden="true" />,
  };

  return (
    <section
      id="sectores"
      className="py-20 sm:py-28 bg-[#090E19] text-white border-b border-[#27324D] relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Roofera Dark Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12 pb-8 border-b border-[#27324D]">
          <div className="max-w-3xl text-left">
            <div className="inline-flex items-center gap-2.5 text-xs font-extrabold uppercase tracking-[0.18em] text-[#80828C] mb-3">
              <span
                className="w-2.5 h-2.5 rounded-xs shrink-0"
                style={{ backgroundColor: currentMood.color }}
              />
              <span>Cobertura Integral en Guatemala</span>
            </div>

            <div className="flex items-baseline">
              <StaggeredText
                text="Sectores que Atendemos"
                as="h2"
                className="text-3xl sm:text-5xl font-black text-white tracking-[-0.04em] leading-[1.06] font-display inline"
              />
              <span
                className="text-4xl sm:text-5xl font-black leading-none select-none"
                style={{ color: currentMood.color }}
              >
                .
              </span>
            </div>
          </div>

          <p className="text-sm sm:text-base text-[#B8BCC6] leading-relaxed max-w-md text-left">
            Adaptamos materiales, cuadrillas y horarios a cada entorno garantizando mínima
            disrupción y máxima durabilidad.
          </p>
        </div>

        {/* 6 Roofera Dark Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mb-8">
          {SECTORS_LIST.map((sector) => {
            const isActive = activeSectorId === sector.id;
            return (
              <button
                key={sector.id}
                type="button"
                id={`btn-sector-${sector.id}`}
                onClick={() => setActiveSectorId(sector.id)}
                className={`p-4 rounded-xl text-left border transition-all duration-200 flex flex-col justify-between min-h-[104px] cursor-pointer ${
                  isActive
                    ? 'bg-white text-[#090E19] shadow-lg border-white'
                    : 'bg-[#151D30] text-[#E8E9EE] border-[#27324D] hover:border-white/30'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-md flex items-center justify-center mb-3 transition-colors ${
                    isActive
                      ? 'text-white shadow-sm'
                      : 'bg-[#090E19] text-[#B8BCC6] border border-[#27324D]'
                  }`}
                  style={{
                    backgroundColor: isActive ? currentMood.color : undefined,
                  }}
                >
                  {iconMap[sector.id]}
                </div>

                <div>
                  <span className="block text-xs font-extrabold font-display leading-tight mb-0.5">
                    {sector.title}
                  </span>
                  <span
                    className={`text-[10px] font-semibold leading-tight block ${
                      isActive ? 'text-[#525663]' : 'text-[#80828C]'
                    }`}
                  >
                    {sector.badge}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Sector Architectural Showcase */}
        <div className="rounded-xl bg-[#151D30] text-white border border-[#27324D] shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch">
          <div className="lg:col-span-7 p-7 sm:p-10 lg:p-12 flex flex-col justify-between space-y-6 text-left">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-bold tracking-wider uppercase mb-4 bg-[#090E19] text-white border border-[#27324D]">
                <span
                  className="w-2 h-2 rounded-xs"
                  style={{ backgroundColor: currentMood.color }}
                />
                <span>Sector: {activeSector.title}</span>
              </div>

              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black font-display text-white tracking-tight mb-3">
                {activeSector.tagline}
              </h3>

              <p className="text-sm sm:text-base text-[#B8BCC6] leading-relaxed max-w-xl">
                {activeSector.description}
              </p>
            </div>

            <div className="pt-4 border-t border-[#27324D]">
              <span
                className="block text-[11px] font-extrabold uppercase tracking-[0.16em] mb-3"
                style={{ color: currentMood.color }}
              >
                Soluciones recomendadas para este sector
              </span>

              <div className="space-y-2.5">
                {activeSector.relevantSolutions.map((sol) => (
                  <div
                    key={sol}
                    className="flex items-start gap-2.5 text-xs sm:text-sm text-[#E8E9EE]"
                  >
                    <CheckCircle2
                      className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400"
                      aria-hidden="true"
                    />
                    <span>{sol}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-[#27324D] flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                type="button"
                onClick={() => onQuoteSector(activeSector.title)}
                className="inline-flex items-center justify-center gap-2.5 pl-1.5 pr-5 py-2 min-h-[46px] rounded-md font-bold text-xs sm:text-sm text-white transition-all shadow-md hover:opacity-95 cursor-pointer"
                style={{ backgroundColor: currentMood.color }}
              >
                <span className="w-7 h-7 rounded-sm bg-white flex items-center justify-center shrink-0">
                  <ArrowRight
                    className="w-4 h-4"
                    style={{ color: currentMood.color }}
                    aria-hidden="true"
                  />
                </span>
                <span>Cotizar para {activeSector.title}</span>
              </button>

              <a
                href={buildSafeWhatsAppUrl(
                  BUSINESS_INFO.whatsappNumber,
                  `Hola Ideas & Colores, quisiera asesoría para un proyecto en el sector de: ${activeSector.title}.`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 min-h-[46px] rounded-md font-bold text-xs sm:text-sm text-white bg-[#090E19] hover:bg-black transition-colors flex items-center justify-center gap-2 border border-[#27324D]"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" aria-hidden="true" />
                <span>Consultar con un asesor</span>
              </a>
            </div>
          </div>

          <div className="lg:col-span-5 relative min-h-[300px] lg:min-h-full overflow-hidden bg-[#090E19]">
            <AnimatePresence mode="wait">
              <motion.img
                key={activeSector.id}
                src={activeSector.image}
                alt={activeSector.title}
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 0.9, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-t from-[#090E19] via-transparent to-transparent pointer-events-none" />

            <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl bg-[#090E19]/85 backdrop-blur-md border border-white/10 text-xs text-[#B8BCC6] pointer-events-none text-left">
              <p className="font-bold text-white mb-1">Supervisión técnica directa</p>
              <p className="text-[11px] text-[#B8BCC6] leading-relaxed">
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

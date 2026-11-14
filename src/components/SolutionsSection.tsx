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
  ExternalLink,
  ShieldCheck,
  FolderOpen,
  Palette,
  Award,
  MapPin,
} from 'lucide-react';
import { MULTI_SERVICES_CATEGORIES, BUSINESS_INFO } from '../data/content';
import { useColorMood } from '../context/ColorMoodContext';
import { StaggeredText } from './ui/StaggeredText';
import FadeIn from './ui/FadeIn';
import { buildSafeWhatsAppUrl } from '../utils/security';
import {
  getCategoryLogoTheme,
  LOGO_SPECTRUM_LIST,
  NAV_PAGE_ACCENTS,
} from '../utils/logoPalette';

interface SolutionsSectionProps {
  onSelectSolution: (solutionTitle: string) => void;
  onOpenCategoryPage?: (categoryId: string) => void;
  onNavigate?: (sectionId: string) => void;
}

export const SolutionsSection: React.FC<SolutionsSectionProps> = ({
  onSelectSolution,
  onOpenCategoryPage,
  onNavigate,
}) => {
  const { currentMood } = useColorMood();
  const [selectedFilter, setSelectedFilter] = useState<string>('todos');

  const iconMap: Record<string, React.ReactNode> = {
    pintura: <Paintbrush className="w-5 h-5" aria-hidden="true" />,
    impresion: <Printer className="w-5 h-5" aria-hidden="true" />,
    carpinteria: <Hammer className="w-5 h-5" aria-hidden="true" />,
    plomeria: <Droplets className="w-5 h-5" aria-hidden="true" />,
    resinas: <Sparkles className="w-5 h-5" aria-hidden="true" />,
    instalaciones: <Wrench className="w-5 h-5" aria-hidden="true" />,
  };

  const visibleCategories =
    selectedFilter === 'todos'
      ? MULTI_SERVICES_CATEGORIES
      : MULTI_SERVICES_CATEGORIES.filter((c) => c.id === selectedFilter);

  const subpageLinks = [
    {
      id: 'proyectos',
      title: 'Proyectos Realizados',
      subtitle: 'Galería de casos reales en Guatemala',
      accent: NAV_PAGE_ACCENTS.proyectos,
      icon: <FolderOpen className="w-4 h-4" aria-hidden="true" />,
    },
    {
      id: 'herramientas',
      title: 'Color & Calculadora m²',
      subtitle: 'Simulador cromático y cubetas',
      accent: NAV_PAGE_ACCENTS.herramientas,
      icon: <Palette className="w-4 h-4" aria-hidden="true" />,
    },
    {
      id: 'confianza',
      title: 'Nosotros & Garantías',
      subtitle: 'Proceso, marcas e historia',
      accent: NAV_PAGE_ACCENTS.nosotros,
      icon: <Award className="w-4 h-4" aria-hidden="true" />,
    },
    {
      id: 'contacto',
      title: 'Contacto y Mapa Km 21.5',
      subtitle: 'Sede Fraijanes y cobertura',
      accent: NAV_PAGE_ACCENTS.contacto,
      icon: <MapPin className="w-4 h-4" aria-hidden="true" />,
    },
  ];

  return (
    <section
      id="soluciones"
      aria-label="Divisiones de Servicio y Especialidades en Guatemala"
      className="py-20 sm:py-28 bg-white border-b border-[#E8E9EE] relative overflow-hidden"
    >
      <span id="servicios" className="sr-only" aria-hidden="true" />
      <span id="impermeabilizacion" className="sr-only" aria-hidden="true" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Roofera-Style Architectural Services Header */}
        <FadeIn direction="up" distance={20}>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10 pb-8 border-b border-[#E8E9EE]">
            <div className="max-w-3xl text-left">
              <div className="inline-flex items-center gap-2.5 text-xs font-extrabold uppercase tracking-[0.18em] text-[#475569] mb-3">
                <span className="inline-flex items-center gap-1" aria-hidden="true">
                  {LOGO_SPECTRUM_LIST.map((hex) => (
                    <span
                      key={hex}
                      className="w-2 h-2 rounded-xs"
                      style={{ backgroundColor: hex }}
                    />
                  ))}
                </span>
                <span>Nuestros Servicios • 6 Páginas Especializadas</span>
              </div>

              <div className="flex items-baseline">
                <StaggeredText
                  text="Divisiones de Servicio"
                  as="h2"
                  className="text-3xl sm:text-5xl lg:text-[54px] font-black text-[#090E19] tracking-[-0.04em] leading-[1.04] font-display inline"
                />
                <span
                  className="text-4xl sm:text-5xl lg:text-[58px] font-black leading-none select-none"
                  style={{ color: currentMood.color }}
                >
                  .
                </span>
              </div>
            </div>

            <div className="max-w-md text-left space-y-2">
              <p className="text-sm sm:text-base text-[#525663] leading-relaxed">
                Selecciona cualquier categoría para abrir su subpágina dedicada con ficha técnica,
                alcances, preguntas frecuentes y cotización directa.
              </p>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                <ShieldCheck className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                <span>Garantía por escrito y factura FEL SAT en las 6 divisiones</span>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Zero-Jump Quick Category Filter Bar with Per-Division Logo Colors */}
        <div
          className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 sm:mb-8 touch-pan-x -mx-4 px-4 sm:mx-0 sm:px-0 no-scrollbar"
          role="group"
          aria-label="Filtrar categorías de servicio"
        >
          <button
            type="button"
            onClick={() => setSelectedFilter('todos')}
            className={`px-4 py-2.5 min-h-[44px] rounded-md text-xs font-extrabold whitespace-nowrap transition-all border cursor-pointer ${
              selectedFilter === 'todos'
                ? 'bg-[#090E19] text-white border-[#090E19] shadow-sm'
                : 'bg-[#F4F5F7] text-[#090E19] border-[#E8E9EE] hover:border-[#090E19]/40'
            }`}
          >
            Todas las categorías (6)
          </button>

          {MULTI_SERVICES_CATEGORIES.map((cat) => {
            const isSelected = selectedFilter === cat.id;
            const catTheme = getCategoryLogoTheme(cat.id, cat.accentColor);
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedFilter(cat.id)}
                className={`px-4 py-2.5 min-h-[44px] rounded-md text-xs font-bold whitespace-nowrap transition-all border inline-flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? 'shadow-sm'
                    : 'bg-[#F4F5F7] text-[#090E19] border-[#E8E9EE] hover:border-[#090E19]/40'
                }`}
                style={
                  isSelected
                    ? {
                        backgroundColor: catTheme.accent,
                        borderColor: catTheme.accent,
                        color: catTheme.textOnAccent,
                      }
                    : undefined
                }
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{
                    backgroundColor: isSelected ? catTheme.textOnAccent : catTheme.accent,
                  }}
                />
                <span className="font-mono text-[10px] opacity-80">{cat.number}</span>
                <span>{cat.shortTitle}</span>
              </button>
            );
          })}
        </div>

        {/* Animated, Staggered 6-Card Architectural Service Grid */}
        <div
          className={`grid gap-6 ${
            visibleCategories.length === 1
              ? 'grid-cols-1 max-w-2xl mx-auto'
              : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
          }`}
        >
          {visibleCategories.map((cat) => {
            const icon = iconMap[cat.id];
            const catTheme = getCategoryLogoTheme(cat.id, cat.accentColor);

            return (
              <article
                key={cat.id}
                className="rounded-xl bg-[#F4F5F7] border border-[#E8E9EE] hover:border-[#090E19]/45 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-200 overflow-hidden flex flex-col justify-between group text-left relative"
              >
                {/* Logo-color top accent hairline */}
                <div
                  className="h-1 w-full"
                  style={{ backgroundColor: catTheme.accent }}
                  aria-hidden="true"
                />

                <div>
                  {/* Clickable Hero Image -> Opens Dedicated Category Page */}
                  <a
                    href={`/servicios/${cat.id}`}
                    onClick={(e) => {
                      if (onOpenCategoryPage) {
                        e.preventDefault();
                        onOpenCategoryPage(cat.id);
                      }
                    }}
                    className="block relative aspect-[16/10] w-full overflow-hidden bg-[#090E19] focus:outline-none"
                    aria-label={`Abrir página de categoría: ${cat.title}`}
                  >
                    <img
                      src={cat.image}
                      alt={`${cat.title} en Ciudad de Guatemala y Carretera a El Salvador — Ideas & Colores`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                      loading="lazy"
                      decoding="async"
                      width={1264}
                      height={848}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#090E19] via-[#090E19]/30 to-transparent" />

                    {/* Top badges */}
                    <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between">
                      <span
                        className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-md shadow-sm"
                        style={{
                          backgroundColor: catTheme.accent,
                          color: catTheme.textOnAccent,
                        }}
                      >
                        <span>División {cat.number}</span>
                      </span>

                      <span className="w-9 h-9 rounded-md bg-[#090E19]/85 backdrop-blur-md text-white border border-white/15 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                        {icon}
                      </span>
                    </div>

                    {/* Title over dark bottom gradient */}
                    <div className="absolute bottom-3.5 left-4 right-4">
                      <h3 className="text-xl font-black text-white font-display tracking-tight leading-snug">
                        {cat.title}
                      </h3>
                    </div>
                  </a>

                  {/* Stable Body Content */}
                  <div className="p-6 space-y-4">
                    <p className="text-xs sm:text-sm font-semibold text-[#090E19] leading-snug">
                      {cat.tagline}
                    </p>

                    <p className="text-xs text-[#525663] leading-relaxed line-clamp-3">
                      {cat.description}
                    </p>

                    {/* Key Specialized Lines */}
                    <div className="pt-3 border-t border-[#E8E9EE] space-y-1.5">
                      <span className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#475569] block">
                        Especialidades incluidas
                      </span>
                      <ul className="space-y-1.5">
                        {cat.linesOrServices.slice(0, 3).map((line) => (
                          <li
                            key={line}
                            className="flex items-start gap-2 text-xs font-medium text-[#2B2F3A]"
                          >
                            <CheckCircle2
                              className="w-3.5 h-3.5 shrink-0 mt-0.5"
                              style={{ color: catTheme.accent === '#FAB82A' ? '#D97706' : catTheme.accent }}
                              aria-hidden="true"
                            />
                            <span>{line}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Clear Card Footer Actions */}
                <div className="p-6 pt-0 space-y-2.5">
                  {/* Primary: Open Separate Category Page */}
                  <a
                    href={`/servicios/${cat.id}`}
                    onClick={(e) => {
                      if (onOpenCategoryPage) {
                        e.preventDefault();
                        onOpenCategoryPage(cat.id);
                      }
                    }}
                    className="group/btn w-full inline-flex items-center justify-between gap-2 pl-2 pr-4 py-2 min-h-[46px] rounded-md font-bold text-xs sm:text-sm shadow-sm hover:opacity-95 active:scale-[0.99] transition-all"
                    style={{
                      backgroundColor: catTheme.accent,
                      color: catTheme.textOnAccent,
                    }}
                  >
                    <span className="inline-flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-sm bg-white flex items-center justify-center shrink-0 transition-transform duration-200 group-hover/btn:scale-95">
                        <ArrowRight
                          className="w-3.5 h-3.5 transition-transform duration-200 group-hover/btn:translate-x-0.5"
                          style={{ color: catTheme.accent === '#FAB82A' ? '#B45309' : catTheme.accent }}
                          aria-hidden="true"
                        />
                      </span>
                      <span>Abrir página de {cat.shortTitle}</span>
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-90 shrink-0" aria-hidden="true" />
                  </a>

                  {/* Secondary Actions: Pre-fill Quote or WhatsApp */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => onSelectSolution(cat.title)}
                      className="min-h-[42px] px-3 py-2 rounded-md bg-white hover:bg-[#090E19] hover:text-white text-[#090E19] border border-[#E8E9EE] text-xs font-bold transition-colors cursor-pointer"
                    >
                      Cotizar rápido
                    </button>

                    <a
                      href={buildSafeWhatsAppUrl(
                        BUSINESS_INFO.whatsappNumber,
                        `Hola Ideas & Colores, quiero cotizar el servicio de ${cat.title}.`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="min-h-[42px] px-3 py-2 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Quick Subpage Directory Strip so Home stays 100% focused on Services */}
        {onNavigate && (
          <FadeIn direction="up" distance={16} delay={0.1}>
            <div className="mt-14 pt-10 border-t border-[#E8E9EE]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5 text-left">
                <span className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#475569]">
                  Explorar secciones en su propia página:
                </span>
                <span className="text-xs text-[#525663]">
                  También accesibles desde el menú superior
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {subpageLinks.map((sp) => (
                  <button
                    key={sp.id}
                    type="button"
                    onClick={() => onNavigate(sp.id)}
                    className="group p-4 rounded-xl bg-[#F4F5F7] hover:bg-[#090E19] border border-[#E8E9EE] hover:border-[#090E19] text-left transition-all duration-200 flex items-center justify-between gap-3 cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className="w-9 h-9 rounded-md flex items-center justify-center shrink-0 text-white"
                        style={{
                          backgroundColor: sp.accent,
                          color: sp.accent === '#FAB82A' || sp.accent === '#00A3FF' || sp.accent === '#10B981' ? '#090E19' : '#FFFFFF',
                        }}
                      >
                        {sp.icon}
                      </span>
                      <div className="min-w-0">
                        <strong className="text-xs sm:text-sm font-black text-[#090E19] group-hover:text-white block truncate transition-colors">
                          {sp.title}
                        </strong>
                        <span className="text-[11px] text-[#525663] group-hover:text-slate-300 block truncate transition-colors">
                          {sp.subtitle}
                        </span>
                      </div>
                    </div>
                    <ArrowRight
                      className="w-4 h-4 text-[#475569] group-hover:text-white group-hover:translate-x-0.5 shrink-0 transition-all"
                      aria-hidden="true"
                    />
                  </button>
                ))}
              </div>
            </div>
          </FadeIn>
        )}
      </div>
    </section>
  );
};

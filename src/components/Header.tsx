import React, { useState, useEffect, useRef } from 'react';
import {
  Menu,
  X,
  MessageCircle,
  ArrowRight,
  Sparkles,
  ChevronDown,
  Phone,
  ExternalLink,
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { GoogleIcon } from './ui/GoogleIcon';
import { BUSINESS_INFO, MULTI_SERVICES_CATEGORIES } from '../data/content';
import { useColorMood } from '../context/ColorMoodContext';
import { MoodColorPicker } from './MoodColorPicker';
import {
  LOGO_SPECTRUM_GRADIENT,
  NAV_PAGE_ACCENTS,
  getCategoryLogoTheme,
} from '../utils/logoPalette';

export type NavPage = 'inicio' | 'proyectos' | 'herramientas' | 'nosotros' | 'contacto';

interface HeaderProps {
  activeSection: string;
  activePage?: NavPage;
  activeCategorySlug?: string | null;
  onNavigate: (sectionId: string) => void;
  onOpenCategoryPage?: (categoryId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeSection,
  activePage = 'inicio',
  activeCategorySlug,
  onNavigate,
  onOpenCategoryPage,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileServicesExpanded, setMobileServicesExpanded] = useState(false);
  const [servicesMenuOpen, setServicesMenuOpen] = useState(false);
  const { currentMood } = useColorMood();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 32);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setServicesMenuOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false);
        setServicesMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, []);

  const navItems = [
    { id: 'soluciones', label: 'Servicios', hasSubpages: true },
    { id: 'proyectos', label: 'Proyectos' },
    { id: 'herramientas', label: 'Color & Calculadora' },
    { id: 'confianza', label: 'Nosotros' },
    { id: 'contacto', label: 'Contacto' },
  ];

  const handleNavClick = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
    setServicesMenuOpen(false);
  };

  const handleCategoryClick = (categoryId: string) => {
    if (onOpenCategoryPage) {
      onOpenCategoryPage(categoryId);
    } else {
      onNavigate('soluciones');
    }
    setMobileMenuOpen(false);
    setServicesMenuOpen(false);
  };

  const isSolidDark = isScrolled || Boolean(activeCategorySlug) || activePage !== 'inicio';

  return (
    <header className="fixed top-0 left-0 right-0 z-40 w-full transition-all duration-300">
      <div
        className="h-[3px] w-full"
        style={{ background: LOGO_SPECTRUM_GRADIENT }}
        aria-hidden="true"
      />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2.5 focus:rounded-md focus:bg-[#FF5C00] focus:text-white focus:font-bold focus:text-xs focus:shadow-xl focus:outline-2 focus:outline-white"
      >
        Saltar al contenido principal
      </a>

      <div
        className={`w-full transition-all duration-300 backdrop-blur-md ${
          isSolidDark
            ? 'border-b border-[#27324D] shadow-[0_12px_32px_-12px_rgba(9,14,25,0.65)] py-2.5'
            : 'border-b border-white/15 py-3 sm:py-3.5'
        }`}
        style={{
          backgroundColor: isSolidDark ? 'rgba(9, 14, 25, 0.96)' : 'rgba(9, 14, 25, 0.88)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3">
          {/* Official Light Logo */}
          <a
            href="#inicio"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('inicio');
            }}
            className="text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5C00] rounded-lg p-1 -ml-1 transition-transform hover:opacity-95 shrink-0"
            aria-label="Ir a inicio de Ideas & Colores Guatemala"
          >
            <BrandLogo size="md" variant="light" showSlogan={false} />
          </a>

          {/* Desktop Navigation Links (shrink-0 so 'Servicios' never gets clipped) */}
          <nav
            className="hidden lg:flex items-center gap-0.5 xl:gap-1 whitespace-nowrap shrink-0"
            aria-label="Principal"
          >
            {navItems.map((item) => {
              const pageAccent = NAV_PAGE_ACCENTS[item.id === 'soluciones' ? 'servicios' : item.id === 'confianza' ? 'nosotros' : item.id] || currentMood.color;
              const isActive =
                (item.id === 'soluciones' && (Boolean(activeCategorySlug) || (activePage === 'inicio' && activeSection === 'soluciones'))) ||
                (item.id === 'proyectos' && activePage === 'proyectos') ||
                (item.id === 'herramientas' && activePage === 'herramientas') ||
                (item.id === 'confianza' && activePage === 'nosotros') ||
                (item.id === 'contacto' && activePage === 'contacto');

              if (item.hasSubpages && onOpenCategoryPage) {
                return (
                  <div
                    key={item.id}
                    ref={dropdownRef}
                    className="relative"
                    onMouseEnter={() => setServicesMenuOpen(true)}
                    onMouseLeave={() => setServicesMenuOpen(false)}
                  >
                    <button
                      type="button"
                      id={`nav-link-${item.id}`}
                      aria-expanded={servicesMenuOpen}
                      aria-haspopup="menu"
                      onClick={() => setServicesMenuOpen((prev) => !prev)}
                      className={`px-3 xl:px-3.5 py-2 rounded-md text-xs font-semibold tracking-wide transition-colors duration-200 relative inline-flex items-center gap-1 cursor-pointer ${
                        isActive || servicesMenuOpen
                          ? 'text-white font-bold bg-white/10'
                          : 'text-slate-200 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <span>{item.label}</span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-slate-300 transition-transform duration-200 ${
                          servicesMenuOpen ? 'rotate-180' : ''
                        }`}
                        aria-hidden="true"
                      />
                      {isActive && (
                        <span
                          className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full transition-colors duration-300"
                          style={{ backgroundColor: pageAccent }}
                        />
                      )}
                    </button>

                    {servicesMenuOpen && (
                      <div
                        role="menu"
                        aria-label="Subpáginas de categorías de servicio"
                        className="absolute left-0 top-full pt-1.5 w-80 z-50"
                      >
                        <div className="rounded-xl bg-[#090E19] border border-[#27324D] shadow-2xl p-2 space-y-1">
                          <a
                            href="#soluciones"
                            onClick={(e) => {
                              e.preventDefault();
                              handleNavClick('soluciones');
                            }}
                            className="w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold flex items-center justify-between text-white bg-[#151D30] hover:bg-white/10 transition-colors border border-[#27324D]"
                          >
                            <span>Ver los 6 Servicios en Inicio</span>
                            <ArrowRight
                              className="w-3.5 h-3.5"
                              style={{ color: pageAccent }}
                              aria-hidden="true"
                            />
                          </a>
                          <div className="px-3 pt-2.5 pb-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#80828C]">
                            Páginas por Categoría
                          </div>
                          {MULTI_SERVICES_CATEGORIES.map((cat) => {
                            const isCatActive = activeCategorySlug === cat.id;
                            const catTheme = getCategoryLogoTheme(cat.id, cat.accentColor);
                            return (
                              <a
                                key={cat.id}
                                href={`/servicios/${cat.id}`}
                                role="menuitem"
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleCategoryClick(cat.id);
                                }}
                                className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-between gap-2 transition-colors ${
                                  isCatActive
                                    ? 'font-bold shadow-xs'
                                    : 'text-[#E8E9EE] hover:bg-[#151D30] hover:text-white'
                                }`}
                                style={
                                  isCatActive
                                    ? {
                                        backgroundColor: catTheme.accent,
                                        color: catTheme.textOnAccent,
                                      }
                                    : undefined
                                }
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <span
                                    className="w-2 h-2 rounded-full shrink-0"
                                    style={{
                                      backgroundColor: isCatActive
                                        ? catTheme.textOnAccent
                                        : catTheme.accent,
                                    }}
                                  />
                                  <span className="truncate">{cat.title}</span>
                                </div>
                                <ExternalLink
                                  className="w-3 h-3 opacity-60 shrink-0"
                                  aria-hidden="true"
                                />
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  id={`nav-link-${item.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(item.id);
                  }}
                  className={`px-3 xl:px-3.5 py-2 rounded-md text-xs font-semibold tracking-wide transition-colors duration-200 relative inline-block ${
                    isActive
                      ? 'text-white font-bold bg-white/10'
                      : 'text-slate-200 hover:text-white hover:bg-white/10'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {item.label}
                  {isActive && (
                    <span
                      className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full transition-colors duration-300"
                      style={{ backgroundColor: pageAccent }}
                    />
                  )}
                </a>
              );
            })}
          </nav>

          {/* Desktop Right Group: Balanced breakpoints so nav never overlaps at 1024px+ */}
          <div className="hidden lg:flex items-center gap-2 xl:gap-3 shrink-0">
            <a
              href={`tel:${BUSINESS_INFO.phoneClean}`}
              className="hidden xl:inline-flex items-center gap-2.5 pr-1 text-left group"
              aria-label={`Llamar ahora a ${BUSINESS_INFO.phone}`}
            >
              <div className="w-8 h-8 rounded-md flex items-center justify-center border border-white/15 bg-white/5 group-hover:bg-white/10 transition-colors">
                <Phone className="w-3.5 h-3.5" style={{ color: currentMood.color }} aria-hidden="true" />
              </div>
              <div className="leading-tight">
                <span className="block text-[10px] font-medium uppercase tracking-wider text-slate-300">
                  Llámanos Hoy
                </span>
                <span
                  className="block text-xs font-extrabold tracking-tight"
                  style={{ color: currentMood.color }}
                >
                  {BUSINESS_INFO.phone}
                </span>
              </div>
            </a>

            <a
              href={BUSINESS_INFO.googleReviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              id="header-btn-google-reviews"
              className="inline-flex items-center gap-1.5 px-2.5 py-2 rounded-md text-xs font-bold text-white bg-white/10 hover:bg-white/15 border border-white/15 transition-all duration-200"
              aria-label="Reseñas en Google Ideas & Colores (5.0 estrellas)"
            >
              <GoogleIcon className="w-3.5 h-3.5" />
              <span className="text-amber-300">5.0 ★</span>
            </a>

            <a
              href={BUSINESS_INFO.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              id="header-btn-whatsapp"
              className="inline-flex items-center gap-1.5 px-2.5 py-2 rounded-md text-xs font-bold text-emerald-300 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-400/30 transition-all duration-200"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
              <span className="hidden xl:inline">WhatsApp</span>
            </a>

            <a
              href="#cotizar"
              id="header-btn-quote"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('cotizar');
              }}
              className="group inline-flex items-center gap-2 pl-1.5 pr-3.5 py-1.5 rounded-md text-[11px] font-extrabold uppercase tracking-wider transition-all duration-200 shadow-md hover:-translate-y-px"
              style={{
                backgroundColor: currentMood.color,
                color: currentMood.textColorOnAccent,
              }}
            >
              <span className="w-6 h-6 rounded-sm bg-white flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-95">
                <ArrowRight
                  className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
                  style={{ color: currentMood.color }}
                  aria-hidden="true"
                />
              </span>
              <span>Cotizar</span>
            </a>
          </div>

          {/* Mobile Action Bar */}
          <div className="flex items-center gap-2 lg:hidden">
            <a
              href={BUSINESS_INFO.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="size-11 inline-flex items-center justify-center rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-400/30"
              aria-label="Hablar por WhatsApp con un asesor"
            >
              <MessageCircle className="w-4 h-4" aria-hidden="true" />
            </a>
            <button
              type="button"
              id="btn-mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="size-11 inline-flex items-center justify-center rounded-md text-white bg-white/10 hover:bg-white/15 border border-white/15 focus:outline-none transition-colors"
              aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-drawer-menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" aria-hidden="true" />
              ) : (
                <Menu className="w-5 h-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Right Slide-Over Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
          {/* Backdrop */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-[#090E19]/70 backdrop-blur-xs transition-opacity duration-200"
            aria-hidden="true"
          />

          {/* Full-Height Editorial Right Panel */}
          <aside
            id="mobile-drawer-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menú de navegación móvil"
            className="relative z-10 w-[85vw] max-w-[340px] h-[100dvh] bg-[#090E19] border-l border-[#27324D] shadow-2xl flex flex-col justify-between text-white overflow-y-auto"
          >
            <div
              className="h-[3px] w-full shrink-0"
              style={{ background: LOGO_SPECTRUM_GRADIENT }}
              aria-hidden="true"
            />

              <div className="flex flex-col justify-between flex-1 px-7 pt-5 pb-7 gap-6">
                {/* Drawer Header with Top-Right Close Button */}
                <div className="flex items-center justify-between">
                  <BrandLogo size="sm" variant="light" showSlogan={false} />
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    className="size-11 inline-flex items-center justify-center rounded-md text-white hover:bg-white/10 border border-white/15 transition-colors cursor-pointer"
                    aria-label="Cerrar menú"
                  >
                    <X className="w-5 h-5" aria-hidden="true" />
                  </button>
                </div>

                {/* Vertically Centered Large Editorial Links */}
                <nav className="my-auto space-y-2.5 py-2" aria-label="Móvil">
                  {[
                    {
                      id: 'soluciones',
                      label: 'Servicios',
                      pageKey: 'inicio',
                      accentKey: 'servicios',
                      hasChildren: true,
                    },
                    { id: 'proyectos', label: 'Proyectos', pageKey: 'proyectos', accentKey: 'proyectos' },
                    {
                      id: 'herramientas',
                      label: 'Color & Calculadora',
                      pageKey: 'herramientas',
                      accentKey: 'herramientas',
                    },
                    { id: 'confianza', label: 'Nosotros', pageKey: 'nosotros', accentKey: 'nosotros' },
                    { id: 'contacto', label: 'Contacto', pageKey: 'contacto', accentKey: 'contacto' },
                  ].map((item) => {
                    const isMobileActive =
                      (item.id === 'soluciones' &&
                        (activePage === 'inicio' || Boolean(activeCategorySlug))) ||
                      activePage === item.pageKey;
                    const mobAccent = NAV_PAGE_ACCENTS[item.accentKey] || currentMood.color;

                    if (item.hasChildren && onOpenCategoryPage) {
                      return (
                        <div key={item.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <a
                              href="#soluciones"
                              onClick={(e) => {
                                e.preventDefault();
                                handleNavClick('soluciones');
                              }}
                              className="inline-flex items-center gap-3 py-1.5 text-[26px] leading-tight font-black font-display tracking-tight transition-colors"
                              style={{ color: isMobileActive ? '#FFFFFF' : '#CBD5E1' }}
                            >
                              <span
                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                style={{ backgroundColor: mobAccent }}
                              />
                              <span>{item.label}</span>
                            </a>
                            <button
                              type="button"
                              onClick={() => setMobileServicesExpanded((prev) => !prev)}
                              aria-expanded={mobileServicesExpanded}
                              aria-label="Mostrar subpáginas de servicios"
                              className="size-10 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-300 cursor-pointer"
                            >
                              <ChevronDown
                                className={`w-4 h-4 transition-transform duration-200 ${
                                  mobileServicesExpanded ? 'rotate-180' : ''
                                }`}
                                aria-hidden="true"
                              />
                            </button>
                          </div>

                          {mobileServicesExpanded && (
                            <div className="pl-5 space-y-1 border-l border-[#27324D] ml-1 py-1">
                              {MULTI_SERVICES_CATEGORIES.map((cat) => {
                                const catTheme = getCategoryLogoTheme(cat.id, cat.accentColor);
                                const isCatCurrent = activeCategorySlug === cat.id;
                                return (
                                  <a
                                    key={cat.id}
                                    href={`/servicios/${cat.id}`}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      handleCategoryClick(cat.id);
                                    }}
                                    className={`flex items-center justify-between py-2 px-3 rounded-md text-xs font-bold transition-colors ${
                                      isCatCurrent
                                        ? 'bg-white/10 text-white'
                                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                                    }`}
                                  >
                                    <span className="truncate">{cat.shortTitle}</span>
                                    <span
                                      className="w-2 h-2 rounded-full shrink-0 ml-2"
                                      style={{ backgroundColor: catTheme.accent }}
                                    />
                                  </a>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    }

                    return (
                      <a
                        key={item.id}
                        href={`#${item.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          handleNavClick(item.id);
                        }}
                        className="flex items-center gap-3 py-1.5 text-[26px] leading-tight font-black font-display tracking-tight transition-colors"
                        style={{ color: isMobileActive ? '#FFFFFF' : '#CBD5E1' }}
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: mobAccent }}
                        />
                        <span>{item.label}</span>
                      </a>
                    );
                  })}
                </nav>

                {/* Bottom Phone, Mood Picker & Thumb-Friendly Actions */}
                <div className="space-y-4 pt-5 border-t border-[#27324D]">
                  <div className="flex items-center justify-between gap-3">
                    <a
                      href={`tel:${BUSINESS_INFO.phoneClean}`}
                      className="text-sm font-bold tracking-wide text-slate-200 hover:text-white transition-colors"
                    >
                      (502) 6661-7592
                    </a>
                    <MoodColorPicker variant="compact" className="mobile-mood-picker" />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <a
                      href="#cotizar"
                      onClick={(e) => {
                        e.preventDefault();
                        handleNavClick('cotizar');
                      }}
                      className="min-h-11 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-md font-extrabold text-xs shadow-md transition-all"
                      style={{
                        backgroundColor: currentMood.color,
                        color: currentMood.textColorOnAccent,
                      }}
                    >
                      <span>Cotizar</span>
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </a>

                    <a
                      href={BUSINESS_INFO.whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="min-h-11 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}
    </header>
  );
};

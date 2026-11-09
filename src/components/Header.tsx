import React, { useState, useEffect } from 'react';
import { Menu, X, MessageCircle, ArrowRight, Sparkles, ChevronDown } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { GoogleIcon } from './ui/GoogleIcon';
import { BUSINESS_INFO, MULTI_SERVICES_CATEGORIES } from '../data/content';
import { useColorMood } from '../context/ColorMoodContext';
import { MoodColorPicker } from './MoodColorPicker';

interface HeaderProps {
  activeSection: string;
  activeCategorySlug?: string | null;
  onNavigate: (sectionId: string) => void;
  onOpenCategoryPage?: (categoryId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeSection,
  activeCategorySlug,
  onNavigate,
  onOpenCategoryPage,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesMenuOpen, setServicesMenuOpen] = useState(false);
  const { currentMood } = useColorMood();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 32);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen && !servicesMenuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false);
        setServicesMenuOpen(false);
      }
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [mobileMenuOpen, servicesMenuOpen]);

  // Streamlined 5-item navigation for reduced cognitive load
  const navItems = [
    { id: 'soluciones', label: 'Multi-Servicios', hasSubpages: true },
    { id: 'herramientas', label: 'Color & Calculadora' },
    { id: 'proyectos', label: 'Proyectos' },
    { id: 'promociones', label: 'Promo -20%' },
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

  return (
    <header className="sticky top-0 z-40 w-full transition-all duration-500">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2.5 focus:rounded-xl focus:bg-slate-950 focus:text-white focus:font-bold focus:text-xs focus:shadow-xl focus:outline-2 focus:outline-amber-400"
      >
        Saltar al contenido principal
      </a>
      <div
        className={`w-full transition-all duration-300 ${
          isScrolled
            ? 'bg-white/90 backdrop-blur-lg shadow-[0_12px_30px_-27px_rgba(15,23,42,0.42)] border-b border-slate-200/60 py-2.5'
            : 'bg-transparent border-b border-transparent py-3.5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* Official Logo */}
          <a
            href="#inicio"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('inicio');
            }}
            className="text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-lg p-1 -ml-1 transition-transform hover:opacity-95 shrink-0"
            aria-label="Ir a inicio de Ideas & Colores Guatemala"
          >
            <BrandLogo size="md" variant="dark" showSlogan={false} />
          </a>

          {/* Desktop Navigation Links (5 streamlined items + Services Subpages menu) */}
          <nav className="hidden lg:flex items-center gap-1 whitespace-nowrap" aria-label="Principal">
            {navItems.map((item) => {
              const isActive =
                activeSection === item.id ||
                (item.id === 'herramientas' &&
                  (activeSection === 'estudio-color' || activeSection === 'calculadora')) ||
                (item.id === 'soluciones' && Boolean(activeCategorySlug));

              if (item.hasSubpages && onOpenCategoryPage) {
                return (
                  <div
                    key={item.id}
                    className="relative"
                    onMouseEnter={() => setServicesMenuOpen(true)}
                    onMouseLeave={() => setServicesMenuOpen(false)}
                  >
                    <button
                      type="button"
                      id={`nav-link-${item.id}`}
                      aria-expanded={servicesMenuOpen}
                      onClick={() => handleNavClick(item.id)}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors duration-200 relative inline-flex items-center gap-1 ${
                        isActive
                          ? 'text-slate-950 font-bold'
                          : 'text-slate-600 hover:text-slate-950 hover:bg-white/45'
                      }`}
                    >
                      <span>{item.label}</span>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                      {isActive && (
                        <span
                          className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full transition-colors duration-300"
                          style={{ backgroundColor: currentMood.color }}
                        />
                      )}
                    </button>

                    {servicesMenuOpen && (
                      <div className="absolute left-0 top-full pt-2 w-72 z-50">
                        <div className="rounded-2xl bg-white/98 backdrop-blur-xl border border-slate-200 shadow-xl p-2 space-y-1">
                          <a
                            href="#soluciones"
                            onClick={(e) => {
                              e.preventDefault();
                              handleNavClick('soluciones');
                            }}
                            className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between text-slate-900 bg-slate-50 hover:bg-slate-100 transition-colors"
                          >
                            <span>Ver sección Multi-Servicios</span>
                            <ArrowRight className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                          </a>
                          <div className="px-3 pt-1.5 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Subpáginas por Especialidad
                          </div>
                          {MULTI_SERVICES_CATEGORIES.map((cat) => (
                            <a
                              key={cat.id}
                              href={`#servicio/${cat.id}`}
                              onClick={(e) => {
                                e.preventDefault();
                                handleCategoryClick(cat.id);
                              }}
                              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                                activeCategorySlug === cat.id
                                  ? 'bg-slate-900 text-white'
                                  : 'text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              <span>{cat.title}</span>
                              <span
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ backgroundColor: cat.accentColor }}
                              />
                            </a>
                          ))}
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
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors duration-200 relative inline-block ${
                    isActive
                      ? 'text-slate-950 font-bold'
                      : 'text-slate-600 hover:text-slate-950 hover:bg-white/45'
                  }`}
                  aria-current={isActive ? 'location' : undefined}
                >
                  {item.label}
                  {isActive && (
                    <span
                      className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full transition-colors duration-300"
                      style={{ backgroundColor: currentMood.color }}
                    />
                  )}
                </a>
              );
            })}
          </nav>

          {/* Desktop CTA Action Group (Focused: Google 5.0 + WhatsApp + Primary Quote CTA) */}
          <div className="hidden lg:flex items-center gap-2.5 shrink-0">
            <a
              href={BUSINESS_INFO.googleReviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              id="header-btn-google-reviews"
              className="inline-flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-800 bg-white/65 hover:bg-amber-50/80 border border-slate-200/80 transition-all duration-200"
              aria-label="Reseñas en Google Ideas & Colores (5.0 estrellas)"
            >
              <GoogleIcon className="w-3.5 h-3.5" />
              <span className="text-amber-600 font-bold">5.0 ★</span>
            </a>

            <a
              href={BUSINESS_INFO.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              id="header-btn-whatsapp"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-800 bg-white/65 hover:bg-emerald-50/80 border border-slate-200/80 transition-all duration-200"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
              <span>WhatsApp</span>
            </a>

            <a
              href="#cotizar"
              id="header-btn-quote"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('cotizar');
              }}
              className="group relative inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 shadow-sm hover:-translate-y-px overflow-hidden"
              style={{
                backgroundColor: currentMood.color,
                color: currentMood.textColorOnAccent,
                boxShadow: `0 2px 10px ${currentMood.glow}`,
              }}
            >
              <span className="relative">Cotiza tu proyecto</span>
              <ArrowRight className="w-3.5 h-3.5 relative transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
            </a>
          </div>

          {/* Mobile Action Bar */}
          <div className="flex items-center gap-1.5 lg:hidden">
            <a
              href={BUSINESS_INFO.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="size-11 inline-flex items-center justify-center rounded-xl bg-white/75 text-emerald-700 border border-slate-200/80 backdrop-blur-md"
              aria-label="Hablar por WhatsApp con un asesor"
            >
              <MessageCircle className="w-4 h-4" aria-hidden="true" />
            </a>
            <button
              type="button"
              id="btn-mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="size-11 inline-flex items-center justify-center rounded-xl text-slate-700 hover:text-slate-950 hover:bg-white/60 focus:outline-none transition-colors"
              aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-drawer-menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" aria-hidden="true" /> : <Menu className="w-6 h-6" aria-hidden="true" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div
          id="mobile-drawer-menu"
          className="lg:hidden bg-white/98 backdrop-blur-lg border-b border-slate-200/70 shadow-xl px-4 pt-3 pb-6 space-y-4 max-h-[calc(100dvh-72px)] overflow-y-auto"
        >
          {/* Navigation Links */}
          <nav className="grid grid-cols-2 gap-1.5" aria-label="Móvil">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(item.id);
                }}
                className={`w-full min-h-11 text-left px-3 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center ${
                  activeSection === item.id
                    ? 'bg-slate-900 text-white font-bold'
                    : 'text-slate-700 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Direct Subpages Grid */}
          {onOpenCategoryPage && (
            <div className="pt-2 border-t border-slate-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Páginas por Especialidad:
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {MULTI_SERVICES_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategoryClick(cat.id)}
                    className="text-left px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200/80 text-slate-800 flex items-center justify-between"
                  >
                    <span className="truncate">{cat.shortTitle}</span>
                    <span
                      className="w-2 h-2 rounded-full shrink-0 ml-1"
                      style={{ backgroundColor: cat.accentColor }}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Mood Selector inside mobile menu */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
            <div className="text-[11px] font-bold text-slate-600 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-500" aria-hidden="true" />
              <span>Tono del sitio: {currentMood.name}</span>
            </div>
            <MoodColorPicker variant="compact" className="mobile-mood-picker" />
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-2">
            <a
              href="#cotizar"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('cotizar');
              }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs shadow-sm transition-all"
              style={{
                backgroundColor: currentMood.color,
                color: currentMood.textColorOnAccent,
              }}
            >
              <span>Cotiza tu proyecto</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </a>

            <a
              href={BUSINESS_INFO.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm"
            >
              <MessageCircle className="w-4 h-4" aria-hidden="true" />
              <span>Hablar por WhatsApp ({BUSINESS_INFO.phone})</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

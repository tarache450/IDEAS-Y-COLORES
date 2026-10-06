import React, { useState, useEffect } from 'react';
import { Menu, X, MessageCircle, ArrowRight, Sparkles, Instagram, Facebook } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { BUSINESS_INFO } from '../data/content';
import { useColorMood } from '../context/ColorMoodContext';
import { MoodColorPicker } from './MoodColorPicker';

interface HeaderProps {
  activeSection: string;
  onNavigate: (sectionId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeSection, onNavigate }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { currentMood } = useColorMood();

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 32);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileMenuOpen(false);
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [mobileMenuOpen]);

  const navItems = [
    { id: 'inicio', label: 'Inicio' },
    { id: 'confianza', label: 'Confianza' },
    { id: 'soluciones', label: 'Multi-Servicios' },
    { id: 'sectores', label: 'Sectores' },
    { id: 'estudio-color', label: 'Estudio de Color' },
    { id: 'calculadora', label: 'Calculadora' },
    { id: 'proyectos', label: 'Proyectos' },
    { id: 'promociones', label: 'Promociones' },
    { id: 'contacto', label: 'Contacto' },
  ];

  const handleNavClick = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full transition-all duration-500">

      {/* Main Navbar */}
      <div
        className={`w-full transition-all duration-300 ${
          isScrolled
            ? 'bg-white/88 backdrop-blur-lg shadow-[0_12px_30px_-27px_rgba(15,23,42,0.42)] border-b border-slate-200/60 py-2.5'
            : 'bg-transparent border-b border-transparent py-3.5'
        }`}
      >
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
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

          {/* Desktop Navigation Links */}
          <nav className="hidden min-[1400px]:flex items-center gap-0.5 whitespace-nowrap" aria-label="Navegación principal">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
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
                      : 'text-slate-600 hover:text-slate-950 hover:bg-white/35'
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

          {/* Desktop CTA Action Group */}
          <div className="hidden xl:flex items-center gap-2.5 shrink-0">
            {/* Compact Mood Selector */}
            <div className="hidden min-[1700px]:block">
              <MoodColorPicker variant="compact" />
            </div>

            {/* Instagram link */}
            <a
              href={BUSINESS_INFO.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              id="header-btn-instagram"
              className="inline-flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-pink-700 bg-white/55 hover:bg-pink-50/80 border border-white/70 transition-all duration-200 hover:-translate-y-px"
              title="Instagram @ideasycoloresgt"
              aria-label="Instagram de Ideas & Colores"
            >
              <Instagram className="w-3.5 h-3.5 text-pink-600" />
              <span className="hidden 2xl:inline">Instagram</span>
            </a>

            {/* Facebook link */}
            <a
              href={BUSINESS_INFO.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              id="header-btn-facebook"
              className="inline-flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-blue-700 bg-white/55 hover:bg-blue-50/80 border border-white/70 transition-all duration-200 hover:-translate-y-px"
              title="Facebook Ideas & Colores Multi-Servicios"
              aria-label="Facebook de Ideas & Colores"
            >
              <Facebook className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden 2xl:inline">Facebook</span>
            </a>

            {/* WhatsApp secondary CTA */}
            <a
              href={BUSINESS_INFO.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              id="header-btn-whatsapp"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-700 bg-white/55 hover:bg-emerald-50/80 border border-white/70 transition-all duration-200 hover:-translate-y-px"
              title="Hablar por WhatsApp con un especialista"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>WhatsApp</span>
            </a>

            {/* Main Dynamic Quote CTA */}
            {/* Main Dynamic Quote CTA */}
            <a
              href="#cotizar"
              id="header-btn-quote"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('cotizar');
              }}
              className="group relative inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 shadow-[0_8px_18px_-12px_rgba(15,23,42,0.55)] hover:shadow-[0_12px_24px_-14px_rgba(15,23,42,0.62)] hover:-translate-y-px active:translate-y-0 overflow-hidden"
              style={{
                backgroundColor: currentMood.color,
                color: currentMood.textColorOnAccent,
                boxShadow: `0 2px 10px ${currentMood.glow}`,
              }}
            >
              {/* Subtle shimmer effect */}
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <span className="relative">Cotiza tu proyecto</span>
              <ArrowRight className="w-3.5 h-3.5 relative transition-transform duration-200 group-hover:translate-x-0.5" />
            </a>
          </div>

          {/* Mobile Hamburger, Instagram & WhatsApp Button */}
          <div className="flex items-center gap-1.5 min-[1400px]:hidden">
            <a
              href={BUSINESS_INFO.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="size-11 inline-flex items-center justify-center rounded-xl bg-white/60 text-pink-600 border border-white/70 backdrop-blur-md"
              aria-label="Instagram de Ideas & Colores"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <a
              href={BUSINESS_INFO.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="size-11 inline-flex items-center justify-center rounded-xl bg-white/60 text-emerald-700 border border-white/70 backdrop-blur-md"
              aria-label="Hablar por WhatsApp con un asesor"
            >
              <MessageCircle className="w-4 h-4" />
            </a>
            <button
              type="button"
              id="btn-mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="size-11 inline-flex items-center justify-center rounded-xl text-slate-700 hover:text-slate-950 hover:bg-white/60 focus:outline-none transition-colors"
              aria-label={mobileMenuOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-drawer-menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div
          id="mobile-drawer-menu"
          className="min-[1400px]:hidden bg-white/96 backdrop-blur-lg border-b border-slate-200/70 shadow-[0_18px_38px_-26px_rgba(15,23,42,0.55)] px-4 pt-3 pb-6 space-y-4 nav-drawer-enter max-h-[calc(100dvh-72px)] overflow-y-auto"
        >
          {/* Mood Selector inside mobile menu */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
            <div className="text-[11px] font-bold text-slate-600 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Elige el tono de tu navegación: {currentMood.name}</span>
            </div>
            <MoodColorPicker variant="compact" className="mobile-mood-picker" />
          </div>

          <nav className="grid grid-cols-2 gap-1.5" aria-label="Navegación móvil">
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
                    ? 'bg-white text-slate-950 font-bold shadow-[0_4px_14px_-12px_rgba(15,23,42,0.55)]'
                    : 'text-slate-700 hover:bg-white/65'
                }`}
                style={{
                  boxShadow: activeSection === item.id ? `inset 2px 0 0 ${currentMood.color}` : undefined,
                }}
                aria-current={activeSection === item.id ? 'location' : undefined}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="pt-3 border-t border-slate-100 space-y-2.5">
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
              <ArrowRight className="w-4 h-4" />
            </a>

            <a
              href={BUSINESS_INFO.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Hablar por WhatsApp ({BUSINESS_INFO.phone})</span>
            </a>

            <a
              href={BUSINESS_INFO.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-pink-50 border border-pink-200/80 text-pink-700 hover:bg-pink-100 font-semibold text-xs shadow-2xs transition-colors"
            >
              <Instagram className="w-4 h-4 text-pink-600" />
              <span>Instagram: {BUSINESS_INFO.instagram}</span>
            </a>

            <a
              href={BUSINESS_INFO.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-50 border border-blue-200/80 text-blue-700 hover:bg-blue-100 font-semibold text-xs shadow-2xs transition-colors"
            >
              <Facebook className="w-4 h-4 text-blue-600" />
              <span>Facebook: {BUSINESS_INFO.facebook}</span>
            </a>

            <div className="pt-2 text-center text-[11px] text-slate-500 flex flex-col gap-0.5">
              <span>PBX: {BUSINESS_INFO.phone}</span>
              <span>{BUSINESS_INFO.location}</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

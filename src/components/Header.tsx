import React, { useState, useEffect } from 'react';
import { Menu, X, Phone, MessageCircle, ArrowRight, Clock, MapPin, Sparkles } from 'lucide-react';
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
  const [scrollProgress, setScrollProgress] = useState(0);
  const { currentMood } = useColorMood();

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 20);

      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress(Math.min(100, (scrollY / totalHeight) * 100));
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'inicio', label: 'Inicio' },
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
    <header className="sticky top-0 z-40 w-full transition-all duration-300">
      {/* 21st.dev Minimalist Scroll Progress Indicator */}
      <div className="w-full h-[2.5px] bg-slate-200/50 relative overflow-hidden">
        <div
          className="h-full transition-all duration-150 ease-out origin-left"
          style={{
            width: `${scrollProgress}%`,
            backgroundColor: currentMood.color,
            boxShadow: `0 0 8px ${currentMood.glow}`,
          }}
        />
      </div>

      {/* Top Utility Bar (discreet, professional, local Guatemala info) */}
      <div className="bg-slate-950 text-slate-300 text-[11px] sm:text-xs py-1.5 px-4 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{BUSINESS_INFO.location}</span>
            </span>
            <span className="hidden md:flex items-center gap-1.5 text-slate-400">
              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{BUSINESS_INFO.hoursWeekday}</span>
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 ml-auto">
            {/* Quick Mood indicator chip */}
            <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-slate-400">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: currentMood.color }} />
              <span className="text-slate-300 font-medium">{currentMood.name}</span>
            </div>

            <span className="hidden sm:inline text-slate-700">|</span>

            <a
              href={`tel:${BUSINESS_INFO.phoneClean}`}
              className="flex items-center gap-1.5 text-slate-200 hover:text-white transition-colors"
              title="Llamar a Ideas & Colores"
            >
              <Phone className="w-3 h-3 text-amber-400" />
              <span className="font-semibold">{BUSINESS_INFO.phone}</span>
            </a>
            <span className="hidden sm:inline text-slate-700">|</span>
            <span className="hidden sm:inline-flex items-center gap-1 text-slate-400">
              Respaldado por <strong className="text-slate-200 font-semibold">{BUSINESS_INFO.partnerBrand}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div
        className={`w-full transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200/90 py-2.5'
            : 'bg-white/80 backdrop-blur-xs border-b border-slate-100 py-3.5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* Official Logo */}
          <button
            type="button"
            onClick={() => handleNavClick('inicio')}
            className="text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-lg p-1 -ml-1 transition-transform hover:opacity-95 shrink-0"
            aria-label="Ir a inicio de Ideas & Colores Guatemala"
          >
            <BrandLogo size="md" variant="dark" showSlogan={false} />
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  id={`nav-link-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 relative ${
                    isActive
                      ? 'text-slate-900 bg-slate-100/90 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span
                      className="absolute bottom-0 left-2.5 right-2.5 h-[2px] rounded-full transition-colors duration-400"
                      style={{ backgroundColor: currentMood.color }}
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Desktop CTA Action Group */}
          <div className="hidden md:flex items-center gap-2.5 shrink-0">
            {/* Compact Mood Selector */}
            <MoodColorPicker variant="compact" />

            {/* WhatsApp secondary CTA */}
            <a
              href={BUSINESS_INFO.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              id="header-btn-whatsapp"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 transition-all duration-150"
              title="Hablar por WhatsApp con un especialista"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>WhatsApp</span>
            </a>

            {/* Main Dynamic Quote CTA */}
            <button
              type="button"
              id="header-btn-quote"
              onClick={() => handleNavClick('cotizar')}
              className="group relative inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 shadow-sm hover:shadow-md active:scale-98 overflow-hidden"
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
            </button>
          </div>

          {/* Mobile Hamburger & WhatsApp Button */}
          <div className="flex items-center gap-2 xl:hidden">
            <a
              href={BUSINESS_INFO.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200"
              aria-label="WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
            </a>
            <button
              type="button"
              id="btn-mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 hover:text-slate-950 hover:bg-slate-100 focus:outline-none"
              aria-label="Abrir menú de navegación"
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
          className="xl:hidden bg-white/95 backdrop-blur-lg border-b border-slate-200 shadow-xl px-4 pt-3 pb-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          {/* Mood Selector inside mobile menu */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
            <div className="text-[11px] font-bold text-slate-600 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Elige el tono de tu navegación:</span>
            </div>
            <MoodColorPicker variant="full" />
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                  activeSection === item.id
                    ? 'bg-slate-100 text-slate-950 font-bold border-l-4'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
                style={{
                  borderLeftColor: activeSection === item.id ? currentMood.color : 'transparent',
                }}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-2.5">
            <button
              type="button"
              onClick={() => handleNavClick('cotizar')}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs shadow-sm transition-all"
              style={{
                backgroundColor: currentMood.color,
                color: currentMood.textColorOnAccent,
              }}
            >
              <span>Cotiza tu proyecto</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href={BUSINESS_INFO.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Hablar por WhatsApp (+502 5513-4010)</span>
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

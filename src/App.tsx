import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { ColorMoodProvider, useColorMood } from './context/ColorMoodContext';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { BentoTrustGrid } from './components/BentoTrustGrid';
import { SolutionsSection } from './components/SolutionsSection';
import { SectorsSection } from './components/SectorsSection';
import { InteractiveToolsHub } from './components/InteractiveToolsHub';
import { ProjectsGallery } from './components/ProjectsGallery';
import { ProcessSection } from './components/ProcessSection';
import { TestimonialsGuaranteesSection } from './components/TestimonialsGuaranteesSection';
import { PromoSection } from './components/PromoSection';
import { FAQSection } from './components/FAQSection';
import { QuoteForm } from './components/QuoteForm';
import { ContactSection } from './components/ContactSection';
import { FinalCTA } from './components/FinalCTA';
import { Footer } from './components/Footer';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { DynamicBackground } from './components/ui/DynamicBackground';
import { PrivacyPolicyModal } from './components/PrivacyPolicyModal';

// Separate full-screen views remain code-split
const ServiceCategoryPage = lazy(() =>
  import('./components/ServiceCategoryPage').then((m) => ({ default: m.ServiceCategoryPage }))
);
const AdminDashboard = lazy(() =>
  import('./components/admin/AdminDashboard').then((m) => ({ default: m.AdminDashboard }))
);

const SectionSkeleton: React.FC<{ id: string; minHeight?: string }> = ({
  id,
  minHeight = '300px',
}) => (
  <section
    id={id}
    style={{ minHeight }}
    className="w-full flex items-center justify-center py-12"
    aria-busy="true"
  >
    <div className="w-6 h-6 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin" />
  </section>
);

function parseCategoryFromUrl(): string | null {
  if (typeof window === 'undefined') return null;
  const hash = window.location.hash;
  if (hash.startsWith('#servicio/')) {
    return hash.replace('#servicio/', '').trim() || null;
  }
  const path = window.location.pathname;
  if (path.startsWith('/servicios/')) {
    return path.replace('/servicios/', '').replace(/\/$/, '').trim() || null;
  }
  return null;
}

function resolveSectionTargetId(sectionId: string): string {
  if (sectionId === 'estudio-color' || sectionId === 'calculadora' || sectionId === 'herramientas') {
    return 'herramientas';
  }
  if (sectionId === 'servicios') {
    return 'soluciones';
  }
  if (sectionId === 'nosotros') {
    return 'confianza';
  }
  return sectionId;
}

function AppContent() {
  const [activeSection, setActiveSection] = useState('inicio');
  const [activeToolTab, setActiveToolTab] = useState<'color' | 'calculadora'>('color');
  const [activeCategorySlug, setActiveCategorySlug] = useState<string | null>(() =>
    parseCategoryFromUrl()
  );
  const [selectedSolutionForQuote, setSelectedSolutionForQuote] = useState<string>('');
  const [selectedProjectForQuote, setSelectedProjectForQuote] = useState<string>('');
  const [customQuoteMessage, setCustomQuoteMessage] = useState<string>('');
  const { currentMood } = useColorMood();
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const isProgrammaticScrollRef = useRef(false);
  const scrollLockTimeoutRef = useRef<number | null>(null);

  const [isAdminView, setIsAdminView] = useState(() => {
    return (
      typeof window !== 'undefined' &&
      (window.location.pathname === '/admin' || window.location.hash === '#admin')
    );
  });

  useEffect(() => {
    const handleUrlChange = () => {
      setIsAdminView(window.location.pathname === '/admin' || window.location.hash === '#admin');
      const nextCat = parseCategoryFromUrl();
      setActiveCategorySlug(nextCat);
      if (nextCat) {
        window.scrollTo({ top: 0, behavior: 'auto' });
      }
    };

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setIsAdminView((prev) => {
          const next = !prev;
          window.location.hash = next ? '#admin' : '';
          return next;
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // If initial URL has a section hash (e.g. #proyectos, #promociones, #contacto, #cotizar), scroll to it
    const initialHash = window.location.hash.replace('#', '').trim();
    if (
      initialHash &&
      !initialHash.startsWith('servicio/') &&
      initialHash !== 'admin' &&
      initialHash !== 'inicio'
    ) {
      window.setTimeout(() => {
        scrollToSection(initialHash);
      }, 100);
    }

    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
      window.removeEventListener('keydown', handleKeyDown);
      if (scrollLockTimeoutRef.current) {
        window.clearTimeout(scrollLockTimeoutRef.current);
      }
    };
  }, []);

  const openAdmin = () => {
    setIsAdminView(true);
    window.location.hash = '#admin';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const closeAdmin = () => {
    setIsAdminView(false);
    if (window.location.hash === '#admin') {
      window.location.hash = '';
    }
  };

  const openCategoryPage = (categoryId: string) => {
    setActiveCategorySlug(categoryId);
    window.location.hash = `#servicio/${categoryId}`;
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const closeCategoryPage = () => {
    setActiveCategorySlug(null);
    if (window.location.hash.startsWith('#servicio/')) {
      history.pushState('', document.title, window.location.pathname + window.location.search);
    }
  };

  const scrollToSection = (sectionId: string) => {
    if (sectionId === 'calculadora') {
      setActiveToolTab('calculadora');
    } else if (sectionId === 'estudio-color' || sectionId === 'herramientas') {
      setActiveToolTab('color');
    }

    const targetId = resolveSectionTargetId(sectionId);
    setActiveSection(targetId);

    // Lock scrollspy during programmatic scroll so header active underline stays on clicked target
    isProgrammaticScrollRef.current = true;
    if (scrollLockTimeoutRef.current) {
      window.clearTimeout(scrollLockTimeoutRef.current);
    }
    scrollLockTimeoutRef.current = window.setTimeout(() => {
      isProgrammaticScrollRef.current = false;
    }, 900);

    const scrollElementIntoPosition = (behavior: ScrollBehavior = 'smooth') => {
      if (targetId === 'inicio') {
        window.scrollTo({ top: 0, behavior });
        return;
      }
      const element = document.getElementById(targetId);
      if (element) {
        const navOffset = 78;
        const elementTop = element.getBoundingClientRect().top + window.scrollY;
        const offsetPosition = Math.max(0, elementTop - navOffset);
        window.scrollTo({
          top: offsetPosition,
          behavior,
        });
      }
    };

    const executeNavigation = () => {
      window.dispatchEvent(new CustomEvent('navigate-section', { detail: targetId }));
      if (!window.location.hash.startsWith('#servicio/')) {
        history.replaceState(null, '', targetId === 'inicio' ? window.location.pathname : `#${sectionId}`);
      }
      scrollElementIntoPosition('smooth');

      // Follow-up alignment pass in case images/tabs expanded layout height
      window.setTimeout(() => {
        if (targetId === 'inicio') return;
        const element = document.getElementById(targetId);
        if (!element) return;
        const navOffset = 78;
        const delta = element.getBoundingClientRect().top - navOffset;
        if (Math.abs(delta) > 16) {
          window.scrollTo({
            top: Math.max(0, window.scrollY + delta),
            behavior: 'smooth',
          });
        }
      }, 240);
    };

    // If user is inside a category subpage and clicks a landing section (other than #cotizar/#contacto which exist on both)
    if (activeCategorySlug && targetId !== 'cotizar' && targetId !== 'contacto') {
      closeCategoryPage();
      window.setTimeout(() => {
        history.replaceState(null, '', targetId === 'inicio' ? window.location.pathname : `#${sectionId}`);
        scrollElementIntoPosition('smooth');
      }, 60);
      window.setTimeout(() => {
        scrollElementIntoPosition('auto');
      }, 220);
    } else {
      executeNavigation();
    }
  };

  const handleSelectSolution = (solutionTitle: string, customMsg?: string) => {
    setSelectedSolutionForQuote(solutionTitle);
    if (customMsg) {
      setCustomQuoteMessage(customMsg);
    }
    scrollToSection('cotizar');
  };

  const handleRequestSimilarProject = (projectTitle: string, category: string) => {
    setSelectedProjectForQuote(category);
    setCustomQuoteMessage(
      `Me interesa solicitar una cotización para un proyecto similar a: "${projectTitle}" (${category}).`
    );
    scrollToSection('cotizar');
  };

  const handleColorSelectedForQuote = (
    colorName: string,
    colorCode: string,
    finish: string,
    roomName: string,
    hex?: string
  ) => {
    setSelectedSolutionForQuote('Pintura y recubrimientos');
    setCustomQuoteMessage(
      `Me interesa cotizar mi proyecto con el color ${colorCode} ${colorName}${
        hex ? ` (${hex})` : ''
      }, acabado ${finish.toUpperCase()} para el espacio de ${roomName}.`
    );
    scrollToSection('cotizar');
  };

  const handleTransferCalculatorToQuote = (details: string) => {
    setCustomQuoteMessage(details);
    setSelectedSolutionForQuote('Pintura y recubrimientos');
    scrollToSection('cotizar');
  };

  // Zero-layout-thrashing IntersectionObserver Scrollspy
  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window) || activeCategorySlug)
      return;

    const sectionIds = [
      'inicio',
      'confianza',
      'soluciones',
      'sectores',
      'herramientas',
      'proyectos',
      'proceso',
      'garantias',
      'promociones',
      'faq',
      'cotizar',
      'contacto',
    ];

    const observer = new IntersectionObserver(
      (entries) => {
        if (isProgrammaticScrollRef.current) return;
        for (const entry of entries) {
          if (entry.isIntersecting && entry.target.id) {
            setActiveSection(entry.target.id);
            break;
          }
        }
      },
      {
        rootMargin: '-20% 0px -65% 0px',
        threshold: 0,
      }
    );

    for (const id of sectionIds) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    return () => {
      observer.disconnect();
    };
  }, [activeCategorySlug]);

  if (isAdminView) {
    return (
      <Suspense
        fallback={
          <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white space-y-3">
            <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-semibold text-slate-300">
              Cargando panel de administración...
            </p>
          </div>
        }
      >
        <AdminDashboard onBackToSite={closeAdmin} />
      </Suspense>
    );
  }

  return (
    <div
      className="min-h-screen text-slate-900 flex flex-col antialiased relative overflow-x-hidden selection:bg-blue-600 selection:text-white"
      style={{ '--mood-color': currentMood.color } as React.CSSProperties}
    >
      {/* Fluid Dynamic Ambient Canvas */}
      <DynamicBackground />

      {/* Streamlined Sticky Header with Subpages Menu */}
      <Header
        activeSection={activeSection}
        activeCategorySlug={activeCategorySlug}
        onNavigate={scrollToSection}
        onOpenCategoryPage={openCategoryPage}
      />

      {/* Main Content Area: Either Dedicated Service Subpage OR Streamlined Hub Landing */}
      <main id="main-content" className="flex-1 relative z-10">
        {activeCategorySlug ? (
          <>
            <Suspense fallback={<SectionSkeleton id="subpage-loading" minHeight="600px" />}>
              <ServiceCategoryPage
                categoryId={activeCategorySlug}
                onBackToHome={() => {
                  closeCategoryPage();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onSelectCategory={openCategoryPage}
                onQuoteCategory={(catTitle, msg) => handleSelectSolution(catTitle, msg)}
                onOpenTool={(tool) => {
                  closeCategoryPage();
                  setActiveToolTab(tool);
                  window.setTimeout(() => scrollToSection('herramientas'), 60);
                }}
              />
            </Suspense>

            {/* Pre-configured Quote Form & Contact right inside the Subpage for instant conversion */}
            <QuoteForm
              initialProjectType={selectedProjectForQuote || 'Residencial'}
              initialService={selectedSolutionForQuote || 'Pintura y recubrimientos'}
              initialMessage={customQuoteMessage}
              onOpenPrivacy={() => setIsPrivacyModalOpen(true)}
            />

            <ContactSection />
          </>
        ) : (
          <>
            {/* 1. Hero con CTAs priorizados sobre el fold */}
            <Hero
              onQuoteClick={() => scrollToSection('cotizar')}
              onExploreColorsClick={() => {
                setActiveToolTab('color');
                scrollToSection('herramientas');
              }}
            />

            {/* 2. Bento Unificado de Confianza, 4 Pilares, Marcas e Identidad Guatemalteca */}
            <BentoTrustGrid onQuoteClick={() => scrollToSection('cotizar')} />

            {/* 3. Multi-Servicios con acceso directo a las 6 Subpáginas Especializadas */}
            <SolutionsSection
              onSelectSolution={(title) => handleSelectSolution(title)}
              onOpenCategoryPage={openCategoryPage}
            />

            {/* 4. Sectores que atendemos en Guatemala */}
            <SectorsSection
              onQuoteSector={(sectorTitle) => {
                setSelectedProjectForQuote(sectorTitle);
                scrollToSection('cotizar');
              }}
            />

            {/* 5. Hub Unificado de Herramientas en Pestañas (Estudio de Color + Calculadora m²) */}
            <InteractiveToolsHub
              activeToolTab={activeToolTab}
              onTabChange={setActiveToolTab}
              onSelectColorForQuote={handleColorSelectedForQuote}
              onTransferCalculatorToQuote={handleTransferCalculatorToQuote}
            />

            {/* 6. Galería de Proyectos y Comparativa Antes/Después */}
            <ProjectsGallery onRequestSimilar={handleRequestSimilarProject} />

            {/* 7. Proceso de Transformación en 4 Pasos */}
            <ProcessSection onQuoteClick={() => scrollToSection('cotizar')} />

            {/* 8. Reseñas Verificadas Google 5.0 ★ y Trayectoria Corporativa (Sin duplicados) */}
            <TestimonialsGuaranteesSection />

            {/* 9. Promoción Oficial (-20%) */}
            <PromoSection onQuoteClick={() => scrollToSection('cotizar')} />

            {/* 10. Preguntas Frecuentes (Resolución de Objeciones) */}
            <FAQSection onOpenPrivacy={() => setIsPrivacyModalOpen(true)} />

            {/* 11. Formulario Único de Cotización de 3 Pasos */}
            <QuoteForm
              initialProjectType={selectedProjectForQuote || 'Residencial'}
              initialService={selectedSolutionForQuote || 'Pintura y recubrimientos'}
              initialMessage={customQuoteMessage}
              onOpenPrivacy={() => setIsPrivacyModalOpen(true)}
            />

            {/* 12. Canales Verificados y Mapa Carretera a El Salvador Km 21.5, Fraijanes */}
            <ContactSection />

            {/* 13. Cierre Visual FinalCTA */}
            <FinalCTA onQuoteClick={() => scrollToSection('cotizar')} />
          </>
        )}
      </main>

      {/* Footer */}
      <Footer
        onNavigate={scrollToSection}
        onOpenCategoryPage={openCategoryPage}
        onOpenAdmin={openAdmin}
        onOpenPrivacy={() => setIsPrivacyModalOpen(true)}
      />

      {/* Sticky Floating WhatsApp Conversion Drawer */}
      <FloatingWhatsApp />

      {/* Modal de Política de Privacidad */}
      <PrivacyPolicyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ColorMoodProvider>
      <AppContent />
    </ColorMoodProvider>
  );
}

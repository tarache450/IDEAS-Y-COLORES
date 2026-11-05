import React, { useState, useEffect, lazy, Suspense } from 'react';
import { ColorMoodProvider, useColorMood } from './context/ColorMoodContext';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { BentoTrustGrid } from './components/BentoTrustGrid';
import { SolutionsSection } from './components/SolutionsSection';
import { SectorsSection } from './components/SectorsSection';
import { Footer } from './components/Footer';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { DynamicBackground } from './components/ui/DynamicBackground';
import { PrivacyPolicyModal } from './components/PrivacyPolicyModal';
import { LazySection } from './components/ui/LazySection';

// Lazy-loaded below-the-fold sections and subpage views
const InteractiveToolsHub = lazy(() =>
  import('./components/InteractiveToolsHub').then((m) => ({ default: m.InteractiveToolsHub }))
);
const ServiceCategoryPage = lazy(() =>
  import('./components/ServiceCategoryPage').then((m) => ({ default: m.ServiceCategoryPage }))
);
const ProcessSection = lazy(() =>
  import('./components/ProcessSection').then((m) => ({ default: m.ProcessSection }))
);
const ProjectsGallery = lazy(() =>
  import('./components/ProjectsGallery').then((m) => ({ default: m.ProjectsGallery }))
);
const TestimonialsGuaranteesSection = lazy(() =>
  import('./components/TestimonialsGuaranteesSection').then((m) => ({
    default: m.TestimonialsGuaranteesSection,
  }))
);
const PromoSection = lazy(() =>
  import('./components/PromoSection').then((m) => ({ default: m.PromoSection }))
);
const FAQSection = lazy(() =>
  import('./components/FAQSection').then((m) => ({ default: m.FAQSection }))
);
const QuoteForm = lazy(() =>
  import('./components/QuoteForm').then((m) => ({ default: m.QuoteForm }))
);
const ContactSection = lazy(() =>
  import('./components/ContactSection').then((m) => ({ default: m.ContactSection }))
);
const FinalCTA = lazy(() =>
  import('./components/FinalCTA').then((m) => ({ default: m.FinalCTA }))
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

  const [isAdminView, setIsAdminView] = useState(() => {
    return (
      typeof window !== 'undefined' &&
      (window.location.pathname === '/admin' || window.location.hash === '#admin')
    );
  });

  useEffect(() => {
    const handleUrlChange = () => {
      setIsAdminView(window.location.pathname === '/admin' || window.location.hash === '#admin');
      setActiveCategorySlug(parseCategoryFromUrl());
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

    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
      window.removeEventListener('keydown', handleKeyDown);
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

    const performScroll = () => {
      const targetId =
        sectionId === 'estudio-color' || sectionId === 'calculadora'
          ? 'herramientas'
          : sectionId;
      window.dispatchEvent(new CustomEvent('navigate-section', { detail: sectionId }));
      setActiveSection(sectionId);
      const element = document.getElementById(targetId);
      if (element) {
        const navOffset = 80;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - navOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    // If user is inside a category subpage and clicks a landing section (other than #cotizar/#contacto which exist on both)
    if (activeCategorySlug && sectionId !== 'cotizar' && sectionId !== 'contacto') {
      closeCategoryPage();
      window.setTimeout(performScroll, 80);
    } else {
      performScroll();
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
        for (const entry of entries) {
          if (entry.isIntersecting && entry.target.id) {
            setActiveSection(entry.target.id);
            break;
          }
        }
      },
      {
        rootMargin: '-22% 0px -65% 0px',
        threshold: 0,
      }
    );

    const observeElements = () => {
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el) observer.observe(el);
      }
    };

    observeElements();
    const timer = window.setTimeout(observeElements, 1200);

    return () => {
      window.clearTimeout(timer);
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
                  window.setTimeout(() => scrollToSection('herramientas'), 80);
                }}
              />
            </Suspense>

            {/* Pre-configured Quote Form & Contact right inside the Subpage for instant conversion */}
            <Suspense fallback={<SectionSkeleton id="cotizar" minHeight="500px" />}>
              <QuoteForm
                initialProjectType={selectedProjectForQuote || 'Residencial'}
                initialService={selectedSolutionForQuote || 'Pintura y recubrimientos'}
                initialMessage={customQuoteMessage}
                onOpenPrivacy={() => setIsPrivacyModalOpen(true)}
              />
            </Suspense>

            <Suspense fallback={<SectionSkeleton id="contacto" minHeight="400px" />}>
              <ContactSection />
            </Suspense>
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
            <LazySection id="herramientas-wrapper" minHeight="480px">
              <Suspense fallback={<SectionSkeleton id="herramientas" minHeight="480px" />}>
                <InteractiveToolsHub
                  activeToolTab={activeToolTab}
                  onTabChange={setActiveToolTab}
                  onSelectColorForQuote={handleColorSelectedForQuote}
                  onTransferCalculatorToQuote={handleTransferCalculatorToQuote}
                />
              </Suspense>
            </LazySection>

            {/* 6. Galería de Proyectos y Comparativa Antes/Después */}
            <LazySection id="proyectos" minHeight="450px">
              <Suspense fallback={<SectionSkeleton id="proyectos" minHeight="450px" />}>
                <ProjectsGallery onRequestSimilar={handleRequestSimilarProject} />
              </Suspense>
            </LazySection>

            {/* 7. Proceso de Transformación en 4 Pasos */}
            <LazySection id="proceso" minHeight="300px">
              <Suspense fallback={<SectionSkeleton id="proceso" minHeight="300px" />}>
                <ProcessSection onQuoteClick={() => scrollToSection('cotizar')} />
              </Suspense>
            </LazySection>

            {/* 8. Reseñas Verificadas Google 5.0 ★ y Trayectoria Corporativa (Sin duplicados) */}
            <LazySection id="garantias" minHeight="280px">
              <Suspense fallback={<SectionSkeleton id="garantias" minHeight="280px" />}>
                <TestimonialsGuaranteesSection />
              </Suspense>
            </LazySection>

            {/* 9. Promoción Oficial (-20%) */}
            <LazySection id="promociones" minHeight="250px">
              <Suspense fallback={<SectionSkeleton id="promociones" minHeight="250px" />}>
                <PromoSection onQuoteClick={() => scrollToSection('cotizar')} />
              </Suspense>
            </LazySection>

            {/* 10. Preguntas Frecuentes (Resolución de Objeciones) */}
            <LazySection id="faq" minHeight="320px">
              <Suspense fallback={<SectionSkeleton id="faq" minHeight="320px" />}>
                <FAQSection onOpenPrivacy={() => setIsPrivacyModalOpen(true)} />
              </Suspense>
            </LazySection>

            {/* 11. Formulario Único de Cotización de 3 Pasos */}
            <LazySection id="cotizar" minHeight="500px">
              <Suspense fallback={<SectionSkeleton id="cotizar" minHeight="500px" />}>
                <QuoteForm
                  initialProjectType={selectedProjectForQuote || 'Residencial'}
                  initialService={selectedSolutionForQuote || 'Pintura y recubrimientos'}
                  initialMessage={customQuoteMessage}
                  onOpenPrivacy={() => setIsPrivacyModalOpen(true)}
                />
              </Suspense>
            </LazySection>

            {/* 12. Canales Verificados y Mapa Carretera a El Salvador (Sin segundo formulario repetido) */}
            <LazySection id="contacto" minHeight="400px">
              <Suspense fallback={<SectionSkeleton id="contacto" minHeight="400px" />}>
                <ContactSection />
              </Suspense>
            </LazySection>

            {/* 13. Cierre Visual FinalCTA */}
            <LazySection id="final-cta" minHeight="250px">
              <Suspense fallback={<SectionSkeleton id="final-cta" minHeight="250px" />}>
                <FinalCTA onQuoteClick={() => scrollToSection('cotizar')} />
              </Suspense>
            </LazySection>
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

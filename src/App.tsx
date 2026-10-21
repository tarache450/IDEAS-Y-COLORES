import React, { useState, useEffect, lazy, Suspense } from 'react';
import { ColorMoodProvider, useColorMood } from './context/ColorMoodContext';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { BentoTrustGrid } from './components/BentoTrustGrid';
import { SolutionsSection } from './components/SolutionsSection';
import { SectorsSection } from './components/SectorsSection';
import { Footer } from './components/Footer';
import { FloatingColorDock } from './components/FloatingColorDock';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { DynamicBackground } from './components/ui/DynamicBackground';
import { PrivacyPolicyModal } from './components/PrivacyPolicyModal';
import { LazySection } from './components/ui/LazySection';

// Lazy-loaded components below the fold to minimize initial mobile bundle transfer
const ColorStudioVisualizer = lazy(() =>
  import('./components/ColorStudioVisualizer').then((m) => ({ default: m.ColorStudioVisualizer }))
);
const PaintCalculator = lazy(() =>
  import('./components/PaintCalculator').then((m) => ({ default: m.PaintCalculator }))
);
const ServicesSection = lazy(() =>
  import('./components/ServicesSection').then((m) => ({ default: m.ServicesSection }))
);
const ProcessSection = lazy(() =>
  import('./components/ProcessSection').then((m) => ({ default: m.ProcessSection }))
);
const ProjectsGallery = lazy(() =>
  import('./components/ProjectsGallery').then((m) => ({ default: m.ProjectsGallery }))
);
const TestimonialsGuaranteesSection = lazy(() =>
  import('./components/TestimonialsGuaranteesSection').then((m) => ({ default: m.TestimonialsGuaranteesSection }))
);
const PromoSection = lazy(() =>
  import('./components/PromoSection').then((m) => ({ default: m.PromoSection }))
);
const AboutSection = lazy(() =>
  import('./components/AboutSection').then((m) => ({ default: m.AboutSection }))
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

const SectionSkeleton: React.FC<{ id: string; minHeight?: string }> = ({ id, minHeight = '300px' }) => (
  <section id={id} style={{ minHeight }} className="w-full flex items-center justify-center py-12" aria-busy="true">
    <div className="w-6 h-6 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin" />
  </section>
);

function AppContent() {
  const [activeSection, setActiveSection] = useState('inicio');
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

  const scrollToSection = (sectionId: string) => {
    window.dispatchEvent(new CustomEvent('navigate-section', { detail: sectionId }));
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
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

  const handleSelectSolution = (solutionTitle: string) => {
    setSelectedSolutionForQuote(solutionTitle);
    scrollToSection('cotizar');
  };

  const handleRequestSimilarProject = (projectTitle: string, category: string) => {
    setSelectedProjectForQuote(category);
    setCustomQuoteMessage(`Me interesa solicitar una cotización para un proyecto similar a: "${projectTitle}" (${category}).`);
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
      `Me interesa cotizar mi proyecto con el color ${colorCode} ${colorName}${hex ? ` (${hex})` : ''}, acabado ${finish.toUpperCase()} para el espacio de ${roomName}.`
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
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;

    const sectionIds = [
      'inicio',
      'confianza',
      'soluciones',
      'sectores',
      'estudio-color',
      'calculadora',
      'servicios',
      'proyectos',
      'promociones',
      'nosotros',
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
  }, []);

  if (isAdminView) {
    return (
      <Suspense
        fallback={
          <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white space-y-3">
            <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-semibold text-slate-300">Cargando panel de administración...</p>
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
      {/* Fluid Dynamic Ambient Canvas with Prominent Motion & Mood-Reactive Colors */}
      <DynamicBackground />

      {/* Sticky Header with local GT contact & WhatsApp integration */}
      <Header activeSection={activeSection} onNavigate={scrollToSection} />

      {/* Main Content Sections */}
      <main className="flex-1 relative z-10">
        {/* 1. Hero con cambiador dinámico de tonos en vivo y nuevo posicionamiento Multi-Servicios */}
        <Hero
          onQuoteClick={() => scrollToSection('cotizar')}
          onExploreColorsClick={() => scrollToSection('estudio-color')}
        />

        {/* 2. Bento Grid Unificado de Confianza con los 4 Pilares Verificados y Garantías */}
        <BentoTrustGrid onQuoteClick={() => scrollToSection('cotizar')} />

        {/* 3. Multi-Servicios por necesidad: 6 Categorías Verificadas */}
        <SolutionsSection onSelectSolution={handleSelectSolution} />

        {/* 3.1. Sectores que atendemos en Guatemala (6 sectores) */}
        <SectorsSection
          onQuoteSector={(sectorTitle) => {
            setSelectedProjectForQuote(sectorTitle);
            scrollToSection('cotizar');
          }}
        />

        {/* 4. Estudio Interactivo de Color & Visualizador Virtual de Ambientes */}
        <LazySection id="estudio-color" minHeight="450px">
        <Suspense fallback={<SectionSkeleton id="estudio-color" minHeight="450px" />}>
          <ColorStudioVisualizer onSelectColorForQuote={handleColorSelectedForQuote} />
        </Suspense>
        </LazySection>

        {/* 5. Calculadora Interactiva de Pintura, Rendimiento y Ahorro */}
        <LazySection id="calculadora" minHeight="400px">
        <Suspense fallback={<SectionSkeleton id="calculadora" minHeight="400px" />}>
          <PaintCalculator onTransferToQuote={handleTransferCalculatorToQuote} />
        </Suspense>
        </LazySection>

        {/* 6. Servicios técnicos detallados y capacidades */}
        <LazySection id="servicios" minHeight="400px">
        <Suspense fallback={<SectionSkeleton id="servicios" minHeight="400px" />}>
          <ServicesSection onQuoteClick={() => scrollToSection('cotizar')} />
        </Suspense>
        </LazySection>

        {/* 7. Proceso de transformación */}
        <LazySection id="proceso" minHeight="300px">
        <Suspense fallback={<SectionSkeleton id="proceso" minHeight="300px" />}>
          <ProcessSection onQuoteClick={() => scrollToSection('cotizar')} />
        </Suspense>
        </LazySection>

        {/* 8. Galería de Proyectos con filtros multi-servicios y comparativa interactiva Antes/Después */}
        <LazySection id="proyectos" minHeight="450px">
        <Suspense fallback={<SectionSkeleton id="proyectos" minHeight="450px" />}>
          <ProjectsGallery onRequestSimilar={handleRequestSimilarProject} />
        </Suspense>
        </LazySection>

        {/* 8.1. Confianza y Prueba Social con trayectoria corporativa y 4 Garantías Claras */}
        <LazySection id="garantias" minHeight="300px">
        <Suspense fallback={<SectionSkeleton id="garantias" minHeight="300px" />}>
          <TestimonialsGuaranteesSection />
        </Suspense>
        </LazySection>

        {/* 9. Banner de promoción verificada (Hasta 20% de descuento en pintura y aplicación) */}
        <LazySection id="promociones" minHeight="250px">
        <Suspense fallback={<SectionSkeleton id="promociones" minHeight="250px" />}>
          <PromoSection onQuoteClick={() => scrollToSection('cotizar')} />
        </Suspense>
        </LazySection>

        {/* 10. Nosotros: Historia, valores y respaldo */}
        <LazySection id="nosotros" minHeight="350px">
        <Suspense fallback={<SectionSkeleton id="nosotros" minHeight="350px" />}>
          <AboutSection />
        </Suspense>
        </LazySection>

        {/* 10.1. Preguntas Frecuentes - Resolución de Objeciones */}
        <LazySection id="faq" minHeight="350px">
        <Suspense fallback={<SectionSkeleton id="faq" minHeight="350px" />}>
          <FAQSection onOpenPrivacy={() => setIsPrivacyModalOpen(true)} />
        </Suspense>
        </LazySection>

        {/* 11. Formulario de cotización inteligente de 3 pasos */}
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

        {/* 12. Contacto verificado, Ubicación en Carretera a El Salvador y Mapa */}
        <LazySection id="contacto" minHeight="400px">
        <Suspense fallback={<SectionSkeleton id="contacto" minHeight="400px" />}>
          <ContactSection />
        </Suspense>
        </LazySection>

        {/* 13. Final CTA */}
        <LazySection id="final-cta" minHeight="250px">
        <Suspense fallback={<SectionSkeleton id="final-cta" minHeight="250px" />}>
          <FinalCTA onQuoteClick={() => scrollToSection('cotizar')} />
        </Suspense>
        </LazySection>
      </main>

      {/* Footer */}
      <Footer
        onNavigate={scrollToSection}
        onOpenAdmin={openAdmin}
        onOpenPrivacy={() => setIsPrivacyModalOpen(true)}
      />

      {/* 21st.dev Minimalist Floating Color Dock */}
      <FloatingColorDock activeSection={activeSection} onNavigate={scrollToSection} />

      {/* Sticky Floating WhatsApp Conversion Drawer (Mobile & Desktop) */}
      <FloatingWhatsApp />

      {/* Modal de Política de Privacidad y Protección de Datos Personales (Guatemala) */}
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

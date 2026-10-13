import React, { useState, useEffect, lazy, Suspense } from 'react';
import { ColorMoodProvider, useColorMood } from './context/ColorMoodContext';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { BentoTrustGrid } from './components/BentoTrustGrid';
import { SolutionsSection } from './components/SolutionsSection';
import { SectorsSection } from './components/SectorsSection';
import { Footer } from './components/Footer';
import { FloatingColorDock } from './components/FloatingColorDock';
import { DynamicBackground } from './components/ui/DynamicBackground';

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
    setSelectedProjectForQuote(`${projectTitle} (${category})`);
    scrollToSection('cotizar');
  };

  const handleColorSelectedForQuote = (
    colorName: string,
    colorCode: string,
    finish: string,
    roomName: string,
    hex?: string
  ) => {
    setSelectedSolutionForQuote('Pintura Arquitectónica con Asesoría de Color');
    setCustomQuoteMessage(
      `Me interesa cotizar mi proyecto con el color ${colorCode} ${colorName}${hex ? ` (${hex})` : ''}, acabado ${finish.toUpperCase()} para el espacio de ${roomName}.`
    );
    scrollToSection('cotizar');
  };

  const handleTransferCalculatorToQuote = (details: string) => {
    setCustomQuoteMessage(details);
    setSelectedSolutionForQuote('Pintura y Aplicación según Medidas Calculadas');
    scrollToSection('cotizar');
  };

  // Scrollspy to automatically update active section on scroll
  useEffect(() => {
    const sections = [
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

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
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
            setSelectedSolutionForQuote(`Atención para sector ${sectorTitle}`);
            scrollToSection('cotizar');
          }}
        />

        {/* 4. Estudio Interactivo de Color & Visualizador Virtual de Ambientes */}
        <Suspense fallback={<SectionSkeleton id="estudio-color" minHeight="450px" />}>
          <ColorStudioVisualizer onSelectColorForQuote={handleColorSelectedForQuote} />
        </Suspense>

        {/* 5. Calculadora Interactiva de Pintura, Rendimiento y Ahorro */}
        <Suspense fallback={<SectionSkeleton id="calculadora" minHeight="400px" />}>
          <PaintCalculator onTransferToQuote={handleTransferCalculatorToQuote} />
        </Suspense>

        {/* 6. Servicios técnicos detallados y capacidades */}
        <Suspense fallback={<SectionSkeleton id="servicios" minHeight="400px" />}>
          <ServicesSection onQuoteClick={() => scrollToSection('cotizar')} />
        </Suspense>

        {/* 7. Proceso de transformación */}
        <Suspense fallback={<SectionSkeleton id="proceso" minHeight="300px" />}>
          <ProcessSection onQuoteClick={() => scrollToSection('cotizar')} />
        </Suspense>

        {/* 8. Galería de Proyectos con filtros multi-servicios y comparativa interactiva Antes/Después */}
        <Suspense fallback={<SectionSkeleton id="proyectos" minHeight="450px" />}>
          <ProjectsGallery onRequestSimilar={handleRequestSimilarProject} />
        </Suspense>

        {/* 8.1. Confianza y Prueba Social con trayectoria corporativa y 4 Garantías Claras */}
        <Suspense fallback={<SectionSkeleton id="garantias" minHeight="300px" />}>
          <TestimonialsGuaranteesSection />
        </Suspense>

        {/* 9. Banner de promoción verificada (Hasta 20% de descuento en pintura y aplicación) */}
        <Suspense fallback={<SectionSkeleton id="promociones" minHeight="250px" />}>
          <PromoSection onQuoteClick={() => scrollToSection('cotizar')} />
        </Suspense>

        {/* 10. Nosotros: Historia, valores y respaldo */}
        <Suspense fallback={<SectionSkeleton id="nosotros" minHeight="350px" />}>
          <AboutSection />
        </Suspense>

        {/* 10.1. Preguntas Frecuentes - Resolución de Objeciones */}
        <Suspense fallback={<SectionSkeleton id="faq" minHeight="350px" />}>
          <FAQSection />
        </Suspense>

        {/* 11. Formulario de cotización inteligente de 3 pasos */}
        <Suspense fallback={<SectionSkeleton id="cotizar" minHeight="500px" />}>
          <QuoteForm
            initialProjectType={selectedProjectForQuote ? 'personalizado' : 'residencial'}
            initialService={
              selectedSolutionForQuote
                ? selectedSolutionForQuote
                : 'Pintura y Aplicación Profesional'
            }
            initialMessage={customQuoteMessage}
          />
        </Suspense>

        {/* 12. Contacto verificado, Ubicación en Carretera a El Salvador y Mapa */}
        <Suspense fallback={<SectionSkeleton id="contacto" minHeight="400px" />}>
          <ContactSection />
        </Suspense>

        {/* 13. Final CTA */}
        <Suspense fallback={<SectionSkeleton id="final-cta" minHeight="250px" />}>
          <FinalCTA onQuoteClick={() => scrollToSection('cotizar')} />
        </Suspense>
      </main>

      {/* Footer */}
      <Footer onNavigate={scrollToSection} onOpenAdmin={openAdmin} />

      {/* 21st.dev Minimalist Floating Color Dock */}
      <FloatingColorDock activeSection={activeSection} onNavigate={scrollToSection} />

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

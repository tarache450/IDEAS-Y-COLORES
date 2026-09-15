import React, { useState, useEffect } from 'react';
import { ColorMoodProvider } from './context/ColorMoodContext';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { BentoTrustGrid } from './components/BentoTrustGrid';
import { TrustBlock } from './components/TrustBlock';
import { ColorStudioVisualizer } from './components/ColorStudioVisualizer';
import { PaintCalculator } from './components/PaintCalculator';
import { SolutionsSection } from './components/SolutionsSection';
import { SectorsSection } from './components/SectorsSection';
import { ServicesSection } from './components/ServicesSection';
import { ProcessSection } from './components/ProcessSection';
import { ProjectsGallery } from './components/ProjectsGallery';
import { TestimonialsGuaranteesSection } from './components/TestimonialsGuaranteesSection';
import { PromoSection } from './components/PromoSection';
import { AboutSection } from './components/AboutSection';
import { QuoteForm } from './components/QuoteForm';
import { ContactSection } from './components/ContactSection';
import { FinalCTA } from './components/FinalCTA';
import { Footer } from './components/Footer';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { FloatingColorDock } from './components/FloatingColorDock';

export default function App() {
  const [activeSection, setActiveSection] = useState('inicio');
  const [selectedSolutionForQuote, setSelectedSolutionForQuote] = useState<string>('');
  const [selectedProjectForQuote, setSelectedProjectForQuote] = useState<string>('');
  const [customQuoteMessage, setCustomQuoteMessage] = useState<string>('');

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
    roomName: string
  ) => {
    setSelectedSolutionForQuote('Pintura Arquitectónica con Asesoría de Color');
    setCustomQuoteMessage(
      `Me interesa cotizar mi proyecto con el color ${colorCode} ${colorName}, acabado ${finish.toUpperCase()} para el espacio de ${roomName}.`
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
      'estudio-color',
      'calculadora',
      'soluciones',
      'sectores',
      'servicios',
      'proyectos',
      'promociones',
      'nosotros',
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

  return (
    <ColorMoodProvider>
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased">
        {/* Sticky Header with local GT contact & WhatsApp integration */}
        <Header activeSection={activeSection} onNavigate={scrollToSection} />

        {/* Main Content Sections */}
        <main className="flex-1">
          {/* 1. Hero con cambiador dinámico de tonos en vivo y nuevo posicionamiento Multi-Servicios */}
          <Hero
            onQuoteClick={() => scrollToSection('cotizar')}
            onExploreColorsClick={() => scrollToSection('estudio-color')}
          />

          {/* 2. Estudio Interactivo de Color & Visualizador Virtual de Ambientes */}
          <ColorStudioVisualizer onSelectColorForQuote={handleColorSelectedForQuote} />

          {/* 3. Bento Grid Moderno de Confianza con los 4 Pilares Verificados */}
          <BentoTrustGrid onQuoteClick={() => scrollToSection('cotizar')} />

          {/* 3.1. Bloque de Confianza: Por qué elegir Ideas & Colores (5 pilares verificados) */}
          <TrustBlock onQuoteClick={() => scrollToSection('cotizar')} />

          {/* 4. Multi-Servicios por necesidad: 6 Categorías Verificadas */}
          <SolutionsSection onSelectSolution={handleSelectSolution} />

          {/* 4.1. Sectores que atendemos en Guatemala (6 sectores) */}
          <SectorsSection
            onQuoteSector={(sectorTitle) => {
              setSelectedSolutionForQuote(`Atención para sector ${sectorTitle}`);
              scrollToSection('cotizar');
            }}
          />

          {/* 5. Calculadora Interactiva de Pintura, Rendimiento y Ahorro */}
          <PaintCalculator onTransferToQuote={handleTransferCalculatorToQuote} />

          {/* 6. Servicios destacados & Bloque de orientación */}
          <ServicesSection onQuoteClick={() => scrollToSection('cotizar')} />

          {/* 7. Proceso de transformación */}
          <ProcessSection onQuoteClick={() => scrollToSection('cotizar')} />

          {/* 8. Galería de Proyectos con filtros multi-servicios y comparativa interactiva Antes/Después */}
          <ProjectsGallery onRequestSimilar={handleRequestSimilarProject} />

          {/* 8.1. Confianza y Prueba Social con trayectoria corporativa y 4 Garantías Claras */}
          <TestimonialsGuaranteesSection />

          {/* 9. Banner de promoción verificada (Hasta 20% de descuento en pintura y aplicación) */}
          <PromoSection onQuoteClick={() => scrollToSection('cotizar')} />

          {/* 10. Nosotros: Historia, valores y respaldo */}
          <AboutSection />

          {/* 11. Formulario de cotización inteligente de 3 pasos */}
          <QuoteForm
            initialProjectType={selectedProjectForQuote ? 'personalizado' : 'residencial'}
            initialService={
              selectedSolutionForQuote
                ? selectedSolutionForQuote
                : 'Pintura y Aplicación Profesional'
            }
            initialMessage={customQuoteMessage}
          />

          {/* 12. Contacto verificado, Ubicación en Carretera a El Salvador y Mapa */}
          <ContactSection />

          {/* 13. Final CTA */}
          <FinalCTA onQuoteClick={() => scrollToSection('cotizar')} />
        </main>

        {/* Footer */}
        <Footer onNavigate={scrollToSection} />

        {/* 21st.dev Minimalist Floating Color Dock */}
        <FloatingColorDock activeSection={activeSection} onNavigate={scrollToSection} />

        {/* Floating High-Conversion WhatsApp Button */}
        <FloatingWhatsApp />
      </div>
    </ColorMoodProvider>
  );
}

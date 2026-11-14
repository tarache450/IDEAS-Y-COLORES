import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ColorMoodProvider, useColorMood } from './context/ColorMoodContext';
import { Header, NavPage } from './components/Header';
import { Hero } from './components/Hero';
import { ServicesMarquee } from './components/ui/ServicesMarquee';
import { SolutionsSection } from './components/SolutionsSection';
import { ProcessSection } from './components/ProcessSection';
import { QuoteForm } from './components/QuoteForm';
import { FinalCTA } from './components/FinalCTA';
import { Footer } from './components/Footer';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { PrivacyPolicyModal } from './components/PrivacyPolicyModal';
import { SubpageHero } from './components/SubpageHero';
import { NAV_PAGE_ACCENTS } from './utils/logoPalette';
import { MULTI_SERVICES_CATEGORIES } from './data/content';
import { trackGaPageView } from './utils/analytics';

// Separate views and navbar subpages remain code-split to keep initial Home JS lean
const ServiceCategoryPage = lazy(() =>
  import('./components/ServiceCategoryPage').then((m) => ({ default: m.ServiceCategoryPage }))
);
const ProjectsGallery = lazy(() =>
  import('./components/ProjectsGallery').then((m) => ({ default: m.ProjectsGallery }))
);
const InteractiveToolsHub = lazy(() =>
  import('./components/InteractiveToolsHub').then((m) => ({ default: m.InteractiveToolsHub }))
);
const BentoTrustGrid = lazy(() =>
  import('./components/BentoTrustGrid').then((m) => ({ default: m.BentoTrustGrid }))
);
const SectorsSection = lazy(() =>
  import('./components/SectorsSection').then((m) => ({ default: m.SectorsSection }))
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
const ContactSection = lazy(() =>
  import('./components/ContactSection').then((m) => ({ default: m.ContactSection }))
);
const AdminDashboard = lazy(() =>
  import('./components/admin/AdminDashboard').then((m) => ({ default: m.AdminDashboard }))
);

const SectionSkeleton: React.FC<{ id: string; minHeight?: string }> = ({
  id,
  minHeight = '360px',
}) => (
  <section
    id={id}
    style={{ minHeight }}
    className="w-full flex items-center justify-center py-14 bg-[#090E19]/5"
    aria-busy="true"
  >
    <div className="w-6 h-6 border-2 border-slate-300 border-t-[#0059FF] rounded-full animate-spin" />
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

function parseNavPageFromHash(): NavPage {
  if (typeof window === 'undefined') return 'inicio';
  const raw = window.location.hash.replace('#', '').trim().toLowerCase();
  if (!raw || raw === 'inicio' || raw === 'soluciones' || raw === 'servicios' || raw === 'proceso' || raw === 'cotizar' || raw === 'quote') {
    return 'inicio';
  }
  if (raw === 'proyectos') return 'proyectos';
  if (raw === 'herramientas' || raw === 'estudio-color' || raw === 'calculadora') return 'herramientas';
  if (raw === 'confianza' || raw === 'nosotros' || raw === 'sectores' || raw === 'garantias' || raw === 'promociones') {
    return 'nosotros';
  }
  if (raw === 'contacto' || raw === 'faq') return 'contacto';
  return 'inicio';
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
  if (sectionId === 'quote') {
    return 'cotizar';
  }
  return sectionId;
}

function mapTargetIdToSubpage(targetId: string): NavPage | null {
  if (targetId === 'proyectos') return 'proyectos';
  if (targetId === 'herramientas') return 'herramientas';
  if (
    targetId === 'confianza' ||
    targetId === 'sectores' ||
    targetId === 'garantias' ||
    targetId === 'promociones'
  ) {
    return 'nosotros';
  }
  if (targetId === 'contacto' || targetId === 'faq') return 'contacto';
  return null;
}

function AppContent() {
  const [activeSection, setActiveSection] = useState('inicio');
  const [activePage, setActivePage] = useState<NavPage>(() => parseNavPageFromHash());
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
  const prefersReduced = useReducedMotion();

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
      } else {
        const nextPage = parseNavPageFromHash();
        setActivePage(nextPage);
        if (window.location.hash === '#calculadora') {
          setActiveToolTab('calculadora');
        }
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

    // Handle initial section scrolling for anchors on initial load (e.g. #soluciones or #cotizar)
    const initialHash = window.location.hash.replace('#', '').trim().toLowerCase();
    if (initialHash === 'calculadora') {
      setActiveToolTab('calculadora');
    }
    if (initialHash === 'soluciones' || initialHash === 'servicios' || initialHash === 'cotizar' || initialHash === 'quote') {
      window.setTimeout(() => {
        scrollToSection(initialHash);
      }, 120);
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
    history.pushState(null, '', `/servicios/${categoryId}`);
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const closeCategoryPage = () => {
    setActiveCategorySlug(null);
    if (
      window.location.hash.startsWith('#servicio/') ||
      window.location.pathname.startsWith('/servicios/')
    ) {
      history.pushState(null, document.title, '/' + window.location.search);
    }
  };

  useEffect(() => {
    const defaultTitle = 'Ideas & Colores Guatemala | Pintura e Impermeabilización';
    const defaultDesc =
      'Expertos en pintura Airless, impermeabilización de losas, hidrolavado a presión y pintura a domicilio en Ciudad de Guatemala y Carretera a El Salvador.';
    let nextTitle = defaultTitle;
    let nextDesc = defaultDesc;
    let nextCanonical = 'https://ideasycoloresgt.site/';
    let nextPath = '/';

    if (activeCategorySlug) {
      const cat = MULTI_SERVICES_CATEGORIES.find((c) => c.id === activeCategorySlug);
      if (cat) {
        nextTitle = `${cat.title} en Guatemala | Ideas & Colores`;
        nextDesc = `${cat.description} Atención en Ciudad de Guatemala, Carretera a El Salvador, Fraijanes, Mixco y Villa Nueva con garantía escrita.`;
        nextCanonical = `https://ideasycoloresgt.site/servicios/${cat.id}`;
        nextPath = `/servicios/${cat.id}`;
      }
    } else if (activePage === 'proyectos') {
      nextTitle = 'Proyectos Realizados Antes y Después | Ideas & Colores Guatemala';
      nextDesc =
        'Portafolio de obras verificadas en pintura Airless, impermeabilización de losas, pisos epóxicos y carpintería en Carretera a El Salvador y Guatemala.';
      nextPath = '/#proyectos';
    } else if (activePage === 'herramientas') {
      nextTitle = 'Simulador de Color y Calculadora de Pintura m² | Ideas & Colores';
      nextDesc =
        'Visualiza paletas arquitectónicas y calcula cubetas o galones para tu proyecto en Guatemala antes de cotizar.';
      nextPath = '/#herramientas';
    } else if (activePage === 'nosotros') {
      nextTitle = 'Nosotros, Sectores y Garantía por Escrito | Ideas & Colores Guatemala';
      nextDesc =
        'Más de 10 años transformando residencias, colegios, comercios e industria en Guatemala con personal certificado y factura FEL.';
      nextPath = '/#nosotros';
    } else if (activePage === 'contacto') {
      nextTitle = 'Contacto, Cobertura Km 21.5 y Preguntas Frecuentes | Ideas & Colores';
      nextDesc =
        'Sede en Carretera a El Salvador Km 21.5, Fraijanes y cobertura en Zonas 10, 14, 15, 16, Mixco y Villa Nueva. Visita técnica sin costo.';
      nextPath = '/#contacto';
    }

    document.title = nextTitle;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', nextDesc);
    const canonicalEl = document.querySelector('link[rel="canonical"]');
    if (canonicalEl) canonicalEl.setAttribute('href', nextCanonical);

    trackGaPageView(nextPath, nextTitle);
  }, [activeCategorySlug, activePage]);

  const scrollToElementId = (targetId: string, behavior: ScrollBehavior = 'smooth') => {
    if (targetId === 'inicio') {
      window.scrollTo({ top: 0, behavior });
      return;
    }
    const element = document.getElementById(targetId);
    if (element) {
      const navOffset = 84;
      const elementTop = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: Math.max(0, elementTop - navOffset),
        behavior,
      });
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

    isProgrammaticScrollRef.current = true;
    if (scrollLockTimeoutRef.current) {
      window.clearTimeout(scrollLockTimeoutRef.current);
    }
    scrollLockTimeoutRef.current = window.setTimeout(() => {
      isProgrammaticScrollRef.current = false;
    }, 900);

    // Quote section exists across every view & subpage -> scroll directly without switching pages
    if (targetId === 'cotizar') {
      scrollToElementId('cotizar', 'smooth');
      return;
    }

    const subpageTarget = mapTargetIdToSubpage(targetId);

    // Top-level navbar category -> dedicated clean subpage
    if (subpageTarget) {
      if (activeCategorySlug) {
        setActiveCategorySlug(null);
      }
      setActivePage(subpageTarget);
      history.replaceState(null, '', `/#${sectionId}`);

      // Scroll subpage to top, unless targeting a lower section inside a multi-block subpage (e.g. #faq inside contacto or #promociones inside nosotros)
      const internalAnchor =
        targetId === 'faq' ||
        targetId === 'sectores' ||
        targetId === 'garantias' ||
        targetId === 'promociones'
          ? targetId
          : null;

      window.scrollTo({ top: 0, behavior: 'auto' });
      if (internalAnchor) {
        window.setTimeout(() => scrollToElementId(internalAnchor, 'smooth'), 180);
      }
      return;
    }

    // Home Services View (#inicio, #soluciones, #proceso)
    if (activeCategorySlug || activePage !== 'inicio') {
      setActiveCategorySlug(null);
      setActivePage('inicio');
      history.replaceState(
        null,
        '',
        targetId === 'inicio' ? '/' : `/#${sectionId}`
      );
      window.setTimeout(() => {
        scrollToElementId(targetId, 'smooth');
      }, 140);
      return;
    }

    history.replaceState(
      null,
      '',
      targetId === 'inicio' ? '/' : `/#${sectionId}`
    );
    scrollToElementId(targetId, 'smooth');
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

  // Scrollspy only for Home sections (#inicio, #soluciones, #proceso, #cotizar)
  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      !('IntersectionObserver' in window) ||
      activeCategorySlug ||
      activePage !== 'inicio'
    ) {
      return;
    }

    const sectionIds = ['inicio', 'soluciones', 'proceso', 'cotizar'];
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
        rootMargin: '-20% 0px -60% 0px',
        threshold: 0,
      }
    );

    for (const id of sectionIds) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [activeCategorySlug, activePage]);

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

  const currentViewKey = activeCategorySlug ? `servicio-${activeCategorySlug}` : `page-${activePage}`;

  return (
    <div
      className="min-h-screen bg-white text-[#090E19] flex flex-col antialiased relative overflow-x-hidden selection:bg-[#0059FF] selection:text-white"
      style={{ '--mood-color': currentMood.color } as React.CSSProperties}
    >
      {/* Streamlined Sticky Category Bar Header */}
      <Header
        activeSection={activeSection}
        activePage={activePage}
        activeCategorySlug={activeCategorySlug}
        onNavigate={scrollToSection}
        onOpenCategoryPage={openCategoryPage}
      />

      {/* Main Content Area: Animated Transitions Between Services Home, Category Pages, and Navbar Subpages */}
      <main id="main-content" className="flex-1 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentViewKey}
            initial={prefersReduced ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReduced ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            {activeCategorySlug ? (
              <>
                <Suspense fallback={<SectionSkeleton id="subpage-loading" minHeight="600px" />}>
                  <ServiceCategoryPage
                    categoryId={activeCategorySlug}
                    onBackToHome={() => {
                      closeCategoryPage();
                      setActivePage('inicio');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    onSelectCategory={openCategoryPage}
                    onQuoteCategory={(catTitle, msg) => handleSelectSolution(catTitle, msg)}
                    onOpenTool={(tool) => {
                      closeCategoryPage();
                      setActiveToolTab(tool);
                      setActivePage('herramientas');
                      history.replaceState(null, '', '#herramientas');
                      window.scrollTo({ top: 0, behavior: 'auto' });
                    }}
                  />
                </Suspense>

                <QuoteForm
                  initialProjectType={selectedProjectForQuote || 'Residencial'}
                  initialService={selectedSolutionForQuote || 'Pintura y recubrimientos'}
                  initialMessage={customQuoteMessage}
                  onOpenPrivacy={() => setIsPrivacyModalOpen(true)}
                />
              </>
            ) : activePage === 'proyectos' ? (
              <>
                <SubpageHero
                  eyebrow="Portafolio de Obras"
                  title="Proyectos Realizados"
                  subtitle="Resultados documentados en residencias de Carretera a El Salvador, condominios, oficinas corporativas, comercios e industria."
                  breadcrumbLabel="Proyectos"
                  accent={NAV_PAGE_ACCENTS.proyectos}
                  activeNavId="proyectos"
                  onBackToHome={() => scrollToSection('inicio')}
                  onNavigateSubpage={scrollToSection}
                  onQuoteClick={() => scrollToSection('cotizar')}
                />
                <Suspense fallback={<SectionSkeleton id="proyectos" minHeight="650px" />}>
                  <ProjectsGallery onRequestSimilar={handleRequestSimilarProject} />
                </Suspense>
                <QuoteForm
                  initialProjectType={selectedProjectForQuote || 'Residencial'}
                  initialService={selectedSolutionForQuote || 'Pintura y recubrimientos'}
                  initialMessage={customQuoteMessage}
                  onOpenPrivacy={() => setIsPrivacyModalOpen(true)}
                />
              </>
            ) : activePage === 'herramientas' ? (
              <>
                <SubpageHero
                  eyebrow="Herramientas Técnicas Interactivas"
                  title="Estudio de Color & Calculadora m²"
                  subtitle="Visualiza paletas arquitectónicas con iluminación real y calcula cuántos cubetas o galones necesita tu proyecto antes de cotizar."
                  breadcrumbLabel="Color & Calculadora"
                  accent={NAV_PAGE_ACCENTS.herramientas}
                  activeNavId="herramientas"
                  onBackToHome={() => scrollToSection('inicio')}
                  onNavigateSubpage={scrollToSection}
                  onQuoteClick={() => scrollToSection('cotizar')}
                />
                <Suspense fallback={<SectionSkeleton id="herramientas" minHeight="650px" />}>
                  <InteractiveToolsHub
                    activeToolTab={activeToolTab}
                    onTabChange={setActiveToolTab}
                    onSelectColorForQuote={handleColorSelectedForQuote}
                    onTransferCalculatorToQuote={handleTransferCalculatorToQuote}
                  />
                </Suspense>
                <QuoteForm
                  initialProjectType={selectedProjectForQuote || 'Residencial'}
                  initialService={selectedSolutionForQuote || 'Pintura y recubrimientos'}
                  initialMessage={customQuoteMessage}
                  onOpenPrivacy={() => setIsPrivacyModalOpen(true)}
                />
              </>
            ) : activePage === 'nosotros' ? (
              <>
                <SubpageHero
                  eyebrow="Nuestra Empresa • Desde 2014"
                  title="Nosotros, Sectores & Garantías"
                  subtitle="Más de 10 años ejecutando obras limpias, garantizadas por escrito y facturadas bajo régimen FEL SAT en Guatemala."
                  breadcrumbLabel="Nosotros"
                  accent={NAV_PAGE_ACCENTS.nosotros}
                  activeNavId="confianza"
                  onBackToHome={() => scrollToSection('inicio')}
                  onNavigateSubpage={scrollToSection}
                  onQuoteClick={() => scrollToSection('cotizar')}
                />
                <Suspense fallback={<SectionSkeleton id="confianza" minHeight="650px" />}>
                  <BentoTrustGrid onQuoteClick={() => scrollToSection('cotizar')} />
                  <SectorsSection
                    onQuoteSector={(sectorTitle) => {
                      setSelectedProjectForQuote(sectorTitle);
                      scrollToSection('cotizar');
                    }}
                  />
                  <TestimonialsGuaranteesSection />
                  <PromoSection onQuoteClick={() => scrollToSection('cotizar')} />
                </Suspense>
                <QuoteForm
                  initialProjectType={selectedProjectForQuote || 'Residencial'}
                  initialService={selectedSolutionForQuote || 'Pintura y recubrimientos'}
                  initialMessage={customQuoteMessage}
                  onOpenPrivacy={() => setIsPrivacyModalOpen(true)}
                />
              </>
            ) : activePage === 'contacto' ? (
              <>
                <SubpageHero
                  eyebrow="Atención Directa & Cobertura"
                  title="Contacto, Mapa Km 21.5 y FAQs"
                  subtitle="Visítanos en Carretera a El Salvador Km 21.5, Fraijanes, o agenda una visita técnica sin costo por WhatsApp."
                  breadcrumbLabel="Contacto"
                  accent={NAV_PAGE_ACCENTS.contacto}
                  activeNavId="contacto"
                  onBackToHome={() => scrollToSection('inicio')}
                  onNavigateSubpage={scrollToSection}
                  onQuoteClick={() => scrollToSection('cotizar')}
                />
                <Suspense fallback={<SectionSkeleton id="contacto" minHeight="650px" />}>
                  <ContactSection />
                  <FAQSection onOpenPrivacy={() => setIsPrivacyModalOpen(true)} />
                </Suspense>
                <QuoteForm
                  initialProjectType={selectedProjectForQuote || 'Residencial'}
                  initialService={selectedSolutionForQuote || 'Pintura y recubrimientos'}
                  initialMessage={customQuoteMessage}
                  onOpenPrivacy={() => setIsPrivacyModalOpen(true)}
                />
              </>
            ) : (
              /* HOME / INICIO — 100% enfocada en los Servicios + Marquee + Proceso + Cotizador */
              <>
                <Hero
                  onQuoteClick={() => scrollToSection('cotizar')}
                  onExploreColorsClick={() => {
                    setActiveToolTab('color');
                    scrollToSection('herramientas');
                  }}
                  onExploreServicesClick={() => scrollToSection('soluciones')}
                  onOpenCategoryPage={openCategoryPage}
                />

                <ServicesMarquee onOpenCategoryPage={openCategoryPage} />

                <SolutionsSection
                  onSelectSolution={(title) => handleSelectSolution(title)}
                  onOpenCategoryPage={openCategoryPage}
                  onNavigate={scrollToSection}
                />

                <ProcessSection onQuoteClick={() => scrollToSection('cotizar')} />

                <QuoteForm
                  initialProjectType={selectedProjectForQuote || 'Residencial'}
                  initialService={selectedSolutionForQuote || 'Pintura y recubrimientos'}
                  initialMessage={customQuoteMessage}
                  onOpenPrivacy={() => setIsPrivacyModalOpen(true)}
                />

                <FinalCTA onQuoteClick={() => scrollToSection('cotizar')} />
              </>
            )}
          </motion.div>
        </AnimatePresence>
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

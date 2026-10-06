import React, { useState } from 'react';
import {
  MapPin,
  ArrowRight,
  Sparkles,
  Layers,
  Palette,
  Clock,
  ShieldCheck,
  CheckCircle2,
  SlidersHorizontal,
  Eye,
  Info,
  Building2,
  Home,
  Briefcase,
  Trophy,
} from 'lucide-react';
import { BeforeAfterSlider } from './BeforeAfterSlider';
import { useColorMood } from '../context/ColorMoodContext';
import { PROJECTS_GALLERY, BUSINESS_INFO } from '../data/content';
import { ProjectGalleryFilter } from '../types';
import { AnimatedTabs } from './ui/AnimatedTabs';
import { SpotlightCard } from './ui/SpotlightCard';
import { StaggeredText } from './ui/StaggeredText';
import { assetUrl } from '../utils/asset';
import { BlurHighlight } from './ui/BlurHighlight';
import FadeIn from './ui/FadeIn';
import GlareHover from './ui/GlareHover';

interface ProjectsGalleryProps {
  onRequestSimilar: (projectTitle: string, category: string) => void;
}

interface BeforeAfterProject {
  id: string;
  categoryLabel: string;
  title: string;
  location: string;
  summary: string;
  beforeImage: string;
  afterImage: string;
  technicalSheet: {
    colorsUsed: string;
    productApplied: string;
    executionTime: string;
    finishType: string;
    warranty: string;
  };
}

const BEFORE_AFTER_CASES: BeforeAfterProject[] = [
  {
    id: 'futeca-concepcion',
    categoryLabel: 'Infraestructura Deportiva & Comercial',
    title: 'Futeca Concepción: Renovación perimetral y cerramientos deportivos',
    location: 'C.C. Pradera Concepción, Km 15.5 Carretera a El Salvador, Guatemala',
    summary:
      'Restauración de mampostería perimetral con tratamiento contra humedad, recubrimiento anticorrosivo en cerramientos metálicos y postes, y demarcación de líneas deportivas con esmalte de alta durabilidad climática.',
    beforeImage: assetUrl('projects/futeca-concepcion-antes.jpg'),
    afterImage: assetUrl('projects/futeca-concepcion-despues.jpg'),
    technicalSheet: {
      colorsUsed: 'Azul Institucional Futeca, Gris Grafito Mate y Blanco Tráfico',
      productApplied: 'Pintura Elastómerica para Mampostería & Esmalte Poliuretano Anticorrosivo',
      executionTime: '6 días hábiles (horario nocturno sin interrumpir torneos)',
      finishType: 'Resistente a rayos UV, humedad de montaña y alto impacto deportivo',
      warranty: 'Garantía por escrito en adherencia y protección anticorrosiva',
    },
  },
  {
    id: 'fachada-residencial',
    categoryLabel: 'Paredes y Fachada Residencial',
    title: 'Residencia en Condominio: Renovación de fachada y muros exteriores',
    location: 'Carretera a El Salvador, Guatemala',
    summary:
      'Tratamiento de muros exteriores con resane de microfisuras, sellador hidrófugo y dos manos de recubrimiento elástico satinado en paleta de neutros cálidos.',
    beforeImage: assetUrl('projects/fachada-residencial-antes.jpg'),
    afterImage: assetUrl('projects/fachada-residencial-carretera.jpg'),
    technicalSheet: {
      colorsUsed: 'Tonos Neutros Cálidos Arquitectónicos (Greige y Blanco Hueso)',
      productApplied: 'Recubrimiento Elastomérico Hidro-repelente con filtro UV',
      executionTime: '4 días hábiles',
      finishType: 'Satinado arquitectónico lavable',
      warranty: 'Garantía por escrito en producto y mano de obra',
    },
  },
  {
    id: 'colegio-discovery',
    categoryLabel: 'Institucional & Campus Educativo',
    title: 'Colegio Discovery: Mantenimiento y acabados de campus infantil',
    location: 'Km 14.5 Carretera a El Salvador, Santa Catarina Pinula',
    summary:
      'Mantenimiento correctivo y preventivo en módulos lúdicos infantiles con pintura lavable certificada bajo VOC y protección en áreas techadas de alto contacto.',
    beforeImage: assetUrl('projects/discovery-campus-antes.jpg'),
    afterImage: assetUrl('projects/discovery-campus-despues.jpg'),
    technicalSheet: {
      colorsUsed: 'Blanco Puro Satinado y Acentos Didácticos',
      productApplied: 'Látex Antibacterial de Alta Resistencia al Frote (Bajo VOC)',
      executionTime: '3 días hábiles (receso escolar)',
      finishType: 'Satinado lavable de grado institucional',
      warranty: 'Garantía por escrito en adherencia y lavabilidad',
    },
  },
];

export const ProjectsGallery: React.FC<ProjectsGalleryProps> = ({ onRequestSimilar }) => {
  const [activeFilter, setActiveFilter] = useState<ProjectGalleryFilter>('todos');
  const [activeBeforeAfterId, setActiveBeforeAfterId] = useState<string>('futeca-concepcion');
  const { currentMood } = useColorMood();

  // Exact filters required by user prompt: Residencial, Comercial, Deportivo, Institucional, Antes y después
  const filterOptions: { id: ProjectGalleryFilter; label: string }[] = [
    { id: 'todos', label: 'Todos los proyectos' },
    { id: 'residencial', label: 'Residencial' },
    { id: 'comercial', label: 'Comercial' },
    { id: 'deportivo', label: 'Deportivo' },
    { id: 'institucional', label: 'Institucional' },
    { id: 'antes-despues', label: 'Antes y después' },
  ];

  const filteredProjects =
    activeFilter === 'todos'
      ? PROJECTS_GALLERY
      : activeFilter === 'antes-despues'
      ? []
      : PROJECTS_GALLERY.filter((p) => p.filterType === activeFilter);

  const activeBeforeAfter =
    BEFORE_AFTER_CASES.find((p) => p.id === activeBeforeAfterId) || BEFORE_AFTER_CASES[0];

  return (
    <section id="proyectos" className="py-20 sm:py-24 bg-transparent border-b border-slate-200/50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <FadeIn direction="up" distance={24}>
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-800 shadow-2xs mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Proyectos &amp; Portafolio de Soluciones</span>
            </div>

            <StaggeredText
              text="Transformaciones y capacidad técnica comprobada."
              as="h2"
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tight font-display"
            />

            <p className="mt-4 text-base sm:text-lg text-slate-600 font-normal">
              Explora proyectos residenciales, comerciales, deportivos e institucionales con{' '}
              <BlurHighlight color="#FAB82A">garantía formal por escrito</BlurHighlight>.
            </p>
          </div>
        </FadeIn>

        {/* Transparency note about reference visualizations */}
        <div className="max-w-4xl mx-auto mb-10 p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-3 text-xs text-amber-900 leading-relaxed">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p>
            <strong>Transparencia de portafolio:</strong> Las muestras marcadas como <em>“Visualización de referencia”</em> ilustran acabados técnicos y transformaciones posibles de superficies. Cada tarjeta está estructurada para sustitución directa con fotografía de obra ejecutada.
          </p>
        </div>

        {/* Filters Tabs: Residencial, Comercial, Deportivo, Institucional, Antes y después */}
        <div className="flex items-center justify-center mb-12">
          <AnimatedTabs
            tabs={filterOptions}
            activeId={activeFilter}
            onChange={(id) => setActiveFilter(id as ProjectGalleryFilter)}
            layoutId="gallery-filter-indicator"
          />
        </div>

        {/* Section A: Interactive Before / After Slider (When filter is 'antes-despues' or default 'todos') */}
        {(activeFilter === 'antes-despues' || activeFilter === 'todos') && (
          <div className="mb-14">
            <div className="bg-white/90 rounded-3xl p-5 sm:p-8 lg:p-10 shadow-[0_26px_60px_-48px_rgba(15,23,42,.55)]">
              <div className="flex items-center justify-between flex-wrap gap-3 mb-6 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
                  <SlidersHorizontal className="w-4 h-4 text-amber-500" />
                  <span>Comparador Interactivo: Antes / Después</span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {BEFORE_AFTER_CASES.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveBeforeAfterId(item.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                        activeBeforeAfterId === item.id
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {item.categoryLabel}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                {/* Left: Interactive Slider */}
                <div className="lg:col-span-7">
                  <BeforeAfterSlider
                    key={activeBeforeAfter.id}
                    beforeImage={activeBeforeAfter.beforeImage}
                    afterImage={activeBeforeAfter.afterImage}
                    title={activeBeforeAfter.title}
                    showQuickButtons={true}
                  />
                  <div className="mt-2 text-center">
                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                      <Info className="w-3.5 h-3.5" />
                      <span>Visualización de referencia técnica antes / después</span>
                    </span>
                  </div>
                </div>

                {/* Right: Technical Sheet */}
                <div className="lg:col-span-5 space-y-4 text-left">
                  <div>
                    <div className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 mb-1">
                      <MapPin className="w-3.5 h-3.5 text-amber-500" />
                      <span>{activeBeforeAfter.location}</span>
                    </div>
                    <h3 className="text-2xl font-extrabold text-slate-950 font-display">
                      {activeBeforeAfter.title}
                    </h3>
                    <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                      {activeBeforeAfter.summary}
                    </p>
                  </div>

                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <span className="font-bold text-slate-800">Ficha Técnica</span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        Garantía por escrito
                      </span>
                    </div>
                    <div className="space-y-1.5 text-slate-700">
                      <p>
                        <strong>Producto:</strong> {activeBeforeAfter.technicalSheet.productApplied}
                      </p>
                      <p>
                        <strong>Acabado:</strong> {activeBeforeAfter.technicalSheet.finishType}
                      </p>
                      <p>
                        <strong>Tiempo estimado:</strong> {activeBeforeAfter.technicalSheet.executionTime}
                      </p>
                      <p className="text-emerald-700 font-semibold">
                        <strong>Garantía:</strong> {activeBeforeAfter.technicalSheet.warranty}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      onRequestSimilar(activeBeforeAfter.title, activeBeforeAfter.categoryLabel)
                    }
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-xs sm:text-sm font-bold text-white shadow-md hover:shadow-lg transition-all"
                    style={{
                      backgroundColor: currentMood.color,
                      color: currentMood.textColorOnAccent,
                    }}
                  >
                    <span>Cotizar proyecto similar</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Section B: Filtered Projects Grid (Categorías verificadas: Residencial, Comercial, Deportivo, Institucional) */}
        {activeFilter !== 'antes-despues' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <SpotlightCard
                key={project.id}
                spotlightColor="rgba(250, 184, 42, 0.15)"
                className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  {/* Image with Transparency Badge */}
                  <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-slate-900">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.035] opacity-95"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                    {/* Badge: Fotografía real de obra vs Visualización de referencia */}
                    <div className="absolute top-3 left-3">
                      {project.isReferenceVisualization ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md text-amber-300 text-[10px] font-bold border border-amber-400/30">
                          <Info className="w-3 h-3" />
                          <span>Visualización de referencia</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md text-emerald-300 text-[10px] font-bold border border-emerald-400/30">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Proyecto verificado</span>
                        </span>
                      )}
                    </div>

                    <div className="absolute top-3 right-3">
                      <span className="px-2.5 py-1 rounded-lg bg-white/95 backdrop-blur-xs text-[11px] font-bold text-slate-800 shadow-xs">
                        {project.categoryLabel}
                      </span>
                    </div>

                    {project.location && (
                      <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-xs text-slate-200">
                        <MapPin className="w-3.5 h-3.5 text-amber-400" />
                        <span>{project.location}</span>
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  <div className="p-6 space-y-3">
                    <h3 className="text-xl font-bold font-display text-slate-950 group-hover:text-slate-900 transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                      {project.result}
                    </p>
                    <div className="pt-2 border-t border-slate-100 text-xs text-slate-500">
                      <strong className="text-slate-700 block mb-0.5">Solución aplicada:</strong>
                      <span>{project.solutionApplied}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-6 pt-0">
                  <button
                    type="button"
                    onClick={() => onRequestSimilar(project.title, project.categoryLabel)}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>Cotizar este tipo de solución</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </SpotlightCard>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

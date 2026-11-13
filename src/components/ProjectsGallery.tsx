import React, { useState } from 'react';
import {
  MapPin,
  ArrowRight,
  CheckCircle2,
  SlidersHorizontal,
  Info,
} from 'lucide-react';
import { BeforeAfterSlider } from './BeforeAfterSlider';
import { useColorMood } from '../context/ColorMoodContext';
import { PROJECTS_GALLERY } from '../data/content';
import { ProjectGalleryFilter } from '../types';
import { AnimatedTabs } from './ui/AnimatedTabs';
import { StaggeredText } from './ui/StaggeredText';
import { assetUrl } from '../utils/asset';
import FadeIn from './ui/FadeIn';

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
    beforeImage: assetUrl('projects/futeca-concepcion-antes.webp'),
    afterImage: assetUrl('projects/futeca-concepcion-despues.webp'),
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
    beforeImage: assetUrl('projects/fachada-residencial-antes.webp'),
    afterImage: assetUrl('projects/fachada-residencial-carretera.webp'),
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
    beforeImage: assetUrl('projects/discovery-campus-antes.webp'),
    afterImage: assetUrl('projects/discovery-campus-despues.webp'),
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
    <section
      id="proyectos"
      className="py-20 sm:py-28 bg-white border-b border-[#E8E9EE] relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Roofera Showcase Header */}
        <FadeIn direction="up" distance={24}>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10 pb-8 border-b border-[#E8E9EE]">
            <div className="max-w-3xl text-left">
              <div className="inline-flex items-center gap-2.5 text-xs font-extrabold uppercase tracking-[0.18em] text-[#80828C] mb-3">
                <span
                  className="w-2.5 h-2.5 rounded-xs shrink-0"
                  style={{ backgroundColor: currentMood.color }}
                />
                <span>Nuestros Proyectos &amp; Portafolio</span>
              </div>

              <div className="flex items-baseline">
                <StaggeredText
                  text="Transformaciones Comprobadas"
                  as="h2"
                  className="text-3xl sm:text-5xl font-black text-[#090E19] tracking-[-0.04em] leading-[1.06] font-display inline"
                />
                <span
                  className="text-4xl sm:text-5xl font-black leading-none select-none"
                  style={{ color: currentMood.color }}
                >
                  .
                </span>
              </div>
            </div>

            <p className="text-sm sm:text-base text-[#525663] leading-relaxed max-w-md text-left">
              Explora obras residenciales, comerciales, deportivas e institucionales ejecutadas con
              garantía formal por escrito en Guatemala.
            </p>
          </div>
        </FadeIn>

        {/* Portfolio Transparency Note */}
        <div className="mb-8 p-4 rounded-xl bg-[#F4F5F7] border border-[#E8E9EE] flex items-start gap-3 text-xs text-[#3F434D] leading-relaxed text-left">
          <Info
            className="w-4 h-4 shrink-0 mt-0.5"
            style={{ color: currentMood.color }}
            aria-hidden="true"
          />
          <p>
            <strong className="text-[#090E19]">Transparencia de portafolio:</strong> Las muestras
            marcadas como <em>“Visualización de referencia”</em> ilustran acabados técnicos y
            transformaciones posibles de superficies; las marcadas como{' '}
            <em>“Proyecto verificado”</em> corresponden a obras ejecutadas en sitio.
          </p>
        </div>

        {/* Category Filter Bar */}
        <div className="flex items-center justify-start sm:justify-center mb-10 overflow-x-auto pb-1">
          <AnimatedTabs
            tabs={filterOptions}
            activeId={activeFilter}
            onChange={(id) => setActiveFilter(id as ProjectGalleryFilter)}
            layoutId="gallery-filter-indicator"
          />
        </div>

        {/* Section A: Interactive Before / After Slider Showcase */}
        {(activeFilter === 'antes-despues' || activeFilter === 'todos') && (
          <div className="mb-14">
            <div className="bg-[#090E19] text-white rounded-xl p-5 sm:p-8 lg:p-10 border border-[#27324D] shadow-2xl">
              <div className="flex items-center justify-between flex-wrap gap-3 mb-6 pb-4 border-b border-[#27324D]">
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.14em] text-[#B8BCC6]">
                  <SlidersHorizontal
                    className="w-4 h-4"
                    style={{ color: currentMood.color }}
                    aria-hidden="true"
                  />
                  <span>Comparador Interactivo: Antes / Después</span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {BEFORE_AFTER_CASES.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveBeforeAfterId(item.id)}
                      className={`px-3.5 py-2 min-h-[40px] rounded-md text-xs font-bold transition-colors cursor-pointer ${
                        activeBeforeAfterId === item.id
                          ? 'text-white shadow-xs'
                          : 'bg-[#151D30] text-[#B8BCC6] border border-[#27324D] hover:text-white'
                      }`}
                      style={
                        activeBeforeAfterId === item.id
                          ? { backgroundColor: currentMood.color }
                          : undefined
                      }
                    >
                      {item.categoryLabel}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
                <div className="lg:col-span-7">
                  <BeforeAfterSlider
                    key={activeBeforeAfter.id}
                    beforeImage={activeBeforeAfter.beforeImage}
                    afterImage={activeBeforeAfter.afterImage}
                    title={activeBeforeAfter.title}
                    showQuickButtons={true}
                  />
                  <div className="mt-2.5 text-center">
                    <span className="inline-flex items-center gap-1.5 text-[11px] text-[#80828C] font-medium">
                      <Info className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Visualización comparativa de proyecto antes / después</span>
                    </span>
                  </div>
                </div>

                <div className="lg:col-span-5 space-y-4 text-left">
                  <div>
                    <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#B8BCC6] mb-1.5">
                      <MapPin
                        className="w-3.5 h-3.5 shrink-0"
                        style={{ color: currentMood.color }}
                        aria-hidden="true"
                      />
                      <span>{activeBeforeAfter.location}</span>
                    </div>
                    <h3 className="text-2xl font-black text-white font-display tracking-tight">
                      {activeBeforeAfter.title}
                    </h3>
                    <p className="mt-2 text-xs sm:text-sm text-[#B8BCC6] leading-relaxed">
                      {activeBeforeAfter.summary}
                    </p>
                  </div>

                  <div className="p-4 sm:p-5 rounded-lg bg-[#151D30] border border-[#27324D] space-y-2.5 text-xs">
                    <div className="flex items-center justify-between border-b border-[#27324D] pb-2">
                      <span className="font-extrabold uppercase tracking-wider text-white">
                        Ficha Técnica
                      </span>
                      <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-500/25 px-2.5 py-0.5 rounded-md">
                        Garantía por escrito
                      </span>
                    </div>
                    <div className="space-y-1.5 text-[#B8BCC6]">
                      <p>
                        <strong className="text-white">Producto:</strong>{' '}
                        {activeBeforeAfter.technicalSheet.productApplied}
                      </p>
                      <p>
                        <strong className="text-white">Acabado:</strong>{' '}
                        {activeBeforeAfter.technicalSheet.finishType}
                      </p>
                      <p>
                        <strong className="text-white">Tiempo estimado:</strong>{' '}
                        {activeBeforeAfter.technicalSheet.executionTime}
                      </p>
                      <p className="text-emerald-300 font-semibold">
                        <strong>Garantía:</strong> {activeBeforeAfter.technicalSheet.warranty}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      onRequestSimilar(activeBeforeAfter.title, activeBeforeAfter.categoryLabel)
                    }
                    className="w-full inline-flex items-center justify-center gap-2.5 pl-2 pr-5 py-2.5 min-h-[48px] rounded-md text-xs sm:text-sm font-bold text-white shadow-md hover:opacity-95 transition-all cursor-pointer"
                    style={{ backgroundColor: currentMood.color }}
                  >
                    <span className="w-7 h-7 rounded-sm bg-white flex items-center justify-center shrink-0">
                      <ArrowRight
                        className="w-4 h-4"
                        style={{ color: currentMood.color }}
                        aria-hidden="true"
                      />
                    </span>
                    <span>Cotizar proyecto similar</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Section B: Filtered Projects Grid */}
        {activeFilter !== 'antes-despues' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="bg-[#F4F5F7] rounded-xl border border-[#E8E9EE] hover:border-[#090E19]/40 transition-all duration-200 overflow-hidden flex flex-col justify-between group text-left"
              >
                <div>
                  <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-[#090E19]">
                    <img
                      src={project.image}
                      alt={`${project.title} en ${project.location || 'Guatemala'} — Ideas & Colores Multi-Servicios`}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.035]"
                      loading="lazy"
                      decoding="async"
                      width={1200}
                      height={670}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#090E19]/85 via-transparent to-transparent" />

                    <div className="absolute top-3 left-3">
                      {project.isReferenceVisualization ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#090E19]/85 backdrop-blur-md text-[#FFCC99] text-[10px] font-bold border border-white/15">
                          <Info className="w-3 h-3" aria-hidden="true" />
                          <span>Visualización de referencia</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#090E19]/85 backdrop-blur-md text-emerald-300 text-[10px] font-bold border border-emerald-400/30">
                          <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
                          <span>Proyecto verificado</span>
                        </span>
                      )}
                    </div>

                    <div className="absolute top-3 right-3">
                      <span className="px-2.5 py-1 rounded-md bg-white text-[11px] font-extrabold text-[#090E19] shadow-xs">
                        {project.categoryLabel}
                      </span>
                    </div>

                    {project.location && (
                      <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-xs font-semibold text-white">
                        <MapPin
                          className="w-3.5 h-3.5 shrink-0"
                          style={{ color: currentMood.color }}
                          aria-hidden="true"
                        />
                        <span>{project.location}</span>
                      </div>
                    )}
                  </div>

                  <div className="p-6 space-y-3">
                    <h3 className="text-xl font-black font-display text-[#090E19] tracking-tight">
                      {project.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#525663] leading-relaxed">
                      {project.result}
                    </p>
                    <div className="pt-3 border-t border-[#E8E9EE] text-xs text-[#525663]">
                      <strong className="text-[#090E19] block mb-0.5 uppercase text-[10px] tracking-wider">
                        Solución aplicada
                      </strong>
                      <span>{project.solutionApplied}</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <button
                    type="button"
                    onClick={() => onRequestSimilar(project.title, project.categoryLabel)}
                    className="w-full py-3 px-4 min-h-[44px] rounded-md text-xs font-bold text-[#090E19] bg-white hover:bg-[#090E19] hover:text-white border border-[#E8E9EE] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Cotizar este tipo de solución</span>
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

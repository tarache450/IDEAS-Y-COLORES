import React, { useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  MessageCircle,
  CheckCircle2,
  Sparkles,
  FileCheck,
  Paintbrush,
  Printer,
  Hammer,
  Droplets,
  Wrench,
} from 'lucide-react';
import {
  MULTI_SERVICES_CATEGORIES,
  BUSINESS_INFO,
} from '../data/content';
import { SpotlightCard } from './ui/SpotlightCard';
import { buildSafeWhatsAppUrl } from '../utils/security';

interface ServiceCategoryPageProps {
  categoryId: string;
  onBackToHome: () => void;
  onSelectCategory: (categoryId: string) => void;
  onQuoteCategory: (categoryTitle: string, customMessage?: string) => void;
  onOpenTool?: (tool: 'color' | 'calculadora') => void;
}

const CATEGORY_SPECS: Record<
  string,
  {
    seoTitle: string;
    metaDescription: string;
    primaryQuestion: string;
    targetAudience: string;
    heroSubtitle: string;
    relatedIds: string[];
    technicalHighlights: { title: string; desc: string }[];
    faqs: { q: string; a: string }[];
  }
> = {
  pintura: {
    seoTitle: 'Pintura Arquitectónica Airless e Impermeabilización | Ideas & Colores Guatemala',
    metaDescription:
      'Servicio profesional de pintura con sistema Airless, impermeabilización de losas y tratamiento de humedad en Carretera a El Salvador y Ciudad de Guatemala con garantía por escrito.',
    primaryQuestion: '¿Cómo pintar o impermeabilizar mi residencia, comercio o bodega en Guatemala sin humedad ni atrasos?',
    targetAudience: 'Propietarios de residencias en condominios, administradores de edificios, colegios y gerentes de planta en Carretera a El Salvador y Ciudad de Guatemala.',
    heroSubtitle:
      'Suministro y aplicación profesional con equipos Airless de alta precisión, tratamiento de humedad, sellado elastomérico de losas y recubrimientos industriales.',
    relatedIds: ['resinas', 'carpinteria', 'instalaciones'],
    technicalHighlights: [
      {
        title: 'Preparación Profunda de Sustratos',
        desc: 'Lijado técnico, escarificado de pintura suelta, tratamiento fungicida/antihongos, resane de microfisuras con masilla elástica y sellador alcalino.',
      },
      {
        title: 'Sistema Airless y Rodillo Profesional',
        desc: 'Acabado uniforme tipo fábrica en interiores, fachadas de gran altura y naves comerciales, reduciendo tiempos de ejecución hasta en un 40%.',
      },
      {
        title: 'Impermeabilización de Losas y Terrazas',
        desc: 'Sistemas elasto-fibratados con malla de refuerzo y poliuretanos termorreflejantes para eliminar filtraciones en temporada de invierno.',
      },
    ],
    faqs: [
      {
        q: '¿Qué marcas de pintura utilizan en los proyectos?',
        a: 'Trabajamos con líneas certificadas de Sherwin-Williams, Paleta, Corona, Lanco y Sika, seleccionando la formulación exacta según el tráfico, humedad y exposición solar de tu superficie.',
      },
      {
        q: '¿Cubren muebles, pisos y ventanería antes de pintar?',
        a: 'Sí. El enmascarado con cinta de precisión y plástico de alta densidad en pisos, zócalos, lámparas y mobiliario es obligatorio antes de abrir cualquier cubeta.',
      },
      {
        q: '¿Cuánto tiempo dura la garantía por escrito en pintura e impermeabilización?',
        a: 'Entregamos certificado de garantía formal por escrito que respalda tanto la adherencia y mano de obra como la durabilidad del fabricante según la línea aplicada.',
      },
    ],
  },
  impresion: {
    seoTitle: 'Impresión Digital en Gran Formato y Rotulación | Ideas & Colores Guatemala',
    metaDescription:
      'Impresión digital en alta resolución en lona, vinil adhesivo, microperforado, backlight, acrílico, PVC y rotulación comercial o vehicular en Guatemala.',
    primaryQuestion: '¿Dónde imprimir e instalar rótulos, viniles y lonas resistentes al sol en Guatemala?',
    targetAudience: 'Comercios, franquicias, oficinas corporativas, colegios y complejos deportivos que requieren imagen gráfica e instalación llave en mano.',
    heroSubtitle:
      'Producción e instalación de lona, vinil adhesivo, microperforado, backlight, acrílico, PVC y rotulación arquitectónica o vehicular en alta resolución.',
    relatedIds: ['pintura', 'instalaciones', 'carpinteria'],
    technicalHighlights: [
      {
        title: 'Tintas con Protección UV para Exterior',
        desc: 'Impresión de alta densidad cromática resistente a la radiación solar y lluvia en fachadas comerciales y vallas.',
      },
      {
        title: 'Sustratos Rígidos y Flexibles',
        desc: 'Trabajamos sobre vinil brillante/mate, lona front/backlight, mesh, trovicel (PVC), acrílico, ACM, MDF, plywood y coroplast.',
      },
      {
        title: 'Instalación Técnica en Sitio',
        desc: 'Montaje sin burbujas en vidrieras corporativas, muros interiores, señalética industrial y flotillas vehiculares.',
      },
    ],
    faqs: [
      {
        q: '¿Realizan tanto la impresión como la instalación en el local o empresa?',
        a: 'Sí, entregamos el proyecto llave en mano: levantamiento de medidas en sitio, preparación de artes, impresión en alta resolución y montaje técnico seguro.',
      },
      {
        q: '¿Qué materiales recomiendan para fachadas o vidrieras exteriores?',
        a: 'Para vidrieras recomendamos vinil microperforado o vinil polimérico con laminado UV; para rótulos luminosos utilizamos lona Backlight o acrílico termoformado.',
      },
    ],
  },
  carpinteria: {
    seoTitle: 'Carpintería a Medida, Pérgolas y Decks en Guatemala | Ideas & Colores',
    metaDescription:
      'Diseño, fabricación y mantenimiento de pérgolas, decks de madera, clósets, cocinas y mobiliario a medida en Carretera a El Salvador y Ciudad de Guatemala.',
    primaryQuestion: '¿Quién fabrica o restaura pérgolas, decks y muebles de madera a medida con garantía en Guatemala?',
    targetAudience: 'Residencias en Carretera a El Salvador, restaurantes con terraza, oficinas y clubes que buscan ebanistería fina o restauración de madera.',
    heroSubtitle:
      'Fabricación, restauración y mantenimiento de pérgolas, decks de exterior, cocinas, clósets, puertas y mobiliario corporativo con maderas tratadas.',
    relatedIds: ['pintura', 'resinas', 'instalaciones'],
    technicalHighlights: [
      {
        title: 'Pérgolas y Decks para Clima de Guatemala',
        desc: 'Estructuras calculadas y tratadas con preservantes fungicidas y barnices marinos de poliuretano con filtro UV.',
      },
      {
        title: 'Ebanistería Residencial y Comercial',
        desc: 'Diseño y fabricación de clósets, muebles de baño, estaciones de trabajo, recepciones y tops de madera sólida.',
      },
      {
        title: 'Restauración y Mantenimiento Anual',
        desc: 'Lijado profundo, decapado de barniz deteriorado, hidratación de vetas y re-aplicación de acabado protector.',
      },
    ],
    faqs: [
      {
        q: '¿Hacen mantenimiento de pérgolas y decks ya existentes?',
        a: 'Sí, realizamos lijado completo, sustitución de piezas dañadas por humedad, aplicación de preservante e impermeabilización con barniz marino o poliuretano.',
      },
      {
        q: '¿Fabrican muebles sobre diseño y medidas específicas?',
        a: 'Totalmente. Tomamos medidas exactas en tu residencia u oficina para fabricar e instalar cada pieza a medida.',
      },
    ],
  },
  plomeria: {
    seoTitle: 'Plomería Técnica y Mantenimiento Hidrosanitario | Ideas & Colores Guatemala',
    metaDescription:
      'Servicio de plomería técnica, reparación de fugas, desobstrucción de drenajes, limpieza de trampas de grasa y cambio de grifería en Guatemala.',
    primaryQuestion: '¿Cómo resolver fugas de agua, obstrucciones o mantenimiento de baños y trampas de grasa con respaldo formal?',
    targetAudience: 'Hogares, restaurantes, plazas comerciales, colegios y oficinas en Carretera a El Salvador y Ciudad de Guatemala.',
    heroSubtitle:
      'Detección y corrección de fugas, instalación de artefactos sanitarios y grifería, limpieza de drenajes, bajadas pluviales y trampas de grasa.',
    relatedIds: ['pintura', 'instalaciones', 'resinas'],
    technicalHighlights: [
      {
        title: 'Mantenimiento Correctivo y Preventivo',
        desc: 'Atención ágil a fugas en tuberías de agua potable, cambio de válvulas, sellado sanitario y remodelación de baños.',
      },
      {
        title: 'Desobstrucción Técnica sin Romper',
        desc: 'Limpieza de lavatrastos, lavamanos, duchas, sanitarios, registros y tuberías de drenaje con equipo especializado.',
      },
      {
        title: 'Bajadas Pluviales y Trampas de Grasa',
        desc: 'Limpieza preventiva de canales, bajadas de agua de lluvia y trampas de grasa para residencias, restaurantes y comercios.',
      },
    ],
    faqs: [
      {
        q: '¿Atienden emergencias o mantenimientos programados en comercios y restaurantes?',
        a: 'Sí, trabajamos en horarios flexibles o nocturnos para restaurantes, oficinas y plazas comerciales sin interrumpir la atención al público.',
      },
      {
        q: '¿Instalan grifería, losa sanitaria y calentadores?',
        a: 'Sí, realizamos el desmontaje de equipos antiguos y la instalación hermética de sanitarios, lavamanos, mezcladoras y duchas con garantía.',
      },
    ],
  },
  resinas: {
    seoTitle: 'Pisos de Resina Epóxica y Recubrimientos 3D | Ideas & Colores Guatemala',
    metaDescription:
      'Aplicación de pisos de resina epóxica autonivelante, recubrimientos industriales de alto tráfico, tops decorativos y mesas de río en Guatemala.',
    primaryQuestion: '¿Dónde cotizar pisos de resina epóxica autonivelante para residencias, comercios o bodegas en Guatemala?',
    targetAudience: 'Clínicas, gimnasios, bodegas industriales, comercios de alto tráfico y residencias modernas en Guatemala.',
    heroSubtitle:
      'Pisos epóxicos autonivelantes de grado industrial, comercial y residencial, acabados porcelanato líquido, tops decorativos y mesas de río.',
    relatedIds: ['pintura', 'carpinteria', 'instalaciones'],
    technicalHighlights: [
      {
        title: 'Sistemas Autonivelantes sin Juntas',
        desc: 'Superficies continuas 100% higiénicas, fáciles de esterilizar y de alta resistencia a químicos, grasas y abrasión mecánica.',
      },
      {
        title: 'Resistencia para Alto Tráfico e Industria',
        desc: 'Formulaciones epóxicas y de poliuretano diseñadas para soportar tráfico peatonal intenso, clínicas, cocinas industriales, parqueos y bodegas.',
      },
      {
        title: 'Acabados Decorativos y Mesas de Río',
        desc: 'Efecto mármol, metalizado espejo, encapsulados 3D y fabricación artesanal de mesas de río combinando madera fina y epoxi cristal.',
      },
    ],
    faqs: [
      {
        q: '¿Sobre qué superficies se puede aplicar la resina epóxica?',
        a: 'Se puede aplicar sobre losas de concreto niveladas, piso cerámico existente (previo desbaste y puente de adherencia), madera y superficies de cocina o barras.',
      },
      {
        q: '¿Cuánto tiempo tarda en secar y estar listo para el uso un piso epóxico?',
        a: 'El tránsito peatonal ligero suele habilitarse entre 24 y 48 horas tras la capa final, y el curado químico total para carga pesada se completa en 5 a 7 días.',
      },
    ],
  },
  instalaciones: {
    seoTitle: 'Instalaciones Generales y Mantenimiento Locativo | Ideas & Colores Guatemala',
    metaDescription:
      'Instalación profesional de lámparas, soportes de TV, cuadros, cambio de switches/tomacorrientes y limpieza profunda de vidrios y terrazas en Guatemala.',
    primaryQuestion: '¿Quién realiza instalaciones de lámparas, soportes de TV y mantenimiento locativo integral en un solo equipo?',
    targetAudience: 'Propietarios en mudanza o remodelación, oficinas corporativas y locales comerciales en Carretera a El Salvador y Ciudad de Guatemala.',
    heroSubtitle:
      'Montaje técnico de luminarias, soportes de TV, cortineros, cambio de switches/tomacorrientes y limpieza profunda de vidrios, paredes y terrazas.',
    relatedIds: ['pintura', 'plomeria', 'carpinteria'],
    technicalHighlights: [
      {
        title: 'Instalaciones Eléctricas Menores e Iluminación',
        desc: 'Sustitución de apagadores, tomacorrientes, lámparas colgantes, ojos de buey LED y reflectores exteriores.',
      },
      {
        title: 'Montaje con Nivelación Láser',
        desc: 'Fijación segura en concreto, tablayeso o madera para soportes de pantallas TV, espejos, cuadros corporativos y repisas.',
      },
      {
        title: 'Limpieza Técnica de Superficies',
        desc: 'Desmanchado profundo de paredes, lavado de vidrios de altura, pérgolas y preparación integral de inmuebles para entrega o mudanza.',
      },
    ],
    faqs: [
      {
        q: '¿Puedo contratar varias instalaciones pequeñas en una misma visita?',
        a: 'Sí, podemos agrupar en una sola jornada técnica la instalación de lámparas, soportes de TV, retoques de pintura, plomería y cambio de switches.',
      },
      {
        q: '¿Cuentan con anclajes especiales para paredes de tablayeso (drywall)?',
        a: 'Utilizamos anclajes metálicos expansivos y fijación directa a parales estructurales para garantizar total seguridad en pantallas y elementos pesados.',
      },
    ],
  },
};

export const ServiceCategoryPage: React.FC<ServiceCategoryPageProps> = ({
  categoryId,
  onBackToHome,
  onSelectCategory,
  onQuoteCategory,
  onOpenTool,
}) => {
  const category =
    MULTI_SERVICES_CATEGORIES.find((c) => c.id === categoryId) ||
    MULTI_SERVICES_CATEGORIES[0];

  const spec = CATEGORY_SPECS[category.id] || CATEGORY_SPECS.pintura;

  // Update SPA document title and meta description per accessibility & origo-seo-brief guidelines
  useEffect(() => {
    const previousTitle = document.title;
    document.title = spec.seoTitle;

    const metaDescEl = document.querySelector('meta[name="description"]');
    const previousDesc = metaDescEl?.getAttribute('content') || '';
    if (metaDescEl) {
      metaDescEl.setAttribute('content', spec.metaDescription);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
    return () => {
      document.title = previousTitle;
      if (metaDescEl && previousDesc) {
        metaDescEl.setAttribute('content', previousDesc);
      }
    };
  }, [spec.seoTitle, spec.metaDescription, categoryId]);

  const iconMap: Record<string, React.ReactNode> = {
    pintura: <Paintbrush className="w-6 h-6" aria-hidden="true" />,
    impresion: <Printer className="w-6 h-6" aria-hidden="true" />,
    carpinteria: <Hammer className="w-6 h-6" aria-hidden="true" />,
    plomeria: <Droplets className="w-6 h-6" aria-hidden="true" />,
    resinas: <Sparkles className="w-6 h-6" aria-hidden="true" />,
    instalaciones: <Wrench className="w-6 h-6" aria-hidden="true" />,
  };

  const relatedCategories = MULTI_SERVICES_CATEGORIES.filter((c) =>
    spec.relatedIds.includes(c.id)
  );

  const directWaUrl = buildSafeWhatsAppUrl(
    BUSINESS_INFO.whatsappNumber,
    `Hola Ideas & Colores, estoy viendo la página de ${category.title} y quiero solicitar asesoría y cotización.`
  );

  return (
    <div className="py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Top Breadcrumb & Category Switcher Bar (origo-responsive-qa: min-h-[44px] + pan-x) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackToHome}
              className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 border border-slate-200/90 text-xs font-bold shadow-2xs transition-all"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              <span>Volver al Inicio</span>
            </button>
            <nav aria-label="Breadcrumb" className="text-xs text-slate-500 hidden sm:flex items-center gap-1.5">
              <span>Inicio</span>
              <span>/</span>
              <span>Especialidades</span>
              <span>/</span>
              <span className="font-bold text-slate-900">{category.title}</span>
            </nav>
          </div>

          {/* Quick switcher pills for the 6 subpages with >=44px touch targets */}
          <nav
            aria-label="Cambiar de especialidad"
            className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 touch-pan-x"
          >
            {MULTI_SERVICES_CATEGORIES.map((cat) => {
              const isCurrent = cat.id === category.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onSelectCategory(cat.id)}
                  aria-current={isCurrent ? 'page' : undefined}
                  className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center ${
                    isCurrent
                      ? 'text-white shadow-xs'
                      : 'bg-white/80 hover:bg-white text-slate-700 border border-slate-200/80'
                  }`}
                  style={{
                    backgroundColor: isCurrent ? cat.accentColor : undefined,
                  }}
                >
                  {cat.shortTitle}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Category Hero Block */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 shadow-2xs text-xs font-bold">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: category.accentColor }}
              />
              <span className="text-slate-800">División Especializada {category.number}</span>
              <span className="text-slate-300">•</span>
              <span style={{ color: category.accentColor }}>Garantía por Escrito</span>
            </div>

            <h1
              id="service-page-h1"
              tabIndex={-1}
              className="text-3xl sm:text-5xl font-extrabold text-slate-950 tracking-tight font-display leading-[1.08]"
            >
              {category.title} en Guatemala.
            </h1>

            <p className="text-base sm:text-lg text-slate-700 font-medium leading-relaxed">
              {spec.heroSubtitle}
            </p>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              {category.description}
            </p>

            {/* Audience & Local Search Intent Box (origo-seo-brief) */}
            <div className="p-4 rounded-2xl bg-slate-100/80 border border-slate-200/90 text-xs sm:text-sm text-slate-700 space-y-1">
              <div className="font-bold text-slate-950">{spec.primaryQuestion}</div>
              <p className="text-slate-600">{spec.targetAudience}</p>
            </div>

            {/* Primary CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
              <button
                type="button"
                onClick={() =>
                  onQuoteCategory(
                    category.title,
                    `Solicito visita técnica y cotización para el servicio especializado de ${category.title}.`
                  )
                }
                className="min-h-[48px] inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl text-base font-bold text-white shadow-lg hover:opacity-95 transition-all"
                style={{ backgroundColor: category.accentColor }}
              >
                <span>{category.ctaText}</span>
                <ArrowRight className="w-5 h-5" aria-hidden="true" />
              </button>

              <a
                href={directWaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[48px] inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl text-base font-bold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-all"
              >
                <MessageCircle className="w-5 h-5 text-emerald-600" aria-hidden="true" />
                <span>Cotizar por WhatsApp</span>
              </a>
            </div>

            {/* Interactive Tool Shortcut for Pintura / Resinas */}
            {(category.id === 'pintura' || category.id === 'resinas') && onOpenTool && (
              <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-wrap items-center justify-between gap-4 border border-slate-800">
                <div className="text-xs sm:text-sm">
                  <strong className="text-amber-400 block">¿Quieres simular colores o calcular m²?</strong>
                  <span className="text-slate-300">Usa nuestras herramientas gratuitas antes de cotizar.</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenTool('color')}
                    className="min-h-[44px] px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors"
                  >
                    Estudio de Color
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenTool('calculadora')}
                    className="min-h-[44px] px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition-colors"
                  >
                    Calculadora m²
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Image Showcase */}
          <div className="lg:col-span-5">
            <div className="rounded-3xl overflow-hidden bg-slate-950 border-2 border-slate-200 shadow-2xl relative aspect-[4/3.4]">
              <img
                src={category.image}
                alt={`${category.title} - Ideas & Colores Multi-Servicios`}
                className="w-full h-full object-cover"
                width="600"
                height="510"
                fetchPriority="high"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-white/50 shadow-lg text-left">
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0"
                    style={{ backgroundColor: category.accentColor }}
                  >
                    {iconMap[category.id]}
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-950 uppercase tracking-wider">
                      Cobertura en Carretera a El Salvador y Ciudad de Guatemala
                    </div>
                    <div className="text-xs text-slate-600 mt-0.5">
                      Visita técnica sin costo • Factura Electrónica SAT • Garantía formal
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Specifications & Surfaces Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* 3 Technical Highlights */}
          <div className="lg:col-span-7 space-y-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 font-display text-left">
              Alcance técnico y diferenciadores
            </h2>
            <div className="space-y-4">
              {spec.technicalHighlights.map((hl, idx) => (
                <SpotlightCard
                  key={hl.title}
                  className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs text-left"
                  spotlightColor={`${category.accentColor}15`}
                >
                  <div className="flex items-start gap-4">
                    <span
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black text-white shrink-0 mt-0.5"
                      style={{ backgroundColor: category.accentColor }}
                    >
                      0{idx + 1}
                    </span>
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-950 font-display mb-1">
                        {hl.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                        {hl.desc}
                      </p>
                    </div>
                  </div>
                </SpotlightCard>
              ))}
            </div>
          </div>

          {/* Surfaces & Lines Matrix */}
          <div className="lg:col-span-5">
            <div className="p-7 rounded-3xl bg-slate-950 text-white border border-slate-800 shadow-xl space-y-6 text-left h-full flex flex-col justify-between">
              <div className="space-y-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block mb-2">
                    Ficha de Compatibilidad
                  </span>
                  <h2 className="text-xl font-bold font-display text-white">
                    Superficies, Sustratos y Líneas
                  </h2>
                </div>

                <div>
                  <span className="text-xs font-semibold text-slate-400 block mb-2.5">
                    Superficies y aplicaciones atendidas:
                  </span>
                  <ul className="flex flex-wrap gap-2" role="list">
                    {category.surfacesOrApps.map((s) => (
                      <li
                        key={s}
                        className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-900 text-slate-200 border border-slate-800 flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" aria-hidden="true" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-slate-800">
                  <span className="text-xs font-semibold text-slate-400 block mb-2.5">
                    Líneas de trabajo disponibles:
                  </span>
                  <ul className="space-y-2" role="list">
                    {category.linesOrServices.map((line) => (
                      <li key={line} className="text-xs sm:text-sm text-slate-300 flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: category.accentColor }}
                        />
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() =>
                    onQuoteCategory(
                      category.title,
                      `Solicito cotización para ${category.title}.`
                    )
                  }
                  className="min-h-[48px] w-full py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs sm:text-sm transition-all flex items-center justify-center gap-2"
                >
                  <span>Agendar evaluación técnica sin costo</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Category Specific FAQ using native exclusive <details name="..."> */}
        <div className="rounded-3xl p-7 sm:p-10 bg-white border border-slate-200/90 shadow-xs text-left">
          <div className="max-w-3xl mb-6">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Preguntas Frecuentes de la Especialidad
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 font-display mt-1">
              Dudas comunes sobre {category.title}
            </h2>
          </div>

          <div className="space-y-3">
            {spec.faqs.map((faq, idx) => (
              <details
                key={faq.q}
                name="category-exclusive-faq"
                open={idx === 0}
                className="group rounded-2xl border border-slate-200 bg-slate-50/70 open:bg-white open:shadow-sm transition-all"
              >
                <summary className="cursor-pointer list-none px-6 py-4 font-bold text-sm sm:text-base text-slate-950 flex items-center justify-between gap-4 min-h-[48px]">
                  <span>{faq.q}</span>
                  <span className="text-slate-400 group-open:rotate-45 transition-transform text-xl leading-none" aria-hidden="true">
                    +
                  </span>
                </summary>
                <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>

        {/* Internal Cross-Linking to Complementary Services (origo-seo-brief item #6) */}
        <div className="space-y-5 text-left">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Soluciones Complementarias
            </span>
            <h2 className="text-2xl font-extrabold text-slate-950 font-display mt-1">
              Combina {category.shortTitle} con otras divisiones en un solo presupuesto
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {relatedCategories.map((rel) => (
              <div
                key={rel.id}
                className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between gap-4"
              >
                <div>
                  <span
                    className="inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full text-white mb-3"
                    style={{ backgroundColor: rel.accentColor }}
                  >
                    Especialidad {rel.number}
                  </span>
                  <h3 className="text-lg font-bold text-slate-950 font-display mb-1">
                    {rel.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {rel.tagline}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectCategory(rel.id)}
                  className="min-h-[44px] w-full px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs flex items-center justify-between transition-colors"
                >
                  <span>Explorar {rel.shortTitle}</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Process Summary & Direct Conversion Banner */}
        <div className="rounded-3xl p-8 sm:p-10 bg-slate-950 text-white border border-slate-800 shadow-xl flex flex-col lg:flex-row items-center justify-between gap-8 text-left">
          <div className="space-y-2 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-400">
              <FileCheck className="w-4 h-4" aria-hidden="true" />
              <span>Respaldo Formal Ideas &amp; Colores</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
              ¿Listo para cotizar tu proyecto de {category.shortTitle}?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Recibe diagnóstico técnico en sitio sin costo en Carretera a El Salvador y Ciudad de Guatemala, presupuesto desglosado en menos de 24 horas y garantía por escrito.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto shrink-0">
            <button
              type="button"
              onClick={() =>
                onQuoteCategory(
                  category.title,
                  `Me interesa cotizar un proyecto de ${category.title}.`
                )
              }
              className="min-h-[48px] px-6 py-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-sm transition-all flex items-center justify-center gap-2"
            >
              <span>Abrir formulario de cotización</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
            <a
              href={directWaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[48px] px-5 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm border border-slate-700 transition-all flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" aria-hidden="true" />
              <span>WhatsApp Directo</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

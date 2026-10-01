import {
  ProjectItem,
  SolutionItem,
  ServiceItem,
  PromotionItem,
  MultiServiceCategory,
  SectorItem,
  ExtendedServiceCategory,
} from '../types';

export const BUSINESS_INFO = {
  name: 'Ideas & Colores Multi-Servicios',
  shortName: 'Ideas & Colores',
  slogan: 'Color que transforma espacios.',
  sloganPrimary: 'Color que transforma espacios.',
  secondarySlogan: 'Pintura, mantenimiento y soluciones para cada espacio.',
  sloganSecondary: 'Pintura, mantenimiento y soluciones para cada espacio.',
  positioning:
    'Ideas & Colores Multi-Servicios transforma, protege y mantiene espacios con soluciones profesionales integrales.',
  experienceText:
    'Más de 10 años de experiencia en pintura, impresión digital, carpintería, plomería, resina epóxica y mantenimiento.',
  foundationYear: 2014,
  phone: '+502 6661-7592',
  phoneClean: '+50266617592',
  whatsapp: '+502 6661-7592',
  whatsappNumber: '50266617592',
  whatsappUrl:
    'https://wa.me/50266617592?text=Hola%20Ideas%20%26%20Colores%2C%20quiero%20cotizar%20mi%20proyecto.',
  location: 'Carretera a El Salvador, Guatemala',
  addressFull: 'Carretera a El Salvador, Guatemala',
  email: 'gerencia@ideasycoloresgt.com',
  website: 'www.ideasycoloresgt.com',
  hoursWeekday: 'Lunes a viernes: 8:00 a.m. a 6:00 p.m.',
  hoursWeekend: 'Sábado y domingo: cita previa',
  scheduleWeekdays: 'Lunes a viernes: 8:00 a.m. a 6:00 p.m.',
  scheduleSaturdays: 'Sábado: 8:00 a.m. a 1:00 p.m.',
  partnerBrand: 'Sherwin-Williams, Paleta y Sika',
  partnerBrandsList: ['Sherwin-Williams', 'Paleta', 'Sika'],
};

// Proceso de Trabajo Exacto según Requerimiento
export const PROCESS_STEPS = [
  {
    step: '01',
    title: 'Cuéntanos tu proyecto.',
    desc: 'Compártenos tu idea, medidas aproximadas, tipo de espacio o fotos para iniciar el diagnóstico técnico de inmediato.',
    detail: 'Contacto directo vía formulario o WhatsApp en minutos',
    badge: 'Diagnóstico inicial',
    actionText: 'Escríbenos tu idea',
  },
  {
    step: '02',
    title: 'Recibe asesoría y cotización.',
    desc: 'Evaluamos requerimientos y patologías de superficies para entregarte un presupuesto transparente, detallado y sin costos ocultos.',
    detail: 'Presupuesto claro desglosando producto y mano de obra',
    badge: 'Transparencia',
    actionText: 'Propuesta formal en <24h',
  },
  {
    step: '03',
    title: 'Definimos la solución adecuada.',
    desc: 'Validamos los colores con muestras físicas en sitio, definimos acabados idóneos y acordamos el cronograma exacto de ejecución.',
    detail: 'Muestras reales y especificación química validada',
    badge: 'Planificación',
    actionText: 'Aprobación de muestras',
  },
  {
    step: '04',
    title: 'Transformamos tu espacio.',
    desc: 'Ejecución con personal técnico calificado, protección de áreas, orden riguroso y entrega final con garantía formal por escrito.',
    detail: 'Entrega limpia con respaldo por escrito',
    badge: 'Garantía por escrito',
    actionText: 'Espacio renovado',
  },
];

// 5 Razones Clave: Por qué elegir Ideas & Colores (Bloque de Confianza)
export const WHY_CHOOSE_US = [
  {
    id: 'asesoria',
    number: '01',
    title: 'Asesoría clara y honesta',
    desc: 'Te recomendamos exactamente el producto y proceso técnico que tu superficie necesita, sin costos ocultos ni sobrecostos innecesarios.',
    icon: 'Sparkles',
    badge: 'Sin costos ocultos',
    accent: '#0059FF',
  },
  {
    id: 'calidad',
    number: '02',
    title: 'Calidad profesional',
    desc: 'Personal técnico calificado y productos de marcas líderes para asegurar adherencia, lavabilidad y durabilidad superior.',
    icon: 'ShieldCheck',
    badge: 'Marcas líderes',
    accent: '#FF5738',
  },
  {
    id: 'respuesta',
    number: '03',
    title: 'Respuesta ágil',
    desc: 'Atendemos con sentido de urgencia. Cotizaciones en menos de 24 horas y coordinación inmediata para el inicio de tu proyecto.',
    icon: 'Clock',
    badge: 'Menos de 24 horas',
    accent: '#FAB82A',
  },
  {
    id: 'precio',
    number: '04',
    title: 'Alto valor a precio justo',
    desc: 'Equilibrio óptimo entre mano de obra calificada, materiales de alto rendimiento y tarifas transparentes y competitivas.',
    icon: 'Scale',
    badge: 'Inversión protegida',
    accent: '#00A3FF',
  },
  {
    id: 'aliado',
    number: '05',
    title: 'Aplicación y entrega en un mismo aliado',
    desc: 'Un solo equipo integral para suministro de materiales, logística a domicilio, aplicación experta y garantía formal por escrito.',
    icon: 'Layers',
    badge: 'Solución integral',
    accent: '#10B981',
  },
];

// Servicios Ampliados: Las 5 Categorías Estructuradas (Bento Grid)
export const EXTENDED_SERVICES: ExtendedServiceCategory[] = [
  {
    id: 'asesoria-planificacion',
    name: 'Asesoría y planificación',
    badge: 'Diagnóstico & Colorimetría',
    shortDesc:
      'Evaluación técnica en sitio, análisis de sustratos, colorimetría arquitectónica y formulación precisa de presupuesto.',
    mainBenefit:
      'Evita errores de adherencia, desperdicio de material y sobrecostos con una prescripción técnica exacta desde el día uno.',
    ctaText: 'Cotizar esta solución',
    keyServices: [
      'Visita técnica y diagnóstico de sustratos',
      'Asesoría de color y muestras físicas en muro',
      'Cálculo de rendimiento por metro cuadrado',
      'Definición de sistemas de pintura y recubrimientos',
    ],
    materialsOrApps: ['Concreto', 'Tablayeso', 'Estructuras metálicas', 'Madera', 'Pisos'],
    accentColor: '#0059FF',
    icon: 'Compass',
  },
  {
    id: 'pintura-recubrimientos',
    name: 'Pintura y recubrimientos',
    badge: 'Suministro & Líneas Especializadas',
    shortDesc:
      'Venta y suministro de recubrimientos arquitectónicos, industriales, automotrices, maderas y resinas epóxicas con marcas de confianza.',
    mainBenefit:
      'Productos con alta lavabilidad, poder cubriente superior y resistencia química y climática garantizada.',
    ctaText: 'Cotizar esta solución',
    keyServices: [
      'Línea Arquitectónica (mate, satín, semibrillante)',
      'Línea Impermeabilización de losas y techos',
      'Línea Industrial anticorrosiva y epóxicos',
      'Línea Automotriz y acabados poliuretano',
      'Línea Maderas con tintes, selladores y barnices',
    ],
    materialsOrApps: ['ACM', 'Aluzinc', 'Fibra de vidrio', 'Plásticos técnicos', 'Concreto armado'],
    accentColor: '#FF5738',
    icon: 'Palette',
  },
  {
    id: 'aplicacion-profesional',
    name: 'Aplicación profesional',
    badge: 'Mano de Obra Calificada',
    shortDesc:
      'Pintores certificados para aplicación de pintura, colocación de resinas epóxicas autonivelantes y carpintería fina a la medida.',
    mainBenefit:
      'Enmascarado minucioso, preparación profunda de superficies, acabado uniforme sin marcas y orden impecable.',
    ctaText: 'Cotizar esta solución',
    keyServices: [
      'Aplicación con brocha, rodillo y airless de alta presión',
      'Preparación de superficies: lijado, resane y sellado',
      'Instalación de pisos epóxicos y tops decorativos 3D',
      'Fabricación y montaje de muebles y pérgolas a medida',
    ],
    materialsOrApps: ['Residencias', 'Edificios comerciales', 'Gimnasios', 'Complejos deportivos'],
    accentColor: '#FAB82A',
    icon: 'Paintbrush',
  },
  {
    id: 'proteccion-mantenimiento',
    name: 'Protección y mantenimiento',
    badge: 'Preservación de Estructuras',
    shortDesc:
      'Impermeabilización de losas, reparación hidrosanitaria (plomería), desobstrucción y mantenimiento correctivo/preventivo.',
    mainBenefit:
      'Protege tu patrimonio ante filtraciones de lluvia, humedad, fugas hidráulicas y deterioro prematuro.',
    ctaText: 'Cotizar esta solución',
    keyServices: [
      'Impermeabilización elasto-fibratada para terrazas',
      'Plomería técnica, desobstrucción y grifería',
      'Mantenimiento de bajadas pluviales y trampas de grasa',
      'Preservación de maderas con barniz marino y preservantes',
    ],
    materialsOrApps: ['Terrazas', 'Losas', 'Baños y cocinas', 'Estructuras exteriores'],
    accentColor: '#00A3FF',
    icon: 'ShieldCheck',
  },
  {
    id: 'logistica-soporte',
    name: 'Logística y soporte',
    badge: 'Entrega & Garantía Formal',
    shortDesc:
      'Entrega a domicilio de pintura en Carretera a El Salvador y toda Guatemala, cobro contra entrega e impresión digital.',
    mainBenefit:
      'Abastecimiento directo en obra sin demoras operativas, respaldado por factura formal y garantía por escrito.',
    ctaText: 'Cotizar esta solución',
    keyServices: [
      'Despacho y cobro con POS a domicilio',
      'Impresión digital en gran formato (lonas, viniles, rótulos)',
      'Instalación de luminarias, cuadros y soportes TV',
      'Emisión de garantía formal por escrito en mano de obra y productos',
    ],
    materialsOrApps: ['Lonas', 'Vinil', 'Acrílicos', 'PVC', 'MDF'],
    accentColor: '#10B981',
    icon: 'Truck',
  },
];

export const TRUST_BENEFITS = [
  {
    id: 'asesoria',
    title: 'Asesoría técnica personalizada',
    desc: 'Técnicos certificados para orientarte en acabados arquitectónicos, industriales, automotrices y madera.',
    icon: 'Sparkles',
  },
  {
    id: 'materiales',
    title: 'Materiales confiables',
    desc: 'Productos de marcas líderes que garantizan adherencia, lavabilidad y durabilidad superior.',
    icon: 'ShieldCheck',
  },
  {
    id: 'calidad',
    title: 'Mano de obra calificada',
    desc: 'Personal técnico con experiencia en aplicación, carpintería, plomería y resinas epóxicas.',
    icon: 'Paintbrush',
  },
  {
    id: 'garantia',
    title: 'Garantía por escrito',
    desc: 'Respaldo formal en mano de obra y productos seleccionados para tu total tranquilidad.',
    icon: 'Truck',
  },
];

// 4 Pilares verificados del PDF: "Un solo equipo para cada etapa de tu proyecto."
export const TRUST_FOUR_PILLARS = [
  {
    id: 'asesoria',
    number: '01',
    title: 'Asesoría técnica personalizada',
    subtitle: 'Diagnóstico y selección precisa',
    desc: 'Asesoramiento y soporte personalizado por técnicos certificados en líneas Arquitectónico, Industrial, Automotriz y Madera.',
    icon: 'Sparkles',
    badge: 'Técnicos certificados',
    accent: '#0059FF',
  },
  {
    id: 'calidad',
    number: '02',
    title: 'Personal calificado y materiales confiables',
    subtitle: 'Marcas líderes y durabilidad',
    desc: 'Consolidándonos con marcas locales e internacionales de productos y equipos, para garantizar mano de obra calificada y durabilidad superior.',
    icon: 'ShieldCheck',
    badge: 'Marcas reconocidas',
    accent: '#FF5738',
  },
  {
    id: 'ejecucion',
    number: '03',
    title: 'Ejecución de principio a fin',
    subtitle: 'Concepción hasta el acabado final',
    desc: 'Ejecutamos cada proyecto desde su concepción, preparación profunda de superficies hasta el acabado final con orden y limpieza.',
    icon: 'Layers',
    badge: 'Servicio integral',
    accent: '#FAB82A',
  },
  {
    id: 'garantia',
    number: '04',
    title: 'Garantía por escrito',
    subtitle: 'Productos y mano de obra',
    desc: 'Garantía por escrito tanto de productos como de mano de obra en cada solución residencial, comercial o industrial.',
    icon: 'FileCheck',
    badge: 'Respaldo formal',
    accent: '#00A3FF',
  },
];

// Las 6 Categorías Oficiales de Multi-Servicios (PDF Verificado)
export const MULTI_SERVICES_CATEGORIES: MultiServiceCategory[] = [
  {
    id: 'pintura',
    number: '01',
    title: 'Pintura y Recubrimientos',
    shortTitle: 'Pintura & Recubrimientos',
    tagline: 'Venta y aplicación para decoración, mantenimiento y preservación',
    description:
      'Venta y/o aplicación de productos para decoración, mantenimiento o preservación de estructuras con acabados profesionales y duraderos.',
    surfacesOrApps: [
      'Concreto',
      'Tablayeso',
      'Estructuras metálicas',
      'Madera',
      'Plástico',
      'ACM',
      'Fibra de vidrio',
    ],
    linesOrServices: [
      'Arquitectónica',
      'Impermeabilización',
      'Industrial',
      'Automotriz',
      'Madera',
    ],
    ctaText: 'Cotizar pintura y aplicación',
    accentColor: '#0059FF',
    accentGlow: 'rgba(0, 89, 255, 0.25)',
    image: '/services/servicio-pintura-interiores.jpg',
    isFeatured: true,
  },
  {
    id: 'impresion',
    number: '02',
    title: 'Impresión Digital',
    shortTitle: 'Impresión Digital',
    tagline: 'Alta resolución para pequeño y gran formato',
    description:
      'Impresión digital en alta resolución para pequeño y gran formato en diversos materiales con fidelidad cromática, durabilidad y visibilidad superior.',
    surfacesOrApps: [
      'Lonas',
      'Vinil',
      'Mesh',
      'Backlight',
      'Adhesivos',
      'Acrílicos',
      'PVC',
      'MDF',
      'Plywood',
      'Coroplast',
      'Lámina aluzinc',
      'Vehículos',
      'Pisos',
    ],
    linesOrServices: [
      'Gran formato exterior e interior',
      'Rotulación vehicular corporativa',
      'Señalización arquitectónica',
      'Adhesivos y viniles gráficos',
    ],
    ctaText: 'Cotizar impresión digital',
    accentColor: '#FF5738',
    accentGlow: 'rgba(255, 87, 56, 0.25)',
    image: '/services/servicio-mantenimiento-oficinas.jpg',
    isFeatured: false,
  },
  {
    id: 'carpinteria',
    number: '03',
    title: 'Carpintería a Medida',
    shortTitle: 'Carpintería a Medida',
    tagline: 'Diseño, elaboración y mantenimiento en madera fina',
    description:
      'Trabajos en madera a la medida para elaboración y mantenimiento de soluciones residenciales y comerciales con acabados de alta ebanistería.',
    surfacesOrApps: [
      'Muebles personalizados',
      'Cocinas integrales',
      'Closets y vestidores',
      'Armarios',
      'Tops de madera tratada',
      'Pérgolas para exterior',
      'Decks residenciales y comerciales',
      'Mantenimiento de madera',
    ],
    linesOrServices: [
      'Elaboración desde cero',
      'Mantenimiento con preservantes y poliuretanos',
      'Restauración de superficies',
      'Estructuras para pérgolas',
    ],
    ctaText: 'Cotizar carpintería',
    accentColor: '#FAB82A',
    accentGlow: 'rgba(250, 184, 42, 0.25)',
    image: '/services/servicio-carpinteria-medida.jpg',
    isFeatured: false,
  },
  {
    id: 'plomeria',
    number: '04',
    title: 'Plomería y Mantenimiento',
    shortTitle: 'Plomería & Mantenimiento',
    tagline: 'Instalación, reparación y desobstrucción de redes hidrosanitarias',
    description:
      'Desde instalación, reparación o mantenimiento hidrosanitario hasta limpieza de obstrucciones con diagnóstico oportuno para evitar daños mayores.',
    surfacesOrApps: [
      'Lavatrastos',
      'Lavamanos',
      'Duchas',
      'Sanitarios',
      'Limpieza de obstrucciones',
      'Bajadas de agua pluvial',
      'Trampas de grasa',
      'Tuberías de agua potable y drenaje',
    ],
    linesOrServices: [
      'Mantenimiento correctivo urgente',
      'Mantenimiento preventivo para locales',
      'Sustitución de grifería y accesorios',
      'Desobstrucción técnica',
    ],
    ctaText: 'Solicitar mantenimiento',
    accentColor: '#00A3FF',
    accentGlow: 'rgba(0, 163, 255, 0.25)',
    image: '/services/servicio-plomeria-bano.jpg',
    isFeatured: false,
  },
  {
    id: 'resinas',
    number: '05',
    title: 'Resinas Epóxicas',
    shortTitle: 'Resinas Epóxicas',
    tagline: 'Revestimiento decorativo, pisos industriales y piezas exclusivas',
    description:
      'Revestimiento y mantenimiento de pisos domiciliares, pisos industriales, tops decorativos y diseños 3D. También elaboración de artículos, muebles y mesas de río.',
    surfacesOrApps: [
      'Pisos domiciliares de lujo',
      'Pisos industriales de alta resistencia',
      'Tops decorativos para cocina y baño',
      'Diseños tridimensionales (3D)',
      'Artículos y piezas decorativas',
      'Muebles contemporáneos',
      'Mesas de río en madera y epoxi',
    ],
    linesOrServices: [
      'Acabados efecto espejo',
      'Sistemas epóxicos autonivelantes',
      'Protección química y mecánica',
      'Arte funcional a medida',
    ],
    ctaText: 'Cotizar resina epóxica',
    accentColor: '#0059FF',
    accentGlow: 'rgba(0, 89, 255, 0.25)',
    image: '/services/servicio-piso-epoxico.jpg',
    isFeatured: true,
  },
  {
    id: 'instalaciones',
    number: '06',
    title: 'Instalaciones y Otros Servicios',
    shortTitle: 'Instalaciones & Otros',
    tagline: 'Soluciones prácticas para completar la mejora de cada espacio',
    description:
      'Instalación técnica de complementos, mantenimiento eléctrico básico y limpieza profunda para entregar tu inmueble totalmente habitable y funcional.',
    surfacesOrApps: [
      'Instalación de lámparas y luminarias',
      'Instalación de cuadros y decoración',
      'Soportes para TV y pantallas',
      'Cambio de switches y tomacorrientes eléctricos',
      'Limpieza profunda de vidrios',
      'Limpieza y desmanchado de paredes',
      'Limpieza y preparación de terrazas',
      'Otros servicios de mantenimiento',
    ],
    linesOrServices: [
      'Montajes de precisión',
      'Mantenimiento locativo',
      'Limpieza técnica de superficies',
      'Servicios complementarios',
    ],
    ctaText: 'Consultar mi necesidad',
    accentColor: '#64748B',
    accentGlow: 'rgba(100, 116, 139, 0.25)',
    image: '/services/servicio-drywall-cielo-falso.jpg',
    isFeatured: false,
  },
];

// Sectores que atendemos (PDF Verificado)
export const SECTORS_LIST: SectorItem[] = [
  {
    id: 'residencial',
    title: 'Hogar y Residencial',
    badge: 'Condominios & Residencias',
    tagline: 'Ambientes cálidos, protegidos y confortables para tu familia',
    description:
      'Soluciones pensadas para casas particulares, apartamentos y residenciales en Guatemala. Cuidamos cada detalle protegiendo muebles y pisos.',
    relevantSolutions: [
      'Pintura arquitectónica lavable y bajo olor',
      'Impermeabilización de losas y techos',
      'Carpintería a medida (closets, cocinas y pérgolas)',
      'Plomería doméstica y reparación de grifería',
      'Resinas epóxicas decorativas y mesas de río',
    ],
    accentColor: '#0059FF',
    image: '/sectors/sector-residencial-sala-comedor.jpg',
  },
  {
    id: 'oficinas',
    title: 'Oficinas y Corporativo',
    badge: 'Espacios de Trabajo',
    tagline: 'Espacios que impulsan productividad con mínimo impacto operativo',
    description:
      'Mantenimiento y acabados para sedes corporativas, salas de reuniones y espacios compartidos con horarios flexibles que no interrumpen tu operación.',
    relevantSolutions: [
      'Pintura de rápida aplicación y bajo olor',
      'Impresión digital, rotulación y señalización interna',
      'Muebles a medida y divisiones en madera',
      'Instalación de soportes TV y cambio de interruptores',
      'Limpieza de vidrios y mantenimiento general',
    ],
    accentColor: '#00A3FF',
    image: '/sectors/sector-oficinas-sala-reuniones.jpg',
  },
  {
    id: 'comercios',
    title: 'Comercios y Locales',
    badge: 'Puntos de Venta & Retail',
    tagline: 'Imagen de marca impecable para atraer clientes y resistir alto tráfico',
    description:
      'Transformación y mantenimiento de fachadas, locales de centros comerciales, restaurantes y franquicias con materiales resistentes al uso continuo.',
    relevantSolutions: [
      'Pintura de alto tránsito y fácil limpieza',
      'Impresión en lona, vinil, mesh y backlight',
      'Pisos epóxicos brillantes de alta resistencia',
      'Mantenimiento hidrosanitario y trampas de grasa',
      'Instalación de iluminación y cuadros comerciales',
    ],
    accentColor: '#FF5738',
    image: '/services/servicio-mantenimiento-oficinas.jpg',
  },
  {
    id: 'recreativos',
    title: 'Espacios Recreativos y Deportivos',
    badge: 'Clubes & Gimnasios',
    tagline: 'Durabilidad y estética para áreas de alta intensidad física',
    description:
      'Soluciones para complejos deportivos, gimnasios, clubes de golf y áreas de esparcimiento con revestimientos antiderrapantes y señalización visual.',
    relevantSolutions: [
      'Pisos continuos con resinas y recubrimientos técnicos',
      'Pintura resistente al sudor, humedad y lavado diario',
      'Demarcación de canchas y señalización en vinil',
      'Pérgolas y decks de madera para exteriores',
      'Mantenimiento preventivo de áreas comunes',
    ],
    accentColor: '#FAB82A',
    image: '/projects/futeca-concepcion-despues.jpg',
  },
  {
    id: 'instituciones',
    title: 'Instituciones y Entidades',
    badge: 'Colegios & Entidades',
    tagline: 'Cumplimiento normativo, formalidad contable y ejecución precisa',
    description:
      'Atención a colegios, universidades, embajadas y organizaciones que requieren procesos formales de cotización, facturación SAT y estándares de seguridad.',
    relevantSolutions: [
      'Mantenimiento preventivo y correctivo programado',
      'Pinturas certificadas de baja toxicidad y alta lavabilidad',
      'Rotulación institucional y señalética en PVC / acrílico',
      'Reparación hidrosanitaria de baterías de baños',
      'Contratos de mantenimiento integral con garantía',
    ],
    accentColor: '#0059FF',
    image: '/sectors/sector-institucional-colegio-discovery.jpg',
  },
  {
    id: 'industria',
    title: 'Industria y Bodegas',
    badge: 'Manufactura & Logística',
    tagline: 'Resistencia mecánica, química y demarcación de seguridad vial',
    description:
      'Pisos epóxicos autonivelantes, protección anticorrosiva para cerchas metálicas y mantenimiento correctivo en plantas de almacenamiento y producción.',
    relevantSolutions: [
      'Pisos epóxicos autonivelantes para tráfico de montacargas',
      'Demarcación vial y zonas seguras con normas visuales',
      'Protección anticorrosiva de estructuras metálicas',
      'Sellado de losas industriales contra filtraciones',
      'Limpieza técnica de naves y estructuras altas',
    ],
    accentColor: '#64748B',
    image: '/services/servicio-piso-epoxico.jpg',
  },
];

// Clientes y Experiencia Verificada (Texto sobrio y formal con Casos de Éxito)
export const EXPERIENCE_CLIENTS = {
  sectionTitle: 'Espacios que hemos transformado.',
  statement:
    'Nuestra experiencia incluye proyectos para espacios comerciales, deportivos e institucionales.',
  featuredProjects: [
    {
      id: 'pulte-golf',
      name: 'El Pulté Golf',
      category: 'Espacio Deportivo & Recreativo',
      scope:
        'Soluciones integrales de mantenimiento, pintura arquitectónica y preservación de instalaciones de alto estándar.',
      status: 'Proyecto destacado',
      badge: 'Proyecto destacado',
      image: '/projects/pulte-golf-instalaciones.jpg',
      note: 'Instalaciones deportivas y áreas recreativas de alto estándar en Guatemala.',
      isPlaceholderReady: false,
    },
    {
      id: 'futeca-concepcion',
      name: 'FUTECA Concepción',
      category: 'Complejo Deportivo & Canchas',
      scope:
        'Mantenimiento integral de cerramientos perimetrales, pintura anticorrosiva en estructuras y demarcación deportiva.',
      status: 'Proyecto destacado',
      badge: 'Carretera a El Salvador',
      image: '/projects/futeca-concepcion-despues.jpg',
      note: 'Km 15.5 C.C. Pradera Concepción, Santa Catarina Pinula.',
      isPlaceholderReady: false,
    },
    {
      id: 'colegio-discovery',
      name: 'Colegio Discovery',
      category: 'Institucional & Campus Educativo',
      scope:
        'Pintura lavable de alta durabilidad en áreas lúdicas infantiles, murales y preservación de instalaciones techadas.',
      status: 'Proyecto destacado',
      badge: 'Km 14.5 Carretera a El Salvador',
      image: '/sectors/sector-institucional-colegio-discovery.jpg',
      note: 'Campus educativo con estándares de higiene y seguridad para niños.',
      isPlaceholderReady: false,
    },
    {
      id: 'plaza-fraijanes',
      name: 'Plaza Fraijanes',
      category: 'Centro Comercial & Retail',
      scope:
        'Mantenimiento locativo, pintura de fachadas, preservación de áreas comunes y señalética comercial.',
      status: 'Proyecto destacado',
      badge: 'Proyecto destacado',
      image: '/services/servicio-mantenimiento-oficinas.jpg',
      note: 'Espacio comercial y de servicios de alta afluencia en Fraijanes.',
      isPlaceholderReady: false,
    },
  ],
  secondaryBlockTitle: 'Experiencia que respalda nuestro trabajo.',
  previousExperience: [
    {
      name: 'Little Caesars',
      type: 'Comercial / Franquicia de Alimentos',
      scope:
        'Participación en proyectos de mantenimiento y acabados comerciales bajo tiempos de entrega rigurosos.',
    },
    {
      name: 'Wendy’s',
      type: 'Comercial / Cadena de Restaurantes',
      scope:
        'Experiencia en acabados de alto tráfico y servicio en áreas operativas y de atención.',
    },
    {
      name: 'Embajada de Estados Unidos',
      type: 'Institucional / Diplomático',
      scope:
        'Servicios de mantenimiento y aplicación bajo estrictos requerimientos técnicos de seguridad y calidad.',
    },
  ],
};

// Galería de Proyectos con Filtros Solicitados: Residencial, Comercial, Deportivo, Institucional, Antes y después
export const PROJECTS_GALLERY: ProjectItem[] = [
  {
    id: 'proj-futeca-concepcion',
    title: 'Futeca Concepción: Renovación de Canchas y Cerramientos Deportivos',
    category: 'deportivo',
    categoryLabel: 'Deportivo / Comercial',
    filterType: 'deportivo',
    solutionApplied:
      'Mantenimiento integral de mampostería perimetral, esmalte anticorrosivo en cerramientos metálicos y demarcación deportiva de alto tráfico.',
    result:
      'Instalaciones deportivas restauradas con acabado profesional de alta durabilidad frente a intemperie y sol de montaña.',
    image: '/projects/futeca-concepcion-despues.jpg',
    beforeImage: '/projects/futeca-concepcion-antes.jpg',
    location: 'C.C. Pradera Concepción, Km 15.5 Carretera a El Salvador',
    hasBeforeAfter: true,
    isReferenceVisualization: false,
  },
  {
    id: 'proj-1',
    title: 'Fachada Residencial en Carretera a El Salvador',
    category: 'residencial',
    categoryLabel: 'Residencial',
    filterType: 'residencial',
    solutionApplied:
      'Pintura arquitectónica satinada para exteriores y sellador hidrófugo',
    result:
      'Fachada protegida con tonos neutros cálidos que armonizan con el entorno y resisten la lluvia.',
    image: '/projects/fachada-residencial-carretera.jpg',
    beforeImage: '/projects/fachada-residencial-antes.jpg',
    location: 'Carretera a El Salvador, km 18.5',
    hasBeforeAfter: true,
    isReferenceVisualization: false,
  },
  {
    id: 'proj-2',
    title: 'Señalización Gráfica y Gran Formato Comercial',
    category: 'comercial',
    categoryLabel: 'Comercial',
    filterType: 'comercial',
    solutionApplied:
      'Impresión en lona backlight, vinil adhesivo mate y acrílico rotulado',
    result:
      'Alta visibilidad publicitaria con colores vivos y resistencia a la decoloración por rayos UV en exterior.',
    image: '/projects/rotulacion-comercial-fachada.jpg',
    location: 'Zona 10, Ciudad de Guatemala',
    hasBeforeAfter: false,
    isReferenceVisualization: false,
  },
  {
    id: 'proj-3',
    title: 'Revitalización y Pintura de Áreas de Gimnasio',
    category: 'deportivo',
    categoryLabel: 'Deportivo',
    filterType: 'deportivo',
    solutionApplied:
      'Pintura acrílica de alta lavabilidad, demarcación de zonas de peso libre y recubrimiento antideslizante',
    result:
      'Espacios energizantes de acondicionamiento físico con alta resistencia al roce y fácil mantenimiento.',
    image: '/projects/gimnasio-area-despues.jpg',
    beforeImage: '/projects/gimnasio-area-antes.jpg',
    location: 'Fraijanes / Ciudad de Guatemala',
    hasBeforeAfter: true,
    isReferenceVisualization: false,
  },
  {
    id: 'proj-4',
    title: 'Impermeabilización de Losa y Terraza Residencial',
    category: 'residencial',
    categoryLabel: 'Residencial',
    filterType: 'residencial',
    solutionApplied:
      'Sistema elasto-impermeabilizante fibratado con acabado termorreflejante',
    result:
      'Cero filtraciones en temporada de lluvias y reducción de temperatura en los ambientes interiores.',
    image: '/projects/impermeabilizacion-losa-despues.jpg',
    beforeImage: '/projects/impermeabilizacion-losa-antes.jpg',
    location: 'Santa Catarina Pinula, Guatemala',
    hasBeforeAfter: true,
    isReferenceVisualization: false,
  },
  {
    id: 'proj-5',
    title: 'Mantenimiento y Pintura Institucional de Alta Lavabilidad',
    category: 'institucional',
    categoryLabel: 'Institucional',
    filterType: 'institucional',
    solutionApplied:
      'Pintura antibacterial de alta retención de color, señalética interna y esmalte anticorrosivo',
    result:
      'Entorno institucional pulcro, higiénico y con normativas de colorimetría y durabilidad.',
    image: '/projects/pintura-institucional-oficinas.jpg',
    location: 'Zona 9, Ciudad de Guatemala',
    hasBeforeAfter: false,
    isReferenceVisualization: false,
  },
  {
    id: 'proj-6',
    title: 'Piso Epóxico Autonivelante de Alto Tráfico',
    category: 'comercial',
    categoryLabel: 'Comercial',
    filterType: 'comercial',
    solutionApplied:
      'Revestimiento epóxico multicapa autonivelante con sellador de poliuretano',
    result:
      'Superficie continua sin juntas, fácil de esterilizar y resistente a grasas, químicos y tráfico constante.',
    image: '/projects/piso-epoxico-alto-trafico.jpg',
    location: 'Carretera a El Salvador, Guatemala',
    hasBeforeAfter: false,
    isReferenceVisualization: false,
  },
  {
    id: 'proj-7',
    title: 'Demarcación y Recubrimiento para Complejo Deportivo',
    category: 'deportivo',
    categoryLabel: 'Deportivo',
    filterType: 'deportivo',
    solutionApplied:
      'Recubrimiento elastomérico antideslizante con pintura epoxi-acrílica para canchas deportivas',
    result:
      'Superficie deportiva segura con amortiguación adecuada y líneas reglamentarias nítidas.',
    image: '/projects/cancha-deportiva-recubrimiento.jpg',
    location: 'Guatemala',
    hasBeforeAfter: false,
    isReferenceVisualization: false,
  },
  {
    id: 'proj-colegio-discovery',
    title: 'Colegio Discovery: Mantenimiento y Acabados de Campus Educativo',
    category: 'institucional',
    categoryLabel: 'Institucional / Educativo',
    filterType: 'institucional',
    solutionApplied:
      'Pintura arquitectónica lavable en áreas lúdicas infantiles, murales didácticos y protección de estructuras techadas de aprendizaje.',
    result:
      'Ambientes pedagógicos limpios, estimulantes y seguros con acabados certificados de bajo VOC en Carretera a El Salvador.',
    image: '/sectors/sector-institucional-colegio-discovery.jpg',
    location: 'Km 14.5 Carretera a El Salvador, Santa Catarina Pinula',
    hasBeforeAfter: false,
    isReferenceVisualization: false,
  },
  {
    id: 'proj-9',
    title: 'Pérgola y Deck en Madera Tratada',
    category: 'residencial',
    categoryLabel: 'Residencial',
    filterType: 'residencial',
    solutionApplied:
      'Fabricación e instalación de pérgola con barniz marino y preservante de poro abierto',
    result:
      'Espacio exterior integrado al jardín con resistencia a hongos, termitas y humedad.',
    image: '/projects/pergola-deck-madera.jpg',
    location: 'Fraijanes, Guatemala',
    hasBeforeAfter: false,
    isReferenceVisualization: false,
  },
];

// Promociones Verificadas (Prompt: "Color que transforma, ahora con hasta 20% de descuento.")
export const PROMOTIONS_LIST: PromotionItem[] = [
  {
    id: 'promo-principal',
    title: 'Color que transforma, ahora con hasta 20% de descuento.',
    discount: 'Hasta 20% de descuento',
    description:
      'Pregunta por nuestras promociones en pintura y aplicación. Asesoría técnica en sitio, suministro de producto de calidad y mano de obra garantizada.',
    validUntil: 'Promoción activa en pintura y aplicación',
    highlight: true,
    terms:
      'Aplica en proyectos de pintura y aplicación residencial o comercial en Guatemala.',
  },
  {
    id: 'promo-multiservicios',
    title: 'Paquete de Mantenimiento Integral',
    discount: 'Tarifa especial combinada',
    description:
      'Combina pintura con servicios de carpintería, plomería o resinas epóxicas con un solo equipo coordinado y garantía por escrito.',
    validUntil: 'Consultar disponibilidad con tu asesor',
    highlight: false,
    terms: 'Válido para mantenimiento de residencias, oficinas y locales comerciales.',
  },
  {
    id: 'promo-domicilio',
    title: 'Entrega y Cobro a Domicilio',
    discount: 'Envío sin complicaciones',
    description:
      'Despachamos productos y pinturas directamente a tu proyecto con opción de cobro seguro contra entrega.',
    validUntil: 'Disponible todo el año',
    highlight: false,
    terms: 'Válido en rutas metropolitanas y Carretera a El Salvador.',
  },
];

// Valores de la Empresa
export const ABOUT_VALUES = [
  {
    title: 'Claridad',
    desc: 'Hablamos con la verdad sobre qué producto y servicio necesitas realmente. Sin costos ocultos ni tecnicismos confusos.',
    icon: 'Eye',
  },
  {
    title: 'Sentido de urgencia',
    desc: 'Sabemos que tu tiempo y el cronograma de tu espacio son prioritarios. Respondemos rápido y cumplimos los plazos acordados.',
    icon: 'Clock',
  },
  {
    title: 'Alto valor a precio justo',
    desc: 'Unimos materiales confiables con mano de obra calificada a una tarifa balanceada que rinde y protege tu inversión.',
    icon: 'Scale',
  },
  {
    title: 'Compromiso y garantía',
    desc: 'Acompañamos cada etapa y respondemos por escrito tanto en productos como en mano de obra. No desaparecemos al terminar.',
    icon: 'CheckCircle2',
  },
];

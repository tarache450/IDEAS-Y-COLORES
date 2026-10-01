export type ProjectGalleryFilter =
  | 'todos'
  | 'residencial'
  | 'comercial'
  | 'deportivo'
  | 'institucional'
  | 'antes-despues';

export interface ExtendedServiceCategory {
  id: string;
  name: string;
  badge: string;
  shortDesc: string;
  mainBenefit: string;
  ctaText: string;
  keyServices: string[];
  materialsOrApps: string[];
  accentColor: string;
  icon: string;
}

export type SolutionCategory =
  | 'pintura'
  | 'impresion'
  | 'carpinteria'
  | 'plomeria'
  | 'resinas'
  | 'instalaciones'
  | 'arquitectonica'
  | 'impermeabilizacion'
  | 'industria'
  | 'madera'
  | 'automotriz'
  | 'accesorios';

export type SectorType =
  | 'residencial'
  | 'oficinas'
  | 'comercios'
  | 'recreativos'
  | 'instituciones'
  | 'industria';

export interface SectorItem {
  id: SectorType;
  title: string;
  badge: string;
  tagline: string;
  description: string;
  relevantSolutions: string[];
  accentColor: string;
  image: string;
}

export interface MultiServiceCategory {
  id: string;
  number: string;
  title: string;
  shortTitle: string;
  tagline: string;
  description: string;
  surfacesOrApps: string[];
  linesOrServices: string[];
  ctaText: string;
  accentColor: string;
  accentGlow: string;
  image: string;
  isFeatured?: boolean;
}

export interface ProjectItem {
  id: string;
  title: string;
  category: 'residencial' | 'comercial' | 'deportivo' | 'institucional' | 'industrial';
  categoryLabel: string;
  filterType?: string;
  solutionApplied: string;
  result: string;
  image: string;
  beforeImage?: string;
  location?: string;
  hasBeforeAfter?: boolean;
  isReferenceVisualization?: boolean;
}

export interface SolutionItem {
  id: string;
  title: string;
  category: SolutionCategory;
  categoryLabel: string;
  tagline: string;
  description: string;
  useCases: string[];
  mainBenefit: string;
  iconName: string;
  accentColor: string;
  image: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  shortDesc: string;
  description: string;
  features: string[];
  icon: string;
  badge?: string;
}

export interface PromotionItem {
  id: string;
  title: string;
  discount: string;
  description: string;
  validUntil: string;
  highlight: boolean;
  terms: string;
}

export interface QuoteFormData {
  fullName: string;
  phone: string;
  email: string;
  projectType: string;
  requiredService: string;
  location: string;
  projectSize: string;
  message: string;
  privacyAccepted: boolean;
  photos?: File[];
}

export type PaintFinish = 'mate' | 'satinado' | 'semibrillante';
export type LightingMode = 'dia' | 'atardecer' | 'calida';

export interface ColorSwatch {
  id: string;
  code: string; // e.g. 'SW 9130'
  name: string; // e.g. 'Evergreen Fog'
  hex: string;
  collection: string;
  lrv: number; // Light Reflectance Value 0-100
  description: string;
  bestFor: string;
  complementaryHex: string[];
}

export interface ColorCollection {
  id: string;
  name: string;
  description: string;
  swatches: ColorSwatch[];
}

export interface RoomScene {
  id: string;
  name: string;
  category: 'interior' | 'exterior';
  image: string;
  description: string;
  wallMask: string;
  wallMaskId?: string;
  aspectRatio?: string;
  foregroundImage?: string;
}


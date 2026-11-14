// Oficial paleta multicolor extraida del logotipo de Ideas & Colores Guatemala
export const LOGO_COLORS = {
  blue: '#0059FF',
  sky: '#00A3FF',
  gold: '#FAB82A',
  orange: '#FF5C00',
  coral: '#FF5738',
  emerald: '#10B981',
  indigo: '#4F46E5',
} as const;

export const LOGO_SPECTRUM_LIST = [
  LOGO_COLORS.blue,
  LOGO_COLORS.sky,
  LOGO_COLORS.gold,
  LOGO_COLORS.orange,
] as const;

export const LOGO_SPECTRUM_GRADIENT =
  'linear-gradient(90deg, #0059FF 0%, #00A3FF 34%, #FAB82A 68%, #FF5C00 100%)';

const CATEGORY_LOGO_MAP: Record<string, { accent: string; textOnAccent: string; name: string }> = {
  pintura: { accent: LOGO_COLORS.blue, textOnAccent: '#FFFFFF', name: 'Azul Real' },
  impresion: { accent: LOGO_COLORS.coral, textOnAccent: '#090E19', name: 'Coral Vivo' },
  carpinteria: { accent: LOGO_COLORS.gold, textOnAccent: '#090E19', name: 'Dorado' },
  plomeria: { accent: LOGO_COLORS.sky, textOnAccent: '#090E19', name: 'Celeste' },
  resinas: { accent: LOGO_COLORS.indigo, textOnAccent: '#FFFFFF', name: 'Índigo' },
  instalaciones: { accent: LOGO_COLORS.emerald, textOnAccent: '#090E19', name: 'Esmeralda' },
};

export function getCategoryLogoTheme(categoryId?: string | null, fallbackAccent?: string) {
  if (categoryId && CATEGORY_LOGO_MAP[categoryId]) {
    return CATEGORY_LOGO_MAP[categoryId];
  }
  const color = fallbackAccent || LOGO_COLORS.orange;
  const isLight =
    color === LOGO_COLORS.gold ||
    color === LOGO_COLORS.sky ||
    color === LOGO_COLORS.emerald ||
    color === LOGO_COLORS.orange ||
    color === LOGO_COLORS.coral;
  return {
    accent: color,
    textOnAccent: isLight ? '#090E19' : '#FFFFFF',
    name: 'Marca',
  };
}

export const NAV_PAGE_ACCENTS: Record<string, string> = {
  inicio: LOGO_COLORS.blue,
  servicios: LOGO_COLORS.blue,
  proyectos: LOGO_COLORS.orange,
  herramientas: LOGO_COLORS.sky,
  nosotros: LOGO_COLORS.gold,
  contacto: LOGO_COLORS.emerald,
};

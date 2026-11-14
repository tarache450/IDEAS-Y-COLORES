import { BUSINESS_INFO, MULTI_SERVICES_CATEGORIES } from '../data/content';

interface WebMcpToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  execute: (args: Record<string, unknown>) => Promise<unknown> | unknown;
}

interface ModelContextNavigator {
  modelContext?: {
    registerTool?: (tool: WebMcpToolDefinition) => void;
    provideContext?: (context: { tools: WebMcpToolDefinition[] }) => void;
  };
}

let isRegistered = false;

/**
 * Registers imperative WebMCP tools when the browser exposes `navigator.modelContext`
 * (Chrome Agentic Browsing / WebMCP standard).
 */
export function registerWebMcpTools(): void {
  if (typeof window === 'undefined' || isRegistered) return;

  const nav = window.navigator as unknown as ModelContextNavigator;
  const mc = nav.modelContext;
  if (!mc) return;

  const tools: WebMcpToolDefinition[] = [
    {
      name: 'consultar_catalogo_servicios',
      description:
        'Consulta las 6 divisiones de servicios profesionales de Ideas & Colores Guatemala (Pintura Airless, Impermeabilización de Losas, Resinas Epóxicas, Carpintería, Impresión Digital, Plomería e Instalaciones) y su cobertura geográfica.',
      inputSchema: {
        type: 'object',
        properties: {
          categoria: {
            type: 'string',
            description:
              'Identificador opcional de categoría: pintura, resinas, carpinteria, impresion, plomeria o instalaciones.',
          },
        },
      },
      execute: (args) => {
        const catId = typeof args?.categoria === 'string' ? args.categoria.toLowerCase() : '';
        const categories = catId
          ? MULTI_SERVICES_CATEGORIES.filter((c) => c.id === catId)
          : MULTI_SERVICES_CATEGORIES;
        return {
          brand: BUSINESS_INFO.name,
          slogan: BUSINESS_INFO.slogan,
          phone: BUSINESS_INFO.phone,
          location: BUSINESS_INFO.location,
          categories: categories.map((c) => ({
            id: c.id,
            title: c.title,
            url: `https://ideasycoloresgt.site/servicios/${c.id}`,
            description: c.description,
          })),
        };
      },
    },
    {
      name: 'calcular_rendimiento_pintura',
      description:
        'Calcula la cantidad estimada de galones y cubetas de pintura necesarios según el área en metros cuadrados y el número de manos de aplicación.',
      inputSchema: {
        type: 'object',
        required: ['areaM2'],
        properties: {
          areaM2: {
            type: 'number',
            description: 'Área total a pintar en metros cuadrados (m²).',
          },
          manos: {
            type: 'number',
            description: 'Número de manos o capas de pintura (por defecto 2).',
          },
        },
      },
      execute: (args) => {
        const area = Math.max(1, Number(args?.areaM2) || 50);
        const coats = Math.max(1, Math.min(4, Number(args?.manos) || 2));
        const totalGallons = Math.ceil((area * coats) / 32);
        const buckets = Math.floor(totalGallons / 5);
        const remainingGallons = totalGallons % 5;
        return {
          areaM2: area,
          manos: coats,
          galonesTotalesEstimados: totalGallons,
          desgloseSugerido: `${buckets} cubeta(s) de 5 galones + ${remainingGallons} galón(es)`,
          contactoCotizacion: BUSINESS_INFO.phone,
          urlCotizador: 'https://ideasycoloresgt.site/#cotizar',
        };
      },
    },
  ];

  try {
    if (typeof mc.registerTool === 'function') {
      for (const tool of tools) {
        mc.registerTool(tool);
      }
      isRegistered = true;
    } else if (typeof mc.provideContext === 'function') {
      mc.provideContext({ tools });
      isRegistered = true;
    }
  } catch {
    // Ignore experimental WebMCP runtime errors across browser versions
  }
}

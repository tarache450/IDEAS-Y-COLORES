# ARQUITECTURA DE DATOS SUPABASE — IDEAS & COLORES MULTI-SERVICIOS

## 1. Current State (Estado Actual)

La plataforma web de **Ideas & Colores Multi-Servicios** es una aplicación React 19 + TypeScript + Vite moderna, con diseño dinámico y orientación a la conversión directa en Guatemala (principalmente Carretera a El Salvador y área metropolitana).

### Auditoría de Componentes y Flujos de Datos:

| Componente | Datos Manipulados | Destino Actual | Necesidad de Persistencia |
| :--- | :--- | :--- | :--- |
| **`QuoteForm.tsx`** | Nombre, teléfono, correo, servicio, tipo de espacio, área estimada, plazo, ubicación, mensaje, fotos locales. | Memoria (`useState`) y redirección a WhatsApp (`wa.me`). El submit web simulaba éxito con `setTimeout`. | **SÍ (CRÍTICO)**: Es el canal primario de captura de leads formales para presupuestos. |
| **`ContactSection.tsx`** | Nombre, teléfono, mensaje. | Memoria (`useState`) con mensaje estático de agradecimiento. | **SÍ**: Captura rápida de leads por llamada/contacto. Debe unificarse en la misma entidad. |
| **`PaintCalculator.tsx`** | Dimensiones, tipo de superficie, manos de pintura, cálculo de galones/cubetas/litros y mano de obra. | Memoria local. Opcionalmente transfiere el resumen al formulario de cotización. | **NO (como cálculo aislado)**. Solo persiste si el usuario lo adjunta al cotizar. |
| **`ColorStudioVisualizer.tsx`** | Paletas Sherwin-Williams, selección de color, acabado, habitación simulada. | Memoria local. Opcionalmente transfiere el color elegido al mensaje de cotización. | **NO (como interacción)**. No se requiere analítica ni guardar sesiones en esta fase. |
| **`FloatingWhatsApp.tsx`** | Mensaje rápido o chip de servicio seleccionado. | Generación de deep-link directo a WhatsApp API. | **NO**. Es un puente directo de comunicación externa. |
| **Contenido Estático** (`src/data/content.ts`) | Servicios, FAQ, testimonios, proyectos, garantías, promociones, datos de contacto. | Código fuente estático optimizado para SEO y SSR/SSG. | **NO**. Mantener estático según el Principio 50 de la directiva. |

---

## 2. Persistence Candidates (Candidatos de Persistencia)

Únicamente existe **UN DOMINIO REAL** que amerita persistencia en base de datos:

### Solicitudes de Cotización / Leads (`quote_requests`)
Centraliza todas las intenciones de contratación de clientes que ingresan vía formulario web, evitando la pérdida de prospectos si el usuario no concreta el clic final a WhatsApp o prefiere contacto telefónico/correo.

Información estructurada a persistir:
1. `id`: Identificador único (UUID v4).
2. `created_at`: Timestamp de registro con zona horaria.
3. `name`: Nombre completo del cliente (requerido).
4. `phone`: Teléfono o WhatsApp de contacto (requerido).
5. `email`: Correo electrónico de contacto (opcional / validado).
6. `service`: Especialidad solicitada (Pintura, Impresión digital, Carpintería, Plomería, Resina epóxica, Mantenimiento, etc.).
7. `space_type`: Contexto del inmueble (Residencial, Oficina, Comercial, Recreativo, Institucional, Industrial).
8. `estimated_area`: Rango de superficie (`< 50 m²`, `50 - 150 m²`, `150 - 300 m²`, `> 300 m²`, `A evaluar en sitio`).
9. `desired_timeline`: Urgencia de ejecución (`Inmediato`, `Próximos 7 días`, `En 2 a 4 semanas`, `Planificación futura`).
10. `location`: Zona o municipio en Guatemala (e.g. Carretera a El Salvador, Mixco, etc.).
11. `message`: Detalles técnicos adicionales, requerimientos especiales o resumen transferido desde la calculadora de pintura.
12. `status`: Ciclo de vida del lead (`new`, `contacted`, `quoted`, `won`, `lost`).
13. `source`: Canal de captura (`website_quote_form`, `website_contact_section`, `website`).

---

## 3. Do Not Persist (Datos que NO se almacenarán)

Para cumplir con el principio de mínima superficie de ataque, cero sobreingeniería y máxima privacidad:

1. **Cálculos anónimos de la calculadora de pintura**: No se guardan cálculos efímeros que no deriven en una solicitud de cotización real.
2. **Historial o clicks del visualizador de color**: No se almacenan eventos de cambio de color o presets visualizados.
3. **Imágenes adjuntas del cliente**: En esta fase no se habilita storage de archivos (se mantiene el envío directo vía WhatsApp para agilidad del cliente).
4. **Catálogo de productos, testimonios y servicios**: Permanecen en el frontend TypeScript para máxima velocidad de renderizado, cache de CDN y SEO indexable sin latencia de red.
5. **Autenticación de usuarios finales**: Los visitantes del sitio son anónimos; no requieren crear cuenta ni iniciar sesión para cotizar.

---

## 4. Proposed Schema (Esquema PostgreSQL / Supabase)

### Tabla: `quote_requests`

```sql
CREATE TABLE IF NOT EXISTS public.quote_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  name text NOT NULL,
  phone text NOT NULL,
  email text,
  service text,
  space_type text,
  estimated_area text,
  desired_timeline text,
  location text,
  message text,
  status text NOT NULL DEFAULT 'new',
  source text NOT NULL DEFAULT 'website_quote_form',

  -- Restricciones de integridad y límites razonables
  CONSTRAINT name_length_check CHECK (char_length(name) >= 2 AND char_length(name) <= 150),
  CONSTRAINT phone_length_check CHECK (char_length(phone) >= 6 AND char_length(phone) <= 30),
  CONSTRAINT email_length_check CHECK (email IS NULL OR (char_length(email) <= 254 AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')),
  CONSTRAINT message_length_check CHECK (message IS NULL OR char_length(message) <= 3000),
  CONSTRAINT status_enum_check CHECK (status IN ('new', 'contacted', 'quoted', 'won', 'lost')),
  CONSTRAINT source_enum_check CHECK (source IN ('website_quote_form', 'website_contact_section', 'website'))
);

-- Índices estratégicos (solo para ordenación cronológica y filtros de gestión futuros)
CREATE INDEX IF NOT EXISTS idx_quote_requests_created_at ON public.quote_requests (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quote_requests_status ON public.quote_requests (status);
```

---

## 5. Security Model (Modelo de Seguridad y RLS)

### Matriz de Permisos para Cliente Público (`anon`)

| Operación | Permiso `anon` | Justificación |
| :---: | :---: | :--- |
| **INSERT** | ✅ **PERMITIDO** (Condicionado) | Permite a cualquier prospecto registrar su solicitud de cotización sin registrarse. Solo valida que los campos requeridos no estén vacíos. |
| **SELECT** | ❌ **DENEGADO** | Los visitantes o actores maliciosos con la clave `anon` NO pueden listar leads, ver nombres, teléfonos, correos ni presupuestos de otros clientes. |
| **UPDATE** | ❌ **DENEGADO** | Nadie desde el frontend anónimo puede alterar el estado ni los datos de un lead registrado. |
| **DELETE** | ❌ **DENEGADO** | Nadie desde el frontend anónimo puede eliminar leads. |

### Políticas RLS:
```sql
ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;

-- Política de inserción pública estricta
CREATE POLICY "Public anon users can insert quote requests"
  ON public.quote_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    char_length(trim(name)) >= 2 AND
    char_length(trim(phone)) >= 6
  );

-- No se definen políticas SELECT, UPDATE o DELETE para el rol anon.
-- En PostgreSQL/Supabase, al activar RLS y no definir políticas para esas acciones, el acceso es DENEGADO por defecto (Default Deny).
```

---

## 6. Integration Plan (Plan de Integración en el Código)

1. **Instalación de dependencia**: Agregar `@supabase/supabase-js`.
2. **Cliente Supabase Centralizado** (`src/lib/supabase.ts`):
   - Lee variables de entorno `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
   - Manejo a prueba de fallos si las variables están ausentes en modo desarrollo.
3. **Tipos Fuertes de TypeScript** (`src/types/database.types.ts`):
   - Definición del esquema `Database`, `QuoteRequestRow`, `QuoteRequestInsert`.
4. **Servicio de Datos** (`src/services/quotes.ts`):
   - Función tipada `createQuoteRequest(payload: QuoteRequestInsert)`.
   - Sanitización básica y protección honeypot en frontend antes de enviar a Supabase.
5. **Conexión de Formularios**:
   - `QuoteForm.tsx`: Estado `isSubmitting`, inserción real en Supabase con fallback amigable, visualización de estado de éxito o error no invasivo.
   - `ContactSection.tsx`: Inserción real en Supabase con `source = 'website_contact_section'`, previniendo doble submit y mostrando confirmación visual.

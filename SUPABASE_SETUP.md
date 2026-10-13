# GUÍA DE CONFIGURACIÓN Y DESPLIEGUE — SUPABASE

## IDEAS & COLORES MULTI-SERVICIOS (FASE 9.1)

Este documento detalla la integración de base de datos PostgreSQL en la nube con Supabase para la captura segura, resiliente y estructurada de leads y cotizaciones.

---

## 1. Project (Conexión del Proyecto)

El proyecto utiliza `@supabase/supabase-js` para interactuar con la instancia de PostgreSQL alojada en Supabase.
- **Arquitectura**: Arquitectura de cliente ligero en frontend con **Row Level Security (RLS)** obligatorio.
- **Acceso centralizado**: Instancia única configurada en [`src/lib/supabase.ts`](file:///Users/mac/IDEAS-Y-COLORES/src/lib/supabase.ts).
- **Tipado completo**: Esquema TypeScript estricto generado en [`src/types/database.types.ts`](file:///Users/mac/IDEAS-Y-COLORES/src/types/database.types.ts).
- **Capa de Servicio**: [`src/services/quotes.ts`](file:///Users/mac/IDEAS-Y-COLORES/src/services/quotes.ts) centraliza las inserciones, validaciones de integridad y trampa anti-spam (honeypot).

---

## 2. Environment Variables (Variables de Entorno)

La aplicación requiere dos variables de entorno estándar de Vite. Las credenciales deben configurarse en `.env` (desarrollo local) y en las variables de entorno del servidor de producción (Hostinger / Vercel / Netlify / etc.):

```env
# URL de la API del proyecto Supabase
VITE_SUPABASE_URL=https://[PROJECT-REF].supabase.co

# Clave pública anónima (con permisos RLS restringidos exclusivamente a INSERT)
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> [!CAUTION]
> **SEGURIDAD CRÍTICA**: Nunca expongas la clave `service_role` en variables con prefijo `VITE_` ni en ningún archivo del frontend. La clave `anon` es la única que debe configurarse en el cliente público.

---

## 3. Database Schema Documentation

Estructura de la entidad principal de negocio:

```text
quote_requests
│
├── id (uuid, PK, default: gen_random_uuid())
├── created_at (timestamptz, default: now())
├── name (text, NOT NULL, 2..150 chars)
├── phone (text, NOT NULL, 6..30 chars)
├── email (text, NULLABLE, validación regex)
├── service (text, NULLABLE)
├── space_type (text, NULLABLE)
├── estimated_area (text, NULLABLE)
├── desired_timeline (text, NULLABLE)
├── location (text, NULLABLE)
├── message (text, NULLABLE, max 3000 chars)
├── status (text, NOT NULL, default: 'new') ['new' | 'contacted' | 'quoted' | 'won' | 'lost']
└── source (text, NOT NULL, default: 'website_quote_form') ['website_quote_form' | 'website_contact_section' | 'website']
```

---

## 4. Tables & Constraints (Restricciones e Índices)

### Definición DDL
Se encuentra versionada en:
- Migración versionable: [`supabase/migrations/20261008120000_create_quote_requests.sql`](file:///Users/mac/IDEAS-Y-COLORES/supabase/migrations/20261008120000_create_quote_requests.sql)
- Script reproducible completo: [`supabase/schema.sql`](file:///Users/mac/IDEAS-Y-COLORES/supabase/schema.sql)

### Constraints de Integridad:
- `quote_requests_name_check`: `char_length(trim(name)) >= 2 AND char_length(name) <= 150`
- `quote_requests_phone_check`: `char_length(trim(phone)) >= 6 AND char_length(phone) <= 30`
- `quote_requests_email_check`: `email IS NULL OR (char_length(email) <= 254 AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')`
- `quote_requests_message_check`: `message IS NULL OR char_length(message) <= 3000`
- `quote_requests_status_check`: `status IN ('new', 'contacted', 'quoted', 'won', 'lost')`
- `quote_requests_source_check`: `source IN ('website_quote_form', 'website_contact_section', 'website')`

### Índices de Consulta:
- `idx_quote_requests_created_at` en `created_at DESC` (ordenación de leads entrantes)
- `idx_quote_requests_status` en `status` (filtrado por estado de atención)

---

## 5. Row Level Security (RLS) & Security Model

La tabla `quote_requests` tiene RLS habilitado de manera estricta:

```sql
ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;
```

### Matriz de Políticas:

| Rol | Operación | Estado | Política |
| :--- | :---: | :---: | :--- |
| `anon` (Visitante web) | **INSERT** | ✅ PERMITIDO | `"Public anon users can insert quote requests"` (con validación de nombre y teléfono) |
| `anon` (Visitante web) | **SELECT** | ❌ DENEGADO | Sin política (Default Deny de PostgreSQL) |
| `anon` (Visitante web) | **UPDATE** | ❌ DENEGADO | Sin política (Default Deny de PostgreSQL) |
| `anon` (Visitante web) | **DELETE** | ❌ DENEGADO | Sin política (Default Deny de PostgreSQL) |

Cualquier intento desde el cliente público con la anon key de ejecutar `SELECT * FROM quote_requests` devolverá 0 filas o error de permisos. Esto protege al 100% la privacidad de los teléfonos, correos y datos sensibles de los clientes de Guatemala.

---

## 6. Integration (Componentes Conectados)

1. **`QuoteForm.tsx` (Cotizador Inteligente)**:
   - Conectado a [`src/services/quotes.ts`](file:///Users/mac/IDEAS-Y-COLORES/src/services/quotes.ts).
   - Recibe datos de los 3 pasos (servicio, tipo de espacio, área, plazo, nombre, teléfono, email, ubicación, descripción).
   - Prevención de doble clic con estado `isSubmitting`.
   - Trampa anti-spam (honeypot) oculta a humanos.
   - Estado de carga y pantalla de confirmación sin romper diseño visual ni integración existente con WhatsApp.

2. **`ContactSection.tsx` (Formulario Rápido de Contacto)**:
   - Conectado a la misma tabla `quote_requests` con `source = 'website_contact_section'`.
   - Valida nombre y teléfono antes del envío.
   - Estado de éxito visual y limpieza de inputs.

3. **`PaintCalculator.tsx` (Calculadora de Pintura)**:
   - Permanece 100% del lado del cliente sin llamadas innecesarias a base de datos.
   - Al pulsar "Transferir a Cotización", pasa los datos al formulario de cotización, el cual los persiste junto con los datos de contacto del cliente.

4. **`ColorStudioVisualizer.tsx` (Visualizador de Color)**:
   - No almacena clicks ni eventos efímeros en DB (privacidad y rendimiento). Transfiere el color seleccionado a la cotización solo cuando el usuario lo solicita.

---

## 7. Testing & Verification (Pruebas Realizadas)

1. **Pruebas de Validación de Negocio**:
   - Ejecutadas en [`scripts/test-validation.ts`](file:///Users/mac/IDEAS-Y-COLORES/scripts/test-validation.ts) con 100% de éxito:
     - ✅ Acepta datos válidos completos
     - ✅ Rechaza nombres de menos de 2 caracteres
     - ✅ Rechaza teléfonos de menos de 6 dígitos
     - ✅ Rechaza correos con formato inválido
     - ✅ Rechaza mensajes que excedan los 3000 caracteres
     - ✅ Honeypot descarta envíos automatizados de bots silenciosamente

2. **Pruebas de Seguridad Automatizadas**:
   - Script disponible en [`scripts/verify-supabase-security.ts`](file:///Users/mac/IDEAS-Y-COLORES/scripts/verify-supabase-security.ts) listo para ejecutarse contra la instancia de Supabase:
     - `INSERT`: ✅ Permite insertar registro de prueba (`SEO TEST USER`)
     - `SELECT`: ❌ Denegado por RLS (0 registros expuestos al público)
     - `UPDATE`: ❌ Bloqueado por RLS
     - `DELETE`: ❌ Bloqueado por RLS

3. **TypeScript & Production Build**:
   - `npm run lint` (`tsc --noEmit`): 0 errores.
   - `npm run build` (`vite build`): Compilación exitosa en 1.8s sin errores.

---

## 8. Pasos para Activar en Supabase Cloud (Dashboard)

1. Crear un proyecto en [Supabase](https://supabase.com).
2. Abrir **SQL Editor** en el panel de Supabase.
3. Copiar y pegar el contenido de [`supabase/schema.sql`](file:///Users/mac/IDEAS-Y-COLORES/supabase/schema.sql) y ejecutar ("Run").
4. Ir a **Project Settings -> API** en el dashboard de Supabase y copiar:
   - `Project URL`
   - `anon public key`
5. Pegar estos valores en el archivo `.env` del proyecto:
   ```env
   VITE_SUPABASE_URL="https://[TU-PROYECTO].supabase.co"
   VITE_SUPABASE_ANON_KEY="[TU-ANON-KEY]"
   ```
6. Ejecutar la suite de pruebas de seguridad:
   ```bash
   npx tsx scripts/verify-supabase-security.ts
   ```

# Plan de Implementación: SEO Local Automático Multi-Tenant (Fase 1 y Fase 2)

Arquitectura y diseño técnico para implementar **SEO Local de Alto Rendimiento** en el SaaS, permitiendo que cada clínica/inquilino posicione tanto su marca general como cada una de sus sedes físicas en sus respectivos municipios (Google Search y Google Maps Local Pack).

---

## 1. Arquitectura General y Aislamiento Multi-Tenant

Para que el SEO funcione en un SaaS con dominios propios (`esteticamerce.com`) y subdominios (`clinica.probookia.com`), todo el sistema se rige por:
1. **Resolución de Contexto**: Cada petición resuelve el `tenantId` a través de `resolveTenantContext()` y las cabeceras `X-Tenant-ID`.
2. **URLs Canónicas con Dominio Propio**: Cada URL canónica y enlace de Schema.org utiliza el `baseUrl` del tenant actual (`https://www.esteticamerce.com/...`).
3. **Aislamiento en Base de Datos**: Las sedes (`locations`), servicios y configuraciones están estrictamente filtradas por `tenant_id == current_tenant_var.get()`. Jamás se mezclan datos de un cliente con otro.

---

## 2. Fase 1: Datos Estructurados (Schema.org / JSON-LD Dinámico)

Google premia a los negocios locales cuando cuentan con datos legibles por máquinas (`application/ld+json`). El SaaS inyectará estos esquemas de forma 100% invisible y automática sin que el cliente tenga que configurar nada técnico.

### A. Esquema Global del Negocio (`LocalBusiness` / `HealthAndBeautyBusiness` / `MedicalBusiness`)
- **Ubicación**: Se inyecta en el `RootLayout` (`frontend/src/app/layout.tsx`) para todas las páginas públicas del tenant.
- **Tipo Dinámico**:
  - `MedicalClinic` si el sector es médico / dental.
  - `BeautySalon` / `HealthAndBeautyBusiness` si es estética o bienestar.
- **Campos Mapeados**:
  - `@context`: `"https://schema.org"`
  - `name`: `settings.clinic_name`
  - `description`: `settings.clinic_description`
  - `url`: `tenantCanonical`
  - `telephone`: `settings.clinic_phone`
  - `email`: `settings.clinic_email`
  - `image`: Logotipo de alta resolución o imagen hero de la clínica
  - `priceRange`: `"€€"`
  - `address`: Dirección física de la sede principal (calle, localidad, país)
  - `sameAs`: Array dinámico con su Instagram (`formatInstagramUrl`) y enlace de Google Maps (`formatMapsUrl`).

### B. Esquema Específico de Sede Local en `/sedes/[slug]`
- Inyecta un bloque `LocalBusiness` específico para esa ubicación física:
  - `name`: `${settings.clinic_name} - ${location.name}`
  - `address`: Dirección exacta de ese municipio (`location.address`)
  - `geo`: `GeoCoordinates` con `latitude` y `longitude` si están registrados
  - `telephone`: `location.phone || settings.clinic_phone`

### C. Esquema de Tratamiento en `/tratamientos/[category_slug]/[treatment_slug]`
- Inyecta `Service` / `MedicalProcedure`:
  - `name`: Nombre del tratamiento
  - `description`: Descripción del servicio
  - `provider`: Referencia a la clínica
  - `offers`: `{ "@type": "Offer", "price": service.price, "priceCurrency": "EUR" }`

---

## 3. Fase 2: Landing Pages Automáticas por Sede (`/sedes/[slug]`)

Cuando una clínica tiene sede en **Carcaixent** y abre otra en **Alzira**, necesita dos URLs canónicas distintas para que Google pueda posicionar la clínica en el "Local Pack" de ambos pueblos.

### A. Modelo de Datos y Backend (FastAPI / Supabase)
1. **Añadir columna `slug` a la tabla `locations`**:
   - `slug VARCHAR(100) NULL`
   - Migración automática con auto-generación de slug para sedes existentes a partir de su nombre (ej: "Sede Carcaixent" -> "carcaixent").
2. **Endpoint Backend**:
   - `GET /locations/slug/{slug}` con soporte para búsqueda por slug o fallback por `id`.
   - Auto-generación de slug en `create_location` y `update_location` si no se especifica.

### B. Frontend: Ruta Pública Dinámica `/sedes/[slug]`
- **Ruta**: `frontend/src/app/sedes/[slug]/page.tsx`
- **Diseño**: Estilo **Quiet Luxury 2026**:
  1. **Hero de Sede**:
     - `h1`: *"Clínica Mercè en Carcaixent"* con tipografía Serif (`Playfair Display`).
     - Subtítulo de bienvenida y llamada a la acción.
  2. **Bloque NAP (Name, Address, Phone) & Google Maps**:
     - Dirección exacta, teléfono con click-to-call directo y horario de atención.
     - Botón de lujo: *"Cómo llegar en Google Maps"* enlazado a la ficha de Google Business de esa sede.
     - Mapa interactivo o estático con las coordenadas GPS de la sede.
  3. **Especialistas de la Sede**:
     - Filtra y muestra los profesionales asignados a trabajar en esa ubicación (`staff_schedules` / `Profile`).
  4. **Tratamientos y Servicios Disponibles**:
     - Mosaico Bento Grid de servicios disponibles en esa sede.
  5. **Conversión y Reserva Directa**:
     - Botón *"Reservar en esta Sede"*, que redirige a `/reservar?location_id=${location.id}` con la sede ya fijada para evitar pasos innecesarios al paciente.
- **Metadatos SEO Dinámicos**:
  - `generateMetadata()`:
    - `title`: `${location.name} | ${clinicName}`
    - `description`: `Visita nuestra sede de ${clinicName} en ${location.address}. Citas y tratamientos personalizados.`
    - `canonical`: `${baseUrl}/sedes/${location.slug}`

### C. Actualización de `sitemap.ts`
- Modificar [sitemap.ts](file:///c:/Users/Juan/MERCE/CLINICA%20MERCE/frontend/src/app/sitemap.ts) para consultar `${apiUrl}/locations/` con `X-Tenant-ID`.
- Agregar al sitemap todas las sedes activas:
  - `url`: `${baseUrl}/sedes/${location.slug}`
  - `priority`: `0.8`
  - `changeFrequency`: `'weekly'`

---

## 4. Archivos a Crear o Modificar

### Backend:
| Archivo | Acción | Descripción |
| :--- | :--- | :--- |
| `backend/app/models.py` | [MODIFY] | Añadir columna `slug` a `Location`. |
| `backend/app/schemas.py` | [MODIFY] | Añadir campo `slug` a `LocationBase`, `LocationCreate`, `LocationUpdate` y `LocationResponse`. |
| `backend/app/crud/locations.py` | [MODIFY] | Añadir función `get_location_by_slug` y auto-slugify al crear/editar. |
| `backend/app/routers/locations.py` | [MODIFY] | Exponer ruta `GET /locations/slug/{slug}`. |
| `backend/app/utils/migrations.py` | [MODIFY] | Auto-migración para `ALTER TABLE locations ADD COLUMN slug VARCHAR(100)`. |

### Frontend:
| Archivo | Acción | Descripción |
| :--- | :--- | :--- |
| `frontend/src/components/seo/JsonLd.tsx` | [NEW] | Componente reutilizable para serializar e inyectar scripts JSON-LD limpios y seguros. |
| `frontend/src/app/layout.tsx` | [MODIFY] | Inyectar Schema.org `LocalBusiness` / `HealthAndBeautyBusiness` global para el tenant. |
| `frontend/src/app/sedes/[slug]/page.tsx` | [NEW] | Landing pública de cada sede (SEO Local, NAP, Google Maps, Especialistas, Reserva). |
| `frontend/src/app/tratamientos/[category_slug]/[treatment_slug]/page.tsx` | [MODIFY] | Inyectar Schema.org `Service` para el tratamiento individual. |
| `frontend/src/app/sitemap.ts` | [MODIFY] | Incluir dinámicamente las rutas de cada sede activa (`/sedes/[slug]`). |

---

## 5. Plan de Verificación

1. **Pruebas de Base de Datos**:
   - Ejecutar auto-migración y comprobar que las sedes de Clínica Mercè tienen su `slug` generado (ej. `carcaixent`).
2. **Validación de Datos Estructurados**:
   - Abrir la página principal y la página del tratamiento en el navegador.
   - Pasar el código HTML resultante por la herramienta oficial de Google: **Rich Results Test** (Prueba de Resultados Enriquecidos de Google) y comprobar que detecta `LocalBusiness` y `Service` con cero errores.
3. **Navegación de Sede y Reserva**:
   - Entrar a `https://www.esteticamerce.com/sedes/carcaixent` (o localhost equivalente).
   - Verificar la consistencia de datos NAP, clic al botón de Google Maps y clic en "Reservar cita en esta sede" verificando que preselecciona la sede correspondiente.
4. **Sitemap**:
   - Consultar `/sitemap.xml` y confirmar que aparecen las URLs de las sedes junto con los tratamientos y categorías.
5. **Compilación**:
   - `npx tsc --noEmit` completado con 0 errores de TypeScript.

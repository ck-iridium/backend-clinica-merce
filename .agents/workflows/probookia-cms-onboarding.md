# /probookia-cms-onboarding

> **Plan Maestro: ProBookia CMS Modular & Onboarding Engine**
> Estado: ✅ Implementado (commits `92eae66`, `e4c892c`, `3df0946`). Usar este workflow para continuar la Fase 2 o depurar regresiones.

---

## Contexto y Objetivo

Transformar el frontend público y la configuración inicial de ProBookia en una solución **modular y dinámica** bajo RLS multi-tenant, eliminando hardcodes (ej. menú fijo con 'Contado', nombre 'Clínica Mercè' quemado).

---

## 1. Modelo de Datos (Supabase / Postgres) ✅ COMPLETADO

### 1.1 Tabla: `site_navigation` (Navegación Dinámica)
Controla los elementos del Navbar público. Fallback automático a Inicio/Servicios/Contacto si está vacía.

```sql
CREATE TABLE IF NOT EXISTS site_navigation (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    label VARCHAR(100) NOT NULL,
    path VARCHAR(255) NOT NULL,
    is_visible BOOLEAN DEFAULT true,
    order_index INT DEFAULT 0,
    is_custom BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT timezone('utc', now())
);
ALTER TABLE site_navigation ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_site_navigation ON site_navigation
FOR ALL USING (tenant_id = current_setting('app.current_tenant_id', true));
```

### 1.2 Extensión: `clinic_settings` (Tokens de Diseño + Estado Onboarding)

```sql
ALTER TABLE clinic_settings 
ADD COLUMN IF NOT EXISTS branding_font_headings VARCHAR(100) DEFAULT 'Playfair Display',
ADD COLUMN IF NOT EXISTS branding_font_body VARCHAR(100) DEFAULT 'Inter',
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS theme_palette VARCHAR(50) DEFAULT 'charcoal-gold';
```

> **CRÍTICO**: Para desbloquear el Wizard del Onboarding en un tenant existente, ejecutar en Supabase:
> ```sql
> UPDATE clinic_settings SET onboarding_completed = true WHERE tenant_id = '<TENANT_UUID>';
> ```

### 1.3 Tabla: `site_blocks` (Constructor Dinámico de Bloques)

```sql
CREATE TABLE IF NOT EXISTS site_blocks (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    page_slug VARCHAR(100) DEFAULT 'home',
    block_type VARCHAR(50) NOT NULL, -- 'hero_luxury', 'bento_grid', 'slider_cards', 'faq_accordion'
    content_data JSONB NOT NULL,
    order_index INT DEFAULT 0,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT timezone('utc', now())
);
ALTER TABLE site_blocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_site_blocks ON site_blocks
FOR ALL USING (tenant_id = current_setting('app.current_tenant_id', true));
```

---

## 2. Capa Backend (FastAPI Routers) ✅ COMPLETADO

### Archivos clave:
- `backend/app/routers/cms.py` — Endpoints de navegación y bloques
- `backend/app/routers/onboarding.py` — Setup masivo inicial
- `backend/app/schemas.py` — Schemas Pydantic

### Endpoints implementados:

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/cms/navigation` | Navegación del tenant (con fallback automático) |
| POST | `/cms/navigation/reorder` | Reordenar elementos del menú |
| PUT | `/cms/navigation/{id}` | Editar etiqueta/visibilidad de un ítem |
| GET | `/cms/blocks/{page_slug}` | Bloques de una página (con fallback a maqueta por defecto) |
| POST | `/onboarding/setup` | Configuración masiva + inyección de datos de muestra |

### Schemas Pydantic:

```python
class NavigationItemBase(BaseModel):
    label: str; path: str; is_visible: bool = True; order_index: int = 0; is_custom: bool = False

class SiteBlockBase(BaseModel):
    page_slug: str = "home"; block_type: str; content_data: Dict[str, Any]; order_index: int = 0

class OnboardingSetupRequest(BaseModel):
    clinic_name: str; logo_app_b64: Optional[str] = None
    industry: str  # 'Estética y Bienestar' | 'Medicina Estética' | 'Clínicas de Salud' | 'Salones y Barberías'
    open_time: str = "09:00"; close_time: str = "19:00"
    working_days: List[int] = [1,2,3,4,5]; load_demo_data: bool = True
```

---

## 3. Capa Frontend (Next.js) ✅ COMPLETADO

### Archivos clave:
- `frontend/src/app/page.tsx` — Fetch de blocks desde `/cms/blocks/home`
- `frontend/src/app/ClientHome.tsx` — Dynamic Block Engine (motor de renderizado)
- `frontend/src/components/PublicNavbar.tsx` — Navbar dinámico desde `/cms/navigation`
- `frontend/src/components/blocks/HeroLuxury.tsx`
- `frontend/src/components/blocks/BentoGridServices.tsx`
- `frontend/src/components/blocks/SliderCardsServices.tsx`
- `frontend/src/components/blocks/FaqAccordion.tsx`

### Dynamic Block Engine (lógica en `ClientHome.tsx`):
```typescript
const BLOCK_COMPONENTS: Record<string, React.FC<any>> = {
  hero_luxury: HeroLuxury,
  bento_grid: BentoGridServices,
  slider_cards: SliderCardsServices,
  faq_accordion: FaqAccordion,
};
// Si blocks.length > 0 → Motor CMS dinámico
// Si blocks está vacío → Fallback heredado (secciones estáticas de site_content)
```

---

## 4. Onboarding Wizard ✅ COMPLETADO

### Flujo:
1. **Interceptor** (`OnboardingGuard.tsx`): Montado en `dashboard/layout.tsx`. Si `settings.onboarding_completed === false` → redirige a `/dashboard/onboarding`.
2. **Página Wizard** (`/dashboard/(fullscreen)/onboarding/page.tsx`): 3 pasos.
   - Paso 1: Identidad Corporativa (nombre, sector, logo)
   - Paso 2: Horarios y días operativos
   - Paso 3: Aprovisionamiento de catálogo demo inteligente por sector

### Para saltarse el Wizard (entorno dev/debug):
```sql
-- En Supabase SQL Editor:
UPDATE clinic_settings SET onboarding_completed = true WHERE tenant_id = '00000000-0000-0000-0000-000000000001';
```

---

## 5. AI Webmaster Agent (Plan Gold) — PENDIENTE

Registrar esquemas JSON en `backend/app/routers/ai.py` para Gemini Function Calling:

| Función | Descripción |
|---------|-------------|
| `edit_navigation_label` | Renombrar un ítem del menú |
| `toggle_section_visibility` | Ocultar/mostrar una sección |
| `update_site_typography` | Cambiar tokens de tipografía del tenant |
| `change_block_layout` | Cambiar el tipo de bloque de una página |

**Requisito de seguridad**: Blindar con interceptor JWT para validar `tenant_id` antes de ejecutar cualquier función.

---

## Diagnóstico Rápido de Errores Comunes

| Síntoma | Causa | Solución |
|---------|-------|----------|
| Admin bloqueado en /onboarding | `onboarding_completed = false` en DB | `UPDATE clinic_settings SET onboarding_completed = true WHERE tenant_id = '...'` |
| Home muestra fallback estático | `site_blocks` vacío + `/cms/blocks/home` devuelve `[]` | Revisar que las columnas nuevas de `clinic_settings` existen. Correr migración SQL. |
| Navbar duplicado | `PublicNavbar` montado dos veces (ej. dentro del Hero Y en el sticky div) | En `ClientHome.tsx` el Navbar solo debe estar en el `div` sticky exterior, NO dentro de `section.hero` |
| `/cms/blocks/home` retorna 400 | Falta cabecera `X-Tenant-ID` | Verificar middleware Next.js y que el tenant default está configurado |

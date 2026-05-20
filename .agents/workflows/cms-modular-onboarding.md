---
description: 
---

# WORKFLOW DEFINITIVO: ProBookia CMS Modular, Onboarding Engine & AI Builder (Plan Gold)

Este workflow detalla el plan maestro para la implementación y mantenimiento del motor de CMS modular, el asistente de Onboarding y el constructor de páginas adicionales por IA en la plataforma ProBookia, protegiendo la estructura fija de la Home principal.

## 1. Modelo de Datos y Migración SQL (Supabase / Postgres)

### 1.1 Nueva Tabla: `site_navigation` (Navegación Dinámica)

Esta tabla controla los elementos del Navbar público de forma dinámica por Tenant. Permite anexar tanto los menús base como las páginas adicionales que cree el usuario.

```sql
CREATE TABLE IF NOT EXISTS site_navigation (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    label VARCHAR(100) NOT NULL, -- 'Inicio', 'Servicios', 'Contacto' o el título de la página nueva
    path VARCHAR(255) NOT NULL, -- '/' para Inicio, '/[slug]' para páginas adicionales
    is_visible BOOLEAN DEFAULT true,
    order_index INT DEFAULT 0,
    is_custom BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT timezone('utc', now())
);

-- Habilitar RLS obligatoriamente
ALTER TABLE site_navigation ENABLE ROW LEVEL SECURITY;

-- Crear política de aislamiento por Tenant
CREATE POLICY tenant_isolation_site_navigation ON site_navigation
FOR ALL USING (tenant_id = current_setting('app.current_tenant_id', true));

```

### 1.2 Extensión de `clinic_settings` (Tokens de Diseño y Estado Onboarding)

```sql
ALTER TABLE clinic_settings 
ADD COLUMN IF NOT EXISTS branding_font_headings VARCHAR(100) DEFAULT 'Playfair Display',
ADD COLUMN IF NOT EXISTS branding_font_body VARCHAR(100) DEFAULT 'Inter',
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS theme_palette VARCHAR(50) DEFAULT 'charcoal-gold';

```

### 1.3 Nueva Tabla: `site_blocks` (Constructor de Bloques de Páginas Adicionales)

```sql
CREATE TABLE IF NOT EXISTS site_blocks (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    page_slug VARCHAR(100) NOT NULL, -- El slug de la página adicional (NUNCA 'home')
    block_type VARCHAR(50) NOT NULL, -- 'text_image_cta', 'title_heading', 'categories_grid'
    content_data JSONB NOT NULL,
    order_index INT DEFAULT 0,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT timezone('utc', now())
);

-- Habilitar RLS obligatoriamente
ALTER TABLE site_blocks ENABLE ROW LEVEL SECURITY;

-- Crear política de aislamiento por Tenant
CREATE POLICY tenant_isolation_site_blocks ON site_blocks
FOR ALL USING (tenant_id = current_setting('app.current_tenant_id', true));

```

> [!NOTE]
> **Nota Estructural (Bloque Libre `text_image_cta`):** Para el "Mini Elementor" de las páginas adicionales, el campo `content_data` debe soportar este esquema JSON flexible:
> `{"title": "...", "title_tag": "h2", "description": "...", "image_url": "...", "image_position": "left" | "right", "cta_button": {"text": "...", "url": "...", "style": "gold_outline"}}`

---

## 2. Capa Backend (FastAPI Routers)

### 2.1 Esquemas Pydantic (`schemas.py`)

```python
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

# Navegación
class NavigationItemBase(BaseModel):
    label: str
    path: str
    is_visible: bool = True
    order_index: int = 0
    is_custom: bool = False

class NavigationItemOut(NavigationItemBase):
    id: str
    tenant_id: str

    class Config:
        from_attributes = True

class NavigationReorderRequest(BaseModel):
    ids: List[str]

class NavigationUpdateRequest(BaseModel):
    label: Optional[str] = None
    is_visible: Optional[bool] = None

# Bloques Modulares para Páginas Adicionales
class SiteBlockBase(BaseModel):
    page_slug: str
    block_type: str
    content_data: Dict[str, Any]
    order_index: int = 0

class SiteBlockOut(SiteBlockBase):
    id: str
    tenant_id: str

    class Config:
        from_attributes = True

# Asistente de Onboarding
class OnboardingSetupRequest(BaseModel):
    clinic_name: str
    logo_app_b64: Optional[str] = None
    industry: str = Field(..., description="Estética y Bienestar, Medicina Estética, Clínicas de Salud, Salones y Barberías")
    open_time: str = "09:00"
    close_time: str = "19:00"
    working_days: List[int] = [1, 2, 3, 4, 5]
    load_demo_data: bool = True

```

### 2.2 Endpoints FastAPI a Implementar

* **Router `/cms**`:
* `GET /cms/navigation` (Retorna el menú dinámico inyectando automáticamente 'Inicio', 'Servicios' y 'Contacto' si está vacío).
* `POST /cms/navigation/reorder` (Permite mover el orden de las pestañas).
* `PUT /cms/navigation/{id}` (Cambia visibilidad o nombres).
* `GET /cms/blocks/{page_slug}` (Trae los bloques del mini Elementor de una página concreta).


* **Router `/onboarding**`:
* `POST /onboarding/setup` (Configura la cuenta de la clínica, marca `onboarding_completed = true` e inyecta los datos muestra).



---

## 3. Capa Frontend (Next.js, Tailwind & Framer Motion)

### 3.1 Navbar Público Dinámico

Componente `Navbar.tsx` (o `PublicNavbar.tsx`) adaptado para consumir el endpoint `/cms/navigation`. Genera los enlaces de forma reactiva, permitiendo que las nuevas páginas construidas aparezcan en el Header junto a las secciones base.

### 3.2 Dynamic Block Engine para Páginas Adicionales (El Mini Elementor)

Estructura de renderizado dinámico ubicada en la ruta dinámica de Next.js para páginas personalizadas (ej: `frontend/src/app/[slug]/page.tsx`).

> [!CAUTION]
> **REGLA DE AISLAMIENTO ABSOLUTO (PROHIBIDO TOCAR LA PORTADA):**
> 1. El archivo de la Home de la clínica (`frontend/src/app/ClientHome.tsx`) **NO UTILIZA este motor de bloques**. La Home mantiene intacto su formulario estructurado actual: **Hero + Sobre mi + Categorías + CTA**. El agente de IA tiene estrictamente prohibido modificar o interferir con el archivo de la Home.
> 2. Este iterador se ejecuta **ÚNICAMENTE** en las nuevas páginas adicionales secundarias creadas por el usuario.
> 
> 

```typescript
import FlexCustomBlock from '@/components/blocks/FlexCustomBlock';   // Texto + Imagen + Botón (Mini Elementor)
import TitleHeadingBlock from '@/components/blocks/TitleHeadingBlock'; // Bloque simple de Título
import CategoriesGridBlock from '@/components/blocks/CategoriesGridBlock'; // Bloque inyector de Tratamientos

const CUSTOM_BLOCK_COMPONENTS: Record<string, React.FC<any>> = {
  text_image_cta: FlexCustomBlock,
  title_heading: TitleHeadingBlock,
  categories_grid: CategoriesGridBlock,
};

export default function RenderCustomBlocks({ blocks, services }: { blocks: any[], services: any[] }) {
  return (
    <div className="flex flex-col w-full min-h-screen bg-[#F5F2EE]">
      {blocks && blocks.length > 0 ? (
        blocks.map((block) => {
          const Component = CUSTOM_BLOCK_COMPONENTS[block.block_type];
          if (!Component) return null;
          
          return (
            <section key={block.id} className="w-full transition-all duration-300">
              <Component data={block.content_data} services={services} />
            </section>
          );
        })
      ) : (
        // Estado por defecto si el administrador crea una página pero aún no le añade bloques
        <div className="py-20 text-center text-stone-400 font-sans">
          Esta página personalizada está lista. Añade bloques de contenido desde el panel de control.
        </div>
      )}
    </div>
  );
}

```

---

## 4. Asistente de Configuración Inicial (Onboarding Wizard)

* **Interceptor Global**: Si `onboarding_completed === false`, redirige al administrador a `/dashboard/onboarding`.
* **Pasos**: 1. Identidad Corporativa, 2. Horarios y Calendario, 3. Aprovisionamiento de datos demo.

---

## 5. Infraestructura AI Webmaster Agent (Plan Gold)

Registro de esquemas JSON en `backend/app/routers/ai.py` para Gemini (Function Calling) blindado bajo validación estricta de `tenant_id`. Las herramientas permiten al chat gestionar el sitio y construir las páginas sin comprometer la Home:

### Gestión de Estructura y Menú:

* `edit_navigation_label(id, new_label)` -> Renombra enlaces del Header.
* `toggle_section_visibility(id, is_visible)` -> Muestra/oculta pestañas del menú.
* `update_site_typography(headings_font, body_font)` -> Modifica fuentes de la clínica.

### El AI Builder (Para Páginas Nuevas):

* `add_new_page(slug, title)` -> Inserta una nueva ruta dinámica en el sistema y crea su correspondiente enlace en la tabla `site_navigation` para que aparezca en el Header.
* `insert_site_block(page_slug, block_type, content_data)` -> Permite a la IA maquetar e inyectar los micro-bloques del mini Elementor (`text_image_cta`, `title_heading`) dentro de la página adicional que el usuario esté editando por chat.
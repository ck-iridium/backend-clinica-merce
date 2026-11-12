# Manual de Ayuda: Contenido, Redacción y Traducciones Multi-idioma

Este manual sirve como la fuente de verdad técnica y operativa (RAG) para guiar al usuario en la gestión de traducciones, redacción comercial con IA y salud del catálogo.

## 1. Reglas de Negocio y Ubicación Oficial
- **Ubicación Exclusiva:** Las traducciones y la redacción comercial del catálogo de la clínica se encuentran **ÚNICAMENTE** en la pestaña **"Contenido & Redacción"** dentro del panel de Ajustes:
  - **Ruta:** `/dashboard/settings?tab=content`
  - **Aclaración Crítica:** Las traducciones del catálogo **NO** están en Información General. Están en `Ajustes > Contenido & Redacción`.
- **Copywriter IA Multi-Idioma Simultáneo:** El motor inteligente genera, sincroniza y traduce las fichas comerciales de servicios y categorías en 3 idiomas simultáneos: **Español (ES)**, **Inglés (EN)** y **Francés (FR)**.
- **Auditoría de Salud de Catálogo:**
  - **Salud de Contenidos (100% Riqueza comercial):** Porcentaje de optimización global.
  - **Thin Content / Vacíos:** Entidades sin descripción comercial enriquecida.
  - **Sin HTML Detallado:** Servicios que carecen de cuerpo estructurado en HTML.
  - **Contenido Óptimo:** Fichas que cumplen con los más altos estándares comerciales y de SEO.

## 2. Seguridad y Permisos (RBAC)
- **Administrador:** Acceso total de lectura, ejecución de auditorías, redacción con IA y persistencia de traducciones.
- **Recepción:** Bloqueado (no tiene acceso al módulo de Ajustes).
- **Especialista:** Bloqueado (no tiene acceso al módulo de Ajustes).

## 3. Acciones y Coordenadas (Selectores CSS e IDs)
Para guiar visualmente al usuario y activar tooltips de navegación asistida en `/dashboard/settings?tab=content`:

### Navegación y Pestaña Principal
- Botón pestaña Contenido en menú lateral de Ajustes: `id="settings-tab-btn-content"`
- Selector de Idioma de visualización del catálogo (ES / EN / FR): `id="content-tab-language-selector"`
  - Botón Español: `id="content-tab-lang-btn-es"`
  - Botón Inglés: `id="content-tab-lang-btn-en"`
  - Botón Francés: `id="content-tab-lang-btn-fr"`

### Acciones de Auditoría y Redacción Masiva
- Botón Re-escanear catálogo: `id="content-tab-rescan-btn"`
- Botón Redactar Pendientes (Generación IA): `id="content-tab-generate-btn"`

### Filtros y Búsqueda
- Campo de búsqueda de servicios y categorías: `id="content-filter-search-input"`

## 4. Respuestas Frecuentes del Asistente
- **¿Dónde están las traducciones?:** "Para gestionar las traducciones de tu catálogo y redactar textos en múltiples idiomas, dirígete a **Ajustes > Contenido & Redacción** (`/dashboard/settings?tab=content`). Desde allí, el Copywriter IA genera y mantiene sincronizadas las descripciones de todos tus tratamientos en Español, Inglés y Francés simultáneamente. [NAVIGATE: /dashboard/settings?tab=content&hint=content-tab-language-selector]"
- **¿Cómo traducir un servicio o categoría?:** "En **Ajustes > Contenido & Redacción** (`/dashboard/settings?tab=content`), pulsa el botón 'Redactar' de la ficha deseada o 'Redactar pendientes' para que la IA cree las versiones en Español, Inglés y Francés de forma automática en 1 clic. [NAVIGATE: /dashboard/settings?tab=content&hint=content-tab-generate-btn]"


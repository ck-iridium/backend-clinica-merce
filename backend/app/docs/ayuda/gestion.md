# Manual de Ayuda: Gestión Interna (Equipo, Sedes, Servicios y Mi Horario)

Este manual sirve como la única fuente de verdad (RAG) para guiar al usuario en el uso de los módulos de Gestión (Equipo, Sedes y Servicios) y el planificador personal "Mi Horario".

---

## 1. Módulo: Equipo y Horarios (`/dashboard/team`)

### Reglas de Negocio
Permite administrar la plantilla de profesionales de la clínica:
- **Invitaciones por Correo y Multi-idioma:** Envío de enlaces de activación a nuevos miembros especificando su rol. El correo se envía automáticamente en el idioma activo del usuario/panel (Español, Francés o Inglés) utilizando la plantilla institucional de ProBookia con estética Quiet Luxury y el remitente oficial de notificaciones.
- **Aislamiento Multi-Tenant Estricto:** Cada invitación está anclada exclusivamente al negocio emisor y a su subdominio (`[tenant].probookia.com`). Si un usuario no ha sido explícitamente invitado y no figura como 'Pendiente' en la lista de miembros de ese negocio, el sistema deniega tajantemente la activación de la cuenta y el acceso al panel. Un mismo usuario puede pertenecer a varios negocios, pero sus credenciales, estados ('Pendiente'/'Activo') y roles permanecen estrictamente aislados por negocio.
- **Asignación de Roles:** Administrar y cambiar los permisos (Administrador, Recepción, Especialista).
- **Planificador de Turnos (Rostering):** Configuración individual de turnos recurrentes semanales y excepciones puntuales (festivos, bajas, guardias) asociándolos a sucursales físicas.

### Seguridad (RBAC)
- **Administrador:** Acceso y control total. Único con permisos para invitar, editar roles, eliminar personal y definir cuadrantes de turnos de todo el equipo.
- **Recepción / Especialista:** Acceso denegado a la lista general del equipo. Nunca pueden invitar ni gestionar personal.

### Acciones y Coordenadas (Selectores CSS)
- **Invitar Miembro del Equipo:** Abre el modal de registro de personal.
  - Selector: `id="team-add-member-btn"`
- **Formulario de Invitación (Modal):**
  - Nombre completo: `id="team-invite-name-input"`
  - Correo electrónico: `id="team-invite-email-input"`
  - Selector de Rol: `id="team-invite-role-trigger"`
  - Cancelar: `id="team-invite-cancel-btn"`
  - Enviar Invitación: `id="team-invite-submit-btn"`
- **Acciones en Tabla de Personal (por profesional):**
  - Configurar cuadrante de turnos del miembro `[id]`: `id="team-roster-btn-[id]"`
  - Editar rol del miembro `[id]`: `id="team-edit-role-btn-[id]"`
  - Eliminar miembro `[id]`: `id="team-delete-member-btn-[id]"`
- **Modal de Edición de Rol (Profesional):**
  - Selector de rol: `id="team-edit-role-trigger"`
  - Cancelar: `id="team-edit-cancel-btn"`
  - Guardar: `id="team-edit-submit-btn"`
- **Formulario de Roster Turnos Semanales (dentro de cuadrante):**
  - Contenedor: `id="roster-weekly-form"`
  - Selector día de la semana: `id="roster-weekly-day-trigger"`
  - Selector de Sede: `id="roster-weekly-location-trigger"`
  - Hora de inicio: `id="roster-weekly-start-input"`
  - Hora de fin: `id="roster-weekly-end-input"`
  - Agregar turno semanal: `id="roster-weekly-submit-btn"`
  - Toggle de activación de turno `[id]`: `id="roster-weekly-toggle-btn-[id]"`
  - Eliminar turno `[id]`: `id="roster-weekly-delete-btn-[id]"`
- **Formulario de Excepciones de Horario / Turno Específico:**
  - Contenedor: `id="roster-exception-form"`
  - Fecha del evento: `id="roster-exception-date-input"`
  - Selector de Sede: `id="roster-exception-location-trigger"`
  - Hora de inicio: `id="roster-exception-start-input"`
  - Hora de fin: `id="roster-exception-end-input"`
  - Agregar excepción: `id="roster-exception-submit-btn"`
  - Toggle de activación de excepción `[id]`: `id="roster-exception-toggle-btn-[id]"`
  - Eliminar excepción `[id]`: `id="roster-exception-delete-btn-[id]"`

---

## 2. Módulo: Mi Horario (`/dashboard/my-schedule`)

### Reglas de Negocio
Permite que cada profesional consulte y gestione sus propios turnos semanales y excepciones horarias de forma directa, sin tener que acceder a la administración global de personal.

### Seguridad (RBAC)
- **Administrador / Especialista:** Acceso completo para editar y autogestionar su propia disponibilidad.
- **Recepción:** Acceso bloqueado.

### Acciones y Coordenadas (Selectores CSS)
Comparte los mismos selectores del planificador de turnos del equipo, aplicados exclusivamente al perfil del usuario autenticado:
- Formulario semanal: `id="roster-weekly-form"`
- Formulario de excepciones: `id="roster-exception-form"`
- (Ver subcomponentes en el bloque de cuadrante del módulo de Equipo).

---

## 3. Módulo: Sedes / Sucursales (`/dashboard/locations`) y SEO Local

### Reglas de Negocio
Permite dar de alta, editar y administrar los centros físicos y sucursales de la clínica con optimización SEO Local automática:
- **Gestión Multi-Sede:** Cada sede cuenta con nombre, slug SEO autogenerado único, dirección postal, teléfono, email y geocoordenadas (latitud/longitud).
- **Autocompletado Inteligente con OpenStreetMap (Nominatim):** Al escribir una dirección, el sistema detecta y preserva el número de portal exacto (ej. `57`) incluso si el mapa no tiene el nodo mapeado, y filtra las redundancias administrativas (barrios, comarcas o comunidades repetidas) para generar un formato postal limpio y profesional español.
- **Geocodificación con Mapa Interactivo (Leaflet):** Selector visual con pin dorado para ajuste milimétrico de la entrada del centro sin sobreescribir la dirección manual.
- **Páginas Públicas de SEO Local (`/sedes` y `/sedes/[slug]`):**
  - **Índice General (`/sedes`):** Listado público de todos los centros físicos activos con información de contacto, horarios y botón directo de reserva.
  - **Landing Individual (`/sedes/[slug]`):** Ficha web pública optimizada para Google con breadcrumbs, mapa interactivo, catálogo de tratamientos prestados y profesionales asignados.
  - **Inyección de Schema.org JSON-LD:** Microdatos estructurados (`HealthAndBeautyBusiness` / `MedicalBusiness`) para posicionamiento orgánico en Google Rich Snippets y Google Maps.
  - **Reserva Pre-filtrada por Sede:** Botón *"Reservar en esta sede"* que abre el flujo `/reservar?location=ID` cargando directamente el centro seleccionado.
- **Sitemap Dinámico:** Las sedes activas se indexan automáticamente en tiempo real en `/sitemap.xml` para Googlebot.

### Seguridad (RBAC)
- **Administrador:** Control completo de altas, bajas, toggles de activación, borrado y modificaciones de sedes.
- **Recepción / Especialista:** Bloqueado de forma absoluta.

### Acciones y Coordenadas (Selectores CSS)
- **Dar de alta Sede:** Abre el modal de creación.
  - Selector: `id="locations-add-btn"`
- **Acciones en Lista de Sedes:**
  - Toggle activar/desactivar sede `[id]`: `id="locations-toggle-status-btn-[id]"`
  - Editar sede `[id]`: `id="locations-edit-btn-[id]"`
  - Eliminar sede `[id]`: `id="locations-delete-btn-[id]"`
- **Formulario de Creación (Modal):**
  - Contenedor: `id="locations-create-form"`
  - Nombre: `id="locations-create-name-input"`
  - Dirección (con autocompletado): `id="locations-create-address-input"`
  - Teléfono: `id="locations-create-phone-input"`
  - Email: `id="locations-create-email-input"`
  - Cancelar: `id="locations-create-cancel-btn"`
  - Enviar/Crear: `id="locations-create-submit-btn"`
- **Formulario de Edición (Modal):**
  - Contenedor: `id="locations-edit-form"`
  - Nombre: `id="locations-edit-name-input"`
  - Dirección: `id="locations-edit-address-input"`
  - Teléfono: `id="locations-edit-phone-input"`
  - Email: `id="locations-edit-email-input"`
  - Cancelar: `id="locations-edit-cancel-btn"`
  - Guardar Cambios: `id="locations-edit-form"` (botón submit)

---

## 4. Módulo: Servicios y Tratamientos (`/dashboard/services`)

### Reglas de Negocio
Catálogo central de tratamientos de la clínica. Permite archivar servicios, cambiar su precio o duración de forma rápida (inline) o acceder al editor enriquecido (CMS/SEO) para modificar la ficha pública del tratamiento.

### Seguridad (RBAC)
- **Administrador:** Acceso completo para editar, añadir categorías, modificar precios y redactar contenido SEO.
- **Recepción / Especialista:** Acceso totalmente bloqueado.

### Acciones y Coordenadas (Selectores CSS)
- **Controles Superiores (Listado):**
  - Mostrar/Ocultar Archivados: `id="services-archived-toggle-btn"`
  - Exportar Catálogo a Galería: `id="services-export-btn"`
  - Gestionar Categorías: `id="services-categories-btn"`
  - Crear Tratamiento Nuevo: `id="services-new-btn"`
  - Buscador de Servicios: `id="services-search-input"`
- **Acciones en Lote (Bulk Actions):**
  - Activar Selección: `id="services-bulk-activate-btn"`
  - Desactivar Selección: `id="services-bulk-deactivate-btn"`
  - Eliminar Selección: `id="services-bulk-delete-btn"`
  - Selector global (Marcar Todos): `id="services-select-all-checkbox"`
- **Edición Inline en Fila de Tabla (por servicio con `[id]`):**
  - Checkbox selección de lote: `id="services-select-checkbox-[id]"`
  - Selector de categoría: `id="services-category-select-[id]"`
  - Input duración (min): `id="services-duration-input-[id]"`
  - Input precio (€): `id="services-price-input-[id]"`
  - Toggle de activación: `id="services-status-toggle-[id]"`
  - Botón editar detalles (CMS): `id="services-edit-details-btn-[id]"`
  - Eliminar tratamiento: `id="services-delete-btn-[id]"`
- **Modal de Categorías de Servicios:**
  - Nueva categoría: `id="services-manage-categories-add-btn"`
  - Guardar cambios de categoría en edición: `id="services-category-edit-submit-btn"`
  - Editar categoría `[id]`: `id="services-category-edit-btn-[id]"`
  - Eliminar categoría `[id]`: `id="services-category-delete-btn-[id]"`
  - **Formulario de Nueva Categoría (Modal):**
    - Contenedor: `id="services-new-category-form"`
    - Nombre categoría: `id="services-new-category-name-input"`
    - Cancelar: `id="services-new-category-cancel-btn"`
    - Crear: `id="services-new-category-submit-btn"`

### Editor Completo de Servicio (CMS/SEO)
- Guardar sin salir: `id="service-editor-save-btn"`
- Guardar y salir: `id="service-editor-save-exit-btn"`
- Cancelar (salir sin guardar): `id="service-editor-cancel-btn"`
- Eliminar Tratamiento: `id="service-editor-delete-btn"`
- **Pestañas de Edición:**
  - Datos Básicos: `id="service-editor-tab-general"`
  - Contenido Enriquecido (TipTap): `id="service-editor-tab-content"`
  - Diseño y Multimedia: `id="service-editor-tab-design"`
  - SEO y Metadatos: `id="service-editor-tab-seo"`
- **Pestaña: General**
  - Nombre: `id="service-editor-general-name-input"`
  - Identificador URL (Slug): `id="service-editor-general-slug-input"`
  - Toggle bloquear/desbloquear slug: `id="service-editor-general-slug-toggle-btn"`
  - Desplegable Categoría: `id="service-editor-general-category-trigger"`
  - Precio: `id="service-editor-general-price-input"`
  - Duración: `id="service-editor-general-duration-input"`
  - Modalidad: `id="service-editor-general-modality-trigger"`
  - Checkbox cobrar fianza Stripe: `id="service-editor-general-deposit-checkbox"`
  - Importe fianza: `id="service-editor-general-deposit-amount-input"`
  - Autogenerar descripción con IA: `id="service-editor-general-ai-desc-btn"`
  - Descripción corta (textarea): `id="service-editor-general-desc-textarea"`
  - Checkbox activo: `id="service-editor-general-active-checkbox"`
- **Pestaña: Contenido**
  - Contenedor TipTap: `id="service-editor-content-tiptap"`
  - Generar desarrollo con IA: `id="service-editor-content-ai-btn"`
- **Pestaña: Diseño**
  - Cambiar Imagen: `id="service-editor-design-change-image-btn"`
  - Quitar Imagen: `id="service-editor-design-remove-image-btn"`
  - Estilo de cabecera: `id="service-editor-design-header-style-trigger"`
  - Selector de color de acento: `id="service-editor-design-color-picker-input"`
- **Pestaña: SEO**
  - Optimizar SEO con IA: `id="service-editor-seo-generate-btn"`
  - Meta título: `id="service-editor-seo-title-input"`
  - Meta descripción: `id="service-editor-seo-desc-textarea"`
  - Palabras clave: `id="service-editor-seo-keywords-input"`

# Manual de Ayuda: Ajustes y Configuración Global

Este manual sirve como la única fuente de verdad (RAG) para guiar al usuario en el uso del panel de Ajustes y Configuración de la clínica.

## 1. Reglas de Negocio
El panel de Ajustes (`/dashboard/settings`) centraliza toda la configuración administrativa, identidad corporativa y pasarelas de pago de la clínica:
- **General:** Nombre de la clínica, NIF, datos de contacto (teléfono, email), descripción legal y URLs de redes sociales y mapas.
- **Identidad (Branding):** Carga del logo de la aplicación, favicon, selector de tipografías, selector de paletas de colores corporativos y redondeado de bordes.
- **Plantillas de Consentimiento:** Creación y modificación del redactado legal de los consentimientos informados que firmarán digitalmente los clientes.
- **Contabilidad y Facturación:** Configuración del prefijo de facturación, el siguiente número consecutivo a emitir, el tipo de IVA por defecto, y la subida de la firma y el logotipo específicos para los folios de factura A4.
- **Pasarela de Pagos (Stripe):** Conexión con Stripe para habilitar cobros en línea de fianzas en reservas web y establecer el margen de cancelación permitida.
- **Servicios a Domicilio:** Gestión del rango de cobertura en kilómetros, la dirección de operaciones y las zonas permitidas.
- **Suscripción:** Gestión del plan actual del tenant (Probookia SaaS) y facturas de suscripción.

## 2. Seguridad (RBAC)
La configuración global es un área sumamente crítica:
- **Administrador:** Acceso total y exclusivo de lectura, escritura y borrado en todas las pestañas de ajustes.
- **Recepción:** Acceso totalmente denegado. No se muestra la pestaña en el menú lateral.
- **Especialista:** Acceso totalmente denegado. No se muestra la pestaña en el menú lateral.

## 3. Acciones y Coordenadas (Selectores CSS)
Para guiar visualmente al usuario y señalar elementos, utiliza la URL `/dashboard/settings` y los siguientes identificadores estables (`id="..."`):

### Pestaña: Información General
- Nombre Clínico: `id="general-clinic-name"`
- Razón Social: `id="general-legal-name"`
- NIF/CIF: `id="general-clinic-nif"`
- Registro Sanitario: `id="general-sanitary-register"`
- Dirección Principal: `id="general-clinic-address"`
- Resumen Breve: `id="general-clinic-description"`
- Teléfono de Contacto: `id="general-clinic-phone"`
- Email Administrativo: `id="general-clinic-email"`
- Enlace Instagram: `id="general-instagram-url"`
- WhatsApp Comercial: `id="general-whatsapp-number"`
- Enlace Google Maps: `id="general-maps-url"`

### Pestaña: Identidad de Marca (Branding)
- Cargar/Cambiar Logo: `id="branding-logo-change-btn"` (Dispara input de archivo `id="branding-logo-file-input"`)
- Quitar Logo: `id="branding-logo-delete-btn"`
- Cargar Favicon: `id="branding-favicon-load-btn"` (Dispara input de archivo `id="branding-favicon-file-input"`)
- Quitar Favicon: `id="branding-favicon-delete-btn"`
- Paletas de Colores Rápidas: `id="branding-palette-btn-[id]"` (ej: `branding-palette-btn-gold`)
- Selectores de Color Personalizados:
  - Color Primario: `id="branding-color-primary-input"`
  - Color Secundario: `id="branding-color-secondary-input"`
- Tipografía de Títulos: `id="branding-font-headings-select"`
- Tipografía del Cuerpo: `id="branding-font-body-select"`
- Estilo de Bordes (Redondeado): `id="branding-border-radius-btn-[value]"` (ej: `branding-border-radius-btn-2xl`)
- Toggle de Modo Oscuro por Defecto: `id="branding-dark-mode-toggle"`

### Pestaña: Plantillas de Consentimientos
- Crear Nueva Plantilla: `id="consents-new-template-btn"`
- Editar Plantilla Existente: `id="consents-edit-btn-[id]"`
- Eliminar Plantilla: `id="consents-delete-btn-[id]"`
- **Formulario del Consentimiento (en edición/creación):**
  - Contenedor: `id="consents-template-form"`
  - Título Legal: `id="consents-title-input"`
  - Cuerpo / Cláusulas: `id="consents-body-textarea"`
  - Volver Atrás: `id="consents-back-btn"`
  - Cancelar Edición: `id="consents-cancel-edit-btn"`
  - Guardar Plantilla: `id="consents-submit-btn"`

### Pestaña: Contabilidad y Facturas
- Prefijo de Facturación: `id="billing-invoice-prefix"`
- Próximo Número Correlativo: `id="billing-invoice-next-number"`
- IVA por Defecto: `id="billing-default-tax-rate"`
- Subir Logo para Factura PDF: `id="billing-logo-pdf-btn"` (Dispara input de archivo `id="billing-logo-pdf-input"`)
- Subir Firma/Cuño para Factura: `id="billing-signature-btn"` (Dispara input de archivo `id="billing-signature-input"`)

### Pestaña: Pasarela de Pagos (Stripe)
- Conectar Cuenta Stripe: `id="payments-connect-stripe-btn"`
- Administrar Cuenta Stripe: `id="payments-manage-stripe-link"`
- Sincronizar Estado Stripe: `id="payments-refresh-status-btn"`
- Desconectar Cuenta: `id="payments-disconnect-btn"`
- Margen de Cancelación de Reserva (en horas): `id="payments-cancellation-margin-input"`
- Habilitar Fianzas Globales: Checkbox `id="payments-global-deposit-checkbox"`
- Importe Fianza por Defecto: `id="payments-global-deposit-amount-input"`

### Pestaña: Agenda (Horario Hábil y Ausencias de la Empresa)
*Esta pestaña sirve para configurar el horario hábil semanal, los días laborables de la clínica y las ausencias anuales prolongadas (vacaciones de verano, Navidad, festivos oficiales de la empresa).*
- Hora Apertura: `id="agenda-open-time"`
- Hora Cierre: `id="agenda-close-time"`
- Inicio Descanso: `id="agenda-lunch-start"`
- Fin Descanso: `id="agenda-lunch-end"`
- Días Laborables: `id="agenda-working-day-btn-[id]"` (donde `[id]` es el número del día, 1=Lunes, 7=Domingo)
- **Añadir Ausencia (Vacaciones y Festivos de Larga Duración):** `id="agenda-add-absence-btn"` (Abre el modal para bloquear días completos por vacaciones, Navidad, verano, etc.)
- Eliminar Ausencia: `id="agenda-delete-absence-btn-[id]"` (donde `[id]` es el id del bloqueo)
- Margen de Reserva Online (en horas): `id="agenda-booking-margin-hours"`

### Pestaña: Diseño de Reservas (Booking UI / Layout)
*Esta pestaña (`tab=booking_ui`) permite configurar de manera visual cómo se listarán los tratamientos en el flujo público de reserva de citas para los clientes (Grid o Lista).*
- Formato de Cuadrícula (Grid): `id="booking-layout-grid-btn"`
- Formato de Lista (List): `id="booking-layout-list-btn"`

### Pestaña: Suscripción y Plan
- Actualizar/Mejorar Plan: `id="subscription-upgrade-btn-[id]"` (donde `[id]` es la clave del plan, ej: `subscription-upgrade-btn-premium`)

### Pestaña: Modos de Trabajo y Domicilios
- Selector de Modalidad (Clínica, Domicilio, Mixto): `id="mobile-work-modality-btn-[id]"`
- Dirección Base de Operaciones: `id="mobile-ops-center-address-input"`
- Radio de Cobertura (Km): `id="mobile-coverage-radius-slider"`
- Agregar Zona Autorizada (Whitelist):
  - Input texto zona: `id="mobile-whitelist-zone-input"`
  - Añadir zona: `id="mobile-add-zone-btn"`
  - Quitar zona: `id="mobile-remove-zone-btn-[index]"`

### Pestaña: Avanzado (Modelos e Integración IA)
*Esta pestaña (`tab=advanced`) contiene la configuración del proveedor de Inteligencia Artificial de la clínica y llaves API propias.*
- Selector Proveedor Gemini: `id="advanced-provider-gemini-radio"`
- Selector Proveedor OpenAI: `id="advanced-provider-openai-radio"`
- API Key Gemini Personal: `id="advanced-gemini-api-key"`
- Selector de Modelo Gemini (Texto): `id="advanced-gemini-model-text-trigger"`
- Selector de Modelo Gemini (Imagen): `id="advanced-gemini-model-image-trigger"`
- API Key OpenAI Personal: `id="advanced-openai-api-key"`
- Selector de Modelo OpenAI (Texto): `id="advanced-openai-model-text-trigger"`
- Selector de Modelo OpenAI (Imagen): `id="advanced-openai-model-image-trigger"`
- Permitir Indexación en Motores de Búsqueda (SEO): `id="advanced-allow-indexing-checkbox"`
- Habilitar Gestión de Consentimiento Obligatoria: `id="advanced-enable-consents-checkbox"`
- Sector Comercial de la Clínica: `id="advanced-business-sector-trigger"`

## 4. Mi Perfil Digital
La sección de Perfil Personal (`/dashboard/profile`) permite al usuario cambiar su información de cuenta, preferencias de notificaciones y contraseñas:
- Nombre Completo: `id="profile-fullname-input"`
- Cargar/Cambiar Avatar: `id="profile-avatar-upload-btn"`
- Guardar Cambios (Nombre y Preferencias): `id="profile-save-all-btn"`
- Input Nueva Contraseña: `id="profile-new-password-input"`
- Botón Actualizar Contraseña: `id="profile-update-password-btn"`
- Notificación Email Citas: Checkbox `id="profile-email-appointments-check"`
- Recordatorio Agenda Diario: Checkbox `id="profile-agenda-reminders-check"`
- Botón Cerrar Sesión: `id="profile-logout-btn"`

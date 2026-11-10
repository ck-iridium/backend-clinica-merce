# Manual de Ayuda: Agenda y Calendario

Este manual sirve como la única fuente de verdad (RAG) para guiar al usuario en el uso del módulo de Agenda y Calendario de la clínica.

## 1. Reglas de Negocio
El módulo de Agenda (`/dashboard/calendar`) permite la gestión de citas de pacientes y bloqueos de tiempo para los profesionales de la clínica. Los usuarios pueden:
- Visualizar la planificación en **Vista Semanal** o en **Vista Diaria con Columnas por Especialista** (1 columna por profesional).
- Gestionar negocios multisede: Conmutar entre sedes o ver "Todas las sedes" desde el selector de la cabecera (`id="calendar-location-selector-trigger"`). Al filtrar por una sede, tanto la vista semanal como las columnas de especialistas muestran exclusivamente las citas de ese centro.
- Identificar en qué sede se realiza el servicio mediante micro-etiquetas en las tarjetas y en el detalle flotante (o "Servicio a Domicilio" con dirección si aplica).
- Asignar la sede al crear una cita (`id="create-appt-location-select-trigger"`) o trasladar una cita entre sedes desde el modal de edición (`id="edit-appt-location-select-trigger"`).
- Filtrar la agenda por profesional específico o ver a todo el equipo desde el panel lateral, con contador de citas en vivo.
- Consultar de un vistazo el especialista asignado en cada tarjeta mediante micro-avatares y tarjetas flotantes de detalle.
- Reasignar o cambiar directamente el especialista de cualquier cita desde el modal de edición (`id="edit-appt-staff-select-trigger"`).
- Detección automática de conflictos de horario: si el especialista seleccionado ya tiene otra cita en esa franja, el sistema bloquea el solapamiento y previene citas duplicadas.
- Crear nuevas citas asignando un cliente y un tratamiento específico.
- Crear bloqueos de tiempo (por descanso, formación u otros motivos) para evitar reservas.
- Editar o cancelar citas y bloqueos de tiempo existentes.
- Confirmar citas recibidas desde el portal web de reserva de pacientes.

## 2. Seguridad (RBAC)
El acceso y las acciones permitidas varían según el rol:
- **Administrador / Recepción:** Acceso total. Pueden ver todas las citas, crear, editar, reasignar, cambiar estados (incluyendo marcar citas como pagadas), gestionar bloqueos y autorizar citas web pendientes.
- **Especialista:** Acceso parcial/total a la agenda de citas, pero con restricciones financieras (no pueden realizar cobros ni ver ingresos estimados).

## 3. Acciones y Coordenadas (Selectores CSS)
Para guiar visualmente al usuario y señalar elementos, utiliza la URL `/dashboard/calendar` (o `/dashboard/calendar?date=YYYY-MM-DD`) y los siguientes identificadores estables (`id="..."`):

### Panel de Control y Navegación Lateral (Sidebar)
- **Buscador de Citas:** Campo de texto para filtrar citas por nombre o cliente.
  - Ruta: `/dashboard/calendar`
  - Selector: `id="calendar-search-input"`
- **Minicalendario (Mes Anterior / Siguiente):** Botones para cambiar el mes del calendario miniatura.
  - Ruta: `/dashboard/calendar`
  - Selectores: `id="calendar-prev-month-btn"` y `id="calendar-next-month-btn"`
- **Botón de Día Específico (Minicalendario):** Acceso rápido a un día en el minicalendario.
  - Ruta: `/dashboard/calendar`
  - Selector: `id="calendar-mini-day-btn-[day]"` (ej: `calendar-mini-day-btn-15`)
- **Controles del Calendario Diario:** Botones para ir al día anterior, hoy o día siguiente.
  - Ruta: `/dashboard/calendar`
  - Selectores: `id="calendar-daily-prev-btn"`, `id="calendar-daily-today-btn"`, y `id="calendar-daily-next-btn"`
- **Filtros Rápidos de Citas:** Permiten alternar la visualización por estado.
  - Ruta: `/dashboard/calendar`
  - Selectores:
    - Confirmadas: `id="calendar-filter-confirmed-btn"`
    - Pendientes Web: `id="calendar-filter-pending-btn"`
    - Pagadas: `id="calendar-filter-paid-btn"`
- **Filtro de Personal y Equipo:** Permite filtrar las citas por profesional específico o ver las de todo el equipo, con recuento en vivo.
  - Ruta: `/dashboard/calendar`
  - Selectores:
    - Todo el equipo: `id="calendar-filter-staff-all-btn"`
    - Especialista individual: `id="calendar-filter-staff-[id]-btn"`
- **Cerrar Panel Lateral:** Oculta el panel lateral de navegación en desktop.
  - Ruta: `/dashboard/calendar`
  - Selector: `id="calendar-close-panel-btn"`

### Cabecera e Interacción del Grid Principal
- **Selector de Sede (Multisede):** Desplegable en la cabecera superior para conmutar entre "Todas las sedes" o filtrar por una sede específica (mostrando el conteo de citas de cada sede en vivo).
  - Ruta: `/dashboard/calendar`
  - Selectores:
    - Botón desplegable: `id="calendar-location-selector-trigger"`
    - Opción todas las sedes: `id="calendar-location-all-item"`
    - Opción sede individual: `id="calendar-location-[id]-item"`
- **Alternar Modo de Vista (Semanal vs Columnas por Especialista):**
  - Vista Semanal: `id="calendar-viewmode-week-btn"`
  - Vista Diaria (Columnas por Especialista): `id="calendar-viewmode-day-btn"`
- **Selector de Fecha Principal:** Cabecera con selector de fecha para ir a un día específico.
  - Ruta: `/dashboard/calendar`
  - Selector: `id="calendar-header-datepicker"`
- **Botón Ir a Hoy:** Vuelve rápidamente al día actual en la cabecera.
  - Ruta: `/dashboard/calendar`
  - Selector: `id="calendar-header-today-btn"`
- **Hueco Vacío en el Calendario:** Clic en cualquier hora/minuto libre para abrir el modal de creación de cita o bloqueo.
  - Ruta: `/dashboard/calendar`
  - Selector: `id="calendar-empty-slot-[hour]-[minute]"` (ej: `calendar-empty-slot-10-30` para las 10:30h)
- **Tarjeta de Cita Activa (Desktop / Móvil):** Permite ver detalles o editar una cita existente.
  - Ruta: `/dashboard/calendar`
  - Selectores: `id="calendar-appt-card-desktop-[id]"` y `id="calendar-appt-card-mobile-[id]"`

### Modal de Creación de Citas y Bloqueos
- **Pestaña Cita:** Cambiar al formulario de registro de tratamiento.
  - Ruta: `/dashboard/calendar` (Modal abierto)
  - Selector: `id="create-appt-appointment-tab"`
- **Pestaña Bloqueo:** Cambiar al formulario de bloqueo de agenda.
  - Ruta: `/dashboard/calendar` (Modal abierto)
  - Selector: `id="create-appt-block-tab"`
- **Selector de Cliente:** Desplegable para seleccionar el paciente receptor de la cita.
  - Ruta: `/dashboard/calendar` (Modal abierto)
  - Selector: `id="create-appt-client-select-trigger"`
- **Selector de Servicio:** Desplegable para seleccionar el tratamiento base.
  - Ruta: `/dashboard/calendar` (Modal abierto)
  - Selector: `id="create-appt-service-select-trigger"`
- **Selector de Sede (Crear Cita):** Desplegable para asignar la sede donde se realizará el tratamiento (en negocios multisede).
  - Ruta: `/dashboard/calendar` (Modal abierto)
  - Selector: `id="create-appt-location-select-trigger"`
- **Sobrescritura Manual de Duración (Crear Cita):** Permite extender o reducir la duración del tratamiento para casos particulares sin alterar el catálogo general:
  - Píldoras de ajuste rápido (15, 30, 45, 60, 90, 120 min): `id="create-appt-duration-[mins]-btn"` (ej: `create-appt-duration-90-btn`)
  - Campo numérico de minutos personalizados: `id="create-appt-duration-custom-input"`
- **Área de Notas:** Campo de comentarios libres de la cita.
  - Ruta: `/dashboard/calendar` (Modal abierto)
  - Selector: `id="create-appt-notes-textarea"`
- **Concepto de Bloqueo:** Entrada de texto para especificar el motivo del bloqueo de tiempo.
  - Ruta: `/dashboard/calendar` (Modal abierto)
  - Selector: `id="create-appt-block-reason-input"`
- **Duración del Bloqueo:** Botones rápidos de duración para bloqueos.
  - Ruta: `/dashboard/calendar` (Modal abierto)
  - Selector: `id="create-appt-block-duration-btn-[minutes]"` (ej: `create-appt-block-duration-btn-60`)
- **Cancelar Creación:** Cerrar el modal sin guardar cambios.
  - Ruta: `/dashboard/calendar` (Modal abierto)
  - Selector: `id="create-appt-cancel-btn"`
- **Guardar Cita/Bloqueo:** Enviar y confirmar la creación de la cita o bloqueo.
  - Ruta: `/dashboard/calendar` (Modal abierto)
  - Selector: `id="create-appt-submit-btn"`

### Modal de Edición de Citas y Bloqueos
- **Reasignar / Cambiar Especialista:** Permite ver el profesional asignado a la cita y reasignarlo directamente a cualquier miembro del equipo o desasignarlo ("Sin especialista asignado"), con detección automática de solapamiento de horario.
  - Ruta: `/dashboard/calendar` (Modal abierto)
  - Selector: `id="edit-appt-staff-select-trigger"`
- **Trasladar / Cambiar Sede:** Permite consultar la sede asignada a la cita (o los datos del servicio a domicilio) y trasladarla a otra sede del negocio.
  - Ruta: `/dashboard/calendar` (Modal abierto)
  - Selector: `id="edit-appt-location-select-trigger"`
- **Modificar Duración Manual de Cita Existente:**
  - Píldoras rápidas (15, 30, 45, 60, 90, 120 min): `id="edit-appt-duration-[mins]-btn"`
  - Campo numérico personalizado: `id="edit-appt-custom-duration-input"`
  - Restaurar duración estándar del catálogo: `id="edit-appt-restore-duration-btn"`
- **Modificar Notas:** Campo de comentarios en la cita seleccionada.
  - Ruta: `/dashboard/calendar` (Modal abierto)
  - Selector: `id="edit-appt-notes-textarea"`
- **Guardar Cambios de Notas:** Guardar los comentarios modificados.
  - Ruta: `/dashboard/calendar` (Modal abierto)
  - Selector: `id="edit-appt-save-notes-btn"`
- **Aprobar Cita Web:** Confirmar una solicitud de cita pendiente creada desde la web pública.
  - Ruta: `/dashboard/calendar` (Modal abierto)
  - Selector: `id="edit-appt-confirm-web-booking-btn"`
- **Enviar Recordatorio WhatsApp:** Envía una plantilla de recordatorio de cita al teléfono del paciente.
  - Ruta: `/dashboard/calendar` (Modal abierto)
  - Selector: `id="edit-appt-whatsapp-btn"`
- **Cambio de Estado Directo:** Selector de estado de la cita (Confirmada, Pendiente Web, Pagada, No Asistió).
  - Ruta: `/dashboard/calendar` (Modal abierto)
  - Selector: `id="edit-appt-status-select-trigger"`
- **Eliminar Cita/Bloqueo:** Elimina o anula la cita/bloqueo de la agenda.
  - Ruta: `/dashboard/calendar` (Modal abierto)
  - Selector: `id="edit-appt-delete-btn"`

### Modal de Confirmación de Eliminación de Bloqueo
- **Confirmar Borrado de Bloqueo:** Aceptar la eliminación definitiva del bloqueo.
  - Ruta: `/dashboard/calendar` (Modal abierto)
  - Selector: `id="delete-block-confirm-btn"`
- **Cancelar Borrado:** Volver al modal anterior sin eliminar el bloqueo.
  - Ruta: `/dashboard/calendar` (Modal abierto)
  - Selector: `id="delete-block-cancel-btn"`

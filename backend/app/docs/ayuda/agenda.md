# Manual de Ayuda: Agenda y Calendario

Este manual sirve como la única fuente de verdad (RAG) para guiar al usuario en el uso del módulo de Agenda y Calendario de la clínica.

## 1. Reglas de Negocio
El módulo de Agenda (`/dashboard/calendar`) permite la gestión de citas de pacientes y bloqueos de tiempo para los profesionales de la clínica. Los usuarios pueden:
- Visualizar la planificación diaria, semanal o mensual de citas.
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
- **Cerrar Panel Lateral:** Oculta el panel lateral de navegación en desktop.
  - Ruta: `/dashboard/calendar`
  - Selector: `id="calendar-close-panel-btn"`

### Cabecera e Interacción del Grid Principal
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
- **Minutos de Duración Rápidos:** Botones de ajuste de duración a 15, 30, 45 o 60 minutos.
  - Ruta: `/dashboard/calendar` (Modal abierto)
  - Selector: `id="create-appt-minute-btn-[minutes]"` (ej: `create-appt-minute-btn-30`)
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

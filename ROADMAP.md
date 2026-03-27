# ROADMAP: Plataforma Integral Clínica Mercè

## 1. Fase de Gestión de Datos (Core CRM)
- [ ] **CRUD de Clientes**: Listado completo, fichas médicas con historial de tratamientos y alertas (alergias, enfermedades).
- [ ] **Gestión de Servicios**: Catálogo de tratamientos con nombre, duración estimada y precio base.
- [ ] **Sistema de Bonos (Vouchers)**: Creación de bonos, asignación a clientes y lógica automatizada para descontar sesiones al finalizar una cita.

## 2. Fase de Agenda y Reservas
- [ ] **Calendario Interactivo**: Vista mensual/semanal en el Dashboard para que Mercè gestione los huecos (drag&drop opcional).
- [ ] **Motor de Reservas (Landing)**: Formulario público conectado a la disponibilidad real, calculando los espacios libres de forma automática según la duración de cada servicio.
- [ ] **Estados de Cita**: Flujo de estados sincronizado (Pendiente, Confirmada, Realizada, Cancelada, No asistió).

## 3. Fase de Facturación y Documentación
- [ ] **Facturación**: Generación automatizada de presupuestos y facturas/recibos en formato PDF descargable.
- [ ] **Consentimientos Informados (RGPD)**: Pantalla táctil adaptada para firmar digitalmente desde una tablet o móvil antes del tratamiento.

## 4. Fase de Seguridad y Pulido
- [ ] **Roles y Permisos**: Restricción de áreas. Distinción de vistas entre `admin` (Mercè) y empleados si la clínica crece.
- [ ] **Validación y UX Profesional**: Validaciones estrictas pre-envío y manejo de errores con notificaciones visuales (Toasts). Cohesión con la paleta de marca (Soft Rose & Gold).

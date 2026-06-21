# Manual de Ayuda: Venta Rápida / TPV (POS)

Este manual sirve como la única fuente de verdad (RAG) para guiar al usuario en el uso del módulo de Venta Rápida / TPV (POS) de la clínica.

## 1. Reglas de Negocio
El módulo de Venta Rápida / TPV (`/dashboard/pos`) permite emitir comprobantes de pago de forma inmediata por tratamientos, servicios o productos.
- Permite seleccionar si se emite un Ticket (Factura Simplificada) o una Factura Nominal (vinculada a un paciente concreto).
- Permite buscar un cliente registrado para vincular la venta a su expediente clínico.
- Permite seleccionar el tratamiento base, modificar el importe a cobrar y especificar el método de pago (Tarjeta o Efectivo).
- Este cobro genera automáticamente una factura firmada y marcada como sujeta a IVA (21%).
- La venta se registra de inmediato en la contabilidad y el historial del cliente, pero **no genera ninguna reserva de cita en el calendario de la agenda**.

## 2. Seguridad (RBAC)
El acceso al TPV y cobros está restringido para preservar la integridad de la caja:
- **Administrador / Recepción:** Acceso total y libre para realizar cobros, arqueos de caja y emitir facturas.
- **Especialista:** Acceso totalmente denegado. Este módulo está bloqueado y no se muestra en su menú lateral de navegación.

## 3. Acciones y Coordenadas (Selectores CSS)
Para guiar visualmente al usuario y señalar elementos, utiliza la URL `/dashboard/pos` y los siguientes identificadores estables (`id="..."`):

### Formulario de Venta
- **Interruptor de Tipo de Documento:** Permite alternar entre la emisión de un Ticket (Factura Simplificada) y una Factura Nominal vinculada a un cliente.
  - Ruta: `/dashboard/pos`
  - Selector: `id="pos-ticket-toggle"`
- **Buscador de Cliente (Factura Nominal):** Campo de texto para buscar y asignar un cliente por nombre, email o teléfono.
  - Ruta: `/dashboard/pos`
  - Selector: `id="pos-client-search"`
- **Seleccionar Cliente de los Resultados:** Dropdown/botón para seleccionar al cliente de la lista de resultados de búsqueda.
  - Ruta: `/dashboard/pos`
  - Selector: `id="pos-client-result-[id]"` (donde `[id]` es el identificador único del cliente en la base de datos)
- **Selector de Tratamiento / Servicio:** Selector desplegable para asociar el concepto del tratamiento realizado.
  - Ruta: `/dashboard/pos`
  - Selector: `id="pos-service-select"`
- **Importe de la Venta:** Entrada numérica para modificar o definir el precio final a cobrar por la sesión.
  - Ruta: `/dashboard/pos`
  - Selector: `id="pos-amount-input"`

### Métodos de Pago y Confirmación
- **Método de Pago con Tarjeta:** Botón para marcar el cobro como transacción mediante datáfono/tarjeta.
  - Ruta: `/dashboard/pos`
  - Selector: `id="pos-pay-card"`
- **Método de Pago en Efectivo:** Botón para marcar el cobro como transacción física en metálico.
  - Ruta: `/dashboard/pos`
  - Selector: `id="pos-pay-cash"`
- **Confirmar Cobro:** Botón para procesar la transacción y emitir la factura.
  - Ruta: `/dashboard/pos`
  - Selector: `id="pos-submit-btn"`

### Pantalla de Éxito Post-Venta
- **Ir al Historial de Facturas:** Enlace para navegar directamente al registro general de facturación tras una venta exitosa.
  - Ruta: `/dashboard/pos` (Venta completada)
  - Selector: `id="pos-view-invoices-link"`
- **Realizar Nueva Venta:** Botón para limpiar el formulario del TPV y realizar un nuevo cobro.
  - Ruta: `/dashboard/pos` (Venta completada)
  - Selector: `id="pos-new-sale-btn"`

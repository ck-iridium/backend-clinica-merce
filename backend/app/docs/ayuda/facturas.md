# Manual de Ayuda: Facturación y Comprobantes

Este manual sirve como la única fuente de verdad (RAG) para guiar al usuario en el uso del módulo de Facturas y Registro de Facturación.

## 1. Reglas de Negocio
El módulo de Facturas (`/dashboard/invoices`) recopila todas las transacciones financieras y de ventas realizadas en la clínica (ya sea a través del TPV de venta rápida o derivado de la agenda).
- **Control e Historial Contable:** Registra el importe bruto, la base imponible, la cuota de IVA aplicada y la fecha de emisión.
- **Exportación masiva:** Permite exportar la lista de facturas visible en la página actual en PDF formateado (estética corporativa elegante) y en formato CSV para su procesamiento en programas de contabilidad.
- **Visor de Folio A4 (Detalle de Factura):** Muestra una vista previa exacta de la factura en tamaño A4 con el membrete de la clínica, NIF, datos del cliente, desglose de IVA y totalizador.
- **Interactividad del Cuño/Firma:** Permite mover, arrastrar y rotar la firma/cuño digital del administrador sobre el folio para ubicarla en el lugar óptimo antes de imprimir.
- **Gestión de Estados:** Los comprobantes pueden estar en estado "Pagada" o "Pendiente". El cambio de estado se realiza bajo confirmación para resguardar la exactitud contable.

## 2. Seguridad (RBAC)
El acceso al registro general de facturas y los folios está protegido:
- **Administrador:** Acceso completo para visualizar, exportar, cambiar estados y eliminar registros.
- **Recepción:** Acceso de lectura, impresión y cambio de estado de cobro. No puede eliminar registros de facturación de forma permanente.
- **Especialista:** Acceso totalmente bloqueado. No puede ver el registro de facturas ni acceder a los detalles del módulo.

## 3. Acciones y Coordenadas (Selectores CSS)
Para guiar visualmente al usuario y señalar elementos, utiliza las URLs correspondientes y los siguientes identificadores estables (`id="..."`):

### Panel Principal de Facturación (`/dashboard/invoices`)
- **Filtros por Estado de Pago:**
  - Todas: `id="invoice-status-tab-all"`
  - Pagadas: `id="invoice-status-tab-paid"`
  - Pendientes: `id="invoice-status-tab-pending"`
- **Selector de Rango de Fechas (Presets):** Desplegable para filtrar por hoy, este mes, este año o siempre.
  - Selector: `id="invoice-date-preset-trigger"`
- **Búsqueda Reactiva:** Filtrar facturas por concepto o cliente.
  - Selector: `id="invoice-search-input"`
- **Botón Exportar Listado a PDF:** Genera un archivo PDF con la contabilidad de la página actual.
  - Selector: `id="invoice-export-pdf-btn"`
- **Botón Exportar Listado a CSV:** Genera un archivo CSV compatible con hojas de cálculo.
  - Selector: `id="invoice-export-csv-btn"`

### Tabla de Facturas (Acciones por Fila)
- **Desplegar Menú de Acciones:** Abre el menú desplegable de opciones de la factura en la fila `[index]`.
  - Selector: `id="invoice-actions-trigger-[index]"` (donde `[index]` es la posición de la fila, ej: `invoice-actions-trigger-0`)
- **Acciones dentro del Menú Desplegable:**
  - Ver Detalle / Visor Folio: `id="invoice-view-detail-btn-[index]"`
  - Descargar PDF individual: `id="invoice-download-pdf-btn-[index]"`
  - Eliminar Registro (Solo Administrador): `id="invoice-delete-btn-[index]"`
- **Botones de Paginación:**
  - Página Anterior: `id="invoice-page-prev-btn"`
  - Página Siguiente: `id="invoice-page-next-btn"`

### Visor de Folio A4 (`/dashboard/invoices/[id]`)
- **Volver al Listado:** Botón para regresar al registro general de facturas.
  - Selector: `id="invoice-back-btn"`
- **Ir al Perfil del Cliente:** Abre el expediente completo del cliente emisor.
  - Selector: `id="invoice-client-record-link"`
- **Modificar Estado de la Factura:** Botón que despliega el diálogo para cambiar entre Pagada y Pendiente.
  - Selector: `id="invoice-status-change-trigger"`
- **Confirmación del Cambio de Estado (Modal):**
  - Cancelar: `id="invoice-cancel-change-btn"`
  - Confirmar y Guardar: `id="invoice-confirm-change-btn"`
- **Imprimir Factura:** Dispara el comando de impresión del navegador.
  - Selector: `id="invoice-print-btn"`
- **Rotación de la Firma/Sello Digital:** Botones del panel de control que aparece al posar el cursor sobre el sello.
  - Rotar Izquierda (↺): `id="invoice-rotate-left-btn"`
  - Rotar Derecha (↻): `id="invoice-rotate-right-btn"`

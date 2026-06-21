# Manual de Ayuda: Dirección y Catálogo de Bonos

Este manual sirve como la única fuente de verdad (RAG) para guiar al usuario en el uso del módulo de Bonos de Tratamientos.

## 1. Reglas de Negocio
El módulo de Bonos (`/dashboard/vouchers`) gestiona el catálogo de plantillas y la asignación/consumo de bonos de sesiones para los pacientes:
- **Catálogo de Plantillas:** Define modelos preconfigurados de bonos con cantidad de sesiones/usos y un precio sugerido (ej: Bono 5 Sesiones de Presoterapia).
- **Emisión y Asignación:** Permite vender un bono a un paciente receptor, pactar un precio final diferente al sugerido, registrar un cobro inicial hoy (con saldo pendiente) y fijar el periodo de caducidad.
- **Seguimiento de Sesiones:** Registra el progreso de sesiones consumidas y las restantes.
- **Control de Deuda:** Los bonos con pago inicial parcial entran en estado de deuda pendiente y se pueden liquidar mediante abonos directos.
- **Anulación:** Permite dar de baja o anular bonos activos perdiendo las sesiones no consumidas.

## 2. Seguridad (RBAC)
Las acciones financieras y administrativas de los bonos están reguladas:
- **Administrador:** Control total del catálogo (crear/eliminar plantillas), emitir bonos, registrar pagos de deudas y anular bonos.
- **Recepción:** Puede emitir bonos, registrar abonos de deudas de pacientes y ver el catálogo. No puede eliminar plantillas del catálogo.
- **Especialista:** Acceso totalmente bloqueado a la pantalla de gestión de bonos.

## 3. Acciones y Coordenadas (Selectores CSS)
Para guiar visualmente al usuario y señalar elementos, utiliza la URL `/dashboard/vouchers` y los siguientes identificadores estables (`id="..."`):

### Pantalla Principal de Bonos (`/dashboard/vouchers`)
- **Pestaña Emitidos (Activos en Pacientes):** Muestra los bonos activos vendidos.
  - Selector: `id="vouchers-tab-issued"`
- **Pestaña Catálogo (Modelos de Bonos):** Muestra las plantillas preconfiguradas.
  - Selector: `id="vouchers-tab-catalog"`
- **Botón de Acción Principal (+):** Cambia dinámicamente según la pestaña activa ("Emitir Bono" o "Nueva Plantilla").
  - Selector: `id="vouchers-action-btn"`

### Pestaña Emitidos (Gestión de Bonos en Paciente)
- **Menú de Acciones del Bono:** Desplegar opciones para el bono con `[id]`.
  - Selector: `id="voucher-item-actions-trigger-[id]"` (donde `[id]` es la clave única del bono)
- **Ver Expediente del Paciente (en el menú del bono):** Redirige al perfil del cliente.
  - Selector: `id="voucher-view-client-btn-[id]"`
- **Cobrar Deuda Pendiente (en el menú del bono):** Abre el modal para registrar un abono.
  - Selector: `id="voucher-collect-pending-btn-[id]"`
- **Anular Bono (en el menú del bono):** Abre la confirmación para borrar el bono.
  - Selector: `id="voucher-annul-btn-[id]"`

### Pestaña Catálogo (Modelos Preconfigurados)
- **Eliminar Plantilla del Catálogo:** Elimina el modelo de bono con `[id]`.
  - Selector: `id="voucher-template-delete-btn-[id]"`

### Modal de Emisión y Asignación de Bono
- **Seleccionar Paciente Receptor:** Dropdown de selección.
  - Selector: `id="assign-voucher-client-trigger"`
- **Buscador de Plantillas:** Entrada de texto para filtrar los modelos disponibles.
  - Selector: `id="assign-voucher-template-search"`
- **Seleccionar Plantilla Filtrada:** Hace clic en el resultado del catálogo con `[id]`.
  - Selector: `id="assign-voucher-template-result-[id]"`
- **Cambiar Plantilla Seleccionada:** Permite limpiar la plantilla escogida para buscar otra.
  - Selector: `id="assign-voucher-change-template-btn"`
- **Precio Final Pactado:** Entrada numérica para definir el coste del bono para este paciente.
  - Selector: `id="assign-voucher-price-input"`
- **Pago Inicial Hoy:** Entrada numérica del monto cobrado en el momento de la venta.
  - Selector: `id="assign-voucher-initial-pay-input"`
- **Selector de Caducidad:** Desplegable para seleccionar los meses de vigencia (3, 6, 12 o 24 meses).
  - Selector: `id="assign-voucher-expiration-trigger"`
- **Emitir Bono:** Botón para confirmar la venta y asignar el bono al paciente.
  - Selector: `id="assign-voucher-submit-btn"`

### Modal de Registro de Pago de Deuda (Abono)
- **Importe Abonado Hoy:** Entrada numérica de la cantidad entregada para amortizar la deuda.
  - Selector: `id="pay-debt-amount-input"`
- **Cancelar Cobro:** Cierra el modal sin guardar.
  - Selector: `id="pay-debt-cancel-btn"`
- **Confirmar Pago:** Procesa y registra la amortización del saldo.
  - Selector: `id="pay-debt-submit-btn"`

### Modal de Nueva Plantilla de Bono
- **Nombre de la Plantilla:** Entrada de texto para el título descriptivo.
  - Selector: `id="template-name-input"`
- **Servicio Base:** Desplegable para vincular la técnica o servicio asociado.
  - Selector: `id="template-service-trigger"`
- **Número de Sesiones:** Entrada numérica para especificar los usos permitidos.
  - Selector: `id="template-sessions-input"`
- **Precio Sugerido:** Entrada numérica de la tarifa propuesta para el bono.
  - Selector: `id="template-price-input"`
- **Guardar Plantilla:** Confirma el alta del modelo en el catálogo.
  - Selector: `id="template-submit-btn"`

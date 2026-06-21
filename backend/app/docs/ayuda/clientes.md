# Manual de Ayuda: Clientes y Ficha Clínica

Este manual sirve como la única fuente de verdad (RAG) para guiar al usuario en el uso del módulo de Clientes y Ficha Clínica.

## 1. Reglas de Negocio
El módulo de Clientes permite llevar un control y registro unificado de todos los pacientes que acuden a la clínica.
- **Directorio de Clientes (`/dashboard/clients`):** Listado general con buscador y panel de alta de nuevos pacientes.
- **Ficha de Perfil del Cliente (`/dashboard/clients/[id]`):** Panel detallado dividido en cuatro áreas funcionales:
  - **Resumen:** Información personal, de contacto, dirección física y notas internas libres.
  - **Servicios:** Registro e historial completo de tratamientos realizados, con paginación de citas anteriores.
  - **Bonos:** Visualización de los bonos adquiridos por el paciente y acceso rápido para cobrar deudas asociadas a estos bonos.
  - **Consentimientos:** Gestión legal donde se seleccionan y firman digitalmente consentimientos informados (mediante un lienzo canvas interactivo) y se imprimen o consultan documentos ya firmados.

## 2. Seguridad (RBAC)
El acceso a la ficha y la capacidad de modificación están protegidos para asegurar la privacidad del historial médico:
- **Administrador:** Acceso total de lectura, escritura y borrado en todas las pestañas y campos (datos personales, médicos y financieros).
- **Recepción:** Acceso total a datos personales, firma de consentimientos e historial de citas. Puede cobrar deudas de bonos.
- **Especialista:** Acceso parcial.
  - **Lectura/Escritura:** Alertas Médicas, Historial Médico, Observaciones Libres y Fórmulas/Historial Clínico.
  - **Solo Lectura:** Nombre, Apellidos, Email, Teléfono, DNI y Dirección.
  - **Ocultar:** El botón "Vender Bono" (`sell-voucher-link`) y datos de cobros.

## 3. Acciones y Coordenadas (Selectores CSS)
Para guiar visualmente al usuario y señalar elementos, utiliza las URLs correspondientes y los siguientes identificadores estables (`id="..."`):

### Directorio General de Clientes
- **Añadir Cliente:** Abre el cajón lateral/modal para registrar un nuevo paciente.
  - Ruta: `/dashboard/clients`
  - Selector: `id="add-client-btn"`
- **Ver Ficha Completa del Cliente:** Link en la fila correspondiente para navegar a la ficha individual del cliente.
  - Ruta: `/dashboard/clients`
  - Selector: `id="view-client-details-btn-[index]"` (donde `[index]` es la posición de la fila, ej: `view-client-details-btn-0`)

### Modal de Alta / Registro de Cliente
- **Formulario de Registro:** Elemento contenedor del formulario.
  - Ruta: `/dashboard/clients`
  - Selector: `id="client-form"`
- **Campos de Datos Básicos:**
  - Nombre: `id="client-first-name-input"`
  - Apellidos: `id="client-last-name-input"`
  - Email: `id="client-email-input"`
  - Teléfono: `id="client-phone-input"`
  - NIF / DNI: `id="client-dni-input"`
- **Dirección de Servicio:**
  - Calle/Dirección: `id="client-service-address-input"`
  - Código Postal: `id="client-service-postal-code-input"`
  - Ciudad: `id="client-service-city-input"`
- **Campos Fiscales (si difiere de la de servicio):**
  - Checkbox dirección distinta: `id="billing-diff-check"`
  - Razón Social: `id="client-billing-name-input"`
  - NIF Fiscal: `id="client-billing-nif-input"`
  - Dirección Fiscal: `id="client-billing-address-input"`
  - Código Postal Fiscal: `id="client-billing-postal-code-input"`
  - Ciudad Fiscal: `id="client-billing-city-input"`
- **Ficha Especializada por Verticales / Sectores:**
  - **Sector Clínico / Médico:**
    - Alergias: `id="clinical-allergies-input"`
    - Medicación Diaria: `id="clinical-medications-input"`
    - Historial Quirúrgico: `id="clinical-injury-history-input"`
    - Notas Clínicas: `id="clinical-notes-textarea"`
  - **Sector Belleza / Estética:**
    - Tipo Cabello/Piel: `id="beauty-skin-hair-type-input"`
    - Sensibilidad Química: `id="beauty-product-sensitivities-input"`
    - Fórmulas de Color: `id="beauty-color-formulas-textarea"`
- **Cancelar Registro:** Cierra el modal de alta sin aplicar los cambios.
  - Ruta: `/dashboard/clients`
  - Selector: `id="cancel-add-client-btn"`
- **Guardar Cliente:** Envía los datos para dar de alta al paciente.
  - Ruta: `/dashboard/clients`
  - Selector: `id="submit-client-form-btn"`

### Perfil y Ficha Individual del Cliente
- **Regresar al Listado:** Botón para volver al listado general de pacientes.
  - Ruta: `/dashboard/clients/[id]`
  - Selector: `id="back-to-directory-link"`
- **Agendar Cita Directa:** Redirige al calendario con este cliente ya seleccionado en el formulario.
  - Ruta: `/dashboard/clients/[id]`
  - Selector: `id="book-appointment-link"`
- **Editar Ficha:** Abre el modal de edición de datos de perfil del cliente.
  - Ruta: `/dashboard/clients/[id]`
  - Selector: `id="edit-client-profile-btn"`
- **Guardar / Cancelar Edición de Perfil:**
  - Guardar: `id="submit-edit-client-btn"`
  - Cancelar: `id="cancel-edit-client-btn"`

### Pestañas del Perfil
- **Pestaña Resumen & Ficha:** Activa la vista de datos de contacto y notas.
  - Ruta: `/dashboard/clients/[id]`
  - Selector: `id="tab-overview-btn"`
- **Pestaña Servicios (Historial de citas):** Activa el histórico de tratamientos.
  - Ruta: `/dashboard/clients/[id]`
  - Selector: `id="tab-appointments-btn"`
  - Botón de Citas Anteriores: `id="prev-appointments-btn"`
  - Botón de Citas Siguientes: `id="next-appointments-btn"`
- **Pestaña Bonos:** Muestra los bonos contratados por el cliente.
  - Ruta: `/dashboard/clients/[id]`
  - Selector: `id="tab-vouchers-btn"`
  - Botón Vender Bono (Oculto para Especialista): `id="sell-voucher-link"`
  - Cobrar Deuda de Bono `[id]`: `id="pay-voucher-btn-[id]"` (Abre modal de cobro)
    - Campo de importe a pagar: `id="pay-debt-amount-input"`
    - Confirmar cobro de deuda: `id="submit-pay-debt-btn"`
    - Cancelar cobro de deuda: `id="cancel-pay-debt-btn"`
- **Pestaña Consentimientos:** Área de firma legal y control de consentimientos firmados.
  - Ruta: `/dashboard/clients/[id]`
  - Selector: `id="tab-consents-btn"`
  - **Firmar Nuevo Consentimiento:** Abre el lienzo para realizar la firma.
    - Selector: `id="sign-consent-btn"`
    - Selector tipo de consentimiento: `id="consent-type-select-trigger"`
    - Lienzo de dibujo de firma: `id="signature-canvas"`
    - Limpiar firma del canvas: `id="clear-signature-canvas-btn"`
    - Confirmar y guardar firma: `id="submit-signature-btn"`
    - Cancelar firma: `id="cancel-signature-btn"`
  - **Ver Consentimiento Firmado (Visor Legal):** Abre el documento completo.
    - Selector: `id="view-consent-link-[id]"` (donde `[id]` es la firma registrada)
    - Regresar al perfil desde visor: `id="back-to-consents-btn"`
    - Imprimir consentimiento: `id="print-consent-btn"`

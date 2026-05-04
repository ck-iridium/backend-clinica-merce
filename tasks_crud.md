# Plan de Refactorización: Patrón de la Higuera Estranguladora (crud.py)

Este documento detalla el plan de acción para estrangular y desmantelar el archivo monolítico `backend/app/crud.py`, dividiéndolo en un paquete modular orientado a dominios. La ejecución debe ser estrictamente secuencial y atómica.

## Fase 0: Preparación de la Higuera
- [x] Crear la carpeta `backend/app/crud/`.
- [x] Crear el archivo `backend/app/crud/__init__.py` (vacío o con imports básicos para convertir la carpeta en un paquete Python).

## Fase 0.5: Utilidades Compartidas
- [x] Crear el archivo `backend/app/crud/utils.py` copiando los imports necesarios (`datetime`, `ZoneInfo`, etc.).
- [x] Cortar la función `get_spain_now` de `backend/app/crud.py` y pegarla en `backend/app/crud/utils.py`.
- [x] Añadir `from .crud.utils import get_spain_now` en la cabecera de `backend/app/crud.py` temporalmente para que el monolito siga funcionando mientras se desmantela.

## Fase 1: Dominio de Ajustes (Settings)
- [x] Crear el archivo `backend/app/crud/settings.py` copiando los imports necesarios de `crud.py`.
- [x] Cortar las funciones `get_clinic_settings`, `update_clinic_settings` de `backend/app/crud.py` y pegarlas en `backend/app/crud/settings.py`.
- [x] Actualizar el archivo `backend/app/routers/settings.py` (y cualquier otro router que lo use) para que importe desde `app.crud.settings` en lugar de `app.crud`.

## Fase 2: Dominio de Contenido Web (CMS)
- [x] Crear el archivo `backend/app/crud/site_content.py` copiando los imports necesarios de `crud.py`.
- [x] Cortar las funciones `get_site_content`, `update_site_content` de `backend/app/crud.py` y pegarlas en `backend/app/crud/site_content.py`.
- [x] Actualizar el archivo `backend/app/routers/site_content.py` para que importe desde `app.crud.site_content` en lugar de `app.crud`.

## Fase 3: Dominio de Clientes (Clients)
- [x] Crear el archivo `backend/app/crud/clients.py` copiando los imports necesarios de `crud.py`.
- [x] Cortar las funciones `get_client`, `create_client`, `update_client`, `get_clients`, `find_or_create_client` de `backend/app/crud.py` y pegarlas en `backend/app/crud/clients.py`.
- [x] Actualizar el archivo `backend/app/routers/clients.py` para que importe desde `app.crud.clients` en lugar de `app.crud`.

## Fase 4: Dominio de Categorías de Servicios
- [x] Crear el archivo `backend/app/crud/service_categories.py` copiando los imports necesarios de `crud.py`.
- [x] Cortar las funciones `get_service_category`, `get_service_categories`, `create_service_category`, `update_service_category`, `delete_service_category` de `backend/app/crud.py` y pegarlas en `backend/app/crud/service_categories.py`.
- [x] Actualizar el archivo `backend/app/routers/service_categories.py` para que importe desde `app.crud.service_categories` en lugar de `app.crud`.

## Fase 5: Dominio de Servicios
- [x] Crear el archivo `backend/app/crud/services.py` copiando los imports necesarios de `crud.py`.
- [x] Cortar las funciones `get_service`, `get_services`, `create_service`, `update_service` de `backend/app/crud.py` y pegarlas en `backend/app/crud/services.py`.
- [x] Actualizar el archivo `backend/app/routers/services.py` para que importe desde `app.crud.services` en lugar de `app.crud`.

## Fase 6: Dominio de Facturación y Ventas (Invoices & POS)
- [x] Crear el archivo `backend/app/crud/invoices.py` copiando los imports necesarios (¡Ojo con `generate_invoice_id`!).
- [x] Cortar las funciones `get_invoice`, `get_invoices`, `create_invoice`, `update_invoice`, `delete_invoice`, `create_direct_sale` y `generate_invoice_id` a `backend/app/crud/invoices.py`.
- [x] Asegurarse de mantener la lógica de KPIs y el fix de `float()` en `get_invoices`.
- [x] Actualizar el router `backend/app/routers/invoices.py` (y cualquier endpoint de ventas/TPV) para que importe desde `app.crud.invoices` en lugar de `app.crud`.

## Fase 7: Dominio de Citas (Appointments)
- [x] Crear el archivo `backend/app/crud/appointments.py`.
- [x] Cortar las funciones `check_appointment_collision`, `get_appointments`, `create_appointment`, `update_appointment`, `delete_appointment`, `get_availability_slots`, `create_public_appointment`.
- [x] Actualizar el router `backend/app/routers/appointments.py` para que importe desde `app.crud.appointments` en lugar de `app.crud`.

## Fase 8: Dominio de Bloques de Tiempo (Time Blocks)
- [ ] Crear el archivo `backend/app/crud/time_blocks.py` copiando los imports necesarios de `crud.py`.
- [ ] Cortar las funciones `get_time_blocks`, `create_time_block`, `delete_time_block` de `backend/app/crud.py` y pegarlas en `backend/app/crud/time_blocks.py`.
- [ ] Actualizar el archivo `backend/app/routers/time_blocks.py` para que importe desde `app.crud.time_blocks` en lugar de `app.crud`.

## Fase 9: Dominio de Bonos (Vouchers)
- [ ] Crear el archivo `backend/app/crud/vouchers.py` copiando los imports necesarios de `crud.py`.
- [ ] Cortar las funciones `get_vouchers`, `create_voucher`, `update_voucher`, `delete_voucher` de `backend/app/crud.py` y pegarlas en `backend/app/crud/vouchers.py`.
- [ ] Actualizar el archivo `backend/app/routers/vouchers.py` para que importe desde `app.crud.vouchers` en lugar de `app.crud`.

## Fase 10: Dominio de Plantillas de Bonos (Voucher Templates)
- [ ] Crear el archivo `backend/app/crud/voucher_templates.py` copiando los imports necesarios de `crud.py`.
- [ ] Cortar las funciones `get_voucher_templates`, `get_voucher_template`, `create_voucher_template`, `delete_voucher_template` de `backend/app/crud.py` y pegarlas en `backend/app/crud/voucher_templates.py`.
- [ ] Actualizar el archivo `backend/app/routers/voucher_templates.py` para que importe desde `app.crud.voucher_templates` en lugar de `app.crud`.

## Fase 11: Dominio de Consentimientos (Consents)
- [ ] Crear el archivo `backend/app/crud/consents.py` copiando los imports necesarios de `crud.py`.
- [ ] Cortar las funciones `get_consents_by_client`, `get_consent`, `create_consent` de `backend/app/crud.py` y pegarlas en `backend/app/crud/consents.py`.
- [ ] Actualizar el archivo del router que maneja los consentimientos (por ejemplo, `clients.py` o un router de consentimientos dedicado) para que importe desde `app.crud.consents` en lugar de `app.crud`.

## Fase Final: Tala del Monolito
- [ ] Ejecutar tests o inicializar el servidor para garantizar que no hay errores de importación circulares entre los nuevos módulos.
- [ ] Verificar minuciosamente que el archivo `backend/app/crud.py` está completamente vacío o únicamente contiene imports muertos.
- [ ] Eliminar el archivo original `backend/app/crud.py`.
- [ ] (Opcional) Refactorizar `app.main` o herramientas auxiliares si importaban algo residual de `app.crud`.

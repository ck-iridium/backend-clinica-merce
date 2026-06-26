---
title: Manual de Ayuda: Venta Rápida / TPV (POS)
description: Guía completa y detallada para el uso del módulo de pos.
---

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
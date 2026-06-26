---
title: Manual de Ayuda: Facturación y Comprobantes
description: Guía completa y detallada para el uso del módulo de facturas.
---

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
---
title: Venta Rápida y TPV Mostrador (POS Express)
description: Emisión ágil de tickets, cobros en efectivo o tarjeta y arqueos de caja diarios.
---

# Venta Rápida y TPV Mostrador (POS Express)

El módulo de Venta Rápida (`/dashboard/pos`) está diseñado para agilizar el mostrador de recepción en horas punta, permitiendo registrar cobros y emitir tickets en menos de 5 segundos.

> [!NOTE]
> Una venta en el TPV registra el ingreso contable y el método de pago (Efectivo o Tarjeta), pero no bloquea huecos en la agenda del calendario.

---

## 1. Tipos de Comprobante de Cobro

* **Ticket (Factura Simplificada):** Para clientes anónimos o de paso que no solicitan datos fiscales. Genera una numeración legal simplificada.
* **Factura Nominal:** Al seleccionar un cliente de tu base de datos (o crearlo al instante), el comprobante se emite con su NIF/CIF y nombre completo, vinculándose automáticamente a su ficha de historial.

---

## 2. Flujo de Venta en 3 Pasos

1. **Seleccionar Cliente (Opcional):** Teclea el nombre o teléfono para autocompletar.
2. **Añadir Tratamientos o Productos:** Selecciona uno o varios conceptos. Puedes editar el precio final al vuelo para aplicar descuentos directos.
3. **Seleccionar Medio de Pago:** Pulsa **"Tarjeta"** o **"Efectivo"**. El ticket se genera inmediatamente en PDF para su impresión en impresora térmica o envío por email.

---

## 3. Matriz de Seguridad (RBAC)

* **Administrador / Recepción:** Acceso total al TPV, realización de cobros, arqueos y anulación de tickets erróneos.
* **Especialista:** Acceso bloqueado. Los especialistas no pueden acceder a la caja ni consultar las cifras globales de recaudación.

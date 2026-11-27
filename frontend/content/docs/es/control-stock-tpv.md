---
title: Control de Stock y Almacén en TPV
description: Gestión de inventario con descuento automático en ventas de mostrador y alertas de stock mínimo.
---

# Control de Stock y Almacén en TPV

ProBookia permite gestionar el catálogo de productos físicos de venta en cabina y mostrador (cremas, cosméticos, sérums, productos capilares) con control estricto de existencias en tiempo real.

> [!NOTE]
> Los servicios y tratamientos de cabina (ej. un corte o un masaje) no consumen existencias físicas unitarias, mientras que los productos físicos se descuentan automáticamente del inventario cada vez que se cobran en el TPV.

---

## 1. Configuración de un Producto con Control de Stock

1. Accede a **Servicios / Catálogo** y edita o crea un nuevo producto marcando la casilla **"Es un producto físico"**.
2. Activa la opción **"Controlar Stock de este producto"**.
3. Indica el **Stock Inicial** (ej. 15 unidades) y el **Stock Mínimo de Alerta** (ej. 3 unidades).
4. Opcionalmente añade el SKU, precio de coste y nombre del proveedor para calcular márgenes reales de beneficio.

---

## 2. Descuento Automático en Caja Rápida (/pos)

* Al realizar una venta en mostrador desde el TPV (`/dashboard/pos`), al seleccionar el producto e imprimir el ticket o confirmar el pago, **el stock se reduce automáticamente en 1 unidad**.
* Si el stock de un producto desciende por debajo de su umbral mínimo, el sistema muestra una insignia naranja de advertencia: **"Stock Bajo"**.
* Si el stock llega a cero, el TPV bloquea la venta o emite una alerta visual para evitar roturas de inventario.

---

## 3. Catálogo Dual: Servicios Web vs Venta Exclusiva en TPV

Para evitar que los clientes reserven por la web productos o conceptos que solo se cobran en mostrador:

* Puedes marcar cualquier producto o servicio como **"Solo TPV"** (desactivando la casilla "Visible en la Web").
* El producto estará disponible para cobro instantáneo en el TPV, pero permanecerá 100% invisible para los visitantes de la web pública.

> [!TIP]
> **Consejo Pro:** Usa la categoría "Solo TPV" para complementos o suplementos de cabina (ej. ampolla de tratamiento extra) que solo se deciden y cobran presencialmente.

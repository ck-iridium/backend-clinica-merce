---
title: Manual de Ayuda: Ajustes y Configuración Global
description: Guía completa y detallada para el uso del módulo de ajustes.
---

# Manual de Ayuda: Ajustes y Configuración Global

Este manual sirve como la única fuente de verdad (RAG) para guiar al usuario en el uso del panel de Ajustes y Configuración de la clínica.

## 1. Reglas de Negocio
El panel de Ajustes (`/dashboard/settings`) centraliza toda la configuración administrativa, identidad corporativa y pasarelas de pago de la clínica:
- **General:** Nombre de la clínica, NIF, datos de contacto (teléfono, email), descripción legal y URLs de redes sociales y mapas.
- **Identidad (Branding):** Carga del logo de la aplicación, favicon, selector de tipografías, selector de paletas de colores corporativos y redondeado de bordes.
- **Plantillas de Consentimiento:** Creación y modificación del redactado legal de los consentimientos informados que firmarán digitalmente los clientes.
- **Contabilidad y Facturación:** Configuración del prefijo de facturación, el siguiente número consecutivo a emitir, el tipo de IVA por defecto, y la subida de la firma y el logotipo específicos para los folios de factura A4.
- **Pasarela de Pagos (Stripe):** Conexión con Stripe para habilitar cobros en línea de fianzas en reservas web y establecer el margen de cancelación permitida.
- **Servicios a Domicilio:** Gestión del rango de cobertura en kilómetros, la dirección de operaciones y las zonas permitidas.
- **Suscripción:** Gestión del plan actual del tenant (Probookia SaaS) y facturas de suscripción.

## 2. Seguridad (RBAC)
La configuración global es un área sumamente crítica:
- **Administrador:** Acceso total y exclusivo de lectura, escritura y borrado en todas las pestañas de ajustes.
- **Recepción:** Acceso totalmente denegado. No se muestra la pestaña en el menú lateral.
- **Especialista:** Acceso totalmente denegado. No se muestra la pestaña en el menú lateral.
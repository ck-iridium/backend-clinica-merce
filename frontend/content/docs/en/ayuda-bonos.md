---
title: Manual de Ayuda: Dirección y Catálogo de Bonos
description: Guía completa y detallada para el uso del módulo de bonos.
---

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
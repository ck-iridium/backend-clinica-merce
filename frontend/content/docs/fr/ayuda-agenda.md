---
title: Manual de Ayuda: Agenda y Calendario
description: Guía completa y detallada para el uso del módulo de agenda.
---

# Manual de Ayuda: Agenda y Calendario

Este manual sirve como la única fuente de verdad (RAG) para guiar al usuario en el uso del módulo de Agenda y Calendario de la clínica.

## 1. Reglas de Negocio
El módulo de Agenda (`/dashboard/calendar`) permite la gestión de citas de pacientes y bloqueos de tiempo para los profesionales de la clínica. Los usuarios pueden:
- Visualizar la planificación diaria, semanal o mensual de citas.
- Crear nuevas citas asignando un cliente y un tratamiento específico.
- Crear bloqueos de tiempo (por descanso, formación u otros motivos) para evitar reservas.
- Editar o cancelar citas y bloqueos de tiempo existentes.
- Confirmar citas recibidas desde el portal web de reserva de pacientes.

## 2. Seguridad (RBAC)
El acceso y las acciones permitidas varían según el rol:
- **Administrador / Recepción:** Acceso total. Pueden ver todas las citas, crear, editar, reasignar, cambiar estados (incluyendo marcar citas como pagadas), gestionar bloqueos y autorizar citas web pendientes.
- **Especialista:** Acceso parcial/total a la agenda de citas, pero con restricciones financieras (no pueden realizar cobros ni ver ingresos estimados).
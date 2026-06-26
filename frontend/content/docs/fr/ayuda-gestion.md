---
title: Manual de Ayuda: Gestión Interna (Equipo, Sedes, Servicios y Mi Horario)
description: Guía completa y detallada para el uso del módulo de gestion.
---

# Manual de Ayuda: Gestión Interna (Equipo, Sedes, Servicios y Mi Horario)

Este manual sirve como la única fuente de verdad (RAG) para guiar al usuario en el uso de los módulos de Gestión (Equipo, Sedes y Servicios) y el planificador personal "Mi Horario".

---

## 1. Módulo: Equipo y Horarios (`/dashboard/team`)

### Reglas de Negocio
Permite administrar la plantilla de profesionales de la clínica:
- **Invitaciones por Correo:** Envío de enlaces de activación a nuevos miembros especificando su rol.
- **Asignación de Roles:** Administrar y cambiar los permisos (Administrador, Recepción, Especialista).
- **Planificador de Turnos (Rostering):** Configuración individual de turnos recurrentes semanales y excepciones puntuales (festivos, bajas, guardias) asociándolos a sucursales físicas.

### Seguridad (RBAC)
- **Administrador:** Acceso y control total. Único con permisos para invitar, editar roles, eliminar personal y definir cuadrantes de turnos de todo el equipo.
- **Recepción / Especialista:** Acceso denegado a la lista general del equipo.

### Acciones y Coordenadas (Selectores CSS)
- **Invitar Miembro del Equipo:** Abre el modal de registro de personal.
  - Selector: `id="team-add-member-btn"`
- **Formulario de Invitación (Modal):**
  - Nombre completo: `id="team-invite-name-input"`
  - Correo electrónico: `id="team-invite-email-input"`
  - Selector de Rol: `id="team-invite-role-trigger"`
  - Cancelar: `id="team-invite-cancel-btn"`
  - Enviar Invitación: `id="team-invite-submit-btn"`
- **Acciones en Tabla de Personal (por profesional):**
  - Configurar cuadrante de turnos del miembro `[id]`: `id="team-roster-btn-[id]"`
  - Editar rol del miembro `[id]`: `id="team-edit-role-btn-[id]"`
  - Eliminar miembro `[id]`: `id="team-delete-member-btn-[id]"`
- **Modal de Edición de Rol (Profesional):**
  - Selector de rol: `id="team-edit-role-trigger"`
  - Cancelar: `id="team-edit-cancel-btn"`
  - Guardar: `id="team-edit-submit-btn"`
- **Formulario de Roster Turnos Semanales (dentro de cuadrante):**
  - Contenedor: `id="roster-weekly-form"`
  - Selector día de la semana: `id="roster-weekly-day-trigger"`
  - Selector de Sede: `id="roster-weekly-location-trigger"`
  - Hora de inicio: `id="roster-weekly-start-input"`
  - Hora de fin: `id="roster-weekly-end-input"`
  - Agregar turno semanal: `id="roster-weekly-submit-btn"`
  - Toggle de activación de turno `[id]`: `id="roster-weekly-toggle-btn-[id]"`
  - Eliminar turno `[id]`: `id="roster-weekly-delete-btn-[id]"`
- **Formulario de Excepciones de Horario / Turno Específico:**
  - Contenedor: `id="roster-exception-form"`
  - Fecha del evento: `id="roster-exception-date-input"`
  - Selector de Sede: `id="roster-exception-location-trigger"`
  - Hora de inicio: `id="roster-exception-start-input"`
  - Hora de fin: `id="roster-exception-end-input"`
  - Agregar excepción: `id="roster-exception-submit-btn"`
  - Toggle de activación de excepción `[id]`: `id="roster-exception-toggle-btn-[id]"`
  - Eliminar excepción `[id]`: `id="roster-exception-delete-btn-[id]"`

---

## 2. Módulo: Mi Horario (`/dashboard/my-schedule`)

### Reglas de Negocio
Permite que cada profesional consulte y gestione sus propios turnos semanales y excepciones horarias de forma directa, sin tener que acceder a la administración global de personal.

### Seguridad (RBAC)
- **Administrador / Especialista:** Acceso completo para editar y autogestionar su propia disponibilidad.
- **Recepción:** Acceso bloqueado.

### Acciones y Coordenadas (Selectores CSS)
Comparte los mismos selectores del planificador de turnos del equipo, aplicados exclusivamente al perfil del usuario autenticado:
- Formulario semanal: `id="roster-weekly-form"`
- Formulario de excepciones: `id="roster-exception-form"`
- (Ver subcomponentes en el bloque de cuadrante del módulo de Equipo).

---
---
description: 
---

# Fase 5: Inteligencia del Header

Este plan detalla los pasos para dotar de funcionalidad inteligente a los elementos del Header superior, elevando la experiencia de usuario al estándar premium.

## Punto 5.1: Buscador Global (Command Palette)
- [x] **Instalación**: `cmdk` y `Radix Dialog`.
- [x] **Componente GlobalSearch**: Implementación de la paleta flotante.
- [x] **Integración**: Trigger en `DashboardHeader.tsx` con atajo `Ctrl K`.
- [x] **Navegación**: Accesos directos a Agenda y Clientes.
- [x] **Clientes Reales**: Fetch dinámico desde la API (solo al escribir).

## Punto 5.2: Sistema de Notificaciones
- [x] **Instalación**: `Radix Popover`.
- [x] **Diseño Isla Blanca**: Popover premium con sombras profundas y bordes redondeados.
- [x] **Alertas Simuladas**: Maquetación de 3 tipos de notificaciones con iconos Lucide.
- [x] **Integración**: Sustitución de la campana estática en `DashboardHeader`.

## Punto 5.3: Gestión de Roles y Equipo
- [x] **Página de Equipo**: Crear `src/app/dashboard/team/page.tsx` con estética Isla Blanca.
- [x] **Tabla de Empleados**: Diseño elegante con avatares, roles y estados de actividad.
- [x] **Restricción de Rol**: Implementar lógica `userRole !== 'admin'` para ocultar acciones de edición/creación.
- [x] **Buscador**: Añadir acceso directo "Gestionar Equipo" al `GlobalSearch.tsx`.
- [x] **Sidebar**: Añadir enlace "Equipo" al menú lateral principal.

## Verificación Planificada
- [x] Validar que la redirección desde el buscador a la nueva página de equipo funciona.
- [x] Comprobar visualmente la restricción de rol simulando un rol diferente a 'admin'.
- [x] Asegurar coherencia estética (Cormorant, rounded-2.5rem) en la nueva página.

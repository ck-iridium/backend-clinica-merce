# Fase 5: Inteligencia del Header

Este plan detalla los pasos para dotar de funcionalidad inteligente a los elementos del Header superior, elevando la experiencia de usuario al estándar premium.

## Punto 5.1: Buscador Global (Command Palette)
- [x] **Instalación**: `cmdk` y `Radix Dialog`.
- [x] **Componente GlobalSearch**: Implementación de la paleta flotante.
- [x] **Integración**: Trigger en `DashboardHeader.tsx` con atajo `⌘K`.
- [x] **Navegación**: Accesos directos a Agenda y Clientes.

## Punto 5.2: Sistema de Notificaciones
- [ ] **Diseño del Panel**:
    - [ ] Crear componente `NotificationsPopover.tsx` usando el Popover de Shadcn UI.
    - [ ] Estilo "Isla Blanca": bordes redondeados y tipografía Cormorant para el título del panel.
- [ ] **Simulación de Alertas**:
    - [ ] Maquetar 3 tipos de notificaciones:
        *   🔵 *Cita Web*: "Nueva reserva online de Lucía R."
        *   🟢 *Recordatorio*: "Juan B. ha confirmado su asistencia por email."
        *   🟠 *Aviso*: "Quedan pocos bonos de Presoterapia disponibles."
- [ ] **Integración**: Activar el botón de la campana en el Header y añadir el badge de aviso dinámico (mock).

## Punto 5.3: Gestión de Roles y Equipo
- [ ] **Interfaz de Roles**:
    - [ ] Añadir sección "Gestión de Equipo" en el buscador.
    - [ ] Crear modal básico para mostrar el personal de la clínica.
- [ ] **Restricciones visuales**:
    - [ ] Simular lógica donde ciertos menús (ej. Ajustes) solo se muestran si el rol es 'admin'.

## Verificación Planificada
- [ ] Testar atajos de teclado en diferentes navegadores.
- [ ] Validar que los popovers no se corten por el contenedor (z-index).
- [ ] Asegurar que el cierre de sesión sigue funcionando tras los cambios de jerarquía.

# Plan de Refactorización: Agenda v2 (Patrón Higuera)

Este documento detalla la estrategia para descomponer el monolito `page.tsx` de la Agenda (~1400 líneas) en componentes modulares, mantenibles y testeables.

## Objetivo
Reducir la complejidad cognitiva del archivo principal y facilitar el mantenimiento futuro sin interrumpir el funcionamiento actual del sistema (Strangler Fig Pattern).

---

## 🛠 Fase 1: Extracción de la Capa de Datos (Hook)
**Meta**: Sacar toda la lógica de estado y API del componente visual.
- [x] Crear `src/components/calendar-v2/hooks/useCalendarData.ts`.
- [x] Mover estados de `appointments`, `clients`, `services`, `settings`.
- [x] Mover función `fetchData`.
- [x] Mover helpers de tiempo (`isLunchTime`, `getMonday`, `formatLocalISO`).

## 🛠 Fase 2: Componentes Atómicos (AppointmentCard)
**Meta**: Aislamiento de la lógica de renderizado de las citas.
- [x] Crear carpeta `src/components/calendar-v2/`.
- [x] Crear archivo `AppointmentCard.tsx`.
- [x] Definir interfaces de Props (Appointment, Client, Service).
- [x] Portar función `getStatusColors`.
- [x] Portar JSX de renderizado con soporte para Desktop y Mobile.
- [x] Exportar componente para uso futuro.

## 🛠 Fase 3: Navegación y Controles
**Meta**: Externalizar la gestión de fechas y headers.
- [x] Crear `CalendarHeader.tsx`.
- [x] Unificar lógica de navegación de semanas y DatePicker.
- [x] Soporte para la inyección de Portals en Mobile.

## 🛠 Fase 4: Grid Modular y Escalas
**Meta**: Limpiar el bucle de renderizado del calendario.
- [x] Crear `TimeScale.tsx` (Eje vertical y guías horizontales).
- [x] Crear `DayColumn.tsx` (Contenedor por día).
- [x] Crear `EmptySlot.tsx` (Zonas clicables para crear citas).

## 🛠 Fase 5: Orquestador de Modales
**Meta**: Eliminar los cientos de líneas de modales del archivo principal.
- [x] Crear `CalendarModals.tsx`.
- [x] Refactorizar `AppointmentForm`, `EditAppointmentForm` y `BlockForm` como sub-componentes.

---

## ✅ Próximos pasos inmediatos (Fase 2)
1. **Definición de Props en `AppointmentCard.tsx`**:
    ```typescript
    interface AppointmentCardProps {
      appointment: any;
      client: any;
      service: any;
      onClick: (appt: any) => void;
      onMouseEnter?: (e: any, appt: any) => void;
      onMouseLeave?: () => void;
      isMobile?: boolean;
      customStyle?: React.CSSProperties;
    }
    ```
2. **Implementación de `getStatusColors`** dentro del componente para encapsular el estilo.
3. **Migración del JSX**: Se copiará el bloque de renderizado actual asegurando la compatibilidad con Tailwind.

---
*Nota: Este plan se ejecutará gradualmente. El archivo page.tsx se mantendrá funcional en todo momento.*

# Plan de Evolución: Agenda SaaS Profesional (Estilo Booksy)

Este plan detalla la transición de la agenda actual a un modelo de pantalla completa (Edge-to-Edge) con una arquitectura de dos columnas, optimizando el espacio y la funcionalidad para un entorno profesional.

## [x] Fase 1: Arquitectura de Rutas y Layout Fullscreen
*Aislamiento de la agenda del layout estándar del dashboard para control total del espacio.*

- [x] Crear el Route Group `(fullscreen)` en `src/app/dashboard/(fullscreen)`.
- [x] Mover la ruta de la agenda de `src/app/dashboard/calendar` a `src/app/dashboard/(fullscreen)/calendar`.
    - *Nota: Se mantienen las URLs originales mientras se personaliza el layout.*
- [x] Crear el archivo `src/app/dashboard/(fullscreen)/layout.tsx`:
    - [x] Cargar `DashboardSidebar` y `MobileBottomBar`.
    - [x] **NO** incluir `DashboardHeader`.
    - [x] Definir contenedor `h-screen overflow-hidden`.
- [x] Refactorizar la raíz `src/app/dashboard/layout.tsx` para delegar el header al grupo `(standard)`.
- [x] Verificar que el scroll y el header se comportan correctamente en cada grupo.

## [x] Fase 2: La Columna Contextual (ContextPanel)
*Centralización de herramientas auxiliares en una barra lateral persistente (Right Sidebar).*

- [x] Crear el componente `src/components/calendar-v2/ContextPanel.tsx`.
- [x] Integrar **Cabecera**: Perfil de administrador + Notificaciones integradas.
- [x] Integrar **Búsqueda**: UI para el buscador rápido de clientes y reservas.
- [x] Implementar **Mini-Calendario / DatePicker**:
    - [x] Diseño "Luxury" adaptado al nuevo panel lateral.
    - [x] Maquetación de la rejilla de navegación rápida.
- [x] Añadir sección de **Filtros Visuales**: Estados de cita y pago.

## [x] Fase 3: Ensamblaje Responsivo y Acabado Edge-to-Edge
*Conexión de las piezas y optimización visual definitiva.*

- [x] Refactorizar `src/app/dashboard/(fullscreen)/calendar/page.tsx`:
    - [x] Estructura Flexbox Desktop: `[ContextPanel]` (left) + `[Agenda]` (right).
    - [x] Sincronización de datos básica (clinicName, selectedDate) entre componentes.
- [x] Aplicar los márgenes "Naturales" (10px - p-2.5) para el efecto isla.
- [x] **Optimización Responsiva**:
    - [x] Desktop: Columnas fijas con scrolls independientes y `overflow-hidden` en el viewport.
    - [x] Móvil: ContextPanel oculto, manteniendo la prioridad en la grilla diaria.
- [x] Pulido final: Bordes `rounded-[2rem]` y sombras profundas para destacar el canvas central.

## [x] Verificación Final
- [x] Comprobar navegación: `/dashboard/calendar` carga el nuevo layout limpio.
- [x] Validar scroll: Solo se desplazan las columnas internas (Panel y Grilla).
- [x] Estabilidad: Sin errores de hidratación ni de compilación detectados.

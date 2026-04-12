# Fase 4: Rediseño del Dashboard Home (Estilo Heygen)

Este documento detalla la hoja de ruta para transformar el "Home" del Dashboard y su Header superior en una interfaz premium siguiendo el estándar visual establecido.

## Punto 4.1: Refactorización del Header Superior (layout.tsx)

- [x] **Perfil de Usuario**:
    - [x] Sustituir el botón estático de "Administrador" por un `DropdownMenu` de Shadcn UI.
    - [x] Integrar botón de **Cerrar Sesión** dentro del dropdown.
    - [x] Añadir ítems "Mi Perfil" y "Gestión de Usuarios" (links deshabilitados por ahora).
- [x] **Buscador y Campana**:
    - [x] Actualizar iconos a Lucide 1.5 (`strokeWidth={1.5}`).
    - [x] Deshabilitar visualmente (`opacity-50`) o dejar como placeholder hasta su implementación lógica.

## Punto 4.2: Estructura Principal y Acciones Rápidas (page.tsx)

- [x] **Limpieza de "Header antiguo"**: Eliminar el header interno de `page.tsx` (el que tiene el botón de Cerrar Sesión suelto).
- [x] **Título de Bienvenida**:
    - [x] Implementar fuente **Cormorant Garamond** (`font-serif`).
    - [x] Texto dinámico: "Bienvenida de nuevo, Mercè".
- [x] **Barra de Acciones Rápidas**:
    - [x] Fila de botones premium (estilo Isla Blanca).
    - [x] Acciones: `[+ Nueva Cita]`, `[+ Nuevo Cliente]`, `[Cobro Rápido]`.

## Punto 4.3: Grid de Métricas Diarias (Widgets)

- [x] **Rediseño de Widgets**:
    - [x] Grid de 4 tarjetas compactas (`rounded-[2.5rem]`, `shadow-sm`, `bg-white`).
    - [x] **Métricas Diarias** (Conexión Real/Mock):
        - [x] "Citas de Hoy" (Mock: 8 - Preparado para lógica).
        - [x] "Nuevos Clientes" (Real: basado en length de clientes).
        - [x] "Ingresos Estimados" (Mock: 450€).
        - [x] "Tasa de Ocupación" (Mock: 85%).

## Punto 4.4: Panel de Próximas Citas

- [x] **Lista de Seguimiento**:
    - [x] Creación del bloque "Tu Día de un Vistazo".
    - [x] Listado de citas REALES filtradas por fecha de hoy.
    - [x] Diseño de filas con Hora, Cliente y Tratamiento.
    - [x] **Empty State**: Diseño elegante con `CalendarCheck` cuando no hay citas.

🛑 **REGLA DE ORO**: Solo maquetación y UI. La lógica de datos reales (fetch) se ha integrado donde ha sido posible sin romper la estructura.

# Fase 4: Rediseño del Dashboard Home (Estilo Heygen)

Este documento detalla la hoja de ruta para transformar el "Home" del Dashboard y su Header superior en una interfaz premium siguiendo el estándar visual establecido.

## Punto 4.1: Refactorización del Header Superior (layout.tsx)

- [ ] **Perfil de Usuario**:
    - [ ] Sustituir el botón estático de "Administrador" por un `DropdownMenu` de Shadcn UI.
    - [ ] Integrar botón de **Cerrar Sesión** dentro del dropdown.
    - [ ] Añadir ítems "Mi Perfil" y "Gestión de Usuarios" (links deshabilitados por ahora).
- [ ] **Buscador y Campana**:
    - [ ] Actualizar iconos a Lucide 1.5 (`strokeWidth={1.5}`).
    - [ ] Deshabilitar visualmente (`opacity-50`) o dejar como placeholder hasta su implementación lógica.

## Punto 4.2: Estructura Principal y Acciones Rápidas (page.tsx)

- [ ] **Limpieza de "Header antiguo"**: Eliminar el header interno de `page.tsx` (el que tiene el botón de Cerrar Sesión suelto).
- [ ] **Título de Bienvenida**:
    - [ ] Implementar fuente **Cormorant Garamond** (`font-serif`).
    - [ ] Texto dinámico: "Bienvenida de nuevo, Mercè".
- [ ] **Barra de Acciones Rápidas**:
    - [ ] Fila de botones premium (estilo Isla Blanca).
    - [ ] Acciones: `[+ Nueva Cita]`, `[+ Nuevo Cliente]`, `[Cobro Rápido]`.

## Punto 4.3: Grid de Métricas Diarias (Widgets)

- [ ] **Rediseño de Widgets**:
    - [ ] Grid de 4 tarjetas compactas (`rounded-[2.5rem]`, `shadow-sm`, `bg-white`).
    - [ ] **Métricas Diarias** (Statically mocked):
        - [ ] "Citas de Hoy" (Icono: Calendar).
        - [ ] "Nuevos Clientes" (Icono: Users).
        - [ ] "Ingresos Estimados" (Icono: Banknote).
        - [ ] "Tasa de Ocupación" (Icono: Activity).

## Punto 4.4: Panel de Próximas Citas

- [ ] **Lista de Seguimiento**:
    - [ ] Creación del bloque "Tu Día de un Vistazo".
    - [ ] Listado de 3 citas simuladas con diseño minimalista (Hora, Cliente, Tratamiento).

🛑 **REGLA DE ORO**: Solo maquetación y UI. La lógica de datos reales (fetch) se mantiene intacta donde ya exista.

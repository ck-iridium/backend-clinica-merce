# Plan de Refactorización: Optimización Vertical del Dashboard y Sidebar

## Fase 1: Preparación del Sidebar (Estructura y Componentes Base)
- [x] **1.1. Modificar Estructura Base del Sidebar:** Abre `frontend/src/components/DashboardSidebar.tsx`. Ajusta la estructura flex para tener un `Slot Superior` (Logo + Búsqueda), un `Slot Central` (Navegación principal) y un `Slot Inferior` (Notificaciones + Perfil).
- [x] **1.2. Integrar Estado de Búsqueda:** Añade el estado `const [searchOpen, setSearchOpen] = useState(false);` en el Sidebar para controlar el `GlobalSearch`.
- [x] **1.3. Listener de Teclado (Ctrl+K):** Migra el `useEffect` que escucha `Ctrl+K` desde `DashboardHeader.tsx` hacia `DashboardSidebar.tsx`.

## Fase 2: Migración de Utilidades
- [x] **2.1. Mover Trigger de Búsqueda (Lupa):** En el *Slot Superior* del Sidebar (justo debajo del logo), añade un botón con el icono de `Search` (lucide-react). Al hacer click, debe hacer `setSearchOpen(true)`. Aplica estilos consistentes (hover, colores) para que coincida con los otros iconos. Añade un tooltip similar al de los otros navLinks que diga "Buscar (Ctrl+K)".
- [x] **2.2. Importar y Renderizar GlobalSearch:** Importa `GlobalSearch` en el Sidebar y colócalo al final del return: `<GlobalSearch open={searchOpen} setOpen={setSearchOpen} />`.
- [x] **2.3. Mover Notificaciones:** Importa `NotificationsPopover` en el Sidebar. Ubícalo en el *Slot Inferior*, justo encima o al lado del icono de Perfil (`User`). Ajusta el estilo para que encaje en el ancho fijo del sidebar (20px/3rem aprox) sin romper el diseño.

## Fase 3: Agrupación Desktop (UX) - "Gestión Avanzada"
- [x] **3.1. Crear el componente Flyout:** Importa `Popover` o usa `DropdownMenu` (con `side="right"`) en `DashboardSidebar.tsx` para agrupar elementos.
- [x] **3.2. Configurar "Gestión Avanzada":** En la lista `navLinks`, identifica y elimina los elementos: Facturas, Servicios, Bonos y Equipo.
- [x] **3.3. Implementar el Menú Desplegable:** En el *Slot Central* (después de la navegación principal), añade un nuevo ítem "Gestión Avanzada" con el icono `LayoutDashboard` o similar. Al hacer click/hover (según el componente usado, idealmente DropdownMenu de shadcn o Popover), se debe abrir un menú hacia la derecha (`side="right" align="start"`) que contenga los accesos a Facturas, Servicios, Bonos y Equipo. *NOTA: Respeta las reglas de Rol (recepción, especialista) dentro de este menú desplegable tal como se hace en la lista principal.*

## Fase 4: Refactorización del Layout y Eliminación del TopBar
- [x] **4.1. Eliminar DashboardHeader:** Abre `frontend/src/app/dashboard/(standard)/layout.tsx`. Elimina la importación y el renderizado del componente `<DashboardHeader />`.
- [x] **4.2. Ajustar Paddings/Margins:** En el mismo archivo `(standard)/layout.tsx`, ajusta el contenedor principal `div`. Cambia las clases para que el padding superior sea mucho menor en Desktop (`md:pt-8` a algo como `md:pt-4`), aprovechando el nuevo espacio ganado verticalmente.
- [x] **4.3. Eliminación de Archivo:** Una vez que `GlobalSearch` y notificaciones estén integrados exitosamente en el Sidebar, elimina el archivo obsoleto `frontend/src/components/DashboardHeader.tsx`.
- [x] **4.4. Verificación de Rutas (Agenda):** El layout de la Agenda en `(fullscreen)/layout.tsx` no renderiza el TopBar original, por lo que NO se verá afectado por su eliminación en el layout estándar. Sin embargo, asegúrate de que el ancho fijo del `DashboardSidebar` (`w-20`) se mantenga exactamente igual para no descuadrar el calendario.

## Fase 5: Pulido de Estilos y Aseguramiento de Calidad
- [ ] **5.1. Revisión de Tooltips:** Verifica que los Tooltips personalizados (Cápsula Flotante) del Sidebar sigan renderizándose correctamente por encima del `overflow` y no queden cortados.
- [ ] **5.2. Control de Altura Total:** Asegúrate de que el área de contenido en `(standard)/layout.tsx` ocupe el `100%` de la altura (`min-h-screen`) y no genere barras de scroll dobles inesperadas.
- [ ] **5.3. Responsividad Móvil:** Verifica que en móvil el `DashboardSidebar` (y su nueva lógica) no interfiera con el `MobileBottomBar` ni rompa el diseño del logo en la esquina superior izquierda.

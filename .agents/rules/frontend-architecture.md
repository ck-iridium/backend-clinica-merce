# Arquitectura Frontend: Evitar Monolitos y Fomentar SRP (Single Responsibility Principle)

Este documento es obligatorio para el desarrollo y estructuración del frontend. Las siguientes reglas son estrictas y deben ser seguidas para asegurar la mantenibilidad y el patrón "Quiet Luxury" a largo plazo.

## 1. Límite de Tamaño de Archivo
- **REGLA CRÍTICA:** Ningún componente funcional de React, incluidos los archivos de página (`page.tsx` o `page.jsx`), debe superar las **250-300 líneas de código**.
- Si un archivo se acerca a este límite, es un claro indicador de que está asumiendo demasiadas responsabilidades y debe dividirse inmediatamente.

## 2. Separación Contenedor vs. Presentación
- Los archivos de nivel superior de las rutas de Next.js (`page.tsx`) deben actuar **únicamente como orquestadores**.
- Responsabilidades permitidas en `page.tsx`:
  - Fetching inicial de datos y gestión del estado global del módulo (Hooks, Reducers).
  - Comprobaciones de autenticación y redirecciones (RBAC).
  - Declaración del layout principal de la vista (estructura envolvente).
- Todo bloque de UI significativo (Tablas, Listas, Modales, Formularios) debe vivir en componentes hijos aislados.

## 3. Aislamiento de Modales y Formularios
- **Múltiples Modales = Múltiples Archivos.** Nunca agrupes múltiples componentes `<Dialog>` o `<Modal>` dentro del mismo `page.tsx`.
- Cada modal debe tener su propio archivo dentro del subdirectorio `/components` de la ruta actual, o en `@/components/` si es compartido.
- Esto aísla el estado local y evita re-renderizados costosos en toda la vista de la página cuando se teclea en un formulario.

## 4. Estructura de Directorios para Módulos Complejos
Si un módulo (ej: "Vouchers", "CMS", "Services") tiene alta interactividad, aplica esta estructura local:
```
(module-name)/
├── page.tsx               // Contenedor principal y fetching.
└── components/            // Sólo componentes utilizados localmente.
    ├── ModuleTable.tsx
    ├── CreateModal.tsx
    └── EditModal.tsx
```

## 5. Criterio de Estrangulamiento (Strangler Fig)
- Si interactúas con un archivo heredado monolítico (legacy) mayor a 500 líneas:
  - **No intentes editar en línea grandes bloques de JSX dentro del monolito**.
  - En su lugar, aplica el *Patrón de Estrangulamiento* (Strangler Fig): extrae primero el bloque que vas a editar a un nuevo componente en `/components`, implementa tus cambios en ese nuevo archivo aislado y reemplázalo en el monolito.

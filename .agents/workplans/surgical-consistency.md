# Plan de Consistencia Quirúrgica (Heygen Standard)

Este documento detalla el plan de acción para unificar la estética del Dashboard de Estética Merce bajo el estándar 'SaaS Premium', asegurando que la lógica de negocio permanezca intacta. 

> [!IMPORTANT]
> **REGLA DE ORO**: Está prohibido modificar la lógica de los `useEffect`, handlers `onChange` o lógica de cálculos (tiempos en Agenda, precios en Bonos). Solo se permite el cambio de markup decorativo y componentes visuales.

## Puntos de Control y Tareas

### 1. Iconografía (Lucide 1.5, size 18)
Sustitución de emojis y elementos antiguos por una estética minimalista monocroma.

- [ ] **Categorías**: Eliminar el icono de 'rosca' y carpetas amarillas (📁).
- [ ] **Acciones**: Sustituir emojis de papeleras (🗑️), ajustes (⚙️) y lápices (✏️) por iconos minimalistas de Lucide.
- [ ] **Backups y CMS**: Limpiar los iconos de descarga (📥) y advertencia (⚠️) por versiones de trazo fino.

### 2. Componentes y Formularios (Shadcn UI)
Sustitución de elementos nativos por el sistema de diseño basado en Radix UI.

- [ ] **Selects**: Cambiar selectores nativos por el componente `Select` de Shadcn/Radix en:
  - Agenda (Modales de cita/bloqueo)
  - Bonos (Vouchers)
  - Servicios (Categorías/Estados)
- [ ] **Densidad Visual**: Redimensionar inputs para que sean compactos y elegantes. Ajustar padding y anchos (especialmente en precios).
- [ ] **Ajustes Generales**: 
  - Eliminar encabezados rojos.
  - Aplicar títulos en **Cormorant Garamond**.
  - Envolver secciones en tarjetas estilo **'Isla Blanca'** (`rounded-[2.5rem]`, `shadow-sm`, `border-stone-100`).

### 3. Integración de Lógica y Medios
Modernización de la carga de archivos y corrección de capas.

- [ ] **MediaPicker**: 
  - Eliminar inputs `type="file"` nativos.
  - Conectar los triggers de categorías y servicios al `MediaPickerModal` centralizado.
- [ ] **Z-Index**: Revisar y corregir el sistema de capas de la galería para que siempre se renderice por encima de otros modales.

---

## Estrategia de Ejecución Sequencial

1. **Aprobación de la Lista**: El usuario valida este archivo.
2. **Punto a Punto**: Se ejecutará UNA tarea a la vez.
3. **Validación Visual**: El usuario confirma con el browser-in-the-loop antes de pasar al siguiente punto.

## Verificación de Riesgos
- [ ] Verificar que el componente `Select` de Shadcn no rompa el tipado de IDs en los formularios.
- [ ] Asegurar que `use client` esté presente en todas las páginas que utilicen Framer Motion o Radix.

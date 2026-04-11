# Design System: SaaS-Premium UI

Este proyecto implementa una normativa visual y arquitectónica estrictamente enfocada en el lujo (Clínicas Love) combinado con la tecnología SaaS (Heygen).

## 1. Reglas Globales (No Negociables)
- **Cero funciones nativas UI**: Prohibido usar `window.alert()`, `window.confirm()` o similares. Todo se rutea mediante `FeedbackContext` y modales de Radix/Shadcn.
- **Skeletons en lugar de Spinners**: Para cargas de pantalla completa o listas pesadas prolongadas, usar `<Skeleton />` en lugar de spinners genéricos para evitar fatiga visual y layout shifts.
- **Sutileza Premium**: No usar colores puros saturados (como #FF0000). Usar tonos de la paleta centralizada (Tailwind config).

## 2. Tipografía
- **Títulos y Encabezados**: Familia Serif (`Cormorant Garamond` o alternativamente `Playfair Display`). Clases como `font-serif`.
- **Cuerpo, Data y UI**: Familia Sans-serif robusta (`Inter`). Limpia profunda y sin distracciones.

## 3. Paleta Principal (Crema & Oro)
- **Backgrounds Base (Lienzo global)**: Tonos crema super claros (`#FAFAFA`, `#FFFBF5` definidos en `--background`).
- **Surface (Island Cards)**: Blanco puro (`#FFFFFF`) para tarjetas o paneles que flotan sobre el lienzo crema.
- **Acentos (CTA)**: Dorado apagado/lujoso (como `#D4AF37`) y Gris Carbón/Antracita oscuro (`#1c1917` o zinc-900) para botones invertidos.

## 4. Estilos de Componentes V2
- **Bordes y Sombras**: Usar `border-stone-100` o `stone-200` y sombras difuminadas (`shadow-sm` constante, `shadow-xl` / `shadow-2xl` para popovers y modales con soft-glow effect).
- **Esquinas**: Curvatura constante con `rounded-2xl` para contenedores grandes, `rounded-xl` para botones e inputs.
- **Micro-animaciones**: Uso extenso de transiciones Tailwind (`transition-all duration-300`) en hover cards. Componentes críticos como modales usarán `framer-motion` para aparición elástica con física *spring*.

**Recordatorio al Agente**: Cada nuevo componente debe respetar el espacio en blanco absoluto (márgenes consistentes). Menos es más.

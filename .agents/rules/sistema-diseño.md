---
trigger: always_on
---

# Design System: SaaS-Premium UI

OBJETIVO: Estética de lujo (Clínicas) + SaaS Moderno.

1. REGLAS CRÍTICAS:
- PROHIBIDO: Funciones nativas (`window.alert`, `window.confirm`). Usar solo `FeedbackModal`.
- OBLIGATORIO: Usar `<Skeleton />` para cargas largas. Prohibido spinners genéricos.
- COLORES: Lienzo Crema (`#FAFAFA`), Tarjetas Blancas, Acentos Dorado (`#D4AF37`) y Antracita (`#1c1917`).

2. TIPOGRAFÍA Y ESTILO:
- Títulos: Serif (`font-serif` / Cormorant Garamond).
- UI/Cuerpo: Sans (`Inter`).
- Bordes: `rounded-2xl` para contenedores, `rounded-xl` para botones.
- Sombras: Difuminadas y suaves (`shadow-sm` o `shadow-xl` en modales).

3. COMPORTAMIENTO:
- Transiciones: Siempre `transition-all duration-300`.
- Espaciado: Máximo respeto al espacio en blanco. Menos es más.
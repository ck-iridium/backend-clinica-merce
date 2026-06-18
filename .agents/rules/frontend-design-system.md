---
trigger: always_on
---

# FRONTEND DESIGN SYSTEM: QUIET LUXURY 2026

Este documento define las directrices estéticas y técnicas obligatorias para el desarrollo del frontend de **Clínica Merce**.

## 1. Filosofía Estética
- **Borderless**: Evitar el uso excesivo de bordes divisorios. El contenido se separa por espacios (`py-24`, `gap-12`) o sutiles cambios de fondo.
- **Bento Grid**: Utilizar layouts basados en cuadrículas asimétricas y modulares para presentar servicios o información destacada.
- **Quiet Luxury**: Diseño que respira. Primar el espacio en blanco para transmitir exclusividad y calma.

## 2. Paleta de Colores
- `brand-gold` (#d4af37): Color de acento principal. Uso exclusivo para llamadas a la acción, iconos destacados y detalles de lujo.
- `brand-dark` (#1F2937): Color para tipografía principal y fondos de alto contraste.
- `brand-surface` (#F7F7F5): Crema ultra suave. Fondo base para secciones que necesiten diferenciarse del blanco absoluto.

## 3. Tipografía
- **Títulos (`font-serif`)**: *Playfair Display*. Elegancia atemporal.
- **Cuerpo (`font-sans`)**: *Inter*. Claridad y modernidad.

## 4. Componentes UI
- **Radios**: Tarjetas de tratamientos y contenedores principales siempre con `rounded-3xl` (24px) o `rounded-2xl` (16px). `overflow-hidden` obligatorio.
- **Sombras**: Prohibidas las sombras duras. Usar solo sombras suaves y difusas (`shadow-sm` o custom `shadow-luxury`) para dar volumen sin ensuciar el diseño.
- **Header**: "Sticky Glassmorphism". Al inicio es 100% transparente. Al hacer scroll, adquiere un desenfoque (`backdrop-blur-md`) y fondo semitransparente.
- **Mega Menú**:
  - Desktop: Panel interactivo.
  - Izquierda: Listado limpio de categorías con hover de marca.
  - Derecha: Mosaico visual con mini-vídeos o imágenes de alta calidad al pasar el raton.

## 5. Espaciado (Regla de Oro)
- Nunca tener miedo al espacio. Secciones principales con `py-24` o `py-32`.
- Gap entre elementos en Bento Grid: `gap-6` o `gap-8`.

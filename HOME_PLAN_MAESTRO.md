# HOME_PLAN_MAESTRO: APPLE MODE 2026

Este documento define la visión final de la Home de Clínica Merce, priorizando la elegancia "Quiet Luxury" y una experiencia móvil de primer nivel.

## 1. Fase 2: Hero Inmersivo (Edge-to-Edge) [COMPLETADA]
- **Desktop/Mobile**: `h-screen`, tipografía Playfair Display, alineación dinámica.
- **Backend**: Vinculación total con `site_content`.

## 2. Fase 3: Rejilla de Tratamientos (Apple "Descubre" Style) [EN PROCESO]
### Layout Móvil (Snap Carousel)
- **Estructura**: Scroll horizontal infinito/limpio con `snap-x snap-mandatory`.
- **Tarjetas**: `aspect-[4/5]`, ocupando el 85% del ancho de pantalla.
- **Interacción**: `IntersectionObserver` para autoplay de vídeo silenciado al centrar la tarjeta.
- **Final de Fila**: "Tarjeta de Cierre" elegante con enlace directo a Booksy.

### Layout Desktop (Bento Grid)
- **Estructura**: Rejilla Bento asimétrica (3 columnas, filas variables).
- **Estética**: Borderless, `gap-8`, fondos `stone-50` o `white` alternos.
- **Hover**: "Efecto Estrella" (crossfade a vídeo 1000ms).

## 3. Fase 4: Integración Global & UX Final [PENDIENTE]
### Reservas (Booksy)
- **FAB (Floating Action Button)**: Botón dorado en esquina inferior derecha (`bottom-8 right-8`).
- **Efecto**: `backdrop-blur-md`, color `#D4AF37`, texto "Reservar".
- **Lógica**: Visible solo después de superar el Hero.

### Navegación Dinámica
- **Header**: Glassmorphism con cambio de contraste automático según el fondo.
- **Logo/Burger**: Inversión de color (blanco/negro) reactiva al scroll.

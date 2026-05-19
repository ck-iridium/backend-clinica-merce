# SUPER ADMIN DESIGN SYSTEM: PROBOOKIA CONSOLE 2026

Este documento define las directrices estéticas y técnicas obligatorias para el desarrollo del panel global de Super Admin de **Probookia**.

## 1. Filosofía Estética
- **Asymmetric Two-Column Bento**: Layout principal dividido en una barra de navegación ultra compacta, una lista Bento intermedia y una vista detallada espaciosa.
- **Micro-interacciones Límpias**: Todo elemento interactivo debe responder con transiciones de escala suaves (`active:scale-95 transition-all duration-300`).
- **Quiet Luxury Enterprise**: Uso de contrastes sutiles y bordes pulidos para transmitir control y exclusividad global.

## 2. Paleta de Colores
- `saas-primary` (#1F2937): Gris antracita premium para tipografía y fondos oscuros de control.
- `saas-accent` (#D4AF37): Oro platino para resaltar estados activos de suscripciones o elementos VIP de facturación.
- `saas-bg` (#FAFAFA): Lienzo crema suave que reduce la fatiga visual.
- `saas-card-border` (rgba(28, 25, 23, 0.05)): Bordes hiper suaves para estructurar el Bento Grid sin saturar visualmente.

## 3. Tipografía
- **Títulos**: *Playfair Display* (Serif) para cabeceras y títulos de clínicas principales.
- **UI / Datos**: *Inter* o *JetBrains Mono* (Sans/Mono) para métricas, identificadores de Stripe y estados técnicos.

## 4. Componentes UI Obligatorios
- **Indicador de Salud SVG**: Todo listado de clínicas debe mostrar de forma inline un gráfico de progreso circular SVG con el porcentaje de actividad de la semana actual.
- **Acciones Críticas Aisladas**: Los botones de acción destructiva o suspensión deben estar situados en la cabecera de la columna detallada para evitar clics accidentales en la lista.
- **Tabs Horizontales Limpios**: Las vistas de configuración del inquilino se segmentan en pestañas con transiciones fluidas de borde inferior.

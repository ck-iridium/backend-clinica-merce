---
description: 
---

# Mega Plan: Transformación SaaS-Premium

## 1. Análisis de ADN (Referencias)

### IDENTIDAD VISUAL (La Piel) - *Inspiración: Clínicas Love*
*   **Colores Elegantes:** Tonos cremas/marfil cálidos (`#FAFAFA`, `#FFFBF5`), dorados refinados para CTAs/Acentos (`#D4AF37`, `#C5A028`) y negros/gris antracita oscuro para el texto y contraste profundo.
*   **Jerarquía Tipográfica:** Una fuente Serif impecable (como *Playfair Display* o *Cormorant Garamond*) para encabezados que transmiten lujo y confianza clínica, combinada con una Sans-serif moderna y limpia (como *Inter* o *Plus Jakarta Sans*) para cuerpos de texto e interfaces densas en datos.
*   **Respiración Visual (Espacios en Blanco):** Márgenes expansivos y padding generoso que eliminan la claustrofobia de los paneles antiguos y dirigen la mirada guiando sin saturar.

### SISTEMA DE INTERACCIÓN (El Motor) - *Inspiración: Heygen*
*   **Menús Inteligentes (Radix):** Menús desplegables (Dropdowns) de respuesta rápida con física natural. Popovers que brindan contexto in-situ sin necesidad de recargar la página.
*   **Progressive Disclosure:** Exposición paulatina de acciones. Se esconde lo secundario detrás de botones o ellipsis, simplificando la interfaz masivamente hasta que el usuario activa interacciones.
*   **Micro-animaciones (Framer Motion):** Transiciones sutiles (fade-ins, paneles que se deslizan elásticamente) que logran la pátina táctil de una aplicación "App Nativa V2".
*   **Skeletons de Carga:** Adiós a los parpadeos inestables al cargar datos. Uso de espectros ("skeleton containers") que pulsan muy suavemente conservando la inercia visual y distribución antes del render de la base de datos.

## 2. Fases de Implementación

### Fase 1: Foundations (Arquitectura de Diseño)
*   **Stack UI:** Instalación y configuración profunda de **Shadcn/ui** (basado en Radix Primitives) para un robusto esqueleto accesible.
*   **Theme y Tokens de Tailwind:** Configurar centralizadamente la paleta clínica en las variables CSS globales (`--primary`, `--background`, `--accent`, `--border`).
*   **Sensación Premium (Radios y Bordes):** Establecer los sutiles y elegantes bordes a 1px (`border-stone-100/200`), las sombras levísimas y elevadoras tipo `soft-glow` y los radios de caja con `rounded-2xl` y `rounded-xl`.
*   **Dependencias Extra:** Integrar `framer-motion` y los iconos limpios de `lucide-react` (si faltan versiones específicas).

### Fase 2: The Shell (La Carcasa Inteligente)
*   **Rediseño del Layout Maestro:** Un lienzo crema que aloja "islas de contenido" en blanco puro levitando encima.
*   **Sidebar Compacto / Hover Inteligente:** Transformación del menú lateral pesado a un menú inteligente colapsable. La pantalla grande mostrará íconos, pero reaccionará dinámicamente o utilizará agrupaciones elegantes.
*   **Topbar (Command Center):** Minimapa y cabecera esmerilada (`backdrop-blur`) donde habitan las acciones rápidas del perfil.

### Fase 3: Component Layering
*   **Tablas que Respiran:** Refactorizar las listas y facturas actuales. Remoción de las "cajas-prisión". Los registros ahora aparecerán estéticamente listados y amplios.
*   **Dot-Menu de Acciones (Heygen-Style):** En cada cliente/servicio el nuevo menú será un `DropdownMenu` que, con un clic sobre 3 puntitos finos, desglosa las opciones como "Ver", "Editar", "Borrar".
*   **Modales Fluidos (Dialogs):** Interacciones donde los overlays desenfocan todo y centran el diálogo clave, descartando el salto drástico en las pantallas.

### Fase 4: Micro-interactions & Polish
*   **Componentes de Carga (Skeletons):** Aplicar `<Skeleton />` en vistas que tarden fracciones en montar (CMS, panel Clientes).
*   **Transiciones Inter-Página:** Crear un envoltorio `AnimatePresence` simple pero letal mediante `framer-motion` para suavizar cualquier salto brusco de Next.js.

---

## User Review Required

> [!IMPORTANT]
> **Decisión Tipográfica Clave:**
> Propongo la dupla de **Cormorant Garamond** (Lujo/Serif para encabezados pesados/login) envuelta sobre **Inter** (Máxima fluidez SaaS para paneles y formularios). ¿Estás de acuerdo con este dúo o preferirías emparejar "Playfair Display" con "Roboto/Geist"?

> [!NOTE]
> Una vez apruebes el plan, redactaré la normativa del proyecto en `.agents/rules/design-system.md` e iniciaremos de inmediato la Fase 1 en el código.

# Manual de Ayuda: Editor Web y CMS (Gestor de Contenidos)

Este manual sirve como la única fuente de verdad (RAG) para guiar al usuario en el uso del módulo de Editor Web, CMS y Gestor de Páginas de la clínica.

## 1. Reglas de Negocio
El panel de Editor Web y CMS centraliza la gestión del portal público de la clínica y sus subpáginas:
- **Hub de CMS (`/dashboard/cms`):** Panel principal estilo Bento Grid con accesos a la edición de la portada principal (Home Builder), el menú dinámico de navegación superior, los estilos globales de branding y el gestor de páginas independientes.
- **Home Builder (Editor de Portada):** Permite configurar de forma visual las secciones que componen la página de inicio pública:
  - **HERO:** Imagen o vídeo de fondo, título principal, subtítulo, y botón de acción directa (con texto y enlace personalizado). Permite configurar:
    - *Alineación Vertical:* Superior (`top`), Centrado (`center`), Inferior (`bottom`).
    - *Alineación Horizontal:* Izquierda (`left`), Centrado (`center`), Derecha (`right`).
    - *Tamaño del Título (H1):* `medium` (Mediano), `large` (Grande - por defecto), `xl` (Monumental / XL).
    - *Ancho Máximo del Título (`hero_title_max_width`):* Control deslizante del 30% al 100% que acota la amplitud del titular para favorecer quiebres de línea editoriales sin afectar al resto de elementos.
    - *Tamaño del Subtítulo:* `small` (Discreto), `medium` (Equilibrado - por defecto), `large` (Destacado).
    - *Bloque de Precio / Oferta Destacada (`hero_price_enabled`):* Disposición en 2 columnas armónicas. Muestra al lado del título un bloque de gran impacto visual que iguala la altura del conjunto título+subtítulo con prefijo refinado (ej: "Desde"), cifra en tipografía serif de lujo y símbolo de divisa o unidad ("€", "$").
    - *Estilos del Botón de Acción (`hero_button_style`):* Variantes `glass` (cristalino moderno con hover dorado), `gold_solid` (dorado joya de lujo), `outline` (borde fino minimalista) y `solid_white` (blanco contraste).
    - *Selector Inteligente de Enlaces (Smart Link Picker):* Modal interactivo que permite vincular el botón directamente a páginas clave (`/reservar`, contacto), tratamientos específicos o categorías sin necesidad de teclear o copiar URLs manualmente.
    - *Ancho Completo (`hero_content_fullwidth`):* Control toggle que define el comportamiento del contenedor de texto:
      - Desactivado (Recomendado): Mantiene el contenido acotado a la cuadrícula de la web (`max-w-7xl mx-auto px-6`). La alineación izquierda coincide exactamente con la vertical del logotipo del Navbar.
      - Activado (Fullwidth): Extiende el contenido hasta el borde físico exterior de la pantalla.
  - **SOBRE MÍ / CLÍNICA:** Descripción de la historia, fotografía del equipo o del local, alineación del diseño (imagen a la izquierda o derecha) y botón opcional.
  - **CATEGORÍAS:** Mosaico/carrusel de categorías de servicios para destacar tratamientos (ej. Facial, Corporal, Uñas) e inyectar accesos rápidos.
  - **CTA (Llamada a la Acción):** Banner de cierre de la página web para incentivar reservas con título, subtítulo y enlace al flujo de cita previa.
  - **SEO:** Inyección de títulos meta, descripción optimizada para buscadores y palabras clave del portal público.
- **Menú Dinámico (Gestor de Navegación):** Edición interactiva de la barra superior (Navbar) y Megamenú:
  - Ordenar y ocultar/mostrar los enlaces del header.
  - Alternar el diseño del Megamenú de servicios entre Bento (mosaico con hovers visuales y mini-vídeos) y Directorio (lista clásica).
- **Páginas del Sitio (`/dashboard/pages`):** Creación y publicación de páginas HTML estáticas e independientes (ej: aviso legal, políticas de cookies, políticas de privacidad, o landings de promociones temporales).

## 2. Seguridad (RBAC)
La modificación del sitio web público de la clínica es una acción crítica que impacta directamente en la imagen de marca y SEO:
- **Administrador:** Acceso total y exclusivo de lectura, escritura, reordenamiento, edición de bloques y eliminación de páginas.
- **Recepción:** Acceso totalmente denegado. No se muestra la opción en el menú lateral ni se permite la edición de páginas.
- **Especialista:** Acceso totalmente denegado. No se muestra la opción en el menú lateral ni se permite la edición de páginas.

---

## 3. Acciones y Coordenadas (Selectores CSS)

Para guiar visualmente al usuario y señalar elementos, utiliza la URL del Hub `/dashboard/cms` y los siguientes selectores e identificadores estables (`id="..."`):

### Bento Grid del Hub Principal (`/dashboard/cms`)
- **Editar Portada Principal (Home Builder):** Acceso al editor visual de secciones de inicio.
  - Selector: `id="cms-bento-home-builder"`
- **Conmutador Ancho Completo Hero (Fullwidth):** Selector para activar o desactivar que el contenido del Hero se extienda a los extremos de la pantalla.
  - Selector: `id="cms-hero-fullwidth-toggle"`
- **Alineación Horizontal del Hero:** Selector para definir posición izquierda, centrada o derecha.
  - Selector: `id="cms-hero-horizontal-alignment-select"`
- **Tamaño del Título del Hero:** Selector para definir escala de tamaño del título H1.
  - Selector: `id="cms-hero-title-size-select"`
- **Ancho Máximo del Título del Hero:** Selector para ajustar el % de ancho del título.
  - Selector: `id="cms-hero-title-max-width-slider"`
- **Tamaño del Subtítulo del Hero:** Selector para definir escala de tamaño del subtítulo.
  - Selector: `id="cms-hero-subtitle-size-select"`
- **Conmutador Bloque de Precio:** Activar o desactivar la oferta destacada junto al título.
  - Selector: `id="cms-hero-price-toggle"`
- **Estilo de Botón CTA:** Selector visual de diseño del botón.
  - Selector: `id="cms-hero-button-style-select"`
- **Selector Inteligente de Enlace:** Abre el modal de selección de destinos y tratamientos.
  - Selector: `id="cms-hero-smart-link-btn"`
- **Gestionar Enlaces del Menú (Navegación):** Acceso al reordenamiento de links superiores y megamenú.
  - Selector: `id="cms-bento-nav-editor"`
- **Configurar Tipografía y Colores (Branding):** Redirecciona a la sección de marca en Ajustes generales.
  - Selector: `id="cms-bento-branding"`
- **Gestionar Páginas Autónomas (Páginas del Sitio):** Redirecciona al listado de páginas de la clínica.
  - Selector: `id="cms-bento-pages"`

### Gestor de Páginas Independientes (`/dashboard/pages`)
- **Crear Nueva Página:** Abre el modal de configuración de nueva URL estática.
  - Selector en la página principal: `id="cms-new-page-btn"` (Nota: busca por texto "Nueva Página" si no se localiza).
- **Listar Páginas:** Lista de páginas publicadas.
- **Eliminar Página:** Elimina definitivamente la página seleccionada.
  - Selector: `id="cms-delete-page-btn-[id]"` o `id="delete-page-btn-[id]"`

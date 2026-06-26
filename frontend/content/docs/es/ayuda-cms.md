---
title: Manual de Ayuda: Editor Web y CMS (Gestor de Contenidos)
description: Guía completa y detallada para el uso del módulo de cms.
---

# Manual de Ayuda: Editor Web y CMS (Gestor de Contenidos)

Este manual sirve como la única fuente de verdad (RAG) para guiar al usuario en el uso del módulo de Editor Web, CMS y Gestor de Páginas de la clínica.

## 1. Reglas de Negocio
El panel de Editor Web y CMS centraliza la gestión del portal público de la clínica y sus subpáginas:
- **Hub de CMS (`/dashboard/cms`):** Panel principal estilo Bento Grid con accesos a la edición de la portada principal (Home Builder), el menú dinámico de navegación superior, los estilos globales de branding y el gestor de páginas independientes.
- **Home Builder (Editor de Portada):** Permite configurar de forma visual las secciones que componen la página de inicio pública:
  - **HERO:** Imagen o vídeo de fondo, título principal, subtítulo, y botón de acción directa (con texto y enlace personalizado).
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
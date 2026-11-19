import React from 'react';
import type { BlockType } from '../types';

export interface BlockDefinition {
  id: BlockType;
  label: string;
  desc: string;
  category: 'estructura' | 'contenido' | 'medios' | 'interactivo';
  icon: React.ReactNode;
}

export const BLOCK_DEFINITIONS: BlockDefinition[] = [
  {
    id: 'hero',
    label: 'Portada Hero',
    desc: 'Cabecera a pantalla completa con fondo de impacto y llamada a la acción.',
    category: 'estructura',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 21h18M3 3h18M3 12h18M3 8.25h18" />
      </svg>
    ),
  },
  {
    id: 'title_heading',
    label: 'Título',
    desc: 'Encabezado con tipografía seleccionable, jerarquía H1-H3 y línea de acento.',
    category: 'contenido',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
      </svg>
    ),
  },
  {
    id: 'atomic_text',
    label: 'Párrafo de Texto',
    desc: 'Editor de texto enriquecido con formato en negrita, listas y enlaces.',
    category: 'contenido',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
  },
  {
    id: 'atomic_image',
    label: 'Imagen o Vídeo',
    desc: 'Fotografía o vídeo desde la galería con encuadre y pie de foto.',
    category: 'medios',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
      </svg>
    ),
  },
  {
    id: 'text_image_cta',
    label: 'Imagen + Texto',
    desc: 'Composición editorial de imagen junto a texto explicativo y botón.',
    category: 'contenido',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 4.5v15m6-15v15M3.75 9h16.5M3.75 15h16.5" />
      </svg>
    ),
  },
  {
    id: 'atomic_button',
    label: 'Botón de Acción',
    desc: 'Llamada a la acción con enlaces inteligentes a tratamientos o reservas.',
    category: 'interactivo',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 8.6 4.108-3.411 1.096 1.442 5.068-2.742 1.045zM3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
      </svg>
    ),
  },
  {
    id: 'atomic_category',
    label: 'Catálogo de Tratamientos',
    desc: 'Mosaico bento o carrusel con las fichas de servicios y precios.',
    category: 'interactivo',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
  },
  {
    id: 'quote_testimonial',
    label: 'Cita o Testimonio',
    desc: 'Opinión destacada de pacientes o cita inspiradora del equipo médico.',
    category: 'contenido',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v7.518z" />
      </svg>
    ),
  },
  {
    id: 'features_grid',
    label: 'Claves de Excelencia',
    desc: 'Tarjetas numeradas destacando garantías, tecnología o ventajas clínicas.',
    category: 'contenido',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
      </svg>
    ),
  },
  {
    id: 'accordion_faq',
    label: 'Preguntas Frecuentes',
    desc: 'Acordeón desplegable para resolver las preguntas más habituales.',
    category: 'interactivo',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
      </svg>
    ),
  },
  {
    id: 'separator_spacer',
    label: 'Divisor / Espacio',
    desc: 'Línea de acento o espaciado en blanco para estructurar el contenido.',
    category: 'estructura',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
      </svg>
    ),
  },
];

export function getBlockDefinition(type?: string): BlockDefinition | undefined {
  if (!type) return undefined;
  const normalized = type === 'atomic_title' ? 'title_heading' : type;
  return BLOCK_DEFINITIONS.find(b => b.id === normalized);
}

export function getBlockIcon(type?: string): React.ReactNode {
  const def = getBlockDefinition(type);
  if (def?.icon) return def.icon;
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
    </svg>
  );
}

export function getBlockLabel(type?: string): string {
  const def = getBlockDefinition(type);
  if (def?.label) return def.label;
  if (!type) return 'Bloque';
  switch (type) {
    case 'hero': return 'Portada Hero';
    case 'title_heading':
    case 'atomic_title': return 'Título';
    case 'atomic_text': return 'Párrafo de Texto';
    case 'atomic_image': return 'Imagen o Vídeo';
    case 'text_image_cta': return 'Imagen + Texto';
    case 'atomic_button': return 'Botón de Acción';
    case 'atomic_category': return 'Catálogo de Tratamientos';
    case 'quote_testimonial': return 'Cita o Testimonio';
    case 'features_grid': return 'Claves de Excelencia';
    case 'accordion_faq': return 'Preguntas Frecuentes';
    case 'separator_spacer': return 'Divisor / Espacio';
    default: return type.replace(/_/g, ' ');
  }
}

export function defaultContent(blockType: string, dbCategories: any[]): Record<string, any> {
  switch (blockType) {
    case 'hero':
      return {
        image_url: '',
        heading: 'Descubre tu mejor versión',
        subheading: 'Tratamientos estéticos avanzados en un espacio sereno.',
        cta_text: 'Reservar cita',
        cta_url: '/reservar',
        alignment: 'center',
      };
    case 'title_heading':
      return {
        title: 'Nuevo Título',
        title_tag: 'h2',
        alignment: 'center',
        show_divider: true,
      };
    case 'atomic_text':
      return { html: '' };
    case 'atomic_image':
      return {
        image_url: '',
        caption: '',
        alignment: 'center',
        max_width: '800px',
      };
    case 'text_image_cta':
      return {
        title: 'Armonía y Excelencia',
        description: 'Un espacio donde el bienestar y la sofisticación se encuentran en perfecto equilibrio.',
        image_url: '',
        image_position: 'left',
        layout: 'image_left',
        cta_text: 'Descubrir más',
        cta_url: '/servicios',
      };
    case 'atomic_button':
      return {
        text: 'Reservar Cita',
        url: '/reservar',
        style: 'gold_solid',
        alignment: 'center',
      };
    case 'atomic_category':
      return {
        category_id: dbCategories[0]?.id || '',
        selected_treatment_ids: [],
        layout: 'cards_slider',
        max_items: 6,
      };
    case 'quote_testimonial':
      return {
        quote: 'Nuestra prioridad es la armonía natural y el cuidado de cada detalle para realzar tu belleza única.',
        author: 'Dra. Mercè Guasch',
        role: 'Directora Médica & Especialista',
        rating: 5,
        avatar_url: '',
      };
    case 'features_grid':
      return {
        heading: 'Pilares de Excelencia',
        subheading: 'Compromiso con el rigor médico y el confort exclusivo',
        items: [
          { title: 'Diagnóstico 3D', description: 'Evaluación facial personalizada antes de cada tratamiento.' },
          { title: 'Tecnología Médica', description: 'Aparatología de vanguardia con certificación internacional.' },
          { title: 'Atención Exclusiva', description: 'Seguimiento clínico continuo en un ambiente de máxima discreción.' },
        ],
      };
    case 'accordion_faq':
      return {
        heading: 'Preguntas Frecuentes',
        subheading: 'Resolvemos tus dudas antes de iniciar tu tratamiento',
        items: [
          {
            question: '¿Cómo es la primera consulta de valoración?',
            answer: 'En tu primera visita realizamos un diagnóstico completo y diseñamos un plan de tratamiento adaptado a tus necesidades y objetivos.',
          },
          {
            question: '¿Los procedimientos requieren tiempo de recuperación?',
            answer: 'La mayoría de nuestros protocolos son no invasivos y te permitirán reincorporarte a tu rutina diaria inmediatamente.',
          },
          {
            question: '¿Qué formas de pago o financiación disponéis?',
            answer: 'Ofrecemos diversas facilidades de pago y planes de financiación personalizada sin intereses.',
          },
        ],
      };
    case 'separator_spacer':
      return {
        spacing: 'medium',
        style: 'line_gold',
      };
    default:
      return {};
  }
}

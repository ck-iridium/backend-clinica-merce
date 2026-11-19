export function defaultContent(blockType: string, dbCategories: any[]): Record<string, any> {
  switch (blockType) {
    case 'hero':
      return {
        image_url: '',
        heading: 'Descubre tu mejor versión',
        subheading: 'Tratamientos estéticos avanzados.',
        cta_text: 'Reservar cita',
        cta_url: '/reservar',
      };
    case 'title_heading':
      return {
        title: 'Nuevo Título',
        title_tag: 'h2',
        alignment: 'center',
        show_divider: true,
      };
    case 'atomic_text':
      return { html: '<p>Escribe aquí tu párrafo...</p>' };
    case 'atomic_image':
      return {
        image_url: '',
        caption: '',
        alignment: 'center',
        max_width: '800px',
      };
    case 'text_image_cta':
      return {
        title: 'Contenido',
        description: 'Párrafo descriptivo.',
        image_url: '',
        image_position: 'left',
      };
    case 'atomic_button':
      return {
        text: 'Acción',
        url: '#',
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
    default:
      return {};
  }
}

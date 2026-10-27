/**
 * URL única y optimizada de Google Fonts que incluye todas las familias
 * soportadas por el CMS tanto para Títulos como para Texto/Cuerpo (Body).
 */
export const GOOGLE_FONTS_URL = "https://fonts.googleapis.com/css2?family=Cinzel:wght@400..800&family=Cormorant+Garamond:ital,wght@0,400..700;1,400..700&family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Fredoka:wght@300..700&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Montserrat:ital,wght@0,100..900;1,100..900&family=Outfit:wght@100..900&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&family=Roboto:ital,wght@0,300..700;1,300..700&display=swap";

export function resolveHeadingFont(fontKey?: string | null): string {
  switch (fontKey) {
    case 'playfair':
    case 'playfair_inter':
      return "'Playfair Display', var(--font-playfair-base), Georgia, serif";
    case 'cormorant':
    case 'cormorant_montserrat':
      return "'Cormorant Garamond', var(--font-cormorant), Georgia, serif";
    case 'cinzel':
    case 'cinzel_roboto':
      return "'Cinzel', Georgia, serif";
    case 'outfit':
      return "'Outfit', var(--font-outfit), sans-serif";
    case 'plus_jakarta_sans':
      return "'Plus Jakarta Sans', sans-serif";
    case 'montserrat':
      return "'Montserrat', var(--font-montserrat), sans-serif";
    case 'fredoka':
      return "'Fredoka', var(--font-fredoka), cursive, sans-serif";
    case 'inter':
      return "'Inter', var(--font-inter), sans-serif";
    default:
      return "'Playfair Display', var(--font-playfair-base), Georgia, serif";
  }
}

export function resolveBodyFont(bodyKey?: string | null, headingKey?: string | null): string {
  // Manejo de compatibilidad con combinaciones antiguas heredadas
  if (!bodyKey || bodyKey === 'inter') {
    if (headingKey === 'cormorant_montserrat') return "'Montserrat', var(--font-montserrat), sans-serif";
    if (headingKey === 'cinzel_roboto') return "'Roboto', sans-serif";
  }
  switch (bodyKey) {
    case 'plus_jakarta_sans':
      return "'Plus Jakarta Sans', sans-serif";
    case 'montserrat':
      return "'Montserrat', var(--font-montserrat), sans-serif";
    case 'outfit':
      return "'Outfit', var(--font-outfit), sans-serif";
    case 'dm_sans':
      return "'DM Sans', sans-serif";
    case 'roboto':
      return "'Roboto', sans-serif";
    case 'inter':
    default:
      return "'Inter', var(--font-inter), sans-serif";
  }
}

export const FONT_WEIGHT_MAP: Record<string, string> = {
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700'
};

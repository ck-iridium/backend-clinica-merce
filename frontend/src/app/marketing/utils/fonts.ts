export function resolveHeadingFont(fontKey?: string | null): string {
  switch (fontKey) {
    case 'playfair':
    case 'playfair_inter':
      return "var(--font-playfair-base), 'Playfair Display', serif";
    case 'cormorant':
    case 'cormorant_montserrat':
      return "var(--font-cormorant), 'Cormorant Garamond', serif";
    case 'cinzel':
    case 'cinzel_roboto':
      return "'Cinzel', serif";
    case 'outfit':
      return "var(--font-outfit), 'Outfit', sans-serif";
    case 'plus_jakarta_sans':
      return "'Plus Jakarta Sans', sans-serif";
    case 'montserrat':
      return "var(--font-montserrat), 'Montserrat', sans-serif";
    case 'fredoka':
      return "var(--font-fredoka), 'Fredoka', cursive, sans-serif";
    case 'inter':
      return "var(--font-inter), 'Inter', sans-serif";
    default:
      return "var(--font-playfair-base), 'Playfair Display', serif";
  }
}

export function resolveBodyFont(bodyKey?: string | null, headingKey?: string | null): string {
  if (!bodyKey || bodyKey === 'inter') {
    if (headingKey === 'cormorant_montserrat') return "var(--font-montserrat), 'Montserrat', sans-serif";
    if (headingKey === 'cinzel_roboto') return "'Roboto', sans-serif";
  }
  switch (bodyKey) {
    case 'plus_jakarta_sans':
      return "'Plus Jakarta Sans', sans-serif";
    case 'montserrat':
      return "var(--font-montserrat), 'Montserrat', sans-serif";
    case 'outfit':
      return "var(--font-outfit), 'Outfit', sans-serif";
    case 'dm_sans':
      return "'DM Sans', sans-serif";
    case 'roboto':
      return "'Roboto', sans-serif";
    case 'inter':
    default:
      return "var(--font-inter), 'Inter', sans-serif";
  }
}

export const FONT_WEIGHT_MAP: Record<string, string> = {
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700'
};

export function getFontVar(fontName: string, fallback: string = 'var(--font-inter-base), sans-serif'): string {
  switch (fontName) {
    case 'Cormorant Garamond':
      return 'var(--font-cormorant), serif';
    case 'Playfair':
    case 'Playfair Display':
      return "var(--font-playfair-base), 'Playfair', 'Playfair Display', serif";
    case 'Cinzel':
      return 'var(--font-cinzel), serif';
    case 'DM Serif Display':
      return 'var(--font-dm-serif), serif';
    case 'Montserrat':
      return 'var(--font-montserrat), sans-serif';
    case 'Outfit':
      return 'var(--font-outfit), sans-serif';
    case 'Plus Jakarta Sans':
      return 'var(--font-plus-jakarta), sans-serif';
    case 'DM Sans':
      return 'var(--font-dm-sans), sans-serif';
    case 'Poppins':
      return 'var(--font-poppins), sans-serif';
    case 'Lato':
      return 'var(--font-lato), sans-serif';
    case 'Syne':
      return 'var(--font-syne), sans-serif';
    case 'Fredoka':
      return "var(--font-fredoka), 'Fredoka', cursive, sans-serif";
    case 'Inter':
      return 'var(--font-inter-base), sans-serif';
    default:
      return fallback;
  }
}

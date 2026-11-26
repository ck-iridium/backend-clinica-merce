export const VOICE_TAGS_REGEX = /\[(?:with enthusiasm|fast|fluent|short pause|slower|whispering|cheerful|calm|excited)[^\]]*\]/gi;

export const cleanTitle = (text?: string): string => {
  if (!text) return '';
  return text
    .replace(VOICE_TAGS_REGEX, '')
    .replace(/\s*\(?\s*con v[ií]deo\s*\)?/gi, '')
    .replace(/\s+con v[ií]deo/gi, '')
    .trim();
};

export const parseSizeScale = (val: any, fallback: number = 100): number => {
  if (typeof val === 'number') return val;
  if (!val) return fallback;
  if (val === 'small') return 80;
  if (val === 'medium') return 90;
  if (val === 'large') return 100;
  if (val === 'xl') return 125;
  const parsed = parseInt(val, 10);
  return isNaN(parsed) ? fallback : parsed;
};

export const getPriceStyleConfig = (style?: string) => {
  switch (style) {
    case 'outline':
      return {
        boxClass: 'bg-transparent border-2 border-white/40 rounded-2xl px-4 py-2 sm:px-5 sm:py-3 text-white backdrop-blur-xs',
        prefixClass: 'text-white/80',
        amountClass: 'text-white drop-shadow-md',
        suffixClass: 'text-white/80'
      };
    case 'minimal':
      return {
        boxClass: 'bg-transparent border-0 p-0 text-white shadow-none',
        prefixClass: 'text-white/80',
        amountClass: 'text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]',
        suffixClass: 'text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]'
      };
    case 'solid_white':
      return {
        boxClass: 'bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border border-white/50 dark:border-stone-800 rounded-2xl px-4 py-2 sm:px-5 sm:py-3 text-stone-900 dark:text-white shadow-md',
        prefixClass: 'text-stone-500 dark:text-stone-400',
        amountClass: 'text-stone-900 dark:text-white',
        suffixClass: 'text-stone-500 dark:text-stone-400'
      };
    case 'capsule_dark':
    default:
      return {
        boxClass: 'backdrop-blur-xl bg-black/45 dark:bg-stone-950/60 border border-white/25 rounded-2xl px-4 py-2.5 sm:px-5 sm:py-3.5 text-white',
        prefixClass: 'text-white/80',
        amountClass: 'text-white drop-shadow-md',
        suffixClass: 'text-white/80'
      };
  }
};

export const getPreviewImageUrl = (url?: string): string => {
  if (!url) return '';
  return url.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${url}` : url;
};


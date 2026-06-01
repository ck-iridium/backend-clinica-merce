import DocsClientPage from './DocsClientPage';
import { DOCS_NAVIGATION } from './content';
import { getDocContent } from '@/lib/docs';

export const revalidate = 60; // Revalidate settings cache every 60 seconds

export default async function Page() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  // 1. Fallback default branding settings
  const defaultSettings = {
    primary_color: '#3b82f6',
    secondary_color: '#1c1917',
    tertiary_color: '#d4af37',
    font_family: 'playfair_inter',
    logo_svg: null as string | null,
    font_weight_headings: 'semibold',
    favicon_url: null as string | null,
  };

  let settings = { ...defaultSettings };

  // 2. Fetch public branding settings on the server side (SSR/ISR)
  try {
    const response = await fetch(`${API_URL}/super-admin/marketing/public`, {
      next: { revalidate: 60 }
    });
    if (response.ok) {
      const data = await response.json();
      if (data && data.settings) {
        settings = {
          primary_color: data.settings.primary_color || defaultSettings.primary_color,
          secondary_color: data.settings.secondary_color || defaultSettings.secondary_color,
          tertiary_color: data.settings.tertiary_color || defaultSettings.tertiary_color,
          font_family: data.settings.font_family || defaultSettings.font_family,
          logo_svg: data.settings.logo_svg || null,
          font_weight_headings: data.settings.font_weight_headings || defaultSettings.font_weight_headings,
          favicon_url: data.settings.favicon_url || null,
        };
      }
    }
  } catch (err) {
    console.error('Error fetching CMS content in Server Component for /docs:', err);
  }

  // 3. Load all markdown content on the server side
  const docsContent: Record<string, { es: string; en: string; fr: string }> = {};

  for (const section of DOCS_NAVIGATION) {
    for (const subpage of section.subpages) {
      docsContent[subpage.id] = {
        es: getDocContent('es', subpage.id).content,
        en: getDocContent('en', subpage.id).content,
        fr: getDocContent('fr', subpage.id).content,
      };
    }
  }

  // 4. Render client page instantly with server-fetched settings and markdown content
  return <DocsClientPage brandingSettings={settings} docsContent={docsContent} />;
}

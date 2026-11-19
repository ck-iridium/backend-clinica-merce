export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import type { PageProps, SectionBlock } from './types';
import { matchSlug, normalizeSections } from './utils/pageNormalizer';
import { PublicSection } from './components/PublicSection';
import { PublicPageEmptyState } from './components/PublicPageEmptyState';

// Metadata dinámica por página
export async function generateMetadata({ params }: PageProps) {
  const { slug } = params;

  if (slug.startsWith('google') && slug.endsWith('.html')) {
    return {
      title: `Google Verification - ${slug}`,
      robots: 'noindex, nofollow',
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const requestHeaders = headers();
  const tenantId = requestHeaders.get('x-tenant-id');

  if (!baseUrl || !tenantId) return {};

  try {
    const res = await fetch(`${baseUrl}/cms/navigation`, {
      cache: 'no-store',
      headers: { 'X-Tenant-ID': tenantId },
    });
    if (res.ok) {
      const navItems: any[] = await res.json();
      const page = navItems.find((item) => matchSlug(item.path, slug) && item.is_custom);
      if (page) {
        return {
          title: `${page.label} | Clínica`,
          description: `Página personalizada: ${page.label}`,
        };
      }
    }
  } catch {
    // silencioso
  }

  return {
    title: 'Página | Clínica',
  };
}

export default async function CustomPage({ params }: PageProps) {
  const { slug } = params;

  // Verificación dinámica de Google Search Console si se solicita un archivo google*.html
  if (slug.startsWith('google') && slug.endsWith('.html')) {
    return (
      <div style={{ fontFamily: 'monospace', padding: 24, background: '#ffffff', color: '#111827' }}>
        google-site-verification: {slug}
      </div>
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const requestHeaders = headers();
  const tenantId = requestHeaders.get('x-tenant-id');

  if (!baseUrl || !tenantId) {
    notFound();
  }

  // 1. Verificar si la página existe en SiteNavigation (con tolerancia a acentos y guiones)
  let pageTitle = slug.replace(/-/g, ' ');
  let targetBlockSlug = slug;
  try {
    const resNav = await fetch(`${baseUrl}/cms/navigation`, {
      cache: 'no-store',
      headers: { 'X-Tenant-ID': tenantId },
    });
    if (resNav.ok) {
      const navItems: any[] = await resNav.json();
      const page = navItems.find((item) => matchSlug(item.path, slug) && item.is_custom);
      if (page) {
        pageTitle = page.label;
        targetBlockSlug = page.path.replace(/^\//, '');
      }
    }
  } catch {
    // Silencioso
  }

  // 2. Cargar los bloques y normalizarlos de forma retrocompatible
  let rawBlocks: any[] = [];
  try {
    let resBlocks = await fetch(`${baseUrl}/cms/blocks/${targetBlockSlug}`, {
      cache: 'no-store',
      headers: { 'X-Tenant-ID': tenantId },
    });
    if (!resBlocks.ok && targetBlockSlug !== slug) {
      resBlocks = await fetch(`${baseUrl}/cms/blocks/${slug}`, {
        cache: 'no-store',
        headers: { 'X-Tenant-ID': tenantId },
      });
    }
    if (resBlocks.ok) {
      rawBlocks = await resBlocks.json();
    }
  } catch {
    // Silencioso
  }

  // Si no se encontró ni en navigation ni tiene bloques, solo entonces es 404
  if (!rawBlocks.length && pageTitle === slug.replace(/-/g, ' ')) {
    notFound();
  }

  // Normalización defensiva para páginas con bloques antiguos/planos
  const sections: SectionBlock[] = normalizeSections(rawBlocks, slug);

  // 3. Cargar los datos del negocio para renderizar las categorías y tratamientos
  let dbCategories: any[] = [];
  let dbServices: any[] = [];
  try {
    const [resCat, resSvc] = await Promise.all([
      fetch(`${baseUrl}/service-categories/`, {
        next: { revalidate: 3600, tags: [`tenant-${tenantId}`, `tenant-${tenantId}-categories`] },
        headers: { 'X-Tenant-ID': tenantId },
      }),
      fetch(`${baseUrl}/services/`, {
        next: { revalidate: 3600, tags: [`tenant-${tenantId}`, `tenant-${tenantId}-services`] },
        headers: { 'X-Tenant-ID': tenantId },
      }),
    ]);
    if (resCat.ok) dbCategories = await resCat.json();
    if (resSvc.ok) dbServices = await resSvc.json();
  } catch {
    // Silencioso
  }

  const firstSectionHasHero = sections[0]?.content_data?.columns?.some((col: any) =>
    (col.blocks || []).some((b: any) => b.block_type === 'hero')
  );
  const mainPadding = firstSectionHasHero ? 'pt-0' : 'pt-20';

  return (
    <main className={`w-full min-h-screen bg-[#FAFAFA] ${mainPadding}`}>
      {sections.length > 0 ? (
        <div className="flex flex-col w-full">
          {sections.map((section, index) => (
            <PublicSection
              key={section.id}
              section={section}
              index={index}
              slug={slug}
              dbCategories={dbCategories}
              dbServices={dbServices}
            />
          ))}
        </div>
      ) : (
        <PublicPageEmptyState pageTitle={pageTitle} />
      )}
    </main>
  );
}

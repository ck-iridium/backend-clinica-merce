import { Metadata } from 'next';
import { headers } from 'next/headers';
import { getSupabaseAdmin, supabase } from './supabase';
import { customDomainMapping } from './tenant-resolver';

function getSupabaseClient() {
  try {
    return getSupabaseAdmin();
  } catch {
    return supabase;
  }
}

export interface TenantSeoData {
  title: string;
  description: string;
  keywords: string[];
  canonical: string;
  allowIndexing: boolean;
  googleVerification?: string;
  favicon: string;
  ogImage: string;
  clinicName: string;
}

/**
 * Obtiene la información SEO y metadatos del tenant directamente desde Supabase
 * con latencia ultrabaja, evitando la dependencia de servidores externos o cold starts.
 */
export async function getTenantSeoData(): Promise<TenantSeoData> {
  const requestHeaders = headers();
  const host = requestHeaders.get('x-forwarded-host') || requestHeaders.get('host') || '';
  const cleanHost = host.split(':')[0].toLowerCase();

  let tenantSlug = requestHeaders.get('x-tenant-slug') || '';
  let tenantId = requestHeaders.get('x-tenant-id') || '';

  // 1. Fallback de resolución de slug si no viene en cabeceras
  if (!tenantSlug) {
    if (customDomainMapping[cleanHost]) {
      tenantSlug = customDomainMapping[cleanHost];
    } else if (cleanHost.endsWith('.probookia.com') && cleanHost !== 'www.probookia.com' && cleanHost !== 'probookia.com') {
      tenantSlug = cleanHost.replace('.probookia.com', '');
    } else if (cleanHost.endsWith('.localhost')) {
      tenantSlug = cleanHost.replace('.localhost', '');
    }
  }

  const protocol = host.includes('localhost') ? 'http' : 'https';
  const canonical = host ? `${protocol}://${host}` : 'https://esteticamerce.com';

  const client = getSupabaseClient();
  let tenantName = "";

  // 2. Si no tenemos tenantId, buscar en la tabla `tenants` por dominio o slug
  if (!tenantId && client) {
    try {
      const { data: tenant } = await client
        .from('tenants')
        .select('id, name, slug, custom_domain')
        .or(`custom_domain.eq.${cleanHost},slug.eq.${tenantSlug || cleanHost}`)
        .limit(1)
        .maybeSingle();

      if (tenant) {
        tenantId = tenant.id;
        if (!tenantSlug) tenantSlug = tenant.slug;
        tenantName = tenant.name || "";
      }
    } catch (err) {
      console.warn('[tenant-seo] Error buscando tenant en Supabase:', err);
    }
  }

  // 3. Consultar datos en Supabase directamente (clinic_settings y site_content)
  let settings: any = null;
  let siteContent: any = null;

  if (tenantId && client) {
    try {
      const [settingsRes, contentRes] = await Promise.all([
        client.from('clinic_settings').select('*').eq('tenant_id', tenantId).maybeSingle(),
        client.from('site_content').select('*').eq('tenant_id', tenantId).maybeSingle(),
      ]);

      if (settingsRes.data) settings = settingsRes.data;
      if (contentRes.data) siteContent = contentRes.data;
    } catch (err) {
      console.warn('[tenant-seo] Error cargando settings/content desde Supabase:', err);
    }
  }

  // 4. Fallback secundario a la API FastAPI solo si Supabase no devolvió datos y existe API_URL
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (tenantId && (!settings || !siteContent) && apiUrl) {
    try {
      const [apiSettingsRes, apiContentRes] = await Promise.all([
        !settings
          ? fetch(`${apiUrl}/settings/`, {
              headers: { 'X-Tenant-ID': tenantId },
              next: { revalidate: 3600, tags: [`tenant-${tenantId}`, `tenant-settings-${tenantId}`] },
            }).then((r) => (r.ok ? r.json() : null)).catch(() => null)
          : null,
        !siteContent
          ? fetch(`${apiUrl}/site-content/`, {
              headers: { 'X-Tenant-ID': tenantId },
              next: { revalidate: 3600, tags: [`tenant-${tenantId}`, `tenant-content-${tenantId}`] },
            }).then((r) => (r.ok ? r.json() : null)).catch(() => null)
          : null,
      ]);

      if (apiSettingsRes) settings = apiSettingsRes;
      if (apiContentRes) siteContent = apiContentRes;
    } catch (err) {
      console.warn('[tenant-seo] Fallback API Error:', err);
    }
  }

  // 5. Normalizar nombre del negocio/clínica
  const clinicName =
    settings?.clinic_name?.trim() ||
    tenantName?.trim() ||
    (tenantSlug && tenantSlug !== 'www'
      ? tenantSlug.split('-').map((s: string) => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')
      : 'Centro Profesional');

  // 6. Construir título dinámico neutral con prioridad: site_content.seo_title -> clinic_settings.clinic_name -> nombre
  const title =
    siteContent?.seo_title?.trim() ||
    `${clinicName} | Servicios y Cita Online`;

  // 7. Construir descripción con regla estricta de fallback neutral universal (NUNCA texto en inglés ni sesgado)
  let description = siteContent?.seo_description?.trim();
  if (!description) {
    description = settings?.clinic_description?.trim();
  }
  if (!description || description.length < 10 || description.toLowerCase().includes('laser treatment')) {
    description = `${clinicName} - Servicios profesionales y reserva de citas online. Descubre nuestras opciones y gestiona tu cita fácilmente.`;
  }

  // 8. Robots / Indexación
  const allowIndexing = settings?.allow_search_engine_indexing !== false;

  // 9. Verificación de Google
  let googleVerification: string | undefined = undefined;
  if (settings?.google_site_verification) {
    let cleanCode = settings.google_site_verification.trim();
    const match = cleanCode.match(/content=["']([^"']+)["']/i);
    if (match) {
      cleanCode = match[1];
    } else if (cleanCode.includes('=')) {
      cleanCode = cleanCode.split('=').pop()?.replace(/["']/g, '').trim() || cleanCode;
    }
    googleVerification = cleanCode;
  }

  // 10. Palabras clave neutras por defecto
  let keywords: string[] = [clinicName.toLowerCase(), 'servicios', 'reserva online', 'cita previa'];
  if (siteContent?.seo_keywords) {
    const parsed = siteContent.seo_keywords
      .split(',')
      .map((k: string) => k.trim())
      .filter(Boolean);
    if (parsed.length > 0) keywords = parsed;
  }

  // 11. Favicon y OG Image
  const favicon = settings?.favicon_b64 || settings?.logo_app_b64 || settings?.logo_pdf_b64 || '/favicon_tenant.ico';
  let ogImage = siteContent?.hero_image_url || favicon;
  if (ogImage && ogImage.startsWith('/') && !ogImage.startsWith('//')) {
    ogImage = `${canonical}${ogImage}`;
  }

  return {
    title,
    description,
    keywords,
    canonical,
    allowIndexing,
    googleVerification,
    favicon,
    ogImage,
    clinicName,
  };
}

/**
 * Genera el objeto Metadata completo de Next.js para páginas de tenants
 */
export async function buildTenantMetadata(): Promise<Metadata> {
  const seo = await getTenantSeoData();

  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    robots: seo.allowIndexing ? "index, follow" : "noindex, nofollow",
    alternates: {
      canonical: seo.canonical,
    },
    verification: seo.googleVerification
      ? {
          google: seo.googleVerification,
        }
      : undefined,
    icons: {
      icon: seo.favicon,
      shortcut: seo.favicon,
      apple: seo.favicon,
    },
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: seo.canonical,
      siteName: seo.clinicName,
      images: seo.ogImage ? [{ url: seo.ogImage }] : [],
      locale: "es_ES",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
      images: seo.ogImage ? [seo.ogImage] : [],
    },
  };
}

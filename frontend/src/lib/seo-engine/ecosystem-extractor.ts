import { getSupabaseAdmin, supabase } from '../supabase';
import {
  EcosystemData,
  EcosystemTenant,
  EcosystemSettings,
  EcosystemSiteContent,
  EcosystemCategory,
  EcosystemService,
  EcosystemLocation,
} from './types';

function getClient() {
  try {
    return getSupabaseAdmin();
  } catch {
    return supabase;
  }
}

export interface ParsedAddress {
  municipality: string;
  province: string;
  postalCode: string;
}

/**
 * Parser especializado en direcciones de España:
 * Extrae con precisión el municipio local (ej. Carcaixent/Carcagente),
 * la provincia (ej. Valencia) y el código postal de 5 dígitos.
 */
export function parseSpanishAddress(address?: string | null): ParsedAddress {
  if (!address) {
    return { municipality: '', province: '', postalCode: '' };
  }

  const clean = address.trim();

  // 1. Buscar código postal de 5 dígitos
  const cpMatch = clean.match(/\b(\d{5})\b/);
  const postalCode = cpMatch ? cpMatch[1] : '';

  // 2. Probar coincidencia de patrón habitual: [CP] [Municipio], [Provincia]
  const patternMatch = clean.match(/\b\d{5}\s+([A-Za-zÀ-ÿ\s.'-]+?)(?:,\s*([A-Za-zÀ-ÿ\s.'-]+))?$/i);
  if (patternMatch) {
    const municipality = patternMatch[1].trim();
    const province = (patternMatch[2] || '').trim();
    if (municipality.length > 2) {
      return { municipality, province, postalCode };
    }
  }

  // 3. Si no encaja en el patrón regular, separar por comas
  const parts = clean.split(',').map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 2) {
    let last = parts[parts.length - 1];
    let prev = parts[parts.length - 2];
    if (/^(españa|spain)$/i.test(last) && parts.length >= 3) {
      last = parts[parts.length - 2];
      prev = parts[parts.length - 3];
    }

    const cleanLast = last.replace(/\b\d{5}\b/g, '').trim();
    const cleanPrev = prev.replace(/\b\d{5}\b/g, '').trim();

    if (cleanPrev.length > 2 && cleanLast.length > 2) {
      return { municipality: cleanPrev, province: cleanLast, postalCode };
    }

    if (cleanLast.length > 2) {
      return { municipality: cleanLast, province: '', postalCode };
    }
  }

  const fallback = parts[0]?.replace(/\b\d{5}\b/g, '').trim() || '';
  return { municipality: fallback, province: '', postalCode };
}

/**
 * Conecta con Supabase y extrae todo el catálogo indexable del tenant
 * en una sola llamada paralela optimizada.
 */
export async function extractTenantEcosystem(tenantIdOrSlug: string): Promise<EcosystemData> {
  const client = getClient();
  if (!client) {
    throw new Error('No se pudo inicializar el cliente de Supabase para extraer el ecosistema.');
  }

  // 1. Resolver el tenant (por ID o por Slug) para garantizar el UUID correcto
  let tenant: EcosystemTenant | null = null;
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(tenantIdOrSlug);

  if (isUuid) {
    const { data } = await client.from('tenants').select('id, name, slug, custom_domain').eq('id', tenantIdOrSlug).maybeSingle();
    tenant = data;
  }
  
  if (!tenant) {
    const { data } = await client.from('tenants').select('id, name, slug, custom_domain').eq('slug', tenantIdOrSlug).maybeSingle();
    tenant = data;
  }

  const effectiveTenantId = tenant?.id || tenantIdOrSlug;
  const effectiveTenant: EcosystemTenant = tenant || {
    id: effectiveTenantId,
    name: 'Centro Profesional',
    slug: tenantIdOrSlug,
  };

  // 2. Extraer el resto de colecciones usando el UUID resuelto
  const [
    settingsRes,
    contentRes,
    categoriesRes,
    servicesRes,
    locationsRes,
  ] = await Promise.all([
    client.from('clinic_settings').select('clinic_name, clinic_description, business_sector, clinic_address, allow_search_engine_indexing, gemini_api_key').eq('tenant_id', effectiveTenantId).maybeSingle(),
    client.from('site_content').select('seo_title, seo_description, seo_keywords, hero_title, hero_subtitle, translations').eq('tenant_id', effectiveTenantId).maybeSingle(),
    client.from('service_categories').select('id, name, slug, description, seo_description, order_index, translations').eq('tenant_id', effectiveTenantId).order('order_index', { ascending: true }),
    client.from('services').select('id, name, slug, category_id, description, seo_title, seo_description, seo_keywords, price, duration_minutes, is_active, translations').eq('tenant_id', effectiveTenantId).eq('is_active', true),
    client.from('locations').select('id, name, slug, address, is_active').eq('tenant_id', effectiveTenantId).eq('is_active', true),
  ]);

  const settings: EcosystemSettings = {
    clinic_name: settingsRes.data?.clinic_name || effectiveTenant.name || 'Centro Profesional',
    clinic_description: settingsRes.data?.clinic_description || null,
    business_sector: settingsRes.data?.business_sector || 'general',
    clinic_address: settingsRes.data?.clinic_address || null,
    allow_search_engine_indexing: settingsRes.data?.allow_search_engine_indexing !== false,
    gemini_api_key: settingsRes.data?.gemini_api_key || null,
  };

  const siteContent: EcosystemSiteContent = {
    ...contentRes.data,
    translations: contentRes.data?.translations || null,
  };

  const categories: EcosystemCategory[] = (categoriesRes.data || []).map((cat: any) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug || cat.id,
    description: cat.description || null,
    seo_description: cat.seo_description || null,
    order_index: cat.order_index ?? 0,
    translations: cat.translations || null,
  }));

  const categoryMap = new Map<string, string>();
  categories.forEach((cat) => {
    categoryMap.set(cat.id, cat.name);
  });

  const services: EcosystemService[] = (servicesRes.data || []).map((svc: any) => ({
    id: svc.id,
    name: svc.name,
    slug: svc.slug || svc.id,
    category_id: svc.category_id || null,
    category_name: svc.category_id ? categoryMap.get(svc.category_id) || null : null,
    description: svc.description || null,
    seo_title: svc.seo_title || null,
    seo_description: svc.seo_description || null,
    seo_keywords: svc.seo_keywords || null,
    price: svc.price ? Number(svc.price) : null,
    duration_minutes: svc.duration_minutes ? Number(svc.duration_minutes) : null,
    is_active: svc.is_active !== false,
    translations: svc.translations || null,
  }));

  const locations: EcosystemLocation[] = (locationsRes.data || []).map((loc: any) => {
    const parsed = parseSpanishAddress(loc.address);
    // Si el nombre de la sede menciona explícitamente una variante toponímica (ej. Carcaixent vs Carcagente)
    let cityCandidate = parsed.municipality;
    if (loc.name && /carcaixent/i.test(loc.name)) {
      cityCandidate = 'Carcaixent';
    }

    return {
      id: loc.id,
      name: loc.name,
      slug: loc.slug || loc.id,
      address: loc.address || null,
      city: cityCandidate || null,
      province: parsed.province || null,
    };
  });

  // Detectar la ciudad y provincia principales
  let detectedCity = '';
  let detectedProvince = '';

  if (locations.length > 0 && locations[0].city) {
    detectedCity = locations[0].city;
    detectedProvince = locations[0].province || '';
  } else if (settings.clinic_address) {
    const parsed = parseSpanishAddress(settings.clinic_address);
    detectedCity = parsed.municipality;
    detectedProvince = parsed.province;
  }

  const allCities = Array.from(
    new Set(locations.map((l) => l.city).filter(Boolean) as string[])
  );

  return {
    tenant: effectiveTenant,
    settings,
    siteContent,
    categories,
    services,
    locations,
    detectedCity,
    detectedProvince,
    allCities,
    businessSector: settings.business_sector,
  };
}

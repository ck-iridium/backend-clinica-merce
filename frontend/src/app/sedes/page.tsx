import { Metadata } from 'next';
import Link from 'next/link';
import { 
  MapPin, 
  Phone, 
  Clock, 
  Calendar, 
  ExternalLink, 
  Sparkles, 
  ChevronRight, 
  ArrowRight,
  ShieldCheck,
  Building2
} from 'lucide-react';
import { resolveTenantContext } from '@/lib/tenant-resolver';
import { formatMapsUrl } from '@/lib/utils';
import JsonLd from '@/components/seo/JsonLd';

export const revalidate = 3600;

async function getLocations(tenantId: string, apiUrl: string) {
  try {
    const res = await fetch(`${apiUrl}/locations/`, {
      headers: { 'X-Tenant-ID': tenantId },
      next: { revalidate: 3600, tags: [`tenant-${tenantId}-locations`] },
    });
    if (res.ok) {
      const data = await res.json();
      return Array.isArray(data) ? data.filter((l: any) => l.is_active) : [];
    }
  } catch (e) {
    console.error('[LOCATIONS INDEX ERROR]:', e);
  }
  return [];
}

async function getTenantSettings(tenantId: string, apiUrl: string) {
  try {
    const res = await fetch(`${apiUrl}/settings/`, {
      headers: { 'X-Tenant-ID': tenantId },
      next: { revalidate: 3600, tags: [`tenant-${tenantId}-settings`] },
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.error('[SETTINGS INDEX ERROR]:', e);
  }
  return null;
}

export async function generateMetadata(): Promise<Metadata> {
  const { tenantId, apiUrl, baseUrl } = await resolveTenantContext();
  if (!tenantId || !apiUrl) {
    return { title: 'Nuestras Sedes' };
  }

  const settings = await getTenantSettings(tenantId, apiUrl);
  const clinicName = settings?.clinic_name || 'Clínica';
  const metaTitle = `Nuestras Sedes y Centros | ${clinicName}`;
  const metaDescription = `Descubre todas las sedes y centros de ${clinicName}. Consulta direcciones, teléfonos y reserva tu cita previa online.`;

  return {
    title: metaTitle,
    description: metaDescription,
    alternates: {
      canonical: `${baseUrl}/sedes`,
    },
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      url: `${baseUrl}/sedes`,
      type: 'website',
    },
  };
}

export default async function SedesIndexPage() {
  const { tenantId, apiUrl, baseUrl, isMarketing } = await resolveTenantContext();

  const [locations, settings] = await Promise.all([
    getLocations(tenantId, apiUrl),
    getTenantSettings(tenantId, apiUrl),
  ]);

  const clinicName = settings?.clinic_name || 'Clínica';
  const openTime = settings?.open_time || '09:00';
  const closeTime = settings?.close_time || '19:30';

  // Schema.org ItemList de sedes para Google
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    'itemListElement': locations.map((loc: any, index: number) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'item': {
        '@type': 'HealthAndBeautyBusiness',
        'name': `${clinicName} - ${loc.name}`,
        'url': `${baseUrl}/sedes/${loc.slug || loc.id}`,
        'telephone': loc.phone || settings?.clinic_phone,
        'address': {
          '@type': 'PostalAddress',
          'streetAddress': loc.address,
          'addressCountry': 'ES',
        },
      },
    })),
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-stone-900 font-sans selection:bg-[#d4af37]/20">
      <JsonLd id="sedes-list-schema" data={itemListSchema} />

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden bg-gradient-to-b from-[#F7F7F5] via-[#FAFAFA] to-[#FAFAFA]">
        <div className="max-w-6xl mx-auto px-6 md:px-8 relative z-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs uppercase tracking-widest text-stone-500 mb-6">
            <Link href="/" className="hover:text-stone-900 transition-colors">Inicio</Link>
            <span>/</span>
            <span className="text-[#d4af37] font-semibold">Sedes</span>
          </nav>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/20 text-[#b08e23] text-xs font-semibold uppercase tracking-wider mb-6">
              <Building2 className="w-3.5 h-3.5" />
              <span>Red de Centros &bull; {clinicName}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-stone-900 tracking-tight leading-[1.15] mb-6">
              Nuestras Sedes
            </h1>

            <p className="text-lg md:text-xl text-stone-600 font-light leading-relaxed">
              Espacios pensados para tu bienestar absoluto. Encuentra tu centro más cercano y disfruta de tratamientos personalizados en un entorno de máxima tranquilidad y sofisticación.
            </p>
          </div>
        </div>
      </section>

      {/* LISTADO DE SEDES */}
      <section className="py-12 md:py-20 max-w-6xl mx-auto px-6 md:px-8">
        {locations.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-stone-100 max-w-lg mx-auto">
            <Building2 className="w-12 h-12 text-stone-300 mx-auto mb-4" />
            <h2 className="text-xl font-serif font-bold text-stone-800 mb-2">No hay sedes configuradas</h2>
            <p className="text-stone-500 text-sm mb-6">
              Actualmente atendemos en nuestra ubicación principal o a través de cita telefónica.
            </p>
            <Link
              href="/contacto"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1c1917] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#d4af37] transition-all"
            >
              Contactar con nosotros
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {locations.map((loc: any) => {
              const mapsUrl = formatMapsUrl(loc.address);
              const targetSlug = loc.slug || loc.id;
              const phone = loc.phone || settings?.clinic_phone;

              return (
                <article
                  key={loc.id}
                  className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-stone-100 flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:border-[#d4af37]/30 group"
                >
                  <div>
                    {/* Badge Sede */}
                    <div className="flex items-center justify-between gap-4 mb-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAFAFA] border border-stone-200/60 text-[#b08e23] text-xs font-semibold uppercase tracking-wider">
                        <Sparkles className="w-3 h-3 text-[#d4af37]" />
                        <span>Sede Oficial</span>
                      </span>
                      <span className="text-xs text-stone-400 font-medium">
                        {openTime} - {closeTime}
                      </span>
                    </div>

                    <h2 className="text-2xl md:text-3xl font-serif font-bold text-stone-900 group-hover:text-[#b08e23] transition-colors mb-4">
                      <Link href={`/sedes/${targetSlug}`}>
                        {loc.name}
                      </Link>
                    </h2>

                    {/* Dirección */}
                    <div className="flex items-start gap-3 text-stone-600 text-sm mb-3">
                      <MapPin className="w-4 h-4 text-[#d4af37] shrink-0 mt-1" />
                      <p className="font-normal leading-relaxed">{loc.address}</p>
                    </div>

                    {/* Teléfono */}
                    {phone && (
                      <div className="flex items-center gap-3 text-stone-600 text-sm mb-6">
                        <Phone className="w-4 h-4 text-[#d4af37] shrink-0" />
                        <a
                          href={`tel:${phone.replace(/\s+/g, '')}`}
                          className="hover:text-[#d4af37] transition-colors font-medium"
                        >
                          {phone}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Acciones */}
                  <div className="pt-6 border-t border-stone-100 flex flex-col sm:flex-row items-center gap-3">
                    <Link
                      href={`/sedes/${targetSlug}`}
                      className="w-full sm:w-1/2 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-stone-50 hover:bg-[#FAFAFA] text-stone-800 border border-stone-200 text-xs font-semibold tracking-wide uppercase transition-all duration-300"
                    >
                      <span>Ver Sede &bull; SEO</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#d4af37]" />
                    </Link>

                    <Link
                      href={`/reservar?location_id=${loc.id}`}
                      className="w-full sm:w-1/2 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#1c1917] hover:bg-[#d4af37] text-white text-xs font-semibold tracking-wide uppercase transition-all duration-300 shadow-sm"
                    >
                      <Calendar className="w-3.5 h-3.5 text-[#d4af37]" />
                      <span>Pedir Cita</span>
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

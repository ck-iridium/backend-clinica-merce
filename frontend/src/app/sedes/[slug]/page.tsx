import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Calendar, 
  ExternalLink, 
  Sparkles, 
  ChevronRight, 
  ShieldCheck, 
  UserCheck, 
  ArrowRight,
  Navigation
} from 'lucide-react';
import { resolveTenantContext } from '@/lib/tenant-resolver';
import { formatMapsUrl } from '@/lib/utils';
import PublicNavbar from '@/components/PublicNavbar';
import Footer from '@/components/Footer';
import JsonLd from '@/components/seo/JsonLd';

export const revalidate = 3600;

interface PageProps {
  params: { slug: string };
}

async function getLocationData(slug: string, tenantId: string, apiUrl: string) {
  try {
    const res = await fetch(`${apiUrl}/locations/slug/${slug}`, {
      headers: { 'X-Tenant-ID': tenantId },
      next: { revalidate: 3600, tags: [`tenant-${tenantId}-location-${slug}`] },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    console.error(`[LOCATION FETCH ERROR] ${slug}:`, e);
    return null;
  }
}

async function getTenantSettings(tenantId: string, apiUrl: string) {
  try {
    const res = await fetch(`${apiUrl}/settings/`, {
      headers: { 'X-Tenant-ID': tenantId },
      next: { revalidate: 3600, tags: [`tenant-${tenantId}-settings`] },
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.error('[SETTINGS FETCH ERROR]:', e);
  }
  return null;
}

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
    console.error('[LOCATIONS FETCH ERROR]:', e);
  }
  return [];
}

async function getServices(tenantId: string, apiUrl: string) {
  try {
    const res = await fetch(`${apiUrl}/services/`, {
      headers: { 'X-Tenant-ID': tenantId },
      next: { revalidate: 3600, tags: [`tenant-${tenantId}-services`] },
    });
    if (res.ok) {
      const data = await res.json();
      return Array.isArray(data) ? data.filter((s: any) => s.is_active) : [];
    }
  } catch (e) {
    console.error('[SERVICES FETCH ERROR]:', e);
  }
  return [];
}

async function getSpecialists(tenantId: string, apiUrl: string) {
  try {
    const res = await fetch(`${apiUrl}/users/specialists`, {
      headers: { 'X-Tenant-ID': tenantId },
      next: { revalidate: 3600, tags: [`tenant-${tenantId}-specialists`] },
    });
    if (res.ok) {
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    }
  } catch (e) {
    console.error('[SPECIALISTS FETCH ERROR]:', e);
  }
  return [];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { tenantId, apiUrl, baseUrl } = await resolveTenantContext();
  if (!tenantId || !apiUrl) {
    return { title: 'Sede no encontrada' };
  }

  const [location, settings] = await Promise.all([
    getLocationData(params.slug, tenantId, apiUrl),
    getTenantSettings(tenantId, apiUrl),
  ]);

  if (!location || !location.is_active) {
    return { title: 'Sede no encontrada' };
  }

  const clinicName = settings?.clinic_name || 'Clínica';
  const metaTitle = `${location.name} | ${clinicName}`;
  const metaDescription = `Conoce nuestra sede en ${location.name}. Cuidado estético y bienestar de primer nivel. Ubicada en ${location.address}. Pide tu cita previa online.`;
  const canonicalUrl = `${baseUrl}/sedes/${location.slug}`;

  return {
    title: metaTitle,
    description: metaDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      url: canonicalUrl,
      type: 'website',
      images: settings?.logo_app_b64 ? [{ url: settings.logo_app_b64 }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: metaTitle,
      description: metaDescription,
    },
  };
}

export default async function LocationDetailPage({ params }: PageProps) {
  const { tenantId, apiUrl, baseUrl, isMarketing } = await resolveTenantContext();

  if (isMarketing || !tenantId || !apiUrl) {
    notFound();
  }

  const [location, settings, allLocations, services, specialists] = await Promise.all([
    getLocationData(params.slug, tenantId, apiUrl),
    getTenantSettings(tenantId, apiUrl),
    getLocations(tenantId, apiUrl),
    getServices(tenantId, apiUrl),
    getSpecialists(tenantId, apiUrl),
  ]);

  if (!location || !location.is_active) {
    notFound();
  }

  const clinicName = settings?.clinic_name || 'Clínica';
  const mapsUrl = formatMapsUrl(location.address || settings?.clinic_address || '');
  const locationPhone = location.phone || settings?.clinic_phone || '';
  const locationEmail = location.email || settings?.clinic_email || '';
  const openTime = settings?.open_time || '09:00';
  const closeTime = settings?.close_time || '19:30';

  // Otras sedes (excluyendo la actual)
  const otherLocations = allLocations.filter((l: any) => l.id !== location.id && l.slug);

  // Schema.org LocalBusiness dinámico
  const locationSchema = {
    '@context': 'https://schema.org',
    '@type': 'HealthAndBeautyBusiness',
    'name': `${clinicName} - ${location.name}`,
    'description': `Sede oficial de ${clinicName} en ${location.name}. Servicios de estética, belleza y bienestar.`,
    'url': `${baseUrl}/sedes/${location.slug}`,
    'telephone': locationPhone || undefined,
    'email': locationEmail || undefined,
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': location.address,
      'addressCountry': 'ES',
    },
    ...(location.latitude && location.longitude
      ? {
          'geo': {
            '@type': 'GeoCoordinates',
            'latitude': location.latitude,
            'longitude': location.longitude,
          },
        }
      : {}),
    'openingHoursSpecification': [
      {
        '@type': 'OpeningHoursSpecification',
        'dayOfWeek': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        'opens': openTime,
        'closes': closeTime,
      },
    ],
    ...(mapsUrl ? { 'hasMap': mapsUrl } : {}),
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-stone-900 flex flex-col font-sans selection:bg-[#d4af37]/20">
      <JsonLd id={`location-schema-${location.id}`} data={locationSchema} />
      <PublicNavbar />

      <main className="flex-1">
        {/* HERO SECTION - QUIET LUXURY */}
        <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-gradient-to-b from-[#F7F7F5] via-[#FAFAFA] to-[#FAFAFA]">
          <div className="absolute inset-0 pointer-events-none opacity-20">
            <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[#d4af37]/20 blur-3xl" />
            <div className="absolute top-1/2 -left-40 w-80 h-80 rounded-full bg-stone-300/30 blur-3xl" />
          </div>

          <div className="max-w-6xl mx-auto px-6 md:px-8 relative z-10">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-xs uppercase tracking-widest text-stone-500 mb-6">
              <Link href="/" className="hover:text-stone-900 transition-colors">Inicio</Link>
              <span>/</span>
              <Link href="/contacto" className="hover:text-stone-900 transition-colors">Sedes</Link>
              <span>/</span>
              <span className="text-[#d4af37] font-semibold">{location.name}</span>
            </nav>

            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/20 text-[#b08e23] text-xs font-semibold uppercase tracking-wider mb-6">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Sede Oficial &bull; {clinicName}</span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-stone-900 tracking-tight leading-[1.15] mb-6">
                {location.name}
              </h1>

              <p className="text-lg md:text-xl text-stone-600 font-light leading-relaxed mb-8">
                Un santuario de calma y bienestar donde cuidamos de ti con la máxima delicadeza y tecnología de vanguardia.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href={`/reservar?location_id=${location.id}`}
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-[#1c1917] hover:bg-[#d4af37] text-white font-medium text-sm transition-all duration-300 shadow-sm active:scale-95 group"
                >
                  <Calendar className="w-4 h-4 text-[#d4af37] group-hover:text-white transition-colors" />
                  <span>Reservar cita en esta sede</span>
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </Link>

                {mapsUrl && (
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-white hover:bg-stone-50 text-stone-800 border border-stone-200/80 font-medium text-sm transition-all duration-300 shadow-sm active:scale-95"
                  >
                    <Navigation className="w-4 h-4 text-[#d4af37]" />
                    <span>Cómo llegar</span>
                    <ExternalLink className="w-3.5 h-3.5 text-stone-400 ml-0.5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* BENTO GRID: NAP & DETALLES DE CONTACTO */}
        <section className="py-16 md:py-24 max-w-6xl mx-auto px-6 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Tarjeta NAP Principal (2 columnas en desktop) */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-stone-100 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#d4af37] block mb-2">
                  Información y Contacto Directo
                </span>
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-stone-900 mb-8">
                  Visítanos en {location.name}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Dirección */}
                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#FAFAFA]">
                    <div className="w-10 h-10 rounded-xl bg-[#d4af37]/10 flex items-center justify-center text-[#d4af37] shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider block mb-1">
                        Dirección
                      </span>
                      <p className="text-sm font-medium text-stone-800 leading-snug">
                        {location.address}
                      </p>
                      {mapsUrl && (
                        <a
                          href={mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-[#b08e23] font-semibold mt-2 hover:underline"
                        >
                          <span>Abrir mapa de Google</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Teléfono */}
                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#FAFAFA]">
                    <div className="w-10 h-10 rounded-xl bg-[#d4af37]/10 flex items-center justify-center text-[#d4af37] shrink-0">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider block mb-1">
                        Atención Telefónica
                      </span>
                      {locationPhone ? (
                        <a
                          href={`tel:${locationPhone.replace(/\s+/g, '')}`}
                          className="text-sm font-medium text-stone-800 hover:text-[#d4af37] transition-colors"
                        >
                          {locationPhone}
                        </a>
                      ) : (
                        <span className="text-sm text-stone-500">No especificado</span>
                      )}
                      <span className="text-xs text-stone-400 block mt-1">Citas y consultas</span>
                    </div>
                  </div>

                  {/* Horario */}
                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#FAFAFA]">
                    <div className="w-10 h-10 rounded-xl bg-[#d4af37]/10 flex items-center justify-center text-[#d4af37] shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider block mb-1">
                        Horario de Apertura
                      </span>
                      <p className="text-sm font-medium text-stone-800">
                        {openTime} - {closeTime}
                      </p>
                      <span className="text-xs text-stone-400 block mt-1">Lunes a Sábado</span>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#FAFAFA]">
                    <div className="w-10 h-10 rounded-xl bg-[#d4af37]/10 flex items-center justify-center text-[#d4af37] shrink-0">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider block mb-1">
                        Correo Electrónico
                      </span>
                      {locationEmail ? (
                        <a
                          href={`mailto:${locationEmail}`}
                          className="text-sm font-medium text-stone-800 hover:text-[#d4af37] transition-colors break-all"
                        >
                          {locationEmail}
                        </a>
                      ) : (
                        <span className="text-sm text-stone-500">Contactar por teléfono</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Botón CTA dentro de la tarjeta */}
              <div className="mt-8 pt-6 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-stone-500">
                  <ShieldCheck className="w-4 h-4 text-[#d4af37]" />
                  <span>Confirmación inmediata por WhatsApp / Email</span>
                </div>
                <Link
                  href={`/reservar?location_id=${location.id}`}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#1c1917] hover:bg-[#d4af37] text-white text-xs font-semibold tracking-wide uppercase transition-all duration-300 shadow-sm"
                >
                  <span>Pedir Cita Online</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Tarjeta Visual: Plano / Garantía de la Sede */}
            <div className="bg-[#1c1917] text-white rounded-3xl p-8 md:p-10 shadow-sm flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#d4af37]/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-[#d4af37] mb-6">
                  <MapPin className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#d4af37] block mb-2">
                  Ubicación Estratégica
                </span>
                <h3 className="text-2xl font-serif font-bold text-white mb-4">
                  Experiencia Exclusiva en {location.name}
                </h3>
                <p className="text-stone-300 text-sm leading-relaxed mb-6 font-light">
                  Nuestras cabinas están diseñadas bajo los estándares más exigentes de confort acústico, cromoterapia y aromaterapia para desconectar desde el primer instante.
                </p>
              </div>

              <div className="relative z-10 pt-6 border-t border-white/10">
                {mapsUrl && (
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all duration-300"
                  >
                    <span>Abrir en Google Maps</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* EQUIPO DE ESPECIALISTAS (SI EXISTEN) */}
        {specialists && specialists.length > 0 && (
          <section className="py-16 bg-[#F7F7F5] border-y border-stone-100/60">
            <div className="max-w-6xl mx-auto px-6 md:px-8">
              <div className="max-w-2xl mb-12">
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#d4af37] block mb-2">
                  Profesionales Titulados
                </span>
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-900">
                  El equipo que cuidará de ti
                </h2>
                <p className="text-stone-600 text-sm md:text-base mt-3 font-light">
                  Especialistas en estética avanzada con años de trayectoria cuidando cada detalle.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {specialists.slice(0, 4).map((spec: any) => (
                  <div
                    key={spec.id}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 flex flex-col items-center text-center transition-all duration-300 hover:shadow-md"
                  >
                    <div className="w-20 h-20 rounded-full overflow-hidden mb-4 bg-stone-100 border-2 border-[#d4af37]/30 flex items-center justify-center text-stone-400">
                      {spec.avatar_url ? (
                        <img
                          src={spec.avatar_url}
                          alt={spec.full_name || 'Especialista'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <UserCheck className="w-8 h-8 text-stone-400" />
                      )}
                    </div>
                    <h3 className="text-base font-serif font-bold text-stone-900 mb-1">
                      {spec.full_name || 'Especialista'}
                    </h3>
                    <span className="text-xs text-[#b08e23] font-medium uppercase tracking-wider mb-4">
                      {spec.role === 'admin' ? 'Dirección Técnica' : 'Especialista en Cabina'}
                    </span>
                    <Link
                      href={`/reservar?location_id=${location.id}`}
                      className="text-xs text-stone-600 hover:text-stone-900 font-semibold underline underline-offset-4 mt-auto"
                    >
                      Reservar con el equipo
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* TRATAMIENTOS DESTACADOS DISPONIBLES EN LA SEDE */}
        {services && services.length > 0 && (
          <section className="py-20 md:py-28 max-w-6xl mx-auto px-6 md:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
              <div className="max-w-2xl">
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#d4af37] block mb-2">
                  Carta de Servicios
                </span>
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-900">
                  Tratamientos disponibles en {location.name}
                </h2>
                <p className="text-stone-600 text-sm md:text-base mt-3 font-light">
                  Procedimientos personalizados adaptados a las necesidades particulares de tu piel y cuerpo.
                </p>
              </div>

              <Link
                href="/tratamientos"
                className="inline-flex items-center gap-2 text-xs font-semibold text-stone-800 hover:text-[#d4af37] uppercase tracking-wider transition-colors shrink-0"
              >
                <span>Ver catálogo completo</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.slice(0, 6).map((service: any) => (
                <div
                  key={service.id}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 flex flex-col justify-between transition-all duration-300 hover:border-[#d4af37]/40 hover:shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-xs font-semibold text-[#b08e23] uppercase tracking-wider">
                        {service.category?.name || 'Tratamiento'}
                      </span>
                      {service.duration_minutes && (
                        <span className="text-xs text-stone-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {service.duration_minutes} min
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-serif font-bold text-stone-900 mb-2">
                      {service.name}
                    </h3>

                    {service.description && (
                      <p className="text-xs text-stone-500 leading-relaxed line-clamp-3 mb-6 font-light">
                        {service.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-stone-400 block leading-none mb-1">Precio</span>
                      <span className="text-lg font-semibold text-stone-900">
                        {service.price ? `${parseFloat(service.price).toFixed(2)}€` : 'Consultar'}
                      </span>
                    </div>

                    <Link
                      href={`/reservar?servicio=${service.id}&location_id=${location.id}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#1c1917] hover:bg-[#d4af37] text-white text-xs font-medium transition-all duration-300 shadow-sm"
                    >
                      <span>Reservar</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* OTRAS SEDES DE LA CLÍNICA */}
        {otherLocations.length > 0 && (
          <section className="py-16 bg-[#F7F7F5] border-t border-stone-200/50">
            <div className="max-w-6xl mx-auto px-6 md:px-8">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#d4af37] block mb-2 text-center md:text-left">
                Red de Centros
              </span>
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-stone-900 mb-8 text-center md:text-left">
                Nuestras otras sedes
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {otherLocations.map((other: any) => (
                  <Link
                    key={other.id}
                    href={`/sedes/${other.slug}`}
                    className="group bg-white rounded-2xl p-6 shadow-sm border border-stone-100 flex items-center justify-between transition-all duration-300 hover:border-[#d4af37]/40 hover:shadow-md"
                  >
                    <div>
                      <h3 className="text-lg font-serif font-bold text-stone-900 group-hover:text-[#b08e23] transition-colors mb-1">
                        {other.name}
                      </h3>
                      <p className="text-xs text-stone-500 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#d4af37]" />
                        <span>{other.address}</span>
                      </p>
                    </div>

                    <div className="w-10 h-10 rounded-xl bg-stone-50 group-hover:bg-[#1c1917] group-hover:text-white flex items-center justify-center text-stone-400 transition-all duration-300 shrink-0">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}

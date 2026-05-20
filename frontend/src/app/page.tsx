import { Metadata } from 'next';
import { headers } from 'next/headers';
import ClientHome from './ClientHome';

export const metadata: Metadata = {
  title: 'Clínica de Estética Avanzada - Clínica Mercè',
  description: 'Tratamientos estéticos avanzados y personalizados para resaltar tu belleza natural.',
};

async function getData(tenantId: string) {
  const fetchSafe = async (url: string, defaultValue: any) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(url, { 
        cache: 'no-store',
        signal: controller.signal,
        headers: { "X-Tenant-ID": tenantId }
      });
      clearTimeout(timeoutId);

      if (res.ok) return await res.json();
      console.warn(`[API Warning] Request to ${url} returned status: ${res.status}`);
      return defaultValue;
    } catch (error: any) {
      console.error(`[API Error] Failed to fetch from ${url}:`, error.message || error);
      return defaultValue;
    }
  };

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const [content, settings, services, categories] = await Promise.all([
    fetchSafe(`${apiUrl}/site-content/`, null),
    fetchSafe(`${apiUrl}/settings/`, null),
    fetchSafe(`${apiUrl}/services/`, []),
    fetchSafe(`${apiUrl}/service-categories/`, []),
  ]);

  return { content, settings, services, categories };
}

export default async function Home() {
  const requestHeaders = headers();
  const tenantId = requestHeaders.get('x-tenant-id') || '00000000-0000-0000-0000-000000000001';
  const data = await getData(tenantId);
  return <ClientHome {...data} />;
}

import { headers } from 'next/headers';
import ClientHome from './ClientHome';

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

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    console.error("[page.tsx] process.env.NEXT_PUBLIC_API_URL is not defined.");
    return { content: null, settings: null, services: [], categories: [] };
  }

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
  const tenantId = requestHeaders.get('x-tenant-id');
  
  if (!tenantId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FDFCFB] text-stone-500 font-serif font-bold text-lg">
        Contexto del Centro No Resuelto
      </div>
    );
  }
  
  const data = await getData(tenantId);
  return <ClientHome {...data} />;
}

import { Metadata } from 'next';
import ClientHome from './ClientHome';

export const metadata: Metadata = {
  title: 'Clínica de Estética Avanzada - Clínica Mercè',
  description: 'Tratamientos estéticos avanzados y personalizados para resaltar tu belleza natural.',
};

async function getData() {
  const [contentRes, settingsRes, servicesRes, categoriesRes] = await Promise.all([
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/site-content/`, { cache: 'no-store' }),
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/settings/`, { cache: 'no-store' }),
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/services/`, { cache: 'no-store' }),
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/service-categories/`, { cache: 'no-store' })
  ]);

  const content = contentRes.ok ? await contentRes.json() : null;
  const settings = settingsRes.ok ? await settingsRes.json() : null;
  const services = servicesRes.ok ? await servicesRes.json() : [];
  const categories = categoriesRes.ok ? await categoriesRes.json() : [];

  return { content, settings, services, categories };
}

export default async function Home() {
  const data = await getData();
  return <ClientHome {...data} />;
}

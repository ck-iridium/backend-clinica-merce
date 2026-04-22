export const dynamic = 'force-dynamic';

import DashboardSidebar from '@/components/DashboardSidebar';

import DashboardHeader from '@/components/DashboardHeader';
import { FeedbackProvider } from '@/app/contexts/FeedbackContext';
import MobileBottomBar from '@/components/MobileBottomBar';
import RouteGuard from '@/components/RouteGuard';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  let settings = null;
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/settings/`, {
      cache: 'no-store',
      // Añadir un timeout corto para evitar bloqueos si Render está dormido
      signal: AbortSignal.timeout(5000)
    });
    if (res.ok) {
      settings = await res.json();
    }
  } catch (e) {
    console.warn("DashboardLayout: No se pudieron cargar los ajustes (Render Cold Start o Offline). Usando valores por defecto.");
  }

  const clinicName = settings?.clinic_name || "Clínica";
  const logoUrl = settings?.logo_app_b64 || null;

  return (
      <div className="min-h-screen bg-background md:flex font-sans text-foreground print:bg-white">
        <RouteGuard />
        
        {/* Sidebar: Siempre visible para todas las rutas del dashboard */}
        <DashboardSidebar clinicName={clinicName} logoUrl={logoUrl} />

        {/* Área de Contenido Principal: El comportamiento (header, padding, scroll) se define en los layouts de grupo */}
        <main className="flex-1 flex flex-col relative text-foreground w-full">
          {children}
        </main>
      </div>
  );
}

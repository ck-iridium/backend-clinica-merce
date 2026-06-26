export const dynamic = 'force-dynamic';

import { headers } from 'next/headers';
import DashboardSidebar from '@/components/DashboardSidebar';
import RouteGuard from '@/components/RouteGuard';
import OnboardingGuard from '@/components/OnboardingGuard';
import { AIImageProvider } from '@/app/contexts/AIImageContext';
import AIGenerationFloatingCard from '@/components/cms/AIGenerationFloatingCard';
import AICopilotWidget from '@/components/ai/AICopilotWidget';
import CoachTooltipManager from '@/components/ui/CoachTooltipManager';
import GracePeriodBanner from '@/components/dashboard/GracePeriodBanner';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // El middleware inyecta x-tenant-id en cada request para Server Components
  const headersList = await headers();
  const tenantId = headersList.get('x-tenant-id') || '';

  let settings = null;
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/settings/`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
      headers: {
        // Reenviar el tenant al backend para que devuelva los ajustes correctos
        ...(tenantId ? { 'X-Tenant-ID': tenantId } : {}),
      },
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
    <AIImageProvider>
      <div className="h-screen overflow-hidden bg-background md:flex font-sans text-foreground print:bg-white">
        <RouteGuard />
        <OnboardingGuard />

        {/* Sidebar: Siempre visible para todas las rutas del dashboard */}
        <DashboardSidebar clinicName={clinicName} logoUrl={logoUrl} />

        {/* Área de Contenido Principal: El comportamiento (header, padding, scroll) se define en los layouts de grupo */}
        <main className="flex-1 flex flex-col relative text-foreground w-full h-full overflow-hidden">
          <GracePeriodBanner />
          {children}
        </main>
      </div>
      <AIGenerationFloatingCard />
      <AICopilotWidget />
      <CoachTooltipManager />
    </AIImageProvider>
  );
}

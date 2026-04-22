export const dynamic = 'force-dynamic';

import DashboardHeader from '@/components/DashboardHeader';

import MobileBottomBar from '@/components/MobileBottomBar';

export default async function StandardLayout({ children }: { children: React.ReactNode }) {
  let settings = null;
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/settings/`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(5000)
    });
    if (res.ok) {
      settings = await res.json();
    }
  } catch (e) {
    console.warn("StandardLayout: Usando ajustes por defecto debido a error en el fetch.");
  }
  
  const clinicName = settings?.clinic_name || "Clínica";

  return (
    <>
      <DashboardHeader clinicName={clinicName} />
      <div className="pt-24 pb-28 md:pt-8 md:pb-8 px-4 md:px-8 max-w-[1400px] mx-auto z-10 relative space-y-6 w-full">
        {children}
      </div>
      <MobileBottomBar />
    </>
  );
}

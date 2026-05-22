export const dynamic = 'force-dynamic';


import ImpersonationBanner from '@/components/ImpersonationBanner';
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
    <ImpersonationBanner />
    <div className="flex-1 h-full overflow-hidden bg-[#FAFAFA] flex flex-col">
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 z-10 relative w-full">
        <div className="max-w-[1400px] space-y-6">
          {children}
        </div>
      </div>
      <MobileBottomBar />
    </div>
    </>
  );
}

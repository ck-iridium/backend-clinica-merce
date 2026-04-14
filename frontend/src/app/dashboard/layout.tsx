import DashboardSidebar from '@/components/DashboardSidebar';
import DashboardHeader from '@/components/DashboardHeader';
import { FeedbackProvider } from '@/app/contexts/FeedbackContext';
import MobileBottomBar from '@/components/MobileBottomBar';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  let settings = null;
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/settings/`, {
      cache: 'no-store'
    });
    if (res.ok) settings = await res.json();
  } catch (e) {
    console.error("Failed to fetch settings for layout:", e);
  }

  const clinicName = settings?.clinic_name || "Clínica";
  const logoUrl = settings?.logo_app_b64 || null;

  return (
      <div className="min-h-screen bg-background md:flex font-sans text-foreground print:bg-white">
        
        {/* Sidebar: Mobile top bar + new Heygen-style desktop hover drawer */}
        <DashboardSidebar clinicName={clinicName} logoUrl={logoUrl} />

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col relative text-foreground">
          
          <DashboardHeader clinicName={clinicName} />

          {/* Children View (The Canvas for "Islas de contenido") */}
          <div className="pt-24 md:pt-28 px-4 md:px-8 pb-24 md:pb-8 max-w-[1400px] mx-auto z-10 relative space-y-6 w-full">
            {children}
          </div>
          
          <MobileBottomBar />
        </main>
      </div>
  );
}

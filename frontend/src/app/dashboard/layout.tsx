import DashboardSidebar from '@/components/DashboardSidebar';
import { FeedbackProvider } from '@/app/contexts/FeedbackContext';

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
    <FeedbackProvider>
      {/* Outer wrapper — mobile: block, desktop: flex row */}
      <div className="min-h-screen bg-stone-50 md:flex font-sans text-stone-900 print:bg-white">

        {/* Sidebar: renders mobile top-bar + desktop sticky aside + mobile drawer */}
        <DashboardSidebar clinicName={clinicName} logoUrl={logoUrl} />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-stone-50/50 print:overflow-visible">
          <div className="p-4 md:p-10 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </FeedbackProvider>
  );
}

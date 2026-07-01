export const dynamic = 'force-dynamic';

import ImpersonationBanner from '@/components/ImpersonationBanner';
import MobileBottomBar from '@/components/MobileBottomBar';
import SoftLaunchBanners from '@/components/dashboard/SoftLaunchBanners';

export default async function StandardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
    <ImpersonationBanner />
    <div className="flex-1 h-full overflow-hidden bg-[#FAFAFA] flex flex-col">
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 z-10 relative w-full">
        <div className="max-w-[1400px] space-y-6">
          <SoftLaunchBanners />
          {children}
        </div>
      </div>
      <MobileBottomBar />
    </div>
    </>
  );
}

export const dynamic = 'force-dynamic';

import MobileBottomBar from '@/components/MobileBottomBar';
import SoftLaunchBanners from '@/components/dashboard/SoftLaunchBanners';

export default async function StandardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 h-full overflow-hidden bg-[#FAFAFA] flex flex-col">
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-8 lg:px-10 py-6 z-10 relative w-full">
        <div className="max-w-[1600px] w-full mx-auto space-y-8">
          <SoftLaunchBanners />
          {children}
        </div>
      </div>
      <MobileBottomBar />
    </div>
  );
}

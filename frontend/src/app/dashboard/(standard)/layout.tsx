export const dynamic = 'force-dynamic';

import MobileBottomBar from '@/components/MobileBottomBar';
import SoftLaunchBanners from '@/components/dashboard/SoftLaunchBanners';
import ActiveCounterOperatorPill from '@/components/dashboard/ActiveCounterOperatorPill';

export default async function StandardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 h-full overflow-hidden bg-[#FAFAFA] flex flex-col">
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-8 lg:px-10 py-6 z-10 relative w-full">
        <div className="max-w-[1600px] w-full mx-auto space-y-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <SoftLaunchBanners />
            </div>
            <div className="shrink-0 hidden md:block">
              <ActiveCounterOperatorPill />
            </div>
          </div>
          {children}
        </div>
      </div>
      <MobileBottomBar />
    </div>
  );
}

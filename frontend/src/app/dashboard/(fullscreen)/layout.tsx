import MobileBottomBar from '@/components/MobileBottomBar';

export default async function FullscreenLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 md:left-20 flex flex-col overflow-hidden bg-background">
      {children}
      <MobileBottomBar />
    </div>
  );
}

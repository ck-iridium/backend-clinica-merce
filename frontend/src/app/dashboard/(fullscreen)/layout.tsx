import MobileBottomBar from '@/components/MobileBottomBar';

export default async function FullscreenLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 flex flex-col h-screen h-[100dvh] overflow-hidden bg-background relative">
      {children}
      <MobileBottomBar />
    </div>
  );
}

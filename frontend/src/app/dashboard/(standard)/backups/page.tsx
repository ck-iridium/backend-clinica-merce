"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BackupsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/settings?tab=advanced');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="w-8 h-8 border-4 border-stone-200 border-t-[#d4af37] rounded-full animate-spin" />
    </div>
  );
}

"use client";

import React from 'react';
import { Home, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/app/contexts/LanguageContext';

interface HomeServiceBannerProps {
  onConfigure: () => void;
}

export default function HomeServiceBanner({ onConfigure }: HomeServiceBannerProps) {
  const { t } = useLanguage();

  return (
    <div className="bg-orange-50/50 border border-orange-200/50 rounded-[2rem] p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-orange-100/70 border border-orange-200/60 flex items-center justify-center text-[#FF6B00] shrink-0">
          <Home size={22} strokeWidth={1.5} />
        </div>
        <div className="space-y-1">
          <h3 className="font-bold text-stone-800 text-lg">
            {t('dashboard.locations.home_service_notice')}
          </h3>
          <p className="text-stone-500 text-sm font-medium max-w-lg leading-relaxed">
            {t('dashboard.locations.home_service_desc')}
          </p>
        </div>
      </div>
      <button
        onClick={onConfigure}
        className="flex items-center gap-2 text-[#FF6B00] font-bold text-sm border border-orange-300/60 px-4 py-2.5 rounded-xl hover:bg-orange-100/50 transition-all shrink-0"
      >
        {t('dashboard.locations.home_service_config')}
        <ChevronRight size={14} />
      </button>
    </div>
  );
}

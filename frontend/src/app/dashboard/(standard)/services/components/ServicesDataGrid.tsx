"use client"
import React from 'react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { Clock, Pencil, Flower2 } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";

interface ServicesDataGridProps {
  services: any[];
  categories: any[];
  loading: boolean;
  showArchived: boolean;
  onEditClick: (svc: any) => void;
}

export default function ServicesDataGrid({
  services,
  categories,
  loading,
  showArchived,
  onEditClick,
}: ServicesDataGridProps) {
  const { t } = useLanguage();

  const filteredServices = showArchived 
    ? services 
    : services.filter(s => s.is_active);

  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || "General";
  
  const groupedServices = filteredServices.reduce((acc, svc) => {
    const catName = getCategoryName(svc.category_id);
    if (!acc[catName]) acc[catName] = [];
    acc[catName].push(svc);
    return acc;
  }, {} as Record<string, any[]>);

  if (loading) {
    return (
      <div className="space-y-12 animate-in fade-in duration-500">
        {Array(2).fill(0).map((_, i) => (
          <div key={i}>
            <div className="flex items-center gap-3 mb-6">
              <Skeleton className="w-8 h-8 rounded-full" />
              <Skeleton className="h-6 w-48 rounded-lg" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array(3).fill(0).map((_, j) => (
                <div key={j} className="bg-white p-6 rounded-[2rem] shadow-sm border border-stone-100 flex flex-col gap-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <Skeleton className="h-6 w-32 rounded-lg" />
                      <Skeleton className="h-3 w-20 rounded-full" />
                    </div>
                    <Skeleton className="w-16 h-8 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full rounded-md" />
                    <Skeleton className="h-4 w-3/4 rounded-md" />
                    <Skeleton className="h-4 w-1/2 rounded-md" />
                  </div>
                  <div className="flex justify-between items-center border-t border-stone-100 pt-4 mt-auto">
                    <Skeleton className="h-8 w-24 rounded-lg" />
                    <Skeleton className="h-8 w-20 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (filteredServices.length === 0) {
    return (
      <div className="text-center py-24 text-stone-400 bg-stone-50/50 rounded-[2rem] border border-stone-200 border-dashed animate-in fade-in duration-500">
        {showArchived ? t('dashboard.services.no_services') : t('dashboard.services.no_active_services')}
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      {Object.entries(groupedServices).map(([categoryName, svcs]) => (
        <div key={categoryName}>
          <h3 className="text-xl font-black text-stone-800 mb-6 flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-[#d4af37] text-sm leading-none">
              <Flower2 size={16} strokeWidth={1.5} />
            </span>
            {categoryName}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(svcs as any[]).map((svc: any) => (
              <div key={svc.id} className={`bg-white p-6 rounded-[2rem] shadow-sm border transition-all duration-300 group relative overflow-hidden flex flex-col ${svc.is_active ? 'border-stone-100 hover:shadow-xl hover:shadow-yellow-50 hover:-translate-y-1' : 'opacity-60 grayscale-[0.3] border-dashed border-stone-300'}`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-yellow-50 to-transparent rounded-bl-[4rem] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div>
                    {!svc.is_active && <span className="inline-block bg-stone-100 text-stone-500 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full mb-1">{t('dashboard.services.archived')}</span>}
                    {svc.is_featured && <span className="inline-block bg-yellow-100 text-yellow-700 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full mb-1 ml-1">{t('dashboard.services.featured_cover')}</span>}
                    <h4 className={`text-xl font-bold pr-4 leading-tight ${svc.is_active ? 'text-stone-800' : 'text-stone-500'}`}>{svc.name}</h4>
                  </div>
                  <span className="bg-[#fcf8e5] text-[#b08e23] font-bold px-3 py-1.5 rounded-xl text-sm shrink-0 whitespace-nowrap shadow-sm border border-yellow-100">
                    {svc.price} €
                  </span>
                </div>
                
                <p className="text-stone-500 text-sm mb-8 line-clamp-3 min-h-[4rem] relative z-10 font-medium">
                  {svc.description || t('dashboard.services.generic_description')}
                </p>
                
                <div className="flex justify-between items-center border-t border-stone-100 pt-4 mt-auto relative z-10">
                  <div className="flex items-center gap-2 text-stone-400 text-sm font-semibold bg-stone-50 px-3 py-1.5 rounded-lg border border-stone-100">
                    <Clock size={16} strokeWidth={1.5} className="text-[#d4af37]" /> {t('dashboard.services.duration_mins', { minutes: svc.duration_minutes })}
                  </div>
                  <button type="button" onClick={() => onEditClick(svc)} className="text-stone-400 hover:text-stone-800 font-bold text-sm bg-white border border-stone-200 px-3 py-1.5 rounded-lg shadow-sm active:scale-95 transition-all flex items-center gap-1.5">
                    <Pencil size={14} strokeWidth={1.5} /> {t('dashboard.services.edit')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

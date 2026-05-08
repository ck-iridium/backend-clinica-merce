import React from 'react';
import { InvoiceKPIs as KPISType } from '@/lib/types';
import { Banknote, ReceiptText, Calculator } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface Props {
  kpis: KPISType;
  loading: boolean;
}

export default function InvoiceKPIs({ kpis, loading }: Props) {
  const formatEuro = (amount: number) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-32 rounded-[2rem] w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Total Bruto - Destacado */}
      <div className="rounded-[2rem] border-0 shadow-sm bg-stone-900 text-white overflow-hidden relative group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-[4rem] pointer-events-none transition-transform group-hover:scale-110"></div>
        <div className="p-6 relative z-10 flex flex-col justify-between h-full min-h-[8rem]">
          <div className="flex justify-between items-start mb-2">
            <span className="text-stone-400 font-bold text-xs uppercase tracking-widest">Total Bruto</span>
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <Banknote size={20} className="text-[#d4af37]" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-serif font-bold text-white tracking-tight">
              {formatEuro(kpis.total_gross)}
            </h3>
          </div>
        </div>
      </div>

      {/* Base Imponible */}
      <div className="rounded-[2rem] border border-stone-200 shadow-sm bg-white overflow-hidden relative group">
        <div className="p-6 relative z-10 flex flex-col justify-between h-full min-h-[8rem]">
          <div className="flex justify-between items-start mb-2">
            <span className="text-stone-500 font-bold text-xs uppercase tracking-widest">Base Imponible</span>
            <div className="w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center border border-stone-100">
              <ReceiptText size={20} className="text-stone-600" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-serif font-bold text-stone-800 tracking-tight">
              {formatEuro(kpis.tax_base)}
            </h3>
          </div>
        </div>
      </div>

      {/* Cuota de IVA */}
      <div className="rounded-[2rem] border border-stone-200 shadow-sm bg-white overflow-hidden relative group">
        <div className="p-6 relative z-10 flex flex-col justify-between h-full min-h-[8rem]">
          <div className="flex justify-between items-start mb-2">
            <span className="text-stone-500 font-bold text-xs uppercase tracking-widest">Cuota de IVA</span>
            <div className="w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center border border-stone-100">
              <Calculator size={20} className="text-stone-600" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-serif font-bold text-stone-800 tracking-tight">
              {formatEuro(kpis.vat_quota)}
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
}

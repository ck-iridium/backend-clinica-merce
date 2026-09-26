'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { PaymentMethod } from './types';

interface POSSuccessViewProps {
  lastInvoice: any;
  paymentMethod: PaymentMethod;
  getFriendlyDateStr: (dateStr: string) => string;
  onNewSale: () => void;
}

export function POSSuccessView({
  lastInvoice,
  paymentMethod,
  getFriendlyDateStr,
  onNewSale,
}: POSSuccessViewProps) {
  const { t } = useLanguage();

  return (
    <div className="bg-white rounded-[2.5rem] p-12 max-w-2xl mx-auto text-center border border-stone-100 shadow-luxury animate-in zoom-in-95 duration-500">
      <div className="w-20 h-20 bg-stone-50 border border-[#d4af37]/30 text-[#d4af37] rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
        <Sparkles size={36} />
      </div>
      <h2 className="text-3xl font-serif text-stone-900 mb-3">
        {t('dashboard.pos.sale_completed') || '¡Cobro Realizado!'}
      </h2>
      <p className="text-stone-500 mb-8 font-medium">
        {t('dashboard.pos.invoice_generated') || 'El registro fiscal '}
        <span className="text-stone-900 font-bold font-mono bg-stone-100 px-2 py-1 rounded">
          #{lastInvoice.number || lastInvoice.id}
        </span>
        {t('dashboard.pos.generated_as_paid') || ' se ha procesado correctamente como PAGADO.'}
      </p>

      <div className="bg-stone-50 rounded-2xl p-6 mb-10 text-left border border-stone-200/40 max-w-md mx-auto space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-stone-400">Fecha:</span>
          <span className="font-semibold">{getFriendlyDateStr(lastInvoice.date)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-stone-400">Concepto:</span>
          <span className="font-semibold text-right max-w-[200px] truncate">{lastInvoice.concept}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-stone-400">Método de Pago:</span>
          <span className="font-semibold">{paymentMethod}</span>
        </div>
        <div className="border-t border-stone-200/60 pt-2 flex justify-between font-serif text-lg text-stone-900">
          <span>Importe Total:</span>
          <span className="font-bold text-[#d4af37]">{Number(lastInvoice.amount).toFixed(2)}€</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          id="pos-view-invoices-link"
          href="/dashboard/invoices"
          className="bg-stone-900 text-white px-8 py-4 rounded-xl font-medium hover:bg-stone-800 transition-all shadow-md active:scale-[0.98] text-sm"
        >
          {t('dashboard.pos.view_all_invoices') || 'Ver Historial de Facturas'}
        </Link>
        <button
          id="pos-new-sale-btn"
          onClick={onNewSale}
          className="bg-stone-100 text-stone-700 px-8 py-4 rounded-xl font-medium hover:bg-stone-200 transition-all active:scale-[0.98] border border-stone-200/40 text-sm"
        >
          {t('dashboard.pos.new_sale') || 'Nueva Venta 🏷️'}
        </button>
      </div>
    </div>
  );
}

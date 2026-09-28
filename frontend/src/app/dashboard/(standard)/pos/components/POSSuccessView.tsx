'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Printer, FileText, Plus, CheckCircle2, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { PaymentMethod } from './types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] p-8 sm:p-12 max-w-2xl mx-auto text-center border border-stone-200/80 shadow-luxury animate-in zoom-in-95 duration-500 relative overflow-hidden">
      {/* Halo de luz dorada */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 bg-[#D4AF37]/15 rounded-full blur-3xl pointer-events-none" />

      {/* Icono de éxito */}
      <div className="w-20 h-20 bg-gradient-to-b from-amber-50 to-amber-100/50 border border-[#D4AF37]/30 text-[#B38F26] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
        <Sparkles size={36} />
      </div>

      <Badge variant="luxury" className="mb-3 py-1 px-3.5 text-xs">
        Transacción Completada
      </Badge>

      <h2 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 mb-3 tracking-tight">
        {t('dashboard.pos.sale_completed') || '¡Cobro Realizado con Éxito!'}
      </h2>

      <p className="text-stone-500 mb-8 font-normal text-sm max-w-md mx-auto">
        {t('dashboard.pos.invoice_generated') || 'El registro fiscal '}
        <span className="text-stone-900 font-bold font-mono bg-stone-100 px-2 py-0.5 rounded-lg border border-stone-200">
          #{lastInvoice.number || lastInvoice.id}
        </span>
        {t('dashboard.pos.generated_as_paid') || ' se ha emitido y liquidado correctamente.'}
      </p>

      {/* Ticket Digital Unificado */}
      <div className="bg-stone-50/80 rounded-3xl p-6 sm:p-8 mb-8 text-left border border-stone-200/70 max-w-lg mx-auto space-y-4 shadow-sm relative">
        <div className="flex justify-between items-center border-b border-stone-200/60 pb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-400">Comprobante Fiscal</span>
          <Badge variant="success" className="text-[10px]">
            <CheckCircle2 size={11} className="mr-1" />
            PAGADO
          </Badge>
        </div>

        <div className="space-y-2.5 text-xs sm:text-sm">
          <div className="flex justify-between">
            <span className="text-stone-500">Fecha de Liquidación:</span>
            <span className="font-semibold text-stone-800">{getFriendlyDateStr(lastInvoice.date)}</span>
          </div>
          <div className="flex justify-between items-start gap-4">
            <span className="text-stone-500 shrink-0">Concepto / Servicios:</span>
            <span className="font-semibold text-stone-800 text-right truncate max-w-[220px]">
              {lastInvoice.concept}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">Método de Cobro:</span>
            <span className="font-semibold text-stone-800 font-mono">{paymentMethod}</span>
          </div>
        </div>

        <div className="border-t border-dashed border-stone-300 pt-3 flex justify-between items-baseline font-serif">
          <div>
            <span className="text-stone-500 text-xs font-sans block">Total Facturado (IVA Inc.)</span>
            <span className="text-xl sm:text-2xl font-bold text-stone-900">Importe Final</span>
          </div>
          <span className="text-3xl font-bold text-[#D4AF37] font-mono">
            {Number(lastInvoice.amount).toFixed(2)}€
          </span>
        </div>
      </div>

      {/* Botones de Acción */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
        <Button
          id="pos-new-sale-btn"
          onClick={onNewSale}
          variant="luxury"
          size="lg"
          className="w-full sm:w-auto h-12 px-7 gap-2 shadow-luxury text-stone-950 font-bold"
        >
          <Plus size={16} />
          <span>{t('dashboard.pos.new_sale') || 'Nueva Venta'}</span>
        </Button>

        <Button
          id="pos-print-ticket-btn"
          onClick={handlePrint}
          variant="outline"
          size="lg"
          className="w-full sm:w-auto h-12 px-6 gap-2 bg-white"
        >
          <Printer size={16} className="text-stone-500" />
          <span>Imprimir Ticket</span>
        </Button>

        <Button
          id="pos-view-invoices-link"
          asChild
          variant="ghost"
          size="lg"
          className="w-full sm:w-auto h-12 px-5 text-stone-600 hover:text-stone-900 gap-1.5"
        >
          <Link href="/dashboard/invoices">
            <span>{t('dashboard.pos.view_all_invoices') || 'Ver Facturas'}</span>
            <ArrowRight size={14} />
          </Link>
        </Button>
      </div>
    </div>
  );
}

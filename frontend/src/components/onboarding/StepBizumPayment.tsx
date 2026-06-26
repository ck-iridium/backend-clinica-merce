"use client"

import React, { useState } from 'react';
import { Check, Copy, ExternalLink, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';

interface TenantData {
  tenant_id: string;
  tenant_slug: string;
  tenant_name: string;
  admin_email: string;
  admin_name: string;
  admin_password: string;
  reference_code?: string;
  amount?: string;
}

interface StepBizumPaymentProps {
  tenantData: TenantData;
  onAccessDashboard: () => void;
}

export const StepBizumPayment: React.FC<StepBizumPaymentProps> = ({
  tenantData,
  onAccessDashboard
}) => {
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const BIZUM_PHONE = "600 000 000";
  const displayAmount = tenantData.amount ? parseFloat(tenantData.amount).toFixed(2) : "59.00";
  const displayCode = tenantData.reference_code || "PB-XXXXX";

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(BIZUM_PHONE.replace(/\s+/g, ''));
    setCopiedPhone(true);
    toast.success("Teléfono de Bizum copiado");
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(displayCode);
    setCopiedCode(true);
    toast.success("Código de referencia copiado");
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-xl mx-auto py-4">
      {/* Success Icon Group */}
      <div className="flex flex-col items-center text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-[#fcf8e5] flex items-center justify-center text-[#d4af37] shadow-inner relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-[#d4af37]/20 to-transparent"></div>
          <Check className="w-8 h-8 relative z-10 stroke-[3]" />
        </div>
        <h2 className="text-2xl md:text-3xl font-serif italic text-stone-850">
          ¡Tu entorno ya está listo!
        </h2>
        <p className="text-xs text-stone-500 font-medium leading-relaxed max-w-md">
          Hemos configurado tu base de datos y preparado tu espacio de trabajo. Tienes <span className="text-stone-900 font-semibold">24 horas de acceso de gracia</span> para explorar el sistema. Para activar tu suscripción definitiva, realiza un Bizum de manera manual:
        </p>
      </div>

      {/* Elegant Bizum Instructions Card */}
      <div className="bg-[#F7F7F5] rounded-3xl p-6 md:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-6">
        <div className="flex items-center justify-between border-b border-stone-200/60 pb-3">
          <span className="text-[10px] font-black tracking-widest text-[#d4af37] uppercase">
            Instrucciones de Pago
          </span>
          <span className="text-[10px] font-bold text-stone-400 font-serif italic">
            Bizum Soft-Launch
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Bizum Phone */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
              Teléfono de Bizum
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-lg font-bold text-stone-850">{BIZUM_PHONE}</span>
              <button
                onClick={handleCopyPhone}
                type="button"
                className="p-1.5 rounded-lg hover:bg-stone-200/50 text-stone-500 hover:text-stone-800 transition-all active:scale-95"
                title="Copiar número"
              >
                {copiedPhone ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Amount */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
              Importe
            </span>
            <span className="font-mono text-lg font-bold text-stone-850">
              {displayAmount} € <span className="text-xs text-stone-400 font-sans font-medium">/ mes</span>
            </span>
          </div>
        </div>

        {/* Concept / Reference Code (The most critical part) */}
        <div className="space-y-2 pt-2 border-t border-stone-200/60">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
            Concepto del Bizum (Código de Referencia)
          </span>
          <div className="flex items-center justify-between bg-white border border-stone-200 rounded-2xl p-4 transition-all hover:border-[#d4af37]/40 shadow-sm">
            <div className="space-y-0.5">
              <span className="font-mono text-xl font-black text-stone-900 tracking-wider">
                {displayCode}
              </span>
              <span className="text-[9px] text-stone-400 font-medium block">
                Introduce únicamente este código en el concepto.
              </span>
            </div>
            <button
              onClick={handleCopyCode}
              type="button"
              className="flex items-center gap-1.5 bg-stone-900 hover:bg-[#d4af37] text-white hover:text-stone-950 px-4 py-2 rounded-xl text-[10px] font-bold tracking-widest uppercase transition-all duration-300 active:scale-95 shadow-md shadow-stone-950/5"
            >
              {copiedCode ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  Copiado
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copiar Código
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Warning Notification Banner */}
      <div className="bg-[#d4af37]/5 border-l-4 border-[#d4af37] p-4 text-xs text-stone-700 rounded-r-2xl flex items-start gap-3 leading-relaxed shadow-sm">
        <HelpCircle className="w-5 h-5 text-[#d4af37] shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-stone-850 block mb-0.5">Importante para la Activación</span>
          Es obligatorio usar el código de referencia anterior como concepto en tu Bizum. Si no se introduce correctamente, nuestro sistema automatizado no podrá vincular el pago a tu negocio y tu cuenta de gracia de 24 horas se suspenderá automáticamente.
        </div>
      </div>

      {/* Big Action Button */}
      <div className="pt-2">
        <button
          onClick={onAccessDashboard}
          type="button"
          className="w-full bg-stone-900 hover:bg-[#d4af37] hover:text-stone-950 text-white py-4 rounded-xl text-xs font-bold transition-all shadow-lg uppercase tracking-widest active:scale-95 duration-300 flex items-center justify-center gap-2"
        >
          Acceder a mi panel de control <ExternalLink className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

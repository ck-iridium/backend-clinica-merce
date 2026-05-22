"use client";

import React from 'react';
import { DollarSign, CreditCard, TrendingUp, Building } from 'lucide-react';

interface Tenant {
  id: string;
  name: string;
  slug: string;
  stripe_customer_id: string | null;
  subscription_status: string;
  stripe_subscription_id?: string | null;
  plan_type?: string;
  subscription_expires_at?: string | null;
  created_at: string | null;
}

interface SaaSFinanceProps {
  tenants: Tenant[];
}

export default function SaaSFinance({ tenants }: SaaSFinanceProps) {
  const activeTenantsCount = tenants.filter(t => t.subscription_status === 'active').length;
  
  const activeMRR = tenants.reduce((acc, t) => {
    if (t.subscription_status === 'active') {
      if (t.plan_type === 'basic') return acc + 29;
      if (t.plan_type === 'pro') return acc + 59;
      if (t.plan_type === 'gold') return acc + 99;
    }
    return acc;
  }, 0);

  const arpu = activeMRR / (activeTenantsCount || 1);
  const annualRunRate = activeMRR * 12;

  const formattedMRR = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(activeMRR);
  const formattedARPU = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }).format(arpu);
  const formattedARR = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(annualRunRate);

  return (
    <div className="flex-1 p-6 md:p-12 overflow-y-auto space-y-8 max-w-4xl w-full animate-in fade-in duration-300">
      {/* Bento Matrix: Financiera */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="bg-white rounded-3xl border border-stone-100 p-6 shadow-sm flex items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 bottom-0 w-1 bg-[#d4af37]"></div>
          <span className="w-12 h-12 rounded-2xl bg-[#fcf8e5] text-[#b08e23] flex items-center justify-center shrink-0">
            <DollarSign className="w-6 h-6" />
          </span>
          <div>
            <span className="text-[10px] text-stone-400 font-bold uppercase tracking-widest block">MRR Estimado</span>
            <span className="text-3xl font-serif font-black text-stone-900 block mt-0.5">{formattedMRR}</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-stone-100 p-6 shadow-sm flex items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 bottom-0 w-1 bg-emerald-500"></div>
          <span className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CreditCard className="w-6 h-6" />
          </span>
          <div>
            <span className="text-[10px] text-stone-400 font-bold uppercase tracking-widest block">ARPU (Ingreso Medio)</span>
            <span className="text-2xl font-serif font-black text-stone-900 block mt-0.5">{formattedARPU}</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-stone-100 p-6 shadow-sm flex items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 bottom-0 w-1 bg-stone-850"></div>
          <span className="w-12 h-12 rounded-2xl bg-stone-50 text-stone-850 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </span>
          <div>
            <span className="text-[10px] text-stone-400 font-bold uppercase tracking-widest block">ARR (Run Rate Anual)</span>
            <span className="text-2xl font-serif font-black text-stone-900 block mt-0.5">{formattedARR}</span>
          </div>
        </div>

      </div>

      {/* Listado de Suscripciones con Precios */}
      <div className="bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-stone-100">
          <h3 className="text-xl font-serif font-bold text-stone-800 flex items-center gap-2">
            <Building className="w-5 h-5 text-[#d4af37]" /> Estado Financiero por Inquilino
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-100 text-stone-400 font-bold tracking-wider text-[10px] uppercase">
                <th className="py-4 px-8">Inquilino / Slug</th>
                <th className="py-4 px-6">Plan Suscrito</th>
                <th className="py-4 px-6">Estado Cobro</th>
                <th className="py-4 px-8 text-right">Facturación Estimada</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((t) => {
                let planPrice = 0;
                if (t.subscription_status === 'active') {
                  if (t.plan_type === 'basic') planPrice = 29;
                  if (t.plan_type === 'pro') planPrice = 59;
                  if (t.plan_type === 'gold') planPrice = 99;
                }

                return (
                  <tr key={t.id} className="border-b border-stone-100 hover:bg-stone-50/50 transition-colors">
                    <td className="py-4 px-8">
                      <span className="font-bold text-stone-800 block">{t.name}</span>
                      <span className="text-[10px] text-stone-400 font-mono mt-0.5 block">{t.slug}.probookia.com</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xxs font-black uppercase tracking-widest ${
                        t.plan_type === 'gold' 
                          ? 'bg-amber-50 text-[#b08e23]' 
                          : t.plan_type === 'pro'
                          ? 'bg-stone-900 text-white'
                          : t.plan_type === 'basic'
                          ? 'bg-stone-100 text-stone-700'
                          : 'bg-stone-50 text-stone-400'
                      }`}>
                        {t.plan_type || 'free trial'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        t.subscription_status === 'active' 
                          ? 'bg-emerald-50 text-emerald-700' 
                          : 'bg-amber-50 text-amber-700'
                      }`}>
                        {t.subscription_status === 'active' ? 'Pagado' : 'Suspendido / Trial'}
                      </span>
                    </td>
                    <td className="py-4 px-8 text-right font-mono font-bold text-stone-700">
                      {planPrice > 0 ? `${planPrice}€ / mes` : '0€ (Trial)'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

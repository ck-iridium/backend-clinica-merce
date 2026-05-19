"use client";

import React from 'react';
import { Users, TrendingUp, ShieldCheck, Sparkles } from 'lucide-react';

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

interface SaaSAnalyticsProps {
  tenants: Tenant[];
}

export default function SaaSAnalytics({ tenants }: SaaSAnalyticsProps) {
  const totalTenantsCount = tenants.length;
  const activeTenantsCount = tenants.filter(t => t.subscription_status === 'active').length;
  
  const freeTrialPlansCount = tenants.filter(t => t.plan_type === 'free' || !t.plan_type).length;
  const basicPlansCount = tenants.filter(t => t.plan_type === 'basic').length;
  const proPlansCount = tenants.filter(t => t.plan_type === 'pro').length;
  const goldPlansCount = tenants.filter(t => t.plan_type === 'gold').length;

  return (
    <div className="flex-1 p-6 md:p-12 overflow-y-auto space-y-8 max-w-[1000px] mx-auto w-full animate-in fade-in duration-300">
      {/* Bento Matrix: Tarjetas de Rendimiento */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="bg-white rounded-3xl border border-stone-100 p-6 shadow-sm flex items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 bottom-0 w-1 bg-[#d4af37]"></div>
          <span className="w-12 h-12 rounded-2xl bg-[#fcf8e5] text-[#b08e23] flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </span>
          <div>
            <span className="text-[10px] text-stone-400 font-bold uppercase tracking-widest block">Negocios Registrados</span>
            <span className="text-3xl font-serif font-black text-stone-900 block mt-0.5">{totalTenantsCount}</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-stone-100 p-6 shadow-sm flex items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 bottom-0 w-1 bg-emerald-500"></div>
          <span className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </span>
          <div>
            <span className="text-[10px] text-stone-400 font-bold uppercase tracking-widest block">Cuentas Activas</span>
            <span className="text-3xl font-serif font-black text-stone-900 block mt-0.5">{activeTenantsCount}</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-stone-100 p-6 shadow-sm flex items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 bottom-0 w-1 bg-amber-500"></div>
          <span className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </span>
          <div>
            <span className="text-[10px] text-stone-400 font-bold uppercase tracking-widest block">Tasa de Ocupación SaaS</span>
            <span className="text-3xl font-serif font-black text-stone-900 block mt-0.5">
              {totalTenantsCount > 0 ? Math.round((activeTenantsCount / totalTenantsCount) * 100) : 0}%
            </span>
          </div>
        </div>

      </div>

      {/* Distribución por Planes */}
      <div className="bg-white rounded-3xl border border-stone-100 p-8 shadow-sm">
        <h3 className="text-xl font-serif font-bold text-stone-800 mb-6 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#d4af37]" /> Distribución de Clientes por Planes
        </h3>

        <div className="space-y-6">
          
          {/* Gold Plan */}
          <div>
            <div className="flex justify-between items-center text-sm font-sans mb-2">
              <span className="font-bold text-stone-700 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#d4af37]"></span> Gold Plan (Lujo Total)
              </span>
              <span className="text-stone-500 font-semibold">{goldPlansCount} inquilinos</span>
            </div>
            <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#d4af37] rounded-full transition-all duration-500" 
                style={{ width: `${totalTenantsCount > 0 ? (goldPlansCount / totalTenantsCount) * 100 : 0}%` }}
              ></div>
            </div>
          </div>

          {/* Pro Plan */}
          <div>
            <div className="flex justify-between items-center text-sm font-sans mb-2">
              <span className="font-bold text-stone-700 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-stone-850"></span> Pro Plan (Multisala)
              </span>
              <span className="text-stone-500 font-semibold">{proPlansCount} inquilinos</span>
            </div>
            <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-stone-850 rounded-full transition-all duration-500" 
                style={{ width: `${totalTenantsCount > 0 ? (proPlansCount / totalTenantsCount) * 100 : 0}%` }}
              ></div>
            </div>
          </div>

          {/* Basic Plan */}
          <div>
            <div className="flex justify-between items-center text-sm font-sans mb-2">
              <span className="font-bold text-stone-700 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-stone-400"></span> Basic Plan (Mono)
              </span>
              <span className="text-stone-500 font-semibold">{basicPlansCount} inquilinos</span>
            </div>
            <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-stone-400 rounded-full transition-all duration-500" 
                style={{ width: `${totalTenantsCount > 0 ? (basicPlansCount / totalTenantsCount) * 100 : 0}%` }}
              ></div>
            </div>
          </div>

          {/* Free Plan / Demo */}
          <div>
            <div className="flex justify-between items-center text-sm font-sans mb-2">
              <span className="font-bold text-stone-700 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-stone-200"></span> Semilla de Sistema / Free Trial
              </span>
              <span className="text-stone-500 font-semibold">{freeTrialPlansCount} inquilinos</span>
            </div>
            <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-stone-200 rounded-full transition-all duration-500" 
                style={{ width: `${totalTenantsCount > 0 ? (freeTrialPlansCount / totalTenantsCount) * 100 : 0}%` }}
              ></div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

"use client"

import React from 'react';

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
  custom_domain?: string | null;
}

interface TenantOverviewTabProps {
  tenant: Tenant;
}

export default function TenantOverviewTab({ tenant }: TenantOverviewTabProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold font-serif text-stone-900 border-b border-stone-100 pb-2">
        Información General del Inquilino
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
        <div className="space-y-1">
          <span className="text-stone-400 text-xs font-bold uppercase tracking-wider">ID Único</span>
          <p className="font-mono text-stone-700 font-semibold">{tenant.id}</p>
        </div>
        <div className="space-y-1">
          <span className="text-stone-400 text-xs font-bold uppercase tracking-wider">Plan Comercial</span>
          <div className="text-stone-900 font-bold text-base flex items-center gap-2">
            {tenant.plan_type === 'gold' && '🥇 Elite Gold Plan'}
            {tenant.plan_type === 'pro' && '🥈 Pro Premium Plan'}
            {tenant.plan_type === 'basic' && '🥉 Basic Plan'}
            {(!tenant.plan_type || tenant.plan_type === 'free') && '🌱 Free Trial Plan'}
            <span className="bg-[#fcf8e5] text-[#d4af37] px-2 py-0.5 rounded text-[9px] font-black uppercase">
              {tenant.plan_type || 'FREE'}
            </span>
          </div>
        </div>
        <div className="space-y-1">
          <span className="text-stone-400 text-xs font-bold uppercase tracking-wider">Estado en Middleware</span>
          <p className="text-stone-850 font-medium">
            {tenant.subscription_status === 'active' 
              ? 'Permitido y desbloqueado en capas de API globales' 
              : 'Acceso denegado con cabecera de suspensión activa'}
          </p>
        </div>
        <div className="space-y-1">
          <span className="text-stone-400 text-xs font-bold uppercase tracking-wider">Renovación / Expiración</span>
          <p className="text-stone-850 font-medium font-mono text-xs">
            {tenant.subscription_expires_at 
              ? new Date(tenant.subscription_expires_at).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })
              : 'Sin fecha de expiración activa'}
          </p>
        </div>
      </div>
    </div>
  );
}

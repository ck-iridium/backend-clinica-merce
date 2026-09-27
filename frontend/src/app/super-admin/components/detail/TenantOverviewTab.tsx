"use client"

import React, { useState } from 'react'
import { Crown, Zap, Sparkles, Clock, ShieldCheck, ShieldAlert, Copy, Check } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface Tenant {
  id: string
  name: string
  slug: string
  stripe_customer_id: string | null
  subscription_status: string
  stripe_subscription_id?: string | null
  plan_type?: string
  subscription_expires_at?: string | null
  created_at: string | null
  custom_domain?: string | null
}

interface TenantOverviewTabProps {
  tenant: Tenant
}

export default function TenantOverviewTab({ tenant }: TenantOverviewTabProps) {
  const [copiedId, setCopiedId] = useState(false)

  const copyTenantId = () => {
    navigator.clipboard.writeText(tenant.id)
    setCopiedId(true)
    toast.success('ID de inquilino copiado al portapapeles')
    setTimeout(() => setCopiedId(false), 2000)
  }

  const getPlanDetails = (plan?: string) => {
    switch (plan?.toLowerCase()) {
      case 'gold':
      case 'elite':
        return {
          name: 'Elite Gold',
          desc: 'Acceso total multi-sucursal y personal ilimitado',
          icon: Crown,
          badgeClass: 'bg-gradient-to-r from-amber-500/15 via-[#D4AF37]/20 to-amber-600/15 text-[#B38F26] border-[#D4AF37]/40',
        }
      case 'pro':
        return {
          name: 'Pro Premium',
          desc: 'Hasta 5 especialistas con recordatorios SMS y TPV',
          icon: Zap,
          badgeClass: 'bg-blue-50 text-blue-700 border-blue-200/80',
        }
      case 'basic':
      case 'individual':
        return {
          name: 'Individual Essential',
          desc: '1 especialista con agenda inteligente y recordatorios',
          icon: Sparkles,
          badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
        }
      default:
        return {
          name: 'Free Trial',
          desc: 'Acceso de cortesía temporal para evaluación',
          icon: Sparkles,
          badgeClass: 'bg-stone-100 text-stone-600 border-stone-200',
        }
    }
  }

  const planInfo = getPlanDetails(tenant.plan_type)
  const PlanIcon = planInfo.icon

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h3 className="text-base font-serif font-bold text-stone-900 tracking-tight">
          Información Operativa del Inquilino
        </h3>
        <p className="text-xs text-stone-400 mt-0.5">
          Parámetros técnicos y asignación comercial en la infraestructura SaaS
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Identificador Único */}
        <Card className="p-4 bg-white/90 border-stone-200/70 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
              Identificador Único (UUID)
            </span>
            <button
              onClick={copyTenantId}
              className="text-stone-400 hover:text-stone-900 transition-colors p-1 rounded-md hover:bg-stone-100"
              title="Copiar ID"
            >
              {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          <p className="font-mono text-xs text-stone-800 font-medium truncate bg-stone-50 px-2.5 py-1.5 rounded-lg border border-stone-200/60">
            {tenant.id}
          </p>
          <span className="text-[10px] text-stone-400">Clave primaria de aislamiento RLS</span>
        </Card>

        {/* Plan Comercial */}
        <Card className="p-4 bg-white/90 border-stone-200/70 flex flex-col justify-between space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
            Nivel de Suscripción
          </span>
          <div className="flex items-center gap-2.5">
            <div className={cn("px-2.5 py-1 rounded-lg border text-xs font-bold inline-flex items-center gap-1.5", planInfo.badgeClass)}>
              <PlanIcon className="w-3.5 h-3.5 shrink-0" />
              <span>{planInfo.name}</span>
            </div>
          </div>
          <span className="text-[11px] text-stone-500 font-medium leading-tight">
            {planInfo.desc}
          </span>
        </Card>

        {/* Estado en Capa de Middleware */}
        <Card className="p-4 bg-white/90 border-stone-200/70 flex flex-col justify-between space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
            Filtro de Seguridad Edge
          </span>
          <div className="flex items-center gap-2">
            {tenant.subscription_status === 'active' ? (
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <p className="text-xs font-semibold text-stone-800">
              {tenant.subscription_status === 'active' 
                ? 'Acceso concedido en Edge Middleware' 
                : 'Acceso restringido por suspensión'}
            </p>
          </div>
          <span className="text-[10px] text-stone-400">
            {tenant.subscription_status === 'active'
              ? 'Rutas y API autorizadas globalmente'
              : 'Pantalla de pausa activa para el tráfico'}
          </span>
        </Card>

        {/* Renovación y Vencimiento */}
        <Card className="p-4 bg-white/90 border-stone-200/70 flex flex-col justify-between space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
            Ciclo de Renovación
          </span>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-stone-400 shrink-0" />
            <p className="text-xs font-semibold text-stone-800 font-mono">
              {tenant.subscription_expires_at 
                ? new Date(tenant.subscription_expires_at).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                : 'Sin fecha límite establecida'}
            </p>
          </div>
          <span className="text-[10px] text-stone-400">
            Vencimiento de ciclo o gracia de 24h
          </span>
        </Card>
      </div>
    </div>
  )
}

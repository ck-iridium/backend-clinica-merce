"use client"

import React, { useState } from 'react'
import { 
  Sparkles, 
  Image as ImageIcon, 
  FileText, 
  Infinity as InfinityIcon, 
  RotateCcw, 
  Plus, 
  CheckCircle2, 
  Key, 
  ShieldCheck, 
  Zap, 
  Loader2,
  AlertCircle
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  business_sector?: string | null
  ai_unlimited?: boolean
  ai_bonus_images?: number
  ai_bonus_daily_actions?: number
  ai_images_remaining?: number
  ai_images_limit?: number
  ai_images_used?: number
  ai_actions_remaining?: number
  ai_actions_limit?: number
  ai_actions_used?: number
  has_own_key?: boolean
}

interface TenantAiQuotaTabProps {
  tenant: Tenant
  onUpdateTenant?: (updated: Tenant) => void
  getJwtToken: () => string
}

export default function TenantAiQuotaTab({
  tenant,
  onUpdateTenant,
  getJwtToken
}: TenantAiQuotaTabProps) {
  const [loadingAction, setLoadingAction] = useState<string | null>(null)
  const [customPhotos, setCustomPhotos] = useState<string>('')
  const [customActions, setCustomActions] = useState<string>('')

  const isUnlimited = !!tenant.ai_unlimited
  const isGold = tenant.plan_type?.toLowerCase() === 'gold'
  const hasByok = !!tenant.has_own_key

  const imagesUsed = tenant.ai_images_used ?? 0
  const imagesLimit = tenant.ai_images_limit ?? 5
  const imagesRemaining = isUnlimited || hasByok ? 999999 : (tenant.ai_images_remaining ?? 0)
  const imagesPercentage = Math.min(100, Math.round((imagesUsed / Math.max(1, imagesLimit)) * 100))

  const actionsUsed = tenant.ai_actions_used ?? 0
  const actionsLimit = tenant.ai_actions_limit ?? 35
  const actionsRemaining = isUnlimited || isGold || hasByok ? 999999 : (tenant.ai_actions_remaining ?? 0)
  const actionsPercentage = Math.min(100, Math.round((actionsUsed / Math.max(1, actionsLimit)) * 100))

  const handleExecuteQuotaAction = async (
    action: 'add_images' | 'add_actions' | 'reset_images' | 'reset_actions' | 'set_unlimited',
    amount: number = 0,
    unlimitedVal?: boolean
  ) => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    const jwtToken = getJwtToken()
    setLoadingAction(action)

    try {
      const res = await fetch(`${API_URL}/super-admin/tenants/${tenant.id}/ai-quota`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action,
          amount,
          unlimited: unlimitedVal
        })
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.detail || 'Error al actualizar cuota de IA')
      }

      const updatedTenant = await res.json()
      if (onUpdateTenant) {
        onUpdateTenant(updatedTenant)
      }

      if (action === 'add_images') {
        toast.success(`¡Se han añadido ${amount} fotografías a ${tenant.name}!`)
        setCustomPhotos('')
      } else if (action === 'add_actions') {
        toast.success(`¡Se han añadido ${amount} acciones diarias a ${tenant.name}!`)
        setCustomActions('')
      } else if (action === 'reset_images') {
        toast.success(`Consumo de fotografías reseteado a 0.`)
      } else if (action === 'reset_actions') {
        toast.success(`Acciones de redacción de hoy reseteadas a 0.`)
      } else if (action === 'set_unlimited') {
        toast.success(unlimitedVal ? 'Modo Ilimitado VIP ACTIVADO' : 'Modo Ilimitado DESACTIVADO')
      }
    } catch (err: any) {
      toast.error(err.message || 'Error en la operación de IA')
    } finally {
      setLoadingAction(null)
    }
  }

  return (
    <div className="space-y-7 animate-in fade-in duration-300">
      
      {/* ── ENCABEZADO DE SECCIÓN ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-stone-100">
        <div>
          <h3 className="text-base font-serif font-bold text-stone-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#FF6B00]" />
            Control Operativo de Inteligencia Artificial
          </h3>
          <p className="text-xs text-stone-400 mt-0.5">
            Supervisa el consumo en tiempo real, inyecta cuotas adicionales o activa acceso ilimitado.
          </p>
        </div>

        {/* Badge Estado VIP */}
        <div className="flex items-center gap-2">
          {isUnlimited ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-gradient-to-r from-orange-500/15 via-[#FF6B00]/20 to-amber-500/15 text-[#FF6B00] border border-[#FF6B00]/30 shadow-xs">
              <InfinityIcon className="w-3.5 h-3.5" />
              Modo Ilimitado VIP Activo
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-stone-600 bg-stone-100 border border-stone-200">
              <ShieldCheck className="w-3.5 h-3.5 text-stone-400" />
              Límites Estándar ({tenant.plan_type?.toUpperCase() || 'FREE'})
            </span>
          )}
        </div>
      </div>

      {/* ── BENTO GRID: ESTADO DE CUOTAS ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Tarjeta 1: Bolsa de Fotografías */}
        <Card className="p-5 bg-white/95 border-stone-200/70 shadow-2xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-[#FF6B00]" />
              Bolsa de Fotos IA
            </span>
            {hasByok && (
              <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200/60">
                BYOK Propia
              </span>
            )}
          </div>

          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-serif font-black text-stone-900 tracking-tight">
                {isUnlimited || hasByok ? '∞' : imagesRemaining}
              </span>
              <span className="text-xs font-bold text-stone-400">
                {isUnlimited || hasByok ? 'Ilimitadas' : 'restantes'}
              </span>
            </div>
            
            {/* Barra de Progreso */}
            {!isUnlimited && !hasByok && (
              <div className="w-full h-2 bg-stone-100 rounded-full mt-2.5 overflow-hidden">
                <div 
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    imagesRemaining === 0 ? "bg-rose-500" : "bg-[#FF6B00]"
                  )}
                  style={{ width: `${imagesPercentage}%` }}
                />
              </div>
            )}
          </div>

          <div className="text-[10px] text-stone-400 pt-1 border-t border-stone-100 flex items-center justify-between">
            <span>Usadas: <strong className="text-stone-700">{imagesUsed}</strong> / {imagesLimit}</span>
            <span>Bonus: <strong className="text-[#FF6B00]">+{tenant.ai_bonus_images || 0}</strong></span>
          </div>
        </Card>

        {/* Tarjeta 2: Acciones Diarias de Redacción */}
        <Card className="p-5 bg-white/95 border-stone-200/70 shadow-2xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#FF6B00]" />
              Redacción Diaria
            </span>
            <span className="text-[9px] font-bold text-stone-400">
              Reset 00:00 UTC
            </span>
          </div>

          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-serif font-black text-stone-900 tracking-tight">
                {isUnlimited || isGold || hasByok ? '∞' : actionsRemaining}
              </span>
              <span className="text-xs font-bold text-stone-400">
                {isUnlimited || isGold || hasByok ? 'Ilimitadas' : 'hoy'}
              </span>
            </div>

            {/* Barra de Progreso */}
            {!isUnlimited && !isGold && !hasByok && (
              <div className="w-full h-2 bg-stone-100 rounded-full mt-2.5 overflow-hidden">
                <div 
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    actionsRemaining === 0 ? "bg-rose-500" : "bg-emerald-500"
                  )}
                  style={{ width: `${actionsPercentage}%` }}
                />
              </div>
            )}
          </div>

          <div className="text-[10px] text-stone-400 pt-1 border-t border-stone-100 flex items-center justify-between">
            <span>Usadas hoy: <strong className="text-stone-700">{actionsUsed}</strong> / {actionsLimit}</span>
            <span>Bonus: <strong className="text-emerald-600">+{tenant.ai_bonus_daily_actions || 0}</strong></span>
          </div>
        </Card>

        {/* Tarjeta 3: Interruptor Modo Ilimitado VIP */}
        <Card className={cn(
          "p-5 border transition-all duration-300 flex flex-col justify-between space-y-3 col-span-1 md:col-span-2",
          isUnlimited 
            ? "bg-gradient-to-br from-orange-50/50 via-white to-amber-50/30 border-[#FF6B00]/40 shadow-xs" 
            : "bg-white/95 border-stone-200/70"
        )}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
              <Zap className={cn("w-3.5 h-3.5", isUnlimited ? "text-[#FF6B00]" : "text-stone-400")} />
              Privilegio de Consumo
            </span>
            <span className={cn(
              "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border",
              isUnlimited 
                ? "bg-orange-100 text-[#FF6B00] border-orange-200" 
                : "bg-stone-100 text-stone-500 border-stone-200"
            )}>
              {isUnlimited ? 'SIN LÍMITES' : 'CONTROLADO'}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-stone-900 leading-tight">
                {isUnlimited ? 'Modo Ilimitado Activo' : 'Activar Modo Ilimitado VIP'}
              </h4>
              <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
                {isUnlimited 
                  ? 'Esta clínica puede generar fotografías y redactar textos sin descontar cuotas ni exigir clave propia.' 
                  : 'Otorga acceso total libre de cuotas para pruebas de soporte o clientes preferenciales.'}
              </p>
            </div>

            <Button
              type="button"
              variant={isUnlimited ? "outline" : "luxury"}
              size="sm"
              disabled={loadingAction === 'set_unlimited'}
              onClick={() => handleExecuteQuotaAction('set_unlimited', 0, !isUnlimited)}
              className={cn(
                "rounded-xl font-bold text-xs shrink-0 h-10 px-4",
                isUnlimited 
                  ? "border-rose-200 text-rose-600 hover:bg-rose-50" 
                  : "bg-[#FF6B00] hover:bg-[#EA5E00] text-white"
              )}
            >
              {loadingAction === 'set_unlimited' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isUnlimited ? (
                'Desactivar VIP'
              ) : (
                'Activar VIP'
              )}
            </Button>
          </div>

          <div className="text-[10px] text-stone-400 pt-1 border-t border-stone-100 flex items-center gap-1.5">
            <Key className="w-3 h-3 text-stone-400 shrink-0" />
            <span>Proveedor API: {tenant.has_own_key ? 'Clave Propia (BYOK)' : 'Clave Maestra ProBookia (Gemini 2.5)'}</span>
          </div>
        </Card>

      </div>

      {/* ── CONSOLA DE OPERACIONES RÁPIDAS (ACCIONES DE SUPER-ADMIN) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        
        {/* Panel A: Gestión de Fotografías */}
        <Card className="p-6 bg-white border-stone-200/80 rounded-2xl space-y-5 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-200/60 flex items-center justify-center text-[#FF6B00]">
                <ImageIcon size={16} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-stone-900">Inyectar Fotografías IA</h4>
                <p className="text-[11px] text-stone-400">Aumenta la bolsa de fotos disponibles para esta clínica</p>
              </div>
            </div>
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={loadingAction === 'reset_images'}
              onClick={() => handleExecuteQuotaAction('reset_images')}
              className="text-[11px] font-bold text-stone-600 hover:text-stone-900 h-8 rounded-lg border-stone-200 gap-1.5"
              title="Pone el contador de fotos consumidas a cero"
            >
              {loadingAction === 'reset_images' ? (
                <Loader2 size={12} className="animate-spin text-[#FF6B00]" />
              ) : (
                <RotateCcw size={12} className="text-[#FF6B00]" />
              )}
              <span>Resetear a 0</span>
            </Button>
          </div>

          {/* Botones de Inyección Rápida */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-2">
              Inyección Rápida
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[5, 15, 50].map((num) => (
                <button
                  key={num}
                  type="button"
                  disabled={loadingAction === 'add_images'}
                  onClick={() => handleExecuteQuotaAction('add_images', num)}
                  className="py-2.5 px-3 rounded-xl border border-stone-200 bg-stone-50 hover:bg-orange-50 hover:border-orange-200 text-stone-800 hover:text-[#FF6B00] font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-2xs active:scale-95 disabled:opacity-50"
                >
                  <Plus size={13} className="text-[#FF6B00]" />
                  <span>+{num} Fotos</span>
                </button>
              ))}
            </div>
          </div>

          {/* Inyección Personalizada */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-2">
              Cantidad Personalizada
            </label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="1"
                placeholder="Ej: 25"
                value={customPhotos}
                onChange={(e) => setCustomPhotos(e.target.value)}
                className="h-10 rounded-xl border-stone-200 text-xs font-mono"
              />
              <Button
                type="button"
                variant="luxury"
                size="sm"
                disabled={!customPhotos || parseInt(customPhotos) <= 0 || loadingAction === 'add_images'}
                onClick={() => handleExecuteQuotaAction('add_images', parseInt(customPhotos))}
                className="h-10 px-4 rounded-xl text-xs font-bold shrink-0 bg-[#FF6B00] hover:bg-[#EA5E00] text-white"
              >
                {loadingAction === 'add_images' ? (
                  <Loader2 size={14} className="animate-spin text-white" />
                ) : (
                  'Inyectar'
                )}
              </Button>
            </div>
          </div>
        </Card>

        {/* Panel B: Gestión de Redacción Diaria */}
        <Card className="p-6 bg-white border-stone-200/80 rounded-2xl space-y-5 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-600">
                <FileText size={16} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-stone-900">Inyectar Acciones Diarias</h4>
                <p className="text-[11px] text-stone-400">Amplía el cupo diario de textos e IA operativa para hoy</p>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={loadingAction === 'reset_actions'}
              onClick={() => handleExecuteQuotaAction('reset_actions')}
              className="text-[11px] font-bold text-stone-600 hover:text-stone-900 h-8 rounded-lg border-stone-200 gap-1.5"
              title="Pone a cero el consumo de acciones de hoy"
            >
              {loadingAction === 'reset_actions' ? (
                <Loader2 size={12} className="animate-spin text-emerald-600" />
              ) : (
                <RotateCcw size={12} className="text-emerald-600" />
              )}
              <span>Resetear a 0</span>
            </Button>
          </div>

          {/* Botones de Inyección Rápida */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-2">
              Inyección Rápida
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[25, 50, 100].map((num) => (
                <button
                  key={num}
                  type="button"
                  disabled={loadingAction === 'add_actions'}
                  onClick={() => handleExecuteQuotaAction('add_actions', num)}
                  className="py-2.5 px-3 rounded-xl border border-stone-200 bg-stone-50 hover:bg-emerald-50 hover:border-emerald-200 text-stone-800 hover:text-emerald-700 font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-2xs active:scale-95 disabled:opacity-50"
                >
                  <Plus size={13} className="text-emerald-600" />
                  <span>+{num} Acciones</span>
                </button>
              ))}
            </div>
          </div>

          {/* Inyección Personalizada */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-2">
              Cantidad Personalizada
            </label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="1"
                placeholder="Ej: 50"
                value={customActions}
                onChange={(e) => setCustomActions(e.target.value)}
                className="h-10 rounded-xl border-stone-200 text-xs font-mono"
              />
              <Button
                type="button"
                variant="luxury"
                size="sm"
                disabled={!customActions || parseInt(customActions) <= 0 || loadingAction === 'add_actions'}
                onClick={() => handleExecuteQuotaAction('add_actions', parseInt(customActions))}
                className="h-10 px-4 rounded-xl text-xs font-bold shrink-0 bg-stone-900 hover:bg-stone-800 text-white"
              >
                {loadingAction === 'add_actions' ? (
                  <Loader2 size={14} className="animate-spin text-white" />
                ) : (
                  'Inyectar'
                )}
              </Button>
            </div>
          </div>
        </Card>

      </div>

    </div>
  )
}

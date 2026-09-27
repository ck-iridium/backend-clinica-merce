"use client"

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { 
  Power, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  DollarSign, 
  Globe,
  Building2,
  ExternalLink,
  ShieldCheck,
  Calendar,
  CreditCard
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

// Subcomponentes modulares
import TenantOverviewTab from './detail/TenantOverviewTab'
import TenantStripeTab from './detail/TenantStripeTab'
import TenantConfigTab from './detail/TenantConfigTab'
import DomainConnectionModal from './detail/DomainConnectionModal'
import DeleteConfirmModal from './detail/DeleteConfirmModal'

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
}

interface TenantDetailProps {
  tenant: Tenant
  onUpdateStatus: (tenantId: string, status: 'active' | 'suspended') => Promise<void>
  onUpdateTenant?: (updatedTenant: Tenant) => void
  onDeleteTenant?: (tenantId: string) => void
}

export default function TenantDetail({ tenant, onUpdateStatus, onUpdateTenant, onDeleteTenant }: TenantDetailProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'stripe' | 'config'>('overview')
  const [redirectingPlan, setRedirectingPlan] = useState<string | null>(null)
  const [impersonating, setImpersonating] = useState(false)
  const [customDomain, setCustomDomain] = useState<string | null>(tenant.custom_domain || null)
  const [showDomainModal, setShowDomainModal] = useState(false)
  const [inputDomain, setInputDomain] = useState('')
  const [savingDomain, setSavingDomain] = useState(false)

  // Estados para el borrado en cascada seguro
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)

  // Sincronizar el estado del dominio personalizado
  useEffect(() => {
    setCustomDomain(tenant.custom_domain || null)
    setInputDomain('')
    setConfirmText('')
    setShowDeleteModal(false)
  }, [tenant.id, tenant.custom_domain])

  const getJwtToken = (): string => {
    let jwtToken = ''
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.includes('-auth-token')) {
        const val = localStorage.getItem(key)
        if (val) {
          try {
            const parsed = JSON.parse(val)
            jwtToken = parsed.access_token || ''
          } catch {}
        }
      }
    }

    if (!jwtToken) {
      const match = document.cookie.match(/sb-[a-zA-Z0-9]+-auth-token/)
      if (match) {
        const val = localStorage.getItem(match[0])
        if (val) {
          try {
            jwtToken = JSON.parse(val).access_token || ''
          } catch {}
        }
      }
    }
    return jwtToken
  }

  const handleConnectDomain = async () => {
    if (!inputDomain.trim()) {
      toast.error('Por favor escribe un dominio válido.')
      return
    }

    setSavingDomain(true)
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    const jwtToken = getJwtToken()
    const loadingToast = toast.loading('Guardando configuración de DNS...')

    try {
      const res = await fetch(`${API_URL}/super-admin/tenants/${tenant.id}/domain`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ custom_domain: inputDomain.trim() })
      })

      if (!res.ok) {
        let errMsg = 'Error al conectar el dominio'
        try {
          const errorData = await res.json()
          errMsg = errorData.detail || errMsg
        } catch {}
        throw new Error(errMsg)
      }

      const updatedTenant = await res.json()
      setCustomDomain(updatedTenant.custom_domain)
      if (onUpdateTenant) {
        onUpdateTenant(updatedTenant)
      }
      toast.success('¡Dominio personalizado conectado con éxito!', { id: loadingToast })
      setShowDomainModal(false)
      setInputDomain('')
    } catch (err: any) {
      toast.error(err.message || 'Error al conectar el dominio', { id: loadingToast })
    } finally {
      setSavingDomain(false)
    }
  }

  const handleDisconnectDomain = async () => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    const jwtToken = getJwtToken()
    const loadingToast = toast.loading('Desvinculando dominio personalizado...')

    try {
      const res = await fetch(`${API_URL}/super-admin/tenants/${tenant.id}/domain`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ custom_domain: null })
      })

      if (!res.ok) {
        let errMsg = 'Error al desconectar el dominio'
        try {
          const errorData = await res.json()
          errMsg = errorData.detail || errMsg
        } catch {}
        throw new Error(errMsg)
      }

      const updatedTenant = await res.json()
      setCustomDomain(null)
      if (onUpdateTenant) {
        onUpdateTenant(updatedTenant)
      }
      toast.success('Dominio personalizado desvinculado con éxito', { id: loadingToast })
    } catch (err: any) {
      toast.error(err.message || 'Error al desvincular el dominio', { id: loadingToast })
    }
  }

  const handleImpersonate = async () => {
    setImpersonating(true)
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const jwtToken = getJwtToken()

      const res = await fetch(`${API_URL}/super-admin/impersonate/${tenant.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (!res.ok) {
        throw new Error('No se pudo generar el token de impersonación.')
      }

      const data = await res.json()
      if (data.success && data.token) {
        document.cookie = `is_impersonating=true; path=/; max-age=7200; sameSite=lax`
        document.cookie = `impersonate_tenant_id=${data.tenant_id}; path=/; max-age=7200; sameSite=lax`
        document.cookie = `impersonate_tenant_slug=${data.slug}; path=/; max-age=7200; sameSite=lax`
        document.cookie = `impersonate_tenant_name=${encodeURIComponent(data.name)}; path=/; max-age=7200; sameSite=lax`
        document.cookie = `tenant_id=${data.tenant_id}; path=/; max-age=7200; sameSite=lax`
        document.cookie = `tenant_slug=${data.slug}; path=/; max-age=7200; sameSite=lax`

        toast.success(`Iniciando Modo Soporte: ${data.name}...`)
        window.location.href = `/dashboard`
      }
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Error al entrar como soporte.')
    } finally {
      setImpersonating(false)
    }
  }

  const handleDeleteTenant = async () => {
    if (confirmText !== tenant.slug) {
      toast.error('El subdominio ingresado no coincide.')
      return
    }

    setDeleting(true)
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    const jwtToken = getJwtToken()
    const loadingToast = toast.loading('Eliminando inquilino y dependencias en cascada...')

    try {
      const res = await fetch(`${API_URL}/super-admin/tenants/${tenant.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (!res.ok) {
        let errMsg = 'Error al eliminar el inquilino'
        try {
          const errorData = await res.json()
          errMsg = errorData.detail || errMsg
        } catch {}
        throw new Error(errMsg)
      }

      toast.success('Inquilino y todos sus datos eliminados correctamente.', { id: loadingToast })
      setShowDeleteModal(false)
      setConfirmText('')
      if (onDeleteTenant) {
        onDeleteTenant(tenant.id)
      }
    } catch (err: any) {
      toast.error(err.message || 'Error al eliminar el inquilino', { id: loadingToast })
    } finally {
      setDeleting(false)
    }
  }

  const handleUpdateSector = async (sector: string) => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    const jwtToken = getJwtToken()
    const loadingToast = toast.loading('Actualizando sector del negocio...')

    try {
      const res = await fetch(`${API_URL}/super-admin/tenants/${tenant.id}/sector`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ business_sector: sector })
      })

      if (!res.ok) {
        throw new Error('Error al actualizar el sector')
      }

      const updatedTenant = await res.json()
      if (onUpdateTenant) {
        onUpdateTenant(updatedTenant)
      }
      toast.success('¡Sector del negocio actualizado con éxito!', { id: loadingToast })
    } catch (err: any) {
      toast.error(err.message || 'Error al actualizar el sector', { id: loadingToast })
    }
  }

  const handleSubscribe = async (plan: string) => {
    setRedirectingPlan(plan)
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    try {
      const response = await fetch(`${API_URL}/stripe/create-subscription-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tenant_id: tenant.id,
          plan_type: plan
        })
      })

      if (!response.ok) {
        throw new Error('Error al generar la sesión de pago de Stripe')
      }

      const data = await response.json()
      if (data.url) {
        toast.success(`Redirigiendo a la pasarela de pago para el plan ${plan.toUpperCase()}...`)
        window.location.href = data.url
      } else {
        throw new Error('No se recibió la URL de redirección')
      }
    } catch (error: any) {
      console.error(error)
      toast.error(error.message || 'Error al iniciar la pasarela de pago.')
    } finally {
      setRedirectingPlan(null)
    }
  }

  return (
    <section className="flex-1 bg-[#FAF9F6] p-6 lg:p-8 overflow-y-auto space-y-6">
      <div className="max-w-6xl space-y-6 animate-in fade-in duration-300">
        
        {/* 1. FICHA SUPERIOR (Encabezado + Acciones Principales) */}
        <Card className="p-6 sm:p-7 border-stone-200/70 bg-white/90 backdrop-blur-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-stone-900 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] shadow-md shadow-[#D4AF37]/10 shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold font-serif text-stone-900 leading-snug">
                  {tenant.name}
                </h2>
                <a 
                  href={`http://${tenant.slug}.localhost:3000`} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-stone-400 hover:text-stone-700 transition-colors"
                  title="Abrir portal público"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
              <p className="text-xs font-mono font-medium text-stone-400 mt-0.5">
                {tenant.slug}.probookia.com
              </p>
            </div>
          </div>

          {/* Botones de Acción con Primitivas shadcn */}
          <div className="flex items-center gap-2.5 w-full md:w-auto">
            <Button
              variant="luxury"
              onClick={handleImpersonate}
              disabled={impersonating}
              className="flex-1 md:flex-none text-xs gap-1.5"
            >
              <Building2 className="w-3.5 h-3.5" />
              {impersonating ? 'Iniciando sesión...' : 'Entrar como Soporte'}
            </Button>

            {tenant.subscription_status === 'active' ? (
              <Button
                variant="destructive"
                onClick={() => onUpdateStatus(tenant.id, 'suspended')}
                className="flex-1 md:flex-none text-xs gap-1.5"
              >
                <Power className="w-3.5 h-3.5" />
                Suspender Acceso
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => onUpdateStatus(tenant.id, 'active')}
                className="flex-1 md:flex-none text-xs gap-1.5 border-[#D4AF37] text-stone-900 hover:bg-[#FAF8F2]"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                Reactivar Acceso
              </Button>
            )}
          </div>
        </Card>

        {/* 2. GRID BENTO DE KPI CARDS (shadcn Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Tarjeta 1: Estado de Suscripción */}
          <Card className="p-5 border-stone-200/70 bg-white/90 flex flex-col justify-between h-32 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">Suscripción SaaS</span>
              <ShieldCheck className="w-4 h-4 text-stone-400" />
            </div>
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-2.5 h-2.5 rounded-full",
                tenant.subscription_status === 'active' 
                  ? "bg-[#D4AF37] animate-pulse" 
                  : tenant.subscription_status === 'grace'
                  ? "bg-blue-500 animate-pulse"
                  : "bg-rose-500"
              )} />
              <span className="text-lg font-serif font-bold text-stone-900 capitalize">
                {tenant.subscription_status === 'active' 
                  ? 'Activo' 
                  : tenant.subscription_status === 'grace'
                  ? 'Periodo de Gracia'
                  : 'Suspendido'}
              </span>
            </div>
            <span className="text-[11px] text-stone-400 font-medium">Control de acceso en tiempo real</span>
          </Card>

          {/* Tarjeta 2: ID de Cliente Stripe */}
          <Card className="p-5 border-stone-200/70 bg-white/90 flex flex-col justify-between h-32 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">Stripe Billing</span>
              <CreditCard className="w-4 h-4 text-stone-400" />
            </div>
            <span className="text-xs font-mono font-medium text-stone-700 truncate">
              {tenant.stripe_customer_id || 'Sin vincular en Stripe'}
            </span>
            <span className="text-[11px] text-stone-400 font-medium">Pasarela recurrente oficial</span>
          </Card>

          {/* Tarjeta 3: Fecha de Registro */}
          <Card className="p-5 border-stone-200/70 bg-white/90 flex flex-col justify-between h-32 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">Alta de Clínica</span>
              <Calendar className="w-4 h-4 text-stone-400" />
            </div>
            <span className="text-sm font-semibold text-stone-900">
              {tenant.created_at ? new Date(tenant.created_at).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              }) : 'Semilla de Sistema'}
            </span>
            <span className="text-[11px] text-stone-400 font-medium">Fecha oficial de creación</span>
          </Card>
        </div>

        {/* 3. ALERTA DE SUSPENSIÓN */}
        {tenant.subscription_status !== 'active' && tenant.subscription_status !== 'grace' && (
          <div className="bg-rose-50/90 border border-rose-200/80 rounded-2xl p-4 flex items-start gap-3.5 shadow-sm">
            <AlertTriangle className="w-5 h-5 text-rose-600 mt-0.5 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wider">Clínica Suspendida</h4>
              <p className="text-xs text-rose-700 mt-0.5 leading-relaxed">
                El acceso a esta clínica y a su panel de gestión está restringido. Los clientes verán la pantalla de pausa de ProBookia.
              </p>
            </div>
          </div>
        )}

        {/* 3.B ALERTA DE PERIODO DE GRACIA */}
        {tenant.subscription_status === 'grace' && (
          <div className="bg-blue-50/90 border border-blue-200/80 rounded-2xl p-4 flex items-start gap-3.5 shadow-sm">
            <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider">Periodo de Gracia Activo</h4>
              <p className="text-xs text-blue-700 mt-0.5 leading-relaxed">
                Esta clínica cuenta con un acceso de cortesía temporal. Los administradores pueden operar normalmente hasta el vencimiento.
              </p>
            </div>
          </div>
        )}

        {/* 4. SECCIÓN DE PESTAÑAS (Tabs con Card) */}
        <Card className="overflow-hidden border-stone-200/70 bg-white/95">
          {/* Pestañas horizontales */}
          <div className="flex border-b border-stone-100 bg-stone-50/60 p-1.5 gap-1.5">
            {[
              { id: 'overview', label: 'Resumen', icon: Layers },
              { id: 'stripe', label: 'Pasarela Stripe', icon: DollarSign },
              { id: 'config', label: 'Configuración DNS', icon: Globe }
            ].map(tab => {
              const IconComp = tab.icon
              const isActive = activeTab === tab.id
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "px-5 py-2.5 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all duration-200 focus:outline-none",
                    isActive 
                      ? "bg-white text-stone-900 shadow-sm border border-stone-200/60 font-bold" 
                      : "text-stone-500 hover:text-stone-900 hover:bg-white/50"
                  )}
                >
                  <IconComp className={cn("w-3.5 h-3.5", isActive ? "text-[#D4AF37]" : "text-stone-400")} />
                  {tab.label}
                </button>
              )
            })}
          </div>

          {/* Contenido de la pestaña activa */}
          <div className="p-6 sm:p-7 space-y-6">
            {activeTab === 'overview' && (
              <TenantOverviewTab tenant={tenant} />
            )}

            {activeTab === 'stripe' && (
              <TenantStripeTab 
                tenant={tenant}
                onSubscribe={handleSubscribe}
                redirectingPlan={redirectingPlan}
              />
            )}

            {activeTab === 'config' && (
              <TenantConfigTab 
                tenant={tenant}
                customDomain={customDomain}
                onDisconnectDomain={handleDisconnectDomain}
                onOpenDomainModal={() => setShowDomainModal(true)}
                onOpenDeleteModal={() => setShowDeleteModal(true)}
                onUpdateSector={handleUpdateSector}
              />
            )}
          </div>
        </Card>

        {/* Modal de Configuración DNS para Dominio Personalizado */}
        <DomainConnectionModal 
          open={showDomainModal}
          onOpenChange={setShowDomainModal}
          inputDomain={inputDomain}
          onChangeInputDomain={setInputDomain}
          onConnect={handleConnectDomain}
          saving={savingDomain}
        />

        {/* Modal de Confirmación de Borrado en Cascada */}
        <DeleteConfirmModal 
          open={showDeleteModal}
          onOpenChange={setShowDeleteModal}
          tenantSlug={tenant.slug}
          tenantName={tenant.name}
          confirmText={confirmText}
          onChangeConfirmText={setConfirmText}
          onDelete={handleDeleteTenant}
          deleting={deleting}
        />

      </div>
    </section>
  )
}

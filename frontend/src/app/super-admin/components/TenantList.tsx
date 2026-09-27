"use client"

import { Search, Building2, CheckCircle2, AlertCircle, Clock } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
}

interface TenantListProps {
  tenants: Tenant[]
  selectedTenant: Tenant | null
  onSelectTenant: (tenant: Tenant) => void
  searchQuery: string
  setSearchQuery: (query: string) => void
  statusFilter: string
  setStatusFilter: (filter: string) => void
  loadingData: boolean
}

export default function TenantList({
  tenants,
  selectedTenant,
  onSelectTenant,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  loadingData
}: TenantListProps) {

  const getTenantHealthScore = (slug: string) => {
    if (slug === 'merce') return 96
    let sum = 0
    for (let i = 0; i < slug.length; i++) sum += slug.charCodeAt(i)
    return 65 + (sum % 30)
  }

  const filteredTenants = tenants.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.slug.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || t.subscription_status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <section className="w-full lg:w-[380px] bg-white/80 backdrop-blur-xl border-r border-stone-200/60 flex flex-col flex-shrink-0 select-none">
      {/* Buscador y Filtro con shadcn Select */}
      <div className="p-5 border-b border-stone-100/80 space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500 font-sans">
              Clínicas
            </span>
            <span className="bg-stone-100 text-stone-700 px-2 py-0.5 rounded-full text-[10px] font-bold">
              {filteredTenants.length}
            </span>
          </div>
          
          <div className="w-40">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-8 text-xs bg-stone-50 border-stone-200/80 py-0">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent className="bg-white border-stone-200 shadow-xl rounded-xl">
                <SelectItem value="all" className="text-xs">Todos los estados</SelectItem>
                <SelectItem value="active" className="text-xs">Activos</SelectItem>
                <SelectItem value="grace" className="text-xs">Periodo de Gracia</SelectItem>
                <SelectItem value="suspended" className="text-xs">Suspendidos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Barra de Búsqueda */}
        <div className="relative">
          <Input 
            type="text" 
            placeholder="Buscar clínica o subdominio..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs bg-stone-50 border-stone-200/70"
          />
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Lista de Tarjetas Estilo Stripe / Linear */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-[#FAF9F6]/40 hide-scroll">
        {loadingData ? (
          <div className="space-y-2">
            {[1, 2, 3].map(n => (
              <div key={n} className="bg-white p-4 rounded-xl border border-stone-200/40 h-20 animate-pulse" />
            ))}
          </div>
        ) : filteredTenants.length === 0 ? (
          <div className="text-center py-16 text-stone-400 text-xs font-medium">
            Ninguna clínica coincide con los filtros.
          </div>
        ) : (
          filteredTenants.map((tenant) => {
            const health = getTenantHealthScore(tenant.slug)
            const isSelected = selectedTenant?.id === tenant.id
            
            return (
              <div 
                key={tenant.id}
                onClick={() => onSelectTenant(tenant)}
                className={cn(
                  "p-3.5 rounded-xl border transition-all duration-200 cursor-pointer flex justify-between items-center relative overflow-hidden group",
                  isSelected 
                    ? "bg-white border-[#D4AF37] shadow-[0_4px_16px_-4px_rgba(212,175,55,0.18)] ring-1 ring-[#D4AF37]/30" 
                    : "bg-white/80 border-stone-200/60 hover:border-stone-300 hover:bg-white hover:shadow-xs"
                )}
              >
                {/* Acento lateral */}
                {isSelected && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#D4AF37]" />
                )}

                <div className="space-y-1 max-w-[70%]">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-mono text-stone-400">
                      {tenant.slug}
                    </span>
                    <span className={cn(
                      "text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full inline-flex items-center gap-1 border",
                      tenant.subscription_status === 'active'
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200/60"
                        : tenant.subscription_status === 'grace'
                        ? "bg-blue-50 text-blue-700 border-blue-200/60"
                        : "bg-stone-100 text-stone-500 border-stone-200"
                    )}>
                      <span className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        tenant.subscription_status === 'active' ? "bg-emerald-500" :
                        tenant.subscription_status === 'grace' ? "bg-blue-500" : "bg-stone-400"
                      )} />
                      {tenant.subscription_status === 'active' 
                        ? 'Activo' 
                        : tenant.subscription_status === 'grace'
                        ? 'Gracia'
                        : 'Pausa'}
                    </span>
                  </div>
                  <h3 className={cn(
                    "text-xs font-bold text-stone-900 group-hover:text-[#B38F26] transition-colors truncate",
                    isSelected && "text-[#B38F26]"
                  )}>
                    {tenant.name}
                  </h3>
                </div>

                {/* Score de Salud Compacto y Elegante */}
                <div className="flex flex-col items-end gap-0.5 shrink-0">
                  <span className={cn(
                    "text-xs font-bold font-mono px-2 py-0.5 rounded-md border",
                    health >= 85 ? "bg-emerald-50/80 text-emerald-700 border-emerald-200/50" :
                    health >= 70 ? "bg-amber-50/80 text-amber-700 border-amber-200/50" :
                    "bg-stone-100 text-stone-600 border-stone-200"
                  )}>
                    {health}%
                  </span>
                  <span className="text-[8px] uppercase tracking-wider text-stone-400 font-semibold">
                    Salud
                  </span>
                </div>
              </div>
            )
          })
        )}
      </div>
    </section>
  )
}

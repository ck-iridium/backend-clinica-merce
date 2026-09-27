"use client"

import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
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

  // Mock de puntuación de salud/actividad para el Bento Grid
  const getTenantHealthScore = (slug: string) => {
    if (slug === 'merce') return 94
    let sum = 0
    for (let i = 0; i < slug.length; i++) sum += slug.charCodeAt(i)
    return 60 + (sum % 35)
  }

  // Filtrar inquilinos
  const filteredTenants = tenants.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.slug.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || t.subscription_status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <section className="w-full lg:w-[420px] bg-white/70 backdrop-blur-xl border-r border-stone-200/60 flex flex-col flex-shrink-0 select-none">
      {/* Buscador y Filtros */}
      <div className="p-6 border-b border-stone-100/80 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold font-serif text-stone-900">Clínicas Registradas</span>
            <span className="bg-stone-100 text-stone-600 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
              {filteredTenants.length}
            </span>
          </div>
          
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-semibold text-stone-500 hover:text-stone-900 bg-stone-50 border border-stone-200/60 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#D4AF37] cursor-pointer transition-colors"
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="grace">Periodo de Gracia</option>
            <option value="suspended">Suspendidos</option>
          </select>
        </div>

        {/* Barra de Búsqueda con Primitiva shadcn */}
        <div className="relative">
          <Input 
            type="text" 
            placeholder="Buscar clínica o subdominio..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 text-xs bg-stone-50/70 border-stone-200/80"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Lista de Tarjetas */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5 bg-stone-50/30 hide-scroll">
        {loadingData ? (
          <div className="space-y-3">
            {[1, 2, 3].map(n => (
              <div key={n} className="bg-white p-5 rounded-2xl border border-stone-200/40 h-24 animate-pulse" />
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
                  "p-4 sm:p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex justify-between items-center relative overflow-hidden group",
                  isSelected 
                    ? "bg-white border-[#D4AF37]/80 shadow-[0_4px_20px_-4px_rgba(212,175,55,0.15)] ring-1 ring-[#D4AF37]/30" 
                    : "bg-white/90 border-stone-200/60 hover:border-stone-300 hover:shadow-sm"
                )}
              >
                {/* Línea de acento dorada sutil */}
                {isSelected && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#D4AF37]" />
                )}

                <div className="space-y-1.5 max-w-[68%]">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-mono font-medium text-stone-400">
                      {tenant.slug}.probookia.com
                    </span>
                    <span className={cn(
                      "text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border",
                      tenant.subscription_status === 'active'
                        ? "bg-amber-50/80 text-amber-700 border-amber-200/60"
                        : tenant.subscription_status === 'grace'
                        ? "bg-blue-50/80 text-blue-700 border-blue-200/60"
                        : "bg-stone-100 text-stone-500 border-stone-200"
                    )}>
                      {tenant.subscription_status === 'active' 
                        ? 'Activo' 
                        : tenant.subscription_status === 'grace'
                        ? 'Gracia'
                        : 'Suspendido'}
                    </span>
                  </div>
                  <h3 className={cn(
                    "text-sm font-bold font-serif text-stone-900 group-hover:text-[#B38F26] transition-colors leading-snug truncate",
                    isSelected && "text-[#B38F26]"
                  )}>
                    {tenant.name}
                  </h3>
                </div>

                {/* Indicador de Salud / Score */}
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <div className="relative w-10 h-10 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-stone-100"
                        strokeWidth="2.5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className={
                          tenant.subscription_status === 'active' 
                            ? "text-[#D4AF37]" 
                            : tenant.subscription_status === 'grace'
                            ? "text-blue-500"
                            : "text-stone-300"
                        }
                        strokeWidth="2.5"
                        strokeDasharray={`${health}, 100`}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <span className="absolute text-[10px] font-bold text-stone-800">
                      {health}
                    </span>
                  </div>
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

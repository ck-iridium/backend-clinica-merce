"use client"

import { Search } from 'lucide-react';

interface Tenant {
  id: string;
  name: string;
  slug: string;
  stripe_customer_id: string | null;
  subscription_status: string;
  created_at: string | null;
}

interface TenantListProps {
  tenants: Tenant[];
  selectedTenant: Tenant | null;
  onSelectTenant: (tenant: Tenant) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: string;
  setStatusFilter: (filter: string) => void;
  loadingData: boolean;
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
    if (slug === 'merce') return 94;
    let sum = 0;
    for (let i = 0; i < slug.length; i++) sum += slug.charCodeAt(i);
    return 60 + (sum % 35);
  };

  // Filtrar inquilinos
  const filteredTenants = tenants.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.slug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.subscription_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <section className="w-full lg:w-[420px] bg-white border-r border-stone-200/50 flex flex-col flex-shrink-0">
      {/* Buscador y Filtros */}
      <div className="p-6 border-b border-stone-100 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-extrabold font-serif text-stone-900">Clínicas</span>
            <span className="bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full text-xxs font-black font-sans">
              {filteredTenants.length}
            </span>
          </div>
          
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-bold text-stone-500 hover:text-stone-900 bg-transparent focus:outline-none cursor-pointer"
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="suspended">Suspendidos</option>
          </select>
        </div>

        {/* Barra de Búsqueda */}
        <div className="relative">
          <input 
            type="text" 
            placeholder="Buscar clínica o subdominio..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-100 bg-[#FAFAFA] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d4af37]/20 focus:border-[#d4af37] transition-all text-xs font-medium font-sans"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Lista Bento de Tarjetas */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FAFAFA]/50 hide-scroll">
        {loadingData ? (
          <div className="space-y-3">
            {[1, 2, 3].map(n => (
              <div key={n} className="bg-white p-5 rounded-2xl border border-stone-200/20 h-28 animate-pulse"></div>
            ))}
          </div>
        ) : filteredTenants.length === 0 ? (
          <div className="text-center py-16 text-stone-400 font-sans text-xs font-semibold">
            Ninguna clínica coincide.
          </div>
        ) : (
          filteredTenants.map((tenant) => {
            const health = getTenantHealthScore(tenant.slug);
            const isSelected = selectedTenant?.id === tenant.id;
            
            return (
              <div 
                key={tenant.id}
                onClick={() => onSelectTenant(tenant)}
                className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer flex justify-between items-center relative overflow-hidden group ${
                  isSelected 
                    ? 'bg-white border-[#d4af37] shadow-luxury' 
                    : 'bg-white border-stone-200/30 hover:border-stone-300 hover:shadow-sm'
                }`}
              >
                {/* Línea de acento dorada sutil */}
                {isSelected && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#d4af37]"></div>
                )}

                <div className="space-y-2 max-w-[70%]">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-stone-400 font-sans">
                      {tenant.slug}
                    </span>
                    <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full ${
                      tenant.subscription_status === 'active'
                        ? 'bg-amber-50 text-[#d4af37]'
                        : 'bg-stone-100 text-stone-500'
                    }`}>
                      {tenant.subscription_status === 'active' ? 'Activo' : 'Suspendido'}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold font-serif text-stone-900 group-hover:text-[#d4af37] transition-colors leading-tight">
                    {tenant.name}
                  </h3>
                </div>

                {/* Indicador de Actividad / Salud (Circular Progress en SVG) */}
                <div className="flex flex-col items-center gap-1">
                  <div className="relative w-11 h-11 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-stone-100"
                        strokeWidth="2.5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className={tenant.subscription_status === 'active' ? "text-[#d4af37]" : "text-stone-400"}
                        strokeWidth="2.5"
                        strokeDasharray={`${health}, 100`}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <span className="absolute text-[10px] font-bold font-sans text-stone-800">
                      {health}
                    </span>
                  </div>
                  <span className="text-[8px] uppercase tracking-widest text-stone-400 font-bold font-sans">
                    Actividad
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

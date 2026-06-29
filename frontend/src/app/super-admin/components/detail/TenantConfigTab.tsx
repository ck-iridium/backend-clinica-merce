"use client"

import React from 'react';
import { Globe, Shield, AlertTriangle, Building } from 'lucide-react';

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
  business_sector?: string | null;
}

interface TenantConfigTabProps {
  tenant: Tenant;
  customDomain: string | null;
  onDisconnectDomain: () => Promise<void>;
  onOpenDomainModal: () => void;
  onOpenDeleteModal: () => void;
  onUpdateSector: (sector: string) => Promise<void>;
}

export default function TenantConfigTab({
  tenant,
  customDomain,
  onDisconnectDomain,
  onOpenDomainModal,
  onOpenDeleteModal,
  onUpdateSector
}: TenantConfigTabProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <h3 className="text-lg font-bold font-serif text-stone-900 border-b border-stone-100 pb-2">
        Estructura de Ruteo e Infraestructura
      </h3>
      <div className="space-y-4">
        {/* Tarjeta de Dominios Personalizados Condicional */}
        <div className="bg-[#FAFAFA] p-5 rounded-2xl border border-stone-200/30 flex flex-col sm:flex-row justify-between sm:items-center gap-4 transition-all duration-300">
          <div className="flex items-start gap-4">
            <span className="w-12 h-12 rounded-xl bg-white border border-stone-100 text-stone-400 flex items-center justify-center shrink-0 shadow-sm">
              <Globe className="w-6 h-6" />
            </span>
            <div className="space-y-1">
              <p className="font-bold text-stone-900 text-sm">Dominios Personalizados</p>
              {customDomain ? (
                <div className="space-y-0.5">
                  <p className="text-stone-400 text-xs">Mapeo DNS activo para el dominio:</p>
                  <p className="text-base font-serif font-bold text-[#d4af37]">{customDomain}</p>
                </div>
              ) : (
                <div className="space-y-0.5">
                  <p className="text-stone-400 text-xs">Usando subdominio de la plataforma:</p>
                  <p className="text-stone-700 font-mono text-xs">{tenant.slug}.probookia.com</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
            {customDomain ? (
              <>
                <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-3 py-1 rounded-full text-xxs font-black uppercase tracking-wider">
                  🟢 Activo
                </span>
                <button 
                  onClick={onDisconnectDomain}
                  className="text-stone-400 hover:text-red-500 text-[10px] font-bold uppercase tracking-wider transition-colors"
                >
                  Desconectar
                </button>
              </>
            ) : (
              <>
                <span className="bg-stone-100 text-stone-500 border border-stone-200 px-3 py-1 rounded-full text-xxs font-bold uppercase tracking-wider">
                  Sin dominio personalizado
                </span>
                <button 
                  onClick={onOpenDomainModal}
                  className="bg-stone-900 hover:bg-[#d4af37] text-white px-4 py-2 rounded-xl text-xxs font-black uppercase tracking-wider transition-all duration-300 shadow-sm active:scale-95"
                >
                  Conectar Dominio
                </button>
              </>
            )}
          </div>
        </div>

        {/* Selector de Sector del Negocio */}
        <div className="bg-[#FAFAFA] p-5 rounded-2xl border border-stone-200/30 flex flex-col sm:flex-row justify-between sm:items-center gap-4 transition-all duration-300">
          <div className="flex items-start gap-4">
            <span className="w-12 h-12 rounded-xl bg-white border border-stone-100 text-stone-400 flex items-center justify-center shrink-0 shadow-sm">
              <Building className="w-6 h-6 text-[#d4af37]" />
            </span>
            <div className="space-y-1">
              <p className="font-bold text-stone-900 text-sm">Sector del Negocio (Inquilino)</p>
              <p className="text-stone-400 text-xs font-medium">Define la interfaz y los campos dinámicos visibles en la ficha de clientes.</p>
            </div>
          </div>
          
          <div className="w-full sm:w-64 shrink-0">
            <select
              value={tenant.business_sector || 'general'}
              onChange={(e) => onUpdateSector(e.target.value)}
              className="w-full bg-white border border-stone-200 rounded-xl px-4 py-2.5 text-xs font-bold text-stone-850 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/10 focus:border-[#d4af37] transition-all shadow-sm cursor-pointer"
            >
              <option value="clinical">🏥 Medicina / Clínica de Salud</option>
               <option value="beauty">✨ Estética y Bienestar</option>
              <option value="barber">💈 Salones y Barberías</option>
              <option value="veterinary">🐾 Veterinaria</option>
              <option value="automotive">🚗 Automoción y Mecánica</option>
              <option value="home_services">🧹 Servicios a Domicilio</option>
              <option value="professional">💼 Profesional / Asesoría</option>
              <option value="general">📦 General / Otros</option>
            </select>
          </div>
        </div>

        <div className="flex justify-between items-center bg-[#FAFAFA] p-4 rounded-xl text-sm border border-stone-200/30">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-stone-400" />
            <div>
              <p className="font-bold text-stone-900">Políticas RLS en Base de Datos</p>
              <p className="text-xs text-stone-400">Aislamiento por Row Level Security (RLS) habilitado</p>
            </div>
          </div>
          <span className="bg-green-50 text-green-600 border border-green-100 px-3 py-1 rounded-full text-xxs font-black uppercase">
            Protegido
          </span>
        </div>

        {/* Zona de Peligro - Hard Delete */}
        <div className="bg-red-50/10 p-5 rounded-2xl border border-red-200/40 flex flex-col sm:flex-row justify-between sm:items-center gap-4 transition-all duration-300 mt-6">
          <div className="flex items-start gap-4">
            <span className="w-12 h-12 rounded-xl bg-white border border-red-100 text-red-500 flex items-center justify-center shrink-0 shadow-sm">
              <AlertTriangle className="w-6 h-6" />
            </span>
            <div className="space-y-1">
              <p className="font-bold text-red-900 text-sm">Zona de Peligro: Borrado en Cascada</p>
              <p className="text-stone-500 text-xs leading-relaxed max-w-xl">
                Esta acción es irreversible. Eliminará de forma definitiva toda la base de datos de la clínica (citas, facturas, clientes, servicios) y todos sus archivos multimedia del storage.
              </p>
            </div>
          </div>
          
          <div className="shrink-0 self-end sm:self-center">
            <button 
              onClick={onOpenDeleteModal}
              className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl text-xxs font-black uppercase tracking-wider transition-all duration-300 shadow-sm active:scale-95 border border-red-600 focus:outline-none"
            >
              Eliminar Clínica
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

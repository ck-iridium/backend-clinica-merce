"use client"

import React from 'react'
import { 
  Globe, 
  ShieldCheck, 
  AlertTriangle, 
  Building2, 
  ExternalLink,
  Trash2,
  Stethoscope,
  Sparkles,
  Scissors,
  Briefcase,
  Layers,
  ChevronDown
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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

interface TenantConfigTabProps {
  tenant: Tenant
  customDomain: string | null
  onDisconnectDomain: () => Promise<void>
  onOpenDomainModal: () => void
  onOpenDeleteModal: () => void
  onUpdateSector: (sector: string) => Promise<void>
}

export default function TenantConfigTab({
  tenant,
  customDomain,
  onDisconnectDomain,
  onOpenDomainModal,
  onOpenDeleteModal,
  onUpdateSector
}: TenantConfigTabProps) {
  const sectors = [
    { value: 'clinical', label: 'Medicina y Clínica de Salud' },
    { value: 'beauty', label: 'Estética, Belleza y Wellness' },
    { value: 'barber', label: 'Barbería y Salón de Peluquería' },
    { value: 'veterinary', label: 'Veterinaria y Cuidados' },
    { value: 'automotive', label: 'Automoción y Mecánica' },
    { value: 'home_services', label: 'Servicios a Domicilio' },
    { value: 'professional', label: 'Consultoría y Asesoría' },
    { value: 'general', label: 'General / Otros Servicios' },
  ]

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h3 className="text-base font-serif font-bold text-stone-900 tracking-tight">
          Enrutamiento y Configuración de Infraestructura
        </h3>
        <p className="text-xs text-stone-400 mt-0.5">
          Parámetros de dominio personalizado, sector de actividad y protección de datos
        </p>
      </div>

      <div className="space-y-4">
        {/* Dominio Personalizado */}
        <Card className="p-5 border-stone-200/70 bg-white/90 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-700 shrink-0 border border-stone-200/60">
              <Globe className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                Dominio Comercial Personalizado
              </h4>
              {customDomain ? (
                <div className="space-y-0.5">
                  <span className="text-[11px] text-stone-400">Mapeo DNS activo en CNAME:</span>
                  <p className="text-sm font-semibold font-mono text-[#B38F26]">{customDomain}</p>
                </div>
              ) : (
                <p className="text-xs text-stone-500 font-mono">
                  {tenant.slug}.probookia.com
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
            {customDomain ? (
              <>
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                  Conectado
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDisconnectDomain}
                  className="text-stone-400 hover:text-rose-600 text-xs"
                >
                  Desconectar
                </Button>
              </>
            ) : (
              <>
                <span className="bg-stone-100 text-stone-500 border border-stone-200 px-2.5 py-0.5 rounded-full text-[10px] font-medium">
                  Subdominio Estándar
                </span>
                <Button
                  variant="luxury"
                  size="sm"
                  onClick={onOpenDomainModal}
                  className="text-xs"
                >
                  Conectar Dominio
                </Button>
              </>
            )}
          </div>
        </Card>

        {/* Selector de Sector de Actividad (con shadcn Select) */}
        <Card className="p-5 border-stone-200/70 bg-white/90 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-700 shrink-0 border border-stone-200/60">
              <Building2 className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                Sector del Negocio
              </h4>
              <p className="text-xs text-stone-500">
                Ajusta las terminologías clínicas y formularios médicos de la plataforma
              </p>
            </div>
          </div>
          
          <div className="w-full sm:w-64 shrink-0">
            <Select
              value={tenant.business_sector || 'general'}
              onValueChange={(val) => onUpdateSector(val)}
            >
              <SelectTrigger className="h-10 text-xs bg-white border-stone-200">
                <SelectValue placeholder="Seleccionar sector" />
              </SelectTrigger>
              <SelectContent className="bg-white border-stone-200 shadow-xl rounded-xl">
                {sectors.map((sec) => (
                  <SelectItem key={sec.value} value={sec.value} className="text-xs">
                    {sec.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Políticas de Seguridad RLS */}
        <Card className="p-4 border-stone-200/70 bg-white/90 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-stone-900">Aislamiento RLS en Base de Datos</p>
              <p className="text-[11px] text-stone-400">Row Level Security activo en todas las tablas del tenant</p>
            </div>
          </div>
          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
            Protegido
          </span>
        </Card>

        {/* Zona de Peligro - Borrado */}
        <Card className="p-5 border-rose-200/80 bg-rose-50/20 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wider">
                Zona de Riesgo: Eliminación en Cascada
              </h4>
              <p className="text-xs text-stone-500 leading-relaxed max-w-lg">
                Esta acción elimina permanentemente el historial de citas, expedientes, facturación y archivos del storage asociados a este tenant.
              </p>
            </div>
          </div>
          
          <div className="shrink-0 self-end sm:self-center">
            <Button
              variant="destructive"
              size="sm"
              onClick={onOpenDeleteModal}
              className="text-xs gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Eliminar Clínica
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}

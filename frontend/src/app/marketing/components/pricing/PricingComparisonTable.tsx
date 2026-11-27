"use client";

import { Check, Minus, Sparkles, ChevronRight } from 'lucide-react';

interface PricingComparisonTableProps {
  billingCycle: 'monthly' | 'yearly';
  accentColor: string;
  darkColor: string;
  onSelectPlan: (plan: 'individual' | 'pro' | 'elite', interval: 'monthly' | 'yearly') => void;
}

export function PricingComparisonTable({
  billingCycle,
  accentColor,
  darkColor,
  onSelectPlan,
}: PricingComparisonTableProps) {
  return (
    <div className="mt-10 w-full max-w-7xl mx-auto bg-white/95 backdrop-blur-xl rounded-[2.5rem] border border-stone-200/90 shadow-[0_20px_70px_-15px_rgba(0,0,0,0.06)] overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
      
      {/* Cabecera visual de la comparativa */}
      <div className="p-6 md:p-8 bg-stone-50/60 border-b border-stone-200/70 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span 
            style={{ color: accentColor }}
            className="text-[10px] font-black uppercase tracking-[0.25em] block mb-1"
          >
            Auditoría de Funcionalidades
          </span>
          <h3 className="font-serif text-xl md:text-2xl font-bold text-stone-950">
            Comparativa de Capacidades Módulo a Módulo
          </h3>
        </div>
        <p className="text-stone-500 text-xs md:text-sm font-medium max-w-md">
          Compara en detalle qué incluye cada entorno antes de inicializar tu prueba gratuita de 14 días.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[760px]">
          <thead>
            <tr className="border-b border-stone-200/80 bg-white text-xs">
              <th className="py-5 px-6 font-serif font-bold text-stone-900 text-sm md:text-base w-[34%]">
                Módulo / Capacidad
              </th>
              <th className="py-5 px-6 font-bold text-stone-800 w-[22%]">
                <div className="flex flex-col">
                  <span className="text-sm font-serif font-bold text-stone-950">Plan Individual</span>
                  <span className="text-stone-400 text-[11px] font-medium mt-0.5">
                    {billingCycle === 'monthly' ? '39€ / mes' : '390€ / año'}
                  </span>
                </div>
              </th>
              <th 
                style={{ backgroundColor: `${accentColor}08` }}
                className="py-5 px-6 w-[22%] relative border-x border-[#D4AF37]/25"
              >
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span 
                      style={{ backgroundColor: accentColor }}
                      className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider text-stone-950 shadow-2xs"
                    >
                      ★ Más Elegido
                    </span>
                  </div>
                  <span className="text-sm font-serif font-bold text-stone-950">Plan Pro</span>
                  <span className="text-stone-500 text-[11px] font-semibold mt-0.5">
                    {billingCycle === 'monthly' ? '69€ / mes' : '690€ / año'}
                  </span>
                </div>
              </th>
              <th className="py-5 px-6 font-bold text-stone-800 w-[22%]">
                <div className="flex flex-col">
                  <span className="text-sm font-serif font-bold text-stone-950">Plan Elite</span>
                  <span className="text-stone-400 text-[11px] font-medium mt-0.5">
                    {billingCycle === 'monthly' ? '129€ / mes' : '1.290€ / año'}
                  </span>
                </div>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-stone-100 text-xs">
            
            {/* ── GRUPO 1: OPERATIVA, AGENDA Y MOSTRADOR ── */}
            <tr className="bg-stone-50/70 border-t border-b border-stone-200/60">
              <td colSpan={4} className="py-2.5 px-6">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-500">
                  1. Operativa, Agenda y Mostrador
                </span>
              </td>
            </tr>

            <tr className="hover:bg-stone-50/50 transition-colors">
              <td className="py-3.5 px-6">
                <span className="font-bold text-stone-900 block text-xs md:text-sm">Agenda interactiva & turnos (/calendar)</span>
                <span className="text-[11px] text-stone-400 font-medium">Gestión dinámica de citas y disponibilidad de especialistas</span>
              </td>
              <td className="py-3.5 px-6">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
                  <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                  <span>Acceso Total</span>
                </span>
              </td>
              <td className="py-3.5 px-6 border-x border-[#D4AF37]/25" style={{ backgroundColor: `${accentColor}06` }}>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
                  <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                  <span>Acceso Total</span>
                </span>
              </td>
              <td className="py-3.5 px-6">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
                  <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                  <span>Acceso Total</span>
                </span>
              </td>
            </tr>

            <tr className="hover:bg-stone-50/50 transition-colors">
              <td className="py-3.5 px-6">
                <span className="font-bold text-stone-900 block text-xs md:text-sm">Caja rápida / TPV Express (/pos)</span>
                <span className="text-[11px] text-stone-400 font-medium">Cobros en mostrador, tickets de venta y arqueos diarios</span>
              </td>
              <td className="py-3.5 px-6">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
                  <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                  <span>Acceso Total</span>
                </span>
              </td>
              <td className="py-3.5 px-6 border-x border-[#D4AF37]/25" style={{ backgroundColor: `${accentColor}06` }}>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
                  <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                  <span>Acceso Total</span>
                </span>
              </td>
              <td className="py-3.5 px-6">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
                  <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                  <span>Acceso Total</span>
                </span>
              </td>
            </tr>

            <tr className="hover:bg-stone-50/50 transition-colors">
              <td className="py-3.5 px-6">
                <span className="font-bold text-stone-900 block text-xs md:text-sm">Control de Stock y Almacén en TPV (/pos)</span>
                <span className="text-[11px] text-stone-400 font-medium">Descuento automático en tickets de venta y avisos de stock mínimo</span>
              </td>
              <td className="py-3.5 px-6">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-stone-800 bg-stone-100 px-2.5 py-1 rounded-full border border-stone-200/60">
                  <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                  <span>Incluido</span>
                </span>
              </td>
              <td className="py-3.5 px-6 border-x border-[#D4AF37]/25" style={{ backgroundColor: `${accentColor}06` }}>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-stone-800 bg-stone-100 px-2.5 py-1 rounded-full border border-stone-200/60">
                  <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                  <span>Incluido</span>
                </span>
              </td>
              <td className="py-3.5 px-6">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-stone-800 bg-stone-100 px-2.5 py-1 rounded-full border border-stone-200/60">
                  <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                  <span>Incluido</span>
                </span>
              </td>
            </tr>

            <tr className="hover:bg-stone-50/50 transition-colors">
              <td className="py-3.5 px-6">
                <span className="font-bold text-stone-900 block text-xs md:text-sm">Catálogo Dual por Canal (Web vs TPV)</span>
                <span className="text-[11px] text-stone-400 font-medium">Conceptos exclusivos de mostrador ocultos en la web</span>
              </td>
              <td className="py-3.5 px-6">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-stone-800 bg-stone-100 px-2.5 py-1 rounded-full border border-stone-200/60">
                  <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                  <span>Incluido</span>
                </span>
              </td>
              <td className="py-3.5 px-6 border-x border-[#D4AF37]/25" style={{ backgroundColor: `${accentColor}06` }}>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-stone-800 bg-stone-100 px-2.5 py-1 rounded-full border border-stone-200/60">
                  <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                  <span>Incluido</span>
                </span>
              </td>
              <td className="py-3.5 px-6">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-stone-800 bg-stone-100 px-2.5 py-1 rounded-full border border-stone-200/60">
                  <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                  <span>Incluido</span>
                </span>
              </td>
            </tr>

            <tr className="hover:bg-stone-50/50 transition-colors">
              <td className="py-3.5 px-6">
                <span className="font-bold text-stone-900 block text-xs md:text-sm">Servicios y tratamientos en catálogo</span>
                <span className="text-[11px] text-stone-400 font-medium">Tiempos de cabina, precios y categorías sin límites</span>
              </td>
              <td className="py-3.5 px-6">
                <span className="font-bold text-stone-900">Ilimitados</span>
              </td>
              <td className="py-3.5 px-6 border-x border-[#D4AF37]/25" style={{ backgroundColor: `${accentColor}06` }}>
                <span className="font-bold text-stone-900">Ilimitados</span>
              </td>
              <td className="py-3.5 px-6">
                <span className="font-bold text-stone-900">Ilimitados</span>
              </td>
            </tr>

            <tr className="hover:bg-stone-50/50 transition-colors">
              <td className="py-3.5 px-6">
                <span className="font-bold text-stone-900 block text-xs md:text-sm">Fianza anti-plantones (Stripe Connect)</span>
                <span className="text-[11px] text-stone-400 font-medium">Depósito o fianza obligatoria para erradicar ausencias</span>
              </td>
              <td className="py-3.5 px-6">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-stone-800 bg-stone-100 px-2.5 py-1 rounded-full border border-stone-200/60">
                  <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                  <span>Incluido</span>
                </span>
              </td>
              <td className="py-3.5 px-6 border-x border-[#D4AF37]/25" style={{ backgroundColor: `${accentColor}06` }}>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-stone-800 bg-stone-100 px-2.5 py-1 rounded-full border border-stone-200/60">
                  <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                  <span>Incluido</span>
                </span>
              </td>
              <td className="py-3.5 px-6">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-stone-800 bg-stone-100 px-2.5 py-1 rounded-full border border-stone-200/60">
                  <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                  <span>Incluido</span>
                </span>
              </td>
            </tr>

            {/* ── GRUPO 2: EQUIPO, SEDES Y PACIENTES ── */}
            <tr className="bg-stone-50/70 border-t border-b border-stone-200/60">
              <td colSpan={4} className="py-2.5 px-6">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-500">
                  2. Capacidad de Equipo y Sedes
                </span>
              </td>
            </tr>

            <tr className="hover:bg-stone-50/50 transition-colors">
              <td className="py-3.5 px-6">
                <span className="font-bold text-stone-900 block text-xs md:text-sm">Especialistas y miembros de equipo</span>
                <span className="text-[11px] text-stone-400 font-medium">Accesos independientes con matriz de permisos RBAC</span>
              </td>
              <td className="py-3.5 px-6 text-stone-700 font-medium">
                1 solo usuario
              </td>
              <td className="py-3.5 px-6 border-x border-[#D4AF37]/25 font-bold text-stone-950" style={{ backgroundColor: `${accentColor}06` }}>
                Hasta 4 miembros
              </td>
              <td className="py-3.5 px-6 font-bold text-stone-950">
                Hasta 10 miembros <span className="text-[10px] font-normal text-stone-500">(+15€/mes extra)</span>
              </td>
            </tr>

            <tr className="hover:bg-stone-50/50 transition-colors">
              <td className="py-3.5 px-6">
                <span className="font-bold text-stone-900 block text-xs md:text-sm">Sedes y ubicaciones físicas</span>
                <span className="text-[11px] text-stone-400 font-medium">Locales o consultas independientes en la misma plataforma</span>
              </td>
              <td className="py-3.5 px-6 text-stone-700 font-medium">
                1 ubicación
              </td>
              <td className="py-3.5 px-6 border-x border-[#D4AF37]/25 font-bold text-stone-950" style={{ backgroundColor: `${accentColor}06` }}>
                Hasta 2 sedes
              </td>
              <td className="py-3.5 px-6 font-bold text-stone-950">
                Hasta 5 sedes <span className="text-[10px] font-normal text-stone-500">(+20€/mes extra)</span>
              </td>
            </tr>

            <tr className="hover:bg-stone-50/50 transition-colors">
              <td className="py-3.5 px-6">
                <span className="font-bold text-stone-900 block text-xs md:text-sm">Expedientes y directorio de clientes</span>
                <span className="text-[11px] text-stone-400 font-medium">Historial médico, citas previas, alertas y RGPD</span>
              </td>
              <td className="py-3.5 px-6 font-bold text-stone-900">
                Ilimitados
              </td>
              <td className="py-3.5 px-6 border-x border-[#D4AF37]/25 font-bold text-stone-900" style={{ backgroundColor: `${accentColor}06` }}>
                Ilimitados
              </td>
              <td className="py-3.5 px-6 font-bold text-stone-900">
                Ilimitados
              </td>
            </tr>

            <tr className="hover:bg-stone-50/50 transition-colors">
              <td className="py-3.5 px-6">
                <span className="font-bold text-stone-900 block text-xs md:text-sm">Registro de Jornada y Fichaje (/fichar)</span>
                <span className="text-[11px] text-stone-400 font-medium">Cumplimiento legal obligatorio (RDL 8/2019) con geolocalización, PIN y exportación oficial a Excel</span>
              </td>
              <td className="py-3.5 px-6 text-stone-700 font-medium">
                1 usuario (Autónomo)
              </td>
              <td className="py-3.5 px-6 border-x border-[#D4AF37]/25" style={{ backgroundColor: `${accentColor}06` }}>
                <span 
                  style={{ backgroundColor: `${accentColor}18`, borderColor: `${accentColor}40`, color: '#1c1917' }}
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border shadow-2xs"
                >
                  <Check className="w-3.5 h-3.5 text-stone-950 stroke-[2.5]" />
                  <span>Hasta 4 empleados + Excel</span>
                </span>
              </td>
              <td className="py-3.5 px-6 font-bold text-stone-950">
                <span 
                  style={{ backgroundColor: `${accentColor}18`, borderColor: `${accentColor}40`, color: '#1c1917' }}
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border shadow-2xs"
                >
                  <Check className="w-3.5 h-3.5 text-stone-950 stroke-[2.5]" />
                  <span>Multisede ilimitado + Auditoría</span>
                </span>
              </td>
            </tr>

            {/* ── GRUPO 3: LEGALIDAD CLÍNICA, BONOS Y FISCALIDAD ── */}
            <tr className="bg-stone-50/70 border-t border-b border-stone-200/60">
              <td colSpan={4} className="py-2.5 px-6">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-500">
                  3. Legalidad Médica, Bonos y Fiscalidad
                </span>
              </td>
            </tr>

            <tr className="hover:bg-stone-50/50 transition-colors">
              <td className="py-3.5 px-6">
                <span className="font-bold text-stone-900 block text-xs md:text-sm">Consentimientos y Firma en Tablet / Móvil</span>
                <span className="text-[11px] text-stone-400 font-medium">Firma manuscrita digitalizada Base64 con sellado de tiempo</span>
              </td>
              <td className="py-3.5 px-6">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-stone-800 bg-stone-100 px-2.5 py-1 rounded-full border border-stone-200/60">
                  <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                  <span>Incluido (1 especialista)</span>
                </span>
              </td>
              <td className="py-3.5 px-6 border-x border-[#D4AF37]/25" style={{ backgroundColor: `${accentColor}06` }}>
                <span 
                  style={{ backgroundColor: `${accentColor}18`, borderColor: `${accentColor}40`, color: '#1c1917' }}
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border shadow-2xs"
                >
                  <Check className="w-3.5 h-3.5 text-stone-950 stroke-[2.5]" />
                  <span>Incluido (Equipo)</span>
                </span>
              </td>
              <td className="py-3.5 px-6">
                <span 
                  style={{ backgroundColor: `${accentColor}18`, borderColor: `${accentColor}40`, color: '#1c1917' }}
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border shadow-2xs"
                >
                  <Check className="w-3.5 h-3.5 text-stone-950 stroke-[2.5]" />
                  <span>Incluido (Multisede)</span>
                </span>
              </td>
            </tr>

            <tr className="hover:bg-stone-50/50 transition-colors">
              <td className="py-3.5 px-6">
                <span className="font-bold text-stone-900 block text-xs md:text-sm">Emisión y control de Bonos (/vouchers)</span>
                <span className="text-[11px] text-stone-400 font-medium">Venta de bonos multisesión con contador automático de canjes</span>
              </td>
              <td className="py-3.5 px-6">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-stone-800 bg-stone-100 px-2.5 py-1 rounded-full border border-stone-200/60">
                  <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                  <span>Incluido</span>
                </span>
              </td>
              <td className="py-3.5 px-6 border-x border-[#D4AF37]/25" style={{ backgroundColor: `${accentColor}06` }}>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-stone-800 bg-stone-100 px-2.5 py-1 rounded-full border border-stone-200/60">
                  <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                  <span>Incluido</span>
                </span>
              </td>
              <td className="py-3.5 px-6">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-stone-800 bg-stone-100 px-2.5 py-1 rounded-full border border-stone-200/60">
                  <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                  <span>Incluido</span>
                </span>
              </td>
            </tr>

            <tr className="hover:bg-stone-50/50 transition-colors">
              <td className="py-3.5 px-6">
                <span className="font-bold text-stone-900 block text-xs md:text-sm">Facturación oficial correlativa e IVA (/invoices)</span>
                <span className="text-[11px] text-stone-400 font-medium">Facturas oficiales con desglose de impuestos y descarga en PDF</span>
              </td>
              <td className="py-3.5 px-6">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-stone-800 bg-stone-100 px-2.5 py-1 rounded-full border border-stone-200/60">
                  <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                  <span>Facturas oficiales (PDF)</span>
                </span>
              </td>
              <td className="py-3.5 px-6 border-x border-[#D4AF37]/25" style={{ backgroundColor: `${accentColor}06` }}>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-stone-800 bg-stone-100 px-2.5 py-1 rounded-full border border-stone-200/60">
                  <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                  <span>Facturas oficiales (PDF)</span>
                </span>
              </td>
              <td className="py-3.5 px-6">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-stone-800 bg-stone-100 px-2.5 py-1 rounded-full border border-stone-200/60">
                  <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                  <span>Facturas oficiales (PDF)</span>
                </span>
              </td>
            </tr>

            {/* ── GRUPO 4: INTELIGENCIA ARTIFICIAL, WEB Y SOPORTE ── */}
            <tr className="bg-stone-50/70 border-t border-b border-stone-200/60">
              <td colSpan={4} className="py-2.5 px-6">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-500">
                  4. Inteligencia Artificial, Marca y Soporte
                </span>
              </td>
            </tr>

            <tr className="hover:bg-stone-50/50 transition-colors">
              <td className="py-3.5 px-6">
                <span className="font-bold text-stone-900 block text-xs md:text-sm">Web corporativa con CMS y reservas</span>
                <span className="text-[11px] text-stone-400 font-medium">Página visual de alta gama con motor de reservas integrado</span>
              </td>
              <td className="py-3.5 px-6">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-stone-800 bg-stone-100 px-2.5 py-1 rounded-full border border-stone-200/60">
                  <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                  <span>Subdominio + Dominio propio</span>
                </span>
              </td>
              <td className="py-3.5 px-6 border-x border-[#D4AF37]/25" style={{ backgroundColor: `${accentColor}06` }}>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-stone-800 bg-stone-100 px-2.5 py-1 rounded-full border border-stone-200/60">
                  <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                  <span>Subdominio + Dominio propio</span>
                </span>
              </td>
              <td className="py-3.5 px-6">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-stone-800 bg-stone-100 px-2.5 py-1 rounded-full border border-stone-200/60">
                  <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                  <span>Subdominio + Dominio propio</span>
                </span>
              </td>
            </tr>

            <tr className="hover:bg-stone-50/50 transition-colors">
              <td className="py-3.5 px-6">
                <span className="font-bold text-stone-900 block text-xs md:text-sm">Asistente IA (Co-Piloto y Diseñador Web)</span>
                <span className="text-[11px] text-stone-400 font-medium">Agenda, clientes, precios rápidos y textos con IA en el constructor</span>
              </td>
              <td className="py-3.5 px-6">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-stone-800 bg-stone-100 px-2.5 py-1 rounded-full border border-stone-200/60">
                  <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                  <span>15 acciones / día</span>
                </span>
              </td>
              <td className="py-3.5 px-6 border-x border-[#D4AF37]/25" style={{ backgroundColor: `${accentColor}06` }}>
                <span 
                  style={{ backgroundColor: `${accentColor}18`, borderColor: `${accentColor}40`, color: '#1c1917' }}
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border shadow-2xs"
                >
                  <Check className="w-3.5 h-3.5 text-stone-950 stroke-[2.5]" />
                  <span>35 acciones / día</span>
                </span>
              </td>
              <td className="py-3.5 px-6">
                <span 
                  style={{ backgroundColor: `${accentColor}20`, borderColor: `${accentColor}50`, color: '#1c1917' }}
                  className="inline-flex items-center gap-1.5 text-[11px] font-black px-3 py-1 rounded-full border shadow-2xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>Ilimitadas (∞)</span>
                </span>
              </td>
            </tr>

            <tr className="hover:bg-stone-50/50 transition-colors">
              <td className="py-3.5 px-6">
                <span className="font-bold text-stone-900 block text-xs md:text-sm">Generador de Fotografías IA</span>
                <span className="text-[11px] text-stone-400 font-medium">Fotografías fotorrealistas de alta gama (+ Ilimitadas con clave propia BYOK)</span>
              </td>
              <td className="py-3.5 px-6">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-stone-800 bg-stone-100 px-2.5 py-1 rounded-full border border-stone-200/60">
                  <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                  <span>30 fotos / mes</span>
                </span>
              </td>
              <td className="py-3.5 px-6 border-x border-[#D4AF37]/25" style={{ backgroundColor: `${accentColor}06` }}>
                <span 
                  style={{ backgroundColor: `${accentColor}18`, borderColor: `${accentColor}40`, color: '#1c1917' }}
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border shadow-2xs"
                >
                  <Check className="w-3.5 h-3.5 text-stone-950 stroke-[2.5]" />
                  <span>90 fotos / mes</span>
                </span>
              </td>
              <td className="py-3.5 px-6">
                <span 
                  style={{ backgroundColor: `${accentColor}20`, borderColor: `${accentColor}50`, color: '#1c1917' }}
                  className="inline-flex items-center gap-1.5 text-[11px] font-black px-3 py-1 rounded-full border shadow-2xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>250 fotos / mes</span>
                </span>
              </td>
            </tr>

            <tr className="hover:bg-stone-50/50 transition-colors">
              <td className="py-3.5 px-6">
                <span className="font-bold text-stone-900 block text-xs md:text-sm">Asistente Virtual Concierge 24/7</span>
                <span className="text-[11px] text-stone-400 font-medium">Widget web interactivo con voz, pastillas horarias, llamadas telefónicas y enlace directo a WhatsApp</span>
              </td>
              <td className="py-3.5 px-6">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-stone-800 bg-stone-100 px-2.5 py-1 rounded-full border border-stone-200/60">
                  <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                  <span>Incluido</span>
                </span>
              </td>
              <td className="py-3.5 px-6 border-x border-[#D4AF37]/25" style={{ backgroundColor: `${accentColor}06` }}>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-stone-800 bg-stone-100 px-2.5 py-1 rounded-full border border-stone-200/60">
                  <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                  <span>Incluido</span>
                </span>
              </td>
              <td className="py-3.5 px-6">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-stone-800 bg-stone-100 px-2.5 py-1 rounded-full border border-stone-200/60">
                  <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                  <span>Incluido</span>
                </span>
              </td>
            </tr>

            <tr className="hover:bg-stone-50/50 transition-colors">
              <td className="py-3.5 px-6">
                <span className="font-bold text-stone-900 block text-xs md:text-sm">Acompañamiento y Soporte Técnico</span>
                <span className="text-[11px] text-stone-400 font-medium">Canal de resolución de dudas operativas e incidencias</span>
              </td>
              <td className="py-3.5 px-6 text-stone-600 text-[11px]">
                Soporte por email
              </td>
              <td className="py-3.5 px-6 border-x border-[#D4AF37]/25 text-stone-900 font-medium text-[11px]" style={{ backgroundColor: `${accentColor}06` }}>
                Soporte por email
              </td>
              <td className="py-3.5 px-6 text-stone-900 font-medium text-[11px]">
                Soporte por email
              </td>
            </tr>

          </tbody>

          {/* Pie de tabla con botones directos de acción (CTA) */}
          <tfoot>
            <tr className="border-t border-stone-200/80 bg-stone-50/40">
              <td className="py-6 px-6 font-medium text-stone-500 text-xs">
                ¿Tienes dudas sobre qué plan se adapta mejor a tu centro?
              </td>
              <td className="py-6 px-6">
                <button
                  onClick={() => onSelectPlan('individual', billingCycle)}
                  className="w-full bg-white hover:bg-stone-100 text-stone-900 py-2.5 px-4 rounded-xl text-xs font-bold transition-all border border-stone-200/90 shadow-2xs active:scale-95 cursor-pointer"
                >
                  Elegir Individual
                </button>
              </td>
              <td className="py-6 px-6 border-x border-[#D4AF37]/25" style={{ backgroundColor: `${accentColor}08` }}>
                <button
                  onClick={() => onSelectPlan('pro', billingCycle)}
                  style={{ backgroundColor: darkColor }}
                  className="w-full text-white py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer hover:opacity-90 flex items-center justify-center gap-1.5"
                >
                  <span>Elegir Plan Pro</span>
                  <ChevronRight size={12} style={{ color: accentColor }} />
                </button>
              </td>
              <td className="py-6 px-6">
                <button
                  onClick={() => onSelectPlan('elite', billingCycle)}
                  className="w-full bg-white hover:bg-stone-100 text-stone-950 py-2.5 px-4 rounded-xl text-xs font-bold transition-all border border-stone-300 shadow-2xs active:scale-95 cursor-pointer"
                >
                  Elegir Elite
                </button>
              </td>
            </tr>
          </tfoot>

        </table>
      </div>

    </div>
  );
}

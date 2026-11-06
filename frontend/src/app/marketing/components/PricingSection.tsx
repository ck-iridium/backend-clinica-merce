"use client";

import { useState } from 'react';
import { Check, ChevronRight, ChevronDown, Sparkles, Star, Minus } from 'lucide-react';

interface PricingSectionProps {
  onSelectPlan: (plan: 'free' | 'basic' | 'pro' | 'gold') => void;
  primaryColor?: string;
  secondaryColor?: string;
  tertiaryColor?: string;
}

export default function PricingSection({
  onSelectPlan,
  primaryColor = '#1c1917',
  secondaryColor = '#FAF9F6',
  tertiaryColor = '#D4AF37'
}: PricingSectionProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [showMatrix, setShowMatrix] = useState(false);

  const accentColor = tertiaryColor || '#D4AF37';
  const darkColor = primaryColor || '#1c1917';

  return (
    <section id="precios" className="scroll-mt-20 py-28 bg-[#FAF9F6] border-t border-stone-200/60 relative overflow-hidden">
      <span id="pricing" className="scroll-mt-20 sr-only" />
      {/* Halo ambiental dinámico de fondo */}
      <div 
        style={{ backgroundColor: `${accentColor}12` }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[750px] rounded-full blur-[160px] pointer-events-none" 
      />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Cabecera Editorial */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div 
            style={{ 
              backgroundColor: `${accentColor}18`, 
              borderColor: `${accentColor}40`,
              color: accentColor 
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-[0.25em] mb-4"
          >
            <Sparkles size={11} style={{ color: accentColor }} />
            <span>Inversión Transparente • Sin Comisiones</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-serif font-bold tracking-tight text-stone-950">
            Planes Diseñados para Crecer con tu Centro
          </h2>
          <p className="text-stone-500 text-sm md:text-base mt-4 font-medium leading-relaxed">
            Sin costes ocultos ni comisiones por paciente nuevo. Elige la escala perfecta para proyectar la elegancia de tu clínica.
          </p>

          {/* Banner de Reverse Trial */}
          <div 
            style={{ borderColor: `${accentColor}40` }}
            className="mt-8 inline-flex items-center gap-2.5 bg-white border px-5 py-2.5 rounded-2xl shadow-sm text-xs font-semibold text-stone-800"
          >
            <span 
              style={{ backgroundColor: accentColor }}
              className="w-2 h-2 rounded-full animate-pulse" 
            />
            <span><strong>Prueba Gratuita de 14 Días</strong> en Plan Pro completo • Sin tarjeta de crédito requerida</span>
          </div>

          {/* Selector Mensual / Anual */}
          <div className="flex items-center justify-center gap-3 mt-8">
            <span className={`text-xs font-bold transition-colors ${billingCycle === 'monthly' ? 'text-stone-950' : 'text-stone-400'}`}>
              Mensual
            </span>
            <button
              onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
              className="w-14 h-8 bg-stone-200 p-1 rounded-full relative transition-colors focus:outline-none"
              aria-label="Alternar ciclo de facturación"
            >
              <div 
                style={billingCycle === 'yearly' ? { backgroundColor: accentColor } : undefined}
                className={`w-6 h-6 rounded-full transition-transform duration-300 ${
                  billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-0 bg-stone-950'
                }`}
              />
            </button>
            <div className="flex items-center gap-1.5">
              <span className={`text-xs font-bold transition-colors ${billingCycle === 'yearly' ? 'text-stone-950' : 'text-stone-400'}`}>
                Anual
              </span>
              <span 
                style={{ 
                  backgroundColor: `${accentColor}20`, 
                  borderColor: `${accentColor}40`,
                  color: accentColor 
                }}
                className="text-[9.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border"
              >
                2 Meses Gratis
              </span>
            </div>
          </div>
        </div>

        {/* Las 3 Tarjetas Oficiales */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
          
          {/* 1. Plan Individual (39€) */}
          <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-sm border border-stone-200/80 p-8 flex flex-col justify-between hover:shadow-md hover:border-stone-300 transition-all duration-300">
            <div>
              <div className="mb-6 pb-6 border-b border-stone-100">
                <span className="text-stone-400 font-bold uppercase text-[9px] tracking-widest block mb-1">
                  Autónomos & Gabinetes
                </span>
                <h3 className="text-2xl font-serif font-bold text-stone-900">Plan Individual</h3>
                <div className="flex items-baseline mt-3">
                  <span className="text-4xl font-serif font-bold text-stone-950">
                    {billingCycle === 'monthly' ? '39€' : '390€'}
                  </span>
                  <span className="text-stone-400 text-xs font-medium ml-1.5">
                    {billingCycle === 'monthly' ? '/ mes (+IVA)' : '/ año (32,5€/mes)'}
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-2 font-medium">
                  Toda la potencia de ProBookia para profesionales independientes que gestionan su propia cabina con firma médica y bonos.
                </p>
              </div>

              <div className="space-y-3.5 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <span className="text-xs font-semibold text-stone-800">1 especialista único</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <span className="text-xs font-semibold text-stone-800">1 sede o ubicación física</span>
                </div>
                <div className="flex items-center gap-3">
                  <div 
                    style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
                    className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                  >
                    <Sparkles className="w-2.5 h-2.5" />
                  </div>
                  <span className="text-xs font-bold" style={{ color: accentColor }}>
                    Servicios y catálogo ilimitados
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <span className="text-xs font-semibold text-stone-700">Agenda interactiva & turnos</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <span className="text-xs font-semibold text-stone-700">Firma en tablet y consentimientos LOPD</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <span className="text-xs font-semibold text-stone-700">Emisión y control de Bonos (/vouchers)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <span className="text-xs font-semibold text-stone-700">Caja rápida TPV (tickets de venta)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <span className="text-xs font-semibold text-stone-700">Fianza anti-plantones Stripe Connect</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onSelectPlan('basic')}
              className="w-full bg-stone-50 hover:bg-stone-100 text-stone-900 py-3.5 rounded-2xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1 active:scale-95 border border-stone-200/80 cursor-pointer"
            >
              <span>Comenzar con Plan Individual</span>
              <ChevronRight size={13} />
            </button>
          </div>

          {/* 2. Plan Pro (69€) - DESTACADO / MÁS ELEGIDO */}
          <div 
            style={{ 
              borderColor: accentColor, 
              boxShadow: `0 25px 65px -15px ${accentColor}35` 
            }}
            className="bg-white rounded-3xl shadow-xl border-2 p-8 relative flex flex-col justify-between lg:-translate-y-3 transition-all duration-300"
          >
            <div 
              style={{ backgroundColor: accentColor }}
              className="absolute -top-3.5 right-6 text-stone-950 px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-md flex items-center gap-1"
            >
              <Star size={10} className="fill-stone-950 text-stone-950" />
              <span>Más Elegido • Recomendado</span>
            </div>

            <div>
              <div className="mb-6 pb-6 border-b border-stone-100">
                <span 
                  style={{ color: accentColor }}
                  className="font-bold uppercase text-[9px] tracking-widest block mb-1"
                >
                  Clínicas con Equipo
                </span>
                <h3 className="text-2xl font-serif font-bold text-stone-950">Plan Pro Todo-en-Uno</h3>
                <div className="flex items-baseline mt-3">
                  <span className="text-4xl font-serif font-bold text-stone-950">
                    {billingCycle === 'monthly' ? '69€' : '690€'}
                  </span>
                  <span className="text-stone-400 text-xs font-medium ml-1.5">
                    {billingCycle === 'monthly' ? '/ mes (+IVA)' : '/ año (57,5€/mes)'}
                  </span>
                </div>
                <p className="text-xs text-stone-600 mt-2 font-medium">
                  El estándar completo para centros con equipo que requieren permisos RBAC, facturación oficial e IVA y web corporativa.
                </p>
              </div>

              <div className="space-y-3.5 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <span className="text-xs font-bold text-stone-950">Hasta 4 miembros de equipo (con RBAC)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <span className="text-xs font-bold text-stone-950">Hasta 2 sedes físicas</span>
                </div>
                <div className="flex items-center gap-3">
                  <div 
                    style={{ backgroundColor: `${accentColor}25`, color: accentColor }}
                    className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                  >
                    <Sparkles className="w-2.5 h-2.5" />
                  </div>
                  <span className="text-xs font-bold" style={{ color: accentColor }}>
                    Firma digital LOPD para todo el equipo
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <span className="text-xs font-semibold text-stone-800">Emisión y control de Bonos (/vouchers)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <span className="text-xs font-semibold text-stone-800">Facturación oficial correlativa e IVA (/invoices)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <span className="text-xs font-semibold text-stone-800">Web de lujo con CMS + Dominio propio</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <span className="text-xs font-semibold text-stone-800">Servicios y catálogo ilimitados</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onSelectPlan('pro')}
              style={{ backgroundColor: darkColor }}
              className="w-full hover:opacity-90 text-white py-4 rounded-2xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 active:scale-95 shadow-md group border border-white/20 cursor-pointer"
            >
              <span>Comenzar Prueba Gratuita (14 Días)</span>
              <ChevronRight size={13} style={{ color: accentColor }} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* 3. Plan Elite (129€) - DARK LUXURY RENDIMIENTO MÁXIMO */}
          <div 
            style={{ backgroundColor: darkColor }}
            className="text-white rounded-3xl shadow-xl border border-white/10 p-8 flex flex-col justify-between hover:border-white/20 transition-all duration-300"
          >
            <div>
              <div className="mb-6 pb-6 border-b border-white/10">
                <span 
                  style={{ color: accentColor }}
                  className="font-bold uppercase text-[9px] tracking-widest block mb-1"
                >
                  Multisede & Rendimiento Máximo
                </span>
                <h3 className="text-2xl font-serif font-bold text-white">Plan Elite</h3>
                <div className="flex items-baseline mt-3">
                  <span className="text-4xl font-serif font-bold text-white">
                    {billingCycle === 'monthly' ? '129€' : '1.290€'}
                  </span>
                  <span className="text-stone-400 text-xs font-medium ml-1.5">
                    {billingCycle === 'monthly' ? '/ mes (+IVA)' : '/ año (107,5€/mes)'}
                  </span>
                </div>
                <p className="text-xs text-stone-400 mt-2 font-medium">
                  Para policlínicas, cadenas y centros de alta demanda que exigen IA conversacional y multisede.
                </p>
              </div>

              <div className="space-y-3.5 mb-8">
                <div className="flex items-center gap-3">
                  <div 
                    style={{ backgroundColor: `${accentColor}25`, color: accentColor }}
                    className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                  >
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <span className="text-xs font-bold text-white">Hasta 10 miembros (+15€/mes extra)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div 
                    style={{ backgroundColor: `${accentColor}25`, color: accentColor }}
                    className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                  >
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <span className="text-xs font-bold text-white">Hasta 5 sedes (+20€/mes extra)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div 
                    style={{ backgroundColor: `${accentColor}25`, color: accentColor }}
                    className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                  >
                    <Sparkles className="w-2.5 h-2.5" />
                  </div>
                  <span className="text-xs font-bold" style={{ color: accentColor }}>
                    AI Webmaster Copilot (Texto, Voz y Fotos)
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div 
                    style={{ backgroundColor: `${accentColor}25`, color: accentColor }}
                    className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                  >
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <span className="text-xs font-semibold text-stone-200">Todo lo incluido en el Plan Pro</span>
                </div>
                <div className="flex items-center gap-3">
                  <div 
                    style={{ backgroundColor: `${accentColor}25`, color: accentColor }}
                    className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                  >
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <span className="text-xs font-semibold text-stone-200">Marca blanca 100% invisible</span>
                </div>
                <div className="flex items-center gap-3">
                  <div 
                    style={{ backgroundColor: `${accentColor}25`, color: accentColor }}
                    className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                  >
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <span className="text-xs font-semibold text-stone-200">Soporte prioritario VIP 24/7</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onSelectPlan('gold')}
              className="w-full bg-white hover:bg-stone-100 text-stone-950 py-3.5 rounded-2xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1 active:scale-95 shadow-md cursor-pointer"
            >
              <span>Solicitar Plan Elite</span>
              <ChevronRight size={13} />
            </button>
          </div>

        </div>

        {/* Botón para Desplegar Matriz Comparativa (Estilo Quiet Luxury Pill) */}
        <div className="text-center mt-14">
          <button
            onClick={() => setShowMatrix(prev => !prev)}
            className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full text-xs font-bold text-stone-900 bg-white border border-stone-200/90 shadow-sm hover:border-[#D4AF37]/60 hover:shadow-md hover:bg-stone-50/50 transition-all active:scale-95 cursor-pointer group"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>{showMatrix ? 'Ocultar comparativa detallada' : 'Ver comparativa completa módulo a módulo'}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-stone-400 group-hover:text-stone-700 transition-transform duration-300 ${showMatrix ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Tabla Comparativa de Módulos (Ancho Completo 7XL, Quiet Luxury 2026, Cero Emojis) */}
        {showMatrix && (
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
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-stone-600 bg-stone-100 px-2.5 py-1 rounded-full">
                        <span>Solo ticket de caja</span>
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
                      <span className="font-bold text-stone-900 block text-xs md:text-sm">Web corporativa con CMS y Dominio propio</span>
                      <span className="text-[11px] text-stone-400 font-medium">Página visual de alta gama con motor de reservas integrado</span>
                    </td>
                    <td className="py-3.5 px-6 text-stone-600 text-[11px]">
                      Subdominio estándar
                    </td>
                    <td className="py-3.5 px-6 border-x border-[#D4AF37]/25" style={{ backgroundColor: `${accentColor}06` }}>
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-stone-800 bg-stone-100 px-2.5 py-1 rounded-full border border-stone-200/60">
                        <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                        <span>Web de lujo + Dominio propio</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-stone-900 bg-stone-100 px-2.5 py-1 rounded-full border border-stone-300">
                        <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                        <span>Marca blanca 100% invisible</span>
                      </span>
                    </td>
                  </tr>

                  <tr className="hover:bg-stone-50/50 transition-colors">
                    <td className="py-3.5 px-6">
                      <span className="font-bold text-stone-900 block text-xs md:text-sm">AI Webmaster Copilot (/ai-webmaster)</span>
                      <span className="text-[11px] text-stone-400 font-medium">Generación inteligente de textos, descripciones, fotos y voz</span>
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-stone-400">
                        <Minus className="w-3.5 h-3.5 text-stone-300 stroke-[2]" />
                        <span>No disponible</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-6 border-x border-[#D4AF37]/25" style={{ backgroundColor: `${accentColor}06` }}>
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-stone-400">
                        <Minus className="w-3.5 h-3.5 text-stone-300 stroke-[2]" />
                        <span>No disponible</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-6">
                      <span 
                        style={{ backgroundColor: `${accentColor}20`, borderColor: `${accentColor}50`, color: '#1c1917' }}
                        className="inline-flex items-center gap-1.5 text-[11px] font-black px-3 py-1 rounded-full border shadow-2xs"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <span>Texto, Voz y Fotos</span>
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
                    <td className="py-3.5 px-6 border-x border-[#D4AF37]/25 font-bold text-stone-950 text-[11px]" style={{ backgroundColor: `${accentColor}06` }}>
                      Soporte prioritario &lt; 12h
                    </td>
                    <td className="py-3.5 px-6 font-bold text-stone-950 text-[11px]">
                      Soporte VIP 24/7 + Onboarding asistido
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
                        onClick={() => onSelectPlan('basic')}
                        className="w-full bg-white hover:bg-stone-100 text-stone-900 py-2.5 px-4 rounded-xl text-xs font-bold transition-all border border-stone-200/90 shadow-2xs active:scale-95 cursor-pointer"
                      >
                        Elegir Individual
                      </button>
                    </td>
                    <td className="py-6 px-6 border-x border-[#D4AF37]/25" style={{ backgroundColor: `${accentColor}08` }}>
                      <button
                        onClick={() => onSelectPlan('pro')}
                        style={{ backgroundColor: darkColor }}
                        className="w-full text-white py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer hover:opacity-90 flex items-center justify-center gap-1.5"
                      >
                        <span>Elegir Plan Pro</span>
                        <ChevronRight size={12} style={{ color: accentColor }} />
                      </button>
                    </td>
                    <td className="py-6 px-6">
                      <button
                        onClick={() => onSelectPlan('gold')}
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
        )}

        {/* Garantías y Trust bar */}
        <div className="mt-16 pt-8 border-t border-stone-200/60 flex flex-wrap items-center justify-center gap-8 md:gap-16 text-xs text-stone-500 font-medium">
          <div className="flex items-center gap-2">
            <span 
              style={{ backgroundColor: accentColor }}
              className="w-2 h-2 rounded-full" 
            />
            <span>Sin permanencia obligatoria</span>
          </div>
          <div className="flex items-center gap-2">
            <span 
              style={{ backgroundColor: accentColor }}
              className="w-2 h-2 rounded-full" 
            />
            <span>Migración asistida de citas y pacientes</span>
          </div>
          <div className="flex items-center gap-2">
            <span 
              style={{ backgroundColor: accentColor }}
              className="w-2 h-2 rounded-full" 
            />
            <span>Aislamiento de base de datos RLS (RGPD/LOPD)</span>
          </div>
        </div>

      </div>
    </section>
  );
}

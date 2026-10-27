"use client";

import { useState } from 'react';
import { Check, ChevronRight, Sparkles, Star } from 'lucide-react';

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
    <section id="pricing" className="py-28 bg-[#FAF9F6] border-t border-stone-200/60 relative overflow-hidden">
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
                  Toda la potencia de ProBookia para profesionales independientes que gestionan su propia cabina.
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
                  <span className="text-xs font-semibold text-stone-700">Caja rápida TPV (tickets de venta)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <span className="text-xs font-semibold text-stone-700">Fianza anti-plantones Stripe Connect</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <span className="text-xs font-semibold text-stone-700">Directorio y fichas de clientes</span>
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
                  El estándar completo para centros con especialistas que requieren legalidad médica, facturas oficiales y bonos.
                </p>
              </div>

              <div className="space-y-3.5 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <span className="text-xs font-bold text-stone-950">Hasta 4 miembros de equipo</span>
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
                    Firma manuscrita en tablet/móvil (LOPD)
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

        {/* Botón para Desplegar Matriz Comparativa */}
        <div className="text-center mt-12">
          <button
            onClick={() => setShowMatrix(prev => !prev)}
            className="text-xs font-bold text-stone-600 hover:text-stone-950 transition-colors inline-flex items-center gap-1.5 underline underline-offset-4 cursor-pointer"
          >
            <span>{showMatrix ? 'Ocultar comparativa detallada' : 'Ver comparativa completa módulo a módulo'}</span>
            <ChevronRight size={13} className={`transition-transform duration-300 ${showMatrix ? 'rotate-90' : ''}`} />
          </button>
        </div>

        {/* Tabla Comparativa de Módulos */}
        {showMatrix && (
          <div className="mt-8 max-w-5xl mx-auto bg-white rounded-3xl border border-stone-200/80 p-6 md:p-8 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stone-200/80">
                  <th className="py-3 px-4 font-serif font-bold text-stone-900 text-sm">Módulo / Capacidad</th>
                  <th className="py-3 px-4 font-bold text-stone-700">Individual (39€)</th>
                  <th 
                    style={{ color: accentColor, backgroundColor: `${accentColor}10` }}
                    className="py-3 px-4 font-bold rounded-t-xl"
                  >
                    Pro (69€)
                  </th>
                  <th className="py-3 px-4 font-bold text-stone-900">Elite (129€)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-600">
                <tr>
                  <td className="py-3 px-4 font-semibold text-stone-900">Agenda interactiva (/calendar)</td>
                  <td className="py-3 px-4 text-emerald-600 font-bold">✅ Total</td>
                  <td className="py-3 px-4 text-emerald-600 font-bold" style={{ backgroundColor: `${accentColor}08` }}>✅ Total</td>
                  <td className="py-3 px-4 text-emerald-600 font-bold">✅ Total</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-stone-900">Caja / TPV Express (/pos)</td>
                  <td className="py-3 px-4 text-emerald-600 font-bold">✅ Total</td>
                  <td className="py-3 px-4 text-emerald-600 font-bold" style={{ backgroundColor: `${accentColor}08` }}>✅ Total</td>
                  <td className="py-3 px-4 text-emerald-600 font-bold">✅ Total</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-stone-900">Servicios en Catálogo</td>
                  <td className="py-3 px-4 font-bold text-stone-900">Ilimitados</td>
                  <td className="py-3 px-4 font-bold text-stone-900" style={{ backgroundColor: `${accentColor}08` }}>Ilimitados</td>
                  <td className="py-3 px-4 font-bold text-stone-900">Ilimitados</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-stone-900">Fianza anti-plantones Stripe</td>
                  <td className="py-3 px-4 text-emerald-600 font-bold">✅ Sí</td>
                  <td className="py-3 px-4 text-emerald-600 font-bold" style={{ backgroundColor: `${accentColor}08` }}>✅ Sí</td>
                  <td className="py-3 px-4 text-emerald-600 font-bold">✅ Sí</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-stone-900">Especialistas / Personal</td>
                  <td className="py-3 px-4">1 solo usuario</td>
                  <td className="py-3 px-4 font-bold text-stone-900" style={{ backgroundColor: `${accentColor}08` }}>Hasta 4 miembros</td>
                  <td className="py-3 px-4 font-bold text-stone-900">Hasta 10 miembros</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-stone-900">Sedes físicas</td>
                  <td className="py-3 px-4">1 ubicación</td>
                  <td className="py-3 px-4 font-bold text-stone-900" style={{ backgroundColor: `${accentColor}08` }}>Hasta 2 sedes</td>
                  <td className="py-3 px-4 font-bold text-stone-900">Hasta 5 sedes</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-stone-900">Consentimientos y Firma en Tablet</td>
                  <td className="py-3 px-4 text-stone-400">🚫 Bloqueado</td>
                  <td className="py-3 px-4 font-bold text-emerald-600" style={{ backgroundColor: `${accentColor}08` }}>✍️ Incluido</td>
                  <td className="py-3 px-4 font-bold text-emerald-600">✍️ Incluido</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-stone-900">Bonos de Sesiones (/vouchers)</td>
                  <td className="py-3 px-4 text-stone-400">🚫 Bloqueado</td>
                  <td className="py-3 px-4 font-bold text-emerald-600" style={{ backgroundColor: `${accentColor}08` }}>🎟️ Incluido</td>
                  <td className="py-3 px-4 font-bold text-emerald-600">🎟️ Incluido</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-stone-900">Facturas Oficiales con IVA (/invoices)</td>
                  <td className="py-3 px-4 text-stone-400">🚫 Solo ticket caja</td>
                  <td className="py-3 px-4 font-bold text-emerald-600" style={{ backgroundColor: `${accentColor}08` }}>📄 Incluido (PDF)</td>
                  <td className="py-3 px-4 font-bold text-emerald-600">📄 Incluido (PDF)</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-stone-900">AI Webmaster Copilot (/ai-webmaster)</td>
                  <td className="py-3 px-4 text-stone-400">🚫 Desactivado</td>
                  <td className="py-3 px-4 text-stone-400" style={{ backgroundColor: `${accentColor}08` }}>🚫 Desactivado</td>
                  <td className="py-3 px-4 font-bold text-emerald-600">🧠 Incluido (Texto, Voz, Fotos)</td>
                </tr>
              </tbody>
            </table>
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

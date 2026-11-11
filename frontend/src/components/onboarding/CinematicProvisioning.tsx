"use client"

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  Layers, 
  Globe, 
  Cpu,
  Loader2,
  LucideIcon
} from 'lucide-react';

interface CinematicProvisioningProps {
  clinicName: string;
  selectedSector: string;
  onComplete: () => void;
}

interface StepLog {
  title: string;
  detail: string;
  icon: LucideIcon;
  status: 'pending' | 'active' | 'done';
}

export const CinematicProvisioning: React.FC<CinematicProvisioningProps> = ({
  clinicName,
  selectedSector,
  onComplete
}) => {
  const [progress, setProgress] = useState(12);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  const steps: Omit<StepLog, 'status'>[] = [
    {
      title: "Arquitectura Multi-Tenant & Seguridad RLS",
      detail: "Bases de datos aisladas con cifrado de grado médico y políticas Row-Level Security activas.",
      icon: ShieldCheck
    },
    {
      title: "Topología Operativa & Motor de Recursos",
      detail: "Configurando algoritmos de prevención de colisiones para cabinas, salas y especialistas.",
      icon: Layers
    },
    {
      title: `Catálogo de Alta Gama: ${selectedSector}`,
      detail: "Inyectando tratamientos preconfigurados y activando reglas de reserva online para tus clientes.",
      icon: Sparkles
    },
    {
      title: "Despliegue de Red Privada & DNS Cloud",
      detail: "Sincronizando portal web seguro con certificados SSL TLS 256-Bit.",
      icon: Globe
    },
    {
      title: "¡Entorno Cloud Listo para Operar!",
      detail: `Tu clínica "${clinicName}" está inicializada al 100%. Abriendo sesión...`,
      icon: CheckCircle2
    }
  ];

  // Simulación cinemática fluida con progreso hiper-tecnológico en tema Quiet Luxury Light (2.6s totales)
  useEffect(() => {
    const stepDuration = 520; // 520ms por etapa
    const interval = setInterval(() => {
      setCurrentStepIdx(prev => {
        const next = prev + 1;
        if (next >= steps.length) {
          clearInterval(interval);
          setProgress(100);
          setTimeout(() => {
            onComplete();
          }, 600);
          return steps.length - 1;
        }
        setProgress(Math.round(((next + 1) / steps.length) * 100));
        return next;
      });
    }, stepDuration);

    return () => clearInterval(interval);
  }, [steps.length, onComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-[#FAF9F5] flex flex-col items-center justify-center p-6 text-stone-900 font-sans select-none overflow-hidden">
      
      {/* 1. Fondo de Halos Ambientales Dorados Suaves & Micropuntos (Quiet Luxury 2026 Light) */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-b from-[#d4af37]/15 via-amber-100/40 to-transparent rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />

      {/* 2. Tarjeta Central Quiet Luxury */}
      <div className="relative w-full max-w-xl bg-white/95 backdrop-blur-2xl border border-stone-200/80 rounded-[2.5rem] p-8 md:p-10 shadow-[0_20px_60px_rgba(28,25,23,0.06)] flex flex-col items-center text-center ring-1 ring-[#d4af37]/25 z-10">
        
        {/* Core Glowing Reactor / Orbe Cuántico Claro */}
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#d4af37]/15 via-amber-50 to-[#d4af37]/25 flex items-center justify-center border border-[#d4af37]/35 shadow-[0_8px_30px_rgba(212,175,55,0.18)] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#d4af37]/15 to-transparent animate-pulse" />
            {progress === 100 ? (
              <CheckCircle2 className="w-9 h-9 text-[#d4af37] animate-in zoom-in-75 duration-300" />
            ) : (
              <Cpu className="w-8 h-8 text-[#d4af37] animate-spin" style={{ animationDuration: '4s' }} />
            )}
          </div>
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-[#1c1917] text-[#d4af37] border border-[#d4af37]/30 text-[9px] font-black uppercase tracking-wider shadow-sm">
            PROBOOKIA AI
          </span>
        </div>

        {/* Título & Identificador */}
        <h2 className="text-2xl md:text-3xl font-serif font-bold text-stone-900 tracking-tight mb-1.5">
          Aprovisionando tu Entorno Cloud
        </h2>
        <p className="text-xs text-stone-500 font-medium max-w-sm mb-6 leading-relaxed">
          Inicializando la infraestructura tecnológica y motores de gestión para <span className="text-stone-900 font-bold">{clinicName}</span>.
        </p>

        {/* Barra de Progreso Dorada Satinada */}
        <div className="w-full space-y-2 mb-8">
          <div className="flex items-center justify-between text-xs font-mono font-bold">
            <span className="text-stone-500 flex items-center gap-1.5 text-[10px] uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[#d4af37] animate-ping" /> Despliegue en curso
            </span>
            <span className="text-[#b38f26] text-sm tracking-tight">{progress}%</span>
          </div>

          <div className="w-full h-2 rounded-full bg-stone-100 border border-stone-200/80 overflow-hidden p-0.5">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-[#d4af37] via-amber-400 to-[#d4af37] transition-all duration-300 ease-out shadow-[0_0_10px_rgba(212,175,55,0.35)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Terminal Log de Etapas Tecnológicas (Light Theme) */}
        <div className="w-full space-y-2.5 text-left">
          {steps.map((step, idx) => {
            const isCompleted = idx < currentStepIdx;
            const isCurrent = idx === currentStepIdx;
            const IconComp = step.icon;

            return (
              <div
                key={idx}
                className={`p-3 rounded-2xl border transition-all duration-300 flex items-start gap-3.5 ${
                  isCurrent
                    ? 'bg-amber-50/80 border-[#d4af37] shadow-[0_4px_20px_rgba(212,175,55,0.1)]'
                    : isCompleted
                    ? 'bg-stone-50/90 border-stone-200/80 text-stone-700'
                    : 'bg-stone-50/30 border-stone-200/40 text-stone-400 opacity-50'
                }`}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border ${
                  isCompleted 
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200/80' 
                    : isCurrent 
                    ? 'bg-[#d4af37]/15 text-[#9e7f1e] border border-[#d4af37]/35 shadow-inner' 
                    : 'bg-stone-100 border-stone-200 text-stone-400'
                }`}>
                  {isCompleted ? (
                    <CheckCircle2 size={14} />
                  ) : isCurrent ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <IconComp size={14} />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className={`text-xs leading-none ${
                      isCurrent 
                        ? 'font-bold text-stone-950' 
                        : isCompleted 
                        ? 'font-semibold text-stone-800' 
                        : 'font-medium text-stone-400'
                    }`}>
                      {step.title}
                    </h4>
                    <span className="text-[9px] font-mono uppercase tracking-wider font-bold">
                      {isCompleted ? (
                        <span className="text-emerald-600">✓ Listo</span>
                      ) : isCurrent ? (
                        <span className="text-[#9e7f1e] animate-pulse">En proceso</span>
                      ) : (
                        <span className="text-stone-400">Pendiente</span>
                      )}
                    </span>
                  </div>
                  <p className={`text-[10px] mt-1 leading-relaxed line-clamp-1 ${
                    isCurrent 
                      ? 'text-stone-600' 
                      : isCompleted 
                      ? 'text-stone-500' 
                      : 'text-stone-400'
                  }`}>
                    {step.detail}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Cifrado de Confianza */}
        <div className="mt-7 flex items-center gap-3 text-[10px] text-stone-400 font-bold tracking-widest uppercase border-t border-stone-100 pt-4 w-full justify-center">
          <span className="flex items-center gap-1 text-stone-600">
            <ShieldCheck size={12} className="text-[#d4af37]" /> Cifrado TLS 256-Bit
          </span>
          <span>·</span>
          <span>Bases de Datos Aisladas</span>
          <span>·</span>
          <span>Multi-Tenant RLS</span>
        </div>

      </div>

    </div>
  );
};

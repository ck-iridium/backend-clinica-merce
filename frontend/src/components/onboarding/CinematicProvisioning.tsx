"use client"

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  Server, 
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

  // Simulación cinemática fluida con progreso hiper-tecnológico (2.6 segundos totales)
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
    <div className="fixed inset-0 z-50 bg-[#090807] flex flex-col items-center justify-center p-6 text-white font-sans select-none overflow-hidden">
      
      {/* 1. Fondo de Partículas & Halos Ambientales Dorados (Aceternity UI Style) */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-b from-[#d4af37]/15 via-amber-600/5 to-transparent rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-stone-900/60 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

      {/* 2. Tarjeta Central Futurista */}
      <div className="relative w-full max-w-xl bg-stone-950/80 backdrop-blur-2xl border border-stone-800/90 rounded-[2.5rem] p-8 md:p-10 shadow-[0_25px_80px_rgba(0,0,0,0.8)] flex flex-col items-center text-center ring-1 ring-[#d4af37]/20 z-10">
        
        {/* Core Glowing Reactor / Orbe Cuántico */}
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#d4af37]/30 via-stone-900 to-[#d4af37]/20 flex items-center justify-center border border-[#d4af37]/40 shadow-[0_0_40px_rgba(212,175,55,0.25)] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#d4af37]/20 to-transparent animate-pulse" />
            {progress === 100 ? (
              <CheckCircle2 className="w-9 h-9 text-[#d4af37] animate-in zoom-in-75 duration-300" />
            ) : (
              <Cpu className="w-8 h-8 text-[#d4af37] animate-spin" style={{ animationDuration: '4s' }} />
            )}
          </div>
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-[#d4af37] text-stone-950 text-[9px] font-black uppercase tracking-wider shadow-sm">
            PROBOOKIA AI
          </span>
        </div>

        {/* Título & Identificador */}
        <h2 className="text-2xl font-serif font-bold text-white tracking-tight mb-1">
          Aprovisionando tu Entorno Cloud
        </h2>
        <p className="text-xs text-stone-400 font-medium max-w-sm mb-6 leading-relaxed">
          Inicializando la infraestructura tecnológica y motores de gestión para <span className="text-[#e6c86e] font-bold">{clinicName}</span>.
        </p>

        {/* Barra de Progreso Dorada Satinada */}
        <div className="w-full space-y-2 mb-8">
          <div className="flex items-center justify-between text-xs font-mono font-bold">
            <span className="text-stone-400 flex items-center gap-1.5 text-[10px] uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[#d4af37] animate-ping" /> Despliegue en curso
            </span>
            <span className="text-[#e6c86e] text-sm tracking-tight">{progress}%</span>
          </div>

          <div className="w-full h-2 rounded-full bg-stone-900 border border-stone-800 overflow-hidden p-0.5">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-[#d4af37] via-amber-300 to-[#d4af37] transition-all duration-300 ease-out shadow-[0_0_12px_rgba(212,175,55,0.6)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Terminal Log de Etapas Tecnológicas */}
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
                    ? 'bg-stone-900/90 border-[#d4af37]/60 shadow-[0_4px_20px_rgba(212,175,55,0.08)]'
                    : isCompleted
                    ? 'bg-stone-900/40 border-stone-800/80 text-stone-400'
                    : 'bg-transparent border-transparent text-stone-600 opacity-40'
                }`}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border ${
                  isCompleted 
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                    : isCurrent 
                    ? 'bg-[#d4af37]/20 text-[#d4af37] border-[#d4af37]/40 shadow-inner' 
                    : 'bg-stone-900 border-stone-800 text-stone-600'
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
                    <h4 className={`text-xs font-bold leading-none ${
                      isCurrent ? 'text-white' : isCompleted ? 'text-stone-300' : 'text-stone-600'
                    }`}>
                      {step.title}
                    </h4>
                    <span className="text-[9px] font-mono uppercase tracking-wider font-bold">
                      {isCompleted ? (
                        <span className="text-emerald-400">✓ Listo</span>
                      ) : isCurrent ? (
                        <span className="text-[#d4af37] animate-pulse">En proceso</span>
                      ) : (
                        <span className="text-stone-600">Pendiente</span>
                      )}
                    </span>
                  </div>
                  <p className="text-[10px] text-stone-400 mt-1 leading-relaxed line-clamp-1">
                    {step.detail}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Cifrado de Confianza */}
        <div className="mt-7 flex items-center gap-3 text-[10px] text-stone-500 font-bold tracking-widest uppercase border-t border-stone-800/60 pt-4 w-full justify-center">
          <span className="flex items-center gap-1 text-stone-400">
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

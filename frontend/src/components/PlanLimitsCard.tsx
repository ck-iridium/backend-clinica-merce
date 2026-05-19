"use client"

import { useState, useEffect } from 'react';
import { ShieldCheck, Info } from 'lucide-react';

interface LimitsData {
  plan_type: string;
  limits: {
    specialists: number;
    services: number;
  };
  usage: {
    specialists: number;
    services: number;
  };
}

interface PlanLimitsCardProps {
  type: 'services' | 'specialists';
}

export default function PlanLimitsCard({ type }: PlanLimitsCardProps) {
  const [data, setData] = useState<LimitsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLimits() {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const res = await fetch(`${API_URL}/settings/limits`);
        if (res.ok) {
          const limitsData = await res.json();
          setData(limitsData);
        }
      } catch (err) {
        console.error("Error al obtener límites de plan:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchLimits();
  }, []);

  if (loading) {
    return (
      <div className="h-10 w-48 bg-stone-100 animate-pulse rounded-lg" />
    );
  }

  if (!data) return null;

  const planType = data.plan_type.toUpperCase();
  const usage = type === 'services' ? data.usage.services : data.usage.specialists;
  const limit = type === 'services' ? data.limits.services : data.limits.specialists;
  
  const isUnlimited = limit >= 999999;
  const percentage = isUnlimited ? 0 : Math.min(100, (usage / limit) * 100);

  return (
    <div className="flex items-center gap-4 bg-stone-50 border border-stone-200/40 px-4 py-2.5 rounded-2xl text-xs transition-all duration-300 hover:shadow-luxury">
      <div className="flex items-center gap-1.5">
        <span className="font-serif font-black text-stone-900 tracking-wide uppercase text-[10px]">
          Plan {planType}
        </span>
        <span className="text-stone-300 font-sans">|</span>
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex justify-between items-center gap-3">
          <span className="text-[10px] text-stone-500 font-sans font-bold uppercase tracking-wider">
            {type === 'services' ? 'Servicios' : 'Especialistas'}: {usage} / {isUnlimited ? '∞' : limit}
          </span>
        </div>
        {!isUnlimited && (
          <div className="w-28 h-1.5 bg-stone-200/60 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                percentage >= 100 
                  ? 'bg-red-500' 
                  : percentage >= 80 
                  ? 'bg-amber-500' 
                  : 'bg-[#d4af37]'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        )}
      </div>

      {percentage >= 100 && (
        <div className="flex items-center gap-1 text-red-500 font-bold text-[9px] uppercase tracking-wider pl-1">
          <Info size={11} strokeWidth={2.5} />
          Límite Alcanzado
        </div>
      )}

      {isUnlimited && (
        <div className="flex items-center gap-1 text-[#d4af37] font-bold text-[9px] uppercase tracking-wider pl-1">
          <ShieldCheck size={11} strokeWidth={2.5} />
          Ilimitado
        </div>
      )}
    </div>
  );
}

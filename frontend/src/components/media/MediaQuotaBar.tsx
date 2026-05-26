'use client';

import { type Quota, formatBytes } from '@/lib/mediaTypes';

interface MediaQuotaBarProps {
  quota: Quota;
  usedPercent: number;
  isNearLimit: boolean;
}

export default function MediaQuotaBar({ quota, usedPercent, isNearLimit }: MediaQuotaBarProps) {
  return (
    <div className={`mb-8 p-6 rounded-[2rem] border ${isNearLimit ? 'bg-red-50 border-red-200' : 'bg-white border-stone-100'} shadow-sm`}>
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-stone-400 mb-1">Cuota del Bucket</p>
          <p className={`text-2xl font-black ${isNearLimit ? 'text-red-600' : 'text-stone-800'}`}>
            {formatBytes(quota.used_bytes)}
            <span className="text-sm font-medium text-stone-400 ml-2">/ 1 GB</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-stone-500">{quota.file_count} archivos</p>
          <p className={`text-sm font-bold ${isNearLimit ? 'text-red-500' : 'text-stone-400'}`}>{usedPercent.toFixed(1)}% utilizado</p>
        </div>
      </div>
      <div className="w-full bg-stone-100 rounded-full h-3 overflow-hidden">
        <div
          className={`h-3 rounded-full transition-all duration-700 ${isNearLimit ? 'bg-gradient-to-r from-orange-400 to-red-500' : 'bg-gradient-to-r from-primary to-[#d4af37]'}`}
          style={{ width: `${usedPercent}%` }}
        />
      </div>
      {isNearLimit && <p className="text-xs font-bold text-red-500 mt-2">⚠️ Atención: estás usando más del 80% de la cuota disponible.</p>}
    </div>
  );
}

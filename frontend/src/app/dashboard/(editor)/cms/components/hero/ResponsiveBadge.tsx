"use client";
import React from 'react';
import { Monitor, Tablet, Smartphone, RotateCcw } from 'lucide-react';
import { DeviceType } from './types';

interface ResponsiveBadgeProps {
  field: string;
  device: DeviceType;
  isOverridden: boolean;
  hasTabletConfig?: boolean;
  hasMobileConfig?: boolean;
  onDeviceChange?: (device: DeviceType) => void;
  onReset: (field: string) => void;
}

export default function ResponsiveBadge({
  field,
  device,
  isOverridden,
  hasTabletConfig,
  hasMobileConfig,
  onDeviceChange,
  onReset
}: ResponsiveBadgeProps) {
  return (
    <div className="flex items-center gap-1.5 ml-auto">
      <div className="inline-flex items-center bg-stone-100 dark:bg-stone-800 p-0.5 rounded-lg border border-stone-200/60 dark:border-stone-700/60">
        <button
          type="button"
          onClick={() => onDeviceChange?.('desktop')}
          className={`p-1 rounded-md transition-all ${
            device === 'desktop'
              ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs'
              : 'text-stone-400 hover:text-stone-700'
          }`}
          title="Escritorio (Desktop)"
        >
          <Monitor size={11} className={device === 'desktop' ? 'text-[#d4af37]' : ''} />
        </button>
        <button
          type="button"
          onClick={() => onDeviceChange?.('tablet')}
          className={`p-1 rounded-md transition-all ${
            device === 'tablet'
              ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs'
              : 'text-stone-400 hover:text-stone-700'
          }`}
          title="Tablet (768px)"
        >
          <Tablet size={11} className={device === 'tablet' ? 'text-[#d4af37]' : ''} />
        </button>
        <button
          type="button"
          onClick={() => onDeviceChange?.('mobile')}
          className={`p-1 rounded-md transition-all ${
            device === 'mobile'
              ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs'
              : 'text-stone-400 hover:text-stone-700'
          }`}
          title="Móvil (390px)"
        >
          <Smartphone size={11} className={device === 'mobile' ? 'text-[#d4af37]' : ''} />
        </button>
      </div>

      {device !== 'desktop' && isOverridden && (
        <button
          type="button"
          onClick={() => onReset(field)}
          className="flex items-center gap-1 text-[9px] font-bold text-stone-400 hover:text-red-500 bg-stone-100 hover:bg-red-50 dark:bg-stone-800 px-1.5 py-0.5 rounded-md transition-all"
          title="Restablecer a heredar de Escritorio"
        >
          <RotateCcw size={9} />
          <span>Reset</span>
        </button>
      )}
    </div>
  );
}

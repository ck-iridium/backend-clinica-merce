"use client";

import React from 'react';
import { ShowcaseSector } from '../types';

interface SectorDeleteModalProps {
  sector: ShowcaseSector;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function SectorDeleteModal({
  sector,
  onCancel,
  onConfirm
}: SectorDeleteModalProps) {
  return (
    <div className="p-6 border-t border-stone-100 bg-red-50/30 animate-in slide-in-from-bottom duration-300 shrink-0 font-sans">
      <span className="text-[9px] font-black text-red-600 uppercase tracking-widest block mb-1">
        Confirmar Eliminación
      </span>
      <p className="text-xs font-medium text-stone-600 leading-relaxed mb-4">
        ¿Deseas eliminar permanentemente el sector <strong className="text-stone-950 font-bold">"{sector.title}"</strong> del Showcase 3D?
      </p>
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="py-2 bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-bold rounded-lg transition-colors active:scale-95"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors active:scale-95 shadow-sm"
        >
          Eliminar
        </button>
      </div>
    </div>
  );
}


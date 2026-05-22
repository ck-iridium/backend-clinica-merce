"use client";

import React from 'react';
import { Globe, Loader2, ShieldCheck } from 'lucide-react';

interface SaaSGlobalSettingsProps {
  saasSettings: {
    allow_search_engine_indexing: boolean;
  } | null;
  loadingSettings: boolean;
  savingSettings: boolean;
  onToggleIndexing: () => Promise<void>;
}

export default function SaaSGlobalSettings({
  saasSettings,
  loadingSettings,
  savingSettings,
  onToggleIndexing,
}: SaaSGlobalSettingsProps) {
  return (
    <div className="flex-1 p-6 md:p-12 overflow-y-auto space-y-8 max-w-xl w-full animate-in fade-in duration-300">
      {/* Bento Card: Indexación de Motores de Búsqueda */}
      <div className="bg-white rounded-3xl md:rounded-[2.5rem] border border-stone-100 p-6 md:p-10 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#d4af37]"></div>
        
        <div className="flex items-center gap-4 mb-6 pb-5 border-b border-stone-100">
          <span className="w-12 h-12 rounded-2xl bg-[#fcf8e5] text-[#b08e23] flex items-center justify-center">
            <Globe className="w-6 h-6" />
          </span>
          <div>
            <h3 className="text-2xl font-serif font-semibold text-stone-800">Indexación en Buscadores</h3>
            <span className="text-[10px] text-stone-400 font-medium uppercase tracking-widest block mt-0.5">Control de Visibilidad de Landing Page y App SaaS</span>
          </div>
        </div>

        {loadingSettings ? (
          <div className="flex flex-col justify-center items-center py-12 gap-3">
            <Loader2 className="w-8 h-8 text-[#d4af37] animate-spin" />
            <span className="text-sm text-stone-400 font-medium font-sans">Cargando configuración...</span>
          </div>
        ) : saasSettings ? (
          <div className="space-y-6">
            <div className="p-6 bg-stone-50 rounded-[2rem] border border-stone-100 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-stone-400 shrink-0 shadow-sm">
                <ShieldCheck size={20} strokeWidth={1.5} />
              </div>
              <div>
                <h4 className="font-serif font-bold text-stone-800">Visibilidad del SaaS Global</h4>
                <p className="text-sm text-stone-500 mt-1 leading-relaxed">
                  Controla si la landing page corporativa de <strong>Probookia (www.probookia.com)</strong> y sus páginas de marketing son indexables en Google. Si desactivas esta opción, se agregará la directiva <code>noindex, nofollow</code> al sitio global, previniendo su aparición pública en buscadores.
                </p>
              </div>
            </div>

            {/* Toggle Interruptor Premium */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white rounded-[2rem] border border-stone-100 shadow-sm">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-stone-900">
                  {saasSettings.allow_search_engine_indexing ? 'Indexación Global Activada' : 'Indexación Global Desactivada'}
                </span>
                <span className="text-[10px] text-stone-400 font-medium uppercase tracking-wider mt-0.5">
                  {saasSettings.allow_search_engine_indexing 
                    ? 'El SaaS corporativo y la landing serán rastreados por motores de búsqueda.' 
                    : 'Rastreo bloqueado temporalmente (Modo Lanzamiento / Privado).'}
                </span>
              </div>

              <label className="flex items-center gap-4 cursor-pointer self-start sm:self-auto">
                <div className="relative">
                  <input 
                    type="checkbox" 
                    checked={saasSettings.allow_search_engine_indexing} 
                    onChange={onToggleIndexing}
                    disabled={savingSettings}
                    className="sr-only" 
                  />
                  <div className={`block w-14 h-8 rounded-full transition-colors ${saasSettings.allow_search_engine_indexing ? 'bg-[#d4af37]' : 'bg-stone-200'} ${savingSettings ? 'opacity-50' : ''}`}></div>
                  <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${saasSettings.allow_search_engine_indexing ? 'translate-x-6' : ''} shadow-sm`}></div>
                </div>
              </label>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-stone-500">
            No se pudo cargar la configuración de los ajustes globales.
          </div>
        )}
      </div>
    </div>
  );
}

"use client"
import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";

interface NavigationEditorTabProps {
  navigationItems: any[];
  loadingNav: boolean;
  onMoveNavItem: (index: number, direction: 'up' | 'down') => void;
  onUpdateNavItemLabel: (index: number, value: string) => void;
  onToggleNavItemVisibility: (index: number) => void;
}

export default function NavigationEditorTab({
  navigationItems,
  loadingNav,
  onMoveNavItem,
  onUpdateNavItemLabel,
  onToggleNavItemVisibility
}: NavigationEditorTabProps) {
  return (
    <div className="space-y-4">
      <p className="text-xs text-stone-400 font-medium mb-2 leading-relaxed">
        Ordena y renombra los elementos. Puedes ocultar apartados haciendo clic en el icono del ojo.
      </p>
      
      {loadingNav ? (
        <div className="space-y-4 pt-4">
          <Skeleton className="h-14 w-full rounded-2xl" />
          <Skeleton className="h-14 w-full rounded-2xl" />
          <Skeleton className="h-14 w-full rounded-2xl" />
        </div>
      ) : (
        <div className="space-y-3">
          {navigationItems.map((item, index) => (
            <div 
              key={item.id} 
              className={`flex items-center gap-3 bg-white p-4 rounded-2xl border transition-all duration-300 ${
                item.is_visible 
                  ? 'border-stone-100 shadow-[0_4px_12px_rgba(0,0,0,0.01)]' 
                  : 'border-stone-100 opacity-60 bg-stone-50/50'
              }`}
            >
              {/* Flechas de ordenamiento */}
              <div className="flex flex-col gap-1 shrink-0">
                <button 
                  onClick={() => onMoveNavItem(index, 'up')}
                  disabled={index === 0}
                  className="text-stone-300 hover:text-stone-600 disabled:opacity-20 p-0.5 rounded transition-all"
                  title="Subir"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                  </svg>
                </button>
                <button 
                  onClick={() => onMoveNavItem(index, 'down')}
                  disabled={index === navigationItems.length - 1}
                  className="text-stone-300 hover:text-stone-600 disabled:opacity-20 p-0.5 rounded transition-all"
                  title="Bajar"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
              </div>

              {/* Label Editable */}
              <div className="flex-1 min-w-0">
                <input 
                  type="text" 
                  value={item.label}
                  onChange={(e) => onUpdateNavItemLabel(index, e.target.value)}
                  className="w-full bg-transparent border-b border-transparent hover:border-stone-200 focus:border-[#d4af37] focus:outline-none py-1 text-sm text-stone-800 font-bold tracking-tight"
                />
                <span className="text-[10px] text-stone-400 font-bold block">
                  Ruta: <code className="bg-stone-50 px-1.5 py-0.5 rounded font-mono text-[9px]">{item.path}</code>
                </span>
              </div>

              {/* Ojo de Visibilidad */}
              <button 
                onClick={() => onToggleNavItemVisibility(index)}
                className={`p-2 rounded-xl transition-all border shrink-0 ${
                  item.is_visible 
                    ? 'text-[#d4af37] bg-amber-50/50 border-amber-100 hover:bg-amber-50' 
                    : 'text-stone-400 bg-stone-50 border-stone-200 hover:bg-stone-100'
                }`}
                title={item.is_visible ? "Ocultar en web pública" : "Mostrar en web pública"}
              >
                {item.is_visible ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

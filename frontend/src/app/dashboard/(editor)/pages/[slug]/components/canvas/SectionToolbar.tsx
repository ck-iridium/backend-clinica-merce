import React, { useState, useRef, useEffect } from 'react';
import type { SectionBlock } from '../../types';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';

interface SectionToolbarProps {
  section: SectionBlock;
  index: number;
  totalSections: number;
  columnsCount: number;
  onReorder: (i: number, dir: 'up' | 'down') => void;
  onDelete: (id: string) => void;
  onUpdateLayout: (id: string, cols: number) => void;
  onUpdateSectionMetadata: (id: string, key: string, value: any) => void;
}

export function SectionToolbar({
  section,
  index,
  totalSections,
  columnsCount,
  onReorder,
  onDelete,
  onUpdateLayout,
  onUpdateSectionMetadata,
}: SectionToolbarProps) {
  const [showGearPopover, setShowGearPopover] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const gearButtonRef = useRef<HTMLButtonElement>(null);
  const struct = section.content_data;
  const hasHero = (struct.columns || []).some((col: any) =>
    (col.blocks || []).some((b: any) => b.block_type === 'hero')
  );
  const defaultTop = hasHero ? 'none' : 'md';
  const defaultBottom = hasHero ? 'none' : 'md';

  // Cierre automático al hacer click fuera del popover de ajustes
  useEffect(() => {
    if (!showGearPopover) return;
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        popoverRef.current &&
        !popoverRef.current.contains(target) &&
        gearButtonRef.current &&
        !gearButtonRef.current.contains(target)
      ) {
        setShowGearPopover(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showGearPopover]);

  const isCustomColor = struct.bg_color?.startsWith('#');

  return (
    <div 
      className={`absolute top-3 left-6 z-40 select-none transition-all duration-200 ${
        showGearPopover 
          ? 'opacity-100 scale-100 pointer-events-auto' 
          : 'opacity-0 scale-95 pointer-events-none group-hover/section:opacity-100 group-hover/section:scale-100 group-hover/section:pointer-events-auto'
      }`}
    >
      <TooltipProvider delayDuration={120}>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-stone-900/95 backdrop-blur-md text-white rounded-2xl shadow-xl border border-stone-700/60 text-xs">
          {/* Flechas reordenado */}
          <div className="flex gap-0.5 items-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => onReorder(index, 'up')}
                  disabled={index === 0}
                  className="p-1 text-stone-400 hover:text-white disabled:opacity-20 rounded-md hover:bg-stone-800 transition-all"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                  </svg>
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">Subir sección</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => onReorder(index, 'down')}
                  disabled={index === totalSections - 1}
                  className="p-1 text-stone-400 hover:text-white disabled:opacity-20 rounded-md hover:bg-stone-800 transition-all"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">Bajar sección</TooltipContent>
            </Tooltip>
          </div>

          <div className="w-px h-3.5 bg-stone-700 mx-0.5" />

          <span className="text-[10px] font-black uppercase tracking-wider text-[#d4af37]">
            Sección {index + 1}
          </span>

          <div className="w-px h-3.5 bg-stone-700 mx-0.5" />

          {/* Selector columnas */}
          <div className="flex items-center gap-1">
            <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider mr-0.5">Cols:</span>
            {[1, 2, 3, 4].map(n => (
              <button
                key={n}
                onClick={() => onUpdateLayout(section.id, n)}
                className={`w-5 h-5 rounded text-[10px] font-black transition-all ${
                  columnsCount === n
                    ? 'bg-[#d4af37] text-stone-950 font-bold shadow-xs'
                    : 'text-stone-300 hover:text-white hover:bg-stone-800'
                }`}
              >
                {n}
              </button>
            ))}
          </div>

          <div className="w-px h-3.5 bg-stone-700 mx-0.5" />

          {/* Ajustes avanzados de sección (Icono engranaje) */}
          <div className="relative">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  ref={gearButtonRef}
                  type="button"
                  onClick={() => setShowGearPopover(prev => !prev)}
                  className={`p-1.5 rounded-lg transition-all ${
                    showGearPopover 
                      ? 'bg-[#d4af37] text-stone-950 shadow-xs' 
                      : 'text-stone-300 hover:text-white hover:bg-stone-800'
                  }`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.43l-1.003.828c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.99l1.005.831a1.125 1.125 0 01.26 1.43l-1.297 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.43l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.831a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.645-.869l.214-1.28z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">Ajustes de sección</TooltipContent>
            </Tooltip>
          
          {showGearPopover && (
            <div
              ref={popoverRef}
              className="absolute left-0 top-full mt-2 bg-white border border-stone-200/90 rounded-2xl shadow-2xl p-4 z-50 min-w-[290px] flex flex-col gap-3.5 text-stone-800 animate-in fade-in zoom-in-95 duration-200"
            >
              {/* Encabezado del Popover */}
              <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#d4af37]">
                  Ajustes de Sección
                </span>
                <button
                  type="button"
                  onClick={() => setShowGearPopover(false)}
                  className="text-stone-400 hover:text-stone-700 text-xs font-bold p-0.5 rounded"
                  title="Cerrar ajustes"
                >
                  ✕
                </button>
              </div>

              {/* Alineación Horizontal */}
              <div>
                <span className="text-[9px] font-black uppercase tracking-wider text-stone-500 block mb-1.5">
                  Alineación Horizontal
                </span>
                <div className="grid grid-cols-4 gap-1">
                  {[
                    { value: 'justify-start', label: 'Izq' },
                    { value: 'justify-center', label: 'Centro' },
                    { value: 'justify-end', label: 'Dcha' },
                    { value: 'justify-between', label: 'Sep.' }
                  ].map(opt => {
                    const isSel = (struct.horizontal_alignment || 'justify-start') === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => onUpdateSectionMetadata(section.id, 'horizontal_alignment', opt.value)}
                        className={`py-1.5 px-1.5 rounded-lg text-[10px] font-bold transition-all border text-center ${
                          isSel
                            ? 'bg-stone-900 border-stone-900 text-white shadow-sm'
                            : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Alineación Vertical */}
              <div>
                <span className="text-[9px] font-black uppercase tracking-wider text-stone-500 block mb-1.5">
                  Alineación Vertical
                </span>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { value: 'items-start', label: 'Arriba' },
                    { value: 'items-center', label: 'Centro' },
                    { value: 'items-end', label: 'Abajo' }
                  ].map(opt => {
                    const isSel = (struct.vertical_alignment || 'items-start') === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => onUpdateSectionMetadata(section.id, 'vertical_alignment', opt.value)}
                        className={`py-1.5 px-2 rounded-lg text-[10px] font-bold transition-all border text-center ${
                          isSel
                            ? 'bg-stone-900 border-stone-900 text-white shadow-sm'
                            : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Ancho de Contenedor */}
              <div>
                <span className="text-[9px] font-black uppercase tracking-wider text-stone-500 block mb-1.5">
                  Ancho de Contenedor
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { value: 'boxed', label: 'Centrado (Boxed)' },
                    { value: 'fullwidth', label: 'Ancho Total' }
                  ].map(opt => {
                    const isSel = (struct.content_width || 'boxed') === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => onUpdateSectionMetadata(section.id, 'content_width', opt.value)}
                        className={`py-1.5 px-2 rounded-lg text-[10px] font-bold transition-all border text-center ${
                          isSel
                            ? 'bg-stone-900 border-stone-900 text-white shadow-sm'
                            : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Margen Superior (Top) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[9px] font-black uppercase tracking-wider text-stone-500">
                    Margen Superior (Top)
                  </span>
                  <span className="text-[9px] font-mono text-[#d4af37] font-bold">
                    {(struct.padding_top || defaultTop).toUpperCase()}
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-1">
                  {[
                    { value: 'none', label: '0' },
                    { value: 'sm', label: 'S' },
                    { value: 'md', label: 'M' },
                    { value: 'lg', label: 'L' },
                    { value: 'xl', label: 'XL' }
                  ].map(opt => {
                    const isSel = (struct.padding_top || defaultTop) === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => onUpdateSectionMetadata(section.id, 'padding_top', opt.value)}
                        className={`py-1.5 rounded-lg text-[10px] font-bold transition-all border text-center ${
                          isSel
                            ? 'bg-stone-900 border-stone-900 text-white shadow-sm'
                            : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Margen Inferior (Bottom) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[9px] font-black uppercase tracking-wider text-stone-500">
                    Margen Inferior (Bottom)
                  </span>
                  <span className="text-[9px] font-mono text-[#d4af37] font-bold">
                    {(struct.padding_bottom || defaultBottom).toUpperCase()}
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-1">
                  {[
                    { value: 'none', label: '0' },
                    { value: 'sm', label: 'S' },
                    { value: 'md', label: 'M' },
                    { value: 'lg', label: 'L' },
                    { value: 'xl', label: 'XL' }
                  ].map(opt => {
                    const isSel = (struct.padding_bottom || defaultBottom) === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => onUpdateSectionMetadata(section.id, 'padding_bottom', opt.value)}
                        className={`py-1.5 rounded-lg text-[10px] font-bold transition-all border text-center ${
                          isSel
                            ? 'bg-stone-900 border-stone-900 text-white shadow-sm'
                            : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Color de Fondo */}
              <div>
                <span className="text-[9px] font-black uppercase tracking-wider text-stone-500 block mb-1.5">
                  Color de Fondo
                </span>
                <div className="flex items-center gap-2">
                  {[
                    { value: 'white', label: 'Blanco', colorClass: 'bg-white border-stone-300' },
                    { value: 'cream', label: 'Crema', colorClass: 'bg-[#FAFAFA] border-stone-300' },
                    { value: 'soft_gold', label: 'Oro', colorClass: 'bg-[#FAF7F0] border-amber-300' },
                    { value: 'dark', label: 'Oscuro', colorClass: 'bg-stone-900 border-stone-900' }
                  ].map(opt => {
                    const isSel = (struct.bg_color || 'cream') === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => onUpdateSectionMetadata(section.id, 'bg_color', opt.value)}
                        className={`w-7 h-7 rounded-full border-2 transition-transform ${opt.colorClass} ${
                          isSel ? 'scale-110 ring-2 ring-[#d4af37] ring-offset-2' : 'hover:scale-105'
                        }`}
                        title={opt.label}
                      />
                    );
                  })}

                  {/* Selector Hex personalizado con icono de Paleta Multicolor */}
                  <div className="relative group/picker" title="Color personalizado (abrir paleta)">
                    <button
                      type="button"
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-all shadow-xs relative overflow-hidden border ${
                        isCustomColor
                          ? 'ring-2 ring-[#d4af37] ring-offset-2 scale-110 border-white'
                          : 'border-stone-300 hover:scale-105'
                      }`}
                      style={{
                        background: isCustomColor
                          ? struct.bg_color
                          : 'conic-gradient(from 180deg at 50% 50%, #f43f5e 0deg, #fb923c 60deg, #facc15 120deg, #4ade80 180deg, #38bdf8 240deg, #818cf8 300deg, #f43f5e 360deg)',
                      }}
                    >
                      <span className="w-5 h-5 rounded-full bg-stone-900/60 backdrop-blur-[1px] flex items-center justify-center text-white">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008z" />
                        </svg>
                      </span>
                    </button>
                    <input
                      type="color"
                      value={isCustomColor ? struct.bg_color : '#ffffff'}
                      onChange={(e) => onUpdateSectionMetadata(section.id, 'bg_color', e.target.value)}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      title="Seleccionar color personalizado"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

          {/* Borrar sección */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => onDelete(section.id)}
                className="p-1 text-stone-400 hover:text-red-400 hover:bg-stone-800 rounded-md transition-all ml-1"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">Eliminar sección</TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </div>
  );
}

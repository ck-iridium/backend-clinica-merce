"use client";
import React from 'react';
import { 
  ArrowUp, 
  ArrowDown, 
  GripVertical, 
  Sparkles, 
  Layers, 
  User, 
  Megaphone, 
  Home, 
  Tag, 
  CheckCircle2, 
  EyeOff, 
  Lock 
} from 'lucide-react';

interface OrderSectionsTabProps {
  sections: any[];
  setSections: React.Dispatch<React.SetStateAction<any[]>>;
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

export default function OrderSectionsTab({
  sections = [],
  setSections,
  formData,
  setFormData
}: OrderSectionsTabProps) {

  // Obtener icono apropiado para cada tipo de sección
  const getSectionIcon = (type: string) => {
    switch (type) {
      case 'hero':
        return <Home className="w-4 h-4 text-[#d4af37]" />;
      case 'featured':
        return <Sparkles className="w-4 h-4 text-amber-500" />;
      case 'categories_catalog':
        return <Layers className="w-4 h-4 text-blue-500" />;
      case 'about':
        return <User className="w-4 h-4 text-emerald-500" />;
      case 'cta':
        return <Megaphone className="w-4 h-4 text-[#FF6B00]" />;
      case 'category':
        return <Tag className="w-4 h-4 text-stone-500" />;
      default:
        return <Layers className="w-4 h-4 text-stone-400" />;
    }
  };

  // Saber si el bloque está actualmente habilitado o visible
  const isSectionActive = (section: any) => {
    if (section.type === 'hero') return true;
    if (section.type === 'featured') return Boolean(formData?.featured_services_config?.enabled);
    if (section.type === 'categories_catalog') return Boolean(formData?.categories_catalog_config?.enabled);
    if (section.type === 'about') return true;
    if (section.type === 'cta') return true;
    if (section.type === 'category') {
      return !formData?.categories_catalog_config?.hide_individual_sections;
    }
    return true;
  };

  // Filtrar secciones reordenables (ocultamos 'seo' de la lista visual ya que es metainformación)
  const displaySections = sections.filter((s: any) => s.id !== 'seo');

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx <= 0 || targetIdx >= displaySections.length) return; // Índice 0 (Hero) está bloqueado arriba

    const updated = [...displaySections];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;

    // Mantener SEO al final si existía
    const seoSection = sections.find((s: any) => s.id === 'seo');
    const finalSections = seoSection ? [...updated, seoSection] : updated;

    setSections(finalSections);

    // Sincronizar inmediatamente con formData.home_sections_order para la preview y guardado
    const orderIds = finalSections.map((s: any) => s.id);
    setFormData((prev: any) => ({
      ...prev,
      home_sections_order: JSON.stringify(orderIds)
    }));
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <h2 className="text-lg font-serif font-bold text-stone-900 leading-tight">
          Estructura y Orden de la Home
        </h2>
        <p className="text-[10px] text-stone-400 uppercase tracking-widest font-medium mt-1">
          Organiza la jerarquía visual y qué secciones aparecen primero en tu página
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 flex items-start gap-3 leading-relaxed">
        <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block mb-0.5">Control de Jerarquía en Tiempo Real</span>
          Usa los botones de subir y bajar para alternar qué bloque se presenta primero a tus visitantes. Los cambios se reflejan inmediatamente en la vista previa a la derecha.
        </div>
      </div>

      <div id="cms-order-sections-list" className="space-y-2.5">
        {displaySections.map((section: any, idx: number) => {
          const isHero = section.type === 'hero';
          const active = isSectionActive(section);
          const canMoveUp = idx > 1; // 0 es Hero (fijo), 1 es el primer elemento móvil
          const canMoveDown = idx > 0 && idx < displaySections.length - 1;

          return (
            <div
              key={section.id}
              className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                isHero
                  ? 'bg-stone-900 text-white border-stone-850 shadow-sm'
                  : active
                  ? 'bg-white border-stone-200/80 hover:border-stone-300 shadow-xs'
                  : 'bg-stone-50/70 border-stone-100 opacity-60'
              }`}
            >
              {/* Identificador y Nombre */}
              <div className="flex items-center gap-3.5 min-w-0">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  isHero ? 'bg-white/10 text-white' : 'bg-stone-100 text-stone-700'
                }`}>
                  {getSectionIcon(section.type)}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold truncate">
                      {section.label || section.name || section.id}
                    </span>
                    {isHero && (
                      <span className="text-[9px] font-black uppercase tracking-wider bg-[#d4af37]/20 text-[#d4af37] px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" /> Fijo Portada
                      </span>
                    )}
                  </div>
                  <span className={`text-[10px] block font-medium ${
                    isHero ? 'text-white/60' : active ? 'text-stone-400' : 'text-stone-400 italic'
                  }`}>
                    {active ? (
                      <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                        <CheckCircle2 className="w-3 h-3" /> Activo en portada
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-stone-400">
                        <EyeOff className="w-3 h-3" /> Inactivo / Oculto
                      </span>
                    )}
                  </span>
                </div>
              </div>

              {/* Botones de Ordenación */}
              {!isHero ? (
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-xs font-bold text-stone-400 mr-2 font-mono">
                    #{idx}
                  </span>
                  <button
                    type="button"
                    disabled={!canMoveUp}
                    onClick={() => moveSection(idx, 'up')}
                    className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 disabled:opacity-30 disabled:pointer-events-none transition-all active:scale-95 shadow-2xs"
                    title="Subir posición"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={!canMoveDown}
                    onClick={() => moveSection(idx, 'down')}
                    className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 disabled:opacity-30 disabled:pointer-events-none transition-all active:scale-95 shadow-2xs"
                    title="Bajar posición"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <span className="text-xs font-mono font-bold text-white/50 px-3">
                  #1
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

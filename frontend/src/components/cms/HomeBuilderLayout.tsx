import React from 'react';

interface HomeBuilderLayoutProps {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  panel: React.ReactNode;
  preview: React.ReactNode;
  onSave: () => void;
  isSaving: boolean;
}

export default function HomeBuilderLayout({ tabs, activeTab, onTabChange, panel, preview, onSave, isSaving }: HomeBuilderLayoutProps) {
  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-[#FAFAFA] w-full animate-in fade-in duration-300">
      
      {/* ─── PANEL IZQUIERDO: Configuración (30% Desktop) ─────────────────────────────── */}
      <aside className="w-full md:w-[30%] md:min-w-[350px] md:max-w-[450px] h-full bg-white border-r border-stone-200 flex flex-col shadow-sm overflow-hidden shrink-0 z-20">
        
        {/* Cabecera del Panel */}
        <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="font-serif text-lg font-semibold text-stone-800 leading-tight">
                Editar Portada
              </h2>
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                CMS Visual
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onSave}
              disabled={isSaving}
              className="bg-stone-900 hover:bg-[#d4af37] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-30 shadow-sm"
            >
              {isSaving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>

        {/* Navegación por Pestañas */}
        <div className="flex px-6 pt-4 gap-4 border-b border-stone-100 shrink-0 overflow-x-auto hide-scroll">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`pb-3 text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all border-b-2 ${
                activeTab === tab
                  ? 'border-[#d4af37] text-stone-800'
                  : 'border-transparent text-stone-400 hover:text-stone-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Área de Formulario */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-stone-50/30">
          {panel}
        </div>
      </aside>

      {/* ─── PANEL DERECHO: Live Preview (Ocupa el resto) ────────────────────────────────── */}
      <div className="hidden md:block flex-1 h-full overflow-y-auto bg-stone-100/60 relative flex flex-col">
        
        {/* Barra Superior del Preview */}
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-stone-200 px-8 py-3 flex items-center gap-3 shadow-sm">
          <span className="text-xs font-black uppercase tracking-widest text-stone-500">
            Vista Previa en Vivo: Reordenamiento Estructural
          </span>
          <div className="ml-auto flex gap-1.5 items-center">
            <div className="w-2.5 h-2.5 rounded-full bg-stone-300" />
            <div className="w-2.5 h-2.5 rounded-full bg-stone-300" />
            <div className="w-2.5 h-2.5 rounded-full bg-stone-300" />
          </div>
        </div>

        {/* CONTENEDOR DEL PREVIEW (Reducido un tercio) */}
        <div className="w-2/3 bg-white min-h-full shadow-xl overflow-hidden">
          {preview}
        </div>
      </div>
    </div>
  );
}

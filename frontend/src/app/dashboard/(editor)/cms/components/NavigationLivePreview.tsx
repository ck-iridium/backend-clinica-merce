"use client"
import React from 'react';

interface NavigationLivePreviewProps {
  navTab: 'links' | 'megamenu';
  navigationItems: any[];
  categories: any[];
  services: any[];
  megamenuLayout: 'bento' | 'directory';
  megamenuCategories: string[] | null;
  previewActiveCategory: string | null;
  setPreviewActiveCategory: (id: string | null) => void;
  settings: any;
}

export default function NavigationLivePreview({
  navTab,
  navigationItems,
  categories,
  services,
  megamenuLayout,
  megamenuCategories,
  previewActiveCategory,
  setPreviewActiveCategory,
  settings
}: NavigationLivePreviewProps) {
  
  // Filtrar categorías según la lógica de tres estados
  const previewFilteredCats = categories.filter(c => 
    c.is_active && 
    (megamenuCategories === null || megamenuCategories.includes(c.id))
  );

  const activePreviewCatId = previewActiveCategory && previewFilteredCats.some(c => c.id === previewActiveCategory)
    ? previewActiveCategory
    : (previewFilteredCats[0]?.id || null);

  const previewServices = services.filter(s => s.is_active && s.category_id === activePreviewCatId);

  return (
    <div className="hidden md:flex flex-1 h-full items-center justify-center bg-stone-100/60 p-12 overflow-y-auto relative">
      
      <div className="absolute top-0 left-0 right-0 z-20 bg-white/80 backdrop-blur-md border-b border-stone-200 px-8 py-3 flex items-center gap-3 shadow-sm">
        <span className="text-xs font-black uppercase tracking-widest text-stone-500">
          Previsualización del Menú
        </span>
        <div className="ml-auto flex gap-1.5 items-center">
          <div className="w-2.5 h-2.5 rounded-full bg-stone-300" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#d4af37]/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-stone-300" />
        </div>
      </div>

      {/* Header & Megamenu Mockup */}
      <div className="w-full max-w-3xl bg-white border border-stone-200 rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.06)] animate-in zoom-in-95 duration-500">
        
        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-400 block mb-6 text-center">
          VISTA PÚBLICA EN VIVO
        </span>

        {/* Navbar Mock */}
        <div className="flex items-center justify-between border-b border-stone-100 pb-5">
          <div className="font-serif text-[#d4af37] font-bold text-lg leading-none">
            {settings?.clinic_name || 'Clínica Mercè'}
          </div>

          {/* Menu Links */}
          <div className="flex items-center gap-6">
            <span className="text-stone-400 text-xs font-bold transition-all cursor-default">
              Inicio
            </span>
            <span className={`text-xs font-bold transition-all cursor-default relative pb-5 -mb-5 ${
              navTab === 'megamenu' ? 'text-[#d4af37]' : 'text-stone-600'
            }`}>
              Servicios
              {navTab === 'megamenu' && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#d4af37] rounded-full"></span>
              )}
            </span>
            <span className="text-stone-400 text-xs font-bold transition-all cursor-default">
              Contacto
            </span>
          </div>

          <div className="bg-[#d4af37] text-white px-4 py-1.5 rounded-full text-[11px] font-bold shadow-sm cursor-default">
            Reservar
          </div>
        </div>

        {/* Megamenu Mockup (Solo si estamos en la pestaña Megamenú) */}
        {navTab === 'megamenu' && (
          <div className="mt-6 border border-stone-100 rounded-2xl p-6 bg-stone-50/50 shadow-inner animate-in fade-in duration-300">
            {previewFilteredCats.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">
                  Megamenú Desactivado
                </p>
                <p className="text-[10px] text-stone-400 max-w-xs mx-auto">
                  No has seleccionado ninguna categoría o has guardado un listado vacío. El megamenú no se renderizará.
                </p>
              </div>
            ) : megamenuLayout === 'bento' ? (
              /* --- Bento Layout Preview --- */
              <div className="grid grid-cols-3 gap-6 h-[280px]">
                {/* Left category list with simulated scroll snap */}
                <div className="col-span-1 border-r border-stone-200/60 pr-4 overflow-y-auto space-y-1 scrollbar-thin">
                  <div className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-3">
                    Tratamientos
                  </div>
                  {previewFilteredCats.map(cat => (
                    <div
                      key={cat.id}
                      onClick={() => setPreviewActiveCategory(cat.id)}
                      className={`p-2.5 rounded-xl text-left cursor-pointer transition-all ${
                        activePreviewCatId === cat.id
                          ? 'bg-white text-[#d4af37] font-bold shadow-sm'
                          : 'text-stone-500 hover:text-stone-800'
                      }`}
                    >
                      <div className="text-xs truncate">{cat.name}</div>
                    </div>
                  ))}
                </div>

                {/* Right Bento Grid mockup */}
                <div className="col-span-2 flex flex-col justify-between">
                  <div className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-3">
                    Servicios Destacados
                  </div>
                  
                  {previewServices.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center border border-dashed border-stone-200 rounded-2xl bg-white p-4">
                      <p className="text-xs text-stone-400">No hay servicios en esta categoría.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3 flex-1 overflow-y-auto scrollbar-none">
                      {/* Main Service Card (Bento Style) */}
                      {previewServices[0] && (
                        <div className="col-span-2 bg-[#1C1917] text-white p-4 rounded-2xl flex flex-col justify-between shadow-sm relative overflow-hidden group">
                          <div className="absolute right-0 top-0 w-24 h-24 bg-gradient-to-br from-[#d4af37]/20 to-transparent rounded-bl-full"></div>
                          <div>
                            <span className="text-[8px] font-bold uppercase tracking-wider text-[#d4af37] bg-[#d4af37]/10 px-2 py-0.5 rounded-full mb-1 inline-block">
                              Recomendado
                            </span>
                            <h4 className="text-sm font-serif font-bold text-stone-100 line-clamp-1">{previewServices[0].name}</h4>
                            <p className="text-[10px] text-stone-400 line-clamp-1 mt-1">{previewServices[0].description}</p>
                          </div>
                          <div className="flex justify-between items-end mt-4">
                            <span className="text-[10px] text-stone-400">{previewServices[0].duration_minutes} min</span>
                            <span className="text-xs font-bold text-[#d4af37]">{previewServices[0].price}€</span>
                          </div>
                        </div>
                      )}

                      {/* Secondary Service Cards */}
                      {previewServices.slice(1, 3).map(svc => (
                        <div key={svc.id} className="bg-white p-3 rounded-2xl border border-stone-100 flex flex-col justify-between shadow-sm hover:border-[#d4af37]/50 transition-colors">
                          <div>
                            <h5 className="text-xs font-bold text-stone-800 line-clamp-1">{svc.name}</h5>
                            <p className="text-[9px] text-stone-400 line-clamp-1 mt-0.5">{svc.description}</p>
                          </div>
                          <div className="flex justify-between items-end mt-2">
                            <span className="text-[9px] text-stone-400">{svc.duration_minutes} min</span>
                            <span className="text-xs font-bold text-[#d4af37]">{svc.price}€</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* --- Directory Layout Preview --- */
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">
                    Directorio Completo (Vila Columnas)
                  </span>
                  {/* Visual Paging Controls mock */}
                  <div className="flex gap-1">
                    <button className="w-5 h-5 rounded-full border border-stone-200 bg-white flex items-center justify-center text-xs text-stone-400 hover:text-stone-800 hover:border-stone-300">
                      ‹
                    </button>
                    <button className="w-5 h-5 rounded-full border border-stone-200 bg-white flex items-center justify-center text-xs text-stone-400 hover:text-stone-800 hover:border-stone-300">
                      ›
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6 h-[250px] overflow-hidden">
                  {previewFilteredCats.slice(0, 3).map(cat => {
                    const catServices = services.filter(s => s.is_active && s.category_id === cat.id);
                    return (
                      <div key={cat.id} className="flex flex-col bg-white p-4 rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
                        <span className="text-[10px] font-bold text-[#d4af37] uppercase tracking-wider block mb-3 border-b border-stone-50 pb-1.5 truncate">
                          {cat.name}
                        </span>
                        <div className="flex-1 overflow-y-auto space-y-2.5 scrollbar-none">
                          {catServices.length === 0 ? (
                            <p className="text-[10px] text-stone-400 italic">Sin servicios</p>
                          ) : (
                            catServices.slice(0, 4).map(svc => (
                              <div key={svc.id} className="group cursor-default">
                                <div className="text-xs font-bold text-stone-800 truncate group-hover:text-[#d4af37] transition-colors">
                                  {svc.name}
                                </div>
                                <div className="flex justify-between items-center text-[9px] text-stone-400 mt-0.5">
                                  <span>{svc.duration_minutes} min</span>
                                  <span className="font-medium text-stone-600">{svc.price}€</span>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {navTab === 'links' && (
          <div className="text-[10px] text-stone-400 text-center mt-6">
            El menú superior se actualizará en tiempo real y soportará traducciones locales de forma automática.
          </div>
        )}

      </div>
    </div>
  );
}

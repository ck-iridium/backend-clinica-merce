"use client";
import React from 'react';
import NavigationEditorTab from './NavigationEditorTab';
import MegamenuEditorTab from './MegamenuEditorTab';
import NavigationLivePreview from './NavigationLivePreview';
import { useCmsNavigation } from '../hooks/useCmsNavigation';

interface NavigationEditorViewProps {
  onBack: () => void;
  categories: any[];
  services: any[];
  settings: any;
  siteContent: any;
  onSiteContentUpdated?: (content: any) => void;
}

export default function NavigationEditorView({
  onBack,
  categories,
  services,
  settings,
  siteContent,
  onSiteContentUpdated
}: NavigationEditorViewProps) {
  const {
    navigationItems,
    loadingNav,
    savingNav,
    navTab,
    setNavTab,
    megamenuLayout,
    setMegamenuLayout,
    megamenuCategories,
    setMegamenuCategories,
    savingMegamenu,
    previewActiveCategory,
    setPreviewActiveCategory,
    handleSaveNavigation,
    handleAddNavItem,
    handleDeleteNavItem,
    moveNavItem,
    updateNavItemLabel,
    toggleNavItemVisibility,
    toggleMegamenuCategory,
    handleSaveMegamenu
  } = useCmsNavigation(siteContent?.megamenu_layout, siteContent?.megamenu_categories_json);

  const isSavingNavOrMegamenu = navTab === 'links' ? savingNav : savingMegamenu;

  const handleSaveClick = () => {
    if (navTab === 'links') {
      handleSaveNavigation();
    } else {
      handleSaveMegamenu(onSiteContentUpdated);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-[#FAFAFA] w-full animate-in fade-in duration-300">
      
      {/* ─── PANEL IZQUIERDO: Configuración (Enlaces / Megamenú) ───────────── */}
      <aside className="w-full md:w-[35%] md:min-w-[400px] md:max-w-[500px] h-full bg-white border-r border-stone-200 flex flex-col shadow-sm overflow-hidden shrink-0 z-20">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-stone-100 flex items-center gap-4 shrink-0">
          <button 
            onClick={onBack}
            className="text-stone-400 hover:text-stone-800 transition-colors p-1.5 rounded-xl hover:bg-stone-50 border border-transparent hover:border-stone-100 shrink-0"
            title="Volver al panel"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>
          <div className="flex-1 min-w-0">
            <h2 className="font-serif text-lg font-semibold text-stone-800 leading-tight">
              Navegación
            </h2>
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
              Gestor del Menú Superior
            </p>
          </div>
          <button
            onClick={handleSaveClick}
            disabled={isSavingNavOrMegamenu}
            className="bg-stone-900 hover:bg-[#d4af37] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-30 shadow-sm shrink-0"
          >
            {isSavingNavOrMegamenu ? 'Guardando...' : 'Guardar'}
          </button>
        </div>

        {/* Subheader: Pestañas */}
        <div className="flex border-b border-stone-100 px-6 bg-white shrink-0">
          <button
            onClick={() => setNavTab('links')}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider text-center border-b-2 transition-all ${
              navTab === 'links'
                ? 'border-[#d4af37] text-stone-800'
                : 'border-transparent text-stone-400 hover:text-stone-600'
            }`}
          >
            Enlaces
          </button>
          <button
            onClick={() => setNavTab('megamenu')}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider text-center border-b-2 transition-all ${
              navTab === 'megamenu'
                ? 'border-[#d4af37] text-stone-800'
                : 'border-transparent text-stone-400 hover:text-stone-600'
            }`}
          >
            Megamenú
          </button>
        </div>

        {/* Contenido según pestaña activa */}
        <div className="flex-1 overflow-y-auto p-6 bg-stone-50/20">
          {navTab === 'links' ? (
            <NavigationEditorTab
              navigationItems={navigationItems}
              loadingNav={loadingNav}
              onMoveNavItem={moveNavItem}
              onUpdateNavItemLabel={updateNavItemLabel}
              onToggleNavItemVisibility={toggleNavItemVisibility}
              onAddNavItem={handleAddNavItem}
              onDeleteNavItem={handleDeleteNavItem}
              categories={categories}
              services={services}
            />
          ) : (
            <MegamenuEditorTab
              megamenuLayout={megamenuLayout}
              setMegamenuLayout={setMegamenuLayout}
              megamenuCategories={megamenuCategories}
              setMegamenuCategories={setMegamenuCategories}
              categories={categories}
              toggleMegamenuCategory={(catId) => toggleMegamenuCategory(catId, categories)}
            />
          )}
        </div>
      </aside>

      {/* ─── PANEL DERECHO: Previsualización en Vivo ───────────────────────── */}
      <NavigationLivePreview
        navTab={navTab}
        navigationItems={navigationItems}
        categories={categories}
        services={services}
        megamenuLayout={megamenuLayout}
        megamenuCategories={megamenuCategories}
        previewActiveCategory={previewActiveCategory}
        setPreviewActiveCategory={setPreviewActiveCategory}
        settings={settings}
        siteContent={siteContent}
      />

    </div>
  );
}

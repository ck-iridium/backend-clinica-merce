"use client"
import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import MediaPickerModal from '@/components/MediaPickerModal';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  DataGridFilters,
  DataGridBulkBar,
  DataGridRow,
  DataGridSkeleton,
  useServiceMutations,
} from './datagrid';

interface ServicesDataGridProps {
  services: any[];
  categories: any[];
  loading: boolean;
  showArchived: boolean;
  enableStockControl?: boolean;
  onEditClick: (svc: any) => void;
  onRefresh?: () => void;
}

export default function ServicesDataGrid({
  services,
  categories,
  loading,
  showArchived,
  enableStockControl = true,
  onEditClick,
  onRefresh,
}: ServicesDataGridProps) {
  const { language } = useLanguage();

  // Estados locales de filtrado, selección y paginación
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [itemTypeFilter, setItemTypeFilter] = useState<'all' | 'services' | 'products' | 'low_stock'>('all');
  const [webVisibilityFilter, setWebVisibilityFilter] = useState<'all' | 'web' | 'web_only' | 'hidden'>('all');
  const [pageSize, setPageSize] = useState<15 | 25 | 50 | 'all'>(25);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Hook desacoplado de mutaciones y acciones rápidas
  const {
    updatingPrices,
    savingPriceId,
    handlePriceChange,
    handlePriceSave,
    updatingDurations,
    savingDurationId,
    handleDurationChange,
    handleDurationSave,
    savingCategoryId,
    handleCategorySave,
    activeImagePickerServiceId,
    setActiveImagePickerServiceId,
    handleImageSave,
    updatingStatusIds,
    handleToggleStatus,
    handleDeleteIndividual,
    bulkActionLoading,
    handleBulkStatusChange,
    handleBulkDelete,
    handleBulkTrackStock,
    handleBulkWebVisibility,
    handleQuickStockDelta,
  } = useServiceMutations({
    language,
    onRefresh,
    selectedIds,
    setSelectedIds,
  });

  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || "General";

  // Reiniciar selección y página al cambiar filtros
  useEffect(() => {
    setSelectedIds(new Set());
    setCurrentPage(1);
  }, [selectedCategory, searchQuery, showArchived, itemTypeFilter, webVisibilityFilter, pageSize]);

  const isLowStockItem = (s: any) => {
    if (!enableStockControl || !s.is_product || !s.track_stock) return false;
    const st = Number(s.stock ?? 0);
    const minSt = s.min_stock !== null && s.min_stock !== undefined ? Number(s.min_stock) : 0;
    return st === 0 || (minSt > 0 && st <= minSt);
  };

  const baseActiveServices = useMemo(() => {
    return showArchived ? services : services.filter(s => s.is_active);
  }, [services, showArchived]);

  const counts = useMemo(() => {
    const all = baseActiveServices.length;
    const svcCount = baseActiveServices.filter(s => !s.is_product).length;
    const prodCount = baseActiveServices.filter(s => s.is_product).length;
    const lowStock = baseActiveServices.filter(s => s.is_active && isLowStockItem(s)).length;
    return { all, services: svcCount, products: prodCount, low_stock: lowStock };
  }, [baseActiveServices, enableStockControl]);

  const lowStockCount = counts.low_stock;

  // Subconjunto tras tipo de ítem y visibilidad web (para filtrar categorías dinámicamente)
  const preCategoryServices = useMemo(() => {
    let result = baseActiveServices;

    if (itemTypeFilter === 'services') {
      result = result.filter(s => !s.is_product);
    } else if (itemTypeFilter === 'products') {
      result = result.filter(s => s.is_product);
    } else if (itemTypeFilter === 'low_stock') {
      result = result.filter(s => isLowStockItem(s));
    }

    if (webVisibilityFilter === 'web') {
      result = result.filter(s => s.is_visible_on_web !== false);
    } else if (webVisibilityFilter === 'web_only') {
      result = result.filter(s => s.is_visible_on_web !== false && s.is_visible_on_pos === false);
    } else if (webVisibilityFilter === 'hidden') {
      result = result.filter(s => s.is_visible_on_web === false);
    }

    return result;
  }, [baseActiveServices, itemTypeFilter, webVisibilityFilter, enableStockControl]);

  const visibleCategories = useMemo(() => {
    const activeCatIds = new Set(preCategoryServices.map(s => s.category_id).filter(Boolean));
    return categories.filter(c => activeCatIds.has(c.id));
  }, [categories, preCategoryServices]);

  useEffect(() => {
    if (selectedCategory !== 'all' && !visibleCategories.some(c => c.id === selectedCategory)) {
      setSelectedCategory('all');
    }
  }, [visibleCategories, selectedCategory]);

  // Filtrado completo de servicios
  const filteredServices = useMemo(() => {
    let result = preCategoryServices;

    if (selectedCategory !== 'all') {
      result = result.filter(s => s.category_id === selectedCategory);
    }

    if (searchQuery.trim() !== '') {
      const term = searchQuery.toLowerCase().trim();
      result = result.filter(s =>
        s.name.toLowerCase().includes(term) ||
        (s.description && s.description.toLowerCase().includes(term)) ||
        (s.sku && s.sku.toLowerCase().includes(term)) ||
        (s.supplier && s.supplier.toLowerCase().includes(term)) ||
        (s.supplier_code && s.supplier_code.toLowerCase().includes(term)) ||
        getCategoryName(s.category_id).toLowerCase().includes(term)
      );
    }

    return result;
  }, [preCategoryServices, selectedCategory, searchQuery, categories]);

  // Paginación cliente
  const totalPages = useMemo(() => {
    if (pageSize === 'all') return 1;
    return Math.max(1, Math.ceil(filteredServices.length / pageSize));
  }, [filteredServices.length, pageSize]);

  const safePage = Math.min(currentPage, totalPages);

  const paginatedServices = useMemo(() => {
    if (pageSize === 'all') return filteredServices;
    const start = (safePage - 1) * pageSize;
    return filteredServices.slice(start, start + pageSize);
  }, [filteredServices, pageSize, safePage]);

  // Selección (sobre la página visible)
  const isAllSelected = useMemo(() => {
    if (paginatedServices.length === 0) return false;
    return paginatedServices.every(s => selectedIds.has(s.id));
  }, [paginatedServices, selectedIds]);

  const handleSelectAllToggle = () => {
    const newSelected = new Set(selectedIds);
    if (isAllSelected) {
      paginatedServices.forEach(s => newSelected.delete(s.id));
    } else {
      paginatedServices.forEach(s => newSelected.add(s.id));
    }
    setSelectedIds(newSelected);
  };

  const handleSelectRowToggle = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  // Loading Skeleton
  if (loading) {
    return <DataGridSkeleton />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* ── SECCIÓN DE FILTROS SUPERIORES Y BÚSQUEDA ── */}
      <DataGridFilters
        categories={visibleCategories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        language={language}
        itemTypeFilter={itemTypeFilter}
        onItemTypeFilterChange={setItemTypeFilter}
        lowStockCount={lowStockCount}
        counts={counts}
        webVisibilityFilter={webVisibilityFilter}
        onWebVisibilityFilterChange={setWebVisibilityFilter}
        enableStockControl={enableStockControl}
      />

      {/* ── BARRA FLOTANTE DE ACCIONES EN MASA ── */}
      <DataGridBulkBar
        selectedCount={selectedIds.size}
        bulkActionLoading={bulkActionLoading}
        onBulkActivate={() => handleBulkStatusChange(true)}
        onBulkDeactivate={() => handleBulkStatusChange(false)}
        onBulkSoloWeb={() => handleBulkWebVisibility({ is_visible_on_web: true, is_visible_on_pos: false })}
        onBulkWebAndTpv={() => handleBulkWebVisibility({ is_visible_on_web: true, is_visible_on_pos: true })}
        onBulkSoloTpv={() => handleBulkWebVisibility({ is_visible_on_web: false, is_visible_on_pos: true })}
        onBulkEnableStock={() => handleBulkTrackStock(true)}
        onBulkDisableStock={() => handleBulkTrackStock(false)}
        onBulkDelete={handleBulkDelete}
        language={language}
      />

      {/* ── DATA TABLE DE SERVICIOS PREMIUM ── */}
      {filteredServices.length === 0 ? (
        <div className="text-center py-20 text-stone-400 bg-stone-50/50 rounded-3xl border border-stone-200/80 border-dashed">
          {language === 'fr' ? 'Aucun traitement trouvé avec les filtres actuels.' : language === 'en' ? 'No services found with current filters.' : 'No se encontraron tratamientos con los filtros actuales.'}
        </div>
      ) : (
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xs border border-stone-200/80 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50/70 border-b border-stone-200/60">
                  
                  {/* Columna Checkbox Maestro */}
                  <th className="p-4 w-12 text-center">
                    <label className="relative flex items-center justify-center cursor-pointer select-none">
                      <input
                        id="services-select-all-checkbox"
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={handleSelectAllToggle}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                        isAllSelected 
                          ? 'bg-[#FF6B00] border-[#FF6B00]' 
                          : 'border-stone-300 bg-white hover:border-stone-400'
                      }`}>
                        {isAllSelected && (
                          <svg className="w-3.5 h-3.5 text-white animate-in zoom-in-50 duration-150" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </label>
                  </th>

                  {/* Cabeceras de Columnas */}
                  <th className="p-4 text-[11px] font-bold uppercase tracking-wider text-stone-400 w-20 text-center">
                    {language === 'fr' ? 'Image' : language === 'en' ? 'Image' : 'Imagen'}
                  </th>
                  <th className="p-4 text-[11px] font-bold uppercase tracking-wider text-stone-400">
                    {language === 'fr' ? 'Service / Traitement' : language === 'en' ? 'Service / Treatment' : 'Servicio / Tratamiento'}
                  </th>
                  <th className="p-4 text-[11px] font-bold uppercase tracking-wider text-stone-400 w-44">
                    {language === 'fr' ? 'Catégorie' : language === 'en' ? 'Category' : 'Categoría'}
                  </th>
                  <th className="p-4 text-[11px] font-bold uppercase tracking-wider text-stone-400 w-36">
                    {language === 'fr' ? 'Durée / Stock' : language === 'en' ? 'Duration / Stock' : 'Duración / Stock'}
                  </th>
                  <th className="p-4 text-[11px] font-bold uppercase tracking-wider text-stone-400 w-36">
                    {language === 'fr' ? 'Prix (€)' : language === 'en' ? 'Price (€)' : 'Precio (€)'}
                  </th>
                  <th className="p-4 text-[11px] font-bold uppercase tracking-wider text-stone-400 w-28 text-center">
                    {language === 'fr' ? 'Statut' : language === 'en' ? 'Status' : 'Estado'}
                  </th>
                  <th className="p-4 text-[11px] font-bold uppercase tracking-wider text-stone-400 w-28 text-center">
                    {language === 'fr' ? 'Actions' : language === 'en' ? 'Actions' : 'Acciones'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {paginatedServices.map(svc => {
                  const isChecked = selectedIds.has(svc.id);
                  const displayCategory = getCategoryName(svc.category_id);
                  const isStatusUpdating = updatingStatusIds.has(svc.id);

                  const inputPriceVal = updatingPrices[svc.id] !== undefined 
                    ? updatingPrices[svc.id] 
                    : svc.price.toString();

                  const inputDurationVal = updatingDurations[svc.id] !== undefined
                    ? updatingDurations[svc.id]
                    : svc.duration_minutes.toString();

                  return (
                    <DataGridRow
                      key={svc.id}
                      svc={svc}
                      isChecked={isChecked}
                      onToggleSelect={() => handleSelectRowToggle(svc.id)}
                      categories={categories}
                      displayCategory={displayCategory}
                      isStatusUpdating={isStatusUpdating}
                      onToggleStatus={() => handleToggleStatus(svc)}
                      onOpenImagePicker={() => setActiveImagePickerServiceId(svc.id)}
                      inputPriceVal={inputPriceVal}
                      onPriceChange={(val) => handlePriceChange(svc.id, val)}
                      onPriceSave={(val) => handlePriceSave(svc, val)}
                      isSavingPrice={savingPriceId === svc.id}
                      inputDurationVal={inputDurationVal}
                      onDurationChange={(val) => handleDurationChange(svc.id, val)}
                      onDurationSave={(val) => handleDurationSave(svc, val)}
                      isSavingDuration={savingDurationId === svc.id}
                      isSavingCategory={savingCategoryId === svc.id}
                      onCategorySave={(newCatId) => handleCategorySave(svc, newCatId)}
                      onEditClick={onEditClick}
                      onDeleteClick={() => handleDeleteIndividual(svc.id, svc.name)}
                      onQuickStockDelta={(delta) => handleQuickStockDelta(svc, delta)}
                      enableStockControl={enableStockControl}
                      language={language}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {/* Footer de la Tabla con recuento y paginación */}
          <div className="p-4 bg-stone-50 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500 font-bold tracking-wide">
            <div className="flex flex-wrap items-center gap-3">
              <span>
                {(() => {
                  const startIdx = pageSize === 'all' ? 1 : (safePage - 1) * pageSize + 1;
                  const endIdx = pageSize === 'all'
                    ? filteredServices.length
                    : Math.min(safePage * pageSize, filteredServices.length);
                  return `Mostrando ${startIdx}-${endIdx} de ${filteredServices.length} filtrados (${services.length} totales)`;
                })()}
              </span>
              {selectedIds.size > 0 && (
                <span className="text-[#d4af37]">
                  · {selectedIds.size} {language === 'fr' ? 'sélectionnés' : language === 'en' ? 'selected' : 'seleccionados'}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Selector de tamaño de página */}
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-stone-200">
                {([15, 25, 50, 'all'] as const).map((sizeOpt) => (
                  <button
                    key={String(sizeOpt)}
                    type="button"
                    onClick={() => setPageSize(sizeOpt)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      pageSize === sizeOpt
                        ? 'bg-stone-900 text-white'
                        : 'text-stone-500 hover:text-stone-900'
                    }`}
                  >
                    {sizeOpt === 'all' ? 'Todos' : sizeOpt}
                  </button>
                ))}
              </div>

              {/* Controles de página */}
              {pageSize !== 'all' && totalPages > 1 && (
                <div className="flex items-center gap-1.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={safePage <= 1}
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className="h-8 px-2.5 rounded-xl text-xs"
                  >
                    <ChevronLeft size={14} /> Anterior
                  </Button>
                  <span className="px-2 text-[11px] font-semibold text-stone-600">
                    Página {safePage} de {totalPages}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={safePage >= totalPages}
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    className="h-8 px-2.5 rounded-xl text-xs"
                  >
                    Siguiente <ChevronRight size={14} />
                  </Button>
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {activeImagePickerServiceId && (
        <MediaPickerModal
          onClose={() => setActiveImagePickerServiceId(null)}
          mediaType="image"
          onImageSelected={(url) => handleImageSave(activeImagePickerServiceId, url)}
        />
      )}

    </div>
  );
}

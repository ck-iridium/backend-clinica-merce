"use client"
import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import MediaPickerModal from '@/components/MediaPickerModal';
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
  onEditClick: (svc: any) => void;
  onRefresh?: () => void;
}

export default function ServicesDataGrid({
  services,
  categories,
  loading,
  showArchived,
  onEditClick,
  onRefresh,
}: ServicesDataGridProps) {
  const { language } = useLanguage();

  // Estados locales de filtrado y selección
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

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
  } = useServiceMutations({
    language,
    onRefresh,
    selectedIds,
    setSelectedIds,
  });

  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || "General";

  // Reiniciar selección al cambiar filtros
  useEffect(() => {
    setSelectedIds(new Set());
  }, [selectedCategory, searchQuery, showArchived]);

  // Filtrado de servicios
  const filteredServices = useMemo(() => {
    let result = services;

    // A. Filtrado por estado archivado (is_active)
    if (!showArchived) {
      result = result.filter(s => s.is_active);
    }

    // B. Filtrado por categoría seleccionada
    if (selectedCategory !== 'all') {
      result = result.filter(s => s.category_id === selectedCategory);
    }

    // C. Filtrado por término de búsqueda
    if (searchQuery.trim() !== '') {
      const term = searchQuery.toLowerCase().trim();
      result = result.filter(s => 
        s.name.toLowerCase().includes(term) || 
        (s.description && s.description.toLowerCase().includes(term)) ||
        getCategoryName(s.category_id).toLowerCase().includes(term)
      );
    }

    return result;
  }, [services, selectedCategory, searchQuery, showArchived, categories]);

  // Selección
  const isAllSelected = useMemo(() => {
    if (filteredServices.length === 0) return false;
    return filteredServices.every(s => selectedIds.has(s.id));
  }, [filteredServices, selectedIds]);

  const handleSelectAllToggle = () => {
    const newSelected = new Set(selectedIds);
    if (isAllSelected) {
      filteredServices.forEach(s => newSelected.delete(s.id));
    } else {
      filteredServices.forEach(s => newSelected.add(s.id));
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
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        language={language}
      />

      {/* ── BARRA FLOTANTE DE ACCIONES EN MASA ── */}
      <DataGridBulkBar
        selectedCount={selectedIds.size}
        bulkActionLoading={bulkActionLoading}
        onBulkActivate={() => handleBulkStatusChange(true)}
        onBulkDeactivate={() => handleBulkStatusChange(false)}
        onBulkDelete={handleBulkDelete}
        language={language}
      />

      {/* ── DATA TABLE DE SERVICIOS PREMIUM ── */}
      {filteredServices.length === 0 ? (
        <div className="text-center py-20 text-stone-400 bg-stone-50/50 rounded-2xl border border-stone-200 border-dashed">
          {language === 'fr' ? 'Aucun traitement trouvé avec los filtres actuels.' : language === 'en' ? 'No services found with current filters.' : 'No se encontraron tratamientos con los filtros actuales.'}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-100">
                  
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
                          ? 'bg-[#d4af37] border-[#d4af37]' 
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
                  <th className="p-4 text-xs font-black uppercase tracking-wider text-stone-400 w-20 text-center">
                    {language === 'fr' ? 'Image' : language === 'en' ? 'Image' : 'Imagen'}
                  </th>
                  <th className="p-4 text-xs font-black uppercase tracking-wider text-stone-400">
                    {language === 'fr' ? 'Service / Traitement' : language === 'en' ? 'Service / Treatment' : 'Servicio / Tratamiento'}
                  </th>
                  <th className="p-4 text-xs font-black uppercase tracking-wider text-stone-400 w-44">
                    {language === 'fr' ? 'Catégorie' : language === 'en' ? 'Category' : 'Categoría'}
                  </th>
                  <th className="p-4 text-xs font-black uppercase tracking-wider text-stone-400 w-32">
                    {language === 'fr' ? 'Durée' : language === 'en' ? 'Duration' : 'Duración'}
                  </th>
                  <th className="p-4 text-xs font-black uppercase tracking-wider text-stone-400 w-36">
                    {language === 'fr' ? 'Prix (€)' : language === 'en' ? 'Price (€)' : 'Precio (€)'}
                  </th>
                  <th className="p-4 text-xs font-black uppercase tracking-wider text-stone-400 w-28 text-center">
                    {language === 'fr' ? 'Statut' : language === 'en' ? 'Status' : 'Estado'}
                  </th>
                  <th className="p-4 text-xs font-black uppercase tracking-wider text-stone-400 w-28 text-center">
                    {language === 'fr' ? 'Actions' : language === 'en' ? 'Actions' : 'Acciones'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredServices.map(svc => {
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
                      language={language}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {/* Footer de la Tabla con recuento */}
          <div className="p-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between text-xs text-stone-400 font-bold tracking-wide">
            <div>
              {language === 'fr' 
                ? `Affichage de ${filteredServices.length} sur ${services.length} traitements` 
                : language === 'en' 
                ? `Showing ${filteredServices.length} of ${services.length} services` 
                : `Mostrando ${filteredServices.length} de ${services.length} tratamientos`}
            </div>
            {selectedIds.size > 0 && (
              <div className="text-[#d4af37]">
                {selectedIds.size} {language === 'fr' ? 'sélectionnés' : language === 'en' ? 'selected' : 'seleccionados'}
              </div>
            )}
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

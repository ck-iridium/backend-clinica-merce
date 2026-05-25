"use client"
import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { Clock, Pencil, Trash2, Search, CheckCircle, HelpCircle, AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from 'sonner';
import { useFeedback } from '@/app/contexts/FeedbackContext';

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
  const { t, language } = useLanguage();
  const { showFeedback } = useFeedback();

  // Estados locales
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Seguimiento de cambios rápidos
  const [updatingPrices, setUpdatingPrices] = useState<Record<string, string>>({});
  const [savingPriceId, setSavingPriceId] = useState<string | null>(null);
  const [updatingStatusIds, setUpdatingStatusIds] = useState<Set<string>>(new Set());
  const [bulkActionLoading, setBulkActionLoading] = useState<boolean>(false);

  // Obtener headers de autenticación con aislamiento Tenant
  const getAuthHeaders = () => {
    const getCookie = (name: string): string | null => {
      if (typeof document === 'undefined') return null;
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
      return null;
    };

    const userSession = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    let tenantId = getCookie('tenant_id') || '';
    let authToken = '';
    if (userSession) {
      try {
        const parsed = JSON.parse(userSession);
        if (!tenantId) {
          tenantId = parsed.tenant_id || '';
        }
        authToken = parsed.access_token || parsed.token || '';
      } catch (e) {
        console.error(e);
      }
    }
    return {
      'Content-Type': 'application/json',
      'X-Tenant-ID': tenantId,
      ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
    };
  };

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

    // C. Filtrado por término de búsqueda (búsqueda difusa básica)
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

  // ── Mutaciones Directas Premium ──

  // 1. Toggled de estado Activo/Inactivo directo
  const handleToggleStatus = async (service: any) => {
    const newStatus = !service.is_active;
    const targetId = service.id;

    setUpdatingStatusIds(prev => {
      const next = new Set(prev);
      next.add(targetId);
      return next;
    });

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/services/${targetId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ is_active: newStatus }),
      });
      if (res.ok) {
        toast.success(`Servicio "${service.name}" ${newStatus ? 'activado' : 'desactivado'} con éxito.`);
        if (onRefresh) onRefresh();
      } else {
        throw new Error();
      }
    } catch (err) {
      toast.error('Error al actualizar el estado del servicio.');
    } finally {
      setUpdatingStatusIds(prev => {
        const next = new Set(prev);
        next.delete(targetId);
        return next;
      });
    }
  };

  // 2. Modificación de precio rápida por fila (Blur / Enter)
  const handlePriceChange = (id: string, val: string) => {
    setUpdatingPrices(prev => ({ ...prev, [id]: val }));
  };

  const handlePriceSave = async (service: any, val: string) => {
    const originalPrice = parseFloat(service.price);
    const newPrice = parseFloat(val);

    if (isNaN(newPrice) || newPrice < 0) {
      toast.error('Por favor, ingresa un precio numérico válido.');
      // Revertir input local
      setUpdatingPrices(prev => {
        const next = { ...prev };
        delete next[service.id];
        return next;
      });
      return;
    }

    if (newPrice === originalPrice) return; // No hay cambios reales

    setSavingPriceId(service.id);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/services/${service.id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ price: newPrice }),
      });
      if (res.ok) {
        toast.success(`Precio de "${service.name}" actualizado a ${newPrice} €.`);
        if (onRefresh) onRefresh();
      } else {
        throw new Error();
      }
    } catch (err) {
      toast.error('Error al actualizar el precio.');
    } finally {
      setSavingPriceId(null);
      setUpdatingPrices(prev => {
        const next = { ...prev };
        delete next[service.id];
        return next;
      });
    }
  };

  // 3. Eliminar individual con FeedbackModal
  const handleDeleteIndividual = async (id: string, name: string) => {
    showFeedback({
      type: 'confirm',
      title: '¿Eliminar servicio?',
      message: `¿Estás seguro de que deseas eliminar el servicio "${name}"? Esta acción no se puede deshacer.`,
      confirmText: 'Sí, eliminar',
      cancelText: 'Cancelar',
      onConfirm: async () => {
        const toastId = toast.loading('Eliminando servicio...');
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/services/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
          });
          if (res.ok) {
            toast.success('Servicio eliminado con éxito.', { id: toastId });
            if (onRefresh) onRefresh();
          } else {
            const data = await res.json();
            toast.error(data.detail || 'Error al eliminar el servicio.', { id: toastId });
          }
        } catch (err) {
          toast.error('Error de red al eliminar el servicio.', { id: toastId });
        }
      }
    });
  };

  // 4. Acciones Masivas en Lote (Bulk Actions)
  const handleBulkStatusChange = async (is_active: boolean) => {
    if (selectedIds.size === 0) return;
    setBulkActionLoading(true);
    const toastId = toast.loading(`Actualizando estado de ${selectedIds.size} servicios...`);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/services/bulk-status`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ids: Array.from(selectedIds),
          is_active: is_active
        })
      });
      if (res.ok) {
        toast.success(`Estado de ${selectedIds.size} servicios actualizado con éxito.`, { id: toastId });
        setSelectedIds(new Set());
        if (onRefresh) onRefresh();
      } else {
        const data = await res.json();
        toast.error(data.detail || 'Error al actualizar el lote.', { id: toastId });
      }
    } catch (err) {
      toast.error('Error de red al actualizar los servicios en lote.', { id: toastId });
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    showFeedback({
      type: 'confirm',
      title: '¿Eliminar servicios en lote?',
      message: `¿Estás seguro de que deseas eliminar permanentemente los ${selectedIds.size} servicios seleccionados? Esta acción es irreversible.`,
      confirmText: 'Sí, eliminar lote',
      cancelText: 'Cancelar',
      onConfirm: async () => {
        setBulkActionLoading(true);
        const toastId = toast.loading(`Eliminando ${selectedIds.size} servicios...`);
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/services/bulk-delete`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
              ids: Array.from(selectedIds)
            })
          });
          if (res.ok) {
            toast.success(`¡Lote de ${selectedIds.size} servicios eliminado con éxito!`, { id: toastId });
            setSelectedIds(new Set());
            if (onRefresh) onRefresh();
          } else {
            const data = await res.json();
            toast.error(data.detail || 'Error al eliminar el lote de servicios.', { id: toastId });
          }
        } catch (err) {
          toast.error('Error de red al eliminar el lote de servicios.', { id: toastId });
        } finally {
          setBulkActionLoading(false);
        }
      }
    });
  };

  // Loading Skeleton
  if (loading) {
    return (
      <div className="space-y-4 animate-in fade-in duration-500">
        <div className="flex gap-4">
          <Skeleton className="w-24 h-10 rounded-xl" />
          <Skeleton className="w-24 h-10 rounded-xl" />
          <Skeleton className="w-24 h-10 rounded-xl" />
        </div>
        <div className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm space-y-4">
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-stone-50">
              <Skeleton className="w-6 h-6 rounded-md" />
              <Skeleton className="w-1/4 h-6 rounded-lg" />
              <Skeleton className="w-20 h-6 rounded-lg" />
              <Skeleton className="w-16 h-8 rounded-lg" />
              <Skeleton className="w-10 h-6 rounded-full" />
              <Skeleton className="w-16 h-8 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* ── SECCIÓN DE FILTROS SUPERIORES Y BÚSQUEDA (Premium + Quiet Luxury) ── */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-white p-4 rounded-2xl border border-stone-100 shadow-sm">
        
        {/* Filtros de Categorías */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              selectedCategory === 'all'
                ? 'bg-stone-900 text-white shadow-sm'
                : 'bg-stone-50 text-stone-500 hover:bg-stone-100'
            }`}
          >
            {language === 'fr' ? 'Tous' : language === 'en' ? 'All' : 'Todos'}
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === cat.id
                  ? 'bg-[#d4af37] text-white shadow-sm'
                  : 'bg-stone-50 text-stone-500 hover:bg-stone-100'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Input de Búsqueda */}
        <div className="relative min-w-[260px]">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={language === 'fr' ? 'Rechercher des traitements...' : language === 'en' ? 'Search services...' : 'Buscar tratamientos...'}
            className="w-full pl-11 pr-4 py-2.5 bg-stone-50 hover:bg-stone-100/50 focus:bg-white border border-stone-200 focus:border-[#d4af37] rounded-xl text-xs font-medium text-stone-800 dark:text-stone-800 outline-none transition-all focus:ring-1 focus:ring-[#d4af37]"
          />
        </div>
      </div>

      {/* ── BARRA FLOTANTE DE ACCIONES EN MASA (BULK ACTIONS BAR) ── */}
      {selectedIds.size > 0 && (
        <div className="bg-[#1c1917] text-white rounded-2xl p-4 md:px-6 shadow-xl border border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-[#d4af37] text-stone-950 flex items-center justify-center text-xs font-black">
              {selectedIds.size}
            </span>
            <span className="text-xs font-bold text-stone-300 tracking-wide">
              {language === 'fr' ? 'services sélectionnés pour action groupée' : language === 'en' ? 'services selected for bulk action' : 'servicios seleccionados para acción masiva'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              disabled={bulkActionLoading}
              onClick={() => handleBulkStatusChange(true)}
              className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Eye size={14} /> {language === 'fr' ? 'Tout activer' : language === 'en' ? 'Activate All' : 'Activar Todos'}
            </button>
            <button
              type="button"
              disabled={bulkActionLoading}
              onClick={() => handleBulkStatusChange(false)}
              className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <EyeOff size={14} /> {language === 'fr' ? 'Tout désactiver' : language === 'en' ? 'Deactivate All' : 'Desactivar Todos'}
            </button>
            <button
              type="button"
              disabled={bulkActionLoading}
              onClick={handleBulkDelete}
              className="px-4 py-2 bg-rose-950 hover:bg-rose-900 border border-rose-800/40 text-rose-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Trash2 size={14} /> {language === 'fr' ? 'Supprimer le lot' : language === 'en' ? 'Delete Bulk' : 'Eliminar Lote'}
            </button>
          </div>
        </div>
      )}

      {/* ── DATA TABLE DE SERVICIOS PREMIUM (Quiet Luxury + Compact) ── */}
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
                    <label className="relative flex items-center justify-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={handleSelectAllToggle}
                        className="sr-only peer"
                      />
                      <div className="w-5 h-5 rounded-md border border-stone-300 bg-white peer-checked:bg-[#d4af37] peer-checked:border-[#d4af37] flex items-center justify-center transition-all">
                        {isAllSelected && (
                          <span className="block w-2.5 h-2.5 bg-white rounded-sm"></span>
                        )}
                      </div>
                    </label>
                  </th>

                  {/* Cabeceras de Columnas */}
                  <th className="p-4 text-xs font-black uppercase tracking-wider text-stone-400">
                    {language === 'fr' ? 'Service / Traitement' : language === 'en' ? 'Service / Treatment' : 'Servicio / Tratamiento'}
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

                  // Obtener valor temporal del precio si se está escribiendo
                  const inputPriceVal = updatingPrices[svc.id] !== undefined 
                    ? updatingPrices[svc.id] 
                    : svc.price.toString();

                  return (
                    <tr 
                      key={svc.id} 
                      className={`hover:bg-stone-50/50 transition-colors ${
                        !svc.is_active ? 'bg-stone-50/20 text-stone-400' : 'text-stone-800'
                      }`}
                    >
                      
                      {/* Checkbox Fila */}
                      <td className="p-4 text-center">
                        <label className="relative flex items-center justify-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleSelectRowToggle(svc.id)}
                            className="sr-only peer"
                          />
                          <div className="w-5 h-5 rounded-md border border-stone-300 bg-white peer-checked:bg-[#d4af37] peer-checked:border-[#d4af37] flex items-center justify-center transition-all">
                            {isChecked && (
                              <span className="block w-2.5 h-2.5 bg-white rounded-sm"></span>
                            )}
                          </div>
                        </label>
                      </td>

                      {/* Nombre y Badge de Categoría */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="font-bold text-stone-800 text-sm">{svc.name}</div>
                          <span className="px-2 py-0.5 text-[9px] rounded-full font-black uppercase tracking-wider bg-stone-100 text-stone-500 border border-stone-200">
                            {displayCategory}
                          </span>
                          {svc.is_featured && (
                            <span className="px-2 py-0.5 text-[9px] rounded-full font-black uppercase tracking-wider bg-yellow-50 text-yellow-700 border border-yellow-200">
                              {language === 'fr' ? 'À la une' : language === 'en' ? 'Featured' : 'Destacado'}
                            </span>
                          )}
                        </div>
                        {svc.description && (
                          <div className="text-stone-400 text-xs mt-0.5 line-clamp-1 max-w-xl font-medium">
                            {svc.description}
                          </div>
                        )}
                      </td>

                      {/* Duración */}
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 text-stone-500 text-xs font-semibold">
                          <Clock size={14} className="text-[#d4af37]" />
                          {svc.duration_minutes} min
                        </div>
                      </td>

                      {/* Entrada de Precio Directa (Auto-guardado) */}
                      <td className="p-4">
                        <div className="relative flex items-center max-w-[100px]">
                          <input
                            type="text"
                            value={inputPriceVal}
                            onChange={e => handlePriceChange(svc.id, e.target.value)}
                            onBlur={e => handlePriceSave(svc, e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                handlePriceSave(svc, inputPriceVal);
                                (e.target as HTMLInputElement).blur();
                              }
                            }}
                            className="w-full pr-7 pl-3 py-1.5 bg-stone-50 hover:bg-stone-100 border border-stone-200 focus:border-[#d4af37] rounded-lg text-xs font-bold text-stone-800 dark:text-stone-800 outline-none text-right transition-all focus:ring-1 focus:ring-[#d4af37]"
                          />
                          <span className="absolute right-2.5 text-stone-400 text-xs font-bold pointer-events-none">€</span>
                          {savingPriceId === svc.id && (
                            <Loader2 size={12} className="absolute left-1 animate-spin text-[#d4af37]" />
                          )}
                        </div>
                      </td>

                      {/* Interruptor de Estado (Toggle Switch) */}
                      <td className="p-4 text-center">
                        <div className="flex justify-center items-center">
                          {isStatusUpdating ? (
                            <Loader2 size={16} className="animate-spin text-[#d4af37]" />
                          ) : (
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={svc.is_active}
                                onChange={() => handleToggleStatus(svc)}
                                className="sr-only peer"
                              />
                              <div className="w-9 h-5 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#d4af37]"></div>
                            </label>
                          )}
                        </div>
                      </td>

                      {/* Iconos de Edición Detallada y Borrado */}
                      <td className="p-4 text-center">
                        <div className="flex justify-center items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onEditClick(svc)}
                            className="p-1.5 text-stone-400 hover:text-stone-700 bg-white border border-stone-200 hover:border-stone-400 rounded-lg shadow-sm active:scale-95 transition-all"
                            title={language === 'fr' ? 'Modifier en détail' : language === 'en' ? 'Edit details' : 'Editar detalladamente'}
                          >
                            <Pencil size={13} strokeWidth={1.5} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteIndividual(svc.id, svc.name)}
                            className="p-1.5 text-rose-400 hover:text-rose-600 bg-white border border-stone-200 hover:border-rose-300 rounded-lg shadow-sm active:scale-95 transition-all"
                            title={language === 'fr' ? 'Supprimer définitivement' : language === 'en' ? 'Delete permanently' : 'Eliminar permanentemente'}
                          >
                            <Trash2 size={13} strokeWidth={1.5} />
                          </button>
                        </div>
                      </td>

                    </tr>
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

    </div>
  );
}

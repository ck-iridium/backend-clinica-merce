"use client"
import { useState } from 'react';
import { toast } from 'sonner';
import { useFeedback } from '@/app/contexts/FeedbackContext';

interface UseServiceMutationsProps {
  language: string;
  onRefresh?: () => void;
  selectedIds: Set<string>;
  setSelectedIds: React.Dispatch<React.SetStateAction<Set<string>>>;
}

export function useServiceMutations({
  language,
  onRefresh,
  selectedIds,
  setSelectedIds,
}: UseServiceMutationsProps) {
  const { showFeedback } = useFeedback();

  // Estados de seguimiento de mutaciones rápidas
  const [updatingPrices, setUpdatingPrices] = useState<Record<string, string>>({});
  const [savingPriceId, setSavingPriceId] = useState<string | null>(null);
  const [updatingDurations, setUpdatingDurations] = useState<Record<string, string>>({});
  const [savingDurationId, setSavingDurationId] = useState<string | null>(null);
  const [savingCategoryId, setSavingCategoryId] = useState<string | null>(null);
  const [activeImagePickerServiceId, setActiveImagePickerServiceId] = useState<string | null>(null);
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

  // 1. Toggle de estado Activo/Inactivo directo
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
    } catch {
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
      setUpdatingPrices(prev => {
        const next = { ...prev };
        delete next[service.id];
        return next;
      });
      return;
    }

    if (newPrice === originalPrice) return;

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
    } catch {
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

  // 3. Modificación de duración rápida por fila (Blur / Enter)
  const handleDurationChange = (id: string, val: string) => {
    setUpdatingDurations(prev => ({ ...prev, [id]: val }));
  };

  const handleDurationSave = async (service: any, val: string) => {
    const originalDuration = parseInt(service.duration_minutes);
    const newDuration = parseInt(val);

    if (isNaN(newDuration) || newDuration <= 0) {
      toast.error(language === 'fr' ? 'Veuillez saisir una durée valide.' : language === 'en' ? 'Please enter a valid duration.' : 'Por favor, ingresa una duración válida.');
      setUpdatingDurations(prev => {
        const next = { ...prev };
        delete next[service.id];
        return next;
      });
      return;
    }

    if (newDuration === originalDuration) return;

    setSavingDurationId(service.id);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/services/${service.id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ duration_minutes: newDuration }),
      });
      if (res.ok) {
        toast.success(language === 'fr' ? `Durée de "${service.name}" mise à jour à ${newDuration} min.` : language === 'en' ? `Duration of "${service.name}" updated to ${newDuration} min.` : `Duración de "${service.name}" actualizada a ${newDuration} min.`);
        if (onRefresh) onRefresh();
      } else {
        throw new Error();
      }
    } catch {
      toast.error(language === 'fr' ? 'Erreur lors de la mise à jour de la duración.' : language === 'en' ? 'Error updating duration.' : 'Error al actualizar la duración.');
    } finally {
      setSavingDurationId(null);
      setUpdatingDurations(prev => {
        const next = { ...prev };
        delete next[service.id];
        return next;
      });
    }
  };

  // 4. Modificación de categoría rápida por fila
  const handleCategorySave = async (service: any, newCategoryId: string) => {
    const finalValue = newCategoryId === "" ? null : newCategoryId;
    if (service.category_id === finalValue) return;

    setSavingCategoryId(service.id);
    const toastId = toast.loading(
      language === 'fr' ? 'Mise à jour de la catégorie...' : 
      language === 'en' ? 'Updating category...' : 
      'Actualizando categoría...'
    );

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/services/${service.id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ category_id: finalValue }),
      });
      if (res.ok) {
        toast.success(
          language === 'fr' ? 'Catégorie mise à jour.' : 
          language === 'en' ? 'Category updated.' : 
          'Categoría actualizada con éxito.', 
          { id: toastId }
        );
        if (onRefresh) onRefresh();
      } else {
        throw new Error();
      }
    } catch {
      toast.error(
        language === 'fr' ? 'Erreur lors de la mise à jour.' : 
        language === 'en' ? 'Error updating category.' : 
        'Error al actualizar la categoría.', 
        { id: toastId }
      );
    } finally {
      setSavingCategoryId(null);
    }
  };

  // 5. Modificación de imagen
  const handleImageSave = async (id: string, url: string) => {
    const toastId = toast.loading(language === 'fr' ? "Mise à jour de l'image..." : language === 'en' ? "Updating image..." : "Actualizando imagen...");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/services/${id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ image_url: url }),
      });
      if (res.ok) {
        toast.success(language === 'fr' ? "Image mise à jour avec succès." : language === 'en' ? "Image updated successfully." : "Imagen actualizada con éxito.", { id: toastId });
        if (onRefresh) onRefresh();
      } else {
        throw new Error();
      }
    } catch {
      toast.error(language === 'fr' ? "Erreur de mise à jour." : language === 'en' ? "Error updating image." : "Error al actualizar la imagen.", { id: toastId });
    } finally {
      setActiveImagePickerServiceId(null);
    }
  };

  // 6. Eliminar individual con FeedbackModal
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
        } catch {
          toast.error('Error de red al eliminar el servicio.', { id: toastId });
        }
      }
    });
  };

  // 7. Acciones Masivas en Lote (Bulk Actions)
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
    } catch {
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
        } catch {
          toast.error('Error de red al eliminar el lote de servicios.', { id: toastId });
        } finally {
          setBulkActionLoading(false);
        }
      }
    });
  };

  return {
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
  };
}

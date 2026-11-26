"use client";
import { useState, useEffect } from 'react';
import { useFeedback } from '@/app/contexts/FeedbackContext';
import { getAuthHeaders } from '../utils/auth';

export function useCmsNavigation(initialMegamenuLayout: 'bento' | 'directory' = 'bento', initialMegamenuCategories: string[] | null = null) {
  const { showFeedback } = useFeedback();

  // Navigation Items
  const [navigationItems, setNavigationItems] = useState<any[]>([]);
  const [loadingNav, setLoadingNav] = useState(false);
  const [savingNav, setSavingNav] = useState(false);

  // Megamenu States
  const [navTab, setNavTab] = useState<'links' | 'megamenu'>('links');
  const [megamenuLayout, setMegamenuLayout] = useState<'bento' | 'directory'>(initialMegamenuLayout);
  const [megamenuCategories, setMegamenuCategories] = useState<string[] | null>(initialMegamenuCategories);
  const [savingMegamenu, setSavingMegamenu] = useState(false);
  const [previewActiveCategory, setPreviewActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchNavigation();
  }, []);

  const fetchNavigation = async () => {
    setLoadingNav(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cms/navigation`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setNavigationItems(data);
      }
    } catch (err) {
      console.error("Error loading navigation", err);
    } finally {
      setLoadingNav(false);
    }
  };

  const handleSaveNavigation = async () => {
    setSavingNav(true);
    try {
      const authHeaders = getAuthHeaders();

      // 1. Guardar etiquetas y visibilidad por enlace
      const promises = navigationItems.map(item => 
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/cms/navigation/${item.id}`, {
          method: 'PUT',
          headers: authHeaders,
          body: JSON.stringify({
            label: item.label,
            is_visible: item.is_visible
          })
        })
      );
      await Promise.all(promises);

      // 2. Sincronizar orden
      const idsOrder = navigationItems.map(item => item.id);
      const resOrder = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cms/navigation/reorder`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ ids: idsOrder })
      });

      if (resOrder.ok) {
        showFeedback({ 
          type: 'success', 
          title: 'Navegación Guardada', 
          message: 'El menú superior de la clínica ha sido actualizado dinámicamente.' 
        });
      } else {
        throw new Error("Error guardando reordenamiento");
      }
    } catch (err) {
      console.error(err);
      showFeedback({ 
        type: 'error', 
        title: 'Error', 
        message: 'No se pudo guardar la configuración de navegación.' 
      });
    } finally {
      setSavingNav(false);
    }
  };

  const handleAddNavItem = async (newItem: { label: string; path: string; is_visible: boolean }) => {
    try {
      const authHeaders = getAuthHeaders();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cms/navigation`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(newItem)
      });
      if (!res.ok) throw new Error();
      const created = await res.json();
      setNavigationItems(prev => [...prev, created]);
      showFeedback({
        type: 'success',
        title: 'Enlace Añadido',
        message: `"${created.label}" se ha incorporado al menú superior.`
      });
    } catch (err) {
      console.error(err);
      showFeedback({
        type: 'error',
        title: 'Error',
        message: 'No se pudo añadir el enlace al menú.'
      });
    }
  };

  const handleDeleteNavItem = async (itemId: string) => {
    try {
      const authHeaders = getAuthHeaders();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cms/navigation/${itemId}`, {
        method: 'DELETE',
        headers: authHeaders
      });
      if (!res.ok) throw new Error();
      setNavigationItems(prev => prev.filter(item => item.id !== itemId));
      showFeedback({
        type: 'success',
        title: 'Enlace Eliminado',
        message: 'El enlace ha sido quitado del menú de navegación.'
      });
    } catch (err) {
      console.error(err);
      showFeedback({
        type: 'error',
        title: 'Error',
        message: 'No se pudo eliminar el enlace del menú.'
      });
    }
  };

  const moveNavItem = (index: number, direction: 'up' | 'down') => {
    const updated = [...navigationItems];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= updated.length) return;
    
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    
    setNavigationItems(updated);
  };

  const updateNavItemLabel = (index: number, value: string) => {
    setNavigationItems(prev => prev.map((item, idx) => 
      idx === index ? { ...item, label: value } : item
    ));
  };

  const toggleNavItemVisibility = (index: number) => {
    setNavigationItems(prev => prev.map((item, idx) => 
      idx === index ? { ...item, is_visible: !item.is_visible } : item
    ));
  };

  const toggleMegamenuCategory = (categoryId: string, categories: any[]) => {
    const activeCats = categories.filter(c => c.is_active).map(c => c.id);
    if (megamenuCategories === null) {
      setMegamenuCategories(activeCats.filter(id => id !== categoryId));
    } else {
      if (megamenuCategories.includes(categoryId)) {
        setMegamenuCategories(megamenuCategories.filter(id => id !== categoryId));
      } else {
        setMegamenuCategories([...megamenuCategories, categoryId]);
      }
    }
  };

  const handleSaveMegamenu = async (onSuccess?: (updatedContent: any) => void) => {
    setSavingMegamenu(true);
    try {
      const authHeaders = getAuthHeaders();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/site-content/`, {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify({
          megamenu_layout: megamenuLayout,
          megamenu_categories_json: megamenuCategories
        })
      });
      if (res.ok) {
        const updatedData = await res.json();
        if (onSuccess) onSuccess(updatedData);
        showFeedback({
          type: 'success',
          title: 'Megamenú Guardado',
          message: 'La configuración y distribución del megamenú ha sido actualizada con éxito.'
        });
      } else {
        throw new Error("Error saving megamenu config");
      }
    } catch (err) {
      console.error(err);
      showFeedback({
        type: 'error',
        title: 'Error',
        message: 'No se pudo guardar la configuración del megamenú.'
      });
    } finally {
      setSavingMegamenu(false);
    }
  };

  return {
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
    fetchNavigation,
    handleSaveNavigation,
    handleAddNavItem,
    handleDeleteNavItem,
    moveNavItem,
    updateNavItemLabel,
    toggleNavItemVisibility,
    toggleMegamenuCategory,
    handleSaveMegamenu
  };
}

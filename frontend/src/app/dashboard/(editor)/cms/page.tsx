"use client"
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useFeedback } from '@/app/contexts/FeedbackContext';
import MediaPickerModal from '@/components/MediaPickerModal';
import { Skeleton } from "@/components/ui/skeleton";
import HomeBuilderLayout from '@/components/cms/HomeBuilderLayout';
import HomeBuilderPreview from '@/components/cms/HomeBuilderPreview';
import HeroTab from './components/HeroTab';
import AboutTab from './components/AboutTab';
import CategoriesTab from './components/CategoriesTab';
import CtaTab from './components/CtaTab';
import SeoTab from './components/SeoTab';
import CmsHub from './components/CmsHub';
import NavigationEditorTab from './components/NavigationEditorTab';
import MegamenuEditorTab from './components/MegamenuEditorTab';
import NavigationLivePreview from './components/NavigationLivePreview';

const TABS = ['HERO', 'SOBRE MÍ', 'CATEGORÍAS', 'CTA', 'SEO'];

export default function CMSPage() {
  const { showFeedback } = useFeedback();
  const [activeMode, setActiveMode] = useState<'HUB' | 'HOME_EDITOR' | 'NAVIGATION_EDITOR'>('HUB');
  
  // Home Editor States
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('HERO');
  const [sections, setSections] = useState<any[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [pickerTarget, setPickerTarget] = useState<{ type: 'form' | 'category', id?: string, field: string } | null>(null);

  const defaultContent = {
    hero_title: '', hero_subtitle: '', hero_button_text: '', hero_button_link: '',
    hero_image_url: '', hero_video_url: '', hero_alignment: 'center', hero_horizontal_alignment: 'center',
    hero_show_button: true,
    about_title: '', about_text: '', about_image_url: '', about_layout: 'right',
    about_show_button: false, about_button_text: 'Saber Más', about_button_link: '/contacto',
    cta_title: '', cta_subtitle: '', cta_button_text: '', cta_button_link: '',
    seo_title: '', seo_description: '', seo_keywords: '',
    home_sections_order: ''
  };

  const [formData, setFormData] = useState<any>(defaultContent);
  const [categories, setCategories] = useState<any[]>([]); 
  const [services, setServices] = useState<any[]>([]);

  // Navigation Editor States
  const [navigationItems, setNavigationItems] = useState<any[]>([]);
  const [loadingNav, setLoadingNav] = useState(false);
  const [savingNav, setSavingNav] = useState(false);

  // Megamenu Editor States
  const [navTab, setNavTab] = useState<'links' | 'megamenu'>('links');
  const [megamenuLayout, setMegamenuLayout] = useState<'bento' | 'directory'>('bento');
  const [megamenuCategories, setMegamenuCategories] = useState<string[] | null>(null);
  const [savingMegamenu, setSavingMegamenu] = useState(false);
  const [previewActiveCategory, setPreviewActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchContent();
    fetchNavigation();
  }, []);

  const memoizedPreview = useMemo(() => (
    <HomeBuilderPreview 
      formData={formData}
      categories={categories}
      services={services}
    />
  ), [formData, categories, services]);

  const fetchContent = async () => {
    try {
      const [resContent, resCats, resServices] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/site-content/`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/service-categories/`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/services/`)
      ]);
      
      if (resContent.ok && resCats.ok && resServices.ok) {
        const data = await resContent.json();
        const cats = await resCats.json();
        const svcs = await resServices.json();
        
        setFormData(data);
        setCategories(cats);
        setServices(svcs);
        if (cats.length > 0) setSelectedCategoryId(cats[0].id);

        // Configurar megamenu
        setMegamenuLayout(data.megamenu_layout || 'bento');
        setMegamenuCategories(data.megamenu_categories_json);
        const activeCats = cats.filter((c: any) => c.is_active);
        if (activeCats.length > 0) {
          setPreviewActiveCategory(activeCats[0].id);
        }

        // Configurar secciones para la preview visual
        const baseSections = [
          { id: 'hero', type: 'hero', label: 'Portada Principal (Hero)', locked: true },
          { id: 'about', type: 'about', label: 'Sobre la Clínica', locked: false },
          { id: 'cta', type: 'cta', label: 'Llamada a la Acción', locked: false },
          { id: 'seo', type: 'seo', label: 'SEO', locked: true }
        ];

        const catSections = cats.map((c: any) => ({
          id: c.id,
          type: 'category',
          label: c.name,
          locked: false
        }));

        const allAvailable = [...baseSections, ...catSections];
        let ordered: any[] = [];

        if (data.home_sections_order) {
           try {
              const savedOrder = JSON.parse(data.home_sections_order);
              savedOrder.forEach((id: string) => {
                const found = allAvailable.find(s => s.id === id);
                if (found) ordered.push(found);
              });
              allAvailable.forEach(s => {
                if (!ordered.find(o => o.id === s.id)) ordered.push(s);
              });
           } catch {
              ordered = [baseSections[0], baseSections[1], ...catSections, baseSections[2], baseSections[3]];
           }
        } else {
           ordered = [baseSections[0], baseSections[1], ...catSections, baseSections[2], baseSections[3]];
        }
        
        const hero = ordered.find(s => s.id === 'hero');
        const seo = ordered.find(s => s.id === 'seo');
        const middle = ordered.filter(s => s.id !== 'hero' && s.id !== 'seo');
        
        setSections([hero, ...middle, seo]);
      }
    } catch (err) {
      console.error("Error cargando el CMS", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchNavigation = async () => {
    setLoadingNav(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cms/navigation`);
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

  const handleSave = async () => {
    setSaving(true);
    try {
      // 1. Guardar orden global y site-content
      const orderToSave = sections.map(s => s.id);
      const payload = {
        ...formData,
        home_sections_order: JSON.stringify(orderToSave)
      };

      const resContent = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/site-content/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      // 2. Sincronizar reordenamiento de categorías
      const categoryItems = sections.filter(s => s.type === 'category');
      const reorderPayload = categoryItems.map((c, index) => ({
         id: c.id,
         order_index: index
      }));
      
      if (reorderPayload.length > 0) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/service-categories/reorder`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(reorderPayload)
        });
      }

      // 3. Guardar metadatos de las categorías que pudieron haber sido editados
      const categoryPromises = categories.map(cat => 
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/service-categories/${cat.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
             name: cat.name,
             description: cat.description,
             image_url: cat.image_url,
             is_active: cat.is_active,
             layout_preferences: cat.layout_preferences
          })
        })
      );
      await Promise.all(categoryPromises);

      if (resContent.ok) {
        showFeedback({ type: 'success', title: 'Home Guardada', message: 'Contenido, orden y categorías actualizados.' });
      } else {
        throw new Error('Falló al guardar site content');
      }
    } catch (err) {
      console.error(err);
      showFeedback({ type: 'error', title: 'Error', message: 'No se pudo guardar correctamente.' });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNavigation = async () => {
    setSavingNav(true);
    try {
      // 1. Guardar etiquetas y visibilidad por enlace
      const promises = navigationItems.map(item => 
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/cms/navigation/${item.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
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
        headers: { 'Content-Type': 'application/json' },
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

  const toggleMegamenuCategory = (categoryId: string) => {
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

  const handleSaveMegamenu = async () => {
    setSavingMegamenu(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/site-content/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          megamenu_layout: megamenuLayout,
          megamenu_categories_json: megamenuCategories
        })
      });
      if (res.ok) {
        const updatedData = await res.json();
        setFormData(updatedData);
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

  const handleImageSelected = (url: string) => {
    if (!pickerTarget) return;

    if (pickerTarget.type === 'form') {
      setFormData((prev: any) => ({ ...prev, [pickerTarget.field]: url }));
    } else if (pickerTarget.type === 'category' && pickerTarget.id) {
      setCategories(prev => prev.map(cat => 
        cat.id === pickerTarget.id ? { ...cat, [pickerTarget.field]: url } : cat
      ));
    }
    setPickerTarget(null);
  };

  const handleCategoryChange = (id: string, field: string, value: any) => {
    setCategories(prev => prev.map(cat => 
      cat.id === id ? { ...cat, [field]: value } : cat
    ));
    
    if (field === 'name') {
      setSections(prev => prev.map(sec => 
        sec.id === id ? { ...sec, label: value } : sec
      ));
    }
  };

  const moveNavItem = (index: number, direction: 'up' | 'down') => {
    const updated = [...navigationItems];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= updated.length) return;
    
    // Intercambiar
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

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'HERO':
        return (
          <HeroTab 
            formData={formData} 
            setFormData={setFormData} 
            setPickerTarget={setPickerTarget} 
          />
        );
      case 'SOBRE MÍ':
        return (
          <AboutTab 
            formData={formData} 
            setFormData={setFormData} 
            setPickerTarget={setPickerTarget} 
          />
        );
      case 'CATEGORÍAS':
        return (
          <CategoriesTab 
            initialCategories={categories}
            setCategories={setCategories}
            selectedCategoryId={selectedCategoryId}
            setSelectedCategoryId={setSelectedCategoryId}
            setPickerTarget={setPickerTarget}
            handleCategoryChange={handleCategoryChange}
            formData={formData}
            setFormData={setFormData}
          />
        );
      case 'CTA':
        return (
          <CtaTab 
            formData={formData} 
            setFormData={setFormData} 
          />
        );
      case 'SEO':
        return (
          <SeoTab 
            formData={formData} 
            setFormData={setFormData} 
          />
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <Skeleton className="h-20 w-full mb-8 rounded-3xl" />
        <Skeleton className="h-[600px] w-full rounded-3xl" />
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // MODO 1: HUB PRINCIPAL (Bento Grid Quiet Luxury 2026)
  // ─────────────────────────────────────────────────────────────────────────
  if (activeMode === 'HUB') {
    return <CmsHub onSelectMode={setActiveMode} />;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // MODO 2: EDITOR DE HOME (split layout existente)
  // ─────────────────────────────────────────────────────────────────────────
  if (activeMode === 'HOME_EDITOR') {
    return (
      <div className="animate-in fade-in duration-500">
        <HomeBuilderLayout 
          isSaving={saving}
          onSave={handleSave}
          tabs={TABS}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          panel={renderActiveTabContent()}
          preview={memoizedPreview}
          onBack={() => setActiveMode('HUB')}
        />
        
        {/* Selector de Medios */}
        {pickerTarget && (
          <MediaPickerModal
            onClose={() => setPickerTarget(null)}
            onImageSelected={handleImageSelected}
            mediaType={pickerTarget.field === 'hero_video_url' ? 'video' : 'image'}
          />
        )}
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // MODO 3: EDITOR DE NAVEGACIÓN Y MEGAMENÚ (Navbar Manager visual con Pestañas)
  // ─────────────────────────────────────────────────────────────────────────
  if (activeMode === 'NAVIGATION_EDITOR') {
    const isSavingNavOrMegamenu = navTab === 'links' ? savingNav : savingMegamenu;

    const handleSaveClick = () => {
      if (navTab === 'links') {
        handleSaveNavigation();
      } else {
        handleSaveMegamenu();
      }
    };

    return (
      <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-[#FAFAFA] w-full animate-in fade-in duration-300">
        
        {/* ─── PANEL IZQUIERDO: Configuración (Enlaces / Megamenú) ───────────── */}
        <aside className="w-full md:w-[35%] md:min-w-[400px] md:max-w-[500px] h-full bg-white border-r border-stone-200 flex flex-col shadow-sm overflow-hidden shrink-0 z-20">
          
          {/* Header */}
          <div className="px-6 py-5 border-b border-stone-100 flex items-center gap-4 shrink-0">
            <button 
              onClick={() => setActiveMode('HUB')}
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
              />
            ) : (
              <MegamenuEditorTab
                megamenuLayout={megamenuLayout}
                setMegamenuLayout={setMegamenuLayout}
                megamenuCategories={megamenuCategories}
                setMegamenuCategories={setMegamenuCategories}
                categories={categories}
                toggleMegamenuCategory={toggleMegamenuCategory}
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
          settings={formData}
        />

      </div>
    );
  }

  return null;
}

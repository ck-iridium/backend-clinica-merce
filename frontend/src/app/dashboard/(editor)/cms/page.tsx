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
    return (
      <div className="min-h-screen bg-[#F7F7F5] py-16 px-6 md:px-12 overflow-y-auto w-full animate-in fade-in duration-500">
        
        {/* Header de Lujo */}
        <div className="max-w-5xl mx-auto mb-16 text-left">
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#d4af37] block mb-2">
            Gestión Avanzada ProBookia
          </span>
          <h1 className="font-serif text-4xl md:text-5xl font-extrabold text-stone-800 tracking-tight leading-none mb-4">
            Gestor de Contenido (CMS)
          </h1>
          <p className="text-stone-500 font-sans text-sm md:text-base max-w-2xl leading-relaxed">
            Personaliza la presencia digital de tu clínica. Administra de forma visual el contenido y orden de tu portada principal, configura la barra de navegación del sitio o ajusta los parámetros estéticos generales.
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Card 1: Portada Principal */}
          <div 
            onClick={() => setActiveMode('HOME_EDITOR')}
            className="bg-white rounded-3xl p-8 border border-stone-100 shadow-[0_10px_35px_-10px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-500 flex flex-col justify-between h-[340px] cursor-pointer group relative overflow-hidden"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold text-[#d4af37] bg-amber-50 px-3 py-1 rounded-full uppercase tracking-wider">
                  Home Builder
                </span>
                <svg className="w-5 h-5 text-stone-300 group-hover:text-[#d4af37] transition-colors" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
              </div>
              <h3 className="font-serif text-2xl font-bold text-stone-800 mb-3 group-hover:text-[#d4af37] transition-colors">
                Portada Principal
              </h3>
              <p className="text-stone-500 font-sans text-xs md:text-sm leading-relaxed max-w-sm">
                Modifica interactivamente el Hero de bienvenida, sección sobre la clínica, carruseles de categorías y tratamientos, e inyecta parámetros SEO exclusivos.
              </p>
            </div>
            
            <div className="flex items-center gap-2 text-stone-800 font-bold text-xs uppercase tracking-wider">
              <span>Editar Portada</span>
              <span className="transform group-hover:translate-x-1 transition-transform duration-300">→</span>
            </div>
          </div>

          {/* Card 2: Menú de Navegación */}
          <div 
            onClick={() => setActiveMode('NAVIGATION_EDITOR')}
            className="bg-white rounded-3xl p-8 border border-stone-100 shadow-[0_10px_35px_-10px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-500 flex flex-col justify-between h-[340px] cursor-pointer group relative overflow-hidden"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold text-[#d4af37] bg-amber-50 px-3 py-1 rounded-full uppercase tracking-wider">
                  Menú Dinámico
                </span>
                <svg className="w-5 h-5 text-stone-300 group-hover:text-[#d4af37] transition-colors" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              </div>
              <h3 className="font-serif text-2xl font-bold text-stone-800 mb-3 group-hover:text-[#d4af37] transition-colors">
                Menú de Navegación
              </h3>
              <p className="text-stone-500 font-sans text-xs md:text-sm leading-relaxed max-w-sm">
                Edita las etiquetas, el orden y la visibilidad de los enlaces principales de tu barra superior para adaptarla a tus campañas o tratamientos destacados.
              </p>
            </div>
            
            <div className="flex items-center gap-2 text-stone-800 font-bold text-xs uppercase tracking-wider">
              <span>Gestionar Enlaces</span>
              <span className="transform group-hover:translate-x-1 transition-transform duration-300">→</span>
            </div>
          </div>

          {/* Card 3: Estilo & Branding */}
          <Link
            href="/dashboard/settings?tab=branding"
            className="bg-white rounded-3xl p-8 border border-stone-100 shadow-[0_10px_35px_-10px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-500 flex flex-col justify-between h-[280px] cursor-pointer group relative overflow-hidden"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold text-[#d4af37] bg-amber-50 px-3 py-1 rounded-full uppercase tracking-wider">
                  Estilo & Branding
                </span>
                <svg className="w-5 h-5 text-stone-300 group-hover:text-[#d4af37] transition-colors" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-3.078 0L3.72 17.5a1 1 0 001.48 1.135L8 17l2.8 1.635a1 1 0 001.48-1.135l-2.732-1.378z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v13m0-13L8 7m4-4l4 4" />
                </svg>
              </div>
              <h3 className="font-serif text-2xl font-bold text-stone-800 mb-3 group-hover:text-[#d4af37] transition-colors">
                Tipografía & Colores
              </h3>
              <p className="text-stone-500 font-sans text-xs md:text-sm leading-relaxed max-w-sm">
                Configura los tokens estéticos globales: selecciona paletas de lujo, colores de acento y tipografías premium como Playfair Display e Inter.
              </p>
            </div>
            
            <div className="flex items-center gap-2 text-stone-800 font-bold text-xs uppercase tracking-wider">
              <span>Configurar Estilos</span>
              <span className="transform group-hover:translate-x-1 transition-transform duration-300">→</span>
            </div>
          </Link>

          {/* Card 4: Páginas Independientes */}
          <Link
            href="/dashboard/pages"
            className="bg-white rounded-3xl p-8 border border-stone-100 shadow-[0_10px_35px_-10px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-500 flex flex-col justify-between h-[280px] cursor-pointer group relative overflow-hidden"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold text-[#d4af37] bg-amber-50 px-3 py-1 rounded-full uppercase tracking-wider">
                  Gestor Headless
                </span>
                <svg className="w-5 h-5 text-stone-300 group-hover:text-[#d4af37] transition-colors" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <h3 className="font-serif text-2xl font-bold text-stone-800 mb-3 group-hover:text-[#d4af37] transition-colors">
                Páginas del Sitio
              </h3>
              <p className="text-stone-500 font-sans text-xs md:text-sm leading-relaxed max-w-sm">
                Crea nuevas páginas autónomas para tu portal como políticas de privacidad, landing pages estacionales o secciones de promociones.
              </p>
            </div>
            <div className="flex items-center gap-2 text-stone-800 font-bold text-xs uppercase tracking-wider">
              <span>Gestionar Páginas</span>
              <span className="transform group-hover:translate-x-1 transition-transform duration-300">→</span>
            </div>
          </Link>

        </div>

      </div>
    );
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
  // MODO 3: EDITOR DE NAVEGACIÓN (Navbar Manager visual e interactivo)
  // ─────────────────────────────────────────────────────────────────────────
  if (activeMode === 'NAVIGATION_EDITOR') {
    return (
      <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-[#FAFAFA] w-full animate-in fade-in duration-300">
        
        {/* ─── PANEL IZQUIERDO: Listado de Enlaces ───────────────────────────── */}
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
              onClick={handleSaveNavigation}
              disabled={savingNav}
              className="bg-stone-900 hover:bg-[#d4af37] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-30 shadow-sm shrink-0"
            >
              {savingNav ? 'Guardando...' : 'Guardar'}
            </button>
          </div>

          {/* Listado de Enlaces */}
          <div className="flex-1 overflow-y-auto p-6 bg-stone-50/20 space-y-4">
            <p className="text-xs text-stone-400 font-medium mb-2">
              Ordena y renombra los elementos. Puedes ocultar apartados haciendo clic en el icono del ojo.
            </p>
            
            {loadingNav ? (
              <div className="space-y-4 pt-4">
                <Skeleton className="h-14 w-full rounded-2xl" />
                <Skeleton className="h-14 w-full rounded-2xl" />
                <Skeleton className="h-14 w-full rounded-2xl" />
              </div>
            ) : (
              <div className="space-y-3">
                {navigationItems.map((item, index) => (
                  <div 
                    key={item.id} 
                    className={`flex items-center gap-3 bg-white p-4 rounded-2xl border transition-all duration-300 ${
                      item.is_visible 
                        ? 'border-stone-100 shadow-[0_4px_12px_rgba(0,0,0,0.01)]' 
                        : 'border-stone-100 opacity-60 bg-stone-50/50'
                    }`}
                  >
                    {/* Flechas de ordenamiento */}
                    <div className="flex flex-col gap-1 shrink-0">
                      <button 
                        onClick={() => moveNavItem(index, 'up')}
                        disabled={index === 0}
                        className="text-stone-300 hover:text-stone-600 disabled:opacity-20 p-0.5 rounded transition-all"
                        title="Subir"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => moveNavItem(index, 'down')}
                        disabled={index === navigationItems.length - 1}
                        className="text-stone-300 hover:text-stone-600 disabled:opacity-20 p-0.5 rounded transition-all"
                        title="Bajar"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                      </button>
                    </div>

                    {/* Label Editable */}
                    <div className="flex-1 min-w-0">
                      <input 
                        type="text" 
                        value={item.label}
                        onChange={(e) => updateNavItemLabel(index, e.target.value)}
                        className="w-full bg-transparent border-b border-transparent hover:border-stone-200 focus:border-[#d4af37] focus:outline-none py-1 text-sm text-stone-800 font-bold tracking-tight"
                      />
                      <span className="text-[10px] text-stone-400 font-bold block">
                        Ruta: <code className="bg-stone-50 px-1.5 py-0.5 rounded font-mono text-[9px]">{item.path}</code>
                      </span>
                    </div>

                    {/* Ojo de Visibilidad */}
                    <button 
                      onClick={() => toggleNavItemVisibility(index)}
                      className={`p-2 rounded-xl transition-all border shrink-0 ${
                        item.is_visible 
                          ? 'text-[#d4af37] bg-amber-50/50 border-amber-100 hover:bg-amber-50' 
                          : 'text-stone-400 bg-stone-50 border-stone-200 hover:bg-stone-100'
                      }`}
                      title={item.is_visible ? "Ocultar en web pública" : "Mostrar en web pública"}
                    >
                      {item.is_visible ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      )}
                    </button>

                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* ─── PANEL DERECHO: Live Header Preview ─────────────────────────────── */}
        <div className="hidden md:flex flex-1 h-full items-center justify-center bg-stone-100/60 p-12 overflow-y-auto relative">
          
          <div className="absolute top-0 left-0 right-0 z-20 bg-white/80 backdrop-blur-md border-b border-stone-200 px-8 py-3 flex items-center gap-3 shadow-sm">
            <span className="text-xs font-black uppercase tracking-widest text-stone-500">
              Previsualización del Menú
            </span>
            <div className="ml-auto flex gap-1.5 items-center">
              <div className="w-2.5 h-2.5 rounded-full bg-stone-300" />
              <div className="w-2.5 h-2.5 rounded-full bg-stone-300" />
              <div className="w-2.5 h-2.5 rounded-full bg-stone-300" />
            </div>
          </div>

          {/* Header Mockup */}
          <div className="w-full max-w-2xl bg-white border border-stone-200 rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.06)] animate-in zoom-in-95 duration-500">
            
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-400 block mb-6 text-center">
              VISTA PÚBLICA EN VIVO
            </span>

            <div className="flex items-center justify-between border-b border-stone-100 pb-5">
              {/* Logo Mock */}
              <div className="font-serif text-[#d4af37] font-bold text-lg leading-none">
                Clínica Mercè
              </div>

              {/* Menu Links Mock */}
              <div className="flex items-center gap-6">
                {navigationItems
                  .filter(item => item.is_visible)
                  .map(item => (
                    <span 
                      key={item.id} 
                      className="text-stone-600 hover:text-stone-900 text-xs font-bold transition-all cursor-default"
                    >
                      {item.label}
                    </span>
                  ))
                }
              </div>

              {/* Action Button Mock */}
              <div className="bg-[#d4af37] text-white px-4 py-1.5 rounded-full text-[11px] font-bold shadow-sm cursor-default">
                Reservar
              </div>
            </div>
            
            <div className="text-[10px] text-stone-400 text-center mt-6">
              El menú superior se actualizará en tiempo real y soportará traducciones locales de forma automática.
            </div>

          </div>

        </div>

      </div>
    );
  }

  return null;
}

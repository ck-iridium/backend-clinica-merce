"use client"
import React, { useState, useEffect, useMemo } from 'react';
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('HERO');

  // Preview Order State
  const [sections, setSections] = useState<any[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  // Media Picker state generalizado
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
  const [categories, setCategories] = useState<any[]>([]); // Fuente de verdad (Preview y Save)
  const [services, setServices] = useState<any[]>([]);

  useEffect(() => {
    fetchContent();
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
          method: 'POST', // Modificado a POST como medida anti-CORS
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
             is_active: cat.is_active
          })
        })
      );
      await Promise.all(categoryPromises);

      if (resContent.ok) {
        showFeedback({ type: 'success', title: 'Home Guardada', message: 'Contenido, orden y categorías actualizados.' });
        // Recargar los datos localmente para asegurar sincronía, opcional
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
    
    // También actualizar la etiqueta en la sección de preview si cambia el nombre
    if (field === 'name') {
      setSections(prev => prev.map(sec => 
        sec.id === id ? { ...sec, label: value } : sec
      ));
    }
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

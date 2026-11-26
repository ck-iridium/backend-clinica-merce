"use client";
import { useState, useEffect } from 'react';
import { useFeedback } from '@/app/contexts/FeedbackContext';
import { getAuthHeaders } from '../utils/auth';

export const defaultContent: any = {
  hero_title: '', hero_subtitle: '', hero_button_text: '', hero_button_link: '',
  hero_image_url: '', hero_video_url: '', hero_alignment: 'center', hero_horizontal_alignment: 'center',
  hero_content_fullwidth: false,
  hero_title_size: 'large',
  hero_subtitle_size: 'medium',
  hero_show_button: true,
  hero_responsive_config: {},
  about_title: '', about_text: '', about_image_url: '', about_layout: 'right',
  about_show_button: false, about_button_text: 'Saber Más', about_button_link: '/contacto',
  cta_title: '', cta_subtitle: '', cta_button_text: '', cta_button_link: '',
  seo_title: '', seo_description: '', seo_keywords: '',
  home_sections_order: '',
  featured_services_config: {
    enabled: false,
    title: 'Tratamientos Estrella',
    subtitle: 'Nuestra selección más demandada para una experiencia de cuidado y bienestar excepcional.',
    service_ids: [],
    layout_style: 'bento',
    show_price: true,
    show_duration: true
  },
  categories_catalog_config: {
    enabled: false,
    title: 'Nuestras Especialidades',
    subtitle: 'Explora todas las áreas de cuidado y tratamientos diseñados para tu bienestar.',
    layout_style: 'bento',
    show_services_count: true,
    hide_individual_sections: false
  }
};

export function useCmsHome() {
  const { showFeedback } = useFeedback();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('HERO');
  const [viewportDevice, setViewportDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [sections, setSections] = useState<any[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const [formData, setFormData] = useState<any>(defaultContent);
  const [categories, setCategories] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const headers = getAuthHeaders();
      const [resContent, resCats, resServices, resSettings] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/site-content/`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/service-categories/`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/services/`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/`, { headers })
      ]);
      
      let data: any = defaultContent;
      let cats: any[] = [];
      let svcs: any[] = [];

      if (resContent.ok) {
        data = await resContent.json();
        setFormData(data);
      }
      if (resCats.ok) {
        cats = await resCats.json();
        setCategories(cats);
        if (cats.length > 0) setSelectedCategoryId(cats[0].id);
      }
      if (resServices.ok) {
        svcs = await resServices.json();
        setServices(svcs);
      }
      if (resSettings && resSettings.ok) {
        const settingsData = await resSettings.json();
        setSettings(settingsData);
      }

      // Configurar secciones para la preview visual y ordenamiento
      const baseSections = [
        { id: 'hero', type: 'hero', label: 'Portada Principal (Hero)', locked: true },
        { id: 'featured', type: 'featured', label: '⭐ Tratamientos Destacados', locked: false },
        { id: 'categories_catalog', type: 'categories_catalog', label: '📂 Mosaico de Categorías', locked: false },
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

      if (data?.home_sections_order) {
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
    } catch (err) {
      console.error("Error cargando el CMS", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const authHeaders = getAuthHeaders();

      // 1. Guardar orden global y site-content
      const orderToSave = sections.map(s => s.id);
      const payload = {
        ...formData,
        home_sections_order: JSON.stringify(orderToSave)
      };

      const resContent = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/site-content/`, {
        method: 'PATCH',
        headers: authHeaders,
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
          headers: authHeaders,
          body: JSON.stringify(reorderPayload)
        });
      }

      // 3. Guardar metadatos de las categorías que pudieron haber sido editados
      const categoryPromises = categories.map(cat => 
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/service-categories/${cat.id}`, {
          method: 'PATCH',
          headers: authHeaders,
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

  return {
    loading,
    saving,
    activeTab,
    setActiveTab,
    viewportDevice,
    setViewportDevice,
    sections,
    setSections,
    selectedCategoryId,
    setSelectedCategoryId,
    formData,
    setFormData,
    categories,
    setCategories,
    services,
    settings,
    fetchContent,
    handleSave,
    handleCategoryChange
  };
}

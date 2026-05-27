"use client"

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Sparkles, Settings2, Palette, Globe } from 'lucide-react';
import MediaPickerModal from '@/components/MediaPickerModal';
import Showcase3DPreview, { MappedPreviewSector } from './Showcase3DPreview';
import SaaSCMSHeroForm from './SaaSCMSHeroForm';
import SaaSCMSSectorList, { ShowcaseSector } from './SaaSCMSSectorList';
import SaaSCMSSectorForm from './SaaSCMSSectorForm';

interface SaaSCMSManagerProps {
  token: string;
}

interface MarketingSettings {
  hero_title: string;
  hero_subtitle: string;
  logo_svg?: string | null;
  primary_color?: string | null;
  secondary_color?: string | null;
  tertiary_color?: string | null;
  font_family?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
  seo_keywords?: string | null;
}

export default function SaaSCMSManager({ token }: SaaSCMSManagerProps) {
  const [subTab, setSubTab] = useState<'hero' | 'sectors' | 'branding' | 'seo'>('hero');
  const [loading, setLoading] = useState(false);
  
  // Settings state
  const [settings, setSettings] = useState<MarketingSettings>({
    hero_title: 'La elegancia de tu negocio traducida en un SaaS de Lujo',
    hero_subtitle: 'Diseñado exclusivamente para centros de estética, wellness, spas y salones premium independientes.',
    logo_svg: null,
    primary_color: '#3b82f6',
    secondary_color: '#1c1917',
    tertiary_color: '#d4af37',
    font_family: 'playfair_inter',
    seo_title: '',
    seo_description: '',
    seo_keywords: ''
  });
  const [savingSettings, setSavingSettings] = useState(false);

  // Sectors state
  const [sectors, setSectors] = useState<ShowcaseSector[]>([]);
  const [loadingSectors, setLoadingSectors] = useState(false);
  
  // CRUD state variables
  const [isAddingSector, setIsAddingSector] = useState(false);
  const [editingSector, setEditingSector] = useState<ShowcaseSector | null>(null);
  const [sectorToDelete, setSectorToDelete] = useState<ShowcaseSector | null>(null);
  
  const [sectorFormData, setSectorFormData] = useState({
    title: '',
    slug: '',
    badge_text: '',
    video_url: '',
    image_url: '',
    order_index: 0
  });
  const [submittingSector, setSubmittingSector] = useState(false);

  // Media Picker Dialog target
  const [pickerTarget, setPickerTarget] = useState<{ field: 'video_url' | 'image_url' } | null>(null);

  // Preview Navigation States
  const [previewIndex, setPreviewIndex] = useState(0);
  const [previewAnimating, setPreviewAnimating] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const fallbackSectors: MappedPreviewSector[] = [
    {
      id: 'clinicas',
      badge: 'Clínicas Estéticas',
      title: 'Clínicas & Wellness',
      copy: 'Aislamiento total de expedientes clínicos en base de datos, firmas manuscritas Base64 y branding de lujo.',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-dermatologist-examining-a-patients-face-with-magnifier-40545-large.mp4',
      placeholderGradient: 'from-blue-50 to-blue-100/30'
    },
    {
      id: 'barberias',
      badge: 'Barberías Selectas',
      title: 'Barberías Premium',
      copy: 'Gestión ágil de especialistas en tiempo real, venta de bonos express y protección total contra incomparecencias.',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-barber-shaving-a-man-with-a-razor-41223-large.mp4',
      placeholderGradient: 'from-amber-50 to-amber-100/30'
    },
    {
      id: 'dentistas',
      badge: 'Odontología Avanzada',
      title: 'Consultorios Dentales',
      copy: 'Calendarios dinámicos asimétricos, cobros rápidos en POS y recordatorios automáticos por SMTP privado.',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-dentist-adjusting-a-surgical-light-in-clinic-40549-large.mp4',
      placeholderGradient: 'from-emerald-50 to-emerald-100/30'
    },
    {
      id: 'peluquerias',
      badge: 'Salones de Alta Costura',
      title: 'Salones de Belleza',
      copy: 'Portal de reserva en 3 pasos con colores y logotipos propios, adaptable a dominio exclusivo corporativo.',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hairdresser-cutting-hair-of-a-woman-in-salon-40552-large.mp4',
      placeholderGradient: 'from-purple-50 to-purple-100/30'
    }
  ];

  useEffect(() => {
    if (token) {
      fetchSettings();
      fetchSectors();
    }
  }, [token]);

  // --- API OPERATIONS: SETTINGS ---
  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/super-admin/marketing/settings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Error al obtener ajustes de marketing');
      const data = await response.json();
      if (data && data.hero_title) {
        setSettings(data);
      }
    } catch (err: any) {
      console.error(err);
      toast.error('No se pudo cargar la configuración de la landing. Usando plantillas.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    const toastId = toast.loading('Guardando configuración...');
    try {
      const response = await fetch(`${API_URL}/super-admin/marketing/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });
      if (!response.ok) throw new Error('Error al guardar ajustes de marketing');
      const data = await response.json();
      setSettings(data);
      toast.success('¡Ajustes de la plataforma actualizados con éxito!', { id: toastId });
    } catch (err: any) {
      console.error(err);
      toast.error('Error al guardar los ajustes de la landing.', { id: toastId });
    } finally {
      setSavingSettings(false);
    }
  };

  // --- API OPERATIONS: SECTORS ---
  const fetchSectors = async () => {
    setLoadingSectors(true);
    try {
      const response = await fetch(`${API_URL}/super-admin/marketing/sectors`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Error al obtener la lista de sectores');
      const data = await response.json();
      setSectors(data);
    } catch (err: any) {
      console.error(err);
      toast.error('No se pudieron cargar los sectores del Showcase.');
    } finally {
      setLoadingSectors(false);
    }
  };

  const openAddSector = () => {
    setEditingSector(null);
    setIsAddingSector(true);
    setSectorFormData({
      title: '',
      slug: '',
      badge_text: '',
      video_url: '',
      image_url: '',
      order_index: sectors.length
    });
  };

  const openEditSector = (sector: ShowcaseSector) => {
    setIsAddingSector(false);
    setEditingSector(sector);
    setSectorFormData({
      title: sector.title,
      slug: sector.slug,
      badge_text: sector.badge_text || '',
      video_url: sector.video_url || '',
      image_url: sector.image_url || '',
      order_index: sector.order_index
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'slug') {
      const cleanSlug = value
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-');
      setSectorFormData(prev => ({ ...prev, [name]: cleanSlug }));
    } else {
      setSectorFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSectorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sectorFormData.title || !sectorFormData.slug) {
      toast.error('El título y el slug son campos obligatorios.');
      return;
    }

    setSubmittingSector(true);
    const toastId = toast.loading(editingSector ? 'Actualizando sector...' : 'Creando nuevo sector...');
    
    try {
      const url = editingSector 
        ? `${API_URL}/super-admin/marketing/sectors/${editingSector.id}`
        : `${API_URL}/super-admin/marketing/sectors`;
      
      const method = editingSector ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: sectorFormData.title,
          slug: sectorFormData.slug,
          badge_text: sectorFormData.badge_text || null,
          video_url: sectorFormData.video_url || null,
          image_url: sectorFormData.image_url || null,
          order_index: Number(sectorFormData.order_index)
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Error al procesar la operación de sectores');
      }

      toast.success(editingSector ? 'Sector actualizado con éxito.' : 'Nuevo sector registrado.', { id: toastId });
      setEditingSector(null);
      setIsAddingSector(false);
      fetchSectors();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Error al guardar el sector.', { id: toastId });
    } finally {
      setSubmittingSector(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!sectorToDelete) return;
    const toastId = toast.loading('Eliminando sector del Showcase...');
    try {
      const response = await fetch(`${API_URL}/super-admin/marketing/sectors/${sectorToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Error al eliminar sector');
      toast.success(`Sector "${sectorToDelete.title}" eliminado correctamente.`, { id: toastId });
      setSectorToDelete(null);
      fetchSectors();
    } catch (err: any) {
      console.error(err);
      toast.error('No se pudo eliminar el sector.', { id: toastId });
    }
  };

  const handlePreviewNavigate = (newIndex: number) => {
    if (previewAnimating) return;
    setPreviewAnimating(true);
    
    // 200ms slide down index change
    setTimeout(() => {
      setPreviewIndex(newIndex);
    }, 200);

    // 400ms slide up transition complete
    setTimeout(() => {
      setPreviewAnimating(false);
    }, 600);
  };

  // --- MATHEMATICAL 3D RENDER INTERPOLATION ---
  const sectorsForPreview = isAddingSector 
    ? [...sectors, {
        id: 'temp-adding',
        title: sectorFormData.title || 'Nuevo Sector',
        slug: sectorFormData.slug || 'nuevo-sector',
        badge_text: sectorFormData.badge_text || 'Borrador',
        video_url: sectorFormData.video_url || '',
        image_url: sectorFormData.image_url || '',
        order_index: sectors.length
      }]
    : sectors.map(s => {
        if (editingSector && s.id === editingSector.id) {
          return {
            ...s,
            title: sectorFormData.title,
            slug: sectorFormData.slug,
            badge_text: sectorFormData.badge_text || null,
            video_url: sectorFormData.video_url || null,
            image_url: sectorFormData.image_url || null,
            order_index: Number(sectorFormData.order_index)
          };
        }
        return s;
      });

  const mappedSectors = sectorsForPreview.map((s, index) => {
    let gradient = 'from-blue-50 to-blue-100/30';
    if (s.order_index === 1 || index === 1) gradient = 'from-amber-50 to-amber-100/30';
    else if (s.order_index === 2 || index === 2) gradient = 'from-emerald-50 to-emerald-100/30';
    else if (s.order_index === 3 || index === 3) gradient = 'from-purple-50 to-purple-100/30';

    let copy = 'Configura tu plataforma en marca blanca de alta gama con subdominio exclusivo y RLS a nivel de base de datos.';
    if (s.slug === 'clinicas') copy = 'Aislamiento total de expedientes clínicos en base de datos, firmas manuscritas Base64 y branding de lujo.';
    else if (s.slug === 'barberias') copy = 'Gestión ágil de especialistas en tiempo real, venta de bonos express y protección total contra incomparecencias.';
    else if (s.slug === 'dentistas') copy = 'Calendarios dinámicos asimétricos, cobros rápidos en POS y recordatorios automáticos por SMTP privado.';
    else if (s.slug === 'peluquerias') copy = 'Portal de reserva en 3 pasos con colores y logotipos propios, adaptable a dominio exclusivo corporativo.';

    return {
      id: s.id,
      badge: s.badge_text || 'Especialidad',
      title: s.title,
      copy: copy,
      videoUrl: s.video_url || 'https://assets.mixkit.co/videos/preview/mixkit-hairdresser-cutting-hair-of-a-woman-in-salon-40552-large.mp4',
      imageUrl: s.image_url || '',
      placeholderGradient: gradient
    };
  });

  const previewSectors = mappedSectors.length >= 4 ? mappedSectors : fallbackSectors;

  return (
    <div className="flex-1 flex h-[calc(100vh-80px)] w-full overflow-hidden bg-stone-50 select-none">
      
      {/* 1. LEFT SIDEBAR CONTROL PANEL */}
      <div className="w-[420px] h-full bg-white border-r border-stone-200/60 flex flex-col shrink-0">
        
        {/* Sidebar Header */}
        <div className="p-6 border-b border-stone-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-stone-900 text-white flex items-center justify-center font-serif text-sm font-semibold">
              P
            </div>
            <div>
              <h3 className="font-serif text-sm font-bold text-stone-955">Editor de Portada</h3>
              <p className="text-[9px] text-stone-450 font-semibold tracking-wider uppercase">SaaS Marketing CMS</p>
            </div>
          </div>
          <span className="bg-[#fcf8e5] text-[#d4af37] text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-[#d4af37]/20">
            SuperAdmin
          </span>
        </div>

        {/* Tab Selectors inside Sidebar */}
        <div className="grid grid-cols-4 border-b border-stone-100 text-center text-[10px] md:text-xs font-bold text-stone-400 bg-stone-50/50 font-sans shrink-0">
          <button 
            onClick={() => {
              setSubTab('hero');
              setEditingSector(null);
              setIsAddingSector(false);
            }}
            className={`py-3.5 border-r border-stone-100 transition-colors flex items-center justify-center gap-1 ${
              subTab === 'hero' ? 'bg-white text-stone-900 border-b-2 border-[#d4af37]' : 'hover:bg-white/50'
            }`}
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>Portada</span>
          </button>
          <button 
            onClick={() => {
              setSubTab('sectors');
            }}
            className={`py-3.5 border-r border-stone-100 transition-colors flex items-center justify-center gap-1 ${
              subTab === 'sectors' ? 'bg-white text-stone-900 border-b-2 border-[#d4af37]' : 'hover:bg-white/50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Sectores</span>
          </button>
          <button 
            onClick={() => {
              setSubTab('branding');
              setEditingSector(null);
              setIsAddingSector(false);
            }}
            className={`py-3.5 border-r border-stone-100 transition-colors flex items-center justify-center gap-1 ${
              subTab === 'branding' ? 'bg-white text-stone-900 border-b-2 border-[#d4af37]' : 'hover:bg-white/50'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Branding</span>
          </button>
          <button 
            onClick={() => {
              setSubTab('seo');
              setEditingSector(null);
              setIsAddingSector(false);
            }}
            className={`py-3.5 transition-colors flex items-center justify-center gap-1 ${
              subTab === 'seo' ? 'bg-white text-stone-900 border-b-2 border-[#d4af37]' : 'hover:bg-white/50'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>SEO</span>
          </button>
        </div>

        {/* Sidebar Scrollable Section */}
        <div className="flex-1 overflow-y-auto min-h-0 select-text font-sans">
          
          {/* A. HERO TEXT FORM */}
          {subTab === 'hero' && (
            <div className="p-6 space-y-6">
              <div className="bg-[#fcf8e5]/20 border border-[#d4af37]/10 p-4 rounded-xl space-y-1">
                <h4 className="text-xs font-bold text-[#c29f2e] flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Marca de Lujo B2B
                </h4>
                <p className="text-[10px] text-stone-500 leading-relaxed font-medium">
                  Los textos introducidos aquí se reflejan instantáneamente en la cabecera editorial del simulador de la derecha.
                </p>
              </div>

              {loading ? (
                <div className="space-y-4 animate-pulse">
                  <div className="h-4 w-32 bg-stone-100 rounded"></div>
                  <div className="h-10 w-full bg-stone-100 rounded-xl"></div>
                  <div className="h-4 w-32 bg-stone-100 rounded"></div>
                  <div className="h-24 w-full bg-stone-100 rounded-xl"></div>
                </div>
              ) : (
                <SaaSCMSHeroForm 
                  heroTitle={settings.hero_title}
                  heroSubtitle={settings.hero_subtitle}
                  onChangeTitle={(val) => setSettings(prev => ({ ...prev, hero_title: val }))}
                  onChangeSubtitle={(val) => setSettings(prev => ({ ...prev, hero_subtitle: val }))}
                  onSubmit={handleSaveSettings}
                  saving={savingSettings}
                />
              )}
            </div>
          )}

          {/* C. BRANDING FORM */}
          {subTab === 'branding' && (
            <div className="p-6 space-y-6">
              <div className="bg-stone-50 border border-stone-200 p-4 rounded-xl space-y-1">
                <h4 className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-stone-600" /> Branding & Identidad Visual
                </h4>
                <p className="text-[10px] text-stone-500 leading-relaxed font-medium">
                  Configura la paleta de colores de alta gama, tipografía y sube tu logotipo SVG personalizado para el SaaS.
                </p>
              </div>

              {loading ? (
                <div className="space-y-4 animate-pulse">
                  <div className="h-4 w-32 bg-stone-100 rounded"></div>
                  <div className="h-10 w-full bg-stone-100 rounded-xl"></div>
                </div>
              ) : (
                <form onSubmit={handleSaveSettings} className="space-y-6 select-text">
                  {/* Curated Typography Dropdown */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">
                      Tipografía Corporativa
                    </label>
                    <select
                      value={settings.font_family || 'playfair_inter'}
                      onChange={(e) => setSettings(prev => ({ ...prev, font_family: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-stone-900 transition-colors text-xs font-sans appearance-none cursor-pointer"
                    >
                      <option value="playfair_inter">Playfair Display & Inter (Serif de Lujo + Sans Limpia)</option>
                      <option value="outfit">Outfit (Geométrica Moderna)</option>
                      <option value="cormorant_montserrat">Cormorant Garamond & Montserrat (Boutique de Lujo)</option>
                      <option value="cinzel_roboto">Cinzel & Roboto (Serif Imperial + Tech Sans)</option>
                      <option value="inter">Inter (Estética Pura SaaS/Minimalista)</option>
                    </select>
                  </div>

                  {/* 3 Colors Selectors */}
                  <div className="space-y-4">
                    <h5 className="text-[10px] font-bold text-stone-550 uppercase tracking-widest border-b border-stone-100 pb-1.5">
                      Paleta de Colores de la Landing
                    </h5>
                    
                    {/* Primary Color */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-stone-400 uppercase tracking-wider block">
                        Color Primario (Botones y Enlaces)
                      </label>
                      <div className="flex items-center gap-3">
                        <input 
                          type="color" 
                          value={settings.primary_color || '#3b82f6'} 
                          onChange={(e) => setSettings(prev => ({ ...prev, primary_color: e.target.value }))}
                          className="w-8 h-8 border border-stone-200 rounded-lg cursor-pointer bg-transparent outline-none"
                        />
                        <input 
                          type="text" 
                          value={settings.primary_color || '#3b82f6'} 
                          onChange={(e) => setSettings(prev => ({ ...prev, primary_color: e.target.value }))}
                          placeholder="#3b82f6"
                          className="flex-1 px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-stone-900 transition-colors text-xxs font-mono"
                        />
                      </div>
                    </div>

                    {/* Secondary Color */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-stone-400 uppercase tracking-wider block">
                        Color Secundario (Textos y Fondos)
                      </label>
                      <div className="flex items-center gap-3">
                        <input 
                          type="color" 
                          value={settings.secondary_color || '#1c1917'} 
                          onChange={(e) => setSettings(prev => ({ ...prev, secondary_color: e.target.value }))}
                          className="w-8 h-8 border border-stone-200 rounded-lg cursor-pointer bg-transparent outline-none"
                        />
                        <input 
                          type="text" 
                          value={settings.secondary_color || '#1c1917'} 
                          onChange={(e) => setSettings(prev => ({ ...prev, secondary_color: e.target.value }))}
                          placeholder="#1c1917"
                          className="flex-1 px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-stone-900 transition-colors text-xxs font-mono"
                        />
                      </div>
                    </div>

                    {/* Tertiary Color */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-stone-400 uppercase tracking-wider block">
                        Color Terciario (Detalles e Indicadores)
                      </label>
                      <div className="flex items-center gap-3">
                        <input 
                          type="color" 
                          value={settings.tertiary_color || '#d4af37'} 
                          onChange={(e) => setSettings(prev => ({ ...prev, tertiary_color: e.target.value }))}
                          className="w-8 h-8 border border-stone-200 rounded-lg cursor-pointer bg-transparent outline-none"
                        />
                        <input 
                          type="text" 
                          value={settings.tertiary_color || '#d4af37'} 
                          onChange={(e) => setSettings(prev => ({ ...prev, tertiary_color: e.target.value }))}
                          placeholder="#d4af37"
                          className="flex-1 px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-stone-900 transition-colors text-xxs font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Logo SVG */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block flex justify-between items-center">
                      <span>Logotipo Corporativo (Código SVG)</span>
                      <span className="text-[9px] text-stone-450 normal-case">Pega el XML o arrastra un .svg</span>
                    </label>

                    {/* SVG Dropzone / File Uploader */}
                    <div className="border border-dashed border-stone-200 rounded-xl p-4 hover:bg-stone-50/50 transition-colors flex flex-col items-center justify-center gap-2 cursor-pointer relative">
                      <input 
                        type="file" 
                        accept=".svg"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              const text = event.target?.result as string;
                              if (text.includes('<svg')) {
                                setSettings(prev => ({ ...prev, logo_svg: text }));
                                toast.success('¡Logotipo SVG cargado con éxito!');
                              } else {
                                toast.error('El archivo no parece ser un SVG válido.');
                              }
                            };
                            reader.readAsText(file);
                          }
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <div className="w-8 h-8 rounded-lg bg-stone-100 text-stone-600 flex items-center justify-center">
                        <Palette className="w-4 h-4" />
                      </div>
                      <p className="text-[10px] text-stone-500 font-medium">Sube tu archivo .svg aquí</p>
                    </div>

                    <textarea 
                      rows={5}
                      value={settings.logo_svg || ''}
                      onChange={(e) => setSettings(prev => ({ ...prev, logo_svg: e.target.value }))}
                      placeholder="<svg ...> ... </svg>"
                      className="w-full p-4 bg-stone-900 border border-stone-850 rounded-xl outline-none focus:border-stone-750 transition-colors text-xs font-mono text-stone-200 placeholder:text-stone-700 leading-relaxed"
                    />

                    {settings.logo_svg && (
                      <div className="space-y-2 mt-2">
                        <p className="text-[9px] font-bold text-stone-450 uppercase tracking-widest">Vista previa del logotipo:</p>
                        <div className="p-4 bg-stone-50 border border-stone-150 rounded-xl flex items-center justify-center max-h-[80px] overflow-hidden">
                          <div 
                            className="h-10 w-full flex items-center justify-center [&>svg]:h-full [&>svg]:w-auto [&>svg]:max-w-full"
                            dangerouslySetInnerHTML={{ __html: settings.logo_svg }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <button 
                    type="submit"
                    disabled={savingSettings}
                    className="w-full bg-stone-950 hover:bg-[#d4af37] text-white py-3 rounded-xl text-xxs font-black uppercase tracking-widest transition-all duration-300 shadow-sm active:scale-98"
                  >
                    {savingSettings ? 'Guardando Ajustes...' : 'Guardar Branding'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* D. SEO METADATA FORM */}
          {subTab === 'seo' && (
            <div className="p-6 space-y-6">
              <div className="bg-stone-50 border border-stone-200 p-4 rounded-xl space-y-1">
                <h4 className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-stone-600" /> Posicionamiento en Buscadores (SEO)
                </h4>
                <p className="text-[10px] text-stone-500 leading-relaxed font-medium">
                  Optimiza la indexación del SaaS corporativo de ProBookia en buscadores de Google, Bing y redes sociales.
                </p>
              </div>

              {loading ? (
                <div className="space-y-4 animate-pulse">
                  <div className="h-4 w-32 bg-stone-100 rounded"></div>
                  <div className="h-10 w-full bg-stone-100 rounded-xl"></div>
                </div>
              ) : (
                <form onSubmit={handleSaveSettings} className="space-y-6 select-text">
                  {/* SEO Title */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">
                      Meta Título (SEO Title)
                    </label>
                    <input 
                      type="text" 
                      value={settings.seo_title || ''}
                      onChange={(e) => setSettings(prev => ({ ...prev, seo_title: e.target.value }))}
                      placeholder="Probookia | El SaaS de Gestión Premium..."
                      className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-stone-900 transition-colors text-xs font-sans"
                    />
                  </div>

                  {/* SEO Description */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">
                      Meta Descripción (SEO Description)
                    </label>
                    <textarea 
                      rows={4}
                      value={settings.seo_description || ''}
                      onChange={(e) => setSettings(prev => ({ ...prev, seo_description: e.target.value }))}
                      placeholder="Describe tu plataforma para los buscadores de Google..."
                      className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-stone-900 transition-colors text-xs font-sans leading-relaxed"
                    />
                  </div>

                  {/* SEO Keywords */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">
                      Palabras Clave (SEO Keywords)
                    </label>
                    <input 
                      type="text" 
                      value={settings.seo_keywords || ''}
                      onChange={(e) => setSettings(prev => ({ ...prev, seo_keywords: e.target.value }))}
                      placeholder="saas, agenda online, estetica"
                      className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-stone-900 transition-colors text-xs font-sans"
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={savingSettings}
                    className="w-full bg-stone-950 hover:bg-[#d4af37] text-white py-3 rounded-xl text-xxs font-black uppercase tracking-widest transition-all duration-300 shadow-sm active:scale-98"
                  >
                    {savingSettings ? 'Guardando Ajustes...' : 'Guardar SEO'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* B. SECTORS LIST / CRUD */}
          {subTab === 'sectors' && (
            <>
              {editingSector || isAddingSector ? (
                <SaaSCMSSectorForm 
                  editingSector={editingSector}
                  sectorFormData={sectorFormData}
                  onBack={() => {
                    setEditingSector(null);
                    setIsAddingSector(false);
                  }}
                  onSubmit={handleSectorSubmit}
                  onChangeInput={handleInputChange}
                  onSetPickerTarget={setPickerTarget}
                  onClearMedia={(field) => setSectorFormData(prev => ({ ...prev, [field]: '' }))}
                  onUploadMedia={(field, url) => setSectorFormData(prev => ({ ...prev, [field]: url }))}
                  submitting={submittingSector}
                  tenantId="00000000-0000-0000-0000-000000000000"
                  token={token}
                />
              ) : (
                <SaaSCMSSectorList 
                  sectors={sectors}
                  loading={loadingSectors}
                  onAdd={openAddSector}
                  onEdit={openEditSector}
                  onDelete={setSectorToDelete}
                />
              )}
            </>
          )}

        </div>

        {/* C. INLINE DELETION DIALOG overlay */}
        {sectorToDelete && (
          <div className="p-6 border-t border-stone-100 bg-red-50/30 animate-in slide-in-from-bottom duration-300 shrink-0 font-sans">
            <span className="text-[9px] font-black text-red-600 uppercase tracking-widest block mb-1">
              Confirmar Eliminación
            </span>
            <p className="text-xs font-medium text-stone-600 leading-relaxed mb-4">
              ¿Deseas eliminar permanentemente el sector <strong className="text-stone-950 font-bold">"{sectorToDelete.title}"</strong> del Showcase 3D?
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setSectorToDelete(null)}
                className="py-2 bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-bold rounded-lg transition-colors active:scale-95"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors active:scale-95 shadow-sm"
              >
                Eliminar
              </button>
            </div>
          </div>
        )}

      </div>

      {/* 2. RIGHT VIEWPORT: LIVE 3D MARKETING SIMULATOR */}
      <Showcase3DPreview
        heroTitle={settings.hero_title}
        heroSubtitle={settings.hero_subtitle}
        previewSectors={previewSectors}
        previewIndex={previewIndex}
        previewAnimating={previewAnimating}
        handlePreviewNavigate={handlePreviewNavigate}
      />

      {/* Media Picker Dialog Modal */}
      {pickerTarget && (
        <MediaPickerModal
          onClose={() => setPickerTarget(null)}
          onImageSelected={(url) => {
            setSectorFormData(prev => ({ ...prev, [pickerTarget.field]: url }));
            setPickerTarget(null);
          }}
          mediaType={pickerTarget.field === 'video_url' ? 'video' : 'image'}
          tenantId="00000000-0000-0000-0000-000000000000"
          token={token}
        />
      )}

    </div>
  );
}

"use client"

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  Sparkles, 
  Plus, 
  Edit2, 
  Trash2, 
  ChevronRight, 
  Monitor, 
  ArrowLeft,
  Settings2,
  Film
} from 'lucide-react';
import ImageUploadBlock from '@/app/dashboard/(editor)/cms/components/ImageUploadBlock';
import MediaPickerModal from '@/components/MediaPickerModal';

interface SaaSCMSManagerProps {
  token: string;
}

interface MarketingSettings {
  hero_title: string;
  hero_subtitle: string;
}

interface ShowcaseSector {
  id: string;
  title: string;
  slug: string;
  badge_text: string | null;
  video_url: string | null;
  image_url: string | null;
  order_index: number;
}

interface MappedPreviewSector {
  id: string;
  badge: string;
  title: string;
  copy: string;
  videoUrl: string;
  imageUrl?: string;
  placeholderGradient: string;
}

export default function SaaSCMSManager({ token }: SaaSCMSManagerProps) {
  const [subTab, setSubTab] = useState<'hero' | 'sectors'>('hero');
  const [loading, setLoading] = useState(false);
  
  // Settings state
  const [settings, setSettings] = useState<MarketingSettings>({
    hero_title: 'La elegancia de tu negocio traducida en un SaaS de Lujo',
    hero_subtitle: 'Diseñado exclusivamente para centros de estética, wellness, spas y salones premium independientes.'
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
    const toastId = toast.loading('Guardando textos de portada...');
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
      toast.success('¡Textos de portada actualizados con éxito!', { id: toastId });
    } catch (err: any) {
      console.error(err);
      toast.error('Error al guardar los textos de la landing.', { id: toastId });
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
        <div className="grid grid-cols-2 border-b border-stone-100 text-center text-xs font-bold text-stone-400 bg-stone-50/50 font-sans shrink-0">
          <button 
            onClick={() => {
              setSubTab('hero');
              setEditingSector(null);
              setIsAddingSector(false);
            }}
            className={`py-3.5 border-r border-stone-100 transition-colors flex items-center justify-center gap-1.5 ${
              subTab === 'hero' ? 'bg-white text-stone-900 border-b-2 border-[#d4af37]' : 'hover:bg-white/50'
            }`}
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>Portada (Hero)</span>
          </button>
          <button 
            onClick={() => {
              setSubTab('sectors');
            }}
            className={`py-3.5 transition-colors flex items-center justify-center gap-1.5 ${
              subTab === 'sectors' ? 'bg-white text-stone-900 border-b-2 border-[#d4af37]' : 'hover:bg-white/50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Showcase (3D)</span>
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
                <form onSubmit={handleSaveSettings} className="space-y-5">
                  <div>
                    <label className="block text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-2">
                      Título Principal (Hero Title)
                    </label>
                    <input
                      type="text"
                      required
                      value={settings.hero_title}
                      onChange={(e) => setSettings(prev => ({ ...prev, hero_title: e.target.value }))}
                      className="w-full px-4 py-3 bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/20 focus:border-[#d4af37] transition-all text-xs font-semibold text-stone-800"
                      placeholder="Ej. La elegancia de tu negocio..."
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-2">
                      Subtítulo Descriptivo (Hero Subtitle)
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={settings.hero_subtitle}
                      onChange={(e) => setSettings(prev => ({ ...prev, hero_subtitle: e.target.value }))}
                      className="w-full px-4 py-3 bg-stone-50 rounded-2xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/20 focus:border-[#d4af37] transition-all text-xs font-medium text-stone-500 leading-relaxed"
                      placeholder="Describe los puntos fuertes..."
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={savingSettings}
                      className="w-full bg-stone-950 hover:bg-stone-900 text-white font-bold text-xs py-3.5 px-6 rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5"
                    >
                      <span>{savingSettings ? 'Guardando...' : 'Guardar y Publicar'}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* B. SECTORS LIST / CRUD */}
          {subTab === 'sectors' && (
            <>
              {editingSector || isAddingSector ? (
                // 1. INLINE FORM DRAWER INSIDE SIDEBAR
                <form onSubmit={handleSectorSubmit} className="p-6 space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                    <button 
                      type="button"
                      onClick={() => {
                        setEditingSector(null);
                        setIsAddingSector(false);
                      }}
                      className="text-stone-400 hover:text-stone-950 text-xs font-bold flex items-center gap-1 transition-colors"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Volver a la Lista</span>
                    </button>
                    <span className="text-[9px] font-black uppercase text-[#d4af37]">
                      {editingSector ? 'Edición' : 'Creación'}
                    </span>
                  </div>

                  <div className="space-y-4">
                    
                    {/* Visual Media Pickers */}
                    <div className="space-y-4 p-4 bg-stone-50 rounded-2xl border border-stone-200/65">
                      <ImageUploadBlock 
                        label="Imagen Cobertura (Opcional)"
                        value={sectorFormData.image_url} 
                        onSelect={() => setPickerTarget({ field: 'image_url' })} 
                        onClear={() => setSectorFormData(prev => ({ ...prev, image_url: '' }))} 
                        onUpload={(url) => setSectorFormData(prev => ({ ...prev, image_url: url }))}
                        accepts="image"
                      />

                      <ImageUploadBlock 
                        label="Vídeo del Sector (Loop 9:16)"
                        value={sectorFormData.video_url} 
                        onSelect={() => setPickerTarget({ field: 'video_url' })} 
                        onClear={() => setSectorFormData(prev => ({ ...prev, video_url: '' }))} 
                        onUpload={(url) => setSectorFormData(prev => ({ ...prev, video_url: url }))}
                        accepts="video"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-1.5">Nombre del Sector (Título)</label>
                      <input
                        type="text"
                        name="title"
                        required
                        placeholder="Ej. Dental Studio, Clínicas Estéticas"
                        value={sectorFormData.title}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/20 focus:border-[#d4af37] transition-all text-xs font-semibold text-stone-700"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-1.5">Slug Único</label>
                        <input
                          type="text"
                          name="slug"
                          required
                          placeholder="ej-dentistas"
                          value={sectorFormData.slug}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/20 focus:border-[#d4af37] transition-all text-xs font-mono font-bold text-stone-700"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-1.5">Badge Superior</label>
                        <input
                          type="text"
                          name="badge_text"
                          placeholder="Ej. Odontología"
                          value={sectorFormData.badge_text}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/20 focus:border-[#d4af37] transition-all text-xs font-semibold text-stone-700"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-1.5">Enlace de Vídeo Directo (Opcional)</label>
                      <input
                        type="url"
                        name="video_url"
                        placeholder="https://..."
                        value={sectorFormData.video_url}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/20 focus:border-[#d4af37] transition-all text-xs font-semibold text-stone-750"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-1.5">Índice Orden</label>
                      <input
                        type="number"
                        name="order_index"
                        min={0}
                        value={sectorFormData.order_index}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/20 focus:border-[#d4af37] transition-all text-xs font-semibold text-stone-700"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submittingSector}
                      className="w-full mt-4 bg-stone-950 hover:bg-stone-900 text-white font-bold py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-1 active:scale-95 disabled:opacity-50 text-xs"
                    >
                      <span>{editingSector ? 'Guardar Cambios' : 'Crear Sector'}</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </form>
              ) : (
                // 2. INLINE LIST DIRECTLY IN SIDEBAR
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-stone-100">
                    <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Sectores Activos</h4>
                    <button
                      onClick={openAddSector}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Nuevo</span>
                    </button>
                  </div>

                  {loadingSectors ? (
                    <div className="space-y-3 animate-pulse">
                      {[1, 2, 3].map(n => (
                        <div key={n} className="h-16 bg-stone-50 border border-stone-100 rounded-xl"></div>
                      ))}
                    </div>
                  ) : sectors.length === 0 ? (
                    <div className="p-6 text-center text-stone-400 font-medium text-xs bg-stone-50 rounded-2xl border border-stone-200/50">
                      No hay sectores registrados.
                    </div>
                  ) : (
                    <div className="space-y-3 font-sans">
                      {sectors.map(sector => (
                        <div 
                          key={sector.id}
                          className="p-3 bg-stone-50/50 hover:bg-stone-50 border border-stone-200/40 rounded-xl flex items-center justify-between transition-colors duration-200 group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-stone-200 shrink-0 border border-stone-100 flex items-center justify-center relative">
                              {sector.video_url ? (
                                <video src={sector.video_url} className="w-full h-full object-cover" muted />
                              ) : (
                                <Film className="w-4 h-4 text-stone-300" />
                              )}
                            </div>
                            <div>
                              <h5 className="text-xs font-bold text-stone-900 leading-tight">{sector.title}</h5>
                              <p className="text-[9px] font-mono text-stone-400 mt-0.5">slug: {sector.slug}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => openEditSector(sector)}
                              className="w-7 h-7 rounded-lg hover:bg-stone-200/60 flex items-center justify-center text-stone-600 hover:text-stone-900 transition-colors"
                              title="Editar Sector"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setSectorToDelete(sector)}
                              className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-stone-400 hover:text-red-600 transition-colors"
                              title="Eliminar Sector"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

        </div>

        {/* C. INLINE DELETION DIALOG overlay */}
        {sectorToDelete && (
          <div className="p-6 border-t border-stone-100 bg-red-50/30 animate-in slide-in-from-bottom duration-300 shrink-0">
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

      {/* 2. RIGHT VIEWPORT: LIVE 3D MARKETING SIMULATOR (FULL BLEED EXPANDED) */}
      <div className="flex-1 h-full bg-stone-50 flex flex-col relative overflow-hidden">
        
        {/* Device Wrapper Header (Top bar mockup) */}
        <div className="h-12 bg-stone-100 border-b border-stone-200/60 px-6 flex items-center justify-between shrink-0 select-none font-sans">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-red-400/80"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400/80"></div>
              <div className="w-3 h-3 rounded-full bg-green-400/80"></div>
            </div>
            <span className="text-[10px] text-stone-400 font-mono border-l border-stone-200 pl-3 ml-2">
              probookia.com/marketing/showcase
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-[9px] text-stone-400 font-bold bg-white px-3 py-1 rounded-lg border border-stone-200/50 shadow-sm">
              <Monitor className="w-3.5 h-3.5 text-stone-400" />
              <span>Vista Previa: Pantalla Completa B2B</span>
            </div>
          </div>
        </div>

        {/* Live Mock Page Body (Now occupies 100% of remaining height & width!) */}
        <div className="flex-1 overflow-y-auto bg-white p-10 relative flex flex-col justify-between min-h-0">
          
          {/* Mock Landing Header */}
          <div className="flex justify-between items-center border-b border-stone-100 pb-4 mb-6 select-none shrink-0">
            <span className="text-xs font-serif font-bold tracking-widest text-stone-900">PROBOOKIA</span>
            <div className="flex items-center gap-6 text-[9px] text-stone-400 font-bold font-sans">
              <span>Producto</span>
              <span>Precios</span>
              <span>Documentación</span>
              <span className="bg-stone-950 text-white px-3 py-1.2 rounded-lg text-[8px] font-black uppercase tracking-wider">Entorno Seguro</span>
            </div>
          </div>

          {/* Live Hero Header (Scaled Up) */}
          <div className="text-center max-w-2xl mx-auto select-none mt-2 shrink-0">
            <span className="text-blue-600 text-[9px] font-black uppercase tracking-[0.25em] block mb-3 font-sans">
              Especialidades
            </span>
            <h2 className="text-2xl md:text-4xl font-serif font-bold tracking-tight text-stone-950 leading-snug mb-4 transition-all duration-300">
              {settings.hero_title || 'Sectores de Alta Gama'}
            </h2>
            <p className="text-xs md:text-sm text-stone-500 font-medium leading-relaxed max-w-lg mx-auto transition-all duration-300 font-sans">
              {settings.hero_subtitle || 'Interactúa con el carrusel en anillo 3D tridimensional de alta precisión.'}
            </p>
          </div>

          {/* 3D CYLINDRICAL STAGE (Expanded and Maximized to fill workspace!) */}
          <div className="relative flex-1 min-h-[480px] w-full flex items-center justify-center [perspective:1200px] [perspective-origin:50%_38%] select-none overflow-hidden my-2 shrink-0">
            
            {/* Spinning Ring */}
            <div 
              className="relative w-[260px] h-[450px] transition-transform duration-1000 ease-out [transform-style:preserve-3d]"
              style={{ transform: `rotateY(${previewIndex * -90}deg)` }}
            >
              {/* Card 0 */}
              <div 
                onClick={() => handlePreviewNavigate(0)}
                className={`absolute inset-0 cursor-pointer transition-all duration-700 ease-out [backface-visibility:hidden] [transform:rotateY(0deg)_translateZ(350px)] ${
                  previewIndex === 0 ? 'scale-105 opacity-100 drop-shadow-[0_20px_40px_rgba(0,0,0,0.08)] z-20' : 'scale-95 opacity-25 hover:opacity-50 filter brightness-90 z-10'
                }`}
              >
                <div className="w-full h-full bg-white rounded-3xl border border-stone-200/50 p-2.5 shadow-md relative overflow-hidden">
                  <div className="w-full h-full rounded-2xl overflow-hidden bg-stone-50 relative border border-stone-100">
                    <video src={previewSectors[0]?.videoUrl} poster={previewSectors[0]?.imageUrl} className="w-full h-full object-cover" autoPlay={previewIndex === 0} loop muted playsInline />
                    <div className="absolute top-4 left-4 z-10">
                      <span className={`border px-3 py-1 rounded-full text-[8px] font-black tracking-wider uppercase font-sans ${
                        previewIndex === 0 ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white/95 border-stone-200/60 text-stone-500'
                      }`}>
                        {previewSectors[0]?.badge}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 1 */}
              <div 
                onClick={() => handlePreviewNavigate(1)}
                className={`absolute inset-0 cursor-pointer transition-all duration-700 ease-out [backface-visibility:hidden] [transform:rotateY(90deg)_translateZ(350px)] ${
                  previewIndex === 1 ? 'scale-105 opacity-100 drop-shadow-[0_20px_40px_rgba(0,0,0,0.08)] z-20' : 'scale-95 opacity-25 hover:opacity-50 filter brightness-90 z-10'
                }`}
              >
                <div className="w-full h-full bg-white rounded-3xl border border-stone-200/50 p-2.5 shadow-md relative overflow-hidden">
                  <div className="w-full h-full rounded-2xl overflow-hidden bg-stone-50 relative border border-stone-100">
                    <video src={previewSectors[1]?.videoUrl} poster={previewSectors[1]?.imageUrl} className="w-full h-full object-cover" autoPlay={previewIndex === 1} loop muted playsInline />
                    <div className="absolute top-4 left-4 z-10">
                      <span className={`border px-3 py-1 rounded-full text-[8px] font-black tracking-wider uppercase font-sans ${
                        previewIndex === 1 ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white/95 border-stone-200/60 text-stone-500'
                      }`}>
                        {previewSectors[1]?.badge}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2 */}
              <div 
                onClick={() => handlePreviewNavigate(2)}
                className={`absolute inset-0 cursor-pointer transition-all duration-700 ease-out [backface-visibility:hidden] [transform:rotateY(180deg)_translateZ(350px)] ${
                  previewIndex === 2 ? 'scale-105 opacity-100 drop-shadow-[0_20px_40px_rgba(0,0,0,0.08)] z-20' : 'scale-95 opacity-25 hover:opacity-50 filter brightness-90 z-10'
                }`}
              >
                <div className="w-full h-full bg-white rounded-3xl border border-stone-200/50 p-2.5 shadow-md relative overflow-hidden">
                  <div className="w-full h-full rounded-2xl overflow-hidden bg-stone-50 relative border border-stone-100">
                    <video src={previewSectors[2]?.videoUrl} poster={previewSectors[2]?.imageUrl} className="w-full h-full object-cover" autoPlay={previewIndex === 2} loop muted playsInline />
                    <div className="absolute top-4 left-4 z-10">
                      <span className={`border px-3 py-1 rounded-full text-[8px] font-black tracking-wider uppercase font-sans ${
                        previewIndex === 2 ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white/95 border-stone-200/60 text-stone-500'
                      }`}>
                        {previewSectors[2]?.badge}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3 */}
              <div 
                onClick={() => handlePreviewNavigate(3)}
                className={`absolute inset-0 cursor-pointer transition-all duration-700 ease-out [backface-visibility:hidden] [transform:rotateY(270deg)_translateZ(350px)] ${
                  previewIndex === 3 ? 'scale-105 opacity-100 drop-shadow-[0_20px_40px_rgba(0,0,0,0.08)] z-20' : 'scale-95 opacity-25 hover:opacity-50 filter brightness-90 z-10'
                }`}
              >
                <div className="w-full h-full bg-white rounded-3xl border border-stone-200/50 p-2.5 shadow-md relative overflow-hidden">
                  <div className="w-full h-full rounded-2xl overflow-hidden bg-stone-50 relative border border-stone-100">
                    <video src={previewSectors[3]?.videoUrl} poster={previewSectors[3]?.imageUrl} className="w-full h-full object-cover" autoPlay={previewIndex === 3} loop muted playsInline />
                    <div className="absolute top-4 left-4 z-10">
                      <span className={`border px-3 py-1 rounded-full text-[8px] font-black tracking-wider uppercase font-sans ${
                        previewIndex === 3 ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white/95 border-stone-200/60 text-stone-500'
                      }`}>
                        {previewSectors[3]?.badge}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Lateral arrows (Wider and larger clickable areas) */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-12 pointer-events-none z-20">
              <button
                onClick={() => {
                  const prevIndex = (previewIndex - 1 + 4) % 4;
                  handlePreviewNavigate(prevIndex);
                }}
                className="w-10 h-10 rounded-full bg-white/95 backdrop-blur-sm border border-stone-200/60 hover:bg-stone-50 flex items-center justify-center text-stone-700 shadow-lg active:scale-95 pointer-events-auto transition-transform"
              >
                <ChevronRight className="w-5 h-5 rotate-180" />
              </button>
              <button
                onClick={() => {
                  const nextIndex = (previewIndex + 1) % 4;
                  handlePreviewNavigate(nextIndex);
                }}
                className="w-10 h-10 rounded-full bg-white/95 backdrop-blur-sm border border-stone-200/60 hover:bg-stone-50 flex items-center justify-center text-stone-700 shadow-lg active:scale-95 pointer-events-auto transition-transform"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* 2. THE SLIDING SHEET DETAILS PANEL (Scaled up details card) */}
            {previewSectors[previewIndex] && (
              <div className={`absolute bottom-4 max-w-sm w-full bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-stone-100/80 transition-all duration-500 transform z-30 select-none text-center ${
                previewAnimating ? 'translate-y-6 opacity-0' : 'translate-y-0 opacity-100'
              }`}>
                <span className="text-[8.5px] uppercase font-black tracking-[0.15em] text-blue-600 block mb-1 font-sans">
                  {previewSectors[previewIndex]?.badge}
                </span>
                <h4 className="font-serif text-base text-stone-900 font-bold mb-1.5 leading-tight">
                  {previewSectors[previewIndex]?.title}
                </h4>
                <p className="text-stone-500 text-[10px] md:text-xs leading-relaxed mb-4 font-sans">
                  {previewSectors[previewIndex]?.copy}
                </p>
                <button className="w-full bg-stone-950 text-white text-[9px] py-2 px-4 rounded-xl font-bold hover:bg-stone-900 transition-colors font-sans uppercase tracking-wider">
                  Configurar Entorno
                </button>
              </div>
            )}

          </div>

        </div>

      </div>

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

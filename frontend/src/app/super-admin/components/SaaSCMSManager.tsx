"use client"

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Sparkles, Plus, Edit2, Trash2, X, Film, ArrowUpDown, ChevronRight, Play, Eye } from 'lucide-react';

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

export default function SaaSCMSManager({ token }: SaaSCMSManagerProps) {
  const [subTab, setSubTab] = useState<'hero' | 'sectors'>('hero');
  const [loading, setLoading] = useState(false);
  
  // Settings state
  const [settings, setSettings] = useState<MarketingSettings>({
    hero_title: '',
    hero_subtitle: ''
  });
  const [savingSettings, setSavingSettings] = useState(false);

  // Sectors state
  const [sectors, setSectors] = useState<ShowcaseSector[]>([]);
  const [loadingSectors, setLoadingSectors] = useState(false);
  
  // CRUD form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSector, setEditingSector] = useState<ShowcaseSector | null>(null);
  const [sectorFormData, setSectorFormData] = useState({
    title: '',
    slug: '',
    badge_text: '',
    video_url: '',
    image_url: '',
    order_index: 0
  });
  const [submittingSector, setSubmittingSector] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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
      setSettings(data);
    } catch (err: any) {
      console.error(err);
      toast.error('No se pudo cargar la configuración de la landing.');
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

  const openAddSectorModal = () => {
    setEditingSector(null);
    setSectorFormData({
      title: '',
      slug: '',
      badge_text: '',
      video_url: '',
      image_url: '',
      order_index: sectors.length
    });
    setIsModalOpen(true);
  };

  const openEditSectorModal = (sector: ShowcaseSector) => {
    setEditingSector(sector);
    setSectorFormData({
      title: sector.title,
      slug: sector.slug,
      badge_text: sector.badge_text || '',
      video_url: sector.video_url || '',
      image_url: sector.image_url || '',
      order_index: sector.order_index
    });
    setIsModalOpen(true);
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
      setIsModalOpen(false);
      fetchSectors();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Error al guardar el sector.', { id: toastId });
    } finally {
      setSubmittingSector(false);
    }
  };

  const handleDeleteSector = async (id: string, title: string) => {
    const isConfirmed = window.confirm(`¿Estás seguro de que deseas eliminar permanentemente el sector "${title}"?`);
    if (!isConfirmed) return;

    const toastId = toast.loading('Eliminando sector del Showcase...');
    try {
      const response = await fetch(`${API_URL}/super-admin/marketing/sectors/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Error al eliminar sector');
      toast.success(`Sector "${title}" eliminado correctamente.`, { id: toastId });
      fetchSectors();
    } catch (err: any) {
      console.error(err);
      toast.error('No se pudo eliminar el sector.', { id: toastId });
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#F7F7F5] p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Sub-Tab Selector */}
        <div className="flex gap-4 border-b border-stone-200/50 pb-2">
          <button
            onClick={() => setSubTab('hero')}
            className={`pb-3 text-sm font-bold transition-all relative px-1 ${
              subTab === 'hero' 
                ? 'text-stone-900 border-b-2 border-[#d4af37]' 
                : 'text-stone-400 hover:text-stone-600'
            }`}
          >
            Edición de Portada (Hero)
          </button>
          <button
            onClick={() => setSubTab('sectors')}
            className={`pb-3 text-sm font-bold transition-all relative px-1 ${
              subTab === 'sectors' 
                ? 'text-stone-900 border-b-2 border-[#d4af37]' 
                : 'text-stone-400 hover:text-stone-600'
            }`}
          >
            Showcase de Sectores (3D Grid)
          </button>
        </div>

        {/* 1. VIEW: HERO FORM */}
        {subTab === 'hero' && (
          <div className="bg-white rounded-[2rem] border border-stone-200/50 p-8 md:p-10 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#fcf8e5]/20 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
            
            <div className="flex items-center gap-3 mb-6 relative">
              <div className="w-10 h-10 rounded-xl bg-[#fcf8e5] text-[#d4af37] flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-stone-900">Textos Principales de Venta</h3>
                <p className="text-xs text-stone-400 font-medium">Actualiza el mensaje principal que ven las visitas de ProBookia.</p>
              </div>
            </div>

            {loading ? (
              <div className="space-y-6 animate-pulse">
                <div className="h-6 w-32 bg-stone-100 rounded-lg"></div>
                <div className="h-12 w-full bg-stone-100 rounded-xl"></div>
                <div className="h-6 w-32 bg-stone-100 rounded-lg"></div>
                <div className="h-32 w-full bg-stone-100 rounded-[2rem]"></div>
                <div className="h-12 w-48 bg-stone-100 rounded-xl"></div>
              </div>
            ) : (
              <form onSubmit={handleSaveSettings} className="space-y-6 relative">
                <div>
                  <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2.5">
                    Título Principal (Hero Title)
                  </label>
                  <input
                    type="text"
                    required
                    value={settings.hero_title}
                    onChange={(e) => setSettings(prev => ({ ...prev, hero_title: e.target.value }))}
                    className="w-full px-5 py-4 bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/20 focus:border-[#d4af37] transition-all text-sm font-semibold text-stone-850"
                    placeholder="Ej. La elegancia de tu negocio traducida en un SaaS de Lujo"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2.5">
                    Subtítulo Descriptivo (Hero Subtitle)
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={settings.hero_subtitle}
                    onChange={(e) => setSettings(prev => ({ ...prev, hero_subtitle: e.target.value }))}
                    className="w-full px-5 py-4 bg-stone-50 rounded-[2rem] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/20 focus:border-[#d4af37] transition-all text-sm font-medium text-stone-500 leading-relaxed"
                    placeholder="Describe los puntos fuertes o el público objetivo de tu plataforma..."
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={savingSettings}
                    className="bg-stone-950 hover:bg-stone-900 text-white font-bold text-xs py-4 px-8 rounded-xl transition-all duration-300 active:scale-95 shadow-md flex items-center gap-2"
                  >
                    {savingSettings ? 'Guardando...' : 'Guardar y Publicar'}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* 2. VIEW: SECTORS CRUD */}
        {subTab === 'sectors' && (
          <div className="space-y-6">
            
            {/* Header + Add button */}
            <div className="flex justify-between items-center bg-white rounded-2xl border border-stone-200/50 p-6 shadow-sm">
              <div>
                <h3 className="font-serif text-lg font-bold text-stone-900">Showcase de Negocios (Showcase 3D)</h3>
                <p className="text-xs text-stone-400 font-medium">Tarjetas dinámicas verticales en proporción 9:16 con reproducción de video en bucle.</p>
              </div>
              <button
                onClick={openAddSectorModal}
                className="bg-[#d4af37] hover:bg-[#c29f2e] text-stone-950 text-xs font-bold py-3 px-5 rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4 text-stone-950 stroke-[3]" />
                Nuevo Sector
              </button>
            </div>

            {/* Grid List */}
            {loadingSectors ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(n => (
                  <div key={n} className="h-96 bg-white rounded-[2rem] border border-stone-200/50 p-6 animate-pulse space-y-4">
                    <div className="h-40 w-full bg-stone-100 rounded-2xl"></div>
                    <div className="h-6 w-24 bg-stone-100 rounded-lg"></div>
                    <div className="h-8 w-full bg-stone-100 rounded-lg"></div>
                    <div className="h-10 w-full bg-stone-100 rounded-xl"></div>
                  </div>
                ))}
              </div>
            ) : sectors.length === 0 ? (
              <div className="bg-white rounded-[2rem] border border-stone-200/50 p-12 text-center text-stone-400 font-medium">
                No hay sectores cargados. Haz clic en "Nuevo Sector" para sembrar.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {sectors.map(sector => (
                  <div
                    key={sector.id}
                    className="bg-white rounded-[2rem] border border-stone-200/50 p-5 flex flex-col justify-between hover:shadow-md transition-all duration-300 group h-[480px] relative overflow-hidden"
                  >
                    
                    {/* Media container */}
                    <div className="h-48 w-full rounded-2xl overflow-hidden relative bg-stone-100 border border-stone-100 shrink-0 flex items-center justify-center">
                      {sector.video_url ? (
                        <video
                          src={sector.video_url}
                          className="w-full h-full object-cover"
                          autoPlay
                          loop
                          muted
                          playsInline
                        />
                      ) : (
                        <div className="text-center text-stone-300 text-xs font-semibold p-4">
                          <Film className="w-8 h-8 mx-auto mb-2 text-stone-200" />
                          Sin video cargado
                        </div>
                      )}
                      
                      {/* Floating Badge */}
                      {sector.badge_text && (
                        <div className="absolute top-3 left-3 z-10">
                          <span className="bg-white/95 backdrop-blur-sm border border-stone-200/60 px-2.5 py-1 rounded-full text-[8.5px] font-black text-[#d4af37] tracking-wider shadow-sm uppercase">
                            {sector.badge_text}
                          </span>
                        </div>
                      )}

                      {/* Floating Order */}
                      <div className="absolute top-3 right-3 z-10">
                        <span className="bg-stone-900/60 backdrop-blur-sm px-2.5 py-1 rounded-lg text-[9px] font-bold text-white tracking-wider uppercase">
                          Ord: {sector.order_index}
                        </span>
                      </div>
                    </div>

                    {/* Copys */}
                    <div className="mt-4 flex-1 flex flex-col justify-between">
                      <div className="space-y-1">
                        <h4 className="font-serif text-base font-bold text-stone-900 leading-tight">
                          {sector.title}
                        </h4>
                        <p className="text-[10px] font-mono text-stone-400 font-semibold select-all">
                          slug: {sector.slug}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="grid grid-cols-2 gap-2 mt-4">
                        <button
                          onClick={() => openEditSectorModal(sector)}
                          className="py-2.5 bg-stone-50 hover:bg-stone-100 text-stone-700 hover:text-stone-950 border border-stone-200/80 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 active:scale-95"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Editar</span>
                        </button>
                        <button
                          onClick={() => handleDeleteSector(sector.id, sector.title)}
                          className="py-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 hover:border-red-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 active:scale-95"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Borrar</span>
                        </button>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 3. MODAL: CRUD FORM */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-stone-200/50 p-8 md:p-10 relative overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
              
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 w-8 h-8 rounded-full bg-stone-50 border border-stone-200/50 flex items-center justify-center text-stone-400 hover:text-stone-700 transition-colors shadow-sm active:scale-95"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="mb-6">
                <span className="text-[9px] font-black uppercase tracking-widest text-[#d4af37] block mb-1">
                  {editingSector ? 'Edición' : 'Adición de Contenido'}
                </span>
                <h3 className="text-2xl font-serif font-bold text-stone-900 leading-tight">
                  {editingSector ? `Editar '${editingSector.title}'` : 'Registrar Nuevo Sector'}
                </h3>
              </div>

              <form onSubmit={handleSectorSubmit} className="space-y-4">
                
                <div>
                  <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2">Nombre del Sector (Título)</label>
                  <input
                    type="text"
                    name="title"
                    required
                    placeholder="Ej. Clínicas & Wellness, Dental Studio"
                    value={sectorFormData.title}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/20 focus:border-[#d4af37] transition-all text-xs font-semibold text-stone-700"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2">Slug Único</label>
                    <input
                      type="text"
                      name="slug"
                      required
                      placeholder="ej-clinicas-wellness"
                      value={sectorFormData.slug}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/20 focus:border-[#d4af37] transition-all text-xs font-mono text-stone-750 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2">Badge Superior</label>
                    <input
                      type="text"
                      name="badge_text"
                      placeholder="Ej. Clínicas de Lujo"
                      value={sectorFormData.badge_text}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/20 focus:border-[#d4af37] transition-all text-xs font-semibold text-stone-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2">URL del Video (Proporción 9:16)</label>
                  <input
                    type="url"
                    name="video_url"
                    placeholder="https://assets.mixkit.co/videos/preview/..."
                    value={sectorFormData.video_url}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/20 focus:border-[#d4af37] transition-all text-xs font-semibold text-stone-700"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2">URL de Imagen Cobertura (Opcional)</label>
                    <input
                      type="text"
                      name="image_url"
                      placeholder="https://..."
                      value={sectorFormData.image_url}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/20 focus:border-[#d4af37] transition-all text-xs font-semibold text-stone-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2">Índice de Orden</label>
                    <input
                      type="number"
                      name="order_index"
                      min={0}
                      value={sectorFormData.order_index}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/20 focus:border-[#d4af37] transition-all text-xs font-semibold text-stone-700"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submittingSector}
                  className="w-full mt-4 bg-stone-950 hover:bg-stone-900 text-white font-bold py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-1 active:scale-95 disabled:opacity-50 text-xs"
                >
                  <span>{editingSector ? 'Guardar Cambios' : 'Crear Sector'}</span>
                  <ChevronRight size={14} />
                </button>

              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

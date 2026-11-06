"use client"

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Sparkles } from 'lucide-react';
import MediaPickerModal from '@/components/MediaPickerModal';
import Showcase3DPreview, { MappedPreviewSector } from './Showcase3DPreview';
import SaaSCMSHeroForm, { HeroTabItem } from './SaaSCMSHeroForm';
import SaaSCMSSectorList, { ShowcaseSector } from './SaaSCMSSectorList';
import SaaSCMSSectorForm from './SaaSCMSSectorForm';
import SaaSCMSPainForm, { PainComparisonData } from './SaaSCMSPainForm';
import SaaSCMSPillarsForm, { PillarsSectionData } from './SaaSCMSPillarsForm';
import SaaSCMSTabsNav from './cms/SaaSCMSTabsNav';
import SaaSCMSBrandingForm from './cms/SaaSCMSBrandingForm';
import SaaSCMSSeoForm from './cms/SaaSCMSSeoForm';
import SectorDeleteModal from './cms/modals/SectorDeleteModal';
import {
  DEFAULT_PAIN_COMPARISON,
  DEFAULT_PILLARS,
  DEFAULT_HERO_TABS,
  FALLBACK_SECTORS,
  DEFAULT_SECTOR_IMAGES,
  DEFAULT_SECTOR_VIDEOS
} from './cms/constants';
import { SubTabType, MarketingSettings, SectorFormData, MediaPickerTarget } from './cms/types';

// Re-exports for backwards compatibility
export { DEFAULT_PAIN_COMPARISON, DEFAULT_PILLARS, DEFAULT_HERO_TABS };

interface SaaSCMSManagerProps {
  token: string;
}

export default function SaaSCMSManager({ token }: SaaSCMSManagerProps) {
  const [subTab, setSubTab] = useState<SubTabType>('hero');
  const [loading, setLoading] = useState(false);

  // Settings state
  const [settings, setSettings] = useState<MarketingSettings>({
    hero_title: 'El único software que tu clínica volverá a necesitar.',
    hero_subtitle: 'Probookia unifica tu agenda, cobros, fichas médicas y marketing en una sola pantalla. Menos herramientas, cero fricción, más rentabilidad.',
    hero_tabs: DEFAULT_HERO_TABS,
    hero_image_1: null,
    hero_image_2: null,
    hero_image_3: null,
    logo_svg: null,
    primary_color: '#3b82f6',
    secondary_color: '#1c1917',
    tertiary_color: '#d4af37',
    font_family: 'playfair',
    font_family_body: 'inter',
    font_weight_headings: 'semibold',
    favicon_url: null,
    seo_title: '',
    seo_description: '',
    seo_keywords: '',
    pain_comparison: DEFAULT_PAIN_COMPARISON,
    pillars: DEFAULT_PILLARS
  });
  const [activeHeroTabId, setActiveHeroTabId] = useState<string>('tab-agenda');
  const [savingSettings, setSavingSettings] = useState(false);

  // Sectors state
  const [sectors, setSectors] = useState<ShowcaseSector[]>([]);
  const [loadingSectors, setLoadingSectors] = useState(false);

  // CRUD state variables for sectors
  const [isAddingSector, setIsAddingSector] = useState(false);
  const [editingSector, setEditingSector] = useState<ShowcaseSector | null>(null);
  const [sectorToDelete, setSectorToDelete] = useState<ShowcaseSector | null>(null);

  const [sectorFormData, setSectorFormData] = useState<SectorFormData>({
    title: '',
    slug: '',
    badge_text: '',
    video_url: '',
    image_url: '',
    order_index: 0
  });
  const [submittingSector, setSubmittingSector] = useState(false);

  // Media Picker Dialog target
  const [pickerTarget, setPickerTarget] = useState<MediaPickerTarget>(null);

  // Preview Navigation States
  const [previewIndex, setPreviewIndex] = useState(0);
  const [previewAnimating, setPreviewAnimating] = useState(false);

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
      if (data && data.hero_title) {
        if (!data.hero_tabs || data.hero_tabs.length === 0) {
          data.hero_tabs = DEFAULT_HERO_TABS;
        }
        if (!data.pain_comparison || Object.keys(data.pain_comparison).length === 0) {
          data.pain_comparison = DEFAULT_PAIN_COMPARISON;
        }
        if (!data.pillars || Object.keys(data.pillars).length === 0) {
          data.pillars = DEFAULT_PILLARS;
        }
        setSettings(data);
        if (data.hero_tabs?.[0]?.id) {
          setActiveHeroTabId(data.hero_tabs[0].id);
        }
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
      if (!response.ok) throw new Error('Error al obtener sectores');
      const data = await response.json();
      setSectors(data || []);
    } catch (err: any) {
      console.error(err);
      toast.error('No se pudieron obtener los sectores del servidor.');
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
      video_url: sector.video_url || DEFAULT_SECTOR_VIDEOS[sector.slug] || '',
      image_url: sector.image_url || DEFAULT_SECTOR_IMAGES[sector.slug] || '',
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

  const handleTabChange = (tab: SubTabType) => {
    setSubTab(tab);
    setEditingSector(null);
    setIsAddingSector(false);

    const targetMap: Record<string, string> = {
      hero: 'preview-hero',
      sectors: 'preview-sectors',
      pain: 'preview-pain',
      pillars: 'preview-pillars'
    };
    const targetId = targetMap[tab];
    if (targetId) {
      setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 50);
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

  const previewSectors: MappedPreviewSector[] = sectorsForPreview.length > 0
    ? sectorsForPreview.map((s, index) => {
      let gradient = 'from-blue-50 to-blue-100/30';
      if (s.slug === 'barberias' || index === 1) gradient = 'from-amber-50 to-amber-100/30';
      else if (s.slug === 'dentistas' || index === 2) gradient = 'from-emerald-50 to-emerald-100/30';
      else if (s.slug === 'peluquerias' || index === 3) gradient = 'from-purple-50 to-purple-100/30';
      else if (s.slug === 'tattoos' || index === 4) gradient = 'from-stone-700 to-stone-900/40';

      let copy = 'Configura tu plataforma en marca blanca de alta gama con subdominio exclusivo y RLS a nivel de base de datos.';
      if (s.slug === 'clinicas') copy = 'Aislamiento total de expedientes clínicos en base de datos, firmas manuscritas Base64 y branding de lujo.';
      else if (s.slug === 'barberias') copy = 'Gestión ágil de especialistas en tiempo real, venta de bonos express y protección total contra incomparecencias.';
      else if (s.slug === 'dentistas') copy = 'Calendarios dinámicos asimétricos, cobros rápidos en POS y recordatorios automáticos por SMTP privado.';
      else if (s.slug === 'peluquerias') copy = 'Portal de reserva en 3 pasos con colores y logotipos propios, adaptable a dominio exclusivo corporativo.';
      else if (s.slug === 'tattoos') copy = 'Gestión de citas por artista, anticipos online y fichas de consentimiento informado sin papel.';

      return {
        id: s.id,
        badge: s.badge_text || 'Especialidad',
        title: s.title,
        copy: copy,
        videoUrl: s.video_url || DEFAULT_SECTOR_VIDEOS[s.slug] || '',
        imageUrl: s.image_url || DEFAULT_SECTOR_IMAGES[s.slug] || '',
        placeholderGradient: gradient
      };
    })
    : FALLBACK_SECTORS;

  return (
    <div className="flex h-full w-full bg-stone-50 overflow-hidden font-sans border-t border-stone-200">

      {/* 1. LEFT SIDEBAR: FORMS & CONFIGURATION */}
      <div className="w-full lg:w-[480px] xl:w-[520px] bg-white border-r border-stone-200 flex flex-col shrink-0 h-full relative z-10 shadow-[10px_0_30px_rgba(0,0,0,0.02)]">

        {/* Sidebar Header */}
        <div className="p-6 pb-4 border-b border-stone-100 flex items-center justify-between shrink-0 font-sans">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-stone-950 text-white flex items-center justify-center font-bold text-xs tracking-wider">
              P
            </div>
            <div>
              <h2 className="text-sm font-bold text-stone-900 tracking-tight">Editor de Portada</h2>
              <p className="text-[10px] text-stone-400 font-medium">SaaS Marketing CMS</p>
            </div>
          </div>
          <span className="bg-[#fcf8e5] text-[#d4af37] text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-[#d4af37]/20">
            SuperAdmin
          </span>
        </div>

        {/* Tab Selectors inside Sidebar */}
        <SaaSCMSTabsNav activeTab={subTab} onChangeTab={handleTabChange} />

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
                  Los textos y pestañas introducidos aquí se reflejan instantáneamente en el Hero interactivo de la derecha.
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
                  heroTabs={settings.hero_tabs || DEFAULT_HERO_TABS}
                  activeTabId={activeHeroTabId}
                  onChangeTitle={(val) => setSettings(prev => ({ ...prev, hero_title: val }))}
                  onChangeSubtitle={(val) => setSettings(prev => ({ ...prev, hero_subtitle: val }))}
                  onAddTab={() => {
                    const newId = `tab-${Date.now()}`;
                    const newTab: HeroTabItem = {
                      id: newId,
                      label: `Nueva Función ${(settings.hero_tabs?.length || 0) + 1}`,
                      image_url: ''
                    };
                    setSettings(prev => ({
                      ...prev,
                      hero_tabs: [...(prev.hero_tabs || []), newTab]
                    }));
                    setActiveHeroTabId(newId);
                  }}
                  onUpdateTabLabel={(id, label) => {
                    setSettings(prev => ({
                      ...prev,
                      hero_tabs: (prev.hero_tabs || []).map(t => t.id === id ? { ...t, label } : t)
                    }));
                  }}
                  onUpdateTabImage={(id, image_url) => {
                    setSettings(prev => ({
                      ...prev,
                      hero_tabs: (prev.hero_tabs || []).map(t => t.id === id ? { ...t, image_url } : t)
                    }));
                  }}
                  onUpdateTabMobileImage={(id, mobile_image_url) => {
                    setSettings(prev => ({
                      ...prev,
                      hero_tabs: (prev.hero_tabs || []).map(t => t.id === id ? { ...t, mobile_image_url } : t)
                    }));
                  }}
                  onDeleteTab={(id) => {
                    const remaining = (settings.hero_tabs || []).filter(t => t.id !== id);
                    setSettings(prev => ({
                      ...prev,
                      hero_tabs: remaining
                    }));
                    if (activeHeroTabId === id && remaining.length > 0) {
                      setActiveHeroTabId(remaining[0].id);
                    }
                  }}
                  onSetActiveTab={(id) => setActiveHeroTabId(id)}
                  onSelectImageFromGallery={(tabId, isMobile) => setPickerTarget({ field: isMobile ? 'hero_tab_mobile' : 'hero_tab', tabId })}
                  onSubmit={handleSaveSettings}
                  saving={savingSettings}
                  token={token}
                />
              )}
            </div>
          )}

          {/* B. PAIN & PROS COMPARISON FORM */}
          {subTab === 'pain' && (
            <div className="p-6 space-y-6">
              {loading ? (
                <div className="space-y-4 animate-pulse">
                  <div className="h-4 w-32 bg-stone-100 rounded"></div>
                  <div className="h-10 w-full bg-stone-100 rounded-xl"></div>
                </div>
              ) : (
                <SaaSCMSPainForm
                  data={settings.pain_comparison || DEFAULT_PAIN_COMPARISON}
                  onChange={(newData) => setSettings(prev => ({ ...prev, pain_comparison: newData }))}
                  onSave={handleSaveSettings}
                  saving={savingSettings}
                />
              )}
            </div>
          )}

          {/* C. 4 PILLARS FORM */}
          {subTab === 'pillars' && (
            <div className="p-6 space-y-6">
              {loading ? (
                <div className="space-y-4 animate-pulse">
                  <div className="h-4 w-32 bg-stone-100 rounded"></div>
                  <div className="h-10 w-full bg-stone-100 rounded-xl"></div>
                </div>
              ) : (
                <SaaSCMSPillarsForm
                  data={settings.pillars || DEFAULT_PILLARS}
                  onChange={(newData) => setSettings(prev => ({ ...prev, pillars: newData }))}
                  onSave={handleSaveSettings}
                  saving={savingSettings}
                />
              )}
            </div>
          )}

          {/* D. BRANDING FORM */}
          {subTab === 'branding' && (
            <SaaSCMSBrandingForm
              settings={settings}
              onChange={(updates) => setSettings(prev => ({ ...prev, ...updates }))}
              onSave={handleSaveSettings}
              saving={savingSettings}
              loading={loading}
            />
          )}

          {/* E. SEO METADATA FORM */}
          {subTab === 'seo' && (
            <SaaSCMSSeoForm
              settings={settings}
              onChange={(updates) => setSettings(prev => ({ ...prev, ...updates }))}
              onSave={handleSaveSettings}
              saving={savingSettings}
              loading={loading}
            />
          )}

          {/* F. SECTORS LIST / CRUD */}
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

        {/* INLINE DELETION DIALOG */}
        {sectorToDelete && (
          <SectorDeleteModal
            sector={sectorToDelete}
            onCancel={() => setSectorToDelete(null)}
            onConfirm={handleConfirmDelete}
          />
        )}

      </div>

      {/* 2. RIGHT VIEWPORT: LIVE HERO SAAS SIMULATOR */}
      <Showcase3DPreview
        heroTitle={settings.hero_title}
        heroSubtitle={settings.hero_subtitle}
        heroTabs={settings.hero_tabs || DEFAULT_HERO_TABS}
        activeHeroTabId={activeHeroTabId}
        onSelectHeroTab={setActiveHeroTabId}
        primaryColor={settings.primary_color}
        secondaryColor={settings.secondary_color}
        tertiaryColor={settings.tertiary_color}
        fontFamily={settings.font_family}
        fontFamilyBody={settings.font_family_body}
        fontWeightHeadings={settings.font_weight_headings}
        logoSvg={settings.logo_svg}
        previewSectors={previewSectors}
        previewIndex={previewIndex}
        previewAnimating={previewAnimating}
        onNavigateSector={handlePreviewNavigate}
        painComparisonData={settings.pain_comparison || DEFAULT_PAIN_COMPARISON}
        pillarsData={settings.pillars || DEFAULT_PILLARS}
      />

      {/* Media Picker Dialog Modal */}
      {pickerTarget && (
        <MediaPickerModal
          onClose={() => setPickerTarget(null)}
          onImageSelected={(url) => {
            if (pickerTarget.field === 'hero_tab' && pickerTarget.tabId) {
              setSettings(prev => ({
                ...prev,
                hero_tabs: (prev.hero_tabs || []).map(tab =>
                  tab.id === pickerTarget.tabId ? { ...tab, image_url: url } : tab
                )
              }));
            } else if (pickerTarget.field === 'hero_tab_mobile' && pickerTarget.tabId) {
              setSettings(prev => ({
                ...prev,
                hero_tabs: (prev.hero_tabs || []).map(tab =>
                  tab.id === pickerTarget.tabId ? { ...tab, mobile_image_url: url } : tab
                )
              }));
            } else if (pickerTarget.field.startsWith('hero_image_')) {
              setSettings(prev => ({ ...prev, [pickerTarget.field]: url }));
            } else {
              setSectorFormData(prev => ({ ...prev, [pickerTarget.field]: url }));
            }
            setPickerTarget(null);
          }}
          mediaType={pickerTarget.field === 'video_url' ? 'video' : 'image'}
          forceAspect={pickerTarget.field === 'hero_tab' ? 16 / 9 : pickerTarget.field === 'hero_tab_mobile' ? 9 / 16 : undefined}
          tenantId="00000000-0000-0000-0000-000000000000"
          token={token}
        />
      )}

    </div>
  );
}

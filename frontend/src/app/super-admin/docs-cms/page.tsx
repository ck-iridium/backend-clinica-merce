'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useFeedback } from '@/app/contexts/FeedbackContext';
import { Skeleton } from '@/components/ui/skeleton';
import RichTextEditor from '@/components/cms/RichTextEditor';
import SuperAdminSidebar from '../components/SuperAdminSidebar';
import { 
  FolderPlus, 
  FilePlus, 
  ChevronRight, 
  Settings, 
  Trash2, 
  Save, 
  Globe, 
  ChevronUp, 
  ChevronDown, 
  Folder, 
  FileText 
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface DocPage {
  id: string;
  section_id: string;
  slug: string;
  title: Record<string, string>;
  content: Record<string, string>;
  position: number;
}

interface DocSection {
  id: string;
  slug: string;
  title: Record<string, string>;
  position: number;
  pages: DocPage[];
}

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

export default function SuperAdminDocsCMSPage() {
  const router = useRouter();
  const { showFeedback } = useFeedback();

  // Authentication & Session
  const [user, setUser] = useState<any>(null);
  const [loadingSession, setLoadingSession] = useState(true);

  // CMS State
  const [sections, setSections] = useState<DocSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPage, setSelectedPage] = useState<DocPage | null>(null);
  const [activeTab, setActiveTab] = useState<'es' | 'en' | 'fr'>('es');

  // Page Editing Form State
  const [pageTitle, setPageTitle] = useState<Record<string, string>>({ es: '', en: '', fr: '' });
  const [pageContent, setPageContent] = useState<Record<string, string>>({ es: '', en: '', fr: '' });
  const [pageSlug, setPageSlug] = useState('');
  const [slugManual, setSlugManual] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [savingPage, setSavingPage] = useState(false);

  // Modals / Modifiers
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [sectionTitle, setSectionTitle] = useState<Record<string, string>>({ es: '', en: '', fr: '' });
  const [sectionSlug, setSectionSlug] = useState('');
  const [sectionSlugManual, setSectionSlugManual] = useState(false);
  const [savingSection, setSavingSection] = useState(false);

  const [showPageModal, setShowPageModal] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState<Record<string, string>>({ es: '', en: '', fr: '' });
  const [newPageSlug, setNewPageSlug] = useState('');
  const [newPageSlugManual, setNewPageSlugManual] = useState(false);
  const [targetSectionId, setTargetSectionId] = useState('');
  const [creatingPage, setCreatingPage] = useState(false);

  const [confirmDeleteSection, setConfirmDeleteSection] = useState<DocSection | null>(null);
  const [confirmDeletePage, setConfirmDeletePage] = useState<DocPage | null>(null);
  const [deleting, setDeleting] = useState(false);

  // 1. Secure Auth Check
  useEffect(() => {
    async function checkAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const tokenParts = session.access_token.split('.');
          if (tokenParts.length === 3) {
            const payload = JSON.parse(atob(tokenParts[1]));
            const role = payload.app_metadata?.role || payload.user_metadata?.role;
            
            if (role === 'super_admin') {
              const fullName = session.user.user_metadata?.full_name || '';
              const avatarUrl = session.user.user_metadata?.avatar_url || '';
              setUser({
                email: session.user.email,
                id: session.user.id,
                access_token: session.access_token,
                role: role,
                full_name: fullName,
                avatar_url: avatarUrl
              });
              // Load data only after session is confirmed
              fetchCMSData();
            } else {
              setUser({ role: role || 'client' });
            }
          }
        }
      } catch (err) {
        console.error('Error al comprobar sesión:', err);
      } finally {
        setLoadingSession(false);
      }
    }
    checkAuth();
  }, []);

  // Sync Form States when selecting/switching pages
  useEffect(() => {
    if (selectedPage) {
      setPageTitle({
        es: selectedPage.title?.es || '',
        en: selectedPage.title?.en || '',
        fr: selectedPage.title?.fr || ''
      });
      setPageContent({
        es: selectedPage.content?.es || '',
        en: selectedPage.content?.en || '',
        fr: selectedPage.content?.fr || ''
      });
      setPageSlug(selectedPage.slug || '');
      setSelectedSectionId(selectedPage.section_id || '');
      setSlugManual(true);
    } else {
      setPageTitle({ es: '', en: '', fr: '' });
      setPageContent({ es: '', en: '', fr: '' });
      setPageSlug('');
      setSelectedSectionId('');
      setSlugManual(false);
    }
  }, [selectedPage]);

  // Auto-slug generations
  useEffect(() => {
    if (!sectionSlugManual) {
      setSectionSlug(toSlug(sectionTitle.es || ''));
    }
  }, [sectionTitle.es, sectionSlugManual]);

  useEffect(() => {
    if (!newPageSlugManual) {
      setNewPageSlug(toSlug(newPageTitle.es || ''));
    }
  }, [newPageTitle.es, newPageSlugManual]);

  useEffect(() => {
    if (!slugManual && selectedPage) {
      setPageSlug(toSlug(pageTitle.es || ''));
    }
  }, [pageTitle.es, slugManual, selectedPage]);

  const fetchCMSData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/docs-cms/sections`);
      if (res.ok) {
        const data = await res.json();
        setSections(data);
      } else {
        throw new Error();
      }
    } catch {
      showFeedback({ 
        type: 'error', 
        title: 'Error', 
        message: 'No se pudieron cargar los datos del CMS de Documentación.' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Create Section Handler
  const handleCreateSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sectionTitle.es.trim() || !sectionSlug.trim()) return;
    setSavingSection(true);
    try {
      const res = await fetch(`${API}/docs-cms/sections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: sectionSlug.trim(),
          title: {
            es: sectionTitle.es.trim(),
            en: sectionTitle.en.trim() || sectionTitle.es.trim(),
            fr: sectionTitle.fr.trim() || sectionTitle.es.trim(),
          },
          position: sections.length
        })
      });

      if (res.status === 409) {
        showFeedback({ type: 'error', title: 'Slug duplicado', message: 'Ya existe una sección con esta dirección de URL.' });
        return;
      }

      if (!res.ok) throw new Error();
      showFeedback({ type: 'success', title: 'Sección creada', message: 'Sección de documentación añadida con éxito.' });
      setShowSectionModal(false);
      setSectionTitle({ es: '', en: '', fr: '' });
      setSectionSlug('');
      setSectionSlugManual(false);
      fetchCMSData();
    } catch {
      showFeedback({ type: 'error', title: 'Error', message: 'No se pudo crear la sección.' });
    } finally {
      setSavingSection(false);
    }
  };

  // Create Page Handler
  const handleCreatePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPageTitle.es.trim() || !newPageSlug.trim() || !targetSectionId) return;
    setCreatingPage(true);
    try {
      const targetSec = sections.find(s => s.id === targetSectionId);
      const pos = targetSec ? targetSec.pages.length : 0;

      const res = await fetch(`${API}/docs-cms/pages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section_id: targetSectionId,
          slug: newPageSlug.trim(),
          title: {
            es: newPageTitle.es.trim(),
            en: newPageTitle.en.trim() || newPageTitle.es.trim(),
            fr: newPageTitle.fr.trim() || newPageTitle.es.trim(),
          },
          content: {
            es: '<p>Comienza a escribir aquí...</p>',
            en: '<p>Start writing here...</p>',
            fr: '<p>Commencez à écrire ici...</p>'
          },
          position: pos
        })
      });

      if (res.status === 409) {
        showFeedback({ type: 'error', title: 'Slug duplicado', message: 'Ya existe una página de documentación con esta URL.' });
        return;
      }

      if (!res.ok) throw new Error();
      const pageCreated = await res.json();
      showFeedback({ type: 'success', title: 'Página creada', message: 'Página añadida al índice de documentación.' });
      setShowPageModal(false);
      setNewPageTitle({ es: '', en: '', fr: '' });
      setNewPageSlug('');
      setNewPageSlugManual(false);
      await fetchCMSData();
      setSelectedPage(pageCreated);
    } catch {
      showFeedback({ type: 'error', title: 'Error', message: 'No se pudo crear la página.' });
    } finally {
      setCreatingPage(false);
    }
  };

  // Save Page Edits
  const handleSavePage = async () => {
    if (!selectedPage || !pageTitle.es.trim() || !pageSlug.trim()) return;
    setSavingPage(true);
    try {
      const res = await fetch(`${API}/docs-cms/pages/${selectedPage.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section_id: selectedSectionId,
          slug: pageSlug.trim(),
          title: {
            es: pageTitle.es.trim(),
            en: pageTitle.en.trim() || pageTitle.es.trim(),
            fr: pageTitle.fr.trim() || pageTitle.es.trim(),
          },
          content: {
            es: pageContent.es,
            en: pageContent.en || pageContent.es,
            fr: pageContent.fr || pageContent.es,
          }
        })
      });

      if (res.status === 409) {
        showFeedback({ type: 'error', title: 'Slug duplicado', message: 'Ya existe una página con este slug.' });
        return;
      }

      if (!res.ok) throw new Error();
      const updated = await res.json();
      showFeedback({ type: 'success', title: 'Guardado', message: 'Página de documentación actualizada correctamente.' });
      await fetchCMSData();
      setSelectedPage(updated);
    } catch {
      showFeedback({ type: 'error', title: 'Error', message: 'No se pudieron guardar los cambios.' });
    } finally {
      setSavingPage(false);
    }
  };

  // Reorder Sections or Pages Positions
  const handleReorder = async (type: 'section' | 'page', id: string, direction: 'up' | 'down') => {
    if (type === 'section') {
      const idx = sections.findIndex(s => s.id === id);
      if (idx === -1) return;
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= sections.length) return;
      
      const newSecs = [...sections];
      const temp = newSecs[idx];
      newSecs[idx] = newSecs[targetIdx];
      newSecs[targetIdx] = temp;

      try {
        await Promise.all([
          fetch(`${API}/docs-cms/sections/${newSecs[idx].id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ position: idx })
          }),
          fetch(`${API}/docs-cms/sections/${newSecs[targetIdx].id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ position: targetIdx })
          })
        ]);
        setSections(newSecs);
      } catch {
        showFeedback({ type: 'error', title: 'Error', message: 'No se pudo reordenar las secciones.' });
      }
    } else {
      let pageSec: DocSection | null = null;
      let pIdx = -1;
      for (const sec of sections) {
        const found = sec.pages.findIndex(p => p.id === id);
        if (found !== -1) {
          pageSec = sec;
          pIdx = found;
          break;
        }
      }
      if (!pageSec || pIdx === -1) return;
      const targetIdx = direction === 'up' ? pIdx - 1 : pIdx + 1;
      if (targetIdx < 0 || targetIdx >= pageSec.pages.length) return;

      const newPages = [...pageSec.pages];
      const temp = newPages[pIdx];
      newPages[pIdx] = newPages[targetIdx];
      newPages[targetIdx] = temp;

      try {
        await Promise.all([
          fetch(`${API}/docs-cms/pages/${newPages[pIdx].id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ position: pIdx })
          }),
          fetch(`${API}/docs-cms/pages/${newPages[targetIdx].id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ position: targetIdx })
          })
        ]);
        fetchCMSData();
      } catch {
        showFeedback({ type: 'error', title: 'Error', message: 'No se pudo reordenar las páginas.' });
      }
    }
  };

  // Delete Handlers
  const handleDeleteSection = async () => {
    if (!confirmDeleteSection) return;
    setDeleting(true);
    try {
      const res = await fetch(`${API}/docs-cms/sections/${confirmDeleteSection.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      showFeedback({ type: 'success', title: 'Sección eliminada', message: 'La sección y todas sus páginas fueron eliminadas.' });
      setSelectedPage(null);
      setConfirmDeleteSection(null);
      fetchCMSData();
    } catch {
      showFeedback({ type: 'error', title: 'Error', message: 'No se pudo borrar la sección.' });
    } finally {
      setDeleting(false);
    }
  };

  const handleDeletePage = async () => {
    if (!confirmDeletePage) return;
    setDeleting(true);
    try {
      const res = await fetch(`${API}/docs-cms/pages/${confirmDeletePage.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      showFeedback({ type: 'success', title: 'Página eliminada', message: 'La página de documentación fue borrada correctamente.' });
      setSelectedPage(null);
      setConfirmDeletePage(null);
      fetchCMSData();
    } catch {
      showFeedback({ type: 'error', title: 'Error', message: 'No se pudo borrar la página.' });
    } finally {
      setDeleting(false);
    }
  };

  // 2. Loading Session Spinner
  if (loadingSession) {
    return (
      <div className="min-h-screen bg-[#F7F7F5] flex flex-col justify-center items-center py-24 px-8">
        <div className="w-full max-w-7xl space-y-8">
          <div className="h-10 w-64 bg-stone-200 animate-pulse rounded-xl"></div>
          <div className="h-96 bg-stone-200 animate-pulse rounded-[2rem]"></div>
        </div>
      </div>
    );
  }

  // 3. Secure Access Guard
  if (!user || user.role !== 'super_admin') {
    return (
      <div className="min-h-screen bg-[#F7F7F5] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-[2rem] border border-stone-200/60 p-10 text-center shadow-luxury">
          <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-stone-100 text-stone-600 mb-6 text-2xl">
            🔒
          </div>
          <h1 className="text-3xl font-serif font-bold text-stone-900 mb-4">Acceso Denegado</h1>
          <p className="text-stone-500 mb-8 font-sans font-medium text-sm leading-relaxed">
            Esta área está estrictamente reservada para el Super Administrador global del SaaS. Tu cuenta actual no dispone de los privilegios requeridos.
          </p>
          <div className="space-y-3">
            <button 
              onClick={() => router.push('/login')}
              className="w-full bg-[#d4af37] hover:bg-[#c29f2e] text-stone-950 font-bold py-4 rounded-xl shadow-md transition-all duration-300">
              Iniciar Sesión como Super Admin
            </button>
            <button 
              onClick={() => router.push('/')}
              className="w-full bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 font-bold py-4 rounded-xl shadow-sm transition-all duration-300">
              Volver a la Página Principal
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-[#F7F7F5] text-stone-850 flex">
      {/* Sidebar Modular */}
      <SuperAdminSidebar activeTab="docs-cms" setActiveTab={() => {}} />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Header */}
        <header className="h-20 shrink-0 bg-white border-b border-stone-200/50 px-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-400 font-sans">
              <span>Consola SaaS</span>
              <ChevronRight className="w-3 h-3 text-stone-300" />
              <span>CMS</span>
              <ChevronRight className="w-3 h-3 text-stone-300" />
              <span className="text-[#d4af37] font-bold">Documentación Global</span>
            </div>
            <h1 className="text-2xl font-bold font-serif text-stone-900">
              Gestor de Manual de Ayuda
            </h1>
          </div>

          <div 
            onClick={() => router.push('/super-admin')}
            className="flex items-center gap-4 cursor-pointer hover:opacity-85 active:scale-95 transition-all select-none"
            title="Consola de Administración"
          >
            <div className="hidden md:flex flex-col text-right">
              <span className="text-xs font-bold text-stone-850">{user.full_name || 'Administrador Global'}</span>
              <span className="text-[10px] text-stone-400 font-medium">{user.email}</span>
            </div>
            {user.avatar_url ? (
              <div className="w-10 h-10 rounded-xl overflow-hidden border border-[#fcf8e5] shadow-inner shrink-0">
                <img src={user.avatar_url} alt="Avatar Admin" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-xl bg-[#fcf8e5] text-[#d4af37] flex items-center justify-center font-bold text-sm shadow-inner shrink-0">
                SA
              </div>
            )}
          </div>
        </header>

        {/* Scrollable CMS Frame */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto">
            {/* Header Form Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 bg-white border border-stone-200/50 rounded-3xl p-6 shadow-sm">
              <div>
                <h2 className="text-lg font-serif font-black text-stone-800">Directorio de Guías del Sistema</h2>
                <p className="text-stone-400 text-xs mt-1">Crea y edita secciones jerárquicas visibles para todas las clínicas bajo /docs.</p>
              </div>

              <div className="flex gap-3 shrink-0">
                <button
                  onClick={() => {
                    setSectionTitle({ es: '', en: '', fr: '' });
                    setSectionSlug('');
                    setSectionSlugManual(false);
                    setShowSectionModal(true);
                  }}
                  className="flex items-center gap-2 border border-stone-200 hover:bg-stone-50 text-stone-700 px-5 py-3 rounded-2xl text-xs font-bold transition-all duration-300 shadow-sm"
                >
                  <FolderPlus size={15} />
                  <span>Nueva Sección</span>
                </button>
                
                <button
                  onClick={() => {
                    if (sections.length === 0) {
                      showFeedback({ type: 'error', title: 'Aviso', message: 'Primero debes crear una sección.' });
                      return;
                    }
                    setNewPageTitle({ es: '', en: '', fr: '' });
                    setNewPageSlug('');
                    setNewPageSlugManual(false);
                    setTargetSectionId(sections[0].id);
                    setShowPageModal(true);
                  }}
                  className="flex items-center gap-2 bg-stone-900 hover:bg-[#d4af37] text-white px-5 py-3 rounded-2xl text-xs font-bold transition-all duration-300 shadow-sm"
                >
                  <FilePlus size={15} />
                  <span>Nueva Página</span>
                </button>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8">
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full rounded-2xl" />
                  <Skeleton className="h-48 w-full rounded-2xl" />
                </div>
                <div className="space-y-6">
                  <Skeleton className="h-[450px] w-full rounded-2xl" />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8 items-start">
                
                {/* ── SIDEBAR TREE ── */}
                <div className="bg-white rounded-3xl border border-stone-200/50 p-5 shadow-sm space-y-6 max-h-[70vh] overflow-y-auto">
                  <h3 className="text-[10px] font-black uppercase tracking-wider text-stone-400">
                    Estructura Global
                  </h3>

                  {sections.length === 0 ? (
                    <div className="text-center py-10 border-2 border-dashed border-stone-150 rounded-2xl p-4 bg-stone-50/50">
                      <Folder className="w-8 h-8 text-stone-300 mx-auto mb-3" />
                      <p className="text-stone-500 text-xs font-semibold">No hay secciones globales.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {sections.map((sec, sIdx) => (
                        <div key={sec.id} className="border border-stone-100 rounded-2xl p-3 bg-stone-50/30 hover:bg-stone-50/60 transition-all">
                          
                          <div className="flex items-center justify-between gap-2 group select-none">
                            <div className="flex items-center gap-2 truncate">
                              <Folder className="w-4 h-4 text-[#d4af37] shrink-0" />
                              <span className="font-bold text-xs text-stone-850 truncate">
                                {sec.title?.es || sec.slug}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleReorder('section', sec.id, 'up')}
                                disabled={sIdx === 0}
                                className="p-1 rounded hover:bg-stone-200 text-stone-400 hover:text-stone-750 disabled:opacity-20"
                              >
                                <ChevronUp size={12} />
                              </button>
                              <button
                                onClick={() => handleReorder('section', sec.id, 'down')}
                                disabled={sIdx === sections.length - 1}
                                className="p-1 rounded hover:bg-stone-200 text-stone-400 hover:text-stone-750 disabled:opacity-20"
                              >
                                <ChevronDown size={12} />
                              </button>
                              <button
                                onClick={() => setConfirmDeleteSection(sec)}
                                className="p-1 rounded hover:bg-red-50 text-stone-300 hover:text-red-500"
                                title="Eliminar Sección"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>

                          <div className="mt-2.5 pl-3 border-l border-stone-200 space-y-1">
                            {sec.pages?.length === 0 ? (
                              <span className="text-[10px] text-stone-400 italic block py-1 pl-1">
                                Sin páginas
                              </span>
                            ) : (
                              sec.pages.map((page, pIdx) => {
                                const isSelected = selectedPage?.id === page.id;
                                return (
                                  <div 
                                    key={page.id} 
                                    className={`flex items-center justify-between gap-2 p-1.5 rounded-lg transition-all ${
                                      isSelected 
                                        ? 'bg-[#d4af37]/10 text-[#d4af37]' 
                                        : 'hover:bg-stone-100/60 text-stone-600'
                                    }`}
                                  >
                                    <button
                                      onClick={() => setSelectedPage(page)}
                                      className="flex-1 text-left flex items-center gap-1.5 min-w-0"
                                    >
                                      <FileText size={12} className={isSelected ? 'text-[#d4af37]' : 'text-stone-400'} />
                                      <span className="text-xs truncate font-medium">
                                        {page.title?.es || page.slug}
                                      </span>
                                    </button>

                                    <div className="flex items-center gap-0.5 shrink-0">
                                      <button
                                        onClick={() => handleReorder('page', page.id, 'up')}
                                        disabled={pIdx === 0}
                                        className="p-0.5 rounded hover:bg-stone-200 text-stone-400 disabled:opacity-20"
                                      >
                                        <ChevronUp size={11} />
                                      </button>
                                      <button
                                        onClick={() => handleReorder('page', page.id, 'down')}
                                        disabled={pIdx === sec.pages.length - 1}
                                        className="p-0.5 rounded hover:bg-stone-200 text-stone-400 disabled:opacity-20"
                                      >
                                        <ChevronDown size={11} />
                                      </button>
                                      <button
                                        onClick={() => setConfirmDeletePage(page)}
                                        className="p-0.5 rounded hover:bg-red-50 text-stone-300 hover:text-red-400"
                                        title="Eliminar Página"
                                      >
                                        <Trash2 size={11} />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>

                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* ── PAGE EDITOR PANEL ── */}
                <div className="bg-white rounded-3xl border border-stone-200/50 p-6 md:p-8 shadow-sm">
                  {!selectedPage ? (
                    <div className="text-center py-32 max-w-sm mx-auto">
                      <div className="w-16 h-16 bg-stone-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-stone-100">
                        <FileText className="w-8 h-8 text-stone-300" />
                      </div>
                      <h3 className="font-serif text-2xl font-bold text-[#d4af37] mb-2 font-serif">Editor CMS Activo</h3>
                      <p className="text-stone-400 text-sm">
                        Selecciona o crea una guía de ayuda para editar su contenido global en tiempo real.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-150 pb-5">
                        <div className="min-w-0">
                          <span className="text-[9px] font-black uppercase tracking-widest text-[#d4af37] block mb-1">
                            Página seleccionada
                          </span>
                          <h2 className="font-serif text-2xl font-black text-stone-850 truncate">
                            {pageTitle[activeTab] || pageSlug}
                          </h2>
                        </div>

                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => setConfirmDeletePage(selectedPage)}
                            className="p-3 rounded-2xl border border-red-200 text-red-500 hover:bg-red-50 transition-all"
                            title="Eliminar página"
                          >
                            <Trash2 size={16} />
                          </button>

                          <button
                            onClick={handleSavePage}
                            disabled={savingPage}
                            className="flex items-center gap-2 bg-stone-900 hover:bg-[#d4af37] text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-300 shadow-sm disabled:opacity-40"
                          >
                            <Save size={14} />
                            <span>{savingPage ? 'Guardando...' : 'Guardar Página'}</span>
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-wider text-stone-400 mb-1.5">
                            Slug de la URL
                          </label>
                          <input
                            type="text"
                            value={pageSlug}
                            onChange={e => setPageSlug(e.target.value)}
                            placeholder="ej: que-es-probookia"
                            className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-xs font-mono text-stone-700 focus:outline-none focus:border-[#d4af37]"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-wider text-stone-400 mb-1.5">
                            Sección contenedora
                          </label>
                          <select
                            value={selectedSectionId}
                            onChange={e => setSelectedSectionId(e.target.value)}
                            className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-xs text-stone-700 focus:outline-none focus:border-[#d4af37]"
                          >
                            {sections.map(sec => (
                              <option key={sec.id} value={sec.id}>
                                {sec.title?.es || sec.slug}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="flex border-b border-stone-150">
                        {(['es', 'en', 'fr'] as const).map(lang => (
                          <button
                            key={lang}
                            onClick={() => setActiveTab(lang)}
                            className={`px-5 py-3 text-xs font-bold tracking-wider uppercase border-b-2 transition-all flex items-center gap-1.5 ${
                              activeTab === lang 
                                ? 'border-[#d4af37] text-stone-855 bg-stone-50/50' 
                                : 'border-transparent text-stone-400 hover:text-stone-600'
                            }`}
                          >
                            <Globe size={13} className={activeTab === lang ? 'text-[#d4af37]' : 'text-stone-400'} />
                            <span>{lang === 'es' ? 'Español' : lang === 'en' ? 'English' : 'Français'}</span>
                          </button>
                        ))}
                      </div>

                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-wider text-stone-400 mb-1.5">
                          Título de la Página ({activeTab.toUpperCase()})
                        </label>
                        <input
                          type="text"
                          value={pageTitle[activeTab] || ''}
                          onChange={e => setPageTitle({ ...pageTitle, [activeTab]: e.target.value })}
                          placeholder={`Escribe el título en ${activeTab === 'es' ? 'español' : activeTab === 'en' ? 'inglés' : 'francés'}...`}
                          className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-850 font-bold focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-wider text-stone-400 mb-1.5">
                          Contenido Enriquecido ({activeTab.toUpperCase()})
                        </label>
                        <RichTextEditor
                          key={`${selectedPage.id}-${activeTab}`}
                          value={pageContent[activeTab] || ''}
                          onChange={html => setPageContent({ ...pageContent, [activeTab]: html })}
                          tenantId="00000000-0000-0000-0000-000000000000"
                          token={user.access_token}
                        />
                      </div>

                    </div>
                  )}
                </div>

              </div>
            )}
          </div>
        </div>
      </main>

      {/* ── MODAL NUEVA SECCIÓN ──────────────────────────────────── */}
      {showSectionModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 animate-in zoom-in-95 duration-300">
            <div className="mb-6">
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#d4af37] block mb-1">Estructura</span>
              <h2 className="font-serif text-2xl font-bold text-stone-850">Añadir nueva sección</h2>
              <p className="text-stone-400 text-xs mt-1">Representa una categoría superior en el índice del manual.</p>
            </div>

            <form onSubmit={handleCreateSection} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-stone-600 mb-2 uppercase tracking-wider">
                  Nombre de la Sección (ES)
                </label>
                <input
                  type="text"
                  value={sectionTitle.es}
                  onChange={e => setSectionTitle({ ...sectionTitle, es: e.target.value })}
                  placeholder="Ej: Empezando con ProBookia"
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-800 font-medium focus:outline-none focus:border-[#d4af37]"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-600 mb-2 uppercase tracking-wider">
                  Nombre de la Sección (EN - Opcional)
                </label>
                <input
                  type="text"
                  value={sectionTitle.en}
                  onChange={e => setSectionTitle({ ...sectionTitle, en: e.target.value })}
                  placeholder="Ej: Getting Started"
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-850 font-medium focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-600 mb-2 uppercase tracking-wider">
                  Slug / Directorio URL
                </label>
                <input
                  type="text"
                  value={sectionSlug}
                  onChange={e => { setSectionSlug(e.target.value); setSectionSlugManual(true); }}
                  placeholder="ej: empezando-probookia"
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm font-mono text-stone-700 focus:outline-none focus:border-[#d4af37]"
                  required
                  pattern="[a-z0-9-]+"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSectionModal(false)}
                  className="flex-1 py-3 rounded-xl border border-stone-200 text-sm font-bold text-stone-500 hover:bg-stone-50 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingSection || !sectionTitle.es.trim() || !sectionSlug.trim()}
                  className="flex-1 py-3 rounded-xl bg-stone-900 hover:bg-[#d4af37] text-white text-sm font-bold transition-all duration-300"
                >
                  {savingSection ? 'Creando...' : 'Crear Sección'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL NUEVA PÁGINA ───────────────────────────────────── */}
      {showPageModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 animate-in zoom-in-95 duration-300">
            <div className="mb-6">
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#d4af37] block mb-1">Manual de ayuda</span>
              <h2 className="font-serif text-2xl font-bold text-stone-850">Añadir nueva página</h2>
              <p className="text-stone-400 text-xs mt-1">Crea una página de documentación en la sección seleccionada.</p>
            </div>

            <form onSubmit={handleCreatePage} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-stone-600 mb-2 uppercase tracking-wider">
                  Sección Destino
                </label>
                <select
                  value={targetSectionId}
                  onChange={e => setTargetSectionId(e.target.value)}
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-750 focus:outline-none focus:border-[#d4af37]"
                >
                  {sections.map(sec => (
                    <option key={sec.id} value={sec.id}>
                      {sec.title?.es || sec.slug}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-600 mb-2 uppercase tracking-wider">
                  Título de la Guía (ES)
                </label>
                <input
                  type="text"
                  value={newPageTitle.es}
                  onChange={e => setNewPageTitle({ ...newPageTitle, es: e.target.value })}
                  placeholder="Ej: Aislamiento Multi-tenant"
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-800 font-medium focus:outline-none focus:border-[#d4af37]"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-600 mb-2 uppercase tracking-wider">
                  Título de la Guía (EN - Opcional)
                </label>
                <input
                  type="text"
                  value={newPageTitle.en}
                  onChange={e => setNewPageTitle({ ...newPageTitle, en: e.target.value })}
                  placeholder="Ej: Multi-tenant Isolation"
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-850 font-medium focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-600 mb-2 uppercase tracking-wider">
                  Dirección URL / Slug
                </label>
                <input
                  type="text"
                  value={newPageSlug}
                  onChange={e => { setNewPageSlug(e.target.value); setNewPageSlugManual(true); }}
                  placeholder="ej: aislamiento-multi-tenant"
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm font-mono text-stone-700 focus:outline-none focus:border-[#d4af37]"
                  required
                  pattern="[a-z0-9-]+"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPageModal(false)}
                  className="flex-1 py-3 rounded-xl border border-stone-200 text-sm font-bold text-stone-500 hover:bg-stone-50 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creatingPage || !newPageTitle.es.trim() || !newPageSlug.trim()}
                  className="flex-1 py-3 rounded-xl bg-stone-900 hover:bg-[#d4af37] text-white text-sm font-bold transition-all duration-300"
                >
                  {creatingPage ? 'Creando...' : 'Crear Página'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODALES DE CONFIRMACIÓN DE BORRADO ────────────────────── */}
      {confirmDeleteSection && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center animate-in zoom-in-95 duration-300">
            <h3 className="font-serif text-xl font-black text-stone-850 mb-3">¿Eliminar sección global?</h3>
            <p className="text-stone-400 text-xs mb-6 font-sans">
              Estás a punto de borrar la sección <strong className="text-stone-750">"{confirmDeleteSection.title?.es}"</strong> y todas las páginas anidadas bajo ella. Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDeleteSection(null)}
                className="flex-1 py-3 rounded-xl border border-stone-200 text-xs font-bold text-stone-500 hover:bg-stone-50 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteSection}
                disabled={deleting}
                className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold transition-all"
              >
                {deleting ? 'Eliminando...' : 'Sí, Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDeletePage && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center animate-in zoom-in-95 duration-300">
            <h3 className="font-serif text-xl font-black text-stone-850 mb-3">¿Eliminar guía de ayuda?</h3>
            <p className="text-stone-400 text-xs mb-6 font-sans">
              ¿Seguro que deseas borrar permanentemente la página <strong className="text-stone-750">"{confirmDeletePage.title?.es}"</strong> de la documentación global?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDeletePage(null)}
                className="flex-1 py-3 rounded-xl border border-stone-200 text-xs font-bold text-stone-500 hover:bg-stone-50 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeletePage}
                disabled={deleting}
                className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold transition-all"
              >
                {deleting ? 'Eliminando...' : 'Sí, Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

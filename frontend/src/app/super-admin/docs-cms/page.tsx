'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useFeedback } from '@/app/contexts/FeedbackContext';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import SuperAdminSidebar from '../components/SuperAdminSidebar';
import { 
  FolderPlus, 
  FilePlus, 
  ChevronRight, 
  Lock 
} from 'lucide-react';

import { DocPage, DocSection, LangTab, toSlug } from './types';
import DocsTreeSidebar from './components/DocsTreeSidebar';
import DocPageEditor from './components/DocPageEditor';
import CreateSectionModal from './components/CreateSectionModal';
import CreatePageModal from './components/CreatePageModal';
import ConfirmDeleteDocModal from './components/ConfirmDeleteDocModal';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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
  const [activeTab, setActiveTab] = useState<LangTab>('es');

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
      toast.error('No se pudieron cargar los datos del CMS de Documentación.');
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
        toast.error('Ya existe una sección con esta dirección de URL.');
        return;
      }

      if (!res.ok) throw new Error();
      toast.success('Sección de documentación añadida con éxito.');
      setShowSectionModal(false);
      setSectionTitle({ es: '', en: '', fr: '' });
      setSectionSlug('');
      setSectionSlugManual(false);
      fetchCMSData();
    } catch {
      toast.error('No se pudo crear la sección.');
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
        toast.error('Ya existe una página de documentación con esta URL.');
        return;
      }

      if (!res.ok) throw new Error();
      const pageCreated = await res.json();
      toast.success('Página añadida al índice de documentación.');
      setShowPageModal(false);
      setNewPageTitle({ es: '', en: '', fr: '' });
      setNewPageSlug('');
      setNewPageSlugManual(false);
      await fetchCMSData();
      setSelectedPage(pageCreated);
    } catch {
      toast.error('No se pudo crear la página.');
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
        toast.error('Ya existe una página con este slug.');
        return;
      }

      if (!res.ok) throw new Error();
      const updated = await res.json();
      toast.success('Página de documentación actualizada correctamente.');
      await fetchCMSData();
      setSelectedPage(updated);
    } catch {
      toast.error('No se pudieron guardar los cambios.');
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
        toast.error('No se pudo reordenar las secciones.');
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
        toast.error('No se pudo reordenar las páginas.');
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
      toast.success('La sección y todas sus páginas fueron eliminadas.');
      setSelectedPage(null);
      setConfirmDeleteSection(null);
      fetchCMSData();
    } catch {
      toast.error('No se pudo borrar la sección.');
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
      toast.success('La página de documentación fue borrada correctamente.');
      setSelectedPage(null);
      setConfirmDeletePage(null);
      fetchCMSData();
    } catch {
      toast.error('No se pudo borrar la página.');
    } finally {
      setDeleting(false);
    }
  };

  // Loading Session Spinner
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

  // Secure Access Guard
  if (!user || user.role !== 'super_admin') {
    return (
      <div className="min-h-screen bg-[#F7F7F5] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-[2rem] border border-stone-200/60 p-10 text-center shadow-luxury">
          <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-stone-100 text-stone-600 mb-6">
            <Lock className="w-7 h-7 text-stone-700" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-stone-900 mb-4">Acceso Denegado</h1>
          <p className="text-stone-500 mb-8 font-sans font-medium text-sm leading-relaxed">
            Esta área está estrictamente reservada para el Super Administrador global del SaaS. Tu cuenta actual no dispone de los privilegios requeridos.
          </p>
          <div className="space-y-3">
            <Button 
              variant="luxury"
              onClick={() => router.push('/login')}
              className="w-full py-4 h-12 font-bold"
            >
              Iniciar Sesión como Super Admin
            </Button>
            <Button 
              variant="outline"
              onClick={() => router.push('/')}
              className="w-full py-4 h-12 font-bold"
            >
              Volver a la Página Principal
            </Button>
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
                <Button
                  variant="outline"
                  onClick={() => {
                    setSectionTitle({ es: '', en: '', fr: '' });
                    setSectionSlug('');
                    setSectionSlugManual(false);
                    setShowSectionModal(true);
                  }}
                  className="flex items-center gap-2 px-5 py-3 h-11 rounded-2xl text-xs font-bold"
                >
                  <FolderPlus size={15} />
                  <span>Nueva Sección</span>
                </Button>
                
                <Button
                  variant="luxury"
                  onClick={() => {
                    if (sections.length === 0) {
                      toast.error('Primero debes crear una sección.');
                      return;
                    }
                    setNewPageTitle({ es: '', en: '', fr: '' });
                    setNewPageSlug('');
                    setNewPageSlugManual(false);
                    setTargetSectionId(sections[0].id);
                    setShowPageModal(true);
                  }}
                  className="flex items-center gap-2 px-5 py-3 h-11 rounded-2xl text-xs font-bold"
                >
                  <FilePlus size={15} />
                  <span>Nueva Página</span>
                </Button>
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
                
                {/* 1. SIDEBAR TREE */}
                <DocsTreeSidebar
                  sections={sections}
                  selectedPage={selectedPage}
                  onSelectPage={setSelectedPage}
                  onReorder={handleReorder}
                  onDeleteSection={setConfirmDeleteSection}
                  onDeletePage={setConfirmDeletePage}
                />

                {/* 2. PAGE EDITOR PANEL */}
                <DocPageEditor
                  selectedPage={selectedPage}
                  sections={sections}
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  pageTitle={pageTitle}
                  setPageTitle={setPageTitle}
                  pageContent={pageContent}
                  setPageContent={setPageContent}
                  pageSlug={pageSlug}
                  setPageSlug={setPageSlug}
                  selectedSectionId={selectedSectionId}
                  setSelectedSectionId={setSelectedSectionId}
                  saving={savingPage}
                  onSave={handleSavePage}
                  onDelete={() => setConfirmDeletePage(selectedPage)}
                  token={user.access_token}
                />

              </div>
            )}
          </div>
        </div>
      </main>

      {/* ── MODALES SHADCN DIALOG ──────────────────────────────────── */}
      <CreateSectionModal
        open={showSectionModal}
        onOpenChange={setShowSectionModal}
        sectionTitle={sectionTitle}
        setSectionTitle={setSectionTitle}
        sectionSlug={sectionSlug}
        setSectionSlug={setSectionSlug}
        setSectionSlugManual={setSectionSlugManual}
        onSubmit={handleCreateSection}
        saving={savingSection}
      />

      <CreatePageModal
        open={showPageModal}
        onOpenChange={setShowPageModal}
        sections={sections}
        targetSectionId={targetSectionId}
        setTargetSectionId={setTargetSectionId}
        newPageTitle={newPageTitle}
        setNewPageTitle={setNewPageTitle}
        newPageSlug={newPageSlug}
        setNewPageSlug={setNewPageSlug}
        setNewPageSlugManual={setNewPageSlugManual}
        onSubmit={handleCreatePage}
        creating={creatingPage}
      />

      {confirmDeleteSection && (
        <ConfirmDeleteDocModal
          open={!!confirmDeleteSection}
          onOpenChange={(open) => !open && setConfirmDeleteSection(null)}
          title="¿Eliminar sección global?"
          description={`Estás a punto de borrar la sección "${confirmDeleteSection.title?.es || confirmDeleteSection.slug}" y todas las páginas anidadas bajo ella. Esta acción no se puede deshacer.`}
          onConfirm={handleDeleteSection}
          deleting={deleting}
        />
      )}

      {confirmDeletePage && (
        <ConfirmDeleteDocModal
          open={!!confirmDeletePage}
          onOpenChange={(open) => !open && setConfirmDeletePage(null)}
          title="¿Eliminar guía de ayuda?"
          description={`¿Seguro que deseas borrar permanentemente la página "${confirmDeletePage.title?.es || confirmDeletePage.slug}" de la documentación global?`}
          onConfirm={handleDeletePage}
          deleting={deleting}
        />
      )}

    </div>
  );
}

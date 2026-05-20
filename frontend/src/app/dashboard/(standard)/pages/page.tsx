"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useFeedback } from '@/app/contexts/FeedbackContext';
import { Skeleton } from '@/components/ui/skeleton';

interface CustomPage {
  id: string;
  label: string;
  path: string;
  is_visible: boolean;
  is_custom: boolean;
}

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Convierte un título en slug limpio
function toSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

export default function PagesManagerPage() {
  const { showFeedback } = useFeedback();

  const [pages, setPages] = useState<CustomPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeletePage, setConfirmDeletePage] = useState<CustomPage | null>(null);

  // Campos del formulario
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugManual, setSlugManual] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => { fetchPages(); }, []);

  // Auto-genera el slug desde el título, a menos que el usuario lo haya editado manualmente
  useEffect(() => {
    if (!slugManual) setSlug(toSlug(title));
  }, [title, slugManual]);

  const fetchPages = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/cms/pages`);
      if (res.ok) setPages(await res.json());
    } catch {
      showFeedback({ type: 'error', title: 'Error', message: 'No se pudieron cargar las páginas.' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !slug.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`${API}/cms/pages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), slug: slug.trim(), is_visible: isVisible }),
      });
      if (res.status === 409) {
        showFeedback({ type: 'error', title: 'URL duplicada', message: `Ya existe una página con la ruta "/${slug}".` });
        return;
      }
      if (!res.ok) throw new Error();
      showFeedback({ type: 'success', title: 'Página creada', message: `La página "/${slug}" ya está publicada.` });
      setShowModal(false);
      resetForm();
      fetchPages();
    } catch {
      showFeedback({ type: 'error', title: 'Error', message: 'No se pudo crear la página.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (page: CustomPage) => {
    const slug = page.path.replace('/', '');
    setDeletingId(page.id);
    try {
      const res = await fetch(`${API}/cms/pages/${slug}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      showFeedback({ type: 'success', title: 'Página eliminada', message: `"${page.label}" ha sido borrada correctamente.` });
      setPages(prev => prev.filter(p => p.id !== page.id));
    } catch {
      showFeedback({ type: 'error', title: 'Error', message: 'No se pudo eliminar la página.' });
    } finally {
      setDeletingId(null);
      setConfirmDeletePage(null);
    }
  };

  const resetForm = () => {
    setTitle('');
    setSlug('');
    setSlugManual(false);
    setIsVisible(true);
  };

  const openModal = () => { resetForm(); setShowModal(true); };

  return (
    <div className="animate-in fade-in duration-500">

      {/* ── CABECERA ─────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#d4af37] block mb-2">
            Gestor Headless · CMS
          </span>
          <h1 className="font-serif text-3xl md:text-4xl font-extrabold text-stone-800 leading-tight">
            Páginas del Sitio
          </h1>
          <p className="text-stone-400 font-sans text-sm mt-2 max-w-lg">
            Crea páginas autónomas para tu portal: políticas de privacidad, landing pages estacionales o secciones de promociones.
          </p>
        </div>

        <button
          onClick={openModal}
          className="flex items-center gap-2 bg-stone-900 hover:bg-[#d4af37] text-white px-5 py-3 rounded-2xl text-sm font-bold transition-all duration-300 shadow-sm shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nueva Página
        </button>
      </div>

      {/* ── LISTA DE PÁGINAS ──────────────────────────────────────── */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)}
        </div>
      ) : pages.length === 0 ? (
        /* Estado vacío */
        <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-stone-200 rounded-3xl bg-white">
          <div className="w-14 h-14 bg-stone-50 rounded-2xl flex items-center justify-center mb-6 border border-stone-100">
            <svg className="w-7 h-7 text-stone-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <h3 className="font-serif text-xl font-bold text-stone-600 mb-2">Sin páginas todavía</h3>
          <p className="text-stone-400 text-sm max-w-xs">Crea tu primera página personalizada con el botón de arriba.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-stone-100 shadow-[0_8px_30px_rgba(0,0,0,0.03)] overflow-hidden">
          {/* Cabecera de tabla */}
          <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 px-6 py-3 bg-stone-50/60 border-b border-stone-100">
            <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">Título</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">URL</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">Visible</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">Acciones</span>
          </div>

          {/* Filas */}
          {pages.map((page, idx) => (
            <div
              key={page.id}
              className={`grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 px-6 py-5 transition-all duration-200 hover:bg-stone-50/40 ${idx < pages.length - 1 ? 'border-b border-stone-100' : ''}`}
            >
              {/* Título */}
              <Link 
                href={`/dashboard/pages${page.path}`}
                className="flex items-center gap-3 min-w-0 group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0 group-hover:bg-[#d4af37]/10 transition-colors">
                  <svg className="w-4 h-4 text-[#d4af37]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
                <span className="font-bold text-sm text-stone-800 truncate group-hover:text-[#d4af37] transition-colors">{page.label}</span>
              </Link>

              {/* URL */}
              <a
                href={page.path}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono text-stone-400 hover:text-[#d4af37] transition-colors bg-stone-50 px-3 py-1.5 rounded-xl border border-stone-100 hover:border-amber-100"
              >
                {page.path}
              </a>

              {/* Visible badge */}
              <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${page.is_visible ? 'bg-green-50 text-green-600' : 'bg-stone-100 text-stone-400'}`}>
                {page.is_visible ? 'Sí' : 'No'}
              </span>

              {/* Botón borrar */}
              <button
                onClick={() => setConfirmDeletePage(page)}
                disabled={deletingId === page.id}
                className="p-2 rounded-xl text-stone-300 hover:text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all duration-200 disabled:opacity-30"
                title="Eliminar página"
              >
                {deletingId === page.id ? (
                  <div className="w-4 h-4 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── MODAL CREAR PÁGINA ────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 animate-in zoom-in-95 duration-300">

            <div className="mb-7">
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#d4af37] block mb-1">Nueva Página</span>
              <h2 className="font-serif text-2xl font-bold text-stone-800">Crear página autónoma</h2>
              <p className="text-stone-400 text-xs mt-1">La página aparecerá como una ruta pública en tu portal.</p>
            </div>

            <form onSubmit={handleCreate} className="space-y-5">
              {/* Título */}
              <div>
                <label className="block text-xs font-bold text-stone-600 mb-2 uppercase tracking-wider">
                  Título de la página
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Ej: Política de Privacidad"
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-800 font-medium focus:outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20 transition-all"
                  required
                  autoFocus
                />
              </div>

              {/* Slug / URL */}
              <div>
                <label className="block text-xs font-bold text-stone-600 mb-2 uppercase tracking-wider">
                  URL de la página
                </label>
                <div className="flex items-center border border-stone-200 rounded-xl overflow-hidden focus-within:border-[#d4af37] focus-within:ring-2 focus-within:ring-[#d4af37]/20 transition-all">
                  <span className="px-3 py-3 bg-stone-50 text-stone-400 text-sm font-mono border-r border-stone-200 shrink-0">
                    tudominio.com/
                  </span>
                  <input
                    type="text"
                    value={slug}
                    onChange={e => { setSlug(e.target.value); setSlugManual(true); }}
                    placeholder="politica-privacidad"
                    className="flex-1 px-4 py-3 text-sm font-mono text-stone-700 focus:outline-none bg-transparent"
                    required
                    pattern="[a-z0-9-]+"
                    title="Solo letras minúsculas, números y guiones"
                  />
                </div>
                <p className="text-[10px] text-stone-400 mt-1.5 ml-1">Solo letras minúsculas, números y guiones.</p>
              </div>

              {/* Visible en menú */}
              <div className="flex items-center justify-between py-3 px-4 bg-stone-50 rounded-xl border border-stone-100">
                <div>
                  <p className="text-sm font-bold text-stone-700">Mostrar en el menú de navegación</p>
                  <p className="text-xs text-stone-400">El enlace aparecerá en el header del portal público.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsVisible(!isVisible)}
                  className={`relative w-11 h-6 rounded-full transition-all duration-300 shrink-0 ${isVisible ? 'bg-[#d4af37]' : 'bg-stone-200'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300 ${isVisible ? 'translate-x-5' : ''}`} />
                </button>
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 rounded-xl border border-stone-200 text-sm font-bold text-stone-500 hover:bg-stone-50 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving || !title.trim() || !slug.trim()}
                  className="flex-1 py-3 rounded-xl bg-stone-900 hover:bg-[#d4af37] text-white text-sm font-bold transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {saving ? 'Creando...' : 'Crear página'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL CONFIRMAR BORRADO ───────────────────────────────── */}
      {confirmDeletePage && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 animate-in zoom-in-95 duration-300 text-center">
            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <h3 className="font-serif text-xl font-bold text-stone-800 mb-2">¿Eliminar esta página?</h3>
            <p className="text-stone-400 text-sm mb-1">
              Se borrará <strong className="text-stone-600">"{confirmDeletePage.label}"</strong> junto con todos sus bloques de contenido.
            </p>
            <p className="text-xs text-red-400 font-medium mb-7">Esta acción es irreversible.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDeletePage(null)}
                className="flex-1 py-3 rounded-xl border border-stone-200 text-sm font-bold text-stone-500 hover:bg-stone-50 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(confirmDeletePage)}
                className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition-all duration-200"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

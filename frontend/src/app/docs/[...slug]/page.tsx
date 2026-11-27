'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, ChevronRight, Menu, X, ArrowLeft, BookOpen, Globe } from 'lucide-react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import DOMPurify from 'isomorphic-dompurify';
import { Skeleton } from '@/components/ui/skeleton';
import MarketingHeader from '@/app/marketing/components/MarketingHeader';
import MarketingFooter from '@/app/marketing/components/MarketingFooter';
import { GOOGLE_FONTS_URL } from '@/app/marketing/utils/fonts';

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

export default function DynamicDocsPage({ params }: { params: { slug: string[] } }) {
  const { language, setLanguage } = useLanguage();
  const currentSlug = params.slug[params.slug.length - 1];

  const [sections, setSections] = useState<DocSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePage, setActivePage] = useState<DocPage | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Dynamic language key mapping
  const lang = (language === 'es' || language === 'en' || language === 'fr') ? language : 'es';

  // UI Translations dictionary
  const uiT = {
    es: {
      badge: 'Ayuda ProBookia · CMS Dinámico',
      searchPlaceholder: 'Buscar en la documentación...',
      indexTitle: 'Secciones del Manual',
      btnIndex: 'Ver Índice',
      noResults: 'No hay páginas que coincidan.',
      backHome: 'Volver a la Home Comercial',
      professionalAccess: 'Acceso Profesional',
      footerText: '© 2026 ProBookia CMS de Documentación. Todos los derechos reservados.'
    },
    en: {
      badge: 'ProBookia Help · Dynamic CMS',
      searchPlaceholder: 'Search documentation...',
      indexTitle: 'Manual Sections',
      btnIndex: 'View Index',
      noResults: 'No pages found.',
      backHome: 'Back to Corporate Home',
      professionalAccess: 'Professional Login',
      footerText: '© 2026 ProBookia Documentation CMS. All rights reserved.'
    },
    fr: {
      badge: 'Aide ProBookia · CMS Dynamique',
      searchPlaceholder: 'Rechercher dans la documentation...',
      indexTitle: 'Sections du Manuel',
      btnIndex: 'Voir l\'Index',
      noResults: 'Aucune page trouvée.',
      backHome: 'Retour à l\'Accueil',
      professionalAccess: 'Accès Professionnel',
      footerText: '© 2026 ProBookia Documentation CMS. Tous droits réservés.'
    }
  }[lang];

  // Fetch sections and active page
  useEffect(() => {
    async function loadCMSDocs() {
      setLoading(true);
      try {
        const res = await fetch(`${API}/docs-cms/sections`);
        if (res.ok) {
          const data: DocSection[] = await res.json();
          setSections(data);

          // Find active page matching the slug
          let foundPage: DocPage | null = null;
          for (const sec of data) {
            const page = sec.pages.find(p => p.slug === currentSlug);
            if (page) {
              foundPage = page;
              break;
            }
          }
          setActivePage(foundPage);
        }
      } catch (err) {
        console.error('Error loading dynamic docs CMS content:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCMSDocs();
  }, [currentSlug]);

  // Handle auto-scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentSlug]);

  // Safe TipTap Rich Text Sanitizer and Renderer
  const getSanitizedContent = (htmlContent: string) => {
    return DOMPurify.sanitize(htmlContent || '<p>Sin contenido.</p>');
  };

  // Quick Filter Sections & Pages
  const filteredSections = sections.map(sec => {
    const matchingPages = sec.pages.filter(page => {
      const title = page.title[lang] || '';
      const content = page.content[lang] || '';
      return (
        title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
    return { ...sec, pages: matchingPages };
  }).filter(sec => sec.pages.length > 0);

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans antialiased text-stone-800 flex flex-col transition-all duration-300">
      
      {/* ── INYECCIÓN GOOGLE FONTS OFICIAL PROBOOKIA ────────────── */}
      <style dangerouslySetInnerHTML={{ __html: `@import url('${GOOGLE_FONTS_URL}');` }} />

      {/* ── TOP NAV BAR (PROBOOKIA OFICIAL) ─────────────────────── */}
      <MarketingHeader />

      {/* ── SUB-BAR: BUSCADOR & IDIOMA ─────────────────────────── */}
      <div className="bg-white/80 backdrop-blur-md border-b border-stone-200/60 py-3 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
            <input
              type="text"
              placeholder={uiT.searchPlaceholder}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-10 pr-4 py-2 text-xs text-stone-800 placeholder-stone-400 outline-none focus:bg-white focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/20 transition-all font-medium"
            />
          </div>

          <div className="flex items-center gap-3">
            {/* Language Selector */}
            <div className="flex items-center bg-stone-50 p-1 rounded-xl border border-stone-200/60">
              {(['es', 'en', 'fr'] as const).map(l => (
                <button
                  key={l}
                  onClick={() => setLanguage(l)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                    lang === l 
                      ? 'bg-stone-900 text-white shadow-xs' 
                      : 'text-stone-400 hover:text-stone-600'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>

            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700"
            >
              {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* ── CORE LAYOUT ─────────────────────────────────────────── */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8 items-start">
        
        {/* ── SIDEBAR TREE (LEFT COLUMN) ────────────────────────── */}
        <aside className={`lg:sticky lg:top-28 z-30 lg:block bg-white rounded-3xl border border-stone-200/60 p-6 shadow-sm max-h-[80vh] overflow-y-auto ${
          sidebarOpen ? 'fixed inset-x-4 top-36 z-50 animate-in slide-in-from-top-4' : 'hidden'
        }`}>
          <div className="flex items-center gap-2 mb-5">
            <BookOpen className="w-4 h-4 text-[#d4af37]" />
            <h3 className="text-xs font-black uppercase tracking-wider text-stone-400">
              {uiT.indexTitle}
            </h3>
          </div>

          {filteredSections.length === 0 ? (
            <p className="text-stone-400 text-xs italic">{uiT.noResults}</p>
          ) : (
            <div className="space-y-6">
              {filteredSections.map(sec => (
                <div key={sec.id} className="space-y-2">
                  <h4 className="font-serif font-black text-stone-850 text-xs border-b border-stone-100 pb-1 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37]/75"></span>
                    <span>{sec.title[lang] || sec.title.es}</span>
                  </h4>
                  
                  <div className="pl-3 border-l border-stone-200/60 space-y-1">
                    {sec.pages.map(page => {
                      const isActive = page.slug === currentSlug;
                      return (
                        <Link
                          key={page.id}
                          href={`/docs/${page.slug}`}
                          onClick={() => setSidebarOpen(false)}
                          className={`block py-1.5 text-xs font-semibold rounded-lg transition-all ${
                            isActive 
                              ? 'text-[#d4af37] font-bold bg-[#d4af37]/5 px-2' 
                              : 'text-stone-500 hover:text-stone-900 hover:pl-1'
                          }`}
                        >
                          {page.title[lang] || page.title.es}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </aside>

        {/* ── ARTICLE AREA (RIGHT COLUMN) ───────────────────────── */}
        <main className="bg-white rounded-3xl border border-stone-200/60 p-6 md:p-10 shadow-sm animate-in fade-in duration-300 min-h-[60vh]">
          
          {loading ? (
            <div className="space-y-6">
              <Skeleton className="h-4 w-32 rounded-full" />
              <Skeleton className="h-10 w-96 rounded-2xl" />
              <Skeleton className="h-60 w-full rounded-3xl" />
            </div>
          ) : !activePage ? (
            <div className="text-center py-20 max-w-sm mx-auto">
              <div className="w-16 h-16 bg-stone-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-stone-100">
                <BookOpen className="w-8 h-8 text-stone-300" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-stone-600 mb-2">Página no encontrada</h3>
              <p className="text-stone-400 text-sm">
                La guía de documentación que estás buscando no existe o ha sido trasladada de sección.
              </p>
              <Link
                href="/docs"
                className="mt-6 inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#d4af37] hover:text-stone-900 transition-colors"
              >
                <ArrowLeft size={12} />
                <span>Volver al Inicio</span>
              </Link>
            </div>
          ) : (
            <article className="space-y-8">
              
              {/* Badge & Title */}
              <div>
                <span className="bg-stone-50 border border-stone-200/60 text-stone-500 text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full shadow-sm">
                  {uiT.badge}
                </span>

                <h1 className="font-serif font-black text-3xl md:text-4xl text-stone-900 leading-tight mt-6">
                  {activePage.title[lang] || activePage.title.es}
                </h1>
              </div>

              {/* Dynamic Styled HTML Rich Text Canvas */}
              <div 
                className="prose prose-stone max-w-none text-stone-700 font-sans prose-headings:font-serif prose-headings:font-bold prose-headings:mt-12 prose-headings:mb-6 prose-p:my-6 prose-p:leading-relaxed prose-blockquote:my-10 prose-blockquote:p-8 prose-blockquote:rounded-3xl prose-blockquote:border-l-4 prose-blockquote:border-l-[#d4af37] prose-blockquote:bg-stone-50/50 prose-ul:my-6 prose-ul:space-y-4 prose-ol:my-6 prose-ol:space-y-4 prose-a:text-[#d4af37] prose-a:underline hover:prose-a:text-amber-600 transition-colors prose-img:rounded-3xl prose-img:shadow-md border-t border-stone-100 pt-6 prose-strong:font-bold"
                dangerouslySetInnerHTML={{ __html: getSanitizedContent(activePage.content[lang] || activePage.content.es) }}
              />

            </article>
          )}

        </main>

      </div>

      {/* ── FOOTER UNIFICADO PROBOOKIA ──────────────────────────── */}
      <MarketingFooter />

    </div>
  );
}

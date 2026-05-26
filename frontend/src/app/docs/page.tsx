"use client"
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, ChevronRight, BookOpen, Menu, X, ArrowLeft, Loader2 } from 'lucide-react';
import LanguageSelector from '@/components/LanguageSelector';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { DOCS_CONTENT, DocSection, DocSubpage } from './content';

export default function DocsPage() {
  const { language } = useLanguage();
  
  const [activeSectionId, setActiveSectionId] = useState(DOCS_CONTENT[0].id);
  const [activeSubpageId, setActiveSubpageId] = useState(DOCS_CONTENT[0].subpages[0].id);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Auto-scroll to top when changing page
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeSubpageId]);

  // Find active subpage object
  const activeSection = DOCS_CONTENT.find(s => s.id === activeSectionId) || DOCS_CONTENT[0];
  const activeSubpage = activeSection.subpages.find(p => p.id === activeSubpageId) || activeSection.subpages[0];

  // Dynamic language key mapping
  const langKey = (language === 'es' || language === 'en' || language === 'fr') ? language : 'es';

  // 3-Language UI Dictionary
  const uiT = {
    es: {
      badge: 'SaaS Blueprint & API',
      title: 'Documentación de ProBookia',
      subtitle: 'Explora la arquitectura técnica de marca blanca, el aislamiento de base de datos multi-tenant, y los límites del motor del co-piloto por voz.',
      searchPlaceholder: 'Buscar guías o código...',
      indexTitle: 'Índice del SaaS Blueprint',
      btnIndex: 'Ver Índice técnico',
      noResults: 'No hay resultados que coincidan con la búsqueda.',
      footerText: '© 2026 ProBookia B2B SaaS. Marca blanca registrada de alta gama.',
      backHome: 'Volver a la Home Comercial',
      professionalAccess: 'Acceso Profesional',
      getStarted: 'Comenzar',
      impersonationNote: 'Nota de Impersonación',
      architectureNote: 'Nota de Arquitectura',
      bestPractice: 'Mejor Práctica Comercial',
      securityRequirement: 'Requisito de Seguridad'
    },
    en: {
      badge: 'SaaS Blueprint & API',
      title: 'ProBookia Documentation',
      subtitle: 'Explore the white-label technical architecture, multi-tenant database isolation, and voice co-pilot limits.',
      searchPlaceholder: 'Search guides or code...',
      indexTitle: 'SaaS Blueprint Index',
      btnIndex: 'View technical index',
      noResults: 'No results match your search query.',
      footerText: '© 2026 ProBookia B2B SaaS. Premium registered white-label engine.',
      backHome: 'Back to Corporate Home',
      professionalAccess: 'Professional Login',
      getStarted: 'Get Started',
      impersonationNote: 'Impersonation Note',
      architectureNote: 'Architecture Note',
      bestPractice: 'Best Business Practice',
      securityRequirement: 'Security Requirement'
    },
    fr: {
      badge: 'SaaS Blueprint & API',
      title: 'Documentation ProBookia',
      subtitle: 'Explorez l\'architecture technique de marque blanche, l\'isolation de base de données multi-tenant et le co-pilote vocal.',
      searchPlaceholder: 'Rechercher des guides ou du code...',
      indexTitle: 'Index du SaaS Blueprint',
      btnIndex: 'Voir l\'index technique',
      noResults: 'Aucun résultat ne correspond à votre recherche.',
      footerText: '© 2026 ProBookia B2B SaaS. Moteur de marque blanche haut de gamme.',
      backHome: 'Retour à l\'Accueil',
      professionalAccess: 'Accès Professionnel',
      getStarted: 'Commencer',
      impersonationNote: 'Note d\'Impersonation',
      architectureNote: 'Note d\'Architecture',
      bestPractice: 'Meilleure Pratique',
      securityRequirement: 'Exigence de Sécurité'
    }
  }[langKey];

  // Quick search filtration across all pages and sections in the active language
  const filteredSections = DOCS_CONTENT.map(section => {
    const matchingPages = section.subpages.filter(page => {
      const title = page.title[langKey] || '';
      const markdown = page.markdown[langKey] || '';
      return (
        title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        markdown.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
    return {
      ...section,
      subpages: matchingPages
    };
  }).filter(section => section.subpages.length > 0);

  // Custom visual markdown to react parser
  function renderMarkdownToReact(markdown: string) {
    const lines = markdown.split('\n');
    const blocks: React.ReactNode[] = [];
    
    let inCodeBlock = false;
    let codeBlockLines: string[] = [];
    let codeBlockLang = '';
    
    let inList = false;
    let listItems: string[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Fenced code blocks
      if (line.trim().startsWith('```')) {
        if (inCodeBlock) {
          inCodeBlock = false;
          const codeText = codeBlockLines.join('\n');
          blocks.push(
            <div key={`code-${i}`} className="my-6 rounded-2xl overflow-hidden border border-stone-850 bg-stone-950 shadow-xl animate-in fade-in duration-300">
              <div className="flex items-center justify-between px-4 py-3 bg-stone-900 border-b border-stone-850">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/80"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500/80"></span>
                </div>
                <span className="text-[10px] font-mono tracking-widest text-stone-500 uppercase">{codeBlockLang || 'CODE'}</span>
              </div>
              <pre className="p-5 overflow-x-auto font-mono text-xs text-stone-350 leading-relaxed custom-scrollbar">
                <code>{codeText}</code>
              </pre>
            </div>
          );
          codeBlockLines = [];
          codeBlockLang = '';
        } else {
          inCodeBlock = true;
          codeBlockLang = line.replace('```', '').trim();
        }
        continue;
      }
      
      if (inCodeBlock) {
        codeBlockLines.push(line);
        continue;
      }
      
      // Bullet lists
      if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
        if (!inList) {
          inList = true;
          listItems = [];
        }
        listItems.push(line.trim().replace(/^[\*\-]\s+/, ''));
        continue;
      } else {
        if (inList) {
          inList = false;
          blocks.push(
            <ul key={`list-${i}`} className="my-5 space-y-3.5 pl-2">
              {listItems.map((item, idx) => {
                const parts = item.split('**');
                return (
                  <li key={idx} className="flex items-start gap-3 text-stone-600 dark:text-stone-300 text-[15px] leading-relaxed animate-in fade-in duration-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-[#d4af37] shrink-0 mt-2.5"></span>
                    <span>
                      {parts.map((part, pIdx) => pIdx % 2 === 1 ? <strong key={pIdx} className="font-bold text-stone-950 dark:text-stone-100">{part}</strong> : part)}
                    </span>
                  </li>
                );
              })}
            </ul>
          );
          listItems = [];
        }
      }
      
      // Headers
      if (line.startsWith('# ')) {
        blocks.push(
          <h1 key={`h1-${i}`} className="font-serif text-3xl md:text-4xl font-semibold tracking-tight text-stone-950 dark:text-white mt-2 mb-6 pb-4 border-b border-stone-100 dark:border-stone-900 leading-tight">
            {line.replace('# ', '')}
          </h1>
        );
        continue;
      }
      
      if (line.startsWith('## ')) {
        blocks.push(
          <h2 key={`h2-${i}`} className="font-serif text-xl md:text-2xl font-medium tracking-tight text-stone-950 dark:text-white mt-8 mb-4 leading-snug">
            {line.replace('## ', '')}
          </h2>
        );
        continue;
      }
      
      if (line.startsWith('### ')) {
        blocks.push(
          <h3 key={`h3-${i}`} className="font-sans text-xs font-black uppercase tracking-widest text-stone-400 dark:text-stone-500 mt-6 mb-3">
            {line.replace('### ', '')}
          </h3>
        );
        continue;
      }
      
      // Dividers
      if (line.trim() === '---') {
        blocks.push(
          <hr key={`hr-${i}`} className="my-8 border-stone-100 dark:border-stone-900" />
        );
        continue;
      }
      
      // Blockquotes / Callouts
      if (line.startsWith('> ')) {
        const cleanLine = line.replace('> ', '').trim();
        let type: 'note' | 'tip' | 'important' = 'note';
        let titleText = '';
        let text = cleanLine;
        
        if (cleanLine.startsWith('[!NOTE]')) {
          type = 'note';
          text = cleanLine.replace('[!NOTE]', '').trim();
          titleText = uiT.architectureNote;
        } else if (cleanLine.startsWith('[!TIP]')) {
          type = 'tip';
          text = cleanLine.replace('[!TIP]', '').trim();
          titleText = uiT.bestPractice;
        } else if (cleanLine.startsWith('[!IMPORTANT]')) {
          type = 'important';
          text = cleanLine.replace('[!IMPORTANT]', '').trim();
          titleText = uiT.securityRequirement;
        }
        
        blocks.push(
          <div key={`quote-${i}`} className={`my-6 p-5 rounded-2xl border-l-4 shadow-sm backdrop-blur-md ${
            type === 'important' ? 'border-red-500 bg-red-500/[0.02] text-red-950 dark:text-red-200' :
            type === 'tip' ? 'border-blue-600 bg-blue-600/[0.02] text-blue-950 dark:text-blue-200' :
            'border-[#d4af37] bg-[#d4af37]/[0.02] text-stone-850 dark:text-stone-200'
          }`}>
            {titleText && (
              <span className={`text-[10px] font-black tracking-widest uppercase block mb-1.5 ${
                type === 'important' ? 'text-red-600' :
                type === 'tip' ? 'text-blue-600' :
                'text-[#d4af37]'
              }`}>
                {titleText}
              </span>
            )}
            <p className="text-stone-600 dark:text-stone-300 text-sm md:text-[14.5px] leading-relaxed font-medium">
              {text}
            </p>
          </div>
        );
        continue;
      }
      
      // Paragraphs
      if (line.trim() !== '') {
        const parts = line.split('**');
        const inlineParsed = parts.map((part, pIdx) => {
          if (pIdx % 2 === 1) {
            return <strong key={pIdx} className="font-bold text-stone-950 dark:text-stone-100">{part}</strong>;
          }
          
          const codeParts = part.split('`');
          return codeParts.map((cPart, cIdx) => {
            if (cIdx % 2 === 1) {
              return (
                <code key={cIdx} className="px-2 py-0.5 mx-0.5 rounded-lg bg-stone-100 dark:bg-stone-900 border border-stone-200/50 dark:border-stone-800 text-xs font-mono text-stone-800 dark:text-stone-250 font-semibold">
                  {cPart}
                </code>
              );
            }
            return cPart;
          });
        });
        
        blocks.push(
          <p key={`p-${i}`} className="text-stone-600 dark:text-stone-300 text-[15px] md:text-[16px] leading-relaxed my-4.5 font-medium">
            {inlineParsed}
          </p>
        );
      }
    }
    
    return <div className="space-y-1">{blocks}</div>;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 font-sans transition-all duration-300">
      
      {/* HEADER CORPORATIVO B2B SAAS (SIN FUGA DE CLINICA) */}
      <header className="sticky top-0 z-50 w-full bg-white/95 dark:bg-stone-950/95 backdrop-blur-md border-b border-stone-100 dark:border-stone-900 py-1 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xl md:text-2xl font-serif tracking-widest text-stone-950 dark:text-white font-semibold select-none">
              PROBOOKIA <span className="text-blue-600 dark:text-[#d4af37] font-sans text-[10px] font-black tracking-[0.25em] uppercase ml-1">SaaS</span>
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            <LanguageSelector />
            <Link 
              href="/login" 
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-stone-50 dark:bg-stone-900 text-stone-700 dark:text-stone-350 border border-stone-200/60 dark:border-stone-850 hover:text-stone-950 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition-all duration-300 active:scale-95 shadow-sm"
            >
              {uiT.professionalAccess}
            </Link>
            <Link
              href="/"
              className="bg-stone-950 hover:bg-stone-900 dark:bg-white dark:hover:bg-stone-50 text-white dark:text-stone-950 px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all duration-300 hover:scale-105 active:scale-95"
            >
              {uiT.getStarted}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Header para la Documentación */}
      <header className="border-b border-stone-100 dark:border-stone-900 bg-stone-50/50 dark:bg-stone-900/10 py-12 md:py-16 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-blue-600 dark:text-[#d4af37] text-xs font-black uppercase tracking-[0.2em] mb-3">
              <BookOpen size={14} />
              <span>{uiT.badge}</span>
            </div>
            <h1 className="font-serif text-3xl md:text-5xl font-semibold tracking-tight text-stone-950 dark:text-white">
              {uiT.title}
            </h1>
            <p className="text-stone-500 dark:text-stone-400 text-sm md:text-base mt-2 max-w-xl font-medium">
              {uiT.subtitle}
            </p>
          </div>
          
          {/* Campo de Búsqueda de Lujo */}
          <div className="relative w-full md:w-80 group shrink-0">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-blue-600 transition-colors" />
            <input
              type="text"
              placeholder={uiT.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all shadow-sm"
            />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col lg:flex-row gap-10">

          {/* Botón de Menú Móvil del Sidebar */}
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden flex items-center justify-center gap-2 self-start px-4 py-2.5 bg-stone-50 dark:bg-stone-900 border border-stone-200/60 dark:border-stone-850 rounded-xl text-xs font-bold text-stone-700 dark:text-stone-200 hover:bg-stone-100 transition-all active:scale-95 shadow-sm"
          >
            <Menu size={16} />
            <span>{uiT.btnIndex}</span>
          </button>

          {/* Sidebar Izquierdo: Estilo Editorial */}
          <aside className={`w-full lg:w-72 shrink-0 lg:block ${sidebarOpen ? 'fixed inset-0 z-50 bg-white dark:bg-stone-950 p-6 overflow-y-auto block' : 'hidden'}`}>
            
            {/* Header del Menú Móvil */}
            <div className="flex items-center justify-between lg:hidden pb-6 border-b border-stone-100 dark:border-stone-900 mb-6">
              <span className="font-serif font-bold text-lg">{uiT.indexTitle}</span>
              <button 
                onClick={() => setSidebarOpen(false)}
                className="p-2 text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-900 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-8 pr-2">
              {filteredSections.map(section => (
                <div key={section.id} className="space-y-3">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-stone-400 dark:text-stone-500 select-none">
                    {section.title[langKey] || section.title.es}
                  </h3>
                  <ul className="space-y-1.5 border-l border-stone-100 dark:border-stone-900 pl-0">
                    {section.subpages.map(page => {
                      const isActive = activeSubpageId === page.id;
                      return (
                        <li key={page.id} className="relative">
                          <button
                            onClick={() => {
                              setActiveSectionId(section.id);
                              setActiveSubpageId(page.id);
                              setSidebarOpen(false);
                            }}
                            className={`w-full text-left py-1.5 pl-4 pr-3 text-[14px] font-medium transition-all rounded-lg select-none relative flex items-center justify-between group ${
                              isActive
                                ? 'text-stone-950 dark:text-white font-bold bg-stone-50 dark:bg-stone-900/50 before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-[3px] before:bg-blue-600 dark:before:bg-[#d4af37] before:rounded-full'
                                : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-50/50 dark:hover:bg-stone-900/20'
                            }`}
                          >
                            <span>{page.title[langKey] || page.title.es}</span>
                            <ChevronRight size={12} className={`opacity-0 group-hover:opacity-100 transition-opacity ${isActive ? 'text-blue-600 dark:text-[#d4af37]' : 'text-stone-300'}`} />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}

              {filteredSections.length === 0 && (
                <div className="text-center py-10">
                  <p className="text-stone-400 text-xs font-semibold">{uiT.noResults}</p>
                </div>
              )}
            </div>
          </aside>

          {/* Visor Central */}
          <main className="flex-1 min-w-0 max-w-3xl">
            <article className="prose dark:prose-invert prose-stone max-w-none">
              
              {/* Contenido Renderizado */}
              <div className="animate-in fade-in duration-500 ease-out">
                {renderMarkdownToReact(activeSubpage.markdown[langKey] || activeSubpage.markdown.es)}
              </div>

              {/* Botón de llamada a la acción inferior */}
              <div className="mt-14 pt-8 border-t border-stone-100 dark:border-stone-900 flex flex-col md:flex-row items-center justify-between gap-4">
                <Link 
                  href="/"
                  className="flex items-center gap-2 text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 text-xs font-bold transition-colors"
                >
                  <ArrowLeft size={14} />
                  <span>{uiT.backHome}</span>
                </Link>

                <Link
                  href="/login"
                  className="px-5 py-2.5 bg-stone-950 hover:bg-stone-900 dark:bg-white dark:hover:bg-stone-50 text-white dark:text-stone-950 text-xs font-bold rounded-xl transition-all shadow-md active:scale-95"
                >
                  {uiT.professionalAccess}
                </Link>
              </div>

            </article>
          </main>

        </div>
      </div>

      {/* Footer Minimalista */}
      <footer className="border-t border-stone-100 dark:border-stone-900 py-8 px-6 mt-20 bg-stone-50/50 dark:bg-stone-900/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-semibold text-stone-400 dark:text-stone-505">
          <div>
            <span>{uiT.footerText}</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/privacidad" className="hover:text-stone-600">Privacidad</Link>
            <Link href="/aviso-legal" className="hover:text-stone-600">Aviso Legal</Link>
            <Link href="/condiciones-reserva" className="hover:text-stone-600">Condiciones</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}

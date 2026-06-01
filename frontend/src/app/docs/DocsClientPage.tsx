"use client"
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, ChevronRight, BookOpen, Menu, X, ArrowLeft } from 'lucide-react';
import LanguageSelector from '@/components/LanguageSelector';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { DOCS_NAVIGATION } from './content';

interface DocsClientPageProps {
  brandingSettings: any;
  docsContent: Record<string, { es: string; en: string; fr: string }>;
}

export default function DocsClientPage({ brandingSettings, docsContent }: DocsClientPageProps) {
  const { language } = useLanguage();
  
  const [activeSectionId, setActiveSectionId] = useState(DOCS_NAVIGATION[0].id);
  const [activeSubpageId, setActiveSubpageId] = useState(DOCS_NAVIGATION[0].subpages[0].id);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Auto-scroll to top when changing page
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeSubpageId]);

  const primaryColor = brandingSettings?.primary_color || '#3b82f6';
  const secondaryColor = brandingSettings?.secondary_color || '#1c1917';
  const tertiaryColor = brandingSettings?.tertiary_color || '#d4af37';
  const fontFamily = brandingSettings?.font_family || 'playfair_inter';
  const logoSvg = brandingSettings?.logo_svg || null;
  const fontWeightHeadings = brandingSettings?.font_weight_headings || 'semibold';

  const weightMap: Record<string, string> = {
    'light': '300',
    'normal': '400',
    'medium': '500',
    'semibold': '600',
    'bold': '700'
  };
  const activeWeight = weightMap[fontWeightHeadings] || '600';

  // Find active subpage object
  const activeSection = DOCS_NAVIGATION.find(s => s.id === activeSectionId) || DOCS_NAVIGATION[0];
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
  const filteredSections = DOCS_NAVIGATION.map(section => {
    const matchingPages = section.subpages.filter(page => {
      const title = page.title[langKey] || '';
      const markdown = docsContent[page.id]?.[langKey] || '';
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


  function renderMarkdownToReact(markdown: string) {
    const lines = markdown.split('\n');
    const blocks: React.ReactNode[] = [];
    
    let i = 0;
    while (i < lines.length) {
      let line = lines[i];
      
      // 1. Fenced Code Block
      if (line.trim().startsWith('```')) {
        const lang = line.replace('```', '').trim();
        const codeLines: string[] = [];
        i++;
        while (i < lines.length && !lines[i].trim().startsWith('```')) {
          codeLines.push(lines[i]);
          i++;
        }
        // Skip closing backticks
        i++;
        const codeText = codeLines.join('\n');
        blocks.push(
          <div key={`code-${i}`} className="my-8 rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-850 bg-stone-950 shadow-xl animate-in fade-in duration-300">
            <div className="flex items-center justify-between px-4 py-3 bg-stone-900 border-b border-stone-800">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/80"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-green-500/80"></span>
              </div>
              <span className="text-[10px] font-mono tracking-widest text-stone-500 uppercase">{lang || 'CODE'}</span>
            </div>
            <pre className="p-5 overflow-x-auto font-mono text-xs text-stone-300 leading-relaxed custom-scrollbar">
              <code>{codeText}</code>
            </pre>
          </div>
        );
        continue;
      }
      
      // 2. Blockquotes / Callouts (grouped multi-line)
      if (line.startsWith('> ')) {
        const quoteLines: string[] = [];
        let type: 'note' | 'tip' | 'important' = 'note';
        
        while (i < lines.length && lines[i].startsWith('> ')) {
          let cleanLine = lines[i].replace('> ', '').trim();
          if (cleanLine.startsWith('[!NOTE]')) {
            type = 'note';
            cleanLine = cleanLine.replace('[!NOTE]', '').trim();
          } else if (cleanLine.startsWith('[!TIP]')) {
            type = 'tip';
            cleanLine = cleanLine.replace('[!TIP]', '').trim();
          } else if (cleanLine.startsWith('[!IMPORTANT]')) {
            type = 'important';
            cleanLine = cleanLine.replace('[!IMPORTANT]', '').trim();
          } else if (cleanLine.startsWith('[!WARNING]')) {
            type = 'important'; // Map warning to red important
            cleanLine = cleanLine.replace('[!WARNING]', '').trim();
          }
          if (cleanLine) {
            quoteLines.push(cleanLine);
          }
          i++;
        }
        
        let titleText = '';
        if (type === 'note') titleText = uiT.architectureNote;
        else if (type === 'tip') titleText = uiT.bestPractice;
        else if (type === 'important') titleText = uiT.securityRequirement;
        
        const quoteText = quoteLines.join(' ');
        
        blocks.push(
          <div key={`quote-${i}`} className={`my-8 p-6 rounded-2xl shadow-sm border border-stone-100 dark:border-stone-900 backdrop-blur-md ${
            type === 'important' ? 'border-l-4 border-red-500 bg-red-500/[0.02] text-red-950 dark:text-red-200' :
            type === 'tip' ? 'theme-quote-tip text-stone-850 dark:text-stone-200' :
            'theme-quote-note text-stone-850 dark:text-stone-200'
          }`}>
            {titleText && (
              <span 
                className="text-[10px] font-black tracking-widest uppercase block mb-2"
                style={{ 
                  color: type === 'important' ? 'rgb(239, 68, 68)' : 
                         type === 'tip' ? primaryColor : 
                         tertiaryColor 
                }}
              >
                {titleText}
              </span>
            )}
            <p className="text-stone-600 dark:text-stone-300 text-[15px] leading-relaxed font-medium">
              {quoteText}
            </p>
          </div>
        );
        continue;
      }
      
      // 3. Bullet lists (grouped consecutive items)
      if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
        const listItems: string[] = [];
        while (i < lines.length && (lines[i].trim().startsWith('* ') || lines[i].trim().startsWith('- '))) {
          listItems.push(lines[i].trim().replace(/^[\*\-]\s+/, ''));
          i++;
        }
        
        blocks.push(
          <ul key={`list-${i}`} className="my-6 space-y-4 pl-4">
            {listItems.map((item, idx) => {
              const parts = item.split('**');
              return (
                <li key={idx} className="flex items-start gap-3.5 text-stone-600 dark:text-stone-300 text-[15px] leading-relaxed animate-in fade-in duration-200">
                  <span className="w-1.5 h-1.5 rounded-full theme-bullet shrink-0 mt-2.5"></span>
                  <span>
                    {parts.map((part, pIdx) => pIdx % 2 === 1 ? <strong key={pIdx} className="font-semibold text-stone-900 dark:text-stone-100">{part}</strong> : part)}
                  </span>
                </li>
              );
            })}
          </ul>
        );
        continue;
      }
      
      // 4. Headers
      if (line.startsWith('# ')) {
        blocks.push(
          <h1 key={`h1-${i}`} className="font-serif text-3xl md:text-4xl font-semibold tracking-tight text-stone-950 dark:text-white mt-10 mb-6 pb-4 border-b border-stone-100 dark:border-stone-900 leading-tight">
            {line.replace('# ', '')}
          </h1>
        );
        i++;
        continue;
      }
      
      if (line.startsWith('## ')) {
        blocks.push(
          <h2 key={`h2-${i}`} className="font-serif text-2xl font-medium tracking-tight text-stone-950 dark:text-white mt-10 mb-5 leading-snug">
            {line.replace('## ', '')}
          </h2>
        );
        i++;
        continue;
      }
      
      if (line.startsWith('### ')) {
        blocks.push(
          <h3 key={`h3-${i}`} className="font-sans text-[11px] font-black uppercase tracking-wider text-stone-400 dark:text-stone-500 mt-8 mb-4">
            {line.replace('### ', '')}
          </h3>
        );
        i++;
        continue;
      }
      
      // 5. Dividers
      if (line.trim() === '---') {
        blocks.push(
          <hr key={`hr-${i}`} className="my-10 border-stone-100 dark:border-stone-900" />
        );
        i++;
        continue;
      }
      
      // 6. Regular paragraphs
      if (line.trim() !== '') {
        const parts = line.split('**');
        const inlineParsed = parts.map((part, pIdx) => {
          if (pIdx % 2 === 1) {
            return <strong key={pIdx} className="font-semibold text-stone-900 dark:text-stone-100">{part}</strong>;
          }
          
          const codeParts = part.split('`');
          return codeParts.map((cPart, cIdx) => {
            if (cIdx % 2 === 1) {
              return (
                <code key={cIdx} className="px-2 py-0.5 mx-0.5 rounded-lg bg-stone-100 dark:bg-stone-900 border border-stone-200/50 dark:border-stone-800 text-xs font-mono text-stone-800 dark:text-stone-200 font-semibold">
                  {cPart}
                </code>
              );
            }
            return cPart;
          });
        });
        
        blocks.push(
          <p key={`p-${i}`} className="text-stone-600 dark:text-stone-300 text-[16px] leading-relaxed mb-6 font-normal">
            {inlineParsed}
          </p>
        );
      }
      
      i++;
    }
    
    return <div className="space-y-2">{blocks}</div>;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 font-sans transition-all duration-300">
      
      {/* Inyección dinámica de Google Fonts y Clases Tipográficas */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Inter:wght@100..900&family=Outfit:wght@100..900&family=Fredoka:wght@300..700&family=Cormorant+Garamond:ital,wght@0,300..700;1,300..700&family=Montserrat:wght@100..900&family=Cinzel:wght@400..900&family=Roboto:wght@100..900&display=swap');
        
        :root {
          --primary-accent: ${primaryColor};
          --secondary-accent: ${secondaryColor};
          --tertiary-accent: ${tertiaryColor};
          
          --font-serif: ${
            fontFamily === 'playfair_inter' ? "'Playfair Display', serif" :
            fontFamily === 'outfit' ? "'Outfit', sans-serif" :
            fontFamily === 'fredoka' ? "'Fredoka', sans-serif" :
            fontFamily === 'cormorant_montserrat' ? "'Cormorant Garamond', serif" :
            fontFamily === 'cinzel_roboto' ? "'Cinzel', serif" :
            "'Inter', sans-serif"
          };
          --font-sans: ${
            fontFamily === 'playfair_inter' ? "'Inter', sans-serif" :
            fontFamily === 'outfit' ? "'Outfit', sans-serif" :
            fontFamily === 'fredoka' ? "'Fredoka', sans-serif" :
            fontFamily === 'cormorant_montserrat' ? "'Montserrat', sans-serif" :
            fontFamily === 'cinzel_roboto' ? "'Roboto', sans-serif" :
            "'Inter', sans-serif"
          };
        }
        
        .font-serif {
          font-family: var(--font-serif) !important;
          font-weight: ${activeWeight} !important;
        }
        
        .font-sans, body, html, button, input, select, textarea {
          font-family: var(--font-sans) !important;
        }

        .theme-accent-color {
          color: var(--tertiary-accent) !important;
        }

        .theme-active-indicator::before {
          background-color: var(--primary-accent) !important;
        }

        .theme-bullet {
          background-color: var(--primary-accent) !important;
        }

        .theme-quote-tip {
          border-left-width: 4px !important;
          border-color: var(--primary-accent) !important;
          background-color: color-mix(in srgb, var(--primary-accent) 2%, transparent) !important;
        }

        .theme-quote-note {
          border-left-width: 4px !important;
          border-color: var(--tertiary-accent) !important;
          background-color: color-mix(in srgb, var(--tertiary-accent) 2%, transparent) !important;
        }

        .theme-focus-focus:focus {
          border-color: var(--primary-accent) !important;
          box-shadow: 0 0 0 2px color-mix(in srgb, var(--primary-accent) 20%, transparent) !important;
        }
      ` }} />

      {/* HEADER CORPORATIVO B2B SAAS (SIN FUGA DE CLINICA) */}
      <header className="sticky top-0 z-50 w-full bg-white/95 dark:bg-stone-950/95 backdrop-blur-md border-b border-stone-100 dark:border-stone-900 py-1 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {logoSvg ? (
              <Link href="/" className="h-10 flex items-center justify-start [&>svg]:h-full [&>svg]:w-auto [&>svg]:max-w-full" dangerouslySetInnerHTML={{ __html: logoSvg }} />
            ) : (
              <Link href="/" className="text-xl md:text-2xl font-serif tracking-widest text-stone-950 dark:text-white font-semibold select-none">
                PROBOOKIA <span style={{ color: tertiaryColor }} className="font-sans text-[10px] font-black tracking-[0.25em] uppercase ml-1">SaaS</span>
              </Link>
            )}
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
            <div className="flex items-center gap-2 theme-accent-color text-xs font-black uppercase tracking-[0.2em] mb-3">
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
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-[var(--primary-accent)] transition-colors" />
            <input
              type="text"
              placeholder={uiT.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850 rounded-xl text-sm font-medium theme-focus-focus outline-none transition-all shadow-sm"
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
                  <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-stone-500 dark:text-stone-400 select-none pb-2 border-b border-stone-100 dark:border-stone-900/60 mb-2">
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
                            className={`w-full text-left py-2.5 pl-4 pr-3 text-[14px] font-medium transition-all rounded-lg select-none relative flex items-center justify-between group ${
                              isActive
                                ? 'text-stone-950 dark:text-white font-bold bg-stone-50 dark:bg-stone-900/50 before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-[3px] theme-active-indicator before:rounded-full'
                                : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-50/50 dark:hover:bg-stone-900/20'
                            }`}
                          >
                            <span>{page.title[langKey] || page.title.es}</span>
                            <ChevronRight size={12} className={`opacity-0 group-hover:opacity-100 transition-opacity ${isActive ? 'theme-accent-color' : 'text-stone-300'}`} />
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
                {renderMarkdownToReact(docsContent[activeSubpageId]?.[langKey] || docsContent[activeSubpageId]?.es || '')}
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

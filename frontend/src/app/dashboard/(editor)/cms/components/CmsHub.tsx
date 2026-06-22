"use client"
import React from 'react';
import Link from 'next/link';

interface CmsHubProps {
  onSelectMode: (mode: 'HUB' | 'HOME_EDITOR' | 'NAVIGATION_EDITOR') => void;
}

export default function CmsHub({ onSelectMode }: CmsHubProps) {
  return (
    <div className="min-h-screen bg-[#F7F7F5] py-16 px-6 md:px-12 overflow-y-auto w-full animate-in fade-in duration-500">
      
      {/* Header de Lujo */}
      <div className="max-w-5xl mx-auto mb-16 text-left">
        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#d4af37] block mb-2">
          Gestión Avanzada ProBookia
        </span>
        <h1 className="font-serif text-4xl md:text-5xl font-extrabold text-stone-800 tracking-tight leading-none mb-4">
          Gestor de Contenido (CMS)
        </h1>
        <p className="text-stone-500 font-sans text-sm md:text-base max-w-2xl leading-relaxed">
          Personaliza la presencia digital de tu clínica. Administra de forma visual el contenido y orden de tu portada principal, configura la barra de navegación del sitio o ajusta los parámetros estéticos generales.
        </p>
      </div>

      {/* Bento Grid Layout */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Card 1: Portada Principal */}
        <div 
          id="cms-bento-home-builder"
          onClick={() => onSelectMode('HOME_EDITOR')}
          className="bg-white rounded-3xl p-8 border border-stone-100 shadow-[0_10px_35px_-10px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-500 flex flex-col justify-between h-[340px] cursor-pointer group relative overflow-hidden"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-bold text-[#d4af37] bg-amber-50 px-3 py-1 rounded-full uppercase tracking-wider">
                Home Builder
              </span>
              <svg className="w-5 h-5 text-stone-300 group-hover:text-[#d4af37] transition-colors" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
            </div>
            <h3 className="font-serif text-2xl font-bold text-stone-800 mb-3 group-hover:text-[#d4af37] transition-colors">
              Portada Principal
            </h3>
            <p className="text-stone-500 font-sans text-xs md:text-sm leading-relaxed max-w-sm">
              Modifica interactivamente el Hero de bienvenida, sección sobre la clínica, carruseles de categorías y tratamientos, e inyecta parámetros SEO exclusivos.
            </p>
          </div>
          
          <div className="flex items-center gap-2 text-stone-800 font-bold text-xs uppercase tracking-wider">
            <span>Editar Portada</span>
            <span className="transform group-hover:translate-x-1 transition-transform duration-300">→</span>
          </div>
        </div>

        {/* Card 2: Menú de Navegación */}
        <div 
          id="cms-bento-nav-editor"
          onClick={() => onSelectMode('NAVIGATION_EDITOR')}
          className="bg-white rounded-3xl p-8 border border-stone-100 shadow-[0_10px_35px_-10px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-500 flex flex-col justify-between h-[340px] cursor-pointer group relative overflow-hidden"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-bold text-[#d4af37] bg-amber-50 px-3 py-1 rounded-full uppercase tracking-wider">
                Menú Dinámico
              </span>
              <svg className="w-5 h-5 text-stone-300 group-hover:text-[#d4af37] transition-colors" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </div>
            <h3 className="font-serif text-2xl font-bold text-stone-800 mb-3 group-hover:text-[#d4af37] transition-colors">
              Menú de Navegación
            </h3>
            <p className="text-stone-500 font-sans text-xs md:text-sm leading-relaxed max-w-sm">
              Edita las etiquetas, el orden y la visibilidad de los enlaces principales de tu barra superior para adaptarla a tus campañas o tratamientos destacados.
            </p>
          </div>
          
          <div className="flex items-center gap-2 text-stone-800 font-bold text-xs uppercase tracking-wider">
            <span>Gestionar Enlaces</span>
            <span className="transform group-hover:translate-x-1 transition-transform duration-300">→</span>
          </div>
        </div>

        {/* Card 3: Estilo & Branding */}
        <Link
          id="cms-bento-branding"
          href="/dashboard/settings?tab=branding"
          className="bg-white rounded-3xl p-8 border border-stone-100 shadow-[0_10px_35px_-10px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-500 flex flex-col justify-between h-[280px] cursor-pointer group relative overflow-hidden"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-bold text-[#d4af37] bg-amber-50 px-3 py-1 rounded-full uppercase tracking-wider">
                Estilo & Branding
              </span>
              <svg className="w-5 h-5 text-stone-300 group-hover:text-[#d4af37] transition-colors" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-3.078 0L3.72 17.5a1 1 0 001.48 1.135L8 17l2.8 1.635a1 1 0 001.48-1.135l-2.732-1.378z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v13m0-13L8 7m4-4l4 4" />
              </svg>
            </div>
            <h3 className="font-serif text-2xl font-bold text-stone-800 mb-3 group-hover:text-[#d4af37] transition-colors">
              Tipografía & Colores
            </h3>
            <p className="text-stone-500 font-sans text-xs md:text-sm leading-relaxed max-w-sm">
              Configura los tokens estéticos globales: selecciona paletas de lujo, colores de acento y tipografías premium como Playfair Display e Inter.
            </p>
          </div>
          
          <div className="flex items-center gap-2 text-stone-850 font-bold text-xs uppercase tracking-wider">
            <span>Configurar Estilos</span>
            <span className="transform group-hover:translate-x-1 transition-transform duration-300">→</span>
          </div>
        </Link>

        {/* Card 4: Páginas Independientes */}
        <Link
          id="cms-bento-pages"
          href="/dashboard/pages"
          className="bg-white rounded-3xl p-8 border border-stone-100 shadow-[0_10px_35px_-10px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-500 flex flex-col justify-between h-[280px] cursor-pointer group relative overflow-hidden"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-bold text-[#d4af37] bg-amber-50 px-3 py-1 rounded-full uppercase tracking-wider">
                Gestor Headless
              </span>
              <svg className="w-5 h-5 text-stone-300 group-hover:text-[#d4af37] transition-colors" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <h3 className="font-serif text-2xl font-bold text-stone-800 mb-3 group-hover:text-[#d4af37] transition-colors">
              Páginas del Sitio
            </h3>
            <p className="text-stone-500 font-sans text-xs md:text-sm leading-relaxed max-w-sm">
              Crea nuevas páginas autónomas para tu portal como políticas de privacidad, landing pages estacionales o secciones de promociones.
            </p>
          </div>
          <div className="flex items-center gap-2 text-stone-800 font-bold text-xs uppercase tracking-wider">
            <span>Gestionar Páginas</span>
            <span className="transform group-hover:translate-x-1 transition-transform duration-300">→</span>
          </div>
        </Link>

      </div>
    </div>
  );
}

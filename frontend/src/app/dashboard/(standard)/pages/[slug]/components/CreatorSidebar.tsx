"use client";
import React from 'react';
import { useDraggable } from '@dnd-kit/core';

interface SidebarDraggableItemProps {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

function SidebarDraggableItem({ id, title, description, icon }: SidebarDraggableItemProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: id,
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`p-4 rounded-2xl border border-stone-100 bg-stone-50/50 hover:bg-white hover:border-[#d4af37]/40 hover:shadow-luxury cursor-grab active:cursor-grabbing transition-all duration-300 flex items-start gap-3 group select-none ${
        isDragging ? 'opacity-40 ring-2 ring-[#d4af37]/30 border-[#d4af37]' : ''
      }`}
    >
      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-stone-100 text-stone-400 group-hover:text-[#d4af37] group-hover:border-amber-100 transition-colors shrink-0 shadow-sm">
        {icon}
      </div>
      <div className="min-w-0">
        <h4 className="text-[10px] font-black text-stone-600 group-hover:text-stone-900 transition-colors uppercase tracking-widest leading-none mt-1">
          {title}
        </h4>
        <p className="text-[9px] text-stone-400 font-sans mt-1.5 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}

export default function CreatorSidebar() {
  return (
    <aside className="w-80 shrink-0 bg-white border border-stone-100 rounded-[2.5rem] p-7 shadow-[0_8px_30px_rgba(0,0,0,0.02)] sticky top-24 self-start animate-in slide-in-from-left duration-500">
      <div className="mb-6 pb-4 border-b border-stone-100">
        <span className="text-[9px] font-black uppercase tracking-[0.25em] text-[#d4af37] block mb-1">
          Librería de Bloques
        </span>
        <h3 className="font-serif text-lg font-bold text-stone-850">
          Page Builder
        </h3>
        <p className="text-[10px] text-stone-400 font-sans mt-1 leading-relaxed">
          Arrastra cualquier bloque de esta biblioteca lateral y suéltalo dentro de una columna del lienzo para insertarlo en tiempo real.
        </p>
      </div>

      <div className="space-y-4">
        {/* 1. Título Heading */}
        <SidebarDraggableItem
          id="library-title_heading"
          title="Título Elegante"
          description="Títulos serif Playfair Display con divisores dorados de marca."
          icon={
            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
            </svg>
          }
        />

        {/* 2. Párrafo de Texto */}
        <SidebarDraggableItem
          id="library-atomic_text"
          title="Párrafo de Texto"
          description="Editor de texto HTML enriquecido fluido para lectura ágil."
          icon={
            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 17.75V5.25A2.25 2.25 0 015.25 3h13.5A2.25 2.25 0 0121 5.25V6" />
            </svg>
          }
        />

        {/* 3. Imagen / Vídeo */}
        <SidebarDraggableItem
          id="library-atomic_image"
          title="Imagen o Vídeo"
          description="Lector multimedia compatible con galería, vídeos mp4 en bucle y pies de foto."
          icon={
            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          }
        />

        {/* 4. Bloque Imagen + Texto (2-en-1) */}
        <SidebarDraggableItem
          id="library-text_image_cta"
          title="Imagen + Texto"
          description="Bloque de contenido editorial dos columnas con botón de acción."
          icon={
            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5A3.375 3.375 0 0010.125 2.25H3.75A1.5 1.5 0 002.25 3.75v16.5a1.5 1.5 0 001.5 1.5h16.5a1.5 1.5 0 001.5-1.5v-6z" />
            </svg>
          }
        />

        {/* 5. Botón de Acción CTA */}
        <SidebarDraggableItem
          id="library-atomic_button"
          title="Botón CTA"
          description="Llamada a la acción personalizable dorada, oscura u outline."
          icon={
            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 9.152c.582.448 1.148.89 1.676 1.345m-1.676-1.345c-.38-.3-1.047-.22-1.436.17l-5.835 5.835a.75.75 0 01-.53.22H5.25v-2.03a.75.75 0 01.22-.53l5.835-5.835c.39-.39 1.057-.47 1.436-.17l1.676 1.345zm1.676 1.345c.39.39.47 1.057.17 1.436l-1.345 1.676M11.25 11.25l.041-.02a.75.75 0 11-.75-1.3l.709.42a.75.75 0 010 1.3l-.36-.2a.75.75 0 11.36-1.2" />
            </svg>
          }
        />

        {/* 6. Catálogo de Servicios (Bento) */}
        <SidebarDraggableItem
          id="library-atomic_category"
          title="Bento Catálogo"
          description="Tarjetas Bento auto-renderizadas de tratamientos corporales o faciales."
          icon={
            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
            </svg>
          }
        />
      </div>
    </aside>
  );
}

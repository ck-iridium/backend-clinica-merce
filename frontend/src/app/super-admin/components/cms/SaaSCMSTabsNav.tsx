"use client";

import React from 'react';
import { Settings2, Sparkles, XCircle, Layers, Palette, Globe } from 'lucide-react';
import { SubTabType } from './types';

interface SaaSCMSTabsNavProps {
  activeTab: SubTabType;
  onChangeTab: (tab: SubTabType) => void;
}

export default function SaaSCMSTabsNav({ activeTab, onChangeTab }: SaaSCMSTabsNavProps) {
  const tabs = [
    {
      id: 'hero' as SubTabType,
      label: 'Hero',
      icon: Settings2,
      activeColor: 'text-[#D4AF37]',
      title: 'Editar Hero y Slider 16:9'
    },
    {
      id: 'pain' as SubTabType,
      label: 'Contras & Pros',
      icon: XCircle,
      activeColor: 'text-rose-500',
      title: 'Editar Comparativa de Contras y Pros'
    },
    {
      id: 'pillars' as SubTabType,
      label: 'Pilares',
      icon: Layers,
      activeColor: 'text-[#D4AF37]',
      title: 'Editar los 4 Pilares del Ecosistema'
    },
    {
      id: 'sectors' as SubTabType,
      label: 'Sectores',
      icon: Sparkles,
      activeColor: 'text-[#D4AF37]',
      title: 'Editar Carrusel 3D de Sectores'
    },
    {
      id: 'branding' as SubTabType,
      label: 'Branding',
      icon: Palette,
      activeColor: 'text-[#D4AF37]',
      title: 'Editar Colores, Tipografías y Logotipo'
    },
    {
      id: 'seo' as SubTabType,
      label: 'SEO',
      icon: Globe,
      activeColor: 'text-[#D4AF37]',
      title: 'Editar Metadatos SEO'
    }
  ];

  return (
    <div className="border-b border-stone-200/80 bg-stone-50/70 p-2 shrink-0">
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth py-0.5 px-0.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChangeTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                isActive
                  ? 'bg-white text-stone-900 shadow-sm border border-stone-200/90 font-bold'
                  : 'text-stone-500 hover:text-stone-800 hover:bg-stone-100/80'
              }`}
              title={tab.title}
            >
              <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? tab.activeColor : 'text-stone-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}


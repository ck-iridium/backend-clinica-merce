"use client";

import React from 'react';
import { 
  Globe, 
  Calendar, 
  Receipt, 
  Bot, 
  ShieldCheck, 
  Users, 
  Sparkles,
  Save,
  Plus,
  Trash2,
  Layers
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export type PillarIconType = 'globe' | 'calendar' | 'receipt' | 'bot' | 'shield' | 'users' | 'sparkles';

export interface PillarItem {
  id: string;
  number_badge: string;
  title: string;
  description: string;
  footer_highlight: string;
  icon: PillarIconType;
}

export interface PillarsSectionData {
  badge: string;
  title: string;
  subtitle: string;
  items: PillarItem[];
}

interface SaaSCMSPillarsFormProps {
  data: PillarsSectionData;
  onChange: (updated: PillarsSectionData) => void;
  onSubmit: (e: React.FormEvent) => void;
  saving: boolean;
}

const AVAILABLE_ICONS: Array<{ value: PillarIconType; label: string; icon: React.ElementType }> = [
  { value: 'globe', label: 'Globo / Web', icon: Globe },
  { value: 'calendar', label: 'Calendario / Agenda', icon: Calendar },
  { value: 'receipt', label: 'Ticket / Caja / Fiscal', icon: Receipt },
  { value: 'bot', label: 'Bot / Inteligencia Artificial', icon: Bot },
  { value: 'shield', label: 'Escudo / Seguridad RLS', icon: ShieldCheck },
  { value: 'users', label: 'Equipo / Colaboradores', icon: Users },
  { value: 'sparkles', label: 'Destellos / Lujo', icon: Sparkles },
];

export default function SaaSCMSPillarsForm({
  data,
  onChange,
  onSubmit,
  saving
}: SaaSCMSPillarsFormProps) {
  const updateGeneral = (field: keyof Pick<PillarsSectionData, 'badge' | 'title' | 'subtitle'>, val: string) => {
    onChange({ ...data, [field]: val });
  };

  const handleAddPillar = () => {
    const nextNum = (data.items?.length || 0) + 1;
    const newPillar: PillarItem = {
      id: `pillar-${Date.now()}`,
      number_badge: `Pilar 0${nextNum}`,
      title: 'Nuevo Pilar del Ecosistema',
      description: 'Describe aquí el impacto tecnológico o de gestión de este módulo para el cliente.',
      footer_highlight: 'Beneficio clave garantizado',
      icon: 'sparkles'
    };
    onChange({
      ...data,
      items: [...(data.items || []), newPillar]
    });
  };

  const handleUpdatePillar = (id: string, field: keyof PillarItem, val: any) => {
    const updated = (data.items || []).map(p => 
      p.id === id ? { ...p, [field]: val } : p
    );
    onChange({
      ...data,
      items: updated
    });
  };

  const handleDeletePillar = (id: string) => {
    const updated = (data.items || []).filter(p => p.id !== id);
    onChange({
      ...data,
      items: updated
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      
      {/* 1. CABECERA DE LA SECCIÓN */}
      <div className="bg-white/95 border border-stone-200/80 rounded-2xl p-5 space-y-4 shadow-2xs">
        <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
          <Layers className="w-4 h-4 text-[#D4AF37]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900">
            Cabecera de los Pilares
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-1">
              Badge Superior
            </label>
            <Input
              type="text"
              value={data.badge || ''}
              onChange={e => updateGeneral('badge', e.target.value)}
              placeholder="Arquitectura de Producto"
              className="h-9 text-xs bg-stone-50/60 font-medium"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-1">
              Título Principal
            </label>
            <Input
              type="text"
              value={data.title || ''}
              onChange={e => updateGeneral('title', e.target.value)}
              placeholder="Los 4 Pilares del Ecosistema"
              className="h-9 text-xs bg-stone-50/60 font-medium"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-1">
            Subtítulo Explicativo
          </label>
          <Textarea
            value={data.subtitle || ''}
            onChange={e => updateGeneral('subtitle', e.target.value)}
            rows={2}
            placeholder="Todo lo que una clínica de alta gama necesita para operar con la máxima sofisticación..."
            className="text-xs bg-stone-50/60 font-medium resize-none"
          />
        </div>
      </div>

      {/* 2. LISTA DE PILARES */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900">
              Tarjetas de Pilares ({data.items?.length || 0})
            </h3>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddPillar}
            className="h-7 text-xs gap-1 border-stone-300 hover:border-[#D4AF37] hover:text-[#D4AF37] cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Añadir Pilar</span>
          </Button>
        </div>

        <div className="space-y-4">
          {(data.items || []).map((pillar, idx) => {
            const CurrentIconComp = AVAILABLE_ICONS.find(i => i.value === pillar.icon)?.icon || Sparkles;

            return (
              <div 
                key={pillar.id || idx}
                className="bg-white/95 border border-stone-200/80 rounded-2xl p-5 space-y-4 shadow-2xs hover:border-stone-300 transition-all duration-200"
              >
                {/* Fila Superior: Badge, Icono y Borrar */}
                <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-300/30 flex items-center justify-center text-[#B38F26] shrink-0">
                      <CurrentIconComp className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[9px] font-bold uppercase tracking-widest text-[#B38F26] block">
                        {pillar.number_badge || `Pilar 0${idx + 1}`}
                      </span>
                      <h4 className="text-xs font-bold text-stone-900">
                        {pillar.title || 'Sin título'}
                      </h4>
                    </div>
                  </div>

                  {(data.items || []).length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleDeletePillar(pillar.id)}
                      className="w-7 h-7 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors"
                      title="Eliminar este pilar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Campos de Edición del Pilar */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-1">
                      Etiqueta Número
                    </label>
                    <Input
                      type="text"
                      value={pillar.number_badge || ''}
                      onChange={e => handleUpdatePillar(pillar.id, 'number_badge', e.target.value)}
                      placeholder="Pilar 01"
                      className="h-9 text-xs bg-stone-50/60 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-1">
                      Icono Representativo
                    </label>
                    <Select
                      value={pillar.icon || 'sparkles'}
                      onValueChange={(val: PillarIconType) => handleUpdatePillar(pillar.id, 'icon', val)}
                    >
                      <SelectTrigger className="h-9 text-xs bg-stone-50/60">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {AVAILABLE_ICONS.map(ic => {
                          const IconC = ic.icon;
                          return (
                            <SelectItem key={ic.value} value={ic.value} className="text-xs">
                              <div className="flex items-center gap-2">
                                <IconC className="w-3.5 h-3.5 text-[#D4AF37]" />
                                <span>{ic.label}</span>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-1">
                      Pie Destacado (Tagline)
                    </label>
                    <Input
                      type="text"
                      value={pillar.footer_highlight || ''}
                      onChange={e => handleUpdatePillar(pillar.id, 'footer_highlight', e.target.value)}
                      placeholder="Tu marca propia en el centro"
                      className="h-9 text-xs bg-stone-50/60 font-semibold text-stone-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-1">
                    Título del Pilar
                  </label>
                  <Input
                    type="text"
                    value={pillar.title || ''}
                    onChange={e => handleUpdatePillar(pillar.id, 'title', e.target.value)}
                    placeholder="Presencia Web de Lujo"
                    className="h-9 text-xs bg-stone-50/60 font-bold text-stone-950"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-1">
                    Descripción del Pilar
                  </label>
                  <Textarea
                    value={pillar.description || ''}
                    onChange={e => handleUpdatePillar(pillar.id, 'description', e.target.value)}
                    rows={3}
                    placeholder="CMS visual modular sin tocar código. Catálogo de tratamientos con fotos..."
                    className="text-xs bg-stone-50/60 font-medium resize-none leading-relaxed"
                    required
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. BOTÓN SUBMIT */}
      <div className="pt-2">
        <Button
          type="submit"
          variant="luxury"
          size="lg"
          disabled={saving}
          className="w-full text-xs font-bold gap-2 cursor-pointer shadow-md"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Guardando Pilares...' : 'Guardar Cambios de Pilares'}</span>
        </Button>
      </div>

    </form>
  );
}


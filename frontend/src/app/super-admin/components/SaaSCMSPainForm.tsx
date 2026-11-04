"use client";

import React from 'react';
import { 
  XCircle, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  AlertTriangle, 
  Sparkles,
  Save,
  Check
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

export interface PainComparisonOldItem {
  id: string;
  concept: string;
  cost: string;
}

export interface PainComparisonSuiteFeature {
  id: string;
  title: string;
  description: string;
}

export interface PainComparisonData {
  badge: string;
  title: string;
  subtitle: string;
  old_model: {
    badge: string;
    title: string;
    items: PainComparisonOldItem[];
    total_label: string;
    total_amount: string;
    footnote: string;
  };
  suite_model: {
    corner_badge: string;
    badge: string;
    title: string;
    features: PainComparisonSuiteFeature[];
    pricing_label: string;
    pricing_amount: string;
    cta_text: string;
  };
}

interface SaaSCMSPainFormProps {
  data: PainComparisonData;
  onChange: (updated: PainComparisonData) => void;
  onSubmit: (e: React.FormEvent) => void;
  saving: boolean;
}

export default function SaaSCMSPainForm({
  data,
  onChange,
  onSubmit,
  saving
}: SaaSCMSPainFormProps) {
  // Helpers para modificar el estado profundo
  const updateGeneral = (field: keyof Pick<PainComparisonData, 'badge' | 'title' | 'subtitle'>, val: string) => {
    onChange({ ...data, [field]: val });
  };

  const updateOldModel = (field: string, val: any) => {
    onChange({
      ...data,
      old_model: {
        ...data.old_model,
        [field]: val
      }
    });
  };

  const updateSuiteModel = (field: string, val: any) => {
    onChange({
      ...data,
      suite_model: {
        ...data.suite_model,
        [field]: val
      }
    });
  };

  // Ítems del modelo antiguo
  const handleAddOldItem = () => {
    const newItem: PainComparisonOldItem = {
      id: `old-${Date.now()}`,
      concept: 'Nueva herramienta o servicio',
      cost: '~30€/mes'
    };
    updateOldModel('items', [...(data.old_model?.items || []), newItem]);
  };

  const handleUpdateOldItem = (id: string, field: 'concept' | 'cost', val: string) => {
    const updated = (data.old_model?.items || []).map(item => 
      item.id === id ? { ...item, [field]: val } : item
    );
    updateOldModel('items', updated);
  };

  const handleDeleteOldItem = (id: string) => {
    const updated = (data.old_model?.items || []).filter(item => item.id !== id);
    updateOldModel('items', updated);
  };

  // Beneficios de ProBookia Suite
  const handleAddSuiteFeature = () => {
    const newFeature: PainComparisonSuiteFeature = {
      id: `feat-${Date.now()}`,
      title: 'Nueva funcionalidad clave:',
      description: 'Breve explicación del beneficio para el cliente.'
    };
    updateSuiteModel('features', [...(data.suite_model?.features || []), newFeature]);
  };

  const handleUpdateSuiteFeature = (id: string, field: 'title' | 'description', val: string) => {
    const updated = (data.suite_model?.features || []).map(feat => 
      feat.id === id ? { ...feat, [field]: val } : feat
    );
    updateSuiteModel('features', updated);
  };

  const handleDeleteSuiteFeature = (id: string) => {
    const updated = (data.suite_model?.features || []).filter(feat => feat.id !== id);
    updateSuiteModel('features', updated);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      
      {/* 1. CABECERA DE LA SECCIÓN */}
      <div className="bg-white/95 border border-stone-200/80 rounded-2xl p-5 space-y-4 shadow-2xs">
        <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
          <Sparkles className="w-4 h-4 text-[#D4AF37]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900">
            Cabecera de la Sección
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
              placeholder="El Dolor del Mercado"
              className="h-9 text-xs bg-stone-50/60 font-medium"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-1">
              Título de Alto Impacto
            </label>
            <Input
              type="text"
              value={data.title || ''}
              onChange={e => updateGeneral('title', e.target.value)}
              placeholder="¿Por qué pagar 5 programas si puedes tenerlo todo en uno?"
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
            placeholder="La mayoría de clínicas sufren un caos de contraseñas, datos desincronizados..."
            className="text-xs bg-stone-50/60 font-medium resize-none"
          />
        </div>
      </div>

      {/* 2. TARJETA IZQUIERDA: EL MODELO ANTIGUO / CONTRAS */}
      <div className="bg-white/95 border border-rose-200/60 rounded-2xl p-5 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between pb-2 border-b border-rose-100">
          <div className="flex items-center gap-2">
            <XCircle className="w-4 h-4 text-rose-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-rose-950">
              Tarjeta Izquierda: El Modelo Antiguo (Contras)
            </h3>
          </div>
          <span className="text-[9px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
            Costes Dispersos
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-1">
              Etiqueta de la Tarjeta
            </label>
            <Input
              type="text"
              value={data.old_model?.badge || ''}
              onChange={e => updateOldModel('badge', e.target.value)}
              placeholder="El Modelo Antiguo y Fragmentado"
              className="h-9 text-xs bg-stone-50/60 font-medium"
            />
          </div>
          <div>
            <label className="block text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-1">
              Título de la Tarjeta
            </label>
            <Input
              type="text"
              value={data.old_model?.title || ''}
              onChange={e => updateOldModel('title', e.target.value)}
              placeholder="Herramientas Dispersas"
              className="h-9 text-xs bg-stone-50/60 font-medium"
            />
          </div>
        </div>

        {/* Lista Dinámica de Costes Dispersos */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-[9px] font-bold text-stone-500 uppercase tracking-wider">
              Desglose de Costes Fragmentados
            </label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddOldItem}
              className="h-6 text-[10px] gap-1 text-rose-600 border-rose-200 hover:bg-rose-50 cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>Añadir Programa</span>
            </Button>
          </div>

          <div className="space-y-2">
            {(data.old_model?.items || []).map((item) => (
              <div key={item.id} className="flex items-center gap-2 bg-stone-50 p-2 rounded-xl border border-stone-200/60">
                <Input
                  type="text"
                  value={item.concept}
                  onChange={e => handleUpdateOldItem(item.id, 'concept', e.target.value)}
                  placeholder="Nombre de herramienta/coste"
                  className="h-8 text-xs bg-white flex-1 font-medium"
                />
                <Input
                  type="text"
                  value={item.cost}
                  onChange={e => handleUpdateOldItem(item.id, 'cost', e.target.value)}
                  placeholder="~40€/mes"
                  className="h-8 text-xs bg-white w-28 font-mono font-bold text-stone-700 text-right"
                />
                {(data.old_model?.items || []).length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleDeleteOldItem(item.id)}
                    className="w-7 h-7 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors shrink-0"
                    title="Eliminar ítem"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Totales y notas al pie del modelo antiguo */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-stone-100">
          <div>
            <label className="block text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-1">
              Etiqueta Total
            </label>
            <Input
              type="text"
              value={data.old_model?.total_label || ''}
              onChange={e => updateOldModel('total_label', e.target.value)}
              placeholder="Gasto Medio Mensual"
              className="h-8 text-xs bg-stone-50/60 font-medium"
            />
          </div>
          <div>
            <label className="block text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-1">
              Importe Total Estimado
            </label>
            <Input
              type="text"
              value={data.old_model?.total_amount || ''}
              onChange={e => updateOldModel('total_amount', e.target.value)}
              placeholder="220€/mes"
              className="h-8 text-xs bg-stone-50/60 font-bold text-rose-600"
            />
          </div>
          <div>
            <label className="block text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-1">
              Frase Descriptiva / Dolor
            </label>
            <Input
              type="text"
              value={data.old_model?.footnote || ''}
              onChange={e => updateOldModel('footnote', e.target.value)}
              placeholder="+ Pérdida de tiempo en 5 inicios de sesión distintos."
              className="h-8 text-xs bg-stone-50/60 font-medium text-stone-500"
            />
          </div>
        </div>
      </div>

      {/* 3. TARJETA DERECHA: LA SOLUCIÓN PROBOOKIA / PROS */}
      <div className="bg-white/95 border border-emerald-200/80 rounded-2xl p-5 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between pb-2 border-b border-emerald-100">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-950">
              Tarjeta Derecha: La Solución ProBookia (Pros)
            </h3>
          </div>
          <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            Suite Unificada
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-1">
              Badge de Esquina
            </label>
            <Input
              type="text"
              value={data.suite_model?.corner_badge || ''}
              onChange={e => updateSuiteModel('corner_badge', e.target.value)}
              placeholder="Suite Todo-en-Uno"
              className="h-9 text-xs bg-stone-50/60 font-medium"
            />
          </div>
          <div>
            <label className="block text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-1">
              Etiqueta de la Solución
            </label>
            <Input
              type="text"
              value={data.suite_model?.badge || ''}
              onChange={e => updateSuiteModel('badge', e.target.value)}
              placeholder="La Solución Unificada"
              className="h-9 text-xs bg-stone-50/60 font-medium"
            />
          </div>
          <div>
            <label className="block text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-1">
              Título de la Suite
            </label>
            <Input
              type="text"
              value={data.suite_model?.title || ''}
              onChange={e => updateSuiteModel('title', e.target.value)}
              placeholder="ProBookia Suite"
              className="h-9 text-xs bg-stone-50/60 font-medium"
            />
          </div>
        </div>

        {/* Lista Dinámica de Ventajas ProBookia */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-[9px] font-bold text-stone-500 uppercase tracking-wider">
              Ventajas & Características Incluidas
            </label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddSuiteFeature}
              className="h-6 text-[10px] gap-1 text-emerald-600 border-emerald-200 hover:bg-emerald-50 cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>Añadir Ventaja</span>
            </Button>
          </div>

          <div className="space-y-2">
            {(data.suite_model?.features || []).map((feat) => (
              <div key={feat.id} className="flex items-center gap-2 bg-stone-50 p-2 rounded-xl border border-stone-200/60">
                <Input
                  type="text"
                  value={feat.title}
                  onChange={e => handleUpdateSuiteFeature(feat.id, 'title', e.target.value)}
                  placeholder="Título corto (ej. Web con CMS:)"
                  className="h-8 text-xs bg-white w-44 font-bold text-stone-900"
                />
                <Input
                  type="text"
                  value={feat.description}
                  onChange={e => handleUpdateSuiteFeature(feat.id, 'description', e.target.value)}
                  placeholder="Descripción del beneficio..."
                  className="h-8 text-xs bg-white flex-1 font-medium"
                />
                {(data.suite_model?.features || []).length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleDeleteSuiteFeature(feat.id)}
                    className="w-7 h-7 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors shrink-0"
                    title="Eliminar ventaja"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Precios y botón de llamada a la acción */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-stone-100">
          <div>
            <label className="block text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-1">
              Etiqueta de Precio
            </label>
            <Input
              type="text"
              value={data.suite_model?.pricing_label || ''}
              onChange={e => updateSuiteModel('pricing_label', e.target.value)}
              placeholder="Todo Incluido Desde"
              className="h-8 text-xs bg-stone-50/60 font-medium"
            />
          </div>
          <div>
            <label className="block text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-1">
              Importe Desde
            </label>
            <Input
              type="text"
              value={data.suite_model?.pricing_amount || ''}
              onChange={e => updateSuiteModel('pricing_amount', e.target.value)}
              placeholder="39€/mes"
              className="h-8 text-xs bg-stone-50/60 font-bold text-emerald-600"
            />
          </div>
          <div>
            <label className="block text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-1">
              Texto del Botón CTA
            </label>
            <Input
              type="text"
              value={data.suite_model?.cta_text || ''}
              onChange={e => updateSuiteModel('cta_text', e.target.value)}
              placeholder="Probar Gratis"
              className="h-8 text-xs bg-stone-50/60 font-medium text-stone-800"
            />
          </div>
        </div>
      </div>

      {/* 4. BOTÓN SUBMIT */}
      <div className="pt-2">
        <Button
          type="submit"
          variant="luxury"
          size="lg"
          disabled={saving}
          className="w-full text-xs font-bold gap-2 cursor-pointer shadow-md"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Guardando Sección...' : 'Guardar Cambios de Comparativa'}</span>
        </Button>
      </div>

    </form>
  );
}


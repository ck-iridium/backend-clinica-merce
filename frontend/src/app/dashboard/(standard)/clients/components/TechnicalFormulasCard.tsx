"use client";

import React, { useState } from 'react';
import { Sparkles, Plus, Clock, History, FileText, CheckCircle2, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ColorFormula {
  date: string;
  formula: string;
  notes?: string;
}

interface TechnicalFormulasCardProps {
  clientId: string;
  colorFormulas?: ColorFormula[];
  technicalNotes?: string | null;
  rawHistory?: string | null;
  onRefresh?: () => void;
}

export function TechnicalFormulasCard({
  clientId,
  colorFormulas = [],
  technicalNotes = '',
  rawHistory = '',
  onRefresh
}: TechnicalFormulasCardProps) {
  const [formulas, setFormulas] = useState<ColorFormula[]>(colorFormulas || []);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showRawText, setShowRawText] = useState(false);
  const [newDate, setNewDate] = useState(() => {
    const now = new Date();
    const d = String(now.getDate()).padStart(2, '0');
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const y = now.getFullYear();
    return `${d}/${m}/${y}`;
  });
  const [newFormula, setNewFormula] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [reparsing, setReparsing] = useState(false);

  // Sync state if props change
  React.useEffect(() => {
    setFormulas(colorFormulas || []);
  }, [colorFormulas]);

  const latestFormula = formulas && formulas.length > 0 ? formulas[0] : null;

  const handleAddFormula = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFormula.trim()) {
      toast.error('Por favor introduce la fórmula o especificación técnica');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/clients/${clientId}/formulas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: newDate.trim(),
          formula: newFormula.trim(),
          notes: newNotes.trim()
        })
      });

      if (!res.ok) {
        throw new Error('Error al registrar la nueva fórmula');
      }

      const data = await res.json();
      setFormulas(data.formulas || []);
      setNewFormula('');
      setNewNotes('');
      setShowAddForm(false);
      toast.success('¡Fórmula técnica registrada correctamente!');
      onRefresh?.();
    } catch (err: any) {
      toast.error(err.message || 'Error de conexión');
    } finally {
      setSaving(false);
    }
  };

  const handleReparseHistory = async () => {
    setReparsing(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/clients/${clientId}/reparse-history`, {
        method: 'POST'
      });
      if (!res.ok) throw new Error('Error al analizar el histórico');
      const data = await res.json();
      setFormulas(data.formulas || []);
      toast.success('¡Histórico analizado y estructurado por fechas con éxito!');
      onRefresh?.();
    } catch (err: any) {
      toast.error(err.message || 'Error al procesar el histórico');
    } finally {
      setReparsing(false);
    }
  };

  return (
    <Card className="rounded-[2rem] border-stone-200/70 bg-white/90 backdrop-blur-xl p-6 sm:p-8 shadow-sm space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-100 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-orange-50 border border-orange-200/60 flex items-center justify-center text-[#FF6B00] shadow-2xs shrink-0">
            <Sparkles size={20} strokeWidth={2} />
          </div>
          <div>
            <h3 className="text-xl font-serif font-bold text-stone-900 leading-tight">
              Bitácora Técnica & Fórmulas
            </h3>
            <p className="text-xs text-stone-400 font-medium">
              Historial de coloración, mezclas técnicas y especificaciones de corte
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {formulas.length > 0 && (
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-stone-100 text-stone-600 border border-stone-200/60">
              {formulas.length} {formulas.length === 1 ? 'registro' : 'registros'}
            </span>
          )}
          <Button
            type="button"
            size="sm"
            onClick={() => setShowAddForm(!showAddForm)}
            className="rounded-xl bg-[#FF6B00] hover:bg-[#EA5E00] text-white text-xs font-bold gap-1.5 shadow-sm h-9"
          >
            <Plus size={14} />
            <span>Anotar Fórmula</span>
          </Button>
        </div>
      </div>

      {/* Formulario Inline para Añadir Nueva Fórmula */}
      {showAddForm && (
        <form onSubmit={handleAddFormula} className="p-5 bg-orange-50/40 border border-orange-200/70 rounded-2xl space-y-4 animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#FF6B00]">
              Nueva Fórmula / Nota Técnica
            </span>
            <span className="text-[11px] text-stone-400">
              Se registrará en la cabecera de la ficha
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">
                Fecha
              </label>
              <input
                type="text"
                value={newDate}
                onChange={e => setNewDate(e.target.value)}
                placeholder="DD/MM/AAAA"
                className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-bold text-stone-800 outline-none focus:ring-2 focus:ring-[#FF6B00]/20"
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">
                Fórmula / Mezcla / Tratamiento *
              </label>
              <input
                type="text"
                value={newFormula}
                onChange={e => setNewFormula(e.target.value)}
                placeholder="Ej: 35g de 9/00 + 5g de 7/11 a 20 vol + mechas"
                className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-medium text-stone-800 outline-none focus:ring-2 focus:ring-[#FF6B00]/20"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">
              Notas Adicionales (Opcional)
            </label>
            <input
              type="text"
              value={newNotes}
              onChange={e => setNewNotes(e.target.value)}
              placeholder="Ej: Tiempo exposición 35 min, le gusta el flequillo al lado"
              className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-medium text-stone-800 outline-none focus:ring-2 focus:ring-[#FF6B00]/20"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowAddForm(false)}
              className="rounded-xl text-xs font-semibold"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={saving}
              className="rounded-xl bg-[#FF6B00] hover:bg-[#EA5E00] text-white text-xs font-bold gap-1.5"
            >
              {saving ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
              <span>Guardar en Historial</span>
            </Button>
          </div>
        </form>
      )}

      {/* ⭐ HERO: ÚLTIMA FÓRMULA REGISTRADA */}
      {latestFormula ? (
        <div className="p-5 bg-gradient-to-r from-orange-50/80 via-amber-50/40 to-stone-50/80 border border-orange-200/80 rounded-2xl space-y-2 relative overflow-hidden shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FF6B00] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#FF6B00] animate-pulse" />
              Última Fórmula Utilizada
            </span>
            <span className="text-xs font-mono font-bold text-stone-600 bg-white/90 px-2.5 py-0.5 rounded-lg border border-stone-200/60 shadow-2xs">
              {latestFormula.date}
            </span>
          </div>

          <p className="text-sm sm:text-base font-semibold text-stone-900 leading-snug">
            {latestFormula.formula}
          </p>

          {latestFormula.notes && (
            <p className="text-xs text-stone-500 italic pt-1 border-t border-orange-200/40">
              Nota: {latestFormula.notes}
            </p>
          )}
        </div>
      ) : (
        <div className="text-center py-6 px-4 bg-stone-50/60 rounded-2xl border border-dashed border-stone-200 text-stone-400 text-xs space-y-1">
          <p className="font-semibold text-stone-600">Aún no hay fórmulas técnicas registradas para esta clienta.</p>
          <p>Pulsa en &quot;Anotar Fórmula&quot; para registrar su primera mezcla de color o preferencia técnica.</p>
        </div>
      )}

      {/* Historial Cronológico de Fórmulas */}
      {formulas.length > 1 && (
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-2">
            <Clock size={13} />
            <span>Histórico de Fórmulas Anteriores</span>
          </h4>

          <div className="divide-y divide-stone-100 border border-stone-200/70 rounded-2xl bg-white overflow-hidden shadow-2xs max-h-80 overflow-y-auto">
            {formulas.slice(1).map((f, idx) => (
              <div key={idx} className="p-3.5 hover:bg-stone-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="space-y-0.5">
                  <div className="font-semibold text-stone-800">
                    {f.formula}
                  </div>
                  {f.notes && (
                    <div className="text-[11px] text-stone-400 italic">
                      {f.notes}
                    </div>
                  )}
                </div>
                <span className="font-mono font-bold text-stone-400 text-[11px] shrink-0 bg-stone-50 px-2 py-0.5 rounded border border-stone-100">
                  {f.date}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Acordeón para ver texto histórico original del Excel */}
      {rawHistory && (
        <div className="pt-2 border-t border-stone-100">
          <button
            type="button"
            onClick={() => setShowRawText(!showRawText)}
            className="flex items-center justify-between w-full text-left py-2 text-xs font-bold text-stone-500 hover:text-stone-800 transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <History size={13} />
              <span>Ver texto histórico original sin procesar</span>
            </span>
            {showRawText ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {showRawText && (
            <div className="mt-2 p-4 rounded-xl bg-stone-50 border border-stone-200/80 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  Texto íntegro importado
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleReparseHistory}
                  disabled={reparsing}
                  className="h-7 text-[11px] font-bold text-[#FF6B00] border-orange-200 hover:bg-orange-50 gap-1 rounded-lg"
                >
                  {reparsing ? <Loader2 size={11} className="animate-spin" /> : <Sparkles size={11} />}
                  <span>Volver a estructurar con detector de fechas</span>
                </Button>
              </div>
              <p className="font-mono text-xs text-stone-700 whitespace-pre-wrap leading-relaxed select-all bg-white p-3 rounded-lg border border-stone-200">
                {rawHistory}
              </p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

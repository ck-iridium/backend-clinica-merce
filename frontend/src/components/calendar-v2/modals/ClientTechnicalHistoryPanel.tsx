'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Calendar, 
  Phone, 
  ExternalLink, 
  Plus, 
  RotateCw, 
  FileText, 
  ChevronDown, 
  ChevronUp,
  X,
  MessageCircle,
  Pencil,
  Trash2,
  Check,
  Tag
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface ClientTechnicalHistoryPanelProps {
  clientId: string | null;
  clientFallbackName?: string;
  onClose?: () => void;
  availableServices?: Array<{ id: string; name: string }>;
  isEmbedded?: boolean;
}

export function ClientTechnicalHistoryPanel({
  clientId,
  clientFallbackName,
  onClose,
  availableServices = [],
  isEmbedded = false,
}: ClientTechnicalHistoryPanelProps) {
  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  const getTodayFormatted = () => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  // New entry form state
  const [newFormula, setNewFormula] = useState('');
  const [newDate, setNewDate] = useState(getTodayFormatted);
  const [newNotes, setNewNotes] = useState('');
  const [savingFormula, setSavingFormula] = useState(false);
  const [showRawHistory, setShowRawHistory] = useState(false);
  const [isReparsing, setIsReparsing] = useState(false);

  // Hidden date picker refs
  const newDatePickerRef = useRef<HTMLInputElement>(null);
  const editDatePickerRef = useRef<HTMLInputElement>(null);

  // Inline editing state for past entries
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editDate, setEditDate] = useState('');
  const [editFormula, setEditFormula] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const handleDateChangeFromCalendar = (e: React.ChangeEvent<HTMLInputElement>, isEditing = false) => {
    const val = e.target.value; // YYYY-MM-DD
    if (!val) return;
    const [y, m, d] = val.split('-');
    const formatted = `${d}/${m}/${y}`;
    if (isEditing) {
      setEditDate(formatted);
    } else {
      setNewDate(formatted);
    }
  };

  // Fetch client data
  useEffect(() => {
    if (!clientId) {
      setClient(null);
      return;
    }

    const fetchClientData = async () => {
      setLoading(true);
      try {
        const userSession = localStorage.getItem('user');
        const headers: Record<string, string> = {};
        if (userSession) {
          try {
            const parsed = JSON.parse(userSession);
            if (parsed.tenant_id) headers['X-Tenant-ID'] = parsed.tenant_id;
            const token = parsed.access_token || parsed.token;
            if (token) headers['Authorization'] = `Bearer ${token}`;
          } catch (e) {
            console.error(e);
          }
        }

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/clients/${clientId}`, { headers });
        if (res.ok) {
          const data = await res.json();
          setClient(data);
        } else {
          toast.error('No se pudo cargar la ficha del cliente');
        }
      } catch (err) {
        console.error('Error fetching client history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchClientData();
  }, [clientId]);

  // Append treatment chip into the formula textarea
  const handleAddChip = (serviceName: string) => {
    setNewFormula((prev) => {
      const trimmed = prev.trim();
      if (!trimmed) return serviceName;
      return `${trimmed} + ${serviceName}`;
    });
  };

  const handleSaveFormula = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFormula.trim()) {
      toast.error('Escribe o selecciona los tratamientos antes de guardar');
      return;
    }

    setSavingFormula(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/clients/${clientId}/formulas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: newDate.trim(),
          formula: newFormula.trim(),
          notes: newNotes.trim()
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setClient((prev: any) => ({
          ...prev,
          color_formulas: data.formulas || [
            { date: newDate, formula: newFormula, notes: newNotes },
            ...(prev?.color_formulas || [])
          ]
        }));
        setNewFormula('');
        setNewNotes('');
        toast.success('Trabajo registrado en el historial');
      } else {
        toast.error('Error al guardar en el historial');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error de red al guardar');
    } finally {
      setSavingFormula(false);
    }
  };

  const handleStartEdit = (index: number, entry: any) => {
    setEditingIndex(index);
    setEditDate(entry.date || '');
    setEditFormula(entry.formula || '');
    setEditNotes(entry.notes || '');
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditDate('');
    setEditFormula('');
    setEditNotes('');
  };

  const handleSaveEdit = async (index: number) => {
    if (!editFormula.trim()) {
      toast.error('La descripción no puede estar vacía');
      return;
    }

    setSavingEdit(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/clients/${clientId}/formulas/${index}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: editDate.trim(),
          formula: editFormula.trim(),
          notes: editNotes.trim(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setClient((prev: any) => ({
          ...prev,
          color_formulas: data.formulas
        }));
        handleCancelEdit();
        toast.success('Entrada actualizada correctamente');
      } else {
        toast.error('Error al actualizar la entrada');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error de conexión al actualizar');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteEntry = async (index: number) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/clients/${clientId}/formulas/${index}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        const data = await res.json();
        setClient((prev: any) => ({
          ...prev,
          color_formulas: data.formulas
        }));
        if (editingIndex === index) {
          handleCancelEdit();
        }
        toast.success('Entrada eliminada del historial');
      } else {
        toast.error('Error al eliminar la entrada');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error de conexión al eliminar');
    }
  };

  const handleReparseHistory = async () => {
    if (!clientId) return;
    setIsReparsing(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/clients/${clientId}/reparse-history`, {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        setClient((prev: any) => ({ ...prev, color_formulas: data.formulas }));
        toast.success('Historial re-procesado y ordenado cronológicamente');
      } else {
        toast.error('Error al re-procesar el historial');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error al contactar con el servidor');
    } finally {
      setIsReparsing(false);
    }
  };

  const formulas: any[] = client?.color_formulas || [];
  const latestFormula = formulas.length > 0 ? formulas[0] : null;
  const pastFormulas = formulas.length > 1 ? formulas.slice(1) : [];

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="shrink-0 p-5 border-b border-stone-100 bg-stone-50/80">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-orange-100 text-orange-900 border border-orange-200/60">
                <Sparkles size={12} className="text-[#FF6B00]" />
                Historial Técnico & Visitas
              </span>
              {client?.gender && (
                <span className="text-[11px] text-stone-500 font-medium capitalize bg-stone-100 px-2 py-0.5 rounded-md border border-stone-200/60">
                  {client.gender}
                </span>
              )}
            </div>

            <h3 className="text-lg sm:text-xl font-serif font-bold text-stone-900 truncate">
              {client?.name || clientFallbackName || 'Ficha del Cliente'}
            </h3>

            <div className="text-xs text-stone-500 mt-1 flex flex-wrap items-center gap-3">
              {client?.phone && (
                <a 
                  href={`tel:${client.phone}`}
                  className="inline-flex items-center gap-1.5 text-stone-700 hover:text-[#FF6B00] font-semibold transition-colors"
                >
                  <Phone size={13} className="text-[#FF6B00]" />
                  {client.phone}
                </a>
              )}
              {client?.phone && (
                <a 
                  href={`https://wa.me/${client.phone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-semibold"
                >
                  <MessageCircle size={13} /> WhatsApp
                </a>
              )}
              {client?.address && (
                <span className="text-stone-400 truncate max-w-[200px]">
                  • {client.address}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {clientId && (
              <Link 
                href={`/dashboard/clients/${clientId}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF6B00] hover:text-[#e05e00] bg-orange-50 hover:bg-orange-100/80 border border-orange-200/60 px-3 py-1.5 rounded-xl transition-all shadow-2xs"
              >
                <span>Ficha completa</span>
                <ExternalLink size={13} />
              </Link>
            )}
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 flex items-center justify-center transition-colors cursor-pointer"
                title="Cerrar panel"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
        {loading ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-8 h-8 mx-auto border-2 border-stone-200 border-t-[#FF6B00] rounded-full animate-spin" />
            <p className="text-xs text-stone-500 font-medium">Cargando historial del cliente...</p>
          </div>
        ) : (
          <>
            {/* Card de Último Trabajo Realizado */}
            {latestFormula && (
              <div className="relative overflow-hidden rounded-2xl border-2 border-orange-300/60 bg-gradient-to-br from-orange-50/70 via-white to-orange-50/30 p-4 shadow-xs">
                <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-orange-100">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-orange-950">
                    <Sparkles size={13} className="text-[#FF6B00]" />
                    Último Trabajo Realizado
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-stone-600 bg-white px-2.5 py-0.5 rounded-full border border-orange-200/50 shadow-2xs">
                      <Calendar size={11} className="text-[#FF6B00]" />
                      {latestFormula.date}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleStartEdit(0, latestFormula)}
                      className="text-stone-400 hover:text-[#FF6B00] transition-colors p-1"
                      title="Editar este apunte"
                    >
                      <Pencil size={12} />
                    </button>
                  </div>
                </div>

                {editingIndex === 0 ? (
                  <div className="space-y-2 mt-2 pt-1 border-t border-orange-100">
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={editDate}
                        onChange={(e) => setEditDate(e.target.value)}
                        placeholder="DD/MM/YYYY"
                        className="text-xs border border-stone-300 rounded-lg px-2.5 py-1 w-28 font-bold text-stone-800 bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => editDatePickerRef.current?.showPicker?.()}
                        className="p-1.5 text-stone-500 hover:text-[#FF6B00] bg-white border border-stone-200 rounded-lg transition-colors cursor-pointer shadow-2xs"
                        title="Abrir calendario"
                      >
                        <Calendar size={13} />
                      </button>
                      <input
                        ref={editDatePickerRef}
                        type="date"
                        onChange={(e) => handleDateChangeFromCalendar(e, true)}
                        className="sr-only"
                        tabIndex={-1}
                      />
                      <button
                        type="button"
                        onClick={() => setEditDate(getTodayFormatted())}
                        className="px-2 py-1 text-[10px] font-bold text-[#FF6B00] bg-white border border-orange-200 rounded-lg transition-all cursor-pointer shadow-2xs"
                        title="Poner fecha de hoy"
                      >
                        HOY
                      </button>
                    </div>
                    <textarea
                      value={editFormula}
                      onChange={(e) => setEditFormula(e.target.value)}
                      rows={2}
                      className="w-full text-xs border border-stone-300 rounded-lg p-2 font-medium"
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleCancelEdit}
                        className="h-7 text-xs px-2"
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        disabled={savingEdit}
                        onClick={() => handleSaveEdit(0)}
                        className="h-7 text-xs px-3 bg-[#FF6B00] hover:bg-[#e05e00] text-white"
                      >
                        {savingEdit ? 'Guardando...' : 'Guardar'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm font-semibold text-stone-900 whitespace-pre-wrap leading-relaxed">
                      {latestFormula.formula}
                    </p>
                    {latestFormula.notes && (
                      <p className="text-xs text-stone-500 mt-2 pt-2 border-t border-orange-100/80 italic">
                        Nota: {latestFormula.notes}
                      </p>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Quick Treatment Chips */}
            {availableServices.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-stone-600">
                  <Tag size={13} className="text-[#FF6B00]" />
                  <span>Tratamientos Frecuentes (Clic para añadir)</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {availableServices.slice(0, 10).map((svc) => (
                    <button
                      key={svc.id}
                      type="button"
                      onClick={() => handleAddChip(svc.name)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-orange-50 hover:text-orange-950 hover:border-orange-200 border border-stone-200/80 text-stone-700 transition-all active:scale-95 cursor-pointer shadow-2xs"
                    >
                      <Plus size={11} className="text-[#FF6B00]" />
                      <span>{svc.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Formulario: Añadir Trabajo o Fórmulas de Hoy */}
            <form onSubmit={handleSaveFormula} className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Plus size={13} className="text-[#FF6B00]" />
                  Registrar Visita / Trabajo Realizado
                </span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    placeholder="DD/MM/YYYY"
                    className="w-28 text-xs font-bold text-stone-800 bg-white border border-stone-200 rounded-lg px-2 py-1 text-center focus:outline-none focus:border-[#FF6B00]"
                  />
                  <button
                    type="button"
                    onClick={() => newDatePickerRef.current?.showPicker?.()}
                    className="p-1.5 text-stone-500 hover:text-[#FF6B00] bg-white border border-stone-200 rounded-lg transition-colors cursor-pointer shadow-2xs"
                    title="Abrir calendario"
                  >
                    <Calendar size={13} />
                  </button>
                  <input
                    ref={newDatePickerRef}
                    type="date"
                    onChange={(e) => handleDateChangeFromCalendar(e, false)}
                    className="sr-only"
                    tabIndex={-1}
                  />
                  <button
                    type="button"
                    onClick={() => setNewDate(getTodayFormatted())}
                    className="px-2 py-1 text-[10px] font-bold text-[#FF6B00] bg-white border border-orange-200 rounded-lg transition-all cursor-pointer shadow-2xs"
                    title="Poner fecha de hoy"
                  >
                    HOY
                  </button>
                </div>
              </div>

              <div>
                <textarea
                  value={newFormula}
                  onChange={(e) => setNewFormula(e.target.value)}
                  rows={2}
                  placeholder="Ej: Corte medio + Tinte raíz 30gr 6.0 a 20vol + Mechas..."
                  className="w-full text-xs font-medium text-stone-900 bg-white border border-stone-200 rounded-xl p-2.5 focus:outline-none focus:border-[#FF6B00] placeholder:text-stone-400"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Observaciones adicionales (opcional, ej: tiempo de pose 35 min)..."
                  className="flex-1 text-xs text-stone-700 bg-white border border-stone-200 rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#FF6B00] placeholder:text-stone-400"
                />
                <Button
                  type="submit"
                  disabled={savingFormula || !newFormula.trim()}
                  className="bg-[#FF6B00] hover:bg-[#e05e00] text-white text-xs font-bold rounded-xl px-4 py-2 shrink-0 shadow-xs cursor-pointer"
                >
                  {savingFormula ? 'Guardando...' : 'Añadir al Historial'}
                </Button>
              </div>
            </form>

            {/* Timeline del Historial */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Historial de Visitas y Trabajos Realizados ({pastFormulas.length})
                </h4>
                {client?.raw_history && (
                  <button
                    type="button"
                    onClick={handleReparseHistory}
                    disabled={isReparsing}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#FF6B00] hover:underline cursor-pointer"
                    title="Volver a analizar el texto histórico exportado"
                  >
                    <RotateCw size={11} className={isReparsing ? 'animate-spin' : ''} />
                    Re-analizar
                  </button>
                )}
              </div>

              {pastFormulas.length === 0 && !latestFormula ? (
                <div className="py-8 text-center text-stone-400 text-xs bg-stone-50/50 rounded-2xl border border-dashed border-stone-200">
                  No hay visitas ni trabajos registrados aún para esta clienta.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {pastFormulas.map((f, idx) => {
                    const actualIdx = idx + 1;
                    const isEditingThis = editingIndex === actualIdx;

                    return (
                      <div 
                        key={idx}
                        className="p-3.5 bg-white border border-stone-200/80 rounded-2xl shadow-2xs hover:border-stone-300 transition-all space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-700 bg-stone-100 px-2.5 py-0.5 rounded-full border border-stone-200/60">
                            <Calendar size={11} className="text-stone-400" />
                            {f.date}
                          </span>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleStartEdit(actualIdx, f)}
                              className="text-stone-400 hover:text-[#FF6B00] p-1 transition-colors cursor-pointer"
                              title="Editar entrada"
                            >
                              <Pencil size={12} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteEntry(actualIdx)}
                              className="text-stone-400 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                              title="Eliminar entrada"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>

                        {isEditingThis ? (
                          <div className="space-y-2 pt-2 border-t border-stone-100">
                            <div className="flex items-center gap-1.5">
                              <input
                                type="text"
                                value={editDate}
                                onChange={(e) => setEditDate(e.target.value)}
                                placeholder="DD/MM/YYYY"
                                className="text-xs border border-stone-300 rounded-lg px-2.5 py-1 w-28 font-bold text-stone-800 bg-white"
                              />
                              <button
                                type="button"
                                onClick={() => editDatePickerRef.current?.showPicker?.()}
                                className="p-1.5 text-stone-500 hover:text-[#FF6B00] bg-white border border-stone-200 rounded-lg transition-colors cursor-pointer shadow-2xs"
                                title="Abrir calendario"
                              >
                                <Calendar size={13} />
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditDate(getTodayFormatted())}
                                className="px-2 py-1 text-[10px] font-bold text-[#FF6B00] bg-white border border-orange-200 rounded-lg transition-all cursor-pointer shadow-2xs"
                                title="Poner fecha de hoy"
                              >
                                HOY
                              </button>
                            </div>
                            <textarea
                              value={editFormula}
                              onChange={(e) => setEditFormula(e.target.value)}
                              rows={2}
                              className="w-full text-xs border border-stone-300 rounded-lg p-2 font-medium"
                            />
                            <input
                              type="text"
                              value={editNotes}
                              onChange={(e) => setEditNotes(e.target.value)}
                              placeholder="Observaciones..."
                              className="w-full text-xs border border-stone-300 rounded-lg px-2 py-1"
                            />
                            <div className="flex justify-end gap-2">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={handleCancelEdit}
                                className="h-7 text-xs px-2"
                              >
                                Cancelar
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                disabled={savingEdit}
                                onClick={() => handleSaveEdit(actualIdx)}
                                className="h-7 text-xs px-3 bg-[#FF6B00] hover:bg-[#e05e00] text-white"
                              >
                                {savingEdit ? 'Guardando...' : 'Guardar'}
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="text-xs font-semibold text-stone-800 whitespace-pre-wrap leading-relaxed">
                              {f.formula}
                            </p>
                            {f.notes && (
                              <p className="text-[11px] text-stone-500 italic">
                                Nota: {f.notes}
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Acordeón: Texto Histórico Exportado Original */}
            {client?.raw_history && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowRawHistory(!showRawHistory)}
                  className="flex items-center justify-between w-full text-xs font-bold text-stone-500 hover:text-stone-800 p-2.5 rounded-xl bg-stone-50 border border-stone-200/60 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <FileText size={13} className="text-stone-400" />
                    Texto Histórico en Bruto (Original Exportado)
                  </span>
                  {showRawHistory ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                {showRawHistory && (
                  <div className="mt-2 p-3 bg-stone-900 text-stone-200 rounded-xl text-xs font-mono leading-relaxed whitespace-pre-wrap max-h-40 overflow-y-auto">
                    {client.raw_history}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Unlock, Sparkles, Trash2, AlertTriangle, Phone, Save } from 'lucide-react';
import { toast } from 'sonner';
import { useFeedback } from '@/app/contexts/FeedbackContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CalendarModalsProps {
  // Control de visibilidad
  showModal: boolean;
  setShowModal: (v: boolean) => void;
  showEditModal: boolean;
  setShowEditModal: (v: boolean) => void;
  showBlockDeleteModal: boolean;
  setShowBlockDeleteModal: (v: boolean) => void;

  // Datos de selección
  selectedSlot: { date: Date, hour: number } | null;
  selectedMinutes: number;
  setSelectedMinutes: (m: number) => void;
  selectedAppt: any;
  setSelectedAppt: (appt: any) => void;
  selectedBlock: any;
  setSelectedBlock: (block: any) => void;

  // Datos globales y filtros
  clients: any[];
  services: any[];
  settings: any;
  startHour: number;
  endHour: number;
  getAppointmentsForDay: (d: Date) => any[];
  getBlocksForDay: (d: Date) => any[];
  clientMap: Map<string, any>;
  serviceMap: Map<string, any>;
  fetchData: () => Promise<void>;
  openWhatsApp: (name: string, phone: string, service: string, start: string) => void;
}

/**
 * CalendarModals (v2)
 * Orquestador de todos los diálogos de la agenda:
 * - Creación de Citas / Bloqueos
 * - Edición de Citas (Notas, Estados, WhatsApp)
 * - Liberación de Horarios bloqueados
 */
export function CalendarModals({
  showModal, setShowModal,
  showEditModal, setShowEditModal,
  showBlockDeleteModal, setShowBlockDeleteModal,
  selectedSlot,
  selectedMinutes, setSelectedMinutes,
  selectedAppt, setSelectedAppt,
  selectedBlock, setSelectedBlock,
  clients, services, settings,
  startHour, endHour,
  getAppointmentsForDay, getBlocksForDay,
  clientMap, serviceMap,
  fetchData,
  openWhatsApp
}: CalendarModalsProps) {
  const { showFeedback } = useFeedback();

  // Estados internos de formulario
  const [modalType, setModalType] = useState<'appointment' | 'block'>('appointment');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [appointmentNotes, setAppointmentNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const [editNotes, setEditNotes] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const [blockReason, setBlockReason] = useState('');
  const [blockDuration, setBlockDuration] = useState(60);

  // Sincronización de notas al editar
  useEffect(() => {
    if (selectedAppt) {
      setEditNotes(selectedAppt.notes || '');
    }
  }, [selectedAppt]);

  // Formateador local para API (ISO naive)
  const formatLocalISO = (date: Date) => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
  };

  /**
   * HANDLERS DE CREACIÓN
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId || !selectedServiceId || !selectedSlot) return;

    setSaving(true);
    const service = services.find(s => s.id === selectedServiceId);

    const start_time = new Date(selectedSlot.date);
    start_time.setHours(selectedSlot.hour, selectedMinutes, 0, 0);

    const end_time = new Date(start_time.getTime() + service.duration_minutes * 60000);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/appointments/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: selectedClientId,
          service_id: selectedServiceId,
          start_time: formatLocalISO(start_time),
          end_time: formatLocalISO(end_time),
          status: 'confirmed', // Cambiado de 'pending' para disparar notificaciones si el backend lo requiere
          notes: appointmentNotes
        })
      });

      if (res.ok) {
        await fetchData();
        setShowModal(false);
        setSelectedClientId('');
        setSelectedServiceId('');
        setAppointmentNotes('');
        toast.success('Cita agendada correctamente');
      } else {
        const err = await res.json();
        toast.error(`Error: ${err.detail || "No se pudo reservar"}`);
      }
    } catch (err) {
      toast.error('Error de conexión');
    } finally {
      setSaving(false);
    }
  };

  const handleBlockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) return;

    setSaving(true);
    const start_time = new Date(selectedSlot.date);
    if (blockDuration === -1) {
      start_time.setHours(9, 0, 0, 0);
    } else {
      start_time.setHours(selectedSlot.hour, selectedMinutes, 0, 0);
    }

    const durationMins = blockDuration === -1 ? 600 : blockDuration;
    const end_time = new Date(start_time.getTime() + durationMins * 60000);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/time-blocks/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          start_time: formatLocalISO(start_time),
          end_time: formatLocalISO(end_time),
          reason: blockReason
        })
      });
      if (res.ok) {
        await fetchData();
        setShowModal(false);
        setBlockReason('');
        toast.success('Horario bloqueado');
      } else {
        toast.error('Error al bloquear horario');
      }
    } catch (err) {
      toast.error('Error de conexión');
    } finally {
      setSaving(false);
    }
  };

  /**
   * HANDLERS DE EDICIÓN
   */
  const handleStatusChange = async (newStatus: string) => {
    if (!selectedAppt) return;
    setUpdatingStatus(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/appointments/${selectedAppt.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        await fetchData();
        setShowEditModal(false);
        toast.success('Estado actualizado');
      } else {
        toast.error('Error al actualizar');
      }
    } catch (e) {
      toast.error('Error de conexión');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleUpdateNotes = async () => {
    if (!selectedAppt) return;
    setUpdatingStatus(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/appointments/${selectedAppt.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: editNotes })
      });
      if (res.ok) {
        await fetchData();
        setSelectedAppt({ ...selectedAppt, notes: editNotes });
        toast.success('Nota guardada');
      } else {
        toast.error('Error al guardar nota');
      }
    } catch (e) {
      toast.error('Error de conexión');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDeleteAppointment = async () => {
    if (!selectedAppt) return;
    showFeedback({
      type: 'confirm',
      title: 'Eliminar Cita',
      message: '¿Estás seguro de que deseas eliminar esta cita? Esta acción no se puede deshacer.',
      onConfirm: async () => {
        setUpdatingStatus(true);
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/appointments/${selectedAppt.id}`, {
            method: 'DELETE'
          });
          if (res.ok) {
            await fetchData();
            setShowEditModal(false);
            toast.success('Cita eliminada');
          } else {
            toast.error('Error al eliminar');
          }
        } catch (e) {
          toast.error('Error de conexión');
        } finally {
          setUpdatingStatus(false);
        }
      }
    });
  };

  const handleDeleteBlock = async () => {
    if (!selectedBlock) return;
    setUpdatingStatus(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/time-blocks/${selectedBlock.id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        await fetchData();
        setShowBlockDeleteModal(false);
        toast.success('Horario liberado');
      } else {
        toast.error('Error al liberar');
      }
    } catch (err) {
      toast.error('Error de conexión');
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <>
      {/* 1. Modal de Creación (Cita o Bloqueo) */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="p-0 border-none w-[95vw] sm:max-w-lg lg:max-w-[35em] h-fit max-h-[100dvh] sm:max-h-[calc(100vh-2rem)] rounded-xl">
          <DialogHeader className="sticky top-0 z-30 shrink-0 p-8 border-b border-stone-100 bg-white/95 backdrop-blur-md">
            <div className="flex gap-4 mb-4 p-1 bg-stone-100 rounded-2xl w-fit">
              <button
                onClick={() => setModalType('appointment')}
                className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${modalType === 'appointment' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
              >
                Nueva Cita
              </button>
              <button
                onClick={() => setModalType('block')}
                className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${modalType === 'block' ? 'bg-stone-800 text-white shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
              >
                Bloqueo
              </button>
            </div>
            <DialogTitle className="text-2xl font-extrabold text-stone-800">
              {modalType === 'appointment' ? 'Asignar Cita' : 'Bloquear Horario'}
            </DialogTitle>
            <DialogDescription className="text-[#d9777f] font-bold flex items-center gap-2 mt-1">
              <Calendar size={16} strokeWidth={1.5} /> {selectedSlot && `${selectedSlot.date.toLocaleDateString('es-ES')} a las ${selectedSlot.hour.toString().padStart(2, '0')}:${selectedMinutes.toString().padStart(2, '0')} h`}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            {modalType === 'appointment' ? (
              <form id="appointment-form" onSubmit={handleSubmit} className="space-y-6">
                <div className="flex gap-2 mb-2 p-1 bg-stone-50 border border-stone-100 rounded-xl w-fit mx-auto sm:mx-0">
                  {(selectedSlot?.hour === startHour ? [30, 45] : [0, 15, 30, 45]).map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setSelectedMinutes(m)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedMinutes === m ? 'bg-stone-800 text-white shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
                    >
                      :{m.toString().padStart(2, '0')}
                    </button>
                  ))}
                </div>

                {(() => {
                  if (!selectedSlot) return null;
                  const start_time = new Date(selectedSlot.date);
                  start_time.setHours(selectedSlot.hour, selectedMinutes, 0, 0);
                  const closingTime = new Date(selectedSlot.date);
                  closingTime.setHours(endHour, settings?.close_time ? parseInt(settings.close_time.split(':')[1]) : 30, 0, 0);

                  let lunchStart = closingTime;
                  if (settings?.lunch_start) {
                    lunchStart = new Date(selectedSlot.date);
                    lunchStart.setHours(parseInt(settings.lunch_start.split(':')[0]), parseInt(settings.lunch_start.split(':')[1]), 0, 0);
                  }

                  const dayAppts = getAppointmentsForDay(selectedSlot.date);
                  const dayBlocks = getBlocksForDay(selectedSlot.date);

                  const futureEvents = [...dayAppts, ...dayBlocks]
                    .map(e => ({ ...e, start: new Date(e.start_time.endsWith('Z') ? e.start_time.slice(0, -1) : e.start_time) }))
                    .filter(e => e.start > start_time)
                    .sort((a, b) => a.start.getTime() - b.start.getTime());

                  let nextEventStart = futureEvents.length > 0 ? futureEvents[0].start : closingTime;
                  if (start_time < lunchStart && nextEventStart > lunchStart) nextEventStart = lunchStart;

                  const limitDate = nextEventStart < closingTime ? nextEventStart : closingTime;
                  const gapMinutes = Math.floor((limitDate.getTime() - start_time.getTime()) / 60000);

                  return (
                    <div className="mb-4">
                      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Hueco Disponible</p>
                      <p className="text-xs font-bold text-stone-600 flex items-center gap-1">
                        <Clock size={14} strokeWidth={1.5} /> {gapMinutes} minutos libres
                      </p>
                    </div>
                  );
                })()}

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">Cliente *</label>
                    <Select required value={selectedClientId} onValueChange={setSelectedClientId}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="-- Elige un cliente --" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients
                          .filter(c => c.email !== 'contado@clinica-mercedes.com')
                          .map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">Tratamiento *</label>
                    <Select value={selectedServiceId} onValueChange={setSelectedServiceId}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="-- Selecciona el servicio --" />
                      </SelectTrigger>
                      <SelectContent>
                        {(() => {
                          if (!selectedSlot) return null;
                          const start_time = new Date(selectedSlot.date);
                          start_time.setHours(selectedSlot.hour, selectedMinutes, 0, 0);
                          const closingTime = new Date(selectedSlot.date);
                          closingTime.setHours(endHour, 0, 0, 0);
                          const nextEvent = [...getAppointmentsForDay(selectedSlot.date), ...getBlocksForDay(selectedSlot.date)]
                            .map(e => ({ ...e, start: new Date(e.start_time.endsWith('Z') ? e.start_time.slice(0, -1) : e.start_time) }))
                            .filter(e => e.start > start_time)
                            .sort((a, b) => a.start.getTime() - b.start.getTime())[0];
                          const limitDate = nextEvent ? (nextEvent.start < closingTime ? nextEvent.start : closingTime) : closingTime;
                          const gapMinutes = Math.floor((limitDate.getTime() - start_time.getTime()) / 60000);
                          return services.map(s => (
                            <SelectItem key={s.id} value={s.id} disabled={s.duration_minutes > gapMinutes}>
                              {s.name} ({s.duration_minutes} min) {s.duration_minutes > gapMinutes ? '⚠️ EXCEDIDO' : ''}
                            </SelectItem>
                          ));
                        })()}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">Notas</label>
                    <textarea
                      value={appointmentNotes}
                      onChange={e => setAppointmentNotes(e.target.value)}
                      placeholder="Observaciones de la cita..."
                      className="w-full px-5 py-4 rounded-xl border border-stone-200 focus:ring-2 focus:ring-[#d9777f] outline-none bg-stone-50 min-h-[100px] resize-none text-sm"
                    />
                  </div>
                </div>
              </form>
            ) : (
              <form id="block-form" onSubmit={handleBlockSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-2">Motivo</label>
                  <input
                    type="text"
                    value={blockReason}
                    onChange={e => setBlockReason(e.target.value)}
                    placeholder="Ej: Descanso, Formación..."
                    className="w-full px-5 py-4 rounded-xl border border-stone-200 focus:ring-2 focus:ring-stone-800 outline-none bg-stone-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-2">Duración</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[30, 60, 120, 240, -1].map(mins => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => setBlockDuration(mins)}
                        className={`py-3 rounded-xl font-bold text-[10px] transition-all border-2 ${blockDuration === mins ? 'bg-stone-800 border-stone-800 text-white' : 'bg-white border-stone-100 text-stone-500 hover:border-stone-300'}`}
                      >
                        {mins === -1 ? 'Día Completo' : (mins >= 60 ? `${mins / 60}h` : `${mins}min`)}
                      </button>
                    ))}
                  </div>
                </div>
              </form>
            )}
          </div>

          <DialogFooter className="sticky bottom-0 left-0 w-full p-6 pt-12 bg-gradient-to-t from-white via-white/95 to-transparent flex flex-row gap-3 rounded-b-xl z-20 pointer-events-none">
            <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 rounded-xl font-bold text-stone-600 bg-white border border-stone-100 hover:bg-stone-50 shadow-sm transition-all pointer-events-auto">
              Cancelar
            </button>
            <button
              form={modalType === 'appointment' ? 'appointment-form' : 'block-form'}
              disabled={saving}
              type="submit"
              className={`flex-1 ${modalType === 'appointment' ? 'bg-stone-900 border-stone-900' : 'bg-stone-800 border-stone-800'} text-white px-6 py-4 rounded-xl font-bold transition-all disabled:opacity-50 active:scale-95 shadow-lg shadow-stone-900/10 border pointer-events-auto`}
            >
              {saving ? 'Guardando...' : (modalType === 'appointment' ? 'Agendar' : 'Bloquear')}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 2. Modal de Liberación de Bloqueo */}
      <Dialog open={showBlockDeleteModal} onOpenChange={setShowBlockDeleteModal}>
        <DialogContent className="flex flex-col w-[95vw] sm:max-w-[300px] lg:max-w-[22em] max-h-[85dvh] p-0 overflow-hidden bg-white border-none shadow-2xl rounded-xl">
          <div className="flex-1 overflow-y-auto p-8 text-center">
            <div className="w-16 h-16 bg-stone-100 text-stone-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <Unlock size={32} strokeWidth={1.5} />
            </div>
            <DialogHeader className="p-0">
              <DialogTitle className="text-xl font-extrabold text-stone-800 mb-2">Liberar Horario</DialogTitle>
              <DialogDescription className="text-stone-500 text-sm">
                ¿Deseas eliminar este bloqueo y permitir nuevas citas en este hueco?
              </DialogDescription>
            </DialogHeader>
          </div>
          <DialogFooter className="shrink-0 p-6 pt-2 flex flex-col gap-2 sm:flex-col border-t-0">
            <button
              onClick={handleDeleteBlock}
              disabled={updatingStatus}
              className="w-full bg-stone-900 text-white py-4 rounded-xl font-bold hover:bg-black transition-all active:scale-95"
            >
              {updatingStatus ? 'Liberando...' : 'Sí, Eliminar Bloqueo'}
            </button>
            <button
              onClick={() => setShowBlockDeleteModal(false)}
              className="w-full bg-stone-50 text-stone-500 py-3 rounded-xl font-bold hover:bg-stone-100 transition-all"
            >
              Cancelar
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 3. Modal de Edición de Cita */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="p-0 border-none w-[95vw] sm:max-w-[340px] lg:max-w-[35em] h-fit max-h-[100dvh] sm:max-h-[calc(100vh-2rem)] rounded-xl">
          <DialogHeader className="sticky top-0 z-30 shrink-0 p-8 border-b border-stone-100 bg-white/95 backdrop-blur-md">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em] mb-1">
                  {selectedAppt?.status === 'web_pending' ? 'Reserva Web' :
                    selectedAppt?.status === 'completed' ? 'Cita Realizada' :
                      selectedAppt?.status === 'cancelled' ? 'Cita Cancelada' :
                        'Cita Confirmada'}
                </p>
                <DialogTitle className="text-2xl font-serif italic font-black text-stone-800">
                  {selectedAppt ? clientMap.get(selectedAppt.client_id)?.name : 'Detalle Cita'}
                </DialogTitle>
                {selectedAppt && (
                  <DialogDescription className="text-[#d9777f] font-bold flex items-center gap-2 mt-2 text-xs">
                    <Calendar size={14} strokeWidth={1.5} />
                    {new Date(selectedAppt.start_time.endsWith('Z') ? selectedAppt.start_time.slice(0, -1) : selectedAppt.start_time).toLocaleDateString('es-ES', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      hour: '2-digit',
                      minute: '2-digit'
                    })} h
                  </DialogDescription>
                )}
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
            <div>
              <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Tratamiento</p>
              <div className="flex items-center gap-3 p-4 bg-[#fdf2f3] rounded-2xl border border-[#f3c7cb] relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/40 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                <Sparkles size={20} strokeWidth={1.5} className="text-[#d9777f] relative z-10" />
                <p className="text-lg font-bold text-stone-800 relative z-10">
                  {selectedAppt ? serviceMap.get(selectedAppt.service_id)?.name : '...'}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">Notas del Tratamiento</label>
              <textarea
                value={editNotes}
                onChange={e => setEditNotes(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl border border-stone-100 focus:ring-2 focus:ring-[#d9777f] outline-none bg-stone-50 min-h-[100px] resize-none text-sm placeholder:italic shadow-inner"
                placeholder="Añadir notas del tratamiento..."
              />
              {selectedAppt && editNotes !== (selectedAppt.notes || '') && (
                <button
                  onClick={() => handleUpdateNotes()}
                  disabled={updatingStatus}
                  className="mt-3 w-full bg-stone-800 text-white text-xs font-bold uppercase py-3 rounded-xl hover:bg-stone-900 transition-all flex items-center justify-center gap-2"
                >
                  <Save size={14} /> Guardar Cambios en Nota
                </button>
              )}
            </div>

            {selectedAppt?.status === 'web_pending' && (
              <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl">
                <p className="text-[10px] text-orange-600 font-bold uppercase tracking-widest mb-3 flex items-center gap-1">
                  <AlertTriangle size={12} /> Reserva pendiente de confirmar
                </p>
                <button
                  onClick={() => handleStatusChange('confirmed')}
                  disabled={updatingStatus}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  Confirmar Ahora
                </button>
              </div>
            )}

            <div className="space-y-4">
              <p className="text-xs font-bold text-stone-400 uppercase tracking-widest border-b border-stone-100 pb-2">Acciones Rápidas</p>

              <button
                onClick={() => {
                  if (selectedAppt) {
                    const client = clientMap.get(selectedAppt.client_id);
                    const service = serviceMap.get(selectedAppt.service_id);
                    if (client && service) openWhatsApp(client.name, client.phone, service.name, selectedAppt.start_time);
                  }
                }}
                className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-4 rounded-2xl shadow-lg shadow-green-100 transition-all active:scale-95 flex items-center justify-center gap-2 outline-none"
              >
                <Phone size={18} strokeWidth={1.5} /> WhatsApp Cliente
              </button>

              <div className="space-y-3 pt-4">
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em] mb-1">Cambiar Estado</p>
                <Select
                  value={selectedAppt?.status}
                  onValueChange={(val) => handleStatusChange(val)}
                  disabled={updatingStatus}
                >
                  <SelectTrigger className={`w-full h-14 rounded-2xl font-bold border-2 transition-all
                    ${selectedAppt?.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-400' :
                      selectedAppt?.status === 'cancelled' ? 'bg-rose-50 text-rose-700 border-rose-500 shadow-sm shadow-rose-100' :
                        selectedAppt?.status === 'no_show' ? 'bg-stone-100 text-stone-600 border-stone-400' :
                          selectedAppt?.status === 'web_pending' ? 'bg-orange-50 text-orange-700 border-orange-400' :
                            selectedAppt?.status === 'confirmed' ? 'bg-[#fdf2f3] text-[#d9777f] border-[#d9777f] shadow-sm shadow-rose-100' :
                              'bg-stone-50 text-stone-600 border-transparent'}
                  `}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-none shadow-2xl">
                    <SelectItem value="pending" className="font-medium p-3">⏳ Pendiente</SelectItem>
                    <SelectItem value="confirmed" className="font-bold text-[#d9777f] p-3">✨ Confirmada</SelectItem>
                    <SelectItem value="completed" className="font-bold text-emerald-600 p-3">✅ Realizada</SelectItem>
                    <SelectItem value="no_show" className="font-medium p-3">No Asistió</SelectItem>
                    <SelectItem value="cancelled" className="font-bold text-rose-600 p-3">❌ Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter className="sticky bottom-0 left-0 w-full p-6 pt-12 flex justify-center bg-gradient-to-t from-white via-white/95 to-transparent rounded-b-xl z-20 pointer-events-none">
            <button
              onClick={handleDeleteAppointment}
              disabled={updatingStatus}
              className="text-[10px] font-black text-stone-300 hover:text-rose-500 uppercase tracking-[0.2em] transition-all flex items-center gap-2 group p-2 mx-auto pointer-events-auto"
            >
              <Trash2 size={14} strokeWidth={2} className="group-hover:scale-110 transition-transform" />
              Eliminar Permanentemente
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

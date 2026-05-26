import React, { useState } from 'react';
import { Calendar, Clock, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/app/contexts/LanguageContext';
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

interface CreateAppointmentModalProps {
  showModal: boolean;
  setShowModal: (v: boolean) => void;
  selectedSlot: { date: Date, hour: number } | null;
  selectedMinutes: number;
  setSelectedMinutes: (m: number) => void;
  clients: any[];
  services: any[];
  settings: any;
  startHour: number;
  endHour: number;
  getAppointmentsForDay: (d: Date) => any[];
  getBlocksForDay: (d: Date) => any[];
  fetchData: () => Promise<void>;
}

/**
 * CreateAppointmentModal
 * Componente modular para la creación de citas y bloqueos de horario.
 */
export function CreateAppointmentModal({
  showModal,
  setShowModal,
  selectedSlot,
  selectedMinutes,
  setSelectedMinutes,
  clients,
  services,
  settings,
  startHour,
  endHour,
  getAppointmentsForDay,
  getBlocksForDay,
  fetchData
}: CreateAppointmentModalProps) {
  const { t, language } = useLanguage();

  // Estados internos del formulario
  const [modalType, setModalType] = useState<'appointment' | 'block'>('appointment');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [appointmentNotes, setAppointmentNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [blockReason, setBlockReason] = useState('');
  const [blockDuration, setBlockDuration] = useState(60);

  // Formateador local para API (ISO naive)
  const formatLocalISO = (date: Date) => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
  };

  const getLocaleString = () => {
    return language === 'es' ? 'es-ES' : language === 'en' ? 'en-US' : 'fr-FR';
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
          status: 'confirmed',
          notes: appointmentNotes
        })
      });

      if (res.ok) {
        await fetchData();
        setShowModal(false);
        setSelectedClientId('');
        setSelectedServiceId('');
        setAppointmentNotes('');
        toast.success(t('dashboard.calendar.toast.appt_scheduled') || 'Cita agendada correctamente');
      } else {
        const err = await res.json();
        toast.error(`Error: ${err.detail || "No se pudo reservar"}`);
      }
    } catch (err) {
      toast.error(t('dashboard.calendar.toast.connection_error') || 'Error de conexión');
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
        toast.success(t('dashboard.calendar.toast.slot_blocked') || 'Horario bloqueado');
      } else {
        toast.error(t('dashboard.calendar.toast.block_error') || 'Error al bloquear horario');
      }
    } catch (err) {
      toast.error(t('dashboard.calendar.toast.connection_error') || 'Error de conexión');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <DialogContent className="p-0 border-none w-[95vw] sm:max-w-lg lg:max-w-[35em] h-fit max-h-[100dvh] sm:max-h-[calc(100vh-2rem)] rounded-xl">
        <DialogHeader className="sticky top-0 z-30 shrink-0 p-8 border-b border-stone-100 bg-white/95 backdrop-blur-md">
          <div className="flex gap-4 mb-4 p-1 bg-stone-100 rounded-2xl w-fit">
            <button
              onClick={() => setModalType('appointment')}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${modalType === 'appointment' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
            >
              {t('dashboard.calendar.new_appointment') || 'Nueva Cita'}
            </button>
            <button
              onClick={() => setModalType('block')}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${modalType === 'block' ? 'bg-stone-800 text-white shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
            >
              {t('dashboard.calendar.modal.block') || 'Bloqueo'}
            </button>
          </div>
          <DialogTitle className="text-2xl font-extrabold text-stone-800">
            {modalType === 'appointment' ? (t('dashboard.calendar.modal.assign_appt') || 'Asignar Cita') : (t('dashboard.calendar.modal.block_slot') || 'Bloquear Horario')}
          </DialogTitle>
          <DialogDescription className="text-primary font-bold flex items-center gap-2 mt-1">
            <Calendar size={16} strokeWidth={1.5} />
            {selectedSlot && (
              language === 'es' ? `${selectedSlot.date.toLocaleDateString('es-ES')} a las ${selectedSlot.hour.toString().padStart(2, '0')}:${selectedMinutes.toString().padStart(2, '0')} h` :
              language === 'en' ? `${selectedSlot.date.toLocaleDateString('en-US')} at ${selectedSlot.hour.toString().padStart(2, '0')}:${selectedMinutes.toString().padStart(2, '0')}` :
              `${selectedSlot.date.toLocaleDateString('fr-FR')} à ${selectedSlot.hour.toString().padStart(2, '0')}:${selectedMinutes.toString().padStart(2, '0')}`
            )}
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
                const s_time = new Date(selectedSlot.date);
                s_time.setHours(selectedSlot.hour, selectedMinutes, 0, 0);
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
                  .filter(e => e.start > s_time)
                  .sort((a, b) => a.start.getTime() - b.start.getTime());

                let nextEventStart = futureEvents.length > 0 ? futureEvents[0].start : closingTime;
                if (s_time < lunchStart && nextEventStart > lunchStart) nextEventStart = lunchStart;

                const limitDate = nextEventStart < closingTime ? nextEventStart : closingTime;
                const gapMinutes = Math.floor((limitDate.getTime() - s_time.getTime()) / 60000);

                return (
                  <div className="mb-4">
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">{t('dashboard.calendar.modal.available_slot') || 'Hueco Disponible'}</p>
                    <p className="text-xs font-bold text-stone-600 flex items-center gap-1">
                      <Clock size={14} strokeWidth={1.5} /> {gapMinutes} {t('dashboard.calendar.modal.free_minutes') || 'minutos libres'}
                    </p>
                  </div>
                );
              })()}

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-2">{t('dashboard.calendar.modal.client_req') || 'Cliente *'}</label>
                  <Select required value={selectedClientId} onValueChange={setSelectedClientId}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t('dashboard.calendar.modal.choose_client') || '-- Elige un cliente --'} />
                    </SelectTrigger>
                    <SelectContent>
                      {(() => {
                        const filteredClients = clients.filter(c => c.email !== 'contado@clinica-mercedes.com');
                        if (filteredClients.length === 0) {
                          return (
                            <SelectItem value="none" disabled className="text-stone-400 font-bold py-3 text-center">
                              {t('dashboard.calendar.modal.no_clients') || 'No hay clientes registrados'}
                            </SelectItem>
                          );
                        }
                        return filteredClients.map(c => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ));
                      })()}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-2">{t('dashboard.calendar.modal.treatment_req') || 'Tratamiento *'}</label>
                  <Select value={selectedServiceId} onValueChange={setSelectedServiceId}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t('dashboard.calendar.modal.select_service') || '-- Selecciona el servicio --'} />
                    </SelectTrigger>
                    <SelectContent>
                      {(() => {
                        if (!selectedSlot) return null;
                        const s_time = new Date(selectedSlot.date);
                        s_time.setHours(selectedSlot.hour, selectedMinutes, 0, 0);
                        const clTime = new Date(selectedSlot.date);
                        clTime.setHours(endHour, 0, 0, 0);
                        const nextEvent = [...getAppointmentsForDay(selectedSlot.date), ...getBlocksForDay(selectedSlot.date)]
                          .map(e => ({ ...e, start: new Date(e.start_time.endsWith('Z') ? e.start_time.slice(0, -1) : e.start_time) }))
                          .filter(e => e.start > s_time)
                          .sort((a, b) => a.start.getTime() - b.start.getTime())[0];
                        const limitDate = nextEvent ? (nextEvent.start < clTime ? nextEvent.start : clTime) : clTime;
                        const gapMinutes = Math.floor((limitDate.getTime() - s_time.getTime()) / 60000);
                        return services.map(s => (
                          <SelectItem key={s.id} value={s.id} disabled={s.duration_minutes > gapMinutes}>
                            {s.name} ({s.duration_minutes} min) {s.duration_minutes > gapMinutes ? `⚠️ ${t('dashboard.calendar.modal.exceeded') || 'EXCEDIDO'}` : ''}
                          </SelectItem>
                        ));
                      })()}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-2">{t('dashboard.calendar.notes') || 'Notas'}</label>
                  <textarea
                    value={appointmentNotes}
                    onChange={e => setAppointmentNotes(e.target.value)}
                    placeholder={t('dashboard.calendar.modal.appt_obs') || 'Observaciones de la cita...'}
                    className="w-full px-5 py-4 rounded-xl border border-stone-200 focus:ring-2 focus:ring-primary outline-none bg-stone-50 min-h-[100px] resize-none text-sm"
                  />
                </div>
              </div>
            </form>
          ) : (
            <form id="block-form" onSubmit={handleBlockSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-2">{t('dashboard.calendar.modal.reason') || 'Motivo'}</label>
                <input
                  type="text"
                  value={blockReason}
                  onChange={e => setBlockReason(e.target.value)}
                  placeholder={t('dashboard.calendar.modal.reason_placeholder') || 'Ej: Descanso, Formación...'}
                  className="w-full px-5 py-4 rounded-xl border border-stone-200 focus:ring-2 focus:ring-stone-800 outline-none bg-stone-50"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-2">{t('dashboard.calendar.modal.duration') || 'Duración'}</label>
                <div className="grid grid-cols-3 gap-2">
                  {[30, 60, 120, 240, -1].map(mins => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setBlockDuration(mins)}
                      className={`py-3 rounded-xl font-bold text-[10px] transition-all border-2 ${blockDuration === mins ? 'bg-stone-800 border-stone-800 text-white' : 'bg-white border-stone-100 text-stone-500 hover:border-stone-300'}`}
                    >
                      {mins === -1 ? (t('dashboard.calendar.modal.full_day') || 'Día Completo') : (mins >= 60 ? `${mins / 60}h` : `${mins}min`)}
                    </button>
                  ))}
                </div>
              </div>
            </form>
          )}
        </div>

        <DialogFooter className="sticky bottom-0 left-0 w-full p-6 pt-12 bg-gradient-to-t from-white via-white/95 to-transparent flex flex-row gap-3 rounded-b-xl z-20 pointer-events-none">
          <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 rounded-xl font-bold text-stone-600 bg-white border border-stone-100 hover:bg-stone-50 shadow-sm transition-all pointer-events-auto">
            {t('dashboard.calendar.modal.cancel') || 'Cancelar'}
          </button>
          <button
            form={modalType === 'appointment' ? 'appointment-form' : 'block-form'}
            disabled={saving}
            type="submit"
            className={`flex-1 ${modalType === 'appointment' ? 'bg-stone-900 border-stone-900' : 'bg-stone-800 border-stone-800'} text-white px-6 py-4 rounded-xl font-bold transition-all disabled:opacity-50 active:scale-95 shadow-lg shadow-stone-900/10 border pointer-events-auto`}
          >
            {saving ? (t('dashboard.calendar.modal.saving') || 'Guardando...') : (modalType === 'appointment' ? (t('dashboard.calendar.modal.schedule') || 'Agendar') : (t('dashboard.calendar.modal.block_btn') || 'Bloquear'))}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

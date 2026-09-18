import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Sparkles, Trash2, AlertTriangle, Save, MessageCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/app/contexts/LanguageContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EditAppointmentModalProps {
  showEditModal: boolean;
  setShowEditModal: (v: boolean) => void;
  selectedAppt: any;
  setSelectedAppt: (appt: any) => void;
  clientMap: Map<string, any>;
  serviceMap: Map<string, any>;
  settings?: any;
  endHour?: number;
  getAppointmentsForDay?: (d: Date) => any[];
  getBlocksForDay?: (d: Date) => any[];
  editNotes: string;
  setEditNotes: (v: string) => void;
  updatingStatus: boolean;
  handleStatusChange: (newStatus: string) => Promise<void>;
  handleUpdateNotes: () => Promise<void>;
  handleUpdateDuration: (newDuration: number) => Promise<void>;
  handleDeleteAppointment: () => Promise<void>;
  openWhatsApp: (name: string, phone: string, service: string, start: string) => void;
}

/**
 * EditAppointmentModal
 * Componente modular para la visualización y edición premium de citas.
 */
export function EditAppointmentModal({
  showEditModal,
  setShowEditModal,
  selectedAppt,
  setSelectedAppt,
  clientMap,
  serviceMap,
  settings,
  endHour = 20,
  getAppointmentsForDay,
  getBlocksForDay,
  editNotes,
  setEditNotes,
  updatingStatus,
  handleStatusChange,
  handleUpdateNotes,
  handleUpdateDuration,
  handleDeleteAppointment,
  openWhatsApp,
}: EditAppointmentModalProps) {
  const { t, language } = useLanguage();

  const currentApptDuration = useMemo(() => {
    if (!selectedAppt?.start_time || !selectedAppt?.end_time) return 30;
    const s = new Date(selectedAppt.start_time.endsWith('Z') ? selectedAppt.start_time.slice(0, -1) : selectedAppt.start_time).getTime();
    const e = new Date(selectedAppt.end_time.endsWith('Z') ? selectedAppt.end_time.slice(0, -1) : selectedAppt.end_time).getTime();
    const diff = Math.round((e - s) / 60000);
    return diff > 0 ? diff : 30;
  }, [selectedAppt]);

  const [duration, setDuration] = useState<number>(30);

  useEffect(() => {
    setDuration(currentApptDuration);
  }, [currentApptDuration]);

  // Cálculo del hueco libre máximo disponible desde el inicio de la cita sin invadir descansos, cierres u otras citas
  const availableGapMinutes = useMemo(() => {
    if (!selectedAppt?.start_time) return 480;
    const tS = selectedAppt.start_time.endsWith('Z') ? selectedAppt.start_time.slice(0, -1) : selectedAppt.start_time;
    const s_time = new Date(tS);
    const apptDate = new Date(s_time.getFullYear(), s_time.getMonth(), s_time.getDate());

    const closingH = endHour || 20;
    const closingM = settings?.close_time ? parseInt(settings.close_time.split(':')[1]) : 0;
    const closingTime = new Date(apptDate);
    closingTime.setHours(closingH, closingM, 0, 0);

    let lunchStart = closingTime;
    if (settings?.lunch_start) {
      lunchStart = new Date(apptDate);
      const [lH, lM] = settings.lunch_start.split(':').map(Number);
      lunchStart.setHours(lH, lM, 0, 0);
    }

    const dayAppts = (getAppointmentsForDay ? getAppointmentsForDay(apptDate) : []) || [];
    const dayBlocks = (getBlocksForDay ? getBlocksForDay(apptDate) : []) || [];

    const futureEvents = [...dayAppts, ...dayBlocks]
      .filter(e => e.id !== selectedAppt.id && e.status !== 'cancelled')
      .map(e => ({ ...e, start: new Date(e.start_time.endsWith('Z') ? e.start_time.slice(0, -1) : e.start_time) }))
      .filter(e => e.start > s_time)
      .sort((a, b) => a.start.getTime() - b.start.getTime());

    let nextLimit = futureEvents.length > 0 ? futureEvents[0].start : closingTime;
    if (s_time < lunchStart && nextLimit > lunchStart) {
      nextLimit = lunchStart;
    }

    const effectiveLimit = nextLimit < closingTime ? nextLimit : closingTime;
    const diffMins = Math.floor((effectiveLimit.getTime() - s_time.getTime()) / 60000);
    return Math.max(0, diffMins);
  }, [selectedAppt, endHour, settings, getAppointmentsForDay, getBlocksForDay]);

  const getLocaleString = () => {
    return language === 'es' ? 'es-ES' : language === 'en' ? 'en-US' : 'fr-FR';
  };

  return (
    <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
      <DialogContent className="p-0 border-none w-[95vw] sm:max-w-[340px] lg:max-w-[35em] h-fit max-h-[100dvh] sm:max-h-[calc(100vh-2rem)] rounded-xl">
        <DialogHeader className="sticky top-0 z-30 shrink-0 p-8 border-b border-stone-100 bg-white/95 backdrop-blur-md">
          <div className="flex flex-col gap-2">
            {selectedAppt && (() => {
              const status = (selectedAppt.status || 'pending').toLowerCase().trim();
              let label = t('dashboard.calendar.pending') || 'Pendiente';
              let colorClasses = 'bg-[#fffbeb] text-[#92400e] border-[#fef3c7]';

              if (status === 'completed') {
                label = t('dashboard.calendar.completed') || 'Realizada';
                colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
              } else if (status === 'cancelled') {
                label = t('dashboard.calendar.cancelled') || 'Cancelada';
                colorClasses = 'bg-[#fef2f2] text-[#991b1b] border-[#fee2e2]';
              } else if (status === 'web_pending') {
                label = t('dashboard.calendar.modal.web_reservation') || 'Reserva Web';
                colorClasses = 'bg-orange-50 text-orange-600 border-orange-200';
              } else if (status === 'awaiting_payment') {
                label = t('dashboard.calendar.modal.pending_payment') || 'Pago Pendiente';
                colorClasses = 'bg-amber-50 text-amber-600 border-amber-200';
              } else if (status === 'pending_verification') {
                label = t('dashboard.calendar.modal.pending_web') || 'Pendiente (Web)';
                colorClasses = 'bg-[#fffbeb] text-[#92400e] border-[#fef3c7]';
              } else if (status === 'pending') {
                label = t('dashboard.calendar.modal.pending_manual') || 'Pendiente (Manual)';
                colorClasses = 'bg-[#fffbeb] text-[#92400e] border-[#fef3c7]';
              } else if (status === 'confirmed') {
                label = t('dashboard.calendar.confirmed') || 'Confirmada';
                colorClasses = 'bg-[#f0f9f4] text-[#2d6a4f] border-[#d8f3dc]';
              } else if (status === 'no_show') {
                label = t('dashboard.calendar.no_show') || 'No Asistió';
                colorClasses = 'bg-stone-50 text-stone-600 border-stone-200';
              }

              return (
                <span className={`px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider border w-fit ${colorClasses}`}>
                  {label}
                </span>
              );
            })()}
            <DialogTitle className="text-2xl md:text-3xl font-serif italic font-black text-stone-800 leading-tight">
              {selectedAppt ? clientMap.get(selectedAppt.client_id)?.name : (t('dashboard.calendar.modal.appt_detail') || 'Detalle Cita')}
            </DialogTitle>
            {selectedAppt && (
              <DialogDescription className="text-primary font-bold flex items-center gap-2 text-sm">
                <Calendar size={14} strokeWidth={2.5} />
                {new Date(selectedAppt.start_time.endsWith('Z') ? selectedAppt.start_time.slice(0, -1) : selectedAppt.start_time).toLocaleDateString(getLocaleString(), {
                  day: 'numeric',
                  month: 'long',
                  hour: '2-digit',
                  minute: '2-digit'
                })} h
              </DialogDescription>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{t('dashboard.calendar.service') || 'Tratamiento'}</p>
            </div>
            <div className="flex items-center gap-2 py-1.5 border-b border-stone-100">
              <Sparkles size={16} strokeWidth={2} className="text-primary" />
              <p className="text-base font-bold text-stone-700">
                {selectedAppt ? serviceMap.get(selectedAppt.service_id)?.name : '...'}
              </p>
            </div>
          </div>

          {/* Duración de la Sesión */}
          <div className="space-y-3 p-4 bg-stone-50/80 border border-stone-200/70 rounded-2xl">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                <Clock size={14} className="text-stone-500" />
                {(() => {
                  const d = t('dashboard.calendar.modal.duration');
                  return d && !d.includes('.') ? d : 'Duración de la Cita';
                })()}
              </label>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${duration === currentApptDuration ? 'bg-stone-200/60 text-stone-600' : 'bg-amber-100 text-amber-800 font-black'}`}>
                {duration === currentApptDuration ? `${currentApptDuration} min` : `${duration} min (Modificado)`}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex flex-wrap gap-1.5 flex-1">
                {[15, 30, 45, 60, 90, 120].map(mins => {
                  const isExceeded = availableGapMinutes > 0 && mins > availableGapMinutes;
                  return (
                    <button
                      key={mins}
                      type="button"
                      id={`edit-appt-duration-${mins}-btn`}
                      onClick={() => setDuration(mins)}
                      disabled={isExceeded || updatingStatus}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                        isExceeded ? 'opacity-30 cursor-not-allowed bg-stone-100 text-stone-400 border-stone-100' :
                        duration === mins ? 'bg-stone-800 text-white border-stone-800 shadow-sm' :
                        'bg-white text-stone-600 border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      {mins}m
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-1 w-28 shrink-0 bg-white border border-stone-200 rounded-xl px-2.5 py-1.5 shadow-xs">
                <input
                  type="number"
                  min="5"
                  max={availableGapMinutes > 0 ? availableGapMinutes : 480}
                  step="5"
                  id="edit-appt-custom-duration-input"
                  value={duration || ''}
                  disabled={updatingStatus}
                  onChange={e => setDuration(Math.max(5, parseInt(e.target.value) || 0))}
                  className="w-full text-xs font-bold text-stone-800 outline-none text-right disabled:opacity-50"
                />
                <span className="text-[11px] font-bold text-stone-400">min</span>
              </div>
            </div>

            {duration !== currentApptDuration && (
              <button
                id="edit-appt-save-duration-btn"
                onClick={() => {
                  if (availableGapMinutes > 0 && duration > availableGapMinutes) {
                    toast.error(`La duración no puede superar los ${availableGapMinutes} min disponibles (evita invadir descansos o citas).`);
                    return;
                  }
                  handleUpdateDuration(duration);
                }}
                disabled={updatingStatus}
                className="w-full bg-stone-800 hover:bg-stone-900 text-white text-[10px] font-bold uppercase py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 active:scale-95 shadow-xs"
              >
                <Save size={12} /> {(() => {
                  const s = t('dashboard.calendar.modal.save_duration');
                  return s && !s.includes('.') ? s : 'Guardar Duración';
                })()} ({duration} min)
              </button>
            )}
          </div>

          <div>
            <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">{t('dashboard.calendar.modal.treatment_notes') || 'Notas del Tratamiento'}</label>
            <textarea
              id="edit-appt-notes-textarea"
              value={editNotes}
              onChange={e => setEditNotes(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-stone-100 focus:ring-2 focus:ring-primary/20 outline-none bg-stone-50 min-h-[42px] h-auto resize-none text-[13px] placeholder:italic shadow-inner overflow-hidden"
              placeholder={t('dashboard.calendar.modal.add_notes') || 'Añadir nota...'}
            />
            {selectedAppt && editNotes !== (selectedAppt.notes || '') && (
              <button
                id="edit-appt-save-notes-btn"
                onClick={() => handleUpdateNotes()}
                disabled={updatingStatus}
                className="mt-2 w-full bg-stone-800 text-white text-[10px] font-bold uppercase py-2.5 rounded-lg hover:bg-stone-900 transition-all flex items-center justify-center gap-2"
              >
                <Save size={12} /> {t('dashboard.calendar.modal.save_notes') || 'Guardar Notas'}
              </button>
            )}
          </div>

          {selectedAppt?.status === 'web_pending' && (
            <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl">
              <p className="text-[10px] text-orange-600 font-bold uppercase tracking-widest mb-3 flex items-center gap-1">
                <AlertTriangle size={12} /> {t('dashboard.calendar.modal.web_pending_res') || 'Reserva pendiente'}
              </p>
              <button
                id="edit-appt-confirm-web-booking-btn"
                onClick={() => handleStatusChange('confirmed')}
                disabled={updatingStatus}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold py-3 rounded-xl transition-all active:scale-95"
              >
                {t('dashboard.calendar.modal.confirm_now') || 'Confirmar Ahora'}
              </button>
            </div>
          )}

          <div className="space-y-3 pb-4">
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest border-b border-stone-100 pb-1.5">{t('dashboard.calendar.modal.quick_actions') || 'Acciones Rápidas'}</p>

            <div className="flex items-center gap-3">
              <button
                id="edit-appt-whatsapp-btn"
                onClick={() => {
                  if (selectedAppt) {
                    const client = clientMap.get(selectedAppt.client_id);
                    const service = serviceMap.get(selectedAppt.service_id);
                    if (client && service) openWhatsApp(client.name, client.phone, service.name, selectedAppt.start_time);
                  }
                }}
                className="w-12 h-12 shrink-0 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-xl shadow-lg shadow-green-100 transition-all active:scale-95 flex items-center justify-center outline-none"
                title={t('dashboard.calendar.modal.whatsapp_title') || 'Contactar por WhatsApp'}
              >
                <MessageCircle size={20} strokeWidth={2} />
              </button>

              <div className="flex-1">
                <Select
                  value={(selectedAppt?.status || 'pending').toLowerCase().trim()}
                  onValueChange={(val) => handleStatusChange(val)}
                  disabled={updatingStatus}
                >
                  {(() => {
                    const status = (selectedAppt?.status || 'pending').toLowerCase().trim();
                    let colorClasses = 'bg-[#fffbeb] text-[#92400e] border-[#fef3c7]';

                    if (status === 'completed') colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-300';
                    else if (status === 'cancelled') colorClasses = 'bg-[#fef2f2] text-[#991b1b] border-[#fee2e2]';
                    else if (status === 'web_pending') colorClasses = 'bg-orange-50 text-orange-700 border-orange-300';
                    else if (status === 'confirmed') colorClasses = 'bg-[#f0f9f4] text-[#2d6a4f] border-[#d8f3dc]';
                    else if (status === 'awaiting_payment') colorClasses = 'bg-amber-50 text-amber-700 border-amber-300';
                    else if (status === 'no_show') colorClasses = 'bg-stone-50 text-stone-600 border-stone-200';

                    return (
                      <SelectTrigger id="edit-appt-status-select-trigger" className={`w-full h-12 rounded-xl font-bold border transition-all text-[11px] ${colorClasses}`}>
                        <SelectValue placeholder={t('dashboard.calendar.modal.select_status') || 'Seleccionar estado...'} />
                      </SelectTrigger>
                    );
                  })()}
                  <SelectContent className="rounded-xl border-none shadow-2xl">
                    <SelectItem value="pending">⏳ {t('dashboard.calendar.modal.pending_manual') || 'Pendiente (Manual)'}</SelectItem>
                    <SelectItem value="pending_verification">🌐 {t('dashboard.calendar.modal.pending_web') || 'Pendiente (Web)'}</SelectItem>
                    <SelectItem value="web_pending">🌐 {t('dashboard.calendar.modal.web_reservation') || 'Reserva Web'}</SelectItem>
                    <SelectItem value="awaiting_payment">💳 {t('dashboard.calendar.modal.pending_payment') || 'Esperando Pago'}</SelectItem>
                    <SelectItem value="confirmed" className="font-bold text-[#2d6a4f]">✨ {t('dashboard.calendar.confirmed') || 'Confirmada'}</SelectItem>
                    <SelectItem value="completed" className="font-bold text-emerald-600">✅ {t('dashboard.calendar.completed') || 'Realizada'}</SelectItem>
                    <SelectItem value="no_show">{t('dashboard.calendar.no_show') || 'No Asistió'}</SelectItem>
                    <SelectItem value="cancelled" className="font-bold text-[#991b1b]">❌ {t('dashboard.calendar.cancelled') || 'Cancelada'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <button
                id="edit-appt-delete-btn"
                onClick={handleDeleteAppointment}
                disabled={updatingStatus}
                className="w-12 h-12 shrink-0 bg-stone-50 hover:bg-rose-50 text-stone-400 hover:text-rose-500 rounded-xl transition-all active:scale-95 flex items-center justify-center outline-none"
                title={t('dashboard.calendar.modal.delete_appt') || 'Eliminar cita'}
              >
                <Trash2 size={18} strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, 
  Sparkles, 
  Trash2, 
  AlertTriangle, 
  Save, 
  MessageCircle, 
  Clock, 
  Globe, 
  CreditCard, 
  CheckCircle2, 
  Check, 
  UserX, 
  XCircle 
} from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
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

  const parseIsoDate = (str?: string) => {
    if (!str) return new Date();
    const clean = str.endsWith('Z') ? str.slice(0, -1) : str;
    return new Date(clean.replace(' ', 'T'));
  };

  const currentApptDuration = useMemo(() => {
    if (!selectedAppt?.start_time || !selectedAppt?.end_time) return 30;
    const s = parseIsoDate(selectedAppt.start_time).getTime();
    const e = parseIsoDate(selectedAppt.end_time).getTime();
    const diff = Math.round((e - s) / 60000);
    return diff > 0 ? diff : 30;
  }, [selectedAppt]);

  const [duration, setDuration] = useState<number>(30);

  useEffect(() => {
    setDuration(currentApptDuration);
  }, [currentApptDuration]);

  // Status configuration helper with clean Lucide icons and quiet luxury badges
  const getStatusConfig = (statusKey?: string) => {
    const key = (statusKey || 'pending').toLowerCase().trim();
    switch (key) {
      case 'completed':
        return {
          label: t('dashboard.calendar.completed') || 'Realizada',
          icon: Check,
          color: 'text-emerald-700',
          badgeClasses: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
          triggerClasses: 'bg-emerald-50/80 text-emerald-900 border-emerald-200/80 hover:bg-emerald-50',
        };
      case 'confirmed':
        return {
          label: t('dashboard.calendar.confirmed') || 'Confirmada',
          icon: CheckCircle2,
          color: 'text-emerald-600',
          badgeClasses: 'bg-emerald-50 text-emerald-800 border-emerald-200/70',
          triggerClasses: 'bg-emerald-50/70 text-emerald-900 border-emerald-200/70 hover:bg-emerald-50',
        };
      case 'web_pending':
        return {
          label: t('dashboard.calendar.modal.web_reservation') || 'Reserva Web',
          icon: Globe,
          color: 'text-amber-600',
          badgeClasses: 'bg-amber-50 text-amber-900 border-amber-200',
          triggerClasses: 'bg-amber-50/80 text-amber-900 border-amber-200 hover:bg-amber-50',
        };
      case 'pending_verification':
        return {
          label: t('dashboard.calendar.modal.pending_web') || 'Pendiente (Web)',
          icon: Globe,
          color: 'text-sky-600',
          badgeClasses: 'bg-sky-50 text-sky-900 border-sky-200',
          triggerClasses: 'bg-sky-50/80 text-sky-900 border-sky-200 hover:bg-sky-50',
        };
      case 'awaiting_payment':
        return {
          label: t('dashboard.calendar.modal.pending_payment') || 'Pago Pendiente',
          icon: CreditCard,
          color: 'text-amber-700',
          badgeClasses: 'bg-amber-50 text-amber-900 border-amber-200',
          triggerClasses: 'bg-amber-50/80 text-amber-900 border-amber-200 hover:bg-amber-50',
        };
      case 'no_show':
        return {
          label: t('dashboard.calendar.no_show') || 'No Asistió',
          icon: UserX,
          color: 'text-stone-500',
          badgeClasses: 'bg-stone-50 text-stone-700 border-stone-200',
          triggerClasses: 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100',
        };
      case 'cancelled':
        return {
          label: t('dashboard.calendar.cancelled') || 'Cancelada',
          icon: XCircle,
          color: 'text-rose-600',
          badgeClasses: 'bg-rose-50 text-rose-800 border-rose-200',
          triggerClasses: 'bg-rose-50/80 text-rose-900 border-rose-200 hover:bg-rose-50',
        };
      case 'pending':
      default:
        return {
          label: t('dashboard.calendar.modal.pending_manual') || 'Pendiente (Manual)',
          icon: Clock,
          color: 'text-amber-600',
          badgeClasses: 'bg-amber-50 text-amber-900 border-amber-200',
          triggerClasses: 'bg-amber-50/80 text-amber-900 border-amber-200 hover:bg-amber-50',
        };
    }
  };

  const statusOptions = [
    { key: 'pending', ...getStatusConfig('pending') },
    { key: 'pending_verification', ...getStatusConfig('pending_verification') },
    { key: 'web_pending', ...getStatusConfig('web_pending') },
    { key: 'awaiting_payment', ...getStatusConfig('awaiting_payment') },
    { key: 'confirmed', ...getStatusConfig('confirmed') },
    { key: 'completed', ...getStatusConfig('completed') },
    { key: 'no_show', ...getStatusConfig('no_show') },
    { key: 'cancelled', ...getStatusConfig('cancelled') },
  ];

  // Cálculo del hueco libre máximo disponible desde el inicio de la cita sin invadir descansos, cierres u otras citas
  const availableGapMinutes = useMemo(() => {
    if (!selectedAppt?.start_time) return 480;
    const s_time = parseIsoDate(selectedAppt.start_time);
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
      .map(e => ({ ...e, start: parseIsoDate(e.start_time) }))
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
      <DialogContent className="p-0 border border-stone-200/80 w-[95vw] sm:max-w-md lg:max-w-[36em] h-fit max-h-[100dvh] sm:max-h-[calc(100vh-2rem)] rounded-3xl shadow-2xl bg-white overflow-hidden">
        <DialogHeader className="sticky top-0 z-30 shrink-0 p-6 sm:p-8 border-b border-stone-100 bg-white/95 backdrop-blur-md">
          <div className="flex flex-col gap-2">
            {selectedAppt && (() => {
              const currentStatus = getStatusConfig(selectedAppt.status);
              const StIcon = currentStatus.icon;
              return (
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border w-fit shadow-2xs flex items-center gap-1.5 ${currentStatus.badgeClasses}`}>
                  <StIcon size={12} className={currentStatus.color} />
                  {currentStatus.label}
                </span>
              );
            })()}
            <DialogTitle className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 leading-tight">
              {selectedAppt ? clientMap.get(selectedAppt.client_id)?.name : (t('dashboard.calendar.modal.appt_detail') || 'Detalle Cita')}
            </DialogTitle>
            {selectedAppt && (
              <DialogDescription className="text-[#B38F26] font-semibold flex items-center gap-2 text-xs">
                <Calendar size={14} strokeWidth={2} />
                {parseIsoDate(selectedAppt.start_time).toLocaleDateString(getLocaleString(), {
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
              <Sparkles size={16} strokeWidth={2} className="text-[#D4AF37]" />
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
                        duration === mins ? 'bg-stone-900 text-white border-stone-900 shadow-xs' :
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
              <Button
                id="edit-appt-save-duration-btn"
                type="button"
                onClick={() => {
                  if (availableGapMinutes > 0 && duration > availableGapMinutes) {
                    toast.error(`La duración no puede superar los ${availableGapMinutes} min disponibles (evita invadir descansos o citas).`);
                    return;
                  }
                  handleUpdateDuration(duration);
                }}
                disabled={updatingStatus}
                variant="default"
                size="sm"
                className="w-full bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold py-2 rounded-xl shadow-xs"
              >
                <Save size={13} className="mr-1.5" /> {(() => {
                  const s = t('dashboard.calendar.modal.save_duration');
                  return s && !s.includes('.') ? s : 'Guardar Duración';
                })()} ({duration} min)
              </Button>
            )}
          </div>

          <div>
            <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">{t('dashboard.calendar.modal.treatment_notes') || 'Notas del Tratamiento'}</label>
            <textarea
              id="edit-appt-notes-textarea"
              value={editNotes}
              onChange={e => setEditNotes(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] outline-none bg-stone-50 min-h-[56px] h-auto resize-none text-[13px] placeholder:italic shadow-2xs overflow-hidden transition-all"
              placeholder={t('dashboard.calendar.modal.add_notes') || 'Añadir nota...'}
            />
            {selectedAppt && editNotes !== (selectedAppt.notes || '') && (
              <Button
                id="edit-appt-save-notes-btn"
                type="button"
                onClick={() => handleUpdateNotes()}
                disabled={updatingStatus}
                variant="default"
                size="sm"
                className="mt-2 w-full bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold py-2 rounded-xl shadow-xs"
              >
                <Save size={13} className="mr-1.5" /> {t('dashboard.calendar.modal.save_notes') || 'Guardar Notas'}
              </Button>
            )}
          </div>

          {selectedAppt?.status === 'web_pending' && (
            <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl">
              <p className="text-[10px] text-orange-600 font-bold uppercase tracking-widest mb-3 flex items-center gap-1">
                <AlertTriangle size={12} /> {t('dashboard.calendar.modal.web_pending_res') || 'Reserva pendiente'}
              </p>
              <Button
                id="edit-appt-confirm-web-booking-btn"
                onClick={() => handleStatusChange('confirmed')}
                disabled={updatingStatus}
                variant="luxury"
                className="w-full font-bold py-3 rounded-xl"
              >
                {t('dashboard.calendar.modal.confirm_now') || 'Confirmar Ahora'}
              </Button>
            </div>
          )}

          <div className="space-y-3 pb-4">
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest border-b border-stone-100 pb-1.5">{t('dashboard.calendar.modal.quick_actions') || 'Acciones Rápidas'}</p>

            <div className="flex items-center gap-3">
              <button
                id="edit-appt-whatsapp-btn"
                type="button"
                onClick={() => {
                  if (selectedAppt) {
                    const client = clientMap.get(selectedAppt.client_id);
                    const service = serviceMap.get(selectedAppt.service_id);
                    if (client && service) openWhatsApp(client.name, client.phone, service.name, selectedAppt.start_time);
                  }
                }}
                className="w-12 h-12 shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-all active:scale-95 flex items-center justify-center outline-none"
                title={t('dashboard.calendar.modal.whatsapp_title') || 'Contactar por WhatsApp'}
              >
                <MessageCircle size={20} strokeWidth={2} />
              </button>

              <div className="flex-1">
                {(() => {
                  const currentStatus = getStatusConfig(selectedAppt?.status);
                  const CurrentIcon = currentStatus.icon;

                  return (
                    <Select
                      value={(selectedAppt?.status || 'pending').toLowerCase().trim()}
                      onValueChange={(val) => handleStatusChange(val)}
                      disabled={updatingStatus}
                    >
                      <SelectTrigger id="edit-appt-status-select-trigger" className={`w-full h-12 rounded-xl font-bold border transition-all text-xs shadow-2xs ${currentStatus.triggerClasses}`}>
                        <div className="flex items-center gap-2.5 truncate">
                          <CurrentIcon size={16} className={`shrink-0 ${currentStatus.color}`} />
                          <span className="truncate">{currentStatus.label}</span>
                        </div>
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border border-stone-200/80 shadow-2xl p-1.5 bg-white">
                        {statusOptions.map((opt) => {
                          const Icon = opt.icon;
                          return (
                            <SelectItem key={opt.key} value={opt.key} className="py-2.5 rounded-xl text-xs font-semibold">
                              <div className="flex items-center gap-2.5">
                                <Icon size={15} className={`shrink-0 ${opt.color}`} />
                                <span>{opt.label}</span>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  );
                })()}
              </div>

              <Button
                id="edit-appt-delete-btn"
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleDeleteAppointment}
                disabled={updatingStatus}
                className="w-12 h-12 shrink-0 bg-stone-100 hover:bg-rose-50 text-stone-400 hover:text-rose-600 rounded-xl transition-all"
                title={t('dashboard.calendar.modal.delete_appt') || 'Eliminar cita'}
              >
                <Trash2 size={18} strokeWidth={2} />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import React from 'react';
import { Calendar, Sparkles, Trash2, AlertTriangle, Save, MessageCircle } from 'lucide-react';
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
  editNotes: string;
  setEditNotes: (v: string) => void;
  updatingStatus: boolean;
  handleStatusChange: (newStatus: string) => Promise<void>;
  handleUpdateNotes: () => Promise<void>;
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
  editNotes,
  setEditNotes,
  updatingStatus,
  handleStatusChange,
  handleUpdateNotes,
  handleDeleteAppointment,
  openWhatsApp,
}: EditAppointmentModalProps) {
  const { t, language } = useLanguage();

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

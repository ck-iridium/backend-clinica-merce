import React from 'react';
import { Calendar, Sparkles, Trash2, AlertTriangle, Save, MessageCircle } from 'lucide-react';
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
  return (
    <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
      <DialogContent className="p-0 border-none w-[95vw] sm:max-w-[340px] lg:max-w-[35em] h-fit max-h-[100dvh] sm:max-h-[calc(100vh-2rem)] rounded-xl">
        <DialogHeader className="sticky top-0 z-30 shrink-0 p-8 border-b border-stone-100 bg-white/95 backdrop-blur-md">
          <div className="flex flex-col gap-2">
            {selectedAppt && (
              <span className={`px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider border w-fit
                ${selectedAppt.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                  selectedAppt.status === 'cancelled' ? 'bg-[#fef2f2] text-[#991b1b] border-[#fee2e2]' :
                    selectedAppt.status === 'web_pending' ? 'bg-orange-50 text-orange-600 border-orange-200' :
                      selectedAppt.status === 'pending' ? 'bg-[#fffbeb] text-[#92400e] border-[#fef3c7]' :
                        'bg-[#f0f9f4] text-[#2d6a4f] border-[#d8f3dc]'}
              `}>
                {selectedAppt.status === 'web_pending' ? 'Web' :
                  selectedAppt.status === 'completed' ? 'Realizada' :
                    selectedAppt.status === 'cancelled' ? 'Cancelada' :
                      selectedAppt.status === 'pending' ? 'Pendiente' :
                        'Confirmada'}
              </span>
            )}
            <DialogTitle className="text-2xl md:text-3xl font-serif italic font-black text-stone-800 leading-tight">
              {selectedAppt ? clientMap.get(selectedAppt.client_id)?.name : 'Detalle Cita'}
            </DialogTitle>
            {selectedAppt && (
              <DialogDescription className="text-[#d9777f] font-bold flex items-center gap-2 text-sm">
                <Calendar size={14} strokeWidth={2.5} />
                {new Date(selectedAppt.start_time.endsWith('Z') ? selectedAppt.start_time.slice(0, -1) : selectedAppt.start_time).toLocaleDateString('es-ES', {
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
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Tratamiento</p>
            </div>
            <div className="flex items-center gap-2 py-1.5 border-b border-stone-100">
              <Sparkles size={16} strokeWidth={2} className="text-[#d9777f]" />
              <p className="text-base font-bold text-stone-700">
                {selectedAppt ? serviceMap.get(selectedAppt.service_id)?.name : '...'}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Notas del Tratamiento</label>
            <textarea
              value={editNotes}
              onChange={e => setEditNotes(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-stone-100 focus:ring-2 focus:ring-[#d9777f] outline-none bg-stone-50 min-h-[42px] h-auto resize-none text-[13px] placeholder:italic shadow-inner overflow-hidden"
              placeholder="Añadir nota..."
            />
            {selectedAppt && editNotes !== (selectedAppt.notes || '') && (
              <button
                onClick={() => handleUpdateNotes()}
                disabled={updatingStatus}
                className="mt-2 w-full bg-stone-800 text-white text-[10px] font-bold uppercase py-2.5 rounded-lg hover:bg-stone-900 transition-all flex items-center justify-center gap-2"
              >
                <Save size={12} /> Guardar Notas
              </button>
            )}
          </div>

          {selectedAppt?.status === 'web_pending' && (
            <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl">
              <p className="text-[10px] text-orange-600 font-bold uppercase tracking-widest mb-3 flex items-center gap-1">
                <AlertTriangle size={12} /> Reserva pendiente
              </p>
              <button
                onClick={() => handleStatusChange('confirmed')}
                disabled={updatingStatus}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold py-3 rounded-xl transition-all active:scale-95"
              >
                Confirmar Ahora
              </button>
            </div>
          )}

          <div className="space-y-3 pb-4">
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest border-b border-stone-100 pb-1.5">Acciones Rápidas</p>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  if (selectedAppt) {
                    const client = clientMap.get(selectedAppt.client_id);
                    const service = serviceMap.get(selectedAppt.service_id);
                    if (client && service) openWhatsApp(client.name, client.phone, service.name, selectedAppt.start_time);
                  }
                }}
                className="w-12 h-12 shrink-0 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-xl shadow-lg shadow-green-100 transition-all active:scale-95 flex items-center justify-center outline-none"
                title="Contactar por WhatsApp"
              >
                <MessageCircle size={20} strokeWidth={2} />
              </button>

              <div className="flex-1">
                <Select
                  value={selectedAppt?.status}
                  onValueChange={(val) => handleStatusChange(val)}
                  disabled={updatingStatus}
                >
                  <SelectTrigger className={`w-full h-12 rounded-xl font-bold border transition-all text-[11px]
                    ${selectedAppt?.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' :
                      selectedAppt?.status === 'cancelled' ? 'bg-[#fef2f2] text-[#991b1b] border-[#fee2e2]' :
                        selectedAppt?.status === 'web_pending' ? 'bg-orange-50 text-orange-700 border-orange-300' :
                          selectedAppt?.status === 'pending' ? 'bg-[#fffbeb] text-[#92400e] border-[#fef3c7]' :
                            selectedAppt?.status === 'confirmed' ? 'bg-[#f0f9f4] text-[#2d6a4f] border-[#d8f3dc]' :
                              'bg-stone-50 text-stone-600 border-stone-100'}
                  `}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-none shadow-2xl">
                    <SelectItem value="pending">⏳ Pendiente</SelectItem>
                    <SelectItem value="confirmed" className="font-bold text-[#2d6a4f]">✨ Confirmada</SelectItem>
                    <SelectItem value="completed" className="font-bold text-emerald-600">✅ Realizada</SelectItem>
                    <SelectItem value="no_show">No Asistió</SelectItem>
                    <SelectItem value="cancelled" className="font-bold text-[#991b1b]">❌ Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <button
                onClick={handleDeleteAppointment}
                disabled={updatingStatus}
                className="w-12 h-12 shrink-0 bg-stone-50 hover:bg-rose-50 text-stone-400 hover:text-rose-500 rounded-xl transition-all active:scale-95 flex items-center justify-center outline-none"
                title="Eliminar cita"
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

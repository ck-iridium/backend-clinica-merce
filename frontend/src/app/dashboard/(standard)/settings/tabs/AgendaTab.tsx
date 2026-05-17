import { Clock, Calendar, Trash2, Hash } from 'lucide-react';

interface AgendaTabProps {
  settings: any;
  setSettings: (s: any) => void;
  timeBlocks: any[];
  setShowBlockModal: (v: boolean) => void;
  handleDeleteBlock: (id: string) => void;
}

export default function AgendaTab({ 
  settings, 
  setSettings, 
  timeBlocks, 
  setShowBlockModal, 
  handleDeleteBlock 
}: AgendaTabProps) {
  return (
    <div className="space-y-4 md:space-y-8 animate-in slide-in-from-bottom-2 duration-300">
      {/* Horario Hábil */}
      <div className="bg-white rounded-3xl md:rounded-[2.5rem] border border-stone-100 p-5 md:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-4 md:mb-6 pb-3 md:pb-4 border-b border-stone-100">
          <span className="w-9 h-9 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-500">
            <Clock size={18} strokeWidth={1.5} />
          </span>
          <h3 className="text-2xl font-serif font-semibold text-stone-800">Horario Hábil y Descansos</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-emerald-700 mb-2">Apertura (Mañana)</label>
              <input type="time" value={settings.open_time || ''} onChange={e => setSettings({...settings, open_time: e.target.value})} className="w-full p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl focus:border-emerald-400 font-mono font-bold text-emerald-800 transition-all outline-none" required />
            </div>
            <div>
              <label className="block text-xs font-bold text-orange-700 mb-2">Cierre (Tarde/Noche)</label>
              <input type="time" value={settings.close_time || ''} onChange={e => setSettings({...settings, close_time: e.target.value})} className="w-full p-4 bg-orange-50/50 border border-orange-100 rounded-xl focus:border-orange-400 font-mono font-bold text-orange-800 transition-all outline-none" required />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-500 mb-2">Inicio Descanso</label>
              <input type="time" value={settings.lunch_start || ''} onChange={e => setSettings({...settings, lunch_start: e.target.value})} className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl focus:border-[#d4af37] font-mono font-bold transition-all outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-500 mb-2">Fin Descanso</label>
              <input type="time" value={settings.lunch_end || ''} onChange={e => setSettings({...settings, lunch_end: e.target.value})} className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl focus:border-[#d4af37] font-mono font-bold transition-all outline-none" />
            </div>
          </div>

          <div className="flex flex-col">
            <label className="block text-xs font-bold text-stone-500 mb-4 uppercase tracking-widest">Días Laborables</label>
            <div className="flex flex-wrap gap-3">
              {[
                { id: 1, label: 'L' },
                { id: 2, label: 'M' },
                { id: 3, label: 'X' },
                { id: 4, label: 'J' },
                { id: 5, label: 'V' },
                { id: 6, label: 'S' },
                { id: 7, label: 'D' }
              ].map((day) => {
                const isActive = (settings.working_days || [1,2,3,4,5]).includes(day.id);
                return (
                  <button
                    key={day.id}
                    type="button"
                    onClick={() => {
                      const current = settings.working_days || [1,2,3,4,5];
                      const next = isActive 
                        ? current.filter((d: number) => d !== day.id)
                        : [...current, day.id].sort();
                      
                      localStorage.setItem('mercestetica_working_days', JSON.stringify(next));
                      setSettings({ ...settings, working_days: next });
                    }}
                    className={`w-12 h-12 rounded-2xl font-black transition-all flex items-center justify-center text-sm shadow-sm
                      ${isActive 
                        ? 'bg-stone-900 text-white shadow-stone-200 scale-105' 
                        : 'bg-white border border-stone-200 text-stone-400 hover:border-stone-400'}
                    `}
                  >
                    {day.label}
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-stone-400 mt-4 leading-relaxed tracking-wide font-medium italic">Selecciona los días que la clínica estará abierta.</p>
          </div>
        </div>
      </div>

      {/* Gestor de Ausencias */}
      <div className="bg-white rounded-3xl md:rounded-[2.5rem] border border-stone-100 p-5 md:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-4 md:mb-6 pb-3 md:pb-4 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-500">
              <Calendar size={18} strokeWidth={1.5} />
            </span>
            <h3 className="text-2xl font-serif font-semibold text-stone-800">Vacaciones y Festivos</h3>
          </div>
          <button type="button" onClick={() => setShowBlockModal(true)} className="bg-stone-50 text-stone-900 px-4 py-2 rounded-xl font-bold hover:bg-stone-100 transition-colors text-sm border border-stone-200">
            + Añadir Ausencia
          </button>
        </div>
        
        <div className="bg-stone-50/50 border border-stone-100 rounded-2xl overflow-hidden">
          {timeBlocks && timeBlocks.length > 0 ? (
            <ul className="divide-y divide-stone-100">
              {timeBlocks.map((tb: any) => (
                <li key={tb.id} className="p-4 flex flex-row items-center justify-between gap-4 hover:bg-white transition-colors">
                  <div className="flex flex-col">
                    <span className="font-bold text-stone-800">{tb.reason || 'Día inhábil'}</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-stone-500 bg-stone-100 px-2 py-1 rounded-md font-mono">{new Date(tb.start_time).toLocaleDateString()} a {new Date(tb.end_time).toLocaleDateString()}</span>
                      {tb.is_annual_holiday && <span className="text-[10px] font-bold text-[#d4af37] uppercase tracking-wider bg-[#fcf8e5] px-2 py-1 rounded-full border border-[#f5efd5]">Anual</span>}
                    </div>
                  </div>
                  <button type="button" onClick={() => handleDeleteBlock(tb.id)} className="text-stone-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-xl transition-colors">
                    <Trash2 size={16} strokeWidth={1.5} />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-8 text-center text-stone-400 text-sm">
              No hay vacaciones ni días festivos programados.
            </div>
          )}
        </div>
      </div>

      {/* Margen Agenda */}
      <div className="bg-white rounded-3xl md:rounded-[2.5rem] border border-stone-100 p-5 md:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-4 md:mb-6 pb-3 md:pb-4 border-b border-stone-100">
          <span className="w-9 h-9 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-500">
            <Hash size={18} strokeWidth={1.5} />
          </span>
          <h3 className="text-2xl font-serif font-semibold text-stone-800">Antelación de Reservas</h3>
        </div>
        <div className="p-4 bg-orange-50/50 border border-orange-100 rounded-2xl">
          <label className="block text-xs font-bold text-orange-700 mb-2">Margen de antelación para hoy (Horas)</label>
          <input 
            type="number" 
            min="0" 
            step="0.5" 
            value={settings.booking_margin_hours === undefined || settings.booking_margin_hours === null ? "" : settings.booking_margin_hours} 
            onChange={e => {
              const val = e.target.value;
              setSettings({...settings, booking_margin_hours: val === "" ? "" : parseFloat(val) });
            }} 
            className="w-full md:w-1/2 p-4 bg-white border border-orange-200 rounded-xl focus:border-orange-400 font-mono font-bold text-orange-800 outline-none" 
          />
          <p className="text-[10px] text-orange-600/80 mt-2">Determina el tiempo mínimo antes de una cita para que un cliente pueda reservar online el mismo día.</p>
        </div>
      </div>
    </div>
  );
}

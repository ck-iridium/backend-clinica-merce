import { Clock, Calendar, Trash2, Hash } from 'lucide-react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { Button } from '@/components/ui/button';

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
  const { t } = useLanguage();

  const days = [
    { id: 1, label: t('dashboard.settings.calendar.days.mon') },
    { id: 2, label: t('dashboard.settings.calendar.days.tue') },
    { id: 3, label: t('dashboard.settings.calendar.days.wed') },
    { id: 4, label: t('dashboard.settings.calendar.days.thu') },
    { id: 5, label: t('dashboard.settings.calendar.days.fri') },
    { id: 6, label: t('dashboard.settings.calendar.days.sat') },
    { id: 7, label: t('dashboard.settings.calendar.days.sun') }
  ];

  return (
    <div className="space-y-6 md:space-y-8 animate-in slide-in-from-bottom-2 duration-300">
      {/* Horario Hábil */}
      <div className="bg-white rounded-3xl border border-stone-200/80 p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-3.5 mb-6 pb-4 border-b border-stone-100">
          <span className="w-10 h-10 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] shadow-2xs shrink-0">
            <Clock size={18} strokeWidth={2} />
          </span>
          <div>
            <h3 className="text-xl md:text-2xl font-serif font-bold text-stone-900">{t('dashboard.settings.calendar.working_hours')}</h3>
            <p className="text-xs text-stone-400 font-medium">Jornada de apertura, cierre e intervalos de descanso</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-[10px] font-bold text-emerald-700 uppercase tracking-widest mb-1.5">{t('dashboard.settings.calendar.opening')}</label>
              <input 
                id="agenda-open-time" 
                type="time" 
                value={settings.open_time || ''} 
                onChange={e => setSettings({...settings, open_time: e.target.value})} 
                className="w-full px-4 py-3 bg-emerald-50/40 border border-emerald-200/80 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-mono font-bold text-emerald-900 transition-all outline-none" 
                required 
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-amber-700 uppercase tracking-widest mb-1.5">{t('dashboard.settings.calendar.closing')}</label>
              <input 
                id="agenda-close-time" 
                type="time" 
                value={settings.close_time || ''} 
                onChange={e => setSettings({...settings, close_time: e.target.value})} 
                className="w-full px-4 py-3 bg-amber-50/40 border border-amber-200/80 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 font-mono font-bold text-amber-900 transition-all outline-none" 
                required 
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">{t('dashboard.settings.calendar.break_start')}</label>
              <input 
                id="agenda-lunch-start" 
                type="time" 
                value={settings.lunch_start || ''} 
                onChange={e => setSettings({...settings, lunch_start: e.target.value})} 
                className="w-full px-4 py-3 bg-stone-50/70 border border-stone-200/80 rounded-xl focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/30 font-mono font-bold text-stone-800 transition-all outline-none" 
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">{t('dashboard.settings.calendar.break_end')}</label>
              <input 
                id="agenda-lunch-end" 
                type="time" 
                value={settings.lunch_end || ''} 
                onChange={e => setSettings({...settings, lunch_end: e.target.value})} 
                className="w-full px-4 py-3 bg-stone-50/70 border border-stone-200/80 rounded-xl focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/30 font-mono font-bold text-stone-800 transition-all outline-none" 
              />
            </div>
          </div>

          <div className="flex flex-col">
            <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3">{t('dashboard.settings.calendar.working_days')}</label>
            <div className="flex flex-wrap gap-2.5">
              {days.map((day) => {
                const isActive = (settings.working_days || [1,2,3,4,5]).includes(day.id);
                return (
                  <button
                    key={day.id}
                    id={`agenda-working-day-btn-${day.id}`}
                    type="button"
                    onClick={() => {
                      const current = settings.working_days || [1,2,3,4,5];
                      const next = isActive 
                        ? current.filter((d: number) => d !== day.id)
                        : [...current, day.id].sort();
                      
                      localStorage.setItem('mercestetica_working_days', JSON.stringify(next));
                      setSettings({ ...settings, working_days: next });
                    }}
                    className={`w-11 h-11 rounded-2xl font-bold transition-all flex items-center justify-center text-xs shadow-2xs
                      ${isActive 
                        ? 'bg-stone-900 text-white shadow-sm scale-105' 
                        : 'bg-stone-50/80 border border-stone-200/80 text-stone-400 hover:text-stone-700 hover:border-stone-300'}
                    `}
                  >
                    {day.label}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-stone-400 mt-4 leading-relaxed font-medium">{t('dashboard.settings.calendar.working_days_desc')}</p>
          </div>
        </div>
      </div>

      {/* Gestor de Ausencias */}
      <div className="bg-white rounded-3xl border border-stone-200/80 p-6 md:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-100">
          <div className="flex items-center gap-3.5">
            <span className="w-10 h-10 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] shadow-2xs shrink-0">
              <Calendar size={18} strokeWidth={2} />
            </span>
            <div>
              <h3 className="text-xl md:text-2xl font-serif font-bold text-stone-900">{t('dashboard.settings.calendar.holidays')}</h3>
              <p className="text-xs text-stone-400 font-medium">Bloqueos de calendario, festivos y vacaciones</p>
            </div>
          </div>
          <Button 
            id="agenda-add-absence-btn" 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={() => setShowBlockModal(true)} 
            className="rounded-xl px-4 font-bold text-xs border-stone-200 text-stone-800 hover:border-[#D4AF37] hover:text-[#B08E23]"
          >
            {t('dashboard.settings.calendar.add_absence')}
          </Button>
        </div>
        
        <div className="bg-stone-50/50 border border-stone-200/70 rounded-2xl overflow-hidden">
          {timeBlocks && timeBlocks.length > 0 ? (
            <ul className="divide-y divide-stone-100">
              {timeBlocks.map((tb: any) => (
                <li key={tb.id} className="p-4 flex flex-row items-center justify-between gap-4 hover:bg-white transition-colors">
                  <div className="flex flex-col">
                    <span className="font-bold text-stone-800 text-sm">{tb.reason || t('dashboard.settings.calendar.non_working_day')}</span>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-xs text-stone-500 bg-white border border-stone-200 px-2.5 py-0.5 rounded-lg font-mono">{new Date(tb.start_time).toLocaleDateString()} a {new Date(tb.end_time).toLocaleDateString()}</span>
                      {tb.is_annual_holiday && <span className="text-[10px] font-bold text-[#b08e23] uppercase tracking-wider bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200/70">{t('dashboard.settings.calendar.annual')}</span>}
                    </div>
                  </div>
                  <button 
                    id={`agenda-delete-absence-btn-${tb.id}`} 
                    type="button" 
                    onClick={() => handleDeleteBlock(tb.id)} 
                    className="w-8 h-8 flex items-center justify-center text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                  >
                    <Trash2 size={16} strokeWidth={1.75} />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-8 text-center text-stone-400 text-sm">
              {t('dashboard.settings.calendar.no_holidays')}
            </div>
          )}
        </div>
      </div>

      {/* Margen Agenda */}
      <div className="bg-white rounded-3xl border border-stone-200/80 p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-3.5 mb-6 pb-4 border-b border-stone-100">
          <span className="w-10 h-10 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] shadow-2xs shrink-0">
            <Hash size={18} strokeWidth={2} />
          </span>
          <div>
            <h3 className="text-xl md:text-2xl font-serif font-bold text-stone-900">{t('dashboard.settings.calendar.booking_lead_time')}</h3>
            <p className="text-xs text-stone-400 font-medium">Antelación mínima permitida para reservas online</p>
          </div>
        </div>
        <div className="p-5 bg-amber-50/30 border border-amber-200/70 rounded-2xl max-w-xl">
          <label className="block text-[10px] font-bold text-amber-800 uppercase tracking-widest mb-1.5">{t('dashboard.settings.calendar.margin_hours')}</label>
          <input 
            id="agenda-booking-margin-hours"
            type="number" 
            min="0" 
            step="0.5" 
            value={settings.booking_margin_hours === undefined || settings.booking_margin_hours === null ? "" : settings.booking_margin_hours} 
            onChange={e => {
              const val = e.target.value;
              setSettings({...settings, booking_margin_hours: val === "" ? "" : parseFloat(val) });
            }} 
            className="w-full sm:w-48 px-4 py-2.5 bg-white border border-amber-200 rounded-xl focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/30 font-mono font-bold text-stone-800 outline-none" 
          />
          <p className="text-[11px] text-amber-800/80 mt-2 font-medium">{t('dashboard.settings.calendar.margin_hours_desc')}</p>
        </div>
      </div>
    </div>
  );
}

import { Clock, Calendar, Trash2, Hash, PhoneCall, Lock, QrCode } from 'lucide-react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { TerminalSecurityManager } from '@/components/settings/TerminalSecurityManager';

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
      {/* Modalidad de Reservas & Recepción (Online vs Teléfono) */}
      <div className="bg-white rounded-3xl border border-stone-200/80 p-6 md:p-8 shadow-sm">
        <div className="flex items-center justify-between gap-4 flex-wrap pb-4 border-b border-stone-100">
          <div className="flex items-center gap-3.5">
            <span className="w-10 h-10 rounded-2xl bg-orange-50 border border-orange-200/60 flex items-center justify-center text-[#FF6B00] shadow-2xs shrink-0">
              <PhoneCall size={18} strokeWidth={2} />
            </span>
            <div>
              <h3 className="text-xl md:text-2xl font-serif font-bold text-stone-900">Modalidad de Reservas</h3>
              <p className="text-xs text-stone-400 font-medium">Define cómo conciertan cita tus clientes</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={cn(
              "text-xs font-bold px-3 py-1 rounded-full border flex items-center gap-1.5",
              settings.allow_online_booking !== false
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-stone-100 text-stone-700 border-stone-200"
            )}>
              {settings.allow_online_booking !== false ? (
                "✓ Reservas Online Activas"
              ) : (
                <>
                  <PhoneCall size={12} className="text-[#FF6B00]" />
                  <span>Modo Teléfono / Presencial</span>
                </>
              )}
            </span>
            <button
              type="button"
              onClick={() => setSettings({
                ...settings,
                allow_online_booking: settings.allow_online_booking === false ? true : false
              })}
              className={cn(
                "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors",
                settings.allow_online_booking !== false ? "bg-emerald-500" : "bg-stone-300"
              )}
            >
              <span className={cn(
                "inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform",
                settings.allow_online_booking !== false ? "translate-x-6" : "translate-x-1"
              )} />
            </button>
          </div>
        </div>

        <div className="mt-4 p-4 rounded-2xl bg-stone-50 border border-stone-200/70 text-xs text-stone-600 leading-relaxed space-y-1">
          {settings.allow_online_booking !== false ? (
            <p>
              <strong>Reservas Web habilitadas:</strong> Los clientes pueden navegar por tu catálogo y reservar su cita directamente en línea en tu calendario.
            </p>
          ) : (
            <p className="text-stone-700 font-medium">
              <strong>Modo Teléfono / Presencial exclusivo activo:</strong> El motor de reserva online se encuentra pausado. Los botones de tu página web invitan a los clientes a <strong>llamar por teléfono o contactar por WhatsApp</strong>. La agenda interna de tu equipo continuará funcionando con total normalidad para anotar todas las citas manuales.
            </p>
          )}
        </div>
      </div>

      {/* Modo Mostrador TPV & Auto-bloqueo */}
      <div className="bg-white rounded-3xl border border-stone-200/80 p-6 md:p-8 shadow-sm">
            <div className="flex items-center justify-between gap-4 flex-wrap pb-4 border-b border-stone-100">
              <div className="flex items-center gap-3.5">
                <span className="w-10 h-10 rounded-2xl bg-orange-50 border border-orange-200/60 flex items-center justify-center text-[#FF6B00] shadow-2xs shrink-0">
                  <Lock size={18} strokeWidth={2} />
                </span>
                <div>
                  <h3 className="text-xl md:text-2xl font-serif font-bold text-stone-900">Modo Mostrador TPV</h3>
                  <p className="text-xs text-stone-400 font-medium">Bloqueo de pantalla con PIN para proteger datos frente a clientes</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={cn(
                  "text-xs font-bold px-3 py-1 rounded-full border",
                  Boolean(settings.enable_counter_mode)
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-stone-100 text-stone-600 border-stone-200"
                )}>
                  {Boolean(settings.enable_counter_mode) ? "✓ Modo Mostrador Activo" : "Desactivado"}
                </span>
                <button
                  type="button"
                  onClick={() => setSettings({
                    ...settings,
                    enable_counter_mode: !Boolean(settings.enable_counter_mode)
                  })}
                  className={cn(
                    "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors",
                    Boolean(settings.enable_counter_mode) ? "bg-emerald-500" : "bg-stone-300"
                  )}
                >
                  <span className={cn(
                    "inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform",
                    Boolean(settings.enable_counter_mode) ? "translate-x-6" : "translate-x-1"
                  )} />
                </button>
              </div>
            </div>

                  {Boolean(settings.enable_counter_mode) ? (
                    <div className="mt-6 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                        <div>
                          <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">
                            Auto-bloqueo por Inactividad
                          </label>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {[
                              { value: 0, label: "Desactivado" },
                              { value: 5, label: "5 min" },
                              { value: 10, label: "10 min" },
                              { value: 15, label: "15 min" }
                            ].map(opt => {
                              const currentVal = settings.counter_autolock_minutes === undefined || settings.counter_autolock_minutes === null ? 10 : settings.counter_autolock_minutes;
                              const isSelected = currentVal === opt.value;
                              return (
                                <button
                                  key={opt.value}
                                  type="button"
                                  onClick={() => setSettings({ ...settings, counter_autolock_minutes: opt.value })}
                                  className={cn(
                                    "py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all text-center cursor-pointer",
                                    isSelected
                                      ? "bg-[#1C1917] text-white border-[#1C1917] shadow-sm"
                                      : "bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200/80"
                                  )}
                                >
                                  {opt.label}
                                </button>
                              );
                            })}
                          </div>
                          <p className="text-[11px] text-stone-500 mt-2.5 leading-relaxed">
                            Al cumplirse este tiempo sin interacción, la pantalla se bloquea automáticamente con el salvapantallas para que la siguiente empleada introduzca su PIN.
                          </p>
                        </div>
                        <div className="bg-stone-50 border border-stone-200/60 rounded-2xl p-4 text-xs text-stone-600 leading-relaxed">
                          <strong className="block text-stone-800 font-bold mb-1">
                            <Lock size={13} className="text-[#FF6B00] inline mr-1" /> Botón de Bloqueo Inmediato
                          </strong>
                          En la barra superior de la agenda y mostrador tienes siempre disponible el botón <strong>&quot;Bloquear Mostrador&quot;</strong> para cerrar la sesión de la operadora al instante cuando te retires del ordenador.
                        </div>
                      </div>
                    </div>
                  ) : (
          <div className="mt-4 p-4 rounded-2xl bg-stone-50 border border-stone-200/70 text-xs text-stone-600 leading-relaxed">
            <p>
              <strong>Modo Estándar Activo:</strong> La aplicación funciona sin pantallas de bloqueo ni salvapantallas de PIN. El personal accede libremente a través de la sesión de trabajo habitual.
            </p>
          </div>
        )}
      </div>

      {/* Control Horario y Fichajes RDL 8/2019 */}
                  <div className="bg-white rounded-3xl border border-stone-200/80 p-6 md:p-8 shadow-sm">
                    <div className="flex items-center justify-between gap-4 flex-wrap pb-4 border-b border-stone-100">
                      <div className="flex items-center gap-3.5">
                        <span className="w-10 h-10 rounded-2xl bg-orange-50 border border-orange-200/60 flex items-center justify-center text-[#FF6B00] shadow-2xs shrink-0">
                          <QrCode size={18} strokeWidth={2} />
                        </span>
                        <div>
                          <h3 className="text-xl md:text-2xl font-serif font-bold text-stone-900">Control Horario & Fichajes</h3>
                          <p className="text-xs text-stone-400 font-medium">Cumplimiento del Real Decreto-ley 8/2019 de registro de jornada</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={cn(
                          "text-xs font-bold px-3 py-1 rounded-full border",
                          settings.enable_time_clock !== false
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-stone-100 text-stone-600 border-stone-200"
                        )}>
                          {settings.enable_time_clock !== false ? "✓ Fichajes Activos" : "Desactivado"}
                        </span>
                        <button
                          type="button"
                          onClick={() => setSettings({
                            ...settings,
                            enable_time_clock: settings.enable_time_clock === false ? true : false
                          })}
                          className={cn(
                            "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors",
                            settings.enable_time_clock !== false ? "bg-emerald-500" : "bg-stone-300"
                          )}
                        >
                          <span className={cn(
                            "inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform",
                            settings.enable_time_clock !== false ? "translate-x-6" : "translate-x-1"
                          )} />
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 p-4 rounded-2xl bg-stone-50 border border-stone-200/70 text-xs text-stone-600 leading-relaxed">
                      {settings.enable_time_clock !== false ? (
                        <p>
                          <strong>Registro de Jornada habilitado:</strong> El personal puede fichar entrada, pausas y salida escaneando el código QR rotativo anti-fraude desde su teléfono móvil. En la sección <strong>Equipo &gt; Control Horario</strong> podrás consultar los resúmenes y descargar los informes mensuales oficiales en Excel para tu gestoría.
                        </p>
                      ) : (
                        <p>
                          <strong>Control Horario desactivado:</strong> La pestaña de control horario en el panel de Equipo y las opciones de fichaje con móvil permanecerán ocultas para todos los usuarios.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Fase 4 & 5: Hardware Guard de Terminales Autorizados y App de Escritorio */}
                  <TerminalSecurityManager initialRequireRestriction={settings.require_authorized_device} />

                  {/* Horario Hábil */}
                  <div className="bg-white rounded-3xl border border-stone-200/80 p-6 md:p-8 shadow-sm">
                    <div className="flex items-center gap-3.5 mb-6 pb-4 border-b border-stone-100">
                      <span className="w-10 h-10 rounded-2xl bg-orange-50 border border-orange-200/60 flex items-center justify-center text-[#FF6B00] shadow-2xs shrink-0">
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
                          <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1.5">{t('dashboard.settings.calendar.opening')}</label>
                          <input
                            id="agenda-open-time"
                            type="time"
                            value={settings.open_time || ''}
                            onChange={e => setSettings({ ...settings, open_time: e.target.value })}
                            className="w-full px-4 py-3 bg-stone-50/70 border border-stone-200/80 rounded-xl focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20 font-mono font-bold text-stone-800 transition-all outline-none"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1.5">{t('dashboard.settings.calendar.closing')}</label>
                          <input
                            id="agenda-close-time"
                            type="time"
                            value={settings.close_time || ''}
                            onChange={e => setSettings({ ...settings, close_time: e.target.value })}
                            className="w-full px-4 py-3 bg-stone-50/70 border border-stone-200/80 rounded-xl focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20 font-mono font-bold text-stone-800 transition-all outline-none"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">{t('dashboard.settings.calendar.break_start')}</label>
                          <input
                            id="agenda-lunch-start"
                            type="time"
                            value={settings.lunch_start || ''}
                            onChange={e => setSettings({ ...settings, lunch_start: e.target.value })}
                            className="w-full px-4 py-3 bg-stone-50/70 border border-stone-200/80 rounded-xl focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20 font-mono font-bold text-stone-800 transition-all outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">{t('dashboard.settings.calendar.break_end')}</label>
                          <input
                            id="agenda-lunch-end"
                            type="time"
                            value={settings.lunch_end || ''}
                            onChange={e => setSettings({ ...settings, lunch_end: e.target.value })}
                            className="w-full px-4 py-3 bg-stone-50/70 border border-stone-200/80 rounded-xl focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20 font-mono font-bold text-stone-800 transition-all outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col">
                        <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3">{t('dashboard.settings.calendar.working_days')}</label>
                        <div className="flex flex-wrap gap-2.5">
                          {days.map((day) => {
                            const isActive = (settings.working_days || [1, 2, 3, 4, 5]).includes(day.id);
                            return (
                              <button
                                key={day.id}
                                id={`agenda-working-day-btn-${day.id}`}
                                type="button"
                                onClick={() => {
                                  const current = settings.working_days || [1, 2, 3, 4, 5];
                                  const next = isActive
                                    ? current.filter((d: number) => d !== day.id)
                                    : [...current, day.id].sort();

                                  localStorage.setItem('mercestetica_working_days', JSON.stringify(next));
                                  setSettings({ ...settings, working_days: next });
                                }}
                                className={`w-11 h-11 rounded-2xl font-bold transition-all flex items-center justify-center text-xs shadow-2xs cursor-pointer
                      ${isActive
                                    ? 'bg-gradient-to-r from-[#FF6B00] to-[#EA580C] text-white shadow-sm font-bold scale-105'
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
                        <span className="w-10 h-10 rounded-2xl bg-orange-50 border border-orange-200/60 flex items-center justify-center text-[#FF6B00] shadow-2xs shrink-0">
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
                        className="rounded-xl px-4 font-bold text-xs border-stone-200 text-stone-800 hover:border-orange-300 hover:text-[#FF6B00]"
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
                                  {tb.is_annual_holiday && <span className="text-[10px] font-bold text-[#FF6B00] uppercase tracking-wider bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200/70">{t('dashboard.settings.calendar.annual')}</span>}
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
                      <span className="w-10 h-10 rounded-2xl bg-orange-50 border border-orange-200/60 flex items-center justify-center text-[#FF6B00] shadow-2xs shrink-0">
                        <Hash size={18} strokeWidth={2} />
                      </span>
                      <div>
                        <h3 className="text-xl md:text-2xl font-serif font-bold text-stone-900">{t('dashboard.settings.calendar.booking_lead_time')}</h3>
                        <p className="text-xs text-stone-400 font-medium">Antelación mínima permitida para reservas online</p>
                      </div>
                    </div>
                    <div className="p-5 bg-stone-50 border border-stone-200/70 rounded-2xl max-w-xl">
                      <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1.5">{t('dashboard.settings.calendar.margin_hours')}</label>
                      <input
                        id="agenda-booking-margin-hours"
                        type="number"
                        min="0"
                        step="0.5"
                        value={settings.booking_margin_hours === undefined || settings.booking_margin_hours === null ? "" : settings.booking_margin_hours}
                        onChange={e => {
                          const val = e.target.value;
                          setSettings({ ...settings, booking_margin_hours: val === "" ? "" : parseFloat(val) });
                        }}
                        className="w-full sm:w-48 px-4 py-2.5 bg-white border border-stone-200 rounded-xl focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20 font-mono font-bold text-stone-800 outline-none"
                      />
                      <p className="text-[11px] text-stone-500 mt-2 font-medium">{t('dashboard.settings.calendar.margin_hours_desc')}</p>
                    </div>
                  </div>
                </div>
                );
}

"use client"

import * as React from "react"
import { 
  CalendarDays, 
  MapPin, 
  Clock, 
  Trash2, 
  Plus, 
  AlertCircle, 
  Check, 
  Calendar,
  Layers,
  ChevronRight,
  ShieldCheck,
  Building,
  Loader2
} from "lucide-react"
import { toast } from "sonner"
import { useLanguage } from "@/app/contexts/LanguageContext"
import { useFeedback } from "@/app/contexts/FeedbackContext"

interface RosteringManagerProps {
  staffId: string
  staffName: string
  onClose?: () => void
}

interface Location {
  id: string
  name: string
  address: string
  is_active: boolean
}

interface StaffSchedule {
  id: string
  staff_id: string
  location_id: string
  day_of_week?: number
  specific_date?: string
  start_time: string
  end_time: string
  is_active: boolean
  created_at: string
}

export default function RosteringManager({ staffId, staffName, onClose }: RosteringManagerProps) {
  const { t } = useLanguage()
  const { showFeedback } = useFeedback()
  
  const [locations, setLocations] = React.useState<Location[]>([])
  const [schedules, setSchedules] = React.useState<StaffSchedule[]>([])
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)

  // Formulario Recurrente Semanal
  const [weeklyDay, setWeeklyDay] = React.useState<number>(1) // 1 = Lunes
  const [weeklyLocation, setWeeklyLocation] = React.useState<string>('')
  const [weeklyStart, setWeeklyStart] = React.useState<string>('09:00')
  const [weeklyEnd, setWeeklyEnd] = React.useState<string>('18:00')

  // Formulario Excepción por Fecha
  const [excDate, setExcDate] = React.useState<string>('')
  const [excLocation, setExcLocation] = React.useState<string>('')
  const [excStart, setExcStart] = React.useState<string>('09:00')
  const [excEnd, setExcEnd] = React.useState<string>('18:00')

  // Helper cookie reader
  const getCookie = (name: string): string | null => {
    if (typeof document === 'undefined') return null
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null
    return null
  }

  const getAuthHeaders = () => {
    const userSession = localStorage.getItem('user')
    let tenantId = getCookie('tenant_id') || ''
    let authToken = ''
    
    if (userSession) {
      try {
        const parsed = JSON.parse(userSession)
        if (!tenantId) {
          tenantId = parsed.tenant_id || ''
        }
        authToken = parsed.access_token || parsed.token || ''
      } catch (e) {
        console.error("Error parsing user session in RosteringManager:", e)
      }
    }
    return {
      'X-Tenant-ID': tenantId,
      'Authorization': authToken ? `Bearer ${authToken}` : '',
      'Content-Type': 'application/json'
    }
  }

  const fetchData = async () => {
    try {
      setLoading(true)
      const headers = getAuthHeaders()
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

      // 1. Obtener sedes
      const locRes = await fetch(`${API_URL}/locations/`, { headers })
      if (!locRes.ok) throw new Error()
      const locData = await locRes.json()
      const activeLocs = (locData || []).filter((l: any) => l.is_active)
      setLocations(activeLocs)
      if (activeLocs.length > 0) {
        setWeeklyLocation(activeLocs[0].id)
        setExcLocation(activeLocs[0].id)
      }

      // 2. Obtener horarios de este especialista
      const schedRes = await fetch(`${API_URL}/staff-schedules/?staff_id=${staffId}`, { headers })
      if (!schedRes.ok) throw new Error()
      const schedData = await schedRes.json()
      setSchedules(schedData || [])
    } catch (err) {
      console.error(err)
      toast.error("Error al cargar los horarios de la base de datos.")
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    if (staffId) {
      fetchData()
    }
  }, [staffId])

  const handleAddWeekly = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!weeklyLocation) {
      toast.error("Debes seleccionar una sede válida.")
      return
    }
    setSaving(true)
    try {
      const headers = getAuthHeaders()
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

      const payload = {
        staff_id: staffId,
        location_id: weeklyLocation,
        day_of_week: Number(weeklyDay),
        specific_date: null,
        start_time: weeklyStart,
        end_time: weeklyEnd,
        is_active: true
      }

      const res = await fetch(`${API_URL}/staff-schedules/`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      })

      if (!res.ok) throw new Error()
      
      toast.success("Turno semanal recurrente añadido.")
      fetchData()
    } catch (err) {
      toast.error("Fallo al guardar el turno semanal.")
    } finally {
      setSaving(false)
    }
  }

  const handleAddException = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!excDate) {
      toast.error("Debes seleccionar una fecha válida.")
      return
    }
    if (!excLocation) {
      toast.error("Debes seleccionar una sede válida.")
      return
    }
    setSaving(true)
    try {
      const headers = getAuthHeaders()
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

      const payload = {
        staff_id: staffId,
        location_id: excLocation,
        day_of_week: null,
        specific_date: excDate,
        start_time: excStart,
        end_time: excEnd,
        is_active: true
      }

      const res = await fetch(`${API_URL}/staff-schedules/`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      })

      if (!res.ok) throw new Error()

      toast.success("Excepción de fecha registrada.")
      setExcDate('')
      fetchData()
    } catch (err) {
      toast.error("Fallo al guardar la excepción.")
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteSchedule = (id: string, description: string) => {
    showFeedback({
      type: 'confirm',
      title: "¿Eliminar Turno?",
      message: `¿Estás seguro de que quieres eliminar el turno '${description}'? Las citas agendadas durante estas horas podrían quedarse sin asignación.`,
      confirmText: "Eliminar",
      cancelText: "Cancelar",
      onConfirm: async () => {
        try {
          const headers = getAuthHeaders()
          const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

          const res = await fetch(`${API_URL}/staff-schedules/${id}`, {
            method: 'DELETE',
            headers
          })

          if (!res.ok) throw new Error()
          
          toast.success("Turno eliminado correctamente.")
          fetchData()
        } catch (err) {
          toast.error("Error al eliminar el turno.")
        }
      }
    })
  }

  const handleToggleActive = async (sched: StaffSchedule) => {
    try {
      const headers = getAuthHeaders()
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

      const res = await fetch(`${API_URL}/staff-schedules/${sched.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          is_active: !sched.is_active
        })
      })

      if (!res.ok) throw new Error()
      
      toast.success(sched.is_active ? "Turno desactivado." : "Turno activado.")
      fetchData()
    } catch (err) {
      toast.error("Error al modificar el estado del turno.")
    }
  }

  const daysOfWeekNames = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]

  const weeklySchedules = schedules.filter(s => s.day_of_week !== null && s.day_of_week !== undefined)
  const exceptionSchedules = schedules.filter(s => s.specific_date !== null && s.specific_date !== undefined)

  if (loading) {
    return (
      <div className="space-y-6 py-6 animate-pulse">
        <div className="h-6 bg-stone-100 rounded-lg w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="h-64 bg-stone-50 rounded-2xl" />
          <div className="h-64 bg-stone-50 rounded-2xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Información del Especialista */}
      <div className="bg-stone-50 border border-stone-100 rounded-[2rem] p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#d4af37]/10 flex items-center justify-center text-[#bf9b30] border border-[#d4af37]/20 shadow-sm">
            <CalendarDays size={22} strokeWidth={1.5} />
          </div>
          <div>
            <h4 className="text-xl font-serif text-stone-800 leading-tight">Configuración de Rostering</h4>
            <p className="text-stone-400 font-semibold text-xs tracking-wide uppercase">
              Profesional: <span className="text-stone-700 font-bold">{staffName}</span>
            </p>
          </div>
        </div>
        {locations.length === 0 && (
          <div className="flex items-center gap-2 text-rose-500 bg-rose-50 border border-rose-100 rounded-xl px-4 py-2 text-xs font-semibold">
            <AlertCircle size={16} />
            <span>Debes tener al menos 1 sede activa para configurar turnos.</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* COLUMNA 1: TURNOS SEMANALES RECURRENTES */}
        <div className="bg-white border border-stone-100 rounded-[2.5rem] p-6 md:p-8 space-y-6 shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#bf9b30] bg-[#d4af37]/10 px-2.5 py-1 rounded-full border border-[#d4af37]/15">
              Horario Recurrente
            </span>
            <h3 className="text-2xl font-serif text-stone-800 pt-2 font-light">Turnos Semanales</h3>
            <p className="text-stone-400 text-xs font-medium">
              Define en qué sedes físicas atiende de forma habitual cada semana.
            </p>
          </div>

          {/* Formulario */}
          {locations.length > 0 && (
            <form onSubmit={handleAddWeekly} className="grid grid-cols-2 gap-4 bg-stone-50/50 border border-stone-100/50 p-5 rounded-2xl">
              <div className="space-y-1.5 col-span-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-stone-400">Día de la Semana</label>
                <select
                  value={weeklyDay}
                  onChange={(e) => setWeeklyDay(Number(e.target.value))}
                  className="w-full bg-white border border-stone-200/60 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#d4af37]/20 focus:border-[#d4af37] font-semibold text-stone-700"
                >
                  {daysOfWeekNames.map((name, i) => (
                    <option key={i} value={i + 1}>{name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5 col-span-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-stone-400">Sede Física</label>
                <select
                  value={weeklyLocation}
                  onChange={(e) => setWeeklyLocation(e.target.value)}
                  className="w-full bg-white border border-stone-200/60 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#d4af37]/20 focus:border-[#d4af37] font-semibold text-stone-700"
                >
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-stone-400">Hora Entrada</label>
                <input
                  type="time"
                  value={weeklyStart}
                  onChange={(e) => setWeeklyStart(e.target.value)}
                  className="w-full bg-white border border-stone-200/60 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#d4af37]/20 focus:border-[#d4af37] font-semibold text-stone-700"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-stone-400">Hora Salida</label>
                <input
                  type="time"
                  value={weeklyEnd}
                  onChange={(e) => setWeeklyEnd(e.target.value)}
                  className="w-full bg-white border border-stone-200/60 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#d4af37]/20 focus:border-[#d4af37] font-semibold text-stone-700"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="col-span-2 mt-2 bg-stone-950 hover:bg-[#d4af37] hover:text-stone-950 text-white font-bold text-[10px] uppercase tracking-widest py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 size={12} className="animate-spin" /> : <Plus size={14} />}
                Añadir Turno Semanal
              </button>
            </form>
          )}

          {/* Listado de turnos semanales */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-black uppercase tracking-widest text-stone-400">Turnos Programados</h4>
            {weeklySchedules.length === 0 ? (
              <p className="text-stone-400 font-medium text-xs py-4 text-center bg-stone-50/50 rounded-xl border border-dashed border-stone-100">
                No hay turnos semanales definidos.
              </p>
            ) : (
              <div className="space-y-2.5 max-h-[300px] overflow-y-auto scrollbar-hide">
                {weeklySchedules.map((sched) => {
                  const dayName = daysOfWeekNames[(sched.day_of_week || 1) - 1]
                  const loc = locations.find(l => l.id === sched.location_id)
                  const locName = loc ? loc.name : "Sede Desconocida"

                  return (
                    <div 
                      key={sched.id} 
                      className={`flex items-center justify-between p-3.5 border rounded-xl transition-all ${
                        sched.is_active ? 'bg-white border-stone-100 shadow-sm' : 'bg-stone-50 border-stone-200/40 opacity-50'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-stone-800 text-sm">{dayName}</span>
                          <span className="text-[10px] bg-stone-100 border border-stone-200/40 px-2 py-0.5 rounded-full font-medium text-stone-500">
                            {sched.start_time} - {sched.end_time}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-stone-400 font-medium">
                          <MapPin size={12} className="text-[#d4af37]" />
                          <span>{locName}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleActive(sched)}
                          className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-all ${
                            sched.is_active 
                              ? 'border-green-200 text-green-600 bg-green-50 hover:bg-green-100/60' 
                              : 'border-stone-200 text-stone-400 bg-stone-100 hover:bg-stone-200/40'
                          }`}
                          title={sched.is_active ? "Desactivar" : "Activar"}
                        >
                          <Check size={14} strokeWidth={2.5} />
                        </button>
                        <button
                          onClick={() => handleDeleteSchedule(sched.id, `${dayName} (${locName})`)}
                          className="w-7 h-7 rounded-lg border border-transparent text-stone-400 hover:text-rose-500 hover:bg-rose-50 flex items-center justify-center transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* COLUMNA 2: EXCEPCIONES Y FECHAS ESPECÍFICAS */}
        <div className="bg-white border border-stone-100 rounded-[2.5rem] p-6 md:p-8 space-y-6 shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#bf9b30] bg-[#d4af37]/10 px-2.5 py-1 rounded-full border border-[#d4af37]/15">
              Planificación Excepcional
            </span>
            <h3 className="text-2xl font-serif text-stone-800 pt-2 font-light">Excepciones por Fecha</h3>
            <p className="text-stone-400 text-xs font-medium">
              Sobrescribe el horario habitual para un día concreto (ej. eventos, guardias excepcionales).
            </p>
          </div>

          {/* Formulario */}
          {locations.length > 0 && (
            <form onSubmit={handleAddException} className="grid grid-cols-2 gap-4 bg-stone-50/50 border border-stone-100/50 p-5 rounded-2xl font-sans">
              <div className="space-y-1.5 col-span-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-stone-400">Fecha de la Excepción</label>
                <input
                  type="date"
                  value={excDate}
                  onChange={(e) => setExcDate(e.target.value)}
                  className="w-full bg-white border border-stone-200/60 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#d4af37]/20 focus:border-[#d4af37] font-semibold text-stone-700"
                  required
                />
              </div>

              <div className="space-y-1.5 col-span-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-stone-400">Sede Soportada</label>
                <select
                  value={excLocation}
                  onChange={(e) => setExcLocation(e.target.value)}
                  className="w-full bg-white border border-stone-200/60 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#d4af37]/20 focus:border-[#d4af37] font-semibold text-stone-700"
                >
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-stone-400">Hora Entrada</label>
                <input
                  type="time"
                  value={excStart}
                  onChange={(e) => setExcStart(e.target.value)}
                  className="w-full bg-white border border-stone-200/60 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#d4af37]/20 focus:border-[#d4af37] font-semibold text-stone-700"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-stone-400">Hora Salida</label>
                <input
                  type="time"
                  value={excEnd}
                  onChange={(e) => setExcEnd(e.target.value)}
                  className="w-full bg-white border border-stone-200/60 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#d4af37]/20 focus:border-[#d4af37] font-semibold text-stone-700"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="col-span-2 mt-2 bg-stone-950 hover:bg-[#d4af37] hover:text-stone-950 text-white font-bold text-[10px] uppercase tracking-widest py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 size={12} className="animate-spin" /> : <Plus size={14} />}
                Añadir Excepción de Fecha
              </button>
            </form>
          )}

          {/* Listado de excepciones */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-black uppercase tracking-widest text-stone-400">Excepciones Activas</h4>
            {exceptionSchedules.length === 0 ? (
              <p className="text-stone-400 font-medium text-xs py-4 text-center bg-stone-50/50 rounded-xl border border-dashed border-stone-100">
                No hay excepciones registradas.
              </p>
            ) : (
              <div className="space-y-2.5 max-h-[300px] overflow-y-auto scrollbar-hide">
                {exceptionSchedules.map((sched) => {
                  const dateFormatted = sched.specific_date ? new Date(sched.specific_date).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  }) : "Fecha inválida"

                  const loc = locations.find(l => l.id === sched.location_id)
                  const locName = loc ? loc.name : "Sede Desconocida"

                  return (
                    <div 
                      key={sched.id} 
                      className={`flex items-center justify-between p-3.5 border rounded-xl transition-all ${
                        sched.is_active ? 'bg-white border-stone-100 shadow-sm' : 'bg-stone-50 border-stone-200/40 opacity-50'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-stone-800 text-sm">{dateFormatted}</span>
                          <span className="text-[10px] bg-stone-100 border border-stone-200/40 px-2 py-0.5 rounded-full font-medium text-[#bf9b30] bg-[#d4af37]/5">
                            {sched.start_time} - {sched.end_time}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-stone-400 font-medium">
                          <MapPin size={12} className="text-[#d4af37]" />
                          <span>{locName}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleActive(sched)}
                          className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-all ${
                            sched.is_active 
                              ? 'border-green-200 text-green-600 bg-green-50 hover:bg-green-100/60' 
                              : 'border-stone-200 text-stone-400 bg-stone-100 hover:bg-stone-200/40'
                          }`}
                          title={sched.is_active ? "Desactivar" : "Activar"}
                        >
                          <Check size={14} strokeWidth={2.5} />
                        </button>
                        <button
                          onClick={() => handleDeleteSchedule(sched.id, `${dateFormatted} (${locName})`)}
                          className="w-7 h-7 rounded-lg border border-transparent text-stone-400 hover:text-rose-500 hover:bg-rose-50 flex items-center justify-center transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}

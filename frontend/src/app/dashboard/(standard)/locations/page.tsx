"use client"

import * as React from "react"
import { 
  MapPin, 
  Phone, 
  Mail, 
  Plus, 
  Edit2, 
  Trash2, 
  Building, 
  Check, 
  X,
  Sparkles,
  ChevronRight
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useFeedback } from "@/app/contexts/FeedbackContext"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useAuthRole } from "@/hooks/useAuthRole"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useLanguage } from "@/app/contexts/LanguageContext"
import PlanLimitsCard from "@/components/PlanLimitsCard"

interface Location {
  id: string
  name: string
  address: string
  phone?: string
  email?: string
  is_active: boolean
  created_at: string
}

export default function LocationsPage() {
  const { t } = useLanguage()
  const router = useRouter()
  const { role, loading: loadingRole } = useAuthRole()
  const { showFeedback } = useFeedback()
  
  const [locations, setLocations] = React.useState<Location[]>([])
  const [limitsData, setLimitsData] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [isCreateOpen, setIsCreateOpen] = React.useState(false)
  const [isEditOpen, setIsEditOpen] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  
  const [locationToEdit, setLocationToEdit] = React.useState<Location | null>(null)
  const [formData, setFormData] = React.useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    is_active: true
  })

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
        console.error("Error parsing user session in locations page:", e)
      }
    }
    return {
      'X-Tenant-ID': tenantId,
      'Authorization': authToken ? `Bearer ${authToken}` : '',
      'Content-Type': 'application/json'
    }
  }

  const fetchLocationsAndLimits = async () => {
    try {
      setLoading(true)
      const headers = getAuthHeaders()
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      
      // Fetch locations list
      const locRes = await fetch(`${API_URL}/locations/`, { headers })
      if (!locRes.ok) throw new Error("Failed to fetch locations")
      const locData = await locRes.json()
      setLocations(locData || [])

      // Fetch limits
      const limitsRes = await fetch(`${API_URL}/settings/limits`, { headers })
      if (limitsRes.ok) {
        const data = await limitsRes.json()
        setLimitsData(data)
      }
    } catch (err) {
      console.error("Error al cargar sedes:", err)
      toast.error("Error al conectar con el servidor de sedes.")
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    if (!loadingRole) {
      const currentRole = role?.toLowerCase()
      if (currentRole !== 'administrador' && currentRole !== 'admin') {
        toast.error("Acceso denegado: Solo el Administrador puede gestionar las sedes de la clínica.")
        router.replace('/dashboard')
      } else {
        fetchLocationsAndLimits()
      }
    }
  }, [role, loadingRole, router])

  const handleCreateOpen = () => {
    // Verificar si se ha alcanzado el límite permitido en el plan
    if (limitsData) {
      const maxLocations = limitsData.limits?.locations || 1
      const activeCount = locations.filter(l => l.is_active).length
      
      if (activeCount >= maxLocations) {
        // Traspasado el límite: Disparar el paywall premium con FeedbackModal
        showFeedback({
          type: 'confirm',
          title: "Expande tus Sedes",
          message: `Has alcanzado el límite de ${maxLocations} sedes físicas incluido en tu plan actual '${limitsData.plan_type.toUpperCase()}'. Para gestionar más sucursales y conectar agendas cruzadas, te invitamos a mejorar tu plan de suscripción.`,
          confirmText: "Mejorar Plan",
          cancelText: "Más tarde",
          onConfirm: () => {
            router.push('/dashboard/settings?tab=subscription')
          }
        })
        return
      }
    }
    
    // Si no está al límite, abrir modal limpio
    setFormData({
      name: '',
      address: '',
      phone: '',
      email: '',
      is_active: true
    })
    setIsCreateOpen(true)
  }

  const handleCreateLocation = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const headers = getAuthHeaders()
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

      const res = await fetch(`${API_URL}/locations/`, {
        method: 'POST',
        headers,
        body: JSON.stringify(formData)
      })

      if (res.status === 403) {
        const errorData = await res.json()
        toast.error(errorData.detail || "Límite del plan excedido.")
        setIsCreateOpen(false)
        return
      }

      if (!res.ok) throw new Error("Error creating location")
      
      toast.success("Sede física creada correctamente.")
      setIsCreateOpen(false)
      fetchLocationsAndLimits()
    } catch (err) {
      console.error(err)
      toast.error("Fallo al guardar la sede.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditOpen = (location: Location) => {
    setLocationToEdit(location)
    setFormData({
      name: location.name,
      address: location.address,
      phone: location.phone || '',
      email: location.email || '',
      is_active: location.is_active
    })
    setIsEditOpen(true)
  }

  const handleUpdateLocation = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!locationToEdit) return
    setIsSubmitting(true)
    try {
      const headers = getAuthHeaders()
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

      const res = await fetch(`${API_URL}/locations/${locationToEdit.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(formData)
      })

      if (!res.ok) throw new Error("Error updating location")

      toast.success("Información de sede actualizada.")
      setIsEditOpen(false)
      fetchLocationsAndLimits()
    } catch (err) {
      console.error(err)
      toast.error("Error al actualizar la sede.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleStatus = async (location: Location) => {
    // Si la vamos a activar, verificar límite
    if (!location.is_active && limitsData) {
      const maxLocations = limitsData.limits?.locations || 1
      const activeCount = locations.filter(l => l.is_active).length
      
      if (activeCount >= maxLocations) {
        showFeedback({
          type: 'confirm',
          title: "Límite Alcanzado",
          message: `No puedes activar esta sede. Has alcanzado el límite de ${maxLocations} sedes activas contratado en tu plan '${limitsData.plan_type.toUpperCase()}'. Mejora tu suscripción para habilitarla.`,
          confirmText: "Mejorar Plan",
          cancelText: "Cerrar",
          onConfirm: () => {
            router.push('/dashboard/settings?tab=subscription')
          }
        })
        return
      }
    }

    try {
      const headers = getAuthHeaders()
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

      const res = await fetch(`${API_URL}/locations/${location.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          name: location.name,
          address: location.address,
          phone: location.phone,
          email: location.email,
          is_active: !location.is_active
        })
      })

      if (!res.ok) throw new Error()
      
      toast.success(location.is_active ? "Sede desactivada correctamente." : "Sede activada correctamente.")
      fetchLocationsAndLimits()
    } catch (err) {
      toast.error("Error al cambiar el estado de la sede.")
    }
  }

  const handleDeleteLocation = (location: Location) => {
    showFeedback({
      type: 'confirm',
      title: "¿Eliminar Sede?",
      message: `¿Estás seguro de que quieres eliminar la sede '${location.name}'? Esta acción es definitiva y podría invalidar turnos o citas ya agendadas en esta ubicación.`,
      confirmText: "Eliminar Definitivamente",
      cancelText: "Cancelar",
      onConfirm: async () => {
        try {
          const headers = getAuthHeaders()
          const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

          const res = await fetch(`${API_URL}/locations/${location.id}`, {
            method: 'DELETE',
            headers
          })

          if (!res.ok) throw new Error()
          
          toast.success("Sede eliminada de forma irreversible.")
          fetchLocationsAndLimits()
        } catch (err) {
          toast.error("Error al eliminar la sede.")
        }
      }
    })
  }

  if (loadingRole || (role?.toLowerCase() !== 'administrador' && role?.toLowerCase() !== 'admin')) {
    return (
      <div className="flex flex-col gap-4 justify-center items-center h-[60vh] animate-in fade-in duration-500">
        <Skeleton className="w-16 h-16 rounded-2xl" />
        <Skeleton className="w-48 h-6 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-16">
      {/* Header Sección */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-4">
            <h1 className="text-5xl font-serif font-semibold text-stone-800 tracking-tight">
              Sedes de la Clínica
            </h1>
            <PlanLimitsCard type="locations" />
          </div>
          <p className="text-stone-400 font-medium max-w-lg">
            Administra tus centros médicos, cabinas estéticas y sucursales físicas donde tu equipo presta servicio.
          </p>
        </div>

        <button 
          onClick={handleCreateOpen}
          className="flex items-center gap-2.5 bg-stone-900 hover:bg-[#d4af37] hover:text-stone-950 text-white px-6 py-3.5 rounded-2xl font-bold text-sm transition-all shadow-lg active:scale-95 duration-300 shrink-0"
        >
          <Plus size={18} strokeWidth={2} />
          Nueva Sede
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="bg-white border border-stone-100 rounded-2xl p-6 space-y-4">
              <Skeleton className="h-7 w-2/3 rounded-lg" />
              <Skeleton className="h-4 w-5/6 rounded-lg" />
              <div className="space-y-2 pt-2">
                <Skeleton className="h-4 w-1/2 rounded-lg" />
                <Skeleton className="h-4 w-1/3 rounded-lg" />
              </div>
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          ))}
        </div>
      ) : locations.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center p-12 bg-white border border-stone-100 rounded-2xl shadow-sm space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-stone-50 border border-stone-100 flex items-center justify-center text-stone-400">
            <Building size={32} strokeWidth={1.2} />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-serif text-stone-800">No hay sedes registradas</h3>
            <p className="text-stone-400 text-sm max-w-xs">
              Comienza registrando tu clínica central para poder planificar los turnos de tu equipo.
            </p>
          </div>
          <button 
            onClick={handleCreateOpen}
            className="text-stone-800 font-bold border-b-2 border-stone-900 hover:text-[#d4af37] hover:border-[#d4af37] transition-all py-0.5 text-sm"
          >
            Dar de alta mi primera sede
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {locations.map((loc) => (
            <div 
              key={loc.id} 
              className={`bg-white border transition-all duration-300 rounded-2xl p-6 flex flex-col justify-between hover:shadow-lg relative overflow-hidden ${
                loc.is_active ? 'border-stone-200/60 shadow-sm' : 'border-stone-100 opacity-60'
              }`}
            >
              {/* Luxury gold accent inside active locations */}
              {loc.is_active && (
                <div className="absolute top-0 right-0 w-24 h-1 bg-gradient-to-r from-stone-900 via-[#d4af37] to-stone-900" />
              )}

              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="font-serif text-2xl font-light text-stone-800 tracking-tight leading-tight">
                      {loc.name}
                    </h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      loc.is_active 
                        ? 'bg-[#d4af37]/10 text-[#bf9b30] border border-[#d4af37]/15' 
                        : 'bg-stone-100 text-stone-400 border border-stone-200/40'
                    }`}>
                      {loc.is_active ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2.5 pt-2 text-stone-500 font-medium text-sm">
                  <div className="flex items-start gap-2.5">
                    <MapPin size={16} className="text-[#d4af37] shrink-0 mt-0.5" />
                    <span>{loc.address}</span>
                  </div>
                  
                  {loc.phone && (
                    <div className="flex items-center gap-2.5">
                      <Phone size={16} className="text-[#d4af37] shrink-0" />
                      <span>{loc.phone}</span>
                    </div>
                  )}

                  {loc.email && (
                    <div className="flex items-center gap-2.5">
                      <Mail size={16} className="text-[#d4af37] shrink-0" />
                      <span className="truncate max-w-[200px]">{loc.email}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex items-center justify-between border-t border-stone-100 mt-6 pt-4 gap-2">
                <button
                  onClick={() => handleToggleStatus(loc)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all duration-300 flex items-center gap-1.5 ${
                    loc.is_active
                      ? 'border-stone-200 text-stone-500 hover:bg-stone-50'
                      : 'border-[#d4af37]/30 text-[#bf9b30] hover:bg-[#d4af37]/5 bg-transparent'
                  }`}
                >
                  {loc.is_active ? (
                    <>
                      <X size={12} />
                      Desactivar
                    </>
                  ) : (
                    <>
                      <Check size={12} />
                      Activar
                    </>
                  )}
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleEditOpen(loc)}
                    className="p-2 text-stone-400 hover:text-stone-800 hover:bg-stone-50 rounded-xl transition-all"
                    title="Editar Sede"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteLocation(loc)}
                    className="p-2 text-stone-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                    title="Eliminar Sede"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DIALOG DE CREACIÓN */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-[2rem] p-8 bg-white border-stone-100 shadow-2xl">
          <DialogHeader className="mb-4">
            <DialogTitle className="font-serif italic text-2xl text-stone-800">Crear Nueva Sede</DialogTitle>
            <DialogDescription className="text-stone-400 font-medium">
              Da de alta una nueva clínica o cabina física para expandir la disponibilidad de reservas de tu equipo.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateLocation} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">
                Nombre de la Sede
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4af37]/20 focus:border-[#d4af37] transition-all font-sans font-medium"
                placeholder="Ej. Clínica Mercè - Sarrià"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">
                Dirección Física
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4af37]/20 focus:border-[#d4af37] transition-all font-sans font-medium"
                placeholder="Calle Mayor 45, Barcelona"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">
                  Teléfono
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4af37]/20 focus:border-[#d4af37] transition-all font-sans font-medium"
                  placeholder="932 456 789"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">
                  Email de Contacto
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4af37]/20 focus:border-[#d4af37] transition-all font-sans font-medium"
                  placeholder="sarria@clinicamerce.com"
                />
              </div>
            </div>

            <DialogFooter className="pt-6">
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="text-stone-400 hover:text-stone-700 transition-all font-bold text-xs uppercase tracking-wider px-4 py-2"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-stone-950 hover:bg-[#d4af37] hover:text-stone-950 text-white font-bold text-xs uppercase tracking-widest px-6 py-3.5 rounded-full transition-all duration-300 active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? "Creando..." : "Crear Sede"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIALOG DE EDICIÓN */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-[2rem] p-8 bg-white border-stone-100 shadow-2xl">
          <DialogHeader className="mb-4">
            <DialogTitle className="font-serif italic text-2xl text-stone-800">Editar Sede</DialogTitle>
            <DialogDescription className="text-stone-400 font-medium">
              Modifica la información general de la sede física seleccionada.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdateLocation} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">
                Nombre de la Sede
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4af37]/20 focus:border-[#d4af37] transition-all font-sans font-medium"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">
                Dirección Física
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4af37]/20 focus:border-[#d4af37] transition-all font-sans font-medium"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">
                  Teléfono
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4af37]/20 focus:border-[#d4af37] transition-all font-sans font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">
                  Email de Contacto
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4af37]/20 focus:border-[#d4af37] transition-all font-sans font-medium"
                />
              </div>
            </div>

            <DialogFooter className="pt-6">
              <button
                type="button"
                onClick={() => setIsEditOpen(false)}
                className="text-stone-400 hover:text-stone-700 transition-all font-bold text-xs uppercase tracking-wider px-4 py-2"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-stone-950 hover:bg-[#d4af37] hover:text-stone-950 text-white font-bold text-xs uppercase tracking-widest px-6 py-3.5 rounded-full transition-all duration-300 active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? "Guardando..." : "Guardar Cambios"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

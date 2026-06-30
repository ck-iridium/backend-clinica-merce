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
  Home,
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
  latitude?: number
  longitude?: number
  created_at: string
}

export default function LocationsPage() {
  const { t } = useLanguage()
  const router = useRouter()
  const { role, loading: loadingRole } = useAuthRole()
  const { showFeedback } = useFeedback()
  
  const [locations, setLocations] = React.useState<Location[]>([])
  const [limitsData, setLimitsData] = React.useState<any>(null)
  const [serviceModality, setServiceModality] = React.useState<string>('clinic') // 'clinic', 'home', 'both'
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
    is_active: true,
    latitude: null as number | null,
    longitude: null as number | null
  })

  const [suggestions, setSuggestions] = React.useState<any[]>([])
  const [loadingSuggestions, setLoadingSuggestions] = React.useState(false)
  const searchTimeoutRef = React.useRef<any>(null)

  const mapContainerRef = React.useRef<HTMLDivElement | null>(null)
  const mapRef = React.useRef<any | null>(null)
  const markerRef = React.useRef<any | null>(null)

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
        if (!tenantId) tenantId = parsed.tenant_id || ''
        authToken = parsed.access_token || parsed.token || ''
      } catch (e) { /* ignore */ }
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
      
      const [locRes, limitsRes, settingsRes] = await Promise.all([
        fetch(`${API_URL}/locations/`, { headers }),
        fetch(`${API_URL}/settings/limits`, { headers }),
        fetch(`${API_URL}/settings/`, { headers })
      ])

      if (locRes.ok) setLocations(await locRes.json() || [])
      if (limitsRes.ok) setLimitsData(await limitsRes.json())
      if (settingsRes.ok) {
        const settings = await settingsRes.json()
        setServiceModality(settings.service_modality || 'clinic')
      }
    } catch (err) {
      toast.error(t('dashboard.locations.toast_error_load'))
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    if (!loadingRole) {
      const currentRole = role?.toLowerCase()
      if (currentRole !== 'administrador' && currentRole !== 'admin') {
        toast.error("Acceso denegado")
        router.replace('/dashboard')
      } else {
        fetchLocationsAndLimits()
      }
    }
  }, [role, loadingRole, router])

  const isHomeOnly = serviceModality === 'home'

  const handleCreateOpen = () => {
    if (limitsData) {
      const maxLocations = limitsData.limits?.locations || 1
      const activeCount = locations.filter(l => l.is_active).length
      if (activeCount >= maxLocations) {
        showFeedback({
          type: 'confirm',
          title: t('dashboard.locations.paywall_title'),
          message: `Has alcanzado el límite de ${maxLocations} sedes para tu plan '${limitsData.plan_type?.toUpperCase()}'. Mejora tu plan para añadir más sucursales.`,
          confirmText: t('dashboard.locations.paywall_upgrade'),
          cancelText: t('dashboard.locations.paywall_later'),
          onConfirm: () => router.push('/dashboard/settings?tab=subscription')
        })
        return
      }
    }
    setFormData({ name: '', address: '', phone: '', email: '', is_active: true, latitude: 39.151, longitude: -0.437 })
    setIsCreateOpen(true)
  }

  // Load Leaflet resources and initialize/destroy map inside Dialogs
  React.useEffect(() => {
    if (isCreateOpen || isEditOpen) {
      const linkId = 'leaflet-css-cdn';
      if (!document.getElementById(linkId)) {
        const link = document.createElement('link');
        link.id = linkId;
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      if (!(window as any).L) {
        const scriptId = 'leaflet-js-cdn';
        if (!document.getElementById(scriptId)) {
          const script = document.createElement('script');
          script.id = scriptId;
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          script.onload = () => {
            initDialogMap();
          };
          document.body.appendChild(script);
        }
      } else {
        setTimeout(() => {
          initDialogMap();
        }, 150);
      }
    } else {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    }
  }, [isCreateOpen, isEditOpen]);

  // Synchronize Leaflet marker position when coordinates change manually
  React.useEffect(() => {
    if ((isCreateOpen || isEditOpen) && mapRef.current && formData.latitude && formData.longitude) {
      const L = (window as any).L;
      if (!L) return;
      
      const newPos = [formData.latitude, formData.longitude] as [number, number];
      mapRef.current.setView(newPos, 15);
      
      if (markerRef.current) {
        markerRef.current.setLatLng(newPos);
      } else {
        const goldIcon = L.icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        });
        const marker = L.marker(newPos, { icon: goldIcon, draggable: true }).addTo(mapRef.current);
        markerRef.current = marker;
        
        marker.on('dragend', () => {
          const latLng = marker.getLatLng();
          setFormData(prev => ({
            ...prev,
            latitude: latLng.lat,
            longitude: latLng.lng
          }));
          reverseGeocode(latLng.lat, latLng.lng);
        });
      }
    }
  }, [formData.latitude, formData.longitude]);

  const initDialogMap = () => {
    if (!mapContainerRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    if (mapRef.current) {
      mapRef.current.remove();
    }

    const lat = formData.latitude || 39.151;
    const lon = formData.longitude || -0.437;

    const map = L.map(mapContainerRef.current).setView([lat, lon], 15);
    mapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    const goldIcon = L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    const marker = L.marker([lat, lon], { icon: goldIcon, draggable: true }).addTo(map);
    markerRef.current = marker;

    marker.on('dragend', () => {
      const latLng = marker.getLatLng();
      setFormData(prev => ({
        ...prev,
        latitude: latLng.lat,
        longitude: latLng.lng
      }));
      reverseGeocode(latLng.lat, latLng.lng);
    });
  };

  const reverseGeocode = async (lat: number, lon: number) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.display_name) {
          setFormData(prev => ({ ...prev, address: data.display_name }));
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, address: value }));

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (value.length < 3) {
      setSuggestions([]);
      return;
    }

    setLoadingSuggestions(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            value
          )}&limit=5&addressdetails=1&countrycodes=es,fr`
        );
        if (res.ok) {
          const data = await res.json();
          setSuggestions(
            data.map((item: any) => ({
              id: item.place_id,
              display_name: item.display_name,
              lat: parseFloat(item.lat),
              lon: parseFloat(item.lon)
            }))
          );
        }
      } catch (err) {
        console.error('Error al obtener sugerencias de dirección:', err);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 450);
  };

  const handleSelectSuggestion = (suggestion: any) => {
    setSuggestions([]);
    setFormData(prev => ({
      ...prev,
      address: suggestion.display_name,
      latitude: suggestion.lat,
      longitude: suggestion.lon
    }));
  };

  const handleCreateLocation = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const headers = getAuthHeaders()
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const res = await fetch(`${API_URL}/locations/`, { method: 'POST', headers, body: JSON.stringify(formData) })
      if (res.status === 403) {
        toast.error(t('dashboard.locations.limit_exceeded'))
        setIsCreateOpen(false)
        return
      }
      if (!res.ok) throw new Error()
      toast.success(t('dashboard.locations.toast_created'))
      setIsCreateOpen(false)
      fetchLocationsAndLimits()
    } catch {
      toast.error(t('dashboard.locations.toast_error_save'))
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
      is_active: location.is_active,
      latitude: location.latitude || 39.151,
      longitude: location.longitude || -0.437
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
      const res = await fetch(`${API_URL}/locations/${locationToEdit.id}`, { method: 'PUT', headers, body: JSON.stringify(formData) })
      if (!res.ok) throw new Error()
      toast.success(t('dashboard.locations.toast_updated'))
      setIsEditOpen(false)
      fetchLocationsAndLimits()
    } catch {
      toast.error(t('dashboard.locations.toast_error_update'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleStatus = async (location: Location) => {
    if (!location.is_active && limitsData) {
      const maxLocations = limitsData.limits?.locations || 1
      const activeCount = locations.filter(l => l.is_active).length
      if (activeCount >= maxLocations) {
        showFeedback({
          type: 'confirm',
          title: "Límite Alcanzado",
          message: `No puedes activar esta sede. Has alcanzado el límite de ${maxLocations} sedes activas en tu plan '${limitsData.plan_type?.toUpperCase()}'.`,
          confirmText: t('dashboard.locations.paywall_upgrade'),
          cancelText: "Cerrar",
          onConfirm: () => router.push('/dashboard/settings?tab=subscription')
        })
        return
      }
    }
    try {
      const headers = getAuthHeaders()
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const res = await fetch(`${API_URL}/locations/${location.id}`, { method: 'PUT', headers, body: JSON.stringify({ ...location, is_active: !location.is_active }) })
      if (!res.ok) throw new Error()
      toast.success(location.is_active ? t('dashboard.locations.toast_deactivated') : t('dashboard.locations.toast_activated'))
      fetchLocationsAndLimits()
    } catch {
      toast.error(t('dashboard.locations.toast_error_status'))
    }
  }

  const handleDeleteLocation = (location: Location) => {
    showFeedback({
      type: 'confirm',
      title: t('dashboard.locations.delete_confirm_title'),
      message: `¿Estás seguro de que quieres eliminar la sede '${location.name}'? Esta acción es definitiva y podría invalidar turnos ya agendados en esta ubicación.`,
      confirmText: t('dashboard.locations.delete_confirm_btn'),
      cancelText: t('dashboard.locations.cancel'),
      onConfirm: async () => {
        try {
          const headers = getAuthHeaders()
          const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
          const res = await fetch(`${API_URL}/locations/${location.id}`, { method: 'DELETE', headers })
          if (!res.ok) throw new Error()
          toast.success(t('dashboard.locations.toast_deleted'))
          fetchLocationsAndLimits()
        } catch {
          toast.error(t('dashboard.locations.toast_error_delete'))
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-4">
            <h1 className="text-5xl font-serif font-semibold text-stone-800 tracking-tight">
              {t('dashboard.locations.title')}
            </h1>
            <PlanLimitsCard type="locations" />
          </div>
          <p className="text-stone-400 font-medium max-w-lg">
            {t('dashboard.locations.subtitle')}
          </p>
        </div>

        {!isHomeOnly && (
          <button
            id="locations-add-btn"
            onClick={handleCreateOpen}
            className="flex items-center gap-2.5 bg-stone-900 hover:bg-[#d4af37] hover:text-stone-950 text-white px-6 py-3.5 rounded-2xl font-bold text-sm transition-all shadow-lg active:scale-95 duration-300 shrink-0"
          >
            <Plus size={18} strokeWidth={2} />
            {t('dashboard.locations.add_btn')}
          </button>
        )}
      </div>

      {/* Banner para profesionales a domicilio */}
      {isHomeOnly && (
        <div className="bg-[#d4af37]/5 border border-[#d4af37]/20 rounded-[2rem] p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#d4af37]/10 border border-[#d4af37]/20 flex items-center justify-center text-[#bf9b30] shrink-0">
              <Home size={22} strokeWidth={1.5} />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-stone-800 text-lg">{t('dashboard.locations.home_service_notice')}</h3>
              <p className="text-stone-500 text-sm font-medium max-w-lg leading-relaxed">
                {t('dashboard.locations.home_service_desc')}
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push('/dashboard/settings?tab=domicilio')}
            className="flex items-center gap-2 text-[#bf9b30] font-bold text-sm border border-[#d4af37]/30 px-4 py-2.5 rounded-xl hover:bg-[#d4af37]/10 transition-all shrink-0"
          >
            {t('dashboard.locations.home_service_config')}
            <ChevronRight size={14} />
          </button>
        </div>
      )}

      {/* Content */}
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
      ) : locations.length === 0 && !isHomeOnly ? (
        <div className="flex flex-col items-center justify-center text-center p-12 bg-white border border-stone-100 rounded-2xl shadow-sm space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-stone-50 border border-stone-100 flex items-center justify-center text-stone-400">
            <Building size={32} strokeWidth={1.2} />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-serif text-stone-800">{t('dashboard.locations.empty_title')}</h3>
            <p className="text-stone-400 text-sm max-w-xs">{t('dashboard.locations.empty_desc')}</p>
          </div>
          <button
            onClick={handleCreateOpen}
            className="text-stone-800 font-bold border-b-2 border-stone-900 hover:text-[#d4af37] hover:border-[#d4af37] transition-all py-0.5 text-sm"
          >
            {t('dashboard.locations.empty_cta')}
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
              {loc.is_active && (
                <div className="absolute top-0 right-0 w-24 h-1 bg-gradient-to-r from-stone-900 via-[#d4af37] to-stone-900" />
              )}
              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="font-serif text-2xl font-light text-stone-800 tracking-tight leading-tight">{loc.name}</h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    loc.is_active
                      ? 'bg-[#d4af37]/10 text-[#bf9b30] border border-[#d4af37]/15'
                      : 'bg-stone-100 text-stone-400 border border-stone-200/40'
                  }`}>
                    {loc.is_active ? t('dashboard.locations.active_badge') : t('dashboard.locations.inactive_badge')}
                  </span>
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

              <div className="flex items-center justify-between border-t border-stone-100 mt-6 pt-4 gap-2">
                <button
                  id={`locations-toggle-status-btn-${loc.id}`}
                  onClick={() => handleToggleStatus(loc)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all duration-300 flex items-center gap-1.5 ${
                    loc.is_active
                      ? 'border-stone-200 text-stone-500 hover:bg-stone-50'
                      : 'border-[#d4af37]/30 text-[#bf9b30] hover:bg-[#d4af37]/5'
                  }`}
                >
                  {loc.is_active ? <><X size={12} />{t('dashboard.locations.deactivate_btn')}</> : <><Check size={12} />{t('dashboard.locations.activate_btn')}</>}
                </button>
                <div className="flex items-center gap-1.5">
                  <button id={`locations-edit-btn-${loc.id}`} onClick={() => handleEditOpen(loc)} className="p-2 text-stone-400 hover:text-stone-800 hover:bg-stone-50 rounded-xl transition-all" title={t('dashboard.locations.edit_btn')}>
                    <Edit2 size={16} />
                  </button>
                  <button id={`locations-delete-btn-${loc.id}`} onClick={() => handleDeleteLocation(loc)} className="p-2 text-stone-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all" title={t('dashboard.locations.delete_btn')}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DIALOG CREACIÓN */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-[2rem] p-8 bg-white border-stone-100 shadow-2xl">
          <DialogHeader className="mb-4">
            <DialogTitle className="font-serif italic text-2xl text-stone-800">{t('dashboard.locations.create_title')}</DialogTitle>
            <DialogDescription className="text-stone-400 font-medium">{t('dashboard.locations.create_desc')}</DialogDescription>
          </DialogHeader>
          <form id="locations-create-form" onSubmit={handleCreateLocation} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">{t('dashboard.locations.name_label')}</label>
              <input id="locations-create-name-input" type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4af37]/20 focus:border-[#d4af37] transition-all"
                placeholder={t('dashboard.locations.name_placeholder')} required />
            </div>

            <div className="space-y-1.5 relative">
              <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">{t('dashboard.locations.address_label')}</label>
              <div className="relative">
                <input id="locations-create-address-input" type="text" value={formData.address} onChange={handleAddressChange}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4af37]/20 focus:border-[#d4af37] transition-all"
                  placeholder={t('dashboard.locations.address_placeholder')} required />
                {loadingSuggestions && (
                  <div className="absolute right-3 top-3.5 w-4 h-4 rounded-full border-2 border-stone-300 border-t-stone-900 animate-spin" />
                )}
              </div>
              
              {suggestions.length > 0 && (
                <div className="absolute z-[100] left-0 right-0 top-full mt-1 bg-white border border-stone-200 rounded-xl shadow-xl max-h-48 overflow-y-auto divide-y divide-stone-100">
                  {suggestions.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => handleSelectSuggestion(s)}
                      className="w-full text-left px-4 py-3 text-xs text-stone-700 hover:bg-stone-50 hover:text-stone-950 font-sans transition-colors"
                    >
                      {s.display_name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Verificar ubicación en mapa (Arrastra el pin para precisión)</label>
              <div 
                ref={mapContainerRef} 
                className="w-full h-40 rounded-xl border border-stone-200 overflow-hidden relative z-10"
                style={{ minHeight: '160px' }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">{t('dashboard.locations.phone_label')}</label>
                <input id="locations-create-phone-input" type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4af37]/20 focus:border-[#d4af37] transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">{t('dashboard.locations.email_label')}</label>
                <input id="locations-create-email-input" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder={t('dashboard.locations.email_placeholder')}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4af37]/20 focus:border-[#d4af37] transition-all" />
              </div>
            </div>
            <DialogFooter className="pt-6">
              <button id="locations-create-cancel-btn" type="button" onClick={() => setIsCreateOpen(false)} className="text-stone-400 hover:text-stone-700 transition-all font-bold text-xs uppercase tracking-wider px-4 py-2">
                {t('dashboard.locations.cancel')}
              </button>
              <button id="locations-create-submit-btn" type="submit" disabled={isSubmitting} className="bg-stone-950 hover:bg-[#d4af37] hover:text-stone-950 text-white font-bold text-xs uppercase tracking-widest px-6 py-3.5 rounded-full transition-all duration-300 active:scale-95 disabled:opacity-50">
                {isSubmitting ? t('dashboard.locations.creating') : t('dashboard.locations.create_submit')}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIALOG EDICIÓN */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-[2rem] p-8 bg-white border-stone-100 shadow-2xl">
          <DialogHeader className="mb-4">
            <DialogTitle className="font-serif italic text-2xl text-stone-800">{t('dashboard.locations.edit_title')}</DialogTitle>
            <DialogDescription className="text-stone-400 font-medium">{t('dashboard.locations.edit_desc')}</DialogDescription>
          </DialogHeader>
          <form id="locations-edit-form" onSubmit={handleUpdateLocation} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">{t('dashboard.locations.name_label')}</label>
              <input id="locations-edit-name-input" type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4af37]/20 focus:border-[#d4af37] transition-all"
                required />
            </div>

            <div className="space-y-1.5 relative">
              <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">{t('dashboard.locations.address_label')}</label>
              <div className="relative">
                <input id="locations-edit-address-input" type="text" value={formData.address} onChange={handleAddressChange}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4af37]/20 focus:border-[#d4af37] transition-all"
                  required />
                {loadingSuggestions && (
                  <div className="absolute right-3 top-3.5 w-4 h-4 rounded-full border-2 border-stone-300 border-t-stone-900 animate-spin" />
                )}
              </div>
              
              {suggestions.length > 0 && (
                <div className="absolute z-[100] left-0 right-0 top-full mt-1 bg-white border border-stone-200 rounded-xl shadow-xl max-h-48 overflow-y-auto divide-y divide-stone-100">
                  {suggestions.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => handleSelectSuggestion(s)}
                      className="w-full text-left px-4 py-3 text-xs text-stone-700 hover:bg-stone-50 hover:text-stone-950 font-sans transition-colors"
                    >
                      {s.display_name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Verificar ubicación en mapa (Arrastra el pin para precisión)</label>
              <div 
                ref={mapContainerRef} 
                className="w-full h-40 rounded-xl border border-stone-200 overflow-hidden relative z-10"
                style={{ minHeight: '160px' }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">{t('dashboard.locations.phone_label')}</label>
                <input id="locations-edit-phone-input" type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4af37]/20 focus:border-[#d4af37] transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">{t('dashboard.locations.email_label')}</label>
                <input id="locations-edit-email-input" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4af37]/20 focus:border-[#d4af37] transition-all" />
              </div>
            </div>
            <DialogFooter className="pt-6">
              <button id="locations-edit-cancel-btn" type="button" onClick={() => setIsEditOpen(false)} className="text-stone-400 hover:text-stone-700 transition-all font-bold text-xs uppercase tracking-wider px-4 py-2">
                {t('dashboard.locations.cancel')}
              </button>
              <button id="locations-edit-save-btn" type="submit" disabled={isSubmitting} className="bg-stone-950 hover:bg-[#d4af37] hover:text-stone-950 text-white font-bold text-xs uppercase tracking-widest px-6 py-3.5 rounded-full transition-all duration-300 active:scale-95 disabled:opacity-50">
                {isSubmitting ? t('dashboard.locations.saving') : t('dashboard.locations.save_btn')}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

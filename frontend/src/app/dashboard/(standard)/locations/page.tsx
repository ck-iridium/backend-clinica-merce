"use client";

import React, { useState, useEffect } from "react";
import { Plus, Building } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useFeedback } from "@/app/contexts/FeedbackContext";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAuthRole } from "@/hooks/useAuthRole";
import { useLanguage } from "@/app/contexts/LanguageContext";
import PlanLimitsCard from "@/components/PlanLimitsCard";

import { Location, LocationFormData } from "./components/types";
import { getCookie, getPublicLocationUrl } from "./components/locationUtils";
import LocationCard from "./components/LocationCard";
import LocationFormModal from "./components/LocationFormModal";
import HomeServiceBanner from "./components/HomeServiceBanner";

export default function LocationsPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { role, loading: loadingRole } = useAuthRole();
  const { showFeedback } = useFeedback();

  const [locations, setLocations] = useState<Location[]>([]);
  const [limitsData, setLimitsData] = useState<any>(null);
  const [tenantSlug, setTenantSlug] = useState<string>('');
  const [customDomain, setCustomDomain] = useState<string | null>(null);
  const [serviceModality, setServiceModality] = useState<string>('clinic');
  const [loading, setLoading] = useState(true);

  // Estado del Modal Unificado
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getAuthHeaders = () => {
    const userSession = localStorage.getItem('user');
    let tenantId = getCookie('tenant_id') || '';
    let authToken = '';
    if (userSession) {
      try {
        const parsed = JSON.parse(userSession);
        if (!tenantId) tenantId = parsed.tenant_id || '';
        authToken = parsed.access_token || parsed.token || '';
      } catch (e) { /* ignore */ }
    }
    return {
      'X-Tenant-ID': tenantId,
      'Authorization': authToken ? `Bearer ${authToken}` : '',
      'Content-Type': 'application/json'
    };
  };

  const fetchLocationsAndLimits = async () => {
    try {
      setLoading(true);
      const headers = getAuthHeaders();
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      
      const [locRes, limitsRes, settingsRes] = await Promise.all([
        fetch(`${API_URL}/locations/`, { headers }),
        fetch(`${API_URL}/settings/limits`, { headers }),
        fetch(`${API_URL}/settings/`, { headers })
      ]);

      if (locRes.ok) setLocations(await locRes.json() || []);
      if (limitsRes.ok) {
        const limits = await limitsRes.json();
        setLimitsData(limits);
        if (limits.custom_domain) setCustomDomain(limits.custom_domain);
        if (limits.tenant_slug) setTenantSlug(limits.tenant_slug);
      }
      if (settingsRes.ok) {
        const settings = await settingsRes.json();
        setServiceModality(settings.service_modality || 'clinic');
      }
    } catch (err) {
      toast.error(t('dashboard.locations.toast_error_load'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!loadingRole) {
      const currentRole = role?.toLowerCase();
      if (currentRole !== 'administrador' && currentRole !== 'admin') {
        toast.error("Acceso denegado");
        router.replace('/dashboard');
      } else {
        fetchLocationsAndLimits();
      }
    }
  }, [role, loadingRole, router]);

  const isHomeOnly = serviceModality === 'home';

  // Abrir Modal de Creación con validación de límites
  const handleCreateOpen = () => {
    if (limitsData) {
      const maxLocations = limitsData.limits?.locations || 1;
      const activeCount = locations.filter(l => l.is_active).length;
      if (activeCount >= maxLocations) {
        showFeedback({
          type: 'confirm',
          title: t('dashboard.locations.paywall_title'),
          message: `Has alcanzado el límite de ${maxLocations} sedes para tu plan '${limitsData.plan_type?.toUpperCase()}'. Mejora tu plan para añadir más sucursales.`,
          confirmText: t('dashboard.locations.paywall_upgrade'),
          cancelText: t('dashboard.locations.paywall_later'),
          onConfirm: () => router.push('/dashboard/settings?tab=subscription')
        });
        return;
      }
    }
    setSelectedLocation(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  // Abrir Modal de Edición
  const handleEditOpen = (location: Location) => {
    setSelectedLocation(location);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  // Enviar Formulario (Crear o Actualizar)
  const handleFormSubmit = async (formData: LocationFormData) => {
    setIsSubmitting(true);
    const headers = getAuthHeaders();
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    try {
      if (modalMode === 'create') {
        const res = await fetch(`${API_URL}/locations/`, {
          method: 'POST',
          headers,
          body: JSON.stringify(formData)
        });

        if (res.status === 403) {
          toast.error(t('dashboard.locations.limit_exceeded'));
          setIsModalOpen(false);
          return;
        }
        if (!res.ok) throw new Error();
        toast.success(t('dashboard.locations.toast_created'));
      } else {
        if (!selectedLocation) return;
        const res = await fetch(`${API_URL}/locations/${selectedLocation.id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(formData)
        });
        if (!res.ok) throw new Error();
        toast.success(t('dashboard.locations.toast_updated'));
      }

      setIsModalOpen(false);
      fetchLocationsAndLimits();
    } catch {
      toast.error(
        modalMode === 'create'
          ? t('dashboard.locations.toast_error_save')
          : t('dashboard.locations.toast_error_update')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Alternar Estado Activa / Inactiva
  const handleToggleStatus = async (location: Location) => {
    if (!location.is_active && limitsData) {
      const maxLocations = limitsData.limits?.locations || 1;
      const activeCount = locations.filter(l => l.is_active).length;
      if (activeCount >= maxLocations) {
        showFeedback({
          type: 'confirm',
          title: "Límite Alcanzado",
          message: `No puedes activar esta sede. Has alcanzado el límite de ${maxLocations} sedes activas en tu plan '${limitsData.plan_type?.toUpperCase()}'.`,
          confirmText: t('dashboard.locations.paywall_upgrade'),
          cancelText: "Cerrar",
          onConfirm: () => router.push('/dashboard/settings?tab=subscription')
        });
        return;
      }
    }

    try {
      const headers = getAuthHeaders();
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${API_URL}/locations/${location.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ ...location, is_active: !location.is_active })
      });
      if (!res.ok) throw new Error();
      toast.success(
        location.is_active
          ? t('dashboard.locations.toast_deactivated')
          : t('dashboard.locations.toast_activated')
      );
      fetchLocationsAndLimits();
    } catch {
      toast.error(t('dashboard.locations.toast_error_status'));
    }
  };

  // Eliminar Sede
  const handleDeleteLocation = (location: Location) => {
    showFeedback({
      type: 'confirm',
      title: t('dashboard.locations.delete_confirm_title'),
      message: `¿Estás seguro de que quieres eliminar la sede '${location.name}'? Esta acción es definitiva y podría invalidar turnos ya agendados en esta ubicación.`,
      confirmText: t('dashboard.locations.delete_confirm_btn'),
      cancelText: t('dashboard.locations.cancel'),
      onConfirm: async () => {
        try {
          const headers = getAuthHeaders();
          const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
          const res = await fetch(`${API_URL}/locations/${location.id}`, {
            method: 'DELETE',
            headers
          });
          if (!res.ok) throw new Error();
          toast.success(t('dashboard.locations.toast_deleted'));
          fetchLocationsAndLimits();
        } catch {
          toast.error(t('dashboard.locations.toast_error_delete'));
        }
      }
    });
  };

  // Pantalla de carga mientras se verifican permisos
  if (loadingRole || (role?.toLowerCase() !== 'administrador' && role?.toLowerCase() !== 'admin')) {
    return (
      <div className="flex flex-col gap-4 justify-center items-center h-[60vh] animate-in fade-in duration-500">
        <Skeleton className="w-16 h-16 rounded-2xl" />
        <Skeleton className="w-48 h-6 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-16">
      
      {/* ── CABECERA Y ACCIÓN PRINCIPAL ── */}
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

      {/* ── BANNER PARA MODALIDAD A DOMICILIO ── */}
      {isHomeOnly && (
        <HomeServiceBanner onConfigure={() => router.push('/dashboard/settings?tab=domicilio')} />
      )}

      {/* ── LISTADO / GRID DE SEDES ── */}
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
            <LocationCard
              key={loc.id}
              location={loc}
              publicUrl={getPublicLocationUrl(loc, tenantSlug, customDomain)}
              onToggleStatus={handleToggleStatus}
              onEdit={handleEditOpen}
              onDelete={handleDeleteLocation}
            />
          ))}
        </div>
      )}

      {/* ── MODAL UNIFICADO: CREAR / EDITAR SEDE ── */}
      <LocationFormModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        mode={modalMode}
        initialData={selectedLocation}
        onSubmit={handleFormSubmit}
        isSubmitting={isSubmitting}
      />

    </div>
  );
}

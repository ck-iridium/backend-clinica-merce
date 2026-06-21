"use client"
import { useState, useEffect } from 'react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { useAuthRole } from '@/hooks/useAuthRole';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Settings2, Plus, Download, Loader2 } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from 'sonner';
import PlanLimitsCard from '@/components/PlanLimitsCard';
import ServicesDataGrid from './components/ServicesDataGrid';
import ManageCategoriesModal from './components/ManageCategoriesModal';

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

export default function ServicesPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { role, loading: loadingRole } = useAuthRole();
  
  const [services, setServices] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showArchived, setShowArchived] = useState(false);
  const [showManageCategoriesModal, setShowManageCategoriesModal] = useState(false);
  const [planType, setPlanType] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    async function fetchPlan() {
      try {
        const userSession = localStorage.getItem('user');
        let tId = getCookie('tenant_id') || '';
        let authToken = '';
        if (userSession) {
          try {
            const parsed = JSON.parse(userSession);
            if (!tId) tId = parsed.tenant_id || '';
            authToken = parsed.access_token || parsed.token || '';
          } catch (e) {
            console.error('Error parsing user session:', e);
          }
        }
        if (!tId) return;

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/limits`, {
          headers: { 'X-Tenant-ID': tId, 'Authorization': authToken ? `Bearer ${authToken}` : '' }
        });
        if (res.ok) {
          const d = await res.json();
          setPlanType(d.plan_type?.toLowerCase() || 'free');
        }
      } catch (err) {
        console.error('Error fetching plan type in services page:', err);
      }
    }
    fetchPlan();
  }, []);

  const handleExport = async () => {
    if (planType && planType !== 'pro' && planType !== 'gold') {
      toast.error('La exportación de servicios está reservada para los planes Pro y Gold. Por favor, actualice su suscripción.');
      return;
    }
    
    setExporting(true);
    try {
      const userSession = localStorage.getItem('user');
      let tId = getCookie('tenant_id') || '';
      let authToken = '';
      if (userSession) {
        try {
          const parsed = JSON.parse(userSession);
          if (!tId) tId = parsed.tenant_id || '';
          authToken = parsed.access_token || parsed.token || '';
        } catch (e) {
          console.error(e);
        }
      }
      
      const headers: Record<string, string> = {};
      if (tId) headers['X-Tenant-ID'] = tId;
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/services/export-to-media`, {
        method: 'POST',
        headers
      });
      
      if (res.ok) {
        const data = await res.json();
        toast.success(data.message || 'Servicios exportados y guardados en la Galería.');
      } else {
        const err = await res.json().catch(() => ({ detail: 'Error al exportar' }));
        toast.error(err.detail || 'No se pudo exportar los servicios.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error de red al intentar exportar los servicios.');
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    if (!loadingRole) {
      const currentRole = role?.toLowerCase();
      if (currentRole !== 'administrador' && currentRole !== 'admin') {
        toast.error(t('dashboard.services.access_denied'));
        router.replace('/dashboard');
      } else {
        fetchServices();
        fetchCategories();
      }
    }
  }, [role, loadingRole, router]);

  // Redirección inteligente y automática si viene el parámetro ?edit=slug o ?slug=slug
  useEffect(() => {
    if (services.length > 0) {
      const editSlug = searchParams.get('edit') || searchParams.get('slug');
      if (editSlug) {
        const targetSlug = editSlug.toLowerCase().trim();
        
        // Función premium de limpieza difusa para omitir preposiciones/conectores (ej. "de", "para") y unificar encodados de la ñ
        const cleanSlug = (s: string) => 
          s.toLowerCase()
           .normalize("NFD")
           .replace(/[\u0300-\u036f]/g, "") // Eliminar acentos y marcas
           .replace(/ni-o/g, 'nino')        // Unificar el encodado particular 'ni-o' en la base de datos
           .replace(/nio/g, 'nino')         // Unificar 'nio' a 'nino'
           .replace(/[^a-z0-9]/g, '')       // Quitar guiones y caracteres no alfanuméricos
           .replace(/(para|de|el|la|los|las|un|una|unos|unas|y)/g, ''); // Omitir conectores comunes

        const targetClean = cleanSlug(targetSlug);

        console.log("=== DEBUG COPILOT ROUTING ===");
        console.log("Services loaded:", services.map((s) => ({ name: s.name, slug: s.slug, id: s.id })));
        console.log("Target slug from URL:", targetSlug, "Clean target:", targetClean);

        // 1. Intentar coincidencia exacta primero
        let found = services.find(
          (s) => s.slug === targetSlug || s.slug.toLowerCase() === targetSlug
        );

        if (found) {
          console.log("Coincidencia exacta encontrada:", found.name, found.id);
        }

        // 2. Intentar coincidencia difusa avanzada si no se encontró coincidencia exacta
        if (!found) {
          const candidates = services.map((s) => {
            const currentClean = cleanSlug(s.slug || '');
            let score = 0;
            if (currentClean === targetClean) {
              score = 100;
            } else if (currentClean.includes(targetClean) || targetClean.includes(currentClean)) {
              // Puntuación basada en similitud de longitud de caracteres para priorizar la coincidencia más específica
              score = (Math.min(currentClean.length, targetClean.length) / Math.max(currentClean.length, targetClean.length)) * 90;
            }
            console.log(`Candidato difuso: "${s.name}" (slug: ${s.slug}) -> limpio: "${currentClean}" -> Score: ${score}`);
            return { service: s, score };
          }).filter((c) => c.score > 0);

          if (candidates.length > 0) {
            candidates.sort((a, b) => b.score - a.score);
            found = candidates[0].service;
            console.log("Coincidencia difusa elegida (mejor score):", found?.name, found?.id);
          } else {
            console.log("Ningún candidato difuso superó la puntuación mínima.");
          }
        }

        if (found) {
          router.push(`/dashboard/services/${found.id}/edit`);
        } else {
          console.log("No se encontró ninguna coincidencia exacta o difusa para:", targetSlug);
        }
      }
    }
  }, [services, router, searchParams]);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/service-categories/`);
      if (res.ok) setCategories(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const fetchServices = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/services/`);
      if (res.ok) setServices(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (svc: any) => {
    router.push(`/dashboard/services/${svc.id}/edit`);
  };

  if (loadingRole) {
    return (
      <div className="flex flex-col gap-4 justify-center items-center h-[60vh] animate-in fade-in duration-500">
        <Skeleton className="w-16 h-16 rounded-2xl" />
        <Skeleton className="w-48 h-6 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-4">
            <h1 className="text-3xl font-extrabold text-stone-800">{t('dashboard.services.title')}</h1>
            <PlanLimitsCard type="services" />
          </div>
          <p className="text-stone-500 font-medium">{t('dashboard.services.subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            id="services-archived-toggle-btn"
            type="button"
            onClick={() => setShowArchived(!showArchived)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${showArchived ? 'bg-stone-800 text-white border-stone-800' : 'bg-white text-stone-500 border-stone-200 hover:border-stone-400'}`}>
            {showArchived ? t('dashboard.services.hide_archived') : t('dashboard.services.show_archived')}
          </button>
          <button 
            id="services-export-btn"
            type="button"
            disabled={exporting}
            onClick={handleExport}
            className="px-4 py-3 rounded-xl bg-white text-stone-600 border border-stone-200 font-bold transition-all hover:bg-stone-50 active:scale-95 shadow-sm flex items-center gap-2 disabled:opacity-50">
            {exporting ? (
              <Loader2 size={18} className="animate-spin text-stone-400" />
            ) : (
              <Download size={18} strokeWidth={1.5} className="text-stone-400" />
            )}
            <span className="hidden sm:inline">Exportar a Galería</span>
          </button>
          <button 
            id="services-categories-btn"
            type="button"
            onClick={() => setShowManageCategoriesModal(true)}
            className="px-4 py-3 rounded-xl bg-white text-stone-600 border border-stone-200 font-bold transition-all hover:bg-stone-50 active:scale-95 shadow-sm flex items-center gap-2">
            <Settings2 size={18} strokeWidth={1.5} className="text-stone-400" /> <span className="hidden sm:inline">{t('dashboard.services.categories')}</span>
          </button>
          <Link 
            id="services-new-btn"
            href="/dashboard/services/new"
            className="px-6 py-3 rounded-xl font-bold transition-all shadow-md active:scale-95 flex items-center gap-2 bg-[#d4af37] hover:bg-[#b08e23] border border-transparent text-white">
            <Plus size={18} strokeWidth={1.5} />
            {t('dashboard.services.new_service')}
          </Link>
        </div>
      </div>

      {/* Grid of Services */}
      <ServicesDataGrid 
        services={services}
        categories={categories}
        loading={loading}
        showArchived={showArchived}
        onEditClick={handleEditClick}
        onRefresh={fetchServices}
      />

      {/* Modal Gestionar Categorías */}
      <ManageCategoriesModal 
        isOpen={showManageCategoriesModal}
        onClose={() => setShowManageCategoriesModal(false)}
        categories={categories}
        fetchCategories={fetchCategories}
        fetchServices={fetchServices}
        services={services}
      />
    </div>
  );
}

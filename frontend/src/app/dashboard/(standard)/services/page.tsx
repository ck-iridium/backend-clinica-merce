"use client"
import { useState, useEffect } from 'react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { useAuthRole } from '@/hooks/useAuthRole';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Settings2, Plus } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from 'sonner';
import PlanLimitsCard from '@/components/PlanLimitsCard';
import ServicesDataGrid from './components/ServicesDataGrid';
import ManageCategoriesModal from './components/ManageCategoriesModal';

export default function ServicesPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { role, loading: loadingRole } = useAuthRole();
  
  const [services, setServices] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showArchived, setShowArchived] = useState(false);
  const [showManageCategoriesModal, setShowManageCategoriesModal] = useState(false);

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
    if (typeof window !== 'undefined' && services.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const editSlug = params.get('edit') || params.get('slug');
      if (editSlug) {
        const targetSlug = editSlug.toLowerCase().trim();
        
        // Función premium de limpieza difusa para omitir preposiciones/conectores (ej. "de", "para")
        const cleanSlug = (s: string) => 
          s.toLowerCase()
           .replace(/[^a-z0-9]/g, '') // Quitar guiones y caracteres no alfanuméricos
           .replace(/(para|de|el|la|los|las|un|una|unos|unas|y)/g, ''); // Omitir conectores comunes

        const targetClean = cleanSlug(targetSlug);

        // 1. Intentar coincidencia exacta primero
        let found = services.find(
          (s) => s.slug === targetSlug || s.slug.toLowerCase() === targetSlug
        );

        // 2. Intentar coincidencia difusa avanzada si no se encontró coincidencia exacta
        if (!found) {
          found = services.find((s) => {
            const currentClean = cleanSlug(s.slug || '');
            return currentClean === targetClean || currentClean.includes(targetClean) || targetClean.includes(currentClean);
          });
        }

        if (found) {
          router.push(`/dashboard/services/${found.id}/edit`);
        }
      }
    }
  }, [services, router]);

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
            type="button"
            onClick={() => setShowArchived(!showArchived)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${showArchived ? 'bg-stone-800 text-white border-stone-800' : 'bg-white text-stone-500 border-stone-200 hover:border-stone-400'}`}>
            {showArchived ? t('dashboard.services.hide_archived') : t('dashboard.services.show_archived')}
          </button>
          <button 
            type="button"
            onClick={() => setShowManageCategoriesModal(true)}
            className="px-4 py-3 rounded-xl bg-white text-stone-600 border border-stone-200 font-bold transition-all hover:bg-stone-50 active:scale-95 shadow-sm flex items-center gap-2">
            <Settings2 size={18} strokeWidth={1.5} className="text-stone-400" /> <span className="hidden sm:inline">{t('dashboard.services.categories')}</span>
          </button>
          <Link 
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

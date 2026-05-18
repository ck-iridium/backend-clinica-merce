"use client"
import { useState, useEffect } from 'react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { useAuthRole } from '@/hooks/useAuthRole';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Settings2, Plus } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from 'sonner';
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
        <div>
          <h1 className="text-3xl font-extrabold text-stone-800">{t('dashboard.services.title')}</h1>
          <p className="text-stone-500 mt-1 font-medium">{t('dashboard.services.subtitle')}</p>
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

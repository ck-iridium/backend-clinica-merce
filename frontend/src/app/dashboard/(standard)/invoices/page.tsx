"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthRole } from '@/hooks/useAuthRole';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { useInvoices } from '@/hooks/useInvoices';
import { useLanguage } from '@/app/contexts/LanguageContext';

// Componentes modulares
import InvoiceKPIs from '@/components/invoices/InvoiceKPIs';
import InvoiceFilters from '@/components/invoices/InvoiceFilters';
import InvoiceTable from '@/components/invoices/InvoiceTable';

export default function InvoicesPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { role, loading: loadingRole } = useAuthRole();
  
  // Extraemos el cerebro del estado global
  const {
    invoices,
    kpis,
    loading: loadingInvoices,
    pagination,
    filters,
    handlePageChange,
    handleFilterChange,
    handleSearch,
    refreshInvoices
  } = useInvoices();

  const currentRole = role?.toLowerCase();
  const hasAccess = currentRole === 'administrador' || currentRole === 'admin' || currentRole === 'recepción' || currentRole === 'recepcion';

  useEffect(() => {
    if (!loadingRole && !hasAccess) {
      router.replace('/dashboard');
      toast.error(t('dashboard.invoices.access_denied') || "Acceso denegado: No tienes permisos para ver la facturación.");
    }
  }, [loadingRole, hasAccess, router, t]);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/invoices/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success(t('dashboard.invoices.invoice_deleted') || "Factura eliminada correctamente");
        refreshInvoices();
      } else {
        toast.error(t('dashboard.invoices.error_deleting') || "Error al eliminar la factura");
      }
    } catch (e) {
      console.error(e);
      toast.error(t('dashboard.invoices.network_error') || "Error de red");
    }
  };

  if (loadingRole || !hasAccess) {
    return (
      <div className="flex flex-col gap-4 justify-center items-center h-[60vh] animate-in fade-in duration-500">
        <Skeleton className="w-16 h-16 rounded-[2rem]" />
        <Skeleton className="w-48 h-6 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-serif text-stone-800 tracking-tight">
            {t('dashboard.invoices.title') || 'Registro de Facturación'}
          </h1>
          <p className="text-stone-500 mt-1 text-sm font-sans font-medium">
            {t('dashboard.invoices.subtitle') || 'Centro de control financiero y ventas'}
          </p>
        </div>
      </div>

      <InvoiceKPIs 
        kpis={kpis} 
        loading={loadingInvoices && invoices.length === 0} 
      />

      <InvoiceFilters 
        filters={filters} 
        onFilterChange={handleFilterChange} 
        onSearch={handleSearch} 
      />

      <InvoiceTable 
        invoices={invoices} 
        loading={loadingInvoices} 
        pagination={pagination} 
        onPageChange={handlePageChange} 
        onDelete={handleDelete} 
      />
    </div>
  );
}

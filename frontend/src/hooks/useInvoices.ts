import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { 
  Invoice, 
  InvoiceKPIs, 
  PaginatedInvoicesResponse, 
  InvoiceFilters 
} from '@/lib/types';

export function useInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [kpis, setKpis] = useState<InvoiceKPIs>({
    total_gross: 0,
    tax_base: 0,
    vat_quota: 0
  });
  
  const [loading, setLoading] = useState<boolean>(true);
  
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  
  const [filters, setFilters] = useState<InvoiceFilters>({
    status: 'all',
    startDate: undefined,
    endDate: undefined,
    search: ''
  });

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', pagination.page.toString());
      params.append('limit', pagination.limit.toString());
      
      if (filters.status && filters.status !== 'all') {
        params.append('status', filters.status);
      }
      
      if (filters.startDate) {
        params.append('start_date', filters.startDate);
      }
      
      if (filters.endDate) {
        params.append('end_date', filters.endDate);
      }
      
      if (filters.search) {
        params.append('search', filters.search);
      }

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const url = `${baseUrl}/invoices/?${params.toString()}`;
      console.log('Intentando hacer fetch a:', url);

      const res = await fetch(url);
      
      if (res.ok) {
        const data: PaginatedInvoicesResponse = await res.json();
        setInvoices(data.data);
        setKpis(data.kpis);
        setPagination(prev => ({
          ...prev,
          total: data.total,
          pages: data.pages,
          page: data.page
        }));
      } else {
        toast.error('Error al cargar la facturación');
      }
    } catch (e) {
      console.error(e);
      toast.error('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const handlePageChange = useCallback((newPage: number) => {
    setPagination(prev => {
      if (newPage > 0 && newPage <= (prev.pages || 1)) {
        return { ...prev, page: newPage };
      }
      return prev;
    });
  }, []);

  const handleFilterChange = useCallback((key: keyof InvoiceFilters, value: any) => {
    setFilters(prev => {
      if (prev[key] === value) return prev;
      return { ...prev, [key]: value };
    });
    setPagination(prev => prev.page === 1 ? prev : { ...prev, page: 1 });
  }, []);

  const handleSearch = useCallback((searchTerm: string) => {
    setFilters(prev => {
      if (prev.search === searchTerm) return prev;
      return { ...prev, search: searchTerm };
    });
    setPagination(prev => prev.page === 1 ? prev : { ...prev, page: 1 });
  }, []);

  return {
    invoices,
    kpis,
    loading,
    pagination,
    filters,
    handlePageChange,
    handleFilterChange,
    handleSearch,
    refreshInvoices: fetchInvoices
  };
}

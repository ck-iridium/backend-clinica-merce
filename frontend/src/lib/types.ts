export interface InvoiceKPIs {
  total_gross: number;
  tax_base: number;
  vat_quota: number;
}

export interface Invoice {
  id: string;
  client_id: string;
  amount: number;
  concept: string;
  date: string;
  status: string;
  tax_rate: number;
  is_simplified: boolean;
}

export interface PaginatedInvoicesResponse {
  total: number;
  pages: number;
  page: number;
  kpis: InvoiceKPIs;
  data: Invoice[];
}

export interface InvoiceFilters {
  status: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

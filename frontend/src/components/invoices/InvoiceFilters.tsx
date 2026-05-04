import React, { useState, useEffect } from 'react';
import { InvoiceFilters as FiltersType } from '@/lib/types';
import { Search, Calendar as CalendarIcon, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  filters: FiltersType;
  onFilterChange: (key: keyof FiltersType, value: any) => void;
  onSearch: (searchTerm: string) => void;
}

export default function InvoiceFilters({ filters, onFilterChange, onSearch }: Props) {
  const [localSearch, setLocalSearch] = useState(filters.search || '');

  // Debounce para la búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(localSearch);
    }, 500);
    return () => clearTimeout(timer);
  }, [localSearch, onSearch]);

  const handleDatePresetChange = (preset: string) => {
    const today = new Date();
    let start: Date | undefined;
    let end: Date | undefined;

    switch (preset) {
      case 'today':
        start = new Date(today.setHours(0, 0, 0, 0));
        end = new Date(today.setHours(23, 59, 59, 999));
        break;
      case 'month':
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        end = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
        break;
      case 'year':
        start = new Date(today.getFullYear(), 0, 1);
        end = new Date(today.getFullYear(), 11, 31, 23, 59, 59, 999);
        break;
      case 'all':
      default:
        start = undefined;
        end = undefined;
        break;
    }

    onFilterChange('startDate', start ? start.toISOString() : undefined);
    onFilterChange('endDate', end ? end.toISOString() : undefined);
  };

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 bg-white p-4 rounded-[2rem] border border-stone-200 shadow-sm">
      
      {/* Tabs de Estado */}
      <div className="flex p-1 bg-stone-100 rounded-2xl w-full md:w-auto">
        {[
          { id: 'all', label: 'Todas' },
          { id: 'paid', label: 'Pagadas' },
          { id: 'pending', label: 'Pendientes' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => onFilterChange('status', tab.id)}
            className={cn(
              "flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
              filters.status === tab.id 
                ? "bg-white text-stone-900 shadow-sm" 
                : "text-stone-500 hover:text-stone-700"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
        {/* Selector de Fechas (Presets rápidos) */}
        <div className="relative min-w-[160px]">
          <Select onValueChange={handleDatePresetChange} defaultValue="all">
            <SelectTrigger className="h-11 rounded-xl bg-stone-50 border-stone-200 focus:ring-[#d4af37]">
              <div className="flex items-center gap-2 font-bold text-stone-600">
                <CalendarIcon size={16} />
                <SelectValue placeholder="Fechas" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Siempre</SelectItem>
              <SelectItem value="today">Hoy</SelectItem>
              <SelectItem value="month">Este Mes</SelectItem>
              <SelectItem value="year">Este Año</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Búsqueda */}
        <div className="relative flex-1 md:min-w-[250px]">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-stone-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar concepto o cliente..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full pl-10 pr-4 h-11 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d4af37] transition-all font-medium text-stone-700 placeholder:text-stone-400"
          />
        </div>
      </div>
    </div>
  );
}

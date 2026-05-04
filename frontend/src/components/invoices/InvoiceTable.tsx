import React, { useState, useEffect } from 'react';
import { Invoice } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { Download, MoreHorizontal, Eye, Trash2, FileSpreadsheet, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useFeedback } from '@/app/contexts/FeedbackContext';

interface Props {
  invoices: Invoice[];
  loading: boolean;
  pagination: { page: number; limit: number; total: number; pages: number };
  onPageChange: (page: number) => void;
  onDelete: (id: string) => void;
}

export default function InvoiceTable({ invoices, loading, pagination, onPageChange, onDelete }: Props) {
  const { showFeedback } = useFeedback();
  const [clientsMap, setClientsMap] = useState<Record<string, string>>({});

  // Cargar clientes para mapear IDs a nombres (simplificado, idealmente esto vendría en la invoice si hacemos un JOIN en el backend, 
  // pero mantendremos el fetch local como estaba originalmente o similar)
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/clients/`)
      .then(res => res.json())
      .then(data => {
        const map: Record<string, string> = {};
        data.forEach((c: any) => { map[c.id] = c.name; });
        setClientsMap(map);
      })
      .catch(console.error);
  }, []);

  const getClientName = (id: string) => clientsMap[id] || 'Cliente Desconocido';

  const exportToCSV = () => {
    if (invoices.length === 0) return;
    
    const headers = ['Fecha', 'Cliente', 'Concepto', 'Estado', 'Importe', 'IVA', 'Es_Simplificada'];
    const csvContent = [
      headers.join(','),
      ...invoices.map(inv => {
        const date = new Date(inv.date).toLocaleDateString('es-ES');
        const client = `"${getClientName(inv.client_id).replace(/"/g, '""')}"`;
        const concept = `"${inv.concept.replace(/"/g, '""')}"`;
        const status = inv.status === 'paid' ? 'Pagada' : 'Pendiente';
        const amount = inv.amount.toString();
        const tax = inv.tax_rate.toString();
        const simplified = inv.is_simplified ? 'Si' : 'No';
        
        return [date, client, concept, status, amount, tax, simplified].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `facturacion_pagina_${pagination.page}_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = (id: string) => {
    showFeedback({
      type: 'confirm',
      title: 'Eliminar Registro',
      message: '¿Seguro que deseas eliminar este registro de facturación de forma permanente?',
      onConfirm: () => onDelete(id)
    });
  };

  if (loading) {
    return (
      <div className="bg-card rounded-[2.5rem] border border-border/40 shadow-sm overflow-hidden p-6 w-full space-y-4">
        {Array(5).fill(0).map((_, i) => (
           <div key={i} className="flex justify-between items-center w-full px-4 py-3 border-b border-border/20 last:border-0">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-48 hidden sm:block" />
              <Skeleton className="h-6 w-32 hidden md:block" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-16" />
           </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-card rounded-[2.5rem] border border-border/40 shadow-sm overflow-hidden flex flex-col">
      
      {/* Header Tools */}
      <div className="p-4 border-b border-border/40 flex justify-end bg-stone-50/50">
        <button 
          onClick={exportToCSV}
          disabled={invoices.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 rounded-xl text-sm font-bold text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition-all shadow-sm disabled:opacity-50"
        >
          <FileSpreadsheet size={16} className="text-emerald-600" />
          Exportar CSV
        </button>
      </div>

      {invoices.length === 0 ? (
        <div className="py-20 text-center">
          <span className="text-5xl opacity-30 mb-4 block">🧾</span>
          <p className="text-stone-500 font-bold text-lg mb-1">Sin Resultados</p>
          <p className="text-stone-400 font-medium text-sm">No se encontraron facturas con los filtros actuales.</p>
        </div>
      ) : (
        <div className="overflow-x-auto scrollbar-hide relative group/table">
          <table className="w-full text-left border-collapse font-sans min-w-[800px]">
            <thead>
              <tr className="bg-white border-b border-border/50 text-[10px] uppercase tracking-widest text-stone-400">
                <th className="px-6 py-5 font-bold">Fecha</th>
                <th className="px-6 py-5 font-bold">Cliente</th>
                <th className="px-6 py-5 font-bold">Concepto</th>
                <th className="px-6 py-5 font-bold text-center">Estado</th>
                <th className="px-6 py-5 font-bold text-right">Importe</th>
                <th className="px-6 py-5 font-bold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30 text-sm">
              {invoices.map((inv, index) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.03 }}
                  key={inv.id} 
                  className="hover:bg-stone-50 transition-colors group bg-white"
                 >
                  <td className="px-6 py-4 font-bold text-stone-500 whitespace-nowrap">
                    {new Date(inv.date).toLocaleDateString('es-ES')}
                  </td>
                  <td className="px-6 py-4 font-bold text-stone-800">
                    {getClientName(inv.client_id)}
                  </td>
                  <td className="px-6 py-4 font-medium text-stone-600">
                    {inv.concept}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div 
                      className={`inline-flex px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                        inv.status === 'paid' 
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100/50 shadow-sm' 
                          : 'bg-amber-50 text-amber-600 border border-amber-100/50 shadow-sm'
                      }`}
                    >
                      {inv.status === 'paid' ? 'Pagada ✓' : 'Pendiente ⏳'}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-black text-stone-900 text-right text-base whitespace-nowrap">
                    {Number(inv.amount).toFixed(2)} €
                  </td>
                  <td className="px-6 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="p-2 rounded-xl hover:bg-stone-200 text-stone-400 hover:text-stone-700 transition-colors focus:outline-none ml-auto border border-transparent hover:border-stone-200">
                        <MoreHorizontal size={18} />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 rounded-2xl p-2 border-stone-200 shadow-xl">
                        <DropdownMenuItem asChild className="rounded-xl cursor-pointer font-medium p-3">
                          <Link href={`/dashboard/invoices/${inv.id}`} className="flex items-center gap-3">
                            <Eye size={16} className="text-stone-400" />
                            Ver Detalle
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="rounded-xl cursor-pointer font-medium p-3 flex items-center gap-3">
                          <Download size={16} className="text-stone-400" />
                          Descargar PDF
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-stone-100 my-1" />
                        <DropdownMenuItem 
                          onClick={() => handleDelete(inv.id)}
                          className="rounded-xl cursor-pointer font-bold p-3 flex items-center gap-3 text-red-600 focus:text-red-700 focus:bg-red-50"
                        >
                          <Trash2 size={16} />
                          Eliminar Registro
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Paginación Visual */}
      <div className="p-4 border-t border-border/40 bg-stone-50 flex items-center justify-between">
        <span className="text-sm font-bold text-stone-500">
          Página <span className="text-stone-900">{pagination.page}</span> de <span className="text-stone-900">{pagination.pages || 1}</span>
          <span className="ml-2 font-medium text-stone-400 hidden sm:inline">({pagination.total} registros)</span>
        </span>
        <div className="flex gap-2">
          <button 
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-stone-200 text-stone-600 hover:bg-stone-100 hover:text-stone-900 transition-all disabled:opacity-40 shadow-sm"
          >
            <ChevronLeft size={18} />
          </button>
          <button 
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.pages}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-stone-200 text-stone-600 hover:bg-stone-100 hover:text-stone-900 transition-all disabled:opacity-40 shadow-sm"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

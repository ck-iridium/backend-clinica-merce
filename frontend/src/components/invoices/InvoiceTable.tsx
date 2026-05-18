import React, { useState, useEffect } from 'react';
import { Invoice } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { Download, MoreHorizontal, Eye, Trash2, FileSpreadsheet, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useLanguage } from '@/app/contexts/LanguageContext';
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
  const { t, language } = useLanguage();
  const { showFeedback } = useFeedback();
  const [clientsMap, setClientsMap] = useState<Record<string, string>>({});

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

  const getClientName = (id: string) => clientsMap[id] || t('dashboard.invoices.unknown_client') || 'Cliente Desconocido';

  const dateLocale = language === 'es' ? 'es-ES' : language === 'en' ? 'en-US' : 'fr-FR';

  const exportToCSV = () => {
    if (invoices.length === 0) return;
    
    // Translated headers for CSV
    const headers = [
      t('dashboard.invoices.date') || 'Fecha',
      t('dashboard.invoices.client') || 'Cliente',
      t('dashboard.invoices.concept') || 'Concepto',
      t('dashboard.invoices.state') || 'Estado',
      t('dashboard.invoices.total_gross') || 'Total Bruto',
      t('dashboard.invoices.taxable_base') || 'Base Imponible',
      t('dashboard.invoices.vat_quota') || 'Cuota IVA',
      'Tipo IVA (%)',
      'Es_Simplificada'
    ];

    const csvContent = [
      headers.join(','),
      ...invoices.map(inv => {
        const date = new Date(inv.date).toLocaleDateString(dateLocale);
        const client = `"${getClientName(inv.client_id).replace(/"/g, '""')}"`;
        const concept = `"${inv.concept.replace(/"/g, '""')}"`;
        const status = inv.status === 'paid' ? (t('invoices.paid') || 'Pagada') : (t('invoices.pending') || 'Pendiente');
        
        // Financial calculations
        const totalBruto = Number(inv.amount);
        const taxRate = Number(inv.tax_rate);
        const baseImponible = totalBruto / (1 + (taxRate / 100));
        const cuotaIva = totalBruto - baseImponible;
        
        const simplified = inv.is_simplified ? 'Si' : 'No';
        
        return [
          date, 
          client, 
          concept, 
          status, 
          totalBruto.toFixed(2), 
          baseImponible.toFixed(2), 
          cuotaIva.toFixed(2), 
          taxRate.toString(), 
          simplified
        ].join(',');
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

  const exportToPDF = () => {
    if (invoices.length === 0) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Aesthetic configuration
    const primaryColor = [28, 25, 23]; // Antracita (#1c1917)
    const secondaryColor = [120, 113, 108]; // Stone-500
    
    // Main Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(t('dashboard.invoices.title') || "Registro de Facturación", 20, 25);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    const generatedOnLabel = t('dashboard.invoices.generated_on');
    const pageLabel = t('dashboard.invoices.page_pdf');
    doc.text(`${generatedOnLabel} ${new Date().toLocaleDateString(dateLocale)} - ${pageLabel} ${pagination.page}`, 20, 32);

    // Totals (KPIs) of current page invoices
    let totalBruto = 0;
    let totalBase = 0;
    let totalIva = 0;

    invoices.forEach(inv => {
      const bruto = Number(inv.amount);
      const taxRate = Number(inv.tax_rate);
      const base = bruto / (1 + (taxRate / 100));
      const iva = bruto - base;
      
      totalBruto += bruto;
      totalBase += base;
      totalIva += iva;
    });

    // Draw total cards
    const cardWidth = (pageWidth - 50) / 3;
    const cardY = 45;

    const drawCard = (label: string, value: string, x: number) => {
        doc.setDrawColor(231, 229, 228); // Stone-200
        doc.setFillColor(250, 250, 250); // Stone-50
        doc.roundedRect(x, cardY, cardWidth, 25, 3, 3, "FD");
        
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
        doc.text(label.toUpperCase(), x + 5, cardY + 8);
        
        doc.setFontSize(14);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text(value, x + 5, cardY + 18);
    };

    drawCard(t('dashboard.invoices.total_gross') || "Total Bruto", `${totalBruto.toFixed(2)} €`, 20);
    drawCard(t('dashboard.invoices.taxable_base') || "Base Imponible", `${totalBase.toFixed(2)} €`, 20 + cardWidth + 5);
    drawCard(t('dashboard.invoices.vat_quota') || "Cuota IVA", `${totalIva.toFixed(2)} €`, 20 + (cardWidth + 5) * 2);

    // Data Table
    const tableData = invoices.map(inv => {
      const bruto = Number(inv.amount);
      const taxRate = Number(inv.tax_rate);
      const base = bruto / (1 + (taxRate / 100));
      const iva = bruto - base;
      
      // Short format DD/MM/YY to fit nicely
      const d = new Date(inv.date);
      const shortDate = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear().toString().slice(-2)}`;
      
      return [
        shortDate,
        getClientName(inv.client_id),
        inv.concept,
        `${base.toFixed(2)} €`,
        `${iva.toFixed(2)} €`,
        `${bruto.toFixed(2)} €`
      ];
    });

    autoTable(doc, {
      startY: 80,
      head: [[
        t('dashboard.invoices.date') || 'Fecha',
        t('dashboard.invoices.client') || 'Cliente',
        t('dashboard.invoices.concept') || 'Concepto',
        t('dashboard.invoices.taxable_base') || 'Base',
        'IVA',
        t('dashboard.invoices.total') || 'Total'
      ]],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [28, 25, 23],
        textColor: [255, 255, 255],
        fontSize: 9,
        fontStyle: 'bold',
        halign: 'left'
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [68, 64, 60], // Stone-700
        cellPadding: 3
      },
      columnStyles: {
        0: { cellWidth: 18 }, // short date
        3: { halign: 'right', cellWidth: 22 }, // Base
        4: { halign: 'right', cellWidth: 18 }, // IVA
        5: { halign: 'right', cellWidth: 22 }  // Total
      },
      margin: { left: 20, right: 20 },
      styles: {
        overflow: 'linebreak',
      },
      didDrawPage: (data) => {
        // Page Footer
        doc.setFontSize(8);
        doc.setTextColor(168, 162, 158); // Stone-400
        doc.text(
          `${pageLabel} ${data.pageNumber}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }
    });

    doc.save(`facturacion_merce_p${pagination.page}.pdf`);
  };

  const handleDelete = (id: string) => {
    showFeedback({
      type: 'confirm',
      title: t('dashboard.invoices.confirm_delete_title') || 'Eliminar Registro',
      message: t('dashboard.invoices.confirm_delete_desc') || '¿Seguro que deseas eliminar este registro de facturación de forma permanente?',
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
      <div className="p-4 border-b border-border/40 flex justify-end gap-3 bg-stone-50/50">
        <button 
          onClick={exportToPDF}
          disabled={invoices.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 rounded-xl text-sm font-bold text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition-all shadow-sm disabled:opacity-50"
        >
          <FileText size={16} className="text-rose-600" />
          {t('dashboard.invoices.download_pdf') || 'Descargar PDF'}
        </button>
        <button 
          onClick={exportToCSV}
          disabled={invoices.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 rounded-xl text-sm font-bold text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition-all shadow-sm disabled:opacity-50"
        >
          <FileSpreadsheet size={16} className="text-emerald-600" />
          {t('dashboard.invoices.export_csv') || 'Exportar CSV'}
        </button>
      </div>

      {invoices.length === 0 ? (
        <div className="py-20 text-center">
          <span className="text-5xl opacity-30 mb-4 block">🧾</span>
          <p className="text-stone-500 font-bold text-lg mb-1">
            {t('dashboard.invoices.no_results') || 'Sin Resultados'}
          </p>
          <p className="text-stone-400 font-medium text-sm">
            {t('dashboard.invoices.no_results_desc') || 'No se encontraron facturas con los filtros actuales.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto scrollbar-hide relative group/table">
          <table className="w-full text-left border-collapse font-sans min-w-[800px]">
            <thead>
              <tr className="bg-white border-b border-border/50 text-[10px] uppercase tracking-widest text-stone-400">
                <th className="px-6 py-5 font-bold">{t('dashboard.invoices.date') || 'Fecha'}</th>
                <th className="px-6 py-5 font-bold">{t('dashboard.invoices.client') || 'Cliente'}</th>
                <th className="px-6 py-5 font-bold">{t('dashboard.invoices.concept') || 'Concepto'}</th>
                <th className="px-6 py-5 font-bold text-center">{t('dashboard.invoices.state') || 'Estado'}</th>
                <th className="px-6 py-5 font-bold text-right">{t('dashboard.invoices.amount') || 'Importe'}</th>
                <th className="px-6 py-5 font-bold text-right">{t('dashboard.invoices.actions') || 'Acciones'}</th>
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
                    {new Date(inv.date).toLocaleDateString(dateLocale)}
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
                      {inv.status === 'paid' ? (t('dashboard.invoices.paid') + ' ✓') : (t('dashboard.invoices.pending') + ' ⏳')}
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
                            {t('dashboard.invoices.view_detail') || 'Ver Detalle'}
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={exportToPDF} className="rounded-xl cursor-pointer font-medium p-3 flex items-center gap-3">
                          <Download size={16} className="text-stone-400" />
                          {t('dashboard.invoices.download_pdf') || 'Descargar PDF'}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-stone-100 my-1" />
                        <DropdownMenuItem 
                          onClick={() => handleDelete(inv.id)}
                          className="rounded-xl cursor-pointer font-bold p-3 flex items-center gap-3 text-red-600 focus:text-red-700 focus:bg-red-50"
                        >
                          <Trash2 size={16} />
                          {t('dashboard.invoices.delete_record') || 'Eliminar Registro'}
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
          {(t('dashboard.invoices.page_info') || 'Página {page} de {pages}')
            .replace('{page}', pagination.page.toString())
            .replace('{pages}', (pagination.pages || 1).toString())}
          <span className="ml-2 font-medium text-stone-400 hidden sm:inline">
            {(t('dashboard.invoices.records_count') || '({total} registros)').replace('{total}', pagination.total.toString())}
          </span>
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

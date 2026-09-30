"use client";

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Download, 
  Calendar, 
  Check, 
  Loader2, 
  CheckCheck, 
  RotateCcw,
  Sparkles,
  Layers
} from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Invoice } from '@/lib/types';
import { useLanguage } from '@/app/contexts/LanguageContext';

interface ExportInvoicesPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientsMap: Record<string, string>;
  clinicName?: string;
}

const MONTHS = [
  { num: 1, name: 'Enero', short: 'Ene' },
  { num: 2, name: 'Febrero', short: 'Feb' },
  { num: 3, name: 'Marzo', short: 'Mar' },
  { num: 4, name: 'Abril', short: 'Abr' },
  { num: 5, name: 'Mayo', short: 'May' },
  { num: 6, name: 'Junio', short: 'Jun' },
  { num: 7, name: 'Julio', short: 'Jul' },
  { num: 8, name: 'Agosto', short: 'Ago' },
  { num: 9, name: 'Septiembre', short: 'Sep' },
  { num: 10, name: 'Octubre', short: 'Oct' },
  { num: 11, name: 'Noviembre', short: 'Nov' },
  { num: 12, name: 'Diciembre', short: 'Dic' }
];

export default function ExportInvoicesPdfModal({
  isOpen,
  onClose,
  clientsMap,
  clinicName: propClinicName
}: ExportInvoicesPdfModalProps) {
  const { t, language } = useLanguage();
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonths, setSelectedMonths] = useState<number[]>([currentMonth]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending'>('all');
  const [isGenerating, setIsGenerating] = useState(false);
  const [clinicName, setClinicName] = useState<string>(propClinicName || 'Estética Mercè');

  // Obtener nombre oficial de la clínica si no fue provisto
  useEffect(() => {
    if (!propClinicName) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/settings/`)
        .then(res => res.json())
        .then(data => {
          if (data?.clinic_name) setClinicName(data.clinic_name);
        })
        .catch(() => {});
    }
  }, [propClinicName]);

  const toggleMonth = (num: number) => {
    setSelectedMonths(prev => 
      prev.includes(num)
        ? prev.filter(m => m !== num)
        : [...prev, num].sort((a, b) => a - b)
    );
  };

  const selectPreset = (preset: 'all' | 'current' | 'q1' | 'q2' | 'q3' | 'q4') => {
    switch (preset) {
      case 'all':
        setSelectedMonths([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
        break;
      case 'current':
        setSelectedMonths([currentMonth]);
        break;
      case 'q1':
        setSelectedMonths([1, 2, 3]);
        break;
      case 'q2':
        setSelectedMonths([4, 5, 6]);
        break;
      case 'q3':
        setSelectedMonths([7, 8, 9]);
        break;
      case 'q4':
        setSelectedMonths([10, 11, 12]);
        break;
    }
  };

  const handleGeneratePdf = async () => {
    if (selectedMonths.length === 0) {
      toast.error('Por favor, selecciona al menos un mes para generar el PDF.');
      return;
    }

    setIsGenerating(true);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      
      // Consultamos el registro con límite amplio para incluir todo el histórico sin truncar
      const params = new URLSearchParams();
      params.append('page', '1');
      params.append('limit', '5000');
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const res = await fetch(`${baseUrl}/invoices/?${params.toString()}`);
      if (!res.ok) {
        throw new Error('Error al consultar las facturas en el servidor');
      }

      const responseData = await res.json();
      const allInvoices: Invoice[] = Array.isArray(responseData) ? responseData : (responseData.data || []);

      // Filtrar estrictamente por el año y los meses seleccionados
      const matchedInvoices = allInvoices.filter(inv => {
        if (!inv.date) return false;
        const d = new Date(inv.date);
        const invYear = d.getFullYear();
        const invMonth = d.getMonth() + 1;
        const isYearMatch = invYear === selectedYear;
        const isMonthMatch = selectedMonths.includes(invMonth);
        if (!isYearMatch || !isMonthMatch) return false;

        if (statusFilter === 'paid') return inv.status === 'paid';
        if (statusFilter === 'pending') return inv.status !== 'paid';
        return true;
      });

      if (matchedInvoices.length === 0) {
        toast.warning(`No se encontraron facturas para los meses seleccionados del año ${selectedYear}.`);
        setIsGenerating(false);
        return;
      }

      // Ordenación cronológica ascendente para contabilidad prolija
      matchedInvoices.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      // Cálculos totales globales
      let totalBruto = 0;
      let totalBase = 0;
      let totalIva = 0;

      matchedInvoices.forEach(inv => {
        const bruto = Number(inv.amount) || 0;
        const taxRate = Number(inv.tax_rate) || 21;
        const base = bruto / (1 + (taxRate / 100));
        const iva = bruto - base;

        totalBruto += bruto;
        totalBase += base;
        totalIva += iva;
      });

      // Generación de PDF multi-página profesional
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Paleta Quiet Luxury
      const colorAntracita = [28, 25, 23]; // #1c1917
      const colorGold = [179, 143, 38];     // #B38F26
      const colorStoneMuted = [120, 113, 108]; // Stone-500
      const colorStoneLight = [245, 245, 244]; // Stone-100
      const colorBorder = [231, 229, 228]; // Stone-200

      // Nombres de los meses seleccionados en texto
      const selectedMonthNames = MONTHS
        .filter(m => selectedMonths.includes(m.num))
        .map(m => m.name);
      
      const periodDescription = selectedMonths.length === 12
        ? `Todo el ejercicio ${selectedYear}`
        : `${selectedMonthNames.join(', ')} (${selectedYear})`;

      // --- PÁGINA 1: ENCABEZADO Y TARJETAS RESUMEN ---
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.setTextColor(colorAntracita[0], colorAntracita[1], colorAntracita[2]);
      doc.text("REGISTRO DE FACTURACIÓN", 15, 22);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(colorGold[0], colorGold[1], colorGold[2]);
      doc.text(`${clinicName.toUpperCase()} — INFORME ECONÓMICO Y FISCAL`, 15, 28);

      doc.setFontSize(8.5);
      doc.setTextColor(colorStoneMuted[0], colorStoneMuted[1], colorStoneMuted[2]);
      doc.text(`Período incluido: ${periodDescription}`, 15, 34);
      doc.text(
        `Estado: ${statusFilter === 'paid' ? 'Solo Pagadas' : statusFilter === 'pending' ? 'Solo Pendientes' : 'Todas las facturas'} | Total registros: ${matchedInvoices.length}`,
        15,
        39
      );

      // Tarjetas de Resumen KPI en la cabecera
      const cardY = 44;
      const cardWidth = (pageWidth - 30 - 6) / 3;
      const cardHeight = 20;

      const drawKpiCard = (x: number, title: string, amount: string, isHighlighted: boolean = false) => {
        doc.setDrawColor(colorBorder[0], colorBorder[1], colorBorder[2]);
        if (isHighlighted) {
          doc.setFillColor(28, 25, 23); // Fondo antracita para el Total Bruto
        } else {
          doc.setFillColor(250, 250, 249);
        }
        doc.roundedRect(x, cardY, cardWidth, cardHeight, 2.5, 2.5, "FD");

        doc.setFontSize(7.5);
        doc.setFont("helvetica", "bold");
        if (isHighlighted) {
          doc.setTextColor(212, 175, 55); // Dorado
        } else {
          doc.setTextColor(colorStoneMuted[0], colorStoneMuted[1], colorStoneMuted[2]);
        }
        doc.text(title.toUpperCase(), x + 4, cardY + 6.5);

        doc.setFontSize(12.5);
        doc.setFont("helvetica", "bold");
        if (isHighlighted) {
          doc.setTextColor(255, 255, 255);
        } else {
          doc.setTextColor(colorAntracita[0], colorAntracita[1], colorAntracita[2]);
        }
        doc.text(amount, x + 4, cardY + 15);
      };

      drawKpiCard(15, "Base Imponible", `${totalBase.toFixed(2)} €`, false);
      drawKpiCard(15 + cardWidth + 3, "Cuota de IVA", `${totalIva.toFixed(2)} €`, false);
      drawKpiCard(15 + (cardWidth + 3) * 2, "Total Bruto", `${totalBruto.toFixed(2)} €`, true);

      // Tabla de Facturas Multi-página
      const tableData = matchedInvoices.map(inv => {
        const bruto = Number(inv.amount) || 0;
        const taxRate = Number(inv.tax_rate) || 21;
        const base = bruto / (1 + (taxRate / 100));
        const iva = bruto - base;

        const d = new Date(inv.date);
        const day = d.getDate().toString().padStart(2, '0');
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const year = d.getFullYear().toString();
        const formattedDate = `${day}/${month}/${year}`;

        const clientName = clientsMap[inv.client_id] || 'Cliente de Contado';
        const invoiceNum = inv.number || inv.id?.slice(0, 10) || '-';
        const concept = inv.concept || 'Servicio / Tratamiento';
        const statusText = inv.status === 'paid' ? 'Pagada' : 'Pendiente';

        return [
          formattedDate,
          invoiceNum,
          clientName,
          concept,
          statusText,
          `${base.toFixed(2)} €`,
          `${iva.toFixed(2)} €`,
          `${bruto.toFixed(2)} €`
        ];
      });

      autoTable(doc, {
        startY: cardY + cardHeight + 7,
        head: [[
          'Fecha',
          'Nº Factura',
          'Cliente',
          'Concepto',
          'Estado',
          'Base Imp.',
          'IVA',
          'Total'
        ]],
        body: tableData,
        theme: 'striped',
        showHead: 'everyPage', // REPETIR CABECERA EN CADA PÁGINA
        margin: { top: 22, right: 15, bottom: 20, left: 15 },
        styles: {
          overflow: 'linebreak',
          cellPadding: 2.5,
          font: 'helvetica'
        },
        headStyles: {
          fillColor: [28, 25, 23],
          textColor: [255, 255, 255],
          fontSize: 8,
          fontStyle: 'bold',
          halign: 'left'
        },
        bodyStyles: {
          fontSize: 7.5,
          textColor: [55, 65, 81] // Gray-700
        },
        alternateRowStyles: {
          fillColor: [250, 250, 249] // Stone-50
        },
        columnStyles: {
          0: { cellWidth: 18, halign: 'center' }, // Fecha
          1: { cellWidth: 26, fontStyle: 'bold' }, // Nº Factura
          2: { cellWidth: 36 }, // Cliente
          3: { cellWidth: 42 }, // Concepto
          4: { cellWidth: 16, halign: 'center' }, // Estado
          5: { cellWidth: 14, halign: 'right' }, // Base
          6: { cellWidth: 14, halign: 'right' }, // IVA
          7: { cellWidth: 14, halign: 'right', fontStyle: 'bold' } // Total
        }
      });

      // Pie de página y encabezados secundarios en TODAS LAS HOJAS
      const totalPages = typeof doc.getNumberOfPages === 'function' 
        ? doc.getNumberOfPages() 
        : ((doc as any).internal?.pages?.length ? (doc as any).internal.pages.length - 1 : 1);
      const nowStr = new Date().toLocaleDateString('es-ES', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);

        // Cabecera secundaria a partir de la página 2
        if (i > 1) {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(7.5);
          doc.setTextColor(colorStoneMuted[0], colorStoneMuted[1], colorStoneMuted[2]);
          doc.text(`Registro de Facturación — ${clinicName} (${periodDescription})`, 15, 12);
          doc.setDrawColor(colorBorder[0], colorBorder[1], colorBorder[2]);
          doc.setLineWidth(0.2);
          doc.line(15, 14, pageWidth - 15, 14);
        }

        // Línea divisoria y pie de página en cada hoja
        doc.setDrawColor(colorBorder[0], colorBorder[1], colorBorder[2]);
        doc.setLineWidth(0.2);
        doc.line(15, pageHeight - 12, pageWidth - 15, pageHeight - 12);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(colorStoneMuted[0], colorStoneMuted[1], colorStoneMuted[2]);
        doc.text(
          `Documento emitido el ${nowStr} — Clínica Mercè ERP`,
          15,
          pageHeight - 7
        );
        doc.text(
          `Página ${i} de ${totalPages}`,
          pageWidth - 15,
          pageHeight - 7,
          { align: 'right' }
        );
      }

      // Nombre amigable de archivo
      const monthsSlug = selectedMonths.length === 12 
        ? 'anual' 
        : selectedMonths.map(m => m.toString().padStart(2, '0')).join('-');
      const fileName = `registro_facturacion_${selectedYear}_${monthsSlug}.pdf`;

      doc.save(fileName);
      toast.success(`PDF descargado correctamente: ${matchedInvoices.length} facturas en ${totalPages} ${totalPages === 1 ? 'página' : 'páginas'}.`);
      onClose();

    } catch (error: any) {
      console.error("Error al exportar PDF:", error);
      toast.error(error.message || "Ocurrió un error al generar el PDF de facturación.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open && !isGenerating) onClose(); }}>
      <DialogContent className="max-w-xl bg-white rounded-[2rem] border border-stone-200/80 shadow-2xl p-6 sm:p-7 overflow-hidden">
        
        {/* Cabecera del Modal */}
        <DialogHeader className="pb-3 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#B38F26] shrink-0">
              <FileText size={20} strokeWidth={2} />
            </div>
            <div>
              <DialogTitle className="text-xl sm:text-2xl font-serif text-stone-900 tracking-tight">
                Exportar Registro en PDF
              </DialogTitle>
              <DialogDescription className="text-xs text-stone-500 font-sans mt-0.5">
                Selecciona los meses del ejercicio que deseas incluir en el documento completo
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 py-2">

          {/* 1. Selector de Año */}
          <div className="flex items-center justify-between bg-stone-50/80 p-3 rounded-2xl border border-stone-200/60">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-[#B38F26]" />
              <span className="text-xs font-bold uppercase tracking-wider text-stone-700">
                Ejercicio Fiscal
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {[currentYear - 1, currentYear, currentYear + 1].map(y => (
                <button
                  key={y}
                  type="button"
                  onClick={() => setSelectedYear(y)}
                  className={`px-3 py-1 text-xs font-semibold rounded-xl transition-all ${
                    selectedYear === y
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'text-stone-600 hover:bg-stone-200/60'
                  }`}
                >
                  {y}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Accesos Rápidos (Presets) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                Selección Rápida
              </span>
              <span className="text-xs font-medium text-[#B38F26]">
                {selectedMonths.length} {selectedMonths.length === 1 ? 'mes seleccionado' : 'meses seleccionados'}
              </span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
              <button
                type="button"
                onClick={() => selectPreset('all')}
                className={`px-2 py-1.5 rounded-xl text-xs font-medium border transition-all text-center ${
                  selectedMonths.length === 12
                    ? 'border-[#D4AF37] bg-amber-500/10 text-stone-900 font-semibold'
                    : 'border-stone-200/80 bg-white text-stone-600 hover:bg-stone-50'
                }`}
              >
                Año Entero
              </button>
              <button
                type="button"
                onClick={() => selectPreset('current')}
                className={`px-2 py-1.5 rounded-xl text-xs font-medium border transition-all text-center ${
                  selectedMonths.length === 1 && selectedMonths[0] === currentMonth
                    ? 'border-[#D4AF37] bg-amber-500/10 text-stone-900 font-semibold'
                    : 'border-stone-200/80 bg-white text-stone-600 hover:bg-stone-50'
                }`}
              >
                Mes Actual
              </button>
              <button
                type="button"
                onClick={() => selectPreset('q1')}
                className="px-2 py-1.5 rounded-xl text-xs font-medium border border-stone-200/80 bg-white text-stone-600 hover:bg-stone-50 transition-all text-center"
              >
                T1 (E-M)
              </button>
              <button
                type="button"
                onClick={() => selectPreset('q2')}
                className="px-2 py-1.5 rounded-xl text-xs font-medium border border-stone-200/80 bg-white text-stone-600 hover:bg-stone-50 transition-all text-center"
              >
                T2 (A-J)
              </button>
              <button
                type="button"
                onClick={() => selectPreset('q3')}
                className="px-2 py-1.5 rounded-xl text-xs font-medium border border-stone-200/80 bg-white text-stone-600 hover:bg-stone-50 transition-all text-center"
              >
                T3 (J-S)
              </button>
              <button
                type="button"
                onClick={() => selectPreset('q4')}
                className="px-2 py-1.5 rounded-xl text-xs font-medium border border-stone-200/80 bg-white text-stone-600 hover:bg-stone-50 transition-all text-center"
              >
                T4 (O-D)
              </button>
            </div>
          </div>

          {/* 3. Cuadrícula de Selección de Meses */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
              Meses a incluir
            </span>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {MONTHS.map(m => {
                const isSelected = selectedMonths.includes(m.num);
                return (
                  <button
                    key={m.num}
                    type="button"
                    onClick={() => toggleMonth(m.num)}
                    className={`relative flex items-center justify-between p-3 rounded-2xl border transition-all text-left ${
                      isSelected
                        ? 'border-[#D4AF37] bg-gradient-to-br from-amber-50/90 to-amber-100/50 shadow-xs ring-1 ring-[#D4AF37]/30 text-stone-900 font-semibold'
                        : 'border-stone-200/80 bg-white/70 text-stone-600 hover:bg-stone-50 hover:border-stone-300'
                    }`}
                  >
                    <div>
                      <span className="text-[10px] text-stone-400 block font-mono">
                        {m.num.toString().padStart(2, '0')}
                      </span>
                      <span className="text-xs tracking-tight">
                        {m.name}
                      </span>
                    </div>

                    <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                      isSelected 
                        ? 'bg-[#D4AF37] text-white shadow-xs' 
                        : 'border border-stone-300 text-transparent'
                    }`}>
                      <Check size={12} strokeWidth={3} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Filtro de Estado de Factura */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-2 border-t border-stone-100">
            <span className="text-xs font-semibold text-stone-700">
              Estado de facturas:
            </span>
            <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  statusFilter === 'all'
                    ? 'bg-white text-stone-900 shadow-xs font-bold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Todas
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('paid')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  statusFilter === 'paid'
                    ? 'bg-white text-stone-900 shadow-xs font-bold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Solo Pagadas
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('pending')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  statusFilter === 'pending'
                    ? 'bg-white text-stone-900 shadow-xs font-bold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Solo Pendientes
              </button>
            </div>
          </div>

        </div>

        {/* Pie del Modal con Acciones */}
        <DialogFooter className="pt-4 border-t border-stone-100 flex items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isGenerating}
            className="rounded-xl border-stone-200 text-stone-600 hover:bg-stone-50"
          >
            Cancelar
          </Button>

          <Button
            type="button"
            variant="luxury"
            onClick={handleGeneratePdf}
            disabled={isGenerating || selectedMonths.length === 0}
            className="rounded-xl gap-2 font-medium"
          >
            {isGenerating ? (
              <>
                <Loader2 size={16} className="animate-spin text-white" />
                <span>Generando Documento...</span>
              </>
            ) : (
              <>
                <Download size={16} />
                <span>Descargar PDF ({selectedMonths.length} {selectedMonths.length === 1 ? 'mes' : 'meses'})</span>
              </>
            )}
          </Button>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
}

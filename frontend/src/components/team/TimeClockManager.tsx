"use client"

import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  FileSpreadsheet, 
  Smartphone, 
  User, 
  CheckCircle2, 
  Coffee, 
  AlertCircle, 
  Loader2, 
  ShieldCheck,
  Filter,
  Sparkles
} from 'lucide-react';
import { getTimeClockDailySummaryAction } from '@/app/actions/team';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

interface TimeClockManagerProps {
  teamMembers: Array<{ id: string; full_name: string; role: string }>;
}

export default function TimeClockManager({ teamMembers }: TimeClockManagerProps) {
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth() + 1);
  const [selectedStaffId, setSelectedStaffId] = useState<string>('all');
  
  const [loading, setLoading] = useState<boolean>(true);
  const [exporting, setExporting] = useState<boolean>(false);
  const [data, setData] = useState<{
    total_worked_hours: number;
    total_days_worked: number;
    active_staff_count: number;
    shifts: any[];
  } | null>(null);

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const res = await getTimeClockDailySummaryAction(selectedMonth, selectedYear, selectedStaffId);
      if (res.success && res.data) {
        setData(res.data);
      } else {
        toast.error(res.error || "Error al cargar registros de jornada.");
      }
    } catch (err: any) {
      toast.error(err.message || "Error al conectar con el servidor de fichajes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [selectedMonth, selectedYear, selectedStaffId]);

  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(prev => prev - 1);
    } else {
      setSelectedMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(prev => prev + 1);
    } else {
      setSelectedMonth(prev => prev + 1);
    }
  };

  const handleCurrentMonth = () => {
    setSelectedYear(now.getFullYear());
    setSelectedMonth(now.getMonth() + 1);
  };

  const handleExportExcel = async () => {
    try {
      setExporting(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const tenantMatch = document.cookie.match(/(?:^|; )tenant_id=([^;]*)/);
      const tenantId = tenantMatch ? tenantMatch[1] : '';

      const query = new URLSearchParams({
        month: selectedMonth.toString(),
        year: selectedYear.toString(),
        ...(selectedStaffId !== 'all' ? { staff_id: selectedStaffId } : {}),
        ...(tenantId ? { tenant_id: tenantId } : {})
      });

      const downloadUrl = `${apiUrl}/time-clock/export-excel?${query.toString()}`;
      
      const res = await fetch(downloadUrl, {
        headers: {
          ...(tenantId ? { 'X-Tenant-ID': tenantId } : {})
        }
      });

      if (!res.ok) {
        throw new Error("No se pudo generar el archivo Excel de fichajes.");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `registro_jornada_${selectedYear}_${String(selectedMonth).padStart(2, '0')}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Informe laboral oficial descargado con éxito.");
    } catch (err: any) {
      toast.error(err.message || "Error al descargar el archivo Excel.");
    } finally {
      setExporting(false);
    }
  };

  const shifts = data?.shifts || [];
  const totalHours = data?.total_worked_hours || 0;
  const totalDays = data?.total_days_worked || 0;
  const avgHoursPerDay = totalDays > 0 ? (totalHours / totalDays).toFixed(2) : '0.00';

  const formatShiftDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const dayName = dateObj.toLocaleDateString('es-ES', { weekday: 'short' });
    return `${dayName.charAt(0).toUpperCase() + dayName.slice(1)}, ${d} ${monthNames[m - 1].slice(0, 3)}`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Barra de Filtros y Acciones */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 sm:p-6 bg-white rounded-3xl border border-stone-200/80 shadow-xs">
        {/* Selector de Mes con Flechas */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-stone-100 rounded-2xl p-1 border border-stone-200/60 shadow-2xs">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-white transition-all active:scale-95"
              title="Mes anterior"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-4 text-xs font-bold font-mono text-stone-800 min-w-[130px] text-center select-none">
              {monthNames[selectedMonth - 1]} {selectedYear}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-white transition-all active:scale-95"
              title="Mes siguiente"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <button
            type="button"
            onClick={handleCurrentMonth}
            className="py-2 px-3 rounded-xl bg-stone-50 hover:bg-stone-100 text-stone-600 border border-stone-200/60 text-xs font-bold transition-all"
          >
            Mes Actual
          </button>
        </div>

        {/* Selector de Empleado y Botón de Descarga Excel */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Filtro Empleada */}
          <div className="flex items-center gap-2 bg-stone-50 border border-stone-200/80 rounded-2xl px-3 py-1.5 shadow-2xs">
            <Filter size={14} className="text-stone-400" />
            <select
              value={selectedStaffId}
              onChange={(e) => setSelectedStaffId(e.target.value)}
              className="bg-transparent text-xs font-bold text-stone-800 focus:outline-none cursor-pointer pr-2"
            >
              <option value="all">Todas las Empleadas</option>
              {teamMembers.map(m => (
                <option key={m.id} value={m.id}>
                  {m.full_name} ({m.role})
                </option>
              ))}
            </select>
          </div>

          {/* Botón Exportar Gestoría Excel */}
          <Button
            type="button"
            variant="luxury"
            onClick={handleExportExcel}
            disabled={exporting || loading}
            className="rounded-2xl px-5 h-11 text-xs font-bold gap-2 shadow-sm"
          >
            {exporting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <FileSpreadsheet size={16} className="text-[#FF6B00]" />
            )}
            <span>{exporting ? "Generando..." : "Descargar Excel Gestoría"}</span>
          </Button>
        </div>
      </div>

      {/* Bento Grid de Métricas del Mes */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* KPI 1: Horas Totales */}
        <div className="p-5 rounded-3xl bg-white border border-stone-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
              Horas Netas
            </span>
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#FF6B00] flex items-center justify-center border border-orange-200/60 shadow-2xs">
              <Clock size={16} />
            </div>
          </div>
          {loading ? (
            <Skeleton className="h-8 w-24 rounded-lg" />
          ) : (
            <div>
              <p className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight">
                {totalHours.toFixed(1)} <span className="text-sm font-sans font-normal text-stone-400">h</span>
              </p>
              <p className="text-[10px] text-emerald-600 font-bold mt-1">Conforme a RDL 8/2019</p>
            </div>
          )}
        </div>

        {/* KPI 2: Días Trabajados */}
        <div className="p-5 rounded-3xl bg-white border border-stone-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
              Días con Jornada
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200/60 shadow-2xs">
              <Calendar size={16} />
            </div>
          </div>
          {loading ? (
            <Skeleton className="h-8 w-16 rounded-lg" />
          ) : (
            <div>
              <p className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight">
                {totalDays} <span className="text-sm font-sans font-normal text-stone-400">días</span>
              </p>
              <p className="text-[10px] text-stone-400 font-medium mt-1">Registrados en {monthNames[selectedMonth - 1]}</p>
            </div>
          )}
        </div>

        {/* KPI 3: Promedio Diario */}
        <div className="p-5 rounded-3xl bg-white border border-stone-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
              Media Diaria
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200/60 shadow-2xs">
              <Sparkles size={16} />
            </div>
          </div>
          {loading ? (
            <Skeleton className="h-8 w-20 rounded-lg" />
          ) : (
            <div>
              <p className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight">
                {avgHoursPerDay} <span className="text-sm font-sans font-normal text-stone-400">h / día</span>
              </p>
              <p className="text-[10px] text-stone-400 font-medium mt-1">Promedio por turno</p>
            </div>
          )}
        </div>

        {/* KPI 4: Empleadas Activas */}
        <div className="p-5 rounded-3xl bg-white border border-stone-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
              Personal Fichado
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-200/60 shadow-2xs">
              <User size={16} />
            </div>
          </div>
          {loading ? (
            <Skeleton className="h-8 w-16 rounded-lg" />
          ) : (
            <div>
              <p className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight">
                {data?.active_staff_count || 0} <span className="text-sm font-sans font-normal text-stone-400">operadoras</span>
              </p>
              <p className="text-[10px] text-stone-400 font-medium mt-1">En el período seleccionado</p>
            </div>
          )}
        </div>
      </div>

      {/* Tabla de Fichajes Detallada */}
      <div className="bg-white rounded-[2.5rem] border border-stone-200/80 shadow-xs overflow-hidden p-4 sm:p-8">
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left border-collapse min-w-[750px]">
            <thead>
              <tr className="border-b border-stone-100">
                <th className="pb-4 px-4 text-[11px] font-black uppercase tracking-widest text-stone-400">Fecha</th>
                <th className="pb-4 px-4 text-[11px] font-black uppercase tracking-widest text-stone-400">Trabajadora</th>
                <th className="pb-4 px-4 text-[11px] font-black uppercase tracking-widest text-stone-400 text-center">Entrada</th>
                <th className="pb-4 px-4 text-[11px] font-black uppercase tracking-widest text-stone-400 text-center">Pausa / Descanso</th>
                <th className="pb-4 px-4 text-[11px] font-black uppercase tracking-widest text-stone-400 text-center">Salida</th>
                <th className="pb-4 px-4 text-[11px] font-black uppercase tracking-widest text-stone-400 text-right">Horas Netas</th>
                <th className="pb-4 px-4 text-[11px] font-black uppercase tracking-widest text-stone-400">Terminal</th>
                <th className="pb-4 px-4 text-[11px] font-black uppercase tracking-widest text-stone-400 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {loading ? (
                Array(4).fill(0).map((_, i) => (
                  <tr key={i}>
                    <td className="py-4 px-4"><Skeleton className="h-4 w-28 rounded-lg" /></td>
                    <td className="py-4 px-4"><Skeleton className="h-4 w-32 rounded-lg" /></td>
                    <td className="py-4 px-4 text-center"><Skeleton className="h-4 w-16 mx-auto rounded-lg" /></td>
                    <td className="py-4 px-4 text-center"><Skeleton className="h-4 w-24 mx-auto rounded-lg" /></td>
                    <td className="py-4 px-4 text-center"><Skeleton className="h-4 w-16 mx-auto rounded-lg" /></td>
                    <td className="py-4 px-4 text-right"><Skeleton className="h-4 w-16 ml-auto rounded-lg" /></td>
                    <td className="py-4 px-4"><Skeleton className="h-4 w-28 rounded-lg" /></td>
                    <td className="py-4 px-4 text-center"><Skeleton className="h-5 w-20 mx-auto rounded-full" /></td>
                  </tr>
                ))
              ) : shifts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#FF6B00] flex items-center justify-center mx-auto mb-3 border border-orange-200/60 shadow-2xs">
                      <Clock size={22} />
                    </div>
                    <p className="font-bold text-stone-700 text-sm">No hay registros de jornada en este período</p>
                    <p className="text-xs text-stone-400 max-w-sm mx-auto mt-1">
                      Las empleadas pueden escanear el código QR que se actualiza cada 20 segundos en el mostrador para registrar sus turnos.
                    </p>
                  </td>
                </tr>
              ) : shifts.map((shift, idx) => (
                <tr key={`${shift.date}_${shift.staff_id}_${idx}`} className="group hover:bg-stone-50/60 transition-colors">
                  {/* Fecha */}
                  <td className="py-4 px-4">
                    <span className="font-bold text-xs text-stone-800">
                      {formatShiftDate(shift.date)}
                    </span>
                  </td>

                  {/* Trabajadora */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center text-xs font-bold text-stone-600 border border-stone-200/60 shrink-0">
                        {shift.staff_name.charAt(0)}
                      </div>
                      <span className="font-bold text-xs text-stone-800 truncate max-w-[140px]">
                        {shift.staff_name}
                      </span>
                    </div>
                  </td>

                  {/* Entrada */}
                  <td className="py-4 px-4 text-center">
                    <span className="font-mono text-xs font-bold text-stone-700 bg-stone-100 px-2 py-1 rounded-md">
                      {shift.first_in}
                    </span>
                  </td>

                  {/* Pausa */}
                  <td className="py-4 px-4 text-center">
                    {shift.break_minutes > 0 ? (
                      <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                        {shift.break_minutes} min ({shift.break_start?.slice(0, 5)} - {shift.break_end?.slice(0, 5)})
                      </span>
                    ) : (
                      <span className="text-stone-300 text-xs">—</span>
                    )}
                  </td>

                  {/* Salida */}
                  <td className="py-4 px-4 text-center">
                    <span className="font-mono text-xs font-bold text-stone-700 bg-stone-100 px-2 py-1 rounded-md">
                      {shift.last_out}
                    </span>
                  </td>

                  {/* Horas Netas */}
                  <td className="py-4 px-4 text-right">
                    <span className="font-mono text-xs font-extrabold text-[#FF6B00] bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-200/60 shadow-2xs">
                      {shift.worked_hours_formatted}
                    </span>
                  </td>

                  {/* Terminal / Dispositivo */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1.5 text-xs text-stone-500">
                      <Smartphone size={13} className="text-stone-400 shrink-0" />
                      <span className="truncate max-w-[120px]" title={shift.device_label}>
                        {shift.device_label}
                      </span>
                    </div>
                  </td>

                  {/* Estado */}
                  <td className="py-4 px-4 text-center">
                    {shift.status === 'completed' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60 shadow-2xs">
                        <CheckCircle2 size={10} /> Completa
                      </span>
                    ) : shift.status === 'break' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60 shadow-2xs">
                        <Coffee size={10} /> En Pausa
                      </span>
                    ) : shift.status === 'in_progress' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200/60 shadow-2xs animate-pulse">
                        <Clock size={10} /> En Curso
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200/60 shadow-2xs">
                        <AlertCircle size={10} /> Sin Cierre
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Nota Legal Informativa */}
      <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/60 flex items-start gap-3">
        <ShieldCheck size={18} className="text-emerald-600 shrink-0 mt-0.5" />
        <p className="text-[11px] text-stone-500 leading-relaxed">
          <strong>Validez Jurídica</strong>: Los registros aquí computados se almacenan con sello de tiempo inmutable en el servidor según lo establecido en el <em>art. 34.9 del Estatuto de los Trabajadores</em>. Puedes pulsar en <strong>"Descargar Excel Gestoría"</strong> a final de cada mes para remitir la planilla oficial a tu asesoría laboral.
        </p>
      </div>
    </div>
  );
}

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSupabaseAdmin } from '@/lib/supabase';
import * as XLSX from 'xlsx';

export const dynamic = 'force-dynamic';

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;

    const cookieStore = cookies();
    let tenantId = searchParams.get('tenant_id') || cookieStore.get('tenant_id')?.value;
    const isImpersonating = cookieStore.get('is_impersonating')?.value === 'true';
    const impersonateTenantId = cookieStore.get('impersonate_tenant_id')?.value;
    if (isImpersonating && impersonateTenantId) tenantId = impersonateTenantId;

    if (!tenantId) {
      return new NextResponse(JSON.stringify({ error: "Tenant context missing" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Resolver slug a UUID si es necesario
    let resolvedId = tenantId;
    if (!/^[0-9a-fA-F-]{36}$/.test(tenantId)) {
      const { data: tenantRow } = await supabaseAdmin
        .from('tenants')
        .select('id')
        .eq('slug', tenantId)
        .maybeSingle();
      if (tenantRow?.id) {
        resolvedId = tenantRow.id;
      }
    }

    const now = new Date();
    const tYear = parseInt(searchParams.get('year') || String(now.getFullYear()), 10);
    const tMonth = parseInt(searchParams.get('month') || String(now.getMonth() + 1), 10);
    const staffId = searchParams.get('staff_id');

    // 1. Obtener datos de la clínica para encabezados oficiales
    const { data: settings } = await supabaseAdmin
      .from('clinic_settings')
      .select('clinic_name, cif_nif')
      .eq('tenant_id', resolvedId)
      .maybeSingle();

    const clinicName = settings?.clinic_name || "Centro de Estética / Clínica";
    const clinicCif = settings?.cif_nif || "No especificado";

    // 2. Rango del mes seleccionado (UTC)
    const startDate = new Date(Date.UTC(tYear, tMonth - 1, 1, 0, 0, 0)).toISOString();
    const endDate = tMonth === 12
      ? new Date(Date.UTC(tYear + 1, 0, 1, 0, 0, 0)).toISOString()
      : new Date(Date.UTC(tYear, tMonth, 1, 0, 0, 0)).toISOString();

    // 3. Consultar fichajes
    let querySupa = supabaseAdmin
      .from('time_clock_records')
      .select('*')
      .eq('tenant_id', resolvedId)
      .gte('timestamp', startDate)
      .lt('timestamp', endDate)
      .order('timestamp', { ascending: true });

    if (staffId && staffId !== 'all') {
      querySupa = querySupa.eq('staff_id', staffId);
    }

    const { data: records, error: recErr } = await querySupa;
    if (recErr) throw recErr;

    // 4. Mapear perfiles de empleadas
    const { data: profs } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, email, role')
      .eq('tenant_id', resolvedId);
    const profMap: Record<string, string> = {};
    (profs || []).forEach(p => {
      profMap[p.id] = p.full_name || p.email || 'Operador';
    });

    // 5. Agrupar por día y por empleada
    const grouped: Record<string, any[]> = {};
    (records || []).forEach(r => {
      const dateStr = r.timestamp ? r.timestamp.slice(0, 10) : '';
      const key = `${dateStr}__${r.staff_id}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(r);
    });

    const shiftRows: any[] = [];
    let grandTotalMins = 0;

    Object.keys(grouped).sort().reverse().forEach(key => {
      const dayRecs = grouped[key];
      const [dateStr, sId] = key.split('__');
      let firstIn: string | null = null;
      let lastOut: string | null = null;
      let breakMins = 0;
      let currentBreakStart: Date | null = null;
      let totalMins = 0;
      let deviceLabel = 'Terminal Mostrador';

      for (const ev of dayRecs) {
        if (ev.device_label) deviceLabel = ev.device_label;
        const evTime = new Date(ev.timestamp);
        const timeFormatted = evTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

        if (ev.event_type === 'clock_in' && !firstIn) {
          firstIn = timeFormatted;
        } else if (ev.event_type === 'clock_out') {
          lastOut = timeFormatted;
        } else if (ev.event_type === 'break_start') {
          currentBreakStart = evTime;
        } else if (ev.event_type === 'break_end' && currentBreakStart) {
          const diffMs = evTime.getTime() - currentBreakStart.getTime();
          breakMins += Math.max(0, Math.floor(diffMs / 60000));
          currentBreakStart = null;
        }
      }

      if (typeof firstIn === 'string' && typeof lastOut === 'string') {
        const [hIn, mIn, sIn = 0] = firstIn.split(':').map(Number);
        const [hOut, mOut, sOut = 0] = lastOut.split(':').map(Number);
        const elapsed = (hOut * 60 + mOut) - (hIn * 60 + mIn);
        totalMins = Math.max(0, elapsed - breakMins);
      } else if (firstIn) {
        totalMins = 0;
      }

      grandTotalMins += totalMins;

      const hoursPart = Math.floor(totalMins / 60);
      const minsPart = totalMins % 60;
      const formattedDuration = `${hoursPart}h ${String(minsPart).padStart(2, '0')}m`;
      const statusLabel = firstIn && lastOut ? 'Completada' : firstIn ? 'En curso' : 'Sin salida';

      shiftRows.push([
        dateStr,
        profMap[sId] || 'Operador',
        firstIn || '-',
        breakMins > 0 ? `${breakMins} min` : '0 min',
        lastOut || '-',
        formattedDuration,
        deviceLabel,
        statusLabel,
        'Conforme',
        'Conforme'
      ]);
    });

    const monthName = MONTH_NAMES[tMonth - 1] || `Mes ${tMonth}`;
    const totalHoursDec = (grandTotalMins / 60).toFixed(2);
    const uniqueDays = new Set(Object.keys(grouped).map(k => k.split('__')[0])).size;
    const uniqueStaff = new Set(Object.keys(grouped).map(k => k.split('__')[1])).size;

    // 6. Construir filas oficiales del libro Excel
    const aoaData: any[][] = [
      ["REGISTRO DIARIO DE JORNADA LABORAL"],
      ["Conforme al Real Decreto-ley 8/2019, de 8 de marzo (art. 34.9 Estatuto de los Trabajadores)"],
      [],
      ["EMPRESA / RAZÓN SOCIAL:", clinicName, "", "CIF / NIF:", clinicCif],
      ["PERÍODO LIQUIDADO:", `${monthName.toUpperCase()} ${tYear}`, "", "FECHA EMISIÓN:", now.toLocaleDateString('es-ES')],
      [],
      [
        "FECHA",
        "TRABAJADOR / OPERADOR",
        "HORA ENTRADA",
        "PAUSA / DESCANSO",
        "HORA SALIDA",
        "HORAS NETAS",
        "TERMINAL / DISPOSITIVO",
        "ESTADO",
        "FIRMA TRABAJADOR/A",
        "FIRMA EMPRESA"
      ],
      ...shiftRows,
      [],
      [
        "TOTAL HORAS NETAS:",
        `${totalHoursDec} horas`,
        "DÍAS CON JORNADA:",
        `${uniqueDays} días`,
        "PERSONAL COMPUTADO:",
        `${uniqueStaff} trabajadoras`
      ]
    ];

    const ws = XLSX.utils.aoa_to_sheet(aoaData);

    // Ajustar ancho de columnas para lectura impecable en Microsoft Excel
    ws['!cols'] = [
      { wch: 14 }, // Fecha
      { wch: 28 }, // Trabajador
      { wch: 16 }, // Entrada
      { wch: 18 }, // Pausa
      { wch: 16 }, // Salida
      { wch: 16 }, // Horas Netas
      { wch: 24 }, // Terminal
      { wch: 16 }, // Estado
      { wch: 22 }, // Firma Trabajador
      { wch: 22 }  // Firma Empresa
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `Jornada_${tYear}_${String(tMonth).padStart(2, '0')}`);

    const fileBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    const headers = new Headers();
    headers.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    const filename = `registro_jornada_${tYear}_${String(tMonth).padStart(2, '0')}.xlsx`;
    headers.set('Content-Disposition', `attachment; filename="${filename}"`);
    headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');

    return new NextResponse(fileBuffer, {
      status: 200,
      headers
    });
  } catch (err: any) {
    console.error("Error en API export-excel:", err);
    return new NextResponse(JSON.stringify({ error: err.message || "Error al exportar Excel" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

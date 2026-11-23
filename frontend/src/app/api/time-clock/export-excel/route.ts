import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

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

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
    const query = new URLSearchParams(searchParams);
    if (!query.has('tenant_id') && tenantId) {
      query.set('tenant_id', tenantId);
    }

    const backendRes = await fetch(`${apiUrl}/time-clock/export-excel?${query.toString()}`, {
      headers: {
        'X-Tenant-ID': tenantId,
      },
      cache: 'no-store'
    });

    if (!backendRes.ok) {
      const errText = await backendRes.text();
      return new NextResponse(errText, { status: backendRes.status });
    }

    const blob = await backendRes.blob();
    const headers = new Headers();
    headers.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    const filename = `registro_jornada_${searchParams.get('year') || '2026'}_${String(searchParams.get('month') || '11').padStart(2, '0')}.xlsx`;
    headers.set('Content-Disposition', `attachment; filename="${filename}"`);

    return new NextResponse(blob, {
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

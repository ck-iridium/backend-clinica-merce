import { NextRequest, NextResponse } from 'next/server';
import { resolveTenantContext } from '@/lib/tenant-resolver';

export const dynamic = 'force-dynamic';

const DEFAULT_PROBOOKIA_SVG = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg width="601" height="601" viewBox="0 0 601 601" version="1.1" xmlns="http://www.w3.org/2000/svg" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">
    <path d="M502.628,0C556.921,0 601,44.079 601,98.372L601,502.628C601,556.921 556.921,601 502.628,601L98.372,601C44.079,601 0,556.921 0,502.628L0,98.372C0,44.079 44.079,0 98.372,0L502.628,0Z" style="fill:rgb(29,43,88);"/>
    <g transform="matrix(1.390186,0,0,1.390186,-1110.210872,-403.939405)">
        <path d="M930.1,432.8C946.5,430.9 961.5,434 976,442.2C984.8,447.2 999.6,460.1 1006.1,468.5L1008.4,471.5L1003.3,478C1000.5,481.6 996.1,487.6 993.6,491.3L989,498.2L984.5,492.8C971.9,477.9 960.9,469.1 951,466.2C945.1,464.5 933.4,464.5 927.5,466.2C910.4,471.2 897.6,488.2 897.5,506C897.5,526.9 910.9,544.2 930.5,548.3C934.2,549.1 943.5,549.2 947.5,548.4C956.7,546.8 962.7,543.5 971.6,535.2C981.2,526.3 985.4,521.1 1005,493.5C1011.7,484.2 1019.1,474 1021.6,471C1027.2,464.2 1038.2,453.1 1043.5,449.2C1048.1,445.7 1058,439.9 1063,437.8C1101.1,421.6 1145.6,441.9 1159.9,482C1162.6,489.6 1163.8,497.1 1163.7,507C1163.7,516.9 1163.4,519.6 1161.3,527C1155.9,546.3 1143.7,562 1126.5,571.7C1113.2,579.2 1102.2,581.7 1085,581.1C1070.4,580.5 1055.3,574.7 1043,564.9C1039.8,562.3 1024.6,547 1023,544.7C1021.9,543.2 1022.3,542.2 1025.7,537.7C1027.9,534.9 1031.8,529.4 1034.4,525.5C1037,521.7 1039.5,518.2 1039.8,517.9C1040.7,517 1041.6,517.8 1045.8,522.7C1050.3,527.8 1059.9,537.4 1063,539.7C1080.3,552.8 1103.7,552.2 1118,538.5C1128,528.9 1132,519.6 1131.8,506C1131.6,488.1 1121.8,473.8 1105.5,467.6C1091.8,462.4 1075.2,465.1 1062.5,474.6C1056.4,479.2 1041,496.9 1035,506C1026.6,519.1 1005,547.3 998.2,554.2C981.3,571.3 964.2,580 945,581.1C912.2,583 883.1,565 871.2,535.5C866.6,524.2 865.3,515.7 866,501C867.4,473.7 886.5,447.8 913,437.2C916.4,435.9 926.9,433.2 930.1,432.8Z" style="fill:rgb(255,122,0);"/>
    </g>
</svg>`;

function parseDataUri(dataUri: string): { mimeType: string; buffer: Buffer } | null {
  try {
    if (dataUri.startsWith('data:image/svg+xml;utf8,')) {
      const svgText = decodeURIComponent(dataUri.replace('data:image/svg+xml;utf8,', ''));
      return { mimeType: 'image/svg+xml', buffer: Buffer.from(svgText, 'utf-8') };
    }
    const commaIdx = dataUri.indexOf(',');
    if (commaIdx === -1) return null;
    const header = dataUri.substring(0, commaIdx);
    const base64Data = dataUri.substring(commaIdx + 1);
    const mimeMatch = header.match(/^data:([^;]+)/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';
    const buffer = Buffer.from(base64Data, 'base64');
    return { mimeType, buffer };
  } catch {
    return null;
  }
}

function serveImageResponse(buffer: Buffer, mimeType: string) {
  return new Response(new Uint8Array(buffer), {
    status: 200,
    headers: {
      'Content-Type': mimeType,
      'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
      'Content-Length': buffer.length.toString(),
    },
  });
}

function serveDefaultProbookiaSvg() {
  const buf = Buffer.from(DEFAULT_PROBOOKIA_SVG, 'utf-8');
  return serveImageResponse(buf, 'image/svg+xml');
}

export async function GET(request: NextRequest) {
  try {
    const { isMarketing, tenantId, apiUrl } = await resolveTenantContext();
    const resolvedApiUrl = process.env.NEXT_PUBLIC_API_URL || apiUrl || 'http://localhost:8000';

    // 1. CONTEXTO MARKETING (ProBookia SaaS principal)
    if (isMarketing) {
      try {
        const resPub = await fetch(`${resolvedApiUrl}/super-admin/marketing/public`, {
          next: { revalidate: 300, tags: ['marketing-favicon'] },
        });

        if (resPub.ok) {
          const data = await resPub.json();
          const favUrl = data.settings?.favicon_url;

          if (favUrl) {
            if (favUrl.startsWith('data:')) {
              const parsed = parseDataUri(favUrl);
              if (parsed) {
                return serveImageResponse(parsed.buffer, parsed.mimeType);
              }
            } else if (favUrl.startsWith('http://') || favUrl.startsWith('https://')) {
              const imgRes = await fetch(favUrl, { next: { revalidate: 86400 } });
              if (imgRes.ok) {
                const cType = imgRes.headers.get('content-type') || 'image/svg+xml';
                const ab = await imgRes.arrayBuffer();
                return serveImageResponse(Buffer.from(ab), cType);
              }
            }
          }
        }
      } catch (err) {
        console.error('[API FAVICON] Error al obtener favicon de marketing:', err);
      }

      return serveDefaultProbookiaSvg();
    }

    // 2. CONTEXTO TENANT / CLÍNICA (ej. esteticamerce.com o [slug].probookia.com)
    if (tenantId) {
      try {
        const resSettings = await fetch(`${resolvedApiUrl}/settings/`, {
          headers: { 'X-Tenant-ID': tenantId },
          next: { revalidate: 300, tags: [`tenant-favicon-${tenantId}`] },
        });

        if (resSettings.ok) {
          const s = await resSettings.json();
          const candidate = s.favicon_b64 || s.logo_app_b64 || s.logo_pdf_b64;

          if (candidate) {
            if (candidate.startsWith('data:')) {
              const parsed = parseDataUri(candidate);
              if (parsed) {
                return serveImageResponse(parsed.buffer, parsed.mimeType);
              }
            } else if (candidate.startsWith('http://') || candidate.startsWith('https://')) {
              const imgRes = await fetch(candidate, { next: { revalidate: 86400 } });
              if (imgRes.ok) {
                const cType = imgRes.headers.get('content-type') || 'image/png';
                const ab = await imgRes.arrayBuffer();
                return serveImageResponse(Buffer.from(ab), cType);
              }
            }
          }
        }
      } catch (err) {
        console.error('[API FAVICON] Error al obtener favicon de tenant:', err);
      }
    }

    // Fallback si no tiene favicon personalizado
    return serveDefaultProbookiaSvg();
  } catch (error) {
    console.error('[API FAVICON] Error inesperado:', error);
    return serveDefaultProbookiaSvg();
  }
}

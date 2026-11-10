/**
 * Utilidad de Layout para Citas Concurrentes en la Agenda (v2)
 * Implementa el algoritmo de Interval Graph Coloring & Greedy Column Packing
 * (estándar de la industria en Google Calendar, Fresha y Apple Calendar).
 */

export interface PositionedAppointment {
  appointment: any;
  topPercent: number;
  heightPercent: number;
  widthStyle: string;
  leftStyle: string;
  zIndex: number;
  columnIndex: number;
  totalColumns: number;
}

/**
 * Calcula la posición porcentual (top, height) y la partición en sub-columnas
 * (widthStyle, leftStyle) para todas las citas que se solapan en una columna de día,
 * reservando un carril derecho libre para creación de citas en la misma hora.
 */
export function computeConcurrentAppointmentLayout(
  appointments: any[],
  startHour: number,
  totalHours: number,
  rightGutterPx: number = 22
): PositionedAppointment[] {
  // 1. Filtrar citas activas (no canceladas)
  const activeAppts = (appointments || []).filter(a => a && a.status !== 'cancelled');
  if (activeAppts.length === 0) return [];

  const dayStartMins = startHour * 60;
  const totalDayMins = totalHours * 60;

  // 2. Extraer tiempos normalizados en minutos
  const items = activeAppts.map(appt => {
    let tS = appt.start_time || '';
    let tE = appt.end_time || '';
    if (typeof tS === 'string' && tS.endsWith('Z')) tS = tS.slice(0, -1);
    if (typeof tE === 'string' && tE.endsWith('Z')) tE = tE.slice(0, -1);

    const s = new Date(tS);
    const e = new Date(tE);

    const startMin = (s.getHours() * 60) + s.getMinutes();
    let endMin = (e.getHours() * 60) + e.getMinutes();
    if (endMin <= startMin) {
      endMin = startMin + 15; // Mínimo de renderizado: 15 minutos
    }

    const diffMins = Math.max(startMin - dayStartMins, 0);
    const duration = Math.max(endMin - startMin, 15);

    const topPercent = (diffMins / totalDayMins) * 100;
    const heightPercent = (duration / totalDayMins) * 100;

    return {
      appointment: appt,
      startMin,
      endMin,
      topPercent,
      heightPercent,
    };
  });

  // 3. Ordenar por startMin ascendente, y ante empate, por duración descendente
  items.sort((a, b) => {
    if (a.startMin !== b.startMin) return a.startMin - b.startMin;
    return (b.endMin - b.startMin) - (a.endMin - a.startMin);
  });

  // 4. Agrupar en Clusters Conexos de Solapamiento
  const clusters: Array<typeof items> = [];
  let currentCluster: typeof items = [];
  let clusterEnd = -1;

  for (const item of items) {
    if (currentCluster.length === 0) {
      currentCluster.push(item);
      clusterEnd = item.endMin;
    } else {
      if (item.startMin < clusterEnd) {
        // Solapamiento transitivo con el cluster activo
        currentCluster.push(item);
        clusterEnd = Math.max(clusterEnd, item.endMin);
      } else {
        // Comienza después del final del cluster anterior -> nuevo cluster
        clusters.push(currentCluster);
        currentCluster = [item];
        clusterEnd = item.endMin;
      }
    }
  }
  if (currentCluster.length > 0) {
    clusters.push(currentCluster);
  }

  // 5. Asignación voraz de carriles (Greedy Column Packing) dentro de cada cluster
  const result: PositionedAppointment[] = [];

  for (const cluster of clusters) {
    const columns: number[] = []; // endMin del último evento en cada carril virtual
    const clusterPositions: Array<{
      item: typeof items[0];
      columnIndex: number;
    }> = [];

    for (const item of cluster) {
      let placed = false;
      for (let c = 0; c < columns.length; c++) {
        if (item.startMin >= columns[c]) {
          columns[c] = item.endMin;
          clusterPositions.push({ item, columnIndex: c });
          placed = true;
          break;
        }
      }
      if (!placed) {
        columns.push(item.endMin);
        clusterPositions.push({ item, columnIndex: columns.length - 1 });
      }
    }

    const totalColumns = columns.length;

    for (const { item, columnIndex } of clusterPositions) {
      let widthStyle: string;
      let leftStyle: string;

      if (totalColumns === 1) {
        // Deja libre el carril derecho (rightGutterPx) para que el slot subyacente y su botón '+' sean clicables
        widthStyle = `calc(100% - ${rightGutterPx + 6}px)`;
        leftStyle = '3px';
      } else {
        // Garantiza que todo el cluster respete el gutter derecho completo de forma matemática exacta
        widthStyle = `calc((100% - ${rightGutterPx + 6}px) / ${totalColumns} - 2px)`;
        leftStyle = `calc(3px + (${columnIndex} * (100% - ${rightGutterPx + 6}px) / ${totalColumns}))`;
      }

      result.push({
        appointment: item.appointment,
        topPercent: item.topPercent,
        heightPercent: item.heightPercent,
        widthStyle,
        leftStyle,
        zIndex: 20 + columnIndex,
        columnIndex,
        totalColumns
      });
    }
  }

  return result;
}

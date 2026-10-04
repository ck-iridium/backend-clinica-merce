import {
  SeoEntity,
  SemanticNode,
  CannibalizationIssue,
  NodeStatus,
  EcosystemData,
} from './types';
import { normalizeKeyword, extractMeaningfulTokens, formatSectorName } from './semantic-graph';

/**
 * Calcula la similaridad de Jaccard entre dos listas de tokens
 */
export function calculateTokenSimilarity(tokensA: string[], tokensB: string[]): number {
  if (tokensA.length === 0 || tokensB.length === 0) return 0;
  const setA = new Set(tokensA);
  const setB = new Set(tokensB);
  let intersection = 0;
  setA.forEach((token) => {
    if (setB.has(token)) intersection++;
  });
  const union = new Set([...tokensA, ...tokensB]).size;
  return union === 0 ? 0 : intersection / union;
}

/**
 * Detecta si dos entidades son variantes legítimas y diferenciadas de un mismo servicio
 * (ej. Hombre vs Mujer, Con brazos vs Sin brazos, Zona L vs Zona M vs Zona S).
 * En estos casos, Google reconoce que satisfacen intenciones de búsqueda distintas.
 */
function hasDifferentiatingModifier(nameA: string, nameB: string): boolean {
  const normA = normalizeKeyword(nameA);
  const normB = normalizeKeyword(nameB);

  // Pares de diferenciadores obvios y opuestos
  const opposingPairs: Array<[string, string]> = [
    ['hombre', 'mujer'],
    ['con brazos', 'sin brazos'],
    ['con', 'sin'],
    ['zona l', 'zona m'],
    ['zona l', 'zona s'],
    ['zona m', 'zona s'],
    ['laminado', 'lifting'],
    ['cejas y labio', 'cejas'],
  ];

  for (const [modA, modB] of opposingPairs) {
    if (
      (normA.includes(modA) && normB.includes(modB)) ||
      (normA.includes(modB) && normB.includes(modA))
    ) {
      return true;
    }
  }

  // Comprobar si difieren en tokens de zona o tamaño (ej: zona l vs zona m vs zona s)
  const regexSize = /\b(zona\s+[lms]|zona\s+xl|zona\s+xs|pack\s+\d+|sesion\s+\d+)\b/i;
  const matchA = normA.match(regexSize);
  const matchB = normB.match(regexSize);
  if (matchA && matchB && matchA[0] !== matchB[0]) {
    return true;
  }

  return false;
}

/**
 * Evalúa las colisiones de palabras clave entre todas las entidades del ecosistema
 */
export function detectCannibalizationRisks(entities: SeoEntity[]): Map<string, CannibalizationIssue> {
  const issuesMap = new Map<string, CannibalizationIssue>();

  // Inicializar todas las entidades sin riesgo
  entities.forEach((e) => {
    issuesMap.set(e.id, {
      hasRisk: false,
      conflictingEntityIds: [],
      conflictingEntityNames: [],
      sharedKeywords: [],
      reason: '',
    });
  });

  // Comparar pares de entidades (O(N^2) sobre catálogos típicos de 10-100 items es <5ms)
  for (let i = 0; i < entities.length; i++) {
    for (let j = i + 1; j < entities.length; j++) {
      const a = entities[i];
      const b = entities[j];

      // Ignorar relaciones padre-hijo directas (es normal que un servicio comparta términos con su categoría)
      if (a.parentId === b.id || b.parentId === a.id) continue;

      const isVariant = hasDifferentiatingModifier(
        `${a.name} ${a.currentTitle || ''}`,
        `${b.name} ${b.currentTitle || ''}`
      );

      const normKeywordsA = a.currentKeywords.map(normalizeKeyword).filter(Boolean);
      const normKeywordsB = b.currentKeywords.map(normalizeKeyword).filter(Boolean);

      // 1. Detección de coincidencia exacta en keywords
      // Solo consideramos conflicto si comparten una keyword específica (de 3 o más palabras)
      // y NO son variantes diferenciadas. Las palabras cortas o genéricas (ej: 'depilacion laser', 'estetica')
      // son atributos comunes de la categoría y no canibalización.
      const shared: string[] = [];
      if (!isVariant) {
        normKeywordsA.forEach((ka) => {
          const wordCount = ka.split(' ').filter(Boolean).length;
          if (wordCount >= 3 && normKeywordsB.includes(ka)) {
            shared.push(ka);
          }
        });
      }

      // 2. Detección de títulos idénticos
      const hasExactTitleDuplicate =
        Boolean(a.currentTitle && b.currentTitle && normalizeKeyword(a.currentTitle) === normalizeKeyword(b.currentTitle));

      // 3. Detección de similaridad léxica alta en los nombres/títulos
      const tokensA = extractMeaningfulTokens(`${a.name} ${a.currentTitle || ''}`);
      const tokensB = extractMeaningfulTokens(`${b.name} ${b.currentTitle || ''}`);
      const similarity = calculateTokenSimilarity(tokensA, tokensB);

      const hasExactCollision = shared.length > 0 || hasExactTitleDuplicate;
      const hasHighSimilarity = !isVariant && similarity >= 0.75 && a.type === b.type;

      if (hasExactCollision || hasHighSimilarity) {
        const issueA = issuesMap.get(a.id)!;
        const issueB = issuesMap.get(b.id)!;

        const reason = hasExactTitleDuplicate
          ? `Título SEO idéntico o duplicado con otra página.`
          : hasExactCollision
          ? `Coincidencia exacta de palabras clave: "${shared.join(', ')}"`
          : `Alta similaridad temática (${Math.round(similarity * 100)}%) que puede confundir a Google.`;

        issueA.hasRisk = true;
        issueA.conflictingEntityIds.push(b.id);
        issueA.conflictingEntityNames.push(b.name);
        issueA.sharedKeywords.push(...shared);
        issueA.reason = reason;

        issueB.hasRisk = true;
        issueB.conflictingEntityIds.push(a.id);
        issueB.conflictingEntityNames.push(a.name);
        issueB.sharedKeywords.push(...shared);
        issueB.reason = reason;
      }
    }
  }

  return issuesMap;
}

/**
 * Adjudica a cada entidad una Long-Tail Keyword única y no transferible,
 * forzando desempates semánticos para evitar que dos servicios compitan por la misma búsqueda.
 */
export function assignUniqueKeywords(entities: SeoEntity[], data: EcosystemData): Map<string, string> {
  const assignedMap = new Map<string, string>();
  const takenKeywords = new Map<string, string>(); // normalizedKeyword -> entityId
  const city = data.detectedCity ? normalizeKeyword(data.detectedCity) : '';

  // 1. Asignar primero Home y Categorías (Niveles 1 y 2)
  entities
    .filter((e) => e.level <= 2)
    .forEach((e) => {
      let candidate = '';
      if (e.type === 'home') {
        const sector = normalizeKeyword(formatSectorName(data.businessSector));
        candidate = city ? `${sector} en ${city}` : sector;
      } else if (e.type === 'category') {
        const catName = normalizeKeyword(e.name);
        candidate = city ? `${catName} en ${city}` : catName;
      } else if (e.type === 'location') {
        candidate = normalizeKeyword(`${e.name} ${city}`);
      }

      assignedMap.set(e.id, candidate);
      takenKeywords.set(candidate, e.id);
    });

  // 2. Asignar Servicios (Nivel 3) con desempate automático
  entities
    .filter((e) => e.level === 3)
    .forEach((svc) => {
      let baseKeyword = normalizeKeyword(svc.name);
      let candidate = baseKeyword;
      let counter = 1;

      // Si la keyword base ya fue tomada por otro servicio o categoría:
      while (takenKeywords.has(candidate)) {
        if (counter === 1 && svc.categoryName) {
          candidate = `${baseKeyword} ${normalizeKeyword(svc.categoryName)}`;
        } else if (counter === 2 && city) {
          candidate = `${baseKeyword} ${city}`;
        } else {
          candidate = `${baseKeyword} tratamiento ${counter}`;
        }
        counter++;
      }

      assignedMap.set(svc.id, candidate);
      takenKeywords.set(candidate, svc.id);
    });

  return assignedMap;
}

/**
 * Calcula las "Forbidden Keywords" (palabras clave prohibidas) para cada entidad.
 * La entidad nunca podrá usar las keywords asignadas a sus competidores internos.
 */
export function computeForbiddenKeywords(
  entities: SeoEntity[],
  assignedKeywordsMap: Map<string, string>
): Map<string, string[]> {
  const forbiddenMap = new Map<string, string[]>();

  entities.forEach((current) => {
    const forbidden: string[] = [];

    entities.forEach((other) => {
      if (current.id === other.id) return;
      const otherKeyword = assignedKeywordsMap.get(other.id);
      if (otherKeyword && otherKeyword.length > 3) {
        forbidden.push(otherKeyword);
      }
    });

    forbiddenMap.set(current.id, Array.from(new Set(forbidden)));
  });

  return forbiddenMap;
}

/**
 * Evalúa matemáticamente la salud SEO de un nodo
 */
export function scoreEntitySeo(
  entity: SeoEntity,
  assignedKeyword: string,
  cannibalization: CannibalizationIssue
): { score: number; status: NodeStatus; issues: string[]; recommendations: string[] } {
  let score = 0;
  const issues: string[] = [];
  const recommendations: string[] = [];

  // 1. Título (Máx 30 pts)
  const title = entity.currentTitle?.trim() || '';
  if (!title) {
    issues.push('Falta el título SEO (meta title).');
    recommendations.push(`Añade un título que incluya "${assignedKeyword}" (50-60 caracteres).`);
  } else {
    score += 15;
    const len = title.length;
    if (len >= 45 && len <= 65) {
      score += 15;
    } else if (len < 30) {
      issues.push(`Título demasiado corto (${len} caracteres).`);
      recommendations.push('Amplía el título hasta 50-60 caracteres para maximizar el CTR.');
      score += 5;
    } else if (len > 65) {
      issues.push(`Título demasiado largo (${len} caracteres). Se truncará en Google.`);
      recommendations.push('Reduce el título por debajo de 60 caracteres.');
      score += 8;
    } else {
      score += 10;
    }
  }

  // 2. Descripción (Máx 35 pts)
  const desc = entity.currentDescription?.trim() || '';
  if (!desc) {
    issues.push('Falta la meta descripción.');
    recommendations.push(`Redacta una descripción atractiva de 140-155 caracteres centrada en "${assignedKeyword}".`);
  } else {
    score += 15;
    const len = desc.length;
    if (len >= 130 && len <= 160) {
      score += 20;
    } else if (len < 80) {
      issues.push(`Meta descripción muy breve (${len} caracteres).`);
      recommendations.push('Extiende la descripción entre 140 y 155 caracteres para un snippet óptimo.');
      score += 8;
    } else if (len > 160) {
      issues.push(`Meta descripción muy larga (${len} caracteres). Google la recortará con puntos suspensivos.`);
      recommendations.push('Acorta la descripción a un máximo de 155 caracteres.');
      score += 10;
    } else {
      score += 15;
    }
  }

  // 3. Ausencia de Canibalización (Máx 35 pts)
  if (cannibalization.hasRisk) {
    issues.push(`Conflicto de canibalización detectado con: ${cannibalization.conflictingEntityNames.join(', ')}.`);
    recommendations.push(`Diferencia esta página enfocándola exclusivamente en "${assignedKeyword}".`);
  } else {
    score += 35;
  }

  // Determinar status
  let status: NodeStatus = 'optimal';
  if (cannibalization.hasRisk) {
    status = 'conflict';
  } else if (score < 75 || issues.length > 0) {
    status = 'warning';
  }

  return {
    score: Math.min(100, Math.max(0, score)),
    status,
    issues,
    recommendations,
  };
}

/**
 * Ejecuta el análisis anti-canibalización completo y genera los nodos semánticos
 */
export function buildAntiCannibalizationMatrix(entities: SeoEntity[], data: EcosystemData): SemanticNode[] {
  const cannibalizationMap = detectCannibalizationRisks(entities);
  const assignedKeywordsMap = assignUniqueKeywords(entities, data);
  const forbiddenKeywordsMap = computeForbiddenKeywords(entities, assignedKeywordsMap);

  return entities.map((entity) => {
    const assignedKeyword = assignedKeywordsMap.get(entity.id) || normalizeKeyword(entity.name);
    const forbiddenKeywords = forbiddenKeywordsMap.get(entity.id) || [];
    const cannibalizationRisk = cannibalizationMap.get(entity.id) || {
      hasRisk: false,
      conflictingEntityIds: [],
      conflictingEntityNames: [],
      sharedKeywords: [],
      reason: '',
    };

    const targetCluster =
      entity.type === 'home'
        ? 'Marca y Sector Principal'
        : entity.categoryName
        ? `Categoría: ${entity.categoryName}`
        : 'General';

    const { score, status, issues, recommendations } = scoreEntitySeo(
      entity,
      assignedKeyword,
      cannibalizationRisk
    );

    return {
      entity,
      targetCluster,
      assignedKeyword,
      forbiddenKeywords,
      cannibalizationRisk,
      seoScore: score,
      status,
      issues,
      recommendations,
    };
  });
}

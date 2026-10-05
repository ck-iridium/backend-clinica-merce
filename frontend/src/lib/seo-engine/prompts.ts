export interface MasterSeoPromptParams {
  clinicName: string;
  businessSector: string;
  clinicDescription?: string | null;
  toneDirective?: string;
  city: string;
  province?: string;
  locationsList: string;
  targetLanguage?: 'es' | 'en' | 'fr';
  itemsToOptimize: Array<{
    id: string;
    type: string;
    name: string;
    category?: string | null;
    description?: string | null;
    currentTitle?: string | null;
    currentDescription?: string | null;
    urlPath?: string | null;
  }>;
  existingKeywordsInCatalog: string[];
}

export interface IndividualNodePromptParams {
  clinicName: string;
  businessSector: string;
  clinicDescription?: string | null;
  toneDirective?: string;
  city: string;
  entityType: string;
  entityName: string;
  categoryName?: string | null;
  rawText?: string | null;
  assignedKeyword: string;
  forbiddenKeywords: string[];
}

/**
 * Prompt maestro del Agente Estratega SEO Local - 100% Dinámico y Agnóstico al Sector (SaaS Multi-tenant)
 */
export function buildMasterSeoPrompt(params: MasterSeoPromptParams): string {
  const {
    clinicName,
    businessSector,
    clinicDescription,
    toneDirective,
    city,
    province,
    locationsList,
    targetLanguage = 'es',
    itemsToOptimize,
    existingKeywordsInCatalog,
  } = params;

  const isEnglish = targetLanguage === 'en';
  const isFrench = targetLanguage === 'fr';

  const languageDirective = isEnglish
    ? `IDIOMA OBJETIVO: ENGLISH (EN). Write all 'seo_title', 'seo_description', 'seo_keywords', 'slug' and 'rationale' strictly in high-quality, natural English targeted at international users, expats and tourists searching in Google.`
    : isFrench
    ? `IDIOMA OBJETIVO: FRANÇAIS (FR). Rédigez tous les champs 'seo_title', 'seo_description', 'seo_keywords', 'slug' et 'rationale' en français élégant, naturel et persuasif pour les utilisateurs recherchant sur Google.`
    : `IDIOMA OBJETIVO: ESPAÑOL (ES). Redacta todos los campos en español natural, profesional y persuasivo adaptado a Google España.`;

  const toneContext = toneDirective
    ? `- Directiva de tono de marca: "${toneDirective}"`
    : `- Tono de comunicación: Profesional, cercano, de alta solvencia y adaptado a los estándares de excelencia del sector "${businessSector}".`;

  return `Eres un Consultor Senior de Estrategia SEO Local y Arquitectura Web especializado en negocios y empresas del sector: ${businessSector}.
Tu objetivo es analizar el catálogo de servicios, categorías y sedes de la empresa "${clinicName}" y diseñar los metadatos SEO (Title, Meta Description, Keywords, Slug y Keyword Principal Asignada) de máximo rendimiento, visibilidad local y CTR para Google.

==============================================
DIRECTIVA DE IDIOMA Y AUDIENCIA
==============================================
${languageDirective}

==============================================
DOSSIER DE INTELIGENCIA DEL NEGOCIO
==============================================
- Nombre comercial / Empresa: "${clinicName}"
- Sector de actividad: "${businessSector}"
${clinicDescription ? `- Propuesta de valor / Descripción: "${clinicDescription}"\n` : ''}${toneContext}
- Municipio principal: "${city || 'España'}"
- Provincia / Región: "${province || ''}"
- Sedes físicas:
${locationsList || '  - Sede principal'}

Palabras clave ya reservadas en el catálogo (evita canibalizarlas):
[${existingKeywordsInCatalog.slice(0, 15).map((k) => `"${k}"`).join(', ')}]

==============================================
DIRECTRICES ESTRATÉGICAS DE OBLIGADO CUMPLIMIENTO
==============================================
1. DECODIFICACIÓN DE CÓDIGOS INTERNOS, TARIFAS Y NOMENCLATURAS TÉCNICAS A ZONAS ANATÓMICAS REALES:
   - Los clientes en Google buscan soluciones y necesidades reales, NUNCA nombres de tarifas internas abstractas (ej. "Zona S", "Zona M", "Zona L", "Bono 5 sesiones", "Pack básico", abreviaturas de sesiones o códigos alfa-numéricos).
   - Debes LEER con máxima atención la descripción detallada de cada servicio para entender exactamente qué incluye, qué problema soluciona o qué zonas anatómicas cubre.
   - TRADUCCIÓN DE TARIFAS Y ZONAS: Si un servicio tiene un nombre abstracto como "Zona S" y su descripción indica "labio superior, patillas o axilas", debes titular y describir con las zonas anatómicas reales que la gente busca:
     * En Español: "Depilación Láser Zonas Pequeñas (Labio, Axilas) | ${clinicName}"
     * En Inglés: "Small Area Laser Hair Removal (Underarms, Lip) | ${clinicName}"
     * En Francés: "Épilation Laser Petites Zones (Lèvre, Aisselles) | ${clinicName}"
   - Traduce los nombres técnicos a intenciones de búsqueda cotidianas y profesionales del sector "${businessSector}".

2. GEOLOCALIZACIÓN INTELIGENTE Y NATURAL:
   - Posiciona prioritariamente en el municipio real del negocio ("${city}").
   - En la página principal (Home) y categorías generales, prioriza términos de búsqueda de alta intención local (ej. "${businessSector} en ${city}" o su traducción en ${targetLanguage}).

3. PREVENCIÓN ACTIVA DE CANIBALIZACIÓN:
   - Cada servicio y categoría debe responder a una intención de búsqueda única y tener su propia 'assignedKeyword' exclusiva.
   - Si dos servicios son modalidades o niveles distintos, márcalos con total claridad para que Google no compita consigo mismo.

4. LONGITUDES ESTRICTAS Y REDACCIÓN IMPECABLE (REGLA DE ORO DE GOOGLE):
   - 'seo_title': Longitud entre 48 y 60 caracteres. Debe terminar con " | ${clinicName}". Jamás dejes títulos cortados ni con palabras truncadas a medias.
   - 'seo_description': Longitud entre 135 y 155 caracteres. Oraciones COMPLETAS con sutil llamada a la acción. PROHIBICIÓN ABSOLUTA: Jamás termines a mitad de frase ni con preposiciones o artículos colgantes. Debe terminar con punto final.
   - 'seo_keywords': 3 a 5 palabras clave específicas en el idioma ${targetLanguage.toUpperCase()} separadas por comas.
   - 'slug': URL-friendly slug en minúsculas y separado por guiones adaptado al idioma (ej. "lifting-pestanas" en ES, "lash-lift" en EN, "rehaussement-cils" en FR).
   - 'assignedKeyword': La frase clave principal exacta (long-tail) asignada exclusivamente a esta página.
   - 'rationale': Breve justificación estratégica de 1 frase explicando el criterio adoptado.

==============================================
PÁGINAS A OPTIMIZAR
==============================================
${JSON.stringify(itemsToOptimize, null, 2)}

Responde ÚNICAMENTE con un JSON válido con esta estructura exacta:
{
  "proposals": [
    {
      "entityId": "string (el id exacto recibido)",
      "seo_title": "string (48-60 caracteres)",
      "seo_description": "string (135-155 caracteres con punto final)",
      "seo_keywords": "string (3 a 5 keywords separadas por comas)",
      "slug": "string (slug amigable en minúsculas sin acentos ni espacios)",
      "assignedKeyword": "string (keyword principal única)",
      "rationale": "string"
    }
  ]
}`;
}

/**
 * Prompt para la optimización de un nodo SEO individual
 */
export function buildIndividualNodePrompt(params: IndividualNodePromptParams): string {
  const {
    clinicName,
    businessSector,
    clinicDescription,
    toneDirective,
    city,
    entityType,
    entityName,
    categoryName,
    rawText,
    assignedKeyword,
    forbiddenKeywords,
  } = params;

  const toneContext = toneDirective
    ? `- Directiva de tono de marca: "${toneDirective}"`
    : `- Tono de comunicación: Profesional, de alta solvencia y adaptado a los estándares de excelencia del sector "${businessSector}".`;

  return `Eres un Consultor Senior de Estrategia SEO Local y Arquitectura Web en España especializado en negocios del sector: ${businessSector}.
Optimiza esta página para Google España garantizando máxima relevancia local y evitando totalmente la canibalización.

INFORMACIÓN DEL NEGOCIO:
- Nombre de la empresa: ${clinicName}
- Sector: ${businessSector}
${clinicDescription ? `- Descripción de la empresa: ${clinicDescription}\n` : ''}${toneContext}
- Localidad principal: ${city || 'España'}

DATOS DE LA PÁGINA:
- Tipo: ${entityType}
- Nombre: ${entityName}
- Categoría: ${categoryName || 'General'}
- Contexto descriptivo del servicio: ${rawText || entityName}
- Palabra clave asignada exclusiva: "${assignedKeyword}"
- Palabras clave prohibidas (competidores internos): [${forbiddenKeywords.slice(0, 10).map((k) => `"${k}"`).join(', ')}]

REGLAS ESTRICTAS:
1. 'seo_title': 50 a 60 caracteres. Debe terminar con " | ${clinicName}".
2. 'seo_description': 135 a 155 caracteres. Frase completa terminada en punto con llamada a la acción adecuada al sector "${businessSector}". PROHIBIDO cortar a medias con artículos o preposiciones.
3. 'seo_keywords': 3 a 5 palabras clave en español adaptadas al sector "${businessSector}".
4. Idioma: Español natural de España, sin anglicismos forzados ni terminología abstracta.

Responde ÚNICAMENTE en JSON:
{
  "seo_title": "string",
  "seo_description": "string",
  "seo_keywords": "string",
  "rationale": "string"
}`;
}

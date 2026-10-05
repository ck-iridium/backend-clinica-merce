/**
 * Extrae y parsea JSON de forma tolerante a bloques markdown o texto periférico
 */
export function extractJsonFromText(text: string): any {
  if (!text) throw new Error('Contenido de texto vacío');
  const cleaned = text.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();

  try {
    return JSON.parse(cleaned);
  } catch (err1) {
    const firstBracket = cleaned.indexOf('[');
    const firstBrace = cleaned.indexOf('{');
    
    let startIdx = -1;
    let endIdx = -1;

    if (firstBracket !== -1 && (firstBrace === -1 || firstBracket < firstBrace)) {
      startIdx = firstBracket;
      endIdx = cleaned.lastIndexOf(']');
    } else if (firstBrace !== -1) {
      startIdx = firstBrace;
      endIdx = cleaned.lastIndexOf('}');
    }

    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
      const sub = cleaned.slice(startIdx, endIdx + 1);
      return JSON.parse(sub);
    }

    throw new Error(`Error parseando respuesta JSON de Gemini: ${err1}`);
  }
}

/**
 * Llama a la API de Gemini para estructurar la respuesta JSON
 */
export async function callGeminiAi(prompt: string, apiKey: string): Promise<any> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.25, // Baja temperatura para máximo apego a las instrucciones estratégicas
      },
    }),
    signal: AbortSignal.timeout(45000),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error(`[callGeminiAi Error] HTTP ${response.status}:`, errText);
    throw new Error(`Gemini API Error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!textContent) {
    throw new Error('Gemini no devolvió contenido de texto.');
  }

  return extractJsonFromText(textContent);
}

/**
 * Fallback a través del backend FastAPI si no se tiene la clave en frontend
 */
export async function callBackendAiFallback(prompt: string, tenantId: string): Promise<any> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const response = await fetch(`${apiUrl}/ai/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Tenant-ID': tenantId,
    },
    body: JSON.stringify({
      prompt,
      type: 'seo',
    }),
  });

  if (!response.ok) {
    throw new Error(`Backend AI Error: ${response.status}`);
  }

  const data = await response.json();
  if (typeof data === 'string') {
    return JSON.parse(data.replace(/```(?:json)?/g, '').trim());
  }
  return data;
}

import re
from datetime import datetime

def normalize_date_str(date_str: str) -> str:
    """Normaliza variantes como 9-1.25 o 26-3-25 a formato legible DD/MM/YYYY o DD/MM/YY."""
    cleaned = date_str.replace('.', '-').replace('/', '-')
    parts = cleaned.split('-')
    if len(parts) == 3:
        day, month, year = parts[0].zfill(2), parts[1].zfill(2), parts[2]
        if len(year) == 2:
            year = "20" + year
        return f"{day}/{month}/{year}"
    return date_str

def parse_technical_history(text: str) -> list[dict]:
    """
    Parsea cadenas históricas de peluquería/estética con fechas y fórmulas
    separadas por barras o puntos en una lista estructurada de entradas.
    """
    if not text or not text.strip():
        return []

    # Detectar fechas tipo: 9-1.25:, 26-3-25:, 18/11/2026:
    date_split_pattern = re.compile(r'(?:^|[\s\/\.,\n])(\d{1,2}[\.\-\/]\d{1,2}[\.\-\/]\d{2,4})\s*[:\-]')
    dates = list(date_split_pattern.finditer(text))
    
    entries = []
    if not dates:
        # Si no hay fechas detectadas, guardar todo como una nota inicial
        return [{"date": "Histórico", "formula": text.strip(), "notes": ""}]

    for i, m in enumerate(dates):
        raw_date = m.group(1).strip()
        formatted_date = normalize_date_str(raw_date)
        start_pos = m.end()
        end_pos = dates[i+1].start() if i + 1 < len(dates) else len(text)
        content = text[start_pos:end_pos].strip(' /.,\n\t')
        
        # Omitir entradas completamente vacías
        if content:
            entries.append({
                "date": formatted_date,
                "formula": content,
                "notes": ""
            })

    # Intentar ordenar de más reciente a más antiguo si las fechas son parseables
    def date_key(entry):
        try:
            return datetime.strptime(entry["date"], "%d/%m/%Y")
        except Exception:
            return datetime.min

    try:
        entries.sort(key=date_key, reverse=True)
    except Exception:
        entries.reverse()

    return entries

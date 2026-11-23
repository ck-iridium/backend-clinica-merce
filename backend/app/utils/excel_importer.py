import io
import re
from typing import List, Dict, Any, Tuple
import openpyxl

def extract_excel_headers_and_preview(file_bytes: bytes, max_preview_rows: int = 5) -> Tuple[List[str], List[Dict[str, Any]]]:
    """
    Reads an Excel file from bytes and returns headers and a preview of the first few rows.
    """
    wb = openpyxl.load_workbook(io.BytesIO(file_bytes), data_only=True)
    ws = wb.active

    # Find the header row (first non-empty row)
    headers = []
    header_row_idx = 1
    for r in range(1, min(10, ws.max_row + 1)):
        row_vals = [ws.cell(r, c).value for c in range(1, ws.max_column + 1)]
        non_empty = [v for v in row_vals if v is not None and str(v).strip()]
        if len(non_empty) >= 2:
            headers = [str(v).strip() if v is not None else f"Col_{c}" for c, v in enumerate(row_vals, 1)]
            header_row_idx = r
            break

    if not headers:
        headers = [f"Col_{c}" for c in range(1, ws.max_column + 1)]

    preview = []
    for r in range(header_row_idx + 1, min(header_row_idx + 1 + max_preview_rows, ws.max_row + 1)):
        row_dict = {}
        has_content = False
        for c, h in enumerate(headers, 1):
            val = ws.cell(r, c).value
            if val is not None:
                has_content = True
            row_dict[h] = format_cell_value(val)
        if has_content:
            preview.append(row_dict)

    return headers, preview

def format_cell_value(val: Any) -> Any:
    if val is None:
        return ""
    if isinstance(val, (int, float)):
        # If float is actually an integer
        if isinstance(val, float) and val.is_integer():
            return int(val)
        return val
    return str(val).strip()

def clean_phone_number(val: Any) -> str:
    """
    Cleans phone numbers extracted from Excel, converting scientific notation or floats to clean strings.
    """
    if val is None:
        return ""
    val_str = str(val).strip()
    if not val_str or val_str.lower() in ("desconocido", "none", "null", "nodisponible", "no disponible", "-"):
        return ""

    # Check if number like 622018670.0
    try:
        f = float(val_str.replace(",", "."))
        val_str = str(int(f))
    except ValueError:
        pass

    # Remove non-digit characters except leading +
    has_plus = val_str.startswith("+")
    digits = re.sub(r"[^\d]", "", val_str)
    if not digits:
        return ""
    
    # If starts with 0034 or 34 followed by 9 digits
    if digits.startswith("0034") and len(digits) > 11:
        digits = digits[4:]
    elif digits.startswith("34") and len(digits) == 11 and digits[2] in "6789":
        digits = digits[2:]

    return f"+{digits}" if has_plus else digits

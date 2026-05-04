from datetime import datetime, timedelta

def get_spain_now() -> datetime:
    """Returns a naive datetime representing the current local time in Spain."""
    try:
        from zoneinfo import ZoneInfo
        return datetime.now(ZoneInfo("Europe/Madrid")).replace(tzinfo=None)
    except Exception:
        # Fallback de emergencia a UTC+2 (Horario de verano aproximado)
        return datetime.utcnow() + timedelta(hours=2)

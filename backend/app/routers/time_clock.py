import io
import os
import uuid
import hmac
import hashlib
import time
from datetime import datetime, date, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from .. import database, models, schemas
from .users import pwd_context

router = APIRouter(
    prefix="/time-clock",
    tags=["time-clock"],
)

QR_SECRET = os.getenv("CRON_SECRET_KEY", "probookia_time_clock_secret_2026")

def generate_qr_totp(tenant_id: str, window_seconds: int = 20) -> tuple[str, int]:
    """Genera un token firmado HMAC válido para la ventana actual de 20 segundos"""
    now = int(time.time())
    current_step = now // window_seconds
    seconds_remaining = window_seconds - (now % window_seconds)
    
    msg = f"{tenant_id}:{current_step}".encode("utf-8")
    signature = hmac.new(QR_SECRET.encode("utf-8"), msg, hashlib.sha256).hexdigest()[:16]
    token = f"{current_step}-{signature}"
    return token, seconds_remaining

def verify_qr_totp(tenant_id: str, token: str, window_seconds: int = 20) -> bool:
    """Valida si el token QR corresponde a la ventana actual o a la inmediatamente anterior (tolerancia 20-40s)"""
    try:
        parts = token.split("-")
        if len(parts) != 2:
            return False
        step = int(parts[0])
        client_sig = parts[1]
        
        now = int(time.time())
        current_step = now // window_seconds
        
        # Permitir ventana actual y la inmediatamente previa (para compensar latencia de red)
        if step not in (current_step, current_step - 1):
            return False
            
        expected_msg = f"{tenant_id}:{step}".encode("utf-8")
        expected_sig = hmac.new(QR_SECRET.encode("utf-8"), expected_msg, hashlib.sha256).hexdigest()[:16]
        return hmac.compare_digest(expected_sig, client_sig)
    except Exception:
        return False


def get_resolved_tenant(request: Optional[Request] = None, tenant_id: Optional[str] = None) -> Optional[str]:
    tenant = database.current_tenant_var.get()
    if tenant:
        return tenant
    if tenant_id:
        return tenant_id
    if request:
        header_tid = request.headers.get("X-Tenant-ID") or request.headers.get("x-tenant-id")
        if header_tid:
            return header_tid
        query_tid = request.query_params.get("tenant_id") or request.query_params.get("tenant")
        if query_tid:
            return query_tid
    return None


# ── 1. Listar Operadoras de Mostrador del Salón ──────────────────────────────
@router.get("/operators", response_model=List[schemas.CounterOperatorResponse])
def get_counter_operators(
    request: Request,
    tenant_id: Optional[str] = Query(None),
    db: Session = Depends(database.get_db)
):
    resolved_tenant = get_resolved_tenant(request, tenant_id)
    if not resolved_tenant:
        raise HTTPException(status_code=400, detail="Tenant context missing")

    # Obtener perfiles del centro: si tienen PIN o son miembros del equipo
    profiles = db.query(models.Profile).filter(
        models.Profile.tenant_id == resolved_tenant
    ).order_by(models.Profile.full_name).all()

    response = []
    for p in profiles:
        response.append(schemas.CounterOperatorResponse(
            id=p.id,
            tenant_id=p.tenant_id,
            full_name=p.full_name or p.email or "Operador",
            role=p.role or "Especialista",
            avatar_url=p.avatar_url,
            email=p.email,
            auth_mode=getattr(p, "auth_mode", "email") or "email",
            is_counter_operator=bool(getattr(p, "is_counter_operator", True)),
            bound_device_id=getattr(p, "bound_device_id", None),
            has_bound_device=bool(getattr(p, "bound_device_id", None)),
            has_pin=bool(getattr(p, "pin_code_hash", None))
        ))
    return response


# ── 2. Crear Operadora Mostrador con PIN (Zero-Email) ──────────────────────
@router.post("/counter-operators", response_model=schemas.CounterOperatorResponse)
def create_counter_operator(
    payload: schemas.CounterOperatorCreate,
    request: Request,
    tenant_id: Optional[str] = Query(None),
    db: Session = Depends(database.get_db)
):
    resolved_tenant = get_resolved_tenant(request, tenant_id)
    if not resolved_tenant:
        raise HTTPException(status_code=400, detail="Tenant context missing")

    pin_clean = payload.pin.strip()
    if not pin_clean.isdigit() or len(pin_clean) != 4:
        raise HTTPException(status_code=400, detail="El PIN debe contener exactamente 4 dígitos numéricos.")

    # Generar un ID único y un correo técnico interno
    operator_id = str(uuid.uuid4())
    clean_name = payload.full_name.strip()
    slug_name = clean_name.lower().replace(" ", ".")[:20]
    tech_email = payload.email.strip().lower() if payload.email else f"{slug_name}.{operator_id[:6]}@mostrador.local"

    # Verificar si el correo ya existe en la base de datos
    existing_user = db.query(models.User).filter(models.User.email == tech_email).first()
    if existing_user:
        tech_email = f"staff.{operator_id[:8]}@mostrador.local"

    # 1. Crear User técnico local con contraseña aleatoria inexpugnable (no usable por web)
    random_pw = uuid.uuid4().hex + uuid.uuid4().hex
    hashed_pw = pwd_context.hash(random_pw)
    hashed_pin = pwd_context.hash(pin_clean)

    user = models.User(
        id=operator_id,
        tenant_id=resolved_tenant,
        email=tech_email,
        hashed_password=hashed_pw,
        role=payload.role.lower(),
        email_verified=True
    )
    db.add(user)

    # 2. Crear Profile asociado con modo PIN
    profile = models.Profile(
        id=operator_id,
        tenant_id=resolved_tenant,
        full_name=clean_name,
        role=payload.role,
        email=tech_email,
        avatar_url=payload.avatar_url,
        status="active",
        pin_code_hash=hashed_pin,
        auth_mode="pin_only",
        is_counter_operator=True,
        bound_device_id=None,
        pin_failed_attempts=0
    )
    db.add(profile)
    db.commit()
    db.refresh(profile)

    return schemas.CounterOperatorResponse(
        id=profile.id,
        tenant_id=profile.tenant_id,
        full_name=profile.full_name,
        role=profile.role,
        avatar_url=profile.avatar_url,
        email=profile.email,
        auth_mode=profile.auth_mode,
        is_counter_operator=profile.is_counter_operator,
        bound_device_id=profile.bound_device_id,
        has_bound_device=False
    )


# ── 3. Verificar PIN de Mostrador (Login Rápido TPV) ───────────────────────
@router.post("/verify-pin")
def verify_counter_pin(
    payload: schemas.CounterPinVerify,
    request: Request,
    tenant_id: Optional[str] = Query(None),
    db: Session = Depends(database.get_db)
):
    resolved_tenant = get_resolved_tenant(request, tenant_id)
    if resolved_tenant:
        profile = db.query(models.Profile).filter(
            models.Profile.id == payload.staff_id,
            models.Profile.tenant_id == resolved_tenant
        ).first()
    else:
        profile = db.query(models.Profile).filter(models.Profile.id == payload.staff_id).first()

    if not profile:
        raise HTTPException(status_code=404, detail="Operador no encontrado.")

    # Comprobar bloqueo temporal por intentos fallidos
    now = datetime.utcnow()
    if profile.pin_locked_until and profile.pin_locked_until > now:
        diff_seconds = int((profile.pin_locked_until - now).total_seconds())
        raise HTTPException(
            status_code=429,
            detail=f"PIN bloqueado por demasiados intentos erróneos. Espera {diff_seconds} segundos."
        )

    # Si no tiene PIN configurado
    if not profile.pin_code_hash:
        raise HTTPException(
            status_code=400,
            detail="Este operador aún no tiene un PIN de 4 dígitos configurado. Asígnalo desde la gestión de equipo."
        )

    # Verificar PIN
    pin_clean = payload.pin.strip()
    is_valid = pwd_context.verify(pin_clean, profile.pin_code_hash)
    if not is_valid:
        profile.pin_failed_attempts = (profile.pin_failed_attempts or 0) + 1
        if profile.pin_failed_attempts >= 5:
            profile.pin_locked_until = now + timedelta(minutes=5)
            profile.pin_failed_attempts = 0
            db.commit()
            raise HTTPException(
                status_code=429,
                detail="5 intentos fallidos consecutivos. PIN bloqueado temporalmente por 5 minutos."
            )
        db.commit()
        raise HTTPException(status_code=401, detail="PIN incorrecto.")

    # Restablecer intentos fallidos
    profile.pin_failed_attempts = 0
    profile.pin_locked_until = None
    db.commit()

    return {
        "success": True,
        "operator": {
            "id": profile.id,
            "full_name": profile.full_name or profile.email,
            "role": profile.role or "Especialista",
            "avatar_url": profile.avatar_url,
            "auth_mode": getattr(profile, "auth_mode", "pin_only")
        }
    }


# ── 4. Actualizar PIN de Operadora ──────────────────────────────────────────
@router.post("/update-pin")
def update_operator_pin(
    payload: schemas.CounterPinUpdate,
    request: Request,
    tenant_id: Optional[str] = Query(None),
    db: Session = Depends(database.get_db)
):
    resolved_tenant = get_resolved_tenant(request, tenant_id)
    if resolved_tenant:
        profile = db.query(models.Profile).filter(
            models.Profile.id == payload.staff_id,
            models.Profile.tenant_id == resolved_tenant
        ).first()
    else:
        profile = db.query(models.Profile).filter(models.Profile.id == payload.staff_id).first()

    if not profile:
        raise HTTPException(status_code=404, detail="Operador no encontrado.")

    new_pin = payload.new_pin.strip()
    if not new_pin.isdigit() or len(new_pin) != 4:
        raise HTTPException(status_code=400, detail="El nuevo PIN debe contener exactamente 4 dígitos.")

    profile.pin_code_hash = pwd_context.hash(new_pin)
    profile.is_counter_operator = True
    profile.pin_failed_attempts = 0
    profile.pin_locked_until = None
    db.commit()

    return {"success": True, "message": "PIN actualizado correctamente."}


# ── 5. Desvincular Teléfono Móvil (Permite asociar uno nuevo) ───────────────
@router.post("/unbind-device")
def unbind_operator_device(
    payload: schemas.DeviceUnbindRequest,
    request: Request,
    tenant_id: Optional[str] = Query(None),
    db: Session = Depends(database.get_db)
):
    resolved_tenant = get_resolved_tenant(request, tenant_id)
    if resolved_tenant:
        profile = db.query(models.Profile).filter(
            models.Profile.id == payload.staff_id,
            models.Profile.tenant_id == resolved_tenant
        ).first()
    else:
        profile = db.query(models.Profile).filter(models.Profile.id == payload.staff_id).first()

    if not profile:
        raise HTTPException(status_code=404, detail="Operador no encontrado.")

    profile.bound_device_id = None
    db.commit()
    return {"success": True, "message": "Teléfono desvinculado con éxito. La empleada podrá vincular su nuevo móvil en el próximo fichaje."}


# ── 6. Generar Token QR Dinámico Rotativo (Cada 20 seg) ─────────────────────
@router.get("/qr-token", response_model=schemas.QRRotateTokenResponse)
def get_qr_rotate_token(request: Request, tenant_id: Optional[str] = Query(None)):
    resolved_tenant = get_resolved_tenant(request, tenant_id)
    if not resolved_tenant:
        raise HTTPException(status_code=400, detail="Tenant context missing")

    token, seconds_left = generate_qr_totp(resolved_tenant, window_seconds=20)
    
    # URL para el escaneo móvil
    host = request.headers.get("host", "probookia.com")
    protocol = "http" if "localhost" in host else "https"
    qr_payload = f"{protocol}://{host}/fichar?t={token}&tenant={resolved_tenant}"

    return schemas.QRRotateTokenResponse(
        token=token,
        expires_in_seconds=seconds_left,
        qr_payload=qr_payload
    )


# ── 7. Registrar Evento de Fichaje (Entrada / Pausa / Salida) ────────────────
@router.post("/clock-event", response_model=schemas.TimeClockRecordResponse)
def register_clock_event(
    payload: schemas.TimeClockEventCreate,
    request: Request,
    tenant_id: Optional[str] = Query(None),
    db: Session = Depends(database.get_db)
):
    resolved_tenant = get_resolved_tenant(request, tenant_id)
    if not resolved_tenant:
        profile_candidate = db.query(models.Profile).filter(models.Profile.id == payload.staff_id).first()
        if profile_candidate:
            resolved_tenant = profile_candidate.tenant_id
        else:
            raise HTTPException(status_code=400, detail="Tenant context missing")

    profile = db.query(models.Profile).filter(
        models.Profile.id == payload.staff_id,
        models.Profile.tenant_id == resolved_tenant
    ).first()

    if not profile:
        raise HTTPException(status_code=404, detail="Operador no encontrado.")

    # 1. Validación de Token QR (si el fichaje viene desde teléfono móvil)
    if payload.qr_token:
        is_qr_valid = verify_qr_totp(resolved_tenant, payload.qr_token, window_seconds=20)
        if not is_qr_valid:
            raise HTTPException(
                status_code=400,
                detail="El código QR ha caducado o no es válido. Escanea el código actualizado en la pantalla del salón."
            )

    # 2. Validación de PIN (a menos que ya venga autenticado en la sesión)
    if payload.pin:
        pin_clean = payload.pin.strip()
        if not profile.pin_code_hash or not pwd_context.verify(pin_clean, profile.pin_code_hash):
            raise HTTPException(status_code=401, detail="PIN incorrecto.")

    # 3. Control Anti-Fraude: Vinculación Estricta de Dispositivo Móvil
    if payload.device_id:
        clean_device_id = payload.device_id.strip()
        current_bound = getattr(profile, "bound_device_id", None)
        
        if not current_bound:
            # Primer escaneo: vincular este teléfono permanentemente al perfil
            profile.bound_device_id = clean_device_id
            db.commit()
        elif current_bound != clean_device_id:
            # Fraude detectado: el teléfono no coincide con el móvil registrado
            raise HTTPException(
                status_code=403,
                detail="Dispositivo no reconocido. Este teléfono móvil no coincide con el dispositivo personal vinculado a tu perfil. Para evitar que otra persona fiche por ti, solo puedes fichar desde tu propio teléfono. Contacta con tu administradora si has cambiado de móvil."
            )

    # 4. Determinar tipo de evento
    event_type = payload.event_type.strip().lower()
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    
    # Obtener el último evento de hoy de esta empleada
    last_event = db.query(models.TimeClockRecord).filter(
        models.TimeClockRecord.tenant_id == resolved_tenant,
        models.TimeClockRecord.staff_id == payload.staff_id,
        models.TimeClockRecord.timestamp >= today_start
    ).order_by(desc(models.TimeClockRecord.timestamp)).first()

    if event_type == "auto":
        # Resolver automáticamente según el ciclo natural de jornada
        if not last_event or last_event.event_type == "clock_out":
            event_type = "clock_in"
        elif last_event.event_type == "clock_in":
            event_type = "clock_out"
        elif last_event.event_type == "break_start":
            event_type = "break_end"
        elif last_event.event_type == "break_end":
            event_type = "clock_out"
        else:
            event_type = "clock_in"

    # Capturar IP del cliente
    client_ip = request.client.host if request.client else None

    # 5. Insertar registro inmutable de fichaje
    record = models.TimeClockRecord(
        id=str(uuid.uuid4()),
        tenant_id=resolved_tenant,
        staff_id=payload.staff_id,
        event_type=event_type,
        timestamp=datetime.utcnow(),
        device_label=payload.device_label or ("Móvil Personal" if payload.device_id else "Terminal Mostrador"),
        device_id=payload.device_id,
        ip_address=client_ip,
        notes=payload.notes
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    return record


# ── 8. Estado en Vivo del Personal (Dashboard de Mostrador) ─────────────────
@router.get("/status/{staff_id}", response_model=schemas.TimeClockStatusResponse)
def get_staff_time_clock_status(
    staff_id: str,
    request: Request,
    tenant_id: Optional[str] = Query(None),
    db: Session = Depends(database.get_db)
):
    resolved_tenant = get_resolved_tenant(request, tenant_id)
    if not resolved_tenant:
        profile_candidate = db.query(models.Profile).filter(models.Profile.id == staff_id).first()
        if profile_candidate:
            resolved_tenant = profile_candidate.tenant_id

    profile = db.query(models.Profile).filter(
        models.Profile.id == staff_id,
        models.Profile.tenant_id == resolved_tenant
    ).first()

    if not profile:
        raise HTTPException(status_code=404, detail="Operador no encontrado.")

    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    records = db.query(models.TimeClockRecord).filter(
        models.TimeClockRecord.tenant_id == resolved_tenant,
        models.TimeClockRecord.staff_id == staff_id,
        models.TimeClockRecord.timestamp >= today_start
    ).order_by(models.TimeClockRecord.timestamp).all()

    current_status = "out"
    last_event_type = None
    last_event_time = None

    if records:
        last = records[-1]
        last_event_type = last.event_type
        last_event_time = last.timestamp
        if last.event_type in ("clock_in", "break_end"):
            current_status = "in_shift"
        elif last.event_type == "break_start":
            current_status = "on_break"
        elif last.event_type == "clock_out":
            current_status = "out"

    # Calcular minutos acumulados de trabajo hoy
    total_seconds = 0
    shift_start = None
    for r in records:
        if r.event_type in ("clock_in", "break_end"):
            shift_start = r.timestamp
        elif r.event_type in ("break_start", "clock_out") and shift_start:
            total_seconds += (r.timestamp - shift_start).total_seconds()
            shift_start = None

    if shift_start:
        total_seconds += (datetime.utcnow() - shift_start).total_seconds()

    return schemas.TimeClockStatusResponse(
        staff_id=staff_id,
        staff_name=profile.full_name or profile.email or "Operador",
        current_status=current_status,
        last_event_type=last_event_type,
        last_event_time=last_event_time,
        today_total_minutes=int(total_seconds // 60),
        has_bound_device=bool(getattr(profile, "bound_device_id", None))
    )


# ── 9. Resumen Diario de Todo el Equipo ─────────────────────────────────────
@router.get("/summary", response_model=List[schemas.TimeClockStatusResponse])
def get_team_time_clock_summary(
    request: Request,
    tenant_id: Optional[str] = Query(None),
    db: Session = Depends(database.get_db)
):
    resolved_tenant = get_resolved_tenant(request, tenant_id)
    profiles = db.query(models.Profile).filter(
        models.Profile.tenant_id == resolved_tenant,
        models.Profile.role.in_([
            "specialist", "receptionist", "admin",
            "especialista", "recepcionist", "recepción", "recepcion", "administrador",
            "Especialista", "Recepción", "Recepcion", "Administrador"
        ])
    ).all()

    summary = []
    for p in profiles:
        status_data = get_staff_time_clock_status(p.id, request, resolved_tenant, db)
        summary.append(status_data)

    return summary


# ── 10. Informe de Jornada Laboral (Para Gestoría e Inspección) ──────────────
@router.get("/report")
def get_time_clock_report(
    request: Request,
    tenant_id: Optional[str] = Query(None),
    month: Optional[int] = Query(None),
    year: Optional[int] = Query(None),
    staff_id: Optional[str] = Query(None),
    db: Session = Depends(database.get_db)
):
    resolved_tenant = get_resolved_tenant(request, tenant_id)
    now = datetime.utcnow()
    target_year = year or now.year
    target_month = month or now.month

    # Rango del mes seleccionado
    start_date = datetime(target_year, target_month, 1, 0, 0, 0)
    if target_month == 12:
        end_date = datetime(target_year + 1, 1, 1, 0, 0, 0)
    else:
        end_date = datetime(target_year, target_month + 1, 1, 0, 0, 0)

    query = db.query(models.TimeClockRecord).filter(
        models.TimeClockRecord.tenant_id == resolved_tenant,
        models.TimeClockRecord.timestamp >= start_date,
        models.TimeClockRecord.timestamp < end_date
    )

    if staff_id:
        query = query.filter(models.TimeClockRecord.staff_id == staff_id)

    records = query.order_by(models.TimeClockRecord.timestamp).all()

    # Mapeo de perfiles para enriquecer nombres
    profiles = db.query(models.Profile).filter(models.Profile.tenant_id == tenant_id).all()
    profile_map = {p.id: p.full_name or p.email for p in profiles}

    serialized = []
    for r in records:
        serialized.append({
            "id": r.id,
            "staff_id": r.staff_id,
            "staff_name": profile_map.get(r.staff_id, "Desconocido"),
            "event_type": r.event_type,
            "timestamp": r.timestamp.isoformat(),
            "date": r.timestamp.strftime("%Y-%m-%d"),
            "time": r.timestamp.strftime("%H:%M:%S"),
            "device_label": r.device_label,
            "device_id": r.device_id,
            "ip_address": r.ip_address,
            "notes": r.notes
        })

    return {
        "year": target_year,
        "month": target_month,
        "total_records": len(serialized),
        "records": serialized
    }


def compute_daily_shifts(records, profile_map):
    """Agrupa registros por empleado y día, calculando pausas y horas netas trabajadas"""
    grouped = {}
    for r in records:
        date_str = r.timestamp.strftime("%Y-%m-%d")
        key = (date_str, r.staff_id)
        if key not in grouped:
            grouped[key] = []
        grouped[key].append(r)

    shifts = []
    now = datetime.utcnow()
    today_str = now.strftime("%Y-%m-%d")

    for (date_str, s_id), day_records in grouped.items():
        day_records.sort(key=lambda x: x.timestamp)
        staff_name = profile_map.get(s_id, "Desconocido")

        first_in = None
        last_out = None
        break_start = None
        break_end = None
        break_seconds = 0

        current_in = None
        current_break = None
        total_worked_seconds = 0

        for rec in day_records:
            ev = rec.event_type
            ts = rec.timestamp
            if ev == "clock_in":
                if not first_in:
                    first_in = ts
                current_in = ts
            elif ev == "break_start":
                if not break_start:
                    break_start = ts
                current_break = ts
                if current_in:
                    total_worked_seconds += (ts - current_in).total_seconds()
                    current_in = None
            elif ev == "break_end":
                if not break_end:
                    break_end = ts
                if current_break:
                    break_seconds += (ts - current_break).total_seconds()
                    current_break = None
                current_in = ts
            elif ev == "clock_out":
                last_out = ts
                if current_in:
                    total_worked_seconds += (ts - current_in).total_seconds()
                    current_in = None
                if current_break:
                    break_seconds += (ts - current_break).total_seconds()
                    current_break = None

        if current_in and date_str == today_str:
            total_worked_seconds += (now - current_in).total_seconds()

        last_ev = day_records[-1].event_type if day_records else "out"
        if last_out:
            status = "completed"
        elif last_ev == "break_start":
            status = "break"
        elif date_str == today_str:
            status = "in_progress"
        else:
            status = "incomplete"

        worked_mins = int(total_worked_seconds // 60)
        break_mins = int(break_seconds // 60)
        hours = worked_mins // 60
        mins = worked_mins % 60

        shifts.append({
            "date": date_str,
            "staff_id": s_id,
            "staff_name": staff_name,
            "first_in": first_in.strftime("%H:%M:%S") if first_in else "-",
            "break_start": break_start.strftime("%H:%M:%S") if break_start else "-",
            "break_end": break_end.strftime("%H:%M:%S") if break_end else "-",
            "last_out": last_out.strftime("%H:%M:%S") if last_out else "-",
            "break_minutes": break_mins,
            "worked_minutes": worked_mins,
            "worked_hours_formatted": f"{hours}h {mins:02d}m",
            "worked_hours_decimal": round(worked_mins / 60.0, 2),
            "device_label": day_records[0].device_label if day_records else "Móvil",
            "status": status,
            "records_count": len(day_records)
        })

    shifts.sort(key=lambda x: (x["date"], x["staff_name"]), reverse=True)
    return shifts


# ── 11. Resumen Agrupado Mensual de Jornadas ────────────────────────────────
@router.get("/daily-summary")
def get_daily_shifts_summary(
    month: Optional[int] = Query(None),
    year: Optional[int] = Query(None),
    staff_id: Optional[str] = Query(None),
    db: Session = Depends(database.get_db)
):
    tenant_id = database.current_tenant_var.get()
    now = datetime.utcnow()
    target_year = year or now.year
    target_month = month or now.month

    start_date = datetime(target_year, target_month, 1, 0, 0, 0)
    if target_month == 12:
        end_date = datetime(target_year + 1, 1, 1, 0, 0, 0)
    else:
        end_date = datetime(target_year, target_month + 1, 1, 0, 0, 0)

    query = db.query(models.TimeClockRecord).filter(
        models.TimeClockRecord.tenant_id == tenant_id,
        models.TimeClockRecord.timestamp >= start_date,
        models.TimeClockRecord.timestamp < end_date
    )

    if staff_id and staff_id != "all":
        query = query.filter(models.TimeClockRecord.staff_id == staff_id)

    records = query.order_by(models.TimeClockRecord.timestamp).all()

    profiles = db.query(models.Profile).filter(models.Profile.tenant_id == tenant_id).all()
    profile_map = {p.id: p.full_name or p.email for p in profiles}

    shifts = compute_daily_shifts(records, profile_map)

    total_mins = sum(s["worked_minutes"] for s in shifts)
    total_hours_dec = round(total_mins / 60.0, 2)
    unique_days = len(set(s["date"] for s in shifts))
    active_staff_count = len(set(s["staff_id"] for s in shifts))

    return {
        "year": target_year,
        "month": target_month,
        "total_worked_hours": total_hours_dec,
        "total_days_worked": unique_days,
        "active_staff_count": active_staff_count,
        "shifts": shifts
    }


# ── 12. Exportar Registro Oficial en Excel (RDL 8/2019) ─────────────────────
@router.get("/export-excel")
def export_time_clock_excel(
    month: Optional[int] = Query(None),
    year: Optional[int] = Query(None),
    staff_id: Optional[str] = Query(None),
    db: Session = Depends(database.get_db)
):
    try:
        import openpyxl
        from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
        from openpyxl.utils import get_column_letter
    except ImportError:
        raise HTTPException(
            status_code=500,
            detail="Módulo openpyxl no disponible para exportación Excel."
        )

    tenant_id = database.current_tenant_var.get()
    now = datetime.utcnow()
    target_year = year or now.year
    target_month = month or now.month

    # Nombre de la clínica
    settings = db.query(models.ClinicSettings).filter(models.ClinicSettings.tenant_id == tenant_id).first()
    clinic_name = settings.clinic_name if settings and settings.clinic_name else "Salón / Clínica"
    clinic_cif = getattr(settings, "cif_nif", "") or ""

    start_date = datetime(target_year, target_month, 1, 0, 0, 0)
    if target_month == 12:
        end_date = datetime(target_year + 1, 1, 1, 0, 0, 0)
    else:
        end_date = datetime(target_year, target_month + 1, 1, 0, 0, 0)

    query = db.query(models.TimeClockRecord).filter(
        models.TimeClockRecord.tenant_id == tenant_id,
        models.TimeClockRecord.timestamp >= start_date,
        models.TimeClockRecord.timestamp < end_date
    )

    if staff_id and staff_id != "all":
        query = query.filter(models.TimeClockRecord.staff_id == staff_id)

    records = query.order_by(models.TimeClockRecord.timestamp).all()

    profiles = db.query(models.Profile).filter(models.Profile.tenant_id == tenant_id).all()
    profile_map = {p.id: p.full_name or p.email for p in profiles}

    shifts = compute_daily_shifts(records, profile_map)

    # Crear Libro Excel
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = f"Jornada {target_year}-{target_month:02d}"

    # Estilos
    header_fill = PatternFill(start_color="1C1917", end_color="1C1917", fill_type="solid")
    header_font = Font(name="Calibri", size=11, bold=True, color="FFFFFF")
    accent_fill = PatternFill(start_color="FFF3EA", end_color="FFF3EA", fill_type="solid")
    total_fill = PatternFill(start_color="F5F5F4", end_color="F5F5F4", fill_type="solid")
    bold_font = Font(name="Calibri", size=11, bold=True)
    regular_font = Font(name="Calibri", size=10)
    center_align = Alignment(horizontal="center", vertical="center")
    left_align = Alignment(horizontal="left", vertical="center")
    right_align = Alignment(horizontal="right", vertical="center")

    thin_border = Border(
        left=Side(style="thin", color="E5E5E5"),
        right=Side(style="thin", color="E5E5E5"),
        top=Side(style="thin", color="E5E5E5"),
        bottom=Side(style="thin", color="E5E5E5")
    )

    # Bloque de Título
    ws.merge_cells("A1:J1")
    title_cell = ws["A1"]
    title_cell.value = f"REGISTRO DIARIO DE JORNADA LABORAL — {clinic_name.upper()}"
    title_cell.font = Font(name="Calibri", size=14, bold=True, color="1C1917")
    title_cell.alignment = center_align

    meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]
    nombre_mes = meses[target_month - 1] if 1 <= target_month <= 12 else str(target_month)

    ws.merge_cells("A2:J2")
    sub_cell = ws["A2"]
    sub_cell.value = f"Período: {nombre_mes} de {target_year} | CIF/NIF: {clinic_cif or 'N/D'} | Cumplimiento RDL 8/2019 (art. 34.9 ET)"
    sub_cell.font = Font(name="Calibri", size=10, italic=True, color="78716C")
    sub_cell.alignment = center_align

    # Fila vacía
    ws.row_dimensions[1].height = 28
    ws.row_dimensions[2].height = 20
    ws.row_dimensions[3].height = 10

    # Cabeceras de Tabla
    headers = [
        "Fecha", "Trabajador/a", "Entrada", "Salida Pausa", 
        "Entrada Pausa", "Salida", "Horas Ordinarias", "Horas Extra", 
        "Terminal de Registro", "Firma del Trabajador/a"
    ]

    row_num = 4
    ws.row_dimensions[row_num].height = 24
    for col_idx, h in enumerate(headers, 1):
        cell = ws.cell(row=row_num, column=col_idx, value=h)
        cell.fill = header_fill
        cell.font = header_font
        cell.alignment = center_align
        cell.border = thin_border

    # Filas de Datos
    total_hours = 0.0
    for shift in shifts:
        row_num += 1
        ws.row_dimensions[row_num].height = 20

        hours_val = shift["worked_hours_decimal"]
        total_hours += hours_val

        ws.cell(row=row_num, column=1, value=shift["date"]).alignment = center_align
        ws.cell(row=row_num, column=2, value=shift["staff_name"]).alignment = left_align
        ws.cell(row=row_num, column=3, value=shift["first_in"]).alignment = center_align
        ws.cell(row=row_num, column=4, value=shift["break_start"]).alignment = center_align
        ws.cell(row=row_num, column=5, value=shift["break_end"]).alignment = center_align
        ws.cell(row=row_num, column=6, value=shift["last_out"]).alignment = center_align
        
        hours_cell = ws.cell(row=row_num, column=7, value=hours_val)
        hours_cell.alignment = right_align
        hours_cell.number_format = "#,##0.00"

        extra_cell = ws.cell(row=row_num, column=8, value=0.0)
        extra_cell.alignment = right_align
        extra_cell.number_format = "#,##0.00"

        ws.cell(row=row_num, column=9, value=shift["device_label"]).alignment = left_align
        ws.cell(row=row_num, column=10, value="").alignment = center_align

        for col_idx in range(1, 11):
            cell = ws.cell(row=row_num, column=col_idx)
            cell.font = regular_font
            cell.border = thin_border
            if shift["status"] == "in_progress":
                cell.fill = accent_fill

    # Fila de Totales
    row_num += 1
    ws.row_dimensions[row_num].height = 24
    ws.cell(row=row_num, column=1, value="TOTALES").font = bold_font
    ws.cell(row=row_num, column=1).alignment = center_align
    ws.cell(row=row_num, column=1).fill = total_fill

    for c in range(2, 7):
        cell = ws.cell(row=row_num, column=c, value="")
        cell.fill = total_fill
        cell.border = thin_border

    tot_cell = ws.cell(row=row_num, column=7, value=round(total_hours, 2))
    tot_cell.font = bold_font
    tot_cell.alignment = right_align
    tot_cell.fill = total_fill
    tot_cell.number_format = "#,##0.00"
    tot_cell.border = thin_border

    tot_ext = ws.cell(row=row_num, column=8, value=0.0)
    tot_ext.font = bold_font
    tot_ext.alignment = right_align
    tot_ext.fill = total_fill
    tot_ext.number_format = "#,##0.00"
    tot_ext.border = thin_border

    for c in range(9, 11):
        cell = ws.cell(row=row_num, column=c, value="")
        cell.fill = total_fill
        cell.border = thin_border

    # Pie Legal Obligatorio
    row_num += 2
    ws.merge_cells(f"A{row_num}:J{row_num + 1}")
    footer_cell = ws[f"A{row_num}"]
    footer_cell.value = (
        "El presente documento recoge el registro diario de jornada exigido por el art. 34.9 del Estatuto de los Trabajadores "
        "(Real Decreto-ley 8/2019, de 8 de marzo). Los datos se conservan durante un plazo legal mínimo de cuatro años a disposición "
        "de los trabajadores, sus representantes legales y de la Inspección de Trabajo y Seguridad Social."
    )
    footer_cell.font = Font(name="Calibri", size=9, italic=True, color="78716C")
    footer_cell.alignment = Alignment(horizontal="left", vertical="top", wrap_text=True)

    # Ajuste automático del ancho de columnas
    col_widths = {1: 14, 2: 24, 3: 12, 4: 14, 5: 14, 6: 12, 7: 18, 8: 14, 9: 24, 10: 22}
    for col_idx, width in col_widths.items():
        ws.column_dimensions[get_column_letter(col_idx)].width = width

    output = io.BytesIO()
    wb.save(output)
    output.seek(0)

    filename = f"registro_jornada_{clinic_name.lower().replace(' ', '_')}_{target_year}_{target_month:02d}.xlsx"
    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

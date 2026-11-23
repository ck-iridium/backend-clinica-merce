import os
import uuid
import hmac
import hashlib
import time
from datetime import datetime, date, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Request
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


# ── 1. Listar Operadoras de Mostrador del Salón ──────────────────────────────
@router.get("/operators", response_model=List[schemas.CounterOperatorResponse])
def get_counter_operators(db: Session = Depends(database.get_db)):
    tenant_id = database.current_tenant_var.get()
    if not tenant_id:
        raise HTTPException(status_code=400, detail="Tenant context missing")

    profiles = db.query(models.Profile).filter(
        models.Profile.tenant_id == tenant_id,
        models.Profile.role.in_([
            "specialist", "receptionist", "admin",
            "especialista", "recepcionist", "recepción", "recepcion", "administrador",
            "Especialista", "Recepción", "Recepcion", "Administrador"
        ])
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
            has_bound_device=bool(getattr(p, "bound_device_id", None))
        ))
    return response


# ── 2. Crear Operadora Mostrador con PIN (Zero-Email) ──────────────────────
@router.post("/counter-operators", response_model=schemas.CounterOperatorResponse)
def create_counter_operator(
    payload: schemas.CounterOperatorCreate,
    db: Session = Depends(database.get_db)
):
    tenant_id = database.current_tenant_var.get()
    if not tenant_id:
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
        tenant_id=tenant_id,
        email=tech_email,
        hashed_password=hashed_pw,
        role=payload.role.lower(),
        email_verified=True
    )
    db.add(user)

    # 2. Crear Profile asociado con modo PIN
    profile = models.Profile(
        id=operator_id,
        tenant_id=tenant_id,
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
    db: Session = Depends(database.get_db)
):
    tenant_id = database.current_tenant_var.get()
    profile = db.query(models.Profile).filter(
        models.Profile.id == payload.staff_id,
        models.Profile.tenant_id == tenant_id
    ).first()

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
    db: Session = Depends(database.get_db)
):
    tenant_id = database.current_tenant_var.get()
    profile = db.query(models.Profile).filter(
        models.Profile.id == payload.staff_id,
        models.Profile.tenant_id == tenant_id
    ).first()

    if not profile:
        raise HTTPException(status_code=404, detail="Operador no encontrado.")

    new_pin = payload.new_pin.strip()
    if not new_pin.isdigit() or len(new_pin) != 4:
        raise HTTPException(status_code=400, detail="El nuevo PIN debe contener exactamente 4 dígitos.")

    profile.pin_code_hash = pwd_context.hash(new_pin)
    profile.pin_failed_attempts = 0
    profile.pin_locked_until = None
    db.commit()

    return {"success": True, "message": "PIN actualizado correctamente."}


# ── 5. Desvincular Teléfono Móvil (Permite asociar uno nuevo) ───────────────
@router.post("/unbind-device")
def unbind_operator_device(
    payload: schemas.DeviceUnbindRequest,
    db: Session = Depends(database.get_db)
):
    tenant_id = database.current_tenant_var.get()
    profile = db.query(models.Profile).filter(
        models.Profile.id == payload.staff_id,
        models.Profile.tenant_id == tenant_id
    ).first()

    if not profile:
        raise HTTPException(status_code=404, detail="Operador no encontrado.")

    profile.bound_device_id = None
    db.commit()
    return {"success": True, "message": "Teléfono desvinculado con éxito. La empleada podrá vincular su nuevo móvil en el próximo fichaje."}


# ── 6. Generar Token QR Dinámico Rotativo (Cada 20 seg) ─────────────────────
@router.get("/qr-token", response_model=schemas.QRRotateTokenResponse)
def get_qr_rotate_token(request: Request):
    tenant_id = database.current_tenant_var.get()
    if not tenant_id:
        raise HTTPException(status_code=400, detail="Tenant context missing")

    token, seconds_left = generate_qr_totp(tenant_id, window_seconds=20)
    
    # URL para el escaneo móvil
    host = request.headers.get("host", "probookia.com")
    protocol = "http" if "localhost" in host else "https"
    qr_payload = f"{protocol}://{host}/fichar?t={token}&tenant={tenant_id}"

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
    db: Session = Depends(database.get_db)
):
    tenant_id = database.current_tenant_var.get()
    profile = db.query(models.Profile).filter(
        models.Profile.id == payload.staff_id,
        models.Profile.tenant_id == tenant_id
    ).first()

    if not profile:
        raise HTTPException(status_code=404, detail="Operador no encontrado.")

    # 1. Validación de Token QR (si el fichaje viene desde teléfono móvil)
    if payload.qr_token:
        is_qr_valid = verify_qr_totp(tenant_id, payload.qr_token, window_seconds=20)
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
        models.TimeClockRecord.tenant_id == tenant_id,
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
        tenant_id=tenant_id,
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
def get_staff_time_clock_status(staff_id: str, db: Session = Depends(database.get_db)):
    tenant_id = database.current_tenant_var.get()
    profile = db.query(models.Profile).filter(
        models.Profile.id == staff_id,
        models.Profile.tenant_id == tenant_id
    ).first()

    if not profile:
        raise HTTPException(status_code=404, detail="Operador no encontrado.")

    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    records = db.query(models.TimeClockRecord).filter(
        models.TimeClockRecord.tenant_id == tenant_id,
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
def get_team_time_clock_summary(db: Session = Depends(database.get_db)):
    tenant_id = database.current_tenant_var.get()
    profiles = db.query(models.Profile).filter(
        models.Profile.tenant_id == tenant_id,
        models.Profile.role.in_([
            "specialist", "receptionist", "admin",
            "especialista", "recepcionist", "recepción", "recepcion", "administrador",
            "Especialista", "Recepción", "Recepcion", "Administrador"
        ])
    ).all()

    summary = []
    for p in profiles:
        status_data = get_staff_time_clock_status(p.id, db)
        summary.append(status_data)

    return summary


# ── 10. Informe de Jornada Laboral (Para Gestoría e Inspección) ──────────────
@router.get("/report")
def get_time_clock_report(
    month: Optional[int] = Query(None),
    year: Optional[int] = Query(None),
    staff_id: Optional[str] = Query(None),
    db: Session = Depends(database.get_db)
):
    tenant_id = database.current_tenant_var.get()
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
        models.TimeClockRecord.tenant_id == tenant_id,
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

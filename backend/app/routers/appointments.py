from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks, Request
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from datetime import date as DateType
from .. import schemas, database, models
from ..crud import appointments as crud
from ..limiter import limiter
from ..crud.settings import get_clinic_settings
from ..scheduler import scheduler
from ..utils import mailer
import stripe
import os
from datetime import datetime, timedelta


router = APIRouter(
    prefix="/appointments",
    tags=["appointments"],
)

# ─── Public endpoints (must be defined BEFORE /{appointment_id} catch-all) ───

@router.get("/availability", response_model=schemas.AvailabilityResponse)
def get_availability(
    date: str = Query(..., description="Target date in YYYY-MM-DD format"),
    service_id: str = Query(..., description="Service UUID"),
    location_id: Optional[str] = Query(None, description="Location UUID"),
    staff_id: Optional[str] = Query(None, description="Preferred Specialist UUID"),
    db: Session = Depends(database.get_db),
):
    """
    Returns the list of available time slots for a given date and service.
    Used by the public landing booking widget.
    """
    try:
        target = DateType.fromisoformat(date)
    except ValueError:
        raise HTTPException(status_code=422, detail="date must be YYYY-MM-DD")

    # Liberación lazy en tiempo real antes de calcular la disponibilidad pública
    crud.auto_cancel_expired_pending_appointments(db)

    slots = crud.get_availability_slots(
        db, 
        target_date=target, 
        service_id=service_id,
        location_id=location_id,
        preferred_staff_id=staff_id
    )
    return schemas.AvailabilityResponse(
        date=date,
        service_id=service_id,
        location_id=location_id,
        available_slots=slots,
    )


@router.get("/client-saved-address", response_model=Dict[str, Any])
def get_client_saved_address(
    email: str = Query(..., description="Client email"),
    phone: str = Query(..., description="Client phone"),
    db: Session = Depends(database.get_db),
):
    """
    Recupera de forma segura la dirección guardada de un cliente si coinciden
    el email y el teléfono. Evita fugas de datos (fishing) al requerir ambos campos.
    """
    from ..database import current_tenant_var
    tenant_id = current_tenant_var.get()
    
    client = db.query(models.Client).filter(
        models.Client.tenant_id == tenant_id,
        models.Client.email == email.strip().lower(),
        models.Client.phone == phone.strip()
    ).first()
    
    if client and client.address:
        return {
            "has_saved_address": True,
            "client_name": client.name,
            "client_address": client.address,
            "client_latitude": client.client_latitude,
            "client_longitude": client.client_longitude,
            "client_postal_code": client.client_postal_code,
            "client_city": client.client_city
        }
        
    return {"has_saved_address": False}

import functools

def log_exceptions(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except Exception as e:
            import traceback
            tb = traceback.format_exc()
            print(f"[PUBLIC_BOOKING_ERROR] {e}\n{tb}", flush=True)
            try:
                with open("public_booking_error.txt", "w", encoding="utf-8") as f:
                    f.write(str(e) + "\n" + tb)
            except Exception:
                pass
            raise e
    return wrapper

@router.post("/public", response_model=schemas.PublicBookingResponse, status_code=201)
@limiter.limit("5/minute")
def public_booking(request: Request, booking: schemas.PublicBookingRequest, background_tasks: BackgroundTasks, db: Session = Depends(database.get_db)):
    """
    Landing page booking endpoint with Zero-Friction and Multi-layer Bot Protection.
    - Honeypot check (website_hp).
    - Time-trap check (form_load_time).
    - Phone & Email hygiene / anti-spam validation.
    - Finds or creates client with direct 'confirmed' appointment.
    """
    import re
    import time
    from ..database import current_tenant_var

    # 1. ESCUDO 1: HONEYPOT TRAP (Bots rellenan campos trampa ocultos)
    if booking.website_hp and booking.website_hp.strip():
        raise HTTPException(
            status_code=400,
            detail="Petición bloqueada por seguridad. Se ha detectado comportamiento automatizado."
        )

    # 2. ESCUDO 2: TIME-TRAP (Los humanos tardan > 2.5s en rellenar y enviar el formulario)
    if booking.form_load_time:
        now_ms = time.time() * 1000.0
        elapsed_ms = now_ms - booking.form_load_time
        if 0 < elapsed_ms < 2500:
            raise HTTPException(
                status_code=400,
                detail="Envío demasiado rápido. Por favor, completa el proceso de reserva con calma."
            )

    # 3. ESCUDO 3: VALIDACIÓN Y SANEAMIENTO DE CONTACTO
    if not booking.client_email and not booking.client_phone:
        raise HTTPException(
            status_code=422,
            detail="Por favor proporciona un número de teléfono o correo electrónico."
        )

    if booking.client_phone:
        clean_phone = re.sub(r"[\s\-\(\)\.]", "", booking.client_phone)
        fake_patterns = [
            r"^0+$", r"^1+$", r"^666666666$", r"^123456789$", r"^987654321$",
            r"^(\d)\1{7,}$"
        ]
        if any(re.match(pat, clean_phone) for pat in fake_patterns) or len(clean_phone) < 8:
            raise HTTPException(
                status_code=422,
                detail="El número de teléfono no parece ser válido. Por favor compruébalo."
            )
        
        # Anti-acaparamiento: máximo 2 reservas activas futuras por teléfono en 24h
        now_utc = datetime.utcnow()
        tenant_id = current_tenant_var.get()
        # Liberación lazy de reservas pendientes caducadas antes de verificar límites
        crud.auto_cancel_expired_pending_appointments(db, tenant_id)
        future_phone_appts = db.query(models.Appointment).join(models.Client).filter(
            models.Appointment.tenant_id == tenant_id,
            models.Client.phone == booking.client_phone,
            models.Appointment.start_time >= now_utc,
            models.Appointment.start_time <= now_utc + timedelta(days=1),
            models.Appointment.status.in_(["confirmed", "pending", "awaiting_payment"])
        ).count()
        if future_phone_appts >= 2:
            raise HTTPException(
                status_code=429,
                detail="Ya tienes citas programadas para hoy con este teléfono. Si necesitas cambios, contáctanos."
            )

    if booking.client_email:
        email_clean = booking.client_email.strip().lower()
        disposable_domains = {
            "yopmail.com", "tempmail.com", "guerrillamail.com", "mailinator.com",
            "10minutemail.com", "trashmail.com", "sharklasers.com", "dispostable.com"
        }
        domain = email_clean.split("@")[-1] if "@" in email_clean else ""
        if domain in disposable_domains or not re.match(r"^[^@]+@[^@]+\.[^@]+$", email_clean):
            raise HTTPException(
                status_code=422,
                detail="Por favor introduce una dirección de correo electrónico válida."
            )

    # ── VALIDACIONES DE MODALIDAD Y COBERTURA GEOGRÁFICA ──
    service = db.query(models.Service).filter(models.Service.id == booking.service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Servicio no encontrado")
        
    settings = get_clinic_settings(db)
    
    # 1. Validar modalidad permitida por servicio
    allowed = service.allowed_modality or "clinic"
    requested = booking.service_modality or "clinic"
    
    if allowed == "home_only" and requested == "clinic":
        raise HTTPException(
            status_code=400,
            detail="Este servicio es exclusivo a domicilio."
        )
    if allowed == "clinic_only" and requested == "home":
        raise HTTPException(
            status_code=400,
            detail="Este servicio es exclusivo en clínica."
        )
        
    # 2. Validar que si es a domicilio, el profesional soporte domicilio
    if requested == "home":
        if settings.work_modality == "clinic_only":
            raise HTTPException(
                status_code=400,
                detail="El profesional no ofrece servicios a domicilio actualmente."
            )
            
        # Validar dirección y coordenadas
        if not booking.client_address or booking.client_latitude is None or booking.client_longitude is None:
            raise HTTPException(
                status_code=422,
                detail="La dirección y coordenadas geográficas son obligatorias para citas a domicilio."
            )
            
        # 3. Comprobar lista blanca de zonas híbrida
        in_whitelist = False
        if settings.whitelist_zones:
            import json
            try:
                whitelist = json.loads(settings.whitelist_zones)
            except Exception:
                whitelist = []
            
            if whitelist:
                postal_code = (booking.client_postal_code or "").strip().lower()
                city = (booking.client_city or "").strip().lower()
                for zone in whitelist:
                    zone_clean = str(zone).strip().lower()
                    if (postal_code and zone_clean == postal_code) or (city and zone_clean == city):
                        in_whitelist = True
                        break
                        
        # 4. Si no está en lista blanca, verificar radio kilométrico con Haversine
        if not in_whitelist:
            if settings.operations_center_latitude is None or settings.operations_center_longitude is None:
                raise HTTPException(
                    status_code=400,
                    detail="El profesional no tiene configurado su Centro de Operaciones para calcular la cobertura."
                )
                
            from ..utils.geo import calculate_haversine_distance
            distance = calculate_haversine_distance(
                settings.operations_center_latitude,
                settings.operations_center_longitude,
                booking.client_latitude,
                booking.client_longitude
            )
            
            max_radius = settings.max_coverage_radius_km or 10.0
            if distance > max_radius:
                raise HTTPException(
                    status_code=400,
                    detail=f"Lo sentimos, tu dirección está fuera de nuestro radio de cobertura. Estás a {distance:.1f} km, el límite es {max_radius:.1f} km."
                )
    
    # Creamos la cita inicialmente SIN enviar email. 
    # Decidiremos si enviarlo después de intentar generar el pago de Stripe.
    try:
        appt, client, is_new = crud.create_public_appointment(db, booking, background_tasks=background_tasks, send_email=False)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

    checkout_url = None

    # ── Calcular importe de fianza con lógica de sobrescritura ──
    deposit_amount = 0.0
    requires_payment = False
    
    if service:
        if service.requires_deposit and service.deposit_amount and service.deposit_amount > 0:
            deposit_amount = float(service.deposit_amount)
            requires_payment = True
        elif settings.global_deposit_required and settings.global_deposit_amount and settings.global_deposit_amount > 0:
            # Si el servicio no tiene fianza individual y no está exento explícitamente (deposit_amount == 0)
            is_exempt = service.deposit_amount is not None and float(service.deposit_amount) == 0.0
            if not is_exempt:
                deposit_amount = float(settings.global_deposit_amount)
                requires_payment = True

    if requires_payment and settings.stripe_account_id and settings.stripe_charges_enabled:
        stripe.api_key = os.environ.get("STRIPE_SECRET_KEY")
        frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:3000")
        
        try:
            session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=[{
                    'price_data': {
                        'currency': 'eur',
                        'unit_amount': int(deposit_amount * 100),
                        'product_data': {
                            'name': f"Fianza - {service.name}",
                            'description': f"Reserva {appt.start_time.strftime('%d/%m/%Y %H:%M')}",
                        },
                    },
                    'quantity': 1,
                }],
                mode='payment',
                success_url=f"{frontend_url}/reserva/exito?session_id={{CHECKOUT_SESSION_ID}}",
                cancel_url=f"{frontend_url}/reserva/cancelada",
                client_reference_id=appt.id,
                stripe_account=settings.stripe_account_id # Cargo directo en cuenta conectada
            )
            
            appt.status = "awaiting_payment"
            appt.payment_status = "awaiting_payment"
            db.commit()
            
            checkout_url = session.url
            
            # Programar la liberación del slot a los 10 minutos
            def release_unpaid_slot(appt_id):
                from ..database import SessionLocal
                from ..models import Appointment
                db_local = SessionLocal()
                try:
                    appointment = db_local.query(Appointment).filter(Appointment.id == appt_id).first()
                    if appointment and appointment.payment_status == "awaiting_payment":
                        appointment.status = "cancelled"
                        appointment.notes = (appointment.notes or "") + "\n[Sistema] Cita cancelada por falta de pago (fianza expirada)."
                        db_local.commit()
                        
                        # Notificar cancelación al panel
                        from ..utils.notifications import create_admin_notification
                        create_admin_notification(
                            db_local,
                            title="⏰ Reserva Expirada",
                            description=f"Cita de {appointment.client.name} cancelada por falta de pago.",
                            type="warning",
                            metadata={"appointment_id": appt_id},
                            tenant_id=appointment.tenant_id
                        )
                        
                        print(f"Slot liberado: Cita {appt_id} cancelada tras 10 min sin pago.")
                finally:
                    db_local.close()

            run_date = datetime.now() + timedelta(minutes=10)
            scheduler.add_job(release_unpaid_slot, 'date', run_date=run_date, args=[appt.id])

            # RESTAURAR NOTIFICACIÓN INICIAL (Para que suene el sonido en el panel)
            from ..utils.notifications import create_admin_notification
            create_admin_notification(
                db, 
                title="✨ Nueva Reserva Web", 
                description=f"Cita de {client.name} para {appt.start_time.strftime('%H:%M')}",
                type="info",
                metadata={"appointment_id": appt.id},
                tenant_id=appt.tenant_id
            )

        except Exception as e:
            print(f"Error creando sesión de Stripe: {e}")
            # Si falla Stripe, permitimos la reserva normal web_pending
            pass

    # Si la cita requiere verificación OTP (cliente nuevo/no verificado):
    if appt.status == "pending_verification":
        # El código ya fue programado en background_tasks por crud.create_public_appointment.
        # En caso de que no estuviera presente, usamos fallback de búsqueda en BD.
        otp_code_val = getattr(appt, "otp_code", None)
        if not otp_code_val:
            vc = db.query(models.VerificationCode).filter(
                models.VerificationCode.appointment_id == appt.id
            ).order_by(models.VerificationCode.created_at.desc()).first()
            if vc:
                otp_code_val = vc.code
                background_tasks.add_task(mailer.send_appointment_notification, appt.id, 'otp_verification', otp_code=vc.code)
        
        print(f"[OTP_DISPATCH] Código OTP {otp_code_val} programado para cliente de cita {appt.id}", flush=True)

        raw_email = client.email or booking.client_email or ""
        masked_email = ""
        if "@" in raw_email:
            u_p, d_p = raw_email.split("@", 1)
            masked_user = (u_p[:2] + "***") if len(u_p) > 2 else (u_p[:1] + "***")
            masked_email = f"{masked_user}@{d_p}"

        return schemas.PublicBookingResponse(
            appointment_id=appt.id,
            client_id=client.id,
            is_new_client=is_new,
            start_time=appt.start_time,
            end_time=appt.end_time,
            status="verification_required",
            checkout_url=checkout_url,
            requires_verification=True,
            verification_email_masked=masked_email
        )

    # Si no hay checkout_url (no requiere fianza o falló Stripe),
    # y el cliente ya está verificado, la cita queda directamente 'confirmed'.
    if not checkout_url:
        from ..utils.notifications import create_admin_notification
        create_admin_notification(
            db, 
            title="✨ Nueva Cita Confirmada", 
            description=f"Reserva online de {client.name} para {appt.start_time.strftime('%d/%m a las %H:%M')}",
            type="success",
            metadata={"appointment_id": appt.id},
            tenant_id=appt.tenant_id
        )
        background_tasks.add_task(mailer.send_appointment_notification, appt.id, 'confirmation')
        background_tasks.add_task(mailer.send_appointment_notification, appt.id, 'new_web_booking')

    return schemas.PublicBookingResponse(
        appointment_id=appt.id,
        client_id=client.id,
        is_new_client=is_new,
        start_time=appt.start_time,
        end_time=appt.end_time,
        status=appt.status,
        checkout_url=checkout_url,
        requires_verification=False
    )


@router.post("/verify-otp", response_model=schemas.PublicBookingResponse)
@limiter.limit("10/minute")
def verify_otp(
    request: Request,
    payload: schemas.VerifyOtpRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(database.get_db)
):
    """
    Verifies the 6-digit OTP code for a new client appointment.
    On success:
    - Marks Client.is_verified = True (persisted permanently for this tenant).
    - Updates Appointment.status = 'confirmed'.
    - Sends official confirmation emails and notifies clinic staff.
    """
    from ..database import current_tenant_var
    tenant_id = current_tenant_var.get()

    appt = db.query(models.Appointment).filter(
        models.Appointment.id == payload.appointment_id,
        models.Appointment.tenant_id == tenant_id
    ).first()

    if not appt:
        raise HTTPException(status_code=404, detail="Cita no encontrada.")

    client = appt.client

    # Si ya estaba confirmada previamente
    if appt.status == "confirmed":
        return schemas.PublicBookingResponse(
            appointment_id=appt.id,
            client_id=client.id if client else "",
            is_new_client=False,
            start_time=appt.start_time,
            end_time=appt.end_time,
            status="confirmed",
            requires_verification=False
        )

    # Buscar el código OTP activo más reciente
    vc = db.query(models.VerificationCode).filter(
        models.VerificationCode.appointment_id == appt.id,
        models.VerificationCode.tenant_id == tenant_id
    ).order_by(models.VerificationCode.created_at.desc()).first()

    if not vc:
        raise HTTPException(status_code=400, detail="No se encontró ningún código de verificación activo. Solicita un reenvío.")

    # Comprobar expiración (10 minutos)
    if datetime.utcnow() > vc.expires_at:
        raise HTTPException(status_code=400, detail="El código de verificación ha caducado. Por favor solicita uno nuevo.")

    # Control anti-fuerza bruta (máximo 5 intentos)
    if vc.attempts >= 5:
        raise HTTPException(status_code=429, detail="Has superado el límite de intentos. Por favor solicita un nuevo código.")

    if vc.code != payload.code.strip():
        vc.attempts += 1
        db.commit()
        remaining = max(0, 5 - vc.attempts)
        raise HTTPException(
            status_code=400,
            detail=f"Código incorrecto. Te quedan {remaining} intentos."
        )

    # ── VERIFICACIÓN EXITOSA ──
    # 1. Marcar cliente como verificado para siempre en este tenant
    if client:
        client.is_verified = True
        db.add(client)

    # 2. Confirmar cita
    appt.status = "confirmed"
    db.add(appt)

    # 3. Eliminar código usado
    db.delete(vc)
    db.commit()

    # 4. Disparar notificaciones
    from ..utils.notifications import create_admin_notification
    create_admin_notification(
        db,
        title="✨ Cita Verificada (Nuevo Cliente)",
        description=f"Reserva online de {client.name} verificada para {appt.start_time.strftime('%d/%m a las %H:%M')}",
        type="success",
        metadata={"appointment_id": appt.id},
        tenant_id=appt.tenant_id
    )
    background_tasks.add_task(mailer.send_appointment_notification, appt.id, 'confirmation')
    background_tasks.add_task(mailer.send_appointment_notification, appt.id, 'new_web_booking')

    return schemas.PublicBookingResponse(
        appointment_id=appt.id,
        client_id=client.id if client else "",
        is_new_client=True,
        start_time=appt.start_time,
        end_time=appt.end_time,
        status="confirmed",
        requires_verification=False
    )


@router.post("/resend-otp")
@limiter.limit("3/minute")
def resend_otp(
    request: Request,
    payload: schemas.ResendOtpRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(database.get_db)
):
    """
    Generates and emails a new 6-digit OTP code for an unverified appointment.
    """
    from ..database import current_tenant_var
    import random
    tenant_id = current_tenant_var.get()

    appt = db.query(models.Appointment).filter(
        models.Appointment.id == payload.appointment_id,
        models.Appointment.tenant_id == tenant_id
    ).first()

    if not appt:
        raise HTTPException(status_code=404, detail="Cita no encontrada.")

    if appt.status == "confirmed":
        return {"status": "already_confirmed", "message": "Esta cita ya está confirmada."}

    client = appt.client
    target_email = client.email if client else None
    if not target_email:
        raise HTTPException(status_code=400, detail="No hay una dirección de correo asociada a esta reserva.")

    # Generar nuevo código
    new_code = f"{random.randint(100000, 999999)}"

    # Limpiar códigos anteriores de la cita
    db.query(models.VerificationCode).filter(
        models.VerificationCode.appointment_id == appt.id,
        models.VerificationCode.tenant_id == tenant_id
    ).delete()

    vc = models.VerificationCode(
        tenant_id=tenant_id,
        client_id=client.id,
        appointment_id=appt.id,
        code=new_code,
        target_email=target_email,
        expires_at=datetime.utcnow() + timedelta(minutes=10)
    )
    db.add(vc)
    db.commit()

    background_tasks.add_task(mailer.send_appointment_notification, appt.id, 'otp_verification', otp_code=new_code)
    return {"status": "success", "message": "Nuevo código enviado correctamente."}


# ─── Internal CRUD endpoints ────────────────────────────────────────────────

@router.post("/", response_model=schemas.AppointmentResponse)
def create_appointment(appointment: schemas.AppointmentCreate, db: Session = Depends(database.get_db)):
    try:
        return crud.create_appointment(db=db, appointment=appointment)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error interno al crear cita: {str(e)}")

@router.get("/", response_model=List[schemas.AppointmentResponse])
def read_appointments(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    return crud.get_appointments(db, skip=skip, limit=limit)

@router.patch("/{appointment_id}", response_model=schemas.AppointmentResponse)
def update_appointment(appointment_id: str, appointment_update: schemas.AppointmentUpdate, background_tasks: BackgroundTasks, db: Session = Depends(database.get_db)):
    try:
        db_appointment = crud.update_appointment(db, appointment_id=appointment_id, appointment=appointment_update, background_tasks=background_tasks)
        if db_appointment is None:
            raise HTTPException(status_code=404, detail="Appointment not found")
        return db_appointment
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error interno al actualizar cita: {str(e)}")

@router.delete("/{appointment_id}")
def delete_appointment(appointment_id: str, db: Session = Depends(database.get_db)):
    db_appointment = crud.delete_appointment(db, appointment_id=appointment_id)
    if db_appointment is None:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return {"ok": True}

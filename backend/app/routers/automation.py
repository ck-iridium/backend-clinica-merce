import os
from fastapi import APIRouter, Depends, HTTPException, Header, BackgroundTasks
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, date
from .. import models
from ..database import get_db
from ..utils.mailer import send_appointment_notification
from ..utils.notifications import create_admin_notification
import logging
import json
from .settings import export_database
from supabase import create_client, Client


logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/automation",
    tags=["Automation"]
)

@router.post("/send-reminders")
def send_reminders(
    background_tasks: BackgroundTasks,
    x_cron_key: str = Header(None),
    db: Session = Depends(get_db)
):
    """
    Endpoint protected by X-Cron-Key.
    Sends reminders for appointments scheduled for tomorrow.
    """
    secret_key = os.environ.get("CRON_SECRET_KEY", "dev_secret")
    if x_cron_key != secret_key:
        raise HTTPException(status_code=403, detail="Invalid cron key")

    # Find appointments for tomorrow that haven't been reminded
    tomorrow = datetime.utcnow().date() + timedelta(days=1)
    
    appointments = db.query(models.Appointment).filter(
        models.Appointment.status == "confirmed",
        models.Appointment.reminder_sent == False
    ).all()

    count = 0
    for appt in appointments:
        if appt.start_time.date() == tomorrow:
            # Trigger reminder
            background_tasks.add_task(send_appointment_notification, appt.id, 'reminder')
            appt.reminder_sent = True
            count += 1
            
    db.commit()
    logger.info(f"Reminders scheduled for {count} appointments tomorrow.")
    return {"status": "success", "reminders_sent": count}

@router.post("/backup")
def execute_cloud_backup(
    x_cron_key: str = Header(None),
    db: Session = Depends(get_db)
):
    """
    Endpoint protected by X-Cron-Key.
    Iterates over all active tenants and generates a per-tenant JSON backup,
    uploading each to Supabase Storage. Enforces a retention of max 7 backups per tenant.
    """
    secret_key = os.environ.get("CRON_SECRET_KEY", "dev_secret")
    if x_cron_key != secret_key:
        raise HTTPException(status_code=403, detail="Invalid cron key")

    supabase_url = os.environ.get("SUPABASE_URL")
    supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

    if not supabase_url or not supabase_key:
        logger.error("No Supabase configuration found to perform backup.")
        raise HTTPException(status_code=500, detail="Supabase Storage no configurado.")

    from ..database import current_tenant_var
    from ..models import Tenant

    tenants = db.query(Tenant).all()
    supabase: Client = create_client(supabase_url, supabase_key)
    now = datetime.utcnow()
    results = []

    for tenant in tenants:
        try:
            # Set tenant context so export_database scopes queries correctly
            token = current_tenant_var.set(tenant.id)
            try:
                data = export_database(db)
            finally:
                current_tenant_var.reset(token)

            json_str = json.dumps(data, default=str)
            filename = f"backup_{tenant.slug}_{now.strftime('%Y_%m_%d')}.json"

            supabase.storage.from_("backups").upload(
                file=json_str.encode('utf-8'),
                path=filename,
                file_options={"content-type": "application/json", "upsert": "true"}
            )

            # Retención: máximo 7 backups por tenant
            files_res = supabase.storage.from_("backups").list()
            tenant_files = [
                f for f in files_res
                if f['name'].startswith(f"backup_{tenant.slug}_")
            ]
            tenant_files.sort(key=lambda x: x['name'])

            deleted_count = 0
            if len(tenant_files) > 7:
                excess = len(tenant_files) - 7
                to_delete = [f['name'] for f in tenant_files[:excess]]
                supabase.storage.from_("backups").remove(to_delete)
                deleted_count = len(to_delete)

            results.append({"tenant": tenant.slug, "file": filename, "deleted_old": deleted_count})
            logger.info(f"Backup OK for tenant '{tenant.slug}': {filename}")

        except Exception as e:
            logger.error(f"Backup FAILED for tenant '{tenant.slug}': {e}")
            results.append({"tenant": tenant.slug, "error": str(e)})

    return {"status": "success", "results": results}


@router.post("/cleanup-unverified")
def cleanup_unverified(
    x_cron_key: str = Header(None),
    db: Session = Depends(get_db)
):
    """
    Endpoint protected by X-Cron-Key.
    Cleans up pending_verification appointments older than 30 minutes.
    """
    secret_key = os.environ.get("CRON_SECRET_KEY", "dev_secret")
    if x_cron_key != secret_key:
        raise HTTPException(status_code=403, detail="Invalid cron key")

    threshold = datetime.utcnow() - timedelta(minutes=30)
    
    expired = db.query(models.Appointment).filter(
        models.Appointment.status == "pending_verification",
        models.Appointment.created_at < threshold
    ).all()

    count = 0
    for appt in expired:
        db.delete(appt)
        count += 1
            
    db.commit()
    logger.info(f"Cleaned up {count} unverified appointments.")
    return {"status": "success", "deleted": count}

@router.get("/verify/{appointment_id}")
def get_appointment_for_verification(
    appointment_id: str,
    db: Session = Depends(get_db)
):
    """
    Public endpoint to get basic appointment details for the verification confirmation screen.
    """
    appt = db.query(models.Appointment).filter(models.Appointment.id == appointment_id).first()
    
    if not appt:
        raise HTTPException(status_code=404, detail="Cita no encontrada")
        
    date_str = appt.start_time.strftime("%d/%m/%Y")
    time_str = appt.start_time.strftime("%H:%M")

    return {
        "id": appt.id,
        "service_name": appt.service.name,
        "date": date_str,
        "time": time_str,
        "status": appt.status,
        "start_iso": appt.start_time.isoformat(),
        "end_iso": appt.end_time.isoformat()
    }

@router.post("/verify/{appointment_id}")
def verify_appointment(
    appointment_id: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Public endpoint with UUID. Verifies appointment and notifies Merce.
    """
    appt = db.query(models.Appointment).filter(models.Appointment.id == appointment_id).first()
    
    if not appt:
        raise HTTPException(status_code=404, detail="Cita no encontrada")
        
    if appt.status != 'pending_verification':
        return {"status": "already_processed", "current_status": appt.status}

    # Verify and confirm
    appt.status = 'confirmed'
    db.commit()

    # Generar notificación para el equipo
    create_admin_notification(
        db,
        title="🔔 Cita Web Verificada",
        description=f"La cita de {appt.client.name} ha sido verificada y confirmada.",
        type="success",
        metadata={"appointment_id": appt.id}
    )
    
    # Notify Admin that it is a verified web booking
    background_tasks.add_task(send_appointment_notification, appt.id, 'new_web_booking')
    
    # Notify Client confirmation
    background_tasks.add_task(send_appointment_notification, appt.id, 'confirmation')
    
    return {
        "status": "success", 
        "message": "Cita confirmada correctamente"
    }

@router.get("/cancel/{appointment_id}")
def get_appointment_for_cancellation(
    appointment_id: str,
    db: Session = Depends(get_db)
):
    """
    Public endpoint to get basic appointment details for the cancellation confirmation screen.
    """
    appt = db.query(models.Appointment).filter(models.Appointment.id == appointment_id).first()
    
    if not appt:
        raise HTTPException(status_code=404, detail="Cita no encontrada")
        
    date_str = appt.start_time.strftime("%d/%m/%Y")
    time_str = appt.start_time.strftime("%H:%M")

    return {
        "id": appt.id,
        "service_name": appt.service.name,
        "date": date_str,
        "time": time_str,
        "status": appt.status
    }

@router.post("/cancel/{appointment_id}")
def cancel_appointment(
    appointment_id: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Public endpoint with UUID. Allows checking and cancelling.
    """
    appt = db.query(models.Appointment).filter(models.Appointment.id == appointment_id).first()
    
    if not appt:
        raise HTTPException(status_code=404, detail="Cita no encontrada")
        
    if appt.status in ['cancelled', 'completed', 'no_show']:
        raise HTTPException(status_code=400, detail="Esta cita no se puede cancelar porque su estado es definitivo.")

    # Mofidy status
    appt.status = 'cancelled'
    db.commit()
    
    # Notify Admin
    background_tasks.add_task(send_appointment_notification, appt.id, 'cancelled_by_client')
    
    return {
        "status": "success", 
        "message": "Cita cancelada correctamente", 
        "service_id": appt.service_id,
        "client_name": appt.client.name,
        "client_email": appt.client.email,
        "client_phone": appt.client.phone
    }

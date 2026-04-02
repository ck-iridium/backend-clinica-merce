import os
from fastapi import APIRouter, Depends, HTTPException, Header, BackgroundTasks
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, date
from .. import models
from ..database import get_db
from ..utils.mailer import send_appointment_notification
import logging

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

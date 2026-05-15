from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from . import models, database
import logging

logger = logging.getLogger(__name__)

def cleanup_expired_appointments():
    """
    Busca citas en estado 'awaiting_payment' que lleven más de 15 minutos
    sin ser confirmadas y las cancela para liberar el hueco.
    Usa UTC para comparar con created_at (que Supabase guarda en UTC).
    """
    db: Session = database.SessionLocal()
    try:
        # IMPORTANTE: created_at en Supabase es UTC.
        # Comparamos contra la hora UTC actual.
        limit_time = datetime.utcnow() - timedelta(minutes=15)
        
        expired_appts = db.query(models.Appointment).filter(
            models.Appointment.status == "awaiting_payment",
            models.Appointment.created_at < limit_time
        ).all()
        
        for appt in expired_appts:
            appt.status = "cancelled"
            appt.notes = (appt.notes or "") + "\n[Sistema] Cita cancelada por expiración de tiempo de pago (15 min)."
            logger.info(f"Cita {appt.id} cancelada automáticamente (expirada).")
            
        if expired_appts:
            db.commit()
            print(f"Barrendero: Se han cancelado {len(expired_appts)} citas expiradas.")
            
    except Exception as e:
        db.rollback()
        logger.error(f"Error en la tarea de limpieza: {e}")
    finally:
        db.close()

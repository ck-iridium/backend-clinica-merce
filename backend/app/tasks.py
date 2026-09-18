from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from . import models, database
import logging

logger = logging.getLogger(__name__)

def cleanup_expired_appointments():
    """
    Busca citas en estado 'pending_verification', 'awaiting_payment' o 'web_pending'
    que lleven más de 10 minutos sin ser confirmadas y las cancela para liberar el hueco.
    Usa UTC para comparar con created_at (que Supabase guarda en UTC).
    """
    db: Session = database.SessionLocal()
    try:
        limit_time = datetime.utcnow() - timedelta(minutes=10)
        
        expired_appts = db.query(models.Appointment).filter(
            models.Appointment.status.in_(["pending_verification", "awaiting_payment", "web_pending"]),
            models.Appointment.created_at < limit_time
        ).all()
        
        for appt in expired_appts:
            old_status = appt.status
            appt.status = "cancelled"
            if old_status == "pending_verification":
                reason = "código OTP no introducido en el tiempo límite (10 min)"
            elif old_status == "awaiting_payment":
                reason = "tiempo de fianza expirado sin pago (10 min)"
            else:
                reason = "reserva pendiente expirada (10 min)"

            appt.notes = (appt.notes or "") + f"\n[Sistema] Cita cancelada automáticamente: {reason}."
            
            # Limpiar códigos de verificación asociados
            db.query(models.VerificationCode).filter(
                models.VerificationCode.appointment_id == appt.id
            ).delete()
            
            logger.info(f"Cita {appt.id} ({old_status}) cancelada automáticamente (expirada tras 10 min).")
            
        if expired_appts:
            db.commit()
            print(f"Barrendero: Se han cancelado {len(expired_appts)} citas expiradas tras 10 minutos.")
            
        return len(expired_appts)
            
    except Exception as e:
        db.rollback()
        logger.error(f"Error en la tarea de limpieza: {e}")
        return 0
    finally:
        db.close()

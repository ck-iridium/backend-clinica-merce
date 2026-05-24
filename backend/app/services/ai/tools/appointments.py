import logging
from .... import models, schemas
from ....database import SessionLocal, current_tenant_var

logger = logging.getLogger("ai_agent_tools_appointments")

def get_daily_appointments() -> str:
    """
    Obtiene la lista completa de todas las citas agendadas para el día de hoy en la clínica,
    incluyendo la hora, el nombre del cliente, el servicio a realizar y el especialista asignado.
    """
    db = SessionLocal()
    try:
        tenant_id = current_tenant_var.get()
        if not tenant_id:
            return "Error: No se ha podido resolver el identificador del inquilino (tenant_id)."

        from datetime import date
        today = date.today()

        appointments = db.query(models.Appointment).filter(
            models.Appointment.tenant_id == tenant_id,
            models.Appointment.status != "cancelled"
        ).all()

        today_appointments = []
        for appt in appointments:
            if appt.start_time and appt.start_time.date() == today:
                today_appointments.append(appt)

        if not today_appointments:
            return "No hay ninguna cita programada para el día de hoy."

        today_appointments.sort(key=lambda x: x.start_time)

        result = [f"Citas programadas para hoy ({today.strftime('%d/%m/%Y')}):"]
        for appt in today_appointments:
            time_str = appt.start_time.strftime("%H:%M")
            client_name = f"{appt.client_first_name or ''} {appt.client_last_name or ''}".strip() or "Cliente Sin Nombre"
            service_name = appt.service.name if appt.service else "Servicio no especificado"
            specialist_name = appt.specialist.name if appt.specialist else "Cualquiera"

            result.append(f"- {time_str} hs: {client_name} - Tratamiento: {service_name} (Especialista: {specialist_name})")

        return "\n".join(result)
    except Exception as e:
        logger.error(f"Error al consultar citas diarias para tenant {current_tenant_var.get()}: {e}")
        return f"Error al consultar la agenda: {str(e)}"
    finally:
        db.close()

import logging
import json
import urllib.request
import os
from .. import models

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def send_email(to_email: str, subject: str, body_html: str):
    """
    Envía un correo electrónico usando la API de Resend.
    """
    api_key = os.environ.get("RESEND_API_KEY")
    if not api_key:
        logger.error("❌ ERROR: RESEND_API_KEY no encontrada en el entorno.")
        return False

    # Debug: Mostrar destino (anonimizado para seguridad)
    display_email = f"{to_email[:3]}***@{to_email.split('@')[-1]}" if '@' in to_email else to_email
    logger.info(f"📤 Intentando enviar email a: {display_email} vía Resend...")

    try:
        url = "https://api.resend.com/emails"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        data = {
            "from": "Merce Estética <info@esteticamerce.com>",
            "to": [to_email],
            "subject": subject,
            "html": body_html
        }

        req = urllib.request.Request(
            url, 
            data=json.dumps(data).encode('utf-8'), 
            headers=headers, 
            method="POST"
        )
        
        with urllib.request.urlopen(req, timeout=10) as response:
            if response.status in [200, 201]:
                logger.info(f"✅ Email enviado con éxito a {to_email}")
                return True
            else:
                logger.error(f"⚠️ Resend API devolvió status: {response.status}")
                return False
                
    except Exception as e:
        # Silenciamos el error para que la aplicación no se bloquee ni la reserva falle
        logger.error(f"❌ Fallo al enviar email vía Resend: {str(e)}")
        return False

def send_appointment_notification(appointment_id: str, type: str):
    """
    Gestiona las notificaciones de citas (Cliente + Clínica).
    Ejecutar siempre en segundo plano (BackgroundTasks).
    """
    from ..database import SessionLocal
    db = SessionLocal()
    try:
        appointment = db.query(models.Appointment).filter(models.Appointment.id == appointment_id).first()
        if not appointment:
            logger.error(f"Cita {appointment_id} no encontrada.")
            return

        settings = db.query(models.ClinicSettings).first()
        service = appointment.service
        client = appointment.client
        
        date_str = appointment.start_time.strftime("%d/%m/%Y")
        time_str = appointment.start_time.strftime("%H:%M")
        
        if type == 'new_web_booking':
            # Flujo A: Aviso al Administrador de nueva reserva (Email dinámico desde Ajustes)
            admin_email = settings.clinic_email
            
            if not admin_email:
                logger.warning("⚠️ No se puede enviar aviso a admin: 'Email de la Clínica' no configurado en Ajustes.")
            else:
                subject_admin = f"NUEVA CITA WEB: {client.name}"
                body_admin = f"""
                <html>
                    <body>
                        <h2 style="color: #d9777f;">Nueva reserva desde la Web</h2>
                        <p>Merce, tienes una solicitud nueva:</p>
                        <ul>
                            <li><strong>Cliente:</strong> {client.name}</li>
                            <li><strong>Tratamiento:</strong> {service.name}</li>
                            <li><strong>Fecha:</strong> {date_str}</li>
                            <li><strong>Hora:</strong> {time_str}</li>
                            <li><strong>Teléfono:</strong> {client.phone}</li>
                        </ul>
                        <p>Accede al panel de control para confirmarla.</p>
                    </body>
                </html>
                """
                send_email(admin_email, subject_admin, body_admin)

        elif type == 'confirmation':
            # Flujo B: Notificación de confirmación al Email real del cliente
            if not client.email:
                logger.warning(f"⚠️ El cliente {client.name} no tiene email registrado. No se puede enviar confirmación.")
            else:
                subject_client = "Cita Confirmada - Merce Estética"
                body_client = f"Hola {client.name}, tu cita para {service.name} el día {date_str} a las {time_str} ha sido confirmada. ¡Te esperamos!"
                
                send_email(client.email, subject_client, f"<html><body><p>{body_client}</p></body></html>")
            
    except Exception as e:
        logger.error(f"Error en flujo de notificación: {str(e)}")
    finally:
        db.close()

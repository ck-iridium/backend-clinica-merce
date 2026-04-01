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
    Envía un correo electrónico usando exclusivamente la API de Resend (Puerto 443 HTTP).
    Este método evita los bloqueos de puertos SMTP en servicios como Render.
    """
    api_key = os.getenv("RESEND_API_KEY")
    if not api_key:
        logger.error("❌ ERROR: RESEND_API_KEY no configurada. El email no se enviará.")
        return False

    try:
        url = "https://api.resend.com/emails"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        # El remitente debe ser un dominio verificado en Resend o el por defecto de su sandbox (onboarding@resend.dev)
        data = {
            "from": "Clínica Merce <onboarding@resend.dev>",
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
        
        with urllib.request.urlopen(req, timeout=8) as response:
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
            # Flujo A: Aviso al Administrador de nueva reserva
            admin_email = "iridium_cop@hotmail.com"
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
            # Flujo B: Notificación de que la cita ha sido confirmada
            subject_client = "Cita Confirmada - Merce Estética"
            body_client = f"Hola {client.name}, tu cita para {service.name} el día {date_str} a las {time_str} ha sido confirmada. ¡Te esperamos!"
            
            # --- NOTA IMPORTANTE (RESEND SANDBOX) ---
            # Mientras el dominio no esté verificado en Resend ("onboarding@resend.dev"),
            # la API solo permite enviar correos a la dirección con la que creaste tu cuenta de Resend.
            # Cambia esta variable por tu correo o 'iridium_cop@hotmail.com' para probarlo.
            # Cuando verifiques el dominio, cambia esto de nuevo a: client.email
            test_client_email = "iridium_cop@hotmail.com" 
            
            send_email(test_client_email, subject_client, f"<html><body><p>{body_client}</p></body></html>")
            
    except Exception as e:
        logger.error(f"Error en flujo de notificación: {str(e)}")
    finally:
        db.close()

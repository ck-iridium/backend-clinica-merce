import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from sqlalchemy.orm import Session
from .. import models
import logging

# Configurar logging básico
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_smtp_settings(db: Session):
    return db.query(models.ClinicSettings).first()

def send_email(to_email: str, subject: str, body_html: str):
    from ..database import SessionLocal
    db = SessionLocal()
    try:
        settings = db.query(models.ClinicSettings).first()
        if not settings or not settings.smtp_host or not settings.smtp_user or not settings.smtp_password:
            logger.warning("SMTP no configurado. El email para %s no se enviará.", to_email)
            return False

        msg = MIMEMultipart()
        msg['From'] = f"{settings.clinic_name} <{settings.smtp_from_email or settings.smtp_user}>"
        msg['To'] = to_email
        msg['Subject'] = subject

        msg.attach(MIMEText(body_html, 'html'))

        server = smtplib.SMTP(settings.smtp_host, settings.smtp_port or 587, timeout=5)
        if settings.smtp_use_tls:
            server.starttls()
        
        server.login(settings.smtp_user, settings.smtp_password)
        server.send_message(msg)
        server.quit()
        logger.info("Email enviado correctamente a %s", to_email)
        return True
    except Exception as e:
        logger.error("Error enviando email a %s: %s", to_email, str(e))
        return False
    finally:
        db.close()

def send_appointment_notification(appointment_id: str, type: str):
    """
    Envía notificaciones de cita. 
    Types: 'new_web_booking' (Aviso a clínica + copia cliente), 'confirmation' (Confirmación al cliente)
    """
    from ..database import SessionLocal
    db = SessionLocal()
    try:
        appointment = db.query(models.Appointment).filter(models.Appointment.id == appointment_id).first()
        if not appointment:
            logger.error(f"No se encontró la cita {appointment_id} para enviar notificación.")
            return

        settings = db.query(models.ClinicSettings).first()
        service = appointment.service
        client = appointment.client
        
        date_str = appointment.start_time.strftime("%d/%m/%Y")
        time_str = appointment.start_time.strftime("%H:%M")
        
        if type == 'new_web_booking':
            # 1. Email al Cliente (Copia de cortesía)
            subject_client = f"Solicitud de Cita Recibida - {settings.clinic_name}"
            body_client = f"""
            <html>
            <body style="font-family: sans-serif; color: #333;">
                <h2 style="color: #d9777f;">¡Hola {client.name}!</h2>
                <p>Hemos recibido tu solicitud de cita en <strong>Merce Estética</strong>.</p>
                <p><strong>Detalles de la solicitud:</strong></p>
                <ul>
                    <li><strong>Tratamiento:</strong> {service.name}</li>
                    <li><strong>Fecha:</strong> {date_str}</li>
                    <li><strong>Hora:</strong> {time_str}</li>
                </ul>
                <p>Tu cita está pendiente de confirmación. En breve nos pondremos en contacto contigo o recibirás un email de confirmación final.</p>
                <p>¡Gracias por confiar en nosotros!</p>
                <hr>
                <p style="font-size: 12px; color: #999;">Merce Estética - {settings.clinic_address}</p>
            </body>
            </html>
            """
            send_email(client.email, subject_client, body_client)

            # 2. Email a la Clínica (Aviso interno)
            if settings.clinic_email:
                subject_clinic = f"Nueva Cita Web Pendiente: {client.name}"
                body_clinic = f"""
                <html>
                <body style="font-family: sans-serif;">
                    <h2>Nueva reserva desde la Web</h2>
                    <p>El cliente <strong>{client.name}</strong> ha solicitado una cita:</p>
                    <ul>
                        <li><strong>Servicio:</strong> {service.name}</li>
                        <li><strong>Fecha:</strong> {date_str}</li>
                        <li><strong>Hora:</strong> {time_str}</li>
                        <li><strong>Teléfono:</strong> {client.phone}</li>
                        <li><strong>Email:</strong> {client.email}</li>
                    </ul>
                    <p>Accede al panel para confirmarla.</p>
                </body>
                </html>
                """
                send_email(settings.clinic_email, subject_clinic, body_clinic)

        elif type == 'confirmation':
            subject = f"Cita Confirmada - Merce Estética"
            body = f"""
            <html>
            <body style="font-family: sans-serif; color: #333;">
                <h2 style="color: #d9777f;">¡Cita Confirmada!</h2>
                <p>Hola {client.name}, te confirmamos que tu cita ha sido validada correctamente.</p>
                <p><strong>Detalles de tu cita:</strong></p>
                <div style="background: #fdf2f3; padding: 20px; border-radius: 10px; border: 1px solid #f3c7cb;">
                    <p style="margin: 0;"><strong>Tratamiento:</strong> {service.name}</p>
                    <p style="margin: 0;"><strong>Fecha:</strong> {date_str}</p>
                    <p style="margin: 0;"><strong>Hora:</strong> {time_str}</p>
                </div>
                <p>Te esperamos en <strong>Merce Estética</strong>. Si necesitas cancelar o modificar la hora, por favor avísanos con antelación.</p>
                <p>¡Muchas gracias!</p>
                <br>
                <p><strong>Merce</strong></p>
                <p style="font-size: 12px; color: #999;">{settings.clinic_address} | {settings.clinic_phone}</p>
            </body>
            </html>
            """
            send_email(client.email, subject, body)
    finally:
        db.close()

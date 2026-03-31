import logging
import json
import urllib.request
import os

# Configurar logging básico
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_smtp_settings(db: Session):
    return db.query(models.ClinicSettings).first()

def send_email_resend(to_email: str, subject: str, body_html: str):
    """Plan B: Envío vía API de Resend (Puerto 443 HTTP)"""
    api_key = os.getenv("RESEND_API_KEY")
    if not api_key:
        logger.error("No se puede usar Resend: RESEND_API_KEY no configurada en variables de entorno.")
        return False

    try:
        url = "https://api.resend.com/emails"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        data = {
            "from": "Clinica Merce <onboarding@resend.dev>", # Cambiar por dominio verificado en Resend
            "to": [to_email],
            "subject": subject,
            "html": body_html
        }

        req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers=headers, method="POST")
        with urllib.request.urlopen(req, timeout=10) as response:
            if response.status in [200, 201]:
                logger.info("Email enviado vía Resend (API) correctamente a %s", to_email)
                return True
            else:
                logger.error("Error en Resend API: Status %s", response.status)
                return False
    except Exception as e:
        logger.error("Fallo crítico en Plan B (Resend): %s", str(e))
        return False

def send_email(to_email: str, subject: str, body_html: str):
    """Mailer Robusto: Intenta SMTP y si falla, Plan B (Resend)"""
    from ..database import SessionLocal
    import smtplib # Importar aquí para asegurar disponibilidad
    db = SessionLocal()
    try:
        settings = db.query(models.ClinicSettings).first()
        if not settings:
            logger.error("No hay ajustes en la DB. Abortando envío.")
            return False

        # Si no hay SMTP configurado, intentamos directamente el Plan B
        if not settings.smtp_host or not settings.smtp_user:
            logger.warning("SMTP no configurado (host/user vacío). Intentando Plan B (Resend)...")
            return send_email_resend(to_email, subject, body_html)

        try:
            msg = MIMEMultipart()
            msg['From'] = f"{settings.clinic_name} <{settings.smtp_from_email or settings.smtp_user}>"
            msg['To'] = to_email
            msg['Subject'] = subject
            msg.attach(MIMEText(body_html, 'html'))

            # Lógica de puerto
            if settings.smtp_port == 465:
                logger.info("Intentando conexión SMTP_SSL por puerto 465...")
                server = smtplib.SMTP_SSL(settings.smtp_host, settings.smtp_port, timeout=5)
            else:
                port = settings.smtp_port or 587
                logger.info("Intentando conexión SMTP por puerto %s...", port)
                server = smtplib.SMTP(settings.smtp_host, port, timeout=5)
                if settings.smtp_use_tls:
                    server.starttls()
            
            server.login(settings.smtp_user, settings.smtp_password)
            server.send_message(msg)
            server.quit()
            logger.info("Email enviado vía SMTP correctamente a %s", to_email)
            return True

        except (smtplib.SMTPException, ConnectionError, TimeoutError) as smtp_err:
            logger.error("⚠️ Error de Red SMTP detectado (¿Puerto bloqueado?): %s", str(smtp_err))
            logger.info("Iniciando Plan B (Resend) como respaldo...")
            return send_email_resend(to_email, subject, body_html)

    except Exception as e:
        logger.error("Error inesperado en Mailer: %s", str(e))
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
            # Prioridad: Email de soporte Merce > clinic_email > smtp_user (Gmail de Merce)
            clinic_support_email = "iridium_cop@hotmail.com"
            target_clinic_email = settings.clinic_email or settings.smtp_user
            
            if target_clinic_email:
                subject_clinic = f"Nueva Cita Web Pendiente: {client.name}"
                body_clinic = f"""
                <html>
                <body style="font-family: sans-serif;">
                    <h2 style="color: #d9777f;">Nueva reserva desde la Web</h2>
                    <p>Merce, tienes una nueva solicitud de cita:</p>
                    <ul>
                        <li><strong>Cliente:</strong> {client.name}</li>
                        <li><strong>Servicio:</strong> {service.name}</li>
                        <li><strong>Fecha:</strong> {date_str}</li>
                        <li><strong>Hora:</strong> {time_str}</li>
                        <li><strong>Teléfono:</strong> {client.phone}</li>
                    </ul>
                    <p>Recuerda revisarla en tu panel de control.</p>
                </body>
                </html>
                """
                send_email(target_clinic_email, subject_clinic, body_clinic)
            
            # Siempre enviamos copia a Iridium para asegurar que Merce se entere
            if clinic_support_email and clinic_support_email != target_clinic_email:
                send_email(clinic_support_email, f"COPIA: {client.name} - Nueva Cita Web", body_clinic)

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

import logging
import json
import urllib.request
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from .. import models

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def send_email(to_email: str, subject: str, body_html: str, settings=None):
    """
    Envía un correo electrónico usando la API de Resend o SMTP como fallback.
    """
    # 1. Prioridad: Resend API si existe la KEY
    api_key = os.environ.get("RESEND_API_KEY", "").strip()
    sender_name = settings.clinic_name if settings and settings.clinic_name else "Clínica"
    
    from_email = os.environ.get("FROM_EMAIL") or os.environ.get("SMTP_FROM_EMAIL") or "notifications@probookia.com"
    
    if api_key:
        try:
            url = "https://api.resend.com/emails"
            headers = {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
                "User-Agent": "python-urllib/3.10"
            }
            
            data = {
                "from": f"{sender_name} <{from_email}>",
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
            
            with urllib.request.urlopen(req, timeout=12) as response:
                if response.status in [200, 201]:
                    logger.info(f"✅ Email enviado vía Resend a {to_email}")
                    return True
                return False
        except Exception as e:
            logger.warning(f"⚠️ Resend falló, intentando SMTP: {str(e)}")

    # 2. Fallback: SMTP (Gmail u otros)
    try:
        # Cargamos configuración de DB si no se pasa por parámetro
        if not settings:
            from ..database import SessionLocal, current_tenant_var
            db = SessionLocal()
            settings = db.query(models.ClinicSettings).filter(models.ClinicSettings.tenant_id == current_tenant_var.get()).first()
            db.close()

        # Variables desde .env con fallback a la base de datos
        smtp_host = os.environ.get("SMTP_HOST") or (settings.smtp_host if settings else "smtp.gmail.com")
        smtp_port = int(os.environ.get("SMTP_PORT") or (settings.smtp_port if settings else 587))
        smtp_user = os.environ.get("SMTP_USER") or (settings.smtp_user if settings else None)
        smtp_password = os.environ.get("SMTP_PASSWORD") or (settings.smtp_password if settings else None)
        smtp_from = os.environ.get("SMTP_FROM_EMAIL") or (settings.smtp_from_email if settings else smtp_user)
        use_tls = os.environ.get("SMTP_USE_TLS", "True").lower() == "true"

        if not smtp_user or not smtp_password:
            logger.error("❌ Fallo crítico: No hay credenciales SMTP configuradas.")
            return False

        msg = MIMEMultipart("alternative")
        msg['Subject'] = subject
        msg['From'] = f"{sender_name} <{smtp_from}>"
        msg['To'] = to_email
        msg.attach(MIMEText(body_html, 'html'))

        # Conexión SMTP
        server = smtplib.SMTP(smtp_host, smtp_port, timeout=15)
        if use_tls:
            server.starttls()
        
        server.login(smtp_user, smtp_password)
        server.sendmail(smtp_from, to_email, msg.as_string())
        server.quit()
        
        logger.info(f"✅ Email enviado vía SMTP a {to_email}")
        return True
    except Exception as e:
        logger.error(f"❌ ERROR TOTAL EN MAILER: {str(e)}")
        return False

def get_html_template(content_html, clinic_name, clinic_phone, subtitle="ProBookia", footer_text=None):
    """Plantilla base para correos corporativos de ProBookia"""
    footer_content = footer_text or f"Este es un mensaje automático de <b>{clinic_name}</b> en ProBookia.<br>Cualquier duda, contáctanos en el <b>{clinic_phone}</b>."
    return f"""
    <html>
    <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #fcfaf9;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #fcfaf9;">
            <tr>
                <td align="center" style="padding: 40px 0;">
                    <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04); border: 1px solid #f0eeeb;">
                        <!-- Header -->
                        <tr>
                            <td align="center" style="padding: 36px 0; background-color: #faf9f7; border-bottom: 1px solid #f0eeeb;">
                                <h1 style="margin: 0; color: #1c1917; font-size: 26px; letter-spacing: -0.5px; font-weight: 800;">{clinic_name}</h1>
                                <p style="margin: 6px 0 0 0; color: #a8a29e; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px;">{subtitle}</p>
                            </td>
                        </tr>
                        <!-- Content -->
                        <tr>
                            <td style="padding: 44px 40px;">
                                {content_html}
                            </td>
                        </tr>
                        <!-- Footer -->
                        <tr>
                            <td align="center" style="padding: 24px 30px; background-color: #faf9f7; border-top: 1px solid #f0eeeb;">
                                <p style="margin: 0; color: #a8a29e; font-size: 12px; line-height: 1.6;">
                                    {footer_content}
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    """

def send_appointment_notification(appointment_id: str, type: str, otp_code: str = None):
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

        settings = db.query(models.ClinicSettings).filter(models.ClinicSettings.tenant_id == appointment.tenant_id).first()
        
        frontend_url = os.environ.get("FRONTEND_URL")
        if not frontend_url:
            # Si estamos en Render, usar el dominio de producción
            if os.environ.get("RENDER") == "true":
                frontend_url = "https://www.esteticamerce.com"
            else:
                frontend_url = "http://localhost:3000"
        frontend_url = frontend_url.rstrip('/')
        clinic_name = settings.clinic_name
        service = appointment.service
        client = appointment.client
        
        date_str = appointment.start_time.strftime("%d/%m/%Y")
        time_str = appointment.start_time.strftime("%H:%M")
        
        # Resolver Ubicación / Sede
        location = appointment.location
        if not location and appointment.location_id:
            location = db.query(models.Location).filter(models.Location.id == appointment.location_id).first()
            
        loc_name = location.name if location else (settings.clinic_name if settings else "Centro")
        loc_address = location.address if location else (settings.clinic_address if settings else "")
        
        location_card_html = f"""
        <div style="margin-top: 15px; padding-top: 15px; border-top: 1px dashed #f9e1e3; text-align: center;">
            <p style="margin: 0; color: #d9777f; font-weight: bold; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">UBICACIÓN / SEDE</p>
            <p style="margin: 6px 0 2px 0; font-size: 15px; color: #5c4d4f; font-weight: 700;">📍 {loc_name}</p>
            {f'<p style="margin: 2px 0 0 0; color: #887a7c; font-size: 13px;">{loc_address}</p>' if loc_address else ''}
        </div>
        """
        
        if type == 'new_web_booking':
            # Flujo A: Aviso al Administrador (Estilo Profesional)
            admin_email = settings.clinic_email
            if admin_email:
                subject = f"🔔 Nueva Solicitud: {client.name}"
                content = f"""
                <h3 style="color: #444; margin-bottom: 20px;">¡Tienes una nueva solicitud web!</h3>
                <div style="background-color: #fdf2f3; border-radius: 16px; padding: 25px; border: 1px solid #f9e1e3;">
                    <p style="margin: 0 0 10px 0; color: #d9777f; font-weight: bold; font-size: 13px;">DETALLES DE LA CLIENTA</p>
                    <p style="margin: 0; font-size: 18px; color: #5c4d4f; font-weight: 700;">{client.name}</p>
                    <p style="margin: 5px 0 0 0; color: #887a7c; font-size: 14px;">Teléfono: <b>{client.phone}</b></p>
                    
                    <div style="margin-top: 20px; padding-top: 20px; border-top: 1px dashed #f3c7cb;">
                        <p style="margin: 0; color: #5c4d4f; font-size: 15px;"><b>Tratamiento:</b> {service.name}</p>
                        <p style="margin: 5px 0 0 0; color: #5c4d4f; font-size: 15px;"><b>Horario:</b> {date_str} a las {time_str}</p>
                        <p style="margin: 5px 0 0 0; color: #5c4d4f; font-size: 15px;"><b>Sede:</b> {loc_name}{f" ({loc_address})" if loc_address else ""}</p>
                    </div>
                </div>
                <p style="margin-top: 30px; font-size: 14px; color: #887a7c; text-align: center;">Entra en la agenda para gestionar esta cita.</p>
                """
                send_email(admin_email, subject, get_html_template(content, clinic_name, settings.clinic_phone), settings=settings)
                
        elif type == 'verification_email':
            if client.email:
                subject = f"Confirma tu cita en {clinic_name}"
                content = f"""
                <h2 style="color: #5c4d4f; margin-bottom: 5px;">¡Casi listos, {client.name}!</h2>
                <p style="color: #887a7c; font-size: 15px; line-height: 1.5; margin-bottom: 30px;">
                    Para completar tu reserva y bloquear tu hueco en la agenda, por favor haz clic en el siguiente botón:
                </p>
                
                <div style="background-color: #ffffff; border: 2px solid #fdf2f3; border-radius: 20px; padding: 30px; text-align: center;">
                    <p style="margin: 0; color: #d9777f; font-weight: bold; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Detalles de la Cita</p>
                    <p style="margin: 15px 0 5px 0; font-size: 22px; color: #5c4d4f; font-weight: 800;">{date_str}</p>
                    <p style="margin: 0; font-size: 16px; color: #5c4d4f; font-weight: 600;">a las {time_str}</p>
                    <div style="display: inline-block; background-color: #fdf2f3; color: #d9777f; padding: 8px 16px; border-radius: 10px; margin-top: 20px; font-weight: bold; font-size: 14px;">
                        {service.name}
                    </div>
                    {location_card_html}
                </div>
                
                <div style="margin-top: 35px; text-align: center;">
                    <a href="{frontend_url}/reservar/verificar?id={appointment.id}" style="display: inline-block; background-color: #d9777f; color: #ffffff; text-decoration: none; padding: 14px 28px; font-weight: bold; border-radius: 12px; font-size: 16px; box-shadow: 0 4px 15px rgba(217,119,127,0.3);">
                        Confirmar mi cita ahora
                    </a>
                    <p style="margin: 15px 0 0 0; color: #a49697; font-size: 12px;">Tienes 30 minutos para confirmar. Si no lo haces, el hueco quedará libre.</p>
                </div>
                """
                verify_url = f"{frontend_url}/reservar/verificar?id={appointment.id}"
                print("\n" + "="*60)
                print(f"🆔 CONFIRMACIÓN DE CITA PARA: {client.name}")
                print(f"🔗 URL: {verify_url}")
                print("="*60 + "\n")
        elif type == 'otp_verification':
            target_to = (client.email if client else None)
            print(f"[MAILER_OTP] Despachando notificación OTP '{otp_code}' a cliente: {target_to} (Cita: {appointment_id})", flush=True)
            if target_to and otp_code:
                subject = f"{otp_code} es tu código de confirmación en {clinic_name}"
                content = f"""
                <h2 style="color: #5c4d4f; margin-bottom: 5px;">¡Hola, {client.name}!</h2>
                <p style="color: #887a7c; font-size: 15px; line-height: 1.5; margin-bottom: 25px;">
                    Introduce el siguiente código numérico en la pantalla para confirmar tu cita. Este paso solo te lo pediremos en tu primera reserva:
                </p>
                
                <div style="background-color: #ffffff; border: 2px solid #fdf2f3; border-radius: 20px; padding: 25px 20px; text-align: center; margin-bottom: 25px;">
                    <p style="margin: 0; color: #a49697; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px;">CÓDIGO DE VERIFICACIÓN</p>
                    <p style="margin: 10px 0 0 0; font-size: 38px; color: #1c1917; font-weight: 800; letter-spacing: 8px; font-family: monospace;">{otp_code}</p>
                </div>
                
                <p style="margin: 0; color: #a49697; font-size: 12px; text-align: center;">El código caduca en 10 minutos. No lo compartas con nadie.</p>
                """
                sent_ok = send_email(target_to, subject, get_html_template(content, clinic_name, settings.clinic_phone), settings=settings)
                print(f"[MAILER_OTP] Resultado de envío a {target_to}: {sent_ok}", flush=True)
            else:
                print(f"[MAILER_OTP_ERROR] No se pudo enviar OTP: target_to={target_to}, otp_code={otp_code}", flush=True)

        elif type == 'confirmation':
            # Flujo B: Confirmación al Cliente (Estilo Premium) con enlace de cancelación
            if client.email:
                subject = f"✨ Tu cita en {clinic_name} está confirmada"
                content = f"""
                <h2 style="color: #5c4d4f; margin-bottom: 5px;">¡Hola, {client.name}!</h2>
                <p style="color: #887a7c; font-size: 15px; line-height: 1.5; margin-bottom: 30px;">Nos alegra confirmarte que tu reserva ya ha sido procesada correctamente. ¡Estamos deseando verte!</p>
                
                <div style="background-color: #ffffff; border: 2px solid #fdf2f3; border-radius: 20px; padding: 30px; text-align: center;">
                    <p style="margin: 0; color: #d9777f; font-weight: bold; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Detalles de la Cita</p>
                    <p style="margin: 15px 0 5px 0; font-size: 22px; color: #5c4d4f; font-weight: 800;">{date_str}</p>
                    <p style="margin: 0; font-size: 16px; color: #5c4d4f; font-weight: 600;">a las {time_str}</p>
                    <div style="display: inline-block; background-color: #fdf2f3; color: #d9777f; padding: 8px 16px; border-radius: 10px; margin-top: 20px; font-weight: bold; font-size: 14px;">
                        {service.name}
                    </div>
                    {location_card_html}
                </div>
                
                <div style="margin-top: 35px; text-align: center; border-top: 1px solid #f3e8e9; padding-top: 25px;">
                    <p style="margin: 0; color: #a49697; font-size: 13px; margin-bottom: 10px;">Si necesitas hacer algún cambio, llámanos lo antes posible o cancela tu cita online:</p>
                    <a href="{frontend_url}/reservar/cancelar?id={appointment.id}" style="display: inline-block; border: 1px solid #d9777f; color: #d9777f; text-decoration: none; padding: 8px 16px; font-weight: bold; border-radius: 8px; font-size: 13px;">Cancelar mi cita</a>
                </div>
                """
                send_email(client.email, subject, get_html_template(content, clinic_name, settings.clinic_phone), settings=settings)
        
        elif type == 'reminder':
            # Flujo C: Recordatorio 24h
            if client.email:
                subject = f"⏰ Recordatorio de cita mañana en {clinic_name}"
                content = f"""
                <h2 style="color: #5c4d4f; margin-bottom: 5px;">¡Hola, {client.name}!</h2>
                <p style="color: #887a7c; font-size: 15px; line-height: 1.5; margin-bottom: 30px;">Te escribimos para recordarte que tienes una cita con nosotros el día de mañana.</p>
                
                <div style="background-color: #ffffff; border: 2px solid #fdf2f3; border-radius: 20px; padding: 30px; text-align: center;">
                    <p style="margin: 0; color: #d9777f; font-weight: bold; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Detalles de la Cita</p>
                    <p style="margin: 15px 0 5px 0; font-size: 22px; color: #5c4d4f; font-weight: 800;">{date_str}</p>
                    <p style="margin: 0; font-size: 16px; color: #5c4d4f; font-weight: 600;">a las {time_str}</p>
                    <div style="display: inline-block; background-color: #fdf2f3; color: #d9777f; padding: 8px 16px; border-radius: 10px; margin-top: 20px; font-weight: bold; font-size: 14px;">
                        {service.name}
                    </div>
                    {location_card_html}
                </div>
                
                <div style="margin-top: 35px; text-align: center; border-top: 1px solid #f3e8e9; padding-top: 25px;">
                    <p style="margin: 0; color: #a49697; font-size: 13px; margin-bottom: 10px;">Si por algún motivo no puedes asistir, te pedimos que la canceles para liberar el hueco:</p>
                    <a href="{frontend_url}/reservar/cancelar?id={appointment.id}" style="display: inline-block; border: 1px solid #d9777f; color: #d9777f; text-decoration: none; padding: 8px 16px; font-weight: bold; border-radius: 8px; font-size: 13px;">Cancelar mi cita</a>
                </div>
                """
                send_email(client.email, subject, get_html_template(content, clinic_name, settings.clinic_phone), settings=settings)
                
        elif type == 'cancelled_by_client':
            # Flujo D: Aviso de cancelación para Admin
            admin_email = settings.clinic_email
            if admin_email:
                subject = f"❌ Cita Cancelada: {client.name}"
                whatsapp_url = f"https://wa.me/{client.phone.replace(' ', '').replace('+', '')}?text=Hola%20{client.name.split(' ')[0]},%20he%20visto%20que%20has%20cancelado%20tu%20cita%20para%20{service.name}%20del%20día%20{date_str}.%20¿Te%20puedo%20ayudar%20a%20buscar%20otro%20hueco?"
                
                content = f"""
                <h3 style="color: #444; margin-bottom: 20px;">Una clienta ha cancelado su cita.</h3>
                <div style="background-color: #fff9fa; border-radius: 16px; padding: 25px; border: 1px solid #fde7e9;">
                    <p style="margin: 0 0 10px 0; color: #dc2626; font-weight: bold; font-size: 13px;">CITA CANCELADA AUTOMÁTICAMENTE</p>
                    <p style="margin: 0; font-size: 18px; color: #5c4d4f; font-weight: 700;">{client.name}</p>
                    <p style="margin: 5px 0 0 0; color: #887a7c; font-size: 14px;">Teléfono: <b>{client.phone}</b></p>
                    
                    <div style="margin-top: 20px; padding-top: 20px; border-top: 1px dashed #f3c7cb;">
                        <p style="margin: 0; color: #5c4d4f; font-size: 15px;"><b>Tratamiento:</b> <del>{service.name}</del></p>
                        <p style="margin: 5px 0 0 0; color: #5c4d4f; font-size: 15px;"><b>Horario que ha quedado libre:</b> {date_str} a las {time_str}</p>
                    </div>
                </div>
                <p style="margin-top: 30px; font-size: 14px; color: #887a7c; text-align: center; margin-bottom: 15px;">¿Quieres enviarle un WhatsApp para reagendar?</p>
                <div style="text-align: center;">
                    <a href="{whatsapp_url}" style="display: inline-block; background-color: #25D366; color: white; text-decoration: none; padding: 12px 24px; font-weight: bold; border-radius: 10px; font-size: 15px;">📲 Hablar por WhatsApp</a>
                </div>
                """
                send_email(admin_email, subject, get_html_template(content, clinic_name, settings.clinic_phone), settings=settings)

            
    except Exception as e:
        logger.error(f"Error en flujo de notificación: {str(e)}")
    finally:
        db.close()


def send_team_invitation_email(
    to_email: str, 
    full_name: str, 
    role: str, 
    clinic_name: str, 
    invite_url: str, 
    settings=None, 
    lang: str = "es", 
    is_new_user: bool = False
):
    """
    Envía un correo de invitación formal de equipo con estética Quiet Luxury
    en el idioma correspondiente (es, fr, en).
    """
    clean_lang = (lang or "es").strip().lower()
    if clean_lang not in ["es", "fr", "en"]:
        clean_lang = "es"

    TRANSLATIONS = {
        "es": {
            "subject": f"Invitación para unirte al equipo de {clinic_name} en ProBookia",
            "greeting": f"Hola, {full_name}:",
            "intro": f"Has sido invitado a formar parte del equipo profesional de <strong>{clinic_name}</strong> en ProBookia con el rol de:",
            "role_badge": "Rol Asignado",
            "body_new": "Para activar tu perfil y configurar tu contraseña de acceso para este negocio, pulsa el botón a continuación:",
            "body_existing": "Como ya dispones de una cuenta en ProBookia, solo necesitas confirmar esta invitación para activar tu perfil y acceder al panel de gestión de este negocio.",
            "btn_new": "Activar Cuenta y Aceptar",
            "btn_existing": "Aceptar Invitación",
            "disclaimer": "Si no reconoces este negocio o crees que se trata de un error, puedes ignorar este mensaje con total tranquilidad. Tu cuenta no será vinculada sin tu aprobación.",
            "subtitle": "Gestión y Agenda Profesional",
            "footer": f"Este es un mensaje automático de <b>{clinic_name}</b> en ProBookia.<br>Si tienes dudas, contáctanos en el soporte de tu centro."
        },
        "fr": {
            "subject": f"Invitation à rejoindre l'équipe de {clinic_name} sur ProBookia",
            "greeting": f"Bonjour {full_name},",
            "intro": f"Vous avez été invité(e) à rejoindre l'équipe professionnelle de <strong>{clinic_name}</strong> sur ProBookia avec le rôle de :",
            "role_badge": "Rôle Attribué",
            "body_new": "Pour activer votre profil et définir votre mot de passe pour cet établissement, veuillez cliquer sur le bouton ci-dessous :",
            "body_existing": "Comme vous possédez déjà un compte sur ProBookia, il vous suffit de confirmer cette invitation pour activer votre profil et accéder à cet établissement.",
            "btn_new": "Activer mon compte et accepter",
            "btn_existing": "Accepter l'invitation",
            "disclaimer": "Si vous ne reconnaissez pas cet établissement ou s'il s'agit d'une erreur, vous pouvez ignorer ce message en toute sécurité. Votre compte ne sera pas lié sans votre accord.",
            "subtitle": "Gestion et Réservation Professionnelle",
            "footer": f"Ceci est un message automatique envoyé par <b>{clinic_name}</b> via ProBookia."
        },
        "en": {
            "subject": f"Invitation to join the team of {clinic_name} on ProBookia",
            "greeting": f"Hello {full_name},",
            "intro": f"You have been invited to join the professional team of <strong>{clinic_name}</strong> on ProBookia with the role of:",
            "role_badge": "Assigned Role",
            "body_new": "To activate your profile and set your password for this business, please click the button below:",
            "body_existing": "As you already have a ProBookia account, simply confirm this invitation to activate your profile and access this business.",
            "btn_new": "Activate Account & Accept",
            "btn_existing": "Accept Invitation",
            "disclaimer": "If you do not recognize this business or think this is an error, you can safely disregard this message. Your account will not be linked without your approval.",
            "subtitle": "Professional Scheduling & Management",
            "footer": f"This is an automated message from <b>{clinic_name}</b> via ProBookia."
        }
    }

    t = TRANSLATIONS[clean_lang]
    body_text = t["body_new"] if is_new_user else t["body_existing"]
    btn_text = t["btn_new"] if is_new_user else t["btn_existing"]

    content_html = f"""
    <div style="text-align: left; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1c1917;">
        <h2 style="margin: 0 0 16px 0; color: #1c1917; font-size: 22px; font-weight: 700; letter-spacing: -0.5px;">
            {t["greeting"]}
        </h2>
        <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #57534e;">
            {t["intro"]}
        </p>
        <div style="background-color: #f7f7f5; border: 1px solid #e7e5e4; border-radius: 16px; padding: 18px 24px; margin-bottom: 24px; text-align: center;">
            <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #a8a29e; display: block; margin-bottom: 4px;">{t["role_badge"]}</span>
            <span style="font-size: 20px; font-weight: 800; color: #1c1917;">{role}</span>
        </div>
        <p style="margin: 0 0 28px 0; font-size: 14px; line-height: 1.6; color: #57534e;">
            {body_text}
        </p>
        <div style="text-align: center; margin-bottom: 28px;">
            <a href="{invite_url}" style="display: inline-block; background-color: #1c1917; color: #ffffff; text-decoration: none; padding: 15px 34px; border-radius: 14px; font-size: 15px; font-weight: 700; letter-spacing: 0.5px; box-shadow: 0 4px 14px rgba(0,0,0,0.15);">
                {btn_text}
            </a>
        </div>
        <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #a8a29e; text-align: center;">
            {t["disclaimer"]}
        </p>
    </div>
    """

    clinic_phone = settings.clinic_phone if settings and settings.clinic_phone else "Soporte ProBookia"
    full_body = get_html_template(content_html, clinic_name, clinic_phone, subtitle=t["subtitle"], footer_text=t["footer"])
    return send_email(to_email, t["subject"], full_body, settings=settings)



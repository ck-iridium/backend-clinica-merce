from sqlalchemy.orm import Session
from .. import models
from ..database import current_tenant_var
import uuid
from datetime import datetime

def create_admin_notification(
    db: Session, 
    title: str, 
    description: str, 
    type: str = "info", 
    metadata: dict = None,
    tenant_id: str = None
):
    """
    Crea una notificación para todos los usuarios con rol de administrador o recepción DE UN TENANT ESPECÍFICO.
    Garantiza el aislamiento multi-inquilino (tenant isolation).
    """
    try:
        # Resolver el tenant_id
        resolved_tenant_id = tenant_id or current_tenant_var.get()

        # Si aún no tenemos tenant_id pero viene un appointment_id en el metadata, intentamos resolverlo
        if not resolved_tenant_id and metadata and "appointment_id" in metadata:
            appt = db.query(models.Appointment).filter(models.Appointment.id == metadata["appointment_id"]).first()
            if appt:
                resolved_tenant_id = appt.tenant_id

        if not resolved_tenant_id:
            print("⚠️ create_admin_notification omitida: No se pudo determinar el tenant_id.")
            return

        # Buscamos a los usuarios que deben recibir notificaciones de gestión dentro DEL MISMO TENANT
        admins = db.query(models.User).filter(
            models.User.tenant_id == resolved_tenant_id,
            models.User.role.in_(["admin", "recepcion"])
        ).all()
        
        if not admins:
            # Fallback: Si no hay usuarios con esos roles en este tenant, buscar cualquier usuario del tenant
            admins = db.query(models.User).filter(models.User.tenant_id == resolved_tenant_id).limit(1).all()

        if not admins:
            return

        for admin in admins:
            new_notif = models.Notification(
                id=str(uuid.uuid4()),
                tenant_id=resolved_tenant_id,
                user_id=admin.id,
                title=title,
                description=description,
                type=type,
                read=False,
                extra_metadata=metadata,
                created_at=datetime.utcnow()
            )
            db.add(new_notif)
        
        # Guardamos específicamente las notificaciones
        db.commit()
        
    except Exception as e:
        # En caso de error, hacemos rollback parcial para no ensuciar la sesión principal
        db.rollback()
        print(f"⚠️ Error al crear notificación (omitido): {e}")


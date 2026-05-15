from sqlalchemy.orm import Session
from .. import models
import uuid
from datetime import datetime

def create_admin_notification(db: Session, title: str, description: str, type: str = "info", metadata: dict = None):
    """
    Crea una notificación para todos los usuarios con rol de administrador o recepción.
    """
    try:
        # Buscamos a los usuarios que deben recibir notificaciones de gestión
        admins = db.query(models.User).filter(models.User.role.in_(["admin", "recepcion"])).all()
        
        if not admins:
            # Fallback: Si no hay usuarios con esos roles, intentamos buscar cualquier perfil 
            admins = db.query(models.User).limit(1).all()

        if not admins:
            return

        for admin in admins:
            new_notif = models.Notification(
                id=str(uuid.uuid4()),
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
        # En caso de error (ej. RLS), hacemos rollback parcial para no ensuciar la sesión principal
        db.rollback()
        print(f"⚠️ Error al crear notificación (omitido): {e}")

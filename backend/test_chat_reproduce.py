import os
import sys
import logging
from dotenv import load_dotenv

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(override=True)

# Activar logging detallado
logging.basicConfig(level=logging.DEBUG)

from app.database import SessionLocal, current_tenant_var
from app.models import Tenant
from app import schemas
from app.routers.ai_agent import ai_webmaster_chat

def reproduce():
    db = SessionLocal()
    try:
        tenant = db.query(Tenant).filter(Tenant.slug == "ninabeautycoiff").first()
        if not tenant:
            tenant = db.query(Tenant).first()
        
        tenant_id = tenant.id
        current_tenant_var.set(tenant_id)
        print(f"Tenant ID: {tenant_id}")

        # Replicar el historial exacto
        history = [
            schemas.ChatMessage(
                role="user",
                content="no encuentro la sección donde poder cambiar el logo ni cómo se hace ayúdame"
            ),
            schemas.ChatMessage(
                role="model",
                content="¡Excelente, Juan! Le guiaré directamente a la sección de Branding para que pueda cargar el logo de Nina Beauty Coiff. El botón específico para esta acción es 'Cargar/Cambiar Logo'."
            )
        ]
        
        request = schemas.AIChatRequest(
            message="puedes llevarme hasta esa sección",
            history=history,
            voice_gender="female",
            language="es",
            user_name="Juan",
            user_role="admin"
        )
        
        print("Invocando ai_webmaster_chat...")
        response = ai_webmaster_chat(request=request, db=db)
        print("Respuesta:")
        print(response.response)
        
    except Exception as e:
        print(f"\nERROR CAPTURADO:\n")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    reproduce()

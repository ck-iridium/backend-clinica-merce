import os
import sys
import logging
from dotenv import load_dotenv

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(override=True)

# Configurar logging detallado para ver todo
logging.basicConfig(level=logging.DEBUG)

from app.database import SessionLocal, current_tenant_var
from app.models import Tenant
from app import schemas
from app.routers.ai_agent import ai_webmaster_chat

def test_internal():
    db = SessionLocal()
    try:
        print("1. Buscando tenant 'barbero2'...")
        tenant = db.query(Tenant).filter(Tenant.slug == "barbero2").first()
        if not tenant:
            tenant = db.query(Tenant).first()
        
        tenant_id = tenant.id
        current_tenant_var.set(tenant_id)
        print(f"2. Contexto de tenant establecido en: {tenant_id}")

        request = schemas.AIChatRequest(
            message="Hola",
            history=[],
            voice_gender="female",
            language="es",
            user_name="barbero2"
        )
        
        print("3. Invocando ai_webmaster_chat internamente...")
        response = ai_webmaster_chat(request=request, db=db)
        
        print("4. ¡Respuesta recibida con éxito!")
        print(f"Texto: {response.response}")
        print(f"Audio Base64 (longitud): {len(response.audio_response_base64) if response.audio_response_base64 else None}")
        print(f"Trial restante: {response.trial_remaining}")
        
    except Exception as e:
        print(f"\n¡ERROR CAPTURADO DURANTE LA INVOCACIÓN INTERNA!: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    test_internal()

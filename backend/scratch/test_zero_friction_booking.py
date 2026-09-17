import os
import sys
import time
from datetime import datetime, timedelta

# Asegurar path de backend
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal
from app import models
from app.utils import mailer

# Mockear envío real de correo en los tests para ejecución ultrarrápida
mailer.send_appointment_notification = lambda *args, **kwargs: print(" [MOCK_MAILER] Notificación simulada enviada correctamente.")

client = TestClient(app)

def run_tests():
    db = SessionLocal()
    try:
        # Buscar un servicio activo directamente
        service = db.query(models.Service).first()
        if not service:
            print("[FAIL] No hay servicios en la base de datos.")
            return

        tenant_id = service.tenant_id

        target_time = (datetime.now() + timedelta(days=2)).replace(hour=11, minute=0, second=0, microsecond=0)
        target_iso = target_time.strftime("%Y-%m-%dT%H:%M:00")

        headers = {"X-Tenant-ID": tenant_id}

        print("="*60)
        print("SUITE DE PRUEBAS: RESERVA DIRECTA & ESCUDO ANTIBOT")
        print(f"Tenant ID de prueba: {tenant_id}")
        print(f"Servicio ID de prueba: {service.id} ({service.name})")
        print("="*60)

        # PRUEBA 1: Honeypot detectado (Debe rechazar con 400)
        print("\n1. Test Honeypot Trap (bot rellena campo invisible)...")
        resp_hp = client.post("/appointments/public", headers=headers, json={
            "client_name": "Bot Tester",
            "client_email": "bot@test.com",
            "client_phone": "612345678",
            "service_id": service.id,
            "start_time": target_iso,
            "website_hp": "http://spam-link.com"
        })
        print(f"Status: {resp_hp.status_code}, Detalle: {resp_hp.json().get('detail')}")
        assert resp_hp.status_code == 400, f"Se esperaba 400 pero dio {resp_hp.status_code}"
        print("[OK] Honeypot superado: Bot bloqueado correctamente.")

        # PRUEBA 2: Time-trap detectado (envío en 200ms)
        print("\n2. Test Time-Trap (envio a velocidad de script < 2.5s)...")
        now_ms = time.time() * 1000.0
        resp_tt = client.post("/appointments/public", headers=headers, json={
            "client_name": "Speed Bot",
            "client_email": "speed@test.com",
            "client_phone": "612345678",
            "service_id": service.id,
            "start_time": target_iso,
            "form_load_time": now_ms - 200 # Solo 200 milisegundos
        })
        print(f"Status: {resp_tt.status_code}, Detalle: {resp_tt.json().get('detail')}")
        assert resp_tt.status_code == 400, f"Se esperaba 400 pero dio {resp_tt.status_code}"
        print("[OK] Time-trap superado: Envio hiper-rapido bloqueado.")

        # PRUEBA 3: Teléfono falso detectado (000000000 o repetitivos)
        print("\n3. Test Telefono Falso...")
        resp_ph = client.post("/appointments/public", headers=headers, json={
            "client_name": "Fake Phone",
            "client_email": "real@test.com",
            "client_phone": "000000000",
            "service_id": service.id,
            "start_time": target_iso,
            "form_load_time": now_ms - 5000
        })
        print(f"Status: {resp_ph.status_code}, Detalle: {resp_ph.json().get('detail')}")
        assert resp_ph.status_code == 422, f"Se esperaba 422 pero dio {resp_ph.status_code}"
        print("[OK] Validacion de telefono superada: Telefono falso rechazado.")

        # PRUEBA 4: Email desechable (yopmail.com)
        print("\n4. Test Email Desechable...")
        resp_em = client.post("/appointments/public", headers=headers, json={
            "client_name": "Disposable Email",
            "client_email": "spammer@yopmail.com",
            "client_phone": "622334455",
            "service_id": service.id,
            "start_time": target_iso,
            "form_load_time": now_ms - 5000
        })
        print(f"Status: {resp_em.status_code}, Detalle: {resp_em.json().get('detail')}")
        assert resp_em.status_code == 422, f"Se esperaba 422 pero dio {resp_em.status_code}"
        print("[OK] Validacion de email superada: Correo temporal bloqueado.")

        # PRUEBA 5: Reserva legítima (humano real -> CONFIRMACIÓN DIRECTA)
        print("\n5. Test Reserva Real Humana (Cero Friccion)...")
        # Buscar el próximo día laborable (lunes a viernes: 1 a 5)
        d = datetime.now() + timedelta(days=1)
        while d.isoweekday() not in [1, 2, 3, 4, 5]: # Lunes a Viernes
            d += timedelta(days=1)
        real_time = d.replace(hour=11, minute=0, second=0, microsecond=0)
        resp_real = client.post("/appointments/public", headers=headers, json={
            "client_name": "Cliente Humano Verificado",
            "client_email": "humano.real@gmail.com",
            "client_phone": "654987321",
            "service_id": service.id,
            "start_time": real_time.strftime("%Y-%m-%dT%H:%M:00"),
            "website_hp": "",
            "form_load_time": now_ms - 10000 # 10 segundos tardo en rellenar
        })
        print(f"Status: {resp_real.status_code}")
        data_real = resp_real.json()
        print(f"Response: {data_real}")
        assert resp_real.status_code == 201, f"Se esperaba 201 pero dio {resp_real.status_code}: {data_real}"
        assert data_real.get("status") == "confirmed", f"Estado esperado 'confirmed', obtenido '{data_real.get('status')}'"
        print("[SUCCESS] Cita creada directamente en estado 'confirmed' sin requerir verificacion por correo.")

        # Limpiar cita de prueba para no ensuciar agenda
        appt_id = data_real.get("appointment_id")
        if appt_id:
            db_appt = db.query(models.Appointment).filter(models.Appointment.id == appt_id).first()
            if db_appt:
                db.delete(db_appt)
                db.commit()
                print(f"[CLEANUP] Cita de prueba {appt_id} eliminada limpiamente.")

        print("\n" + "="*60)
        print("TODAS LAS PRUEBAS DE SEGURIDAD Y FLUJO DIRECTO PASARON CON EXITO")
        print("="*60)

    finally:
        db.close()

if __name__ == "__main__":
    run_tests()

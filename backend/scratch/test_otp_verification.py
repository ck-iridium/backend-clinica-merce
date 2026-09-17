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

# Mockear envío real de emails para pruebas instantáneas
captured_otps = []
def mock_send(appointment_id, type, otp_code=None):
    if type == "otp_verification":
        captured_otps.append(otp_code)
        print(f" [MOCK_EMAIL] OTP enviado a cliente: {otp_code}")
    else:
        print(f" [MOCK_EMAIL] Notificación tipo '{type}' enviada para cita {appointment_id}")

mailer.send_appointment_notification = mock_send

client = TestClient(app)

def run_otp_tests():
    db = SessionLocal()
    test_client_id = None
    first_appt_id = None
    second_appt_id = None

    try:
        service = db.query(models.Service).first()
        if not service:
            print("[FAIL] No hay servicios disponibles en la base de datos.")
            return

        tenant_id = service.tenant_id
        headers = {"X-Tenant-ID": tenant_id}

        test_email = f"nuevo.cliente.{int(time.time())}@gmail.com"
        test_phone = "699112233"

        # Buscar próximo día hábil (Lunes a Viernes)
        d1 = datetime.now() + timedelta(days=1)
        while d1.isoweekday() not in [1, 2, 3, 4, 5]:
            d1 += timedelta(days=1)
        start_time_1 = d1.replace(hour=10, minute=0, second=0, microsecond=0)

        d2 = datetime.now() + timedelta(days=2)
        while d2.isoweekday() not in [1, 2, 3, 4, 5]:
            d2 += timedelta(days=1)
        start_time_2 = d2.replace(hour=11, minute=0, second=0, microsecond=0)

        print("="*65)
        print("SUITE DE PRUEBAS: VERIFICACIÓN OTP EN 1 SOLA OCASIÓN (NUEVOS VS RECURRENTES)")
        print(f"Tenant ID: {tenant_id}")
        print(f"Email de prueba: {test_email}")
        print("="*65)

        # ---------------------------------------------------------------------
        # TEST 1: Reserva por cliente NUEVO -> Debe exigir OTP
        # ---------------------------------------------------------------------
        print("\n1. Test: Cliente NUEVO solicita su primera reserva...")
        resp1 = client.post("/appointments/public", headers=headers, json={
            "client_name": "Nuevo Usuario Test",
            "client_email": test_email,
            "client_phone": test_phone,
            "service_id": service.id,
            "start_time": start_time_1.strftime("%Y-%m-%dT%H:%M:00"),
            "website_hp": "",
            "form_load_time": (time.time() * 1000) - 8000
        })

        assert resp1.status_code == 201, f"Se esperaba 201 pero dio {resp1.status_code}: {resp1.text}"
        data1 = resp1.json()
        first_appt_id = data1.get("appointment_id")
        test_client_id = data1.get("client_id")

        print(f"Respuesta API: status='{data1.get('status')}', requires_verification={data1.get('requires_verification')}")
        assert data1.get("status") == "verification_required", f"Esperado 'verification_required', obtenido '{data1.get('status')}'"
        assert data1.get("requires_verification") is True, "requires_verification debe ser True para nuevo cliente"
        print("[OK] El cliente nuevo recibió 'verification_required' y se generó el flujo de OTP.")

        # Verificar en base de datos el código y estado de la cita
        vc = db.query(models.VerificationCode).filter(
            models.VerificationCode.appointment_id == first_appt_id,
            models.VerificationCode.tenant_id == tenant_id
        ).first()
        assert vc is not None, "Debe existir un registro de VerificationCode en la base de datos"
        real_otp = vc.code
        print(f"Código OTP generado en base de datos: {real_otp} (longitud: {len(real_otp)})")
        assert len(real_otp) == 6, f"El código debe ser de 6 dígitos, obtenido: {real_otp}"

        # Comprobar que el cliente aún NO está verificado
        db_client = db.query(models.Client).filter(models.Client.id == test_client_id).first()
        assert db_client.is_verified is False, "El cliente nuevo debe tener is_verified=False antes de verificar"

        # ---------------------------------------------------------------------
        # TEST 2: Introducir código OTP INCORRECTO -> Debe rechazar con 400
        # ---------------------------------------------------------------------
        print("\n2. Test: Introducir código OTP erróneo (000000)...")
        resp_err = client.post("/appointments/verify-otp", headers=headers, json={
            "appointment_id": first_appt_id,
            "code": "000000"
        })
        print(f"Status erróneo: {resp_err.status_code}, Detalle: {resp_err.json().get('detail')}")
        assert resp_err.status_code == 400, f"Se esperaba 400 para código incorrecto, obtenido {resp_err.status_code}"
        print("[OK] Código incorrecto rechazado adecuadamente.")

        # ---------------------------------------------------------------------
        # TEST 3: Introducir código OTP CORRECTO -> Confirma y persiste is_verified
        # ---------------------------------------------------------------------
        print(f"\n3. Test: Introducir código OTP CORRECTO ({real_otp})...")
        resp_ok = client.post("/appointments/verify-otp", headers=headers, json={
            "appointment_id": first_appt_id,
            "code": real_otp
        })
        assert resp_ok.status_code == 200, f"Se esperaba 200 pero dio {resp_ok.status_code}: {resp_ok.text}"
        data_ok = resp_ok.json()
        print(f"Respuesta tras verificación: status='{data_ok.get('status')}', requires_verification={data_ok.get('requires_verification')}")
        assert data_ok.get("status") == "confirmed", f"Estado esperado 'confirmed', obtenido '{data_ok.get('status')}'"
        assert data_ok.get("requires_verification") is False

        # Verificar persistencia en base de datos
        db.refresh(db_client)
        assert db_client.is_verified is True, "El cliente DEBE quedar marcado con is_verified=True permanentemente"
        db_appt1 = db.query(models.Appointment).filter(models.Appointment.id == first_appt_id).first()
        assert db_appt1.status == "confirmed", "La cita debe haber pasado a 'confirmed'"
        print("[OK] Cliente verificado exitosamente e is_verified=True guardado en base de datos.")

        # ---------------------------------------------------------------------
        # TEST 4: Segunda reserva del MISMO cliente -> Pase directo en 1 clic (Cero OTP)
        # ---------------------------------------------------------------------
        print("\n4. Test: El MISMO cliente vuelve a reservar (Segunda Reserva)...")
        resp2 = client.post("/appointments/public", headers=headers, json={
            "client_name": "Nuevo Usuario Test",
            "client_email": test_email, # Mismo email verificado
            "client_phone": test_phone,
            "service_id": service.id,
            "start_time": start_time_2.strftime("%Y-%m-%dT%H:%M:00"),
            "website_hp": "",
            "form_load_time": (time.time() * 1000) - 9000
        })

        assert resp2.status_code == 201, f"Se esperaba 201 pero dio {resp2.status_code}: {resp2.text}"
        data2 = resp2.json()
        second_appt_id = data2.get("appointment_id")
        print(f"Respuesta segunda reserva: status='{data2.get('status')}', requires_verification={data2.get('requires_verification')}")
        assert data2.get("status") == "confirmed", f"La segunda cita debía ser 'confirmed' directa, pero dio '{data2.get('status')}'"
        assert data2.get("requires_verification") is False, "No debe requerir verificación para cliente recurrente"
        print("[OK] ¡ÉXITO TOTAL! La segunda reserva fue directa en 1 clic sin solicitar OTP.")

        print("\n" + "="*65)
        print("TODAS LAS PRUEBAS DE VERIFICACIÓN OTP EN 1 SOLA OCASIÓN PASARON")
        print("="*65)

    finally:
        # Limpiar citas y cliente de prueba
        if first_appt_id:
            db.query(models.VerificationCode).filter(models.VerificationCode.appointment_id == first_appt_id).delete()
            db.query(models.Appointment).filter(models.Appointment.id == first_appt_id).delete()
        if second_appt_id:
            db.query(models.Appointment).filter(models.Appointment.id == second_appt_id).delete()
        if test_client_id:
            db.query(models.Client).filter(models.Client.id == test_client_id).delete()
        db.commit()
        db.close()
        print("[CLEANUP] Datos de prueba eliminados correctamente.")

if __name__ == "__main__":
    run_otp_tests()

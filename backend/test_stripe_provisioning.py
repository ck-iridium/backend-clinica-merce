import os
import uuid
import unittest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock

# Configurar variables de entorno de prueba antes de importar la app
os.environ["STRIPE_SECRET_KEY"] = "sk_test_mockkey"
os.environ["STRIPE_WEBHOOK_SECRET"] = "whsec_mocksecret"
os.environ["FRONTEND_URL"] = "http://localhost:3000"

from app.main import app
from app.database import SessionLocal
from app import models

class TestStripeProvisioning(unittest.TestCase):
    
    def setUp(self):
        db = SessionLocal()
        try:
            tenant = db.query(models.Tenant).filter(models.Tenant.slug == "jadetest").first()
            if tenant:
                db.query(models.Profile).filter(models.Profile.tenant_id == tenant.id).delete()
                db.query(models.User).filter(models.User.tenant_id == tenant.id).delete()
                db.query(models.ClinicSettings).filter(models.ClinicSettings.tenant_id == tenant.id).delete()
                db.query(models.SiteContent).filter(models.SiteContent.tenant_id == tenant.id).delete()
                db.query(models.Tenant).filter(models.Tenant.id == tenant.id).delete()
                db.commit()
            db.query(models.User).filter(models.User.email == "admin@jadetest.com").delete()
            # Eliminar de auth.users si existiera
            from sqlalchemy import text
            db.execute(text("DELETE FROM auth.users WHERE email = 'admin@jadetest.com'"))
            db.commit()
        finally:
            db.close()
            
        self.client = TestClient(app)

    def tearDown(self):
        # Limpieza posterior
        self.setUp()

    @patch("stripe.checkout.Session.create")
    def test_create_onboarding_session(self, mock_stripe_create):
        # Mockear la respuesta de Stripe
        mock_stripe_create.return_value = MagicMock(url="https://checkout.stripe.com/pay/mock_session_id")
        
        payload = {
            "tenant_name": "Clínica Jade Test",
            "tenant_slug": "jadetest",
            "admin_email": "admin@jadetest.com",
            "admin_name": "Dra. Jade Test",
            "admin_password": "securepassword123!"
        }
        
        # 1. Crear sesión de onboarding exitosa
        response = self.client.post("/stripe/create-onboarding-session", json=payload)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["url"], "https://checkout.stripe.com/pay/mock_session_id")
        
        # 2. Guardar manualmente un tenant con ese slug en la base de datos para probar la colisión
        db = SessionLocal()
        try:
            new_tenant = models.Tenant(
                id=str(uuid.uuid4()),
                name="Colliding Clinic",
                slug="jadetest"
            )
            db.add(new_tenant)
            db.commit()
        finally:
            db.close()
            
        response_dup = self.client.post("/stripe/create-onboarding-session", json=payload)
        self.assertEqual(response_dup.status_code, 400)
        self.assertIn("El subdominio ya está registrado", response_dup.json()["detail"])

    @patch("stripe.Webhook.construct_event")
    @patch("supabase.create_client")
    def test_webhook_onboarding_provisioning(self, mock_supabase_create, mock_construct_event):
        # 1. Mockear la firma de Stripe
        mock_construct_event.return_value = {
            "type": "checkout.session.completed",
            "data": {
                "object": {
                    "id": "cs_test_mock_session",
                    "customer": "cus_mock_customer",
                    "metadata": {
                        "type": "saas_onboarding",
                        "tenant_name": "Clínica Jade Test",
                        "tenant_slug": "jadetest",
                        "admin_email": "admin@jadetest.com",
                        "admin_name": "Dra. Jade Test",
                        "admin_password": "securepassword123!"
                    }
                }
            }
        }
        
        # 2. Mockear Supabase Admin Auth Client
        mock_uid = str(uuid.uuid4())
        mock_supabase_instance = MagicMock()
        mock_supabase_create.return_value = mock_supabase_instance
        mock_supabase_instance.auth.admin.create_user.return_value = MagicMock(
            user=MagicMock(id=mock_uid)
        )
        
        # Configurar entornos para simular clave de Supabase cargada
        with patch.dict(os.environ, {"SUPABASE_URL": "https://mock.supabase.co", "SUPABASE_SERVICE_ROLE_KEY": "mockkey"}):
            # Pre-insertar el usuario en la tabla auth.users para que pase la clave foránea
            from sqlalchemy import text
            db = SessionLocal()
            try:
                db.execute(
                    text("INSERT INTO auth.users (id, email, is_sso_user, is_anonymous) VALUES (:id, :email, false, false) ON CONFLICT DO NOTHING"),
                    {"id": mock_uid, "email": "admin@jadetest.com"}
                )
                db.commit()
            finally:
                db.close()
                
            # 3. Disparar el webhook
            headers = {"stripe-signature": "t=123,v1=abc"}
            response = self.client.post("/stripe/webhook", data=b"mockpayload", headers=headers)
            
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.json(), {"status": "success"})
            
            # 4. Verificar aprovisionamiento en la Base de Datos Relacional
            db = SessionLocal()
            try:
                tenant = db.query(models.Tenant).filter(models.Tenant.slug == "jadetest").first()
                self.assertIsNotNone(tenant)
                self.assertEqual(tenant.name, "Clínica Jade Test")
                
                user = db.query(models.User).filter(models.User.email == "admin@jadetest.com").first()
                self.assertIsNotNone(user)
                self.assertEqual(user.role, "admin")
                self.assertEqual(user.tenant_id, tenant.id)
                self.assertEqual(user.id, mock_uid)
                
                profile = db.query(models.Profile).filter(models.Profile.id == user.id).first()
                self.assertIsNotNone(profile)
                self.assertEqual(profile.full_name, "Dra. Jade Test")
                self.assertEqual(profile.tenant_id, tenant.id)
                
                settings = db.query(models.ClinicSettings).filter(models.ClinicSettings.tenant_id == tenant.id).first()
                self.assertIsNotNone(settings)
                self.assertEqual(settings.clinic_name, "Clínica Jade Test")
                self.assertEqual(settings.clinic_email, "admin@jadetest.com")
                
                content = db.query(models.SiteContent).filter(models.SiteContent.tenant_id == tenant.id).first()
                self.assertIsNotNone(content)
                self.assertEqual(content.hero_title, "Bienvenidos a Clínica Jade Test")
            finally:
                db.close()

if __name__ == "__main__":
    unittest.main()

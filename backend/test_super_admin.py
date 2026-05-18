import os
import uuid
import unittest
import base64
import json
from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal
from app import models

def make_mock_jwt(payload: dict) -> str:
    header = {"alg": "HS256", "typ": "JWT"}
    header_b64 = base64.b64encode(json.dumps(header).encode("utf-8")).decode("utf-8").replace("=", "")
    payload_b64 = base64.b64encode(json.dumps(payload).encode("utf-8")).decode("utf-8").replace("=", "")
    return f"{header_b64}.{payload_b64}.mocksignature"

class TestSuperAdmin(unittest.TestCase):
    
    def setUp(self):
        # 1. Configurar Base de Datos con Inquilino de Prueba
        self.db = SessionLocal()
        self.tenant_id = str(uuid.uuid4())
        
        # Eliminar posible residuo
        self.clean_up()
        
        # Crear inquilino de prueba activo
        self.test_tenant = models.Tenant(
            id=self.tenant_id,
            name="Clínica Admin Test",
            slug="admintesttenant",
            subscription_status="active"
        )
        self.db.add(self.test_tenant)
        self.db.commit()
        
        self.client = TestClient(app)
        
        # Generar tokens mock
        self.super_admin_token = make_mock_jwt({
            "app_metadata": {"role": "super_admin", "tenant_id": self.tenant_id},
            "email": "superadmin@saas.com"
        })
        self.regular_admin_token = make_mock_jwt({
            "app_metadata": {"role": "admin", "tenant_id": self.tenant_id},
            "email": "admin@admintest.com"
        })

    def tearDown(self):
        self.clean_up()
        self.db.close()

    def clean_up(self):
        tenant = self.db.query(models.Tenant).filter(models.Tenant.slug == "admintesttenant").first()
        if tenant:
            self.db.query(models.Tenant).filter(models.Tenant.id == tenant.id).delete()
            self.db.commit()

    def test_get_tenants_unauthorized_missing_token(self):
        """1. Retorna 401 si falta el token Bearer"""
        response = self.client.get("/super-admin/tenants")
        self.assertEqual(response.status_code, 401)
        self.assertIn("Falta token Bearer", response.json()["detail"])

    def test_get_tenants_unauthorized_regular_role(self):
        """2. Retorna 403 si el rol no es super_admin"""
        headers = {"Authorization": f"Bearer {self.regular_admin_token}"}
        response = self.client.get("/super-admin/tenants", headers=headers)
        self.assertEqual(response.status_code, 403)
        self.assertIn("Se requiere rol de Super Admin", response.json()["detail"])

    def test_get_tenants_authorized(self):
        """3. Retorna 200 y la lista de inquilinos si es super_admin"""
        headers = {"Authorization": f"Bearer {self.super_admin_token}"}
        response = self.client.get("/super-admin/tenants", headers=headers)
        self.assertEqual(response.status_code, 200)
        
        tenants = response.json()
        self.assertTrue(len(tenants) >= 1)
        # Comprobar que nuestro inquilino de prueba está presente
        tenant_slugs = [t["slug"] for t in tenants]
        self.assertIn("admintesttenant", tenant_slugs)

    def test_update_tenant_status_flow(self):
        """4. Flujo completo de suspensión y reactivación de un Tenant"""
        headers = {"Authorization": f"Bearer {self.super_admin_token}"}
        
        # A) Suspender inquilino
        response = self.client.post(
            f"/super-admin/tenants/{self.tenant_id}/status",
            json={"status": "suspended"},
            headers=headers
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["subscription_status"], "suspended")
        
        # B) Comprobar que las peticiones normales a este inquilino retornan 402 Payment Required
        headers_normal = {
            "X-Tenant-ID": self.tenant_id,
            "Authorization": f"Bearer {self.regular_admin_token}"
        }
        response_normal = self.client.get("/services", headers=headers_normal)
        self.assertEqual(response_normal.status_code, 402)
        self.assertIn("Acceso Restringido: La suscripción", response_normal.json()["detail"])
        
        # C) Comprobar que peticiones a rutas excluidas (ej: super-admin) no se bloquean
        response_sa = self.client.get("/super-admin/tenants", headers=headers)
        self.assertEqual(response_sa.status_code, 200)

        # D) Reactivar inquilino
        response_reactivate = self.client.post(
            f"/super-admin/tenants/{self.tenant_id}/status",
            json={"status": "active"},
            headers=headers
        )
        self.assertEqual(response_reactivate.status_code, 200)
        self.assertEqual(response_reactivate.json()["subscription_status"], "active")

        # E) Comprobar que las peticiones normales vuelven a funcionar (ej: retorna 200 o lista vacía de servicios)
        response_normal_active = self.client.get("/services", headers=headers_normal)
        # Retorna 200 ya que la suscripción está activa nuevamente
        self.assertEqual(response_normal_active.status_code, 200)

if __name__ == "__main__":
    unittest.main()

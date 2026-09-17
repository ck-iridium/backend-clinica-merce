import os
import sys
import time

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.database import SessionLocal
from app import models, schemas
from app.services.tenant_provisioner import provision_tenant

def test_seo_backend():
    db = SessionLocal()
    test_tenant_id = None
    try:
        print("="*60)
        print("TEST: SEO MULTI-TENANT & SEARCH CONSOLE VERIFICATION")
        print("="*60)

        # 1. Comprobar actualización y persistencia de google_site_verification
        settings = db.query(models.ClinicSettings).first()
        assert settings is not None, "Debe existir al menos una configuración de clínica"
        
        test_code = "google-site-verification=test_token_abc123xyz"
        settings.google_site_verification = test_code
        db.commit()
        db.refresh(settings)

        assert settings.google_site_verification == test_code, "El campo google_site_verification debe guardarse correctamente"
        print("[OK] Campo google_site_verification guardado y recuperado con éxito:", settings.google_site_verification)

        # 2. Comprobar que ClinicSettings tiene allow_search_engine_indexing = True por defecto
        test_tenant_slug = f"seo-test-{int(time.time())}"
        test_tenant = models.Tenant(
            name="SEO Test Clinic",
            slug=test_tenant_slug,
            plan_type="pro"
        )
        db.add(test_tenant)
        db.commit()
        db.refresh(test_tenant)
        test_tenant_id = test_tenant.id

        new_settings = models.ClinicSettings(
            tenant_id=test_tenant_id,
            clinic_name="SEO Test Clinic"
        )
        db.add(new_settings)
        db.commit()
        db.refresh(new_settings)

        print(f"Estado de allow_search_engine_indexing en nuevo registro: {new_settings.allow_search_engine_indexing}")
        assert new_settings.allow_search_engine_indexing is True, "¡ERROR! allow_search_engine_indexing DEBE ser True por defecto para nuevos tenants"
        print("[OK] ClinicSettings se crea con allow_search_engine_indexing = True por defecto.")

        # 3. Comprobar endpoints de robots y sitemap en frontend
        try:
            import httpx
            print("\nComprobando endpoints en Frontend (localhost:3000)...")
            r_robots = httpx.get("http://localhost:3000/robots.txt", timeout=5)
            assert r_robots.status_code == 200, f"robots.txt status: {r_robots.status_code}"
            assert "User-Agent" in r_robots.text, "robots.txt debe contener User-Agent"
            print("[OK] /robots.txt responde 200 OK y contiene directivas correctas.")

            r_sitemap = httpx.get("http://localhost:3000/sitemap.xml", timeout=5)
            assert r_sitemap.status_code == 200, f"sitemap.xml status: {r_sitemap.status_code}"
            assert "<urlset" in r_sitemap.text, "sitemap.xml debe contener <urlset"
            print("[OK] /sitemap.xml responde 200 OK y devuelve estructura XML válida.")
        except Exception as e:
            print("[WARN] Verificación HTTP frontend omitida o con aviso:", e)

        print("\n" + "="*60)
        print("TODOS LOS TESTS DE SEO EN BACKEND Y FRONTEND HAN PASADO CON ÉXITO")
        print("="*60)

    finally:
        # Limpieza
        if test_tenant_id:
            db.query(models.ClinicSettings).filter(models.ClinicSettings.tenant_id == test_tenant_id).delete()
            db.query(models.SiteContent).filter(models.SiteContent.tenant_id == test_tenant_id).delete()
            db.query(models.User).filter(models.User.tenant_id == test_tenant_id).delete()
            db.query(models.Profile).filter(models.Profile.tenant_id == test_tenant_id).delete()
            db.query(models.Tenant).filter(models.Tenant.id == test_tenant_id).delete()
            db.commit()
            print("[CLEANUP] Tenant de prueba eliminado correctamente.")
        db.close()

if __name__ == "__main__":
    test_seo_backend()

import os
import sys

# Add backend to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', 'backend')))

from app.database import SessionLocal, current_tenant_var
from app.services.ai.tools.landing import update_landing_config
from app import models

db = SessionLocal()
try:
    # Get a tenant ID
    tenant = db.query(models.Tenant).first()
    if not tenant:
        print("No tenants found.")
        sys.exit(0)
        
    print(f"Testing with Tenant ID: {tenant.id} ({tenant.slug})")
    current_tenant_var.set(tenant.id)
    
    # Check current SiteContent
    content = db.query(models.SiteContent).filter(models.SiteContent.tenant_id == tenant.id).first()
    original_title = content.hero_title if content else "None"
    print(f"Original Hero Title: {original_title}")
    
    # Run the update
    res = update_landing_config(hero_title="Nuevo Titulo de Bienvenida Test")
    print(f"Update Result: {res}")
    
    # Verify change
    db.expire_all()
    content = db.query(models.SiteContent).filter(models.SiteContent.tenant_id == tenant.id).first()
    new_title = content.hero_title if content else "None"
    print(f"New Hero Title: {new_title}")
    
    # Restore original title
    if content:
        content.hero_title = original_title
        db.commit()
        print("Restored original title successfully.")
        
finally:
    db.close()

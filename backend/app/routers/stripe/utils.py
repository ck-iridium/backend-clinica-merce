import re
import uuid

def get_val(obj, key, default=None):
    if isinstance(obj, dict):
        return obj.get(key, default)
    return getattr(obj, key, default)

def extract_and_fallback_onboarding_data(session, metadata):
    """
    Extrae los datos de onboarding desde la sesión o metadatos de Stripe,
    aplicando fallbacks robustos para evitar slugs o campos nulos.
    """
    # 1. Email del administrador
    admin_email = get_val(metadata, "admin_email") or getattr(session, "customer_email", None) or get_val(session, "customer_email", None)
    if not admin_email and getattr(session, "customer_details", None):
        admin_email = getattr(session.customer_details, "email", None)
    if not admin_email and get_val(session, "customer_details", None):
        admin_email = get_val(get_val(session, "customer_details"), "email", None)
    if not admin_email:
        admin_email = "admin@probookia.com"
    
    # 2. Nombre del negocio
    tenant_name = get_val(metadata, "tenant_name")
    if not tenant_name or str(tenant_name).strip() == "":
        if getattr(session, "customer_details", None) and getattr(session.customer_details, "name", None):
            tenant_name = session.customer_details.name
        elif get_val(session, "customer_details", None) and get_val(get_val(session, "customer_details"), "name", None):
            tenant_name = get_val(get_val(session, "customer_details"), "name")
        else:
            tenant_name = admin_email.split("@")[0].replace(".", " ").replace("-", " ").title()
            if not tenant_name or str(tenant_name).strip() == "":
                tenant_name = "Mi Negocio ProBookia"

    # 3. Slug único
    tenant_slug = get_val(metadata, "tenant_slug")
    if not tenant_slug or str(tenant_slug).strip() == "":
        clean_name = re.sub(r'[^a-z0-9]+', '-', str(tenant_name).lower()).strip('-')
        if not clean_name:
            clean_name = "negocio"
        tenant_slug = f"{clean_name}-{uuid.uuid4().hex[:6]}"
    else:
        tenant_slug = re.sub(r'[^a-z0-9-]+', '-', str(tenant_slug).lower()).strip('-')

    # 4. Nombre del administrador
    admin_name = get_val(metadata, "admin_name")
    if not admin_name or str(admin_name).strip() == "":
        if getattr(session, "customer_details", None) and getattr(session.customer_details, "name", None):
            admin_name = session.customer_details.name
        elif get_val(session, "customer_details", None) and get_val(get_val(session, "customer_details"), "name", None):
            admin_name = get_val(get_val(session, "customer_details"), "name")
        else:
            admin_name = admin_email.split("@")[0].title()

    # 5. Contraseña
    admin_password = get_val(metadata, "admin_password")
    if not admin_password or str(admin_password).strip() == "":
        admin_password = f"ProBookia-{uuid.uuid4().hex[:8]}!"

    return {
        "tenant_name": str(tenant_name),
        "tenant_slug": str(tenant_slug),
        "admin_email": str(admin_email),
        "admin_name": str(admin_name),
        "admin_password": str(admin_password)
    }

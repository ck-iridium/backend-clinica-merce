-- =====================================================================
-- SCRIPT DE MIGRACIÓN: MULTI-TENANCY CON AISLAMIENTO DE DATOS (RLS)
-- CLINICA MERCÈ - FASE 1 (CORREGIDO CON VARCHAR(36) CONSISTENTE)
-- =====================================================================

BEGIN;

-- 1. CREACIÓN DE LA TABLA DE INQUILINOS (TENANTS)
CREATE TABLE IF NOT EXISTS tenants (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR NOT NULL,
    slug VARCHAR NOT NULL UNIQUE,
    stripe_customer_id VARCHAR,
    subscription_status VARCHAR DEFAULT 'active',
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT timezone('utc', now())
);

-- 2. INSERCIÓN DE CLÍNICA MERCÈ COMO EL CLIENTE Nº 1 (TENANT 0)
INSERT INTO tenants (id, name, slug, subscription_status)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Clínica Mercè',
    'merce',
    'active'
) ON CONFLICT (id) DO NOTHING;

-- 3. CAMBIAR TIPOS DE ID EN CLINIC_SETTINGS Y SITE_CONTENT DE SERIAL/INT A VARCHAR
-- Para mantener la compatibilidad con el nuevo modelo de SQLAlchemy (String(36) UUID)
ALTER TABLE clinic_settings ALTER COLUMN id TYPE VARCHAR(36);
ALTER TABLE site_content ALTER COLUMN id TYPE VARCHAR(36);

-- Actualizar ids antiguos (que solían ser 1) a UUIDs para mayor consistencia
UPDATE clinic_settings SET id = '00000000-0000-0000-0000-000000000002' WHERE id = '1';
UPDATE site_content SET id = '00000000-0000-0000-0000-000000000003' WHERE id = '1';

-- 4. ADICIÓN DE LA COLUMNA tenant_id A TODAS LAS TABLAS TRANSACCIONALES
-- Y VINCULACIÓN DE LOS DATOS EXISTENTES AL CLIENTE Nº 1

-- users
ALTER TABLE users ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(36) REFERENCES tenants(id);
UPDATE users SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
ALTER TABLE users ALTER COLUMN tenant_id SET NOT NULL;

-- profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(36) REFERENCES tenants(id);
UPDATE profiles SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
ALTER TABLE profiles ALTER COLUMN tenant_id SET NOT NULL;

-- clients
ALTER TABLE clients ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(36) REFERENCES tenants(id);
UPDATE clients SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
ALTER TABLE clients ALTER COLUMN tenant_id SET NOT NULL;

-- consents
ALTER TABLE consents ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(36) REFERENCES tenants(id);
UPDATE consents SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
ALTER TABLE consents ALTER COLUMN tenant_id SET NOT NULL;

-- service_categories
ALTER TABLE service_categories ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(36) REFERENCES tenants(id);
UPDATE service_categories SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
ALTER TABLE service_categories ALTER COLUMN tenant_id SET NOT NULL;

-- services
ALTER TABLE services ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(36) REFERENCES tenants(id);
UPDATE services SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
ALTER TABLE services ALTER COLUMN tenant_id SET NOT NULL;

-- voucher_templates
ALTER TABLE voucher_templates ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(36) REFERENCES tenants(id);
UPDATE voucher_templates SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
ALTER TABLE voucher_templates ALTER COLUMN tenant_id SET NOT NULL;

-- appointments
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(36) REFERENCES tenants(id);
UPDATE appointments SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
ALTER TABLE appointments ALTER COLUMN tenant_id SET NOT NULL;

-- vouchers
ALTER TABLE vouchers ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(36) REFERENCES tenants(id);
UPDATE vouchers SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
ALTER TABLE vouchers ALTER COLUMN tenant_id SET NOT NULL;

-- clinic_settings
ALTER TABLE clinic_settings ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(36) REFERENCES tenants(id);
UPDATE clinic_settings SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
ALTER TABLE clinic_settings ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE clinic_settings ADD CONSTRAINT uq_clinic_settings_tenant_id UNIQUE (tenant_id);

-- invoices
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(36) REFERENCES tenants(id);
UPDATE invoices SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
ALTER TABLE invoices ALTER COLUMN tenant_id SET NOT NULL;

-- time_blocks
ALTER TABLE time_blocks ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(36) REFERENCES tenants(id);
UPDATE time_blocks SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
ALTER TABLE time_blocks ALTER COLUMN tenant_id SET NOT NULL;

-- site_content
ALTER TABLE site_content ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(36) REFERENCES tenants(id);
UPDATE site_content SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
ALTER TABLE site_content ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE site_content ADD CONSTRAINT uq_site_content_tenant_id UNIQUE (tenant_id);

-- media
ALTER TABLE media ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(36) REFERENCES tenants(id);
UPDATE media SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
ALTER TABLE media ALTER COLUMN tenant_id SET NOT NULL;

-- notifications
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(36) REFERENCES tenants(id);
UPDATE notifications SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
ALTER TABLE notifications ALTER COLUMN tenant_id SET NOT NULL;


-- 5. TRATAMIENTO DE RESTRICCIONES DE UNICIDAD GLOBALES
-- Remoción de restricciones globales antiguas para permitir duplicación saludable entre inquilinos.

-- Categorías de Servicios: Nombre y Slug únicos por Tenant
ALTER TABLE service_categories DROP CONSTRAINT IF EXISTS service_categories_name_key;
ALTER TABLE service_categories DROP CONSTRAINT IF EXISTS service_categories_slug_key;
ALTER TABLE service_categories ADD CONSTRAINT uq_service_categories_tenant_slug UNIQUE (tenant_id, slug);
ALTER TABLE service_categories ADD CONSTRAINT uq_service_categories_tenant_name UNIQUE (tenant_id, name);

-- Servicios: Slug único por Tenant
ALTER TABLE services DROP CONSTRAINT IF EXISTS services_slug_key;
ALTER TABLE services ADD CONSTRAINT uq_services_tenant_slug UNIQUE (tenant_id, slug);


-- 6. HABILITAR ROW LEVEL SECURITY (RLS) EN TABLAS TRANSACCIONALES
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE voucher_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;


-- 7. CREACIÓN DE POLÍTICAS RLS BASADAS EN SET LOCAL DE LA TRANSACCIÓN (app.current_tenant_id)
-- Esto asegura que todas las peticiones concurrentes estén aisladas en su respectivo tenant.

-- users
CREATE POLICY tenant_isolation_users ON users
FOR ALL USING (tenant_id = current_setting('app.current_tenant_id', true));

-- profiles
CREATE POLICY tenant_isolation_profiles ON profiles
FOR ALL USING (tenant_id = current_setting('app.current_tenant_id', true));

-- clients
CREATE POLICY tenant_isolation_clients ON clients
FOR ALL USING (tenant_id = current_setting('app.current_tenant_id', true));

-- consents
CREATE POLICY tenant_isolation_consents ON consents
FOR ALL USING (tenant_id = current_setting('app.current_tenant_id', true));

-- service_categories
CREATE POLICY tenant_isolation_service_categories ON service_categories
FOR ALL USING (tenant_id = current_setting('app.current_tenant_id', true));

-- services
CREATE POLICY tenant_isolation_services ON services
FOR ALL USING (tenant_id = current_setting('app.current_tenant_id', true));

-- voucher_templates
CREATE POLICY tenant_isolation_voucher_templates ON voucher_templates
FOR ALL USING (tenant_id = current_setting('app.current_tenant_id', true));

-- appointments
CREATE POLICY tenant_isolation_appointments ON appointments
FOR ALL USING (tenant_id = current_setting('app.current_tenant_id', true));

-- vouchers
CREATE POLICY tenant_isolation_vouchers ON vouchers
FOR ALL USING (tenant_id = current_setting('app.current_tenant_id', true));

-- clinic_settings
CREATE POLICY tenant_isolation_clinic_settings ON clinic_settings
FOR ALL USING (tenant_id = current_setting('app.current_tenant_id', true));

-- invoices
CREATE POLICY tenant_isolation_invoices ON invoices
FOR ALL USING (tenant_id = current_setting('app.current_tenant_id', true));

-- time_blocks
CREATE POLICY tenant_isolation_time_blocks ON time_blocks
FOR ALL USING (tenant_id = current_setting('app.current_tenant_id', true));

-- site_content
CREATE POLICY tenant_isolation_site_content ON site_content
FOR ALL USING (tenant_id = current_setting('app.current_tenant_id', true));

-- media
CREATE POLICY tenant_isolation_media ON media
FOR ALL USING (tenant_id = current_setting('app.current_tenant_id', true));

-- notifications
CREATE POLICY tenant_isolation_notifications ON notifications
FOR ALL USING (tenant_id = current_setting('app.current_tenant_id', true));

COMMIT;

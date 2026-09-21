-- =====================================================================
-- SCRIPT DE MIGRACIÓN: INTEGRACIONES DE MARKETING Y CONVERSIÓN MULTI-TENANT
-- =====================================================================

BEGIN;

-- 1. Añadir columnas a clinic_settings para soporte de GTM, Google Ads y configuraciones extensibles
ALTER TABLE clinic_settings ADD COLUMN IF NOT EXISTS gtm_container_id VARCHAR(50) NULL;
ALTER TABLE clinic_settings ADD COLUMN IF NOT EXISTS google_ads_id VARCHAR(50) NULL;
ALTER TABLE clinic_settings ADD COLUMN IF NOT EXISTS google_ads_conversion_label VARCHAR(100) NULL;
ALTER TABLE clinic_settings ADD COLUMN IF NOT EXISTS integrations_config JSONB DEFAULT '{}'::jsonb;

-- 2. Asegurar RLS en clinic_settings (por si no estuviera ya activo)
ALTER TABLE clinic_settings ENABLE ROW LEVEL SECURITY;

COMMIT;

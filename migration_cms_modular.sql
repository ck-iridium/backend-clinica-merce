-- =====================================================================
-- SCRIPT DE MIGRACIÓN: PROBOOKIA CMS MODULAR & ONBOARDING ENGINE
-- =====================================================================

BEGIN;

-- 1. CREACIÓN DE LA TABLA site_navigation (Navegación Dinámica)
CREATE TABLE IF NOT EXISTS site_navigation (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    label VARCHAR(100) NOT NULL,
    path VARCHAR(255) NOT NULL,
    is_visible BOOLEAN DEFAULT true,
    order_index INT DEFAULT 0,
    is_custom BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT timezone('utc', now())
);

-- Habilitar Row-Level Security (RLS) en site_navigation
ALTER TABLE site_navigation ENABLE ROW LEVEL SECURITY;

-- Crear política de aislamiento RLS para site_navigation
DROP POLICY IF EXISTS tenant_isolation_site_navigation ON site_navigation;
CREATE POLICY tenant_isolation_site_navigation ON site_navigation
FOR ALL USING (tenant_id = current_setting('app.current_tenant_id', true));


-- 2. EXTENSIÓN DE LA TABLA clinic_settings
ALTER TABLE clinic_settings 
ADD COLUMN IF NOT EXISTS branding_font_headings VARCHAR(100) DEFAULT 'Playfair Display',
ADD COLUMN IF NOT EXISTS branding_font_body VARCHAR(100) DEFAULT 'Inter',
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS theme_palette VARCHAR(50) DEFAULT 'charcoal-gold';


-- 3. CREACIÓN DE LA TABLA site_blocks (Constructor Dinámico de Bloques)
CREATE TABLE IF NOT EXISTS site_blocks (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    page_slug VARCHAR(100) DEFAULT 'home',
    block_type VARCHAR(50) NOT NULL,
    content_data JSONB NOT NULL,
    order_index INT DEFAULT 0,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT timezone('utc', now())
);

-- Habilitar Row-Level Security (RLS) en site_blocks
ALTER TABLE site_blocks ENABLE ROW LEVEL SECURITY;

-- Crear política de aislamiento RLS para site_blocks
DROP POLICY IF EXISTS tenant_isolation_site_blocks ON site_blocks;
CREATE POLICY tenant_isolation_site_blocks ON site_blocks
FOR ALL USING (tenant_id = current_setting('app.current_tenant_id', true));

COMMIT;

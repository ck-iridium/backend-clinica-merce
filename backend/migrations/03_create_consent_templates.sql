-- Migration: Create Consent Templates Table & Update Settings
-- Date: 2026-06-02
-- Author: Antigravity

-- 1. Create consent_templates table
CREATE TABLE IF NOT EXISTS consent_templates (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  body_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT fk_consent_templates_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (id) ON DELETE CASCADE
);

-- 2. Add enable_consents to clinic_settings
ALTER TABLE clinic_settings ADD COLUMN enable_consents BOOLEAN DEFAULT TRUE;

-- 3. Enable Row-Level Security (RLS) OBLIGATORIO
ALTER TABLE consent_templates ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies for consent_templates
DROP POLICY IF EXISTS "Permitir lectura y escritura de consent_templates" ON consent_templates;
CREATE POLICY "Permitir lectura y escritura de consent_templates" ON consent_templates
  FOR ALL TO authenticated 
  USING (
    current_setting('app.current_tenant_id', true) IS NOT NULL 
    AND tenant_id = current_setting('app.current_tenant_id', true)
  )
  WITH CHECK (
    current_setting('app.current_tenant_id', true) IS NOT NULL 
    AND tenant_id = current_setting('app.current_tenant_id', true)
  );

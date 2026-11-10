-- Migration: Create Location Resources (Cabinas / Equipamiento Físico)
-- Date: 2026-11-10
-- Author: Antigravity

-- 1. Crear tabla location_resources
CREATE TABLE IF NOT EXISTS location_resources (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  location_id VARCHAR(36) NOT NULL,
  name VARCHAR(100) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT fk_location_resources_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (id) ON DELETE CASCADE,
  CONSTRAINT fk_location_resources_location FOREIGN KEY (location_id) REFERENCES locations (id) ON DELETE CASCADE
);

-- 2. Añadir required_resource_id a services (opcional / nullable)
ALTER TABLE services ADD COLUMN IF NOT EXISTS required_resource_id VARCHAR(36) REFERENCES location_resources(id) ON DELETE SET NULL;

-- 3. Añadir resource_id a appointments (opcional / nullable)
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS resource_id VARCHAR(36) REFERENCES location_resources(id) ON DELETE SET NULL;

-- 4. Añadir max_concurrent_appointments a locations (aforo global opcional)
ALTER TABLE locations ADD COLUMN IF NOT EXISTS max_concurrent_appointments INTEGER DEFAULT NULL;

-- 5. Enable Row-Level Security (RLS) OBLIGATORIO
ALTER TABLE location_resources ENABLE ROW LEVEL SECURITY;

-- 6. Políticas de acceso para usuarios autenticados
DROP POLICY IF EXISTS "Permitir lectura y escritura de location_resources" ON location_resources;
CREATE POLICY "Permitir lectura y escritura de location_resources" ON location_resources
  FOR ALL TO authenticated 
  USING (
    current_setting('app.current_tenant_id', true) IS NOT NULL 
    AND tenant_id = current_setting('app.current_tenant_id', true)
  )
  WITH CHECK (
    current_setting('app.current_tenant_id', true) IS NOT NULL 
    AND tenant_id = current_setting('app.current_tenant_id', true)
  );

-- 7. Política de lectura anon para widget de disponibilidad pública
DROP POLICY IF EXISTS "Permitir lectura anon de recursos activos" ON location_resources;
CREATE POLICY "Permitir lectura anon de recursos activos" ON location_resources
  FOR SELECT TO anon
  USING (
    is_active = TRUE
    AND current_setting('app.current_tenant_id', true) IS NOT NULL 
    AND tenant_id = current_setting('app.current_tenant_id', true)
  );

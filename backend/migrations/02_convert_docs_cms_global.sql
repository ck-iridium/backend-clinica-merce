-- Migration: Convert CMS Documentation to Global Scope
-- Date: 2026-06-01
-- Author: Antigravity

-- 0. Drop old dependent policies first
DROP POLICY IF EXISTS "Permitir escritura de doc_sections a administradores" ON doc_sections;
DROP POLICY IF EXISTS "Permitir escritura de doc_pages a administradores" ON doc_pages;

-- 1. Modify doc_sections
ALTER TABLE doc_sections DROP CONSTRAINT IF EXISTS fk_doc_sections_tenant;
ALTER TABLE doc_sections DROP CONSTRAINT IF EXISTS uq_doc_sections_tenant_slug;
ALTER TABLE doc_sections DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE doc_sections ADD CONSTRAINT uq_doc_sections_slug UNIQUE (slug);

-- 2. Modify doc_pages
ALTER TABLE doc_pages DROP CONSTRAINT IF EXISTS fk_doc_pages_tenant;
ALTER TABLE doc_pages DROP CONSTRAINT IF EXISTS uq_doc_pages_tenant_slug;
ALTER TABLE doc_pages DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE doc_pages ADD CONSTRAINT uq_doc_pages_slug UNIQUE (slug);

-- 3. Create global RLS policies for doc_sections
DROP POLICY IF EXISTS "Permitir escritura de doc_sections a superadmins" ON doc_sections;
CREATE POLICY "Permitir escritura de doc_sections a superadmins" ON doc_sections
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- 4. Create global RLS policies for doc_pages
DROP POLICY IF EXISTS "Permitir escritura de doc_pages a superadmins" ON doc_pages;
CREATE POLICY "Permitir escritura de doc_pages a superadmins" ON doc_pages
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

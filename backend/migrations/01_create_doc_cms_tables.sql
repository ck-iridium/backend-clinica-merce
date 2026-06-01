-- Migration: Create CMS Documentation Tables
-- Date: 2026-06-01
-- Author: Antigravity

-- 1. Create doc_sections table
CREATE TABLE IF NOT EXISTS doc_sections (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  title JSONB NOT NULL DEFAULT '{}'::jsonb,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT fk_doc_sections_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (id) ON DELETE CASCADE,
  CONSTRAINT uq_doc_sections_tenant_slug UNIQUE (tenant_id, slug)
);

-- 2. Create doc_pages table
CREATE TABLE IF NOT EXISTS doc_pages (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  section_id VARCHAR(36) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  title JSONB NOT NULL DEFAULT '{}'::jsonb,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT fk_doc_pages_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (id) ON DELETE CASCADE,
  CONSTRAINT fk_doc_pages_section FOREIGN KEY (section_id) REFERENCES doc_sections (id) ON DELETE CASCADE,
  CONSTRAINT uq_doc_pages_tenant_slug UNIQUE (tenant_id, slug)
);

-- 3. Enable Row-Level Security (RLS) OBLIGATORIO
ALTER TABLE doc_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE doc_pages ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies for doc_sections
DROP POLICY IF EXISTS "Permitir lectura publica de doc_sections" ON doc_sections;
CREATE POLICY "Permitir lectura publica de doc_sections" ON doc_sections
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir escritura de doc_sections a administradores" ON doc_sections;
CREATE POLICY "Permitir escritura de doc_sections a administradores" ON doc_sections
  FOR ALL TO authenticated 
  USING (
    -- Permite solo si el tenant_id del registro coincide con la variable app.current_tenant_id (o es admin)
    current_setting('app.current_tenant_id', true) IS NOT NULL 
    AND tenant_id = current_setting('app.current_tenant_id', true)
  )
  WITH CHECK (
    current_setting('app.current_tenant_id', true) IS NOT NULL 
    AND tenant_id = current_setting('app.current_tenant_id', true)
  );

-- 5. Create RLS Policies for doc_pages
DROP POLICY IF EXISTS "Permitir lectura publica de doc_pages" ON doc_pages;
CREATE POLICY "Permitir lectura publica de doc_pages" ON doc_pages
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir escritura de doc_pages a administradores" ON doc_pages;
CREATE POLICY "Permitir escritura de doc_pages a administradores" ON doc_pages
  FOR ALL TO authenticated 
  USING (
    current_setting('app.current_tenant_id', true) IS NOT NULL 
    AND tenant_id = current_setting('app.current_tenant_id', true)
  )
  WITH CHECK (
    current_setting('app.current_tenant_id', true) IS NOT NULL 
    AND tenant_id = current_setting('app.current_tenant_id', true)
  );

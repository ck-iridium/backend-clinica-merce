-- 1. Create Locations table (Sedes)
CREATE TABLE IF NOT EXISTS locations (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS for locations
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

-- isolated policy for locations
CREATE POLICY tenant_isolation_policy ON locations 
    FOR ALL 
    USING (tenant_id = current_setting('app.current_tenant_id', true));

-- 2. Create Staff Schedules table (Rostering)
CREATE TABLE IF NOT EXISTS staff_schedules (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    staff_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    location_id VARCHAR(36) NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    day_of_week INTEGER NULL, -- 1 = Monday ... 7 = Sunday
    specific_date DATE NULL,
    start_time VARCHAR(5) NOT NULL, -- e.g. "09:00"
    end_time VARCHAR(5) NOT NULL, -- e.g. "19:30"
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS for staff_schedules
ALTER TABLE staff_schedules ENABLE ROW LEVEL SECURITY;

-- isolated policy for staff_schedules
CREATE POLICY tenant_isolation_policy ON staff_schedules 
    FOR ALL 
    USING (tenant_id = current_setting('app.current_tenant_id', true));

-- 3. Modify Appointments
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS staff_id VARCHAR(36) REFERENCES users(id) ON DELETE RESTRICT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS location_id VARCHAR(36) REFERENCES locations(id) ON DELETE RESTRICT;

CREATE INDEX IF NOT EXISTS idx_appointments_staff ON appointments(staff_id);
CREATE INDEX IF NOT EXISTS idx_appointments_location ON appointments(location_id);

-- 4. Modify Time Blocks
ALTER TABLE time_blocks ADD COLUMN IF NOT EXISTS staff_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_time_blocks_staff ON time_blocks(staff_id);

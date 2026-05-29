-- 1. ClinicSettings: Configuración Geográfica e Híbrida del Inquilino
ALTER TABLE clinic_settings ADD COLUMN work_modality VARCHAR(50) DEFAULT 'clinic_only';
ALTER TABLE clinic_settings ADD COLUMN operations_center_address VARCHAR(500) NULL;
ALTER TABLE clinic_settings ADD COLUMN operations_center_latitude DOUBLE PRECISION NULL;
ALTER TABLE clinic_settings ADD COLUMN operations_center_longitude DOUBLE PRECISION NULL;
ALTER TABLE clinic_settings ADD COLUMN max_coverage_radius_km DOUBLE PRECISION DEFAULT 10.0;
ALTER TABLE clinic_settings ADD COLUMN whitelist_zones TEXT NULL;

-- 2. Services: Modalidad a nivel de tratamiento individual
ALTER TABLE services ADD COLUMN allowed_modality VARCHAR(50) DEFAULT 'clinic';

-- 3. Clients: Caché de dirección habitual y coordenadas del cliente (CRM)
ALTER TABLE clients ADD COLUMN client_latitude DOUBLE PRECISION NULL;
ALTER TABLE clients ADD COLUMN client_longitude DOUBLE PRECISION NULL;
ALTER TABLE clients ADD COLUMN client_postal_code VARCHAR(20) NULL;
ALTER TABLE clients ADD COLUMN client_city VARCHAR(100) NULL;

-- 4. Appointments: Detalles específicos de la cita a domicilio
ALTER TABLE appointments ADD COLUMN service_modality VARCHAR(50) DEFAULT 'clinic';
ALTER TABLE appointments ADD COLUMN client_address VARCHAR(500) NULL;
ALTER TABLE appointments ADD COLUMN client_latitude DOUBLE PRECISION NULL;
ALTER TABLE appointments ADD COLUMN client_longitude DOUBLE PRECISION NULL;
ALTER TABLE appointments ADD COLUMN client_postal_code VARCHAR(20) NULL;
ALTER TABLE appointments ADD COLUMN client_city VARCHAR(100) NULL;

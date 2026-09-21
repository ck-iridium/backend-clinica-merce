-- Migración: Clave Primaria Compuesta Multi-Tenant en profiles
-- Permite que un mismo auth.users.id pertenezca a múltiples negocios (tenants) con roles independientes.

DO $$
BEGIN
    -- 1. Asegurar que ningún perfil tenga tenant_id nulo
    UPDATE public.profiles 
    SET tenant_id = '00000000-0000-0000-0000-000000000001' 
    WHERE tenant_id IS NULL;

    -- 2. Actualizar foreign key de notifications para que apunte directamente a auth.users(id)
    -- Esto desvincula notifications de la clave primaria de profiles y la conecta con la identidad global
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE table_name = 'notifications' AND constraint_name = 'notifications_user_id_fkey'
    ) THEN
        ALTER TABLE public.notifications DROP CONSTRAINT notifications_user_id_fkey;
        ALTER TABLE public.notifications ADD CONSTRAINT notifications_user_id_fkey 
            FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
        RAISE NOTICE 'Foreign key notifications_user_id_fkey vinculada a auth.users(id)';
    END IF;

    -- 3. Eliminar la clave primaria simple sobre 'id' si todavía no es compuesta
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE table_name = 'profiles' AND constraint_type = 'PRIMARY KEY' AND constraint_name = 'profiles_pkey'
    ) THEN
        -- Comprobar si la clave primaria actual ya incluye tenant_id
        IF NOT EXISTS (
            SELECT 1
            FROM information_schema.key_column_usage
            WHERE table_name = 'profiles' AND constraint_name = 'profiles_pkey' AND column_name = 'tenant_id'
        ) THEN
            ALTER TABLE public.profiles DROP CONSTRAINT profiles_pkey;
            ALTER TABLE public.profiles ADD CONSTRAINT profiles_pkey PRIMARY KEY (id, tenant_id);
            RAISE NOTICE 'Clave primaria de profiles actualizada a (id, tenant_id)';
        END IF;
    ELSE
        ALTER TABLE public.profiles ADD CONSTRAINT profiles_pkey PRIMARY KEY (id, tenant_id);
        RAISE NOTICE 'Clave primaria compuesta creada en profiles';
    END IF;

    -- 4. Crear índice compuesto para acelerar búsquedas de perfil por email y clínica
    CREATE INDEX IF NOT EXISTS idx_profiles_email_tenant ON public.profiles(email, tenant_id);
END $$;

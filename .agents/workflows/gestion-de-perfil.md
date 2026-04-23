# Workflow: Gestión de Perfil de Usuario

Este workflow detalla el proceso de implementación de la página de perfil del usuario, incluyendo identidad, seguridad y preferencias de notificación.

## Estado del Proyecto

### ✅ FASE 1: Preparación de Base de Datos y Storage
**IMPORTANTE:** El administrador de la clínica debe ejecutar el siguiente bloque de SQL en el panel de Supabase (SQL Editor) antes de usar las nuevas funcionalidades del perfil.

```sql
-- 1. Añadir nuevas columnas de preferencias y avatar a la tabla profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS receive_email_appointments BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS receive_agenda_reminders BOOLEAN DEFAULT true;

-- 2. Crear bucket de Storage para Avatares si no existe
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Políticas de Seguridad (RLS) para el bucket 'avatars'

-- Permitir a cualquier usuario ver las imágenes públicas
CREATE POLICY "Avatar images are publicly accessible." 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'avatars' );

-- Permitir a los usuarios autenticados subir avatares en su propia carpeta (ID)
CREATE POLICY "Users can upload their own avatar." 
ON storage.objects FOR INSERT 
TO authenticated
WITH CHECK (
    bucket_id = 'avatars' AND 
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Permitir a los usuarios autenticados actualizar su propio avatar
CREATE POLICY "Users can update their own avatar."
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'avatars' AND 
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Permitir a los usuarios autenticados borrar su propio avatar
CREATE POLICY "Users can delete their own avatar."
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'avatars' AND 
    (storage.foldername(name))[1] = auth.uid()::text
);
```

### ✅ FASE 2: Interfaz de Navegación
1. Se ha actualizado el componente `DashboardSidebar` reemplazando el botón "Cerrar Sesión" directo por un componente DropdownMenu.
2. El Dropdown incluye acceso a "Mi Perfil" y la opción final de "Cerrar Sesión".

### 🚧 FASE 3: Interfaz del Perfil de Usuario (`/dashboard/profile`)
1. **Identidad**: Visualización y actualización del nombre completo y del avatar (usando Storage). Muestra del email de Solo Lectura.
2. **Seguridad**:
    - Formulario de actualización de contraseña utilizando `supabase.auth.updateUser`.
    - Muestra de la "Sesión Actual" informando al usuario desde qué dispositivo está conectado y facilitando un botón de cierre.
3. **Preferencias**: Toggles conectados a las nuevas columnas booleanas de notificaciones.

### ⏳ FASE 4: Refinamiento
1. Validación de Roles y compatibilidad con el hook `useAuthRole`.
2. Actualización de UI/UX en general para mantener coherencia visual con el resto del panel.

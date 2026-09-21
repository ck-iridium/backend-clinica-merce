# Plan de Implementación: Usuarios Multi-Tenant (Separación de Identidad y Membresía)

Este documento define la arquitectura técnica y el plan paso a paso para permitir que un mismo usuario (un mismo correo electrónico en Supabase Auth) pueda pertenecer a múltiples negocios/tenants con roles independientes en cada uno (por ejemplo, ser Administrador en Clínica Mercè y Administrador en Xabrios Peluquería).

---

## 1. Diagnóstico y Problema Actual

1. **Restricción Global de Supabase Auth**:
   Supabase Auth mantiene una tabla global única `auth.users` donde `email` tiene restricción `UNIQUE`. Cuando en `/dashboard/team` se invita a un correo que ya existe, `supabaseAdmin.auth.admin.inviteUserByEmail()` falla con `HTTP 422: "A user with this email address has already been registered"`.
2. **Clave Primaria en `public.profiles`**:
   Actualmente, `profiles.id` es la clave primaria única y coincide con `auth.users.id`. Esto impide que un usuario tenga más de una fila en `profiles`. Si se hiciera un `upsert`, sobrescribiría el perfil del negocio anterior.
3. **Eliminación Peligrosa en `deleteTeamMember`**:
   Si un miembro es eliminado del equipo de una clínica, la función llama a `supabaseAdmin.auth.admin.deleteUser(userId)`, lo cual destruiría la cuenta del usuario en todas las demás clínicas.
4. **Falta de Contexto de Tenant en Consultas de Perfil**:
   `getUserProfile(userId)` y `getUserRoleByEmail(email)` consultan sin filtrar por `tenant_id`, lo que colisionaría si un usuario tiene filas en múltiples clínicas.

---

## 2. Requisitos Previos y Garantías de Seguridad

> [!IMPORTANT]
> **Cero pérdida de datos**: Todos los perfiles actuales de Clínica Mercè y otros negocios se conservarán intactos. La migración no destruye ni modifica ninguna columna existente; únicamente amplía la clave primaria a una clave compuesta `(id, tenant_id)`.

---

## 3. Plan de Ejecución Paso a Paso

### Fase 1: Migración Segura de Base de Datos (`public.profiles`)

#### 1.1 Modificación de la Restricción en PostgreSQL
Actualmente `profiles.id` tiene la restricción `profiles_pkey PRIMARY KEY (id)`.
Vamos a convertirla en una clave primaria compuesta: `PRIMARY KEY (id, tenant_id)`.

```sql
-- Script de migración en backend/migrations/04_multitenant_profiles.sql y ejecución segura

-- 1. Asegurar que no existan valores NULL en tenant_id
UPDATE public.profiles 
SET tenant_id = '00000000-0000-0000-0000-000000000001' 
WHERE tenant_id IS NULL;

-- 2. Eliminar la restricción de Primary Key simple sobre 'id'
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_pkey;

-- 3. Crear la nueva Primary Key compuesta (id, tenant_id)
ALTER TABLE public.profiles ADD CONSTRAINT profiles_pkey PRIMARY KEY (id, tenant_id);

-- 4. Crear índice optimizado para búsquedas rápidas por email y tenant_id
CREATE INDEX IF NOT EXISTS idx_profiles_email_tenant ON public.profiles(email, tenant_id);
```

#### 1.2 Actualización del Modelo SQLAlchemy (`backend/app/models.py`)
En SQLAlchemy, definir ambos campos con `primary_key=True` establece de forma nativa la clave compuesta:

```python
class Profile(Base):
    __tablename__ = "profiles"
    id = Column(String(36), primary_key=True)
    tenant_id = Column(String(36), ForeignKey("tenants.id"), primary_key=True, index=True)
    full_name = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)
    role = Column(String, nullable=True)
    email = Column(String, nullable=True)
    status = Column(String, nullable=True)
    receive_email_appointments = Column(Boolean, default=True)
    receive_agenda_reminders = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
```

#### 1.3 Script de Ejecución Python de la Migración
Crearemos `backend/apply_multitenant_profiles_migration.py` para aplicar el SQL tanto en local como en la base de datos de producción (Supabase / Render) mediante SQLAlchemy con rollback en caso de cualquier inconsistencia.

---

### Fase 2: Lógica Condicional en Gestión de Equipo (`frontend/src/app/actions/team.ts`)

Modificaremos `inviteTeamMember` y `deleteTeamMember` para manejar tanto usuarios nuevos como usuarios que ya existen en la plataforma.

#### 2.1 Flujo Condicional en `inviteTeamMember`:
```typescript
// 1. Validar límite de especialistas del plan del inquilino (se mantiene)
...

// 2. Intentar invitar mediante Supabase Admin Auth
const { data: authData, error: authError } = await supabaseAdmin.auth.admin.inviteUserByEmail(data.email, {
  data: { full_name: data.full_name, role: data.role },
  redirectTo: redirectTo
});

let targetUserId: string | null = null;
let isExistingUser = false;

if (authError) {
  const msg = (authError.message || '').toLowerCase();
  
  // Si el usuario ya está registrado en Supabase Auth:
  if (
    msg.includes('already been registered') ||
    msg.includes('already registered') ||
    msg.includes('user already exists')
  ) {
    isExistingUser = true;

    // Localizar el UUID del usuario existente en auth.users
    const { data: usersList, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError || !usersList?.users) {
      return { success: false, error: "Error consultando usuarios existentes de la plataforma." };
    }

    const existingAuthUser = usersList.users.find(
      u => u.email?.toLowerCase() === data.email.toLowerCase()
    );

    if (!existingAuthUser) {
      return { success: false, error: "No se pudo recuperar la identidad del usuario." };
    }

    targetUserId = existingAuthUser.id;
  } else {
    // Si es un error real de Supabase (formato email inválido, rate limit, etc.)
    return { success: false, error: authError.message };
  }
} else {
  targetUserId = authData.user?.id || null;
}

if (!targetUserId) {
  return { success: false, error: "No se pudo obtener el identificador del usuario." };
}

// 3. Si ya existía, comprobar si YA tiene membresía en ESTE tenant específico
if (isExistingUser) {
  const { data: currentTenantProfile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', targetUserId)
    .eq('tenant_id', tenantId)
    .maybeSingle();

  if (currentTenantProfile) {
    return { 
      success: false, 
      error: "Este usuario ya forma parte del equipo de este negocio." 
    };
  }
}

// 4. Crear la membresía en `profiles` para el tenant actual
// Si ya existía en la plataforma, su cuenta ya tiene contraseña configurada -> status 'Activo'
// Si era nuevo y se le envió el email de invitación -> status 'Pendiente'
const memberStatus = isExistingUser ? 'Activo' : 'Pendiente';

const { error: dbError } = await supabaseAdmin.from('profiles').upsert(
  {
    id: targetUserId,
    tenant_id: tenantId,
    email: data.email,
    full_name: data.full_name,
    role: data.role,
    status: memberStatus
  },
  { onConflict: 'id,tenant_id' }
);

if (dbError) {
  return { success: false, error: dbError.message };
}

revalidatePath('/dashboard/team');
return { 
  success: true, 
  alreadyRegistered: isExistingUser 
};
```

#### 2.2 Blindaje de `deleteTeamMember`:
En `frontend/src/app/actions/team.ts`, **eliminar la llamada destructiva global**:
```typescript
// ANTES (PELIGROSO):
// await supabaseAdmin.auth.admin.deleteUser(userId);

// AHORA (SEGURO MULTI-TENANT):
// 1. Eliminar únicamente la vinculación de este usuario con el tenant actual en profiles
const { error: deleteProfileError } = await supabaseAdmin
  .from('profiles')
  .delete()
  .eq('id', userId)
  .eq('tenant_id', tenantId);

// 2. Verificar si al usuario le quedan otras clínicas en profiles
const { data: otherProfiles } = await supabaseAdmin
  .from('profiles')
  .select('tenant_id')
  .eq('id', userId);

// Solo si NO pertenece a ninguna otra clínica en todo el sistema se purga de Auth
if (!otherProfiles || otherProfiles.length === 0) {
  await supabaseAdmin.auth.admin.deleteUser(userId);
}
```

---

### Fase 3: Filtro por Contexto en Frontend (`useAuthRole`, `profile.ts`, `middleware.ts`)

#### 3.1 `frontend/src/app/actions/profile.ts`:
Actualizar las funciones que consultan el perfil del usuario para que utilicen el `tenant_id` contextual del servidor:
- **`getUserProfile(userId: string, targetTenantId?: string)`**:
  - Obtiene el `tenantId` de `targetTenantId` o de las cookies de la petición (`cookies().get('tenant_id')?.value`).
  - Filtra: `.eq('id', userId).eq('tenant_id', tenantId).maybeSingle()`.
- **`getUserRoleByEmail(email: string, targetTenantId?: string)`**:
  - Filtra: `.eq('email', email).eq('tenant_id', tenantId).maybeSingle()`.
- **`updateUserProfile(userId: string, updates: any)`**:
  - Filtra por `id` Y `tenant_id` para no alterar los datos del usuario en otra clínica.

#### 3.2 `frontend/src/hooks/useAuthRole.ts`:
- En el cliente, lee el `tenant_id` activo de la cookie (o subdominio).
- Al llamar a `getUserProfile(user.id, activeTenantId)`, recibe el perfil y rol específicos del negocio en el que se encuentra navegando.
- Si está en `esteticamerce.com` -> Devuelve Rol `administrador` (Clínica Mercè).
- Si está en `xabrios.probookia.com` -> Devuelve Rol `administrador` (Xabrios Peluquería).

---

## 4. Plan de Verificación y Testing

1. **Ejecutar la migración SQL**: Comprobar que `profiles_pkey` es ahora `(id, tenant_id)` y verificar que los usuarios y especialistas de Clínica Mercè siguen intactos.
2. **Prueba de Invitación Cruzada en `/dashboard/team`**:
   - Abrir el panel de Xabrios Peluquería (vía Modo Soporte o subdominio).
   - Invitar a `iridium_cop@hotmail.com` con el rol **Administrador**.
   - Validar que ya **NO** sale el error `"A user with this email address has already been registered"`.
   - Validar que Juan aparece en el listado de miembros de Xabrios Peluquería en estado **Activo**.
3. **Prueba de Integridad en Clínica Mercè**:
   - Entrar al panel de Clínica Mercè.
   - Comprobar que el equipo de Clínica Mercè sigue teniendo a sus administradores y especialistas originales sin alteraciones.
4. **Prueba de Roles Contextuales**:
   - Iniciar sesión con `iridium_cop@hotmail.com` y navegar a `esteticamerce.com/dashboard` -> Permisos totales como Admin de Mercè.
   - Navegar a `xabrios.probookia.com/dashboard` -> Permisos totales como Admin de Xabrios.

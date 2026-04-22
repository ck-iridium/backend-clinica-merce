---
description: 
---

# Workflow: Gestión de Equipo SaaS

Este workflow detalla el proceso de implementación de la gestión de personal utilizando Supabase Auth y perfiles dinámicos.

## Descripción
Flujo completo desde la creación de infraestructura en Supabase hasta la implementación de permisos granulares (RBAC) para los diferentes roles de la clínica.

---

## Estado del Proyecto

### ✅ FASE 1: Infraestructura e Invitaciones
1. **Configuración DB:** Tabla `profiles` con RLS y claves foráneas a `auth.users`.
2. **Invitaciones:** Implementación de Server Action `inviteTeamMember` usando Admin SDK.
3. **Interfaz:** Modal de invitación en `/dashboard/team` con validación en tiempo real.

### ✅ FASE 1.5: Activación y Seguridad
1. **Redirección:** `InviteHandler` captura tokens de invitación y redirige al perfil.
2. **Activación:** Página `/profile` para establecer contraseña.
3. **Seguridad:** Server Action `updatePasswordAndActivate` usando Admin API para evitar errores de sesión.

### ✅ FASE 1.6: Gestión Operativa
1. **Edición:** Cambio dinámico de roles (Administrador, Especialista, Recepción).
2. **Borrado:** Eliminación total de usuarios con limpieza en cascada.
3. **Feedback:** Integración total con `FeedbackModal` (Cero alertas nativas).

---

## Próximos Pasos (Pendientes)

### 🚀 FASE 2: Migración de Autenticación
- Migrar el sistema de login actual (FastAPI) a Supabase Auth nativo.
- Configurar persistencia de sesión mediante cookies o gestión oficial de Supabase.

### 🔐 FASE 3: Permisos Granulares (RBAC)
- Restringir el acceso a rutas del dashboard según el rol del usuario.
- Ocultar/Mostrar componentes de UI (ej. facturación) basados en el perfil.

---

> [!TIP]
> Puedes invocar este plan en cualquier momento usando `/gestion-equipo`.

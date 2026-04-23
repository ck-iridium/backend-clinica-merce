---
description: Gestión de infraestructura de personal y roles RBAC.
---

# Workflow: Gestión de Equipo

Este workflow detalla el proceso de implementación de la gestión de personal utilizando Supabase Auth y perfiles dinámicos.

## Descripción
Flujo completo desde la creación de infraestructura en Supabase hasta la implementación de permisos granulares (RBAC) para los diferentes roles de la clínica.

## Estado del Proyecto

### ✅ FASE 1: Infraestructura e Invitaciones
1. **Configuración DB:** tabla 'profiles' con RLS y claves foráneas a 'auth.users'.
2. **Invitaciones:** Implementación de Server Action 'InviteTeamMember' usando Admin SDK.
3. **Interfaz:** Modal de invitación en '/dashboard/team' con validación en tiempo real.

### ✅ FASE 1.5: Activación y Seguridad
1. **Redirección:** 'InviteHandler' captura tokens de invitación y redirige al perfil.
2. **Activación:** Página '/profile' para establecer contraseña.
3. **Seguridad:** Server action 'updatePasswordAndActivate' usando Admin API para evitar errores de sesión.

### ✅ FASE 1.6: Gestión Operativa
1. **Edición:** Cambio dinámico de roles (Administrador, Especialista, Recepción).
2. **Borrado:** Eliminación total de usuarios con limpieza en cascada.
3. **Feedback:** Integración total con 'FeedbackModal' (cero alertas nativas).

### ✅ FASE 2: Permisos Granulares (RBAC UI)
1. **Sidebar y Menú Móvil Dinámico:** Filtrado estricto por roles:
   - **Admin:** Acceso total.
   - **Recepción:** Agenda, Clientes, Facturas y Venta Rápida. (Oculta Equipo/Ajustes).
   - **Especialista:** Solo Agenda y Clientes. (Oculta Facturación/Ventas/Equipo/Ajustes).
2. **Protección de Rutas (Guards):** Redirección forzada en `/team`, `/invoices`, `/settings` y `/pos` según el privilegio del rol.
3. **UX de Carga:** Skeletons premium y validación asíncrona de roles antes de mostrar contenido sensible.

### ✅ FASE 3: Migración de Autenticación Nativa (Supabase Auth)
1. **Login Nativo:** Migración del sistema (/login) de FastAPI a Supabase Auth (`signInWithPassword`).
2. **Persistencia:** Gestión de sesión integrada con el hook `useAuthRole` para validación inmediata de perfiles.
3. **Seguridad:** Eliminación de dependencias del backend heredado para la autenticación de personal.

### ➡️ FASE 4: Experiencia de Usuario y Ajustes Personales
**Transición:** Iniciamos la gestión individual de cuentas. Ver [`gestion-de-perfil.md`](file:///c:/Users/Juan/MERCE/CLINICA%20MERCE/.agents/workflows/gestion-de-perfil.md) para más detalles.

---

> [!TIP]
> Puedes invocar este plan en cualquier momento usando `/gestion-de-equipo`.

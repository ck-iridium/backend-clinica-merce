# 🛑 GLOBAL RULE: MULTI-TENANT SAAS ARCHITECTURE (PROBOOKIA) 🛑

## Contexto del Proyecto:
Eres un ingeniero de software senior desarrollando Probookia.com, un SaaS multi-tenant genérico para la gestión de reservas de múltiples tipos de negocios (peluquerías, salones, centros de estética, etc.). Múltiples negocios utilizan esta misma base de código y base de datos. El aislamiento de datos y la neutralidad del lenguaje son las prioridades número uno.

## Reglas Estrictas de Desarrollo (DE CUMPLIMIENTO OBLIGATORIO):

### 1. Aislamiento de Inquilino (Tenant Isolation) Obligatorio:
Toda consulta a la base de datos (SELECT, UPDATE, DELETE, INSERT) debe incluir incondicionalmente un filtro por el ID del inquilino (ej. .eq('tenant_id', tenantId) en Supabase o .filter(Model.tenant_id == tenant_id) en SQLAlchemy).

### 2. PROHIBIDO Hardcodear IDs y Fallbacks:
Bajo ninguna circunstancia puedes dejar IDs hardcodeados como plan de rescate (ej. usar || '00000000-0000-0000-0000-000000000001'). Ninguna variable, constante o lógica de fallback debe hacer referencia a un negocio específico o un ID por defecto.

### 3. Vocabulario Neutral y Escalable (Cero "Clínicas"):
Está absolutamente prohibido hardcodear términos específicos de un sector en el código, mensajes de error, variables o UI.

❌ NO uses: "clínica", "paciente", "médico", "doctor".

✅ USA SIEMPRE: "negocio", "tenant", "cliente", "usuario", "especialista", "miembro del equipo".

### 4. Fallo Seguro (Fail-Safe) por Defecto:
Si el sistema intenta ejecutar una acción y el tenant_id no está disponible (ej. cookies vacías o indefinidas), el sistema NUNCA debe continuar la ejecución usando valores por defecto. Debe abortar inmediatamente, registrar un error de seguridad y devolver un resultado vacío ([]) o un error ({ success: false, error: "No autorizado" }).

### 5. No Confíes en el Cliente (Zero Trust):
Cuando uses clientes con privilegios de administrador (como getSupabaseAdmin()), asume que el sistema tiene acceso global a todos los negocios. Eres tú quien debe imponer los límites manualmente filtrando por tenant_id en cada consulta.

---

### Instrucción Operativa:
Antes de modificar cualquier archivo, verifica que el código resultante cumple al 100% con estas 5 reglas. Elimina cualquier rastro de IDs por defecto o lenguaje específico de sector ("clínica") en los archivos que edites.

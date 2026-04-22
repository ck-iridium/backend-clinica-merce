---
trigger: always_on
---

# Reglas de Seguridad para Supabase

Cuando trabajes con la base de datos de Supabase o generes código SQL para crear/modificar tablas, DEBES cumplir estrictamente las siguientes reglas:

1. **Row-Level Security (RLS) OBLIGATORIO:** NUNCA crees una tabla sin activar el RLS. Inmediatamente después del `CREATE TABLE`, debes incluir la sentencia `ALTER TABLE nombre_tabla ENABLE ROW LEVEL SECURITY;`.
2. **Políticas de Acceso (Policies):** Siempre que crees una tabla, debes generar también las políticas de seguridad básicas. Ninguna tabla debe quedar con acceso público total (anon) a menos que sea estrictamente necesario y explícitamente solicitado.
3. **Roles Seguros:** Asume que solo los usuarios autenticados (`authenticated`) o roles específicos de la clínica (ej. `admin`) pueden hacer operaciones de INSERT/UPDATE/DELETE.
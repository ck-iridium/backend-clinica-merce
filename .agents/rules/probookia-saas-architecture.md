# ARQUITECTURA SAAS MULTI-TENANT: PROBOOKIA.COM

Este documento define la estructura y principios arquitectónicos obligatorios para el desarrollo de la plataforma SaaS **ProBookia.com**, previniendo la confusión entre el motor del SaaS y sus clientes (inquilinos / tenants).

---

## 1. Claridad Conceptual

1. **La Plataforma SaaS**: **ProBookia.com**
   - Es el producto SaaS multitenant de gestión de citas, agendas, ventas, consentimiento y CMS para clínicas, centros de estética, y negocios de bienestar.
   - La arquitectura, el motor de base de datos, el panel de administración global (Super Admin) y la estructura de componentes compartidos pertenecen a **ProBookia.com**.

2. **El Primer Cliente (Tenant #1)**: **Clínica Mercè**
   - Es el inquilino inicial que utiliza ProBookia.com.
   - Tiene el ID de tenant: `'00000000-0000-0000-0000-000000000001'` y slug `'merce'`.
   - Utiliza la estética "Quiet Luxury" y sus propios colores/tipografías, definidos en `frontend-design-system.md` y `sistema-diseño.md`.

---

## 2. Reglas de Desarrollo de Software

### A. PROHIBIDO el Acoplamiento Fuerte (Hardcoding)
- **Evitar nombres estáticos**: Nunca asumas que toda la plataforma se llama "Clínica Mercè" o que todo tenant comparte su estética.
- **Configuración dinámica**: Los textos de la marca, logos, políticas de privacidad, teléfonos y datos de contacto deben obtenerse dinámicamente desde el backend o a través de la tabla `clinic_settings` o `tenants` filtrando por el tenant activo.
- **Separación de Vistas**:
  - Las landings de cara al cliente final (como la de reservas de Clínica Mercè) se nutren del contenido en `site_content` o de subcarpetas dinámicas basadas en el subdominio/slug.
  - La landing page principal de la raíz (`src/app/page.tsx`) representa la landing general del SaaS **ProBookia.com**, a menos que se trate de un despliegue monomarca o se acceda mediante el slug/subdominio correspondiente.

### B. Aislamiento de Datos (Multi-tenancy)
- Cada consulta a la base de datos (tanto en backend como en frontend) **debe estar aislada** por el `tenant_id`.
- En el backend y Supabase, las políticas de **Row-Level Security (RLS)** basadas en `current_setting('app.current_tenant_id')` aseguran que ningún tenant acceda a datos de otro.
- Cualquier tabla transaccional nueva **DEBE** incluir:
  ```sql
  ALTER TABLE nombre_tabla ADD COLUMN tenant_id VARCHAR(36) REFERENCES tenants(id) DEFAULT current_setting('app.current_tenant_id', true);
  ALTER TABLE nombre_tabla ENABLE ROW LEVEL SECURITY;
  ```

### C. Tematización y Diseño de Marca
- Aunque el primer cliente (Clínica Mercè) requiera una estética minimalista "Quiet Luxury" con colores Crema, Oro y Antracita, los componentes base de la plataforma deben ser lo suficientemente flexibles como para recibir tokens de diseño dinámicos o clases de Tailwind parametrizadas si en el futuro se añade otro tenant.
- Mantén los archivos de diseño de Clínica Mercè referenciados explícitamente como la tematización de este cliente (ej: `theme-merce`, o en variables cargadas de base de datos).

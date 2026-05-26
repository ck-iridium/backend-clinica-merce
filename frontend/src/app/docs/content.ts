export interface DocSubpage {
  id: string;
  title: string;
  markdown: string;
}

export interface DocSection {
  id: string;
  title: string;
  subpages: DocSubpage[];
}

export const DOCS_CONTENT: DocSection[] = [
  {
    id: 'arquitectura-core',
    title: 'Sección 1: Arquitectura Core & Seguridad',
    subpages: [
      {
        id: 'que-es-probookia',
        title: '¿Qué es ProBookia?',
        markdown: `# ¿Qué es ProBookia?

ProBookia es un ecosistema SaaS global de nivel premium diseñado exclusivamente para la automatización, gestión y reserva de citas en centros médicos, clínicas de estética y salones de wellness de alta gama.

A diferencia de las plataformas de agendamiento genéricas del mercado, ProBookia opera como una **marca blanca de lujo invisible** que empodera la identidad visual del negocio ante su paciente final, mientras gestiona internamente la facturación simplificada, el TPV, el control de personal por RBAC y la resiliencia en la nube.

---

### Módulos Principales del Ecosistema

1. **ERP Clínico de Alta Ocupación**: Gestión de calendarios interactivos en tiempo real con aislamiento de agendas por especialista y prevención de colisiones.
2. **TPV & Facturación Express**: Módulo de venta rápida de servicios y bonos, sincronizado con series impositivas personalizadas y emisión de presupuestos.
3. **Motor de Reservas Web de Marca Blanca**: Portal de reserva interactivo en 3 pasos adaptable a los colores corporativos, logotipo y dominio propio de cada clínica.
4. **Asistentes de Inteligencia Artificial**: Generador de copy SEO, creador conceptual de imágenes y un co-piloto por voz que interpreta comandos verbales del personal.`
      },
      {
        id: 'aislamiento-multi-tenant',
        title: 'Aislamiento Multi-Tenant & RLS',
        markdown: `# Aislamiento Multi-Tenant & RLS

La seguridad y privacidad en ProBookia se rigen por estándares de **seguridad de nivel bancario**. La arquitectura multi-tenant garantiza un aislamiento de datos absoluto entre organizaciones (inquilinos), imposibilitando fugas accidentales de información.

---

### Row-Level Security (RLS) en PostgreSQL
El corazón del aislamiento de datos reside directamente en el motor de base de datos relacional de Supabase (PostgreSQL). Ninguna consulta transaccional puede eludir los filtros RLS del sistema.

1. **Habilitación Obligatoria**: Cada tabla del esquema (servicios, citas, clientes, etc.) activa RLS inmediatamente tras su creación:
\`\`\`sql
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
\`/ \`

2. **Middleware Transaccional**: El framework FastAPI intercepta cada petición REST entrante, lee el TenantID verificado en el token JWT o cabeceras, y ejecuta en el pool de conexión una variable local temporal:
\`\`\`sql
SET LOCAL app.current_tenant_id = :tenant_id;
\`\`\`

3. **Política de Seguridad Inviolable**: Las consultas son filtradas de forma implícita mediante la siguiente regla:
\`\`\`sql
CREATE POLICY tenant_isolation_policy ON appointments
    AS RESTRICTIVE
    USING (tenant_id = current_setting('app.current_tenant_id', true));
\`\`\`

Esto garantiza que el personal de la clínica "A" jamás pueda consultar, insertar, modificar o eliminar registros de la clínica "B", incluso si se produce un error a nivel de código de aplicación.`
      },
      {
        id: 'vip-impersonation',
        title: 'VIP Impersonation & Tokens',
        markdown: `# VIP Impersonation & Tokens de Soporte

El mantenimiento de clínicas de alto nivel requiere una asistencia de soporte ágil pero sumamente controlada. ProBookia soluciona este dilema mediante un **Modo de Impersonación Segura** con sello criptográfico.

---

### Mecánica de Acceso Seguro

Cuando un cliente solicita soporte avanzado, el equipo de administración no solicita su contraseña ni accede mediante cuentas genéricas. En su lugar, la consola del **Super Admin** genera una impersonación controlada:

1. **Generación de Token por Firma**: El servidor genera un token JWT firmado digitalmente mediante un secreto maestro con algoritmo **HMAC SHA-256**.
2. **Expiración Estricta de 2 Horas**: El payload del token contiene la marca de impersonación y una vigencia limitada en el tiempo:
\`\`\`json
{
  "impersonate": "true",
  "tenant_id": "UUID_DEL_TENANT",
  "slug": "slug-de-la-clinica",
  "exp": "TIMESTAMP_FUTURO_2_HORAS"
}
\`\`\`

3. **Aislamiento en Peticiones**: El token se inyecta en las cabeceras HTTP de Next.js. El backend interpreta las credenciales temporales y scoped, permitiendo al especialista de soporte resolver dudas viendo la pantalla exactamente igual que el cliente final.
4. **Pistas de Auditoría Transparente**: Cada acceso bajo el claim \`impersonate: true\` queda registrado en un log inalterable en base de datos, garantizando la total transparencia y protección contra mal uso.`
      }
    ]
  },
  {
    id: 'catalogo-i18n',
    title: 'Sección 2: Módulo de Catálogo & i18n',
    subpages: [
      {
        id: 'estructura-catalogo',
        title: 'Estructura Jerárquica',
        markdown: `# Estructura Jerárquica del Catálogo

ProBookia organiza el catálogo de tratamientos de forma modular y asimétrica, facilitando la creación de menús de navegación ágiles e intuitivos para el cliente final.

---

### Entidades y Relaciones

* **Categorías Principales**: Agrupadores semánticos (ej: "Estética Facial", "Medicina Corporal") con un índice de ordenación visual (\`order_index\`) que define su disposición en el Mega Menú.
* **Tratamientos / Servicios**: Fichas individuales de tratamiento que contienen duración en minutos, inversión económica base, fianza requerida y preferencias de layout (split de vídeo o imagen de fondo).
* **Slugs Técnicos Compuestos**: Las direcciones URL de los tratamientos se generan dinámicamente, pero bajo una restricción de unicidad compuesta:
\`\`\`
UNIQUE (tenant_id, slug)
\`\`\`
Esto permite que dos clínicas independientes tengan el servicio \`/tratamientos/facial/limpieza-hidratante\` en sus respectivos subdominios de marca blanca sin provocar colisiones globales en la base de datos.`
      },
      {
        id: 'gestion-masiva',
        title: 'Gestión Masiva (Data Tables)',
        markdown: `# Gestión Masiva (Data Tables)

Para evitar que los administradores de clínicas con grandes volúmenes de tratamientos se saturen con paneles de texto masivos, la plataforma implementa una **Data Table Avanzada**.

---

### Capacidades del Panel de Gestión

1. **Filtros e Indexación Rápida**: Buscador difuso (Fuzzy Search) integrado para localizar servicios en menos de 5ms mediante reactividad en cliente.
2. **Truncamiento Inteligente**: Descripciones y contenidos de texto largos son truncados mediante CSS con micro-detalles en hover, manteniendo la retícula de la tabla impecable.
3. **Edición en Masa**: Módulo preparado para realizar actualizaciones masivas de precios de inversión base y duraciones medias de tratamientos por categoría, reduciendo a segundos tareas operativas complejas.
4. **Toggles de Estado**: Activación o desactivación inmediata (\`is_active\`, \`is_featured\`) con respuesta reactiva y confirmaciones suaves sin ventanas emergentes del navegador.`
      },
      {
        id: 'consentimientos-base64',
        title: 'Consentimientos en Base64',
        markdown: `# Consentimientos Informados & Firmas en Base64

La protección y el consentimiento del paciente son fundamentales en tratamientos de medicina estética o wellness avanzado. ProBookia incluye un **Módulo de Consentimientos Informados con Firma Digitalizada Novedosa**.

---

### Captura y Almacenamiento Criptográfico

Para eliminar el papel físico y cumplir rigurosamente con normativas internacionales (LOPD / RGPD):

1. **Generación de Plantillas**: El administrador define plantillas asociadas a tratamientos específicos (ej: consentimiento de Toxina Botulínica).
2. **Firma Manuscrita Digitalizada**: El paciente lee el consentimiento en una tablet o smartphone en recepción y dibuja su firma directamente sobre la pantalla en un componente interactivo HTML Canvas.
3. **Conversión y Almacenamiento en Base64**: La firma se convierte instantáneamente en una representación compacta de texto **Base64 (PNG transparente)**:
\`\`\`
data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...
\`\`\`
4. **Vinculación con Sello de Tiempo**: La cadena Base64 se guarda asociada a la ficha del cliente en una base de datos segura junto con un hash inalterable del texto del consentimiento y un sello de tiempo UTC. Esto garantiza que el consentimiento firmado es jurídicamente vinculante y que la firma no puede asociarse a otro documento de forma fraudulenta.`
      },
      {
        id: 'i18n-jsonb',
        title: 'Internacionalización Nativa i18n',
        markdown: `# Internacionalización Nativa i18n

El software ProBookia está preparado para el mercado global. La plataforma soporta la traducción instantánea de catálogos y comunicaciones en múltiples idiomas (Español, Inglés y Francés).

---

### Arquitectura de Traducciones JSONB

Para evitar la redundancia de registros de base de datos o el uso de tablas secundarias lentas:

1. **Esquema de Base de Datos**: El motor relacional de Supabase utiliza columnas de tipo de datos \`JSONB\` para los campos de traducción (\`translations\`):
\`\`\`sql
ALTER TABLE services ADD COLUMN translations JSONB DEFAULT '{}'::jsonb;
\`\`\`

2. **Estructura Interna del Payload**: Las claves se estructuran jerárquicamente por código de idioma e identificador del campo:
\`\`\`json
{
  "en": {
    "name": "Luxury Deep Hydration",
    "description": "Premium facial treatment using high-grade dynamic serums."
  },
  "fr": {
    "name": "Hydratation Profonde de Luxe",
    "description": "Soin du visage haut de gamme utilisant des sérums dynamiques."
  }
}
\`\`\`

3. **Resolución en Cliente**: El hook \`useLanguage()\` en combinación con helpers de traducción evalúa el idioma del navegador o la preferencia del cliente y extrae instantáneamente el nodo correspondiente del JSONB sin provocar latencia extra en la base de datos.`
      }
    ]
  },
  {
    id: 'ia-copiloto',
    title: 'Sección 3: Motor IA (Co-Piloto por Voz)',
    subpages: [
      {
        id: 'limites-conversacionales',
        title: 'Límites Conversacionales Inteligentes',
        markdown: `# Límites Conversacionales Inteligentes

El Asistente IA de ProBookia (Asistente Global por Voz) está blindado contra la saturación visual e informática tradicional de las interfaces de chat de lenguaje natural.

---

### Reglas de Control del Agente

Para garantizar un rendimiento fluido y evitar atascos visuales:

1. **Máximo 3 Ítems por Respuesta**: El prompt maestro de la IA prohíbe de forma inviolable listar más de 3 ítems en formato de texto plano. Si existen más resultados, la IA debe resumir el contexto de forma agregada.
2. **Redirecciones Visuales Dinámicas**: En lugar de redactar extensas explicaciones de cómo realizar una acción o mostrar grandes listas, la IA utiliza payloads JSON invisibles para guiar al frontend del usuario a realizar redirecciones a la pantalla correspondiente (ej: redirigir a \`/dashboard/settings?tab=branding\`).
3. **Tono Profesional de Lujo**: El tono de comunicación de la IA está calibrado bajo la filosofía "Boutique", respondiendo de forma clara, ejecutiva y sofisticada sin adornos innecesarios.`
      },
      {
        id: 'procesamiento-voz',
        title: 'Procesamiento de Voz & Payloads',
        markdown: `# Procesamiento de Voz & Payloads

La IA no es una simple capa decorativa; tiene la capacidad de ejecutar lógica de negocio real a través de comandos verbales de forma instantánea.

---

### Flujo de Ejecución de Comandos

1. **Captura y Transcripción**: El micrófono del usuario registra el flujo de audio y lo transcribe con alta precisión.
2. **Análisis de Intención (Intent Parsing)**: El backend alimentado con Google Gemini 2.5 Flash evalúa la semántica de la orden (ej: *"Pon el color de acento primario en dorado y guárdalo"*).
3. **Generación de Payload Estructurado**: La IA genera una llamada de función JSON parametrizada:
\`\`\`json
{
  "action": "update_branding",
  "params": {
    "accent_color_primary": "#D4AF37",
    "branding_palette_id": "custom"
  }
}
\`\`\`
4. **Ejecución Atómica**: El middleware procesa la acción ejecutando una mutación en base de datos relacional y actualizando instantáneamente la interfaz del usuario en tiempo real sin necesidad de recargar la página.`
      }
    ]
  },
  {
    id: 'reservas-frontend',
    title: 'Sección 4: Pasarela & Frontend Cliente',
    subpages: [
      {
        id: 'iframe-reservas',
        title: 'Iframe / Widget de Reservas',
        markdown: `# Iframe / Widget de Reservas Integrable

ProBookia permite que las clínicas conviertan su tráfico web en citas consolidadas mediante la integración de un widget responsivo en cualquier página web.

---

### Mecánica de Integración

* **Código Compacto**: Las clínicas pueden insertar un iframe transparente de carga ultrarrápida:
\`\`\`html
<iframe 
  src="https://merce.probookia.com/reservar?embed=true" 
  style="width:100%; height:750px; border:none;" 
  allow="payment">
</iframe>
\`\`\`
* **Adaptación de Estilos Dinámica**: El iframe lee los tokens visuales guardados por la clínica en la tabla \`ClinicSettings\`. Los botones, fuentes tipográficas y colores del wizard se inyectan en tiempo de ejecución, por lo que el cliente final experimenta una transición sin cortes de marca.`
      },
      {
        id: 'fianzas-connect',
        title: 'Fianzas & Stripe Connect',
        markdown: `# Fianzas & Stripe Connect Standard

Las ausencias injustificadas (*no-shows*) representan una pérdida importante de facturación en centros premium. ProBookia soluciona este problema mediante **Stripe Connect**.

---

### Onboarding & Pasarela Segura

1. **Enlace Directo**: A través del panel de ajustes, el propietario de la clínica vincula su cuenta estándar de Stripe en pocos clics.
2. **Control de Fianzas Dinámico**:
   * **Depósitos Específicos**: El administrador puede configurar una fianza (ej: 40€) para un servicio quirúrgico o de alto valor en particular.
   * **Depósito Global Obligatorio**: Obliga a realizar un abono parcial por reserva online de forma general.
3. **Cobro Directo Seguro**: El dinero del depósito se procesa directamente en la pasarela de la clínica, garantizando que el tiempo del especialista queda protegido financieramente incluso si el paciente no asiste.`
      },
      {
        id: 'cron-purga',
        title: 'Cron de Purga de Citas',
        markdown: `# Cron de Purga de Citas Temporales

El motor de reservas emplea un sistema de confirmación segura (Doble Opt-in). Esto requiere una administración eficiente de los slots de tiempo del calendario.

---

### Mecánica de Liberación de Slots

Para evitar que usuarios malintencionados o abandonos de procesos de reserva bloqueen horas valiosas del calendario:

1. **Estado Temporal**: Al seleccionar hora y rellenar sus datos en el wizard, la cita se registra en estado \`pending_verification\`.
2. **Ejecución del Cron en Backend**: Un servicio programado (\`cleanup-unverified\`) en el servidor relacional se ejecuta automáticamente cada **30 minutos**.
3. **Eliminación de Huérfanas**: El cron escanea citas en estado de verificación pendiente que superen el límite de tolerancia establecido.
4. **Liberación Instantánea**: Las citas que exceden los 30 minutos de antigüedad sin haber sido validadas por el enlace único del correo electrónico son **purgadas y eliminadas atómicamente de la base de datos**, liberando inmediatamente el slot de tiempo en la agenda pública.`
      },
      {
        id: 'soporte-modo-oscuro',
        title: 'Soporte Visual & Modo Oscuro',
        markdown: `# Soporte Visual & Blindaje del Modo Oscuro

El diseño visual "Quiet Luxury" de ProBookia requiere un comportamiento impecable de los contrastes, contornos y fondos.

---

### Blindaje del Canvas en Modo Oscuro

Para garantizar una experiencia visual prémium y evitar filtraciones de color o rebordes blancos desagradables:

* **Inyección de CSS Variables**: Las variables de marca se inyectan en el HTML principal del frontend:
\`\`\`css
:root {
  --primary: #D4AF37;
  --radius-card: 2rem;
  --background: #FAFAFA;
}
.dark {
  --background: #0C0A09; /* Antracita profundo */
}
\`\`\`
* **Blindaje de Grillas**: Todos los grids de tarjetas de servicios y calendarios emplean clases dinámicas de Tailwind (\`bg-card\`, \`border-border/40\`, \`text-foreground\`) impidiendo contornos claros y asegurando que las tipografías Serif destaquen de forma impecable en fondos oscuros.`
      }
    ]
  }
];

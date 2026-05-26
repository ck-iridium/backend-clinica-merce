export interface DocSubpage {
  id: string;
  title: Record<string, string>;
  markdown: Record<string, string>;
}

export interface DocSection {
  id: string;
  title: Record<string, string>;
  subpages: DocSubpage[];
}

export const DOCS_CONTENT: DocSection[] = [
  {
    id: 'arquitectura-core',
    title: {
      es: 'Sección 1: Arquitectura Core & Seguridad',
      en: 'Section 1: Core Architecture & Security',
      fr: 'Section 1: Architecture Core & Sécurité'
    },
    subpages: [
      {
        id: 'que-es-probookia',
        title: {
          es: '¿Qué es ProBookia?',
          en: 'What is ProBookia?',
          fr: 'Qu\'est-ce que ProBookia?'
        },
        markdown: {
          es: `# ¿Qué es ProBookia?

ProBookia es un ecosistema SaaS global de nivel premium diseñado exclusivamente para la automatización, gestión y reserva de citas en centros médicos, clínicas de estética y salones de wellness de alta gama.

A diferencia de las plataformas de agendamiento genéricas del mercado, ProBookia opera como una **marca blanca de lujo invisible** que empodera la identidad visual del negocio ante su paciente final, mientras gestiona internamente la facturación simplificada, el TPV, el control de personal por RBAC y la resiliencia en la nube.

---

### Módulos Principales del Ecosistema

1. **ERP Clínico de Alta Ocupación**: Gestión de calendarios interactivos en tiempo real con aislamiento de agendas por especialista y prevención de colisiones.
2. **TPV & Facturación Express**: Módulo de venta rápida de servicios y bonos, sincronizado con series impositivas personalizadas y emisión de presupuestos.
3. **Motor de Reservas Web de Marca Blanca**: Portal de reserva interactivo en 3 pasos adaptable a los colores corporativos, logotipo y dominio propio de cada clínica.
4. **Asistentes de Inteligencia Artificial**: Generador de copy SEO, creador conceptual de imágenes y un co-piloto por voz que interpreta comandos verbales del personal.`,
          en: `# What is ProBookia?

ProBookia is a global B2B premium SaaS ecosystem designed exclusively for scheduling, management, and online bookings in medical clinics, aesthetic centers, and high-end wellness salons.

Unlike generic scheduling systems on the market, ProBookia operates as an **invisible luxury white-label engine** that empowers the business's visual identity before the final patient, while managing billing, POS, RBAC team permission matrices, and cloud resilience internally.

---

### Core Ecosystem Modules

1. **High-Occupancy Clinical ERP**: Real-time calendar dashboard with specialist agendas and collision prevention systems.
2. **TPV & Express Invoicing**: Instant service and voucher POS checkout, synced with custom taxes and deluxe PDF quotes.
3. **White-Label Booking Wizard**: High-conversion 3-step scheduling wizard adaptable to each clinic's custom branding palette and logo.
4. **AI Co-Pilot Integrations**: Voice command interpreting copilot, SEO copy creator, and generative visual design tools.`,
          fr: `# Qu'est-ce que ProBookia?

ProBookia est un écosystème SaaS B2B de luxe conçu pour l'automatisation, la gestion et la réservation en ligne dans les cliniques esthétiques, centres médicaux et salons de bien-être haut de gamme.

Contrairement aux plateformes d'agenda génériques du marché, ProBookia fonctionne comme une **marque blanche de luxe invisible** qui renforce l'identité visuelle de l'entreprise auprès de ses patients, tout en gérant la facturation, le TPV, le contrôle RBAC de l'équipe et la résilience cloud.

---

### Principaux Modules de l'Écosystème

1. **ERP Clinique à Haute Occupation**: Tableaux de bord d'agenda interactifs avec isolation des rendez-vous par spécialiste.
2. **Facturation Express & TPV**: Module de paiement instantané pour soins et bons d'achat, synchronisé avec des factures PDF de luxe.
3. **Moteur de Réservation en Marque Blanche**: Portail de réservation en 3 étapes adaptable aux couleurs et logos exclusifs de chaque centre.
4. **Assistance IA Intégrée**: Co-pilote par commande vocale, générateur de textes SEO et outils de création d'images.`
        }
      },
      {
        id: 'aislamiento-multi-tenant',
        title: {
          es: 'Aislamiento Multi-Tenant & RLS',
          en: 'Multi-Tenant Isolation & RLS',
          fr: 'Isolation Multi-Tenant & RLS'
        },
        markdown: {
          es: `# Aislamiento Multi-Tenant & RLS

La seguridad y privacidad en ProBookia se rigen por estándares de **seguridad de nivel bancario**. La arquitectura multi-tenant garantiza un aislamiento de datos absoluto entre organizaciones, imposibilitando fugas accidentales de información.

---

### Row-Level Security (RLS) en PostgreSQL
El corazón del aislamiento de datos reside directamente en el motor de base de datos relacional de Supabase (PostgreSQL). Ninguna consulta transaccional puede eludir los filtros RLS del sistema.

1. **Habilitación Obligatoria**: Cada tabla del esquema (servicios, citas, clientes, etc.) activa RLS inmediatamente tras su creación:
\`\`\`sql
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
\`\`\`

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

Esto garantiza que el personal de la clínica "A" jamás pueda consultar, insertar, modificar o eliminar registros de la clínica "B", incluso si se produce un error a nivel de código de aplicación.`,
          en: `# Multi-Tenant Isolation & RLS

Security and privacy in ProBookia are governed by rigorous **banking-level security standards**. The multi-tenant architecture guarantees absolute database isolation between organizations, preventing any cross-tenant data leaks.

---

### PostgreSQL Row-Level Security (RLS)
Data isolation is enforced directly within the Supabase relational database engine (PostgreSQL). No transactional queries can bypass the RLS database rules.

1. **Mandatory Activation**: Every database table (services, appointments, clients) enables RLS immediately after creation:
\`\`\`sql
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
\`\`\`

2. **Transactional Middleware**: The FastAPI backend intercepts incoming REST requests, extracts the verified TenantID from the JWT claims, and initializes a local database session parameter:
\`\`\`sql
SET LOCAL app.current_tenant_id = :tenant_id;
\`\`\`

3. **Inviolable Database Policy**: All queries are automatically scoped using the restrictive tenant context:
\`\`\`sql
CREATE POLICY tenant_isolation_policy ON appointments
    AS RESTRICTIVE
    USING (tenant_id = current_setting('app.current_tenant_id', true));
\`\`\`

This guarantees that Clinic "A" operators can never select, insert, update, or delete records belonging to Clinic "B", even in the event of application-level bugs.`,
          fr: `# Isolation Multi-Tenant & RLS

La confidentialité dans ProBookia est protégée par des normes de **sécurité de niveau bancaire**. L'architecture multi-tenant garantit une isolation de base de données absolue entre centres, évitant toute fuite d'informations.

---

### Row-Level Security (RLS) avec PostgreSQL
L'isolation des données est appliquée au cœur du moteur relationnel Supabase (PostgreSQL). Aucune requête transactionnelle ne peut contourner les règles RLS.

1. **Activation Obligatoire**: Chaque table du schéma active la sécurité au niveau de la ligne immédiatement après sa création:
\`\`\`sql
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
\`\`\`

2. **Middleware Transactionnel**: Le backend FastAPI intercepte chaque requête, lit l'identifiant TenantID vérifié dans le jeton JWT et exécute un paramètre local temporaire dans la session:
\`\`\`sql
SET LOCAL app.current_tenant_id = :tenant_id;
\`\`\`

3. **Règle de Sécurité Restrictive**:
\`\`\`sql
CREATE POLICY tenant_isolation_policy ON appointments
    AS RESTRICTIVE
    USING (tenant_id = current_setting('app.current_tenant_id', true));
\`\`\`

Cela garantit que l'opérateur du Centre "A" ne pourra jamais lire ou modifier les données appartenant au Centre "B", assurant un blindage total.`
        }
      },
      {
        id: 'vip-impersonation',
        title: {
          es: 'VIP Impersonation & Tokens',
          en: 'VIP Impersonation & Tokens',
          fr: 'Impersonation VIP & Tokens'
        },
        markdown: {
          es: `# VIP Impersonation & Tokens de Soporte

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
4. **Pistas de Auditoría Transparente**: Cada acceso bajo el claim \`impersonate: true\` queda registrado en un log inalterable en base de datos, garantizando la total transparencia y protección contra mal uso.`,
          en: `# VIP Impersonation & Support Tokens

Providing live support for prestigious clients requires an agile yet strictly controlled mechanism. ProBookia resolves this through a cryptographically signed **Secure Impersonation Mode**.

---

### Secure Impersonation Mechanism

When a clinic owner requests live technical assistance, support staff do not request passwords. Instead, the **Super Admin Console** generates an ephemeral, restricted session token:

1. **HMAC SHA-256 JWT Signature**: The server signs a digital token using a master secret.
2. **Strict 2-Hour Expiration**: The JWT payload contains the support scope and a limited lease time:
\`\`\`json
{
  "impersonate": "true",
  "tenant_id": "TENANT_UUID",
  "slug": "clinic-slug",
  "exp": "TIMESTAMP_FUTURE_2_HOURS"
}
\`\`\`

3. **Scoped HTTP Injections**: The token is set in the Next.js request headers. The API resolves the claims, letting the support developer diagnose layouts exactly as the tenant owner sees them.
4. **Transparent Audit Logging**: All support actions executed under the \`impersonate: true\` claim are logged in an immutable database audit trail, protecting data integrity.`,
          fr: `# Impersonation VIP & Sessions de Support

Offrir une assistance en direct aux cliniques prestigieuses requiert un mécanisme agile et contrôlé. ProBookia résout cela avec un **Mode Impersonation Sécurisé** signé par cryptographie.

---

### Mécanisme d'Impersonation Sécurisé

Lorsqu'un propriétaire demande du support, les agents n'utilisent pas de mots de passe. La console **Super Admin** génère un jeton temporaire et restreint:

1. **Signature Criptographique HMAC SHA-256**: Le serveur génère un jeton JWT sécurisé.
2. **Expiration Stricte de 2 Heures**: Le payload contient les détails de la session d'assistance:
\`\`\`json
{
  "impersonate": "true",
  "tenant_id": "TENANT_UUID",
  "slug": "slug-clinique",
  "exp": "TIMESTAMP_FUTUR_2_HEURES"
}
\`\`\`

3. **Injection dans les Requêtes**: Le jeton est interprété par Next.js, permettant au développeur de diagnostiquer l'interface avec les mêmes droits que le client.
4. **Journaux d'Audit Transparent**: Chaque action d'impersonation est enregistrée de manière immuable, garantissant le respect de la confidentialité des données.`
        }
      }
    ]
  },
  {
    id: 'catalogo-i18n',
    title: {
      es: 'Sección 2: Módulo de Catálogo & i18n',
      en: 'Section 2: Catalog & i18n Controls',
      fr: 'Section 2: Catalogue & Outils i18n'
    },
    subpages: [
      {
        id: 'estructura-catalogo',
        title: {
          es: 'Estructura Jerárquica',
          en: 'Hierarchical Structure',
          fr: 'Structure Hiérarchique'
        },
        markdown: {
          es: `# Estructura Jerárquica del Catálogo

ProBookia organiza el catálogo de tratamientos de forma modular y asimétrica, facilitando la creación de menús de navegación ágiles e intuitivos para el cliente final.

---

### Entidades y Relaciones

* **Categorías Principales**: Agrupadores semánticos (ej: "Estética Facial", "Medicina Corporal") con un índice de ordenación visual (\`order_index\`) que define su disposición en el Mega Menú.
* **Tratamientos / Servicios**: Fichas individuales de tratamiento que contienen duración en minutos, inversión económica base, fianza requerida y preferencias de layout.
* **Slugs Técnicos Compuestos**: Las direcciones URL de los tratamientos se generan dinámicamente, bajo una restricción de unicidad compuesta:
\`\`\`
UNIQUE (tenant_id, slug)
\`\`\`
Esto permite que dos clínicas independientes tengan el servicio \`/tratamientos/facial/limpieza-hidratante\` en sus respectivos subdominios de marca blanca sin provocar colisiones globales en la base de datos.`,
          en: `# Hierarchical Catalog Structure

ProBookia structures service catalogs in an asymmetric, modular layout, enabling fast and intuitive website menus for patients.

---

### Database Entities & Rules

* **Main Categories**: Semantic grouping (e.g. "Facial Aesthetics", "Body Treatments") sorted via a visual \`order_index\` that determines their placement inside the Mega Menu.
* **Treatments & Services**: Individual listings storing duration, price, required connect deposit, and media preferences.
* **Composite Technical Slugs**: Treatment URLs are calculated dynamically using a multi-tenant composite constraint:
\`\`\`
UNIQUE (tenant_id, slug)
\`\`\`
This enables two independent clinics to publish the path \`/treatments/facial/deep-hydration\` on their white-label domains without triggering database index collisions.`,
          fr: `# Structure Hiérarchique du Catalogue

ProBookia organise les traitements de manière modulaire, ce qui facilite la création de menus intuitifs pour les patients.

---

### Entités et Relations

* **Catégories Principales**: Regroupements sémantiques (ex: "Esthétique Faciale") avec un index de tri visuel (\`order_index\`) pour la disposition du Méga Menu.
* **Soins & Services**: Fiches individuelles contenant la durée, l'investissement de base, le dépôt de garantie requis et les préférences visuelles.
* **Slugs Techniques Composés**: Les chemins URL sont générés à l'aide d'une restriction d'unicité composée:
\`\`\`
UNIQUE (tenant_id, slug)
\`\`\`
Cela permet à deux centres d'avoir l'adresse \`/soins/visage/nettoyage\` sans causer de conflits dans la base de données.`
        }
      },
      {
        id: 'gestion-masiva',
        title: {
          es: 'Gestión Masiva (Data Tables)',
          en: 'Mass Controls (Data Tables)',
          fr: 'Gestion Massive (Data Tables)'
        },
        markdown: {
          es: `# Gestión Masiva (Data Tables)

Para evitar que los administradores de clínicas con grandes volúmenes de tratamientos se saturen con paneles de texto masivos, la plataforma implementa una **Data Table Avanzada**.

---

### Capacidades del Panel de Gestión

1. **Filtros e Indexación Rápida**: Buscador difuso (Fuzzy Search) integrado para localizar servicios en menos de 5ms mediante reactividad en cliente.
2. **Truncamiento Inteligente**: Descripciones y contenidos de texto largos son truncados mediante CSS con micro-detalles en hover, manteniendo la retícula de la tabla impecable.
3. **Edición en Masa**: Módulo preparado para realizar actualizaciones masivas de precios de inversión base y duraciones medias de tratamientos por categoría, reduciendo a segundos tareas operativas complejas.
4. **Toggles de Estado**: Activación o desactivación inmediata (\`is_active\`, \`is_featured\`) con respuesta reactiva y confirmaciones suaves sin ventanas emergentes del navegador.`,
          en: `# Mass Management & Data Tables

To prevent clinical administrators with hundreds of listings from experiencing visual fatigue, the platform deploys an **Advanced Client-Side Data Table**.

---

### Management Features

1. **Fuzzy Search Filtration**: Highly responsive search indices matching treatments in less than 5ms via reactive state.
2. **Smart CSS Truncation**: Text summaries are kept within boundary lines, using smooth hover states to reveal full copy and maintain visual alignment.
3. **Bulk Database Mutations**: Prepared framework to apply bulk price changes and duration shifts across service categories instantly.
4. **Smooth Status Toggles**: Immediate toggle updates (\`is_active\`, \`is_featured\`) using non-blocking visual feedbacks.`,
          fr: `# Gestion Massive & Data Tables

Pour éviter la fatigue visuelle des administrateurs gérant des centaines de soins, la plateforme déploie une **Data Table Avancée** dans le panneau d'administration.

---

### Fonctionnalités de Gestion

1. **Filtre Fuzzy Search**: Moteur de recherche réactif en moins de 5ms sur le frontend.
2. **Tronquage Intelligent CSS**: Les textes longs sont masqués de manière fluide et révélés au survol pour maintenir la grille propre.
3. **Mises à Jour en Lot**: Module préparé pour appliquer des ajustements de tarifs et de durées sur une catégorie complète en quelques secondes.
4. **Toggles d'État Réactifs**: Activation ou désactivation instantanée (\`is_active\`, \`is_featured\`) avec notifications sonner discrètes.`
        }
      },
      {
        id: 'consentimientos-base64',
        title: {
          es: 'Consentimientos en Base64',
          en: 'Base64 Signature Capture',
          fr: 'Signatures Base64'
        },
        markdown: {
          es: `# Consentimientos Informados & Firmas en Base64

La protección y el consentimiento del paciente son fundamentales en tratamientos de medicina estética o wellness avanzado. ProBookia incluye un **Módulo de Consentimientos Informados con Firma Digitalizada**.

---

### Captura y Almacenamiento Criptográfico

Para eliminar el papel físico y cumplir rigurosamente con normativas internacionales (LOPD / RGPD):

1. **Generación de Plantillas**: El administrador define plantillas asociadas a tratamientos específicos (ej: consentimiento de Toxina Botulínica).
2. **Firma Manuscrita Digitalizada**: El paciente lee el consentimiento en una tablet o smartphone en recepción y dibuja su firma directamente sobre la pantalla en un componente interactivo HTML Canvas.
3. **Conversión y Almacenamiento en Base64**: La firma se convierte instantáneamente en una representación compacta de texto **Base64 (PNG transparente)**:
\`\`\`
data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...
\`\`\`
4. **Vinculación con Sello de Tiempo**: La cadena Base64 se guarda asociada a la ficha del cliente en una base de datos segura junto con un hash inalterable del texto del consentimiento y un sello de tiempo UTC. Esto garantiza que el consentimiento firmado es jurídicamente vinculante y que la firma no puede asociarse a otro documento de forma fraudulenta.`,
          en: `# Consent Forms & Base64 Signature Capture

Patient consent is a legal pillar in clinical aesthetics and advanced wellness. ProBookia integrates an automated **Paperless Digital Signature Module**.

---

### Cryptographic Capture & Storage

To completely eliminate printed papers while maintaining strict GDPR and HIPAA compliance:

1. **Consent Templates**: Managers bind legal consent sheets to specific service treatments.
2. **Canvas Signature Capture**: Patients read terms on a tablet or phone, drawing their handwritten signature directly inside an HTML Canvas block.
3. **Base64 Image Export**: The signature is instantly converted to a compact, single-line **Base64 PNG string**:
\`\`\`
data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...
\`\`\`
4. **Immutable Database Ledger**: The Base64 string is stored securely under the patient's record, linked to a cryptographically hashed sum of the consent text and a UTC timestamp. This guarantees the signed document is legally binding and prevents unauthorized reuse.`,
          fr: `# Formulaires de Consentement & Signatures Base64

Le consentement légal du patient est obligatoire dans les cliniques esthétiques. ProBookia intègre un **Module de Signature Numérique sans Papier**.

---

### Capture et Stockage Criptographique

Pour éliminer complètement les dossiers papier et respecter les réglementations RGPD:

1. **Modèles Juridiques**: L'administrateur associe des formulaires de consentement à des traitements esthétiques spécifiques.
2. **Signature sur Écran tactile**: Le patient signe avec son doigt ou un stylet directement sur une tablette via un composant HTML Canvas interactif.
3. **Exportation Base64**: La signature est convertie en une chaîne compacte **Base64 PNG**:
\`\`\`
data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...
\`\`\`
4. **Sceau Temporel Sécurisé**: La chaîne de texte est stockée avec un hachage immuable du texte signé et un horodatage UTC, prouvant l'intégrité légale du document.`
        }
      },
      {
        id: 'i18n-jsonb',
        title: {
          es: 'Internacionalización Nativa i18n',
          en: 'Native i18n Translations',
          fr: 'Traductions Native i18n'
        },
        markdown: {
          es: `# Internacionalización Nativa i18n

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

3. **Resolución en Cliente**: El hook \`useLanguage()\` en combinación con helpers de traducción evalúa el idioma del navegador o la preferencia del cliente y extrae instantáneamente el nodo correspondiente del JSONB sin provocar latencia extra en la base de datos.`,
          en: `# Native i18n Translation Architecture

ProBookia is built for international clinics, natively supporting immediate translation shifts across Spanish, English, and French.

---

### PostgreSQL JSONB Translation Schema

To bypass slow table joins or duplicate service entries:

1. **Database Schema**: The Supabase relational tables use optimized \`JSONB\` fields to host all custom translations (\`translations\`):
\`\`\`sql
ALTER TABLE services ADD COLUMN translations JSONB DEFAULT '{}'::jsonb;
\`\`\`

2. **Internal Payload Node**: Node data is organized by language prefix and fields:
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

3. **Client-Side Resolution**: The React \`useLanguage()\` hook matches active client preferences, rendering target language nodes instantly with zero query delay.`,
          fr: `# Architecture de Traduction Native i18n

ProBookia est conçu pour le marché international, supportant le basculement immédiat entre l'Espagnol, l'Anglais et le Français.

---

### Stockage JSONB PostgreSQL Optimisé

Pour éviter des jointures lentes ou des entrées de catalogue dupliquées:

1. **Schéma de Table**: Les tables Supabase utilisent des colonnes \`JSONB\` pour héberger les traductions personnalisées (\`translations\`):
\`\`\`sql
ALTER TABLE services ADD COLUMN translations JSONB DEFAULT '{}'::jsonb;
\`\`\`

2. **Structure de Données**:
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

3. **Résolution Instantanée**: Le hook client \`useLanguage()\` filtre et affiche le bon nœud linguistique en temps réel, garantissant des performances maximales.`
        }
      }
    ]
  },
  {
    id: 'ia-copiloto',
    title: {
      es: 'Sección 3: Motor IA (Co-Piloto por Voz)',
      en: 'Section 3: AI Voice Co-Pilot',
      fr: 'Section 3: Co-Pilote Vocal IA'
    },
    subpages: [
      {
        id: 'limites-conversacionales',
        title: {
          es: 'Límites Conversacionales Inteligentes',
          en: 'Smart Conversational Limits',
          fr: 'Limites Conversationnelles'
        },
        markdown: {
          es: `# Límites Conversacionales Inteligentes

El Asistente IA de ProBookia (Asistente Global por Voz) está blindado contra la saturación visual e informática tradicional de las interfaces de chat de lenguaje natural.

---

### Reglas de Control del Agente

Para garantizar un rendimiento fluido y evitar atascos visuales:

1. **Máximo 3 Ítems por Respuesta**: El prompt maestro de la IA prohíbe de forma inviolable listar más de 3 ítems en formato de texto plano. Si existen más resultados, la IA debe resumir el contexto de forma agregada.
2. **Redirecciones Visuales Dinámicas**: En lugar de redactar extensas explicaciones de cómo realizar una acción o mostrar grandes listas, la IA utiliza payloads JSON invisibles para guiar al frontend del usuario a realizar redirecciones a la pantalla correspondiente (ej: redirigir a \`/dashboard/settings?tab=branding\`).
3. **Tono Profesional de Lujo**: El tono de comunicación de la IA está calibrado bajo la filosofía "Boutique", respondiendo de forma clara, ejecutiva y sofisticada sin adornos innecesarios.`,
          en: `# Smart Conversational Agent Limits

The ProBookia Voice Assistant is secured against visual clutter and standard textual saturation inside modern AI chat widgets.

---

### Strict Agent Prompts

To preserve screen spaces and enforce a quiet, high-end experience:

1. **Maximum of 3 List Items**: The AI's master prompt strictly forbids outputting more than 3 flat results. If more services/clients are resolved, the assistant summarizes data in aggregate groups.
2. **Dynamic UI Redirects**: Instead of displaying long step-by-step texts, the AI includes invisible JSON payloads. The frontend intercepts these and instantly transitions user focus to the correct dashboard (e.g. redirecting to \`/dashboard/settings?tab=branding\`).
3. **Quiet Luxury Tone**: The AI writes in a sophisticated, brief, clinical executive tone, avoiding chatty default generic styling.`,
          fr: `# Limites Conversationnelles de l'Assistant

L'Assistant Vocal ProBookia est programmé pour éviter la saturation textuelle et visuelle dans les fenêtres de discussion.

---

### Consignes de Contrôle de l'Agent

Pour préserver l'espace de l'écran et garantir une expérience utilisateur fluide:

1. **Maximum de 3 Éléments par Liste**: Le prompt système interdit d'afficher plus de 3 résultats textuels. L'IA regroupe et résume les données au-delà de cette limite.
2. **Redirections d'Interface**: Au lieu d'écrire des guides d'utilisation, l'IA envoie des payloads JSON invisibles. L'interface change automatiquement d'écran (ex: redirection vers \`/dashboard/settings?tab=branding\`).
3. **Ton "Quiet Luxury"**: L'IA s'exprime dans un style professionnel, court et sophistiqué, sans blabla inutile.`
        }
      },
      {
        id: 'procesamiento-voz',
        title: {
          es: 'Procesamiento de Voz & Payloads',
          en: 'Voice Inputs & JSON Payloads',
          fr: 'Traitement de la Voix & Payloads'
        },
        markdown: {
          es: `# Procesamiento de Voz & Payloads

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
4. **Ejecución Atómica**: El middleware procesa la acción ejecutando una mutación en base de datos relacional y actualizando instantáneamente la interfaz del usuario en tiempo real sin necesidad de recargar la página.`,
          en: `# Voice Input Processing & JSON Payloads

The integrated AI is not decorative; it executes live backend updates directly using voice inputs.

---

### Command Execution Pipeline

1. **Audio Recording**: The browser captures voice clips, converting them to high-fidelity strings.
2. **Intent Parsing**: The Gemini 2.5 backend reads the audio intent (e.g. *"Set the primary branding color to gold and save"*).
3. **Structured Payload Output**: The AI outputs structured JSON function calls:
\`\`\`json
{
  "action": "update_branding",
  "params": {
    "accent_color_primary": "#D4AF37",
    "branding_palette_id": "custom"
  }
}
\`\`\`
4. **Atomic Mutations**: The dashboard middleware parses the JSON payload, writing colors instantly to the database and re-rendering styling instantly without page refreshes.`,
          fr: `# Traitement Vocal & Payloads JSON

L'IA intégrée n'est pas décorative; elle exécute des modifications de base de données directement à partir de la voix.

---

### Pipeline d'Exécution des Commandes

1. **Enregistrement Audio**: Le navigateur capture la voix et la convertit en texte de haute précision.
2. **Analyse de l'Intention**: Le moteur Gemini 2.5 évalue le sens de la commande (ex: *"Mets la couleur dorée en accent et sauvegarde"*).
3. **Génération du Payload JSON**: L'IA renvoie des appels système structurés:
\`\`\`json
{
  "action": "update_branding",
  "params": {
    "accent_color_primary": "#D4AF37",
    "branding_palette_id": "custom"
  }
}
\`\`\`
4. **Mutation Atomique**: L'interface intercepte le message, applique les styles en base de données et met à jour l'affichage en direct sans recharger la page.`
        }
      }
    ]
  },
  {
    id: 'reservas-frontend',
    title: {
      es: 'Sección 4: Pasarela & Frontend Cliente',
      en: 'Section 4: Booking Gateway & Client Visuals',
      fr: 'Section 4: Tunnel de Réservation'
    },
    subpages: [
      {
        id: 'iframe-reservas',
        title: {
          es: 'Iframe / Widget de Reservas',
          en: 'Embeddable Booking Widget',
          fr: 'Widget & Iframe Intégrable'
        },
        markdown: {
          es: `# Iframe / Widget de Reservas Integrable

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
* **Adaptación de Estilos Dinámica**: El iframe lee los tokens visuales guardados por la clínica en la tabla \`ClinicSettings\`. Los botones, fuentes tipográficas y colores del wizard se inyectan en tiempo de ejecución, por lo que el cliente final experimenta una transición sin cortes de marca.`,
          en: `# Embeddable Booking Widget & Iframes

ProBookia turns third-party traffic into high-converting clinic bookings through secure, responsive iframe widgets.

---

### Integration Specifications

* **Compact Integration Snippet**: Clinic owners embed a single clean, transparent iframe:
\`\`\`html
<iframe 
  src="https://merce.probookia.com/reservar?embed=true" 
  style="width:100%; height:750px; border:none;" 
  allow="payment">
</iframe>
\`\`\`
* **Dynamic Styling Engine**: The iframe dynamically reads brand values from the \`ClinicSettings\` schema. Custom fonts, radii, and brand colors inject instantly on load, maintaining the clinic's luxury identity.`,
          fr: `# Widget & Iframe de Réservation Intégrable

ProBookia transforme le trafic web en rendez-vous qualifiés grâce à un composant widget/iframe sécurisé et responsive.

---

### Caractéristiques d'Intégration

* **Intégration Simplifiée**: Les cliniques insèrent une ligne HTML épurée:
\`\`\`html
<iframe 
  src="https://merce.probookia.com/reservar?embed=true" 
  style="width:100%; height:750px; border:none;" 
  allow="payment">
</iframe>
\`\`\`
* **Styles Dynamiques Hérités**: Le widget hérite en direct des variables (\`ClinicSettings\`). Les polices, arrondis et boutons s'injectent au chargement, assurant une parfaite cohérence visuelle.`
        }
      },
      {
        id: 'fianzas-connect',
        title: {
          es: 'Fianzas & Stripe Connect',
          en: 'Stripe Connect Escrows',
          fr: 'Garanties Stripe Connect'
        },
        markdown: {
          es: `# Fianzas & Stripe Connect Standard

Las ausencias injustificadas representan una pérdida importante de facturación en centros premium. ProBookia soluciona este problema mediante **Stripe Connect**.

---

### Onboarding & Pasarela Segura

1. **Enlace Directo**: A través del panel de ajustes, el propietario de la clínica vincula su cuenta estándar de Stripe en pocos clics.
2. **Control de Fianzas Dinámico**:
   * **Depósitos Específicos**: El administrador puede configurar una fianza (ej: 40€) para un servicio quirúrgico o de alto valor en particular.
   * **Depósito Global Obligatorio**: Obliga a realizar un abono parcial por reserva online de forma general.
3. **Cobro Directo Seguro**: El dinero del depósito se procesa directamente en la pasarela de la clínica, garantizando que el tiempo del especialista queda protegido financieramente incluso si el paciente no asiste.`,
          en: `# Connect Escrows & Safe Deposits

No-shows represent a severe loss of income for premium spas. ProBookia shields clinical hours using **Stripe Connect Standard**.

---

### Onboarding & Escrow Mechanics

1. **Direct Link**: Owners link their standard Stripe account in two clicks within settings.
2. **Dynamic Escrow Controls**:
   * **Service-Specific Deposits**: Managers set distinct deposits (e.g. $50) for high-value surgical appointments.
   * **Global Required Deposit**: Option to enforce a general advance fee across all web bookings.
3. **Direct Checkout Flow**: Monies land directly in the clinic's merchant account, securing revenue even if patients miss the appointment.`,
          fr: `# Dépôts de Garantie Stripe Connect

Les rendez-vous manqués représentent une lourde perte de revenus. ProBookia protège le planning de l'équipe grâce à **Stripe Connect Standard**.

---

### Fonctionnement des Acomptes Sécurisés

1. **Liaison Directe**: Les centres connectent leur compte Stripe standard en 2 clics dans les paramètres.
2. **Garanties Flexibles**:
   * **Dépôts par Soin**: L'administrateur définit des garanties élevées (ex: 50€) pour les chirurgies ou soins coûteux.
   * **Acompte Général Obligatoire**: Applique un acompte forfaitaire sur l'ensemble du portail.
3. **Transfert Instantané**: Les fonds sont crédités directement sur le compte de la clinique, protégeant son chiffre d'affaires en cas d'absence.`
        }
      },
      {
        id: 'cron-purga',
        title: {
          es: 'Cron de Purga de Citas',
          en: 'Orphan Appointments Cron',
          fr: 'Cron de Nettoyage Citas'
        },
        markdown: {
          es: `# Cron de Purga de Citas Temporales

El motor de reservas emplea un sistema de confirmación segura (Doble Opt-in). Esto requiere una administración eficiente de los slots de tiempo del calendario.

---

### Mecánica de Liberación de Slots

Para evitar que usuarios malintencionados o abandonos de procesos de reserva bloqueen horas valiosas del calendario:

1. **Estado Temporal**: Al seleccionar hora y rellenar sus datos en el wizard, la cita se registra en estado \`pending_verification\`.
2. **Ejecución del Cron en Backend**: Un servicio programado (\`cleanup-unverified\`) en el servidor relacional se ejecuta automáticamente cada **30 minutos**.
3. **Eliminación de Huérfanas**: El cron escanea citas en estado de verificación pendiente que superen el límite de tolerancia establecido.
4. **Liberación Instantánea**: Las citas que exceden los 30 minutos de antigüedad sin haber sido validadas por el enlace único del correo electrónico son **purgadas y eliminadas atómicamente de la base de datos**, liberando inmediatamente el slot de tiempo en la agenda pública.`,
          en: `# Orphan Appointments Cleanup Cron

The public booking wizard triggers double opt-in confirmations. To protect calendars from abandoned slots, ProBookia executes a clean scheduler.

---

### Time-Slot Release Pipeline

To stop malicious locking or incomplete flows from booking premium slots indefinitely:

1. **Pending State**: Upon selecting a slot, appointments write as \`pending_verification\`.
2. **30-Minute Backend Cron**: A recurrent cron utility (\`cleanup-unverified\`) runs every **30 minutes** on the main engine.
3. **Verification Scan**: The task scans entries in pending state that exceed the time threshold.
4. **Atomic Eviction**: If unconfirmed via email within 30 minutes, the appointment is **atomically purged**, instantly releasing the slot for public booking.`,
          fr: `# Nettoyage de Rendez-vous Orphelins

Le tunnel utilise un système de double opt-in. Pour éviter que des abandons ne bloquent des créneaux, ProBookia exécute un cron automatique.

---

### Libération des Créneaux Horaires

Pour empêcher les réservations inachevées de bloquer indéfiniment des plages horaires:

1. **État Temporaire**: Le rendez-vous s'enregistre avec le statut \`pending_verification\`.
2. **Cron Serveur Automatique**: Une tâche récurrente (\`cleanup-unverified\`) s'exécute toutes les **30 minutes**.
3. **Scan de Tolérance**: Le script identifie les enregistrements restés non confirmés au-delà du délai limite.
4. **Suppression Atomique**: Si la validation par email n'est pas reçue sous 30 minutes, le rendez-vous est **supprimé de la base de données**, libérant immédiatement le créneau pour d'autres clients.`
        }
      },
      {
        id: 'soporte-modo-oscuro',
        title: {
          es: 'Soporte Visual & Modo Oscuro',
          en: 'Dark Mode Safeguards',
          fr: 'Sécurité Mode Sombre'
        },
        markdown: {
          es: `# Soporte Visual & Blindaje del Modo Oscuro

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
* **Blindaje de Grillas**: Todos los grids de tarjetas de servicios y calendarios emplean clases dinámicas de Tailwind (\`bg-card\`, \`border-border/40\`, \`text-foreground\`) impidiendo contornos claros y asegurando que las tipografías Serif destaquen de forma impecable en fondos oscuros.`,
          en: `# Visual Safeguards & Dark Mode Protection

ProBookia's "Quiet Luxury" styling demands consistent borders, text legibility, and canvas transitions.

---

### Dark Mode Canvas Shielding

To guarantee a clean high-end dark appearance and prevent white flash lines or broken grids:

* **Tailored Variable Injections**: CSS tokens inject at HTML levels:
\`\`\`css
:root {
  --primary: #D4AF37;
  --radius-card: 2rem;
  --background: #FAFAFA;
}
.dark {
  --background: #0C0A09; /* Deep luxury anthracite */
}
\`\`\`
* **Contrast Boundary Shielding**: Treatment cards and schedules utilize responsive Tailwind utilities (\`bg-card\`, \`border-border/40\`, \`text-foreground\`) blocking generic white borders and enforcing pristine text readability.`,
          fr: `# Sécurité Mode Sombre & Contrastes Visuels

Le design "Quiet Luxury" exige des bordures nettes, des contrastes reposants et un rendu sans défaut.

---

### Protection Mode Sombre

Pour éviter les lignes blanches ou contrastes brisés lors du passage au mode sombre:

* **Injection Dynamique de Variables**:
\`\`\`css
:root {
  --primary: #D4AF37;
  --radius-card: 2rem;
  --background: #FAFAFA;
}
.dark {
  --background: #0C0A09; /* Anthracite profond */
}
\`\`\`
* **Grilles Blindées**: Les cartes et calendriers utilisent des classes Tailwind fluides (\`bg-card\`, \`border-border/40\`) pour préserver l'harmonie du mode sombre.`
        }
      }
    ]
  }
];

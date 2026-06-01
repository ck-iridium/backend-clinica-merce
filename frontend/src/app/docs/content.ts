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
  },
  {
    id: 'configuracion-operativa',
    title: {
      es: 'Sección 5: Configuración Operativa & Perfil de Negocio',
      en: 'Section 5: Operational Setup & Business Profile',
      fr: 'Section 5: Configuration Opérationnelle & Profil'
    },
    subpages: [
      {
        id: 'plan-suscripcion',
        title: {
          es: 'Plan y Suscripción',
          en: 'Plan & Subscription',
          fr: 'Forfait & Abonnement'
        },
        markdown: {
          es: `# Plan y Suscripción del Negocio
          
ProBookia ofrece escalabilidad total y transparente en sus niveles de servicio. Los administradores pueden cambiar de plan en cualquier momento desde el panel de control.

---

### Niveles de Planes Disponibles

1. **Free / Autónomos**: Diseñado para profesionales individuales. Permite 1 especialista, 1 sede física y hasta 50 citas mensuales.
2. **Basic / Clínicas**: Hasta 3 especialistas, 2 sedes físicas, herramientas CRM estándar y facturación simplificada.
3. **Pro / Centros**: Especialistas y sedes ilimitados, gestión de comisiones de personal, exportación de auditorías e integraciones SMTP.
4. **Gold Elite**: Acceso prioritario, TPV completo de arqueo de caja, agente IA Webmaster conversacional con renderización interactiva y Co-piloto por voz.

> [!NOTE]
> Las actualizaciones de plan calculan un prorrateo automático sobre los días restantes de tu ciclo de facturación mensual mediante Stripe Subscriptions, asegurando cargos exactos y sin sorpresas.`,
          en: `# Business Plan & Subscription
          
ProBookia offers absolute and transparent scalability. Business administrators can transition between plans at any time directly through the client dashboard settings.

---

### Available Subscription Tiers

1. **Free / Solo**: Designed for individual practitioners. Includes 1 active specialist, 1 physical center location, and up to 50 appointments/month.
2. **Basic / Clinics**: Supports up to 3 specialists, 2 physical locations, standard CRM tools, and express invoices.
3. **Pro / Medical Centers**: Unlimited specialists and locations, advanced commission structures, CSV audits, and SMTP private mail relays.
4. **Gold Elite**: Priority support, full cashier registers (POS), real-time interactive AI Webmaster iframe editors, and Voice Copilots.

> [!NOTE]
> Upgrade and downgrade mutations are handled dynamically via Stripe Subscriptions using prorated adjustments based on the remaining days of your active billing period.`,
          fr: `# Forfait & Abonnement d'Entreprise
          
ProBookia propose une évolutivité totale de ses services. Les administrateurs peuvent changer de forfait à tout moment dans le panneau de contrôle.

---

### Forfaits Disponibles

1. **Free / Indépendant**: Conçu pour les professionnels solos. 1 spécialiste, 1 centre et 50 rendez-vous/mois.
2. **Basic / Cliniques**: Jusqu'à 3 spécialistes, 2 centres physiques, CRM standard et facturation simplifiée.
3. **Pro / Centres Médicaux**: Spécialistes et centres illimités, commissions d'équipe, exports CSV et SMTP privé.
4. **Gold Elite**: Support prioritaire, TPV de caisse complet, agent IA Webmaster interactif et Co-pilote vocal en direct.

> [!NOTE]
> Les modifications d'abonnement calculent automatiquement un prorata sur la période de facturation en cours grâce à Stripe.`
        }
      },
      {
        id: 'perfil-empresa',
        title: {
          es: 'Perfil de la Empresa',
          en: 'Company Profile',
          fr: 'Profil de l\'Entreprise'
        },
        markdown: {
          es: `# Perfil de la Empresa
          
La identidad legal, fiscal y de contacto de la clínica se centraliza en la pestaña General del panel de Ajustes. Estos datos alimentan automáticamente tus facturas legales, pie de página y enlaces sociales del portal público de reserva.

---

### Atributos Configurables

* **Nombre Comercial**: El nombre que verán los clientes en la landing page y notificaciones.
* **Nombre Legal del Titular (DNI/CIF)**: Razón social del titular mercantil de la clínica.
* **Número de Registro Sanitario**: Campo opcional para certificar la validez clínica ante los inspectores de salud locales.
* **Dirección Completa**: Ubicación principal o sede fiscal de la empresa.
* **Descripción del Negocio (Footer)**: Breve copy que aparecerá en el pie de página de la landing page comercial.
* **Redes Sociales**: Enlaces verificados para redirigir tráfico a Instagram, WhatsApp o Google Maps de la clínica.`,
          en: `# Company Profile Settings
          
The legal, billing, and contact assets of your organization are configured inside the General settings tab. This schema automatically feeds transactional invoices, footer elements, and booking page headers.

---

### Configurable Attributes

* **Commercial Name**: The business name displayed to clients in booking assistants and notifications.
* **Legal Owner Name (DNI/CIF)**: The official corporate name of the tax entity.
* **Health Registry Number**: Optional field to certify clinical compliance before regional health inspectors.
* **Full Address**: Physical primary headquarters or legal corporate fiscal address.
* **Business Description (Footer)**: Short custom pitch text rendering inside the public landing page footer.
* **Social Links**: Verified paths for direct redirection to Instagram, WhatsApp, or Google Maps directions.`,
          fr: `# Profil de l'Entreprise
          
L'identité légale et fiscale du centre est centralisée dans l'onglet Général des paramètres. Ces données remplissent automatiquement vos factures, bas de page et liens sociaux.

---

### Attributs Configurables

* **Nom Commercial**: Le nom affiché aux clients sur le portail et les rappels.
* **Nom Légal du Titulaire (DNI/CIF)**: La raison sociale ou entité fiscale.
* **Numéro d'Enregistrement Sanitaire**: Optionnel, certifie la conformité clinique du centre.
* **Adresse Complète**: Siège social principal ou adresse de facturation de l'entreprise.
* **Description du Bas de Page**: Court paragraphe de présentation visible sur le portail public.
* **Réseaux Sociaux**: Liens directs vers Instagram, WhatsApp ou Google Maps.`
        }
      },
      {
        id: 'agenda-horarios',
        title: {
          es: 'Agenda, Horarios y Descanso',
          en: 'Agenda, Hours & Breaks',
          fr: 'Agenda, Horaires & Pauses'
        },
        markdown: {
          es: `# Agenda, Horarios y Descanso
          
ProBookia proporciona un motor de agendamiento robusto que respeta estrictamente los tiempos libres y límites operativos de tu personal.

---

### Ajustes del Horario Hábil

* **Apertura y Cierre Semanal**: Configura la hora exacta en la que tu clínica inicia y finaliza operaciones (ej: 09:00 - 20:00).
* **Definición de Descansos (Lunch Breaks)**: Define el inicio y fin del periodo de descanso del equipo (ej: 14:00 - 15:00). Durante este intervalo, la agenda pública bloqueará automáticamente cualquier intento de reserva de citas.
* **Días Laborables**: Toggles interactivos para activar o desactivar días de la semana completos (ej: de lunes a viernes activos, sábados y domingos inactivos).
* **Sincronización Multi-Especialista**: Si un especialista tiene asignado un horario individual más restrictivo, el sistema priorizará la disponibilidad individual sobre el horario general de la sede.`,
          en: `# Calendar, Operating Hours & Breaks
          
ProBookia deploys a robust scheduling framework that strictly honors clinic breaks, hours, and staff shifts.

---

### Operating Hours Rules

* **Weekly Opening & Closing**: Set the exact hours the physical center starts and stops clinical operations (e.g. 09:00 - 20:00).
* **Lunch Break Windows**: Configure break start and end targets (e.g. 14:00 - 15:00). During these windows, the booking engine blocks all online reservation attempts.
* **Working Days**: Active weekly toggles (e.g. Monday-Friday toggled active, Saturday-Sunday toggled inactive).
* **Multi-Specialist Rostering**: Individual specialist shift overrides are automatically prioritised over general global clinic operating hours.`,
          fr: `# Agenda, Heures d'Ouverture & Pauses
          
ProBookia fournit un moteur de planification qui respecte scrupuleusement les temps de repos et les horaires de votre équipe.

---

### Paramètres des Horaires de Travail

* **Ouverture et Fermeture Hebdomadaire**: Configurez l'heure exacte de début et de fin d'activité (ex: 09h00 - 20h00).
* **Pauses Déjeuner (Lunch Breaks)**: Définissez le début et la fin de l'intervalle de pause collective (ex: 14h00 - 15h00). L'agenda public bloque les réservations sur ce créneau.
* **Jours Ouvrables**: Boutons interactifs pour activer ou désactiver les jours de la semaine (ex: du lundi au vendredi).
* **Sincronisation Multi-Spécialiste**: Si un membre a des horaires individuels, le système les applique en priorité sur les horaires du centre.`
        }
      },
      {
        id: 'bloqueos-festivos',
        title: {
          es: 'Bloqueos, Festivos y Antelación',
          en: 'Blocks, Holidays & Lead Time',
          fr: 'Blocages, Congés & Anticipation'
        },
        markdown: {
          es: `# Bloqueos, Festivos y Antelación de Citas
          
La prevención de colisiones horarias y la planificación ordenada son claves para mantener un servicio premium y evitar cancelaciones imprevistas.

---

### Vacaciones y Festivos (Ausencias)

Desde el panel de Agenda, los administradores pueden registrar ausencias temporales o periodos de vacaciones de la clínica:
1. **Motivo de la Ausencia**: Título informativo (ej: "Vacaciones de Verano", "Festivo Local").
2. **Intervalo Temporal**: Rango exacto con fecha de inicio y fecha de fin.
3. **Repetición Anual**: Interruptor para automatizar el bloqueo de los mismos días año tras año.

### Tiempo de Antelación Mínimo para Reservas

Para evitar sorpresas con pacientes agendando citas sobre la hora, puedes configurar un límite de antelación mínimo (configurable en horas o minutos):
* **Ejemplo**: Si configuras **3 horas de antelación**, un paciente que visite tu portal a las 15:00 solo podrá elegir franjas horarias a partir de las 18:00 de ese mismo día. Esto protege los horarios del equipo y permite preparar los gabinetes adecuadamente.`,
          en: `# Blocks, Holidays & Booking Lead Time
          
Collision prevention and organized planning are essential to maintain a premium standard and avoid last-minute customer changes.

---

### Holidays & Temporary Absences

Within the Agenda settings tab, managers can register custom center breaks and national holidays:
1. **Absence Reason**: Text label (e.g. "Summer Holidays", "Local Holiday").
2. **Date Range**: Precise start date and end date boundaries.
3. **Annual Recurrence**: Dynamic switch to automate the calendar block year after year.

### Minimum Booking Lead Time

To prevent unexpected patients booking appointments too close to their target slot, configure a lead time threshold (in hours/minutes):
* **Example**: If set to **3 hours**, a patient browsing your online booking portal at 15:00 will only be offered slots starting at 18:00 or later on that day. This grants specialists the buffer time needed to prepare treatment rooms.`,
          fr: `# Blocages, Congés & Anticipation des Réservations
          
La prévention des conflits d'horaires et la planification ordonnée sont essentielles pour maintenir un service haut de gamme et éviter les annulations tardives.

---

### Congés & Absences Temporaires

Dans les paramètres de l'agenda, les administrateurs peuvent enregistrer les congés du centre:
1. **Motif de l'Absence**: Titre explicatif (ex: "Congés d'Été").
2. **Dates de Début et Fin**: Intervalle de blocage dans le calendrier.
3. **Répétition Annuelle**: Interrupteur pour automatiser le blocage chaque année.

### Délai d'Anticipation Minimum

Pour éviter les surprises avec des rendez-vous pris à la dernière minute, configurez un délai minimum (en heures ou minutes):
* **Exemple**: Si configuré sur **3 heures**, un patient naviguant sur le site à 15h00 ne pourra choisir qu'un créneau disponible à partir de 18h00.`
        }
      }
    ]
  },
  {
    id: 'canales-servicio-pagos',
    title: {
      es: 'Sección 6: Canales de Servicio & Pasarela de Pagos',
      en: 'Section 6: Service Channels & Stripe Gateway',
      fr: 'Section 6: Canaux de Service & Stripe'
    },
    subpages: [
      {
        id: 'cobertura-domicilio',
        title: {
          es: 'Servicios a Domicilio y Cobertura',
          en: 'Home Services & Coverage',
          fr: 'Soins à Domicile & Couverture'
        },
        markdown: {
          es: `# Servicios a Domicilio y Cobertura
          
ProBookia soporta tanto clínicas físicas fijas como profesionales móviles de medicina estética o masajes que asisten directamente a los hogares de sus pacientes.

---

### Modalidades de Trabajo

* **Solo en Centro**: Operativa clásica en gabinetes o locales de la clínica.
* **Solo a Domicilio**: El profesional no cuenta con sede física; se desplaza a los domicilios indicados.
* **Modalidad Mixta**: El cliente puede elegir si desea reservar el tratamiento de forma presencial en el local o en su domicilio particular.

### Control Geográfico de Cobertura

Para evitar reservas en zonas demasiado lejanas, ProBookia integra un potente control geográfico:
1. **Centro de Operaciones**: Dirección física base desde donde se calcula el desplazamiento.
2. **Radio Kilométrico Máximo**: Control deslizante que limita la distancia máxima permitida de viaje (ej: hasta 35 km).
3. **Zonas en Lista Blanca (Whitelisted ZIP Codes)**: Lista de códigos postales validados. Si el paciente introduce un código postal fuera de esta lista, el portal rechazará educadamente la cita antes de formalizar el pago.`,
          en: `# Home Services & Geographic Coverage
          
ProBookia supports fixed clinics as well as mobile practitioners, traveling specialists, or home visit clinics.

---

### Workspace Modalities

* **In-Clinic Only**: Traditional brick-and-mortar operation inside treatment rooms.
* **At-Home Only**: Fully mobile operations where specialists travel to patient addresses.
* **Mixed Modality**: Patients decide whether to schedule the treatment in-clinic or at their personal home address.

### Geographic Radius & ZIP Whitelist

To shield clinicians from traveling to excessively far-away locations, ProBookia deploys a geographical constraint engine:
1. **Center of Operations**: Physical base address used as the routing starting point.
2. **Maximum Traveling Radius**: Interactive slider setting maximum allowed mileage (e.g. up to 35 km).
3. **Whitelisted ZIP Codes**: Strict whitelist arrays. If a patient inputs a ZIP code missing from the whitelist, the booking gateway prompts a polite refusal message before checkout.`,
          fr: `# Services à Domicile & Couverture Géographique
          
ProBookia prend en charge les centres physiques fixes ainsi que les professionnels mobiles (soins esthétiques, massages, etc.) se déplaçant chez les patients.

---

### Modalités de Travail

* **En Centre Uniquement**: Fonctionnement traditionnel dans les locaux du centre.
* **À Domicile Uniquement**: Professionnels mobiles sans local fixe, se déplaçant au domicile du client.
* **Modalité Mixte**: Le patient choisit s'il souhaite effectuer le soin sur place ou à son domicile.

### Contrôle Géographique de la Couverture

Pour éviter les déplacements excessifs, ProBookia intègre un contrôle géographique:
1. **Centre d'Opérations**: Adresse de départ pour le calcul de l'itinéraire.
2. **Rayon Kilométrique Maximum**: Curseur définissant la distance de voyage autorisée (ex: 35 km).
3. **Codes Postaux Autorisés (ZIP Whitelist)**: Si le patient saisit un code postal non répertorié, le portail refuse poliment la réservation.`
        }
      },
      {
        id: 'pagos-stripe-connect',
        title: {
          es: 'Pasarela Stripe Connect y Fianzas',
          en: 'Stripe Connect & Escrows',
          fr: 'Intégration Stripe & Acomptes'
        },
        markdown: {
          es: `# Pasarela Stripe Connect y Fianzas
          
La monetización segura y la protección contra incomparecencias (no-shows) se integran de forma nativa a través de **Stripe Connect Standard**.

---

### Vinculación de Cuentas

1. **Acceso**: Dirígete a la pestaña **Pagos** en Ajustes.
2. **Onboarding Directo**: Haz clic en "Conectar Stripe" para ser redirigido a la pasarela oficial segura de Stripe Connect.
3. **Registro Express**: Rellena tus datos fiscales y bancarios. Una vez completado, serás devuelto automáticamente a ProBookia con tu cuenta enlazada y lista.

### Configuración de Fianzas y Cobros

* **Cobro por Fianza (Garantía)**: Permite exigir un depósito parcial obligado (ej: 25€) en el portal de reserva online para bloquear el slot del calendario.
* **Cobro del 100% por Adelantado**: El paciente abona la totalidad del tratamiento en la web antes de confirmar la cita.
* **Pago en el Establecimiento**: Reserva gratuita sin pasarela de pago online.

> [!IMPORTANT]
> El dinero retenido en concepto de fianza o pago total se transfiere de forma segura y directa a la cuenta Stripe conectada del tenant, reduciendo intermediarios y comisiones innecesarias.`,
          en: `# Stripe Connect Gateway & Escrow Payments
          
Secure monetization and protection against lost appointment slots (no-shows) are natively wired via **Stripe Connect Standard**.

---

### Connect Account Boarding

1. **Access**: Navigate to the **Payments** tab inside the dashboard settings.
2. **Direct Onboarding**: Click "Connect Stripe" to redirect securely to the official Stripe Connect portal.
3. **Express Registration**: Input corporate details. Upon completion, Stripe returns focus to ProBookia, showing your active linked account status.

### Escrow & Booking Charges Settings

* **Connect Escrow Deposits**: Require a mandatory upfront safety fee (e.g. $30) to secure a calendar slot.
* **Full Online Payment (100%)**: Enforce complete service checkout payment on the booking portal.
* **Pay at Venue**: Free scheduling without card processing requirements.

> [!IMPORTANT]
> Monies charged in deposits are processed directly in the tenant's connected Stripe account, bypassing intermediate escrow layers and minimizing extra fees.`,
          fr: `# Intégration Stripe Connect & Acomptes
          
La monétisation sécurisée et la protection contre les rendez-vous non honorés (no-shows) sont intégrées grâce à **Stripe Connect Standard**.

---

### Connexion de Compte

1. **Accès**: Rendez-vous dans l'onglet **Paiements** des paramètres.
2. **Liaison Directe**: Cliquez sur "Connecter Stripe" pour être redirigé vers Stripe Connect.
3. **Enregistrement**: Saisissez vos coordonnées bancaires et validez pour activer instantanément les paiements en ligne.

### Paramètres d'Acompte et Paiement

* **Acompte Obligatoire (Escrow)**: Exige un dépôt de garantie (ex: 25€) sur le portail de réservation pour valider le rendez-vous.
* **Paiement Intégral en Ligne**: Le patient règle 100% de la prestation lors de la réservation.
* **Paiement sur Place**: Réservation gratuite sans saisie de carte de crédit.

> [!IMPORTANT]
> Les transactions sont créditées directement sur le compte Stripe du centre, évitant les intermédiaires et réduisant les frais.`
        }
      }
    ]
  },
  {
    id: 'branding-experiencia',
    title: {
      es: 'Sección 7: Branding de Lujo & Experiencia del Paciente',
      en: 'Section 7: Luxury Branding & Booking UX',
      fr: 'Section 7: Branding de Luxe & Expérience'
    },
    subpages: [
      {
        id: 'branding-favicon',
        title: {
          es: 'Branding Detallado y Favicon',
          en: 'Detailed Branding & Favicon',
          fr: 'Branding Détaillé & Favicon'
        },
        markdown: {
          es: `# Branding Detallado & Favicon
          
El portal público de tratamientos de ProBookia es una extensión premium de tu marca. El sistema de diseño permite configurar la identidad visual sin esfuerzo.

---

### Personalización de Marca en la Pestaña Branding

1. **Logotipo Principal**: Carga de archivos de logotipo optimizados para la barra superior, pie de página y correos transaccionales (transparente en formatos PNG, SVG).
2. **Icono de la Pestaña (Favicon)**: Carga el icono cuadrado que visualizarán los clientes en la pestaña de sus navegadores web.
3. **Estilo & Modos Visuales**:
   * **Paletas Cromáticas Core**: Elige combinaciones de colores refinadas diseñadas para clínicas (Dorado/Antracita, Esmeralda/Lima, Bronce/Crema, Minimalista Industrial) o define tu propio color primario y secundario (Custom).
   * **Fuente de Encabezados y Cuerpo**: Configura Google Fonts de alta legibilidad (Playfair Display, Outfit, Fredoka, Montserrat, Roboto, Inter).
   * **Geometría de Bordes**: Controla la estética de botones y contenedores (Recta, Suave/Ejecutiva (12px), Orgánica/Redonda (full)).
   * **Modo Oscuro Activo**: Interruptor global para activar el modo oscuro por defecto en el portal público de tratamientos.`,
          en: `# Detailed Branding & Favicons
          
The ProBookia client-facing booking wizard functions as a high-end extension of your private brand, preserving a luxurious customer journey.

---

### Visual Customizations

1. **Corporate Brand Logo**: Upload high-resolution transparent logos (PNG, SVG) rendered inside navbars, footers, and invoices.
2. **Browser Tab Icon (Favicon)**: Upload custom square icons to render in browser address bars.
3. **Visual Aesthetics & Interface Modes**:
   * **Core Color Palettes**: Sleek presets tailored for high-end centers (Gold/Anthracite, Emerald/Lime, Bronze/Cream, Minimalist) or set primary/secondary accents manually (Custom).
   * **Typography Engine**: Select verified Google Fonts (Playfair Display, Outfit, Fredoka, Montserrat, Roboto, Inter).
   * **Border Radii Geometries**: Set border roundness for UI cards and buttons (Straight (0px), Soft/Executive (12px), Organic (full)).
   * **Global Dark Mode**: Switch to default dark themes on the public booking page.`,
          fr: `# Branding Détaillé & Favicon
          
Le portail public de réservation ProBookia est une extension haut de gamme de votre marque, conçu pour offrir une expérience esthétique sans compromis.

---

### Personnalisation de l'Identité Visuelle

1. **Logotype Principal**: Téléversez votre logo transparent (PNG, SVG) affiché sur la barre de navigation et les emails.
2. **Favicon de l'Onglet**: Téléversez l'icône carrée visible dans la barre d'adresse du navigateur client.
3. **Styles Visuels & Palettes**:
   * **Palettes Chromatiques Prédéfinies**: Combinaisons raffinées (Doré/Anthracite, Émeraude/Citron, Bronze/Crème, Minimaliste) ou personnalisez vos couleurs primaires et secondaires (Custom).
   * **Polices Typographiques**: Choisissez des polices Google Fonts élégantes (Playfair Display, Outfit, Fredoka, Montserrat, Inter).
   * **Géométrie des Bordures**: Arrondis des boutons et cadres (Droit (0px), Doux/Exécutif (12px), Arrondi (full)).
   * **Mode Sombre Global**: Interrupteur pour activer par défaut le mode sombre sur l'agenda public.`
        }
      },
      {
        id: 'layouts-reserva',
        title: {
          es: 'Diseños de Reserva (Boutique Grid vs Fila)',
          en: 'Booking Layouts (Grid vs Row List)',
          fr: 'Gabarits de Réservation'
        },
        markdown: {
          es: `# Diseños de Reserva (Boutique Grid vs Fila)
          
La retícula en la que se presentan tus servicios e imágenes de tratamientos define la tasa de conversión inicial del portal de citas.

---

### Layouts de Reserva Disponibles

* **Boutique Grid (2 Columnas)**: Presentación sumamente visual que agrupa los tratamientos en bloques de dos columnas con soporte para fotografías destacadas. Excelente para clínicas de estética, cirugías plásticas o tratamientos que se benefician de imágenes descriptivas de alta calidad.
* **Lista Elegante (Filas)**: Vista clásica, sumamente limpia y ultra-clara. Los tratamientos se disponen uno debajo del otro con copies breves y precios a la derecha. La mejor opción si dispones de un catálogo extenso con muchos tratamientos o si prefieres no utilizar imágenes explicativas.

> [!TIP]
> Puedes visualizar los cambios de layout instantáneamente en el mockup del iPhone interactivo del panel de Ajustes antes de publicar las modificaciones.`,
          en: `# Booking Layouts (Grid vs Row List)
          
The design layout chosen to display services determines the initial conversion success rate of your patient portal.

---

### Available Visual Layouts

* **Boutique Grid (2 Columns)**: Double-column visual cards displaying description blocks alongside custom cover media. Perfect for aesthetic medicine, dermatology clinics, or cosmetic spays that benefit from high-resolution imagery.
* **Elegant List (Rows)**: Minimalist, clean, and fast row listings. Services stack vertically with core descriptions and price badges to the right. Recommended for extensive treatment lists or businesses that prefer minimal iconography.

> [!TIP]
> You can preview layout switches live inside the interactive iPhone mockup in settings before applying changes to the public web.`,
          fr: `# Gabarits de Réservation (Grille vs Liste)
          
La disposition visuelle de vos prestations sur le portail de rendez-vous définit le taux de conversion initial de vos clients.

---

### Gabarits Visuels Disponibles

* **Boutique Grid (Grille 2 Colonnes)**: Présentation visuelle affichant les prestations sous forme de blocs illustrés sur deux colonnes. Excellent pour les centres d'esthétique ou cliniques de dermatologie utilisant des images descriptives de haute qualité.
* **Liste Élégante (Lignes)**: Rendu minimaliste et très clair. Les prestations s'alignent verticalement avec une brève description et le tarif à droite. Recommandé pour les centres proposant un grand nombre de soins.

> [!TIP]
> Vous pouvez prévisualiser le rendu en temps réel sur la maquette iPhone interactive dans l'onglet de personnalisation.`
        }
      }
    ]
  },
  {
    id: 'seguridad-api-ia',
    title: {
      es: 'Sección 8: Seguridad, SEO & Agentes de IA VIP',
      en: 'Section 8: Security, SEO & Gold AI Agents',
      fr: 'Section 8: Sécurité, SEO & Agents IA Gold'
    },
    subpages: [
      {
        id: 'api-keys-ia',
        title: {
          es: 'Claves API para Inteligencia Artificial',
          en: 'Client AI API Keys',
          fr: 'Clés d\'API de l\'IA'
        },
        markdown: {
          es: `# Claves API para Inteligencia Artificial
          
ProBookia ofrece a los tenants la libertad de utilizar sus propios recursos generativos para impulsar los módulos de asistencia automática, redacción de copias y SEO.

---

### Integración de Proveedores Generativos

En la pestaña Avanzada, los administradores pueden introducir sus claves de API privadas:
1. **Google Gemini (Recomendado)**: Consigue tu API Key gratuita en Google AI Studio para activar los modelos rápidos.
   * **Modelo de Texto**: Gemini 2.5 Flash, Gemini 3 Flash, Gemini 3.1 Pro (alta calidad).
   * **Modelo de Imagen**: Nano Banana 2 (3.1 Flash Image Preview) o Imagen 4.0 Standard.
2. **OpenAI ChatGPT (Avanzado)**: Inyecta tu API Key para utilizar la suite de OpenAI.
   * **Modelo de Texto**: GPT-4o mini (económico y rápido) o GPT-4o (alto rendimiento).
   * **Modelo de Imagen**: DALL-E 3.

> [!WARNING]
> Tus claves de API se almacenan cifradas en base de datos. Ningún usuario externo ni paciente final puede leer tus claves, garantizando la seguridad absoluta contra robos de cuota.`,
          en: `# Private AI API Key Management
          
ProBookia grants tenants the freedom to connect their own generative resources to power copy redactors, automated SEO tools, and voice pilots.

---

### Generative Providers Integrations

Within the Advanced settings tab, managers can inject private API credentials:
1. **Google Gemini (Recommended)**: Secure free API Keys inside Google AI Studio to unlock immediate responses.
   * **Text Model**: Gemini 2.5 Flash, Gemini 3 Flash, Gemini 3.1 Pro (deluxe text logic).
   * **Image Model**: Nano Banana 2 (3.1 Flash Image Preview) or Imagen 4.0 Standard.
2. **OpenAI ChatGPT (Advanced)**: Insert private API Keys to connect the OpenAI generative framework.
   * **Text Model**: GPT-4o mini (fast and affordable) or GPT-4o (top execution).
   * **Image Model**: DALL-E 3.

> [!WARNING]
> Your private API keys are encrypted at rest inside the database schema. No external callers or final patients can inspect keys, avoiding quote thefts.`,
          fr: `# Gestion des Clés d'API de l'IA
          
ProBookia donne aux centres la liberté d'utiliser leurs propres crédits d'IA pour propulser les assistants de rédaction, le SEO et le co-pilote.

---

### Intégration des Fournisseurs d'IA

Dans l'onglet Avancé des paramètres, les administrateurs saisissent leurs identifiants:
1. **Google Gemini (Recommandé)**: Obtenez votre clé gratuite sur Google AI Studio.
   * **Modèle de Texte**: Gemini 2.5 Flash, Gemini 3 Flash, Gemini 3.1 Pro.
   * **Modèle d'Image**: Nano Banana 2 ou Imagen 4.0 Standard.
2. **OpenAI ChatGPT (Avancé)**: Saisissez votre clé OpenAI.
   * **Modèle de Texte**: GPT-4o mini ou GPT-4o.
   * **Modèle d'Image**: DALL-E 3.

> [!WARNING]
> Vos clés d'API sont cryptées et stockées de manière sécurisée en base de données. Aucun patient final ne peut y accéder.`
        }
      },
      {
        id: 'seo-noindex',
        title: {
          es: 'Visibilidad SEO y NoIndex',
          en: 'SEO Visibility & NoIndex',
          fr: 'Visibilité SEO & NoIndex'
        },
        markdown: {
          es: `# Visibilidad SEO y Bloqueo de Indexación
          
En clínicas premium o centros que operan de forma privada con una cartera exclusiva de pacientes, puede ser necesario limitar la visibilidad pública en motores de búsqueda como Google o Bing.

---

### Indexación en Motores de Búsqueda

ProBookia soluciona esto de forma directa desde la pestaña Avanzada:
* **Indexación Activada (Por defecto)**: Permite que los robots de Google rastreen e indexen tu portal de reserva, capturando metadatos de tratamientos para posicionar orgánicamente.
* **Indexación Desactivada (NoIndex)**: Al activar este interruptor, el servidor de ProBookia inyecta dinámicamente la cabecera HTTP \`X-Robots-Tag: noindex, nofollow\` y la etiqueta de metadatos HTML correspondiente:
\`\`\`html
<meta name="robots" content="noindex, nofollow" />
\`\`\`
Esto indica instantáneamente a los motores de búsqueda que no almacenen ni muestren tu web en sus resultados de búsqueda, protegiendo la privacidad operativa.`,
          en: `# Search Engine Indexing & NoIndex Tags
          
For exclusive clinics or private centers operating with a restricted customer list, blocking public indexing on engines like Google or Bing might be a business requirement.

---

### Indexation Toggles

ProBookia streamlines crawler blocking within the Advanced settings tab:
* **Indexing Enabled (Default)**: Grants search bots permissions to index services, categories, and cover details to drive organic local traffic.
* **Indexing Disabled (NoIndex)**: Turning this toggle on signals ProBookia to inject dynamic HTTP headers \`X-Robots-Tag: noindex, nofollow\` alongside the target HTML meta tags:
\`\`\`html
<meta name="robots" content="noindex, nofollow" />
\`\`\`
This strictly tells search engine bots to ignore your clinic's booking site and exclude it from public indexes, preserving privacy.`,
          fr: `# Visibilité SEO & Indexation NoIndex
          
Pour les centres privés gérant une clientèle exclusive, bloquer l'indexation publique sur Google ou Bing peut être nécessaire.

---

### Paramètres d'Indexation

ProBookia propose un blocage simple dans l'onglet Avancé:
* **Indexation Activée (Par défaut)**: Permet aux robots de Google de référencer votre catalogue afin d'attirer des clients par recherche organique.
* **Indexación Desactivada (NoIndex)**: L'activation de cette option injecte l'en-tête HTTP \`X-Robots-Tag: noindex, nofollow\` et la balise correspondante:
\`\`\`html
<meta name="robots" content="noindex, nofollow" />
\`\`\`
Cela indique instantanément aux moteurs de recherche de ne pas lister votre site, protégeant l'exclusivité de votre centre.`
        }
      },
      {
        id: 'galeria-privada-sedes',
        title: {
          es: 'Galería Privada, Perfiles y Horarios por Sede',
          en: 'Private Gallery, Profiles & Multi-local',
          fr: 'Galerie Privée & Multi-local'
        },
        markdown: {
          es: `# Galería Privada, Perfiles y Horarios por Sede
          
La arquitectura de ProBookia permite una gestión descentralizada y segura para coordinar el trabajo en múltiples sucursales físicas.

---

### Galería de Medios Privada
Para evitar el uso de servidores de almacenamiento públicos desprotegidos, ProBookia integra un contenedor seguro de archivos multimedia. Todas las fotografías cargadas de especialistas, tratamientos o logotipos se aíslan por tenant, cifrando sus accesos para garantizar que tu base de datos y archivos son 100% inaccesibles por externos.

### Horarios Especiales por Sede Física
Si tu centro opera con múltiples sucursales físicas, no estás obligado a unificar horarios:
1. **Ficha de Sede**: Configura la dirección, teléfono y correo específico de cada local.
2. **Calendario Independiente**: Agrega bloqueos, festivos o descansos para la sede A sin alterar la sede B.
3. **Modalidad del Profesional**: Vincula especialistas exclusivamente a las sedes correspondientes para que sus horas solo se ofrezcan en los locales adecuados.`,
          en: `# Private Galleries, Staff Profiles & Location Hours
          
ProBookia provides secure decentralized capabilities to coordinate multi-center operations.

---

### Secure Private Galleries
To bypass unprotected public media storage, ProBookia deploys secure isolated buckets. Staff profile images, treatment covers, and logo uploads are structured under tenant constraints, locking external access and guaranteeing 100% asset privacy.

### Scoped Hours per Physical Center Location
If your business operates multi-local centers, you can bypass unified hour constraints:
1. **Location Files**: Manage addresses, emails, and phone records for each individual branch.
2. **Independent Schedules**: Assign custom break times and holidays for Location A without disturbing Location B.
3. **Specialist Binding**: Link active practitioners to their respective center offices, blocking them from receiving bookings at incorrect branches.`,
          fr: `# Galerie Privée, Profils & Horaires par Centre
          
L'architecture de ProBookia permet une gestion décentralisée pour coordonner le travail sur plusieurs centres physiques.

---

### Galerie de Médias Privée
Pour éviter l'utilisation de serveurs de stockage non protégés, ProBookia intègre un conteneur sécurisé par centre. Tous les fichiers de spécialistes ou logos sont isolés et protégés.

### Horaires Spécifiques par Centre Physique
Si votre entreprise possède plusieurs agences, vous pouvez configurer des règles distinctes:
1. **Fiches de Centre**: Saisissez l'adresse, l'email et le téléphone propres à chaque succursale.
2. **Plannings Indépendants**: Ajoutez des congés ou des plages de fermeture pour le Centre A sans modifier le Centre B.
3. **Affectation de l'Équipe**: Associez les spécialistes à leurs centres respectifs pour éviter toute erreur de réservation.`
        }
      },
      {
        id: 'agentes-ia-webmaster',
        title: {
          es: 'Agentes Autónomos: IA Webmaster y Global Copilot',
          en: 'Autonomous Agents: IA Webmaster & Copilot',
          fr: 'Agents Autonomes: IA Webmaster & Copilot'
        },
        markdown: {
          es: `# Agentes Autónomos: IA Webmaster y Global Copilot
          
El Plan Gold Elite incluye el acceso a los motores autónomos de Inteligencia Artificial más avanzados del mercado SaaS, convirtiendo tareas complejas de administración en una simple charla.

---

### Asistente IA Webmaster con Vista Previa (Iframe Editor)

Ubicado en el menú **AI Webmaster**, este módulo integra:
* **Panel de Chat Integrado**: Conversa en lenguaje natural con tu IA para cambiar el diseño de la web, modificar paletas tipográficas, añadir o reescribir copys comerciales de tratamientos o cambiar fotos.
* **Simulador Web (Responsive Preview)**: A la derecha del chat, visualizas un navegador simulado que carga la vista previa real de tu landing page (alternando entre vista de escritorio y vista móvil en iPhone).
* **Renderización Instantánea**: Cuando la IA edita tu portal de tratamientos, recarga automáticamente el iframe de previsualización para mostrarte el cambio estético de forma inmediata y en tiempo real.

### Agente IA Copilot Global

El co-piloto por voz/audio de ProBookia:
* **Activación por Voz**: Interpreta tus intenciones a través de audios o comandos verbales.
* **Mutación de Datos**: Puedes pedirle verbalmente cambiar colores de branding, modificar textos o consultar estados financieros y de citas, actuando directamente sobre las APIs del sistema de forma atómica y segura.`,
          en: `# Autonomous Agents: IA Webmaster & Global Copilot
          
The Gold Elite plan introduces highly sophisticated autonomous AI engines, transforming tedious business administration into natural conversations.

---

### Interactive AI Webmaster & Live Preview Iframe

Accessible via the **AI Webmaster** dashboard, this module integrates:
* **Sidebar Chat Assistant**: Chat directly with the AI in natural language to adjust visual palettes, redesign buttons, rewrite commercial treatment descriptions, or modify structures.
* **Simulated Device Viewport (Responsive Preview)**: A premium simulated browser panel loads your live landing preview, offering one-click switches between desktop and mobile viewport sizes.
* **Instant Iframe Revalidation**: As soon as the AI applies database edits, the frontend triggers an automatic iframe reload to immediately render design changes in real time.

### Global Voice AI Copilot

ProBookia's audio intent parser:
* **Voice Command Interpretation**: Translates verbal voice prompts and recordings into transactional intents.
* **Atomic Database Actions**: Commands like shifting brand presets, mutating copies, or fetching client charts execute securely and instantly via scoped REST calls.`,
          fr: `# Agents Autonomes: IA Webmaster & Copilot Global
          
Le forfait Gold Elite comprend l'accès aux agents autonomes les plus avancés du marché SaaS, transformant la gestion administrative en une simple discussion.

---

### Assistant IA Webmaster avec Prévisualisation en Direct (Iframe)

Situé dans l'onglet **AI Webmaster**, ce module intègre:
* **Panneau de Discussion**: Discutez en langage naturel avec l'IA pour modifier le design du site, réécrire les descriptions ou changer les images.
* **Simulateur d'Écran (Responsive Preview)**: À droite du chat, un navigateur simulé affiche votre site en direct (basculant entre bureau et mobile iPhone).
* **Mise à Jour Instantanée**: Lorsque l'IA applique une modification en base de données, l'iframe se recharge automatiquement pour afficher le rendu.

### Assistant IA Copilot Global

Le co-pilote vocal ProBookia:
* **Analyse de Commande Vocale**: Traduit vos messages audio en requêtes transactionnelles.
* **Actions Automatiques Sécurisées**: Modifiez vos couleurs, vos textes ou consultez vos statistiques financières en parlant simplement à l'assistant.`
        }
      }
    ]
  }
];

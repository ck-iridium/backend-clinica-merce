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
    id: 'fundamentos-seguridad',
    title: {
      es: 'Sección 1: Primeros Pasos & Privacidad Blindada',
      en: 'Section 1: Getting Started & Bulletproof Privacy',
      fr: 'Section 1: Premiers Pas pour Votre Centre'
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

¡Te damos la bienvenida a ProBookia! Somos una plataforma diseñada para clínicas de estética, centros médicos y salones de bienestar de alta gama que buscan ofrecer una experiencia extraordinaria.

A diferencia de las agendas convencionales, ProBookia funciona como una **marca blanca de lujo invisible**. Esto significa que tu portal de reservas llevará tu propio logotipo, tus colores corporativos y tu dominio exclusivo. Tus clientes verán únicamente tu identidad visual, mientras tú disfrutas de una potente suite interna de gestión con facturación rápida, control de personal, comisiones y asistentes de Inteligencia Artificial de última generación.

---

### Módulos Principales para Impulsar tu Negocio

* **Agenda y ERP Clínico**: Controla calendarios interactivos en tiempo real, asigna citas a especialistas específicos y evita la superposición de horarios automáticamente.
* **TPV y Facturación Rápida**: Registra cobros de tratamientos y bonos al instante, emite presupuestos en PDF prémium y gestiona los impuestos de tu zona sin complicaciones.
* **Portal de Reservas de Marca Blanca**: Un elegante asistente de reservas en 3 pasos que se adapta al diseño corporativo de tu negocio.
* **Copilotos de Inteligencia Artificial**: Genera descripciones de tratamientos con un solo clic, crea imágenes espectaculares para tus servicios y gestiona tu clínica mediante sencillos comandos de voz.`,
          en: `# What is ProBookia?

Welcome to ProBookia! We are an exclusive booking and management ecosystem designed specifically for aesthetic clinics, medical centers, and high-end wellness salons.

Unlike generic scheduling calendars, ProBookia operates as a **premium invisible white-label engine**. This means your client-facing portal will match your unique brand logo, colors, and custom web domain. Your patients only interact with your luxury brand identity, while you enjoy a robust internal clinical platform equipped with rapid invoicing, specialist rosters, and advanced AI-powered assistants.

---

### Key Modules to Power Your Business

* **Clinical Agenda & ERP**: Oversee real-time interactive schedules, assign slots to specific specialists, and block double-bookings automatically.
* **POS & Invoicing**: Checkout services and client vouchers instantly, generate elegant PDF quotes, and handle regional taxes.
* **White-Label Booking Portal**: A high-conversion, beautifully responsive 3-step online booking wizard that reflects your visual DNA.
* **Generative AI Copilots**: Write marketing descriptions with a single click, generate premium treatment covers, and operate your clinic via simple voice commands.`,
          fr: `# Qu'est-ce que ProBookia?

Bienvenue chez ProBookia ! Nous sommes une plateforme de gestion et de réservation conçue spécifiquement pour les cliniques esthétiques, centres médicaux et salons de bien-être haut de gamme.

Contrairement aux agendas génériques, ProBookia fonctionne comme une **marque blanche de luxe invisible**. Cela signifie que votre portail client affichera vos propres logos, vos couleurs et votre domaine internet. Vos patients ne verront que votre identité visuelle exclusive, tandis que vous profiterez d'un outil de facturation rapide, d'une gestion de commissions d'équipe et d'assistants IA de dernière génération.

---

### Les Modules Clés de Votre Succès

* **Agenda & ERP Clinique**: Gérez les rendez-vous en temps réel, affectez les créneaux à vos spécialistes et évitez automatiquement les chevauchements.
* **TPV & Facturation Rapide**: Encaissez vos prestations et abonnements, générez des devis en PDF et gérez vos taux de taxe régionaux en toute simplicité.
* **Portail de Réservation Personnalisé**: Un assistant en ligne fluide en 3 étapes qui s'adapte à l'ADN visuel de votre marque.
* **Copilotes d'Intelligence Artificielle**: Créez des descriptions de soins, générez des couvertures visuelles pour vos services et pilotez votre centre par simple commande vocale.`
        }
      },
      {
        id: 'aislamiento-multi-tenant',
        title: {
          es: 'Seguridad y Privacidad de Datos',
          en: 'Data Security & Isolation',
          fr: 'Sécurité et Confidentialité'
        },
        markdown: {
          es: `# Privacidad y Seguridad de tus Pacientes

En ProBookia, la privacidad y la confidencialidad de tu negocio y la de tus pacientes son nuestra máxima prioridad. Aplicamos estándares de **seguridad y protección de datos equivalentes a la banca electrónica**.

---

### ¿Cómo Protegemos tus Datos?

Para garantizar que tu información esté blindada y evitar cualquier tipo de filtración accidental:

1. **Aislamiento Absoluto de Datos**: Cada clínica cuenta con su propio "espacio seguro e independiente" en nuestra base de datos. Ningún usuario o empleado de otra clínica asociada a ProBookia podrá ver, buscar o modificar tus clientes, citas o expedientes clínicos.
2. **Cumplimiento RGPD / LOPD**: Cumplimos de forma nativa con los estándares internacionales de protección de datos sanitarios. Toda la información delicada sobre historiales médicos de tus pacientes se almacena bajo estrictos controles de acceso restringido.
3. **Copias de Seguridad Diarias**: Realizamos respaldos automáticos y encriptados de toda tu base de datos cada noche, asegurando que nunca pierdas tu agenda, fichas de clientes o facturas.

> [!IMPORTANT]
> Puedes operar con la total tranquilidad de que la información de tus tratamientos, fichas y facturación está cifrada y protegida por un sistema de aislamiento impenetrable a nivel de base de datos.`,
          en: `# Patient Data Security & Privacy

At ProBookia, protecting the security and confidentiality of your business and your patients' clinical records is our absolute priority. We operate under **bank-grade data encryption and security standards**.

---

### How We Protect Your Data

To guarantee your private database is isolated and prevent any accidental cross-access:

1. **Absolute Data Isolation**: Every clinic runs on its own secure, isolated "vault" inside our database schema. No managers or staff from other centers using ProBookia can ever view, search, or alter your clients, appointments, or medical charts.
2. **Global Compliance (GDPR & HIPAA)**: We natively fulfill all mandatory clinical data requirements. Sensitive patient histories and aesthetic files are kept under secure cryptographic access policies.
3. **Automated Daily Backups**: Your files are backed up automatically and encrypted every night, ensuring you never lose active calendars, billing records, or client files.

> [!IMPORTANT]
> You can manage your business with total peace of mind: all schedules, treatment records, and invoice vaults are shielded inside our database infrastructure.`,
          fr: `# Sécurité des Données & Confidentialité

Chez ProBookia, la confidentialité de votre activité et des dossiers de vos patients est notre priorité absolue. Nous appliquons des standards de **sécurité et de chiffrement équivalents à ceux des banques**.

---

### Comment Nous Protégeons Vos Données

Pour garantir que vos données soient hermétiquement protégées et éviter toute fuite :

1. **Isolation Absolue des Fichiers**: Chaque centre dispose d'un "coffre-fort virtuel" indépendant. Aucun employé d'un autre établissement sur ProBookia ne pourra jamais consulter ou modifier vos fiches clients, vos agendas ou vos dossiers médicaux.
2. **Conformité RGPD**: Nous respectons scrupuleusement les exigences européennes de protection des données de santé. Les antécédents et photos cliniques de vos clients font l'objet de contrôles d'accès restreints.
3. **Sauvegardes Quotidiennes Automatiques**: L'ensemble de votre base de données est sauvegardé de manière cryptée chaque nuit pour vous garantir de ne jamais perdre votre planning ou vos dossiers.

> [!IMPORTANT]
> Travaillez en toute sérénité : toutes vos fiches clients, agendas et documents comptables sont stockés de manière ultra-sécurisée et isolée.`
        }
      },
      {
        id: 'vip-impersonation',
        title: {
          es: 'Soporte Técnico Seguro (Modo Asistencia)',
          en: 'Secure Support (Impersonation Mode)',
          fr: 'Assistance Technique Sécurisée'
        },
        markdown: {
          es: `# Acceso Seguro de Soporte Técnico

Dar soporte y ayudarte a configurar tu clínica requiere agilidad, pero también un control absoluto. En ProBookia hemos eliminado la necesidad de que nos compartas tus contraseñas gracias a nuestro **Modo de Asistencia Segura**.

---

### ¿Cómo Funciona la Ayuda en Directo?

Cuando solicitas ayuda para resolver una duda sobre un diseño, horario o factura:

1. **Autorización Temporal**: Si nos otorgas permiso, nuestra consola de Super Admin genera un acceso temporal seguro e inalterable.
2. **Acceso Sin Contraseña**: El especialista de soporte puede ingresar a tu panel de control para ver la pantalla exactamente como tú la ves, ayudándote a corregir la configuración al instante.
3. **Cierre Automático tras 2 Horas**: Este acceso especial expira de forma automática a las **2 horas**. Transcurrido ese tiempo, el enlace se destruye y el especialista es expulsado del panel.
4. **Registro de Auditoría**: Cada vez que un agente de soporte accede a tu cuenta, queda anotado en un historial que puedes consultar, garantizando la total transparencia sobre quién y cuándo ha accedido.

> [!TIP]
> Nunca compartas tu contraseña por chat o email con nadie. El equipo de ProBookia jamás te la solicitará, ya que empleamos este sistema de asistencia temporal y seguro para ayudarte.`,
          en: `# Secure Support & Impersonation Access

Assisting you with layouts, hours, or invoices requires an agile yet strictly controlled support mechanism. At ProBookia, we have completely eliminated the need for you to share your password via our **Secure Impersonation System**.

---

### How Live Assistance Operates

When you request technical support to configure your clinic settings:

1. **Temporary Authorization**: With your permission, our Super Admin Console creates a temporary and secure support link.
2. **Zero-Password Login**: The support specialist logs in to inspect your dashboard, viewing your configuration exactly as you see it on screen.
3. **Automatic 2-Hour Expiration**: The secure support window expires automatically after **2 hours**. Once the time is up, the link is destroyed, and the agent is signed out.
4. **Audit Trail Logs**: Every single support login is recorded in an unalterable database log, giving you total transparency on who accessed your clinic and when.

> [!TIP]
> Never share your login credentials or password via email or chat. The ProBookia team will never ask for them, as we use this secure temporary session mechanism to help you.`,
          fr: `# Assistance Technique Sécurisée (Mode Impersonation)

Vous aider à configurer vos plannings ou vos tarifs exige de la réactivité, mais aussi de la sécurité. Chez ProBookia, nous avons banni le partage de mot de passe grâce à notre **Mode d'Assistance Temporaire Sécurisé**.

---

### Comment Fonctionne l'Assistance en Direct ?

Lorsque vous demandez notre aide pour paramétrer un service ou ajuster une page :

1. **Autorisation Temporaire**: Avec votre accord, notre équipe génère un accès temporaire crypté et hautement sécurisé.
2. **Connexion Sans Partage de Mot de Passe**: Le technicien se connecte à votre tableau de bord et visualise l'interface exactement comme vous, résolvant vos doutes en temps réel.
3. **Expiration Automatique (2 Heures)**: Le lien de support expire automatiquement au bout de **2 heures**. Le technicien est alors déconnecté et ne peut plus accéder à vos données.
4. **Historique des Accès**: Chaque accès d'assistance est enregistré dans un journal de sécurité transparent et immuable.

> [!TIP]
> Ne partagez jamais votre mot de passe par chat ou email. Nos agents n'en ont pas besoin car nous utilisons ce système temporaire sécurisé pour vous aider.`
        }
      }
    ]
  },
  {
    id: 'gestion-catalogo',
    title: {
      es: 'Sección 2: Catálogo de Servicios y Consentimientos',
      en: 'Section 2: Service Catalog & Legal Consents',
      fr: 'Section 2: Gestion des Soins & Consentements'
    },
    subpages: [
      {
        id: 'estructura-catalogo',
        title: {
          es: 'Organizar tus Categorías y Servicios',
          en: 'Organize Categories & Services',
          fr: 'Organiser Vos Catégories'
        },
        markdown: {
          es: `# Cómo Organizar tu Menú de Servicios

Un catálogo bien estructurado facilita que tus clientes encuentren y reserven sus tratamientos favoritos rápidamente. ProBookia te permite organizar tus servicios de forma elegante y limpia.

---

### Estructura de tu Menú

* **Categorías de Servicios**: Agrupadores grandes para tus servicios (ej: "Estética Facial", "Medicina Corporal", "Bonos Especiales"). Puedes ordenar las categorías para decidir cuál se muestra primero en el menú web.
* **Servicios Individuales**: Fichas para cada tratamiento. Cada una contiene el nombre, la duración del servicio en minutos, el precio base, la fianza opcional y las imágenes de portada.
* **Enlaces Web Limpios (Slugs)**: ProBookia crea automáticamente una dirección de internet bonita y amigable para cada tratamiento (ej: \`/servicios/estetica-facial/hidratacion-profunda\`). El sistema asegura que los enlaces de tu clínica sean completamente independientes de los de otros negocios.`,
          en: `# How to Organize Categories & Services

A well-structured catalog is the easiest way to help clients browse and book their favorite treatments. ProBookia allows you to organize your services in a beautiful, structured layout.

---

### Menu Catalog Blueprint

* **Service Categories**: Main groups for your treatments (e.g. "Facial Aesthetics", "Body Massage", "Exclusive Vouchers"). You can drag and drop categories to decide which one displays first.
* **Individual Services**: Profile pages for each treatment. Each card stores the name, treatment duration in minutes, standard price, optional deposit, and cover photos.
* **Clean URLs (Slugs)**: ProBookia automatically calculates a friendly web link for each treatment (e.g. \`/services/facial-aesthetics/deep-hydration\`). The system ensures your links are fully branded under your custom domain.`,
          fr: `# Comment Organiser vos Catégories et Prestations

Un catalogue clair permet à vos clients de trouver et réserver leurs soins favoris en quelques secondes. ProBookia vous propose un système d'organisation élégant.

---

### Structure de Votre Catalogue

* **Catégories de Prestations**: Grands groupes pour classer vos soins (ex: "Soin du Visage", "Massages", "Abonnements"). Vous pouvez trier l'ordre des catégories pour définir leur priorité d'affichage.
* **Soins Individuels**: Fiches pour chaque traitement. Chacune comprend le nom, la durée en minutes, le prix, l'acompte demandé et les photos de couverture.
* **Liens Internet Propres (Slugs)**: ProBookia crée automatiquement une adresse web intuitive pour chaque prestation (ex: \`/soins/visage/hydratation-profonde\`), parfaitement isolée et sécurisée.`
        }
      },
      {
        id: 'gestion-masiva',
        title: {
          es: 'Edición Rápida de Servicios (Data Tables)',
          en: 'Quick Edit Services (Data Tables)',
          fr: 'Gestion Rapide des Soins'
        },
        markdown: {
          es: `# Edición Rápida de Servicios

¿Tienes decenas de servicios y necesitas actualizar precios o duraciones con frecuencia? En lugar de abrir cada servicio uno a uno, ProBookia incluye una **Tabla de Edición Rápida** diseñada para ahorrarte tiempo.

---

### Herramientas del Panel de Gestión

1. **Buscador Instantáneo**: Empieza a escribir y localiza cualquier servicio en menos de un segundo por su nombre, categoría o precio.
2. **Vista Limpia y Ordenada**: Las descripciones largas se acortan de forma inteligente para que la tabla siempre se vea limpia. Si pasas el ratón por encima del texto, verás el contenido completo.
3. **Activación de Servicios**: Activa o desactiva tratamientos con un solo clic utilizando los interruptores interactivos (\`is_active\`). Esto te permite ocultar temporalmente tratamientos de temporada sin tener que borrarlos de tu base de datos.
4. **Destacar Servicios**: Activa el interruptor "Destacado" (\`is_featured\`) para que el servicio aparezca en la parte superior y más visible de tu portal público de reservas.`,
          en: `# Quick Services Management & Tables

Do you manage multiple treatments and need to adjust prices or durations often? Instead of opening services one by one, ProBookia includes a **Quick Edit Table** built to save you administrative hours.

---

### Dynamic Dashboard Utilities

1. **Instant Search Filter**: Type a few letters and find any treatment in less than a second by name, category, or price.
2. **Clean Text Views**: Long descriptions are neatly shortened to keep your table structured. Simply hover your mouse over the cell to preview the full description instantly.
3. **Quick Status Toggles**: Activate or deactivate treatments with a single click using the interactive switches (\`is_active\`). This allows you to hide seasonal treatments without deleting them.
4. **Featured Treatments**: Check the "Featured" toggle (\`is_featured\`) to highlight specific services at the top of your public booking page.`,
          fr: `# Tableau de Modification Rapide des Soins

Vous gérez de nombreuses prestations et devez mettre à jour les tarifs régulièrement ? ProBookia intègre un **Tableau d'Édition Rapide** conçu pour vous faire gagner du temps.

---

### Fonctionnalités Clés du Tableau

1. **Recherche Instantanée**: Saisissez quelques lettres pour retrouver n'importe quelle prestation par nom, catégorie ou tarif.
2. **Affichage Ultra-Propre**: Les textes longs sont abrégés pour garder le tableau lisible. Passez le curseur sur le texte pour en lire l'intégralité.
3. **Activation en Un Clic**: Activez ou désactivez des soins instantanément (\`is_active\`). Utile pour masquer des soins saisonniers sans les supprimer.
4. **Mettre en Avant**: Cochez l'interrupteur "Vedette" (\`is_featured\`) pour afficher cette prestation en priorité sur votre portail public.`
        }
      },
      {
        id: 'consentimientos-base64',
        title: {
          es: 'Consentimientos y Firmas Digitales',
          en: 'Consent Forms & Digital Signatures',
          fr: 'Formulaires & Signatures'
        },
        markdown: {
          es: `# Consentimientos y Firmas Digitales

La seguridad del paciente y el respaldo legal de tu clínica son esenciales, especialmente en tratamientos de medicina estética o cabina avanzada. Con ProBookia, puedes digitalizar y firmar consentimientos sin gastar papel.

---

### Adiós al Papel: Firmas 100% Digitales

Nuestro módulo de firmas te permite gestionar la documentación de forma ágil desde cualquier dispositivo:

1. **Plantillas del Centro**: Define y asocia textos legales y de consentimientos para tratamientos específicos (ej: consentimiento para Toxina Botulínica, Láser Diodo, etc.).
2. **Firma en Pantalla**: El paciente puede leer el consentimiento cómodamente en una tablet o teléfono móvil en la recepción de tu clínica, y dibujar su firma directamente con el dedo o un lápiz sobre la pantalla.
3. **Guardado Seguro e Inalterable**: La firma digitalizada se guarda en la ficha del paciente, asociada a la fecha exacta de su tratamiento. 
4. **Blindaje de Seguridad**: Una vez firmado el documento, la firma queda vinculada de forma definitiva a ese texto y fecha específicos. Esto garantiza que el consentimiento sea totalmente seguro y cumpla con las normativas legales de privacidad.`,
          en: `# Digital Signature & Consent Forms

Patient safety and legal backups are absolute essentials, particularly in advanced aesthetics or therapeutic wellness. With ProBookia, you can easily compile and store legal digital consent forms with zero paper waste.

---

### Paperless Digital Signatures

Our digital signature module streamlines client legal documentation from any smartphone, tablet, or screen:

1. **Custom Templates**: Store legal consent templates and link them to specific treatments (e.g. Botulinum Toxin Consent, Laser Hair Removal).
2. **Signature Drawing**: The patient reviews the terms on a tablet or mobile screen at the front desk, drawing their handwritten signature directly onto the screen.
3. **Secure Vaulting**: The signed document is saved securely inside the client's file, registering a UTC time-stamp.
4. **Legally Binding Shield**: Once signed, the signature is cryptographically linked to that specific document text, ensuring security and full privacy compliance.`,
          fr: `# Formulaires de Consentement & Signatures Tactiles

La sécurité et la protection juridique de votre centre sont cruciales, notamment pour les soins esthétiques avancés. ProBookia vous permet de digitaliser et faire signer tous vos formulaires sans utiliser de papier.

---

### Zéro Papier : Signature 100% Numérique

Notre module de signature simplifie la gestion de vos documents depuis n'importe quel écran :

1. **Modèles de Consentement**: Rédigez vos textes juridiques et associez-les à des prestations précises (ex: Consentement pour Toxine Botulique, Épilation Laser).
2. **Signature Tactile**: Le patient consulte le document sur une tablette ou un smartphone à l'accueil, puis signe avec son doigt ou un stylet sur l'écran.
3. **Archivage Ultra-Sécurisé**: Le document signé est stocké directement dans le dossier du patient, avec la date et l'heure exactes.
4. **Sceau de Sécurité Immuable**: La signature est scellée de manière à ce qu'elle ne puisse pas être modifiée, garantissant sa valeur juridique et la conformité RGPD.`
        }
      },
      {
        id: 'i18n-jsonb',
        title: {
          es: 'Tu Catálogo en Varios Idiomas',
          en: 'Multi-Language Service Translation',
          fr: 'Traductions Multi-Langues'
        },
        markdown: {
          es: `# Tu Catálogo en Varios Idiomas

Si tu clínica recibe clientes internacionales o turistas, ofrecer tu catálogo en varios idiomas multiplicará tus reservas. ProBookia incluye soporte nativo y automático para **Español, Inglés y Francés**.

---

### ¿Cómo Funciona la Traducción Automática?

* **Campos Multi-idioma**: Al crear o editar un servicio, puedes introducir el nombre y la descripción en los diferentes idiomas de forma opcional.
* **Detección Inteligente del Cliente**: Cuando un paciente visite tu portal de reservas, el sistema detectará el idioma de su navegador web y le mostrará tu catálogo traducido de forma instantánea.
* **Sin Retrasos en tu Web**: Todo el contenido traducido se almacena de forma optimizada junto con el servicio, garantizando que tu página web se cargue a máxima velocidad, sin importar el idioma seleccionado.

> [!TIP]
> Si no traduces un servicio a un idioma específico, el portal le mostrará tu idioma por defecto en lugar de dejar el campo en blanco, asegurando que tu menú siempre se vea completo y profesional.`,
          en: `# Multi-Language Service Translation

If your clinic hosts international clients, travelers, or expats, publishing your catalog in multiple languages will boost your online bookings. ProBookia natively supports translations for **English, Spanish, and French**.

---

### How Translations Operate

* **Multi-Language Fields**: When designing a treatment card, you can easily fill in the name and descriptions for English, Spanish, and French.
* **Auto Language Detector**: When a visitor enters your booking portal, the engine automatically checks their browser language setting, displaying translations instantly.
* **High-Speed Loads**: Translated content is stored inside the service card, ensuring your booking wizard loads at maximum speed with zero lag.

> [!TIP]
> If you leave a translation field empty, the portal displays your default clinic language as a fallback, ensuring your services are always legible and professional.`,
          fr: `# Traductions Multi-Langues de Vos Soins

Si votre clientèle est internationale ou touristique, proposer vos soins en plusieurs langues est un atout précieux. ProBookia intègre une gestion complète de l'**Espagnol, de l'Anglais et du Français**.

---

### Comment Fonctionnent les Traductions ?

* **Champs Multilingues**: Lors de la création d'un soin, vous pouvez saisir le nom et la description dans les différentes langues de votre choix.
* **Détection Automatique**: Le portail détecte la langue du navigateur web du patient et affiche le catalogue correspondant instantanément.
* **Chargement Ultra-Rapide**: Les traductions sont stockées de manière optimisée, assurant une vitesse d'affichage maximale.

> [!TIP]
> Si vous ne remplissez pas la traduction pour un soin, le système affichera votre langue par défaut pour éviter un espace vide, garantissant un rendu impeccable.`
        }
      }
    ]
  },
  {
    id: 'motor-reservas',
    title: {
      es: 'Sección 3: Integración Web y Gestión de Citas',
      en: 'Section 3: Web Embedding & Appointment Rules',
      fr: 'Section 3: Intégration Web & Réservations'
    },
    subpages: [
      {
        id: 'iframe-widget',
        title: {
          es: 'Integrar Reservas en tu Página Web',
          en: 'Embed Booking Widget on Your Site',
          fr: 'Intégrer le Module Sur Votre Site'
        },
        markdown: {
          es: `# Integrar Reservas en tu Página Web

Con ProBookia no necesitas cambiar de página web. Puedes insertar tu panel de reservas directamente en tu web actual (WordPress, Squarespace, Wix o código personalizado) mediante un **Widget interactivo**.

---

### ¿Cómo Funciona la Integración?

* **Acceso Directo**: Los pacientes reservan sus citas dentro de una ventana elegante y segura integrada en tu web, sin tener que abandonarla.
* **Código de Copiar y Pegar**: Te proporcionamos una línea de código sencilla que puedes pegar en tu editor web favorito:
\`\`\`html
<iframe src="https://reservas.probookia.com/tu-clinica" width="100%" height="800px" frameborder="0"></iframe>
\`\`\`
* **Adaptable a Móviles (Responsive)**: El widget se rediseña automáticamente para verse espectacular tanto en ordenadores de escritorio como en smartphones de cualquier tamaño.`,
          en: `# Embed Booking Widget on Your Website

With ProBookia, you do not need to replace your current corporate website. You can inject your luxury booking assistant directly into your existing pages (WordPress, Wix, Squarespace, or custom code) using a **Web Widget**.

---

### Embedding Mechanics

* **Seamless Booking Journey**: Patients schedule their times inside a beautiful and secure overlay on your site, keeping them on your brand.
* **Simple Copy-Paste Snippet**: We provide a simple HTML iframe line that you can easily copy and paste into any website builder:
\`\`\`html
<iframe src="https://booking.probookia.com/your-clinic" width="100%" height="800px" frameborder="0"></iframe>
\`\`\`
* **Fully Mobile Friendly**: The widget automatically adjusts its columns and grids to look stunning on both desktop viewports and Apple/Android smartphones.`,
          fr: `# Intégrer le Module de Réservation sur Votre Site

Avec ProBookia, nul besoin de changer de site web. Vous pouvez insérer votre calendrier de réservation directement sur votre site actuel (WordPress, Wix, Squarespace) à l'aide d'un **Module interactif**.

---

### Comment Fonctionne l'Intégration ?

* **Expérience Client Fluide**: Vos clients choisissent leurs créneaux directement dans une fenêtre intégrée, sans jamais quitter votre site internet.
* **Code Simple à Coller**: Nous vous fournissons un code simple à insérer sur votre éditeur web :
\`\`\`html
<iframe src="https://reservations.probookia.com/votre-centre" width="100%" height="800px" frameborder="0"></iframe>
\`\`\`
* **Optimisé pour les Mobiles**: Le module s'adapte automatiquement à toutes les tailles d'écrans pour un affichage parfait sur ordinateurs, tablettes et smartphones.`
        }
      },
      {
        id: 'fianzas-stripe',
        title: {
          es: 'Cobrar Fianzas y Evitar Cancelaciones',
          en: 'Charge Booking Deposits & Escrow',
          fr: 'Acomptes de Garantie & Stripe'
        },
        markdown: {
          es: `# Cobrar Fianzas y Evitar Cancelaciones

¿Te preocupa que los clientes no se presenten a sus citas reservadas? En ProBookia puedes vincular tu cuenta de cobros para solicitar un **pago de fianza obligatorio** antes de confirmar el hueco en tu agenda.

---

### Métodos de Garantía Disponibles

Desde tus ajustes de cobro, puedes elegir la política de pago que mejor se adapte a cada uno de tus tratamientos:

1. **Reserva 100% Online**: El cliente debe abonar la totalidad del tratamiento en la web para poder guardar su cita.
2. **Depósito / Fianza Parcial**: El cliente abona una pequeña cantidad como garantía (ej: 20€). El resto del importe se abona en la clínica el día del tratamiento.
3. **Pago en Clínica**: La reserva es gratuita y el pago se realiza íntegramente tras finalizar la sesión.

> [!TIP]
> Exigir una pequeña fianza (incluso de 10€ o 15€) en tratamientos costosos o de alta ocupación reduce el absentismo (no-shows) a prácticamente cero, protegiendo el tiempo de tu equipo y el rendimiento de tu clínica.`,
          en: `# Escrow Deposits & No-Show Protection

Tired of empty appointment slots due to last-minute cancellations or client no-shows? ProBookia allows you to link your corporate bank account and require a **mandatory booking deposit** before slots are confirmed.

---

### Booking Guarantee Policies

Inside your payment preferences tab, you can select the policy that best matches your clinic services:

1. **100% Online Prepayment**: Clients pay the full amount of the treatment online to secure their date and slot.
2. **Partial Deposit**: Clients make a safety deposit upfront (e.g. $25). The remaining balance is paid at your center.
3. **Pay at Clinic**: Reservations are processed for free. The full service amount is collected at your physical venue.

> [!TIP]
> Setting up a small deposit (even $15 or $20) on high-value or long-duration treatments reduces clinic no-shows to near zero, shielding your team's valuable schedule.`,
          fr: `# Acomptes de Garantie & Protection Contre l'Absentisme

Vous souhaitez en finir avec les rendez-vous non honorés qui perturbent votre activité ? ProBookia vous permet de demander un **acompte de garantie obligatoire** avant la validation du rendez-vous.

---

### Options de Paiement Disponibles

Dans vos paramètres, définissez la politique de paiement la plus adaptée à vos soins :

1. **Paiement Intégral en Ligne**: Le client règle 100% du prix du soin lors de la réservation en ligne.
2. **Acompte Partiel (Garantie)**: Le client paie un montant partiel (ex: 20€) en ligne pour réserver. Le solde restant est réglé sur place le jour du soin.
3. **Réservation Gratuite**: Le rendez-vous est bloqué sans carte bancaire, le paiement se fait sur place après le soin.

> [!TIP]
> Demander un petit acompte de garantie (même 10€ ou 15€) réduit le taux de rendez-vous manqués à près de zéro, protégeant ainsi l'agenda de vos praticiens.`
        }
      },
      {
        id: 'cron-purga',
        title: {
          es: 'Liberación de Citas No Confirmadas',
          en: 'Unconfirmed Booking Slot Cleanup',
          fr: 'Libération des Créneaux Orphelins'
        },
        markdown: {
          es: `# Liberación Automática de Citas No Confirmadas

¿Qué pasa si un cliente selecciona una hora en tu portal de reservas pero cierra la pestaña antes de terminar de introducir sus datos o realizar el pago? En ProBookia evitamos que tu agenda se quede bloqueada.

---

### Liberación Inteligente de Huecos

Para asegurar que ningún hueco se pierda de forma injustificada, implementamos una regla de limpieza automática:

1. **Bloqueo Temporal**: En el momento en que un cliente hace clic en una hora disponible, ese hueco queda marcado como "En verificación" en tu agenda.
2. **Vigencia de 30 Minutos**: El sistema le otorga al cliente **30 minutos** de plazo para que complete su reserva, confirme su correo o realice el pago de la fianza.
3. **Liberación Automática**: Si transcurren los 30 minutos y la reserva no ha sido completada con éxito, el sistema **libera el hueco al instante**, volviendo a poner la hora a disposición de otros pacientes en tu web.`,
          en: `# Auto Cleanup of Unfinished Bookings

What happens if a user selects an open slot on your booking website but closes their browser tab before filling in their contact details or processing their card payment? ProBookia blocks that slot from being held indefinitely.

---

### Smart Slot Revalidation

To ensure your clinical schedules are never blocked by abandoned page checkouts, our engine runs a dynamic cleanup routine:

1. **Temporary Hold**: The moment a user clicks on an open slot, the system marks the slot as "Verification Pending".
2. **30-Minute Checkout Timer**: The engine gives the user **30 minutes** to complete their booking, verify email instructions, or process their payment.
3. **Automated Slot Release**: If 30 minutes pass without confirmation, the system **automatically purges** the pending ticket, instantly opening the slot back to the public.`,
          fr: `# Libération des Créneaux Horaires Inachevés

Que se passe-t-il si un client sélectionne une heure disponible sur votre site mais ferme son navigateur avant d'avoir validé ses coordonnées ou payé l'acompte ? ProBookia empêche ce créneau de rester bloqué.

---

### Libération Automatique et Intelligente

Pour éviter que des créneaux de soins ne soient monopolisés par des paniers abandonnés, notre système applique une règle de nettoyage automatique :

1. **Blocage Temporaire**: Dès qu'un client choisit un créneau, l'heure est temporairement réservée avec le statut "En cours de vérification".
2. **Délai de Validation de 30 Minutes**: Le client dispose de **30 minutes** pour terminer son parcours et valider son paiement.
3. **Remise en Ligne Immédiate**: Si le délai expire sans confirmation, le créneau est **libéré automatiquement** et redevient immédiatement réservable par d'autres clients.`
        }
      }
    ]
  },
  {
    id: 'configuracion-operativa',
    title: {
      es: 'Sección 4: Ajustes del Negocio y Horarios',
      en: 'Section 4: Operating Hours & Business Setup',
      fr: 'Section 4: Horaires & Paramètres d\'Établissement'
    },
    subpages: [
      {
        id: 'plan-suscripcion',
        title: {
          es: 'Planes de Suscripción',
          en: 'Subscription Tiers',
          fr: 'Forfaits & Abonnements'
        },
        markdown: {
          es: `# Planes de Suscripción

ProBookia crece al mismo ritmo que tu negocio. Ofrecemos diferentes planes de servicio que puedes cambiar en cualquier momento desde tu panel de control, sin permanencias.

---

### Planes Disponibles

1. **Free / Autónomos**: Perfecto para profesionales independientes. Incluye 1 especialista activo, 1 sede física y hasta 50 reservas al mes.
2. **Basic / Clínicas**: Ideal para clínicas pequeñas. Soporta hasta 3 especialistas, 2 sedes físicas, control de facturas rápido y herramientas CRM básicas.
3. **Pro / Centros**: Para clínicas consolidadas. Especialistas y sedes ilimitadas, cálculo automático de comisiones para tu personal y exportaciones completas.
4. **Gold Elite**: Acceso prioritario de soporte, asistente autónomo IA Webmaster para diseñar tu web y Co-piloto por comandos de voz en directo.

> [!NOTE]
> Cuando cambias de plan (mejoras o bajas), Stripe calcula de forma automática un prorrateo sobre los días restantes de tu mes, de modo que solo pagas por la diferencia real de días utilizados, sin cargos inesperados.`,
          en: `# Subscription Tiers & Pricing Plans

ProBookia is built to scale alongside your organization's success. We offer flexible service plans that you can transition between at any time right from your settings, with no contracts.

---

### Available Plans

1. **Free / Solo Practitioners**: Perfect for individual professionals. Includes 1 specialist, 1 physical location, and up to 50 bookings per month.
2. **Basic / Small Clinics**: Designed for growing teams. Supports up to 3 active specialists, 2 centers, express invoicing, and standard CRM sheets.
3. **Pro / Medical Centers**: For established multi-local clinics. Unlimited specialists and locations, automated staff commission registers, and CSV audit reports.
4. **Gold Elite**: VIP support routing, interactive AI Webmaster builders, and direct Voice intent pilots.

> [!NOTE]
> Plan upgrades and downgrades calculate automatic prorated values via Stripe Subscriptions based on the remaining days of your active billing cycle, ensuring zero surprise fees.`,
          fr: `# Forfaits & Tarifs d'Abonnement

ProBookia grandit à la même vitesse que votre établissement. Nous proposons différents forfaits d'abonnement sans engagement que vous pouvez ajuster à tout moment.

---

### Forfaits Disponibles

1. **Free / Indépendant**: Idéal pour les professionnels solos. Comprend 1 praticien actif, 1 adresse physique et 50 réservations par mois.
2. **Basic / Cliniques**: Pour les petites équipes. Jusqu'à 3 praticiens, 2 centres physiques, suivi simplifié des factures et CRM de base.
3. **Pro / Centres Médicaux**: Pour les centres d'envergure. Nombre de praticiens et de centres illimité, calcul automatique des commissions de l'équipe et exports complets.
4. **Gold Elite**: Support technique prioritaire, assistant IA Webmaster autonome et Co-pilote vocal en direct.

> [!NOTE]
> Lors d'un changement de forfait, Stripe calcule automatiquement un prorata au jour près sur votre mois en cours, vous garantissant de ne payer que ce que vous utilisez.`
        }
      },
      {
        id: 'perfil-empresa',
        title: {
          es: 'Perfil de la Empresa',
          en: 'Company Profile Setup',
          fr: 'Profil de l\'Établissement'
        },
        markdown: {
          es: `# Perfil de la Empresa

Los datos legales, fiscales y de contacto de tu negocio se centralizan en la pestaña **General** dentro de Ajustes. Mantener estos datos al día es importante, ya que se usan para rellenar automáticamente tus facturas legales y notificaciones.

---

### Datos Principales a Configurar

* **Nombre Comercial**: Es el nombre de tu clínica que verán tus clientes en el portal web y en los correos electrónicos.
* **Datos Fiscales (DNI/CIF/Razón Social)**: Razón social que aparecerá reflejada en los encabezados de tus facturas legales emitidas.
* **Número de Registro Sanitario**: Campo opcional ideal para centros médicos y de estética que deseen mostrar su número de registro de sanidad en el pie de página de su web.
* **Dirección Principal**: Calle y número de tu sede principal o domicilio fiscal de la empresa.
* **Redes Sociales**: Añade los enlaces de tu WhatsApp, Instagram o perfil de Google Maps para que aparezcan como iconos elegantes en tu portal de reservas.`,
          en: `# Company Profile Settings

Your clinical legal, billing, and contact records are central inside the **General** settings tab. Keeping this profile updated is essential, as this schema automatically populates your legal invoice PDFs and client emails.

---

### Configurable Records

* **Commercial Name**: The clinic brand name displayed to patients in text notifications and landing headers.
* **Billing Details (Tax ID / CIF)**: The legal fiscal name required to issue official, compliant invoice sheets.
* **Health Registry Number**: An optional field for medical and aesthetic centers wishing to publish sanitary compliance numbers inside footer sections.
* **Primary Address**: Street name and physical coordinates of your main office or legal fiscal headquarters.
* **Social Links**: Insert links for WhatsApp, Instagram, or Google Maps directions to render as sleek social badges in the booking footer.`,
          fr: `# Profil de l'Établissement

Vos informations juridiques, fiscales et de contact sont centralisées dans l'onglet **Général** des paramètres. Il est essentiel de les maintenir à jour car elles remplissent vos factures et rappels de rendez-vous.

---

### Informations à Renseigner

* **Nom Commercial**: Le nom de votre centre affiché à vos clients sur le portail web et sur les emails de rappel.
* **Informations Fiscales (SIRET / Numéro de TVA)**: Raison sociale requise pour l'émission de factures certifiées conformes.
* **Numéro d'Enregistrement Sanitaire**: Champ optionnel permettant d'afficher vos certifications de santé en bas de page.
* **Adresse du Siège**: Adresse physique ou fiscale de votre établissement principal.
* **Réseaux Sociaux**: Renseignez vos comptes WhatsApp, Instagram ou Google Maps pour les afficher sous forme d'icônes élégantes sur votre portail.`
        }
      },
      {
        id: 'agenda-horarios',
        title: {
          es: 'Configurar Horarios y Descansos',
          en: 'Configure Hours & Breaks',
          fr: 'Paramétrer Horaires & Pauses'
        },
        markdown: {
          es: `# Configurar Horarios y Descansos

ProBookia te da el control total sobre la disponibilidad de tu clínica. El motor de reservas respetará siempre y de forma estricta los días festivos, las horas de apertura y las pausas para comer del personal.

---

### Cómo Definir la Jornada Laboral

Desde el menú de Agenda, puedes definir las pautas de disponibilidad horaria generales del centro:

* **Hora de Apertura y Cierre**: Define las horas exactas de inicio y fin de jornada (ej: lunes a viernes de 09:00 a 20:00).
* **Bloqueos por Descanso (Comida)**: Configura las pausas del equipo (ej: descanso para comer de 14:00 a 15:30). El portal web ocultará de inmediato estas horas a tus clientes, haciendo imposible que reserven citas durante la comida.
* **Días de Apertura**: Utiliza los interruptores de días semanales para marcar si el centro abre o permanece cerrado (ej: fines de semana desactivados).
* **Horarios del Especialista**: Si un especialista de tu clínica tiene un turno de trabajo individual diferente al del centro, el sistema aplicará automáticamente sus horas personales, evitando citas fuera de su turno.`,
          en: `# Operating Hours & Calendar Breaks

ProBookia grants you full control over your clinic's calendar schedule. The online booking engine strictly respects custom holidays, daily opening/closing margins, and specialist breaks.

---

### How to Structure Daily Operating Times

Within the Agenda calendar settings, managers can easily set global availability policies:

* **Daily Opening & Closing**: Set target operational boundaries (e.g. Monday-Friday from 09:00 to 20:00).
* **Rostered Lunch Breaks**: Configure daily break times (e.g. lunch hour from 14:00 to 15:30). The patient portal instantly hides these blocks, making double-booking over lunch windows impossible.
* **Weekly Workdays**: Select which days of the week are active or closed (e.g. Saturday-Sunday toggled off).
* **Specialist Shift Overrides**: If a specific practitioner works an custom shift, ProBookia prioritises their individual times over global clinic opening hours.`,
          fr: `# Horaires d'Ouverture & Pauses

ProBookia vous permet de garder la maîtrise complète de vos plannings. Notre moteur de réservation en ligne respectera scrupuleusement vos congés, vos horaires d'ouverture et les pauses déjeuner de votre équipe.

---

### Comment Paramétrer Vos Heures de Disponibilité

Depuis l'onglet Agenda, gérez simplement le calendrier de votre établissement :

* **Horaires d'Ouverture et de Fermeture**: Définissez l'amplitude d'accueil générale (ex : du lundi au vendredi de 09h00 à 20h00).
* **Pauses Déjeuner**: Renseignez les heures de pause de vos équipes (ex : repas de 14h00 à 15h30). Ces créneaux sont instantanément masqués sur le site de réservation.
* **Jours de Fermeture**: Utilisez les boutons pour activer ou désactiver les jours d'ouverture (ex : week-end désactivé).
* **Horaires Personnels des Praticiens**: Si un membre a des horaires spécifiques, le planning s'ajustera automatiquement à son agenda individuel.`
        }
      },
      {
        id: 'bloqueos-festivos',
        title: {
          es: 'Bloqueo de Citas y Horario de Antelación',
          en: 'Booking Blockouts & Lead Time',
          fr: 'Blocages & Délai d\'Anticipation'
        },
        markdown: {
          es: `# Bloqueo de Citas y Horario de Antelación

Para ofrecer una atención fluida y de alta calidad, necesitas tiempo para preparar los tratamientos de cabina. ProBookia te ayuda a evitar las reservas sorpresa con muy poco tiempo de antelación.

---

### Registrar Vacaciones y Días Festivos

Puedes bloquear de forma inmediata días específicos de tu agenda en los que tu clínica estará de vacaciones o sea día festivo local:
1. **Crear Ausencia**: Añade un título descriptivo (ej: "Día de Navidad", "Vacaciones de Pascua").
2. **Elegir Fechas**: Marca el rango exacto de días en los que el centro permanecerá cerrado. El portal de reservas bloqueará de forma automática esos días en los calendarios públicos de todos tus especialistas.
3. **Repetición**: Activa el bloqueo automático para que se repita todos los años.

### Tiempo de Antelación Mínimo

Evita que un cliente reserve una cita para "dentro de 10 minutos" cuando el especialista no está preparado o la cabina no está acondicionada. Puedes definir un tiempo mínimo de antelación para que el portal web muestre horas:
* **Ejemplo**: Si fijas **3 horas de antelación**, si un cliente entra a reservar en tu web a las 10:00 de la mañana, la primera cita disponible que el sistema le dejará seleccionar será a partir de las 13:00 de la tarde de ese mismo día. Esto le da un valioso margen de preparación a tu equipo.`,
          en: `# Calendar Blockouts & Lead Time Rules

Delivering luxury, tailored wellness treatments requires buffer time to prepare therapy cabins. ProBookia helps clinic operators block unexpected bookings made too close to current times.

---

### Setting Holidays & Off Days

Managers can instantly block off days when the center is closed for holidays or local vacations:
1. **Register Absences**: Enter a clear label (e.g. "Christmas Vacation", "Summer Holiday Block").
2. **Date Range Selection**: Input the start and end dates. The booking system immediately stops clients from booking slots with any specialist during this period.
3. **Annual Switch**: Automate recurrent local holidays to repeat calendar blockouts year after year.

### Minimum Booking Lead Time

Prevent a client from booking a slot "10 minutes from now" when your specialist is not prepared or the room has not been sanitized. Configure a minimum lead time threshold:
* **Example**: If set to **3 hours**, a patient browsing your online booking portal at 10:00 will only be offered slots starting at 13:00 or later on that day. This grants your practitioners the buffer time needed to organize the cabin.`,
          fr: `# Blocage de Rendez-vous & Anticipation

Pour offrir des prestations de qualité, vous avez besoin de temps pour préparer vos cabines de soins. ProBookia vous aide à éviter les réservations de dernière minute imprévues.

---

### Enregistrer Vos Vacances et Jours Fériés

Bloquez instantanément des journées entières de fermeture pour congés ou jours fériés :
1. **Créer une Absence**: Indiquez un titre explicatif (ex : "Vacances de Noël", "Jour Férié").
2. **Sélectionner les Dates**: Définissez le début et la fin de la période. Tous les agendas de vos praticiens seront bloqués.
3. **Répétition**: Configurez les fermetures récurrentes pour qu'elles se répètent automatiquement chaque année.

### Délai d'Anticipation Minimum des Réservations

Évitez qu'un client ne prenne rendez-vous pour "dans 15 minutes" alors que votre cabine n'est pas prête. Définissez un délai d'anticipation minimum :
* **Exemple**: Si configuré sur **3 heures**, un client naviguant sur votre site à 10h00 ne pourra choisir qu'un créneau disponible à partir de 13h00, offrant ainsi un temps de préparation confortable à votre équipe.`
        }
      }
    ]
  },
  {
    id: 'cobertura-pagos',
    title: {
      es: 'Sección 5: Servicios a Domicilio y Cobros',
      en: 'Section 5: Home Services & Stripe Connect',
      fr: 'Section 5: Soins à Domicile & Stripe Connect'
    },
    subpages: [
      {
        id: 'cobertura-domicilio',
        title: {
          es: 'Servicios a Domicilio y Cobertura',
          en: 'Mobile & Home Visit Services',
          fr: 'Soins à Domicile & Déplacements'
        },
        markdown: {
          es: `# Servicios a Domicilio y Cobertura

¿Tu negocio ofrece servicios a domicilio, o tus profesionales viajan directamente a las casas de los pacientes para realizar tratamientos estéticos, masajes o consultas médicas? ProBookia está totalmente adaptado para profesionales móviles.

---

### Modalidades de Trabajo Disponibles

Puedes elegir la forma de operar preferida para tu clínica o para especialistas específicos:

* **En el Centro**: Los servicios se realizan exclusivamente en las salas o cabinas físicas de tu clínica.
* **A Domicilio**: Tus especialistas se desplazan a la dirección postal que introduzca el cliente en el portal web.
* **Modalidad Mixta**: El cliente puede elegir si prefiere reservar el tratamiento en tu local físico o recibirlo cómodamente en su propio hogar.

### Control Geográfico y Lista Blanca de Códigos Postales

Para proteger a tus profesionales de viajes demasiado largos o costosos, puedes aplicar límites de distancia:
1. **Dirección Base**: Indica la ubicación física desde donde parte tu equipo.
2. **Radio de Distancia Máxima**: Configura una distancia máxima permitida de desplazamiento en kilómetros (ej: máximo 25 km a la redonda).
3. **Códigos Postales Validados**: Introduce la lista de códigos postales donde trabajas. Si el cliente introduce un código postal fuera de tu lista al reservar en la web, el sistema le informará de forma educada que la zona queda fuera de cobertura antes de realizar ningún cargo.`,
          en: `# Mobile & Home Visit Services

Do you operate a mobile aesthetic practice, travel directly to patient houses for therapy treatments, or offer home visit consultations? ProBookia is fully optimized for mobile specialists.

---

### Available Workspace Modalities

You can customize how your clinic operates overall or configure specific specialists individually:

* **In-Clinic Only**: Traditional brick-and-mortar appointments inside your physical rooms.
* **At-Home Only**: Mobile treatments where specialists travel directly to the client's home address.
* **Mixed Modality**: Patients choose whether to visit your physical address or schedule the treatment at their home.

### Geofencing & whitelisted ZIP Codes

To protect mobile practitioners from exhausting, long-distance, or unprofitable travels, configure geographic constraints:
1. **Base Coordinates**: Specify the physical address where your mobile team starts routing.
2. **Maximum Traveling Radius**: Set a maximum allowed travel distance in miles or kilometers (e.g. up to 25 km).
3. **Whitelisted ZIP Codes**: Enter valid ZIP codes. If a patient inputs a ZIP code missing from your active whitelist, the booking wizard will prompt a polite out-of-coverage message before any payment is made.`,
          fr: `# Soins à Domicile & Zones de Déplacement

Vous proposez des soins esthétiques à domicile ou des consultations où vos praticiens se déplacent chez vos patients ? ProBookia est idéalement conçu pour la gestion des professionnels mobiles.

---

### Modalités de Travail Proposées

Déterminez le fonctionnement général de votre centre ou configurez chaque praticien individuellement :

* **En Centre Uniquement**: Les rendez-vous ont lieu exclusivement dans vos cabines physiques.
* **À Domicile Uniquement**: Vos spécialistes se déplacent à l'adresse renseignée par le client sur le site.
* **Modalité Mixta (Mixte)**: Le client choisit entre un rendez-vous dans vos locaux ou un soin à son domicile.

### Gestion Géographique des Déplacements

Pour éviter à votre équipe des trajets trop longs et coûteux, appliquez des restrictions géographiques :
1. **Adresse de Départ**: Indiquez le point de départ de votre équipe.
2. **Rayon Kilométrique Maximum**: Définissez une distance de trajet autorisée en kilomètres (ex : 25 km maximum).
3. **Codes Postaux Autorisés**: Renseignez les codes postaux desservis. Si l'adresse du client n'est pas dans la liste, le portail lui signalera poliment que la zone n'est pas couverte.`
        }
      },
      {
        id: 'pagos-stripe-connect',
        title: {
          es: 'Configurar Cobros con Stripe Connect',
          en: 'Link Payments with Stripe Connect',
          fr: 'Configurer Stripe Connect'
        },
        markdown: {
          es: `# Cómo Configurar Cobros con Stripe

Cobrar tus reservas de forma segura y recibir el dinero directamente en tu banco es sumamente sencillo en ProBookia. Empleamos la pasarela oficial y segura **Stripe Connect Standard** para procesar los pagos sin intermediarios.

---

### Enlazar tu Cuenta de Stripe

Configurar la pasarela de cobros te llevará menos de 2 minutos:

1. **Ir a Ajustes**: Dirígete a la pestaña **Pagos** en tu panel de control de ProBookia.
2. **Onboarding Directo**: Haz clic en el botón "Conectar Stripe" para iniciar el asistente de configuración segura en la web de Stripe.
3. **Registro Rápido**: Rellena tus datos de autónomo o empresa y tu número de cuenta bancaria. 
4. **Listo para Cobrar**: Una vez completado el registro, Stripe te redirigirá automáticamente a ProBookia, mostrando tu cuenta enlazada y lista para recibir depósitos.

> [!IMPORTANT]
> ProBookia no retiene tus ingresos en cuentas intermedias ni cobra comisiones de gestión sobre tus cobros. El dinero pagado por tus clientes se deposita directamente en tu propia cuenta bancaria a través de la pasarela de Stripe.`,
          en: `# How to Link Payments with Stripe

Processing booking deposits online and receiving funds directly in your corporate bank account is straightforward. ProBookia integrates natively with **Stripe Connect Standard** to secure all financial transactions with no intermediates.

---

### Linking Your Stripe Account

Connecting your payment gateway takes less than 2 minutes:

1. **Access Settings**: Navigate to the **Payments** tab inside your ProBookia admin dashboard.
2. **Secure Onboarding**: Click "Connect Stripe" to redirect to the official, secure Stripe registration pages.
3. **Quick Setup**: Input corporate records and your active business bank account number.
4. **Ready for Checkout**: Once validated, Stripe returns focus to ProBookia, showing your active linked account status.

> [!IMPORTANT]
> ProBookia never holds your earnings in intermediate accounts or collects transaction management fees. All booking payments made by clients flow directly to your linked business bank account.`,
          fr: `# Configurer les Paiements En Ligne avec Stripe

Encaisser vos acomptes ou vos prestations en toute sécurité et recevoir les fonds directement sur votre compte bancaire est très simple. ProBookia intègre la passerelle officielle **Stripe Connect Standard** sans intermédiaire.

---

### Associer Votre Compte Stripe

La configuration de votre terminal de paiement prend moins de 2 minutes :

1. **Accéder aux Paramètres**: Rendez-vous dans l'onglet **Paiements** de votre tableau de bord.
2. **Connexion Sécurisée**: Cliquez sur le bouton "Connecter Stripe" pour ouvrir le formulaire sécurisé de Stripe.
3. **Formulaire Express**: Saisissez vos coordonnées d'entreprise et votre RIB de destination des fonds.
4. **Activé**: Stripe vous redirige automatiquement vers ProBookia. Votre compte est prêt à recevoir des paiements.

> [!IMPORTANT]
> ProBookia ne conserve pas vos fonds sur des comptes intermédiaires et ne prend aucune commission de gestion. Les règlements de vos clients sont versés directement sur votre compte bancaire via Stripe.`
        }
      }
    ]
  },
  {
    id: 'branding-experiencia',
    title: {
      es: 'Sección 6: Personalizar tu Portal de Reservas',
      en: 'Section 6: Design & Branding Settings',
      fr: 'Section 6: Personnalisation de Votre Image'
    },
    subpages: [
      {
        id: 'branding-favicon',
        title: {
          es: 'Logotipos, Paletas de Colores y Fuentes',
          en: 'Logos, Colors & Premium Fonts',
          fr: 'Logos, Couleurs & Polices'
        },
        markdown: {
          es: `# Personalización de Marca Blanca

Tu portal público de reservas es el escaparate digital de tu negocio. Con el panel de **Personalización de Marca**, puedes adaptarlo al diseño "Quiet Luxury" de tu clínica en segundos.

---

### Opciones de Diseño en la Pestaña Branding

* **Cargar tu Logotipo**: Sube el logotipo oficial de tu centro (preferiblemente transparente en formato PNG o SVG). Se adaptará a la barra superior del portal web, al pie de página y a las facturas en PDF.
* **Favicon de la Pestaña**: Sube tu icono cuadrado corporativo para que los clientes lo visualicen en la pestaña superior de sus navegadores web.
* **Paletas de Colores**: Elige entre nuestras combinaciones de colores seleccionadas especialmente para clínicas (Dorado/Antracita, Esmeralda/Lima, Bronce/Crema, Minimalista Industrial) o selecciona tu propio color corporativo (Custom).
* **Tipografías Premium**: Cambia la tipografía de encabezados y del cuerpo de texto para dar un toque editorial y elegante (Playfair Display, Outfit, Fredoka, Montserrat, Inter, Roboto).
* **Bordes de Botones**: Elige el acabado estético de botones y tarjetas (Recta, Suave/Ejecutiva (12px), Orgánica/Redonda (full)).
* **Modo Oscuro Predeterminado**: Activa este interruptor si prefieres que tu portal se cargue en un elegante fondo oscuro por defecto.`,
          en: `# Premium White-Label Customization

Your public booking portal serves as the digital front door of your clinic. Within the **Branding Customization** tab, you can tailor visual tokens to align with your center's quiet luxury feel in seconds.

---

### Design Assets to Customize

* **Upload Corporate Logo**: Upload your official transparent logo file (PNG, SVG). It renders perfectly inside header navbars, transactional emails, and legal invoices.
* **Browser Tab Favicon**: Load a custom square monogram or icon to display inside patient browser tabs.
* **Visual Color Palettes**: Choose from verified premium clinic color presets (Gold/Anthracite, Emerald/Lime, Bronze/Cream, Minimalist) or set primary/secondary accents manually (Custom).
* **Luxurious Typographies**: Transition your headers and body copy into elegant editorial structures (Playfair Display, Outfit, Fredoka, Montserrat, Inter, Roboto).
* **Border Radii Geometries**: Set border roundness for client buttons and cards (Straight (0px), Soft/Executive (12px), Rounded (full)).
* **Default Dark Mode**: Enable this toggle if you prefer your public booking site to display a dark, sleek aesthetic by default.`,
          fr: `# Personnalisation de Votre Image de Marque

Votre portail public de réservation est la vitrine digitale de votre établissement. Depuis l'onglet **Branding**, adaptez le design à l'esthétique haut de gamme de votre marque en quelques secondes.

---

### Les Éléments de Design à Personnaliser

* **Téléverser Votre Logo**: Ajoutez votre logo transparent (PNG, SVG). Il s'affichera sur votre site, dans les emails de confirmation et sur vos factures.
* **Favicon de l'Onglet**: Ajoutez l'icône carrée de votre marque pour l'afficher dans les onglets des navigateurs de vos clients.
* **Palettes de Couleurs**: Choisissez parmi nos harmonies conçues pour l'esthétique (Doré/Anthracite, Émeraude, Bronze/Crème, Minimaliste) ou appliquez vos propres couleurs (Custom).
* **Polices d'Écriture**: Modifiez les polices pour un style éditorial élégant (Playfair Display, Outfit, Fredoka, Montserrat, Inter, Roboto).
* **Bordures des Boutons**: Définissez l'arrondi des boutons et cadres (Droit (0px), Doux (12px), Arrondi (full)).
* **Mode Sombre Actif**: Cochez cette option si vous souhaitez que votre portail s'affiche dans des tons sombres et raffinés par défaut.`
        }
      },
      {
        id: 'layouts-reserva',
        title: {
          es: 'Diseños del Catálogo (Grilla vs Lista)',
          en: 'Booking Layouts (Grid vs Row List)',
          fr: 'Gabarits de Grille & Liste'
        },
        markdown: {
          es: `# Diseños de Reservas: Grilla vs Lista

La forma en que presentas tus servicios y tratamientos de estética determina la primera impresión de tus clientes. ProBookia te permite alternar entre dos elegantes diseños visuales para tu portal web.

---

### Diseños Visuales Disponibles

* **Boutique Grid (Cuadrículas a 2 Columnas)**: Presentación premium que destaca fotografías de alta resolución en cada tratamiento. Es la opción recomendada para clínicas de medicina estética, cirugías plásticas o spas que se benefician de imágenes descriptivas de antes/después o del gabinete de trabajo.
* **Lista Elegante (Filas Limpias)**: Un diseño minimalista, sumamente claro y de carga rápida. Los servicios se apilan verticalmente, uno debajo de otro, mostrando el nombre, duración y el precio a la derecha. Ideal si posees un catálogo muy extenso o prefieres una estética sobria sin fotos explicativas.

> [!TIP]
> Puedes ver los cambios de diseño en tiempo real utilizando el simulador de iPhone interactivo del panel de Ajustes antes de guardar los cambios para tus clientes públicos.`,
          en: `# Catalog Layouts: Grid vs Row List

How you display treatments and wellness therapies shapes your patients' first impression. ProBookia enables you to choose between two sleek layout configurations.

---

### Available Visual Layouts

* **Boutique Grid (2 Columns)**: A premium grid visual displaying high-resolution covers side-by-side. Strongly recommended for aesthetic clinics, cosmetic dermatologists, or luxury spas that benefit from clinical imagery.
* **Elegant List (Minimalist Rows)**: A clean and fast vertical layout. Services stack vertically, showing names, durations, and price tags to the right. Perfect for extensive treatment menus or centers preferring sobrier aesthetics without covers.

> [!TIP]
> You can preview layout switches live inside the interactive iPhone mockup in settings before applying changes to the public web.`,
          fr: `# Gabarits de Réservation : Grille ou Liste

La manière dont vous présentez vos soins cliniques façonne la première impression de vos clients. ProBookia vous propose d'opter pour l'une de nos deux mises en page exclusives.

---

### Mises en Page Disponibles

* **Boutique Grid (Grille 2 Colonnes)**: Une présentation visuelle mettant en valeur des photos haute résolution pour chaque soin. Recommandé pour les cliniques esthétiques ou spas utilisant des images de couverture de haute qualité.
* **Liste Élégante (Lignes Épurées)**: Rendu minimaliste, clair et rapide. Les soins s'alignent verticalement, affichant le tarif et la durée à droite. Idéal si votre catalogue est très étendu ou si vous préférez un design sobre sans photos.

> [!TIP]
> Visualisez le rendu instantanément sur le simulateur iPhone interactif disponible dans l'onglet de personnalisation avant de valider vos modifications.`
        }
      }
    ]
  },
  {
    id: 'seguridad-api-ia',
    title: {
      es: 'Sección 7: Inteligencia Artificial y Visibilidad Web',
      en: 'Section 7: AI Assistants & SEO Settings',
      fr: 'Section 7: Assistants IA & SEO'
    },
    subpages: [
      {
        id: 'api-keys-ia',
        title: {
          es: 'Conectar tu propia Inteligencia Artificial',
          en: 'Link Your Private AI API Keys',
          fr: 'Connecter Votre Propre Clé IA'
        },
        markdown: {
          es: `# Conecta tu propia Inteligencia Artificial

ProBookia te da total flexibilidad. En el plan Gold Elite, puedes conectar tus propias credenciales de Inteligencia Artificial para potenciar los copilotos de voz, creadores automáticos de SEO e ilustradores de tratamientos.

---

### Proveedores de Inteligencia Artificial Soportados

Desde tu panel de configuración Avanzada, puedes añadir tus claves:

1. **Google Gemini (Recomendado)**: Puedes conseguir tu clave de API gratuita en Google AI Studio para disfrutar de una velocidad increíble.
   * **Modelos de Texto**: Gemini 2.5 Flash, Gemini 3 Flash, Gemini 3.1 Pro (alta calidad).
   * **Modelos de Imagen**: Nano Banana 2 (3.1 Flash Image Preview) o Imagen 4.0 Standard.
2. **OpenAI ChatGPT**: Introduce tu clave de API para activar los modelos de OpenAI.
   * **Modelos de Texto**: GPT-4o mini (económico y rápido) o GPT-4o (alto rendimiento).
   * **Modelos de Imagen**: DALL-E 3.

> [!WARNING]
> Tus claves de API personales se almacenan totalmente cifradas en nuestra base de datos. Ningún usuario externo ni paciente final podrá leerlas jamás, protegiéndolas de accesos no autorizados o robos de cuota.`,
          en: `# Connect Your Own AI API Keys

ProBookia provides total operational flexibility. Within the Gold Elite tier, you can link your private generative AI accounts to power your voice copilots, automatic SEO copywriters, and treatment cover generators.

---

### Supported Artificial Intelligence Providers

Inside your Advanced settings tab, you can link:

1. **Google Gemini (Recommended)**: Secure your free API Key inside Google AI Studio for high-speed, instant responses.
   * **Text Models**: Gemini 2.5 Flash, Gemini 3 Flash, Gemini 3.1 Pro.
   * **Image Models**: Nano Banana 2 or Imagen 4.0 Standard.
2. **OpenAI ChatGPT**: Insert your OpenAI API Key to connect their generative framework.
   * **Text Models**: GPT-4o mini (highly efficient) or GPT-4o (top execution).
   * **Image Models**: DALL-E 3.

> [!WARNING]
> Your private API keys are encrypted at rest inside our secure database structure. No external callers or patients can inspect keys, protecting you from quota thefts.`,
          fr: `# Connecter Vos Clés d'API d'Intelligence Artificielle

ProBookia vous offre une flexibilité totale. Avec le forfait Gold Elite, associez vos propres abonnements d'IA pour propulser le co-pilote vocal et le générateur de descriptions SEO de vos soins.

---

### Fournisseurs d'IA Compatibles

Depuis l'onglet Paramètres Avancés, renseignez vos clés d'API :

1. **Google Gemini (Recommandé)**: Obtenez votre clé gratuite sur Google AI Studio pour des réponses ultra-rapides.
   * **Modèles de Texte**: Gemini 2.5 Flash, Gemini 3 Flash, Gemini 3.1 Pro.
   * **Modèles d'Image**: Nano Banana 2 ou Imagen 4.0 Standard.
2. **OpenAI ChatGPT**: Renseignez votre clé OpenAI pour utiliser leurs modèles.
   * **Modèles de Texte**: GPT-4o mini ou GPT-4o.
   * **Modèles d'Image**: DALL-E 3.

> [!WARNING]
> Vos clés d'API personnelles sont stockées sous forme cryptée en base de données. Aucun client externe ou patient ne peut y accéder, vous garantissant une sécurité totale.`
        }
      },
      {
        id: 'seo-noindex',
        title: {
          es: 'Ocultar tu Web de los Buscadores (Privacidad)',
          en: 'Hide Booking Site from Google (NoIndex)',
          fr: 'Masquer Votre Site du Référencement'
        },
        markdown: {
          es: `# Ocultar tu Web de los Buscadores (Privacidad)

Para clínicas muy exclusivas o centros médicos privados que operan únicamente con una lista cerrada de pacientes, puede ser un requisito de privacidad que el portal de reservas no aparezca en Google ni en Bing.

---

### Cómo Ocultar tu Portal en Google

ProBookia soluciona esto con un solo interruptor en la pestaña de configuración Avanzada:

* **Indexación Activada (Por defecto)**: Permite que Google e Instagram indexen tu catálogo para atraer nuevos clientes locales y potenciar tu visibilidad comercial.
* **Indexación Desactivada (NoIndex)**: Si activas este interruptor, el servidor de ProBookia inyectará etiquetas de seguridad (\`noindex, nofollow\`) en tu web. Esto indica de inmediato a los robots de Google, Yahoo, Bing o DuckDuckGo que no almacenen ni muestren tu web en sus resultados de búsqueda, protegiendo al 100% tu exclusividad operativa.`,
          en: `# Hide Booking Site from Google & Search Engines

For prestigious medical centers, private practitioners, or exclusive aesthetic spas operating with a restricted customer list, blocking search engines from indexing the booking web might be a privacy requirement.

---

### How to Block Google Crawlers

ProBookia handles bot blocking with a single toggle inside the Advanced settings tab:

* **Indexing Enabled (Default)**: Grants Google or Bing permission to crawl services and drive organic local patients to your landing site.
* **Indexing Disabled (NoIndex)**: Turning this toggle on commands ProBookia to inject restrictive headers (\`noindex, nofollow\`) into your portal code. This tells search engine crawlers to ignore your booking site and exclude it from public searches, preserving privacy.`,
          fr: `# Masquer Votre Site du Référencement Google (NoIndex)

Pour les centres très prestigieux ou les cabinets privés travaillant uniquement avec un cercle restreint de patients, masquer le site de réservation sur Google ou Bing peut être nécessaire.

---

### Comment Empêcher Google de Référencer Votre Site

ProBookia gère cela simplement à l'aide d'un bouton dans les Paramètres Avancés :

* **Indexation Activée (Par défaut)**: Permet aux moteurs de recherche de lister vos prestations pour attirer des clients locaux par recherche naturelle.
* **Indexation Désactivée (NoIndex)**: L'activation de cette option injecte des balises restrictives (\`noindex, nofollow\`) dans votre code. Les robots de Google reçoivent l'ordre de ne pas référencer votre site, protégeant la confidentialité de votre établissement.`
        }
      },
      {
        id: 'galeria-privada-sedes',
        title: {
          es: 'Multi-Sede y Archivos Seguros',
          en: 'Multi-Location Centers & Secure Media',
          fr: 'Multi-Centres & Stockage Sécurisé'
        },
        markdown: {
          es: `# Multi-Sede y Archivos Seguros

La estructura flexible de ProBookia te permite gestionar y coordinar de forma impecable el trabajo diario en múltiples sucursales o centros de trabajo independientes.

---

### Gestión Multi-Sede Física

Si tu clínica cuenta con diferentes establecimientos, no estás obligado a mezclar su disponibilidad:
1. **Ficha por Sede**: Configura el nombre, dirección, teléfono y correo específico de cada local físico.
2. **Calendario Propio**: Define horarios de apertura, descansos y vacaciones específicas para la Sede A sin afectar la disponibilidad de la Sede B.
3. **Especialistas Vinculados**: Asigna a tu personal de forma exclusiva a las sedes donde trabajan, evitando que un cliente reserve una cita con un especialista en la sucursal incorrecta.

### Galería de Medios Privada y Segura

Todas las imágenes que cargues de tus tratamientos, cabinas o especialistas se guardan en **un contenedor digital cifrado y aislado**. Nadie fuera de tu negocio podrá descargar o acceder a tus archivos multimedia, lo que garantiza una protección total de tu marca y la de tus pacientes.`,
          en: `# Multi-Location Centers & Private Secure Media

ProBookia's scalable architecture provides secure, decentralized capabilities to coordinate daily schedules across multiple physical clinics.

---

### Multi-Center Scheduling Setup

If your brand operates multiple physical locations, you can bypass unified hour constraints:
1. **Location Profiles**: Configure unique phone, address, and email records for each separate center branch.
2. **Independent Calendars**: Set custom holidays and daily operating hours for Location A without disturbing Location B.
3. **Specialist Binding**: Link active practitioners exclusively to the centers they work at, blocking patients from booking them at incorrect locations.

### Secure Private Media Storage

All image uploads for treatments, clinics, and specialist profiles are saved inside **a securely isolated digital vault**. No external actors can inspect or pull your media, ensuring absolute brand asset privacy.`,
          fr: `# Gestion Multi-Centres & Stockage Sécurisé de Vos Médias

L'architecture évolutive de ProBookia vous offre des outils décentralisés pour coordonner facilement l'activité de plusieurs succursales ou cabinets.

---

### Configuration Spécifique par Établissement

Si votre marque possède plusieurs succursales physiques, personnalisez chaque fiche :
1. **Profil de Centre**: Renseignez le numéro de téléphone, l'adresse et l'email propres à chaque établissement.
2. **Calendriers Autonomes**: Définissez des horaires et congés pour le Centre A sans impacter la disponibilité du Centre B.
3. **Affectation des Spécialistes**: Associez vos praticiens aux centres où ils exercent pour éviter toute erreur de réservation.

### Galerie de Médias Privée et Chiffrée

Toutes vos photos de soins, de locaux et de profil sont stockées dans **un espace numérique chiffré et hermétique**. Aucun tiers ne peut y accéder, garantissant la protection de vos documents et de votre image.`
        }
      },
      {
        id: 'agentes-ia-webmaster',
        title: {
          es: 'Asistentes Inteligentes para Gestionar tu Web',
          en: 'Autonomous AI Webmaster & Global Copilot',
          fr: 'Assistants IA Autonomes Webmaster & Copilote'
        },
        markdown: {
          es: `# Asistentes Inteligentes para Gestionar tu Web

En el Plan **Gold Elite** cuentas con acceso a los asistentes autónomos de Inteligencia Artificial más avanzados. Gracias a ellos, gestionar la configuración de tu negocio se convierte en una simple conversación por chat o comandos de voz.

---

### Diseñador Web Autónomo con Vista Previa (AI Webmaster)

Olvídate de buscar programadores para actualizar la landing page de tu clínica. Con **AI Webmaster** puedes:
* **Modificar por Chat**: Escribe comandos sencillos en lenguaje natural (ej: "Cambia el color primario de los botones a dorado", "Reescribe la descripción de Hidratación Facial para hacerla más exclusiva" o "Sube esta nueva foto de portada").
* **Simulador Web Integrado**: A la derecha de tu panel de chat verás un simulador web interactivo en tiempo real. 
* **Renderización al Instante**: En el momento en que la IA finaliza un cambio, el simulador se actualiza de inmediato para mostrarte el resultado en pantalla (pudiendo alternar entre vista de escritorio y vista móvil de iPhone).

### Copiloto Global por Voz

Gestiona tu agenda y clínica hablando de forma natural:
* **Audio y Comandos de Voz**: Presiona el botón del micrófono y habla libremente al copiloto de voz.
* **Consultas Rápidas**: Pregúntale verbalmente: "¿Cuántas citas tenemos agendadas para esta tarde?" o "¿Cuáles han sido los ingresos estimados de esta semana?". El copiloto analizará tu voz y te responderá con total precisión de forma segura.`,
          en: `# Autonomous AI Webmaster & Voice Copilot

The **Gold Elite** plan introduces highly sophisticated autonomous AI assistants, transforming daily clinical setups into simple chat conversations or voice prompts.

---

### Live Preview AI Webmaster (Iframe Editor)

Forget about hiring coders to update your clinic website. With **AI Webmaster**, you can:
* **Edit by Chatting**: Talk to the assistant in natural language (e.g. "Change the main buttons to a gold preset", "Rewrite the Facial treatment copy to sound more luxurious", or "Set this new cover image").
* **Simulated Device Preview**: A premium responsive simulation viewport sits right next to the chat panel.
* **Instant Renders**: The moment the AI applies database shifts, the browser iframe automatically reloads to showcase visual updates in real time (supporting simple desktop and mobile iPhone switches).

### Global Voice AI Copilot

Supervise your calendar agenda by talking naturally:
* **Voice Command Recognition**: Tap the microphone icon and prompt instructions using your voice.
* **Live Inquiries**: Ask verbally: "How many client sessions do we have scheduled for this afternoon?" or "What are the estimated earnings of this month?". The copilot parses your intent and answers instantly and securely.`,
          fr: `# Assistants IA Autonomes : Webmaster & Copilote Vocal

Le forfait **Gold Elite** intègre des assistants d'Intelligence Artificielle autonomes de pointe, transformant les tâches administratives complexes en une simple discussion.

---

### Concepteur Web IA Autonome (AI Webmaster)

Plus besoin de faire appel à des développeurs pour modifier le site de votre centre. Avec **AI Webmaster** :
* **Modifiez par Chat**: Donnez des consignes simples en langage naturel (ex : "Modifie la couleur des boutons en bronze", "Réécris la description du Soin Facial en y ajoutant une touche luxueuse").
* **Simulateur d'Écran Intégré**: Visualisez le rendu sur un écran interactif situé à droite du chat.
* **Rendu Instantané**: Dès que l'IA applique les changements, l'aperçu se met à jour en temps réel (basculez facilement entre le mode ordinateur et mobile iPhone).

### Assistant Copilote Vocal Global

Pilotez votre agenda et votre établissement en parlant simplement :
* **Reconnaissance Vocale**: Appuyez sur le micro et donnez vos consignes à haute voix.
* **Questions à l'Oral**: Demandez simplement : "Combien de rendez-vous avons-nous cet après-midi ?" ou "Quel est le chiffre d'affaires estimé de cette semaine ?". Le copilote analyse votre voix et vous répond avec précision.`
        }
      }
    ]
  }
];

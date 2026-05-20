# Catálogo de Funcionalidades de ProBookia.com
## La Plataforma de Gestión Clínica y Reservas Premium (Estética "Quiet Luxury")

Este documento detalla el catálogo técnico y comercial de las funcionalidades construidas y plenamente operativas en **ProBookia**, la suite SaaS B2B diseñada específicamente para digitalizar clínicas de estética, wellness y centros médicos de alta gama con un enfoque sofisticado, seguro y de altísimo rendimiento.

---

## 1. Módulos Core (Experiencia Clínica y Cliente)

El corazón de ProBookia está diseñado para ofrecer una experiencia fluida, sin fricciones y estéticamente superior para el personal de la clínica y sus pacientes finales.

### 1.1 Agenda y Calendario de Alta Precisión
Un sistema de gestión de citas interactivo en pantalla completa (`/calendar`) y altamente intuitivo:
* **Asignación Dinámica de Personal/Especialistas**: Permite visualizar y asignar citas a miembros del equipo según su disponibilidad y especialidades en tiempo real.
* **Bloqueos de Horario Personalizables (`TimeBlock`)**: Capacidad de restringir horas específicas del día por reuniones, mantenimiento o bloqueos recurrentes, así como días festivos anuales completos.
* **Horarios Comerciales Flexibles**: Configuración detallada de horas de apertura y cierre de la clínica, así como la definición de **franjas de almuerzo/comida bloqueadas dinámicamente** (`lunch_start` y `lunch_end`).
* **Reglas de Margen de Reserva**: Evita reservas imprevistas de última hora configurando un margen mínimo obligatorio en horas (`booking_margin_hours`) antes de que el cliente final pueda reservar en la web.
* **Días Laborables Semanales Dinámicos**: Control mediante array binario serializado para establecer qué días de la semana opera activamente la clínica.

### 1.2 Motor de Reservas Web de Doble Opt-in
El portal público de reservas (`/reservar` y `/reserva`) redefine el agendamiento online mediante un flujo seguro de confirmación:
* **Proceso de Reserva en 3 Pasos**: Una interfaz limpia tipo "SaaS-Premium" que guía al paciente en la elección del tratamiento, especialista y fecha disponible.
* **Flujo de Confirmación Segura (Doble Opt-in)**: Al reservar online, la cita se registra inicialmente en estado temporal `pending_verification` para proteger el calendario de ataques de bots o reservas abandonadas.
* **Purga Automática de Citas Huérfanas**: Un script programado (`cleanup-unverified`) elimina automáticamente las citas pendientes de verificación que superen los 30 minutos de antigüedad, liberando el slot de forma automática.
* **Verificación y Activación por Enlace Único**: El paciente recibe un correo con un enlace criptográfico único. Al hacer clic, el sistema invoca al endpoint `/verify/{id}`, cambia el estado a `confirmed`, genera notificaciones al panel de administración y dispara correos de bienvenida en segundo plano.
* **Cancelación Rápida Segura por el Cliente**: A través de su correo de confirmación, el paciente puede cancelar su cita haciendo clic en un enlace seguro, el cual valida las políticas de cancelación horarias (`cancellation_margin_hours`) antes de confirmar la baja del servicio.

### 1.3 Ficha de Clientes Premium e Historial Clínico
Una base de datos de pacientes sumamente detallada que cumple con los estándares RBAC para proteger datos sensibles:
* **Ficha de Identidad Unificada**: Registro estructurado de datos personales (Nombre, Apellidos, DNI, Correo, Teléfono, Dirección) y control del idioma preferido del paciente (`preferred_language`) para las comunicaciones automatizadas.
* **Módulo de Alertas Médicas y Alergias**: Visualización prioritaria de condiciones de salud y alergias críticas en la ficha del paciente para evitar contraindicaciones durante los tratamientos.
* **Historial Médico y Observaciones Libres**: Sección interactiva de notas donde los especialistas registran la evolución clínica de cada tratamiento.
* **Consentimientos Informados Digitales con Firma Manuscrita**: Módulo avanzado (`consents`) que permite generar plantillas de consentimiento informador por tratamiento, recopilar la **firma digitalizada manuscrita del paciente (capturada en Base64)** desde una tablet o smartphone, y almacenarla de forma segura asociada a la ficha del cliente con sello de tiempo UTC para validez legal absoluta.

### 1.4 Catálogo de Tratamientos y Categorías i18n
* **Organización Jerárquica del Catálogo**: Gestión estructurada de tratamientos agrupados en categorías visuales con orden de visualización personalizable (`order_index`).
* **Direcciones Amigables Aisladas (Slugs)**: Slugs SEO automáticos generados por base de datos, con restricciones de unicidad compuestas por Tenant `(tenant_id, slug)`, permitiendo que cada clínica use nombres idénticos sin riesgo de colisiones globales en la plataforma.
* **Soporte Multi-idioma Nativo (i18n)**: Almacenamiento dinámico de nombres y descripciones en formato `JSONB` de PostgreSQL, facilitando la internacionalización en tiempo real de la clínica.

### 1.5 Control y Gestión de Bonos de Sesiones (Vouchers)
* **Plantillas de Bonos (`voucher_templates`)**: Creación de bonos de tratamientos paquetizados (ej. "Bono de 5 Sesiones de Láser de Diodo") indicando precio y sesiones incluidas.
* **Bonos Nominativos Activos (`vouchers`)**: Emisión de bonos a clientes específicos con seguimiento dinámico del consumo de sesiones (`used_sessions` vs `total_sessions`), fecha de adquisición, fecha de caducidad automática y control del estado del cobro (pendiente, parcial o totalmente cobrado).

---

## 2. Gestión de SaaS y Multi-tenant (Aislamiento y Marca Blanca)

La arquitectura de ProBookia destaca por su robusta concepción multi-tenant, permitiendo que miles de clínicas coexistan de forma aislada, personalizada y segura sobre la misma infraestructura tecnológica.

### 2.1 Aislamiento de Datos Hermético mediante RLS (Row-Level Security)
El aislamiento de información es absoluto y está implementado a nivel de base de datos relacional de PostgreSQL, eliminando cualquier posibilidad de fugas de datos involuntarias:
* **Activación Obligatoria de RLS**: Row-Level Security habilitado en todas las tablas transaccionales del sistema.
* **Inyección Transaccional por Transacción**: Durante cada petición REST, el middleware de FastAPI inicializa la variable local del contexto de la base de datos mediante:
  `SET LOCAL app.current_tenant_id = :tenant_id`
* **Políticas de Seguridad Blindadas**: Todas las consultas `SELECT`, `INSERT`, `UPDATE` y `DELETE` filtran de forma implícita e inviolable a través de la política:
  `USING (tenant_id = current_setting('app.current_tenant_id', true))`
  Esto garantiza que el personal de una clínica solo pueda interactuar con registros que correspondan a su propio identificador único, incluso si ocurren errores a nivel de aplicación.

### 2.2 Aprovisionamiento Automatizado en 5 Pasos (Stripe Webhook)
Cuando un nuevo cliente (clínica) se suscribe en la landing comercial de ProBookia.com a través de Stripe Checkout, el webhook de Stripe (`/stripe/webhook`) procesa el evento `checkout.session.completed` e inicia un aprovisionamiento dinámico impecable sin intervención humana:
1. **Creación del Tenant Relacional**: Genera un identificador único global (UUID) y un slug para su subdominio exclusivo (ej. `merce.probookia.com`).
2. **Inicialización de Ajustes Corporativos**: Inserta los registros por defecto en la tabla `ClinicSettings` y en el gestor de contenidos `SiteContent` bajo la protección de RLS.
3. **Registro Blindado en Supabase Auth**: Emplea el SDK de Supabase con permisos de administrador para dar de alta al usuario administrador principal. Inyecta de forma segura en `app_metadata` el identificador de su tenant y rol:
   ```json
   {
     "tenant_id": "UUID_DEL_TENANT",
     "role": "admin"
   }
   ```
   Esto asegura que todas las peticiones directas de frontend a Supabase lleven incorporado el token JWT con los claims correctos para RLS.
4. **Persistencia Relacional del Administrador**: Registra la credencial encriptada en la tabla `users` local para validación cruzada.
5. **Generación del Perfil de Personal**: Inserta el perfil del administrador en la tabla `profiles` con estado activo, dejándolo listo para iniciar operaciones de forma inmediata.

### 2.3 Personalización Avanzada de Marca ("Quiet Luxury")
Cada clínica suscrita a ProBookia puede adecuar la plataforma para que parezca una solución propia:
* **Logotipos Digitalizados en Base64**: Carga de imágenes corporativas para la interfaz web (`logo_app_b64`) y otra optimizada en alta definición para la generación de PDFs imprimibles y facturas (`logo_pdf_b64`).
* **Servidor SMTP Propio**: Posibilidad de configurar sus credenciales SMTP corporativas (host, puerto, usuario, contraseña) para que todos los recordatorios e emails de confirmación se envíen desde el dominio propio del centro de estética en lugar del genérico de ProBookia.
* **Integración del Dominio y Subdominios**: Enrutamiento dinámico basado en subdominios de red. El middleware de Next.js detecta el subdominio desde las cabeceras HTTP de origen y lo inyecta como `x-tenant-id` para cargar al vuelo la base de datos de marca del cliente específico.

### 2.4 CMS Dinámico Integrado
El panel de edición web (`/cms`) faculta a las clínicas a diseñar su landing page pública sin saber programar:
* **Edición del Hero de Lujo**: Personalización del título principal, subtítulo, llamada a la acción y carga de imágenes o videos conceptuales.
* **Bloque de Historia / Quiénes Somos**: Sección con alineación y distribución asimétrica del contenido de texto e imágenes.
* **Orden de Secciones Dinámico**: Control del orden en el que se renderizan los bloques en la Home pública mediante un array serializado.
* **Ajustes SEO Dinámicos**: Edición directa de Meta Titles, Meta Descriptions y Keywords para optimizar el posicionamiento orgánico en Google de forma independiente por cada clínica.

---

## 3. Facturación, TPV y Límites de Suscripción

ProBookia incorpora herramientas comerciales completas para monetizar el software y permitir a las clínicas gestionar su facturación local diaria y sus cobros online.

### 3.1 Motor de Facturación Flexible de la Clínica
* **Numeración y Series de Facturas Dinámicas**: Estructuración del formato y prefijo de facturación de forma inteligente usando tags dinámicos como `FA-{YY}-` (que inyectan el año en curso) y control del número consecutivo inicial (`invoice_next_number`).
* **Facturas Simplificadas y Completas**: Capacidad de emitir facturas en formato simplificado (TPV) o completas asociadas a la ficha con NIF y dirección fiscal del paciente.
* **IVA Configurable por Defecto**: Tipo impositivo de IVA modificable a nivel de negocio (`default_tax_rate`) para el cálculo automatizado de bases imponibles e impuestos en servicios y bonos vendidos.
* **Listado de Facturas**: Registro histórico y consulta de facturas indicando emisor, cliente, importe, fecha, concepto y estado del pago (pendiente o pagado).

### 3.2 Terminal Punto de Venta (TPV / Quick POS)
Una interfaz de venta rápida (`/pos`) diseñada para agilizar los cobros físicos en el mostrador:
* **Venta Express de Tratamientos y Bonos**: Selección rápida de tratamientos o bonos del catálogo, asociación a un cliente y cobro en un solo clic.
* **Generación Automática de Facturas**: Al completar un cobro en el POS, el sistema genera la factura correspondiente y actualiza de inmediato el saldo de las sesiones del cliente si adquirió un bono.

### 3.3 Control de Límites en Tiempo Real (`limits.py`)
El backend restringe el uso de recursos críticos según el plan contratado por la clínica, protegiendo las métricas comerciales del SaaS:
* **Control Activo en Transacción**: Cada vez que se intenta crear un nuevo servicio o registrar un especialista en el equipo, el sistema consulta en tiempo real los límites definidos en `limits.py` y, en caso de superarlos, detiene la operación lanzando una excepción `FastAPI HTTP 403 (Forbidden)` con mensaje de recomendación de upgrade.
* **Estructura de Límites por Nivel de Plan**:
  * **Plan Free** (De prueba): Límite estricto de **1 Especialista** y **3 Servicios**.
  * **Plan Básico** (Para autónomos): Límite de **2 Especialistas** y **10 Servicios**.
  * **Plan Pro** (Para clínicas en crecimiento): Límite de **10 Especialistas** y **Servicios Ilimitados**.
  * **Plan Gold/Elite** (Para corporaciones): **Especialistas Ilimitados** y **Servicios Ilimitados**.

### 3.4 Pasarela de Reservas con Cobros en Stripe Connect Standard
ProBookia integra **Stripe Connect** de marca blanca para que las clínicas cobren directamente a sus pacientes:
* **Onboarding Express de Stripe Connect**: A través de `/settings`, los propietarios pueden crear o enlazar su cuenta estándar de Stripe en un flujo guiado. Al completarse, la clínica queda habilitada para recibir pagos directamente en su pasarela bancaria.
* **Políticas de Reserva Flexibles**:
  * **Reserva Tradicional**: Sin cobro anticipado.
  * **Fianza por Tratamiento**: El administrador puede exigir un depósito monetario obligatorio (`deposit_amount`) para un servicio de alto valor específico.
  * **Fianza Global Obligatoria**: Configuración general que obliga a realizar un cobro parcial (ej. 20€) en todas las reservas online realizadas en la web pública.
* **Protección contra Incomparecencias (*No-Shows*)**: La combinación de fianzas online y Stripe Connect reduce las ausencias sin avisar a cero, garantizando que el tiempo del especialista esté protegido financieramente.

---

## 4. Herramientas de Super Admin (El Panel Maestro)

El panel para los administradores y fundadores de ProBookia (`/super-admin`) permite controlar la plataforma en su totalidad y garantizar un soporte excepcional a los clientes.

### 4.1 Consola Maestra de Gestión de Clientes B2B
* **Panel de Control Centralizado (SaaS Backoffice)**: Listado dinámico de todos los inquilinos (Tenants) activos en la plataforma mostrando su nombre, subdominio/slug, ID de suscripción de Stripe y plan contratado.
* **Controladores Financieros e Indicadores de Uso**: Métricas consolidadas sobre el número de clínicas activas, ingresos mensuales estimados por Stripe y distribución de planes contratados.
* **Suspensión Manual Inmediata**: Los superadministradores pueden activar, suspender o cancelar la cuenta de un inquilino de manera instantánea mediante el endpoint `/super-admin/tenants/{id}/status`.
* **Invalidador de Caché de Inquilinos**: Al cambiar el estado de suscripción de un inquilino, el sistema invalida su entrada en la caché global del middleware en memoria (`TENANT_STATUS_CACHE`), forzando a que la base de datos se sincronice de forma inmediata y evitando que clínicas con cuotas impagadas continúen operando.

### 4.2 Pantalla de Suspensión Premium de Marca Blanca
Un software premium requiere un tratamiento elegante de los impagos:
* **Interrupción de Servicio Elegantemente Diseñada**: Si una clínica es suspendida o su pago mensual de Stripe es rechazado (retornando un código HTTP `402`), el layout global de Next.js intercepta todas las peticiones internas del backend.
* **Acceso Restringido pero Operativo**: En lugar de mostrar un error 404 o una pantalla en blanco genérica, se renderiza una preciosa interfaz de marca corporativa informando de la suspensión del servicio, permitiendo únicamente al propietario acceder al portal de `/login` para actualizar sus datos de facturación de Stripe o contactar con el soporteVIP.

### 4.3 Modo Soporte VIP (Impersonación Segura)
Una herramienta indispensable para que el equipo de soporte técnico diagnostique problemas sin comprometer la seguridad de las clínicas:
* **Generación de Token por Firma Criptográfica**: El endpoint `/super-admin/impersonate/{tenant_id}` permite al Super Admin generar un token firmado digitalmente con **HMAC SHA-256** utilizando la clave maestra del servidor.
* **Acceso de Soporte de 2 Horas**: El token generado contiene un payload limitado en el tiempo (vencimiento exacto de 120 minutos) con los claims de impersonación autorizados:
  ```json
  {
    "impersonate": "true",
    "tenant_id": "UUID_DEL_TENANT",
    "slug": "slug-de-la-clinica",
    "exp": "TIMESTAMP_FUTURO_2_HORAS"
  }
  ```
* **Acceso Transparente y Seguro**: Al inyectar este token en las cabeceras HTTP, el personal de soporte VIP de ProBookia puede ver la agenda, perfiles y configuraciones de la clínica de forma idéntica a como lo ve el cliente, resolviendo problemas de configuración en tiempo récord sin necesidad de conocer la contraseña del administrador.

---

## 5. Inteligencia Artificial: Asistentes Premium para el Plan Gold

ProBookia ofrece a sus clientes del plan **Gold** un valor añadido excepcional mediante integraciones avanzadas con los motores de Inteligencia Artificial más avanzados del mercado (**Google Gemini 2.5 Flash** y **OpenAI GPT-4o-Mini**), permitiéndoles diseñar contenido de alta gama de forma autónoma.

### 5.1 Redactor SEO y Generador de Copywriting Clínico
Una herramienta integrada en la gestión de servicios que permite autogenerar la identidad escrita de cada tratamiento en tres tonos preestablecidos:
1. **Premium (Quiet Luxury)**: Elegante, sutil y evocador.
2. **Cercano**: Empático, claro y amigable.
3. **Clínico**: Científico, preciso e informativo.

Soporta la generación instantánea de tres tipologías de contenido:
* **Descripciones Cortas**: Resúmenes planos y elegantes de máximo 40 palabras enfocados en los beneficios sensoriales del tratamiento.
* **Contenido Detallado Riquísimo**: Redacción estructurada en HTML semántico limpio (párrafos, listas ordenadas, negritas sutiles) lista para insertarse directamente en la web del cliente, detallando la experiencia sensorial y los aspectos técnicos del tratamiento.
* **Metadatos SEO Avanzados**: Generación en formato JSON directo de Meta Titles, Meta Descriptions y Keywords optimizados para buscadores.

### 5.2 Director de Fotografía Conceptual por IA
Una revolucionaria utilidad de generación de imágenes comerciales hiperrealistas para ilustrar tratamientos y secciones del CMS:
* **Optimizador de Prompts Técnico**: Traduce instrucciones sencillas en español (ej. "Láser en la espalda") en complejos prompts fotográficos en inglés enfocados en fotografía comercial de alta costura ("flawless skin textures, high-key lighting, luxury beauty editorial").
* **Alineación Estética Inviolable**: Las instrucciones inyectadas obligatoriamente por el sistema prohíben la generación de textos deformados, caras humanas artificiales o logotipos extraños, garantizando que el banco de imágenes de la clínica conserve una coherencia visual limpia y premium compatible con la filosofía Quiet Luxury.

---

## 6. Automatización, Monitorización y Resiliencia

### 6.1 Recordatorios y Notificaciones Diarias Automáticas
* Un cron automatizado programado para ejecutarse diariamente escanea las citas agendadas para el día de mañana que se encuentren confirmadas y dispara notificaciones por correo de marca blanca a través del SMTP privado de la clínica, marcando los registros para evitar duplicados en los envíos.

### 6.2 Copias de Seguridad Automatizadas en la Nube con Política de Retención
La seguridad de la información clínica y contable está garantizada mediante copias de seguridad de alta confiabilidad:
* **Exportación JSON Completa**: Un endpoint protegido por clave criptográfica (`/automation/backup`) genera una copia de seguridad JSON estructurada con toda la información relacional de base de datos.
* **Carga en la Nube en Supabase Storage**: Sube de forma directa y encriptada el archivo al repositorio privado de Supabase Storage.
* **Política de Retención Máxima de 7 Backups**: Para evitar el desperdicio de almacenamiento y cumplir con buenas prácticas de seguridad, el sistema audita los archivos existentes, ordenándolos por fecha de forma ascendente, y **purga de forma autónoma las copias de seguridad sobrantes**, manteniendo estrictamente las últimas 7 versiones diarias de la clínica.

---

Este catálogo demuestra que **ProBookia** no es simplemente un gestor de citas común; es una infraestructura integral multi-tenant, robustecida en su base de datos con Row-Level Security, potenciada con herramientas de Inteligencia Artificial para el mercado premium y equipada con un TPV robusto, facturación nativa y herramientas de soporte que marcan un estándar de oro tecnológico y de negocio.

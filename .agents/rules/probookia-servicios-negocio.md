# Propuesta de Valor y Servicios SaaS de ProBookia.com

Esta regla define el alcance del producto ProBookia.com y detalla la verdad comercial del catálogo de servicios que la plataforma ofrece a sus clientes (clínicas, centros de estética, spas o salones). Todo desarrollo de frontend, backend o base de datos debe alinearse con esta visión de negocio y respetarla de forma inquebrantable.

---

## 1. Módulos y Servicios Ofrecidos

### 📅 1. El Motor de Reservas Inteligente (Recepción 24/7)
* **Portal Público en 3 Pasos**: Una interfaz ultra-limpia, de estética premium y 100% optimizada para dispositivos móviles. Permite al paciente/cliente final elegir de forma intuitiva el tratamiento, su especialista de confianza y el hueco horario disponible en segundos.
* **Sistema Antifraude y Anti-Bots (Doble Opt-in)**: Flujo de pre-reserva seguro en el cual las citas quedan bloqueadas temporalmente en estado `pending_verification`. El cliente final recibe un email interactivo con un enlace único y dispone de un margen estricto de 30 minutos para confirmarlo; si no lo hace, el programador automático (`cleanup-unverified`) libera la hora inmediatamente, evitando bloqueos malintencionados en el calendario de la clínica.
* **Protección Financiera contra Incomparecencias (No-Shows)**: Integración para configurar fianzas o depósitos bancarios obligatorios con tarjeta (procesados de forma transparente mediante Stripe Connect) antes de poder agendar y confirmar la reserva. Esto protege el tiempo y los ingresos de los profesionales del centro frente a ausencias injustificadas.
* **Cancelaciones Autónomas con Filtros de Seguridad**: Permite a los pacientes cancelar sus citas directamente desde su correo electrónico de confirmación, siempre y cuando cumplan con el margen de antelación mínimo en horas establecido por las políticas de cancelación de la clínica (`cancellation_margin_hours`).

### 💻 2. Identidad Digital de Lujo y Web Propia (CMS y SEO)
* **Página Pública Personalizada (CMS)**: Un escaparate web autogestionable de alta gama adaptado a la estética del centro. Facilita modificar el cartel principal (Hero), editar textos corporativos ("Quiénes Somos") y estructurar u ordenar las secciones de la Home de forma totalmente dinámica y visual.
* **Identidad de Marca Completa (White Label)**: Control absoluto para que cada clínica incorpore su logotipo corporativo (con versiones específicas para la aplicación web y otra optimizada en alta definición para las facturas en PDF), defina su paleta cromática de lujo, y enrute su subdominio exclusivo (ej. `tuclinica.probookia.com`).
* **Correos con Marca Propia (SMTP Privado)**: Soporte para configurar servidores de correo electrónico SMTP propios de la clínica, asegurando que todos los recordatorios, notificaciones y confirmaciones se envíen con el dominio propio del centro de estética.
* **Posicionamiento en Google Integrado (SEO Local)**: Panel de configuración sencillo para reescribir de forma independiente Meta Titles, Meta Descriptions y palabras clave de los tratamientos, facilitando que la clínica aparezca en los primeros puestos de búsqueda orgánica locales.
* **Catálogo Global Multi-idioma (i18n)**: Soporte nativo para ofrecer títulos, descripciones y contenidos de tratamientos en múltiples idiomas de forma simultánea.

### 🏥 3. Gestión de Agenda Profesional e Historial Clínico
* **Calendario Interactivo a Pantalla Completa**: Consola interactiva en pantalla completa para la operativa diaria. Ofrece una vista clara y dinámica de la agenda del equipo, con control de estados de citas (Pendiente, En Tratamiento, Finalizada) y reordenación ágil.
* **Gestión Horaria y Laboral de Especialistas**: Configuración individualizada de las jornadas laborales de cada miembro del personal, definiendo qué servicios específicos están capacitados para ofrecer y bloqueando de forma automática sus descansos y horas de almuerzo (`lunch_start` y `lunch_end`).
* **Margen de Seguridad contra Imprevistos**: Ajuste inteligente para obligar a que las reservas online se realicen con un margen de anticipación mínimo en horas (`booking_margin_hours`), evitando la entrada sorpresa de clientes sin aviso previo.
* **Fichas de Clientes con Alertas Médicas**: Expedientes clínicos unificados donde el personal puede visualizar de forma prioritaria contraindicaciones críticas, alergias o patologías previas del paciente antes de realizar cualquier intervención.
* **Consentimientos Informados con Firma Digital**: Editor y visor de consentimientos legales vinculados al tratamiento que el paciente puede leer y firmar de forma manuscrita directamente en el centro desde una tablet o smartphone, almacenando la firma manuscrita digitalizada en Base64 con sellado de tiempo de seguridad.
* **Gestión Inteligente de Bonos (Vouchers)**: Creación de paquetes de tratamientos con control automático del saldo de sesiones consumidas y pendientes por cada cliente.

### 💳 4. Terminal de Venta en Mostrador (TPV/POS) y Facturación
* **Venta Express en Mostrador (Quick POS)**: Una pantalla de venta rápida, ágil y optimizada para recepción, facilitando el cobro en mostrador de tratamientos sueltos o la emisión instantánea de bonos de sesiones.
* **Automatización de Facturas Simplificadas y Completas**: Generación automática de series contables correlativas y personalizadas (ej. `FA-{YY}-`), IVA configurable por tratamiento e historial contable descargable.
* **Cobros Directos sin Intermediarios (Stripe Connect Standard)**: Conexión bancaria nativa donde los ingresos de las fianzas y cobros online viajan directamente del cliente final a la cuenta bancaria de la clínica sin intermediarios de retención de ProBookia.

### 🤖 5. Copilotos de Inteligencia Artificial (Exclusivo Plan Gold)
* **Redactor de Contenido Clínico Inteligente**: Integración con modelos de IA (Gemini/OpenAI) para generar descripciones comerciales premium, completas y enriquecidas con HTML semántico para el catálogo en tres tonos elegibles (Elegante y Premium, Cercano, Clínico).
* **Director de Fotografía de Lujo**: Asistente de IA para optimizar prompts en inglés y generar imágenes fotorrealistas ultra-profesionales para tratamientos, programado para omitir caras distorsionadas o textos defectuosos, respetando siempre el estándar visual de lujo "Quiet Luxury".

---

## 2. Directrices de Desarrollo
1. **Consistencia de Negocio**: Cualquier componente o flujo que se cree debe integrarse armónicamente con uno de estos 5 pilares de servicios de ProBookia.
2. **Cumplimiento Técnico**: Mantener siempre la seguridad del aislamiento de datos (RLS) y la separación multi-tenant al desarrollar nuevas integraciones o módulos.
3. **Estética de Lujo**: La presentación visual de cualquier módulo debe seguir el "Quiet Luxury" establecido (borderless, espaciado generoso, colores sobrios crema/oro/antracita y tipografías Inter/Playfair Display).

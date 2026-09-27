---
description: Hoja de ruta estratégica para precios, capacidades, empaquetado y modelo comercial de ProBookia SaaS.
---

# 🗺️ Hoja de Ruta: Estrategia de Suscripciones, Precios y Capacidades ProBookia

> **Estado del Documento**: 🟡 *Documento Vivo en Debate y Co-diseño (Sin cambios de código aún)*  
> **Propósito**: Servir como fuente de verdad y guía de negocio para definir qué ofrecemos exactamente, cuánto cobramos, cómo protegemos los márgenes y cómo comunicamos el valor real al cliente que no nos conoce.

---

## 1. El Diagnóstico: ¿Qué es ProBookia Realmente?

Hasta ahora, la plataforma se presentaba como una *"agenda interactiva con TPV"*. Sin embargo, a nivel de producto real, **ProBookia es una Suite "Todo-en-Uno" (All-in-One)** diseñada para clínicas de estética, medicina estética, fisioterapia y centros wellness.

### El Dolor del Mercado: La Fragmentación Actual
Hoy en día, una clínica media contrata y paga por separado:

| Herramienta que contrata por separado | Coste medio mensual | Problema / Fricción |
| :--- | :---: | :--- |
| **Web + Hosting + Diseñador** (WordPress, Webflow) | 30€ - 50€/mes | 1.500€ de coste inicial. Desconectada de la agenda. |
| **Motor de Reservas Online** (Fresha, Treatwell, Calendly) | 39€ - 60€/mes | Comisiones abusivas por cliente nuevo o sin pasarela propia. |
| **Software Médico / LOPD** (Consentimientos en papel) | 50€ - 90€/mes | Carpetas físicas, riesgo legal, firmas no digitalizadas. |
| **Facturación y TPV de Mostrador** | 20€ - 40€/mes | Datos duplicados entre la caja y las citas. |
| **Copiloto / Asistente IA** | 30€/mes | No existe integrado con la base de datos de la clínica. |
| **TOTAL GASTADO POR LA CLÍNICA AL MES:** | **169€ - 270€/mes** | **Caos de contraseñas, datos dispersos y pérdida de tiempo.** |

> 💡 **La Gran Propuesta de Valor**:  
> ProBookia unifica estos 5 sistemas en **una sola suscripción mensual**, eliminando herramientas intermedias y ahorrando cientos de euros al mes.

---

## 2. Los 4 Pilares Fundamentales del Ecosistema

Todo lo que el cliente obtiene se clasifica en 4 pilares tangibles:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        SUITE TODO-EN-UNO PROBOOKIA                     │
├──────────────────┬──────────────────┬──────────────────┬───────────────┤
│    PILAR 1       │    PILAR 2       │    PILAR 3       │    PILAR 4    │
│  WEB DE LUJO     │ MOTOR DE RESERVA │ ERP & LEGALIDAD  │ AI WEBMASTER  │
│  (CMS + Builder) │ (Equipo + Sedes) │ (Caja + Firmas)  │ (Voz y Texto) │
└──────────────────┴──────────────────┴──────────────────┴───────────────┘
```

### 🌐 Pilar 1: Presencia Web de Lujo (CMS Modular)
* **Home Builder y Editor Visual**: Creación de páginas personalizadas sin programar.
* **Navegación Avanzada**: Configuración de menú principal, MegaMenú desplegable y enlaces directos.
* **Catálogo de Servicios y Categorías**: Con fotos, tiempos de cabina, precios y descripciones ricas.
* **Galería Multimedia Accesible**: Banco de fotos y vídeos propio, reutilizable en toda la web.
* **Posicionamiento SEO**: Metatags, descripciones y slugs únicos por clínica (`tu-centro.probookia.com`).

### 📅 Pilar 2: Motor de Reservas y Gestión Operativa
* **Reservas Online 24/7**: El paciente agenda desde su móvil a cualquier hora.
* **Cobro de Fianza Anti-Plantones (Stripe Connect)**: Depósito con tarjeta obligatorio para eliminar *no-shows*.
* **Gestión de Personal y Agendas**: Asignación dinámica de especialistas, turnos, comidas (`lunch_break`), descansos y festivos anuales.
* **Multisede**: Control de diferentes ubicaciones físicas con horarios independientes.
* **Notificaciones y Recordatorios**: Envíos por email y WhatsApp para reducir inasistencias.

### 💼 Pilar 3: ERP, Caja y Seguridad Jurídica (Cero Papeles)
* **Consentimientos Informados con Firma en Tablet**: El paciente firma con el dedo/stylus en pantalla (almacenado con timestamp UTC y validez legal absoluta).
* **Gestión y Control de Bonos (Vouchers)**: Seguimiento automático de sesiones consumidas y pendientes (ej. Bono 5 sesiones láser).
* **TPV de Mostrador (Quick POS)**: Cobros rápidos en cabina (efectivo, tarjeta o mixto).
* **Facturación Oficial**: Numeración correlativa (`FA-2026-001`), desglose de IVA y datos fiscales con NIF.

### 🧠 Pilar 4: AI Webmaster (Asistente de Negocio 24/7)
* **Control Conversacional por Chat y Voz**: Pide a la IA *"cambia el precio del masaje a 50€"* o *"¿cuántas citas tenemos mañana?"* y lo ejecuta.
* **Redactor Clínico y SEO**: Genera textos comerciales de tratamientos en 3 tonos (Lujo, Cercano, Clínico).
* **Director Fotográfico IA**: Generación de imágenes publicitarias hiperrealistas de tratamientos.
* **Filosofía BYOK (*Bring Your Own Key*)**: Conexión de API Key propia para consumo ilimitado sin coste de infraestructura para ProBookia.

---

## 3. Decisiones Estratégicas de Negocio

### Decisión A: Adiós al Plan 0€ Permanente ➔ Entrada por "Reverse Trial (14 Días)"
* **Por qué NO al 0€**: El cliente que busca gratis no valora la herramienta, consume soporte y base de datos, y rara vez convierte a pago.
* **La Solución**: **14 días de prueba completa (Plan Pro)** sin tarjeta obligatoria.
  * Si al día 14 no suscribe, su cuenta pasa a modo "Solo lectura" (sus datos están a salvo, pero no puede agendar ni cobrar hasta activar un plan).

### Decisión B: Protección de Márgenes en Inteligencia Artificial y Voz
* **El Peligro**: Ofrecer "Voz IA Ilimitada" por una cuota fija de 99€ genera pérdidas si una clínica recibe 1.000 llamadas al mes (coste de API: ~150€-200€).
* **El Modelo Seguro**:
  * Cada plan incluye una **bolsa mensual de cortesía** (ej. 30 o 60 minutos de voz / X acciones de IA).
  * Si la clínica necesita más, puede **comprar bonos de recarga** o **conectar su propia API Key (BYOK)**.

### Decisión C: Métrica de Valor Principal (Value Metric)
* Lo que delimita los planes es el **número de Especialistas / Sillones** y **Sedes**.
* Los **Servicios son ilimitados** desde el plan básico (limitar a 10 servicios frustra al cliente en su primer día).

---

## 4. Estructura de Planes Propuesta (Para Debate)

```
        ┌────────────────────────────────────────────────────────┐
        │        PRUEBA GRATUITA DE 14 DÍAS (Sin tarjeta)        │
        │               Acceso completo al Plan Pro              │
        └────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────┐  ┌─────────────────────────┐  ┌─────────────────────────┐
│     PLAN INDIVIDUAL     │  │        PLAN PRO         │  │       PLAN ELITE        │
│    (Autónomo / Solo)    │  │  (Clínica con Equipo)   │  │ (Policlínica & AI Power)│
│                         │  │      ⭐ RECOMENDADO      │  │                         │
│       39€ / mes         │  │        69€ / mes        │  │       129€ / mes        │
│   (32€/mes pago anual)  │  │   (58€/mes pago anual)  │  │  (109€/mes pago anual)  │
├─────────────────────────┤  ├─────────────────────────┤  ├─────────────────────────┤
│ • 1 Especialista / Sede │  │ • Hasta 4 Especialistas │  │ • Hasta 10 Especialistas│
│ • Web Builder Completo  │  │ • Todo lo del Plan Solo │  │ • Todo lo del Plan Pro  │
│ • Reservas 24/7 con TPV │  │ • Firmas en Tablet LOPD │  │ • AI Webmaster (Voz/Chat│
│ • Fianza con Tarjeta    │  │ • Control de Bonos      │  │ • Multisede (hasta 5)   │
│ • Recordatorios básicos │  │ • Facturación con IVA   │  │ • Informes Financieros  │
│ • Servicios Ilimitados  │  │ • Hasta 2 Sedes         │  │ • Soporte VIP 24h       │
└─────────────────────────┘  └─────────────────────────┘  └─────────────────────────┘
                                                                       │
                                           ¿Más de 10 especialistas? ──┴─► +15€/mes por especialista extra
```

---

## 5. El Desglose Comercial de las Tarjetas (Lo que lee el cliente que no nos conoce)

### 🟢 Tarjeta 1: Plan Individual (39€/mes)
* ✔️ **1 Especialista / Agenda exclusiva** (Servicios ilimitados)
* ✔️ **Tu Sitio Web de Lujo 24/7** con constructor visual y subdominio propio
* ✔️ **Cobro de Fianza con Tarjeta**: Exige depósitos online y elimina los plantones
* ✔️ **Recordatorios Automáticos por Email**: Tus pacientes nunca olvidan su cita
* ✔️ **TPV de Mostrador**: Cobro rápido en cabina (efectivo o tarjeta)
* ✔️ **Ficha de Pacientes y Alertas**: Historial médico básico y alergias

### 🟡 Tarjeta 2: Plan Pro (69€/mes) — *Recomendado*
* ✔️ **Todo lo del Plan Individual, y además:**
* ✔️ **Hasta 4 Especialistas**: Agendas y calendarios independientes para tu equipo
* ✔️ **Consentimientos con Firma Digital en Tablet**: Cero papeles, 100% legal
* ✔️ **Gestión y Control de Bonos**: Control de sesiones gastadas y restantes
* ✔️ **Facturación Oficial**: Series correlativas con NIF y desglose de IVA para gestoría
* ✔️ **Marca Blanca en Correos**: Los emails salen con tu propio remitente y logo
* ✔️ **Multisede básica**: Hasta 2 centros o ubicaciones

### 🟣 Tarjeta 3: Plan Elite / Gold (129€/mes)
* ✔️ **Todo lo del Plan Pro, y además:**
* ✔️ **Hasta 10 Especialistas** *(escalable a +15€/mes por especialista adicional)*
* ✔️ **AI Webmaster Completo**: Gestiona tu web, citas y servicios por voz o chat
* ✔️ **Director Creativo IA**: Generador de textos SEO y fotos publicitarias
* ✔️ **Multisede Total**: Hasta 5 clínicas gestionadas en el mismo panel
* ✔️ **Informes Avanzados**: Facturación por especialista y ocupación de cabinas
* ✔️ **Soporte Prioritario VIP y Puesta en Marcha**: Configuración guiada en 24h

---

## 6. Próximos Pasos para la Conversación

1. **Revisar y afinar este documento**: Modificar precios, nombres o asignación de funcionalidades según tu visión.
2. **Validar la frontera entre planes**: Confirmar si el *Web Builder* va en todos los planes y si las *Firmas en Tablet* se quedan como el gancho principal de Plan Pro.
3. **Paso a la acción técnica**: Solo cuando el modelo esté 100% aprobado por ti, procederemos a actualizar la landing, el backend de límites y la pasarela de Stripe.

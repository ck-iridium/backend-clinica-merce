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

## 4. Matriz Real de Módulos por Plan (Pantallas Reales del Sistema)

Sin florituras teóricas: basándonos en las pantallas y botones reales de tu aplicación:

| Pantalla real en tu menú | 🟢 Plan Individual (39€/mes)<br>*Autónomo / Solo* | 🟡 Plan Pro (69€/mes)<br>*Clínica con Equipo (Recomendado)* | 🟣 Plan Elite (129€/mes)<br>*Grandes clínicas / Multisede* |
| :--- | :---: | :---: | :---: |
| **Agenda (`/calendar`)** | ✅ Total (Cuadrícula, citas, estados) | ✅ Total | ✅ Total |
| **Caja / TPV (`/pos`)** | ✅ Total (Cobro rápido, precio libre, ticket) | ✅ Total | ✅ Total |
| **Servicios (`/services`)** | ✅ **Ilimitados** (Sin frustrar al cliente) | ✅ **Ilimitados** | ✅ **Ilimitados** |
| **Fianzas Stripe (`/settings`)** | ✅ Sí (Cobro de señal anti-plantones) | ✅ Sí | ✅ Sí |
| **Clientes (`/clients`)** | ✅ Ficha, teléfono, historial | ✅ Ficha, teléfono, historial | ✅ Ficha, teléfono, historial |
| **Equipo (`/team`)** | ⚠️ **1 solo usuario** (la dueña/autónomo) | 👥 **Hasta 4 miembros** | 👥 **Hasta 10 miembros** *(+15€/mes extra)* |
| **Sedes (`/locations`)** | ⚠️ **1 sola ubicación** | 🏢 **Hasta 2 sedes** | 🏢 **Hasta 5 sedes** *(+20€/mes extra)* |
| **Consentimientos / Tablet** | 🚫 Bloqueado | ✍️ **Incluido (Firma digital en pantalla)** | ✍️ **Incluido (Firma digital en pantalla)** |
| **Bonos de Sesiones (`/vouchers`)** | 🚫 Bloqueado | 🎟️ **Incluido (Crear y vender bonos)** | 🎟️ **Incluido (Crear y vender bonos)** |
| **Facturas PDF con NIF (`/invoices`)**| 🚫 Solo ticket de caja | 📄 **Facturación oficial con IVA** | 📄 **Facturación oficial con IVA** |
| **AI Webmaster (`/ai-webmaster`)** | 🚫 Desactivado | 🚫 Desactivado | 🧠 **Incluido (Asistente IA, voz y fotos)** |

---

## 5. El Modelo de Cobro Real: Bizum & Transferencia (Vía Super Admin)

### ¿Por qué NO dependemos de Stripe Billing automático desde el día 1?
1. **Situación Legal / Fiscal**: Permite empezar a operar, captar clientes y validar el negocio **sin necesidad de estar dado de alta como autónomo** de inmediato.
2. **Confianza del Cliente B2B**: En el sector de estética, barberías y clínicas en España, pagar 39€ o 69€ por Bizum a un teléfono o cuenta conocida genera **cero fricción**.

### Flujo Operativo de Pago:
1. **Prueba Inicial de 14 Días**: La clínica se registra y disfruta de 14 días completos (Plan Pro).
2. **Solicitud de Renovación**: Al vencer (o en Ajustes > Suscripción), la clínica selecciona su plan (Individual 39€, Pro 69€ o Elite 129€).
3. **Código de Referencia Automático**: El sistema genera un código único (ej. `PB-84A2X`) con el importe exacto y tu teléfono de Bizum.
4. **Activación y Control en Backoffice (`/super-admin`)**:
   - Cuando el cliente avisa de que ha pagado (o pulsa "Ya he enviado el Bizum"), tú recibes el aviso.
   - En tu **Backoffice Master**, localizas la clínica y con el botón **"Reactivar Acceso" / "Aprobar"** extiendes su suscripción por 30 días (`active`).

---

## 6. Diagnóstico del Bug: Periodo de Gracia y Expiración

### ¿Por qué `barbero4` seguía activo habiendo vencido el 30 de junio de 2026?
En el middleware del backend ([backend/app/main.py](file:///c:/Users/Juan/MERCE/CLINICA%20MERCE/backend/app/main.py#L261)), la comprobación de expiración estaba programada con:
```python
if tenant.subscription_status == "trial" and tenant.subscription_expires_at:
    if tenant.subscription_expires_at < datetime.utcnow():
        tenant.subscription_status = "suspended"
```
**El fallo**: Solo evaluaba si el estado era `"trial"`. Si la clínica estaba en `"grace"` (periodo de gracia) o `"active"` (mensualidad vencida), el middleware **nunca la suspendía**.
**La solución**: Ampliar la comprobación para que cualquier estado (`trial`, `grace`, `active`) con `subscription_expires_at < datetime.utcnow()` pase automáticamente a `suspended` (402 Payment Required).

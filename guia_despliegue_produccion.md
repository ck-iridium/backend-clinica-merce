# GUÍA DE DESPLIEGUE EN PRODUCCIÓN (2026)
## Clínica Mercè Multi-Entity SaaS B2B Ecosistema

Este documento sirve como la lista de comprobación (**Checklist**) master y guía técnica de arquitectura para preparar el despliegue del ecosistema SaaS Multi-Tenant en producción utilizando **Vercel (Frontend)**, **Render (Backend)**, **Supabase Pro (Database & Auth)** y **Stripe (Monetización & Onboarding)**.

---

## 1. STRIPE: CONFIGURACIÓN EN EL PANEL DE CONTROL (PRODUCTION MODE)

Para que el flujo de registro, cobro recurrente y aprovisionamiento automático funcione sin fisuras, debes configurar tu panel de Stripe de la siguiente manera:

### A. Crear el Producto y Precio Recurrente (Plan Platinum)
1. Inicia sesión en tu [Stripe Dashboard](https://dashboard.stripe.com/).
2. Ve a la sección **Catálogo de productos** (Product Catalog) y haz clic en **Añadir producto** (Add Product).
3. Configura los datos del producto:
   * **Nombre del producto**: `Plan Platinum - Clínica Mercè SaaS`
   * **Descripción**: `Suscripción mensual para gestión clínica premium de estética.`
4. Configura el **Modelo de precios**:
   * **Precio**: `99.00 EUR`
   * **Frecuencia**: **Facturación periódica** (Recurring) -> **Mensual** (Monthly).
5. Guarda el producto. Al hacerlo, Stripe generará un identificador de precio (ej. `price_1Nxxxxxxxxxxxxxxxxx`). *Guarda este identificador, ya que lo necesitarás para las variables de entorno.*

### B. Obtener las API Keys de Stripe
En el apartado **Desarrolladores** (Developers) -> **Claves de API** (API Keys):
1. **Clave pública** (Publishable Key): Cópiala como `STRIPE_PUBLISHABLE_KEY`.
2. **Clave secreta** (Secret Key): Crea una clave secreta restringida o estándar y cópiala como `STRIPE_SECRET_KEY` (mantenla totalmente en privado).

### C. Configurar el Webhook de Aprovisionamiento
El backend de FastAPI procesa la creación de bases de datos de inquilinos y perfiles al confirmarse los pagos de Stripe.
1. En el panel de Stripe, ve a **Desarrolladores** -> **Webhooks**.
2. Haz clic en **Añadir un punto de conexión** (Add Endpoint).
3. Configura los siguientes campos:
   * **URL del punto de conexión**: `https://tu-backend-fastapi.onrender.com/stripe/webhook`
   * **Versión de la API**: Selecciona la más reciente (`2025-xx-xx` o superior).
   * **Eventos a escuchar**: Selecciona estrictamente el evento `checkout.session.completed` (es el que dispara nuestro aprovisionamiento local).
4. Guarda el endpoint.
5. Haz clic en **Revelar clave secreta** en el Webhook creado. Cópiala como `STRIPE_WEBHOOK_SECRET`.

---

## 2. LISTA MAESTRA DE VARIABLES DE ENTORNO (.ENV)

Debes registrar estas variables en los respectivos paneles de tus proveedores de Cloud Hosting:

### A. RENDER (Backend - FastAPI)
Configura estas variables en tu servicio web de FastAPI en Render en el apartado **Environment**:

| Variable | Descripción | Valor de Ejemplo |
| :--- | :--- | :--- |
| `DATABASE_URL` | URI de conexión a Supabase Postgres (Direct connection) | `postgresql://postgres.xxxx:password@aws-0-eu-central-1.pooler.supabase.com:5432/postgres` |
| `SUPABASE_URL` | URL de tu proyecto de Supabase Pro | `https://xxxx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave Service Role (Bypass RLS para aprovisionar usuarios) | `eyJhbGciOi...` *(Copia de tu panel de Supabase)* |
| `STRIPE_SECRET_KEY` | Clave Secreta de Stripe de Producción | `sk_live_tu_clave_secreta_aqui` |
| `STRIPE_WEBHOOK_SECRET` | Clave secreta del Webhook configurado en Stripe | `whsec_tu_firma_secreta_del_webhook` |
| `FRONTEND_URL` | URL base del dominio principal del SaaS (Sin barra final) | `https://tu-saas.com` |
| `RESEND_API_KEY` | (Opcional) Clave de envío de correos SMTP transaccionales | `re_tu_clave_de_resend` |
| `PORT` | Puerto de escucha interno para Render | `8000` |

> [!CAUTION]
> **NUNCA** uses la clave `SUPABASE_ANON_KEY` en el backend para operaciones de aprovisionamiento, ya que causará fallos de privilegios al invocar el método de creación de usuarios de Supabase Auth. Usa estrictamente `SUPABASE_SERVICE_ROLE_KEY`.

---

### B. VERCEL (Frontend - Next.js)
Configura estas variables en tu proyecto de Vercel en **Settings** -> **Environment Variables**:

| Variable | Descripción | Valor de Ejemplo |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | URL de tu API del Backend desplegado en Render (Sin barra final) | `https://tu-backend-fastapi.onrender.com` |
| `NEXT_PUBLIC_SUPABASE_URL` | URL pública de tu Supabase | `https://xxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave pública Anon de Supabase Auth | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

---

## 3. DOMINIOS Y DNS: DIRECCIONAMIENTO MULTI-TENANT

Para que el enrutamiento dinámico funcione de forma transparente y permita a Vercel resolver tanto la Landing corporativa (`tu-saas.com`) como los subdominios de inquilinos (`clinica-a.tu-saas.com`), debes configurar lo siguiente en tu proveedor de DNS (Cloudflare, GoDaddy, Hostinger, etc.):

### A. Configuración en el Panel de Vercel
1. En tu proyecto de Vercel, ve a **Settings** -> **Domains**.
2. Añade tu dominio principal: `tu-saas.com`.
3. Añade el subdominio wildcard para inquilinos dinámicos: `*.tu-saas.com`.

### B. Registros DNS Obligatorios
Crea los siguientes registros en tu proveedor de DNS:

| Tipo | Host | Valor / Destino | TTL | Función |
| :---: | :--- | :--- | :---: | :--- |
| **A** | `@` | `76.76.21.21` | Automático | Apunta el dominio raíz (`tu-saas.com`) a Vercel para renderizar la Landing. |
| **CNAME** | `www` | `cname.vercel-dns.com.` | Automático | Redirecciona `www.tu-saas.com` a Vercel. |
| **CNAME** | `*` | `cname.vercel-dns.com.` | Automático | **Wildcard DNS**: Resuelve cualquier subdominio dinámico (ej: `merce.tu-saas.com`) hacia Vercel para que nuestro `middleware.ts` lo intercepte. |

---

## 4. FLUJO DE COMPROBACIÓN FINAL (SANITY CHECK)

Una vez aplicadas las configuraciones anteriores y desplegado el código:
1. **Verificación de la Landing**: Accede a `https://tu-saas.com` -> Debe mostrar la Landing corporativa sin el navbar clínico ni errores de layout.
2. **Prueba de Registro**: Haz clic en *Comenzar Prueba Gratuita*, introduce datos ficticios y verifica que el modal valide el formulario y te redirija a Stripe.
3. **Flujo de Pago y Redirección**: Completa la pasarela de prueba de Stripe. Al finalizar, debes ser redirigido a `https://tu-saas.com/onboarding/success?session_id=...` y el webhook debe haber aprovisionado el inquilino local.
4. **Acceso al Subdominio**: Accede a `https://subdominio-creado.tu-saas.com/login` y comprueba que inicies sesión en la clínica aislada.

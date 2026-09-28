# 🗺️ Plan Maestro de Transformación UI: ProBookia (shadcn/ui + Aceternity)

> **Regla de Oro**: Una sola pantalla a la vez. Cero modificaciones en la lógica de negocio (Supabase, API, tokens y rutas se preservan al 100%). Cada paso requiere validación visual antes de avanzar.

---

## 📌 Checklist de Ejecución Progresiva

### 🧱 FASE 0: Cimientos de Componentes Base (shadcn/ui en `src/components/ui/`)
- [x] **0.1** Crear primitiva oficial `<Button />` (variantes: `default`, `luxury`, `outline`, `ghost`, `destructive`).
- [x] **0.2** Crear primitiva oficial `<Input />` (foco suave dorado `#D4AF37`, sin bordes rosas ni estilos huérfanos).
- [x] **0.3** Crear primitiva oficial `<Card />` (`CardHeader`, `CardContent`, `CardFooter`, `CardTitle`).

---

### 🚪 FASE 1: La Puerta de Entrada — Login (`/login`)
*Objetivo: Convertir la pantalla de acceso en una tarjeta monolítica de lujo tecnológico con halo sutil.*

- [x] **1.1** Reemplazar el contenedor con efecto Glassmorphism suave y halo dorado ambiental (Aceternity Glow).
- [x] **1.2** Sustituir el emoji infantil (`🔐`) por el **Monograma tallado oficial de ProBookia**.
- [x] **1.3** Corregir el bug que muestra `"www"` como subtítulo cuando entran desde el dominio principal.
- [x] **1.4** Integrar `<Input />` de shadcn con botón interactivo de **mostrar/ocultar contraseña** (icono ojo).
- [x] **1.5** Integrar `<Button variant="luxury" />` con micro-interacción de carga (animación fluida en submit).
- [x] **1.6** Limpieza completa de código viejo y estilos fucsia/rosa en desuso.
- [x] **1.7** *Validación visual del usuario en navegador y aprobación.*

---

### 👑 FASE 2: La Consola Central — Super Admin (`/super-admin`)
*Objetivo: Transformar el Backoffice Master en un panel de control con la solidez de Stripe/Vercel.*

- [x] **2.1** Barra lateral de navegación de Super Admin con iconos y estados activos limpios.
- [x] **2.2** Lista de clínicas/tenants en tarjeta refinada con badges de estado (`Activo`, `Periodo de Gracia`, `Suspendido`).
- [x] **2.3** Ficha de detalle de clínica con Bento Grid de KPIs (Ingresos, especialistas, plan actual).
- [x] **2.4** Modales de acción rápida (Cambiar Plan, Suspender, Reactivar Acceso) con `<Dialog />` de shadcn.
- [x] **2.5** *Validación visual del usuario en navegador y aprobación.*

---

### 📊 FASE 3: El Dashboard de los Tenants (`/dashboard`)
*Objetivo: Unificar la experiencia operativa de las clínicas con consistencia total.*

- [x] **3.1** Cabecera de bienvenida y tarjetas de resumen (KPIs de Citas, Clientes e Ingresos) con Bento Grid y shadcn Button/Card.
- [x] **3.2** Barra lateral y Navegación del Tenant (`DashboardSidebar.tsx`): Estados dorados activos y menús refinados.
- [x] **3.3** Ajustes Generales (`/dashboard/settings` y `/dashboard/profile`): Navegación lateral de 11 submódulos, Pestaña de Empresa, Perfil digital y Suscripción Bizum con `<Dialog />` de shadcn.
- [x] **3.4** Clientes (`/dashboard/clients`): Directorio con buscador rápido, avatares monograma, fichas de clientes y visor legal.
- [x] **3.5** Agenda (`/dashboard/calendar`): Cuadrícula elástica modernizada, skeletons de carga multi-columna, tarjetas Quiet Luxury pastel y modales shadcn/ui.
- [x] **3.6** Caja y TPV (`/dashboard/pos`): Unificación de ticket y botones de cobro rápido con estética dark luxury y Bento catalog.
- [x] **3.7** Servicios y Catálogo (`/dashboard/services`): DataGrid premium con bordes suaves, inputs de edición directa en línea, modales de categorías y editor editorial con Live Preview.
- [x] **3.8** Integración de Componentes PRO: Command Menu Global (`⌘K` / `Ctrl+K`) omnipotente con búsqueda en vivo de pacientes y acciones directas + Primitiva `SpotlightCard` (estilo Lightswind/Aceternity) con halo dorado interactivo en planes y sedes.

---

### 🌐 FASE 4: El Escaparate Público (Webs de los Tenants y Landing)
*Se abordará al final una vez que todo el ecosistema interno esté 100% blindado.*
- [ ] **4.1** Landing comercial de ProBookia (`/marketing`).
- [ ] **4.2** Plantillas públicas para las webs de las clínicas.

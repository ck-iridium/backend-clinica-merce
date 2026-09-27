---
trigger: always_on
---

# Regla de Estándares UI: shadcn/ui + Aceternity UI

ESTA REGLA ES DE OBLIGADO CUMPLIMIENTO EN TODO EL FRONTEND (DASHBOARD Y SAAS).
Toda nueva vista, componente o refactorización debe construirse estrictamente bajo el estándar de **shadcn/ui** (primitivas base) y **Aceternity UI** (efectos visuales de impacto). Está prohibido inventar componentes desde cero con divs desestructurados.

---

## 1. División de Responsabilidades (Fórmula 90/10)

### 🧱 El 90%: shadcn/ui (La Columna Vertebral Operativa)
Todo elemento funcional del Dashboard DEBE provenir de `@/components/ui/` basado en primitivas accesibles de Radix UI y Tailwind CSS:
* **Botones**: `<Button variant="default | luxury | outline | ghost" size="sm | md | lg">`
* **Modales y Diálogos**: `<Dialog>`, `<DialogContent>`, `<DialogHeader>`, `<DialogFooter>`. (PROHIBIDO `window.alert` o `window.confirm`).
* **Desplegables y Menús**: `<DropdownMenu>`, `<DropdownMenuTrigger>`, `<DropdownMenuContent>`.
* **Formularios e Inputs**: `<Input>`, `<Select>`, `<Checkbox>`, `<Textarea>`. Con estados `:focus-visible:ring-1` en dorado `#D4AF37`.
* **Pestañas**: `<Tabs>`, `<TabsList>`, `<TabsTrigger>`, `<TabsContent>`.
* **Carga de Datos**: `<Skeleton />` obligatorio para estados asíncronos. Prohibidos los spinners genéricos.

### ✨ El 10%: Aceternity UI (Capa de Lujo y Factor WOW)
Reservado exclusivamente para puntos de alto impacto visual y primeras impresiones:
* **Fondos y Atmósfera**: Halos de luz dorada ambiental (`glow`), cuadrículas sutiles de micropuntos (`dot-grid`) y degradados translúcidos.
* **Bento Grids**: Cuadrículas asimétricas dinámicas para presentar información clave, KPIs o servicios.
* **Micro-interacciones**: Bordes que reaccionan al cursor, reflejos de cristal ahumado y transiciones de Framer Motion suaves (`easeOut`, 300ms).

---

## 2. Paleta y Tokens de Diseño Obligatorios

* **Lienzo / Fondos**: Blanco roto marfil (`#FAF9F6` o `#FAFAFA`). En tarjetas principales: `bg-white/80 backdrop-blur-xl`.
* **Acento Principal**: Dorado refinado (`#D4AF37` / `brand-gold`). Solo para estados activos, bordes sutiles y CTAs de lujo.
* **Texto y Tipografía**:
  * Títulos: Tipografía refinada (`font-serif`), tracking medio.
  * Datos y Controles: `font-sans` (Inter), nítido y legible.
  * Textos secundarios: `text-stone-400` o `text-stone-500` con `text-xs` o `text-sm`.
* **Bordes y Esquinas**:
  * Contenedores y Tarjetas: `rounded-2xl` (16px) o `rounded-[2rem]` (32px).
  * Botones y Controles: `rounded-xl` (12px).
  * Sombras: Prohibidas las sombras duras. Solo `shadow-sm` o difuminadas `shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)]`.

---

## 3. Protocolo de Higiene: Cero Código Huérfano y Limpieza Inmediata

Al refactorizar o sustituir cualquier elemento antiguo por componentes de shadcn o Aceternity:
1. **Eliminación Total del Código Antiguo**: Está TERMINANTEMENTE PROHIBIDO dejar bloques comentados (ej. `{/* <OldModal ... /> */}`). El código reemplazado se borra de inmediato.
2. **Purga de Imports**: Tras la sustitución, se deben limpiar todos los imports no utilizados (iconos viejos, hooks o estilos deprecados).
3. **Archivos Huérfanos**: Si un subcomponente o archivo viejo queda 100% sin referencias activas en el proyecto, debe ser eliminado del árbol de archivos para evitar acumulación de deuda técnica.
4. **Verificación de Compilación**: Comprobar que no quedan advertencias de linting o tipos TypeScript rotos tras la poda de código viejo.

---

## 4. Protocolo de Implementación de Nuevos Componentes

1. **Revisar Existentes**: Antes de codificar, verificar si el componente ya existe en `@/components/ui/`.
2. **Si falta un componente de shadcn/ui**: Integrar el componente oficial en `@/components/ui/[nombre].tsx` usando Radix UI y Tailwind `cva` (Class Variance Authority).
3. **Composición Limpia**: Los componentes de negocio deben componer primitivas, no reinventar el HTML base.

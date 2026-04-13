# Política de Feedback UI Híbrida (Clínica Merce)

Esta política define el uso coordinado de **Sonner (Toasts)** y **FeedbackModal (Modales)** para garantizar una experiencia de usuario fluida y segura.

## 1. Regla General de Selección

| Tipo de Evento | Herramienta | Comportamiento |
| :--- | :--- | :--- |
| **Éxito rutinario** | **Sonner (Toast)** | Desaparece solo. No interrumpe. |
| **Error no crítico** | **Sonner (Toast)** | Informativo, rojo suave. |
| **Confirmación de Acción** | **FeedbackModal** | Requiere interacción explícita (Sí/No). |
| **Advertencia/Peligro** | **FeedbackModal** | Interrumpe para evitar errores graves. |
| **Error Crítico/Bloqueante** | **FeedbackModal** | Explicación detallada del fallo. |

---

## 2. Uso de Sonner (Toasts)

Utilizar para eventos que confirman que la acción del usuario ha tenido éxito sin necesidad de validación extra.

- `toast.success('...')`: Guardar ajustes, subir imagen, copiar al portapapeles, ítem actualizado.
- `toast.error('...')`: Fallo de validación simple, error de red temporal.

```tsx
import { toast } from 'sonner';

// Ejemplo: Éxito rápido
toast.success('Ajustes actualizados correctamente');

// Ejemplo: Error informativo
toast.error('No se pudo conectar con el servidor');
```

---

## 3. Uso de FeedbackModal (Contexto)

Utilizar para situaciones donde la atención del usuario es obligatoria o la acción es irreversible.

- `type: 'confirm'`: Borrar cliente, eliminar servicio, cancelar cita.
- `type: 'error' (Crítico)`: Fallo de seguridad, pérdida de datos, error de base de datos persistente.
- `type: 'success' (Hito)`: Solo para éxitos de gran importancia (ej: Factura generada con éxito tras proceso complejo).

---

## 4. Cuadro de Situaciones Comunes

| Situación | Feedback Recomendado | Texto Sugerido |
| :--- | :--- | :--- |
| Guardar cambios en CMS | Toast Success | "Contenido actualizado" |
| Borrar una imagen | Modal Confirm | "¿Eliminar imagen permanentemente?" |
| Error al cargar tabla | Toast Error | "Error al cargar datos" |
| Acceso Denegado | Modal Error | "No tiene permisos para esta acción" |
| Copiar URL | Toast Success | "URL copiada al portapapeles" |

**PROHIBIDO**: El uso de `alert()` o `confirm()` nativos sigue estrictamente prohibido.

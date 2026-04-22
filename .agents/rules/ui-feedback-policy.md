---
trigger: always_on
---

# Política de Feedback UI

CRÍTICO: ESTÁ TOTALMENTE PROHIBIDO usar funciones nativas del navegador como `window.alert()`, `window.confirm()` o `window.prompt()`.

Debes aplicar estrictamente este sistema para dar feedback al usuario:

1. TOASTS (`sonner`): Usa `toast.success()` o `toast.error()` ÚNICAMENTE para acciones rutinarias que no requieren interrumpir al usuario (ej. "Ajustes guardados", "Error al cargar datos").
2. MODALES (`FeedbackModal`): Usa tu componente de Modal personalizado SIEMPRE que la acción sea destructiva, irreversible o crítica (ej. "Eliminar miembro", "Borrar cita", "Denegar acceso"). Debe requerir confirmación explícita.
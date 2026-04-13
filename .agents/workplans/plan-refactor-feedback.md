# Plan de Refactorización: Feedback Híbrido

Este plan detalla la migración del sistema de alertas actual a un modelo híbrido basado en la nueva [Política de Feedback UI](file:///c:/Users/Juan/MERCE/CLINICA%20MERCE/.agents/rules/ui-feedback-policy.md).

## Objetivo
Optimizar la UX sustituyendo interrupciones innecesarias (Modales) por notificaciones rápidas (Toasts de Sonner) en acciones rutinarias, reservando los modales para confirmaciones críticas.

---

## 1. Módulos y Cambios Identificados

### Módulo de Servicios
- [ ] **Migrar a Toast**: Éxito al guardar servicio, éxito al actualizar/crear categoría, éxito al subir/recortar imagen.
- [ ] **Mantener en Modal**: Confirmación de borrado de servicio, confirmación de borrado de categoría, error de "Conflicto" (categoría con servicios).

### Módulo de Medios
- [ ] **Migrar a Toast**: Éxito al subir imagen, aviso de "URL Copiada", éxito al limpiar archivos huérfanos.
- [ ] **Mantener en Modal**: Confirmación de borrado de imagen, error crítico de red.

### Módulo de Ajustes
- [ ] **Migrar a Toast**: Éxito al guardar configuración (ya implementado), errores de validación de campos.

### Módulo CMS
- [ ] **Migrar a Toast**: Éxito al actualizar contenido web.

### Módulo de Clientes
- [ ] **Migrar a Toast**: Éxito al actualizar ficha, éxito al guardar documento legal.
- [ ] **Mantener en Modal**: Confirmación de borrado de cliente.

---

## 2. Pasos de Ejecución (Iterativo)

### Paso 1: Limpieza de Imports
En cada archivo identificado, importar `toast` de `sonner`. Mantener `useFeedback` solo si el componente realiza borrados o acciones que requieran confirmación.

### Paso 2: Sustitución de Lógica
Reemplazar llamadas `showFeedback({ type: 'success', ... })` por `toast.success('...')`. Reemplazar errores transitorios por `toast.error('...')`.

### Paso 3: Estandarización de Mensajes
Asegurar que los mensajes de los Toasts sean cortos y directos (ej: "Imagen guardada").

---

## 3. Verificación
- [ ] Comprobar que al borrar un elemento el modal de confirmación sigue apareciendo.
- [ ] Comprobar que al guardar cambios aparece el toast en la esquina superior derecha y no bloquea la navegación.

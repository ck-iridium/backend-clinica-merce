# Política de Feedback UI (Clínica Merce)

**CRÍTICO**: PROHIBIDO el uso de funciones nativas de navegador como `alert()` o `confirm()`.

Todo el feedback, confirmaciones o alertas de error al usuario en el frontend deben gestionarse OBLIGATORIAMENTE a través del `FeedbackContext` y el componente `FeedbackModal` personalizado.

## Uso Correcto

Para lanzar un modal de error, éxito o confirmación, debes invocar el hook global.

```tsx
import { useFeedback } from '@/app/contexts/FeedbackContext';

export default function MiComponente() {
  const { showFeedback } = useFeedback();

  const handleAction = () => {
    showFeedback({
      type: 'confirm',
      title: 'Confirmación Requerida',
      message: '¿Estás seguro de que deseas eliminar este elemento? Esta acción es irreversible.',
      onConfirm: async () => {
        // Lógica de borrado asíncrona aquí
        await fetch('...', { method: 'DELETE' });
        showFeedback({
          type: 'success',
          title: '¡Eliminado!',
          message: 'El registro se ha borrado con éxito.'
        });
      }
    });
  };
}
```

## Argumentos

- `type`: `'success' | 'error' | 'confirm'`
- `title`: Título en formato texto.
- `message`: Detalle largo o resumen.
- `onConfirm`: (Opcional). Callback a ejecutar cuando el usuario pulsa "Confirmar" o "Entendido" dependiendo del tipo de modal. En modales 'confirm' es mandatorio si requiere una acción posterior.

Cualquier PR o modificación generada por un agente debe ceñirse a esta arquitectura.

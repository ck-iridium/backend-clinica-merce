# Fase 6: Experiencia Sensorial y UX Premium

Este plan detalla los pasos para elevar la calidad de uso de la aplicación mediante feedback visual, estados de carga y optimizaciones de diseño para móviles.

## Punto 6.1: Feedback Visual con Sonner (Toasts)
- [ ] **Instalación**: `npm install sonner`.
- [ ] **Configuración**: Añadir el proveedor `<Toaster />` en el layout principal.
- [ ] **Implementación**: Sustituir alertas nativas o silenciosas por Toasts premium:
    - [ ] Avisos de éxito al guardar/actualizar.
    - [ ] Avisos de error en peticiones API.
    - [ ] Notificaciones de eliminación.

## Punto 6.2: Estados de Carga (Skeletons)
- [ ] **Equipo**: Añadir carga progresiva en `dashboard/team/page.tsx`.
- [ ] **Buscador Global**: Implementar skeletons en la lista de resultados de clientes.
- [ ] **Métricas**: Añadir skeletons en las tarjetas de la página de inicio.

## Punto 6.3: Pulido Responsive (Mobile-First)
- [ ] **Sidebar**: Verificar colapso y comportamiento del burger menú.
- [ ] **Tablas**: Implementar scroll horizontal suave y sombras indicadoras de desbordamiento en Equipo y Facturación.
- [ ] **Venta Rápida**: Ajustar tamaño de hit-area para móviles (pulgar).

## Punto 6.4: Micro-interacciones
- [ ] **Transiciones**: Añadir clases de `fade-in` y `slide-in` suaves en la carga de páginas del dashboard.
- [ ] **Hover Effects**: Refinar las sombras y escalas en botones de acción.

## Verificación Planificada
- [ ] Probar la aparición de Toasts ante fallos de red simulados.
- [ ] Validar la visualización en dispositivos móviles (Simulador del navegador).
- [ ] Asegurar que los Skeletons coinciden con la estructura final de los componentes.

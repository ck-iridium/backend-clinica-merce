---
title: Manual de Ayuda: Clientes y Ficha Clínica
description: Guía completa y detallada para el uso del módulo de clientes.
---

# Manual de Ayuda: Clientes y Ficha Clínica

Este manual sirve como la única fuente de verdad (RAG) para guiar al usuario en el uso del módulo de Clientes y Ficha Clínica.

## 1. Reglas de Negocio
El módulo de Clientes permite llevar un control y registro unificado de todos los pacientes que acuden a la clínica.
- **Directorio de Clientes (`/dashboard/clients`):** Listado general con buscador y panel de alta de nuevos pacientes.
- **Ficha de Perfil del Cliente (`/dashboard/clients/[id]`):** Panel detallado dividido en cuatro áreas funcionales:
  - **Resumen:** Información personal, de contacto, dirección física y notas internas libres.
  - **Servicios:** Registro e historial completo de tratamientos realizados, con paginación de citas anteriores.
  - **Bonos:** Visualización de los bonos adquiridos por el paciente y acceso rápido para cobrar deudas asociadas a estos bonos.
  - **Consentimientos:** Gestión legal donde se seleccionan y firman digitalmente consentimientos informados (mediante un lienzo canvas interactivo) y se imprimen o consultan documentos ya firmados.

## 2. Seguridad (RBAC)
El acceso a la ficha y la capacidad de modificación están protegidos para asegurar la privacidad del historial médico:
- **Administrador:** Acceso total de lectura, escritura y borrado en todas las pestañas y campos (datos personales, médicos y financieros).
- **Recepción:** Acceso total a datos personales, firma de consentimientos e historial de citas. Puede cobrar deudas de bonos.
- **Especialista:** Acceso parcial.
  - **Lectura/Escritura:** Alertas Médicas, Historial Médico, Observaciones Libres y Fórmulas/Historial Clínico.
  - **Solo Lectura:** Nombre, Apellidos, Email, Teléfono, DNI y Dirección.
  - **Ocultar:** El botón "Vender Bono" (`sell-voucher-link`) y datos de cobros.
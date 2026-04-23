---
trigger: always_on
---

# Manifiesto de Permisos RBAC - Clínica Mercè

Este documento es la fuente de verdad para el Control de Acceso Basado en Roles (RBAC). Todas las modificaciones en la UI o lógica de negocio deben cumplir con esta matriz.

## Matriz de Acceso por Módulo

| Módulo / Sección | Administrador | Recepción | Especialista |
| :--- | :---: | :---: | :---: |
| **Inicio (Dashboard)** | ✅ Total | ✅ Total | ⚠️ Parcial¹ |
| **Agenda (/calendar)** | ✅ Total | ✅ Total | ✅ Total |
| **Clientes (/clients)** | ✅ Total | ✅ Total | ⚠️ Parcial² |
| **Facturas (/invoices)** | ✅ Total | ✅ Acceso | 🚫 Bloqueado |
| **Venta Rápida (/pos)** | ✅ Total | ✅ Acceso | 🚫 Bloqueado |
| **Servicios (/services)** | ✅ Total | 🚫 Bloqueado | 🚫 Bloqueado |
| **Bonos (/vouchers)** | ✅ Total | ✅ Acceso | 🚫 Bloqueado |
| **Equipo (/team)** | ✅ Total | 🚫 Bloqueado | 🚫 Bloqueado |
| **Ajustes (/settings)** | ✅ Total | 🚫 Bloqueado | 🚫 Bloqueado |
| **Galería (/media)** | ✅ Total | 🚫 Bloqueado | 🚫 Bloqueado |
| **Editor Web (/cms)** | ✅ Total | 🚫 Bloqueado | 🚫 Bloqueado |
| **Backups (/backups)** | ✅ Total | 🚫 Bloqueado | 🚫 Bloqueado |

---

## Notas de Implementación Detalladas

### ¹ Dashboard (Especialista)
- **Ocultar**: Tarjeta de "Ingresos Estimados".
- **Mostrar**: "Citas de hoy", "Nuevos Clientes" y "Tasa de Ocupación".

### ² Ficha de Cliente (Especialista)
- **Lectura/Escritura**: Alertas Médicas, Historial Médico / Observaciones Libres.
- **Solo Lectura**: Nombre, Apellidos, Email, Teléfono, DNI, Dirección.
- **Ocultar**: Botón "Vender Bono".

### ³ Mobile UI (Recepción)
- **Acceso Directo**: "Facturas" debe estar en el menú principal del MobileBottomBar.
- **Submenús**: Ocultar completamente los submenús de "Configuración" y "Gestión Avanzada".

# Plan de Ejecución: Refactorización de Centro de Control Financiero

## Fase 1: Backend y Tipos (Estructura de Datos)
- [x] `backend/app/schemas.py`: Crear clase `InvoiceKPIs` con `total_gross`, `tax_base` y `vat_quota` (todos float).
- [x] `backend/app/schemas.py`: Crear clase `PaginatedInvoicesResponse` con `total`, `pages`, `current_page`, `kpis` (tipo `InvoiceKPIs`) y `data` (List de `InvoiceResponse`).
- [x] `backend/app/crud.py`: Modificar `get_invoices` para aceptar parámetros `page`, `limit`, `status`, `start_date`, `end_date`, y `search`.
- [x] `backend/app/crud.py`: En `get_invoices`, implementar query base filtrando por los parámetros recibidos.
- [x] `backend/app/crud.py`: En `get_invoices`, implementar sub-query `func.sum` para calcular `total_gross`, derivar `tax_base` (/ 1.21) y `vat_quota` (- base).
- [x] `backend/app/crud.py`: En `get_invoices`, implementar cálculo de `offset` basado en la página y retornar el diccionario formateado.
- [x] `backend/app/routers/invoices.py`: Actualizar endpoint `GET /invoices/` para recibir los nuevos query params y retornar `PaginatedInvoicesResponse`.
- [x] `frontend/src/lib/types.ts` (o donde residan los tipos globales): Añadir/actualizar interfaz `PaginatedInvoicesResponse`, `InvoiceKPIs` y `InvoiceFilters`.

## Fase 2: Lógica de Estado (Frontend)
- [x] `frontend/src/hooks/useInvoices.ts`: Crear hook personalizado. Inicializar estados para `invoices`, `kpis`, `loading`, `pagination` (page, limit, total, pages) y `filters` (status, dateRange, search).
- [x] `frontend/src/hooks/useInvoices.ts`: Implementar función `fetchInvoices` que construya los `URLSearchParams` a partir del estado actual y llame a la API.
- [x] `frontend/src/hooks/useInvoices.ts`: Añadir `useEffect` para disparar `fetchInvoices` cuando cambien la página o los filtros.
- [x] `frontend/src/hooks/useInvoices.ts`: Exponer handlers (`handlePageChange`, `handleFilterChange`, `handleSearch`) y estados al componente consumidor.

## Fase 3: Componentes Visuales (UI Aislada)
- [x] `frontend/src/components/invoices/InvoiceKPIs.tsx`: Crear componente que reciba la prop `kpis` y renderice 3 tarjetas (Total Bruto, Base Imponible, Cuota de IVA) formateadas en euros.
- [x] `frontend/src/components/invoices/InvoiceFilters.tsx`: Crear componente que reciba `filters` y los handlers de cambio. Implementar Tabs para el estado ('Todas', 'Pagadas', 'Pendientes').
- [x] `frontend/src/components/invoices/InvoiceFilters.tsx`: Implementar Dropdown/Select para rango de fechas ('Hoy', 'Este Mes', etc.).
- [x] `frontend/src/components/invoices/InvoiceFilters.tsx`: Implementar Input de búsqueda por texto con debounce interno.
- [x] `frontend/src/components/invoices/InvoiceTable.tsx`: Mover la lógica de renderizado de la tabla desde `page.tsx` a este componente.
- [x] `frontend/src/components/invoices/InvoiceTable.tsx`: Añadir botones de paginación (Anterior, Siguiente) y texto de "Página X de Y" debajo de la tabla, usando la info de paginación recibida por props.
- [x] `frontend/src/components/invoices/InvoiceTable.tsx`: Integrar botón "Exportar CSV" que transforme los datos visibles a texto y dispare la descarga.

## Fase 4: Ensamblaje Final
- [x] `frontend/src/app/dashboard/(standard)/invoices/page.tsx`: Limpiar el archivo eliminando todo el código monolítico previo.
- [x] `frontend/src/app/dashboard/(standard)/invoices/page.tsx`: Importar y ejecutar `useInvoices`.
- [x] `frontend/src/app/dashboard/(standard)/invoices/page.tsx`: Importar y renderizar `<InvoiceKPIs />` pasando los datos del hook.
- [x] `frontend/src/app/dashboard/(standard)/invoices/page.tsx`: Importar y renderizar `<InvoiceFilters />` pasando estado y callbacks.
- [x] `frontend/src/app/dashboard/(standard)/invoices/page.tsx`: Importar y renderizar `<InvoiceTable />` pasando `invoices`, `pagination` y funciones de cambio de página.

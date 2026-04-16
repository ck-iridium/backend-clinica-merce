# Plan de Implementación: Horarios Flexibles y Bloqueos Vacacionales

Este documento desglosa la construcción del sistema definitivo de gestión de tiempos e inhabilitación dinámica para la Clínica Mercè, dividiendo el trabajo en tareas secuenciales para evitar regresiones y garantizar escalabilidad.

## User Review Required

> [!IMPORTANT]
> Por favor, revisa las siguientes tareas para confirmar que abarcan todo lo que necesitas. Abordaremos primero la base de datos, luego la capa visual de administración y finalmente el "cerebro" matemático de la agenda.

---

## 🛠️ Task 1: Actualización de la Base de Datos y Backend

El primer paso es preparar nuestra base de datos para almacenar esta información y actualizar los endpoints que ya existen.

### a) Esquema `ClinicSettings`
Actualizaremos el modelo `ClinicSettings` de la base de datos para añadir los parámetros que rigen el "día estándar":
- `open_time` (String, ej: "09:00"): Hora de apertura por defecto.
- `close_time` (String, ej: "19:30"): Hora de última reserva.
- `lunch_start` (String, ej: "14:00"): Opcional, inicio del descanso.
- `lunch_end` (String, ej: "16:00"): Opcional, fin del descanso.

### b) Esquema `TimeBlock`
Nuestra tabla `time_blocks` actual soporta fechas y horas (`start_time`, `end_time`). Añadiremos:
- `is_annual_holiday` (Boolean, default: `False`): Para identificar si el bloqueo es recurrente todos los años (ej. Navidad, Festivo Nacional) sin importar el año.

### c) API y Migraciones
- Actualización de los esquemas Pydantic (`schemas.py`) para validar estos nuevos campos entrantes.
- Creación de la migración en Alembic para alterar las tablas sin perder datos existentes.

---

## 🖥️ Task 2: Nueva UI de Ajustes (Panel de Administrador)

Debemos dar a la administradora el control absoluto sobre estos nuevos campos sin que toque código. Editaremos la página `/dashboard/settings`.

### a) Pestaña "Horario Hábil"
Formularios limpios (inputs tipo Time) conectados al backend de Settings para que Mercè defina a qué hora abre la clínica y cuáles son las horas concretas en las que la grilla del calendario deberá pintar la caja gris del "Descanso".

### b) Gestor de "Ausencias y Festivos"
Crearemos un CRUD dedicado dentro de Ajustes que permita:
- Ver una lista de todas las vacaciones pasadas y futuras.
- Añadir un "Nuevo Bloqueo". Dará la opción de elegir: Rango completo (Fecha Inicio - Fecha Fin) para semanas de vacaciones.
- Checkbox de `"Repetir anualmente"` para festivos fijos.

---

## 🧠 Task 3: Adaptación Lógica de la Agenda (Calendario Frontend)

Reescribiremos el "cerebro" matemático que dibuja las ranuras de la agenda móvil y de escritorio, matando la constante actual que empezaba mecánicamente en las 9:00 y terminaba en el array estático.

### a) Generación Dinámica de la Grilla 
El componente `CalendarContent` obtendrá el horario desde `Settings`. En lugar del array fijo de horas, generará los "huecos" visuales calculando desde `open_time` hasta `close_time`.

### b) Descansos Diarios Inyectados
La lógica evaluará cada bloque dibujado. Si el bloque cae entre `lunch_start` y `lunch_end`, se renderizará como inhabilitado con el letrero "Descanso", protegiendo esa área para que no acepte clics de nuevas citas.

### c) Overlays de Festivos y Vacaciones Multidía
Cruzar la fecha que se está renderizando (ej: 16 de agosto) contra los registros de `TimeBlocks`. 
- Si detectamos que el día cae completamente dentro de unas vacaciones (o coincide el mes y el día en un `annual_holiday`), el componente bloqueará el 100% de la columna de ese día con un cartel transparente y bonito: *"Cerrado: Vacaciones Verano"*, impidiendo cualquier reserva a cualquier hora.


---

## ✅ Open Questions

¿Estás de acuerdo con esta división de tareas? Si apruebas el plan, el **primer paso** que ejecutaré será la **Task 1: modificar los archivos del backend (`models.py`, `schemas.py`) para preparar la estructura de datos.**

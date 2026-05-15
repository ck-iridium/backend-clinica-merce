# Diagnóstico Técnico y Plan de Acción: Arquitectura SaaS (Stripe + Citas)

A continuación presento la auditoría profunda de los 4 problemas interconectados en el sistema actual, sus causas raíz y la estrategia exacta para solucionarlos sin parchear.

## User Review Required

> [!IMPORTANT]
> Lee detalladamente este diagnóstico. No he modificado nada del código. Cuando estés de acuerdo con el Plan de Acción, confírmalo y procederé a ejecutarlo de forma ordenada.

---

## 1. Webhooks y Estado "Pendiente de Pago"

**Diagnóstico Técnico:**
El endpoint del webhook (`/stripe/webhook` en `stripe_payments.py`) y el mapeo del ID (`client_reference_id=appt.id`) **están perfectamente programados**. El fallo no está en el código, está en la infraestructura de desarrollo local.
Al utilizar una cuenta conectada de Stripe (`stripe_account=...`), los eventos de pago ocurren en la cuenta "hija" (Clínica), no en la "padre" (Plataforma). Tu terminal actualmente ejecuta `stripe listen` sin el flag `--connect`. Esto provoca que Stripe filtre y oculte los eventos de la cuenta hija, por lo que el servidor FastAPI nunca recibe el evento `checkout.session.completed`. El backend está completamente "ciego" a los pagos.

**Plan de Acción:**
1. Solo necesitas reiniciar tu terminal con el comando correcto: `stripe listen --connect --forward-to localhost:8000/stripe/webhook`.
2. No tocaremos el código del backend para esto, ya que está correcto.

---

## 2. Sistema de Sonido y Notificaciones

**Diagnóstico Técnico:**
El hook del frontend (`useNotifications.ts`) funciona correctamente escuchando inserciones en la tabla `notifications` de Supabase en tiempo real (vía WebSocket).
El problema es doble:
1. Al fallar el Webhook (Punto 1), la cita nunca pasa a estado `confirmed`, por lo que el flujo normal se interrumpe.
2. Al revisar el backend (`mailer.py`, `automation.py`), descubrí que **el backend no está insertando filas en la tabla `notifications`**. Envía los correos electrónicos correctamente (`send_appointment_notification`), pero no hay rastro de creación de la notificación en base de datos, a menos que tengas un *Trigger* activo en Supabase. Si no hay Trigger, las notificaciones web nunca llegarán a existir.

**Plan de Acción:**
1. Modificaré el backend (`mailer.py` o `appointments.py`) para que, además de enviar el correo, inserte explícitamente un registro en la tabla `notifications` de la base de datos cada vez que una cita se confirme o se reciba un pago. Esto asegurará que el frontend (y el sonido) reaccionen instantáneamente.

---

## 3. Regla de Antelación (15 minutos mínimos)

**Diagnóstico Técnico:**
La lógica en `get_available_slots` (`crud/appointments.py`) está bien estructurada y utiliza correctamente la hora de España (`get_spain_now()`) para validar el margen. Actualmente, este margen está controlado por el campo `booking_margin_hours` de la configuración de la clínica, que por defecto era de `2.0` y recientemente se bajó a `0.5` (30 minutos).

**Plan de Acción:**
1. Ajustaré la lógica y la interfaz de ajustes para asegurar que el margen pueda ser exactamente `0.25` horas (15 minutos).
2. Verificaré que no existan desajustes entre la hora local y el cálculo de solapamiento.

---

## 4. El "Barrendero" (Limpieza de citas huérfanas)

**Diagnóstico Técnico:**
El anterior intento de `tasks.py` falló por un problema clásico de **Zonas Horarias**. Supabase guarda el campo `created_at` en formato **UTC**. Al comparar la fecha de creación (UTC, ej. 10:00) con la hora de España (`get_spain_now()`, ej. 12:00) restándole 15 minutos (11:45), el sistema creía que la cita tenía casi 2 horas de antigüedad y la cancelaba inmediatamente.
Por otro lado, usar tareas en línea (`scheduler.add_job` con un `run_date` específico) dentro del endpoint de creación es arriesgado: si el servidor se reinicia antes de que pasen los 15 minutos, la cita se queda bloqueada para siempre.

**Plan de Acción:**
1. **Estrategia Robusta (Cronjob):** Reimplementaré el `tasks.py` ejecutándose cada 5 minutos, pero **corrigiendo la zona horaria**. Compararé la hora en UTC puro (`datetime.utcnow() - timedelta(minutes=15)`) contra el `created_at` de la base de datos.
2. **Validación Pasiva (Backup):** Modificaré la lógica de `get_available_slots` para que, al calcular huecos libres, si encuentra una cita en estado `awaiting_payment` que tenga más de 15 minutos de antigüedad, la ignore y considere el hueco como "Disponible". Así, aunque el barrendero falle, el hueco nunca estará bloqueado permanentemente de cara al público.

---

### ¿Cómo procedemos?
Confírmame si estás de acuerdo con este análisis y este plan. En cuanto me des luz verde, aplicaré las soluciones de código en los puntos 2, 3 y 4. (El punto 1 lo harás tú en la terminal).

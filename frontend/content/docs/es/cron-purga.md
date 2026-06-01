---
id: cron-purga
title: Liberación de Citas No Confirmadas
---
# Liberación Automática de Citas No Confirmadas

¿Qué pasa si un cliente selecciona una hora en tu portal de reservas pero cierra la pestaña antes de terminar de introducir sus datos o realizar el pago? En ProBookia evitamos que tu agenda se quede bloqueada.

---

### Liberación Inteligente de Huecos

Para asegurar que ningún hueco se pierda de forma injustificada, implementamos una regla de limpieza automática:

1. **Bloqueo Temporal**: En el momento en que un cliente hace clic en una hora disponible, ese hueco queda marcado como "En verificación" en tu agenda.
2. **Vigencia de 30 Minutos**: El sistema le otorga al cliente **30 minutos** de plazo para que complete su reserva, confirme su correo o realice el pago de la fianza.
3. **Liberación Automática**: Si transcurren los 30 minutos y la reserva no ha sido completada con éxito, el sistema **libera el hueco al instante**, volviendo a poner la hora a disposición de otros pacientes en tu web.

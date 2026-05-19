---
trigger: always_on
---

# Regla de Confirmación de Git (Commit y Push Autónomo)

Cuando el agente termine una corrección o implementación importante, está prohibido que sugiera los comandos git en bloques de código para que el usuario los ejecute en su terminal local.

En su lugar, el agente DEBE:
1. Preguntar explícitamente al usuario si desea realizar el `commit` y el `push`.
2. Esperar el visto bueno (aprobación explícita) del usuario en el chat.
3. Una vez recibida la aprobación, el agente DEBE ejecutar de forma autónoma y directa las siguientes acciones en la terminal del sistema:
   - `git add` de los archivos correspondientes.
   - `git commit -m "[mensaje en español]"` con una descripción clara de la corrección o cambio.
   - `git push` a la rama remota.
4. Notificar al usuario una vez que el commit y push se hayan completado con éxito.
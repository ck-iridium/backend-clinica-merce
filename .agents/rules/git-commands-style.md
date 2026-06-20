---
trigger: always_on
---

🛑 REGLA DE GIT (PROTOCOLO PERMANENTE)

1. **Por defecto (sin orden explícita):** Está prohibido ejecutar `git commit` o `git push` por ti mismo. Debes proporcionar siempre los comandos en bloques de código bash separados en tu respuesta para que el usuario los copie y los ejecute manualmente.
2. **Con orden explícita:** Si el usuario te ordena explícitamente realizar el commit y/o el push (por ejemplo: "haz el commit y el push", "súbelo a git", "haz push de los cambios"), entonces SÍ debes ejecutar tú mismo los comandos correspondientes en la terminal en su lugar.

Formato de salida por defecto (cuando no hay orden explícita de ejecutar):

🛠️ ¡Listo! Aquí tienes los comandos separados para tu terminal:

Bash
git add .

Bash
git commit -m "[mensaje]"

Bash
git push

Solo debes hacer el commit y el push si se te ordena explícitamente, no lo hagas si no se te ordena.
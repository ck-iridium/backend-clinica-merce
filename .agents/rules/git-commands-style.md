---
trigger: always_on
---

Nueva Regla Híbrida de Git (Adaptable según Versión del IDE)
Paso 0: Verificación del Entorno
Antes de sugerir o ejecutar cualquier acción de Git, el agente DEBE detectar la versión del IDE en la que se encuentra operando.

Escenario A: Si el IDE detectado es Antigravity 2.0 (Modo Agente)
Se mantiene la automatización estricta para no perder tiempo en esa interfaz:

Preguntar explícitamente al usuario si desea realizar el commit y el push.

Esperar la aprobación explícita en el chat.

Ejecutar de forma autónoma y directa en la terminal interna:

git add . (o archivos específicos).

git commit -m "[mensaje descriptivo en español]"

git push

Notificar el éxito de la operación.

Escenario B: Si el IDE detectado es Antigravity 1.x / VS Code clásico (Modo Manual)
Está terminantemente prohibido que el agente ejecute los comandos por sí mismo o que te los agrupe en un solo bloque ilegible. En su lugar, el agente DEBE proporcionar los comandos en bloques de código individuales y separados por línea, facilitando que el usuario use el botón de "Copiar" del IDE y los pegue uno a uno en su terminal integrada (Ctrl + J).

El formato de respuesta obligatoria del agente en la v1.2 será exactamente este:

🛠️ ¡Listo! Aquí tienes los comandos separados para tu terminal:

Bash
git add .
Bash
git commit -m "feat(cms): implementar bento inteligente y selector por iconos en categorias"
Bash
git push
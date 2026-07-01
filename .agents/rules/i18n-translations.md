# RULE: POLÍTICA DE TRADUCCIÓN E INTERNACIONALIZACIÓN (i18n)

Esta regla define las directrices obligatorias para la traducción e internacionalización de Clínica Mercè.

## 1. Obligatoriedad de las 3 Lenguas
Cada vez que se añada, modifique o extienda cualquier texto, etiqueta, título, botón, placeholder o descripción visible para el usuario en la interfaz, **es obligatorio** registrar y traducir dicho contenido de manera simultánea en los tres archivos de idioma correspondientes:
- 🇪🇸 **Español**: `src/app/locales/es/dashboard.json` (o archivo local respectivo)
- 🇬🇧 **Inglés**: `src/app/locales/en/dashboard.json` (o archivo local respectivo)
- 🇫🇷 **Francés**: `src/app/locales/fr/dashboard.json` (o archivo local respectivo)

## 2. Prohibición de Textos Hardcoded
- Está estrictamente prohibido incrustar cadenas de texto estáticas directamente en el código de componentes o páginas de React.
- Todo texto debe ser consumido mediante el hook/función de traducción `t('ruta.de.la.clave')`.
- En caso de textos con valores dinámicos, se debe utilizar la sustitución o interpolación de variables programadas (por ejemplo: `t('dashboard.pos.services_available').replace('{count}', String(count))`).

## 3. Glosario de Términos Críticos en Francés
- Se debe utilizar obligatoriamente el término **"Services"** en lugar de "Soins" o "Prestations" para referirse a los servicios/tratamientos de la clínica en las traducciones francesas.

## 4. Coherencia y Exhaustividad
- Antes de dar por finalizada una tarea, el desarrollador (o agente) debe revisar que no existan discrepancias entre los archivos de configuración de traducción y que no queden textos por traducir.

# CCPE-RIACES 2026

Cuestionario de Conocimientos y Competencia del Par Evaluador del **Diplomado Internacional en Formación y Actualización de Pares Académicos Evaluadores** (RIACES 2026, segunda edición), con un panel de resultados para el equipo evaluador.

El cuestionario se aplica **una sola vez, al terminar el diplomado** (diseño solo postest), para comprobar si los asistentes han alcanzado los objetivos del curso. Es anónimo.

Autor: Enrique Maya Cámara · [La Clase de Kike](https://laclasedekike.com)

## Páginas

| Página | Para quién | Qué hace |
| --- | --- | --- |
| `index.html` | Asistentes | Cuestionario en 5 pasos: consentimiento, perfil (A2-A17), autopercepción retrospectiva antes/ahora (B1-B18) y prueba de conocimientos (C1-C30) |
| `panel.html` | Equipo evaluador | Acceso con contraseña personal, análisis de resultados, filtros y exportación a CSV, Excel y PDF |

## Cómo funciona

```
GitHub Pages (index.html, panel.html)  ──fetch──▶  Google Apps Script (apps-script/Code.gs)  ──▶  Hoja de Google
```

- Las páginas se publican con **GitHub Pages**. El repositorio no contiene datos de participantes.
- Las respuestas se envían a una aplicación web de **Google Apps Script**, que las valida, calcula las puntuaciones y las guarda en una hoja de Google del responsable del estudio.
- **La clave de respuestas y las contraseñas no están en este repositorio.** Se guardan en las propiedades del script de Apps Script, que no son públicas. La puntuación se calcula siempre en el servidor.

## Instalación

### 1. Servicio de datos (Google Apps Script)

1. Crea una hoja de Google (con la cuenta institucional) y abre **Extensiones → Apps Script**.
2. Pega el contenido de `apps-script/Code.gs` en `Código.gs`.
3. En **Configuración del proyecto (⚙) → Propiedades del script**, añade:

   | Propiedad | Valor |
   | --- | --- |
   | `CLAVE_RESPUESTAS` | Las 30 letras de la clave, en orden C1…C30. La facilita el responsable del estudio y no se publica |
   | `CLAVES_PANEL` | Evaluadores y contraseñas: `Nombre Apellido=contraseña; Otra Persona=otra-contraseña` |
   | `URL_ENCUESTA` | (Opcional) Dirección del cuestionario en GitHub Pages |

   Las contraseñas deben tener al menos 6 caracteres y no pueden contener `;` ni `=`.
4. Ejecuta la función **configurar** una vez: crea la pestaña «Respuestas postest» y comprueba la configuración.
5. **Implementar → Nueva implementación → Aplicación web.** Ejecutar como: *yo*. Quién tiene acceso: *cualquier usuario*. Copia la URL que termina en `/exec`.

### 2. Páginas (GitHub Pages)

1. Pon la URL `/exec` en `config.js`.
2. En el repositorio: **Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch: `main`, carpeta `/ (root)` → Save**.
3. Las páginas quedan en `https://USUARIO.github.io/ccpe-riaces-2026/` y `…/panel.html`.

## Uso habitual

- **Abrir o cerrar el cuestionario:** cambia `ABIERTO` en `Code.gs` y publica una nueva versión en *Implementar → Gestionar implementaciones → Editar → Nueva versión*. La URL no cambia.
- **Dar o retirar acceso a un evaluador:** edita `CLAVES_PANEL` en las propiedades del script. No hace falta volver a implementar.
- **Cambiar el criterio de logro:** `CRITERIO_MODULO` en `Code.gs` (por defecto, 7 aciertos de 10 por módulo).

## Panel de evaluadores

- Porcentaje de asistentes que alcanza los objetivos de cada módulo y del diplomado, con IC del 95 % (Wilson).
- Aciertos por sesión frente al criterio, distribución de puntuaciones y logro según la experiencia previa.
- Autopercepción retrospectiva antes/ahora (t de Student para muestras relacionadas, p exacta, d_z) y calibración entre conocimiento y autopercepción.
- Fiabilidad (KR-20, α de Cronbach) y análisis de ítems (dificultad, discriminación y «No lo sé»).
- Filtros por país, perfil profesional y experiencia previa, que se aplican también a las exportaciones.
- **Exportar:** datos en CSV (separador `;`, compatible con Excel en español), un Excel con las hojas Resumen, Autopercepción, Ítems, Datos y Diccionario, e informe en PDF desde el diálogo de impresión.

La contraseña se guarda solo durante la sesión del navegador y se borra al cerrar la pestaña o al pulsar «Cerrar sesión».

## Protección de datos

- El cuestionario no recoge nombre, correo ni ningún identificador personal.
- Los datos se guardan únicamente en la hoja de Google del responsable del estudio.
- Antes de lanzarlo hay que completar en `index.html` los datos entre corchetes: [entidad], [correo] y [código] del comité de ética.

## Estructura

```
index.html              Cuestionario
panel.html              Panel de evaluadores
config.js               URL del servicio de datos
assets/base.css         Estilos de la marca EMC
assets/items.js         Ítems del cuestionario (sin clave)
assets/meta.js          Sesión y nivel cognitivo de cada ítem (sin clave)
assets/logo.png         Logotipo EMC
assets/vendor/          SheetJS 0.18.5 (licencia Apache 2.0) para exportar a Excel
apps-script/Code.gs     Servicio de datos para Google Apps Script
```

# CCPE-RIACES 2026

Cuestionario de Conocimientos y Competencia del Par Evaluador del **Diplomado Internacional en Formación y Actualización de Pares Académicos Evaluadores** (RIACES 2026, segunda edición), con un panel de resultados para el equipo evaluador.

El cuestionario se aplica **una sola vez, al terminar el diplomado** (diseño solo postest), para comprobar si los asistentes han alcanzado los objetivos del curso. Es anónimo.

Autoría: Enrique Maya Cámara en colaboración con RIACES (Red Iberoamericana para el Aseguramiento de la Calidad en la Educación Superior)

## Páginas

| Página | Para quién | Qué hace |
| --- | --- | --- |
| `index.html` | Asistentes | Cuestionario en 7 pasos: consentimiento, perfil (A2-A17), autopercepción retrospectiva antes/ahora (B1-B18), prueba de conocimientos (C1-C30), satisfacción con contenidos, instructores y logística (D1-D13), valoración abierta opcional (E1-E4) y envío |
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
3. Configura los datos privados de una de estas dos formas, siempre dentro de Apps Script y nunca en GitHub:
   - rellena el bloque `SECRETOS` al principio de `Code.gs` en el editor de Apps Script, o
   - en **Configuración del proyecto (⚙) → Propiedades del script**, añade las propiedades siguientes, que tienen prioridad sobre el bloque `SECRETOS`:

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
- **Dar o retirar acceso a un evaluador:** edita `CLAVES_PANEL` en el bloque `SECRETOS` (y publica una nueva versión) o en las propiedades del script (sin volver a implementar).
- **Cambiar el criterio de logro:** `CRITERIO_MODULO` en `Code.gs` (por defecto, 7 aciertos de 10 por módulo).

## Panel de evaluadores

- Porcentaje de asistentes que alcanza los objetivos de cada módulo y del diplomado, con IC del 95 % (Wilson).
- Aciertos por sesión frente al criterio, distribución de puntuaciones y logro según la experiencia previa.
- Autopercepción retrospectiva antes/ahora (t de Student para muestras relacionadas, p exacta, d_z) y calibración entre conocimiento y autopercepción.
- Fiabilidad (KR-20, α de Cronbach) y análisis de ítems (dificultad, discriminación y «No lo sé»).
- Satisfacción por componente (contenidos, instructores, logística y dinámicas, global): medias, porcentaje de satisfechos, α de Cronbach y distribución de respuestas por ítem.
- Valoración del diplomado: comentarios abiertos (lo que más gustó, lo que menos, sugerencias de mejora e ideas para próximos diplomados), con buscador.
- Filtros por país, perfil profesional y experiencia previa, que se aplican también a las exportaciones.
- **Exportar:** datos en CSV (separador `;`, compatible con Excel en español), un Excel con las hojas Resumen, Autopercepción, Ítems, Satisfacción, Comentarios, Datos y Diccionario, e informe en PDF desde el diálogo de impresión.

La contraseña se guarda solo durante la sesión del navegador y se borra al cerrar la pestaña o al pulsar «Cerrar sesión».

## Protección de datos

- El cuestionario no recoge nombre, correo ni ningún identificador personal.
- Los datos se guardan únicamente en la hoja de Google del responsable del estudio.
- Contacto del estudio: secretariaejecutiva@riaces.org.
- Antes de lanzarlo hay que completar en `index.html` los datos entre corchetes: [entidad] (responsable del tratamiento) y [código] del comité de ética.

## Estructura

```
index.html              Cuestionario
panel.html              Panel de evaluadores
config.js               URL del servicio de datos
assets/base.css         Estilos con la identidad de RIACES
assets/items.js         Ítems del cuestionario (sin clave)
assets/meta.js          Sesión y nivel cognitivo de cada ítem (sin clave)
assets/logo-riaces.png  Logotipo de RIACES
assets/vendor/          SheetJS 0.18.5 (licencia Apache 2.0) para exportar a Excel
apps-script/Code.gs     Servicio de datos para Google Apps Script
```

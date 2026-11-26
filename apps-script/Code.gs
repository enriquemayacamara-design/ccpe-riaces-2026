/**
 * CCPE-RIACES 2026 · Cuestionario de Conocimientos y Competencia del Par Evaluador
 * Servicio de datos (API) en Google Apps Script para las páginas publicadas en GitHub Pages.
 * Diseño solo postest: una aplicación al final del diplomado.
 * Autor: Enrique Maya Cámara · La Clase de Kike (EMC)
 *
 * En el repositorio público este archivo NO contiene secretos. Hay dos formas de configurarlos,
 * siempre dentro de Apps Script (que es privado):
 *   a) Rellenar el bloque SECRETOS de abajo en el editor de Apps Script (nunca en GitHub), o
 *   b) Crear en Configuración del proyecto → Propiedades del script:
 *      CLAVE_RESPUESTAS  30 letras con la clave de la prueba, en orden C1…C30
 *      CLAVES_PANEL      «Nombre=contraseña; Otra persona=otra-contraseña»
 *      URL_ENCUESTA      (opcional) dirección del cuestionario en GitHub Pages
 * Si existen, las propiedades del script tienen prioridad sobre el bloque SECRETOS.
 *
 * Rutas:
 *   GET  ?accion=estado            → { abierto, criterio }
 *   POST {accion:'guardar', ...}   → guarda un cuestionario
 *   POST {accion:'datos', clave}   → devuelve los datos al panel (solo evaluadores)
 */

const CONFIG = {
  HOJA: 'Respuestas postest',
  ABIERTO: true,          // pon false para cerrar el cuestionario
  CRITERIO_MODULO: 7,     // aciertos mínimos (de 10) para alcanzar los objetivos de un módulo
};
// ===================== SECRETOS (rellenar solo en Apps Script, nunca en GitHub) =====================
const SECRETOS = {
  CLAVE_RESPUESTAS: '',   // 30 letras, C1…C30
  CLAVES_PANEL: {         // 'Nombre': 'contraseña' (mínimo 6 caracteres)
  },
  URL_ENCUESTA: '',
};
const A_ITEMS = ['A2','A3','A4','A5','A6','A7','A8','A9','A10','A11','A12','A13','A14','A15','A16','A17'];

// ===================== SECRETOS =====================
function props_() { return PropertiesService.getScriptProperties(); }
function urlEncuesta_() { return props_().getProperty('URL_ENCUESTA') || SECRETOS.URL_ENCUESTA || ''; }
function claveRespuestas_() {
  const k = String(props_().getProperty('CLAVE_RESPUESTAS') || SECRETOS.CLAVE_RESPUESTAS || '').toUpperCase().replace(/[^A-E]/g, '');
  if (k.length !== 30) throw new Error('Falta configurar la clave de respuestas (30 letras).');
  return k.split('');
}
function evaluadores_() {
  const lista = props_().getProperty('CLAVES_PANEL');
  if (lista) {
    const o = {};
    lista.split(';').forEach(par => { const i = par.lastIndexOf('='); if (i > 0) o[par.slice(0, i).trim()] = par.slice(i + 1).trim(); });
    return o;
  }
  return SECRETOS.CLAVES_PANEL || {};
}
function evaluador_(clave) {
  const c = String(clave || '');
  if (c.length < 6) return null;
  const ev = evaluadores_();
  for (const nombre in ev) { if (String(ev[nombre]) === c) return nombre; }
  return null;
}

// ===================== RUTAS =====================
function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.accion === 'estado') return json_({ ok: true, abierto: CONFIG.ABIERTO, criterio: CONFIG.CRITERIO_MODULO });
  // Cualquier otra visita: enlace al cuestionario publicado (mantiene válidos los enlaces antiguos)
  const url = urlEncuesta_();
  const html = url
    ? '<p style="font-family:sans-serif;padding:24px">El cuestionario está en <a target="_top" href="' + url + '">' + url + '</a></p>'
    : '<p style="font-family:sans-serif;padding:24px">Servicio de datos del cuestionario CCPE-RIACES 2026.</p>';
  return HtmlService.createHtmlOutput(html).setTitle('CCPE-RIACES 2026');
}

function doPost(e) {
  try {
    const r = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (r.accion === 'guardar') return json_(guardar_(r));
    if (r.accion === 'datos') return json_(datos_(r.clave));
    throw new Error('Acción no válida.');
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message || err) });
  }
}
function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

// ===================== GUARDAR =====================
function guardar_(r) {
  if (!CONFIG.ABIERTO) throw new Error('El cuestionario está cerrado.');
  if (!r.consentimiento) throw new Error('Falta el consentimiento.');
  const CLAVE = claveRespuestas_();
  const A = r.A || {}, B = r.B || {}, C = r.C || {};
  const antes = [], ahora = [];
  for (let i = 1; i <= 18; i++) {
    const b = B['B' + i] || {};
    const x = Number(b.antes), y = Number(b.ahora);
    if (!(x >= 1 && x <= 5) || !(y >= 1 && y <= 5)) throw new Error('Falta responder B' + i + ' (antes y ahora).');
    antes.push(x); ahora.push(y);
  }
  for (let i = 1; i <= 30; i++) { if (!/^[A-E]$/.test(C['C' + i] || '')) throw new Error('Falta responder C' + i + '.'); }

  const sum = a => a.reduce((s, x) => s + x, 0);
  const ok = CLAVE.map((k, i) => (C['C' + (i + 1)] === k ? 1 : 0));
  const cm = [0, 1, 2].map(m => sum(ok.slice(m * 10, m * 10 + 10)));
  const logro = cm.map(c => (c >= CONFIG.CRITERIO_MODULO ? 1 : 0));
  const mm = (v, m) => sum(v.slice(m * 6, m * 6 + 6)) / 6;
  const noLoSe = Object.keys(C).filter(k => C[k] === 'E').length;

  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const hoja = hoja_();
    const id = Utilities.getUuid();
    const fila = [new Date(), id, Math.round(Number(r.duracion) || 0)];
    A_ITEMS.forEach(a => { const v = A[a]; fila.push(Array.isArray(v) ? v.join('; ') : (v == null ? '' : String(v).slice(0, 120))); });
    antes.forEach(v => fila.push(v));
    ahora.forEach(v => fila.push(v));
    for (let i = 1; i <= 30; i++) fila.push(C['C' + i]);
    ok.forEach(v => fila.push(v));
    fila.push(sum(ok), cm[0], cm[1], cm[2], logro[0], logro[1], logro[2], (logro[0] && logro[1] && logro[2]) ? 1 : 0, noLoSe,
              sum(antes) / 18, sum(ahora) / 18, mm(antes, 0), mm(antes, 1), mm(antes, 2), mm(ahora, 0), mm(ahora, 1), mm(ahora, 2),
              String(r.orden || '').slice(0, 200));
    hoja.appendRow(fila);
    return { ok: true, id: id };
  } finally {
    lock.releaseLock();
  }
}

// ===================== PANEL =====================
function datos_(clave) {
  const quien = evaluador_(clave);
  if (!quien) { Utilities.sleep(1500); throw new Error('Contraseña no válida.'); }
  const v = hoja_().getDataRange().getValues();
  const h = v.shift();
  return {
    ok: true,
    evaluador: quien,
    criterio: CONFIG.CRITERIO_MODULO,
    cabeceras: h,
    filas: v.map(f => f.map(x => (x instanceof Date ? x.toISOString() : x))),
    hoja: SpreadsheetApp.getActiveSpreadsheet().getUrl(),
  };
}

// ===================== HOJA =====================
function cabeceras_() {
  const h = ['marca_temporal','id_respuesta','duracion_seg'];
  A_ITEMS.forEach(a => h.push(a));
  for (let i = 1; i <= 18; i++) h.push('B' + i + '_antes');
  for (let i = 1; i <= 18; i++) h.push('B' + i + '_ahora');
  for (let i = 1; i <= 30; i++) h.push('C' + i);
  for (let i = 1; i <= 30; i++) h.push('C' + i + '_ok');
  h.push('C_total','C_M1','C_M2','C_M3','logro_M1','logro_M2','logro_M3','logro_global','C_no_lo_se',
         'B_antes_media','B_ahora_media','B_antes_M1','B_antes_M2','B_antes_M3','B_ahora_M1','B_ahora_M2','B_ahora_M3','orden_C');
  return h;
}
function hoja_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let h = ss.getSheetByName(CONFIG.HOJA);
  if (!h) {
    h = ss.insertSheet(CONFIG.HOJA);
    const c = cabeceras_();
    h.getRange(1, 1, 1, c.length).setValues([c]).setFontWeight('bold').setBackground('#000000').setFontColor('#FFFFFF');
    h.setFrozenRows(1);
  }
  return h;
}

/** Ejecuta esta función una vez desde el editor: crea la pestaña y comprueba la configuración. */
function configurar() {
  hoja_();
  const k = claveRespuestas_();
  const n = Object.keys(evaluadores_()).length;
  SpreadsheetApp.getActiveSpreadsheet().toast('Pestaña lista · clave de 30 ítems · ' + n + ' evaluador(es) con acceso al panel.', 'CCPE-RIACES', 8);
  return { items: k.length, evaluadores: n };
}

/**
 * Biblioteca CEBI · Base de datos compartida en Google Sheets
 * 1. Crea una Hoja de cálculo de Google vacía (ej.: "Biblioteca CEBI · Datos").
 * 2. Extensiones › Apps Script. Borra lo que haya y pega este archivo.
 * 3. Cambia CLAVE por una palabra secreta (la misma que pondrás en js/config.js).
 * 4. Implementar › Nueva implementación › Tipo: Aplicación web.
 *    Ejecutar como: Yo · Quién tiene acceso: Cualquier usuario.
 * 5. Copia la URL que termina en /exec y pégala en js/config.js (SHEETS_URL).
 */
const CLAVE = 'cambia-esta-clave';
const COLECCIONES = ['loans', 'status', 'added', 'log', 'meta'];

function hoja_(nombre) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(nombre);
  if (!sh) { sh = ss.insertSheet(nombre); sh.appendRow(['id', 'json', 'actualizado']); sh.setFrozenRows(1); }
  return sh;
}
function salida_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
function doGet(e) {
  if ((e.parameter.key || '') !== CLAVE) return salida_({ error: 'Clave incorrecta' });
  const out = {};
  COLECCIONES.forEach(c => {
    const values = hoja_(c).getDataRange().getValues();
    const m = {};
    for (let i = 1; i < values.length; i++) {
      if (!values[i][0]) continue;
      try { m[values[i][0]] = JSON.parse(values[i][1]); } catch (err) {}
    }
    out[c] = m;
  });
  return salida_(out);
}
function doPost(e) {
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const b = JSON.parse(e.postData.contents);
    if ((b.key || '') !== CLAVE) return salida_({ error: 'Clave incorrecta' });
    if (COLECCIONES.indexOf(b.coll) < 0) return salida_({ error: 'Colección no válida' });
    const sh = hoja_(b.coll);
    const ids = sh.getRange(1, 1, sh.getLastRow(), 1).getValues().map(r => String(r[0]));
    const fila = ids.indexOf(String(b.id)) + 1;
    if (b.action === 'set') {
      const row = [b.id, JSON.stringify(b.data), new Date()];
      if (fila > 0) sh.getRange(fila, 1, 1, 3).setValues([row]); else sh.appendRow(row);
    } else if (b.action === 'del' && fila > 0) {
      sh.deleteRow(fila);
    }
    return salida_({ ok: true });
  } finally { lock.releaseLock(); }
}

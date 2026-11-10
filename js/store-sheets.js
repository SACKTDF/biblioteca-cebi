/* Google Sheets backend (Apps Script web app). Shared data across library computers.
   Collections: loans, status, added, log, meta. Each doc is one row: id | json | updated. */
window.SheetsStore = {
  url: '', key: '', timer: null, last: 0,
  async init(store) {
    const C = window.CEBI_CONFIG || {};
    this.url = C.SHEETS_URL; this.key = C.SHEETS_KEY || '';
    store.mode = 'sheets';
    try { await this.pull(); } catch (e) {
      console.warn('Sheets init', e);
      store.mode = 'local';
      const L = lsGet('cebi-lib-v1', {}); for (const c in S) S[c] = L[c] || {};
      toast('No se pudo conectar con Google Sheets; uso modo local.', true);
      onData(); return;
    }
    this.timer = setInterval(() => this.pull().catch(() => {}), 30000);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) this.pull().catch(() => {}); });
  },
  async pull() {
    const r = await fetch(`${this.url}?action=all&key=${encodeURIComponent(this.key)}&t=${Date.now()}`);
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const j = await r.json();
    if (j.error) throw new Error(j.error);
    for (const c of ['loans', 'status', 'added', 'log', 'meta']) S[c] = j[c] || {};
    lsSet('cebi-lib-v1', S); this.last = Date.now(); onData(); setSync();
  },
  async send(body) {
    // text/plain avoids a CORS preflight that Apps Script cannot answer
    const r = await fetch(this.url, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ ...body, key: this.key }) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok || j.error) throw new Error(j.error || ('HTTP ' + r.status));
    return j;
  },
  async set(coll, id, data) {
    S[coll][id] = data; lsSet('cebi-lib-v1', S); onData();
    try { await this.send({ action: 'set', coll, id, data }); return true; }
    catch (e) { toast('No se guardó en Google Sheets: ' + e.message + '. Quedó guardado en este navegador.', true); return true; }
  },
  async del(coll, id) {
    delete S[coll][id]; lsSet('cebi-lib-v1', S); onData();
    try { await this.send({ action: 'del', coll, id }); } catch (e) { toast('No se borró en Google Sheets.', true); }
    return true;
  }
};

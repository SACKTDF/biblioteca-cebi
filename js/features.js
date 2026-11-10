"use strict";
/* =========================================================
   Biblioteca CEBI · features: covers, game, omnibox, Draco,
   accessibility (NEE), printable reports, web discovery, tools
   ========================================================= */
const CFG = window.CEBI_CONFIG || {};

/* ---------------- files ---------------- */
async function saveFile(filename, data, mime) {
  let dl = null;
  try { if (window.claude && window.claude.use) dl = await window.claude.use('downloads'); } catch (e) {}
  if (dl) { try { await dl.save({ filename, data }); return true; } catch (e) { return false; } }
  try {
    const blob = new Blob([data], { type: mime || 'text/plain;charset=utf-8' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename;
    document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
    return true;
  } catch (e) { toast('No se pudo descargar el archivo.', true); return false; }
}
window.exportCsv = async function (kind) {
  let rows, name;
  if (kind === 'inv') { rows = [['Código', 'Título', 'Autor', 'Editorial', 'Año', 'ISBN', 'Idioma', 'Páginas', 'Tema', 'Colección', 'Ubicación', 'Ejemplares', 'Prestados', 'Estado físico', 'Funcionamiento', 'Observaciones']].concat(ALL.map(b => { const a = avail(b); return [b.id, b.t, b.a, b.e, b.y, b.i, b.l, b.p, b.ar, b.c, b.u, b.q, a.out, estadoOf(b), FN_LBL[a.f], [b.o, S.status[b.id] && S.status[b.id].note].filter(Boolean).join(' · ')]; })); name = 'inventario-biblioteca-cebi'; }
  else if (kind === 'loans') { rows = [['Código', 'Libro', 'Prestatario', 'Tipo', 'Curso', 'Salida', 'Devolver hasta', 'Devuelto', 'Estado al volver', 'Registrado por']].concat(Object.values(S.loans).sort((a, b) => b.out - a.out).map(l => [l.bookId, l.title, l.name, l.type, l.course, isoDate(l.out), isoDate(l.due), l.ret ? isoDate(l.ret) : '', l.condIn || '', l.by || ''])); name = 'prestamos-biblioteca-cebi'; }
  else if (kind === 'web') { const M = metaAll(); rows = [['Código', 'Título', 'ISBN-13', 'Portada', 'Temas (Open Library)', 'Primera edición', 'Páginas (Open Library)', 'Ficha']].concat(ALL.filter(b => M[b.id]).map(b => { const m = M[b.id]; return [b.id, b.t, isbn13(b.i), m.cv ? `https://covers.openlibrary.org/b/id/${m.cv}-M.jpg` : '', (m.sj || []).join(' | '), m.fy || '', m.np || '', m.k ? 'https://openlibrary.org' + m.k : '']; })); name = 'datos-web-libros-cebi'; }
  else { rows = [['Fecha', 'Tipo', 'Código', 'Libro', 'Detalle', 'Por']].concat(Object.values(S.log).sort((a, b) => b.ts - a.ts).map(m => [new Date(m.ts).toLocaleString('es-EC'), m.type, m.bookId, m.title, m.detail, m.by])); name = 'movimientos-biblioteca-cebi'; }
  if (await saveFile(`${name}-${isoDate(Date.now())}.csv`, csv(rows), 'text/csv;charset=utf-8')) toast('Archivo descargado. Ábrelo con Excel (separador ;).');
};

/* ---------------- ISBN & covers ---------------- */
function isbn13(s) {
  const d = String(s || '').replace(/[^0-9Xx]/g, '');
  const ck = c => (10 - [...c].reduce((t, x, i) => t + (+x) * (i % 2 ? 3 : 1), 0) % 10) % 10;
  if (d.length === 13 && /^\d+$/.test(d)) return ck(d.slice(0, 12)) === +d[12] ? d : '';
  if (d.length === 10) {
    let s10 = 0; for (let i = 0; i < 10; i++) { const x = d[i]; s10 += (10 - i) * (/[xX]/.test(x) ? 10 : +x); }
    if (s10 % 11) return ''; const core = '978' + d.slice(0, 9); return core + ck(core);
  }
  return '';
}
let META = lsGet('cebi-meta', {});
function metaAll() { return META; }
let NOCOVER = new Set(lsGet('cebi-nocover', []));
function markNoCover(key) { NOCOVER.add(key); if (NOCOVER.size % 10 === 0) lsSet('cebi-nocover', [...NOCOVER]); }
window.addEventListener('beforeunload', () => lsSet('cebi-nocover', [...NOCOVER]));
function coverSrc(b, size) {
  const st = S.status[b.id];
  if (st && st.cover) return st.cover;
  if (CFG.portadasWeb === false) return '';
  const m = META[b.id];
  if (m && m.cv) return `https://covers.openlibrary.org/b/id/${m.cv}-${size || 'M'}.jpg`;
  if (m && m.none) return '';
  const i = isbn13(b.i);
  if (!i || NOCOVER.has(i)) return '';
  return `https://covers.openlibrary.org/b/isbn/${i}-${size || 'M'}.jpg?default=false`;
}
function genCover(b) {
  return `<div class="gcv" style="--c:${b.col}"><b>${esc(b.t)}</b><img src="img/cebi-shield.png" alt=""><span>${esc(b.a || '')}</span></div>`;
}
function coverHTML(b, size) {
  const src = coverSrc(b, size);
  const key = isbn13(b.i);
  return genCover(b) + (src ? `<img src="${esc(src)}" alt="Portada de ${esc(b.t)}" loading="lazy" decoding="async" referrerpolicy="no-referrer" onerror="coverFail(this,'${key}')" onload="coverOk(this,'${key}')">` : '');
}
window.coverFail = (img, key) => { if (key) markNoCover(key); img.remove(); };
window.coverOk = (img, key) => { if (img.naturalWidth < 20) { if (key) markNoCover(key); img.remove(); } };

/* ---------------- overrides: cards ---------------- */
window.bookCard = function (b) {
  return `<article class="bk" data-id="${esc(b.id)}" tabindex="0"><div class="cover">${coverHTML(b, 'M')}${avBadge(b)}</div>
  <div class="bk-b"><h3>${esc(b.t)}</h3><p class="au">${esc(b.a || 'Autor no registrado')}${b.y ? ' · ' + b.y : ''}</p>
  <span class="loc">${ico('pin')}${esc(b.u || SHELF_BY[b.sh].n)}</span></div></article>`;
};
window.hitRow = function (b) {
  const sh = SHELF_BY[b.sh];
  return `<div class="hit" data-id="${esc(b.id)}" style="--c:${b.col}"><div class="mini">${coverHTML(b, 'S')}</div><div style="min-width:0"><b>${esc(b.t)}</b><span class="note" style="margin:0">${esc(b.a || '')}${b.y ? ' · ' + b.y : ''} · ${esc(b.c)}</span>
  <div class="r2">${avBadge(b)}<span class="loc">${ico('pin')}${esc(b.u || sh.n)}</span><button class="btn sec sm" data-map="${esc(b.id)}">${ico('map')}Ir al estante</button></div></div></div>`;
};

/* ---------------- book modal ---------------- */
window.openBook = function (id, refresh) {
  const b = BYID[id]; if (!b) return; modalBook = id;
  const a = avail(b), lib = document.body.classList.contains('librarian'), st = S.status[b.id] || {}, sh = SHELF_BY[b.sh];
  const hist = Object.values(S.loans).filter(l => l.bookId === b.id).sort((x, y) => y.out - x.out);
  const m = META[b.id];
  const isbn = isbn13(b.i);
  const html = `<button class="x" data-close aria-label="Cerrar">${ico('x')}</button><div class="bm">
  <div class="bm-l"><div class="book3d"><div class="bi"><div class="bk2"></div><div class="pg"></div><div class="cv">${coverHTML(b, 'L')}</div></div></div>
   <div style="text-align:center">${avBadge(b, true)}<p class="note">${a.out ? `${a.out} prestado${a.out > 1 ? 's' : ''} · ` : ''}${a.total} ejemplar${a.total > 1 ? 'es' : ''}</p></div>
   <button class="btn sec sm" id="bmSpeak">${ico('speaker')}Escuchar la ficha</button>
   <div style="text-align:center"><div class="note" style="margin:0 0 3px">Código</div><b style="font-family:var(--display);letter-spacing:.08em">${esc(b.id)}</b></div></div>
  <div class="bm-r"><h3>${esc(b.t)}</h3><p class="au">${esc(b.a || 'Autor no registrado')}</p>
   <div class="chips">${b.ar ? `<span class="tag">${esc(b.ar)}</span>` : ''}${b.tt ? `<span class="tag" style="color:var(--emerald-l)">PEP · ${esc(b.tt)}</span>` : ''}<span class="tag w">${esc(b.c)}</span><span class="fn ${a.f}">${FN_LBL[a.f]}</span></div>
   <div class="locard">${ico('pin', 'pin')}<div><span>Lo encuentras en</span><b>${esc(b.u || sh.n)}</b><span>${esc(sh.n)} · ${esc(sh.d)}</span></div><button class="btn gold sm" id="bmMap">${ico('map')}Ir al estante</button></div>
   <dl class="dl">${[['Editorial', b.e], ['Año', b.y], ['Idioma', b.l], ['Páginas', b.p], ['ISBN', b.i], ['Estado físico', estadoOf(b)], ['Ejemplares', b.q]].filter(x => x[1]).map(x => `<div><dt>${x[0]}</dt><dd>${esc(x[1])}</dd></div>`).join('')}</dl>
   ${(b.o || st.note) ? `<div class="boxline"><h5>Observaciones</h5><div style="font-size:14px">${esc([b.o, st.note ? 'Última revisión: ' + st.note : ''].filter(Boolean).join(' · '))}</div></div>` : ''}
   ${m && (m.sj || m.fy) ? `<div class="boxline webinfo"><h5>Datos de la web (Open Library)</h5>${m.fy ? `<div style="font-size:14px">Primera edición: <b>${m.fy}</b>${m.np ? ` · ${m.np} páginas` : ''}</div>` : ''}${m.sj && m.sj.length ? `<div class="chips">${m.sj.slice(0, 8).map(s => `<span class="tag">${esc(s)}</span>`).join('')}</div>` : ''}${m.k ? `<a class="note" href="https://openlibrary.org${esc(m.k)}" target="_blank" rel="noopener">Ver ficha completa en Open Library</a>` : ''}</div>` : ''}
   ${lib ? `<div class="acts"><button class="btn pri sm" id="bmLend" ${a.st !== 'yes' ? 'disabled' : ''}>${ico('out')}Prestar</button>
     ${a.out ? `<button class="btn sec sm" id="bmRet">${ico('inb')}Registrar devolución</button>` : ''}
     <button class="btn sec sm" id="bmState">${ico('wrench')}Revisar estado</button><button class="btn sec sm" id="bmCover">${ico('image')}Cambiar portada</button></div>` : ''}
   ${lib && hist.length ? `<div class="boxline"><h5>Historial de préstamos (${hist.length})</h5><div class="hist">${hist.map(l => `<div><span>${esc(l.name)} · ${esc(l.course || l.type || '')}</span><span>${fmtD(l.out)} → ${l.ret ? fmtD(l.ret) : `<b class="${l.due < Date.now() ? 'due-late' : ''}">pendiente</b>`}</span></div>`).join('')}</div></div>` : ''}
   <div class="boxline"><h5>Cita APA 7</h5><div class="cite" id="apaTxt">${apa(b)}</div><button class="btn sec sm" id="bmCopy" style="margin-top:10px">${ico('copy')}Copiar cita</button></div>
   <div class="boxline"><h5>Encuéntralo también en la web abierta</h5><div class="chips">
     ${isbn ? `<a class="chip" href="https://openlibrary.org/isbn/${isbn}" target="_blank" rel="noopener">Open Library ${ico('ext')}</a>` : `<a class="chip" href="${esc(REPO_BY.openlibrary.u(b.t))}" target="_blank" rel="noopener">Open Library ${ico('ext')}</a>`}
     <a class="chip" href="https://www.google.com/search?tbm=bks&q=${encodeURIComponent(isbn ? 'isbn:' + isbn : b.t + ' ' + (b.a || ''))}" target="_blank" rel="noopener">Google Libros ${ico('ext')}</a>
     <a class="chip" href="${esc(REPO_BY.archive.u(b.t))}" target="_blank" rel="noopener">Internet Archive ${ico('ext')}</a>
     <a class="chip" href="${esc(REPO_BY.scholar.u(b.t + (b.a ? ' ' + b.a : '')))}" target="_blank" rel="noopener">Google Académico ${ico('ext')}</a></div></div>
  </div></div>`;
  $('#modalBox').className = 'box'; $('#modalBox').innerHTML = html; modalBook = id;
  if (!refresh) { $('#modal').classList.add('on'); GAME.do('book'); }
  $('#bmMap').onclick = () => { closeModal(); focusShelf(b.sh, b.row, b); };
  $('#bmCopy').onclick = async () => { try { await navigator.clipboard.writeText($('#apaTxt').innerText); toast('Cita copiada'); } catch (e) { toast('No se pudo copiar; selecciónala manualmente.', true); } };
  $('#bmSpeak').onclick = () => speak(`${b.t}. ${b.a ? 'De ' + b.a + '.' : ''} ${a.st === 'yes' ? 'Está disponible' : a.st === 'no' ? 'Ahora está prestado' : 'Está fuera de servicio'}. Lo encuentras en ${b.u || sh.n}.`, true);
  const L = $('#bmLend'); if (L) L.onclick = () => { closeModal(); go('prestamos'); pickBook(b.id); };
  const R = $('#bmRet'); if (R) R.onclick = () => { const ls = ACTIVE[b.id] || []; if (ls.length === 1) returnDialog(ls[0]); else { closeModal(); go('prestamos'); $('#loanQ').value = b.t; renderLoans(); } };
  const Sb = $('#bmState'); if (Sb) Sb.onclick = () => stateDialog(b);
  const Cv = $('#bmCover'); if (Cv) Cv.onclick = () => coverDialog(b);
  if (!refresh && A11Y.speak) speak(`${b.t}. ${a.st === 'yes' ? 'Disponible' : 'No disponible'}. ${b.u || sh.n}.`);
  if (!refresh && window.W3 && W3.lookAtShelf) W3.lookAtShelf(b.sh);
};
function coverDialog(b) {
  const st = S.status[b.id] || {};
  openDialog(`<div class="pad"><div class="sec-h">${ico('image')}Portada de «${esc(b.t)}»</div>
  <label class="f" for="cvUrl">Dirección (URL) de una imagen de la portada</label><input class="inp" id="cvUrl" value="${esc(st.cover || '')}" placeholder="https://…/portada.jpg">
  <p class="note">Consejo: busca el libro en Google Imágenes o en la web de la editorial, clic derecho sobre la portada › «Copiar dirección de la imagen» y pégala aquí. Déjalo vacío para usar la portada automática.</p>
  <div class="acts" style="justify-content:flex-end"><button class="btn sec" data-close>Cancelar</button><button class="btn pri" id="cvOk">${ico('check')}Guardar</button></div></div>`);
  $('#cvOk').onclick = async () => { const u = $('#cvUrl').value.trim(); if (u && !/^https:\/\//i.test(u)) { toast('La dirección debe empezar con https://', true); return; }
    const prev = S.status[b.id] || {}; const doc = { ...prev, cover: u, ts: Date.now(), by: librarian() }; if (!u) delete doc.cover;
    if (await Store.set('status', b.id, doc)) { toast('Portada actualizada'); openBook(b.id); } };
}

/* ---------------- game: XP, levels, badges, quests ---------------- */
const LEVELS = [[0, 'Aprendiz'], [10, 'Explorador'], [25, 'Lector curioso'], [50, 'Sabio'], [100, 'Guardián del saber']];
const QUESTS = [['search', 'Busca un libro en la barra de arriba'], ['shelf', 'Toca un estante del mundo 3D'], ['draco', 'Haz clic en Draco para oír un dato curioso'], ['book', 'Abre la ficha de un libro'], ['web', 'Investiga un tema en el Descubridor']];
const BADGES = { shelves5: ['Explorador de estantes', 'Visitaste 5 estantes distintos'], facts5: ['Amigo de Draco', 'Escuchaste 5 datos curiosos'], books10: ['Ratón de biblioteca', 'Abriste 10 fichas de libros'], web3: ['Investigador', 'Hiciste 3 búsquedas en el Descubridor'], quests: ['Misión cumplida', 'Completaste todas las misiones'] };
const GAME = {
  st: lsGet('cebi-game', { xp: 0, q: {}, shelves: [], facts: 0, books: 0, web: 0, badges: [] }),
  save() { lsSet('cebi-game', this.st); this.render(); },
  level() { let l = LEVELS[0]; for (const x of LEVELS) if (this.st.xp >= x[0]) l = x; const i = LEVELS.indexOf(l), nx = LEVELS[i + 1]; return { name: l[1], pct: nx ? (this.st.xp - l[0]) / (nx[0] - l[0]) : 1 }; },
  add(n) { const before = this.level().name; this.st.xp += n; const after = this.level().name; $('#xp').classList.remove('pop'); void $('#xp').offsetWidth; $('#xp').classList.add('pop'); if (after !== before) badgeToast('¡Subiste de nivel!', after); },
  badge(k) { if (this.st.badges.includes(k)) return; this.st.badges.push(k); badgeToast(BADGES[k][0], BADGES[k][1]); this.add(5); },
  do(k, extra) {
    const s = this.st; let gain = 1;
    if (k === 'shelf' && extra && !s.shelves.includes(extra)) { s.shelves.push(extra); gain = 2; if (s.shelves.length >= 5) this.badge('shelves5'); }
    if (k === 'draco') { s.facts++; if (s.facts >= 5) this.badge('facts5'); }
    if (k === 'book') { s.books++; if (s.books >= 10) this.badge('books10'); }
    if (k === 'web') { s.web++; if (s.web >= 3) this.badge('web3'); }
    if (QUESTS.some(q => q[0] === k) && !s.q[k]) { s.q[k] = 1; gain += 2; if (QUESTS.every(q => s.q[q[0]])) this.badge('quests'); }
    this.add(gain); this.save();
  },
  render() {
    const l = this.level(); $('#xpN').textContent = this.st.xp; $('#xpLv').textContent = l.name; $('#xpBar').style.width = Math.round(l.pct * 100) + '%';
    const done = QUESTS.filter(q => this.st.q[q[0]]).length; $('#questN').textContent = `${done}/${QUESTS.length}`;
    $('#questList').innerHTML = QUESTS.map(q => `<li class="${this.st.q[q[0]] ? 'done' : ''}"><i></i>${esc(q[1])}</li>`).join('');
  }
};
function badgeToast(title, sub) {
  const t = document.createElement('div'); t.className = 'toast badge'; t.innerHTML = `${ico('trophy')}<div><b>${esc(title)}</b><br><span style="font-weight:600;color:var(--ink-2)">${esc(sub)}</span></div>`;
  $('#toasts').appendChild(t); setTimeout(() => t.remove(), 4200); SFX.chime();
}

/* ---------------- home ---------------- */
window.renderHome = function () {
  const titles = ALL.length, copies = ALL.reduce((s, b) => s + (b.q || 1), 0), out = Object.values(S.loans).filter(l => !l.ret).length;
  $('#homeStats').innerHTML = [[nf(titles), 'títulos'], [nf(copies), 'ejemplares'], [SHELVES.length, 'estantes'], [nf(out), 'prestados ahora']].map(([v, l]) => `<div><b>${v}</b><span>${l}</span></div>`).join('');
  GAME.render();
};

/* ---------------- sync label ---------------- */
const _setSync = window.setSync;
window.setSync = function (w) {
  if (Store.mode === 'sheets') { const el = $('#sync'); el.className = 'sync ok'; el.querySelector('span').textContent = 'Google Sheets'; el.title = 'Los datos se comparten entre los computadores de la biblioteca mediante Google Sheets.'; ['#roBanner1', '#roBanner2'].forEach(s => $(s).classList.remove('on')); return; }
  _setSync(w);
  if (Store.mode === 'local') { const msg = '<b>Modo local:</b> los préstamos se guardan en este navegador. Para compartirlos entre computadores, conecta Google Sheets (ver README) y haz respaldos desde Herramientas.'; ['#roBanner1', '#roBanner2'].forEach(s => { $(s).innerHTML = msg; }); }
};

/* ---------------- omnibox ---------------- */
let omIdx = -1, omRes = [];
function omniDraw() {
  const q = $('#omniQ').value.trim(), dd = $('#omniDD');
  if (!q) { dd.classList.remove('on'); $('#omniQ').setAttribute('aria-expanded', 'false'); return; }
  omRes = search(q).slice(0, 6); omIdx = -1;
  dd.innerHTML = (omRes.length ? omRes.map((b, i) => `<button type="button" class="oi" role="option" data-oi="${i}"><span class="cv" style="position:relative;border-radius:3px;overflow:hidden">${coverHTML(b, 'S')}</span><span class="mid"><b>${esc(b.t)}</b><small>${esc(b.a || '')} · ${esc(b.u || SHELF_BY[b.sh].n)}</small></span>${avBadge(b)}</button>`).join('')
    : `<div class="oi" style="cursor:default"><span class="mid"><b>No está en nuestra biblioteca</b><small>Pulsa Enter para buscarlo en repositorios abiertos</small></span></div>`)
    + `<div class="all" data-oall>${omRes.length ? 'Ver todos los resultados en el catálogo' : 'Buscar en el Descubridor'}<span>${ico('ext')}</span></div>`;
  dd.classList.add('on'); $('#omniQ').setAttribute('aria-expanded', 'true');
}
let omT; $('#omniQ').addEventListener('input', () => { clearTimeout(omT); omT = setTimeout(omniDraw, 90); });
$('#omniQ').addEventListener('focus', () => { if ($('#omniQ').value.trim()) omniDraw(); });
$('#omniQ').addEventListener('keydown', e => {
  const items = $$('#omniDD [data-oi]');
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); if (!items.length) return; omIdx = (omIdx + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length; items.forEach((x, i) => x.classList.toggle('hl', i === omIdx)); }
  if (e.key === 'Escape') { $('#omniDD').classList.remove('on'); $('#omniQ').blur(); }
});
$('#omni').addEventListener('submit', e => { e.preventDefault(); const q = $('#omniQ').value.trim(); if (!q) return;
  if (omIdx >= 0 && omRes[omIdx]) { openBook(omRes[omIdx].id); } else omniAll(q); $('#omniDD').classList.remove('on'); GAME.do('search'); });
function omniAll(q) {
  const res = search(q);
  if (res.length) { ['#fC', '#fA', '#fL', '#fU', '#fD', '#fF'].forEach(s => $(s).value = ''); $('#catQ').value = q; go('catalogo'); renderCatalog();
    const yes = res.find(b => avail(b).st === 'yes'); if (yes) dracoSay(`¡Encontré ${nf(res.length)} libro${res.length > 1 ? 's' : ''}! «${yes.t}» te espera en ${yes.u || SHELF_BY[yes.sh].n}.`, 'Buscador', 'happy', 5000); }
  else { $('#discQ').value = q; go('descubridor'); runDiscover(q); }
}
$('#omniDD').addEventListener('click', e => { const o = e.target.closest('[data-oi]'), a = e.target.closest('[data-oall]');
  if (o) { openBook(omRes[+o.dataset.oi].id); GAME.do('search'); } if (a) { omniAll($('#omniQ').value.trim()); GAME.do('search'); } $('#omniDD').classList.remove('on'); });
document.addEventListener('click', e => { if (!e.target.closest('#omni')) $('#omniDD').classList.remove('on'); });
document.addEventListener('keydown', e => {
  const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement && document.activeElement.tagName);
  if (e.key === '/' && !typing) { e.preventDefault(); $('#omniQ').focus(); return; }
  if (!typing && !e.ctrlKey && !e.metaKey && !e.altKey && /^[1-7]$/.test(e.key) && !$('#modal').classList.contains('on')) {
    const b = $$('#nav button').filter(x => getComputedStyle(x).display !== 'none')[+e.key - 1]; if (b) go(b.dataset.go);
  }
  if (e.key === 'Escape') { hideSpeech(); $('#a11yPanel').hidden = true; $('#a11yBtn').setAttribute('aria-expanded', 'false'); }
});

/* ---------------- Draco: facts & moods ---------------- */
const FACTS = [
 ['Matemáticas', 'En un grupo de solo 23 personas, la probabilidad de que dos cumplan años el mismo día ya supera el 50 %.'],
 ['Matemáticas', 'Euclides demostró hace más de 2.000 años que los números primos son infinitos.'],
 ['Matemáticas', 'La palabra «algoritmo» viene del nombre del matemático persa al-Juarismi, y «álgebra», del título de su libro al-jabr.'],
 ['Matemáticas', 'Si barajas bien 52 cartas, casi seguro creaste un orden que nunca ha existido: hay unos 8 × 10⁶⁷ órdenes posibles.'],
 ['Matemáticas', 'El matemático indio Brahmagupta escribió en el año 628 reglas para operar con el cero como número.'],
 ['Matemáticas', 'Las abejas usan hexágonos: es la forma regular que cubre una superficie con el menor perímetro posible.'],
 ['Física', 'La luz del Sol tarda unos 8 minutos y 20 segundos en llegar a la Tierra.'],
 ['Física', 'El sonido viaja unas cuatro veces más rápido en el agua que en el aire.'],
 ['Física', 'En el espacio, los astronautas pueden crecer unos centímetros porque su columna se estira sin la gravedad.'],
 ['Astronomía', 'Un día en Venus dura más que su año: tarda 243 días terrestres en girar sobre sí mismo y 225 en dar la vuelta al Sol.'],
 ['Astronomía', 'Una cucharadita de materia de una estrella de neutrones pesaría miles de millones de toneladas.'],
 ['Geografía', 'La cumbre del Chimborazo, en Ecuador, es el punto de la Tierra más alejado de su centro, gracias al abultamiento del ecuador.'],
 ['Geografía', 'Ecuador tiene cuatro regiones naturales: Costa, Sierra, Amazonía y las Islas Galápagos.'],
 ['Geografía', 'El Cotopaxi, con 5.897 metros, es uno de los volcanes activos más altos del mundo.'],
 ['Geografía', 'El río Amazonas lleva más agua hacia el mar que cualquier otro río del planeta.'],
 ['Química', 'El oro es tan maleable que con un solo gramo se puede hacer una lámina de casi un metro cuadrado.'],
 ['Química', 'El helio se descubrió primero en el Sol, en 1868, al estudiar su luz, antes de encontrarlo en la Tierra.'],
 ['Química', 'El hielo flota porque el agua sólida es menos densa que la líquida, algo poco común en la naturaleza.'],
 ['Química', 'Los copos de nieve casi siempre tienen seis brazos por la forma hexagonal en que se ordenan las moléculas de agua.'],
 ['Biología', 'El pulpo tiene tres corazones y sangre azul.'],
 ['Biología', 'Tu cerebro pesa cerca del 2 % de tu cuerpo, pero usa alrededor del 20 % de su energía.'],
 ['Biología', 'Si estiraras el ADN de una sola de tus células, mediría unos 2 metros.'],
 ['Biología', 'Los colibríes son de las pocas aves capaces de volar hacia atrás.'],
 ['Biología', 'Las tortugas gigantes de Galápagos pueden vivir más de 100 años.'],
 ['Biología', 'Charles Darwin visitó las Islas Galápagos en 1835; lo que vio allí le ayudó a desarrollar su teoría de la evolución.'],
 ['Historia', 'La Biblioteca de Alejandría, fundada hacia el siglo III a. C., quería reunir copias de todos los libros del mundo conocido.'],
 ['Historia', 'Antes de la imprenta de Gutenberg, hacia 1450, en Europa cada libro se copiaba a mano.'],
 ['Historia', 'Los incas guardaban información en quipus: cuerdas con nudos que representaban números.'],
 ['Historia', 'Ecuador debe su nombre a la línea ecuatorial; la Misión Geodésica Francesa midió aquí, desde 1736, la forma de la Tierra.'],
 ['Historia', 'El Bachillerato Internacional (IB) se fundó en Ginebra, Suiza, en 1968.'],
 ['Lengua', 'La palabra «biblioteca» viene del griego biblíon (libro) y théke (caja o depósito).'],
 ['Lengua', 'El español es la segunda lengua materna más hablada del mundo, después del chino mandarín.'],
 ['Lengua', 'La palabra «escuela» viene del griego scholé, que significaba «tiempo libre»: el que se dedicaba a aprender.'],
 ['Literatura', '«Don Quijote de la Mancha», publicado en 1605, se considera una de las primeras novelas modernas.'],
 ['Literatura', 'Gabriel García Márquez ganó el Premio Nobel de Literatura en 1982.'],
 ['Ambato', 'Ambato es la «Tierra de los Tres Juanes»: Juan Montalvo, Juan León Mera y Juan Benigno Vela.'],
 ['Ambato', 'Juan León Mera, nacido en Ambato, escribió la letra del Himno Nacional del Ecuador.'],
 ['Ambato', 'Juan Montalvo, uno de los grandes ensayistas de América, nació en Ambato en 1832.'],
 ['Ambato', 'La Fiesta de la Fruta y de las Flores de Ambato se celebra desde 1951.'],
 ['Arte', 'Oswaldo Guayasamín, pintor ecuatoriano, creó en Quito la Capilla del Hombre.'],
 ['Música', 'Beethoven compuso su Novena Sinfonía cuando ya estaba casi completamente sordo.'],
 ['Tecnología', 'Ada Lovelace escribió en 1843 lo que se considera el primer algoritmo pensado para una máquina.'],
 ['Tecnología', 'Un código QR puede leerse aunque falte hasta el 30 % de su imagen, gracias a la corrección de errores.'],
 ['Tecnología', 'El primer correo electrónico entre computadoras en red se envió en 1971.'],
 ['Deporte', 'Jefferson Pérez ganó en Atlanta 1996 la primera medalla olímpica de Ecuador: oro en marcha.'],
 ['Deporte', 'Richard Carapaz ganó el oro olímpico en ciclismo de ruta en los Juegos de Tokio 2020.'],
 ['Filosofía', 'Sócrates no dejó nada escrito: conocemos sus ideas gracias a Platón y otros discípulos.'],
 ['Bibliotecas', 'La Biblioteca del Congreso de Estados Unidos guarda más de 170 millones de documentos.'],
 ['IB', 'El perfil de la comunidad de aprendizaje del IB tiene diez atributos, como ser indagadores, pensadores y reflexivos.']
];
const ANGRY = [
 '¡Grrr! Llevo siglos cuidando estos libros y tú solo quieres hacerme cosquillas. ¿Buscamos un libro mejor?',
 'Si me vuelves a tocar, te dejo de tarea leer el diccionario completo… de la A a la Z.',
 'Los dragones también necesitamos silencio. Esto es una biblioteca, ¿recuerdas?',
 '¡Achís! Me haces estornudar fuego. Ve a buscar un libro antes de que se me queme el catálogo.',
 'Estaba contando mis escamas y me hiciste perder la cuenta. 3.482, 3.483… ¡ay! Busca un libro, por favor.',
 'Un dragón molesto es un dragón que quiere leer. Déjame en paz y busca tu propia aventura en los estantes.',
 'Los dragones dormimos 300 años seguidos. Yo solo te pido cinco minutos. Mientras tanto, usa el buscador.'
];
const DRACO = { clicks: [], sleepUntil: 0, deck: [], angryN: 0 };
function nextFact() { if (!DRACO.deck.length) DRACO.deck = FACTS.map((_, i) => i).sort(() => Math.random() - .5); return FACTS[DRACO.deck.pop()]; }
window.onDracoClick = function () {
  const now = Date.now();
  if (now < DRACO.sleepUntil) { dracoSay('Zzz… Draco está tomando una siesta. Usa el buscador de arriba mientras tanto.', 'Durmiendo', 'sleep', 4000, [['Buscar un libro', () => $('#omniQ').focus()]]); return 'sleep'; }
  DRACO.clicks = DRACO.clicks.filter(t => now - t < 20000); DRACO.clicks.push(now);
  if (DRACO.clicks.length >= 5) {
    DRACO.clicks = []; DRACO.angryN++;
    const line = ANGRY[(DRACO.angryN - 1) % ANGRY.length];
    dracoSay(line, '¡Molesto!', 'angry', 7000, [['Está bien, busco un libro', () => { hideSpeech(); $('#omniQ').focus(); }]]);
    SFX.growl(true);
    if (DRACO.angryN % 2 === 0) DRACO.sleepUntil = now + 20000;
    return 'angry';
  }
  const f = nextFact();
  dracoSay(f[1], f[0], DRACO.clicks.length >= 3 ? 'warn' : 'happy', 9000, [['Otro dato', () => window.onDracoClick()], ['Buscar sobre esto', () => { hideSpeech(); $('#discQ').value = f[0]; go('descubridor'); runDiscover(f[0]); }]]);
  SFX.growl(false); GAME.do('draco');
  return DRACO.clicks.length >= 3 ? 'warn' : 'happy';
};
let speechT = 0, speechOn = false;
function dracoSay(text, tag, mood, ms, actions) {
  const el = $('#bubble');
  $('#bubbleText').textContent = (mood === 'warn' ? '(Uf… ' + ['ya van varios toques', 'me estás despeinando las escamas', 'cuidado, que me enojo'][Math.floor(Math.random() * 3)] + ') ' : '') + text;
  $('#bubbleTag').textContent = tag || '';
  el.classList.toggle('angry', mood === 'angry');
  $('#bubbleAct').innerHTML = ''; (actions || []).forEach(([l, fn], i) => { const b = document.createElement('button'); b.textContent = l; if (i) b.className = 'alt'; b.onclick = e => { e.stopPropagation(); fn(); }; $('#bubbleAct').appendChild(b); });
  el.classList.add('on'); speechOn = true; positionSpeech();
  clearTimeout(speechT); speechT = setTimeout(hideSpeech, ms || 8000);
  if (A11Y.speak) speak(text);
  if (window.W3 && W3.dracoMood) W3.dracoMood(mood);
}
function hideSpeech() { $('#bubble').classList.remove('on'); speechOn = false; }
function positionSpeech() {
  if (!speechOn) return;
  const p = window.W3 && W3.dragonScreen ? W3.dragonScreen() : null, el = $('#bubble');
  let x = innerWidth / 2, y = innerHeight * .45;
  if (p && p.visible) { x = p.x; y = p.y; }
  x = Math.max(180, Math.min(innerWidth - 180, x)); y = Math.max(el.offsetHeight + 90, Math.min(innerHeight - 100, y));
  el.style.left = x + 'px'; el.style.top = y + 'px';
  requestAnimationFrame(positionSpeech);
}
window.dracoSay = dracoSay;

/* ---------------- 3D callbacks ---------------- */
window.onShelfClick = function (k) { GAME.do('shelf', k); focusShelf(k, 0); };
window.onBookSpineClick = function (id) { GAME.do('shelf'); openBook(id); };
window.onShieldClick = function () {
  openDialog(`<div class="pad" style="text-align:center"><img src="img/cebi-logo.png" alt="Unidad Educativa CEBI" style="width:min(320px,80%);background:#fff;border-radius:14px;padding:14px">
  <h3 style="font:700 24px var(--display);margin:16px 0 6px">Unidad Educativa CEBI</h3><p style="color:var(--ink-2);margin:0">Ambato, Ecuador · desde 1993 · Colegio del Mundo del IB</p>
  <div class="chips" style="justify-content:center;margin-top:16px"><img src="img/pyp-banner.png" alt="Programa de la Escuela Primaria" style="height:38px"><img src="img/myp-banner.png" alt="Programa de los Años Intermedios" style="height:38px"><img src="img/dp-banner.png" alt="Programa del Diploma" style="height:38px"></div></div>`);
};
const PROG = {
  pep: { n: 'Programa de la Escuela Primaria', img: 'img/pyp-ring.webp', col: ['PEP', 'Preescolar'], t: 'Cuentos, lecturas guiadas y libros organizados por los seis temas transdisciplinarios.' },
  pai: { n: 'Programa de los Años Intermedios', img: 'img/myp-ring.webp', col: ['PAI-PD'], t: 'Literatura, ciencias, matemáticas e individuos y sociedades para indagar con conceptos y contextos globales.' },
  pd: { n: 'Programa del Diploma', img: 'img/dp-ring.webp', col: ['PAI-PD'], t: 'Fuentes para la Monografía, Teoría del Conocimiento y las asignaturas, junto a repositorios científicos abiertos.' },
  perfil: { n: 'Perfil de la comunidad de aprendizaje', img: 'img/learner-profile.webp', t: 'Indagadores · Informados e instruidos · Pensadores · Buenos comunicadores · Íntegros · De mentalidad abierta · Solidarios · Audaces · Equilibrados · Reflexivos.' },
  ws: { n: 'Colegio del Mundo del IB', img: 'img/world-school.png', t: 'La Unidad Educativa CEBI forma parte de la comunidad mundial de colegios del Bachillerato Internacional.' },
  cont: { n: 'Continuo del IB', img: 'img/continuum.png', t: 'Del PEP al PAI y al Programa del Diploma: un camino de aprendizaje continuo.' },
  cebi: { n: 'Unidad Educativa CEBI', img: 'img/cebi-logo.png', t: 'Ambato, Ecuador · desde 1993.' }
};
window.onBannerClick = function (k) {
  const p = PROG[k]; if (!p) return;
  const n = p.col ? ALL.filter(b => p.col.includes(b.c)).length : 0;
  openDialog(`<div class="pad" style="text-align:center"><img src="${p.img}" alt="" style="width:min(260px,70%);${k === 'cebi' ? 'background:#fff;border-radius:12px;padding:10px' : ''}">
  <h3 style="font:700 22px var(--display);margin:14px 0 8px">${esc(p.n)}</h3><p style="color:var(--ink-2);margin:0 auto;max-width:420px">${esc(p.t)}</p>
  ${p.col ? `<button class="btn gold" style="margin-top:18px" id="progGo">${ico('books')}Explorar ${nf(n)} títulos</button>` : ''}</div>`);
  const g = $('#progGo'); if (g) g.onclick = () => { closeModal(); ['#fA', '#fL', '#fU', '#fD', '#fF'].forEach(s => $(s).value = ''); $('#fC').value = p.col[0]; $('#catQ').value = ''; go('catalogo'); renderCatalog(); };
};
window.onHover3D = function (info, x, y) {
  const t = $('#tip');
  if (!info) { t.classList.remove('on'); return; }
  t.innerHTML = info; t.classList.add('on');
  const w = t.offsetWidth, h = t.offsetHeight;
  t.style.left = Math.min(innerWidth - w - 10, x + 16) + 'px'; t.style.top = Math.min(innerHeight - h - 10, y + 18) + 'px';
};

/* ---------------- sound (Web Audio, synthesized) ---------------- */
const SFX = {
  on: lsGet('cebi-sound', false), ctx: null,
  ac() { if (!this.ctx) { try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; } } if (this.ctx.state === 'suspended') this.ctx.resume(); return this.ctx; },
  growl(angry) {
    if (!this.on || A11Y.calm) return; const c = this.ac(); if (!c) return; const t = c.currentTime, d = angry ? 1.1 : .7;
    const len = Math.floor(c.sampleRate * d), buf = c.createBuffer(1, len, c.sampleRate), ch = buf.getChannelData(0);
    for (let i = 0; i < len; i++) ch[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const n = c.createBufferSource(); n.buffer = buf;
    const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(angry ? 900 : 600, t); lp.frequency.exponentialRampToValueAtTime(120, t + d);
    const o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(angry ? 95 : 120, t); o.frequency.exponentialRampToValueAtTime(48, t + d);
    const og = c.createGain(); og.gain.value = .25;
    const g = c.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(angry ? .5 : .32, t + .08); g.gain.exponentialRampToValueAtTime(.001, t + d);
    n.connect(lp); o.connect(og); og.connect(lp); lp.connect(g); g.connect(c.destination); n.start(t); o.start(t); n.stop(t + d); o.stop(t + d);
  },
  chime() {
    if (!this.on) return; const c = this.ac(); if (!c) return; const t = c.currentTime;
    [659.3, 987.8, 1318.5].forEach((f, i) => { const o = c.createOscillator(), g = c.createGain(); o.type = 'sine'; o.frequency.value = f; g.gain.setValueAtTime(0, t + i * .09); g.gain.linearRampToValueAtTime(.12, t + i * .09 + .02); g.gain.exponentialRampToValueAtTime(.001, t + i * .09 + .5); o.connect(g); g.connect(c.destination); o.start(t + i * .09); o.stop(t + i * .09 + .55); });
  }
};
function renderSound() { const b = $('#soundBtn'); b.setAttribute('aria-pressed', SFX.on ? 'true' : 'false'); b.querySelector('svg').innerHTML = IC[SFX.on ? 'soundOn' : 'soundOff']; b.title = SFX.on ? 'Sonido activado' : 'Sonido apagado'; }
$('#soundBtn').addEventListener('click', () => { SFX.on = !SFX.on; lsSet('cebi-sound', SFX.on); renderSound(); if (SFX.on) SFX.chime(); });

/* ---------------- accessibility / NEE ---------------- */
const A11Y = Object.assign({ size: 1, font: false, space: false, contrast: false, ruler: false, calm: matchMedia('(prefers-reduced-motion: reduce)').matches, simple: false, speak: false, rate: .95, fx: innerWidth < 900 ? 'low' : 'high' }, lsGet('cebi-a11y', {}));
function applyA11y() {
  const b = document.body;
  document.documentElement.style.setProperty('--zoom', A11Y.size);
  b.classList.toggle('a-font', A11Y.font); b.classList.toggle('a-space', A11Y.space); b.classList.toggle('a-contrast', A11Y.contrast);
  b.classList.toggle('a-ruler', A11Y.ruler); b.classList.toggle('a-simple', A11Y.simple); b.classList.toggle('a-calm', A11Y.calm);
  $('#aFont').checked = A11Y.font; $('#aSpace').checked = A11Y.space; $('#aContrast').checked = A11Y.contrast; $('#aRuler').checked = A11Y.ruler;
  $('#aCalm').checked = A11Y.calm; $('#aSimple').checked = A11Y.simple; $('#aSpeak').checked = A11Y.speak; $('#aRate').value = A11Y.rate;
  $$('#aSize button').forEach(x => x.classList.toggle('on', +x.dataset.v === +A11Y.size));
  $$('#aFx button').forEach(x => x.classList.toggle('on', x.dataset.v === A11Y.fx));
  if (window.W3) { W3.setQuality && W3.setQuality(A11Y.fx); W3.setCalm && W3.setCalm(A11Y.calm); W3.pause && W3.pause(A11Y.simple); }
  lsSet('cebi-a11y', A11Y);
}
$('#a11yBtn').addEventListener('click', () => { const p = $('#a11yPanel'); p.hidden = !p.hidden; $('#a11yBtn').setAttribute('aria-expanded', String(!p.hidden)); if (!p.hidden) p.querySelector('button,input').focus(); });
$('#a11yClose').addEventListener('click', () => { $('#a11yPanel').hidden = true; $('#a11yBtn').setAttribute('aria-expanded', 'false'); $('#a11yBtn').focus(); });
[['#aFont', 'font'], ['#aSpace', 'space'], ['#aContrast', 'contrast'], ['#aRuler', 'ruler'], ['#aCalm', 'calm'], ['#aSimple', 'simple'], ['#aSpeak', 'speak']].forEach(([s, k]) => $(s).addEventListener('change', () => { A11Y[k] = $(s).checked; applyA11y(); if (k === 'speak' && A11Y.speak) speak('Lectura en voz alta activada.', true); }));
$('#aRate').addEventListener('change', () => { A11Y.rate = +$('#aRate').value; applyA11y(); speak('Así sonará mi voz.', true); });
$('#aSize').addEventListener('click', e => { const b = e.target.closest('[data-v]'); if (!b) return; A11Y.size = +b.dataset.v; applyA11y(); });
$('#aFx').addEventListener('click', e => { const b = e.target.closest('[data-v]'); if (!b) return; A11Y.fx = b.dataset.v; applyA11y(); });
$('#aReset').addEventListener('click', () => { Object.assign(A11Y, { size: 1, font: false, space: false, contrast: false, ruler: false, calm: false, simple: false, speak: false, rate: .95, fx: innerWidth < 900 ? 'low' : 'high' }); applyA11y(); });
addEventListener('pointermove', e => { if (A11Y.ruler) $('#ruler').style.top = (e.clientY - 23) + 'px'; }, { passive: true });
let VOICE = null;
function pickVoice() { const vs = (window.speechSynthesis && speechSynthesis.getVoices()) || []; VOICE = vs.find(v => /es[-_](EC|419|MX|CO|US)/i.test(v.lang)) || vs.find(v => /^es/i.test(v.lang)) || null; }
if (window.speechSynthesis) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }
function speak(text, force) {
  if (!(A11Y.speak || force) || !window.speechSynthesis) return;
  try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.lang = VOICE ? VOICE.lang : 'es-ES'; if (VOICE) u.voice = VOICE; u.rate = A11Y.rate; speechSynthesis.speak(u); } catch (e) {}
}
window.speak = speak;

/* ---------------- printable reports ---------------- */
function printReport(type, from, to) {
  const now = Date.now(), loans = Object.entries(S.loans).map(([id, l]) => ({ id, ...l }));
  const f0 = from ? fromIso(from) - 12 * 3600e3 : 0, f1 = to ? fromIso(to) + 12 * 3600e3 : Infinity;
  let title, head, rows, summary = '';
  const late = l => !l.ret && l.due < now, days = l => Math.max(0, Math.ceil((now - l.due) / DAY));
  if (type === 'activos' || type === 'vencidos') {
    let arr = loans.filter(l => !l.ret); if (type === 'vencidos') arr = arr.filter(late);
    arr.sort((a, b) => a.due - b.due);
    title = type === 'activos' ? 'Libros prestados: quién los tiene' : 'Préstamos pendientes y vencidos';
    head = ['#', 'Libro', 'Código', 'Prestatario', 'Curso / tipo', 'Salida', 'Devolver hasta', 'Estado'];
    rows = arr.map((l, i) => [i + 1, l.title, l.bookId, l.name, l.course || l.type || '', fmtD(l.out), fmtD(l.due), late(l) ? `<span class="pr-late">Vencido (${days(l)} d)</span>` : 'Pendiente']);
    summary = `<div><b>${arr.length}</b> libros fuera</div><div><b>${arr.filter(late).length}</b> vencidos</div><div><b>${new Set(arr.map(l => l.name)).size}</b> personas</div>`;
  } else if (type === 'historial') {
    const arr = loans.filter(l => l.out >= f0 && l.out <= f1).sort((a, b) => b.out - a.out);
    title = 'Historial de préstamos'; head = ['#', 'Libro', 'Prestatario', 'Curso', 'Salida', 'Devolución', 'Estado al volver', 'Registró'];
    rows = arr.map((l, i) => [i + 1, l.title, l.name, l.course || '', fmtD(l.out), l.ret ? fmtD(l.ret) : (late(l) ? '<span class="pr-late">Vencido</span>' : 'Pendiente'), l.condIn || '', l.by || '']);
    summary = `<div><b>${arr.length}</b> préstamos</div><div><b>${arr.filter(l => l.ret).length}</b> devueltos</div><div><b>${arr.filter(l => !l.ret).length}</b> pendientes</div>`;
  } else if (type === 'movs') {
    const L = { salida: 'Salida', devolucion: 'Devolución', renovacion: 'Renovación', ingreso: 'Ingreso', estado: 'Estado', baja: 'Baja' };
    const arr = Object.values(S.log).filter(m => m.ts >= f0 && m.ts <= f1).sort((a, b) => b.ts - a.ts);
    title = 'Entradas y salidas (movimientos)'; head = ['#', 'Fecha y hora', 'Tipo', 'Libro', 'Detalle', 'Por'];
    rows = arr.map((m, i) => [i + 1, fmtDT(m.ts), L[m.type] || m.type, m.title, m.detail, m.by || '']);
    summary = Object.keys(L).map(k => `<div><b>${arr.filter(m => m.type === k).length}</b> ${L[k].toLowerCase()}${k === 'salida' ? 's' : ''}</div>`).join('');
  } else {
    const arr = ALL.filter(b => ['no', 'baja', 'reparacion', 'rev'].includes(func(b)));
    title = 'Libros fuera de servicio o por revisar'; head = ['#', 'Código', 'Libro', 'Ubicación', 'Estado físico', 'Funcionamiento', 'Observación'];
    rows = arr.map((b, i) => [i + 1, b.id, b.t, b.u || '', estadoOf(b), FN_LBL[func(b)], (S.status[b.id] && S.status[b.id].note) || b.o || '']);
    summary = `<div><b>${arr.length}</b> libros</div>`;
  }
  const range = (type === 'historial' || type === 'movs') && (from || to) ? `Periodo: ${from ? fmtD(fromIso(from)) : 'inicio'} – ${to ? fmtD(fromIso(to)) : 'hoy'}` : '';
  $('#printRoot').innerHTML = `<div class="pr-h"><img src="img/cebi-logo.png" alt=""><div><h1>${esc(title)}</h1><p>Biblioteca · ${esc(CFG.colegio || 'Unidad Educativa CEBI')} · ${esc(CFG.ciudad || 'Ambato, Ecuador')}</p></div></div>
  <div class="pr-meta"><span>Generado: ${new Date().toLocaleString('es-EC', { dateStyle: 'full', timeStyle: 'short' })}</span><span>${esc(range)}</span><span>Responsable: ${esc(librarian() || '______________')}</span></div>
  <div class="pr-sum">${summary}</div>
  ${rows.length ? `<table class="pr"><thead><tr>${head.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(c => `<td>${typeof c === 'string' && c.startsWith('<span') ? c : esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>` : '<p>No hay registros para este reporte.</p>'}
  <div class="pr-sign"><div>Bibliotecario(a)</div><div>Coordinación académica</div></div>
  <div class="pr-foot">Biblioteca CEBI · El Dragón del Saber</div>`;
  const img = $('#printRoot img');
  const go_ = () => { try { window.print(); } catch (e) { toast('La impresión no está disponible en esta vista. Abre la app desde GitHub.', true); } };
  if (img && !img.complete) { img.onload = go_; img.onerror = go_; } else setTimeout(go_, 60);
}
$('#prGo').addEventListener('click', () => printReport($('#prType').value, $('#prFrom').value, $('#prTo').value));
document.addEventListener('click', e => { const b = e.target.closest('[data-print]'); if (b) printReport(b.dataset.print); });
{ const t = Date.now(); $('#prTo').value = isoDate(t); $('#prFrom').value = isoDate(t - 30 * DAY); }

/* ---------------- web discovery (real results) ---------------- */
async function fetchJSON(url, ms) {
  const ctl = new AbortController(); const tm = setTimeout(() => ctl.abort(), ms || 9000);
  try { const r = await fetch(url, { signal: ctl.signal }); if (!r.ok) throw new Error('HTTP ' + r.status); return await r.json(); } finally { clearTimeout(tm); }
}
async function webSearch(q) {
  const el = $('#discWeb'); el.innerHTML = `<p class="note"><span class="spinner"></span> Buscando en Open Library, OpenAlex y Proyecto Gutenberg…</p>`;
  const enc = encodeURIComponent;
  const jobs = [
    fetchJSON(`https://openlibrary.org/search.json?q=${enc(q)}&has_fulltext=true&limit=6&fields=key,title,author_name,first_publish_year,cover_i,ebook_access`).then(j => (j.docs || []).map(d => ({
      src: 'Open Library', t: d.title, a: (d.author_name || []).slice(0, 2).join(', '), y: d.first_publish_year, th: d.cover_i ? `https://covers.openlibrary.org/b/id/${d.cover_i}-S.jpg` : '',
      u: 'https://openlibrary.org' + d.key, tag: d.ebook_access === 'public' ? 'Lectura libre' : d.ebook_access === 'borrowable' ? 'Préstamo digital gratis' : 'Ficha' }))),
    fetchJSON(`https://api.openalex.org/works?search=${enc(q)}&filter=is_oa:true&per-page=6&select=display_name,publication_year,open_access,authorships,doi`).then(j => (j.results || []).map(w => ({
      src: 'OpenAlex', t: w.display_name, a: (w.authorships || []).slice(0, 2).map(x => x.author && x.author.display_name).filter(Boolean).join(', '), y: w.publication_year, th: '',
      u: (w.open_access && w.open_access.oa_url) || w.doi || '', tag: 'Artículo de acceso abierto' })).filter(x => x.u && x.t)),
    fetchJSON(`https://gutendex.com/books/?search=${enc(q)}&languages=es,en`).then(j => (j.results || []).slice(0, 4).map(b => ({
      src: 'Proyecto Gutenberg', t: b.title, a: (b.authors || []).map(x => x.name).join(', '), y: '', th: (b.formats || {})['image/jpeg'] || '',
      u: `https://www.gutenberg.org/ebooks/${b.id}`, tag: 'Libro de dominio público' })))
  ];
  const res = await Promise.allSettled(jobs);
  const items = res.flatMap(r => r.status === 'fulfilled' ? r.value : []);
  const failed = res.filter(r => r.status === 'rejected').length;
  if (!items.length) { el.innerHTML = `<div class="notfound">${failed === 3 ? '<b>No se pudo conectar con los repositorios en línea.</b> Revisa la conexión a internet o usa los enlaces de abajo.' : `No encontré documentos abiertos para «${esc(q)}». Prueba con otras palabras o en inglés.`}</div>`; return; }
  const order = aud === 3 ? ['OpenAlex', 'Open Library', 'Proyecto Gutenberg'] : ['Open Library', 'Proyecto Gutenberg', 'OpenAlex'];
  items.sort((a, b) => order.indexOf(a.src) - order.indexOf(b.src));
  el.innerHTML = `<div class="wres">${items.slice(0, 12).map(x => `<a class="wr" href="${esc(x.u)}" target="_blank" rel="noopener"><span class="th" ${x.th ? `style="background-image:url('${esc(x.th)}')"` : ''}>${x.th ? '' : ico(x.src === 'OpenAlex' ? 'clip' : 'books')}</span>
    <span><b>${esc(x.t)}</b><small>${esc([x.a, x.y].filter(Boolean).join(' · '))}</small><span class="src">${esc(x.src)} · ${esc(x.tag)}</span></span></a>`).join('')}</div>`;
}
const _runDiscover = window.runDiscover;
window.runDiscover = async function (q) {
  q = (q || '').trim(); if (!q) { $('#discQ').focus(); return; }
  GAME.do('web');
  const p = _runDiscover(q);
  webSearch(q);
  if (window.W3) W3.breathe();
  return p;
};

/* ---------------- librarian tools: web enrichment & backup ---------------- */
let enrichRun = false;
async function enrichFromWeb(onProgress) {
  const byIsbn = {};
  ALL.forEach(b => { const i = isbn13(b.i); if (i && !META[b.id]) (byIsbn[i] = byIsbn[i] || []).push(b.id); });
  const isbns = Object.keys(byIsbn); let done = 0, found = 0;
  for (let k = 0; k < isbns.length && enrichRun; k += 40) {
    const chunk = isbns.slice(k, k + 40);
    try {
      const j = await fetchJSON(`https://openlibrary.org/search.json?q=${encodeURIComponent('isbn:(' + chunk.join(' OR ') + ')')}&fields=key,isbn,cover_i,subject,first_publish_year,number_of_pages_median&limit=100`, 20000);
      const hit = {};
      (j.docs || []).forEach(d => (d.isbn || []).forEach(x => { const n = isbn13(x); if (n && chunk.includes(n)) hit[n] = d; }));
      chunk.forEach(i => { const d = hit[i]; byIsbn[i].forEach(id => { META[id] = d ? { cv: d.cover_i || 0, sj: (d.subject || []).slice(0, 10), fy: d.first_publish_year || 0, np: d.number_of_pages_median || 0, k: d.key } : { none: 1 }; }); if (d) found++; });
    } catch (e) { console.warn('enrich', e); await new Promise(r => setTimeout(r, 3000)); }
    done += chunk.length; lsSet('cebi-meta', META); onProgress(done, isbns.length, found);
    await new Promise(r => setTimeout(r, 900));
  }
  return { total: isbns.length, found };
}
function toolsDialog() {
  const n = Object.keys(META).length, withData = Object.values(META).filter(m => !m.none).length;
  openDialog(`<div class="pad"><div class="sec-h">${ico('gear')}Herramientas del bibliotecario</div>
  <div class="boxline"><h5>Completar con datos de la web</h5><p style="margin:0 0 10px;font-size:14px">Busca cada ISBN en Open Library para traer portadas, temas, año de primera edición y número de páginas. Se hace por tandas y se puede pausar.</p>
   <p class="note" id="enrStat">${n ? `${nf(n)} libros consultados · ${nf(withData)} con datos.` : 'Aún no se ha consultado ningún libro.'}</p>
   <div class="ld-bar" style="margin:10px 0;width:100%"><i id="enrBar" style="width:${Math.min(100, n / 3000 * 100)}%"></i></div>
   <div class="acts"><button class="btn gold sm" id="enrGo">${ico('wand')}${enrichRun ? 'Pausar' : 'Empezar'}</button><button class="btn sec sm" data-exp="web">${ico('down')}Descargar datos web (CSV para Excel)</button></div></div>
  <div class="boxline"><h5>Respaldo</h5><p style="margin:0 0 10px;font-size:14px">Guarda una copia de préstamos, estados, ingresos y movimientos. Hazlo cada semana si usas el modo local.</p>
   <div class="acts"><button class="btn sec sm" id="bkSave">${ico('down')}Descargar respaldo (.json)</button><label class="btn sec sm" style="cursor:pointer">${ico('upload')}Restaurar respaldo<input type="file" id="bkLoad" accept=".json,application/json" hidden></label></div></div>
  <div class="boxline"><h5>Conexión</h5><p style="margin:0;font-size:14px">${Store.mode === 'sheets' ? 'Conectado a Google Sheets: los datos se comparten entre computadores.' : Store.mode === 'cloud' ? 'Conectado a la base de datos compartida de Claude.' : 'Modo local: los datos viven en este navegador. Para compartirlos, configura Google Sheets (README.md).'}</p></div></div>`, true);
  $('#enrGo').onclick = async () => {
    if (enrichRun) { enrichRun = false; $('#enrGo').innerHTML = ico('wand') + 'Continuar'; return; }
    enrichRun = true; $('#enrGo').innerHTML = ico('wand') + 'Pausar';
    const r = await enrichFromWeb((d, t, f) => { const s = $('#enrStat'), bar = $('#enrBar'); if (s) s.textContent = `Consultando… ${nf(d)} de ${nf(t)} ISBN · ${nf(f)} encontrados en Open Library`; if (bar) bar.style.width = (d / t * 100) + '%'; });
    enrichRun = false; toast(`Listo: ${nf(r.found)} de ${nf(r.total)} ISBN con datos web.`); const g = $('#enrGo'); if (g) g.innerHTML = ico('wand') + 'Empezar';
    if (current === 'catalogo') renderCatalogSoft();
  };
  $('#bkSave').onclick = () => saveFile(`respaldo-biblioteca-cebi-${isoDate(Date.now())}.json`, JSON.stringify({ app: 'biblioteca-cebi', v: 1, fecha: new Date().toISOString(), data: { loans: S.loans, status: S.status, added: S.added, log: S.log } }, null, 1), 'application/json');
  $('#bkLoad').onchange = async e => {
    const f = e.target.files[0]; if (!f) return;
    try { const j = JSON.parse(await f.text()); if (!j.data) throw new Error('formato');
      let n = 0; for (const c of ['loans', 'status', 'added', 'log']) for (const [id, d] of Object.entries(j.data[c] || {})) { if (JSON.stringify(S[c][id]) !== JSON.stringify(d)) { await Store.set(c, id, d); n++; } }
      toast(`Respaldo restaurado: ${nf(n)} registros.`); } catch (err) { toast('Ese archivo no es un respaldo válido de la biblioteca.', true); }
  };
}
$('#toolsBtn').addEventListener('click', toolsDialog);

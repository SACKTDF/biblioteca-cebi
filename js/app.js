"use strict";

/* ================= Utilities ================= */
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const norm=s=>(s==null?'':String(s)).normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();
const esc=s=>(s==null?'':String(s)).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const DAY=864e5;
const fmtD=ts=>ts?new Date(ts).toLocaleDateString('es-EC',{day:'2-digit',month:'short',year:'numeric'}):'—';
const fmtDT=ts=>ts?new Date(ts).toLocaleString('es-EC',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}):'—';
const isoDate=ts=>{const d=new Date(ts);d.setMinutes(d.getMinutes()-d.getTimezoneOffset());return d.toISOString().slice(0,10)};
const fromIso=s=>{if(!s)return null;const [y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d,12).getTime()};
const uid=p=>p+'-'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const nf=n=>n.toLocaleString('es-EC');
function lsGet(k,d){try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}}
function lsSet(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
function toast(msg,err){const t=document.createElement('div');t.className='toast'+(err?' err':'');t.textContent=msg;$('#toasts').appendChild(t);setTimeout(()=>t.remove(),3800)}

/* ================= Icons ================= */
const IC={
 home:'<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
 books:'<path d="M4 4h4v16H4z"/><path d="M8 6h4v14H8z"/><path d="M13.5 5.5l3.8-1 3.7 14.5-3.8 1z"/>',
 compass:'<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
 map:'<path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14M15 6v14"/>',
 swap:'<path d="M7 7h13l-3-3"/><path d="M17 17H4l3 3"/>',
 clip:'<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1"/><path d="M8.5 11l2 2 4-4"/><path d="M8.5 17h7"/>',
 chart:'<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
 user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4.5-6 8-6s7 2 8 6"/>',
 key:'<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M17 6l3 3M15 8l2 2"/>',
 search:'<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
 flame:'<path d="M12 3c1 4 5 5.5 5 10a5 5 0 01-10 0c0-2 1-3.5 2-4.5 0 2 1 3 2 3 0-3-1-5.5 1-8.5z"/>',
 pin:'<path d="M12 21s-7-6.2-7-11.5A7 7 0 0119 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
 x:'<path d="M6 6l12 12M18 6L6 18"/>',
 out:'<path d="M14 4h6v16h-6"/><path d="M4 12h11M11 8l4 4-4 4"/>',
 inb:'<path d="M10 4H4v16h6"/><path d="M20 12H9M13 8l-4 4 4 4"/>',
 clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
 globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18"/>',
 ext:'<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v5a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1h5"/>',
 down:'<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
 plus:'<path d="M12 5v14M5 12h14"/>',
 check:'<path d="M5 12l5 5 9-10"/>',
 wrench:'<path d="M14.5 6.5a4 4 0 00-5.4 5.1L4 16.7 7.3 20l5.1-5.1a4 4 0 005.1-5.4l-2.4 2.4-2.4-.6-.6-2.4z"/>',
 copy:'<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 00-1-1H5a1 1 0 00-1 1v10a1 1 0 001 1h3"/>',
 mouse:'<rect x="7" y="3" width="10" height="18" rx="5"/><path d="M12 7v3"/>',
 dragon:'<path d="M4 15c2-1 3-4 6-5 2-.7 4 0 5 1l3-3 1 3 2 1-3 2c0 3-3 6-7 6-3 0-5-2-7-5z"/><circle cx="15" cy="12" r=".9" fill="currentColor"/><path d="M9 10c-1-2-1-4 0-6 1 2 2 3 3 5"/>',
 renew:'<path d="M20 11a8 8 0 10-2.3 5.7"/><path d="M20 4v7h-7"/>',
 edit:'<path d="M4 20h4L19 9l-4-4L4 16z"/>',
 cap:'<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c3 2 9 2 12 0v-5"/>',
 scale:'<path d="M12 3c4 3 6 6 6 10a6 6 0 01-12 0c0-4 2-7 6-10z"/><path d="M9 13c1 1.5 2 2 3 2s2-.5 3-2"/>',
 soundOff:'<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M17 9l4 6M21 9l-4 6"/>',
 soundOn:'<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16.5 8.5a5 5 0 010 7M19 6a8.5 8.5 0 010 12"/>',
 a11y:'<circle cx="12" cy="4.5" r="1.8"/><path d="M5 8l7 1.5L19 8"/><path d="M12 9.5V14l-3 6.5M12 14l3 6.5"/>',
 gear:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z"/>',
 castle:'<path d="M3 21V9l3 2V6l3 2V4h6v4l3-2v5l3-2v12z"/><path d="M10 21v-5a2 2 0 014 0v5"/>',
 flag:'<path d="M5 21V4"/><path d="M5 4h11l-2 4 2 4H5"/>',
 print:'<path d="M6 9V3h12v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M6 14h12v7H6z"/>',
 speaker:'<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16.5 8.5a5 5 0 010 7"/>',
 trophy:'<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 01-10 0z"/><path d="M17 5h3v2a3 3 0 01-3 3M7 5H4v2a3 3 0 003 3"/>',
 image:'<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-9 9"/>',
 upload:'<path d="M12 16V4M7 9l5-5 5 5M5 20h14"/>',
 wand:'<path d="M4 20L16 8"/><path d="M15 4v3M19 8h3M18 5l2-2M13.5 3.5l1 1M20.5 10.5l-1-1"/>'
};
function ico(n,cls){return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"${cls?` class="${cls}"`:''}>${IC[n]||''}</svg>`}
function hydrateIcons(root=document){root.querySelectorAll('svg[data-i]').forEach(s=>{s.setAttribute('viewBox','0 0 24 24');s.setAttribute('fill','none');s.setAttribute('stroke','currentColor');s.setAttribute('stroke-width','2');s.setAttribute('stroke-linecap','round');s.setAttribute('stroke-linejoin','round');s.innerHTML=IC[s.dataset.i]||'';s.removeAttribute('data-i')})}
hydrateIcons();
const SHIELD='<svg viewBox="0 0 160 200"><use href="#shield"/></svg>';

/* ================= Catalog data ================= */
const BASE=(window.BOOKS||[]).map(b=>({...b}));
const AREA_COL=['#173559','#05783f','#7a2e2e','#8a6a2a','#2d5f73','#5b3a6e','#3e5a2a','#9c5a2c','#24476b','#6b4426','#2f6b5c','#7a4a5e'];
function hashStr(s){let h=0;for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))|0;return Math.abs(h)}
function colorFor(b){return AREA_COL[hashStr(b.ar||b.c||'x')%AREA_COL.length]}
const SHELVES=[
 {k:'E1',n:'Estante 1',d:'PAI-PD'},{k:'E2',n:'Estante 2',d:'PAI-PD'},{k:'E3',n:'Estante 3',d:'PAI-PD'},{k:'E4',n:'Estante 4',d:'PAI-PD'},
 {k:'E7',n:'Estante 7',d:'Sociales'},{k:'E6',n:'Estante 6',d:'Idiomas y Artes'},
 {k:'PEP',n:'Librero PEP',d:'Programa de la Escuela Primaria'},{k:'PRE',n:'Librero Preescolar',d:'Inicial y Preparatoria'},
 {k:'DOC',n:'Librero Material Docente',d:'Recursos para docentes'},{k:'DID',n:'Bodega Didáctica',d:'Material didáctico'},{k:'GEN',n:'Mesa de Novedades',d:'Ingresos recientes y sin ubicar'}
];
const SHELF_BY=Object.fromEntries(SHELVES.map(s=>[s.k,s]));
function shelfKey(u){u=u||'';let m=u.match(/Estante (\d+)/);if(m)return SHELF_BY['E'+m[1]]?'E'+m[1]:'GEN';
 if(/PEP/i.test(u))return 'PEP';if(/Preescolar/i.test(u))return 'PRE';if(/Docente/i.test(u))return 'DOC';if(/Bodega|Did[aá]ctic/i.test(u))return 'DID';
 m=u.match(/\bE(\d)\b/);if(m&&SHELF_BY['E'+m[1]])return 'E'+m[1];return 'GEN'}
function rowOf(u){const m=(u||'').match(/Hilera (\d)/);return m?Math.min(5,Math.max(1,+m[1])):0}
function prep(b){
 b.tn=norm(b.t);b.an=norm(b.a);b.arn=norm(b.ar);b.sh=shelfKey(b.u);b.row=rowOf(b.u);b.col=colorFor(b);
 b.h=norm([b.t,b.a,b.e,b.i,(b.i||'').replace(/\D/g,''),b.ar,b.tt,b.c,b.u,b.o,b.id,b.y,b.l,SHELF_BY[b.sh].n].filter(Boolean).join(' | '));
 return b}
BASE.forEach(prep);

/* ================= State & Store ================= */
const S={loans:{},status:{},added:{},log:{}};
let ALL=BASE.slice(), BYID={};
let ACTIVE={}; // bookId -> [loan]
let LOANCOUNT={};
function rebuild(){
 const add=Object.entries(S.added).map(([id,b])=>prep({...b,id,nuevo:true}));
 ALL=BASE.concat(add);BYID={};ALL.forEach(b=>BYID[b.id]=b);
 ACTIVE={};LOANCOUNT={};
 for(const L of Object.values(S.loans)){LOANCOUNT[L.bookId]=(LOANCOUNT[L.bookId]||0)+1;if(!L.ret)(ACTIVE[L.bookId]=ACTIVE[L.bookId]||[]).push(L)}
}
const FN_LBL={sirve:'Sirve',rev:'Por revisar',reparacion:'En reparación',no:'No sirve',baja:'Dado de baja'};
function func(b){const s=S.status[b.id];return (s&&s.f)||(b.s==='Dañado'?'rev':'sirve')}
function estadoOf(b){const s=S.status[b.id];return (s&&s.s)||b.s||'Bueno'}
function avail(b){const out=(ACTIVE[b.id]||[]).length,total=b.q||1,f=func(b);const free=Math.max(0,total-out);
 const st=['no','baja','reparacion'].includes(f)?'off':free>0?'yes':'no';return{out,total,free,f,st}}
function avBadge(b,long){const a=avail(b);
 if(a.st==='off')return `<span class="av off">${long?'Fuera de servicio · ':''}${FN_LBL[a.f]}</span>`;
 if(a.st==='yes')return `<span class="av yes">Disponible${a.total>1?` · ${a.free} de ${a.total}`:''}</span>`;
 return `<span class="av no">No disponible · prestado</span>`}

const Store={mode:'connecting',db:null,user:null,canWrite:true,unsub:[],
 async init(){
  let db=null;
  try{ if(window.claude&&typeof window.claude.use==='function'){ db=await Promise.race([window.claude.use('db'),new Promise(r=>setTimeout(()=>r(null),6000))]) } }catch(e){db=null}
  if(db){this.db=db;this.mode='cloud';
   try{this.user=await window.claude.use('user')}catch(e){}
   try{if(this.user&&this.user.can){const c=await this.user.can('data.write');if(c===false)this.canWrite=false}}catch(e){}
   let got=0;const timer=setTimeout(()=>{if(got<4)setSync('local-wait')},10000);
   for(const c of ['loans','status','added','log']){
    try{this.unsub.push(db.collection(c).onSnapshot(snap=>{const o={};snap.docs.forEach(d=>{if(d.exists)o[d.id]=d.data()});S[c]=o;
      if(!snap.metadata.fromCache){got++;if(got>=4)clearTimeout(timer)}onData()},err=>{console.warn('db',c,err);if(err&&err.code==='revoked'){this.canWrite=false}setSync()}))}catch(e){console.warn(e)}
   }
  }else if(window.CEBI_CONFIG&&CEBI_CONFIG.SHEETS_URL&&window.SheetsStore){await SheetsStore.init(this)}
  else{this.mode='local';const L=lsGet('cebi-lib-v1',{});for(const c in S)S[c]=L[c]||{};onData()}
  setSync()},
 async set(coll,id,data){
  if(this.mode==='sheets')return SheetsStore.set(coll,id,data);
  if(this.mode==='cloud'){
   if(!this.canWrite){toast('Solo lectura: pide acceso de Colaborador al dueño de la app para registrar cambios.',true);return false}
   try{await this.db.collection(coll).doc(id).set(data);return true}catch(e){
    if(e&&e.code==='invalid_argument'){this.canWrite=false;setSync();toast('No tienes permiso para registrar cambios (se requiere acceso de Colaborador).',true)}
    else if(e&&e.code==='quota_exceeded')toast('La base de datos está llena: exporta y depura movimientos antiguos.',true);
    else toast('No se pudo guardar. Revisa tu conexión e inténtalo de nuevo.',true);return false}
  }
  S[coll][id]=data;lsSet('cebi-lib-v1',S);onData();return true},
 async del(coll,id){if(this.mode==='sheets')return SheetsStore.del(coll,id);if(this.mode==='cloud'){try{await this.db.collection(coll).doc(id).delete();return true}catch(e){toast('No se pudo eliminar.',true);return false}}
  delete S[coll][id];lsSet('cebi-lib-v1',S);onData();return true}
};
function setSync(w){const el=$('#sync');el.className='sync';let t='';
 if(Store.mode==='cloud'&&!Store.canWrite){el.classList.add('ro');t='Solo lectura'}
 else if(Store.mode==='cloud'){el.classList.add(w==='local-wait'?'local':'ok');t=w==='local-wait'?'Sincronizando…':'Sincronizado'}
 else if(Store.mode==='local'){el.classList.add('local');t='Modo local'}else t='Conectando…';
 el.querySelector('span').textContent=t;
 el.title=Store.mode==='local'?'Sin base de datos compartida: los registros se guardan solo en este navegador.':Store.mode==='cloud'?(Store.canWrite?'Los registros se comparten en tiempo real con todos los bibliotecarios.':'Puedes consultar, pero no registrar cambios.'):'';
 const msg=Store.mode==='local'?'<b>Modo local:</b> la base de datos compartida no está disponible en esta vista, así que los préstamos se guardan solo en este navegador. Abre la app desde su enlace de Claude para sincronizar.':(Store.mode==='cloud'&&!Store.canWrite)?'<b>Solo lectura:</b> tu nivel de acceso permite consultar pero no registrar. Pide al dueño de la app acceso de <b>Colaborador</b>.':'';
 ['#roBanner1','#roBanner2'].forEach(s=>{const b=$(s);b.innerHTML=msg;b.classList.toggle('on',!!msg)})}
async function logMove(type,b,detail,extra){const id=uid('M');await Store.set('log',id,{type,bookId:b?b.id:'',title:b?b.t:'',detail:detail||'',ts:Date.now(),by:librarian(),...(extra||{})})}
function librarian(){return ($('#lBy')&&$('#lBy').value.trim())||lsGet('cebi-by','')||''}

let renderQueued=false;
function onData(){rebuild();if(renderQueued)return;renderQueued=true;requestAnimationFrame(()=>{renderQueued=false;renderCurrent(true)})}

/* ================= Search ================= */
const STOP=new Set(['de','la','el','los','las','y','e','en','del','al','un','una','para','por','con','sobre','libro','libros','texto','textos','que','a','o','the','of','and','quiero','busco','acerca','tema']);
function tokens(q){let t=norm(q).split(/[^a-z0-9\-]+/).filter(Boolean);const f=t.filter(x=>!STOP.has(x));return f.length?f:t}
function search(q,F={},opts={}){
 const toks=tokens(q),qn=norm(q).trim();let res=[];
 const pass=b=>{if(F.c&&b.c!==F.c)return false;if(F.nee&&!((b.p&&b.p<=48)||/Infantil|Pop Ups|Preescolar|Arte Infantil/.test(b.ar||'')||b.c==='Preescolar'))return false;if(F.ar&&b.ar!==F.ar)return false;if(F.l&&b.l!==F.l)return false;if(F.sh&&b.sh!==F.sh)return false;
  if(F.d||F.f){const a=avail(b);if(F.d&&a.st!==F.d)return false;if(F.f&&a.f!==F.f)return false}return true};
 const score=(b,any)=>{let sc=0,hit=0;for(const t of toks){if(b.h.includes(t)){hit++;sc+=1;if(b.tn.includes(t))sc+=3;if(b.an.includes(t))sc+=2;if(b.arn.includes(t))sc+=2}else if(!any)return -1}
  if(any&&!hit)return -1;if(qn.length>2){if(b.tn===qn)sc+=40;else if(b.tn.startsWith(qn))sc+=15;else if(b.tn.includes(qn))sc+=8}return sc};
 for(const b of ALL){if(!pass(b))continue;if(!toks.length){res.push([0,b]);continue}const s=score(b,false);if(s>=0)res.push([s,b])}
 let partial=false;
 if(!res.length&&toks.length>1&&opts.fallback!==false){partial=true;for(const b of ALL){if(!pass(b))continue;const s=score(b,true);if(s>0)res.push([s,b])}}
 const sort=F.sort||'rel';
 res.sort((x,y)=>sort==='az'?x[1].t.localeCompare(y[1].t,'es'):sort==='year'?((y[1].y||0)-(x[1].y||0)):sort==='loans'?((LOANCOUNT[y[1].id]||0)-(LOANCOUNT[x[1].id]||0)):(y[0]-x[0])||x[1].t.localeCompare(y[1].t,'es'));
 const out=res.map(r=>r[1]);out.partial=partial;return out}

/* ================= Router ================= */
const VIEWS=['inicio','catalogo','descubridor','mapa','prestamos','inventario','reportes'];
const LIBV=new Set(['prestamos','inventario','reportes']);
let current='inicio';
function go(v,push=true){
 if(!VIEWS.includes(v))v='inicio';
 if(LIBV.has(v)&&!document.body.classList.contains('librarian'))v='inicio';
 current=v;document.body.className=document.body.className.replace(/\bview-\S+/g,'').trim()+' view-'+v;$$('.view').forEach(e=>e.classList.toggle('on',e.id==='v-'+v));
 $$('#nav button').forEach(b=>b.classList.toggle('on',b.dataset.go===v));
 if(push&&location.hash!=='#'+v){try{history.replaceState(null,'','#'+v)}catch(e){location.hash=v}}
 renderCurrent();if(window.W3)W3.setView(v)}
window.addEventListener('hashchange',()=>{const h=location.hash.slice(1);if(h&&h!==current)go(h,false)});
$$('[data-go]').forEach(b=>b.addEventListener('click',e=>{e.preventDefault();go(b.dataset.go)}));
function renderCurrent(fromData){
 ({inicio:renderHome,catalogo:fromData?renderCatalogSoft:renderCatalog,descubridor:fromData?refreshDiscLocal:()=>{},mapa:renderMap,prestamos:renderLoans,inventario:fromData?renderInvSoft:renderInv,reportes:renderReports}[current]||(()=>{}))();
 if(fromData&&$('#modal').classList.contains('on')&&modalBook)openBook(modalBook,true)}

/* Mode */
function setMode(lib){document.body.classList.toggle('librarian',lib);lsSet('cebi-mode',lib?'lib':'stu');
 $('#modeBtn span').textContent=lib?'Bibliotecario':'Estudiante';$('#modeBtn svg').innerHTML=IC[lib?'key':'user'];
 if(!lib&&LIBV.has(current))go('inicio');renderCurrent()}
$('#modeBtn').addEventListener('click',()=>{const lib=!document.body.classList.contains('librarian');
 if(lib){openDialog(`<div class="pad" style="padding:26px"><div class="sec-h">${ico('key')}MODO BIBLIOTECARIO</div>
 <p style="color:var(--ink-2);margin:0 0 14px">Activa préstamos, devoluciones, inventario y reportes. Escribe tu nombre para firmar los registros.</p>
 <label class="f" for="byName">Nombre del bibliotecario(a)</label><input class="inp" id="byName" value="${esc(lsGet('cebi-by',''))}" placeholder="Ej.: Lic. María Pérez">
 <div class="acts" style="justify-content:flex-end"><button class="btn sec" data-close>Cancelar</button><button class="btn wood" id="byOk">${ico('check')}Entrar</button></div></div>`);
  $('#byOk').onclick=()=>{const n=$('#byName').value.trim();if(n)lsSet('cebi-by',n);if($('#lBy'))$('#lBy').value=n||lsGet('cebi-by','');closeModal();setMode(true);go('prestamos')};
  setTimeout(()=>$('#byName').focus(),100)}
 else setMode(false)});

/* ================= Home ================= */
const IB_THEMES=['Quiénes somos','Dónde nos encontramos en el tiempo y el espacio','Cómo nos expresamos','Cómo funciona el mundo','Cómo nos organizamos','Cómo compartimos el planeta'];
function renderHome(){
 const titles=ALL.length,copies=ALL.reduce((s,b)=>s+(b.q||1),0),out=Object.values(S.loans).filter(l=>!l.ret).length;
 $('#h-tit').textContent=nf(titles);
 $('#homeStats').innerHTML=[[nf(titles),'Títulos'],[nf(copies),'Ejemplares'],[new Set(ALL.map(b=>b.c)).size,'Colecciones'],[nf(out),'Prestados ahora']].map(([v,l])=>`<div class="stat"><b>${v}</b><span>${l}</span></div>`).join('');
 $('#homeQuick').innerHTML=`<button class="btn wood" data-q="cat">${ico('books')}Explorar catálogo</button><button class="btn sec" data-q="map">${ico('map')}Recorrer en 3D</button>`+
  (document.body.classList.contains('librarian')?`<button class="btn sec" data-q="loan">${ico('swap')}Registrar préstamo</button>`:'');
 $('#homeQuick').querySelectorAll('[data-q]').forEach(b=>b.onclick=()=>go({cat:'catalogo',map:'mapa',loan:'prestamos'}[b.dataset.q]))}
$('#homeSearch')&&$('#homeSearch').addEventListener('submit',e=>{e.preventDefault();const q=$('#homeQ').value.trim();if(!q){go('catalogo');return}$('#discQ').value=q;go('descubridor');runDiscover(q)});

/* ================= Catalog ================= */
let catPage=1;const PER=48;
function fillSelect(sel,vals,label){const cur=sel.value;sel.innerHTML=`<option value="">${label}</option>`+vals.map(v=>`<option value="${esc(v[0])}">${esc(v[1]||v[0])}${v[2]!=null?` (${nf(v[2])})`:''}</option>`).join('');sel.value=cur}
function countBy(f){const m={};ALL.forEach(b=>{const k=f(b);if(k)m[k]=(m[k]||0)+1});return m}
function buildFilters(){
 const c=countBy(b=>b.c),a=countBy(b=>b.ar),l=countBy(b=>b.l),u=countBy(b=>b.sh);
 fillSelect($('#fC'),Object.entries(c).sort((x,y)=>y[1]-x[1]).map(([k,v])=>[k,k,v]),'Todas');
 fillSelect($('#fA'),Object.entries(a).sort((x,y)=>x[0].localeCompare(y[0],'es')).map(([k,v])=>[k,k,v]),'Todos los temas');
 fillSelect($('#fL'),Object.entries(l).sort((x,y)=>y[1]-x[1]).map(([k,v])=>[k,k,v]),'Todos');
 fillSelect($('#fU'),SHELVES.filter(s=>u[s.k]).map(s=>[s.k,s.n,u[s.k]]),'Toda la biblioteca')}
function catFilters(){return{nee:$('#fNee').checked,c:$('#fC').value,ar:$('#fA').value,l:$('#fL').value,sh:$('#fU').value,d:$('#fD').value,f:$('#fF').value,sort:$('#fS').value}}
let catRes=[];
function bookCard(b){return `<article class="bk" data-id="${esc(b.id)}" tabindex="0" style="--c:${b.col}"><div class="spine"></div><div class="bk-b">
 <h3>${esc(b.t)}</h3><p class="au">${esc(b.a||'Autor no registrado')}${b.y?` · ${b.y}`:''}</p>
 <div class="meta">${b.ar?`<span class="tag">${esc(b.ar)}</span>`:''}<span class="tag w">${esc(b.c)}</span>${b.l!=='Español'?`<span class="tag">${esc(b.l)}</span>`:''}${b.nuevo?'<span class="tag" style="color:#9cc3f5">Nuevo ingreso</span>':''}</div>
 <div class="foot">${avBadge(b)}<span class="loc">${ico('pin')}${esc(b.u||SHELF_BY[b.sh].n)}</span></div></div></article>`}
function renderCatalog(){catPage=1;catRes=search($('#catQ').value,catFilters());drawCat()}
function renderCatalogSoft(){catRes=search($('#catQ').value,catFilters());drawCat()}
function drawCat(){
 const n=catRes.length,show=catRes.slice(0,catPage*PER);
 $('#catCount').innerHTML=`<b>${nf(n)}</b> resultado${n===1?'':'s'}${catRes.partial?' · coincidencias parciales':''}`;
 $('#catList').innerHTML=n?show.map(bookCard).join(''):`<div class="empty" style="grid-column:1/-1">${ico('search')}<p><b>No encontramos ese libro en la biblioteca.</b></p><p>Prueba con otra palabra o búscalo en repositorios abiertos.</p><button class="btn pri" id="toDisc">${ico('compass')}Buscar en el Descubridor</button></div>`;
 $('#catMore').style.display=show.length<n?'':'none';
 const tb=$('#toDisc');if(tb)tb.onclick=()=>{$('#discQ').value=$('#catQ').value;go('descubridor');runDiscover($('#catQ').value)}}
let catT;$('#catQ').addEventListener('input',()=>{clearTimeout(catT);catT=setTimeout(renderCatalog,160)});
['#fC','#fA','#fL','#fU','#fD','#fF','#fS','#fNee'].forEach(s=>$(s).addEventListener('change',renderCatalog));
$('#fReset').onclick=()=>{$('#fNee').checked=false;['#fC','#fA','#fL','#fU','#fD','#fF'].forEach(s=>$(s).value='');$('#fS').value='rel';$('#catQ').value='';renderCatalog()};
$('#catMore').onclick=()=>{catPage++;drawCat()};
document.addEventListener('click',e=>{const c=e.target.closest('[data-id]');if(c&&!e.target.closest('button,a')){openBook(c.dataset.id)}});
document.addEventListener('keydown',e=>{if(e.key==='Enter'){const c=e.target.closest&&e.target.closest('.bk[data-id]');if(c)openBook(c.dataset.id)}if(e.key==='Escape')closeModal()});

/* ================= Modal & book detail ================= */
let modalBook=null;
function openDialog(html,wide){modalBook=null;$('#modalBox').className='box'+(wide?'':' sm');$('#modalBox').innerHTML=`<button class="x" data-close aria-label="Cerrar">${ico('x')}</button>`+html;$('#modal').classList.add('on')}
function closeModal(){$('#modal').classList.remove('on');modalBook=null}
$('#modal').addEventListener('click',e=>{if(e.target.id==='modal'||e.target.closest('[data-close]'))closeModal()});
function apa(b){const au=b.a&&b.a!=='Varios autores'?b.a:'';const y=b.y||'s.f.';return `${au?esc(au)+'. ':''}(${y}). <i>${esc(b.t)}</i>. ${b.e?esc(b.e.replace(/\.+$/,''))+'.':''}`}
function openBook(id,refresh){const b=BYID[id];if(!b)return;modalBook=id;const a=avail(b),lib=document.body.classList.contains('librarian');
 const st=S.status[b.id];const hist=Object.values(S.loans).filter(l=>l.bookId===b.id).sort((x,y)=>y.out-x.out);
 const sh=SHELF_BY[b.sh];
 const html=`<button class="x" data-close aria-label="Cerrar">${ico('x')}</button><div class="bm">
 <div class="bm-l"><div class="book3d"><div class="bi" style="--c:${b.col}"><div class="bk2"></div><div class="pg"></div><div class="cv"><h4>${esc(b.t)}</h4>${SHIELD}<span>${esc(b.a||'')}</span></div></div></div>
  <div style="text-align:center">${avBadge(b,true)}<p class="note" style="margin-top:8px">${a.out?`${a.out} ejemplar${a.out>1?'es':''} prestado${a.out>1?'s':''} · `:''}${a.total} en total</p></div>
  <div style="text-align:center"><div class="note" style="margin:0 0 4px">Código</div><b style="font-family:var(--font-d);letter-spacing:.08em">${esc(b.id)}</b></div></div>
 <div class="bm-r"><h3>${esc(b.t)}</h3><p class="au">${esc(b.a||'Autor no registrado')}</p>
  <div class="chips">${b.ar?`<span class="tag">${esc(b.ar)}</span>`:''}${b.tt?`<span class="tag" style="color:var(--green-xl)">PEP · ${esc(b.tt)}</span>`:''}<span class="tag w">${esc(b.c)}</span><span class="fn ${a.f}">${FN_LBL[a.f]}</span></div>
  <div class="locard">${ico('pin','pin')}<div><span>Lo encuentras en</span><b>${esc(b.u||sh.n)}</b><span>${esc(sh.n)} · ${esc(sh.d)}</span></div><button class="btn wood sm" id="bmMap">${ico('map')}Ver en 3D</button></div>
  <dl class="dl">${[['Editorial',b.e],['Año',b.y],['Idioma',b.l],['Páginas',b.p],['ISBN',b.i],['Estado físico',estadoOf(b)],['Ejemplares',b.q]].filter(x=>x[1]).map(x=>`<div><dt>${x[0]}</dt><dd>${esc(x[1])}</dd></div>`).join('')}</dl>
  ${b.o||st&&st.note?`<div class="boxline"><h5>Observaciones</h5><div style="font-size:14px">${esc([b.o,st&&st.note?`Última revisión: ${st.note}`:''].filter(Boolean).join(' · '))}</div></div>`:''}
  ${lib?`<div class="acts">
   <button class="btn pri sm" id="bmLend" ${a.st!=='yes'?'disabled':''}>${ico('out')}Prestar</button>
   ${a.out?`<button class="btn sec sm" id="bmRet">${ico('inb')}Registrar devolución</button>`:''}
   <button class="btn sec sm" id="bmState">${ico('wrench')}Revisar estado</button></div>`:''}
  ${lib&&hist.length?`<div class="boxline"><h5>Historial de préstamos (${hist.length})</h5><div class="hist">${hist.map(l=>`<div><span>${esc(l.name)} · ${esc(l.course||l.type||'')}</span><span>${fmtD(l.out)} → ${l.ret?fmtD(l.ret):`<b class="${l.due<Date.now()?'due-late':''}">pendiente</b>`}</span></div>`).join('')}</div></div>`:''}
  <div class="boxline"><h5>Cita APA 7</h5><div class="cite" id="apaTxt">${apa(b)}</div><button class="btn sec sm" id="bmCopy" style="margin-top:10px">${ico('copy')}Copiar cita</button></div>
  <div class="boxline"><h5>Encuéntralo también en la web abierta</h5><div class="chips">${['openlibrary','archive','scholar','gutenberg'].map(k=>{const r=REPO_BY[k];return `<a class="chip" href="${esc(r.u(b.t+(b.a&&b.a!=='Varios autores'?' '+b.a:'')))}" target="_blank" rel="noopener">${esc(r.n)} ${ico('ext')}</a>`}).join('')}</div></div>
 </div></div>`;
 $('#modalBox').className='box';$('#modalBox').innerHTML=html;modalBook=id;if(!refresh)$('#modal').classList.add('on');
 hydrateIcons($('#modalBox'));
 $('#bmMap').onclick=()=>{closeModal();go('mapa');focusShelf(b.sh,b.row,b)};
 $('#bmCopy').onclick=async()=>{try{await navigator.clipboard.writeText($('#apaTxt').innerText);toast('Cita copiada')}catch(e){toast('No se pudo copiar; selecciónala manualmente.',true)}};
 const L=$('#bmLend');if(L)L.onclick=()=>{closeModal();go('prestamos');pickBook(b.id)};
 const R=$('#bmRet');if(R)R.onclick=()=>{const ls=ACTIVE[b.id]||[];if(ls.length===1)returnDialog(ls[0]);else{closeModal();go('prestamos');$('#loanQ').value=b.t;renderLoans()}};
 const Sb=$('#bmState');if(Sb)Sb.onclick=()=>stateDialog(b)}

/* ================= Loans ================= */
let pickedId=null,ddIdx=-1,ddItems=[];
const COURSES=['Inicial 1','Inicial 2','Preparatoria','2° EGB','3° EGB','4° EGB','5° EGB','6° EGB','7° EGB','1° PAI','2° PAI','3° PAI','4° PAI','5° PAI','1° PD','2° PD','Docente','Administrativo'];
$('#courses').innerHTML=COURSES.map(c=>`<option value="${c}">`).join('');
function resetLoanForm(){pickedId=null;$('#lBookQ').value='';$('#lBookSel').classList.remove('on');$('#lName').value='';$('#lCourse').value='';$('#lNote').value='';
 const now=Date.now();$('#lOut').value=isoDate(now);$('#lDue').value=isoDate(now+(CEBI_CONFIG.diasEstudiante||7)*DAY);$('#lBy').value=lsGet('cebi-by','')}
resetLoanForm();
$('#lType').addEventListener('change',()=>{const d=$('#lType').value==='Docente'?(CEBI_CONFIG.diasDocente||15):(CEBI_CONFIG.diasEstudiante||7);$('#lDue').value=isoDate((fromIso($('#lOut').value)||Date.now())+d*DAY)});
$('#lOut').addEventListener('change',()=>{const d=$('#lType').value==='Docente'?15:7;$('#lDue').value=isoDate((fromIso($('#lOut').value)||Date.now())+d*DAY)});
$('#lBy').addEventListener('change',()=>lsSet('cebi-by',$('#lBy').value.trim()));
function pickBook(id){const b=BYID[id];if(!b)return;pickedId=id;$('#lBookDD').classList.remove('on');$('#lBookQ').value='';
 const a=avail(b);$('#lBookSel').innerHTML=`<div style="width:10px;align-self:stretch;border-radius:3px;background:${b.col}"></div><div style="flex:1;min-width:0"><b>${esc(b.t)}</b><small>${esc(b.id)} · ${esc(b.u||'')}</small><div style="margin-top:6px">${avBadge(b)}</div></div><button type="button" class="btn sec sm" id="unpick">${ico('x')}</button>`;
 $('#lBookSel').classList.add('on');$('#unpick').onclick=()=>{pickedId=null;$('#lBookSel').classList.remove('on')};setTimeout(()=>$('#lName').focus(),50)}
function drawDD(){const q=$('#lBookQ').value.trim();if(!q){$('#lBookDD').classList.remove('on');return}
 ddItems=search(q).slice(0,8);ddIdx=-1;
 $('#lBookDD').innerHTML=ddItems.length?ddItems.map((b,i)=>`<button type="button" data-p="${esc(b.id)}"><span><b>${esc(b.t)}</b><small>${esc(b.id)} · ${esc(b.a||'')} · ${esc(b.u||'')}</small></span>${avBadge(b)}</button>`).join(''):'<div class="note" style="padding:12px">Sin resultados</div>';
 $('#lBookDD').classList.add('on');$('#lBookDD').querySelectorAll('[data-p]').forEach(x=>x.onclick=()=>pickBook(x.dataset.p))}
$('#lBookQ').addEventListener('input',drawDD);
$('#lBookQ').addEventListener('keydown',e=>{const items=$$('#lBookDD [data-p]');if(!items.length)return;
 if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();ddIdx=(ddIdx+(e.key==='ArrowDown'?1:-1)+items.length)%items.length;items.forEach((x,i)=>x.classList.toggle('hl',i===ddIdx))}
 if(e.key==='Enter'){e.preventDefault();pickBook(items[Math.max(0,ddIdx)].dataset.p)}});
document.addEventListener('click',e=>{if(!e.target.closest('.picker'))$('#lBookDD').classList.remove('on')});
$('#loanForm').addEventListener('submit',async e=>{e.preventDefault();
 if(!pickedId){toast('Elige primero el libro que sale.',true);$('#lBookQ').focus();return}
 const b=BYID[pickedId],a=avail(b);
 if(a.st!=='yes'){toast(a.st==='off'?'Este libro está fuera de servicio y no puede prestarse.':'No quedan ejemplares disponibles de este libro.',true);return}
 const name=$('#lName').value.trim();if(!name){toast('Escribe el nombre de quien lleva el libro.',true);return}
 const out=fromIso($('#lOut').value)||Date.now(),due=fromIso($('#lDue').value)||out+7*DAY;
 if(due<out){toast('La fecha de devolución no puede ser anterior a la salida.',true);return}
 const id=uid('L'),by=librarian();
 const L={bookId:b.id,title:b.t,name,type:$('#lType').value,course:$('#lCourse').value.trim(),out:Math.min(out,Date.now())===out?out:Date.now(),due,condOut:$('#lCond').value,note:$('#lNote').value.trim(),by,ret:null};
 if(await Store.set('loans',id,L)){await logMove('salida',b,`${name}${L.course?' ('+L.course+')':''} · devolver hasta ${fmtD(due)}`);toast(`Salida registrada: «${b.t}» para ${name}`);resetLoanForm();if(window.W3)W3.breathe()}});
let loanTab='all';
$('#loanTabs').addEventListener('click',e=>{const c=e.target.closest('[data-t]');if(!c)return;loanTab=c.dataset.t;$$('#loanTabs .chip').forEach(x=>x.classList.toggle('on',x===c));renderLoans()});
$('#loanQ').addEventListener('input',()=>renderLoans());
function loanRow(id,L){const now=Date.now(),late=!L.ret&&L.due<now,soon=!L.ret&&!late&&L.due-now<2*DAY;const days=Math.ceil((now-L.due)/DAY);
 return `<div class="loan ${late?'late':soon?'soon':''}"><div style="min-width:0"><b>${esc(L.title)}</b>
 <div class="ml"><span>${ico('user')}${esc(L.name)}${L.course?` · ${esc(L.course)}`:''}</span><span>${ico('out')}${fmtD(L.out)}</span>
 ${L.ret?`<span>${ico('inb')}Devuelto ${fmtD(L.ret)} · ${esc(L.condIn||'')}</span>`:`<span class="${late?'due-late':soon?'due-soon':''}">${ico('clock')}${late?`Vencido hace ${days} día${days>1?'s':''}`:`Hasta ${fmtD(L.due)}`}</span>`}
 <span style="color:var(--ink-3)">${esc(L.bookId)}</span></div></div>
 <div class="la">${L.ret?'':`<button class="btn sec sm" data-renew="${esc(id)}" title="Renovar 7 días">${ico('renew')}</button><button class="btn pri sm" data-ret="${esc(id)}">${ico('inb')}Devolver</button>`}</div></div>`}
function renderLoans(){
 if(!$('#lBy').value)$('#lBy').value=lsGet('cebi-by','');
 const q=norm($('#loanQ').value.trim()),now=Date.now();
 let arr=Object.entries(S.loans);
 if(loanTab==='hist')arr=arr.filter(([,L])=>L.ret).sort((a,b)=>b[1].ret-a[1].ret);
 else{arr=arr.filter(([,L])=>!L.ret);if(loanTab==='late')arr=arr.filter(([,L])=>L.due<now);if(loanTab==='soon')arr=arr.filter(([,L])=>L.due>=now&&L.due-now<2*DAY);arr.sort((a,b)=>a[1].due-b[1].due)}
 if(q)arr=arr.filter(([,L])=>norm(`${L.title} ${L.name} ${L.course} ${L.bookId}`).includes(q));
 const late=Object.values(S.loans).filter(L=>!L.ret&&L.due<now).length;
 $('#loanTabs [data-t="late"]').textContent=`Vencidos${late?` (${late})`:''}`;
 $('#loanList').innerHTML=arr.length?arr.slice(0,200).map(([id,L])=>loanRow(id,L)).join(''):`<div class="empty">${ico('books')}<p>${loanTab==='hist'?'Aún no hay devoluciones registradas.':'No hay libros fuera en esta lista.'}</p></div>`}
$('#loanList').addEventListener('click',async e=>{const r=e.target.closest('[data-ret]'),n=e.target.closest('[data-renew]');
 if(r){const L=S.loans[r.dataset.ret];if(L)returnDialog({...L,_id:r.dataset.ret})}
 if(n){const id=n.dataset.renew,L=S.loans[id];if(!L)return;const due=Math.max(L.due,Date.now())+7*DAY;if(await Store.set('loans',id,{...L,due})){await logMove('renovacion',BYID[L.bookId]||{id:L.bookId,t:L.title},`${L.name} · nueva fecha ${fmtD(due)}`);toast('Préstamo renovado 7 días')}}});
function returnDialog(L){const id=L._id||Object.keys(S.loans).find(k=>S.loans[k]===L);if(!id)return;const Lc=S.loans[id];
 openDialog(`<div style="padding:26px"><div class="sec-h">${ico('inb')}REGISTRAR DEVOLUCIÓN</div>
 <p style="margin:0 0 4px"><b>${esc(Lc.title)}</b></p><p class="note" style="margin:0 0 14px">${esc(Lc.name)} · salió el ${fmtD(Lc.out)} ${Lc.due<Date.now()?`· <span class="due-late">vencido</span>`:''}</p>
 <label class="f">¿En qué estado regresa?</label>
 <div class="radios" id="retC">
  <label><input type="radio" name="rc" value="ok" checked> Buen estado · sirve</label>
  <label><input type="radio" name="rc" value="leve"> Daño leve · sirve, anotar</label>
  <label><input type="radio" name="rc" value="dan"> Dañado · no sirve, va a reparación</label>
  <label><input type="radio" name="rc" value="lost"> Perdido · no fue devuelto</label></div>
 <div style="margin-top:12px"><label class="f" for="retN">Observación</label><input class="inp" id="retN" placeholder="Ej.: portada doblada"></div>
 <div class="acts" style="justify-content:flex-end"><button class="btn sec" data-close>Cancelar</button><button class="btn pri" id="retOk">${ico('check')}Confirmar</button></div></div>`);
 $('#retOk').onclick=async()=>{const c=$('#retC input:checked').value,note=$('#retN').value.trim();
  const lbl={ok:'Buen estado',leve:'Daño leve',dan:'Dañado',lost:'Perdido'}[c];
  const ok=await Store.set('loans',id,{...Lc,ret:Date.now(),condIn:lbl,retNote:note,retBy:librarian()});if(!ok)return;
  const b=BYID[Lc.bookId]||{id:Lc.bookId,t:Lc.title};
  await logMove('devolucion',b,`${Lc.name} · ${lbl}${note?' · '+note:''}`);
  if(c!=='ok'&&BYID[Lc.bookId]){const prev=S.status[b.id]||{};const f={leve:'sirve',dan:'reparacion',lost:'baja'}[c];
   await Store.set('status',b.id,{...prev,f,s:c==='leve'?'Usado':c==='dan'?'Dañado':prev.s||estadoOf(b),note:`${lbl}${note?': '+note:''} (devolución ${fmtD(Date.now())})`,ts:Date.now(),by:librarian()});
   if(c!=='leve')await logMove(c==='lost'?'baja':'estado',b,`${FN_LBL[f]} tras devolución${note?' · '+note:''}`)}
  closeModal();toast(`Devolución registrada: «${Lc.title}»`)}}

/* ================= Inventory ================= */
let invTab='rev',invQ='',invOnlyRev=false;
$('#invTabs').addEventListener('click',e=>{const c=e.target.closest('[data-t]');if(!c)return;invTab=c.dataset.t;$$('#invTabs .chip').forEach(x=>x.classList.toggle('on',x===c));renderInv()});
function fBtns(b){const f=func(b);return `<div class="fbtns" data-fb="${esc(b.id)}">${['sirve','reparacion','no','baja'].map(k=>`<button class="${k}${f===k?' on':''}" data-f="${k}">${FN_LBL[k]}</button>`).join('')}</div>`}
function renderInv(){const el=$('#invBody');
 if(invTab==='rev'){el.innerHTML=`<div class="grid2" style="margin-bottom:12px;align-items:end"><div><label class="f" for="invQ">Buscar libro para revisar</label><input class="inp" id="invQ" value="${esc(invQ)}" placeholder="Título, código, ISBN o ubicación (ej.: Estante 4 Hilera 2)"></div>
  <label class="chip ${invOnlyRev?'on':''}" style="justify-self:start" id="onlyRev">Solo libros marcados como dañados o por revisar</label></div><div id="invList"></div><p class="note">Toca «Sirve», «En reparación», «No sirve» o «Dado de baja». Cada cambio queda registrado en Movimientos.</p>`;
  $('#invQ').addEventListener('input',()=>{invQ=$('#invQ').value;drawInvList()});
  $('#onlyRev').onclick=()=>{invOnlyRev=!invOnlyRev;$('#onlyRev').classList.toggle('on',invOnlyRev);drawInvList()};drawInvList()}
 else if(invTab==='in'){el.innerHTML=ingresoForm()}
 else if(invTab==='mov'){el.innerHTML=`<div class="grid3" style="margin-bottom:12px"><div><label class="f">Tipo</label><select class="inp" id="mvT"><option value="">Todos</option><option value="salida">Salidas</option><option value="devolucion">Devoluciones</option><option value="renovacion">Renovaciones</option><option value="ingreso">Ingresos</option><option value="estado">Cambios de estado</option><option value="baja">Bajas</option></select></div>
  <div><label class="f">Buscar</label><input class="inp" id="mvQ" placeholder="Libro, persona…"></div><div style="display:flex;align-items:end"><button class="btn sec" data-exp="mov">${ico('down')}Exportar CSV</button></div></div><div class="tscroll"><table class="tbl"><thead><tr><th>Fecha</th><th>Tipo</th><th>Libro</th><th>Detalle</th><th>Por</th></tr></thead><tbody id="mvBody"></tbody></table></div>`;
  $('#mvT').onchange=drawMov;$('#mvQ').oninput=drawMov;drawMov()}
 else if(invTab==='off'){const arr=ALL.filter(b=>['no','baja','reparacion','rev'].includes(func(b))).sort((a,b)=>func(a).localeCompare(func(b)));
  el.innerHTML=`<p style="margin:0 0 12px;color:var(--ink-2)"><b>${nf(arr.length)}</b> libros requieren atención o están fuera de servicio.</p><div class="chips" style="margin-bottom:12px">${['rev','reparacion','no','baja'].map(k=>`<span class="fn ${k}">${FN_LBL[k]}: ${arr.filter(b=>func(b)===k).length}</span>`).join('')}</div><div id="offList">${arr.slice(0,300).map(invRow).join('')||'<div class="empty">Todo en orden.</div>'}</div>`}
 hydrateIcons(el)}
function renderInvSoft(){if(invTab==='rev')drawInvList();else if(invTab==='mov')drawMov();else if(invTab==='off')renderInv()}
function invRow(b){const st=S.status[b.id];return `<div class="rv"><div style="min-width:0;cursor:pointer" data-id="${esc(b.id)}"><b>${esc(b.t)}</b><small>${esc(b.id)} · ${esc(b.u||'')} · Estado: ${esc(estadoOf(b))}${st&&st.note?' · '+esc(st.note):b.o?' · '+esc(b.o):''}</small></div>${fBtns(b)}</div>`}
function drawInvList(){const q=invQ.trim();let arr=q?search(q):ALL;if(invOnlyRev)arr=arr.filter(b=>['rev','reparacion','no'].includes(func(b))||b.s==='Dañado');
 if(!q&&!invOnlyRev){$('#invList').innerHTML=`<div class="empty">${ico('clip')}<p>Busca un libro o una ubicación (por ejemplo <b>Estante 3 Hilera 1</b>) para revisar estante por estante.</p></div>`;hydrateIcons($('#invList'));return}
 $('#invList').innerHTML=arr.slice(0,120).map(invRow).join('')+(arr.length>120?`<p class="note">Mostrando 120 de ${nf(arr.length)}. Afina la búsqueda.</p>`:'')||'<div class="empty">Sin resultados.</div>'}
document.addEventListener('click',async e=>{const btn=e.target.closest('.fbtns [data-f]');if(!btn)return;e.stopPropagation();
 const id=btn.closest('[data-fb]').dataset.fb,b=BYID[id],f=btn.dataset.f;if(!b||func(b)===f)return;
 if((f==='baja'||f==='no'||f==='reparacion')&&(ACTIVE[id]||[]).length){toast('Este libro tiene ejemplares prestados; registra primero la devolución.',true);return}
 const prev=S.status[id]||{},before=func(b);if(await Store.set('status',id,{...prev,f,ts:Date.now(),by:librarian(),note:prev.note||''})){await logMove(f==='baja'?'baja':'estado',b,`${FN_LBL[before]} → ${FN_LBL[f]}`);toast(`«${b.t}»: ${FN_LBL[f]}`)}},true);
function stateDialog(b){const st=S.status[b.id]||{};
 openDialog(`<div style="padding:26px"><div class="sec-h">${ico('wrench')}REVISAR ESTADO</div><p style="margin:0 0 14px"><b>${esc(b.t)}</b><br><span class="note">${esc(b.id)} · ${esc(b.u||'')}</span></p>
 <div class="grid2" style="margin-bottom:12px"><div><label class="f">¿Funciona?</label><select class="inp" id="sdF">${Object.entries(FN_LBL).map(([k,v])=>`<option value="${k}" ${func(b)===k?'selected':''}>${v}</option>`).join('')}</select></div>
 <div><label class="f">Estado físico</label><select class="inp" id="sdS">${['Nuevo','Seminuevo','Bueno','Usado','Antiguo','Desgastado','Dañado','Incompleto'].map(v=>`<option ${estadoOf(b)===v?'selected':''}>${v}</option>`).join('')}</select></div></div>
 <label class="f" for="sdN">Observación de la revisión</label><input class="inp" id="sdN" value="${esc(st.note||'')}" placeholder="Ej.: lomo despegado, faltan páginas 10-12">
 <div class="acts" style="justify-content:flex-end"><button class="btn sec" data-close>Cancelar</button><button class="btn pri" id="sdOk">${ico('check')}Guardar</button></div></div>`);
 $('#sdOk').onclick=async()=>{const f=$('#sdF').value,s=$('#sdS').value,note=$('#sdN').value.trim();
  if(['no','baja','reparacion'].includes(f)&&(ACTIVE[b.id]||[]).length){toast('Hay ejemplares prestados; registra primero la devolución.',true);return}
  if(await Store.set('status',b.id,{f,s,note,ts:Date.now(),by:librarian()})){await logMove(f==='baja'?'baja':'estado',b,`${FN_LBL[f]} · ${s}${note?' · '+note:''}`);toast('Estado actualizado');openBook(b.id)}}}
function ingresoForm(){const cols=[...new Set(ALL.map(b=>b.c))].sort();
 return `<div class="sec-h">${ico('plus')}REGISTRAR INGRESO DE UN LIBRO</div><form id="inForm" autocomplete="off">
 <div class="grid2" style="margin-bottom:12px"><div><label class="f">Título *</label><input class="inp" name="t" required></div><div><label class="f">Autor</label><input class="inp" name="a"></div></div>
 <div class="grid3" style="margin-bottom:12px"><div><label class="f">Editorial</label><input class="inp" name="e"></div><div><label class="f">Año</label><input class="inp" name="y" inputmode="numeric" pattern="(19|20)\\d\\d" placeholder="2026"></div><div><label class="f">ISBN</label><input class="inp" name="i"></div></div>
 <div class="grid3" style="margin-bottom:12px"><div><label class="f">Idioma</label><select class="inp" name="l"><option>Español</option><option>Inglés</option><option>Francés</option><option>Bilingüe</option></select></div>
 <div><label class="f">Tema / Área</label><input class="inp" name="ar" list="areas" placeholder="Ej.: Matemáticas"></div><div><label class="f">Páginas</label><input class="inp" name="p" inputmode="numeric"></div></div>
 <div class="grid3" style="margin-bottom:12px"><div><label class="f">Colección</label><select class="inp" name="c">${cols.map(c=>`<option ${c==='Donaciones'?'selected':''}>${esc(c)}</option>`).join('')}</select></div>
 <div><label class="f">Estante / Librero</label><select class="inp" name="sh">${SHELVES.map(s=>`<option value="${s.k}">${esc(s.n)}</option>`).join('')}</select></div><div><label class="f">Hilera</label><select class="inp" name="row"><option value="">—</option>${[1,2,3,4,5].map(n=>`<option>${n}</option>`).join('')}</select></div></div>
 <div class="grid3" style="margin-bottom:12px"><div><label class="f">Cantidad</label><input class="inp" name="q" type="number" min="1" max="99" value="1"></div><div><label class="f">Estado</label><select class="inp" name="s"><option>Nuevo</option><option>Seminuevo</option><option>Bueno</option><option>Usado</option><option>Dañado</option></select></div>
 <div><label class="f">Origen</label><select class="inp" name="orig"><option>Donación</option><option>Compra / adquisición</option><option>Reposición</option><option>Otro</option></select></div></div>
 <div style="margin-bottom:14px"><label class="f">Observaciones</label><input class="inp" name="o" placeholder="Ej.: donado por familia de 4° PAI"></div>
 <button class="btn pri" type="submit">${ico('plus')}Registrar ingreso</button></form>
 <datalist id="areas">${[...new Set(ALL.map(b=>b.ar).filter(Boolean))].sort().map(a=>`<option value="${esc(a)}">`).join('')}</datalist>`}
document.addEventListener('submit',async e=>{if(e.target.id!=='inForm')return;e.preventDefault();const fd=new FormData(e.target),g=k=>(fd.get(k)||'').toString().trim();
 const sh=SHELF_BY[g('sh')],row=g('row');let u=sh.n+(row?` · Hilera ${row}`:'');
 const b={t:g('t'),a:g('a'),e:g('e'),i:g('i'),l:g('l'),ar:g('ar'),c:g('c'),s:g('s'),q:Math.max(1,Math.min(99,parseInt(g('q'))||1)),u,o:[g('orig'),g('o')].filter(Boolean).join(' · '),ts:Date.now(),by:librarian()};
 const y=parseInt(g('y'));if(y>1800&&y<2100)b.y=y;const p=parseInt(g('p'));if(p>0)b.p=p;
 Object.keys(b).forEach(k=>{if(b[k]===''||b[k]==null)delete b[k]});if(!b.t){toast('El título es obligatorio.',true);return}
 const id=uid('NUE');if(await Store.set('added',id,b)){await logMove('ingreso',{id,t:b.t},`${g('orig')} · ${b.q} ejemplar${b.q>1?'es':''} · ${u}`);toast(`Ingreso registrado: «${b.t}» (${id})`);e.target.reset()}});
function drawMov(){const t=$('#mvT')?.value||'',q=norm($('#mvQ')?.value||'');
 let arr=Object.values(S.log).sort((a,b)=>b.ts-a.ts);if(t)arr=arr.filter(m=>m.type===t);if(q)arr=arr.filter(m=>norm(`${m.title} ${m.detail} ${m.by} ${m.bookId}`).includes(q));
 const L={salida:'Salida',devolucion:'Devolución',renovacion:'Renovación',ingreso:'Ingreso',estado:'Estado',baja:'Baja'};
 $('#mvBody').innerHTML=arr.length?arr.slice(0,400).map(m=>`<tr><td style="white-space:nowrap">${fmtDT(m.ts)}</td><td><span class="mv ${m.type}">${L[m.type]||m.type}</span></td><td><span data-id="${esc(m.bookId)}" style="cursor:pointer;color:var(--green-xl);font-weight:700">${esc(m.title)}</span></td><td>${esc(m.detail)}</td><td>${esc(m.by||'—')}</td></tr>`).join(''):`<tr><td colspan="5" class="empty">Aún no hay movimientos registrados.</td></tr>`}

/* ================= Reports ================= */
function barList(rows,max){max=max||Math.max(1,...rows.map(r=>r[1]));return `<div class="bars">${rows.map(r=>`<div class="bar" data-tip="${esc(r[0])}: ${nf(r[1])}"><span class="lb">${esc(r[0])}</span><div class="tr"><i style="width:${(r[1]/max*100).toFixed(1)}%"></i></div><span class="vl">${nf(r[1])}</span></div>`).join('')}</div>`}
function renderReports(){const now=Date.now(),loans=Object.values(S.loans),act=loans.filter(l=>!l.ret),late=act.filter(l=>l.due<now);
 const copies=ALL.reduce((s,b)=>s+(b.q||1),0),off=ALL.filter(b=>['no','baja','reparacion'].includes(func(b))).length;
 const month=new Date();month.setDate(1);month.setHours(0,0,0,0);const lm=Object.values(S.log).filter(m=>m.ts>=month.getTime()).length;
 $('#kpis').innerHTML=[['TÍTULOS',nf(ALL.length),'en el catálogo'],['EJEMPLARES',nf(copies),'físicos'],['PRESTADOS',nf(act.length),'fuera ahora'],['VENCIDOS',nf(late.length),'por devolver'],['FUERA DE SERVICIO',nf(off),'no sirven / reparación'],['MOVIMIENTOS',nf(lm),'este mes']]
  .map(k=>`<div class="panel kpi wood"><span>${k[0]}</span><b>${k[1]}</b><small>${k[2]}</small></div>`).join('');
 const byC={};ALL.forEach(b=>byC[b.c]=(byC[b.c]||0)+(b.q||1));
 const byA={};ALL.forEach(b=>{if(b.ar)byA[b.ar]=(byA[b.ar]||0)+1});
 const byS={};ALL.forEach(b=>{const s=estadoOf(b);byS[s]=(byS[s]||0)+1});
 const byCourse={};loans.forEach(l=>{const k=l.course||l.type||'Sin curso';byCourse[k]=(byCourse[k]||0)+1});
 const top=Object.entries(LOANCOUNT).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([id,n])=>[BYID[id]?BYID[id].t:id,n]);
 const card=(t,ic,body)=>`<div class="panel pad wood"><div class="sec-h">${ico(ic)}${t}</div>${body}</div>`;
 const srt=o=>Object.entries(o).sort((a,b)=>b[1]-a[1]);
 $('#rgrid').innerHTML=card('EJEMPLARES POR COLECCIÓN','books',barList(srt(byC)))+card('TÍTULOS POR TEMA (TOP 12)','compass',barList(srt(byA).slice(0,12)))+
  card('ESTADO FÍSICO','wrench',barList(srt(byS)))+card('LIBROS MÁS PRESTADOS','flame',top.length?barList(top):'<p class="note">Aparecerán cuando se registren préstamos.</p>')+
  card('PRÉSTAMOS POR CURSO','cap',Object.keys(byCourse).length?barList(srt(byCourse).slice(0,12)):'<p class="note">Aún no hay préstamos registrados.</p>')+
  card('VENCIDOS','clock',late.length?late.sort((a,b)=>a.due-b.due).slice(0,10).map(l=>`<div class="hist"><div><span><b>${esc(l.name)}</b> · ${esc(l.title)}</span><span class="due-late">${Math.ceil((now-l.due)/DAY)} d</span></div></div>`).join(''):'<p class="note">No hay préstamos vencidos. ✓</p>')}
function csv(rows){return '﻿'+rows.map(r=>r.map(v=>{v=v==null?'':String(v);return /[;"\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v}).join(';')).join('\r\n')}
async function exportCsv(kind){let rows,name;
 if(kind==='inv'){rows=[['Código','Título','Autor','Editorial','Año','ISBN','Idioma','Páginas','Tema','Colección','Ubicación','Ejemplares','Prestados','Estado físico','Funcionamiento','Observaciones']].concat(ALL.map(b=>{const a=avail(b);return[b.id,b.t,b.a,b.e,b.y,b.i,b.l,b.p,b.ar,b.c,b.u,b.q,a.out,estadoOf(b),FN_LBL[a.f],[b.o,S.status[b.id]&&S.status[b.id].note].filter(Boolean).join(' · ')]}));name='inventario-biblioteca-cebi'}
 else if(kind==='loans'){rows=[['Código','Libro','Prestatario','Tipo','Curso','Salida','Devolver hasta','Devuelto','Estado al volver','Registrado por']].concat(Object.values(S.loans).sort((a,b)=>b.out-a.out).map(l=>[l.bookId,l.title,l.name,l.type,l.course,isoDate(l.out),isoDate(l.due),l.ret?isoDate(l.ret):'',l.condIn||'',l.by||'']));name='prestamos-biblioteca-cebi'}
 else{rows=[['Fecha','Tipo','Código','Libro','Detalle','Por']].concat(Object.values(S.log).sort((a,b)=>b.ts-a.ts).map(m=>[new Date(m.ts).toLocaleString('es-EC'),m.type,m.bookId,m.title,m.detail,m.by]));name='movimientos-biblioteca-cebi'}
 const data=csv(rows),filename=`${name}-${isoDate(Date.now())}.csv`;
 let dl=null;try{if(window.claude&&window.claude.use)dl=await window.claude.use('downloads')}catch(e){}
 if(dl){try{await dl.save({filename,data});toast('Archivo listo');return}catch(e){if(e&&/declin|cancel/i.test(e.code||e.message||''))return}}
 try{await navigator.clipboard.writeText(data);toast('Datos copiados: pégalos en Excel (separador ;)')}catch(e){toast('No se pudo exportar desde esta vista.',true)}}
document.addEventListener('click',e=>{const b=e.target.closest('[data-exp]');if(b)exportCsv(b.dataset.exp)});

/* ================= Discoverer ================= */
const enc=encodeURIComponent;
const REPOS=[
 {k:'scholar',n:'Google Académico',g:'sci',c:'#4a7fd6',d:'Artículos, tesis y libros académicos de todo el mundo.',u:q=>`https://scholar.google.com/scholar?hl=es&q=${enc(q)}`},
 {k:'scielo',n:'SciELO',g:'sci',c:'#d97b2b',d:'Revistas científicas iberoamericanas, 100% acceso abierto.',u:q=>`https://search.scielo.org/?lang=es&q=${enc(q)}`},
 {k:'redalyc',n:'Redalyc',g:'sci',c:'#b8322b',d:'Revistas científicas de América Latina, acceso abierto diamante.',u:q=>`https://www.redalyc.org/busquedaArticuloFiltros.oa?q=${enc(q)}`},
 {k:'doaj',n:'DOAJ',g:'sci',c:'#e0a12b',d:'Directorio de revistas de acceso abierto revisadas por pares.',u:q=>`https://doaj.org/search/articles?source=${enc(JSON.stringify({query:{query_string:{query:q,default_operator:'AND'}}}))}`},
 {k:'core',n:'CORE',g:'sci',c:'#c43d6b',d:'Millones de artículos de investigación en texto completo.',u:q=>`https://core.ac.uk/search?q=${enc(q)}`},
 {k:'lareferencia',n:'LA Referencia',g:'sci',c:'#2b8a8a',d:'Tesis y artículos de universidades latinoamericanas, incluido Ecuador.',u:q=>`https://www.lareferencia.info/vufind/Search/Results?lookfor=${enc(q)}&type=AllFields`},
 {k:'base',n:'BASE',g:'sci',c:'#3d6bb3',d:'Buscador de la Universidad de Bielefeld, prioriza acceso abierto.',u:q=>`https://www.base-search.net/Search/Results?lookfor=${enc(q)}&oaboost=1`},
 {k:'dialnet',n:'Dialnet',g:'sci',c:'#2f6fa8',d:'Artículos y tesis en español de humanidades y ciencias sociales.',u:q=>`https://dialnet.unirioja.es/buscar/documentos?querysDismax.DOCUMENTAL_TODO=${enc(q)}`},
 {k:'eric',n:'ERIC',g:'sci',c:'#5a6fa0',d:'Investigación educativa (en inglés), solo texto completo libre.',u:q=>`https://eric.ed.gov/?q=${enc(q)}&ft=on`},
 {k:'arxiv',n:'arXiv',g:'sci',c:'#a3282a',d:'Matemáticas, física, informática y estadística.',u:q=>`https://arxiv.org/search/?query=${enc(q)}&searchtype=all`},
 {k:'pmc',n:'PubMed Central',g:'sci',c:'#2a6f97',d:'Biología, salud y medicina con texto completo gratuito.',u:q=>`https://www.ncbi.nlm.nih.gov/pmc/?term=${enc(q)}`},
 {k:'zenodo',n:'Zenodo',g:'sci',c:'#1f6fb5',d:'Repositorio abierto del CERN: datos, artículos y software.',u:q=>`https://zenodo.org/search?q=${enc(q)}`},
 {k:'openlibrary',n:'Open Library',g:'lib',c:'#6b4426',d:'Lee o toma prestados millones de libros digitales gratis.',u:q=>`https://openlibrary.org/search?q=${enc(q)}`},
 {k:'gutenberg',n:'Proyecto Gutenberg',g:'lib',c:'#8a6a2a',d:'Clásicos de literatura de dominio público para descargar.',u:q=>`https://www.gutenberg.org/ebooks/search/?query=${enc(q)}`},
 {k:'archive',n:'Internet Archive',g:'lib',c:'#555f6e',d:'Biblioteca digital de libros, audios y documentos históricos.',u:q=>`https://archive.org/search?query=${enc(q)}`},
 {k:'europeana',n:'Europeana',g:'lib',c:'#3a4fb0',d:'Patrimonio cultural europeo: arte, historia y documentos.',u:q=>`https://www.europeana.eu/es/search?query=${enc(q)}`},
 {k:'khan',n:'Khan Academy',g:'edu',c:'#14bf96',d:'Lecciones y ejercicios gratuitos, ideal para repasar.',u:q=>`https://es.khanacademy.org/search?page_search_query=${enc(q)}`},
 {k:'wikipedia',n:'Wikipedia',g:'edu',c:'#6d6d6d',d:'Punto de partida enciclopédico (contrasta siempre las fuentes).',u:q=>`https://es.wikipedia.org/w/index.php?search=${enc(q)}`}
];
const REPO_BY=Object.fromEntries(REPOS.map(r=>[r.k,r]));
const GROUPS={sci:'Artículos científicos y tesis',lib:'Libros y documentos digitales',edu:'Aprender y repasar'};
let aud=1,discLast='';
$('#aud').addEventListener('click',e=>{const c=e.target.closest('[data-a]');if(!c)return;aud=+c.dataset.a;$$('#aud .chip').forEach(x=>x.classList.toggle('on',x===c));if(discLast)runDiscover(discLast)});
$('#discChips').innerHTML=['Cambio climático','Fracciones','Mitos y leyendas','Sistema solar','Historia del Ecuador','Shakespeare','Derechos humanos','Emociones'].map(t=>`<span class="chip" data-dq="${t}">${t}</span>`).join('');
$('#discChips').addEventListener('click',e=>{const c=e.target.closest('[data-dq]');if(c){$('#discQ').value=c.dataset.dq;runDiscover(c.dataset.dq)}});
$('#discForm').addEventListener('submit',e=>{e.preventDefault();runDiscover($('#discQ').value)});
function hitRow(b){const sh=SHELF_BY[b.sh];return `<div class="hit" data-id="${esc(b.id)}" style="--c:${b.col}"><div class="mini"></div><div style="min-width:0"><b>${esc(b.t)}</b><span class="note">${esc(b.a||'')}${b.y?' · '+b.y:''} · ${esc(b.c)}</span>
 <div class="r2">${avBadge(b)}<span class="loc">${ico('pin')}${esc(b.u||sh.n)}</span><button class="btn sec sm" data-map="${esc(b.id)}">${ico('map')}Ir al estante</button></div></div></div>`}
function refreshDiscLocal(){if(discLast)drawDiscLocal(discLast)}
function drawDiscLocal(q){const res=search(q);const el=$('#discLocal');
 if(!res.length){el.innerHTML=`<div class="notfound"><b>No disponible en nuestra biblioteca.</b><br>No tenemos libros sobre «${esc(q)}» todavía. Los repositorios abiertos de la derecha te llevan directo a documentos gratuitos.</div>`}
 else{const yes=res.filter(b=>avail(b).st==='yes').length;
  el.innerHTML=`<p style="margin:0 0 12px;color:var(--ink-2)">${res.partial?'Coincidencias parciales: ':''}<b>${nf(res.length)}</b> resultado${res.length>1?'s':''} · <span style="color:#7fe0ad">${nf(yes)} disponible${yes===1?'':'s'}</span></p>`+res.slice(0,12).map(hitRow).join('')+
  (res.length>12?`<button class="btn sec sm" id="discAll" style="margin-top:6px">Ver los ${nf(res.length)} en el catálogo</button>`:'');
  const da=$('#discAll');if(da)da.onclick=()=>{$('#catQ').value=q;go('catalogo');renderCatalog()}}
 return res}
$('#discLocal').addEventListener('click',e=>{const m=e.target.closest('[data-map]');if(m){e.stopPropagation();const b=BYID[m.dataset.map];go('mapa');focusShelf(b.sh,b.row,b)}},true);
function drawRepos(q,picked){const order=aud===1?['edu','lib','sci']:aud===2?['lib','sci','edu']:['sci','lib','edu'];
 const why=Object.fromEntries((picked||[]).map(p=>[p.clave,p]));
 const chosen=(picked||[]).filter(p=>REPO_BY[p.clave]);
 let html='';
 if(chosen.length){html+=`<div class="rgrp">Recomendados por el dragón</div><div class="repos">${chosen.map(p=>repoCard(REPO_BY[p.clave],p.consulta||q,p.motivo)).join('')}</div>`}
 for(const g of order){const list=REPOS.filter(r=>r.g===g&&!(why[r.k]&&REPO_BY[r.k]));if(!list.length)continue;
  const lim=aud===1&&g==='sci'?4:list.length;html+=`<div class="rgrp">${GROUPS[g]}</div><div class="repos">${list.slice(0,lim).map(r=>repoCard(r,q)).join('')}</div>`}
 $('#discRepos').innerHTML=html}
function repoCard(r,q,why){return `<a class="repo" href="${esc(r.u(q))}" target="_blank" rel="noopener"><div class="rh"><span class="ic" style="background:${r.c}">${esc(r.n.replace(/[^A-Za-z]/g,'').slice(0,2).toUpperCase())}</span><b>${esc(r.n)}</b></div>
 ${why?`<span class="why">${esc(why)}</span>`:`<small>${esc(r.d)}</small>`}<span class="go">Buscar «${esc(q.length>32?q.slice(0,30)+'…':q)}» ${ico('ext')}</span></a>`}
async function runDiscover(q){q=(q||'').trim();if(!q){$('#discQ').focus();return}discLast=q;$('#discRes').style.display='';
 const res=drawDiscLocal(q);drawRepos(q);if(window.W3)W3.breathe();
 const out=$('#dragonOut');
 let sample=null;try{if(window.claude&&window.claude.use)sample=await window.claude.use('sample')}catch(e){}
 if(!sample){out.innerHTML=dragonLocal(q,res);bindKw();return}
 out.innerHTML=`<div class="dsay"><div class="av-d">${ico('dragon')}</div><div class="bubble">${dragonLocalText(q,res)}<div style="margin-top:12px"><button class="btn pri sm" id="askD">${ico('flame')}Pedir al dragón una guía de investigación</button></div></div></div>`;
 $('#askD').onclick=()=>askDragon(q,res,sample)}
function dragonLocalText(q,res){const yes=res.filter(b=>avail(b).st==='yes');
 if(!res.length)return `Busqué «<b>${esc(q)}</b>» en cada estante y no lo encontré en nuestra biblioteca. ¡Pero el saber no tiene muros! Abajo tienes repositorios abiertos donde investigar gratis.`;
 if(yes.length)return `¡Encontré <b>${nf(res.length)}</b> tesoro${res.length>1?'s':''} sobre «<b>${esc(q)}</b>»! El primero disponible, «${esc(yes[0].t)}», te espera en <b>${esc(yes[0].u||SHELF_BY[yes[0].sh].n)}</b>.`;
 return `Tenemos libros sobre «<b>${esc(q)}</b>», pero ahora están prestados o en reparación. Pide a la biblioteca que te avisen al volver, y mientras tanto explora los repositorios abiertos.`}
function dragonLocal(q,res){return `<div class="dsay"><div class="av-d">${ico('dragon')}</div><div class="bubble">${dragonLocalText(q,res)}</div></div>`}
function bindKw(){$$('#dragonOut [data-kw]').forEach(c=>c.onclick=()=>{$('#discQ').value=c.dataset.kw;runDiscover(c.dataset.kw)})}
let askBusy=false;
async function askDragon(q,res,sample){if(askBusy)return;askBusy=true;
 const out=$('#dragonOut');out.querySelector('#askD').outerHTML=`<p class="note" id="dThink"><span class="spinner"></span> El dragón está consultando sus pergaminos…</p>`;
 const local=res.slice(0,15).map(b=>({id:b.id,titulo:b.t,autor:b.a||'',tema:b.ar||'',disponible:avail(b).st==='yes'}));
 const lvl={1:'estudiante de primaria del Programa de la Escuela Primaria (PEP, 6-11 años)',2:'estudiante del Programa de los Años Intermedios (PAI, 11-16 años)',3:'estudiante del Programa del Diploma (16-18 años) o docente investigador'}[aud];
 const prompt=`Eres "Draco", el dragón guardián y sabio de la Biblioteca de la Unidad Educativa CEBI, un colegio del Bachillerato Internacional (IB) en Quito, Ecuador. Un ${lvl} quiere investigar: "${q}".
Estos son los libros de NUESTRA biblioteca que coinciden con la búsqueda (JSON): ${JSON.stringify(local)}
Responde ÚNICAMENTE con un objeto JSON válido, en español, con estas claves:
{"explicacion": "2 a 4 frases que orienten la investigación del tema, adaptadas a la edad, con voz cálida de dragón sabio",
 "palabras_clave": ["5 a 8 términos de búsqueda útiles, incluye 2 o 3 en inglés"],
 "libros": ["hasta 4 ids de la lista anterior que más sirvan; [] si ninguno es pertinente"],
 "repositorios": [{"clave":"una de: ${REPOS.map(r=>r.k).join(', ')}","consulta":"consulta de búsqueda breve y optimizada para ese repositorio","motivo":"por qué sirve, máximo 14 palabras"}],
 "pregunta": "una pregunta de indagación al estilo IB para guiar su investigación"}
Elige de 3 a 5 repositorios adecuados a la edad. No inventes libros, ids ni enlaces.`;
 try{const r=await sample.json(prompt,{modelTier:'quick'});const v=r&&typeof r==='object'&&!Array.isArray(r)?r:{};
  const libs=(Array.isArray(v.libros)?v.libros:[]).map(id=>BYID[id]).filter(Boolean);
  const kws=(Array.isArray(v.palabras_clave)?v.palabras_clave:[]).filter(x=>typeof x==='string').slice(0,8);
  const reps=(Array.isArray(v.repositorios)?v.repositorios:[]).filter(x=>x&&REPO_BY[x.clave]).slice(0,5).map(x=>({clave:x.clave,consulta:String(x.consulta||q).slice(0,120),motivo:String(x.motivo||'').slice(0,120)}));
  out.innerHTML=`<div class="dsay"><div class="av-d">${ico('dragon')}</div><div class="bubble">${dragonLocalText(q,res)}<p style="margin:10px 0 0">${esc(v.explicacion||'')}</p>
   ${v.pregunta?`<div class="q">${ico('compass')} ${esc(v.pregunta)}</div>`:''}</div></div>
   ${kws.length?`<div class="rgrp">Palabras clave para buscar</div><div class="chips">${kws.map(k=>`<span class="chip" data-kw="${esc(k)}">${esc(k)}</span>`).join('')}</div>`:''}
   ${libs.length?`<div class="rgrp">Empieza por estos libros nuestros</div>${libs.map(hitRow).join('')}`:''}`;
  bindKw();if(reps.length)drawRepos(q,reps);hydrateIcons(out)}
 catch(e){const t=$('#dThink');if(t)t.innerHTML=e&&e.code==='rate_limited'?'El dragón está descansando un momento. Inténtalo en un minuto.':e&&e.code==='not_granted'?'La guía del dragón no está activada en esta vista.':'El dragón no pudo responder ahora. Los repositorios de abajo siguen disponibles.'}
 finally{askBusy=false}}

/* ================= Map panel ================= */
let selShelf=null;
function shelfCounts(){const m={};ALL.forEach(b=>{const s=m[b.sh]=m[b.sh]||{n:0,q:0,areas:{},cols:{}};s.n++;s.q+=(b.q||1);if(b.ar)s.areas[b.ar]=(s.areas[b.ar]||0)+1;s.cols[b.c]=(s.cols[b.c]||0)+1});return m}
function renderMap(){const sc=shelfCounts();
 $('#shelfList').innerHTML=`<button class="btn sec sm" data-sh="" style="width:100%;margin-bottom:10px">${ico('globe')}Vista general</button>`+SHELVES.map(s=>`<button class="shelf-btn ${selShelf===s.k?'on':''}" data-sh="${s.k}"><span><b>${esc(s.n)}</b><small>${esc(s.d)}</small></span><em>${nf((sc[s.k]||{}).n||0)}</em></button>`).join('');
 if(selShelf)drawShelfInfo(selShelf)}
$('#shelfList').addEventListener('click',e=>{const b=e.target.closest('[data-sh]');if(!b)return;if(!b.dataset.sh){selShelf=null;$('#mapInfo').classList.remove('on');renderMap();if(window.W3)W3.setView('mapa');return}focusShelf(b.dataset.sh,0)});
function drawShelfInfo(k,book){const s=SHELF_BY[k],c=shelfCounts()[k]||{n:0,q:0,areas:{}};const top=Object.entries(c.areas).sort((a,b)=>b[1]-a[1]).slice(0,5);
 $('#mapInfo').innerHTML=`<div class="sec-h">${ico('pin')}${esc(s.n.toUpperCase())}</div>
 ${book?`<div class="hit" data-id="${esc(book.id)}" style="--c:${book.col};margin-bottom:12px"><div class="mini"></div><div><b>${esc(book.t)}</b><span class="note">${esc(book.u||'')}</span><div class="r2">${avBadge(book)}</div></div></div>`:''}
 <p style="margin:0 0 10px;color:var(--ink-2)">${esc(s.d)} · <b>${nf(c.n)}</b> títulos · ${nf(c.q)} ejemplares</p>
 <div class="chips" style="margin-bottom:12px">${top.map(t=>`<span class="tag">${esc(t[0])} · ${t[1]}</span>`).join('')}</div>
 <button class="btn wood sm" id="shelfCat">${ico('books')}Ver libros de este estante</button>`;
 $('#mapInfo').classList.add('on');$('#shelfCat').onclick=()=>{$('#fU').value=k;$('#catQ').value='';go('catalogo');renderCatalog()}}
function focusShelf(k,row,book){selShelf=k;if(current!=='mapa')go('mapa');renderMap();drawShelfInfo(k,book);if(window.W3)W3.focusShelf(k,row||0)}

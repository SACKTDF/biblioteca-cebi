"use strict";
/* =========================================================
   Biblioteca CEBI · mundo 3D (three.js r128)
   Salón circular, estantes interactivos, escudo esmaltado,
   banderines IB y Draco, dragón de cuatro patas que sigue al cursor.
   ========================================================= */
(function () {
  const ldBar = document.getElementById('ld-bar'), ldMsg = document.getElementById('ld-msg');
  const hideLoader = () => document.getElementById('loader').classList.add('gone');
  if (!window.THREE) { document.body.classList.add('no3d'); hideLoader(); return; }
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('scene'), antialias: true, powerPreference: 'high-performance' }); }
  catch (e) { document.body.classList.add('no3d'); hideLoader(); return; }

  const SHIELD_PTS = [[0.499, 0.0091], [0.4952, 0.0091], [0.4476, 0.0383], [0.4438, 0.0369], [0.44, 0.0425], [0.4248, 0.0494], [0.421, 0.0481], [0.4171, 0.0536], [0.4133, 0.0522], [0.4143, 0.0543], [0.3981, 0.0634], [0.3905, 0.0662], [0.3867, 0.0648], [0.3848, 0.0689], [0.3448, 0.0857], [0.2514, 0.1205], [0.2114, 0.1386], [0.1981, 0.1414], [0.1867, 0.1511], [0.1829, 0.1497], [0.179, 0.1553], [0.1771, 0.1539], [0.1733, 0.1581], [0.1714, 0.1567], [0.16, 0.165], [0.1562, 0.1636], [0.1514, 0.1671], [0.1533, 0.1685], [0.1333, 0.1818], [0.1295, 0.1804], [0.1286, 0.1838], [0.0981, 0.2075], [0.0895, 0.2138], [0.0867, 0.2131], [0.0886, 0.2159], [0.079, 0.2214], [0.081, 0.2228], [0.0524, 0.2521], [0.0352, 0.2772], [0.02, 0.3134], [0.0105, 0.3649], [0.0105, 0.8203], [0.1257, 0.8489], [0.1352, 0.8517], [0.1305, 0.8538], [0.1352, 0.8558], [0.1505, 0.8558], [0.1581, 0.8586], [0.1552, 0.8607], [0.16, 0.8628], [0.1695, 0.8614], [0.1867, 0.867], [0.1867, 0.8698], [0.1924, 0.8684], [0.2, 0.8712], [0.2, 0.874], [0.2057, 0.8726], [0.2171, 0.8767], [0.2162, 0.8788], [0.221, 0.8809], [0.2267, 0.8795], [0.2514, 0.8879], [0.2514, 0.8907], [0.2552, 0.8893], [0.2648, 0.8921], [0.3905, 0.9394], [0.4629, 0.9728], [0.4952, 0.9923], [0.5143, 0.9826], [0.5162, 0.984], [0.5295, 0.9742], [0.5333, 0.9756], [0.5371, 0.9701], [0.5752, 0.9519], [0.6286, 0.9297], [0.7162, 0.8976], [0.7181, 0.899], [0.7257, 0.8935], [0.7543, 0.8879], [0.7514, 0.8858], [0.76, 0.8823], [0.7848, 0.8781], [0.7924, 0.8753], [0.7895, 0.8733], [0.7943, 0.8712], [0.8171, 0.8642], [0.8248, 0.8656], [0.8229, 0.8628], [0.8648, 0.8503], [0.8819, 0.8461], [0.8914, 0.8475], [0.8933, 0.8433], [0.9067, 0.8391], [0.979, 0.8224], [0.9819, 0.8203], [0.9829, 0.8057], [0.9848, 0.8196], [0.9876, 0.8134], [0.9876, 0.8022], [0.9848, 0.8029], [0.9819, 0.7981], [0.9838, 0.3872], [0.98, 0.344], [0.9838, 0.3454], [0.9838, 0.3398], [0.981, 0.3377], [0.9781, 0.3412], [0.9743, 0.3245], [0.9743, 0.3203], [0.9781, 0.3189], [0.9752, 0.3127], [0.9724, 0.3175], [0.9648, 0.2967], [0.9667, 0.2883], [0.9638, 0.2918], [0.94, 0.2521], [0.9152, 0.2242], [0.8981, 0.2089], [0.8457, 0.1706], [0.8438, 0.172], [0.8371, 0.1671], [0.8362, 0.1636], [0.8324, 0.165], [0.8267, 0.1581], [0.8229, 0.1595], [0.821, 0.1553], [0.8133, 0.1553], [0.8048, 0.1504], [0.8057, 0.1483], [0.7943, 0.1455], [0.741, 0.1205], [0.6514, 0.087], [0.6324, 0.0787], [0.6352, 0.0766], [0.6229, 0.0703], [0.6095, 0.0689], [0.6124, 0.0669], [0.6019, 0.062], [0.5962, 0.0634], [0.5857, 0.0571], [0.5867, 0.055], [0.5829, 0.0564], [0.579, 0.0508], [0.5733, 0.0522], [0.5619, 0.0467], [0.499, 0.0091]];
  const mobile = innerWidth < 900;
  let QUALITY = (window.A11Y && A11Y.fx) || (mobile ? 'low' : 'high'), CALM = !!(window.A11Y && A11Y.calm), PAUSED = false;
  const V3 = (x, y, z) => new THREE.Vector3(x, y, z), YUP = V3(0, 1, 0);

  renderer.setPixelRatio(Math.min(devicePixelRatio, QUALITY === 'high' ? 1.75 : QUALITY === 'mid' ? 1.4 : 1));
  renderer.setSize(innerWidth, innerHeight);
  renderer.outputEncoding = THREE.sRGBEncoding; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.15;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x060b16); scene.fog = new THREE.FogExp2(0x060b16, 0.022);
  const camera = new THREE.PerspectiveCamera(48, innerWidth / innerHeight, 0.1, 220);
  camera.position.set(0, 9, 34);
  // reflections for metal & enamel
  if (THREE.RoomEnvironment) { const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(new THREE.RoomEnvironment(), 0.04).texture; }

  /* ---------- lights ---------- */
  scene.add(new THREE.HemisphereLight(0x9fb8e0, 0x3a2414, 0.5));
  const moon = new THREE.DirectionalLight(0xc8dcff, 0.7); moon.position.set(-8, 24, 12);
  moon.castShadow = QUALITY === 'high'; moon.shadow.mapSize.set(2048, 2048);
  Object.assign(moon.shadow.camera, { left: -22, right: 22, top: 22, bottom: -22, near: 1, far: 70 }); moon.shadow.bias = -0.0006; moon.shadow.normalBias = 0.03;
  scene.add(moon);
  const lanterns = [];
  [[-9, 8.6, -6], [9, 8.6, -6], [-7, 8.2, 7], [7, 8.2, 7]].forEach(p => {
    const l = new THREE.PointLight(0xffb35c, 1.25, 26, 2); l.position.set(...p); scene.add(l);
    const g = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 12), new THREE.MeshBasicMaterial({ color: 0xffd08a }));
    g.position.copy(l.position); g.userData.kind = 'lantern'; scene.add(g);
    const cage = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 0.5, 6, 1, true), new THREE.MeshStandardMaterial({ color: 0x8a6a2a, metalness: .9, roughness: .35, wireframe: true }));
    cage.position.copy(l.position); scene.add(cage);
    const chain = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 22 - p[1], 4), new THREE.MeshStandardMaterial({ color: 0x5a4a2a, metalness: .8, roughness: .4 }));
    chain.position.set(p[0], (22 + p[1]) / 2 + .25, p[2]); scene.add(chain);
    lanterns.push({ l, g, p, ph: Math.random() * 6, on: true });
  });
  const centerLight = new THREE.PointLight(0x2fd17a, 1.2, 20, 2); centerLight.position.set(0, 3, 0); scene.add(centerLight);
  const focusLight = new THREE.PointLight(0x9ff0c8, 0, 12, 2); scene.add(focusLight);

  /* ---------- textures ---------- */
  function canvasTex(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; return t; }
  const woodTex = canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = '#6a4325'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 140; i++) { g.strokeStyle = `rgba(${25 + Math.random() * 40 | 0},${14 + Math.random() * 18 | 0},6,${.12 + Math.random() * .25})`; g.lineWidth = .6 + Math.random() * 2.2; g.beginPath(); const y = Math.random() * h; g.moveTo(0, y); for (let x = 0; x <= w; x += 12) g.lineTo(x, y + Math.sin(x * .02 + i) * 4 + Math.sin(x * .07 + i * 3) * 1.2); g.stroke(); }
    for (let i = 0; i < 6; i++) { const x = Math.random() * w, y = Math.random() * h; const rg = g.createRadialGradient(x, y, 1, x, y, 16); rg.addColorStop(0, 'rgba(30,15,5,.6)'); rg.addColorStop(1, 'rgba(30,15,5,0)'); g.fillStyle = rg; g.beginPath(); g.ellipse(x, y, 16, 7, 0, 0, 7); g.fill(); }
  });
  woodTex.wrapS = woodTex.wrapT = THREE.RepeatWrapping;
  const floorTex = canvasTex(2048, 2048, (g, w, h) => {
    g.fillStyle = '#2c1a0e'; g.fillRect(0, 0, w, h);
    const pw = 128; for (let y = 0; y < h; y += pw / 4) for (let x = -((y / (pw / 4)) % 2) * pw / 2; x < w; x += pw) {
      const l = 15 + Math.random() * 11; g.fillStyle = `hsl(${24 + Math.random() * 6},${36 + Math.random() * 14}%,${l}%)`; g.fillRect(x + 1.5, y + 1.5, pw - 3, pw / 4 - 3);
      g.fillStyle = 'rgba(255,220,170,.05)'; g.fillRect(x + 1.5, y + 1.5, pw - 3, 3); }
    const cx = w / 2, cy = h / 2;
    const gr = g.createRadialGradient(cx, cy, 20, cx, cy, 500); gr.addColorStop(0, '#173a5e'); gr.addColorStop(1, '#0a1a30');
    g.beginPath(); g.arc(cx, cy, 480, 0, 7); g.fillStyle = gr; g.fill(); g.lineWidth = 26; g.strokeStyle = '#05783f'; g.stroke();
    g.lineWidth = 6; g.strokeStyle = '#d4b26a'; g.beginPath(); g.arc(cx, cy, 448, 0, 7); g.stroke(); g.beginPath(); g.arc(cx, cy, 506, 0, 7); g.stroke();
    g.save(); g.translate(cx, cy); for (let i = 0; i < 32; i++) { g.rotate(Math.PI / 16); g.fillStyle = i % 2 ? 'rgba(5,120,63,.8)' : 'rgba(212,178,106,.75)'; g.beginPath(); g.moveTo(0, -430); g.lineTo(14, -392); g.lineTo(-14, -392); g.fill(); } g.restore();
    g.fillStyle = 'rgba(232,222,198,.75)'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = '700 120px Cinzel, Georgia, serif'; g.fillText('CEBI', cx, cy + 290);
    g.font = '600 46px Cinzel, Georgia, serif'; g.fillStyle = 'rgba(116,227,176,.8)'; g.fillText('BIBLIOTECA · AMBATO', cx, cy - 300);
  });
  const floor = new THREE.Mesh(new THREE.CircleGeometry(34, 96), new THREE.MeshStandardMaterial({ map: floorTex, roughness: .55, metalness: .08, envMapIntensity: .35 }));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);

  /* ---------- hall: walls, windows, ceiling, light shafts ---------- */
  (function hall() {
    const winTex = canvasTex(512, 512, (g, w, h) => { g.fillStyle = '#000'; g.fillRect(0, 0, w, h);
      const x0 = w * .3, x1 = w * .7, yt = h * .1, yb = h * .78, r = (x1 - x0) / 2;
      const gr = g.createLinearGradient(0, yt, 0, yb); gr.addColorStop(0, '#a9c8f8'); gr.addColorStop(.6, '#3d63a5'); gr.addColorStop(1, '#1d3462');
      g.fillStyle = gr; g.beginPath(); g.moveTo(x0, yb); g.lineTo(x0, yt + r); g.arc((x0 + x1) / 2, yt + r, r, Math.PI, 0); g.lineTo(x1, yb); g.closePath(); g.fill();
      for (let i = 0; i < 80; i++) { g.fillStyle = `rgba(255,255,255,${Math.random() * .9})`; g.fillRect(x0 + Math.random() * (x1 - x0), yt + r * .3 + Math.random() * (yb - yt - r * .3), 1.5, 1.5); }
      g.strokeStyle = '#000'; g.lineWidth = 7; g.beginPath(); g.moveTo((x0 + x1) / 2, yt); g.lineTo((x0 + x1) / 2, yb); for (let y = yt + r; y < yb; y += 52) { g.moveTo(x0, y); g.lineTo(x1, y); } g.stroke();
      g.beginPath(); g.arc((x0 + x1) / 2, yt + r, r * .55, Math.PI, 0); g.stroke(); });
    const wallTex = canvasTex(512, 512, (g, w, h) => { g.fillStyle = '#2a2520'; g.fillRect(0, 0, w, h);
      for (let y = 0; y < h; y += 32) { const off = (y / 32) % 2 ? 24 : 0; for (let x = -48; x < w; x += 64) { const l = 13 + Math.random() * 9; g.fillStyle = `hsl(28,9%,${l}%)`; g.fillRect(x + off + 2, y + 2, 60, 28); } }
      const x0 = w * .3, x1 = w * .7, yt = h * .1, yb = h * .78, r = (x1 - x0) / 2; g.fillStyle = '#000'; g.beginPath(); g.moveTo(x0, yb); g.lineTo(x0, yt + r); g.arc((x0 + x1) / 2, yt + r, r, Math.PI, 0); g.lineTo(x1, yb); g.closePath(); g.fill();
      g.strokeStyle = '#6b5638'; g.lineWidth = 12; g.stroke();
      const wg = g.createLinearGradient(0, h * .84, 0, h); wg.addColorStop(0, '#4a2e18'); wg.addColorStop(1, '#24150a'); g.fillStyle = wg; g.fillRect(0, h * .84, w, h * .16);
      g.fillStyle = '#9b7344'; g.fillRect(0, h * .84, w, 5); });
    [winTex, wallTex].forEach(t => { t.wrapS = THREE.RepeatWrapping; t.repeat.set(10, 1); });
    const wall = new THREE.Mesh(new THREE.CylinderGeometry(28, 28, 24, 96, 1, true), new THREE.MeshStandardMaterial({ map: wallTex, emissiveMap: winTex, emissive: 0xffffff, emissiveIntensity: .95, roughness: .9, side: THREE.BackSide }));
    wall.position.y = 12; wall.receiveShadow = true; scene.add(wall);
    const ceil = new THREE.Mesh(new THREE.CircleGeometry(28, 64), new THREE.MeshStandardMaterial({ color: 0x120c08, roughness: 1, side: THREE.DoubleSide })); ceil.rotation.x = Math.PI / 2; ceil.position.y = 24; scene.add(ceil);
    const shaftTex = canvasTex(64, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(.15, 'rgba(255,255,255,.9)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      const sg = g.createLinearGradient(0, 0, w, 0); sg.addColorStop(0, 'rgba(0,0,0,1)'); sg.addColorStop(.5, 'rgba(0,0,0,0)'); sg.addColorStop(1, 'rgba(0,0,0,1)'); g.globalCompositeOperation = 'destination-out'; g.fillStyle = sg; g.fillRect(0, 0, w, h); });
    const shaftMat = new THREE.MeshBasicMaterial({ map: shaftTex, color: 0x9cc3f5, transparent: true, opacity: .06, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false });
    [-2.25, -1.57, -.9, -1.95, -1.2].forEach((a, i) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 3.4, 26, 20, 1, true), shaftMat);
      const from = V3(27 * Math.cos(a), 16, 27 * Math.sin(a)), to = V3(4 * Math.cos(a + .3 * (i % 2 ? 1 : -1)), 0, 4 * Math.sin(a));
      m.position.copy(from).add(to).multiplyScalar(.5); m.quaternion.setFromUnitVectors(YUP, from.clone().sub(to).normalize()); scene.add(m); });
  })();

  /* ---------- dust ---------- */
  const DN = mobile ? 400 : 1000, dpos = new Float32Array(DN * 3);
  for (let i = 0; i < DN; i++) { const r = Math.sqrt(Math.random()) * 22, a = Math.random() * 6.28; dpos[i * 3] = Math.cos(a) * r; dpos[i * 3 + 1] = Math.random() * 15; dpos[i * 3 + 2] = Math.sin(a) * r; }
  const dgeo = new THREE.BufferGeometry(); dgeo.setAttribute('position', new THREE.BufferAttribute(dpos, 3));
  const softDot = canvasTex(64, 64, g => { const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.4, 'rgba(255,255,255,.35)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); });
  const dust = new THREE.Points(dgeo, new THREE.PointsMaterial({ color: 0xffe1b0, size: .09, map: softDot, transparent: true, opacity: .5, depthWrite: false, blending: THREE.AdditiveBlending }));
  scene.add(dust);

  /* ---------- shelves with real books ---------- */
  const SH = (typeof SHELVES !== 'undefined') ? SHELVES : [];
  const shelfObjs = {}, pickables = [], bookMeshes = [];
  const woodMat = new THREE.MeshStandardMaterial({ map: woodTex, color: 0xb47c4a, roughness: .55, metalness: .05, envMapIntensity: .4 });
  const darkWood = new THREE.MeshStandardMaterial({ map: woodTex, color: 0x6e4a2c, roughness: .7, envMapIntensity: .3 });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xd4b26a, metalness: 1, roughness: .28, envMapIntensity: 1.2 });
  const spineTex = canvasTex(128, 256, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, '#7d7d7d'); gr.addColorStop(.22, '#f4f4f4'); gr.addColorStop(.6, '#dadada'); gr.addColorStop(1, '#6f6f6f'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(255,214,120,.95)'; [16, 24, h - 28, h - 20].forEach(y => g.fillRect(8, y, w - 16, 4));
    g.fillStyle = 'rgba(0,0,0,.32)'; g.fillRect(18, h * .3, w - 36, h * .22);
    g.fillStyle = 'rgba(255,214,120,.8)'; for (let i = 0; i < 3; i++) g.fillRect(28, h * .34 + i * 14, w - 56 - i * 14, 5);
    for (let i = 0; i < 500; i++) { g.fillStyle = `rgba(0,0,0,${Math.random() * .08})`; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
  });
  const BOOKC = [0x173559, 0x05783f, 0x7a2e2e, 0x8a6a2a, 0x2d5f73, 0x5b3a6e, 0xd8c9a8, 0x3e5a2a, 0x9c5a2c, 0x24476b, 0x2f6b5c, 0x7a4a5e, 0xb4492f, 0x1d4277];
  const W = 3.2, H = 5.4, D = .75, ROWS = 5, RH = (H - .3) / ROWS, R = 15.5, SPREAD = Math.PI * 1.38;
  function labelTex(text, sub) { return canvasTex(512, 160, (g, w, h) => {
    g.fillStyle = 'rgba(7,13,26,.88)'; g.strokeStyle = '#d4b26a'; g.lineWidth = 4; const r = 24; g.beginPath(); g.moveTo(r, 4); g.arcTo(w - 4, 4, w - 4, h - 4, r); g.arcTo(w - 4, h - 4, 4, h - 4, r); g.arcTo(4, h - 4, 4, 4, r); g.arcTo(4, 4, w - 4, 4, r); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = '#f2ead8'; g.textAlign = 'center'; let fs = 52; do { g.font = `700 ${fs}px Cinzel, Georgia, serif`; fs -= 2; } while (g.measureText(text).width > w - 50 && fs > 20); g.fillText(text, w / 2, 72);
    g.fillStyle = '#74e3b0'; fs = 30; do { g.font = `700 ${fs}px "Nunito Sans", sans-serif`; fs -= 1; } while (g.measureText(sub).width > w - 40 && fs > 14); g.fillText(sub, w / 2, 120); }); }
  function shelfBooks(k) {
    const list = (typeof ALL !== 'undefined' ? ALL : []).filter(b => b.sh === k);
    const rows = { 0: list }; for (let r = 1; r <= 5; r++) rows[r] = list.filter(b => b.row === r);
    return rows;
  }
  function buildShelves() {
    SH.forEach((s, i) => {
      const a = -Math.PI / 2 + (i / (SH.length - 1) - .5) * SPREAD, x = R * Math.cos(a), z = R * Math.sin(a);
      const grp = new THREE.Group(); grp.position.set(x, 0, z); grp.lookAt(0, 0, 0); scene.add(grp);
      const box = (w, h, d, px, py, pz, m) => { const me = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m || woodMat); me.position.set(px, py, pz); me.castShadow = me.receiveShadow = true; me.userData = { kind: 'shelf', k: s.k }; grp.add(me); pickables.push(me); return me; };
      box(W, H, .08, 0, H / 2, -D / 2, darkWood); box(.14, H + .2, D, -W / 2, H / 2 + .1, 0); box(.14, H + .2, D, W / 2, H / 2 + .1, 0); box(W + .4, .18, D + .2, 0, H + .25, 0); box(W, .14, D, 0, .07, 0);
      for (let r = 1; r < ROWS; r++) box(W, .07, D, 0, .15 + r * RH, 0);
      const crown = new THREE.Mesh(new THREE.BoxGeometry(W * .62, .1, .06), goldMat); crown.position.set(0, H + .2, D / 2 + .08); grp.add(crown);
      // books mapped to real catalogue entries
      const rowsB = shelfBooks(s.k), n = ROWS * 32;
      const inst = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ map: spineTex, roughness: .55, metalness: .05, envMapIntensity: .5 }), n);
      inst.castShadow = inst.receiveShadow = true;
      const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), col = new THREE.Color(); let c = 0; const map = [], mats = [], cols = [];
      for (let r = 0; r < ROWS; r++) {
        let xx = -W / 2 + .12, k = 0; const y0 = .15 + r * RH + .04; const pool = rowsB[ROWS - r].length ? rowsB[ROWS - r] : rowsB[0];
        while (xx < W / 2 - .2 && c < n) {
          const bw = .06 + Math.random() * .09, bh = RH * (.6 + Math.random() * .3), bd = D * (.55 + Math.random() * .25);
          if (Math.random() < .04) { xx += .15; continue; }
          const lean = Math.random() < .05 ? (.12 + Math.random() * .15) : 0; q.setFromAxisAngle(V3(0, 0, 1), -lean);
          m4.compose(V3(xx + bw / 2, y0 + bh / 2, -D / 2 + .06 + bd / 2), q, V3(bw, bh, bd)); inst.setMatrixAt(c, m4); mats.push(m4.clone());
          const book = pool.length ? pool[(k * 7 + r * 13 + i * 3) % pool.length] : null; map.push(book ? book.id : null);
          col.set(book ? book.col : '#' + BOOKC[(Math.random() * BOOKC.length) | 0].toString(16).padStart(6, '0')).convertSRGBToLinear().multiplyScalar(.85 + Math.random() * .4);
          inst.setColorAt(c, col); cols.push(col.clone()); c++; k++; xx += bw + .005 + (lean ? .08 : 0);
        }
      }
      inst.count = c; inst.instanceMatrix.needsUpdate = true; if (inst.instanceColor) inst.instanceColor.needsUpdate = true;
      inst.userData = { kind: 'book', k: s.k, map, mats, cols }; grp.add(inst); pickables.push(inst); bookMeshes.push(inst);
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: labelTex(s.n.replace('Librero ', '').replace('Material ', '').toUpperCase(), s.d), transparent: true, depthWrite: false }));
      sp.scale.set(2.9, .9, 1); sp.position.set(0, H + 1.35, 0); grp.add(sp);
      const frame = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(W + .3, H + .5, D + .3)), new THREE.LineBasicMaterial({ color: 0x9ff0c8, transparent: true, opacity: 0 }));
      frame.position.set(0, H / 2 + .15, 0); grp.add(frame);
      const rowHL = new THREE.Mesh(new THREE.PlaneGeometry(W - .1, RH - .05), new THREE.MeshBasicMaterial({ color: 0x2fb36d, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
      rowHL.position.set(0, 0, D / 2 + .02); grp.add(rowHL);
      shelfObjs[s.k] = { grp, frame, rowHL, a, pos: V3(x, 0, z), inst, hover: 0 };
    });
  }

  /* ---------- pedestal + realistic enamel shield ---------- */
  const ped = new THREE.Group(); scene.add(ped);
  const marbleTex = canvasTex(512, 256, (g, w, h) => { g.fillStyle = '#0d3b2a'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 40; i++) { g.strokeStyle = `rgba(${150 + Math.random() * 100 | 0},${200 + Math.random() * 55 | 0},${170 + Math.random() * 60 | 0},${.08 + Math.random() * .22})`; g.lineWidth = .5 + Math.random() * 2; g.beginPath(); let x = Math.random() * w, y = Math.random() * h; g.moveTo(x, y); for (let k = 0; k < 8; k++) { x += (Math.random() - .3) * 70; y += (Math.random() - .5) * 40; g.lineTo(x, y); } g.stroke(); } });
  const marble = new THREE.MeshPhysicalMaterial({ map: marbleTex, roughness: .22, metalness: 0, clearcoat: .8, clearcoatRoughness: .15, envMapIntensity: .8 });
  [[2.9, 3.2, .45, .22], [2.3, 2.6, .5, .7], [1.5, 1.75, 1.0, 1.45]].forEach(([r1, r2, hgt, y]) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, hgt, 64), marble); m.position.y = y; m.castShadow = m.receiveShadow = true; ped.add(m);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(r1 + .01, .035, 8, 96), goldMat); rim.rotation.x = Math.PI / 2; rim.position.y = y + hgt / 2; ped.add(rim); });
  const halo = new THREE.Mesh(new THREE.TorusGeometry(1.75, .03, 8, 120), new THREE.MeshBasicMaterial({ color: 0x2fd17a })); halo.rotation.x = Math.PI / 2; halo.position.y = 2.15; ped.add(halo);
  const shield = new THREE.Group(); shield.position.y = 4.4; ped.add(shield);
  (function buildShield() {
    const Hs = 2.7, Ws = Hs * 525 / 718;
    const shp = new THREE.Shape(SHIELD_PTS.map(([x, y]) => new THREE.Vector2((x - .5) * Ws, (y - .5) * Hs)));
    const geo = new THREE.ExtrudeGeometry(shp, { depth: .16, bevelEnabled: true, bevelThickness: .05, bevelSize: .035, bevelSegments: 5, curveSegments: 4 });
    geo.translate(0, 0, -.08);
    const tex = new THREE.TextureLoader().load('img/cebi-shield.png'); tex.encoding = THREE.sRGBEncoding; tex.anisotropy = 8;
    tex.repeat.set(1 / Ws, 1 / Hs); tex.offset.set(.5, .5); tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
    const enamel = new THREE.MeshPhysicalMaterial({ map: tex, roughness: .3, metalness: .05, clearcoat: 1, clearcoatRoughness: .08, envMapIntensity: 1.3 });
    const front = new THREE.Mesh(geo, [enamel, goldMat]); front.castShadow = true; front.userData.kind = 'shield'; shield.add(front); pickables.push(front);
    const back = new THREE.Mesh(new THREE.ExtrudeGeometry(shp, { depth: .06, bevelEnabled: true, bevelThickness: .03, bevelSize: .09, bevelSegments: 4, curveSegments: 4 }), goldMat);
    back.position.z = -.16; back.scale.set(1.0, 1.0, 1); shield.add(back);
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(Ws * 2.2, Hs * 1.9), new THREE.MeshBasicMaterial({ map: softDot, color: 0x2fd17a, transparent: true, opacity: .35, blending: THREE.AdditiveBlending, depthWrite: false }));
    glow.position.z = -.3; shield.add(glow);
  })();

  /* ---------- banners (banderines) with IB & CEBI logos ---------- */
  const banners = [];
  const BANNERS = [
    { k: 'pep', img: 'img/pyp-ring.webp', bg: '#fbf6ea', band: '#f2b705' },
    { k: 'pai', img: 'img/myp-ring.webp', bg: '#fbf6ea', band: '#e2502a' },
    { k: 'cebi', img: 'img/cebi-shield.png', bg: '#173559', band: '#05783f', big: true },
    { k: 'pd', img: 'img/dp-ring.webp', bg: '#fbf6ea', band: '#1aa6c9' },
    { k: 'perfil', img: 'img/learner-profile.webp', bg: '#fbf6ea', band: '#173559' },
    { k: 'ws', img: 'img/world-school.png', bg: '#fbf6ea', band: '#2f4f9c' },
    { k: 'cont', img: 'img/continuum.png', bg: '#fbf6ea', band: '#8a5aa6' }
  ];
  function bannerCanvas(b, img) {
    const c = document.createElement('canvas'); c.width = 512; c.height = 1024; const g = c.getContext('2d');
    const w = 512, h = 1024, cut = 120;
    g.beginPath(); g.moveTo(0, 0); g.lineTo(w, 0); g.lineTo(w, h - cut); g.lineTo(w / 2, h); g.lineTo(0, h - cut); g.closePath(); g.save(); g.clip();
    g.fillStyle = b.bg; g.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 3) { g.fillStyle = `rgba(0,0,0,${.02 + Math.random() * .03})`; g.fillRect(0, y, w, 1); }
    for (let x = 0; x < w; x += 3) { g.fillStyle = `rgba(255,255,255,${Math.random() * .025})`; g.fillRect(x, 0, 1, h); }
    g.fillStyle = b.band; g.fillRect(0, 0, w, 90); g.fillRect(0, h - cut - 70, w, 40);
    g.strokeStyle = '#d4b26a'; g.lineWidth = 14; g.stroke(); g.restore();
    g.strokeStyle = '#d4b26a'; g.lineWidth = 10; g.beginPath(); g.moveTo(5, 0); g.lineTo(5, h - cut); g.lineTo(w / 2, h - 6); g.lineTo(w - 5, h - cut); g.lineTo(w - 5, 0); g.stroke();
    if (img) { const mw = b.big ? 330 : 400, s = Math.min(mw / img.width, 560 / img.height); const iw = img.width * s, ih = img.height * s; g.drawImage(img, (w - iw) / 2, 130 + (600 - ih) / 2, iw, ih); }
    return c;
  }
  function buildBanners() {
    const n = BANNERS.length;
    BANNERS.forEach((b, i) => {
      const a = -Math.PI / 2 + (i / (n - 1) - .5) * SPREAD * .98, r = 19.5;
      const grp = new THREE.Group(); grp.position.set(r * Math.cos(a), 0, r * Math.sin(a)); grp.lookAt(0, 0, 0); scene.add(grp);
      const geo = new THREE.PlaneGeometry(2.4, 4.8, 10, 24); const base = Float32Array.from(geo.attributes.position.array);
      const c0 = bannerCanvas(b, null); const tex = new THREE.CanvasTexture(c0); tex.encoding = THREE.sRGBEncoding; tex.anisotropy = 8;
      const mat = new THREE.MeshStandardMaterial({ map: tex, side: THREE.DoubleSide, alphaTest: .5, transparent: false, roughness: .85, metalness: 0, envMapIntensity: .3 });
      const cloth = new THREE.Mesh(geo, mat); cloth.position.y = 11.2; cloth.castShadow = true; cloth.userData = { kind: 'banner', k: b.k }; grp.add(cloth); pickables.push(cloth);
      const rod = new THREE.Mesh(new THREE.CylinderGeometry(.05, .05, 2.9, 12), goldMat); rod.rotation.z = Math.PI / 2; rod.position.y = 13.65; grp.add(rod);
      [-1.45, 1.45].forEach(x => { const f = new THREE.Mesh(new THREE.SphereGeometry(.09, 12, 10), goldMat); f.position.set(x, 13.65, 0); grp.add(f); });
      const cord = new THREE.Mesh(new THREE.CylinderGeometry(.012, .012, 24 - 13.65, 4), goldMat); cord.position.y = (24 + 13.65) / 2; grp.add(cord);
      const im = new Image(); im.onload = () => { const c = bannerCanvas(b, im); tex.image = c; tex.needsUpdate = true; }; im.src = b.img;
      banners.push({ cloth, base, ph: Math.random() * 6 });
    });
  }

  /* ---------- breath / smoke particles ---------- */
  const BN = 360, bpos = new Float32Array(BN * 3), bcol = new Float32Array(BN * 3), bvel = Array.from({ length: BN }, () => V3()), blife = new Float32Array(BN);
  for (let i = 0; i < BN; i++) bpos[i * 3 + 1] = -99;
  const bgeo = new THREE.BufferGeometry(); bgeo.setAttribute('position', new THREE.BufferAttribute(bpos, 3)); bgeo.setAttribute('color', new THREE.BufferAttribute(bcol, 3));
  const bpts = new THREE.Points(bgeo, new THREE.PointsMaterial({ size: .45, map: softDot, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); bpts.frustumCulled = false; scene.add(bpts);
  let bi = 0, breathT = 0, breathCol = [.3, 1, .6];
  function emit(pos, dir, n, spd, col) { for (let k = 0; k < n; k++) { const p = bi++ % BN; bpos[p * 3] = pos.x; bpos[p * 3 + 1] = pos.y; bpos[p * 3 + 2] = pos.z;
    bvel[p].copy(dir).multiplyScalar(spd * (.7 + Math.random() * .6)).add(V3((Math.random() - .5) * 1.6, (Math.random() - .3) * 1.2, (Math.random() - .5) * 1.6)); blife[p] = 1; bcol[p * 3] = col[0]; bcol[p * 3 + 1] = col[1]; bcol[p * 3 + 2] = col[2]; } }
  function updateParticles(dt) {
    for (let p = 0; p < BN; p++) { if (blife[p] <= 0) continue; blife[p] -= dt * .85; const l = Math.max(0, blife[p]);
      bpos[p * 3] += bvel[p].x * dt; bpos[p * 3 + 1] += bvel[p].y * dt + dt * .7; bpos[p * 3 + 2] += bvel[p].z * dt; bvel[p].multiplyScalar(.965);
      const k = l * l; bcol[p * 3] *= .985; bcol[p * 3 + 1] *= .985; bcol[p * 3 + 2] *= .985; if (l <= 0) bpos[p * 3 + 1] = -99; }
    bgeo.attributes.position.needsUpdate = true; bgeo.attributes.color.needsUpdate = true;
  }

  /* ---------- DRACO: four-legged dragon that follows the cursor ---------- */
  const D_ = { ready: false, pivot: null, inner: null, mixer: null, acts: {}, cur: null, head: null, mouth: null, eyes: [], heading: 0, pos: V3(0, 0, 7.5),
    target: V3(0, 0, 7.5), state: 'ground', flyT: 0, lastPointer: performance.now(), mood: 'happy', moodT: 0, sleepUntil: 0, proxy: null, faceCam: 0, y: 0 };
  function setAction(name, fade) {
    const a = D_.acts[name]; if (!a || D_.cur === a) return;
    a.reset().setEffectiveWeight(1).fadeIn(fade || .35).play(); if (D_.cur) D_.cur.fadeOut(fade || .35); D_.cur = a;
  }
  function initDragon() {
    if (!THREE.GLTFLoader) { dragonFail(); return; }
    new THREE.GLTFLoader().load('models/dragon.glb', gltf => {
      const model = gltf.scene;
      model.traverse(o => {
        if (o.isBone) { const n = o.name; if (n === 'upper_lip') D_.mouth = o; if (n === 'IK_head') D_.head = o; if (/^Auge_Lens_[LR]$/.test(n)) D_.eyes.push(o); }
        if (o.isMesh) { o.castShadow = true; o.frustumCulled = false; const m = o.material; if (m) { m.envMapIntensity = .9; if (m.emissive) { m.emissive.setHex(0x061630); m.emissiveIntensity = .35; } } }
      });
      const box = new THREE.Box3().setFromObject(model); const size = box.getSize(V3()); const s = 8 / Math.max(size.x, size.z); model.scale.setScalar(s);
      model.updateMatrixWorld(true); box.setFromObject(model); const c = box.getCenter(V3()); model.position.x -= c.x; model.position.z -= c.z; model.position.y -= box.min.y;
      D_.inner = new THREE.Group(); D_.inner.add(model);
      if (D_.head) { model.updateMatrixWorld(true); const hp = D_.head.getWorldPosition(V3()); D_.inner.rotation.y = -Math.atan2(hp.x, hp.z); }
      D_.pivot = new THREE.Group(); D_.pivot.add(D_.inner); D_.pivot.position.copy(D_.pos); scene.add(D_.pivot);
      D_.mixer = new THREE.AnimationMixer(model);
      gltf.animations.forEach(cl => { const k = /fly/i.test(cl.name) ? 'fly' : /run/i.test(cl.name) ? 'run' : /walk/i.test(cl.name) ? 'walk' : 'idle'; D_.acts[k] = D_.mixer.clipAction(cl); });
      setAction('idle', .01);
      // glowing eyes (mood indicator)
      const eyeMat = new THREE.MeshBasicMaterial({ color: 0x8dffc0 });
      D_.eyeMat = eyeMat;
      D_.eyes.forEach(b => { const e = new THREE.Mesh(new THREE.SphereGeometry(.06 / s, 10, 8), eyeMat); b.add(e); const l = new THREE.PointLight(0x8dffc0, .0, 2.5, 2); b.add(l); D_.eyeLight = l; });
      D_.proxy = new THREE.Mesh(new THREE.SphereGeometry(2.4, 12, 8), new THREE.MeshBasicMaterial({ visible: false })); D_.proxy.userData.kind = 'dragon'; scene.add(D_.proxy); pickables.push(D_.proxy);
      D_.ready = true; D_.heading = 0; ldMsg.textContent = '¡Draco ha despertado!'; ldBar.style.width = '100%'; setTimeout(hideLoader, 500);
    }, e => { if (e.total) { const p = e.loaded / e.total; ldBar.style.width = (10 + p * 85) + '%'; ldMsg.textContent = `Despertando a Draco… ${Math.round(p * 100)}%`; } }, err => { console.warn('dragon', err); dragonFail(); });
  }
  function dragonFail() { ldMsg.textContent = 'Draco duerme hoy (no se pudo cargar el modelo 3D).'; setTimeout(hideLoader, 900); }
  const tmpV = V3(), tmpV2 = V3(), fwdV = V3();
  function angDiff(a, b) { let d = b - a; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return d; }
  function pathFly(t, out) { return out.set(8.2 * Math.cos(t) + 1.4 * Math.cos(2 * t + 1), 6.6 + 1.1 * Math.sin(1.6 * t), 8.2 * Math.sin(t) + 1.4 * Math.sin(2 * t + 1) - 1); }
  function updateDragon(dt, time) {
    if (!D_.ready) return;
    const now = performance.now(), sleeping = now < D_.sleepUntil, calmK = CALM ? .6 : 1;
    D_.mixer.update(dt * (sleeping ? .35 : 1));
    if (D_.state === 'ground' && !sleeping && !CALM && now - D_.lastPointer > 28000 && view === 'inicio') { D_.state = 'takeoff'; D_.flyT = 0; setAction('fly', .5); }
    if (D_.state === 'ground') {
      let tgt = sleeping ? tmpV2.set(0, 0, 4.2) : D_.target;
      tmpV.copy(tgt).sub(D_.pos); tmpV.y = 0; const dist = tmpV.length();
      let desired = Math.atan2(tmpV.x, tmpV.z);
      if (D_.faceCam > 0) { D_.faceCam -= dt; tmpV.copy(camera.position).sub(D_.pos); desired = Math.atan2(tmpV.x, tmpV.z); }
      const diff = angDiff(D_.heading, desired), turnRate = (dist > 6 ? 3.2 : 2.4) * calmK;
      if (dist > .9 || D_.faceCam > 0) D_.heading += Math.max(-turnRate * dt, Math.min(turnRate * dt, diff));
      let speed = 0;
      if (D_.faceCam <= 0 && dist > 1.0 && Math.abs(diff) < 1.3) speed = (dist > 6 && !sleeping ? 4.2 : 1.6) * calmK;
      setAction(speed > 3 ? 'run' : speed > 0 ? 'walk' : 'idle');
      if (D_.acts.walk) D_.acts.walk.timeScale = 1.05 * calmK; if (D_.acts.run) D_.acts.run.timeScale = 1 * calmK;
      fwdV.set(Math.sin(D_.heading), 0, Math.cos(D_.heading));
      D_.pos.addScaledVector(fwdV, speed * dt);
      const rr = Math.hypot(D_.pos.x, D_.pos.z);
      if (rr < 4.0) D_.pos.multiplyScalar(4.0 / rr); if (rr > 12) D_.pos.multiplyScalar(12 / rr);
      D_.y += (0 - D_.y) * Math.min(1, dt * 3);
    } else {
      D_.flyT += dt;
      const t = D_.flyT * .16 + Math.atan2(D_.pos.z, D_.pos.x);
      if (D_.state === 'takeoff') { pathFly(t, tmpV); D_.pos.x += (tmpV.x - D_.pos.x) * dt * .8; D_.pos.z += (tmpV.z - D_.pos.z) * dt * .8; D_.y += (tmpV.y - D_.y) * dt * .9; if (D_.flyT > 2.5) D_.state = 'fly'; }
      else if (D_.state === 'fly') { pathFly(t, tmpV); pathFly(t + .03, tmpV2); D_.pos.x = tmpV.x; D_.pos.z = tmpV.z; D_.y = tmpV.y; D_.heading = Math.atan2(tmpV2.x - tmpV.x, tmpV2.z - tmpV.z); if (now - D_.lastPointer < 1500 || D_.flyT > 18) { D_.state = 'land'; D_.flyT = 0; } }
      else if (D_.state === 'land') { D_.y += (0 - D_.y) * Math.min(1, dt * 1.6); const rr = Math.hypot(D_.pos.x, D_.pos.z); if (rr > 11.5) D_.pos.multiplyScalar(11.5 / rr); if (D_.y < .08) { D_.y = 0; D_.state = 'ground'; setAction('idle', .5); } }
    }
    D_.pivot.position.set(D_.pos.x, D_.y, D_.pos.z); D_.pivot.rotation.y = D_.heading;
    if (D_.proxy) D_.proxy.position.set(D_.pos.x, D_.y + 1.8, D_.pos.z);
    // mood: eye colour + breath
    const col = sleeping ? 0x335544 : D_.mood === 'angry' ? 0xff4a2a : D_.mood === 'warn' ? 0xffc84a : 0x8dffc0;
    if (D_.eyeMat) D_.eyeMat.color.setHex(col); if (D_.eyeLight) { D_.eyeLight.color.setHex(col); D_.eyeLight.intensity = D_.mood === 'angry' ? 1.5 : .6; }
    if (D_.moodT > 0) { D_.moodT -= dt; if (D_.moodT <= 0) D_.mood = 'happy'; }
    if (breathT > 0 && D_.mouth) { breathT -= dt; D_.mouth.getWorldPosition(tmpV); fwdV.set(Math.sin(D_.heading), -.1, Math.cos(D_.heading)); emit(tmpV, fwdV, CALM ? 1 : 4, D_.mood === 'angry' ? 8 : 5, breathCol); }
  }
  function dragonScreen() {
    if (!D_.ready) return null;
    (D_.head || D_.pivot).getWorldPosition(tmpV); tmpV.y += .9; const p = tmpV.clone().project(camera);
    return { x: (p.x * .5 + .5) * innerWidth, y: (-p.y * .5 + .5) * innerHeight, visible: p.z < 1 && Math.abs(p.x) < 1.1 && Math.abs(p.y) < 1.1 };
  }

  /* ---------- camera ---------- */
  const VIEWCAM = { inicio: [V3(2, 6.4, 24), V3(1, 4.2, 0)], catalogo: [V3(-3, 7, 19), V3(-4, 6, -6)], descubridor: [V3(0, 4.5, 17), V3(0, 6.5, -4)], mapa: [V3(0, 32, 15), V3(0, 0, -1)],
    prestamos: [V3(7, 8, 18), V3(2, 5, -4)], inventario: [V3(-8, 6, 16), V3(-6, 4, -8)], reportes: [V3(0, 15, 22), V3(0, 3, -2)] };
  const camPos = V3(0, 9, 36), camLook = V3(0, 5, 0), tgtPos = V3(2, 6.4, 24), tgtLook = V3(1, 4.2, 0);
  let view = 'inicio', focus = null, orbit = 0, orbitT = 0, shake = 0;
  function setView(v) { view = v; focus = null; clearHL(); const c = VIEWCAM[v] || VIEWCAM.inicio; tgtPos.copy(c[0]); tgtLook.copy(c[1]); if (v === 'mapa') orbit = orbitT = 0; }
  function clearHL() { Object.values(shelfObjs).forEach(o => { o.frame.material.opacity = 0; o.rowHL.material.opacity = 0; }); focusLight.intensity = 0; }
  function focusShelfFn(k, row) {
    const o = shelfObjs[k]; if (!o) return; clearHL(); focus = { k, row };
    const inward = o.pos.clone().negate().normalize();
    tgtLook.set(o.pos.x, row ? (.15 + (5 - row + .5) * RH) : H / 2, o.pos.z);
    tgtPos.copy(o.pos).addScaledVector(inward, 7.5).setY(row ? 3.4 : 4.2); tgtPos.addScaledVector(V3(-inward.z, 0, inward.x), 1.2);
    if (row) o.rowHL.position.y = .15 + (5 - row + .5) * RH;
    focusLight.position.copy(o.pos).addScaledVector(inward, 2).setY(3);
    if (D_.ready) { D_.target.copy(o.pos).addScaledVector(inward, 5); D_.lastPointer = performance.now() + 6000; }
  }
  function lookAtShelf(k) { const o = shelfObjs[k]; if (o && D_.ready && view === 'inicio') { D_.target.copy(o.pos).addScaledVector(o.pos.clone().negate().normalize(), 5); D_.lastPointer = performance.now() + 4000; } }

  /* ---------- pointer & picking ---------- */
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), floorPlane = new THREE.Plane(YUP, 0);
  let hoverObj = null, hoverInst = null, lastHoverAt = 0, overCanvas = false, pointerXY = [0, 0];
  const canvas = renderer.domElement;
  function setNDC(e) { ndc.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); pointerXY = [e.clientX, e.clientY]; }
  addEventListener('pointermove', e => {
    setNDC(e); overCanvas = e.target === canvas;
    if (D_.ready && !(performance.now() < D_.sleepUntil) && (view === 'inicio' || view === 'mapa')) {
      ray.setFromCamera(ndc, camera); const p = ray.ray.intersectPlane(floorPlane, tmpV2.clone());
      if (p) { const r = Math.hypot(p.x, p.z); if (r > 11.5) p.multiplyScalar(11.5 / r); D_.target.set(p.x, 0, p.z); D_.lastPointer = performance.now(); if (D_.state === 'fly') { D_.state = 'land'; D_.flyT = 0; } }
    }
    if (!overCanvas) { setHover(null); if (window.onHover3D) onHover3D(null); }
  }, { passive: true });
  function pick() { ray.setFromCamera(ndc, camera); const hits = ray.intersectObjects(pickables, false); return hits[0] || null; }
  function hoverInfo(h) {
    const u = h.object.userData;
    if (u.kind === 'dragon') return '<b>Draco, el dragón guardián</b><small>Haz clic para un dato curioso</small>';
    if (u.kind === 'shield') return '<b>Escudo del CEBI</b><small>Unidad Educativa CEBI · desde 1993</small>';
    if (u.kind === 'banner') return `<b>${({ pep: 'Programa de la Escuela Primaria', pai: 'Programa de los Años Intermedios', pd: 'Programa del Diploma', perfil: 'Perfil de la comunidad de aprendizaje', ws: 'Colegio del Mundo del IB', cont: 'Continuo del IB', cebi: 'Unidad Educativa CEBI' })[u.k]}</b><small>Clic para saber más</small>`;
    if (u.kind === 'lantern') return '<b>Farol</b><small>Clic para encender o apagar</small>';
    if (u.kind === 'book' && h.instanceId != null) { const id = u.map[h.instanceId], b = id && typeof BYID !== 'undefined' ? BYID[id] : null; if (b) return `<b>${esc(b.t)}</b><small>${esc(b.a || '')}${b.a ? ' · ' : ''}${avail(b).st === 'yes' ? 'Disponible' : 'No disponible'} · clic para abrir</small>`; }
    if (u.kind === 'shelf' || u.kind === 'book') { const s = SHELF_BY[u.k]; const n = (typeof ALL !== 'undefined') ? ALL.filter(b => b.sh === u.k).length : 0; return `<b>${esc(s.n)}</b><small>${esc(s.d)} · ${nf(n)} títulos · clic para explorar</small>`; }
    return null;
  }
  function setHover(h) {
    if (hoverInst && (!h || h.object !== hoverInst.mesh || h.instanceId !== hoverInst.id)) { const m = hoverInst.mesh; m.setColorAt(hoverInst.id, m.userData.cols[hoverInst.id]); m.instanceColor.needsUpdate = true; hoverInst = null; }
    Object.values(shelfObjs).forEach(o => { if (!focus || focus.k !== Object.keys(shelfObjs).find(k => shelfObjs[k] === o)) o.hover = 0; });
    if (!h) { canvas.style.cursor = ''; hoverObj = null; return; }
    const u = h.object.userData; canvas.style.cursor = 'pointer'; hoverObj = h.object;
    if (u.kind === 'book' && h.instanceId != null) { const m = h.object; m.setColorAt(h.instanceId, new THREE.Color(0xfff2c8)); m.instanceColor.needsUpdate = true; hoverInst = { mesh: m, id: h.instanceId }; }
    if (u.k && shelfObjs[u.k]) shelfObjs[u.k].hover = 1;
  }
  function hoverTick(now) {
    if (now - lastHoverAt < 70 || !overCanvas || PAUSED) return; lastHoverAt = now;
    const h = pick(); setHover(h); if (window.onHover3D) onHover3D(h ? hoverInfo(h) : null, pointerXY[0], pointerXY[1]);
  }
  const slides = [];
  let drag = null;
  canvas.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY, o: orbitT, moved: false }; setNDC(e); });
  addEventListener('pointermove', e => { if (!drag) return; const dx = e.clientX - drag.x; if (Math.abs(dx) + Math.abs(e.clientY - drag.y) > 6) drag.moved = true; if (view === 'mapa' && drag.moved) orbitT = drag.o + dx * .006; });
  addEventListener('pointerup', e => { if (drag && !drag.moved && e.target === canvas) click(e); drag = null; });
  function click(e) {
    setNDC(e); const h = pick(); if (!h) return; const u = h.object.userData;
    if (u.kind === 'dragon') {
      const mood = window.onDracoClick ? onDracoClick() : 'happy';
      if (mood === 'sleep') return;
      D_.mood = mood; D_.moodT = mood === 'angry' ? 6 : 3; D_.faceCam = 1.6;
      breathT = mood === 'angry' ? 1.6 : .45; breathCol = mood === 'angry' ? [1, .45, .15] : [.3, 1, .6];
      if (mood === 'angry') { shake = .6; if (!D_.angerCount) D_.angerCount = 0; D_.angerCount++; if (D_.angerCount % 2 === 0) { D_.sleepUntil = performance.now() + 20000; setAction('idle', .6); } }
      return;
    }
    if (u.kind === 'shield') { window.onShieldClick && onShieldClick(); return; }
    if (u.kind === 'banner') { window.onBannerClick && onBannerClick(u.k); return; }
    if (u.kind === 'lantern') { const L = lanterns.find(x => x.g === h.object); if (L) { L.on = !L.on; L.g.material.color.setHex(L.on ? 0xffd08a : 0x332211); } return; }
    if (u.kind === 'book' && h.instanceId != null && u.map[h.instanceId]) {
      slides.push({ mesh: h.object, id: h.instanceId, t: 0, open: u.map[h.instanceId] }); return;
    }
    if (u.k) { window.onShelfClick && onShelfClick(u.k); }
  }

  /* ---------- post-processing ---------- */
  let composer = null, bloom = null;
  function setupComposer() {
    if (!(THREE.EffectComposer && THREE.UnrealBloomPass && THREE.GammaCorrectionShader)) return;
    try { composer = new THREE.EffectComposer(renderer); composer.addPass(new THREE.RenderPass(scene, camera));
      bloom = new THREE.UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), .45, .5, .9); composer.addPass(bloom); composer.addPass(new THREE.ShaderPass(THREE.GammaCorrectionShader)); } catch (e) { composer = null; }
  }
  function setQuality(q) {
    QUALITY = q; renderer.setPixelRatio(Math.min(devicePixelRatio, q === 'high' ? 1.75 : q === 'mid' ? 1.4 : 1)); renderer.setSize(innerWidth, innerHeight);
    if (composer) composer.setSize(innerWidth, innerHeight);
    const sh = q === 'high'; if (moon.castShadow !== sh) { moon.castShadow = sh; scene.traverse(o => { if (o.material) [].concat(o.material).forEach(m => m.needsUpdate = true); }); }
    dust.visible = q !== 'low' && !CALM;
  }

  /* ---------- loop ---------- */
  const clock = new THREE.Clock(); let firstFrame = true;
  function frame() {
    requestAnimationFrame(frame);
    if (document.hidden || PAUSED) return;
    const dt = Math.min(.1, clock.getDelta()), time = clock.elapsedTime, now = performance.now();
    updateDragon(dt, time); updateParticles(dt);
    if (dust.visible) { for (let i = 0; i < DN; i++) { dpos[i * 3 + 1] += dt * .1; if (dpos[i * 3 + 1] > 15) dpos[i * 3 + 1] = 0; } dgeo.attributes.position.needsUpdate = true; }
    lanterns.forEach(o => { o.l.intensity = o.on ? 1.2 + (CALM ? 0 : Math.sin(time * 3 + o.ph) * .1 + Math.sin(time * 7.3 + o.ph) * .05) : 0; });
    if (!CALM) banners.forEach(b => { const p = b.cloth.geometry.attributes.position; for (let i = 0; i < p.count; i++) { const x = b.base[i * 3], y = b.base[i * 3 + 1]; const k = (2.4 - y) / 4.8; p.setZ(i, Math.sin(time * 1.6 + y * 1.1 + x * .9 + b.ph) * .12 * k + Math.sin(time * .7 + b.ph) * .05 * k); } p.needsUpdate = true; b.cloth.geometry.computeVertexNormals(); });
    halo.rotation.z = time * .35; shield.rotation.y = Math.sin(time * .45) * .55; shield.position.y = 4.4 + Math.sin(time * 1.1) * .08;
    centerLight.intensity = 1.1 + Math.sin(time * 1.5) * .2 + (breathT > 0 ? 1 : 0);
    Object.values(shelfObjs).forEach(o => { const isF = focus && shelfObjs[focus.k] === o; o.frame.material.opacity = isF ? .5 + Math.sin(time * 4) * .3 : o.hover * .35; if (isF && focus.row) o.rowHL.material.opacity = .25 + Math.sin(time * 4) * .15; });
    if (focus) focusLight.intensity = 2;
    for (let i = slides.length - 1; i >= 0; i--) { const s = slides[i]; s.t += dt; const k = Math.sin(Math.min(1, s.t / .7) * Math.PI); const m = s.mesh.userData.mats[s.id].clone(); m.multiply(new THREE.Matrix4().makeTranslation(0, 0, 0)); const pos = V3(), q = new THREE.Quaternion(), sc = V3(); m.decompose(pos, q, sc); pos.z += k * .35; m.compose(pos, q, sc); s.mesh.setMatrixAt(s.id, m); s.mesh.instanceMatrix.needsUpdate = true;
      if (s.t > .35 && s.open) { const id = s.open; s.open = null; window.onBookSpineClick && onBookSpineClick(id); } if (s.t > .7) { s.mesh.setMatrixAt(s.id, s.mesh.userData.mats[s.id]); s.mesh.instanceMatrix.needsUpdate = true; slides.splice(i, 1); } }
    hoverTick(now);
    orbit += (orbitT - orbit) * .08;
    const P = tgtPos.clone(); if (view === 'mapa' && !focus) P.applyAxisAngle(YUP, orbit);
    if (!CALM && !focus && view !== 'mapa') { P.x += ndc.x * 1.6; P.y += ndc.y * .8; }
    if (shake > 0) { shake -= dt; P.x += (Math.random() - .5) * shake * .6; P.y += (Math.random() - .5) * shake * .4; }
    const k = 1 - Math.pow(.0025, dt); camPos.lerp(P, k * .9); camLook.lerp(tgtLook, k); camera.position.copy(camPos); camera.lookAt(camLook);
    if (composer && QUALITY !== 'low' && !CALM) composer.render(); else renderer.render(scene, camera);
    if (firstFrame) { firstFrame = false; ldBar.style.width = Math.max(parseFloat(ldBar.style.width) || 0, 15) + '%'; }
  }
  addEventListener('resize', () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); if (composer) composer.setSize(innerWidth, innerHeight); });

  window.W3 = {
    setView, focusShelf: focusShelfFn, lookAtShelf, dragonScreen,
    breathe() { breathT = .9; breathCol = [.3, 1, .6]; },
    dracoMood(m) { D_.mood = m === 'sleep' ? 'happy' : m; D_.moodT = m === 'angry' ? 6 : 3; },
    setQuality, setCalm(c) { CALM = c; dust.visible = QUALITY !== 'low' && !c; }, pause(p) { PAUSED = p; }
  };
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(() => {
    buildShelves(); buildBanners(); setupComposer(); setQuality(QUALITY); setView(view); initDragon(); frame();
  });
})();

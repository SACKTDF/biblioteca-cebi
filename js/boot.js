"use strict";
/* Boot sequence */
buildFilters(); rebuild();
setMode(lsGet('cebi-mode', 'stu') === 'lib');
applyA11y(); renderSound(); GAME.render();
{ const v = (location.hash || '#inicio').slice(1); go(VIEWS.includes(v) ? v : 'inicio', false); }
Store.init().then(() => { buildFilters(); renderCurrent(); });
// never trap people on the loader
setTimeout(() => { const s = document.getElementById('ld-skip'); if (s) s.hidden = false; }, 5000);
document.getElementById('ld-skip').addEventListener('click', () => document.getElementById('loader').classList.add('gone'));
setTimeout(() => document.getElementById('loader').classList.add('gone'), 15000);
if (!window.W3) document.getElementById('loader').classList.add('gone');

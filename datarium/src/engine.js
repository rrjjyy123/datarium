/* ===================== 데이터리움 · engine ===================== */
'use strict';
const $ = s => document.querySelector(s);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
function josa(word, a, b) { const c = word.charCodeAt(word.length - 1); if (c < 0xAC00 || c > 0xD7A3) return word + b; return word + (((c - 0xAC00) % 28) ? a : b); }

const G = { name: '탐사원', lock: 0, playing: false, stage: null, sens: 1, run: false, touch: false };
const fmt = t => String(t).replace(/\{name\}/g, G.name);

/* ---------- save ---------- */
const Save = {
  get() { try { return JSON.parse(localStorage.getItem('datarium-v1') || '{}'); } catch (e) { return {}; } },
  set(o) { try { localStorage.setItem('datarium-v1', JSON.stringify(Object.assign(Save.get(), o))); } catch (e) { } }
};

/* ---------- sound (WebAudio synth, no files) ---------- */
const Snd = {
  ctx: null, on: true, amb: [],
  init() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); this.master = this.ctx.createGain(); this.master.gain.value = .5; this.master.connect(this.ctx.destination); } catch (e) { this.ctx = null; }
  },
  tone(f, d = .12, type = 'sine', v = .2, slide = 0, delay = 0) {
    if (!this.ctx || !this.on) return;
    const t = this.ctx.currentTime + delay, o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, f + slide), t + d);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + d);
    o.connect(g); g.connect(this.master); o.start(t); o.stop(t + d + .05);
  },
  play(n) {
    switch (n) {
      case 'type': this.tone(1500, .018, 'square', .015); break;
      case 'blip': this.tone(880, .05, 'square', .05); break;
      case 'scan': this.tone(260, .32, 'sawtooth', .05, 900); this.tone(1320, .1, 'sine', .08, 0, .32); break;
      case 'ok': this.tone(660, .1, 'triangle', .16); this.tone(990, .18, 'triangle', .16, 0, .09); break;
      case 'bad': this.tone(210, .28, 'square', .07, -80); break;
      case 'door': this.tone(80, 1.1, 'sawtooth', .09, 70); break;
      case 'alarm': for (let i = 0; i < 4; i++) this.tone(560, .22, 'square', .06, -220, i * .32); break;
      case 'pick': this.tone(520, .08, 'sine', .16, 420); this.tone(1040, .14, 'sine', .1, 0, .07); break;
      case 'step': this.tone(65 + Math.random() * 25, .07, 'triangle', .06); break;
      case 'learn': for (let i = 0; i < 6; i++) this.tone(400 + i * 120, .08, 'triangle', .07, 0, i * .07); break;
      case 'win': [523, 659, 784, 1046].forEach((f, i) => this.tone(f, .3, 'triangle', .14, 0, i * .12)); break;
      case 'glitch': for (let i = 0; i < 8; i++) this.tone(100 + Math.random() * 900, .05, 'square', .05, 0, i * .04); break;
    }
  },
  ambient(kind) {
    this.amb.forEach(n => { try { n.stop(); } catch (e) { } }); this.amb = [];
    if (!this.ctx || !kind) return;
    const c = this.ctx, g = c.createGain(), lp = c.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = kind === 'orchard' ? 900 : 380; g.gain.value = this.on ? (kind === 'orchard' ? .035 : .05) : 0;
    lp.connect(g); g.connect(this.master); this.ambGain = g;
    const fs = kind === 'orchard' ? [196, 247, 294] : kind === 'title' ? [110, 165, 220] : [55, 82.5, 110.3];
    fs.forEach((f, i) => { const o = c.createOscillator(); o.type = i ? 'sine' : 'triangle'; o.frequency.value = f; o.detune.value = (i - 1) * 6; o.connect(lp); o.start(); this.amb.push(o); });
    const l = c.createOscillator(), lg = c.createGain(); l.frequency.value = .08; lg.gain.value = 180; l.connect(lg); lg.connect(lp.frequency); l.start(); this.amb.push(l);
  },
  toggle() { this.on = !this.on; if (this.ambGain) this.ambGain.gain.value = this.on ? .04 : 0; return this.on; }
};

/* ---------- renderer ---------- */
const canvas = $('#gl');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.15;
const camera = new THREE.PerspectiveCamera(70, 1, .05, 400);
function resize() { const w = innerWidth, h = innerHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.fov = w < h ? 82 : 70; camera.updateProjectionMatrix(); }
addEventListener('resize', resize); resize();

/* ---------- procedural textures ---------- */
function canvasTex(size, draw, rep) {
  const c = document.createElement('canvas'); c.width = c.height = size; const x = c.getContext('2d'); draw(x, size);
  const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 4;
  if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); }
  return t;
}
function gridTex(bg, line, div, rep) {
  return canvasTex(256, (x, s) => {
    x.fillStyle = bg; x.fillRect(0, 0, s, s);
    for (let i = 0; i < 900; i++) { x.fillStyle = `rgba(255,255,255,${Math.random() * .025})`; x.fillRect(Math.random() * s, Math.random() * s, 2, 2); }
    x.strokeStyle = line; x.lineWidth = 2; const st = s / div;
    for (let i = 0; i <= div; i++) { x.beginPath(); x.moveTo(i * st, 0); x.lineTo(i * st, s); x.stroke(); x.beginPath(); x.moveTo(0, i * st); x.lineTo(s, i * st); x.stroke(); }
  }, rep);
}
function noiseTex(base, spread, rep, blades) {
  return canvasTex(256, (x, s) => {
    x.fillStyle = base; x.fillRect(0, 0, s, s);
    for (let i = 0; i < 5000; i++) {
      const l = (Math.random() - .5) * spread; x.fillStyle = `rgba(${l > 0 ? '255,255,220' : '0,0,0'},${Math.abs(l)})`;
      if (blades) x.fillRect(Math.random() * s, Math.random() * s, 1.5, 4 + Math.random() * 4); else x.fillRect(Math.random() * s, Math.random() * s, 3, 3);
    }
  }, rep);
}
const glowTex = canvasTex(128, (x, s) => { const g = x.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.25, 'rgba(255,255,255,.55)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, s, s); });
function glow(color, size, op = .9) { const m = new THREE.SpriteMaterial({ map: glowTex, color, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false }); const s = new THREE.Sprite(m); s.scale.set(size, size, 1); return s; }
function textSprite(text, color = '#ffb13b', w = 512, h = 128) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d');
  x.fillStyle = 'rgba(7,11,14,.85)'; x.fillRect(0, 0, w, h); x.strokeStyle = color; x.lineWidth = 6; x.strokeRect(3, 3, w - 6, h - 6);
  x.fillStyle = color; x.font = `64px "Do Hyeon", "IBM Plex Sans KR", sans-serif`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text, w / 2, h / 2 + 4);
  const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthTest: false })); s.scale.set(w / h * .4, .4, 1); s.renderOrder = 10; return s;
}
const M = (color, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color, roughness: .7, metalness: .05 }, o));

/* ---------- world management ---------- */
let world = null;
function setWorld(w) {
  if (world) {
    world.scene.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) { (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => { if (m.map && m.map !== glowTex) m.map.dispose(); m.dispose(); }); } });
  }
  world = w; waiters.length = 0; target = null;
}
function box(scene, w, h, d, mat, x, y, z, opt = {}) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z);
  m.castShadow = !!opt.cast; m.receiveShadow = opt.recv !== false; scene.add(m);
  if (opt.block && world0) world0.blockers.push({ x0: x - w / 2, x1: x + w / 2, z0: z - d / 2, z1: z + d / 2, id: opt.id });
  return m;
}
let world0 = null; // world under construction
function block(x, z, w, d, id) { world0.blockers.push({ x0: x - w / 2, x1: x + w / 2, z0: z - d / 2, z1: z + d / 2, id }); }

/* ---------- player & input ---------- */
const P = { pos: new THREE.Vector3(0, 0, 0), yaw: 0, pitch: 0, radius: .35, eye: 1.6, bob: 0, stepT: 0, moving: false };
function placePlayer(x, z, yaw = 0, pitch = 0) { P.pos.set(x, 0, z); P.yaw = yaw; P.pitch = pitch; }
function fwd() { return new THREE.Vector3(-Math.sin(P.yaw), 0, -Math.cos(P.yaw)); }
function right() { return new THREE.Vector3(Math.cos(P.yaw), 0, -Math.sin(P.yaw)); }
const keys = {};
const joy = { x: 0, y: 0, id: null };
let lookTouch = null, dragMouse = null;

function overlayOpen() { return !$('#dialog').hidden || !$('#panel').hidden || !$('#screen').hidden; }
function canControl() { return G.playing && G.lock === 0 && !overlayOpen(); }
function releaseLock() { if (document.pointerLockElement && document.exitPointerLock) document.exitPointerLock(); }

addEventListener('keydown', e => {
  keys[e.code] = true;
  if (!$('#dialog').hidden && (e.code === 'Space' || e.code === 'Enter' || e.code === 'KeyE')) { e.preventDefault(); advance(); return; }
  if (e.code === 'Tab') e.preventDefault();
  if (!canControl()) return;
  if (e.code === 'KeyE' || e.code === 'Space') { e.preventDefault(); interact(); }
  if ((e.code === 'KeyQ' || e.code === 'Tab') && world && world.onData) world.onData();
  if (e.code === 'Escape' || e.code === 'KeyP') openMenu();
});
addEventListener('keyup', e => { keys[e.code] = false; });
addEventListener('blur', () => { for (const k in keys) keys[k] = false; });

canvas.addEventListener('pointerdown', e => {
  if (e.pointerType === 'touch') { if (lookTouch === null) lookTouch = { id: e.pointerId, x: e.clientX, y: e.clientY }; return; }
  dragMouse = { x: e.clientX, y: e.clientY, moved: 0, wasLocked: !!document.pointerLockElement };
  if (canControl() && !document.pointerLockElement && canvas.requestPointerLock) { try { const p = canvas.requestPointerLock(); if (p && p.catch) p.catch(() => { }); } catch (err) { } }
});
addEventListener('pointermove', e => {
  if (e.pointerType === 'touch') {
    if (lookTouch && e.pointerId === lookTouch.id) { look((e.clientX - lookTouch.x) * 2.2, (e.clientY - lookTouch.y) * 2.2); lookTouch.x = e.clientX; lookTouch.y = e.clientY; }
    return;
  }
  if (document.pointerLockElement === canvas) look(e.movementX, e.movementY);
  else if (dragMouse && e.buttons) { look((e.clientX - dragMouse.x) * 1.6, (e.clientY - dragMouse.y) * 1.6); dragMouse.moved += Math.abs(e.clientX - dragMouse.x) + Math.abs(e.clientY - dragMouse.y); dragMouse.x = e.clientX; dragMouse.y = e.clientY; }
});
addEventListener('pointerup', e => {
  if (e.pointerType === 'touch') { if (lookTouch && e.pointerId === lookTouch.id) lookTouch = null; return; }
  if (dragMouse && e.target === canvas && dragMouse.moved < 6 && (dragMouse.wasLocked || !canvas.requestPointerLock) && canControl()) interact();
  dragMouse = null;
});
addEventListener('pointercancel', e => { if (lookTouch && e.pointerId === lookTouch.id) lookTouch = null; });
function look(dx, dy) { if (!canControl()) return; const s = .0022 * G.sens; P.yaw -= dx * s; P.pitch = clamp(P.pitch - dy * s, -1.35, 1.35); }

// joystick
const joyEl = $('#joy'), knob = $('#knob');
joyEl.addEventListener('pointerdown', e => { joy.id = e.pointerId; joyEl.setPointerCapture(e.pointerId); joyMove(e); });
joyEl.addEventListener('pointermove', e => { if (e.pointerId === joy.id) joyMove(e); });
const joyEnd = e => { if (e.pointerId !== joy.id) return; joy.id = null; joy.x = joy.y = 0; knob.style.transform = ''; };
joyEl.addEventListener('pointerup', joyEnd); joyEl.addEventListener('pointercancel', joyEnd);
function joyMove(e) { const r = joyEl.getBoundingClientRect(); let dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2); const m = r.width / 2 - 20, l = Math.hypot(dx, dy); if (l > m) { dx *= m / l; dy *= m / l; } joy.x = dx / m; joy.y = dy / m; knob.style.transform = `translate(${dx}px,${dy}px)`; }
$('#btnScan').addEventListener('pointerdown', e => { e.preventDefault(); if (canControl()) interact(); });
$('#btnRun').addEventListener('pointerdown', e => { e.preventDefault(); G.run = !G.run; $('#btnRun').classList.toggle('on', G.run); });
$('#btnData').addEventListener('click', () => { if (canControl() && world && world.onData) world.onData(); });
$('#btnMenu').addEventListener('click', () => { if (G.playing && G.lock === 0 && overlayOpen() === false) openMenu(); });

/* ---------- collision ---------- */
function blocked(x, z, r, W = world) {
  const b = W.bounds; if (x < b.x0 + r || x > b.x1 - r || z < b.z0 + r || z > b.z1 - r) return true;
  for (const k of W.blockers) if (x > k.x0 - r && x < k.x1 + r && z > k.z0 - r && z < k.z1 + r) return true;
  return false;
}
function moveBody(pos, dx, dz, r) { if (!blocked(pos.x + dx, pos.z, r)) pos.x += dx; if (!blocked(pos.x, pos.z + dz, r)) pos.z += dz; }

/* ---------- interaction targeting ---------- */
let target = null;
const _v = new THREE.Vector3();
function findTarget() {
  if (!world || !world.interact) return null;
  const cf = new THREE.Vector3(); camera.getWorldDirection(cf);
  let best = null, bestA = 1e9;
  for (const it of world.interact) {
    if (it.enabled && !it.enabled()) continue;
    it.obj.getWorldPosition(_v); if (it.off) _v.add(it.off);
    const d = _v.clone().sub(camera.position); const dist = d.length();
    if (dist > (it.range || 3.2)) continue;
    const ang = cf.angleTo(d.normalize()); const lim = Math.atan((it.r || .4) / dist) + .12;
    if (ang < lim && ang < bestA) { bestA = ang; best = it; }
  }
  return best;
}
async function interact() {
  if (!target || G.lock) return;
  const it = target; G.lock++;
  try {
    if (!it.silent) { Snd.play('scan'); const f = $('#scanfx'); f.classList.remove('on'); void f.offsetWidth; f.classList.add('on'); await sleep(380); }
    await it.action();
  } finally { G.lock--; }
}

/* ---------- waiters / tween ---------- */
const waiters = [];
function until(fn) { return new Promise(r => waiters.push({ fn, r })); }
function tween(ms, fn, ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2) {
  return new Promise(r => { const s = performance.now(); const f = now => { const t = Math.min(1, (now - s) / ms); fn(ease(t), t); if (t < 1) requestAnimationFrame(f); else r(); }; requestAnimationFrame(f); });
}

/* ---------- HUD helpers ---------- */
function setObj(t) { $('#objText').textContent = fmt(t); const o = $('#obj'); o.animate([{ opacity: .2, transform: 'translateX(-8px)' }, { opacity: 1, transform: 'none' }], { duration: 400 }); }
let toastT = 0;
function toast(t, ms = 2600) { const el = $('#toast'); el.textContent = fmt(t); el.hidden = false; el.style.opacity = 1; clearTimeout(toastT); toastT = setTimeout(() => { el.style.opacity = 0; setTimeout(() => el.hidden = true, 300); }, ms); }
function fadeTo(v, ms = 800) { const f = $('#fade'); f.style.transition = `opacity ${ms}ms`; f.style.opacity = v; return sleep(ms); }
function banner(s, t, d) { const b = $('#banner'); $('#bS').textContent = s; $('#bT').textContent = t; $('#bD').textContent = d || ''; b.hidden = false; b.classList.remove('show'); void b.offsetWidth; b.classList.add('show'); return sleep(3400).then(() => { b.hidden = true; }); }
function showHUD(on) { $('#hud').hidden = !on; $('#touch').hidden = !(on && G.touch); }
function glitch() { Snd.play('glitch'); document.body.classList.add('glitch'); return sleep(1000).then(() => document.body.classList.remove('glitch')); }
function hurt() { const h = $('#hurt'); h.classList.add('on'); setTimeout(() => h.classList.remove('on'), 500); }

/* ---------- dialog ---------- */
const WHO = { bit: ['비트', 'bit'], core: ['코어', 'core'], sort: ['SORT-9', 'sort'], havi: ['하비', 'havi'], sys: ['', 'sys'], me: [null, 'me'] };
let dState = null;
function showDialog(who, text, opts, res) {
  releaseLock();
  const w = WHO[who] || WHO.sys, dlg = $('#dialog');
  dlg.hidden = false; dlg.className = w[1]; $('#dName').textContent = w[0] === null ? G.name : w[0]; $('#dPt').className = 'pt ' + w[1];
  $('#dChoices').innerHTML = ''; $('#dChoices').hidden = true; $('#dNext').hidden = true;
  const full = fmt(text), me = { full, typing: true, opts, res, who }; dState = me; let i = 0; $('#dText').textContent = '';
  const step = () => { if (dState !== me || !me.typing) return; i += 1; $('#dText').textContent = full.slice(0, i); if (who !== 'sys' && i % 3 === 0) Snd.play('type'); if (i < full.length) me.timer = setTimeout(step, 24); else finishType(); };
  step();
}
function finishType() {
  const s = dState; if (!s) return; s.typing = false; clearTimeout(s.timer); $('#dText').textContent = s.full;
  if (s.opts) {
    const box = $('#dChoices'); box.hidden = false;
    s.opts.forEach((o, k) => { const b = document.createElement('button'); b.className = 'choice'; b.textContent = fmt(o); b.onclick = e => { e.stopPropagation(); if (dState !== s) return; Snd.play('blip'); dState = null; closeDialogSoon(); s.res(k); }; box.appendChild(b); });
    box.querySelector('button').focus({ preventScroll: true });
  } else $('#dNext').hidden = false;
}
function closeDialogSoon() { setTimeout(() => { if (!dState) $('#dialog').hidden = true; }, 40); }
function advance() { const s = dState; if (!s) return; if (s.typing) { finishType(); return; } if (s.opts) return; dState = null; Snd.play('blip'); closeDialogSoon(); s.res(); }
$('#dialog').addEventListener('click', advance);
const talk = (who, text) => new Promise(r => showDialog(who, text, null, r));
const choose = (who, text, opts) => new Promise(r => showDialog(who, text, opts, r));
async function lines(arr) { for (const [w, t] of arr) await talk(w, t); }

/* ---------- panel ---------- */
function panel(html, buttons = [['닫기', 'pri']], wide = false) {
  return new Promise(res => {
    releaseLock();
    const p = $('#panel'); p.hidden = false; p.className = wide ? 'wide' : ''; $('#panelBody').innerHTML = html; $('#panelCard').scrollTop = 0;
    const bar = $('#panelBtns'); bar.innerHTML = '';
    buttons.forEach(([label, style], i) => { const b = document.createElement('button'); b.className = 'btn ' + (style || ''); b.textContent = label; b.onclick = () => { p.hidden = true; Snd.play('blip'); res(i); }; bar.appendChild(b); });
    const pri = bar.querySelector('.pri') || bar.querySelector('button'); if (pri) pri.focus({ preventScroll: true });
  });
}

/* ---------- menu ---------- */
async function openMenu() {
  G.lock++;
  const k = await panel(`<div class="eyebrow">일시 정지</div><div class="ph">메뉴</div>
    <div class="card"><label for="sensIn" class="mono" style="font-size:12px;color:var(--muted)">시점 감도</label>
    <input id="sensIn" type="range" min="0.4" max="2.2" step="0.1" value="${G.sens}" style="width:100%;margin-top:8px;accent-color:#ffb13b"></div>
    <div class="ctrls">${controlsHTML()}</div>`, [['처음 화면으로', ''], [Snd.on ? '소리 끄기' : '소리 켜기', ''], ['계속하기', 'pri']]);
  G.lock--;
  if (k === 0) { location.hash = ''; bootTitle(); }
  if (k === 1) { Snd.toggle(); }
}
$('#panel').addEventListener('input', e => { if (e.target.id === 'sensIn') { G.sens = +e.target.value; Save.set({ sens: G.sens }); } });
function controlsHTML() {
  return G.touch
    ? `<kbd>왼쪽 스틱</kbd><span>이동</span><kbd>화면 끌기</kbd><span>둘러보기</span><kbd>스캔</kbd><span>가운데 조준한 물체 조사</span><kbd>달리기</kbd><span>빠르게 이동 켜기/끄기</span>`
    : `<kbd>W A S D</kbd><span>이동 (Shift 달리기)</span><kbd>마우스</kbd><span>둘러보기 (화면 클릭 후)</span><kbd>E · 클릭</kbd><span>가운데 조준한 물체 스캔</span><kbd>Q</kbd><span>데이터셋 보기 (1스테이지)</span><kbd>Esc</kbd><span>메뉴</span>`;
}

/* ---------- main loop ---------- */
const clock = new THREE.Clock();
function loop() {
  requestAnimationFrame(loop);
  const dt = Math.min(clock.getDelta(), .05), t = clock.elapsedTime;
  if (!world) return;
  if (G.playing) {
    let mx = 0, mz = 0;
    if (canControl()) {
      if (keys.KeyW || keys.ArrowUp) mz += 1; if (keys.KeyS || keys.ArrowDown) mz -= 1;
      if (keys.KeyD || keys.ArrowRight) mx += 1; if (keys.KeyA || keys.ArrowLeft) mx -= 1;
      if (joy.id !== null) { mx += joy.x; mz -= joy.y; }
    }
    const len = Math.hypot(mx, mz); if (len > 1) { mx /= len; mz /= len; }
    const sp = (keys.ShiftLeft || keys.ShiftRight || G.run ? 5.2 : 3.1) * dt;
    const f = fwd(), r = right();
    const dx = (f.x * mz + r.x * mx) * sp, dz = (f.z * mz + r.z * mx) * sp;
    P.moving = len > .1;
    if (P.moving) { moveBody(P.pos, dx, dz, P.radius); P.bob += dt * (sp / dt) * 2.4; P.stepT += dt * (sp / dt); if (P.stepT > 2.1) { P.stepT = 0; Snd.play('step'); } }
    camera.position.set(P.pos.x, P.eye + (P.moving ? Math.sin(P.bob) * .045 : 0), P.pos.z);
    camera.rotation.set(P.pitch, P.yaw, 0, 'YXZ');
    target = canControl() ? findTarget() : null;
    const ret = $('#reticle'), pr = $('#prompt');
    ret.classList.toggle('lock', !!target);
    if (target) { pr.hidden = false; pr.innerHTML = `<b>${G.touch ? '스캔' : 'E'}</b>${esc(fmt(typeof target.label === 'function' ? target.label() : target.label))}`; } else pr.hidden = true;
  }
  if (world.update) world.update(dt, t);
  for (let i = waiters.length - 1; i >= 0; i--) if (waiters[i].fn()) { const w = waiters.splice(i, 1)[0]; w.r(); }
  renderer.render(world.scene, camera);
}

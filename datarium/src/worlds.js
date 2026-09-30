/* ===================== 데이터리움 · models ===================== */
function makeBit() {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new THREE.SphereGeometry(.28, 32, 24), M(0xe6eff1, { roughness: .3, metalness: .25 })));
  const face = new THREE.Mesh(new THREE.SphereGeometry(.284, 32, 12, 0, Math.PI * 2, 0, .72), M(0x0b1216, { roughness: .15, metalness: .3 }));
  face.rotation.x = Math.PI / 2; g.add(face);
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x5ad8ea });
  const eye = new THREE.Mesh(new THREE.SphereGeometry(.065, 20, 12), eyeMat); eye.position.set(0, -.01, .25); eye.scale.z = .5; g.add(eye);
  const ant = new THREE.Mesh(new THREE.CylinderGeometry(.008, .008, .2), M(0x9fb3b8)); ant.position.y = .36; g.add(ant);
  const tip = new THREE.Mesh(new THREE.SphereGeometry(.035, 12, 8), new THREE.MeshBasicMaterial({ color: 0xffb13b })); tip.position.y = .47; g.add(tip);
  const gl = glow(0x5ad8ea, 1.1, .35); g.add(gl);
  const L = new THREE.PointLight(0x5ad8ea, .8, 5); g.add(L);
  return { g, eyeMat, tip };
}
function makeSort9() {
  const g = new THREE.Group(), grey = M(0x6d777c, { metalness: .55, roughness: .45 }), dark = M(0x262d31, { metalness: .4, roughness: .6 });
  const base = new THREE.Mesh(new THREE.CylinderGeometry(.42, .5, .3, 24), dark); base.position.y = .15; g.add(base);
  const body = new THREE.Mesh(new THREE.BoxGeometry(.9, 1, .6), grey); body.position.y = .85; body.castShadow = true; g.add(body);
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(.9, .06, .61), new THREE.MeshBasicMaterial({ color: 0xffb13b })); stripe.position.y = 1.1; g.add(stripe);
  const label = new THREE.Mesh(new THREE.PlaneGeometry(.5, .16), new THREE.MeshBasicMaterial({ map: canvasTex(128, (x, s) => { x.fillStyle = '#1b2226'; x.fillRect(0, 0, s, s); x.fillStyle = '#e3edef'; x.font = 'bold 34px IBM Plex Mono, monospace'; x.textAlign = 'center'; x.fillText('SORT-9', s / 2, s / 2 + 12); }) })); label.position.set(0, .75, .305); label.scale.y = .9; g.add(label);
  const head = new THREE.Mesh(new THREE.BoxGeometry(.62, .36, .46), grey); head.position.y = 1.55; g.add(head);
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0xff4d6d });
  const visor = new THREE.Mesh(new THREE.BoxGeometry(.5, .08, .03), eyeMat); visor.position.set(0, 1.56, .235); g.add(visor);
  const arms = [];
  for (const s of [-1, 1]) { const a = new THREE.Group(); a.position.set(s * .56, 1.25, 0); const m = new THREE.Mesh(new THREE.BoxGeometry(.16, .8, .16), dark); m.position.y = -.4; a.add(m); const c = new THREE.Mesh(new THREE.BoxGeometry(.22, .12, .22), grey); c.position.y = -.84; a.add(c); g.add(a); arms.push(a); }
  const L = new THREE.PointLight(0xff4d6d, 1, 4); L.position.set(0, 1.6, .6); g.add(L);
  return { g, eyeMat, arms, light: L };
}
function makeHavi() {
  const g = new THREE.Group(), amber = M(0xd98a25, { metalness: .45, roughness: .4 }), dark = M(0x2a2622, { metalness: .3, roughness: .7 });
  const base = new THREE.Mesh(new THREE.BoxGeometry(.9, .28, .7), dark); base.position.y = .14; g.add(base);
  const body = new THREE.Mesh(new THREE.CylinderGeometry(.42, .5, 1.05, 28), amber); body.position.y = .82; body.castShadow = true; g.add(body);
  const band = new THREE.Mesh(new THREE.CylinderGeometry(.435, .435, .08, 28), dark); band.position.y = 1.02; g.add(band);
  const head = new THREE.Mesh(new THREE.SphereGeometry(.36, 28, 16, 0, Math.PI * 2, 0, Math.PI / 2), amber); head.position.y = 1.34; head.castShadow = true; g.add(head);
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0xff6d5a });
  const eye = new THREE.Mesh(new THREE.SphereGeometry(.085, 18, 12), eyeMat); eye.position.set(0, 1.5, .3); g.add(eye);
  const eg = glow(0xff6d5a, .7, .6); eg.position.copy(eye.position); g.add(eg);
  const arm = new THREE.Group(); arm.position.set(-.5, 1.1, 0);
  const a1 = new THREE.Mesh(new THREE.BoxGeometry(.14, .14, .8), dark); a1.position.z = .38; arm.add(a1);
  const claw = new THREE.Mesh(new THREE.TorusGeometry(.11, .025, 8, 16, Math.PI * 1.3), amber); claw.position.z = .82; claw.rotation.y = Math.PI / 2; arm.add(claw);
  g.add(arm);
  const plate = new THREE.Mesh(new THREE.PlaneGeometry(.46, .14), new THREE.MeshBasicMaterial({ map: canvasTex(128, (x, s) => { x.fillStyle = '#2a2622'; x.fillRect(0, 0, s, s); x.fillStyle = '#ffb13b'; x.font = 'bold 44px IBM Plex Mono, monospace'; x.textAlign = 'center'; x.fillText('HAVI', s / 2, s / 2 + 15); }) }));
  plate.position.set(0, .7, .49); plate.rotation.x = -.08; g.add(plate);
  return { g, eyeMat, eg, arm };
}

/* ---------- fruit & feature model ---------- */
const TYPES = {
  red_apple: { n: '빨간 사과', color: '빨강', hex: 0xb8202a, css: '#c0272f', stem: 1, calyx: 0, seam: 0, oval: 0, apple: true },
  green_apple: { n: '초록 사과', color: '초록', hex: 0x86c440, css: '#86c440', stem: 1, calyx: 0, seam: 0, oval: 0, apple: true },
  yellow_apple: { n: '노란 사과', color: '노랑', hex: 0xe8c233, css: '#e8c233', stem: 1, calyx: 0, seam: 0, oval: 0, apple: true },
  tomato: { n: '토마토', color: '빨강', hex: 0xe0341c, css: '#e0341c', stem: 0, calyx: 1, seam: 0, oval: 0, apple: false },
  lime: { n: '라임', color: '초록', hex: 0x4f9a2a, css: '#4f9a2a', stem: 0, calyx: 0, seam: 0, oval: 0, apple: false },
  lemon: { n: '레몬', color: '노랑', hex: 0xf3d63a, css: '#f3d63a', stem: 0, calyx: 0, seam: 0, oval: 1, apple: false },
  red_ball: { n: '빨간 공', color: '빨강', hex: 0xd11f2c, css: '#d11f2c', stem: 0, calyx: 0, seam: 1, oval: 0, apple: false },
  tennis: { n: '테니스공', color: '초록', hex: 0x9fd23a, css: '#9fd23a', stem: 0, calyx: 0, seam: 1, oval: 0, apple: false }
};
function featureVec(type) { const T = TYPES[type]; const c = { 빨강: [1, 0, 0], 초록: [0, 1, 0], 노랑: [0, 0, 1] }[T.color]; return [...c, T.stem * 1.2, T.calyx * 1.2, T.seam * 1.2, T.oval * .5]; }
function fdist(a, b) { let s = 0; for (let i = 0; i < a.length; i++) s += (a[i] - b[i]) ** 2; return Math.sqrt(s); }
/* 1-최근접 이웃: 가장 닮은 학습 데이터의 라벨을 따른다 (동점이면 다수결) */
function predict(type, data) {
  const f = featureVec(type); let best = Infinity, cands = [];
  for (const s of data) { const d = fdist(f, featureVec(s.type)); if (d < best - 1e-6) { best = d; cands = [s]; } else if (Math.abs(d - best) < 1e-6) cands.push(s); }
  if (!cands.length) return { label: 'not', nn: null, d: Infinity };
  const yes = cands.filter(s => s.label === 'apple').length;
  const label = yes * 2 > cands.length ? 'apple' : yes * 2 < cands.length ? 'not' : cands[0].label;
  return { label, nn: cands.find(s => s.label === label), d: best, ties: cands.length };
}
function featText(type) { const T = TYPES[type]; return [`색 ${T.color}`, T.stem ? '꼭지 있음' : '꼭지 없음', T.calyx ? '별 모양 꽃받침' : null, T.seam ? '이음선 무늬' : null, T.oval ? '길쭉한 모양' : '둥근 모양'].filter(Boolean); }

function makeFruit(type, s = 1) {
  const T = TYPES[type], g = new THREE.Group(), mat = M(T.hex, { roughness: T.seam ? .3 : .42, metalness: 0 });
  const green = M(0x3d7a2a, { roughness: .6 }), brown = M(0x5a3a1c);
  let body, h;
  if (type === 'lemon') {
    body = new THREE.Mesh(new THREE.SphereGeometry(.12, 24, 16), mat); body.scale.set(1.15, .82, .82); h = .1;
    for (const d of [-1, 1]) { const c = new THREE.Mesh(new THREE.ConeGeometry(.03, .06, 12), mat); c.rotation.z = -d * Math.PI / 2; c.position.x = d * .155; body.add(c); c.scale.set(1 / 1.15, 1 / .82, 1 / .82); }
  } else if (type === 'lime') { body = new THREE.Mesh(new THREE.SphereGeometry(.1, 24, 16), M(T.hex, { roughness: .75 })); h = .1; }
  else if (type === 'tomato') {
    body = new THREE.Mesh(new THREE.SphereGeometry(.12, 24, 16), mat); body.scale.y = .78; h = .094;
    for (let i = 0; i < 5; i++) { const l = new THREE.Mesh(new THREE.BoxGeometry(.09, .012, .025), green); const a = i / 5 * Math.PI * 2; l.position.set(Math.cos(a) * .04, .12, Math.sin(a) * .04); l.rotation.y = -a; l.scale.set(1, 1 / .78, 1); body.add(l); }
  } else if (T.seam) {
    body = new THREE.Mesh(new THREE.SphereGeometry(.11, 24, 16), mat); h = .11;
    const seamM = M(0xf2f2ea, { roughness: .4 });
    if (type === 'tennis') { for (const d of [-1, 1]) { const t = new THREE.Mesh(new THREE.TorusGeometry(.085, .006, 6, 32), seamM); t.position.x = d * .045; t.rotation.y = Math.PI / 2 + d * .25; body.add(t); } }
    else { const t = new THREE.Mesh(new THREE.TorusGeometry(.111, .006, 6, 40), seamM); t.rotation.x = Math.PI / 2; body.add(t); const t2 = t.clone(); t2.rotation.set(0, 0, 0); body.add(t2); }
  } else {
    body = new THREE.Mesh(new THREE.SphereGeometry(.12, 24, 16), mat); body.scale.y = .92; h = .11;
    const st = new THREE.Mesh(new THREE.CylinderGeometry(.006, .009, .07), brown); st.position.y = .135; st.rotation.z = .2; body.add(st);
    const lf = new THREE.Mesh(new THREE.SphereGeometry(.05, 10, 6), green); lf.scale.set(1, .12, .45); lf.position.set(.035, .15, 0); lf.rotation.z = .5; body.add(lf);
  }
  body.castShadow = true; body.position.y = h; g.add(body); g.scale.setScalar(s); g.userData.type = type;
  return g;
}

/* ===================== worlds ===================== */
function buildTitleWorld() {
  const W = world0 = { scene: new THREE.Scene(), interact: [], blockers: [], bounds: { x0: -99, x1: 99, z0: -99, z1: 99 } };
  const sc = W.scene; sc.background = new THREE.Color(0x05080b); sc.fog = new THREE.FogExp2(0x05080b, .045);
  sc.add(new THREE.AmbientLight(0x406070, .8));
  const L = new THREE.PointLight(0xffb13b, 2.2, 30); L.position.set(0, 4, 0); sc.add(L);
  const N = 420, geo = new THREE.BoxGeometry(.35, .35, .35);
  const im = new THREE.InstancedMesh(geo, M(0x1d2f38, { emissive: 0x0c1e26, metalness: .6, roughness: .35 }), N);
  const dummy = new THREE.Object3D(), data = [];
  for (let i = 0; i < N; i++) { const r = 4 + Math.random() * 18, a = Math.random() * Math.PI * 2, y = (Math.random() - .5) * 14; data.push({ r, a, y, s: .3 + Math.random() * 1.2, sp: (.02 + Math.random() * .05) * (Math.random() < .5 ? -1 : 1) }); }
  const col = new THREE.Color(); for (let i = 0; i < N; i++) { col.setHSL(Math.random() < .12 ? .1 : .52, .7, Math.random() < .12 ? .55 : .2 + Math.random() * .15); im.setColorAt(i, col); }
  sc.add(im);
  const pts = new THREE.BufferGeometry(), pp = new Float32Array(1500 * 3); for (let i = 0; i < pp.length; i++) pp[i] = (Math.random() - .5) * 60; pts.setAttribute('position', new THREE.BufferAttribute(pp, 3));
  sc.add(new THREE.Points(pts, new THREE.PointsMaterial({ color: 0x5ad8ea, size: .06, transparent: true, opacity: .6 })));
  W.update = (dt, t) => {
    for (let i = 0; i < N; i++) { const d = data[i]; d.a += d.sp * dt; dummy.position.set(Math.cos(d.a) * d.r, d.y + Math.sin(t * .5 + i) * .2, Math.sin(d.a) * d.r); dummy.rotation.set(t * .2 + i, t * .3 + i, 0); dummy.scale.setScalar(d.s); dummy.updateMatrix(); im.setMatrixAt(i, dummy.matrix); }
    im.instanceMatrix.needsUpdate = true;
    camera.position.set(Math.cos(t * .04) * 14, 2 + Math.sin(t * .1), Math.sin(t * .04) * 14); camera.lookAt(0, 0, 0);
  };
  return W;
}

function buildArchive() {
  const W = world0 = { scene: new THREE.Scene(), interact: [], blockers: [], bounds: { x0: -9, x1: 9, z0: -19, z1: 14 } };
  const sc = W.scene; sc.background = new THREE.Color(0x04070a); sc.fog = new THREE.FogExp2(0x04070a, .055);
  sc.add(new THREE.HemisphereLight(0x3a5a6a, 0x0a0c0e, .7));
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(18, 33), M(0xffffff, { map: gridTex('#0f171c', '#1d2d36', 4, [9, 16]), roughness: .85 }));
  floor.rotation.x = -Math.PI / 2; floor.position.z = -2.5; sc.add(floor);
  const wallM = M(0x121b21, { roughness: .9 }), ceilM = M(0x0b1115);
  box(sc, .4, 5, 33, wallM, -9.2, 2.5, -2.5); box(sc, .4, 5, 33, wallM, 9.2, 2.5, -2.5);
  box(sc, 18.4, 5, .4, wallM, 0, 2.5, 14.2);
  box(sc, 7.5, 5, .4, wallM, -5.25, 2.5, -15.2, { block: true }); box(sc, 7.5, 5, .4, wallM, 5.25, 2.5, -15.2, { block: true });
  box(sc, 3, 1.6, .4, wallM, 0, 4.2, -15.2);
  box(sc, 18.4, .3, 33, ceilM, 0, 5.1, -2.5);
  // corridor beyond door
  box(sc, .3, 4, 4, wallM, -1.7, 2, -17.2, { block: true }); box(sc, .3, 4, 4, wallM, 1.7, 2, -17.2, { block: true });
  const exitGlow = new THREE.PointLight(0xffd9a0, 0, 8); exitGlow.position.set(0, 2, -17.5); sc.add(exitGlow);
  const exitPlane = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 4), new THREE.MeshBasicMaterial({ color: 0xffe2b0 })); exitPlane.position.set(0, 2, -19.1); sc.add(exitPlane);
  // ceiling light strips
  for (let z = -12; z <= 11; z += 5.5) { const s = new THREE.Mesh(new THREE.BoxGeometry(.18, .05, 3.2), new THREE.MeshBasicMaterial({ color: 0x9fd9e6 })); s.position.set(0, 4.92, z); sc.add(s); }
  const lights = []; for (const z of [8, 0, -8]) { const l = new THREE.PointLight(0x8fc8d8, 1.1, 13, 1.6); l.position.set(0, 4.4, z); sc.add(l); lights.push(l); }
  const alarm = new THREE.PointLight(0xff2a4a, 0, 30); alarm.position.set(0, 4, -4); sc.add(alarm);
  // racks with LEDs
  const rackM = M(0x1a252c, { metalness: .6, roughness: .5 }), shelfM = M(0x0c1216, { metalness: .5 });
  const ledPos = [];
  for (const side of [-1, 1]) for (const z of [-11, -6.5, -2, 2.5, 7]) {
    const x = side * 6.6; box(sc, 1.3, 3.4, 3.4, rackM, x, 1.7, z, { block: true });
    for (let y = .5; y < 3.3; y += .55) { const sh = new THREE.Mesh(new THREE.BoxGeometry(.05, .4, 3.1), shelfM); sh.position.set(x - side * .66, y, z); sc.add(sh); for (let k = 0; k < 6; k++) if (Math.random() < .7) ledPos.push([x - side * .7, y + .1, z - 1.3 + k * .5]); }
  }
  const leds = new THREE.InstancedMesh(new THREE.BoxGeometry(.02, .04, .04), new THREE.MeshBasicMaterial({ color: 0xffffff }), ledPos.length);
  const dm = new THREE.Object3D(), c = new THREE.Color();
  ledPos.forEach((p, i) => { dm.position.set(...p); dm.updateMatrix(); leds.setMatrixAt(i, dm.matrix); leds.setColorAt(i, c.setHex(Math.random() < .7 ? 0x3fd1e6 : 0xffb13b)); });
  sc.add(leds);
  // scattered crates
  const crateM = M(0x2a3238, { roughness: .8 });
  [[-3.2, 9.5, .8], [3.8, -8.5, .7], [-2.8, -3, .6], [3, 3.5, .9]].forEach(([x, z, s]) => { box(sc, s, s, s, crateM, x, s / 2, z, { block: true }).rotation.y = Math.random(); });
  // dust
  const dg = new THREE.BufferGeometry(), dp = new Float32Array(600 * 3); for (let i = 0; i < 600; i++) { dp[i * 3] = (Math.random() - .5) * 17; dp[i * 3 + 1] = Math.random() * 5; dp[i * 3 + 2] = -15 + Math.random() * 29; } dg.setAttribute('position', new THREE.BufferAttribute(dp, 3));
  const dust = new THREE.Points(dg, new THREE.PointsMaterial({ color: 0x9fc4cc, size: .03, transparent: true, opacity: .5 })); sc.add(dust);
  // door
  const door = new THREE.Mesh(new THREE.BoxGeometry(3, 3.4, .3), M(0x3a444a, { metalness: .7, roughness: .4 })); door.position.set(0, 1.7, -15.2); sc.add(door);
  const doorStripe = new THREE.Mesh(new THREE.BoxGeometry(3, .1, .32), new THREE.MeshBasicMaterial({ color: 0xff4d6d })); doorStripe.position.y = .3; door.add(doorStripe);
  block(0, -15.2, 3, .4, 'door');
  // Bit
  const bit = makeBit(); bit.g.position.set(0, 1.45, 5.5); sc.add(bit.g);
  // data fragments
  const frags = [];
  [[-4.7, 3.2], [4.7, -2.2], [-4.7, -7.2]].forEach(([x, z], i) => {
    const g = new THREE.Group(); g.position.set(x, 1.3, z);
    const core = new THREE.Mesh(new THREE.BoxGeometry(.22, .22, .22), new THREE.MeshBasicMaterial({ color: 0x5ad8ea })); g.add(core);
    const cage = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(.42, .42, .42)), new THREE.LineBasicMaterial({ color: 0x9feaf5 })); g.add(cage);
    g.add(glow(0x5ad8ea, 1.4, .5)); sc.add(g); frags.push({ g, core, cage, done: false, i });
  });
  // human data orbs
  const orbs = [];
  [[7.9, -4.25], [-7.9, .25], [-7.9, -8.75]].forEach(([x, z]) => {
    const g = new THREE.Group(); g.position.set(x, 1.3, z); g.visible = false;
    g.add(new THREE.Mesh(new THREE.IcosahedronGeometry(.14, 1), new THREE.MeshBasicMaterial({ color: 0xffc2d0 })));
    g.add(glow(0xff8fb0, 1.6, .7)); const l = new THREE.PointLight(0xff8fb0, 0, 4); g.add(l); g.userData.l = l;
    sc.add(g); orbs.push({ g, got: false });
  });
  // SORT-9
  const sort = makeSort9(); sort.g.position.set(0, 0, -13.4); sort.g.visible = false; sc.add(sort.g);
  Object.assign(W, { bit, frags, orbs, sort, door, alarm, lights, exitGlow, dust, doorOpen: false, bitFollow: false, alarmOn: false, chase: false });
  W.update = (dt, t) => {
    // Bit hover & face player
    const bp = bit.g.position;
    if (W.bitFollow) { const f = fwd(), r = right(); const tx = P.pos.x + r.x * .8 + f.x * 1.4, tz = P.pos.z + r.z * .8 + f.z * 1.4; bp.x = lerp(bp.x, tx, dt * 2); bp.z = lerp(bp.z, tz, dt * 2); }
    bp.y = 1.45 + Math.sin(t * 2) * .06; bit.g.lookAt(camera.position.x, bp.y, camera.position.z);
    bit.tip.material.color.setHex(Math.sin(t * 6) > 0 ? 0xffb13b : 0x5a3a10);
    frags.forEach(f => { f.cage.rotation.x = t * .6 + f.i; f.cage.rotation.y = t * .8; f.core.rotation.y = -t; f.g.position.y = 1.3 + Math.sin(t * 1.5 + f.i) * .08; f.g.visible = !f.done; });
    orbs.forEach((o, i) => { if (!o.g.visible) return; o.g.rotation.y = t; o.g.position.y = 1.3 + Math.sin(t * 2 + i) * .12; });
    if (Math.random() < .08) { const i = Math.floor(Math.random() * ledPos.length); leds.setColorAt(i, c.setHex(W.alarmOn ? 0xff2a4a : Math.random() < .7 ? 0x3fd1e6 : Math.random() < .5 ? 0xffb13b : 0x0a1418)); leds.instanceColor.needsUpdate = true; }
    alarm.intensity = W.alarmOn ? (Math.sin(t * 5) * .5 + .5) * 3 : 0;
    lights.forEach(l => l.intensity = W.alarmOn ? .35 : 1.1);
    dust.rotation.y = t * .01;
    if (W.doorOpen && door.position.y < 5.2) door.position.y += dt * 1.6;
    // SORT-9 chase
    if (sort.g.visible) {
      const sp = sort.g.position; sort.g.lookAt(P.pos.x, 0, P.pos.z);
      sort.arms.forEach((a, i) => a.rotation.x = W.chase ? -1.1 + Math.sin(t * 6 + i * 3) * .3 : Math.sin(t * 1.5 + i) * .08);
      if (W.chase && canControl()) {
        const d = new THREE.Vector3(P.pos.x - sp.x, 0, P.pos.z - sp.z); const dist = d.length();
        if (dist > .01) { d.normalize().multiplyScalar(1.25 * dt); moveBody(sp, d.x, d.z, .5); }
        if (dist < 1.15 && W.onCaught) W.onCaught();
      }
    }
  };
  return W;
}

function buildOrchard() {
  const W = world0 = { scene: new THREE.Scene(), interact: [], blockers: [], bounds: { x0: -29, x1: 29, z0: -29, z1: 29 } };
  const sc = W.scene; sc.fog = new THREE.Fog(0x8a5a5a, 22, 75);
  const sky = new THREE.Mesh(new THREE.SphereGeometry(180, 32, 16), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { top: { value: new THREE.Color(0x0f1a3a) }, mid: { value: new THREE.Color(0xf09a60) }, bot: { value: new THREE.Color(0x3a2433) }, sunDir: { value: new THREE.Vector3(-.55, .16, -.8).normalize() } },
    vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: 'uniform vec3 top; uniform vec3 mid; uniform vec3 bot; uniform vec3 sunDir; varying vec3 vP; void main(){ float h = vP.y; vec3 c = h > 0.0 ? mix(mid, top, pow(clamp(h*1.8,0.0,1.0), .6)) : mix(mid, bot, clamp(-h*5.0,0.0,1.0)); float s = max(dot(vP, sunDir), 0.0); c += vec3(1.0,.75,.45)*pow(s, 400.0)*3.0 + vec3(1.0,.55,.3)*pow(s, 10.0)*.35; gl_FragColor = vec4(c, 1.0); }'
  })); sc.add(sky);
  sc.add(new THREE.HemisphereLight(0xffc9a0, 0x2a3a2a, .75));
  const sun = new THREE.DirectionalLight(0xffb070, 1.9); sun.position.set(-26, 16, -36); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -34, right: 34, top: 34, bottom: -34, near: 1, far: 100 }); sun.shadow.bias = -.0008; sc.add(sun);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(90, 90), M(0xffffff, { map: noiseTex('#3f5a2c', .25, [26, 26], true), roughness: .95 })); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; sc.add(ground);
  const path = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 44), M(0xffffff, { map: noiseTex('#6b5238', .2, [2, 20]), roughness: 1 })); path.rotation.x = -Math.PI / 2; path.position.set(0, .01, 3); path.receiveShadow = true; sc.add(path);
  // trees
  const trunkM = M(0x4a3222, { roughness: .9 }), leafMs = [M(0x2f5a30, { flatShading: true }), M(0x3b6b36, { flatShading: true }), M(0x4a7338, { flatShading: true })];
  const deco = M(0xb8202a, { roughness: .4 }), decoG = M(0x86c440, { roughness: .4 });
  const trees = [];
  for (const x of [-21, -14, 14, 21]) for (const z of [-21, -14, -7, 0, 7, 14, 21]) trees.push([x, z]);
  for (const x of [-7, 7]) for (const z of [7, 14, 21, -15, -22]) trees.push([x, z]);
  trees.forEach(([x, z], i) => {
    const g = new THREE.Group(); g.position.set(x + (Math.random() - .5) * .6, 0, z + (Math.random() - .5) * .6);
    const tr = new THREE.Mesh(new THREE.CylinderGeometry(.16, .26, 2.2, 8), trunkM); tr.position.y = 1.1; tr.castShadow = true; g.add(tr);
    for (let k = 0; k < 3; k++) { const f = new THREE.Mesh(new THREE.IcosahedronGeometry(1.1 + Math.random() * .4, 0), leafMs[(i + k) % 3]); f.position.set((Math.random() - .5) * 1.1, 2.6 + Math.random() * .8, (Math.random() - .5) * 1.1); f.castShadow = true; g.add(f); }
    const dm = i % 5 === 0 ? decoG : deco;
    for (let k = 0; k < 6; k++) { const a = new THREE.Mesh(new THREE.SphereGeometry(.09, 8, 6), dm); const an = Math.random() * Math.PI * 2; a.position.set(Math.cos(an) * 1.15, 2.2 + Math.random() * 1.1, Math.sin(an) * 1.15); g.add(a); }
    sc.add(g); block(g.position.x, g.position.z, .6, .6);
  });
  // fence
  const fenceM = M(0x6b4a30);
  for (let a = -28; a <= 28; a += 2) for (const [x, z] of [[a, -28.6], [a, 28.6], [-28.6, a], [28.6, a]]) { const p = new THREE.Mesh(new THREE.BoxGeometry(.14, 1.1, .14), fenceM); p.position.set(x, .55, z); sc.add(p); }
  for (const [x, z, w, d] of [[0, -28.6, 57.4, .08], [0, 28.6, 57.4, .08], [-28.6, 0, .08, 57.4], [28.6, 0, .08, 57.4]]) for (const y of [.45, .85]) { const r = new THREE.Mesh(new THREE.BoxGeometry(w, .08, d), fenceM); r.position.set(x, y, z); sc.add(r); }
  // sorting station (z = -8)
  const metal = M(0x3b4247, { metalness: .6, roughness: .45 });
  const beltTex = canvasTex(64, (x, s) => { x.fillStyle = '#1a1d1f'; x.fillRect(0, 0, s, s); x.fillStyle = '#2c3135'; for (let i = 0; i < s; i += 16) x.fillRect(i, 0, 6, s); }, [8, 1]);
  const belt = new THREE.Mesh(new THREE.BoxGeometry(7, .12, 1), M(0xffffff, { map: beltTex, roughness: .8 })); belt.position.set(-2.2, .9, -8); belt.receiveShadow = true; sc.add(belt);
  box(sc, 7.2, .84, 1.1, metal, -2.2, .42, -8, { cast: true }); block(-2.2, -8, 7.2, 1.1);
  const havi = makeHavi(); havi.g.position.set(2.2, 0, -8.9); sc.add(havi.g); block(2.2, -8.9, 1.1, 1);
  const crate = new THREE.Group(); crate.position.set(2.4, 0, -6.6); const wood = M(0x8a6238, { roughness: .9 });
  for (const [w, d, x, z] of [[1.1, .08, 0, -.4], [1.1, .08, 0, .4], [.08, .8, -.55, 0], [.08, .8, .55, 0]]) { const b = new THREE.Mesh(new THREE.BoxGeometry(w, .5, d), wood); b.position.set(x, .25, z); b.castShadow = true; crate.add(b); }
  const cb = new THREE.Mesh(new THREE.BoxGeometry(1.1, .05, .8), wood); cb.position.y = .05; crate.add(cb); sc.add(crate); block(2.4, -6.6, 1.2, .9);
  for (let i = 0; i < 7; i++) { const a = makeFruit('red_apple', .9); a.position.set(2.4 + (Math.random() - .5) * .8, .08, -6.6 + (Math.random() - .5) * .5); crate.parent.add(a); }
  const crateSign = textSprite('시장으로', '#8bd67f'); crateSign.position.set(2.4, 1, -6.6); crateSign.scale.multiplyScalar(.7); sc.add(crateSign);
  const bin = new THREE.Mesh(new THREE.CylinderGeometry(.55, .45, .9, 20, 1, true), M(0x4a5055, { metalness: .5, side: THREE.DoubleSide })); bin.position.set(4.1, .45, -7.2); bin.castShadow = true; sc.add(bin); block(4.1, -7.2, 1.1, 1.1);
  const binPile = []; for (let i = 0; i < 9; i++) { const f = makeFruit(i % 3 === 2 ? 'yellow_apple' : 'green_apple', .85); f.position.set(4.1 + (Math.random() - .5) * .6, .55 + Math.random() * .2, -7.2 + (Math.random() - .5) * .6); sc.add(f); binPile.push(f); }
  const binSign = textSprite('폐기', '#ff6d5a'); binSign.position.set(4.1, 1.35, -7.2); binSign.scale.multiplyScalar(.7); sc.add(binSign);
  // training terminal
  const term = new THREE.Group(); term.position.set(6.8, 0, -8.2);
  const tb = new THREE.Mesh(new THREE.BoxGeometry(.7, 1.2, .5), metal); tb.position.y = .6; tb.castShadow = true; term.add(tb);
  const scrTex = canvasTex(256, (x, s) => { x.fillStyle = '#071116'; x.fillRect(0, 0, s, s); x.strokeStyle = '#5ad8ea'; x.lineWidth = 4; x.strokeRect(8, 8, s - 16, s - 16); x.fillStyle = '#5ad8ea'; x.font = '46px "Do Hyeon", sans-serif'; x.textAlign = 'center'; x.fillText('학습 단말기', s / 2, 100); x.font = '22px "IBM Plex Mono", monospace'; x.fillStyle = '#ffb13b'; x.fillText('HAVI · RETRAIN', s / 2, 150); x.fillStyle = '#8da4ab'; x.fillText('▶ SCAN TO OPEN', s / 2, 200); });
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(.9, .9), new THREE.MeshBasicMaterial({ map: scrTex })); scr.position.set(0, 1.65, .05); scr.rotation.x = -.15; term.add(scr);
  const scrBack = new THREE.Mesh(new THREE.BoxGeometry(1, 1, .08), metal); scrBack.position.set(0, 1.65, 0); scrBack.rotation.x = -.15; term.add(scrBack);
  const tg = glow(0x5ad8ea, 2.2, .35); tg.position.set(0, 1.65, .3); term.add(tg);
  sc.add(term); block(6.8, -8.2, .9, .7);
  // Bit
  const bit = makeBit(); bit.g.position.set(1, 1.45, 9); sc.add(bit.g);
  // fireflies
  const ff = new THREE.BufferGeometry(), fp = new Float32Array(160 * 3); for (let i = 0; i < 160; i++) { fp[i * 3] = (Math.random() - .5) * 56; fp[i * 3 + 1] = .4 + Math.random() * 3; fp[i * 3 + 2] = (Math.random() - .5) * 56; } ff.setAttribute('position', new THREE.BufferAttribute(fp, 3));
  const flies = new THREE.Points(ff, new THREE.PointsMaterial({ color: 0xffe79a, size: .09, transparent: true, opacity: .8, blending: THREE.AdditiveBlending, depthWrite: false })); sc.add(flies);
  // sample spots
  const SPOTS = [['red_apple', -12.5, 6], ['red_apple', 12.5, -1.5], ['green_apple', -15.6, -12.4], ['green_apple', 15.6, 12.5], ['yellow_apple', -19.5, 15.6], ['yellow_apple', 22.6, -19.4], ['tomato', 8.6, 15.6], ['tomato', -8.6, -16.6], ['lime', 19.5, -12.4], ['lemon', -15.6, -1.6], ['red_ball', 4, 4], ['tennis', -5, 19.6]];
  const beamM = new THREE.MeshBasicMaterial({ color: 0xffb13b, transparent: true, opacity: .16, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
  const spots = SPOTS.map(([type, x, z], i) => {
    const g = new THREE.Group(); g.position.set(x, 0, z);
    const fr = makeFruit(type, 1.35); g.add(fr);
    const ring = new THREE.Mesh(new THREE.RingGeometry(.28, .34, 32), new THREE.MeshBasicMaterial({ color: 0xffb13b, transparent: true, opacity: .8, side: THREE.DoubleSide })); ring.rotation.x = -Math.PI / 2; ring.position.y = .02; g.add(ring);
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(.05, .3, 4, 12, 1, true), beamM); beam.position.y = 2; g.add(beam);
    sc.add(g); return { g, fr, ring, beam, type, got: false, i, home: [x, 0, z] };
  });
  // test stage objects
  const testGroup = new THREE.Group(); sc.add(testGroup);
  Object.assign(W, { bit, havi, spots, belt, beltTex, crate, bin, binPile, term, flies, testGroup, bitFollow: false, haviToss: true });
  let tossT = 0, tossing = null;
  W.update = (dt, t) => {
    sky.position.copy(camera.position);
    const bp = bit.g.position;
    if (W.bitFollow) { const f = fwd(), r = right(); const tx = P.pos.x + r.x * .8 + f.x * 1.4, tz = P.pos.z + r.z * .8 + f.z * 1.4; bp.x = lerp(bp.x, tx, dt * 2); bp.z = lerp(bp.z, tz, dt * 2); }
    bp.y = 1.45 + Math.sin(t * 2) * .06; bit.g.lookAt(camera.position.x, bp.y, camera.position.z);
    bit.tip.material.color.setHex(Math.sin(t * 6) > 0 ? 0xffb13b : 0x5a3a10);
    spots.forEach(s => { if (s.got) return; s.fr.rotation.y = t * .6 + s.i; s.fr.position.y = .12 + Math.sin(t * 2 + s.i) * .05; s.ring.scale.setScalar(1 + Math.sin(t * 3 + s.i) * .12); s.beam.material.opacity = .12; });
    beltTex.offset.x = W.beltOn ? (beltTex.offset.x - dt * .9) : beltTex.offset.x;
    flies.rotation.y = t * .004; flies.position.y = Math.sin(t * .6) * .15;
    havi.g.lookAt(camera.position.x, 0, camera.position.z);
    // idle toss animation: green apple rides belt and gets dumped in bin
    if (W.haviToss) {
      tossT += dt;
      if (!tossing && tossT > 2.2) { tossT = 0; tossing = makeFruit(Math.random() < .6 ? 'green_apple' : 'yellow_apple', .9); tossing.position.set(-5.4, .96, -8); tossing.userData.p = 0; sc.add(tossing); W.beltOn = true; }
      if (tossing) {
        const p = tossing.userData.p += dt / 3.4;
        if (p < .8) tossing.position.x = lerp(-5.4, 1.3, p / .8);
        else { const q = (p - .8) / .2; tossing.position.set(lerp(1.3, 4.1, q), .96 + Math.sin(q * Math.PI) * 1.2 - q * .3, lerp(-8, -7.2, q)); havi.arm.rotation.y = -Math.sin(q * Math.PI) * .9; }
        if (p >= 1) { sc.remove(tossing); tossing.traverse(o => o.geometry && o.geometry.dispose()); tossing = null; W.beltOn = false; havi.eyeMat.color.setHex(0xff6d5a); }
        else if (p > .75) havi.eyeMat.color.setHex(0xff6d5a); else havi.eyeMat.color.setHex(0xffb13b);
      }
    } else if (tossing) { sc.remove(tossing); tossing = null; W.beltOn = false; }
  };
  return W;
}

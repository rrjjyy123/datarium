/* ===================== 데이터리움 · story ===================== */
G.touch = (window.matchMedia && matchMedia('(pointer: coarse)').matches) || false;

function typeInto(el, text, speed = 42) {
  return new Promise(res => {
    let i = 0, done = false; el.textContent = '';
    const fin = () => { if (done) return; done = true; el.textContent = text; el.classList.remove('caret'); $('#screen').removeEventListener('click', fin); res(); };
    $('#screen').addEventListener('click', fin);
    const st = () => { if (done) return; i++; el.textContent = text.slice(0, i); if (i % 2 === 0) Snd.play('type'); if (i < text.length) setTimeout(st, text[i - 1] === '\n' ? 420 : speed); else fin(); };
    el.classList.add('caret'); st();
  });
}
const clickOnce = el => new Promise(r => el.addEventListener('click', () => { Snd.play('blip'); r(); }, { once: true }));

/* ---------- title ---------- */
function bootTitle() {
  G.playing = false; G.lock = 0; G.stage = null; dState = null;
  $('#dialog').hidden = true; $('#panel').hidden = true; $('#banner').hidden = true; $('#btnData').hidden = true; $('#tray').hidden = true;
  showHUD(false); releaseLock();
  setWorld(buildTitleWorld()); fadeTo(0, 1200); Snd.ambient(Snd.ctx ? 'title' : null);
  const sv = Save.get(); if (sv.sens) G.sens = sv.sens;
  const scr = $('#screen'); scr.className = 'dim'; scr.hidden = false;
  const cont = sv.reached ? `<button class="btn" id="tCont">이어하기 · ${sv.reached === 'stage1' ? 'STAGE 1 치우친 과수원' : '프롤로그'}</button>` : '';
  scr.innerHTML = `<div>
    <div class="logo">데이터리움</div><div class="logo-sub">학습의 기록</div>
    <p class="tag">인공지능 '코어'가 모든 판단을 대신하는 도시.<br>코어는 무엇을 보고 배웠을까요? 그 데이터를 직접 확인하러 갑니다.</p>
    <div class="menu"><button class="btn pri" id="tNew">접속 시작하기</button>${cont}<button class="linkbtn" id="tTeach">교사용 · 장면 바로 가기</button></div>
    <div class="ctrls">${controlsHTML()}</div></div>`;
  $('#tNew').onclick = () => { Snd.init(); Snd.play('blip'); intro(); };
  if ($('#tCont')) $('#tCont').onclick = () => { Snd.init(); G.name = sv.name || '탐사원'; scr.hidden = true; sv.reached === 'stage1' ? runStage1() : runPrologue(); };
  $('#tTeach').onclick = async () => {
    Snd.init(); scr.hidden = true;
    const k = await panel(`<div class="eyebrow">교사용</div><div class="ph">장면 바로 가기</div><p class="pp">수업 시간에 맞춰 원하는 장면부터 시작할 수 있어요. 이름은 「${esc(sv.name || '탐사원')}」으로 진행합니다.</p>
      <div class="card"><b>프롤로그 · 폐기 데이터 보관소</b><p class="pp">잘못된 라벨, 치우친 데이터, 빠진 데이터 찾기 → 로봇에게 데이터 넣기 (약 8분)</p></div>
      <div class="card"><b>STAGE 1 · 치우친 과수원</b><p class="pp">샘플 수집 → 라벨 붙이기 → 학습 → 테스트 → 윤리 질문 (약 15분)</p></div>`,
      [['취소', ''], ['프롤로그', ''], ['STAGE 1', 'pri']]);
    G.name = sv.name || '탐사원';
    if (k === 0) { scr.hidden = false; return; }
    k === 1 ? runPrologue() : runStage1();
  };
}

async function intro() {
  Snd.ambient('title');
  const scr = $('#screen'); scr.className = 'black'; scr.hidden = false;
  scr.innerHTML = `<div><div class="eyebrow">시스템 배경 정보</div><div class="typed" id="ty" style="margin-top:24px"></div><div class="menu" id="tyBtn" hidden><button class="btn pri" id="tyGo">다음</button></div></div>`;
  await typeInto($('#ty'), `인공지능 '코어'가 도시의 모든 판단을 대신하는 곳, 데이터리움.\n코어는 도시의 사진과 기록 수십억 개를 먹고 자랐습니다.\n그런데 아무도 묻지 않았습니다.\n코어가 「어떤」 데이터를 먹었는지.`);
  $('#tyBtn').hidden = false; $('#tyGo').focus(); await clickOnce($('#tyGo'));
  scr.innerHTML = `<form id="nameForm" style="width:min(440px,100%);margin:auto"><div class="eyebrow">시민 등록 단말기</div>
    <p class="tag" style="margin-top:14px">데이터리움에 오신 것을 환영합니다.<br>이름(또는 별명)을 입력하세요.</p>
    <input id="nameIn" maxlength="8" autocomplete="off" placeholder="이름 입력" aria-label="이름">
    <p class="note">입력한 이름은 이 기기의 게임 화면에만 쓰이고, 어디로도 전송되지 않아요.</p>
    <div class="menu"><button class="btn pri" type="submit">등록</button></div></form>`;
  const inp = $('#nameIn'); setTimeout(() => inp.focus(), 50);
  await new Promise(r => $('#nameForm').addEventListener('submit', e => { e.preventDefault(); r(); }));
  G.name = inp.value.trim().replace(/[<>]/g, '') || '탐사원'; Save.set({ name: G.name });
  scr.hidden = true; $('#fade').style.opacity = 1;
  await talk('core', '환영합니다, {name} 시민. 등록을 위해 얼굴 인식을 시작합니다.');
  await talk('core', '인식 중 ▮▮▮▮▮▮▯▯▯▯');
  await glitch();
  await talk('core', '오류. 학습 데이터에서 일치하는 얼굴 유형을 찾을 수 없습니다.');
  await talk('core', '분류 결과: 「알 수 없음」. 알 수 없는 것은 쓸모없는 데이터로 처리합니다.');
  await talk('core', '폐기 데이터 보관소로 이동합니다.');
  await glitch();
  runPrologue();
}

/* ---------- prologue ---------- */
const FRAG = [
  { id: '0x1A7', title: '사진 1장', rows: [['내용', '줄무늬 고양이 사진'], ['붙은 라벨', '강아지'], ['버려진 이유', '「판단에 혼란을 줌」']],
    q: '이 데이터에는 어떤 문제가 있을까요?', opts: ['사진이 한 장뿐이에요', '라벨(이름표)이 잘못 붙었어요', '아무 문제 없어요'], ans: 1,
    wrong: ['한 장뿐인 건 괜찮아요. 사진 속 동물과 붙은 이름표를 비교해 보세요!', null, '고양이 사진에 「강아지」라는 라벨이... 다시 봐요!'],
    right: ['맞아요! 라벨이 틀리면 AI는 고양이를 보고 강아지라고 배워요.', 'AI에게 라벨은 정답지 같은 거예요. 정답지가 틀리면 열심히 공부해도 틀리게 배우죠.'] },
  { id: '0x2C4', title: '폴더 「신발」', rows: [['사진 수', '1,000장'], ['운동화', '998장'], ['장화', '2장'], ['버려진 이유', '「장화는 너무 드물어서 무시함」']],
    q: '이 폴더로 배운 AI는 어떻게 될까요?', opts: ['장화를 보고 「신발 아님」이라고 할 수 있어요', '모든 신발을 똑같이 잘 알아봐요', '운동화를 잘 못 알아봐요'], ans: 0,
    wrong: [null, '한쪽에 몰린 데이터라면... 드물게 본 쪽은 어떻게 될까요?', '운동화는 998장이나 봤는걸요. 적게 본 쪽을 생각해 봐요!'],
    right: ['정답! 데이터가 한쪽으로 치우치면, 적게 본 것을 잘 못 알아봐요.', '이걸 「데이터 편향」이라고 불러요. 기억해 두세요!'] },
  { id: '0x3F0', title: '폴더 「사람 얼굴」', rows: [['사진 수', '2,400,000장'], ['어른 얼굴', '2,400,000장'], ['어린이 얼굴', '0장'], ['버려진 이유', '「어린이 사진: 수집 대상 아님」']],
    q: '이 폴더를 보고 알 수 있는 건?', opts: ['사진이 많으니 누구든 알아볼 거예요', '어린이 얼굴 데이터가 통째로 빠져 있어요', '어른 사진이 너무 적어요'], ans: 1,
    wrong: ['아무리 많아도, 한 번도 못 본 얼굴이라면...?', null, '어른 사진은 240만 장이나 있어요!'],
    right: ['바로 그거예요! 어린이 얼굴은 한 장도 없어요.', '그래서 코어가 {name}님을 못 알아본 거예요. 코어는 {name}님 같은 얼굴을 한 번도 배운 적이 없으니까요!'] }
];
async function quiz(who, q, opts, ans, wrong, right) {
  for (; ;) {
    const k = await choose(who, q, opts);
    if (k === ans) { Snd.play('ok'); for (const l of right) await talk('bit', l); return; }
    Snd.play('bad'); await talk('bit', wrong[k] || '음... 다시 한 번 생각해 볼까요?');
  }
}

async function runPrologue() {
  G.stage = 'prologue'; Save.set({ reached: 'prologue', name: G.name });
  $('#screen').hidden = true; $('#fade').style.opacity = 1; $('#btnData').hidden = true; $('#tray').hidden = true;
  Snd.init(); setWorld(buildArchive()); const W = world; placePlayer(0, 12.2, 0, -.04);
  G.playing = true; G.lock = 1; showHUD(true); Snd.ambient('archive'); setObj('...');
  await fadeTo(0, 1600);
  await banner('PROLOGUE', '폐기 데이터 보관소', '버려진 데이터가 모이는 곳');
  await lines([['sys', '(머리가 지끈거린다. 먼지 쌓인 서버 선반이 끝없이 늘어서 있다.)'], ['me', '여긴... 어디지? 코어가 나를 「알 수 없음」이라고 했어.'], ['sys', '(저 앞에서 작은 불빛 하나가 깜빡이고 있다.)']]);
  G.lock = 0;
  setObj('깜빡이는 불빛 쪽으로 가 보자');
  toast(G.touch ? '왼쪽 스틱으로 이동하고, 화면을 끌어 둘러보세요' : 'W A S D로 이동 · 화면을 클릭하면 마우스로 둘러볼 수 있어요', 4500);
  await until(() => Math.hypot(P.pos.x - W.bit.g.position.x, P.pos.z - W.bit.g.position.z) < 2.6);
  G.lock++;
  await lines([
    ['bit', '우와, 움직인다! 진짜 사람이에요! 안녕하세요, 저는 비트예요.'],
    ['bit', '이 보관소에서 코어가 「쓸모없다」며 버린 데이터를 정리하는 꼬마 로봇이죠.'],
    ['me', '코어가 나를 「알 수 없음」이라면서 여기로 보냈어.'],
    ['bit', '사람을 알 수 없다고요? 이상하네요. 코어는 사람 얼굴을 수백만 장이나 배웠다던데...'],
    ['bit', '혹시 코어가 배운 데이터에 뭔가 문제가 있던 걸까요? 여기 버려진 데이터를 살펴보면 알 수 있을지도 몰라요.'],
    ['bit', '자, 이걸 받으세요!']
  ]);
  Snd.play('pick');
  await panel(`<div class="eyebrow">새 도구</div><div class="ph">라벨 스캐너</div>
    <p class="pp">가운데 조준점으로 물체를 바라보고 <b class="mono">${G.touch ? '스캔 버튼' : 'E 키 또는 클릭'}</b>을 누르면, AI가 그 물체를 어떤 데이터로 보는지 읽어 냅니다. 조준점이 주황색으로 커지면 스캔할 수 있다는 뜻이에요.</p>
    <div class="ctrls">${controlsHTML()}</div>`, [['받기', 'pri']]);
  await talk('bit', '저쪽 선반 사이에 푸르게 빛나는 데이터 조각이 세 개 있어요. 하나씩 스캔해 봐요!');
  G.lock--; W.bitFollow = true;
  const count = () => W.frags.filter(f => f.done).length;
  setObj('버려진 데이터 조각을 스캔하자 (0/3)');
  W.frags.forEach(f => W.interact.push({
    obj: f.g, r: .45, label: '데이터 조각 스캔', enabled: () => !f.done,
    action: async () => {
      const d = FRAG[f.i];
      await panel(`<div class="eyebrow">DATA FRAGMENT ${d.id}</div><div class="ph">${d.title}</div><dl class="kv">${d.rows.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl>`, [['살펴보기', 'pri']]);
      await quiz('bit', d.q, d.opts, d.ans, d.wrong, d.right);
      f.done = true; setObj(`버려진 데이터 조각을 스캔하자 (${count()}/3)`);
    }
  }));
  await until(() => count() === 3);
  // alarm & SORT-9
  G.lock++;
  await talk('bit', '세 가지 문제를 다 찾았어요. 틀린 라벨, 치우친 데이터, 빠진 데이터!');
  W.alarmOn = true; Snd.play('alarm'); W.sort.g.visible = true; W.sort.g.position.set(0, 0, -13.4);
  await talk('core', '보관소 안에서 움직이는 미분류 객체를 감지했습니다. 정리 로봇 SORT-9, 분류 후 처리하십시오.');
  const sp = W.sort.g.position; await tween(1800, k => { sp.z = lerp(-13.4, -10.5, k); });
  await lines([['sort', '분류를 시작합니다...... 결과: 「상자」. 신뢰도 97%.'], ['sort', '상자는 선반으로 옮깁니다. 상자는 움직이지 않습니다.'], ['bit', '상자라니요?! {name}님, 저 로봇을 스캔해 봐요. 무엇을 배웠는지 보일 거예요!']]);
  G.lock--;
  setObj('SORT-9를 스캔하자');
  W.orbsGot = 0;
  W.onCaught = async () => {
    if (W.catching) return; W.catching = true; G.lock++; hurt(); Snd.play('bad');
    await talk('bit', '으악, 붙잡혔어요! SORT-9가 {name}님을 상자 선반에 올려 버렸어요. 제가 꺼내 드릴게요. 다시 해 봐요!');
    placePlayer(0, 11.5, 0); W.sort.g.position.set(0, 0, -11); G.lock--; W.catching = false;
  };
  W.interact.push({
    obj: W.sort.g, off: new THREE.Vector3(0, 1.2, 0), r: .8, range: 7, enabled: () => !W.fed,
    label: () => !W.sortScanned ? 'SORT-9 스캔' : W.orbsGot < 3 ? `SORT-9 (사람 데이터 ${W.orbsGot}/3)` : 'SORT-9에게 사람 데이터 넣기',
    action: async () => {
      if (!W.sortScanned) {
        await panel(`<div class="eyebrow">SCAN · SORT-9 정리 로봇</div><div class="ph">SORT-9가 배운 데이터</div>
          <div class="bars">
            <div class="bar"><span>상자 사진</span><span class="tr"><span class="fl" style="width:100%;background:var(--amber)"></span></span><span class="n">4,812</span></div>
            <div class="bar"><span>선반 사진</span><span class="tr"><span class="fl" style="width:25%;background:#6d777c"></span></span><span class="n">1,203</span></div>
            <div class="bar"><span>사람 사진</span><span class="tr"><span class="fl" style="width:0"></span></span><span class="n warn">0</span></div>
          </div>
          <p class="pp" style="margin-top:14px">판단 방식: 새로 본 것을 <b>배운 것 중 가장 비슷한 것</b>으로 분류합니다.</p>`, [['알겠어', 'pri']]);
        await lines([['bit', '역시! 사람 사진을 한 장도 못 배웠어요. 그러니 {name}님을 보면 가장 비슷한 「상자」라고 하는 거예요.'], ['bit', '선반 뒤쪽 통로에 분홍빛 「사람 데이터」가 3개 떠 있어요. 그걸 모아서 SORT-9에게 넣어 줘요!'], ['bit', '조심해요, SORT-9가 {name}님을 옮기려고 쫓아올 거예요!']]);
        W.sortScanned = true; W.chase = true; W.orbs.forEach(o => { o.g.visible = true; o.g.userData.l.intensity = 1.2; });
        setObj('선반 뒤 「사람 데이터」 모으기 (0/3) · SORT-9를 피하자');
      } else if (W.orbsGot < 3) { toast(`사람 데이터가 아직 부족해요 (${W.orbsGot}/3)`); }
      else {
        W.chase = false;
        await talk('sys', '(모은 사람 데이터 3개를 SORT-9의 학습 포트에 넣었다.)');
        Snd.play('learn');
        await talk('sort', '새 학습 데이터 3개 확인. 재학습 중......');
        W.sort.eyeMat.color.setHex(0x5ad8ea); W.sort.light.color.setHex(0x5ad8ea);
        await lines([['sort', '다시 분류합니다...... 결과: 「사람」. 신뢰도 71%.'], ['bit', '됐다! 그런데 71%밖에 안 되네요. 사람 사진을 3장만 배웠으니 아직 헷갈리나 봐요.'], ['sort', '사람은 선반으로 옮기지 않습니다. 실례했습니다. 출입문을 엽니다.']]);
        W.alarmOn = false; W.doorOpen = true; W.blockers = W.blockers.filter(b => b.id !== 'door'); W.exitGlow.intensity = 2.5; Snd.play('door');
        await lines([['bit', '데이터 세 개로 로봇의 판단이 바뀌었어요. 거꾸로 생각하면... 코어는 도시 전체를 이렇게 배웠다는 거잖아요.'], ['bit', '밖에는 또 뭐가 잘못 배워져 있을지 몰라요. 같이 가요, {name}님!']]);
        W.fed = true;
      }
    }
  });
  W.orbs.forEach(o => W.interact.push({
    obj: o.g, r: .4, silent: true, label: '사람 데이터 줍기', enabled: () => o.g.visible && !o.got,
    action: async () => { o.got = true; o.g.visible = false; W.orbsGot++; Snd.play('pick'); setObj(W.orbsGot < 3 ? `선반 뒤 「사람 데이터」 모으기 (${W.orbsGot}/3) · SORT-9를 피하자` : 'SORT-9에게 가서 사람 데이터를 넣자'); if (W.orbsGot === 3) toast('사람 데이터 3개를 모두 모았어요!'); }
  }));
  await until(() => W.fed);
  setObj('열린 문으로 나가자');
  await until(() => P.pos.z < -16.3);
  G.lock++; await fadeTo(1, 900); G.lock = 0;
  runStage1();
}

/* ---------- stage 1 ---------- */
const S1 = { samples: [], nextId: 1, attempts: 0, choice: null };
const TEST_SET = ['green_apple', 'yellow_apple', 'red_apple', 'tomato', 'lime', 'lemon'];
const LAB = l => l === 'apple' ? '사과' : '사과 아님';

function updateTray() {
  const t = $('#tray'); const n = S1.samples.length, a = S1.samples.filter(s => s.label === 'apple').length;
  t.hidden = G.stage !== 'stage1' || !world || !world.collecting;
  t.innerHTML = `<span>샘플 <strong>${n}</strong>/12</span><span class="dots">${S1.samples.map(s => `<span class="dot ${s.label === 'apple' ? 'ap' : ''}" style="background:${TYPES[s.type].css}" title="#${s.id}"></span>`).join('')}</span><span>사과 <strong>${a}</strong> · 아님 <strong>${n - a}</strong></span>`;
}
const obj1 = () => `과수원의 샘플을 스캔하고 라벨 붙이기 (${S1.samples.length}/12) — 6개 이상이면 파란 학습 단말기로`;

async function runStage1() {
  G.stage = 'stage1'; Save.set({ reached: 'stage1', name: G.name });
  $('#screen').hidden = true; $('#fade').style.opacity = 1;
  Snd.init(); setWorld(buildOrchard()); const W = world; placePlayer(0, 14, 0, 0);
  S1.samples = []; S1.nextId = 1; S1.attempts = 0; S1.choice = null;
  G.playing = true; G.lock = 1; showHUD(true); Snd.ambient('orchard'); setObj('...');
  W.onData = () => openDataset(false);
  await fadeTo(0, 1500);
  await banner('STAGE 1', '치우친 과수원', '데이터 수집과 편향');
  await lines([['bit', '밖이다! 여기는 데이터리움 외곽의 과수원이에요. 노을이 예쁘네요.'], ['bit', '저기 컨베이어 옆에 수확 로봇 「하비」가 있어요. 뭔가를 고르고 있는데요?']]);
  G.lock = 0; W.bitFollow = true;
  setObj('수확 로봇 하비에게 다가가 보자');
  await until(() => Math.hypot(P.pos.x - 2.2, P.pos.z + 8.9) < 5.4);
  G.lock++;
  await lines([['havi', '사과. 사과. ......사과 아님. 폐기합니다.'], ['havi', '안녕하세요. 저는 수확 로봇 하비입니다. 사과만 골라서 시장으로 보냅니다.'], ['bit', '잠깐만요! 방금 폐기통에 버린 거, 초록 사과잖아요!'], ['havi', '초록색은 사과가 아닙니다. 노란색도 사과가 아닙니다. 저는 그렇게 배웠습니다.'], ['bit', '{name}님, 하비를 스캔해서 무엇을 보고 배웠는지 확인해 봐요!']]);
  G.lock--;
  setObj('하비를 스캔하자');
  W.interact.push({ obj: W.havi.g, off: new THREE.Vector3(0, 1.1, 0), r: .7, range: 5.5, label: () => W.haviScanned ? '하비 · 처음 배운 데이터 보기' : '하비 스캔', action: haviAction });
  await until(() => W.haviScanned);
  W.collecting = true; updateTray(); $('#btnData').hidden = false;
  setObj(obj1());
  W.spots.forEach(s => W.interact.push({ obj: s.g, off: new THREE.Vector3(0, .3, 0), r: .45, range: 3.4, label: '샘플 스캔', enabled: () => !s.got, action: () => sampleAction(s) }));
  W.interact.push({ obj: W.term, off: new THREE.Vector3(0, 1.5, 0), r: .6, range: 4, label: '학습 단말기 열기', action: termAction });
}

function haviDataHTML() {
  return `<div class="eyebrow">SCAN · 수확 로봇 하비</div><div class="ph">하비가 처음 배운 데이터</div>
    <div class="bars">
      <div class="bar"><span>빨간 사과</span><span class="tr"><span class="fl" style="width:100%;background:#c0272f"></span></span><span class="n">30</span></div>
      <div class="bar"><span>초록 사과</span><span class="tr"><span class="fl" style="width:0"></span></span><span class="n warn">0</span></div>
      <div class="bar"><span>노란 사과</span><span class="tr"><span class="fl" style="width:0"></span></span><span class="n warn">0</span></div>
      <div class="bar"><span>돌 (사과 아님)</span><span class="tr"><span class="fl" style="width:33%;background:#6d777c"></span></span><span class="n">10</span></div>
      <div class="bar"><span>나뭇잎 (사과 아님)</span><span class="tr"><span class="fl" style="width:33%;background:#3d7a2a"></span></span><span class="n">10</span></div>
    </div>
    <p class="pp" style="margin-top:14px">판단 방식: 새 과일을 보면 <b>배운 데이터 중 가장 닮은 것</b>을 찾아, 그 데이터의 라벨을 따릅니다. (최근접 이웃 방식)</p>`;
}
async function haviAction() {
  const W = world;
  await panel(haviDataHTML(), [['확인', 'pri']]);
  if (W.haviScanned) return;
  await lines([
    ['bit', '역시! 하비는 빨간 사과 사진 30장만 보고 「사과」를 배웠어요. 사과가 아닌 건 돌이랑 나뭇잎뿐이고요.'],
    ['bit', '그러니 초록 사과를 보면 「내가 배운 사과랑 색이 달라!」 하고 버리는 거예요.'],
    ['havi', '......저는 배운 대로 했을 뿐입니다.'],
    ['bit', '맞아요, 하비 탓이 아니에요. 그러니까 우리가 하비에게 새 학습 데이터를 만들어 줘요!'],
    ['bit', '과수원 곳곳에 주황색 빛기둥이 보이죠? 거기 있는 샘플을 스캔하고, 「사과」인지 「사과 아님」인지 라벨을 붙여 주세요.'],
    ['bit', '사과가 아닌 것도 꼭 모아야 해요. 무엇이 사과가 아닌지도 알아야 제대로 구별할 수 있거든요.'],
    ['bit', `샘플이 6개 이상 모이면 저 파란 학습 단말기에서 하비를 다시 학습시킬 수 있어요. 모은 데이터는 ${G.touch ? '위쪽 「데이터셋」 버튼' : 'Q 키나 「데이터셋」 버튼'}으로 볼 수 있어요.`]
  ]);
  W.haviScanned = true;
}

async function sampleAction(s) {
  const W = world, T = TYPES[s.type], id = S1.nextId;
  const f = [['색', `<span style="display:inline-block;width:14px;height:14px;border-radius:50%;background:${T.css};vertical-align:-2px;margin-right:6px"></span>${T.color}`], ['꼭지(줄기)', T.stem ? '있음' : '없음'], ['별 모양 꽃받침', T.calyx ? '있음' : '없음'], ['이음선 무늬', T.seam ? '있음' : '없음'], ['모양', T.oval ? '길쭉함' : '둥긂']];
  const k = await panel(`<div class="eyebrow">SAMPLE #${String(id).padStart(2, '0')} · 스캔 결과</div><div class="ph">이 샘플에 라벨을 붙여 주세요</div>
    <p class="pp">스캐너가 읽은 특징이에요. 과수원에서 직접 본 모습과 함께 판단해요.</p>
    <div class="featgrid">${f.map(([a, b]) => `<div class="feat"><div class="k">${a}</div><div class="v">${b}</div></div>`).join('')}</div>`,
    [['나중에', ''], ['사과 아님', ''], ['사과', 'pri']]);
  if (k === 0) return;
  const label = k === 2 ? 'apple' : 'not';
  s.got = true; S1.nextId++; S1.samples.push({ id, type: s.type, label, spot: s.i });
  Snd.play('pick');
  const g = s.g, from = g.position.clone();
  s.ring.visible = s.beam.visible = false;
  tween(600, t => { g.position.set(lerp(from.x, P.pos.x, t), lerp(0, 1.2, t), lerp(from.z, P.pos.z, t)); g.scale.setScalar(1 - t * .95); }).then(() => { g.visible = false; });
  toast(`샘플 #${String(id).padStart(2, '0')} → 「${LAB(label)}」 라벨로 저장했어요`);
  updateTray(); setObj(obj1());
  const n = S1.samples.length;
  if (n === 1) await talk('bit', '좋아요! 이렇게 사람이 정답(라벨)을 붙여 주는 일을 「라벨링」이라고 해요.');
  if (n === 6) await talk('bit', '6개가 모였어요! 학습 단말기로 가도 되고, 더 모아도 돼요. 여러 종류가 골고루 있을수록 좋아요.');
  if (n === 12) await talk('bit', '과수원의 샘플을 전부 모았어요! 이제 학습 단말기로 가요.');
}

function datasetHTML(atTerm) {
  const d = S1.samples, n = d.length, a = d.filter(s => s.label === 'apple');
  const colors = ['빨강', '초록', '노랑'], cc = { 빨강: '#c0272f', 초록: '#86c440', 노랑: '#e8c233' };
  const max = Math.max(1, ...colors.map(c => d.filter(s => TYPES[s.type].color === c).length));
  const rows = colors.map(c => { const ap = d.filter(s => TYPES[s.type].color === c && s.label === 'apple').length, no = d.filter(s => TYPES[s.type].color === c && s.label !== 'apple').length;
    return `<div class="bar"><span>${c}</span><span class="tr"><span class="fl" style="width:${ap / max * 100}%;background:var(--amber)"></span><span class="fl" style="left:${ap / max * 100}%;width:${no / max * 100}%;background:#50646b"></span></span><span class="n">${ap}·${no}</span></div>`; }).join('');
  const apColors = [...new Set(a.map(s => TYPES[s.type].color))];
  const notes = [];
  if (n && !a.length) notes.push('「사과」 라벨이 붙은 데이터가 하나도 없어요.');
  if (n && a.length === n) notes.push('「사과 아님」 데이터가 없어요. 하비가 무엇이 사과가 아닌지 배울 수 없어요.');
  if (a.length) notes.push(`「사과」 라벨이 붙은 색: <b>${apColors.join(', ')}</b>`);
  const cards = d.map(s => `<div class="smp"><span class="sw" style="background:${TYPES[s.type].css}"></span><span class="id">#${String(s.id).padStart(2, '0')}</span><span class="ft">${featText(s.type).join(' · ')}</span>
      <div class="ac"><span class="lab ${s.label}">${LAB(s.label)}</span><button class="btn sm" data-flip="${s.id}">라벨 바꾸기</button><button class="btn sm" data-del="${s.id}">빼기</button></div></div>`).join('');
  return `<div class="eyebrow">${atTerm ? '학습 단말기 · HAVI RETRAIN' : '내 데이터셋'}</div><div class="ph">하비의 새 학습 데이터</div>
    <p class="pp">샘플 <b>${n}</b>개 · 사과 <b>${a.length}</b> · 사과 아님 <b>${n - a.length}</b>${n < 6 ? ` <span class="warn">— 학습하려면 ${6 - n}개 더 필요해요</span>` : ''}</p>
    <div class="card"><div class="eyebrow" style="color:var(--muted)">색깔별 데이터 (주황 = 사과 · 회색 = 사과 아님)</div><div class="bars">${rows}</div>${notes.length ? `<p class="pp" style="margin-top:10px">${notes.join('<br>')}</p>` : ''}</div>
    ${n ? `<div class="samples">${cards}</div>` : '<p class="pp" style="margin-top:14px">아직 모은 샘플이 없어요. 주황색 빛기둥을 찾아 스캔해 보세요.</p>'}
    <p class="note">「빼기」를 누르면 그 샘플은 과수원 제자리로 돌아가요. 다시 스캔해서 라벨을 새로 붙일 수 있어요.</p>`;
}
async function openDataset(atTerm) {
  G.lock++;
  const body = () => $('#panelBody');
  const btns = atTerm ? [['닫기', ''], ['하비 학습시키기', 'pri']] : [['닫기', 'pri']];
  const pr = panel(datasetHTML(atTerm), btns, true);
  body().onclick = e => {
    const f = e.target.closest('[data-flip]'), d = e.target.closest('[data-del]');
    if (f) { const s = S1.samples.find(x => x.id === +f.dataset.flip); s.label = s.label === 'apple' ? 'not' : 'apple'; Snd.play('blip'); }
    else if (d) { const i = S1.samples.findIndex(x => x.id === +d.dataset.del); const s = S1.samples.splice(i, 1)[0]; const sp = world.spots[s.spot]; sp.got = false; sp.g.visible = true; sp.g.scale.setScalar(1); sp.g.position.set(...sp.home); sp.ring.visible = sp.beam.visible = true; Snd.play('blip'); }
    else return;
    const y = $('#panelCard').scrollTop; body().innerHTML = datasetHTML(atTerm); $('#panelCard').scrollTop = y; updateTray(); setObj(obj1());
  };
  const k = await pr; body().onclick = null; G.lock--;
  return atTerm && k === 1;
}

async function termAction() {
  const n = S1.samples.length;
  if (n < 6) { await talk('bit', `지금 샘플이 ${n}개예요. 하비를 학습시키려면 적어도 6개가 필요해요. 주황색 빛기둥을 더 찾아봐요!`); return; }
  const go = await openDataset(true);
  if (!go) return;
  if (S1.samples.length < 6) { await talk('bit', '샘플이 6개보다 적어졌어요. 조금 더 모아 와요!'); return; }
  await trainAndTest();
}

function drawFeatureSpace(cv) {
  const x = cv.getContext('2d'), W = cv.width, H = cv.height, L = 90, T = 34, cw = (W - L - 16) / 3, ch = (H - T - 16) / 2;
  const cols = ['빨강', '초록', '노랑'], rows = ['꼭지 있음', '꼭지 없음'];
  const pts = S1.samples.map(s => { const Tt = TYPES[s.type]; const ci = cols.indexOf(Tt.color), ri = Tt.stem ? 0 : 1; const h = (s.id * 9301 + 49297) % 233280 / 233280, h2 = (s.id * 7919 + 131) % 1000 / 1000; return { s, px: L + ci * cw + 26 + h * (cw - 52), py: T + ri * ch + 24 + h2 * (ch - 48) }; });
  const start = performance.now();
  const frame = now => {
    const el = (now - start) / 1000;
    x.fillStyle = '#081014'; x.fillRect(0, 0, W, H);
    x.font = '600 15px "IBM Plex Mono", monospace'; x.fillStyle = '#8da4ab'; x.textAlign = 'center';
    cols.forEach((c, i) => x.fillText(c, L + i * cw + cw / 2, 22));
    x.textAlign = 'right'; rows.forEach((r, i) => x.fillText(r, L - 12, T + i * ch + ch / 2 + 5));
    x.strokeStyle = '#264049'; x.lineWidth = 1;
    for (let i = 0; i <= 3; i++) { x.beginPath(); x.moveTo(L + i * cw, T); x.lineTo(L + i * cw, T + 2 * ch); x.stroke(); }
    for (let i = 0; i <= 2; i++) { x.beginPath(); x.moveTo(L, T + i * ch); x.lineTo(L + 3 * cw, T + i * ch); x.stroke(); }
    pts.forEach((p, i) => {
      const a = clamp((el - i * .18) / .35, 0, 1); if (!a) return;
      const r = 13 * (a < 1 ? 1 + Math.sin(a * Math.PI) * .5 : 1);
      x.globalAlpha = a; x.beginPath(); x.arc(p.px, p.py, r, 0, Math.PI * 2); x.fillStyle = TYPES[p.s.type].css; x.fill();
      x.lineWidth = 3; x.strokeStyle = p.s.label === 'apple' ? '#ffb13b' : '#9fb0b5'; x.setLineDash(p.s.label === 'apple' ? [] : [4, 3]); x.stroke(); x.setLineDash([]);
      x.fillStyle = '#e3edef'; x.font = '600 12px "IBM Plex Mono", monospace'; x.textAlign = 'left'; x.fillText('#' + p.s.id, p.px + 17, p.py + 4); x.globalAlpha = 1;
    });
    if (el < pts.length * .18 + .6 && !$('#panel').hidden) requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

async function trainAndTest() {
  const W = world; S1.attempts++;
  Snd.play('learn');
  const pr = panel(`<div class="eyebrow">학습 중 · 시도 ${S1.attempts}회째</div><div class="ph">하비가 데이터를 특징대로 정리하고 있어요</div>
    <p class="pp">점 하나가 샘플 하나예요. 실선 테두리는 「사과」, 점선 테두리는 「사과 아님」 라벨이에요. 하비는 새 과일을 보면 이 중에서 <b>가장 닮은</b> 샘플을 찾아 그 라벨을 따라요. (표에는 안 보이지만 꽃받침, 이음선, 모양도 함께 비교해요.)</p>
    <canvas id="fsp" class="fspace" width="640" height="290" aria-label="특징 공간 그림"></canvas>`, [['테스트 시작', 'pri']], true);
  drawFeatureSpace($('#fsp'));
  await pr;
  // --- 3D test run ---
  W.haviToss = false; W.bitFollow = false; W.bit.g.position.set(-3, 1.6, -5.6);
  placePlayer(-.8, -3.1, -.06, -.2);
  await talk('havi', '새 학습 데이터로 재학습을 마쳤습니다. 처음 보는 테스트 과일 6개를 분류합니다.');
  const results = [];
  for (const type of TEST_SET) {
    const f = makeFruit(type, 1.2); f.position.set(-5.4, .96, -8); W.testGroup.add(f); W.beltOn = true;
    await tween(1300, k => { f.position.x = lerp(-5.4, 1.2, k); f.rotation.z = -k * 6; }, t => t);
    W.beltOn = false; W.havi.eyeMat.color.setHex(0xffffff); await sleep(300);
    const p = predict(type, S1.samples), ok = (p.label === 'apple') === TYPES[type].apple;
    const sp = textSprite(LAB(p.label), p.label === 'apple' ? '#ffb13b' : '#c9d6d9'); sp.position.set(1.2, 1.8, -8); W.testGroup.add(sp);
    W.havi.eyeMat.color.setHex(ok ? 0x8bd67f : 0xff6d5a); Snd.play(ok ? 'ok' : 'bad');
    await sleep(750);
    const to = p.label === 'apple' ? new THREE.Vector3(2.4, .15, -6.6) : new THREE.Vector3(4.1, .6, -7.2), from = f.position.clone();
    W.havi.arm.rotation.y = -.8;
    await tween(650, k => f.position.set(lerp(from.x, to.x, k), lerp(from.y, to.y, k) + Math.sin(k * Math.PI) * 1.1, lerp(from.z, to.z, k)), t => t);
    W.havi.arm.rotation.y = 0; W.testGroup.remove(sp);
    results.push({ type, pred: p.label, ok, nn: p.nn });
  }
  const score = results.filter(r => r.ok).length;
  const reason = r => {
    if (r.ok) return `<span class="okc">가장 닮은 샘플 #${r.nn.id}(${TYPES[r.nn.type].n})이 「${LAB(r.nn.label)}」</span>`;
    if (!r.nn) return '학습 데이터가 없어요';
    if (r.nn.type === r.type) return `샘플 #${r.nn.id}에 「${LAB(r.nn.label)}」 라벨이 붙어 있었어요. <b>라벨이 틀린 것 같아요.</b>`;
    return `똑같은 종류의 데이터가 없어서, 가장 닮은 샘플 #${r.nn.id}(${TYPES[r.nn.type].n}, 「${LAB(r.nn.label)}」)을 보고 판단했어요. <b>${josa(TYPES[r.type].n, '이', '가')} 들어간 데이터가 필요해요.</b>`;
  };
  await panel(`<div class="eyebrow">테스트 결과 · 시도 ${S1.attempts}회째</div><div class="ph">${score} / 6 맞힘</div>
    <div class="tbl-wrap"><table class="res"><thead><tr><th>테스트 과일</th><th>하비의 판단</th><th>결과</th><th>왜 그렇게 판단했을까?</th></tr></thead><tbody>
    ${results.map(r => `<tr><td><span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:${TYPES[r.type].css};margin-right:6px"></span>${TYPES[r.type].n}</td><td>${LAB(r.pred)}</td><td>${r.ok ? '<span class="okc">맞음</span>' : '<span class="warn">틀림</span>'}</td><td style="font-size:13px;line-height:1.55">${reason(r)}</td></tr>`).join('')}
    </tbody></table></div>`, [[score === 6 ? '계속' : '데이터 보강하러 가기', 'pri']], true);
  W.testGroup.children.slice().forEach(c => W.testGroup.remove(c));
  if (score === 6) return stageClear(results);
  // failure → coach
  G.lock++;
  const wrongs = results.filter(r => !r.ok);
  const labelErr = wrongs.some(r => r.nn && r.nn.type === r.type);
  await talk('havi', `분류 정확도 ${Math.round(score / 6 * 100)}%. 아직 틀린 판단이 있습니다.`);
  if (labelErr) await talk('bit', '어떤 샘플은 라벨이 잘못 붙어 있나 봐요. 데이터셋에서 「라벨 바꾸기」로 고칠 수 있어요.');
  if (wrongs.some(r => r.nn && r.nn.type !== r.type)) await talk('bit', `하비가 한 번도 못 본 종류가 있었어요. ${wrongs.filter(r => r.nn && r.nn.type !== r.type).map(r => TYPES[r.type].n).join(', ')} 같은 데이터를 더 찾아봐요!`);
  await talk('bit', '틀린 이유를 알면 어떤 데이터가 필요한지 알 수 있어요. AI를 만드는 사람들도 이렇게 계속 고쳐 나가요.');
  W.haviToss = true; W.bitFollow = true; G.lock--;
  setObj(obj1());
}

async function stageClear(results) {
  const W = world; G.lock++;
  W.havi.eyeMat.color.setHex(0x8bd67f); Snd.play('win');
  await lines([['havi', '분류 정확도 100%. 초록 사과: 사과. 노란 사과: 사과. 토마토와 레몬, 라임: 사과 아님.'], ['havi', '폐기통의 사과들을 다시 시장으로 보내겠습니다. 고맙습니다, {name}님.']]);
  W.binPile.forEach((f, i) => { const from = f.position.clone(), to = new THREE.Vector3(2.4 + (Math.random() - .5) * .8, .15, -6.6 + (Math.random() - .5) * .5); setTimeout(() => tween(700, k => f.position.set(lerp(from.x, to.x, k), lerp(from.y, to.y, k) + Math.sin(k * Math.PI) * 1.2, lerp(from.z, to.z, k)), t => t), i * 120); });
  await sleep(1400);
  await talk('bit', '해냈어요! 하비는 그대로인데, 데이터만 바꿨더니 판단이 완전히 달라졌어요.');
  const opts = ['하비는 고장 난 로봇이니까 새 로봇으로 바꾼다', '데이터를 모을 때 여러 경우가 골고루 들어갔는지 사람이 확인한다', 'AI는 똑똑하니까 스스로 고칠 때까지 그냥 둔다'];
  for (; ;) {
    const k = await choose('bit', '{name}님, 하비가 초록 사과를 버리는 일이 다시 생기지 않으려면 무엇이 가장 중요할까요?', opts);
    if (S1.choice === null) S1.choice = k;
    if (k === 1) { Snd.play('ok'); await lines([['bit', '맞아요! AI를 만드는 사람은 데이터가 한쪽으로 치우치지 않았는지, 라벨이 맞는지 꼭 확인해야 해요.'], ['bit', 'AI를 쓰는 우리도 AI가 이상한 판단을 하면 「왜 그럴까? 무엇을 보고 배웠을까?」 하고 물을 수 있어야 하고요.']]); break; }
    if (k === 0) await talk('bit', '새 로봇도 같은 데이터로 배우면 똑같이 초록 사과를 버릴 거예요. 문제는 로봇이 아니라 데이터였잖아요.');
    if (k === 2) await talk('bit', '하비는 「내 데이터에 초록 사과가 없네」 하고 스스로 알아차리지 못했어요. 누군가 확인해 줘야 해요.');
  }
  await panel(`<div class="eyebrow">이야기 밖, 진짜 세상</div><div class="ph">데이터리움은 지어낸 도시예요</div>
    <p class="pp">코어, 비트, 하비는 모두 이 게임 속 이야기예요. 하지만 「데이터가 치우치면 AI의 판단도 치우친다」는 건 실제로 일어나는 일이에요.</p>
    <div class="card real"><b>얼굴 인식</b><p class="pp">2018년 미국 MIT 미디어랩의 연구(Gender Shades)에서, 여러 회사의 얼굴 분석 AI가 피부색이 밝은 남성보다 피부색이 어두운 여성의 성별을 훨씬 자주 틀린다는 결과가 나왔어요. 학습 데이터에 어떤 사람들의 사진이 적게 들어갔는지와 관련이 있다고 설명되었어요.</p></div>
    <div class="card real"><b>음성 인식</b><p class="pp">말소리를 글자로 바꾸는 AI도 학습 데이터에 적게 들어간 사투리, 억양, 어린이 목소리를 더 자주 잘못 알아듣곤 해요.</p></div>
    <div class="card"><div class="eyebrow">생각해 보기</div><p class="pp">우리 주변 AI 가운데 「데이터가 부족해서」 누군가를 잘 못 알아볼 수 있는 것은 무엇일까요? 그런 일이 생기면 누가, 어떻게 고쳐야 할까요?</p></div>`, [['기록 보기', 'pri']], true);
  const n = S1.samples.length, a = S1.samples.filter(s => s.label === 'apple').length, cols = new Set(S1.samples.map(s => TYPES[s.type].color)).size;
  const date = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
  Save.set({ cleared1: true });
  const k = await panel(`<div class="cert"><div class="eyebrow">데이터리움 탐사 기록 · STAGE 1</div><div class="nm">${esc(G.name)}</div>
    <dl class="kv"><dt>모은 샘플</dt><dd>${n}개 (사과 ${a} · 사과 아님 ${n - a})</dd><dt>색의 다양성</dt><dd>${cols}가지 색</dd><dt>학습 시도</dt><dd>${S1.attempts}회</dd><dt>최종 테스트</dt><dd>6 / 6</dd><dt>첫 선택</dt><dd>${opts[S1.choice]}</dd><dt>날짜</dt><dd>${date}</dd></dl>
    <p class="pp" style="margin-top:12px">하비의 학습 데이터를 다시 만들어, 버려질 뻔한 초록·노란 사과를 되찾았습니다.</p></div>`, [['계속', 'pri']]);
  await talk('bit', '그런데 {name}님... 과수원 너머 시장에서 이상한 소문이 들려요. 누군가 데이터에 일부러 가짜 라벨을 붙이고 있대요.');
  G.lock--;
  await banner('NEXT', '가짜 라벨 시장', 'STAGE 2 · 준비 중인 이야기예요');
  G.lock++;
  const e = await panel(`<div class="eyebrow">STAGE 1 완료</div><div class="ph">수고했어요, ${esc(G.name)}님</div><p class="pp">과수원을 더 둘러보거나 처음 화면으로 돌아갈 수 있어요.</p>`, [['처음 화면으로', ''], ['과수원 더 둘러보기', 'pri']]);
  G.lock--;
  if (e === 0) bootTitle(); else { W.bitFollow = true; setObj('자유 탐험 · STAGE 2는 준비 중이에요'); }
}

/* ---------- boot ---------- */
bootTitle();
loop();

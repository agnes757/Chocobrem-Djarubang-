/* HERO CHOCOBREM — logika maskot Djarubang & remahan (kode asli, tanpa perubahan). Butuh js/hero-assets.js dimuat lebih dulu. */
(() => {
'use strict';

/* ---------- 1. KONFIGURASI (mudah disetel) ---------- */
const U = 1024;                 // ukuran gambar asli (px)
const SCENE_SEC = 4.3;          // durasi tiap adegan / kalimat
const JUMP_SEC = 1.15;          // durasi satu lompatan
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const AMP = REDUCED ? 0.35 : 1; // kecilkan gerak jika pengguna minta

const CFG = {
  // posisi mata & pupil pada gambar asli (koordinat 1024x1024)
  eyes: [{x:420,y:435,px:425,py:434},{x:602,y:432,px:597,py:430}],
  lid: {rx:62, ry:74},
  // mulut tertawa (overlay di dalam senyum asli)
  mouth: {top:556, d:'M404 556Q512 570 626 554Q618 634 512 638Q412 636 404 556Z', tx:512, ty:626},
  headPivot: [512, 672], feetY: 985, neckToFeet: 325, handToFeet: 245,
  // urutan adegan: teks + ekspresi + gerakan
  scenes: [
    {t:'Hai! Sudah pernah coba Chocobrem belum?',            e:'smile'},
    {t:'Brem berbalut cokelat yang bikin penasaran!',         e:'sparkle', tilt:3},
    {t:'Ada sensasi dingin, creamy, dan lembut di setiap gigitan!', e:'laugh', jump:{H:38,n:3}},
    {t:'Sekali gigit, langsung jatuh cinta!',                 e:'heart',   tilt:5},
    {t:'Yuk, cobain Chocobrem sekarang juga!',                e:'laugh',   jump:{H:72,n:3}},
    {t:'Jangan cuma lihat, rasakan sendiri nikmatnya!',       e:'sparkle'}
  ]
};
const EXPR = {
  smile:  {mouth:0, happy:0, heart:0, spark:0,   blush:0},
  sparkle:{mouth:0, happy:0, heart:0, spark:1,   blush:.35},
  laugh:  {mouth:1, happy:1, heart:0, spark:0,   blush:.6},
  heart:  {mouth:0, happy:0, heart:1, spark:0,   blush:1}
};

/* ---------- 2. RAKIT LAYER (rigging) ---------- */
const A = window.CB_ASSETS;
const root = document.getElementById('chocobrem-mascot');
const stage = root.querySelector('.cb-stage');
const fx = root.querySelector('.cb-fx');
const shadow = root.querySelector('.cb-shadow');
const bubble = root.querySelector('.cb-bubble');
const bubbleText = bubble.querySelector('.cb-text');
const L = {}, HX = {};

['body','sl','sr','head','hl','hr'].forEach(k => {
  const d = A.layers[k], [l,t,w,h] = d.box;
  const el = document.createElement('div');
  el.className = 'cb-layer';
  el.innerHTML = `<img alt="" draggable="false" src="${d.src}" style="left:${l/U*100}%;top:${t/U*100}%;width:${w/U*100}%;height:${h/U*100}%">`;
  const pv = k==='body' ? [512,CFG.feetY] : k==='head' ? CFG.headPivot
           : (k==='hl'||k==='hr') ? A.pivots[k] : [l+w/2, t+8];
  el.style.transformOrigin = `${pv[0]/U*100}% ${pv[1]/U*100}%`;
  HX[k] = l + w/2;
  stage.insertBefore(el, fx);
  L[k] = el;
});

/* ---------- 3. OVERLAY EKSPRESI (di atas kepala) ---------- */
const skin = A.skin, M = CFG.mouth, LID = CFG.lid;
const HEART = 'M0 34C-52-4-40-44-16-44C-6-44 0-36 0-30C0-36 6-44 16-44C40-44 52-4 0 34Z';
const STAR = 'M0-14Q2-2 14 0Q2 2 0 14Q-2 2-14 0Q-2-2 0-14Z';
const eyeSVG = (e,i) => `
  <g class="heart" opacity="0"><g transform="translate(${e.x} ${e.y})">
    <ellipse rx="45" ry="57" fill="#fff"/>
    <g class="hp"><path d="${HEART}" fill="#e5383b"/>
    <ellipse cx="-18" cy="-24" rx="9" ry="5" fill="#fff" opacity=".8" transform="rotate(-35 -18 -24)"/></g></g></g>
  <g class="spark" opacity="0">
    <circle cx="${e.px-11}" cy="${e.py-17}" r="11" fill="#fff"/><circle cx="${e.px+9}" cy="${e.py+17}" r="5" fill="#fff"/>
    <path class="star" d="${STAR}" fill="#fff"/></g>
  <ellipse class="lid" cx="${e.x}" cy="${e.y}" rx="${LID.rx}" ry="${LID.ry}" fill="url(#cbSk)" opacity="0"/>
  <path class="arch" d="M${e.x-46} ${e.y+12}Q${e.x} ${e.y-18} ${e.x+46} ${e.y+12}" stroke="#1c1210" stroke-width="7"
        stroke-linecap="round" fill="none" opacity="0"/>`;

L.head.insertAdjacentHTML('beforeend', `
<svg viewBox="0 0 ${U} ${U}" style="position:absolute;inset:0;width:100%;height:100%;overflow:visible">
  <defs>
    <radialGradient id="cbSk"><stop offset=".84" stop-color="${skin}"/><stop offset="1" stop-color="${skin}" stop-opacity="0"/></radialGradient>
    <clipPath id="cbMc"><path d="${M.d}"/></clipPath>
  </defs>
  <g class="blush" opacity="0"><ellipse cx="335" cy="574" rx="40" ry="22" fill="#ff5d73" opacity=".4"/>
    <ellipse cx="700" cy="572" rx="40" ry="22" fill="#ff5d73" opacity=".4"/></g>
  <g class="mouth" style="display:none"><g clip-path="url(#cbMc)"><path d="${M.d}" fill="#4a1410"/>
    <ellipse cx="${M.tx}" cy="${M.ty}" rx="58" ry="26" fill="#e8626f"/></g></g>
  ${CFG.eyes.map((e,i)=>`<g class="eye">${eyeSVG(e,i)}</g>`).join('')}
</svg>`);
const q = s => L.head.querySelector(s), qa = s => [...L.head.querySelectorAll(s)];
const eyes = qa('.eye').map((g,i) => ({
  heart:g.querySelector('.heart'), hp:g.querySelector('.hp'), spark:g.querySelector('.spark'),
  star:g.querySelector('.star'), lid:g.querySelector('.lid'), arch:g.querySelector('.arch'), c:CFG.eyes[i]
}));
const mouthG = q('.mouth'), blushG = q('.blush');

/* ---------- 4. UTILITAS GERAK ---------- */
const clamp = (v,a=0,b=1) => Math.min(b,Math.max(a,v));
const ease = p => p*p*(3-2*p);
let s = 1;                                  // skala stage terhadap 1024
const resize = () => { s = stage.clientWidth / U; };
addEventListener('resize', resize); resize();
const tf = (el,x,y,r,sx=1,sy=1) =>
  el.style.transform = `translate(${x*s}px,${y*s}px) rotate(${r}deg) scale(${sx},${sy})`;

function jumpPose(u,H){                     // antisipasi -> lompat -> mendarat
  let y=0, sq=0;
  if (u<.2){ sq=.85*ease(u/.2); }
  else if (u<.72){ const p=(u-.2)/.52; y=-H*4*p*(1-p);
    sq=.85*(1-ease(Math.min(1,p/.25))) - .4*Math.sin(Math.PI*p); }
  else { const p=(u-.72)/.28; sq=.9*Math.sin(Math.PI*Math.pow(p,.6)); }
  return {y,sq};
}

/* ---------- 5. SPEECH BUBBLE ---------- */
function setBubble(i, first){
  const put = () => { bubbleText.innerHTML = CFG.scenes[i].t.replace(/Chocobrem/g,'<b>Chocobrem</b>'); bubble.classList.remove('cb-swap'); };
  if (first) return put();
  bubble.classList.add('cb-swap'); setTimeout(put, 280);
}

/* ---------- 6. LOOP ANIMASI ---------- */
const ex = {mouth:0, happy:0, heart:0, spark:0, blush:0};
let T=0, last=performance.now(), sceneIdx=-1, nextBlink=1.5, blinkAt=-9, nextHeart=0, poke=-9;

function update(dt){
  const idx = Math.floor(T/SCENE_SEC) % CFG.scenes.length, lt = T % SCENE_SEC;
  const sc = CFG.scenes[idx];
  if (idx !== sceneIdx){ setBubble(idx, sceneIdx<0); sceneIdx = idx; }

  // --- ekspresi (halus dengan easing eksponensial) ---
  const poking = T-poke < JUMP_SEC;
  const tg = EXPR[poking ? 'laugh' : sc.e], k = 1-Math.exp(-dt*8);
  for (const n in ex) ex[n] += (tg[n]-ex[n])*k;

  // --- kedip natural ---
  if (T>nextBlink){ blinkAt=T; nextBlink=T+2.2+Math.random()*3; }
  const bp=(T-blinkAt)/.16, blink = bp<1 ? Math.sin(Math.PI*bp) : 0;
  const lid = Math.max(blink, ex.happy) * (1-ex.heart);
  const archOp = clamp((lid-.8)/.2);
  const pulse = 1+.09*Math.sin(T*9);
  eyes.forEach((e,i) => {
    const top = e.c.y - LID.ry;
    e.lid.setAttribute('opacity', lid>.02 ? 1 : 0);
    e.lid.setAttribute('transform', `translate(0 ${top}) scale(1 ${Math.max(lid,.001)}) translate(0 ${-top})`);
    e.arch.setAttribute('opacity', archOp);
    e.heart.setAttribute('opacity', ex.heart);
    e.hp.setAttribute('transform', `scale(${pulse})`);
    e.spark.setAttribute('opacity', ex.spark*(1-ex.heart));
    const tw = .75+.25*Math.sin(T*5+i*1.7);
    e.star.setAttribute('transform', `translate(${e.c.px+14} ${e.c.py-6}) rotate(${Math.sin(T*3+i)*18}) scale(${tw})`);
  });
  blushG.setAttribute('opacity', ex.blush);
  const m = ex.mouth * (.82+.18*Math.sin(T*13));
  mouthG.style.display = m>.03 ? '' : 'none';
  mouthG.setAttribute('transform', `translate(0 ${M.top}) scale(1 ${m}) translate(0 ${-M.top})`);

  // --- lompat (adegan atau klik) ---
  let y=0, sq=0, H=1;
  if (poking){ H=60; ({y,sq}=jumpPose((T-poke)/JUMP_SEC, H)); }
  else if (sc.jump && lt < sc.jump.n*JUMP_SEC){ H=sc.jump.H; ({y,sq}=jumpPose((lt%JUMP_SEC)/JUMP_SEC, H)); }
  y *= AMP; sq *= AMP;
  const air = clamp(-y/(H*AMP));

  // --- badan: napas + goyang ringan ---
  const sway = (idx===3?1.6:.8)*Math.sin(T*1.5)*AMP, rad = sway*Math.PI/180;
  const sy = 1-.08*sq + .007*Math.sin(T*2.4), sx = 1+.05*sq;
  tf(L.body, 0, y, sway, sx, sy);

  // --- kepala + blangkon (termasuk ujung blangkon yang menjuntai) = SATU layer utuh ---
  // Ujung menjuntai kini ada di layer kepala, jadi bergerak/berputar bersama blangkon.
  const shake = ex.mouth*Math.sin(T*13);
  const hRot = sway + (2.2+(sc.tilt||0))*Math.sin(T*1.3+.6)*AMP + air*3 + shake*1.2*AMP;
  tf(L.head, CFG.neckToFeet*Math.sin(rad), y + CFG.neckToFeet*(1-sy) + 6*sq + shake*3*AMP, hRot);

  // --- tangan: pose peace (V) asli, TIDAK bergerak sendiri ---
  // Hanya ikut menempel pada badan (translasi saja, tanpa rotasi/skala/lambaian)
  // supaya tetap utuh dan tidak terlepas saat badan melompat atau bernapas.
  const hy = y + CFG.handToFeet*(1-sy) + 4*sq, hxs = CFG.handToFeet*Math.sin(rad);
  tf(L.hr, (sx-1)*(HX.hr-512)+hxs, hy, 0);
  tf(L.hl, (sx-1)*(HX.hl-512)+hxs, hy, 0);

  // --- kaki ---
  tf(L.sl, 0, y-10*air*AMP, -6*air);
  tf(L.sr, 0, y-10*air*AMP,  6*air);
  shadow.style.transform = `scaleX(${1-.3*air})`; shadow.style.opacity = 1-.4*air;

  // --- hati melayang saat mata hati ---
  if (ex.heart>.6 && T>nextHeart && !REDUCED){
    nextHeart = T+.5;
    const h = document.createElement('span');
    h.className='cb-heart'; h.textContent='\u2764';
    h.style.left = (28+Math.random()*44)+'%'; h.style.top = '16%';
    h.style.setProperty('--dx', (Math.random()*60-30)+'%');
    h.addEventListener('animationend', () => h.remove());
    fx.appendChild(h);
  }
}

function frame(now){
  const dt = Math.min(.05,(now-last)/1000); last = now; T += dt;
  update(dt); requestAnimationFrame(frame);
}
// suara maskot: diputar saat maskot diklik/di-tap (bersamaan dengan lompat)
const suara = new Audio('assets/djarubang-suara.mp3'); suara.preload = 'auto';
stage.addEventListener('pointerdown', () => {
  if (T-poke > JUMP_SEC) {
    poke = T;  // klik/tap = lompat
    try { suara.currentTime = 0; const pr = suara.play(); if (pr && pr.catch) pr.catch(() => {}); } catch (e) {}
  }
});
requestAnimationFrame(t => { last = t; frame(t); });
})();

(function(){
 var box=document.getElementById('crumbs'); if(!box) return;
 var P=['polygon(50% 0,92% 30%,100% 72%,60% 100%,8% 84%,0 36%)','polygon(18% 0,84% 8%,100% 58%,70% 100%,6% 78%)','polygon(30% 4%,96% 22%,86% 90%,34% 100%,0 55%)','polygon(48% 0,100% 40%,78% 100%,22% 92%,0 38%)'];
 var CH=['#3A211B','#572B20','#4A2B20'];
 function r(a,b){return a+Math.random()*(b-a)}
 for(var i=0;i<34;i++){
  var el=document.createElement('div'), brem=i%2===1, d=r(6,11);
  el.className='crumb'+(brem?' brem':'');
  var st=el.style;
  st.setProperty('--x',r(2,96).toFixed(1)+'%');
  st.setProperty('--s',r(9,22).toFixed(0)+'px');
  st.setProperty('--d',d.toFixed(1)+'s');
  st.setProperty('--dl',(-r(0,d)).toFixed(1)+'s');
  st.setProperty('--h',r(260,620).toFixed(0)+'px');
  st.setProperty('--dx',r(-60,60).toFixed(0)+'px');
  st.setProperty('--r',r(-300,300).toFixed(0)+'deg');
  st.setProperty('--p',P[i%P.length]);
  st.setProperty('--c',CH[i%CH.length]);
  var inner=document.createElement('i'); el.appendChild(inner); box.appendChild(el);
 }
})();

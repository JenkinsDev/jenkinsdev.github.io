(function () {
  'use strict';
  const colors = ['#ff3d3d', '#2c7bff'];
  const INK = '#120f1f', MUD = '#6b3f1f', MUD2 = '#9a6234', MUD3 = '#c4894a', RIM = '#ff8c42';
  const SKIN0 = ['#e2a06a', '#c47a4a'], FLUSH = '#ff6b6b', WHITE = '#fff6de';
  const WIN_NEAR = 0.77;
  const prev = [{}, {}], lastPaint = { t: 0 };
  function paint(g, view, state, extras = {}) {
    const portrait = !!(view && view.portrait);
    const still = !!(view && view.still);
    const reduced = still || !!extras.reduced;
    const time = (view && view.time != null) ? view.time : (state && state.time) || 0;
    const shake = (!reduced && extras.shake) ? extras.shake : 0;
    g.save();
    const cw = g.canvas.width, ch = g.canvas.height;
    const scale = Math.min(cw / 240, ch / 180) || 1;
    if (g.setTransform) g.setTransform(1, 0, 0, 1, 0, 0);
    g.fillStyle = '#0d1226';
    g.fillRect(0, 0, cw, ch);
    g.translate((cw - 240 * scale) / 2, (ch - 180 * scale) / 2);
    g.scale(scale, scale);
    if (shake) g.translate((Math.floor(time * (shake > 1.5 ? 18 : 14)) % 2 ? 1 : -1) * Math.min(shake > 1.5 ? 3 : 1, shake), 0);
    g.imageSmoothingEnabled = false;
    const r = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), Math.max(1, w), Math.max(1, h)); };
    const o = (x, y, w, h, c) => { r(x - 1, y - 1, w + 2, h + 2, INK); r(x, y, w, h, c); };
    sky(r);
    ground(r);
    crowd(r, extras, time);
    mudPit(r, portrait);
    meter(r, state.x);
    const rope = ropeGeom(portrait);
    posts(r, o, portrait, Math.abs(state.x) >= WIN_NEAR, time, still);
    drawRope(r, rope, state, extras, time, reduced);
    const fp = flagAt(state.x, rope);
    const matchWin = extras.matchOver && (extras.matchWinner === 0 || extras.matchWinner === 1);
    flag(r, matchWin ? 120 : fp.x, matchWin ? 36 : fp.y, portrait, time, still, matchWin);
    if (state.powerup && state.powerup.claimed === null && !extras.claim) {
      icon(r, fp.x + (portrait ? 14 : 2), fp.y - (portrait ? 2 : 20), state.powerup.kind);
    }
    if (extras.claim) icon(r, extras.claim.x, extras.claim.y, extras.claim.kind);
    fighter(g, r, o, 0, portrait, state, extras, time, reduced);
    fighter(g, r, o, 1, portrait, state, extras, time, reduced);
    const splash = extras.sploosh;
    if (splash) {
      if (!reduced) splashFX(r, g, splash, portrait, extras);
      else { word(g, 120, 48, 'SPLOOSH!', 1, 0); }
      if (actOf(splash.age) >= 3) mudRipples(r, splash, portrait);
    }
    if (!reduced && extras.particles) extras.particles.forEach((p) => { if (p.life > 0) r(p.x, p.y, p.size || 2, p.size || 2, p.color || MUD2); });
    if (!reduced && extras.dust) extras.dust.forEach((d) => puff(r, d));
    if (!reduced && extras.secondWind) secondWindFX(r, g, extras.secondWind, time);
    if (!reduced && extras.confetti) extras.confetti.forEach((c) => r(c.x, c.y, 2, 2, c.c));
    if (!reduced && extras.flash) { g.fillStyle = 'rgba(255,246,222,' + (extras.flash * 0.3) + ')'; g.fillRect(0, 0, 240, 180); }
    lastPaint.t = time;
    g.restore();
  }
  function actOf(age) {
    const f = (age || 0) * 60;
    return f < 24 ? 1 : f < 42 ? 2 : f < 70 ? 3 : f < 110 ? 4 : 5;
  }
  function falling(splash, side) {
    if (!splash) return false;
    return splash.player === 'both' || splash.player === side;
  }
  function effortOf(state, side, time) {
    const taps = (state.taps && state.taps[side]) || [];
    let n = 0;
    for (let i = 0; i < taps.length; i++) if (time - taps[i] < 0.6 && time - taps[i] >= 0) n++;
    return Math.min(1, n / 4.8);
  }
  function easeInQuad(t) { return t * t; }
  function easeOutBack(t) { const p = t - 1; return 1 + 2.70158 * p * p * p + 1.70158 * p * p; }
  function mix(a, b, t) { return a + (b - a) * t; }
  function lerpHex(a, b, t) {
    const p = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
    const A = p(a), B = p(b);
    return '#' + [0, 1, 2].map((i) => Math.round(mix(A[i], B[i], t)).toString(16).padStart(2, '0')).join('');
  }
  function sky(r) {
    r(0, 0, 240, 102, '#14081e');
    r(0, 14, 240, 14, '#1c0a28'); r(0, 28, 240, 14, '#3a1238'); r(0, 42, 240, 14, '#6a1a38');
    r(0, 56, 240, 14, '#b8342c'); r(0, 70, 240, 14, '#f05030'); r(0, 84, 240, 12, '#ff8c42'); r(0, 96, 240, 6, '#ffc14a');
    r(0, 100, 240, 3, '#ffe08a');
    [18, 34, 52, 76, 98, 124, 148, 176, 204, 226].forEach((x, i) => r(x, 5 + (i % 5) * 2, i % 3 ? 1 : 2, 1, i % 2 ? WHITE : '#ffd23f'));
    r(168, 26, 30, 30, '#c45232'); r(172, 30, 22, 22, '#ff8c42'); r(176, 34, 14, 14, '#ffd23f'); r(180, 38, 8, 8, WHITE);
    r(164, 48, 38, 3, '#ffb08a'); r(170, 52, 26, 2, '#ffc4a0');
    r(20, 34, 28, 8, '#ffb08a'); r(32, 28, 22, 8, '#ffc4a0'); r(44, 36, 18, 6, '#ffe0c0');
    r(108, 30, 20, 6, '#ffb08a'); r(118, 26, 16, 6, '#ffc4a0');
  }
  function crowd(r, extras, time) {
    const wave = extras.sploosh && actOf(extras.sploosh.age) >= 4 && !extras.reduced;
    r(0, 102, 240, 10, '#1a1410'); r(0, 102, 240, 2, '#4a3828');
    const dots = ['#6a4058', '#3a3048', '#7a5840', '#2a3858', '#504058', '#8a6040', '#c45a5a', '#4a6aaa'];
    for (let i = 0; i < 36; i++) {
      const bob = wave ? Math.round(Math.sin(time * 10 + i)) : 0;
      r(4 + i * 6 + (i % 2), 104 + bob, 2, 2, dots[i % dots.length]);
      r(7 + i * 6, 108, 2, 2, dots[(i + 3) % dots.length]);
    }
  }
  function ground(r) {
    r(0, 102, 240, 78, '#2a2218'); r(0, 111, 240, 69, '#2a2218');
    for (let x = 0; x < 240; x += 10) r(x, 112, 10, 68, (x / 10) % 2 ? '#32281e' : '#241c14');
    r(50, 114, 140, 6, '#3e3428');
  }
  function mudPit(r, portrait) {
    if (portrait) {
      r(98, 76, 44, 34, '#3a2010'); r(102, 80, 36, 26, MUD); r(106, 84, 28, 18, MUD2);
      r(112, 88, 6, 4, MUD3); r(124, 92, 5, 3, '#d4a05a'); r(116, 96, 4, 3, WHITE);
    } else {
      r(76, 140, 88, 28, '#3a2010'); r(82, 144, 76, 22, MUD); r(88, 148, 64, 14, MUD2);
      r(100, 152, 8, 5, MUD3); r(128, 154, 6, 4, '#d4a05a'); r(114, 156, 5, 4, WHITE); r(92, 150, 4, 3, '#c4894a');
    }
  }
  function mudRipples(r, splash, portrait) {
    const f = splash.age * 60;
    if (f < 90) return;
    const t = Math.min(1, (f - 90) / 20);
    const cx = 120, cy = portrait ? 96 : 152;
    [10, 16, 22].forEach((rad, i) => {
      const s = Math.round(rad * t);
      r(cx - s, cy - 2 - i, s * 2, 2, i % 2 ? MUD2 : MUD);
    });
  }
  function meter(r, x) {
    r(34, 15, 172, 12, INK); r(36, 17, 168, 8, '#0c0a12');
    r(36, 17, 84, 8, '#8a2424'); r(120, 17, 84, 8, '#1a3a9a');
    r(118, 16, 4, 10, WHITE);
    const mx = 36 + Math.round((x + 1) / 2 * 168);
    r(mx - 4, 14, 8, 14, INK); r(mx - 3, 15, 6, 12, WHITE); r(mx - 2, 16, 4, 10, '#ffd23f');
  }
  function ropeGeom(portrait) {
    return portrait ? { x1: 120, y1: 154, x2: 120, y2: 36, vertical: true }
      : { x1: 17, y1: 134, x2: 225, y2: 134, vertical: false };
  }
  function flagAt(x, rope) {
    const t = (x + 1) / 2;
    return { x: rope.x1 + (rope.x2 - rope.x1) * t, y: rope.y1 + (rope.y2 - rope.y1) * t };
  }
  function ropeFeel(state, extras, time, reduced) {
    const splash = extras.sploosh;
    const slack = splash ? actOf(splash.age) === 1 : extras.slack;
    const e0 = effortOf(state, 0, time), e1 = effortOf(state, 1, time);
    const weak = e0 === e1 ? 0 : (e0 < e1 ? -1 : 1);
    const sagN = splash && actOf(splash.age) === 1 ? 10 : (slack ? 6 : 0);
    const sideSag = (!splash && Math.abs(e0 - e1) > 0.22) ? weak * 7 : 0;
    const vib = (!reduced && extras.vibrate) ? Math.round(Math.sin(time * 40)) : 0;
    return { sagN, sideSag, vib };
  }
  function ropeSample(u, portrait, feel) {
    const rope = ropeGeom(portrait);
    const dx = rope.x2 - rope.x1, dy = rope.y2 - rope.y1;
    const wave = Math.sin(u * Math.PI) * (feel.sagN + feel.sideSag * (u < 0.5 ? 1 - u * 2 : 0));
    return {
      x: rope.x1 + dx * u + (rope.vertical ? feel.vib : 0),
      y: rope.y1 + dy * u + (rope.vertical ? 0 : wave + feel.vib)
    };
  }
  function drawRope(r, rope, state, extras, time, reduced) {
    const feel = ropeFeel(state, extras, time, reduced);
    const dx = rope.x2 - rope.x1, dy = rope.y2 - rope.y1, len = Math.hypot(dx, dy) || 1;
    const scroll = Math.round(((state.x + 1) * 20) % 6);
    for (let d = 0; d < len; d += 2) {
      const u = d / len, p = ropeSample(u, rope.vertical, feel);
      const stripe = Math.floor((d + scroll) / 3) % 2;
      const a = stripe ? '#c9a66b' : '#6a3e1c', b = stripe ? '#6a3e1c' : '#c9a66b';
      if (rope.vertical) { r(p.x - 4, p.y, 8, 2, INK); r(p.x - 3, p.y, 3, 2, a); r(p.x, p.y, 3, 2, b); }
      else { r(p.x, p.y - 4, 2, 8, INK); r(p.x, p.y - 3, 2, 3, a); r(p.x, p.y, 2, 3, b); }
    }
    hitch(r, rope, true); hitch(r, rope, false);
    if (!reduced && extras.vibrate) {
      const mid = ropeSample(0.5, rope.vertical, feel);
      r(mid.x - 2, mid.y - 5, 4, 2, WHITE);
    }
    if (!reduced && Math.abs(state.x) > 0.85) {
      r(118, rope.vertical ? 96 : 114, 1, 3, '#e2c07a'); r(122, rope.vertical ? 100 : 120, 1, 2, '#8a5a2c');
    }
  }
  function hitch(r, rope, start) {
    const u = start ? 0 : 1;
    const p = { x: start ? rope.x1 : rope.x2, y: start ? rope.y1 : rope.y2 };
    if (rope.vertical) {
      r(p.x - 7, p.y - 5, 14, 10, INK); r(p.x - 6, p.y - 4, 12, 8, '#8a5a2c'); r(p.x - 4, p.y - 2, 8, 4, '#e2c07a');
    } else {
      r(p.x - 6, p.y - 7, 12, 14, INK); r(p.x - 5, p.y - 6, 10, 12, '#8a5a2c'); r(p.x - 3, p.y - 4, 6, 8, '#e2c07a');
    }
    void u;
  }
  function posts(r, o, portrait, flash, time, still) {
    const lit = flash && !still && Math.floor(time * 8) % 2 === 0;
    const light = lit ? WHITE : '#ffd23f';
    function post(x, y, red) {
      const a = red ? '#c42e2e' : '#2c5ccc', b = red ? '#5a1818' : '#122444';
      r(x - 2, y + 34, 22, 8, MUD);
      o(x + 2, y, 14, 36, '#7a4a28'); r(x + 5, y + 2, 4, 32, '#c4894a');
      for (let i = 0; i < 7; i++) r(x + 2, y + 4 + i * 5, 14, 2, i % 2 ? a : b);
      o(x + 3, y - 14, 12, 12, light); r(x + 6, y - 10, 6, 4, WHITE);
    }
    if (portrait) { post(113, 130, true); post(113, 16, false); }
    else { post(8, 110, true); post(216, 110, false); }
  }
  function flag(r, x, y, portrait, time, still, up) {
    const wave = still ? 0 : Math.floor(time * 6) % 3;
    const px = Math.round(x), py = Math.round(y - (up ? 8 : 0));
    r(px - 1, py - 2, 3, 5, '#6a4a28');
    r(px, py - (portrait ? 12 : 16), 2, portrait ? 16 : 18, '#c4a878');
    const fx = px + 2, fy = py - (portrait ? 12 : 16);
    r(fx, fy + wave, 16, 13, INK);
    r(fx, fy + 1 + wave, 15, 11, WHITE);
    r(fx + 6, fy + 3 + wave, 3, 7, '#ffd23f');
    r(fx + 2, fy + 5 + wave, 11, 3, '#ffd23f');
  }
  function icon(r, x, y, kind) {
    x = Math.round(x); y = Math.round(y);
    r(x - 13, y - 13, 28, 26, INK); r(x - 12, y - 12, 26, 24, '#fff6de'); r(x - 11, y - 11, 24, 22, '#1a1020');
    if (kind === 'banana') {
      r(x - 7, y - 5, 5, 12, '#ffd23f'); r(x - 5, y - 9, 10, 7, '#ffe56a'); r(x + 3, y - 7, 6, 6, '#c9a226'); r(x - 8, y - 7, 3, 3, '#6a5020');
    } else if (kind === 'sneakers') {
      r(x - 9, y - 3, 14, 7, '#2c7bff'); r(x - 9, y + 3, 16, 5, WHITE); r(x + 3, y - 2, 5, 6, '#7eb8ff');
    } else {
      r(x - 2, y - 11, 6, 18, '#ffd23f'); r(x - 9, y - 4, 18, 6, '#ffd23f'); r(x - 6, y - 7, 4, 4, WHITE);
    }
  }
  function fighter(g, r, o, side, portrait, state, extras, time, reduced) {
    const splash = extras.sploosh;
    const fall = falling(splash, side);
    const act = splash ? actOf(splash.age) : 0;
    const f = splash ? splash.age * 60 : 0;
    const a = side === 0 ? -state.x : state.x;
    const e = effortOf(state, side, time);
    const cpu = !!(extras.cpu && side === 1);
    const muddy = !!(extras.muddy && extras.muddy[side]);
    const yank = extras.yank && extras.yank[side];
    const jolt = extras.yank && extras.yank[1 - side] && !yank;
    const pose = buildPose(side, portrait, a, e, yank, jolt, muddy, fall, act, f, splash, state, extras, time, cpu, reduced);
    const sm = smoothPose(side, pose, time, reduced);
    if (reduced && fall) {
      drawSettledMud(r, o, sm, side, cpu, extras);
      return;
    }
    if (fall && act === 3) { kickLegs(r, o, sm, side, f, cpu); return; }
    g.save();
    g.translate(sm.fx, sm.fy);
    g.rotate(sm.tilt);
    g.scale(sm.sx, sm.sy);
    mascot(r, o, 0, 0, sm, side, cpu, extras);
    g.restore();
    if (shouldGrip(fall, act, splash, side)) gripRope(r, o, sm, side, portrait, cpu, state, extras, time, reduced);
    extrasFX(r, sm, side, a, e, extras, time, cpu, fall, act, portrait);
  }
  function shouldGrip(fall, act, splash, side) {
    if (fall) return act <= 2;
    if (splash && act >= 2) return false;
    return true;
  }
  function homes(portrait, side) {
    if (portrait) return { x: 106, y: side === 0 ? 168 : 72, edgeX: 112, edgeY: side === 0 ? 150 : 86, pitX: 118, pitY: side === 0 ? 110 : 90 };
    return { x: side === 0 ? 52 : 188, y: 152, edgeX: side === 0 ? 86 : 154, edgeY: 152, pitX: side === 0 ? 106 : 134, pitY: 160 };
  }

  function buildPose(side, portrait, a, e, yank, jolt, muddy, fall, act, f, splash, state, extras, time, cpu, reduced) {
    const pose = { fx: 0, fy: 0, tilt: 0, sx: 1, sy: 1, head: 0, reach: 8, plant: 0, face: 'ready', wave: 0, hideArms: 1 };
    const h = homes(portrait, side);
    const lose = Math.max(0, Math.min(1, -a / 0.85));
    const win = Math.max(0, Math.min(1, a / 0.7));
    const slide = lose * lose;
    pose.fx = mix(h.x, h.edgeX, slide);
    pose.fy = mix(h.y, h.edgeY, slide);
    const inward = side === 0 ? 1 : -1;
    if (lose > 0) pose.tilt = inward * -(0.06 + lose * 0.14);
    else pose.tilt = inward * -0.08;
    pose.head = (side === 0 ? -1 : 1) * (lose > 0.35 ? 2 : 0);
    pose.plant = lose > 0.2 ? 2 + Math.round(lose * 3) : 0;
    if (state.phase === 'countdown') {
      pose.sy = 0.9; pose.sx = 1 / pose.sy; pose.face = 'ready'; pose.tilt *= 0.4;
      const left = 0.8 - (state.time || 0);
      const beat = left > 0.53 ? 0.8 : left > 0.28 ? 0.53 : left > 0.08 ? 0.28 : 0.08;
      if ((beat - left) < 2 / 60) pose.sy = 0.86;
      if (left <= 0.08) { pose.sy = 1.12; pose.sx = 1 / pose.sy; }
    } else if (state.phase === 'pull' && (state.time || 0) < 0.8 + 4 / 60) {
      pose.sy = 1.12; pose.sx = 1 / pose.sy; pose.face = 'ready';
    } else {
      if (yank) { pose.fx += (side === 0 ? -2 : 2); pose.face = 'pull'; pose.sy = 1.12; pose.sx = 1 / pose.sy; }
      else if (a > 0.25) pose.face = 'smug';
      else if (a < -0.4) pose.face = 'lose';
      else if (e > 0.55) pose.face = 'effort';
      else pose.face = 'ready';
    }
    if (extras.secondWind && extras.secondWind.side === side) pose.face = 'glare';
    if (muddy && !fall) pose.face = 'sheep';
    if (splash && !fall) {
      if (act === 2) {
        const wf = Math.min(1, Math.max(0, f - 24) / 10);
        pose.fx += (side === 0 ? -1 : 1) * 6 * wf;
        if (f >= 34 && f < 38) { pose.sy = 0.75; pose.sx = 1 / 0.75; }
        pose.face = 'smug';
      }
      if (act >= 4) {
        pose.face = 'smug'; pose.wave = 1; pose.hideArms = 0;
        const bounce = Math.sin(Math.min(1, (f - 70) / 18) * Math.PI) * 0.07;
        pose.sy = 1 + bounce; pose.sx = 1 / pose.sy;
      }
      if (extras.matchOver && extras.matchWinner === side) { pose.wave = 1; pose.hideArms = 0; pose.face = 'smug'; }
    }
    if (fall && splash) applyFall(pose, side, portrait, act, f, splash, extras, reduced, h);
    return pose;
  }
  function smoothstep(a, b, x) {
    const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
    return t * t * (3 - 2 * t);
  }
  function applyFall(pose, side, portrait, act, f, splash, extras, reduced, h) {
    const sign = side === 0 ? 1 : -1;
    pose.exact = 1;
    if (reduced) {
      pose.fx = h.pitX; pose.fy = h.pitY; pose.face = 'sheep'; pose.sy = 1; pose.sx = 1; pose.tilt = 0.15 * sign;
      return;
    }
    if (act === 1) {
      const t = Math.min(1, f / 24);
      pose.fx = mix(h.edgeX, mix(h.edgeX, h.pitX, 0.4), t);
      pose.fy = mix(h.edgeY, mix(h.edgeY, h.pitY, 0.25), t);
      if (f < 10) { pose.face = 'coyote'; pose.tilt = 0.08 * sign; }
      else {
        const w = Math.floor((f - 10) / 4) % 3;
        pose.face = 'panic';
        pose.tilt = ((w === 0 ? 12 : w === 1 ? 4 : 9) * Math.PI / 180) * sign;
      }
    } else if (act === 2) {
      const t0 = 0.4;
      if (f < 27) {
        pose.fx = mix(h.edgeX, h.pitX, t0);
        pose.fy = mix(h.edgeY, h.pitY, 0.25) + 2;
        pose.sy = 0.85; pose.sx = 1 / 0.85; pose.face = 'panic';
        pose.tilt = 0.22 * sign;
      } else {
        const t = easeInQuad(Math.min(1, (f - 27) / 14));
        pose.fx = mix(mix(h.edgeX, h.pitX, t0), h.pitX, t);
        pose.fy = mix(mix(h.edgeY, h.pitY, 0.25), h.pitY, t);
        pose.tilt = mix(0.22, 0.85, t) * sign;
        pose.sy = mix(0.92, 1.15, t); pose.sx = 1 / pose.sy; pose.face = 'panic';
      }
    } else if (act === 3) {
      pose.fx = h.pitX; pose.fy = h.pitY; pose.face = 'hidden';
    } else {
      const u = Math.min(1, (f - 70) / 58);
      const rise = smoothstep(0, 0.38, u);
      const plant = smoothstep(0.3, 0.55, u);
      const walk = smoothstep(0.5, 1, u);
      pose.fx = mix(h.pitX, h.x, walk);
      pose.fy = mix(h.pitY - 14 * rise, h.y, walk);
      pose.tilt = mix(0.28 * sign, 0, plant);
      pose.sy = mix(0.9, 1, rise); pose.sx = 1 / pose.sy;
      pose.face = u < 0.22 ? 'mud' : (u > 0.22 && u < 0.38 && Math.floor(f / 6) % 2 ? 'blink' : 'sheep');
      pose.hideArms = 1;
    }
  }
  function winnerReact(pose, side, splash, extras) {
    /* used via extras on the non-falling side inside buildPose after */
  }
  function smoothPose(side, pose, time, reduced) {
    const p = prev[side];
    if (reduced || !p.ready || pose.exact || pose.face === 'hidden') {
      const c = Object.assign({ ready: 1 }, pose); prev[side] = c; return c;
    }
    const dt = Math.max(0.016, Math.min(0.05, time - lastPaint.t || 0.016));
    const k = 1 - Math.exp(-dt * 22);
    const out = Object.assign({}, pose);
    ['fx', 'fy', 'tilt', 'sx', 'sy', 'head', 'reach', 'plant'].forEach((key) => {
      out[key] = p[key] + (pose[key] - p[key]) * k;
    });
    out.face = pose.face;
    out.wave = pose.wave; out.hideArms = pose.hideArms;
    prev[side] = Object.assign({ ready: 1 }, out);
    return out;
  }
  function mascot(r, o, x, y, sm, side, cpu, extras) {
    const muddy = sm.face === 'mud' || sm.face === 'sheep' || sm.face === 'blink' || !!(extras.muddy && extras.muddy[side]);
    const losses = (extras.losses && extras.losses[side]) || (muddy ? 1 : 0);
    const flush = extras.hot && extras.hot[side] > 1 ? Math.min(1, (extras.hot[side] - 1) / 0.5) : 0;
    let skin = cpu ? '#c9d3e6' : SKIN0[side];
    if (!cpu && flush) skin = lerpHex(skin, FLUSH, flush);
    if (muddy && losses >= 2) skin = MUD;
    const shirt = muddy ? (side ? '#1a3a6a' : '#7a2424') : (cpu ? '#c9d3e6' : colors[side]);
    const shade = cpu ? '#9aa6b8' : (side ? '#1a58c8' : '#c42e2e');
    const shorts = cpu ? '#7a8494' : (side ? '#0f2a6e' : '#7a1220');
    const lace = cpu ? '#2c7bff' : colors[side];
    const hx = x + Math.round(sm.head) - 10, hy = y - 44;
    const bx = x + Math.round(sm.head * 0.7) - 9, by = y - 24;
    r(x - 12 - sm.plant, y + 2, 24, 3, INK);
    o(x - 11 - sm.plant, y - 2, 10, 7, muddy ? MUD : WHITE); o(x + 1 + sm.plant, y - 2, 10, 7, muddy ? MUD : WHITE);
    r(x - 9, y, 6, 2, lace); r(x + 3, y, 6, 2, lace);
    r(x - 7, y - 5, 5, 5, INK); r(x + 2, y - 5, 5, 5, INK);
    o(x - 8, y - 12, 16, 10, (muddy && losses >= 1) ? MUD : shorts);
    o(bx, by, 18, 14, shirt); r(bx, by + 2, 3, 10, shade);
    if (cpu) { r(bx + 5, by + 3, 8, 7, '#2c7bff'); r(bx + 8, by + 5, 3, 3, WHITE); }
    else r(bx + 16, by + 2, 1, 10, RIM);
    if (!sm.hideArms && sm.face !== 'wave' && sm.wave !== 1) {
      const inn = side === 0 ? 1 : -1;
      const ax = bx + (inn > 0 ? 16 : -2), ay = by + 4;
      o(ax, ay, inn * Math.max(6, sm.reach - 2), 4, cpu ? '#c9d3e6' : skin);
      o(ax, ay + 6, inn * Math.max(5, sm.reach - 3), 4, cpu ? '#c9d3e6' : skin);
      r(ax + inn * (sm.reach - 2), ay, 4, 4, cpu ? '#c9d3e6' : INK);
      r(ax + inn * (sm.reach - 4), ay + 6, 4, 4, cpu ? '#c9d3e6' : INK);
    }
    if (sm.wave) {
      o(hx + (side ? 18 : -8), hy - 6, 6, 10, skin);
      r(hx + (side ? 20 : -6), hy - 8, 4, 4, INK);
    }
    head(r, o, hx, hy, side, cpu, skin, sm.face, extras);
    if (extras.sploosh && extras.sploosh.critter && (sm.face === 'sheep' || sm.face === 'mud')) {
      r(hx + 6, hy - 10, 8, 6, '#3d8f4a'); r(hx + 8, hy - 12, 3, 3, WHITE);
    }
  }
  function head(r, o, hx, hy, side, cpu, skin, face, extras) {
    if (cpu) {
      r(hx + 1, hy - 1, 18, 22, INK); r(hx - 1, hy + 2, 22, 16, INK);
      r(hx + 2, hy, 16, 20, '#c9d3e6'); r(hx, hy + 3, 20, 14, '#c9d3e6');
      r(hx + 3, hy + 2, 4, 4, WHITE); r(hx + 18, hy + 4, 1, 12, RIM);
      const bent = face === 'mud' || face === 'sheep' || face === 'hidden';
      r(hx + 9 + (bent ? 3 : 0), hy - 8, 2, 7, '#ffd23f');
      r(hx + 7 + (bent ? 4 : 0), hy - 11, 6, 5, '#ffd23f');
      r(hx + 3, hy + 6, 14, 10, '#1a2438');
      robotEyes(r, hx, hy, face);
      if (face === 'fan') { r(hx - 4, hy + 8, 4, 1, '#7eb8ff'); r(hx + 20, hy + 8, 4, 1, '#7eb8ff'); r(hx - 3, hy + 11, 3, 1, '#7eb8ff'); }
    } else {
      o(hx, hy, 20, 20, skin);
      r(hx + 3, hy + 3, 5, 4, WHITE); r(hx + 17, hy + 4, 1, 13, RIM);
      if (face === 'mud' || face === 'sheep') {
        r(hx + 1, hy + 8, 4, 4, MUD); r(hx + 15, hy + 9, 4, 3, MUD);
        r(hx + 1, hy + 17, 2, 2, MUD2);
      }
      if (side) {
        o(hx - 1, hy - 4, 22, 8, '#ffd23f'); r(hx + 18, hy - 2, 5, 5, '#ffd23f'); r(hx + 8, hy - 8, 4, 4, '#ffd23f');
      }
      kidFace(r, hx, hy, face);
    }
  }
  function kidFace(r, hx, hy, face) {
    if (face === 'coyote') {
      r(hx + 6, hy + 9, 2, 2, INK); r(hx + 12, hy + 9, 2, 2, INK); r(hx + 6, hy + 14, 8, 1, INK);
      r(hx + 22, hy + 8, 2, 2, INK); r(hx + 26, hy + 8, 2, 2, INK); r(hx + 30, hy + 8, 2, 2, INK);
    } else if (face === 'panic') {
      r(hx + 3, hy + 7, 4, 6, INK); r(hx + 13, hy + 7, 4, 6, INK);
      r(hx + 4, hy + 8, 1, 1, WHITE); r(hx + 14, hy + 8, 1, 1, WHITE);
      r(hx + 8, hy + 14, 4, 3, INK);
      r(hx + 18, hy + 4, 3, 4, '#7eb8ff'); r(hx + 20, hy + 8, 2, 3, '#7eb8ff'); r(hx - 2, hy + 6, 2, 3, '#7eb8ff');
    } else if (face === 'pull' || face === 'effort') {
      r(hx + 3, hy + 6, 5, 2, INK); r(hx + 12, hy + 6, 5, 2, INK);
      r(hx + 4, hy + 9, 5, 2, INK); r(hx + 13, hy + 9, 5, 2, INK);
      r(hx + 6, hy + 13, 8, 3, WHITE); r(hx + 2, hy + 12, 3, 3, '#e08a6a'); r(hx + 15, hy + 12, 3, 3, '#e08a6a');
    } else if (face === 'lose' || face === 'jolt') {
      r(hx + 3, hy + 6, 5, 2, INK); r(hx + 4, hy + 5, 3, 2, INK);
      r(hx + 12, hy + 6, 5, 2, INK); r(hx + 13, hy + 5, 3, 2, INK);
      r(hx + 5, hy + 10, 2, 3, INK); r(hx + 13, hy + 10, 2, 3, INK);
      r(hx + 6, hy + 13, 8, 3, WHITE); r(hx + 6, hy + 13, 8, 1, INK); r(hx + 6, hy + 15, 8, 1, INK);
    } else if (face === 'smug' || face === 'glare') {
      r(hx + 3, hy + 6, 5, 2, INK); r(hx + 4, hy + 5, 3, 2, INK);
      r(hx + 12, hy + 6, 5, 2, INK); r(hx + 13, hy + 5, 3, 2, INK);
      r(hx + 5, hy + 10, 2, 3, INK); r(hx + 13, hy + 10, 2, 3, INK);
      r(hx + 6, hy + 14, 7, 2, INK); r(hx + 7, hy + 15, 5, 1, '#c45a4a');
    } else if (face === 'sheep' || face === 'blink' || face === 'mud' || face === 'max' || face === 'fan') {
      if (face === 'blink') { r(hx + 4, hy + 10, 5, 1, INK); r(hx + 12, hy + 10, 5, 1, INK); }
      else { r(hx + 4, hy + 8, 4, 2, INK); r(hx + 5, hy + 7, 2, 2, INK); r(hx + 12, hy + 8, 4, 2, INK); r(hx + 13, hy + 7, 2, 2, INK); }
      r(hx + 6, hy + 14, 8, 2, INK);
    } else {
      r(hx + 3, hy + 7, 5, 2, INK); r(hx + 12, hy + 7, 5, 2, INK);
      r(hx + 5, hy + 10, 2, 4, INK); r(hx + 13, hy + 10, 2, 4, INK);
      r(hx + 6, hy + 11, 1, 1, WHITE); r(hx + 14, hy + 11, 1, 1, WHITE);
      r(hx + 6, hy + 15, 8, 2, INK);
    }
  }
  function robotEyes(r, hx, hy, face) {
    const c = '#7eb8ff';
    if (face === 'mud' || face === 'hidden') {
      r(hx + 6, hy + 8, 3, 1, c); r(hx + 6, hy + 12, 3, 1, c); r(hx + 5, hy + 9, 1, 3, c); r(hx + 8, hy + 9, 1, 3, c);
      r(hx + 13, hy + 8, 3, 1, c); r(hx + 13, hy + 12, 3, 1, c); r(hx + 12, hy + 9, 1, 3, c); r(hx + 15, hy + 9, 1, 3, c);
    } else if (face === 'sheep' || face === 'smug' || face === 'ready') {
      r(hx + 5, hy + 8, 3, 2, c); r(hx + 6, hy + 7, 1, 1, c); r(hx + 12, hy + 8, 3, 2, c); r(hx + 13, hy + 7, 1, 1, c);
    } else if (face === 'panic' || face === 'jolt' || face === 'lose') {
      r(hx + 5, hy + 8, 4, 4, c); r(hx + 12, hy + 8, 4, 4, c);
    } else if (face === 'glare' || face === 'effort' || face === 'pull' || face === 'max' || face === 'fan') {
      r(hx + 5, hy + 8, 3, 3, c); r(hx + 4, hy + 9, 2, 1, c); r(hx + 12, hy + 8, 3, 3, c); r(hx + 14, hy + 9, 2, 1, c);
    } else {
      r(hx + 5, hy + 8, 3, 2, c); r(hx + 12, hy + 8, 3, 2, c);
    }
  }

  function localToWorld(lx, ly, sm) {
    const x = lx * sm.sx, y = ly * sm.sy;
    const c = Math.cos(sm.tilt || 0), s = Math.sin(sm.tilt || 0);
    return { x: sm.fx + x * c - y * s, y: sm.fy + x * s + y * c };
  }
  function gripRope(r, o, sm, side, portrait, cpu, state, extras, time, reduced) {
    const skin = cpu ? '#c9d3e6' : SKIN0[side];
    const sh1 = localToWorld(side === 0 ? 7 : -7, -20, sm);
    const sh2 = localToWorld(side === 0 ? 3 : -3, -15, sm);
    const feel = ropeFeel(state, extras, time, reduced);
    let u;
    if (portrait) u = side === 0 ? 0.16 : 0.84;
    else {
      const rope = ropeGeom(false);
      const gx = sm.fx + (side === 0 ? 22 : -22);
      u = Math.max(0.08, Math.min(0.92, (gx - rope.x1) / (rope.x2 - rope.x1)));
    }
    const g1 = ropeSample(u, portrait, feel);
    const g2 = ropeSample(Math.max(0.06, Math.min(0.94, u + (side === 0 ? 0.03 : -0.03))), portrait, feel);
    limb(r, o, sh1, g1, skin);
    limb(r, o, sh2, g2, skin);
  }
  function limb(r, o, shoulder, grip, skin) {
    const dx = grip.x - shoulder.x, dy = grip.y - shoulder.y, len = Math.hypot(dx, dy) || 1;
    const steps = Math.max(3, Math.min(5, Math.round(len / 6)));
    for (let i = 0; i < steps; i++) {
      const t = i / steps;
      const sz = Math.max(3, 6 - Math.round(t * 3));
      o(shoulder.x + dx * t - sz / 2, shoulder.y + dy * t - sz / 2, sz, sz, skin);
    }
    o(grip.x - 3, grip.y - 3, 6, 6, skin);
    r(grip.x - 2, grip.y - 2, 4, 4, skin);
  }
  function extrasFX(r, sm, side, a, e, extras, time, cpu, fall, act, portrait) {
    if (fall) return;
    if (a < -0.2) {
      const h = homes(!!portrait, side);
      const n = 3 + Math.round(Math.min(7, (-a) * 8));
      for (let i = 0; i < n; i++) {
        const t = i / n;
        const x = mix(h.x, sm.fx, t) + (side === 0 ? -8 : 8);
        r(x, sm.fy + 3, 3, 2, i % 2 ? '#4a3820' : '#6a5030');
      }
    }
    if (e > 0.5 && extras.taps && extras.taps[side] && extras.taps[side] % 6 === 0 && extras.yank && extras.yank[side]) {
      r(sm.fx + 12, sm.fy - 48, 2, 3, WHITE);
    }
    /* no steam / tongue leftovers */
    if (act === 2 && extras.sploosh && extras.sploosh.player !== side && extras.sploosh.player !== 'both') {
      /* winner streak handled in pose */
    }
  }
  function kickLegs(r, o, sm, side, f, cpu) {
    const kick = Math.floor(f / 6) % 2;
    const x = sm.fx, y = sm.fy - 4 - kick * 6;
    o(x - 10, y, 8, 16, cpu ? '#7a8494' : (side ? '#0f2a6e' : '#7a1220'));
    o(x + 2, y + (kick ? 4 : 0), 8, 16, cpu ? '#7a8494' : (side ? '#0f2a6e' : '#7a1220'));
    o(x - 12, y - 6, 10, 7, WHITE); o(x + 4, y - 2 - (kick ? 4 : 0), 10, 7, WHITE);
    r(x - 10, y - 4, 6, 2, side ? '#2c7bff' : '#ff3d3d'); r(x + 6, y, 6, 2, side ? '#2c7bff' : '#ff3d3d');
  }
  function drawSettledMud(r, o, sm, side, cpu, extras) {
    const x = 120, y = 156;
    o(x - 10, y - 22, 20, 18, MUD);
    r(x - 6, y - 16, 4, 4, WHITE); r(x + 4, y - 16, 4, 4, WHITE);
    r(x - 4, y - 10, 8, 2, INK);
  }
  function splashFX(r, g, splash, portrait, extras) {
    const f = splash.age * 60, act = actOf(splash.age);
    const cx = 120, cy = portrait ? 96 : 152;
    if (act >= 3) {
      const t = Math.min(1, (f - 42) / 14);
      const rad = Math.round(40 * t);
      r(cx - rad, cy - 3, rad * 2, 4, 'rgba(154,98,52,0.35)');
      r(cx - Math.round(rad * 0.7), cy - 2, Math.round(rad * 1.4), 3, MUD2);
    }
    if (act >= 3) {
      const t = (f - 42);
      for (let i = 0; i < 22; i++) {
        const seed = i * 17.13;
        const vx = ((i % 2 ? 1 : -1) * (1.5 + (i % 5) * 0.3));
        const vy = -3 - (i % 4) * 0.5;
        const life = t;
        const px = cx + vx * life;
        const py = cy + vy * life + 0.5 * 0.25 * life * life;
        const sz = i < 3 ? 6 : (2 + i % 3);
        if (life > 0 && life < 40) r(px, py, sz, sz, i % 3 === 0 ? MUD : i % 3 === 1 ? MUD2 : MUD3);
      }
      if (f < 110) {
        const tf = Math.min(1, (f - 42) / 10);
        let sc = tf < 0.6 ? (tf / 0.6) * 1.2 : 1.2 - (tf - 0.6) / 0.4 * 0.2;
        word(g, 120, 44, extras.cpu && splash.player === 1 ? 'BZZT!' : 'SPLOOSH!', sc, -8);
      }
      if (f < 82) {
        r(2, 40 + (f - 42) * 0.8, 8, 6, MUD); r(230, 36 + (f - 42) * 0.6, 7, 7, MUD2);
      }
    }
    if (act >= 4) {
      for (let i = 0; i < 3; i++) {
        const bt = (f - 70 - i * 8);
        if (bt > 0 && bt < 20) r(112 + i * 8, 124 - bt, 3, 3, WHITE);
      }
    }
  }
  function word(g, x, y, text, sc, rot) {
    g.save();
    g.translate(x, y);
    g.rotate((rot || 0) * Math.PI / 180);
    g.scale(sc || 1, sc || 1);
    g.font = '900 20px Bungee, sans-serif';
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.lineJoin = 'round'; g.lineWidth = 5; g.strokeStyle = WHITE; g.strokeText(text, 0, 0);
    g.fillStyle = MUD; g.fillText(text, 0, 0);
    g.restore();
  }
  function secondWindFX(r, g, sw, time) {
    const age = time - (sw.at || time);
    if (age > 0.35) return;
    const x = sw.side === 0 ? 70 : 170, y = 88;
    for (let i = 0; i < 6; i++) r(x + (sw.side ? -1 : 1) * (8 + i * 5), y - 6 + i, 8, 2, WHITE);
    word(g, x, y - 22, 'HNGH!', 1, sw.side ? 8 : -8);
  }
  function puff(r, d) {
    if (d.age > 0.32) return;
    const s = 3 + Math.round(d.age * 14);
    r(d.x - s / 2, d.y - d.age * 20, s, s, d.age > 0.16 ? '#8a7a64' : WHITE);
  }
  window.TWRender = { paint, colors, flagAt, ropeGeom, effortOf, actOf };
})();

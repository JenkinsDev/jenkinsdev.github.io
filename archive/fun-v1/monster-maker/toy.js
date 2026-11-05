/* Monster Maker: state, rendering, interaction. Parts live in parts.js / parts2.js. */
(function () {
  "use strict";
  const P = window.MonsterParts;
  const KEY = "fun:monster-maker:state";
  const $ = (id) => document.getElementById(id);
  const snd = (fn, ...a) => { try { window.FunSound && window.FunSound[fn](...a); } catch (_) {} };

  const ADJ = ["Wobbly", "Fuzzy", "Squishy", "Bouncy", "Grumbly", "Sparkly", "Giggly", "Zippy", "Mushy", "Goofy", "Snazzy", "Bumbly", "Wiggly", "Chunky"];
  const NOUN = ["Snorfle", "Bloop", "Gloop", "Fizzbo", "Mugwump", "Noodle", "Zonk", "Wibble", "Blorp", "Grumpkin", "Boop", "Doodle", "Splodge", "Nubbin"];
  const TABS = [
    { k: "body", list: P.bodies }, { k: "color", list: P.colors }, { k: "eyes", list: P.eyes, crop: [240, "eyeY"] },
    { k: "mouth", list: P.mouths, crop: [200, "mouthY"] }, { k: "horns", list: P.horns, crop: [290, "top", -20] },
    { k: "limbs", list: P.limbs }, { k: "extras", list: P.extras, crop: [340, "top", 120] },
  ];
  const WEIGHT = { body: 1, eyes: 1, mouth: 1, horns: 1, limbs: 1, color: 0.5, extras: 0.5 };
  const rnd = (n) => Math.floor(Math.random() * n);

  let s = { body: 0, color: 2, eyes: 1, mouth: 0, horns: 5, limbs: 1, extras: ["cheeks"] };
  let nm = { a: rnd(ADJ.length), b: rnd(NOUN.length) };
  let tab = 0, points = 0, ptr = [innerWidth / 2, innerHeight], raf = 0, talkTimer = 0;
  const svg = $("monster"), react = $("react");

  /* ---------- storage ---------- */
  function load() {
    try {
      const d = JSON.parse(localStorage.getItem(KEY));
      if (!d) return;
      const ok = (v, n) => Number.isInteger(v) && v >= 0 && v < n;
      if (TABS.slice(0, 6).every((T) => ok(d.s[T.k], T.list.length))) {
        s = { ...d.s, extras: (d.s.extras || []).filter((id) => P.extras.some((e) => e.id === id)) };
        if (ok(d.n.a, ADJ.length) && ok(d.n.b, NOUN.length)) nm = d.n;
      }
    } catch (_) {}
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify({ s, n: nm })); } catch (_) {} }

  /* ---------- drawing ---------- */
  function monster(st, uid) {
    const a = P.bodies[st.body], col = P.colors[st.color].fill;
    const lm = P.limbs[st.limbs].draw(a, col);
    const dy = P.GROUND - (a.bottom + lm.drop);
    const x = P.drawExtras(a, col, st.extras, uid);
    const body = `<path d="${a.d}" fill="${col}"/><g class="l-pat">${x.below}</g>` +
      `<path d="${a.d}" fill="none" stroke="${P.INK}" stroke-width="5" stroke-linejoin="round"/>`;
    return {
      a, dy,
      svg: `<ellipse cx="200" cy="${P.GROUND + 2}" rx="${a.hw * 0.85}" ry="11" fill="${P.INK}" opacity=".16"/>` +
        `<g filter="url(#crayon)"><g transform="translate(0 ${dy})"><g class="l-limbs">${lm.svg}</g><g class="l-horns">${P.horns[st.horns].draw(a, col)}</g>` +
        `<g class="l-body">${body}</g><g class="l-eyes">${P.drawEyes(a, st.eyes)}</g><g class="l-mouth">${P.drawMouth(a, st.mouth)}</g>` +
        `<g class="l-extras">${x.above}</g></g></g>`,
    };
  }

  const SNAP = { eyes: ".l-eyes", mouth: ".l-mouth", horns: ".l-horns", limbs: ".l-limbs", extras: ".l-pat,.l-extras" };
  function retrigger(el, cls) { el.classList.remove(cls); void el.getBoundingClientRect(); el.classList.add(cls); }

  function renderStage(key) {
    react.innerHTML = monster(s, "main").svg;
    look();
    if (key && SNAP[key]) react.querySelectorAll(SNAP[key]).forEach((el) => retrigger(el, "snap"));
    else if (key) retrigger(react, "bounce");
  }

  function cropBox(c, a, dy) {
    const size = c[0], cy = a[c[1]] + dy + (c[2] || 0);
    return `${200 - size / 2} ${cy - size / 2} ${size} ${size}`;
  }

  function renderTabs() {
    $("tabs").innerHTML = P.tabIcons.map((t, i) =>
      `<button class="tab" style="--c:${t.c}" data-i="${i}" aria-label="${t.n}" aria-pressed="${i === tab}">${t.svg}</button>`).join("");
  }

  function renderOpts() {
    const T = TABS[tab];
    $("opts").innerHTML = T.list.map((o, i) => {
      const st = { ...s };
      if (T.k === "extras") st.extras = [...new Set([...s.extras, o.id])]; else st[T.k] = i;
      const r = monster(st, "t" + i);
      const vb = T.crop ? cropBox(T.crop, r.a, r.dy) : "0 36 400 400";
      const on = T.k === "extras" ? s.extras.includes(o.id) : s[T.k] === i;
      return `<button class="opt" data-i="${i}" aria-label="${o.n}" aria-pressed="${on}"><svg viewBox="${vb}" aria-hidden="true">${r.svg}</svg></button>`;
    }).join("");
  }

  /* ---------- name ---------- */
  function showName(animate) {
    $("name").textContent = ADJ[nm.a] + " " + NOUN[nm.b];
    if (animate) retrigger($("bubble"), "pop");
  }
  function reroll() { nm = { a: rnd(ADJ.length), b: rnd(NOUN.length) }; points = 0; showName(true); }

  /* ---------- picking ---------- */
  function pick(i) {
    const T = TABS[tab], o = T.list[i];
    if (T.k === "extras") {
      const has = s.extras.includes(o.id);
      s.extras = s.extras.filter((id) => id !== o.id && !(o.slot && !has && P.extras.find((e) => e.id === id).slot === o.slot));
      if (!has) s.extras.push(o.id);
      snd("pop");
    } else {
      s[T.k] = i;
      snd(T.k === "color" ? "pop" : "boing");
      snd("note", i + 2);
    }
    points += WEIGHT[T.k];
    if (points >= 2) reroll();
    save(); renderStage(T.k === "color" ? "body" : T.k); renderOpts();
  }

  function surprise() {
    s = { body: rnd(P.bodies.length), color: rnd(P.colors.length), eyes: rnd(P.eyes.length), mouth: rnd(P.mouths.length),
      horns: rnd(P.horns.length), limbs: rnd(P.limbs.length), extras: [] };
    P.extras.forEach((e) => { if (Math.random() < 0.35 && !(e.slot && s.extras.some((id) => P.extras.find((x) => x.id === id).slot === e.slot))) s.extras.push(e.id); });
    snd("whoosh"); reroll(); save(); renderStage("all"); renderOpts();
  }

  /* ---------- reactions ---------- */
  function speak() {
    const a = P.bodies[s.body], v = P.mouths[s.mouth];
    const base = (660 - a.size * 100) * (0.94 + Math.random() * 0.12);
    v.p.forEach((m, i) => setTimeout(() => snd("tone", base * m, {
      duration: 0.17, type: v.w, volume: v.w === "sine" || v.w === "triangle" ? 0.35 : 0.14, slideTo: base * (v.p[i + 1] || m * 0.85),
    }), i * 150));
    svg.classList.add("talk");
    clearTimeout(talkTimer);
    talkTimer = setTimeout(() => svg.classList.remove("talk"), v.p.length * 150 + 100);
  }

  function look() {
    svg.querySelectorAll(".pupil").forEach((p) => {
      const r = p.parentNode.getBoundingClientRect();
      const dx = ptr[0] - (r.left + r.width / 2), dy = ptr[1] - (r.top + r.height / 2);
      const d = Math.hypot(dx, dy) || 1, m = +p.dataset.m * Math.min(1, d / 140);
      p.setAttribute("transform", `translate(${(dx / d) * m} ${(dy / d) * m})`);
    });
  }
  function track(e) {
    ptr = [e.clientX, e.clientY];
    if (!raf) raf = requestAnimationFrame(() => { raf = 0; look(); });
  }

  function blink() {
    svg.classList.add("blink");
    setTimeout(() => svg.classList.remove("blink"), 130);
    if (Math.random() < 0.25) setTimeout(() => { svg.classList.add("blink"); setTimeout(() => svg.classList.remove("blink"), 120); }, 280);
    setTimeout(blink, 1500 + Math.random() * 3500);
  }

  /* ---------- wire up ---------- */
  load();
  showName(false);
  renderTabs(); renderOpts(); renderStage(null);
  setTimeout(blink, 1800);
  addEventListener("pointermove", track, { passive: true });
  addEventListener("pointerdown", track, { passive: true });
  $("tabs").addEventListener("click", (e) => {
    const b = e.target.closest(".tab");
    if (!b) return;
    const had = document.activeElement === b;
    tab = +b.dataset.i; snd("pop"); renderTabs(); renderOpts();
    if (had) $("tabs").querySelector(`[data-i="${tab}"]`).focus();
  });
  $("opts").addEventListener("click", (e) => {
    const b = e.target.closest(".opt");
    if (!b) return;
    const had = document.activeElement === b, i = b.dataset.i;
    pick(+i);
    if (had) $("opts").querySelector(`[data-i="${i}"]`).focus();
  });
  $("poke").addEventListener("click", () => { retrigger(react, "squish"); speak(); });
  $("surprise").addEventListener("click", surprise);
  $("bubble").addEventListener("click", () => { snd("pop"); reroll(); save(); });
})();

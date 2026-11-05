/* Dig to the Middle of the Earth: builds the world, drives the depth meter, saves the record. */
(function () {
  "use strict";
  const D = window.DIG, ART = window.DIG_ART;
  const $ = (id) => document.getElementById(id);
  const st = D.stations, YC = st[st.length - 1].y, RECORD_KEY = "fun:dig-down:record";
  const fmt = (n) => n.toLocaleString("en-US");
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  document.body.insertAdjacentHTML("afterbegin", ART.sprite);
  $("dg").innerHTML = ART.digger;

  /* ---------- depth maths ---------- */
  function yToD(y) {
    if (y <= 0) return 0;
    for (let i = 1; i < st.length; i++) {
      if (y <= st[i].y) { const a = st[i - 1], b = st[i]; return a.d + ((b.d - a.d) * (y - a.y)) / (b.y - a.y); }
    }
    return D.EARTH_M;
  }
  const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const stops = D.colors.map((c) => [c[0], hex(c[1])]);
  function colorAt(y) {
    if (y <= 0) return stops[0][1];
    for (let i = 1; i < stops.length; i++) {
      if (y <= stops[i][0]) {
        const a = stops[i - 1], b = stops[i], t = (y - a[0]) / (b[0] - a[0]);
        return a[1].map((v, k) => Math.round(v + (b[1][k] - v) * t));
      }
    }
    return stops[stops.length - 1][1];
  }
  const rgb = (c) => `rgb(${c[0]},${c[1]},${c[2]})`;
  const ftStr = (m) => { const f = m * 3.28084; return f < 10 ? f.toFixed(1) : fmt(Math.round(f)); };
  const mStr = (m) => (m < 10 ? m.toFixed(1) : fmt(Math.round(m)));
  const kmStr = (m) => { const k = m / 1000; return k < 100 ? k.toFixed(1) : fmt(Math.round(k)); };
  const chip = (d) => (d >= 1000 ? `${kmStr(d)} km down` : `${mStr(d)} m / ${ftStr(d)} ft down`);

  /* ---------- build the world ---------- */
  const world = $("world");
  let seed = 11;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const at = (tag, cls, y, html, style) => {
    const el = document.createElement(tag);
    el.className = cls; el.style.cssText = `--y:${y}px;${style || ""}`;
    el.innerHTML = html; world.appendChild(el); return el;
  };
  const use = (id, cls) => `<svg class="${cls}" aria-hidden="true"><use href="#${id}"/></svg>`;
  const WAVE = '<svg viewBox="0 0 200 20" aria-hidden="true"><path d="M0 10 Q25 0 50 10 T100 10 T150 10 T200 10" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" filter="url(#crayon)"/></svg>';

  st.forEach((s, i) => {
    if (s.end || i === 0) return;
    const pts = ["0% 100%"];
    for (let x = 0; x <= 100; x += 4) pts.push(`${x}% ${Math.round(8 + rnd() * 34)}px`);
    pts.push("100% 100%");
    const mix = colorAt(s.y + 200).map((v, k) => Math.round(v * 0.8 + [251, 247, 238][k] * 0.2));
    at("div", "tear", s.y - 30, "", `background:${rgb(mix)} var(--grain);clip-path:polygon(${pts.join(",")})`);
  });

  for (let y = 120, n = 0; y < YC - 200; y += 120 + rnd() * 80, n++) {
    const d = yToD(y), zone = D.zones.find((z) => d < z.max).syms;
    const left = n % 2 ? 3 + rnd() * 14 : 79 + rnd() * 15, w = 52 + rnd() * 44;
    at("div", "deco", y, use(zone[Math.floor(rnd() * zone.length)], ""),
      `left:${left}%;--w:${w}px;rotate:${Math.round(rnd() * 50 - 25)}deg`);
    if (n % 3 === 0) at("div", "strata", y + 90, WAVE, `left:${Math.round(rnd() * 70)}%`);
  }

  st.forEach((s, i) => {
    if (s.end) return;
    const card = at("article", "card reveal", s.y + 90,
      `<span class="fun-tape" aria-hidden="true"></span><span class="chip">${chip(s.d)}</span>${use(s.sym, "art")}` +
      `<h3>${s.title}</h3><p class="fact">${s.fact}</p><p class="joke">${s.joke}</p>` +
      `<button class="poke" type="button" aria-label="Poke the ${s.title} card for a sound"></button>`);
    card.style.setProperty("--dir", i % 2 ? 1 : -1);
    card.style.setProperty("--rot", ((i % 4) - 1.5) * 1.1 + "deg");
    card.dataset.note = i;
  });
  D.finds.forEach((f) => {
    const b = at("button", "find reveal " + f.side, f.y,
      (f.sym ? use(f.sym, "art") : `<span class="em" aria-hidden="true">${f.em}</span>`) + `<span class="bubble">${f.t}</span>`);
    b.type = "button"; b.setAttribute("aria-label", f.t);
  });
  D.ffs.forEach((f) => at("div", "ff reveal", f.y, `<span class="pill">⏩ FAST-FORWARD: <b>${f.t}</b></span>`));
  at("div", "centre", YC + 40, "THE CENTRE<br>of the Earth!");

  /* ---------- reveal + poke ---------- */
  const io = "IntersectionObserver" in window
    ? new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }),
      { rootMargin: "0px 0px -6% 0px", threshold: 0.1 })
    : null;
  world.querySelectorAll(".reveal").forEach((el) => (io ? io.observe(el) : el.classList.add("in")));
  const snd = (fn, a) => { try { if (window.FunSound) window.FunSound[fn](a); } catch (_) {} };
  const wiggle = (el) => { el.classList.remove("wig"); void el.offsetWidth; el.classList.add("wig"); };
  world.addEventListener("click", (e) => {
    const t = e.target.closest(".poke, .find");
    if (!t) return;
    if (t.classList.contains("find")) { wiggle(t); snd("boing"); return; }
    const card = t.parentElement; wiggle(card); snd("note", Number(card.dataset.note));
  });

  /* ---------- record ---------- */
  let record = 0, dirty = false;
  try { record = Number(localStorage.getItem(RECORD_KEY)) || 0; } catch (_) {}
  const recEl = $("rec");
  const showRec = () => { recEl.textContent = record > 0 ? ftStr(record) + " ft" : "none yet"; };
  const save = () => { if (!dirty) return; dirty = false; try { localStorage.setItem(RECORD_KEY, String(Math.round(record))); } catch (_) {} };
  showRec();
  addEventListener("pagehide", save);
  document.addEventListener("visibilitychange", () => { if (document.hidden) save(); });

  /* ---------- scroll loop ---------- */
  const bg = $("bg"), glow = $("glow"), pin = $("pin"), live = $("live"), digger = $("digger");
  const els = { ft: $("ft"), mt: $("mt"), km: $("km"), label: $("mLabel") };
  let ticking = false, digTimer = 0, lastY = -1, lastLayer = "", reached = false, saveTimer = 0;
  const sh = D.state;
  D.recalc = () => {
    sh.otherTop = $("other").getBoundingClientRect().top + scrollY;
    sh.maxY = document.documentElement.scrollHeight - innerHeight;
  };
  function depthFor(Y) {
    if (Y < YC) return yToD(Y);
    if (!sh.otherOpen) return D.EARTH_M;
    const start = sh.otherTop - innerHeight, frac = clamp((Y - start) / Math.max(1, sh.maxY - start), 0, 1);
    return D.EARTH_M * (1 - frac);
  }
  function update() {
    ticking = false;
    const Y = Math.max(0, scrollY);
    if (Y === lastY) return;
    const moved = lastY >= 0; lastY = Y;
    bg.style.background = rgb(colorAt(Y));
    glow.style.opacity = clamp((Y - 17000) / 8500, 0, 1).toFixed(2);
    const d = depthFor(Y);
    els.ft.textContent = ftStr(d); els.mt.textContent = mStr(d);
    els.km.hidden = d < 1000; if (d >= 1000) els.km.textContent = `${kmStr(d)} km`;
    els.label.textContent = Y > YC && sh.otherOpen && d < D.EARTH_M ? "GOING UP!" : "DEPTH";
    pin.style.transform = `translateY(${clamp(Y / YC, 0, 1) * (pin.parentNode.clientHeight - 18)}px)`;
    if (Y <= YC && d > record) {
      record = d; dirty = true; showRec();
      clearTimeout(saveTimer); saveTimer = setTimeout(save, 600);
    }
    document.body.classList.toggle("at-end", Y >= YC - 60);
    document.body.classList.toggle("past", Y > YC + 160);
    if (Y >= YC - 80 && !reached) { reached = true; if (D.onCentre) D.onCentre(); }
    else if (Y < YC - 1500) reached = false;
    let layer = st[0].title;
    for (const s of st) if (!s.end && Y >= s.y - 200) layer = s.title;
    if (Y >= YC - 80) layer = "The centre of the Earth!";
    if (layer !== lastLayer) { lastLayer = layer; live.textContent = layer; }
    if (moved) {
      digger.classList.add("digging"); clearTimeout(digTimer);
      digTimer = setTimeout(() => digger.classList.remove("digging"), 160);
    }
  }
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", () => { if (sh.otherOpen) D.recalc(); lastY = -1; onScroll(); });
  D.YC = YC;
  update();
})();

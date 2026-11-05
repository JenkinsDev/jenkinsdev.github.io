/* Dig to the Middle of the Earth: confetti + gold stars, auto-scroll, and the ending buttons. */
(function () {
  "use strict";
  const D = window.DIG, YC = D.YC, st = D.state;
  const $ = (id) => document.getElementById(id);
  const RM = window.matchMedia("(prefers-reduced-motion: reduce)");
  const snd = (fn, a) => { try { if (window.FunSound) window.FunSound[fn](a); } catch (_) {} };

  /* ---------- confetti: paper bits and gold star stickers ---------- */
  const cv = $("confetti"), ctx = cv.getContext("2d");
  const COLS = ["#f7c531", "#e8432e", "#2f7fd6", "#3aa356", "#f27ba6", "#fffdf7", "#f2892b"];
  let parts = [], raf = 0;
  function star(r) {
    ctx.beginPath();
    for (let i = 0; i < 10; i++) { const a = (i * Math.PI) / 5 - Math.PI / 2, rad = i % 2 ? r * 0.45 : r; ctx.lineTo(Math.cos(a) * rad, Math.sin(a) * rad); }
    ctx.closePath(); ctx.fill(); ctx.stroke();
  }
  function tick() {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    parts = parts.filter((p) => p.y < innerHeight + 40);
    ctx.strokeStyle = "#2a2522"; ctx.lineWidth = 2;
    for (const p of parts) {
      p.x += p.vx + Math.sin(p.y / 30); p.y += p.vy; p.r += p.vr;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c;
      if (p.star) star(p.w); else ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }
    raf = parts.length ? requestAnimationFrame(tick) : 0;
  }
  function burst() {
    if (RM.matches) return;
    const dpr = Math.min(2, devicePixelRatio || 1);
    cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    for (let i = 0; i < 120; i++) {
      const s = i % 6 === 0;
      parts.push({ x: innerWidth * (0.1 + Math.random() * 0.8), y: -20 - Math.random() * innerHeight * 0.5, vx: (Math.random() - 0.5) * 4,
        vy: 2 + Math.random() * 4, w: s ? 11 + Math.random() * 6 : 8 + Math.random() * 8, h: 5 + Math.random() * 7, r: Math.random() * 6.3,
        vr: (Math.random() - 0.5) * 0.3, c: s ? "#f7c531" : COLS[i % COLS.length], star: s });
    }
    if (!raf) raf = requestAnimationFrame(tick);
  }
  const toast = $("toast");
  D.onCentre = () => {
    burst(); snd("ding");
    [0, 2, 4, 7, 9].forEach((n, i) => setTimeout(() => snd("note", n), 150 + i * 120));
    toast.classList.add("show"); setTimeout(() => toast.classList.remove("show"), 4200);
  };
  $("finCard").addEventListener("click", (e) => { if (!e.target.closest("button")) { burst(); snd("ding"); } });

  /* ---------- auto-scroll ---------- */
  const btn = $("faster");
  let mode = null, rafId = 0, last = 0, t0 = 0, pos = 0, onDone = null;
  const LABEL = RM.matches ? "Next find" : "Dig faster!";
  btn.textContent = LABEL;
  function stop() {
    if (!mode) return;
    mode = null; cancelAnimationFrame(rafId);
    btn.setAttribute("aria-pressed", "false"); btn.textContent = LABEL; btn.classList.remove("on");
    if (onDone) { const f = onDone; onDone = null; f(); }
  }
  function dig(ts) {
    if (mode !== "dig") return;
    const dt = Math.min(0.05, (ts - last) / 1000); last = ts;
    pos += dt * (600 + (900 * pos) / YC) * Math.min(1, (ts - t0) / 600);
    if (pos >= YC) { scrollTo(0, YC); stop(); return; }
    scrollTo(0, pos); rafId = requestAnimationFrame(dig);
  }
  function fly(y, ms, done) {
    stop();
    if (RM.matches) { scrollTo(0, y); if (done) done(); return; }
    mode = "fly"; onDone = done || null;
    const from = scrollY, start = performance.now();
    const step = (now) => {
      if (mode !== "fly") return;
      const t = Math.min(1, (now - start) / ms), e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      scrollTo(0, from + (y - from) * e);
      if (t < 1) rafId = requestAnimationFrame(step); else stop();
    };
    rafId = requestAnimationFrame(step);
  }
  btn.addEventListener("click", () => {
    if (mode) { stop(); return; }
    if (scrollY >= YC) return;
    if (RM.matches) {
      const next = D.stations.find((s) => s.y > scrollY + 100);
      scrollTo(0, next ? next.y : YC); return;
    }
    mode = "dig"; pos = scrollY; last = t0 = performance.now();
    btn.setAttribute("aria-pressed", "true"); btn.textContent = "Stop digging"; btn.classList.add("on");
    rafId = requestAnimationFrame(dig);
  });
  const interrupt = (e) => { if (mode && !(e.target.closest && e.target.closest("#faster"))) stop(); };
  ["wheel", "touchstart", "keydown", "pointerdown"].forEach((ev) => addEventListener(ev, interrupt, { passive: true, capture: true }));

  /* ---------- ending ---------- */
  const other = $("other"), keep = $("keep");
  keep.addEventListener("click", () => {
    other.hidden = false; st.otherOpen = true; D.recalc(); keep.hidden = true;
    snd("boing");
    fly(other.getBoundingClientRect().top + scrollY - innerHeight * 0.12, 1600, () => other.querySelector("h2").focus({ preventScroll: true }));
  });
  const climb = () => {
    snd("whoosh");
    fly(0, 2600, () => { other.hidden = true; st.otherOpen = false; keep.hidden = false; });
  };
  $("climb").addEventListener("click", climb);
  $("climb2").addEventListener("click", climb);
})();

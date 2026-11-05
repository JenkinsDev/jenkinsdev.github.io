/* Layout + count-up animation for one page of the journey. */
(function () {
  "use strict";
  const H = window.HMM;
  const reduce = () => window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const FR = [[0.2, "⅕"], [0.25, "¼"], [1 / 3, "⅓"], [0.5, "½"], [2 / 3, "⅔"], [0.75, "¾"]];

  function sig2(n) { const p = Math.pow(10, Math.max(0, String(Math.round(n)).length - 2)); return Math.round(n / p) * p; }
  H.fmt = function (r) {
    if (r < 0.2) return "1/" + sig2(1 / r).toLocaleString("en-US");
    if (r < 1) { let b = FR[0]; FR.forEach((f) => { if (Math.abs(f[0] - r) < Math.abs(b[0] - r)) b = f; }); return b[1]; }
    if (r < 10) { const h = Math.round(r * 2) / 2, w = Math.floor(h); return h % 1 ? (w || "") + "½" : String(h); }
    if (r < 100) return String(Math.round(r));
    if (r < 1e6) return sig2(r).toLocaleString("en-US");
    return (r / 1e6).toFixed(1) + " million";
  };
  H.headline = function (it, r) {
    if (r >= 0.88 && r < 1.12) return it.name + " is about as " + it.dim + " as you!";
    if (r < 1) return it.name + " is only {N} of you!";
    return it.head || it.name + " is as " + it.dim + " as {N} of you!";
  };

  const USE = '<use href="#me" width="60" height="120"/>';
  const g = (cls, t, inner) => `<g transform="${t}"><g class="${cls}">${inner}</g></g>`;
  const text = (x, y, s, a) => `<text x="${x}" y="${y}" text-anchor="${a || "start"}" class="note">${s}</text>`;
  const me = (k) => `<g transform="scale(${k})">${USE}</g>`;

  H.layout = function (pg, kid) {
    const st = pg.stage, W = st.clientWidth, Hh = st.clientHeight;
    if (W < 60 || Hh < 60) return;
    const it = pg.item, art = H.ART[it.id], horiz = it.o === "h", I = it.m, r = I / kid;
    pg.r = r; pg.solo = false;
    const top = art.top || 0, ext = horiz ? art.w : art.h - top;
    const artB = it.id === "adult" ? H.meMarkup(H.K.grn, "#e9b98f", "none", true) : art.b;
    const pad = 14, gap = 26, groundY = Hh - 18, availH = groundY - 46;
    let s = availH / Math.max(I, kid), out = "", html = "";
    const artG = (u, x, y) => `<g class="fadein"><g transform="translate(${x},${y - art.h * u}) scale(${u})" class="art">${artB}</g></g>`;
    if (!horiz) {
      const wU = art.w / ext;
      s = Math.min(s, (W - 2 * pad - gap) / (I * wU + kid * 0.7));
      const stack = kid * s >= 13 || r < 1;
      if (!stack) s = Math.min(s, (W - 2 * pad - gap - 130) / (I * wU));
      const meH = kid * s, meW = meH / 2, u = (I * s) / ext, artW = art.w * u;
      if (I * s < 14) {            // tiny thing: magnifier bubble + a speck at true size
        const rad = Math.min(80, W / 4), cx = pad + rad + 8, cy = groundY - rad - 36, ub = (rad * 1.5) / art.h;
        out = `<line x1="${pad}" y1="${groundY}" x2="${W - pad}" y2="${groundY}" class="gr"/>` +
          `<g class="art"><circle cx="${cx}" cy="${cy}" r="${rad}" fill="#fffdf7" stroke-dasharray="7 6"/>` +
          `<g transform="translate(${cx - art.w * ub / 2},${cy - rad * 0.75}) scale(${ub})">${artB}</g>` +
          `<path d="M${cx - rad * 0.2} ${cy + rad * 0.97} L${cx - 1} ${groundY - 6} M${cx + rad * 0.2} ${cy + rad * 0.97} L${cx + 1} ${groundY - 6}" stroke-width="2"/></g>` +
          `<g transform="translate(${cx - art.w * u / 2},${groundY - art.h * u}) scale(${u})" class="art">${artB}</g>` + text(cx, groundY + 14, "real size!", "middle");
        html = g("m", `translate(${Math.min(W - meW - pad - 10, cx + rad + 70)},${groundY - meH})`, me(meH / 120));
        pg.solo = true;
      } else {
        const colW = stack ? meW * 1.4 : 130, total = artW + gap + colW, x0 = (W - total) / 2, xc = x0 + artW + gap, topY = groundY - I * s;
        out = `<line x1="${x0 - 10}" y1="${groundY}" x2="${x0 + total + 10}" y2="${groundY}" class="gr"/>` + artG(u, x0, groundY) +
          `<path d="M${x0 - 6} ${topY} H${xc + colW}" class="dash"/>`;
        if (stack) {
          const n = r < 1 ? 1 : Math.floor(r), fr = r < 1 ? 0 : r - n;
          for (let i = 0; i < n; i++) html += g("m", `translate(${xc + (i % 2 ? 1 : -1) * meW * 0.1 + meW * 0.2},${groundY - (i + 1) * meH})`, me(meH / 120));
          if (fr > 0.25) {
            const y = groundY - (n + fr) * meH, hh = meH * 0.22, vw = meW * 1.4 + 20, vh = fr * meH + hh, vx = xc - 10, vy = y - hh;
            html += `<svg x="${vx}" y="${vy}" width="${vw}" height="${vh}" viewBox="${vx} ${vy} ${vw} ${vh}">` + g("m", `translate(${xc + meW * 0.2},${y})`, me(meH / 120)) + `</svg>`;
          }
        } else {
          const bw = Math.max(8, Math.min(34, meH * 0.5)), ix = xc + bw + 14;
          html = g("bar", `translate(${xc},${topY})`, `<rect width="${bw}" height="${I * s}" fill="${meH > 2.5 ? "url(#mepat)" : "var(--me)"}" class="barr"/>`) +
            `<defs><pattern id="mepat" width="${meW}" height="${meH}" patternUnits="userSpaceOnUse" patternTransform="translate(0,${(I * s) % meH})"><g transform="scale(${meH / 120})">${USE}</g></pattern></defs>` +
            `<g transform="translate(${ix},${groundY - 74})">${me(74 / 120)}</g>` + text(ix + 40, groundY - 80, "you,") + text(ix + 40, groundY - 62, "zoomed in!") +
            text(xc + bw / 2, topY - 10, "a LOT of you", "middle");
        }
      }
    } else {
      s = Math.min((W - 2 * pad) / I, availH);
      s = Math.min(s, (availH - gap - art.h * (I * s) / art.w) / (kid * 0.62));
      const meH = kid * s, u = (I * s) / art.w, artH = art.h * u, blockH = artH + gap + meH * 0.7;
      const x0 = (W - I * s) / 2, y0 = Math.max(10, (Hh - blockH) / 2), ry = y0 + artH + gap;
      out = artG(u, x0, y0 + artH) + `<path d="M${x0} ${y0 + 6} V${ry + meH * 0.55} M${x0 + I * s} ${y0 + 6} V${ry + meH * 0.55}" class="dash"/>`;
      const lying = (x) => g("m", `translate(${x + meH},${ry})`, `<g transform="rotate(90) scale(${meH / 120})">${USE}</g>`);
      if (meH >= 13) {
        const n = Math.floor(r), fr = r - n;
        for (let i = 0; i < n; i++) html += lying(x0 + i * meH);
        if (fr > 0.25) html += `<svg x="${x0 + n * meH}" y="${ry - meH * 0.3}" width="${fr * meH}" height="${meH}" viewBox="${x0 + n * meH} ${ry - meH * 0.3} ${fr * meH} ${meH}">` + lying(x0 + n * meH) + `</svg>`;
      } else {
        html = g("bar", `translate(${x0},${ry})`, `<rect width="${I * s}" height="${Math.max(10, meH * 0.6)}" fill="var(--me)" class="barr"/>`);
      }
    }
    st.querySelector("svg").innerHTML = `<g filter="url(#crayon)">${out}</g><g class="mes" filter="url(#wobble)">${html}</g>`;
    pg.mes = [...st.querySelectorAll(".m")]; pg.bar = st.querySelector(".bar"); pg.horiz = horiz;
    if (pg.bar) { pg.bar.style.transformBox = "fill-box"; pg.bar.style.transformOrigin = horiz ? "0% 50%" : "50% 100%"; }
    H.reset(pg);
  };

  H.reset = function (pg) {
    pg.token = (pg.token || 0) + 1;
    (pg.mes || []).forEach((m) => m.classList.remove("on"));
    if (pg.bar) pg.bar.style.transform = pg.horiz ? "scaleX(0)" : "scaleY(0)";
    if (pg.num) pg.num.textContent = "?";
    pg.stage.classList.remove("done");
  };

  H.play = function (pg) {
    H.reset(pg);
    const tk = pg.token, r = pg.r, it = pg.item, S = window.FunSound, final = H.fmt(r);
    const finish = () => {
      pg.num.textContent = final; pg.stage.classList.add("done");
      pg.mes.forEach((m) => m.classList.add("on"));
      if (pg.bar) pg.bar.style.transform = "none";
    };
    if (reduce()) return finish();
    if (r < 1 || pg.solo) {
      pg.num.textContent = final;
      setTimeout(() => { if (tk === pg.token) { finish(); if (S) { S.boing(); S.note(Math.round(Math.log10(it.m * 1000) * 2)); } } }, 250);
      return;
    }
    const dur = r <= 12 ? 500 + r * 150 : 1600 + Math.min(Math.log10(r) * 250, 1500);
    if (r > 60 && S) S.whoosh();
    const t0 = performance.now(); let lastShown = -1, lastTick = 0, idx = 0;
    (function step(now) {
      if (tk !== pg.token) return;
      const p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3), v = r * e;
      pg.mes.forEach((m, i) => { if (v >= i + 1) m.classList.add("on"); });
      if (pg.bar) pg.bar.style.transform = (pg.horiz ? "scaleX(" : "scaleY(") + e + ")";
      const shown = r < 10 ? Math.floor(v) : Math.round(v);
      if (shown !== lastShown && p < 1) {
        pg.num.textContent = shown.toLocaleString("en-US"); lastShown = shown;
        if (S && now - lastTick > 70) { lastTick = now; S.tone(260 + 520 * e + (idx++ % 3) * 40, { duration: 0.05, type: "square", volume: 0.06 }); }
      }
      if (p < 1) requestAnimationFrame(step);
      else { finish(); if (S) (it.snd === "boing" ? S.boing : S.ding)(); }
    })(t0);
  };
})();

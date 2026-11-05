/* How Many Me's? -- setup screen, journey, saving. */
(function () {
  "use strict";
  const H = window.HMM, $ = (id) => document.getElementById(id), KEY = "fun:how-many-mes:profile";
  const COLORS = [["Red", "#e8432e"], ["Orange", "#f2892b"], ["Yellow", "#f7c531"], ["Green", "#3aa356"], ["Blue", "#2f7fd6"], ["Pink", "#f27ba6"]];
  const SKINS = [["Lightest", "#ffe0c2"], ["Light", "#f5c49b"], ["Medium", "#d9a073"], ["Brown", "#a86f48"], ["Dark brown", "#6b4430"]];
  const HATS = [["No hat", "none"], ["Cap", "cap"], ["Party hat", "party"], ["Crown", "crown"], ["Beanie", "beanie"], ["Cat ears", "ears"]];
  let prof = { inches: 48, color: COLORS[0][1], skin: SKINS[1][1], hat: "none" };
  try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && s.inches >= 30 && s.inches <= 66) prof = Object.assign(prof, s); } catch (_) {}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(prof)); } catch (_) {} };
  const cm = (i) => Math.round(i * 2.54), label = (i) => Math.floor(i / 12) + "′ " + (i % 12) + "″";
  const kid = () => (prof.inches * 0.0254);
  let pages = [], active = -1, started = false;

  function paintMe() {
    $("me").innerHTML = H.meMarkup(prof.color, prof.skin, prof.hat);
    document.documentElement.style.setProperty("--me", prof.color);
    document.querySelectorAll(".hatb").forEach((b) => { b.firstChild.innerHTML = `<g class="art">${H.headMarkup(b.dataset.v, prof.skin)}</g>`; });
  }
  function paintHero() {
    const t = (prof.inches - 30) / 36, hero = $("hero"), fh = hero.clientHeight * (0.34 + 0.5 * t);
    $("heroFig").style.height = fh * 147 / 120 + "px";
    $("tag").style.bottom = 20 + fh + 14 + "px";
    $("tag").textContent = label(prof.inches) + " · " + cm(prof.inches) + " cm";
    $("readout").textContent = label(prof.inches) + "  =  " + cm(prof.inches) + " cm";
    $("height").value = prof.inches;
  }
  function pick(wrap, list, key, mk) {
    list.forEach(([name, v]) => {
      const b = document.createElement("button");
      b.type = "button"; b.setAttribute("aria-label", name); b.dataset.v = v;
      mk(b, v);
      b.addEventListener("click", () => { prof[key] = v; sync(); window.FunSound && FunSound.pop(); });
      $(wrap).appendChild(b);
    });
  }
  function sync() {
    document.querySelectorAll(".sw,.hatb").forEach((b) => {
      const key = b.parentNode.id === "colors" ? "color" : b.parentNode.id === "skins" ? "skin" : "hat";
      b.setAttribute("aria-pressed", String(prof[key] === b.dataset.v));
    });
    paintMe(); paintHero();
  }
  function buildSetup() {
    const sw = (b, v) => { b.className = "sw"; b.style.background = v; };
    pick("colors", COLORS, "color", sw); pick("skins", SKINS, "skin", sw);
    pick("hats", HATS, "hat", (b) => { b.className = "hatb"; b.innerHTML = '<svg viewBox="8 -26 44 62" aria-hidden="true"></svg>'; });
    const hs = $("height");
    hs.addEventListener("input", () => { prof.inches = +hs.value; paintHero(); window.FunSound && FunSound.tone(300 + prof.inches * 8, { duration: .06, type: "triangle", volume: .12 }); });
    hs.addEventListener("change", save);
    $("less").addEventListener("click", () => { prof.inches = Math.max(30, prof.inches - 1); paintHero(); save(); window.FunSound && FunSound.pop(); });
    $("more").addEventListener("click", () => { prof.inches = Math.min(66, prof.inches + 1); paintHero(); save(); window.FunSound && FunSound.pop(); });
    $("go").addEventListener("click", () => { save(); window.FunSound && FunSound.ding(); showJourney(); });
    sync();
  }

  function buildPages() {
    const track = $("track"); track.innerHTML = ""; pages = [];
    H.ITEMS.forEach((it, i) => {
      const sec = document.createElement("section");
      sec.className = "page"; sec.setAttribute("role", "group"); sec.setAttribute("aria-roledescription", "slide");
      sec.setAttribute("aria-label", (i + 1) + " of " + H.ITEMS.length + ": " + it.name);
      sec.innerHTML = '<h2 class="head"></h2><div class="stage"><span class="fun-tape"></span><svg role="img"></svg></div><p class="fact"><b>Fun fact!</b></p>';
      sec.querySelector("svg").setAttribute("aria-label", it.name + " next to little copies of you");
      sec.querySelector(".fact").append(it.fact);
      track.appendChild(sec);
      pages.push({ item: it, el: sec, stage: sec.querySelector(".stage"), num: { textContent: "" }, r: 1 });
    });
  }
  function headlines() {
    pages.forEach((pg) => {
      const r = pg.item.m / kid(), tpl = H.headline(pg.item, r), h = pg.el.querySelector(".head");
      const plain = tpl.replace("{N}", H.fmt(r));
      h.innerHTML = '<span class="vh" style="position:absolute;left:-9999px">' + plain + "</span><span aria-hidden=\"true\">" + tpl.replace("{N}", '<b class="num">?</b>') + "</span>";
      pg.num = h.querySelector(".num") || { textContent: "" };
    });
  }
  function layoutAll() { pages.forEach((pg) => H.layout(pg, kid())); if (active >= 0) H.play(pages[active]); }

  function setActive(i, quiet) {
    if (i === active) return;
    active = i;
    pages.forEach((pg, j) => { if (j !== i) H.reset(pg); });
    H.play(pages[i]);
    $("prev").disabled = i === 0;
    const last = i === pages.length - 1, nx = $("next");
    nx.innerHTML = last ? "&#8635;" : "&rarr;"; nx.setAttribute("aria-label", last ? "Back to the start" : "Next thing");
    $("proglab").textContent = (i + 1) + " of " + pages.length;
    $("mk").style.left = (6 + (88 * i) / (pages.length - 1)) + "%";
    $("prog").setAttribute("aria-valuenow", i + 1); $("prog").setAttribute("aria-valuemax", pages.length);
  }
  function go(i, smooth) {
    i = Math.max(0, Math.min(pages.length - 1, i));
    const tr = $("track"), reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    tr.scrollTo({ left: i * tr.clientWidth, behavior: smooth && !reduce ? "smooth" : "auto" });
    setActive(i);
    if (window.FunSound && smooth) FunSound.whoosh();
  }
  function showJourney() {
    $("setup").hidden = true; $("journey").hidden = false; $("change").hidden = false;
    if (!started) {
      buildPages(); started = true;
      const tr = $("track"); let raf = 0;
      tr.addEventListener("scroll", () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => setActive(Math.round(tr.scrollLeft / tr.clientWidth))); }, { passive: true });
      let wheelLock = 0;
      tr.addEventListener("wheel", (e) => {
        if (Math.abs(e.deltaY) <= Math.abs(e.deltaX) || Date.now() < wheelLock) { if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) e.preventDefault(); return; }
        e.preventDefault(); wheelLock = Date.now() + 550; go(active + (e.deltaY > 0 ? 1 : -1), true);
      }, { passive: false });
    }
    headlines(); active = -1; layoutAll(); $("track").scrollLeft = 0; setActive(0);
  }
  function showSetup() { $("journey").hidden = true; $("setup").hidden = false; $("change").hidden = true; active = -1; sync(); }

  document.addEventListener("keydown", (e) => {
    if ($("journey").hidden) return;
    if (e.key === "ArrowRight" || e.key === "PageDown") { e.preventDefault(); go(active + 1, true); }
    else if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); go(active - 1, true); }
    else if (e.key === "Home") go(0, true); else if (e.key === "End") go(pages.length - 1, true);
  });
  let rt = 0;
  window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => {
    if (!$("journey").hidden) { const a = active; layoutAll(); $("track").scrollLeft = a * $("track").clientWidth; } else paintHero();
  }, 150); });

  function init() {
    buildSetup();
    $("prev").addEventListener("click", () => go(active - 1, true));
    $("next").addEventListener("click", () => go(active === pages.length - 1 ? 0 : active + 1, true));
    $("change").addEventListener("click", showSetup);
    const mute = $("mute"), paintMute = () => { const m = window.FunSound && FunSound.muted; mute.firstChild.textContent = m ? "🔇" : "🔊"; mute.setAttribute("aria-label", m ? "Sound off" : "Sound on"); mute.setAttribute("aria-pressed", String(!!m)); };
    mute.addEventListener("click", () => { FunSound.setMuted(!FunSound.muted); paintMute(); FunSound.pop(); });
    paintMute();
    let had = false; try { had = !!localStorage.getItem(KEY); } catch (_) {}
    if (had) showJourney(); else paintHero();
  }
  function ready() { document.fonts && document.fonts.ready ? document.fonts.ready.then(init) : init(); }
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", ready) : ready();
})();

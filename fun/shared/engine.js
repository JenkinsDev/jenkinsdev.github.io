/*
 * FREE PLAY engine: the basics every game shares. Exposes window.FP.
 * Load after shared/sound.js. Spec: features/free-play-games/notes/engine.md
 *
 *   FP.layout     phone | tablet | desktop + portrait | landscape on <html data-layout data-orient>
 *   FP.shell()    standard top bar: ← Arcade, game name, sound button
 *   FP.screens    show one <section data-screen="…"> at a time
 *   FP.loop()     rAF loop with a time step, paused while the tab is hidden
 *   FP.animate()  one-off tween (respects reduced motion)
 *   FP.input      keyboard map + tap helper
 *   FP.store()    saved data (IndexedDB + in-memory copy); wait for FP.ready before reading
 *   FP.sfx        shared sounds
 *   FP.pixel      emoji → crisp pixel-art canvas
 */
(function () {
  "use strict";

  const FP = {};
  const root = document.documentElement;
  FP.reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- layout ----------
  const BREAKPOINTS = { tablet: 760, desktop: 1200 };
  const layoutSubs = new Set();
  function measure() {
    const w = innerWidth;
    const h = innerHeight;
    const size = w < BREAKPOINTS.tablet ? "phone" : w < BREAKPOINTS.desktop ? "tablet" : "desktop";
    return { size, orient: w >= h ? "landscape" : "portrait", w, h };
  }
  function applyLayout() {
    const l = measure();
    const changed = root.dataset.layout !== l.size || root.dataset.orient !== l.orient;
    FP.layout.current = l;
    root.dataset.layout = l.size;
    root.dataset.orient = l.orient;
    if (changed) layoutSubs.forEach((fn) => fn(l));
  }
  FP.layout = {
    current: null,
    breakpoints: BREAKPOINTS,
    on(fn) { layoutSubs.add(fn); fn(FP.layout.current); return () => layoutSubs.delete(fn); },
  };
  applyLayout();
  addEventListener("resize", applyLayout);
  addEventListener("orientationchange", applyLayout);

  // ---------- storage ----------
  // Saved data lives in IndexedDB (database "free-play", store "kv"). Everything is read into
  // memory once when the page opens (FP.ready), so FP.store(...).get() is instant; set() updates
  // memory and writes to IndexedDB in the background. Keys look like "higher-or-lower:best".
  const DB_NAME = "free-play";
  const DB_STORE = "kv";
  const cache = new Map();
  let db = null;
  let askedToPersist = false;

  const request = (req) => new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  const done = (tx) => new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = tx.onabort = () => reject(tx.error);
  });

  function openDb() {
    if (!window.indexedDB) return Promise.reject(new Error("IndexedDB unavailable"));
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(DB_STORE);
    return request(req);
  }

  async function loadAll() {
    const store = db.transaction(DB_STORE, "readonly").objectStore(DB_STORE);
    const [keys, values] = await Promise.all([request(store.getAllKeys()), request(store.getAll())]);
    keys.forEach((k, i) => cache.set(k, values[i]));
  }

  // One-time move of saves made before IndexedDB ("fun:…" keys in localStorage).
  // The old keys are only removed after IndexedDB confirms the write.
  async function migrateLocalStorage() {
    let found = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith("fun:")) found.push(k);
      }
    } catch (_) { return; }
    if (!found.length) return;
    const tx = db.transaction(DB_STORE, "readwrite");
    const store = tx.objectStore(DB_STORE);
    for (const k of found) {
      const raw = localStorage.getItem(k);
      const key = k === "fun:muted" ? "arcade:muted" : k.slice(4);
      let value;
      if (k === "fun:muted") value = raw === "1";
      else { try { value = JSON.parse(raw); } catch (_) { value = raw; } }
      if (!cache.has(key)) { cache.set(key, value); store.put(value, key); }
    }
    await done(tx);
    found.forEach((k) => localStorage.removeItem(k));
  }

  function write(key, value) {
    if (!db) return;
    try { db.transaction(DB_STORE, "readwrite").objectStore(DB_STORE).put(value, key); } catch (_) { /* keep playing */ }
    // The first real save asks the browser to keep our data instead of clearing it under storage pressure.
    if (!askedToPersist && navigator.storage && navigator.storage.persist) {
      askedToPersist = true;
      navigator.storage.persisted().then((yes) => yes || navigator.storage.persist()).catch(() => {});
    }
  }

  /** Resolves once saved data is loaded. Games start after this: FP.ready.then(start). */
  FP.ready = (async () => {
    try {
      db = await openDb();
      await loadAll();
      await migrateLocalStorage();
    } catch (_) {
      db = null; // no IndexedDB (rare): the game still works, it just won't remember anything
    }
    if (window.FunSound) window.FunSound.setMuted(cache.get("arcade:muted") === true);
  })();

  /** FP.store("higher-or-lower").get("best", {}) / .set("best", value) */
  FP.store = (slug) => ({
    get(k, fallback) {
      const key = slug + ":" + k;
      return cache.has(key) ? cache.get(key) : fallback;
    },
    set(k, value) {
      const key = slug + ":" + k;
      cache.set(key, value);
      write(key, value);
    },
  });

  // ---------- sound ----------
  const S = () => window.FunSound;
  const tone = (f, o) => S() && S().tone(f, o);
  FP.sfx = {
    move: () => tone(660, { duration: 0.05, type: "square", volume: 0.05 }),
    start: () => { tone(988, { duration: 0.08, type: "square", volume: 0.08 }); setTimeout(() => tone(1319, { duration: 0.3, type: "square", volume: 0.08 }), 80); },
    nope: () => tone(180, { duration: 0.15, type: "square", volume: 0.06 }),
    tick: () => tone(1800, { duration: 0.02, type: "square", volume: 0.025 }),
    right: () => { tone(784, { duration: 0.1, type: "square", volume: 0.07 }); setTimeout(() => tone(1175, { duration: 0.25, type: "square", volume: 0.07 }), 90); },
    wrong: () => tone(220, { duration: 0.45, type: "sawtooth", volume: 0.07, slideTo: 110 }),
  };

  // Pixel icons as SVG (8×8 grids), so they sit dead centre whatever fonts the device has.
  const ICONS = {
    back: ["...##...", "..##....", ".##.....", "########", "########", ".##.....", "..##....", "...##..."],
    sound: [".....#..", ".....##.", ".....#.#", ".....#..", ".....#..", "..####..", ".#####..", "..###..."],
    off: ["##....##", ".##..##.", "..####..", "...##...", "...##...", "..####..", ".##..##.", "##....##"],
  };
  FP.icon = (name) => `<svg class="fp-glyph" viewBox="0 0 8 8" aria-hidden="true" shape-rendering="crispEdges">${ICONS[name]
    .flatMap((row, y) => [...row].map((c, x) => (c === "#" ? `<rect x="${x}" y="${y}" width="1" height="1"/>` : ""))).join("")}</svg>`;

  /** Wire any button as the sound on/off toggle. The setting is saved for the whole arcade. */
  FP.muteButton = (btn) => {
    const sync = () => {
      const muted = S() ? S().muted : true;
      btn.setAttribute("aria-pressed", String(muted));
      btn.setAttribute("aria-label", muted ? "Sound off" : "Sound on");
      btn.innerHTML = FP.icon(muted ? "off" : "sound");
    };
    btn.addEventListener("click", () => {
      if (!S()) return;
      S().setMuted(!S().muted);
      FP.store("arcade").set("muted", S().muted);
      sync();
      FP.sfx.move();
    });
    sync();
    FP.ready.then(sync);
  };

  // ---------- shell ----------
  FP.shell = ({ title, back = "../" }) => {
    const bar = document.createElement("header");
    bar.className = "fp-bar";
    bar.innerHTML = `<a class="fp-icon" href="${back}" aria-label="Back to the arcade">${FP.icon("back")}</a>
      <span class="fp-bar-title"></span>
      <button class="fp-icon" type="button"></button>`;
    bar.querySelector(".fp-bar-title").textContent = title;
    FP.muteButton(bar.querySelector("button"));
    document.body.prepend(bar);
    return bar;
  };

  // ---------- screens ----------
  const screenSubs = new Set();
  FP.screens = {
    current: null,
    go(name) {
      document.querySelectorAll("[data-screen]").forEach((s) => { s.hidden = s.dataset.screen !== name; });
      FP.screens.current = name;
      const el = document.querySelector(`[data-screen="${name}"]`);
      const focusTarget = el && (el.querySelector("[data-autofocus]") || el.querySelector("h1, h2"));
      if (focusTarget) {
        if (!focusTarget.matches("button, a, [tabindex]")) focusTarget.tabIndex = -1;
        focusTarget.focus({ preventScroll: true });
      }
      screenSubs.forEach((fn) => fn(name));
    },
    on(fn) { screenSubs.add(fn); return () => screenSubs.delete(fn); },
  };

  // ---------- loop + tween ----------
  FP.loop = (update, draw) => {
    let raf = 0;
    let last = 0;
    let running = false;
    const frame = (t) => {
      const dt = Math.min((t - last) / 1000, 0.05); // cap the step after a stall
      last = t;
      update(dt, t);
      if (draw) draw(t);
      raf = requestAnimationFrame(frame);
    };
    const api = {
      start() { if (running) return; running = true; last = performance.now(); raf = requestAnimationFrame(frame); },
      stop() { running = false; cancelAnimationFrame(raf); },
      get running() { return running; },
    };
    document.addEventListener("visibilitychange", () => {
      if (document.hidden && running) { cancelAnimationFrame(raf); }
      else if (!document.hidden && running) { last = performance.now(); raf = requestAnimationFrame(frame); }
    });
    return api;
  };

  /** Run fn(p) with p going 0→1 (ease-out) over ms, then done(). Returns a cancel function. */
  FP.animate = (ms, fn, done) => {
    if (FP.reducedMotion || ms <= 0) { fn(1); if (done) done(); return () => {}; }
    const t0 = performance.now();
    let raf = 0;
    const step = (t) => {
      const p = Math.min(1, (t - t0) / ms);
      fn(1 - Math.pow(1 - p, 3));
      if (p < 1) raf = requestAnimationFrame(step);
      else if (done) done();
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  };

  // ---------- input ----------
  FP.input = {
    /** keys({ ArrowUp: fn, " ": fn }) → unbind. Ignores typing in form fields and held-key repeats.
     *  A handler that returns false didn't use the key, so the browser's default (e.g. scrolling) still happens. */
    keys(map) {
      const onKey = (e) => {
        if (e.repeat || e.metaKey || e.ctrlKey || e.altKey) return;
        if (e.target.closest && e.target.closest("input, textarea, select")) return;
        const fn = map[e.key];
        if (fn && fn(e) !== false) e.preventDefault();
      };
      document.addEventListener("keydown", onKey);
      return () => document.removeEventListener("keydown", onKey);
    },
    /** Tap/click handler. Buttons get touch-action: manipulation in crt.css, so there is no tap delay. */
    tap(el, fn) { el.addEventListener("click", fn); return () => el.removeEventListener("click", fn); },
  };

  // ---------- pixel art ----------
  const emojiCache = new Map();
  FP.pixel = {
    /** Draw an emoji into a size×size canvas; display it larger with image-rendering: pixelated. */
    emoji(char, size = 24) {
      const k = char + "@" + size;
      if (!emojiCache.has(k)) {
        const c = document.createElement("canvas");
        c.width = c.height = size;
        const g = c.getContext("2d");
        g.textAlign = "center";
        g.textBaseline = "middle";
        g.font = `${Math.round(size * 0.86)}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
        g.fillText(char, size / 2, size / 2 + size * 0.06);
        emojiCache.set(k, c);
      }
      const src = emojiCache.get(k);
      const copy = document.createElement("canvas");
      copy.width = copy.height = size;
      copy.getContext("2d").drawImage(src, 0, 0);
      copy.className = "fp-pixel";
      copy.setAttribute("aria-hidden", "true");
      return copy;
    },
  };

  window.FP = FP;
})();

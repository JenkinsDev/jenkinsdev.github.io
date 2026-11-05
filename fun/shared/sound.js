/*
 * FunSound — tiny WebAudio helper shared by every toy. No audio files.
 *
 *   FunSound.tone(440, { duration: 0.3, type: "sine", volume: 0.3 })
 *   FunSound.pop()   FunSound.ding()   FunSound.boing()   FunSound.whoosh()
 *   FunSound.note(i) — i-th note of a happy pentatonic scale (any integer)
 *   FunSound.muted / FunSound.setMuted(bool)  (saved by the engine: FP.muteButton / FP.ready)
 *
 * Browsers block audio until the first tap; FunSound unlocks itself on the
 * first pointerdown/keydown, so toys can call it freely.
 */
(function () {
  "use strict";

  let ctx = null;
  let master = null;
  let muted = false;
  const muteSubs = [];

  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || /** @type {any} */ (window)["webkitAudioContext"];
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.8;
      master.connect(ctx.destination);
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  // Browsers only allow audio after a tap or key press. Others (the music player) can wait for it.
  const unlockSubs = [];
  let unlocked = false;
  function unlock() {
    if (!ensure()) return;
    unlocked = true;
    window.removeEventListener("pointerdown", unlock, true);
    window.removeEventListener("keydown", unlock, true);
    unlockSubs.splice(0).forEach((fn) => fn());
  }
  window.addEventListener("pointerdown", unlock, true);
  window.addEventListener("keydown", unlock, true);
  // Most browsers only allow sound after a tap or key press on the page. Some (e.g. Firefox) can say
  // up front that it's already allowed; then start straight away. Others never tell, so we wait.
  try {
    if (navigator.getAutoplayPolicy && navigator.getAutoplayPolicy("audiocontext") === "allowed") unlock();
  } catch (_) { /* not supported: wait for the first tap */ }

  function tone(freq, opts) {
    if (muted) return;
    const c = ensure();
    if (!c) return;
    const o = Object.assign({ duration: 0.25, type: "sine", volume: 0.3, slideTo: null, attack: 0.01 }, opts);
    const t = c.currentTime;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = o.type;
    osc.frequency.setValueAtTime(freq, t);
    if (o.slideTo) osc.frequency.exponentialRampToValueAtTime(o.slideTo, t + o.duration);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(o.volume, t + o.attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + o.duration);
    osc.connect(gain).connect(master);
    osc.start(t);
    osc.stop(t + o.duration + 0.05);
  }

  // C major pentatonic, wraps across octaves for any integer index.
  const PENTA = [0, 2, 4, 7, 9];
  function note(i, opts) {
    const n = Math.floor(i);
    const octave = Math.floor(n / PENTA.length);
    const step = PENTA[((n % PENTA.length) + PENTA.length) % PENTA.length];
    const freq = 261.63 * Math.pow(2, octave + step / 12);
    tone(freq, Object.assign({ duration: 0.5, type: "triangle", volume: 0.25 }, opts));
  }

  // Short filtered noise burst: a plastic magnet clacking onto a fridge, paper rustle, etc.
  function noise(opts) {
    if (muted) return;
    const c = ensure();
    if (!c) return;
    const o = Object.assign({ duration: 0.05, freq: 2200, q: 1.2, volume: 0.5 }, opts);
    const len = Math.max(1, Math.floor(c.sampleRate * o.duration));
    const buf = c.createBuffer(1, len, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
    const src = c.createBufferSource();
    const filter = c.createBiquadFilter();
    const gain = c.createGain();
    src.buffer = buf;
    filter.type = "bandpass";
    filter.frequency.value = o.freq;
    filter.Q.value = o.q;
    gain.gain.value = o.volume;
    src.connect(filter).connect(gain).connect(master);
    src.start();
  }

  // Background music lives in shared/music.js; load it next to this file on every page that has sound.
  const here = document.currentScript && document.currentScript.src.replace(/[^/]*$/, "");
  const version = ((document.currentScript && document.currentScript.src.match(/\?.*$/)) || [""])[0];
  if (here && document.documentElement.dataset.music !== "off") {
    const el = document.createElement("script");
    el.src = here + "music.js" + version; // same ?v= as this file, so a deploy refreshes it too
    document.head.append(el);
  }

  window.FunSound = {
    tone,
    note,
    noise,
    clack: () => { noise({ duration: 0.04, freq: 1800 + Math.random() * 600, volume: 0.6 }); tone(220, { duration: 0.05, type: "square", volume: 0.04 }); },
    rustle: () => noise({ duration: 0.18, freq: 5200, q: 0.6, volume: 0.25 }),
    pop: () => tone(600 + Math.random() * 300, { duration: 0.12, type: "sine", slideTo: 1400, volume: 0.35 }),
    ding: () => { tone(1046.5, { duration: 0.6, type: "triangle" }); tone(1568, { duration: 0.8, type: "sine", volume: 0.12 }); },
    boing: () => tone(180, { duration: 0.4, type: "square", slideTo: 520, volume: 0.12 }),
    whoosh: () => tone(900, { duration: 0.35, type: "sawtooth", slideTo: 120, volume: 0.06 }),
    get muted() { return muted; },
    setMuted(v) { muted = !!v; muteSubs.forEach((fn) => fn(muted)); },
    /** The shared AudioContext and output, for the music player. Null until audio is unlocked. */
    audio: () => (unlocked && ctx ? { ctx, out: master } : null),
    onUnlock(fn) { if (unlocked) fn(); else unlockSubs.push(fn); },
    onMute(fn) { muteSubs.push(fn); },
  };
})();

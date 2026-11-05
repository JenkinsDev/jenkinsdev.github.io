/*
 * FunMusic: a tiny chiptune player in the spirit of old consoles: a pulse-wave melody, a triangle
 * bass and noise drums, all synthesized live (no audio files). Tunes live in shared/tracks.js.
 *
 * Loaded automatically by shared/sound.js; it loads tracks.js and plays this page's tune.
 *   FunMusic.play("quick-draw")   start a tune once audio is unlocked (after the first tap/key)
 *   FunMusic.stop()
 * It follows the arcade's sound toggle (FunSound.muted) and pauses while the tab is hidden.
 *
 * Tune format: { bpm, parts: { A: { lead, bass, drums }, … }, order: ["A", "A", "B", …] }
 * Each channel is space-separated "Note:steps" tokens in 16th-note steps (16 per bar):
 *   "E5:2 G5:2 R:4" (R = rest).  Drums use k (kick), s (snare), h (hat): "k:2 h:2 s:2 h:2".
 */
(function () {
  "use strict";

  const NOTE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  const LOOKAHEAD = 0.15; // seconds of notes scheduled ahead of time

  /** "A4" → 440 Hz. Accepts sharps (F#5) and flats (Bb4). */
  function freq(name) {
    const m = /^([A-G])([#b]?)(-?\d)$/.exec(name);
    if (!m) throw new Error(`Unknown note "${name}"`);
    const semis = NOTE[m[1]] + (m[2] === "#" ? 1 : m[2] === "b" ? -1 : 0) + (Number(m[3]) + 1) * 12;
    return 440 * Math.pow(2, (semis - 69) / 12);
  }

  /** Expand parts + order into one list of timed events per channel, checking every channel matches. */
  function compile(track) {
    const events = [];
    let length = null;
    for (const ch of ["lead", "bass", "drums"]) {
      let step = 0;
      for (const part of track.order) {
        const text = track.parts[part][ch];
        for (const tok of text.trim().split(/\s+/)) {
          const [name, len] = tok.split(":");
          const steps = Number(len);
          if (!steps) throw new Error(`Bad token "${tok}"`);
          if (name !== "R") {
            if (ch === "drums") { if (!"ksh".includes(name)) throw new Error(`Unknown drum "${name}"`); events.push({ ch, step, steps, drum: name }); }
            else events.push({ ch, step, steps, f: freq(name) });
          }
          step += steps;
        }
      }
      if (length === null) length = step;
      else if (step !== length) throw new Error(`Channel "${ch}" length ${step} ≠ ${length}: the loop would drift`);
    }
    return { length, events: events.sort((a, b) => a.step - b.step) };
  }

  // ---------- synthesis ----------
  let audio = null, bus = null, pulse = null, noiseBuf = null;
  function setup() {
    if (bus) return true;
    audio = window.FunSound && FunSound.audio();
    if (!audio) return false;
    const { ctx, out } = audio;
    bus = ctx.createGain();
    bus.gain.value = 0;
    bus.connect(out);
    // a 25% pulse wave, the classic thin console lead
    const n = 32, re = new Float32Array(n), im = new Float32Array(n);
    for (let k = 1; k < n; k++) im[k] = (2 / (k * Math.PI)) * Math.sin(k * Math.PI * 0.25);
    pulse = ctx.createPeriodicWave(re, im);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 0.3, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return true;
  }

  function voice(e, t, dur) {
    const { ctx } = audio;
    const g = ctx.createGain();
    g.connect(bus);
    if (e.ch === "drums") {
      if (e.drum === "k") {
        const o = ctx.createOscillator();
        o.frequency.setValueAtTime(150, t);
        o.frequency.exponentialRampToValueAtTime(45, t + 0.12);
        g.gain.setValueAtTime(0.5, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
        o.connect(g); o.start(t); o.stop(t + 0.15);
      } else {
        const src = ctx.createBufferSource(), f = ctx.createBiquadFilter();
        src.buffer = noiseBuf;
        f.type = e.drum === "h" ? "highpass" : "bandpass";
        f.frequency.value = e.drum === "h" ? 7000 : 1800;
        const len = e.drum === "h" ? 0.04 : 0.12;
        g.gain.setValueAtTime(e.drum === "h" ? 0.12 : 0.3, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + len);
        src.connect(f).connect(g); src.start(t); src.stop(t + len + 0.01);
      }
      return;
    }
    const o = ctx.createOscillator();
    if (e.ch === "lead") o.setPeriodicWave(pulse); else o.type = "triangle";
    o.frequency.setValueAtTime(e.f, t);
    const peak = e.ch === "lead" ? 0.13 : 0.22, end = t + dur * 0.92;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + 0.008);
    g.gain.setValueAtTime(peak * 0.75, t + Math.min(0.08, dur * 0.4));
    g.gain.exponentialRampToValueAtTime(0.0001, end);
    o.connect(g); o.start(t); o.stop(end + 0.02);
  }

  // ---------- scheduler ----------
  const state = { song: null, bpm: 120, step: 0, next: 0, idx: 0, timer: 0, key: null };

  function tick() {
    const { ctx } = audio, s = state, stepDur = 60 / s.bpm / 4;
    while (s.next < ctx.currentTime + LOOKAHEAD) {
      const ev = s.song.events;
      while (s.idx < ev.length && ev[s.idx].step === s.step) {
        const e = ev[s.idx++];
        if (!FunSound.muted) voice(e, s.next, e.steps * stepDur);
      }
      s.step += 1;
      s.next += stepDur;
      if (s.step >= s.song.length) { s.step = 0; s.idx = 0; }
    }
  }

  function begin() {
    if (!state.song || !setup()) return;
    const { ctx } = audio;
    clearInterval(state.timer);
    state.step = 0; state.idx = 0; state.next = ctx.currentTime + 0.1;
    bus.gain.cancelScheduledValues(ctx.currentTime);
    bus.gain.setValueAtTime(0, ctx.currentTime);
    bus.gain.linearRampToValueAtTime(FunSound.muted ? 0 : 0.55, ctx.currentTime + 1.2); // fade in
    state.timer = setInterval(tick, 25);
  }

  function play(key) {
    const track = FunMusic.TRACKS[key];
    if (!track || state.key === key) return;
    state.key = key;
    state.song = compile(track);
    state.bpm = track.bpm;
    if (window.FunSound) FunSound.onUnlock(begin);
  }

  function stop() {
    clearInterval(state.timer);
    state.key = null;
    if (bus) bus.gain.setValueAtTime(0, audio.ctx.currentTime);
  }

  if (window.FunSound && FunSound.onMute) {
    FunSound.onMute((m) => { if (bus) bus.gain.setTargetAtTime(m ? 0 : 0.55, audio.ctx.currentTime, 0.05); });
  }
  // hidden tab: stop scheduling (the clock keeps running, so restart cleanly on return)
  document.addEventListener("visibilitychange", () => {
    if (!state.key || !bus) return;
    if (document.hidden) clearInterval(state.timer);
    else begin();
  });

  window.FunMusic = { freq, compile, play, stop, TRACKS: {} };

  // Load the tunes, then play this page's: the hub's theme at /fun/, each game's own at /fun/<slug>/.
  const here = document.currentScript && document.currentScript.src.replace(/[^/]*$/, "");
  if (here && window.location) {
    const el = document.createElement("script");
    el.src = here + "tracks.js";
    el.onload = () => {
      const m = /\/fun\/([^/]+)\//.exec(location.pathname);
      const key = m && FunMusic.TRACKS[m[1]] ? m[1] : "hub";
      play(key);
    };
    document.head.append(el);
  }
})();

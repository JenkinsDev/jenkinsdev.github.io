// Unit tests for the chiptune player's tune format (shared/music.js + shared/tracks.js).
// Run: node --test tests/free-play/
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const ctx = { console, Math, setInterval: () => 0, clearInterval: () => {}, document: { addEventListener() {}, hidden: false } };
ctx.window = ctx;
vm.createContext(ctx);
for (const f of ["music.js", "tracks.js"]) vm.runInContext(readFileSync(new URL(`../../static/fun/shared/${f}`, import.meta.url), "utf8"), ctx);
const { FunMusic } = ctx;

test("note names become frequencies", () => {
  assert.equal(Math.round(FunMusic.freq("A4")), 440);
  assert.equal(Math.round(FunMusic.freq("C4")), 262);
  assert.equal(Math.round(FunMusic.freq("Bb4")), 466);
  assert.equal(Math.round(FunMusic.freq("F#5")), 740);
  assert.throws(() => FunMusic.freq("H4"), /note/);
});

test("there's a tune for the hub and for each built game", () => {
  for (const key of ["hub", "higher-or-lower", "quick-draw", "air-puck"]) assert.ok(FunMusic.TRACKS[key], `missing ${key}`);
});

test("every tune compiles, every channel loops at the same length, in whole bars", () => {
  for (const [key, track] of Object.entries(FunMusic.TRACKS)) {
    const song = FunMusic.compile(track); // throws on unknown notes or mismatched channel lengths
    assert.ok(song.length > 0 && song.length % 16 === 0, `${key}: ${song.length} steps is not whole bars`);
    assert.ok(song.events.some((e) => e.ch === "lead"), `${key}: no melody`);
    assert.ok(song.events.some((e) => e.ch === "bass"), `${key}: no bass`);
    assert.ok(song.events.some((e) => e.ch === "drums"), `${key}: no drums`);
    const seconds = (song.length * 60) / track.bpm / 4;
    assert.ok(seconds >= 20, `${key}: loop is only ${seconds.toFixed(0)} s; it'll get repetitive`);
  }
});

test("compile rejects channels that would drift out of sync", () => {
  const bad = { bpm: 120, parts: { A: { lead: "C5:16", bass: "C3:8", drums: "k:16" } }, order: ["A"] };
  assert.throws(() => FunMusic.compile(bad), /length/);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const ctx={window:{}};vm.createContext(ctx);
vm.runInContext(fs.readFileSync(new URL('../../static/fun/tilt/rules.js',import.meta.url),'utf8'),ctx);
const T=ctx.window.TL;
const plain=v=>JSON.parse(JSON.stringify(v));
function random(seed) {return ()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};}
for(let i=0;i<3;i++)test(`TILT tray ${i}: symmetric, both cups reachable, distinct choices`,()=>{
 const l=T.layouts[i];assert.deepEqual([...l.walls].sort((a,b)=>a-b),plain(l.walls.map(v=>35-v).sort((a,b)=>a-b)));
 assert.equal(l.starts[0]+l.starts[1],35);assert.equal(l.cups[0]+l.cups[1],35);
 const q=[T.create(i)],seen=new Set(),goals=[false,false];let choices=0;
 while(q.length){const s=q.pop(),key=s.positions.join();if(seen.has(key))continue;seen.add(key);
 const ends=new Set();for(const d of T.moves(s)){const r=T.roll(l,s.positions,d);ends.add(r.positions.join());
 assert.notEqual(r.positions[0],r.positions[1]);assert.ok(r.frames.length<=7);
 r.goals.forEach((v,p)=>{if(v)goals[p]=true;});q.push(T.advance(s,d));}
 if(ends.size>2)choices++;
 }
 assert.ok(goals.every(Boolean));assert.ok(choices>5);
});
test('TILT occupied cells and contested destinations block both safely',()=>{
 const l={walls:[],cups:[0,35]};
 assert.deepEqual(plain(T.roll(l,[0,1],1).positions),[4,5]);
 assert.deepEqual(plain(T.roll(l,[4,5],1).positions),[4,5]);
 const wall={walls:[2,8,14,20,26,32],cups:[0,35]};
 assert.deepEqual(plain(T.roll(wall,[0,1],1).positions),[0,1]);
});
test('TILT delivery credits the marble owner and resets both starts',()=>{
 const queue=[T.create(1)],seen=new Set();let s,d,r;
 search:while(queue.length){s=queue.shift();const key=s.positions.join();if(seen.has(key))continue;seen.add(key);
 for(d of T.moves(s)){r=T.roll(T.layouts[1],s.positions,d);if(r.goals.some(Boolean))break search;
 queue.push({...s,positions:r.positions});}}
 const n=T.advance(s,d);
 assert.ok(r.goals.some(Boolean));assert.deepEqual(plain(n.positions),plain(T.layouts[1].starts));
 assert.deepEqual(plain(n.scores),plain(r.goals));assert.equal(n.left,11);assert.equal(n.turn,1);
});
test('TILT matches always finish after twelve legal rolls',()=>{
 for(let l=0;l<3;l++)for(const level of T.LEVELS){let s=T.create(l);const rng=random(42);
 for(let i=0;i<12;i++){const d=T.choose(s,level,rng);assert.ok(T.moves(s).includes(d));s=T.advance(s,d);}
 assert.equal(s.left,0);}
});
test('TILT level tournament: stronger search earns more match points',()=>{
 const rng=random(1923);
 for(let a=0;a<3;a++) {let points=0;
 for(let k=0;k<120;k++){let s=T.create(k%3,k%2);
 while(s.left)s=T.advance(s,T.choose(s,T.LEVELS[s.turn?a+1:a],rng));
 points+=s.scores[1]>s.scores[0]?1:s.scores[1]===s.scores[0]?.5:0;}
 assert.ok(points>60,`${T.LEVELS[a+1]}: ${points}/120`);
 }
});
test('TILT equal-computer matches have small opening advantage',()=>{
 let points=0;const rng=random(906);
 for(let k=0;k<240;k++){let s=T.create(k%3,k%2),starter=s.turn;
 while(s.left)s=T.advance(s,T.choose(s,'hard',rng));
 points+=s.scores[starter]>s.scores[1-starter]?1:s.scores[0]===s.scores[1]?.5:0;}
 assert.ok(Math.abs(points/240-.5)<.12,`first player rate ${points/240}`);
});
test('TILT hub preview delivers, changes score and resets deterministically',()=>{
 let painted;
 const sandbox={window:{TL:T,TLRender:{paint:(g,s,o)=>{painted={s,o};}},FP_SCENES:{},FP_SCENE_SIZES:{},FP_SCENE_STILLS:{}}};
 Object.assign(sandbox,sandbox.window);vm.createContext(sandbox);
 vm.runInContext(fs.readFileSync(new URL('../../static/fun/tilt/preview.js',import.meta.url),'utf8'),sandbox);
 const scene=sandbox.window.FP_SCENES.tilt;
 scene({},3200);assert.equal(painted.s.scores[1],1);
 const first=plain(painted);scene.reset();scene({},3200);assert.deepEqual(plain(painted),first);
 assert.equal(sandbox.window.FP_SCENE_SIZES.tilt[0],192);
});

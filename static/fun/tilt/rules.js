/* Shared tray rules and public-information search. No browser dependencies. */
(function () {
  'use strict';
  const DIRS = [[0,-1],[1,0],[0,1],[-1,0]];
  const LEVELS = ['easy','medium','hard','impossible'];
  const layouts = [
    {name:'Crossgrain', walls:[8,9,13,22,26,27], starts:[30,5], cups:[11,24]},
    {name:'Side pockets', walls:[7,10,14,21,25,28], starts:[24,11], cups:[4,31]},
    {name:'Switchback', walls:[2,8,16,19,27,33], starts:[30,5], cups:[11,24]},
  ];
  function nextCell(layout, p, dir) {
    const x=p%6+DIRS[dir][0], y=Math.floor(p/6)+DIRS[dir][1];
    const n=y*6+x;
    return x<0||x>5||y<0||y>5||layout.walls.includes(n) ? p : n;
  }
  function roll(layout, positions, dir) {
    let p=positions.slice(); const frames=[p.slice()];
    for(let step=0;step<6;step++) {
      const n=p.map(v=>nextCell(layout,v,dir));
      if(n[0]===n[1]) break;
      // An occupied cell blocks this tick, even if its occupant moves away.
      for(let i=0;i<2;i++) if(n[i]===p[1-i]) n[i]=p[i];
      if(n[0]===p[0]&&n[1]===p[1]) break;
      p=n; frames.push(p.slice());
    }
    return {positions:p, frames, goals:p.map((v,i)=>Number(v===layout.cups[i]))};
  }
  function create(layout=0, starter=0, limit=12) {
    return {layout, positions:layouts[layout].starts.slice(), scores:[0,0], turn:starter, left:limit, history:[]};
  }
  function moves(s) {
    const l=layouts[s.layout];
    return [0,1,2,3].filter(d=>roll(l,s.positions,d).frames.length>1);
  }
  function advance(s,dir) {
    const r=roll(layouts[s.layout],s.positions,dir);
    return {...s, positions:r.goals.some(Boolean)?layouts[s.layout].starts.slice():r.positions,
      history:r.goals.some(Boolean)?[]:[...s.history,s.positions.join(',')],
      scores:s.scores.map((v,i)=>v+r.goals[i]), turn:1-s.turn,left:Math.max(0,s.left-1)};
  }
  const distances=new Map();
  function distance(layout, player, cell) {
    const key=layout+':'+player;
    if(!distances.has(key)) {
      const l=layouts[layout], ds=Array(36).fill(12); ds[l.cups[player]]=0;
      for(let k=0;k<12;k++) for(let p=0;p<36;p++) if(!l.walls.includes(p)) {
        for(let d=0;d<4;d++) { let n=p; for(let j=0;j<6;j++) n=nextCell(l,n,d); ds[p]=Math.min(ds[p],1+ds[n]); }
      }
      distances.set(key,ds);
    }
    return distances.get(key)[cell];
  }
  const routes=new Map();
  function routeDistance(s,player) {
    if(!routes.has(s.layout)) {
      const l=layouts[s.layout], reverse=new Map(), nodes=new Map(), q=[l.starts];
      while(q.length) {
        const p=q.pop(),key=p.join(',');if(nodes.has(key))continue;nodes.set(key,p);
        for(let d=0;d<4;d++) {const n=roll(l,p,d).positions,k=n.join(',');
          if(!reverse.has(k))reverse.set(k,[]);reverse.get(k).push(key);if(!nodes.has(k))q.push(n);}
      }
      const ds=[new Map(),new Map()];
      for(let i=0;i<2;i++) {
        const queue=[];for(const [key,p] of nodes)if(p[i]===l.cups[i]){ds[i].set(key,0);queue.push(key);}
        for(let j=0;j<queue.length;j++)for(const key of reverse.get(queue[j])||[])
          if(!ds[i].has(key)){ds[i].set(key,ds[i].get(queue[j])+1);queue.push(key);}
      }
      routes.set(s.layout,ds);
    }
    return routes.get(s.layout)[player].get(s.positions.join(','))??12;
  }
  function choose(s, level='medium', rng=Math.random) {
    const legal=moves(s); if(!legal.length) return 0;
    if(level==='easy'&&rng()<0.65) return legal[Math.floor(rng()*legal.length)];
    const me=s.turn, depth=Math.min(s.left, {easy:1,medium:1,hard:3,impossible:6}[level]||2), cache=new Map();
    function value(st,n) {
      const score=(st.scores[me]-st.scores[1-me])*100+(st.scores[0]+st.scores[1])*2;
      if(!st.left) return score;
      if(!n) return score+0.03*(routeDistance(st,1-me)-routeDistance(st,me));
      const key=[st.positions,st.scores,st.turn,st.left,n].join('/');
      if(cache.has(key)) return cache.get(key);
      const ds=moves(st); let best=st.turn===me?-Infinity:Infinity;
      for(const d of ds.length?ds:[0]) {
        const v=value(advance(st,d),n-1);
        best=st.turn===me?Math.max(best,v):Math.min(best,v);
      }
      cache.set(key,best); return best;
    }
    let best=-Infinity, picks=[];
    for(const d of legal) {
      const next=advance(s,d);
      const v=value(next,depth-1)-(s.history.includes(next.positions.join(','))?0.1:0);
      if(v>best) { best=v;picks=[d]; } else if(v===best) picks.push(d);
    }
    // Shallower levels sometimes explore another legal route.
    const explore={easy:0,medium:0.22,hard:0.06,impossible:0}[level]||0;
    if(explore&&rng()<explore)return legal[Math.floor(rng()*legal.length)];
    return picks[Math.floor(rng()*picks.length)];
  }
  window.TL={DIRS,LEVELS,layouts,nextCell,roll,create,moves,advance,distance,choose};
})();

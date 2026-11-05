/* Deterministic computer match, drawn at any requested time. */
(function () {
  'use strict';
  let story=null;
  function build() {
    let seed=6;const rng=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
    let s=TL.create(0);const turns=[];
    while(s.left) {
      const dir=TL.choose(s,'easy',rng),r=TL.roll(TL.layouts[s.layout],s.positions,dir),next=TL.advance(s,dir);
      turns.push({s,dir,r,next});s=next;
      if(turns.length>=3&&s.scores.some(Boolean))break;
    }
    return turns;
  }
  window.FP_SCENES.tilt=(g,t)=>{
    if(!story)story=build();
    const turn=story[Math.floor(t/1800)%story.length],ms=t%1800;
    const p=Math.max(0,Math.min(1,(ms-450)/650));
    const state=ms>1300?turn.next:turn.s;
    const opts=ms>1300?{}:{positions:TLRender.interpolate(turn.r.frames,p),tip:TL.DIRS[turn.dir].map(v=>v*Math.sin(p*Math.PI)),sink:p===1?turn.r.goals:null};
    TLRender.paint(g,state,opts);
  };
  window.FP_SCENES.tilt.reset=()=>{story=null;};
  window.FP_SCENE_SIZES.tilt=[192,192];
  window.FP_SCENE_STILLS.tilt=3200;
})();

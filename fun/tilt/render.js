/* Low-resolution wooden tray, shared by the game and hub preview. */
(function () {
  'use strict';
  const colors=['#ff3d3d','#2c7bff'];
  function paint(g,s,opts={}) {
    const w=g.canvas.width,h=g.canvas.height, size=Math.min(w-20,h-20), cell=Math.floor((size-16)/6);
    const side=cell*6, x=Math.floor((w-side)/2),y=Math.floor((h-side)/2);
    const rect=(c,a,b,d,e)=>{g.fillStyle=c;g.fillRect(Math.round(a),Math.round(b),d,e);};
    rect('#101525',0,0,w,h); g.save();
    const tip=opts.tip||[0,0]; g.translate(tip[0]*2,tip[1]*2);
    rect('#05070d',x-8+tip[0],y-4+tip[1],side+16,side+18);
    rect('#6b3f28',x-8,y-8,side+16,side+16);
    rect('#d4a36b',x-8,y-8,side+16,3);rect('#a77146',x-8,y-5,3,side+13);
    rect('#50301f',x-5,y-5,side+10,side+10);
    const l=TL.layouts[s.layout];
    for(let p=0;p<36;p++) {
      const a=x+p%6*cell,b=y+Math.floor(p/6)*cell;
      rect((p+Math.floor(p/6))%2?'#b48a58':'#bc9462',a,b,cell,cell);
      for(let j=3;j<cell;j+=6) rect('#a87e50',a+2,b+j,cell-4,1);
      if(l.walls.includes(p)) {
        rect('#533c2e',a,b+3,cell,cell-1);rect('#d2b084',a,b,cell,cell-3);
        rect('#ead0a1',a,b,cell,2);rect('#a17b52',a+cell-3,b+2,3,cell-4);
      }
    }
    function disk(p,r,c) {
      const a=x+(p%6+.5)*cell,b=y+(Math.floor(p/6)+.5)*cell;
      g.fillStyle=c;g.beginPath();g.arc(Math.round(a),Math.round(b),r,0,Math.PI*2);g.fill(); return [a,b];
    }
    l.starts.forEach((p,i)=>{const [a,b]=disk(p,cell*.28,'#8f704c');g.strokeStyle=colors[i];g.strokeRect(a-3,b-3,6,6);});
    l.cups.forEach((p,i)=>{
      disk(p,cell*.4,colors[i]); const [a,b]=disk(p,cell*.29,'#17121a');
      rect('#ffffff',a-1,b-3,2,6);if(i) rect('#ffffff',a+3,b-3,2,6);
    });
    if(opts.preview) opts.preview.positions.forEach((p,i)=>{
      const [a,b]=disk(p,cell*.33,'#493b38');g.strokeStyle=colors[i];g.lineWidth=2;
      g.strokeRect(a-cell*.33,b-cell*.33,cell*.66,cell*.66);
    });
    const pos=opts.positions||s.positions;
    pos.forEach((p,i)=>{
      // Fractional cell coordinates come from the lockstep roll animation.
      const v=Array.isArray(p)?p:[p%6,Math.floor(p/6)];
      const a=x+(v[0]+.5)*cell,b=y+(v[1]+.5)*cell,r=cell*.29*(opts.sink?.[i]?0.5:1);
      g.fillStyle='#60452d';g.beginPath();g.arc(Math.round(a+1),Math.round(b+3),r+1,0,7);g.fill();
      g.fillStyle=i?'#15428e':'#8d222c';g.beginPath();g.arc(Math.round(a),Math.round(b),r,0,7);g.fill();
      g.fillStyle=colors[i];g.beginPath();g.arc(Math.round(a-1),Math.round(b-1),r*.83,0,7);g.fill();
      rect('#fff5dc',a-r*.5,b-r*.55,3,2);rect(i?'#a6d5ff':'#ffb5a0',a-1,b-1,2,2);
      rect('#fff',a-1,b+2,1,2); if(i)rect('#fff',a+2,b+2,1,2);
    });
    // Brass pegs count deliveries without a text overlay in the hub scene.
    s.scores.forEach((n,i)=>{for(let j=0;j<Math.min(n,12);j++)rect(colors[i],x+j*5,y+side+4+i*2,3,2);});
    g.restore();
  }
  function interpolate(frames,p) {
    const t=Math.min(frames.length-1,p*(frames.length-1)),k=Math.floor(t),b=frames[Math.min(k+1,frames.length-1)],a=frames[k];
    return a.map((v,i)=>[v%6+(b[i]%6-v%6)*(t-k),Math.floor(v/6)+(Math.floor(b[i]/6)-Math.floor(v/6))*(t-k)]);
  }
  window.TLRender={paint,interpolate};
})();

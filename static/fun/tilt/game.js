(function () {
  'use strict';
  const $=id=>document.getElementById(id), colors=['#ff3d3d','#2c7bff'];
  const labels=['Up','Right','Down','Left'];
  const store=FP.store('tilt');
  let mode='1p',level='medium',layout=0,starter=0,s=null,phase='idle',selected=null,preview=null;
  let elapsed=0, animation=null,cpuWait=0;
  const g=$('scene').getContext('2d');
  FP.shell({title:'TILT!'});
  const names=()=>mode==='1p'?['You','Computer']:['Player 1','Player 2'];
  const human=()=>s && !(mode==='1p'&&s.turn===1);
  const active=()=>phase==='choose'&&human();
  function setupUI() {
    for(const [id,value] of [['modes',mode],['levels',level],['layouts',String(layout)]])
      $(id).querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.value===value)));
    $('level-option').hidden=mode!=='1p';
    $('mode-rule').textContent=mode==='1p'?'You and the computer take turns.':'Player 1 and Player 2 take turns.';
    FP.controlCards($('control-cards'),mode==='1p'?
      [{who:'You',how:'Choose a direction, then tap ROLL.',keys:[['Arrows','Enter']]}]:
      [{who:'Player 1',how:'Choose a direction, then tap ROLL.',keys:[['W','A','S','D','Space']]},
       {who:'Player 2',how:'Choose a direction, then tap ROLL.',keys:[['Arrows','Enter']]}]);
  }
  TL.layouts.forEach((l,i)=>{const b=document.createElement('button');b.className='chip';b.dataset.value=i;b.textContent=l.name;$('layouts').append(b);});
  for(const id of ['modes','levels','layouts']) $(id).addEventListener('click',e=>{
    const b=e.target.closest('button');if(!b)return;
    if(id==='modes')mode=b.dataset.value;else if(id==='levels')level=b.dataset.value;else layout=Number(b.dataset.value);
    store.set(id,b.dataset.value);setupUI();FP.sfx.move();
  });
  labels.forEach((label,d)=>{
    const b=document.createElement('button');b.className='direction';b.dataset.dir=d;b.setAttribute('aria-label',label);
    b.innerHTML=`<svg viewBox="0 0 24 24" aria-hidden="true" style="transform:rotate(${d*90}deg)"><path d="M10 21V9H4l8-8 8 8h-6v12z"/></svg>`;
    FP.input.tap(b,()=>select(d));$('directions').append(b);
  });
  function updateUI() {
    document.querySelector('main').style.setProperty('--player',colors[s.turn]);
    names().forEach((name,i)=>{
      $('score'+i).innerHTML=`${name}<b>${s.scores[i]}</b>`;
      $('score'+i).style.setProperty('--player',colors[i]);$('score'+i).classList.toggle('active',s.turn===i);
    });
    $('turns').textContent=`Turn ${13-s.left} / 12`;
    $('banner').textContent=phase==='roll'?'Rolling…':mode==='1p'?(s.turn===0?'Your turn':"Computer's turn"):`Player ${s.turn+1}'s turn`;
    $('control-owner').textContent=mode==='1p'?(s.turn===0?'Your controls':'Computer is choosing'):names()[s.turn]+' controls';
    const legal=TL.moves(s);
    $('directions').querySelectorAll('button').forEach((b,d)=>{b.disabled=!active()||!legal.includes(d);b.setAttribute('aria-pressed',String(selected===d));});
    $('roll').disabled=!active()||selected===null;
    $('preview').textContent=preview?`${labels[selected]}: ${preview.goals.some(Boolean)?preview.goals.map((v,i)=>v?names()[i]+' scores':'').filter(Boolean).join(', '):'Outlined squares show both stops.'}`:'Choose a direction to see both stops.';
    const positions=preview?preview.positions:s.positions;
    $('scene').setAttribute('aria-label',positions.map((p,i)=>`${names()[i]} ${preview?'will stop at':'at'} row ${Math.floor(p/6)+1}, column ${p%6+1}`).join('. '));
  }
  function select(d) {
    if(!active()||!TL.moves(s).includes(d))return;
    selected=d;preview=TL.roll(TL.layouts[s.layout],s.positions,d);FP.sfx.move();updateUI();
  }
  function nextTurn() {
    selected=null;preview=null;animation=null;elapsed=0;phase='choose';cpuWait=0;
    if(!s.left) {
      phase='over';loop.stop();
      $('result').textContent=s.scores[0]===s.scores[1]?'Tie':names()[s.scores[0]>s.scores[1]?0:1]+(mode==='1p'&&s.scores[0]>s.scores[1]?' win':' wins');
      $('final-score').textContent=`${s.scores[0]} : ${s.scores[1]}`;FP.screens.go('over');return;
    }
    updateUI();
  }
  function roll() {
    if(phase!=='choose'||selected===null)return;
    animation=TL.roll(TL.layouts[s.layout],s.positions,selected);preview=null;phase='roll';elapsed=0;updateUI();
  }
  function start() {
    s=TL.create(layout,starter);starter=1-starter;store.set('starter',starter);
    FP.screens.go('play');nextTurn();loop.start();FP.sfx.start();
  }
  const loop=FP.loop(dt=>{
    if(phase==='choose'&&!human()) {
      cpuWait+=dt;
      if(selected===null&&cpuWait>.45) {selected=TL.choose(s,level);preview=TL.roll(TL.layouts[s.layout],s.positions,selected);updateUI();}
      if(cpuWait>1.15)roll();
    } else if(phase==='roll') {
      elapsed+=dt;
      if(elapsed>(FP.reducedMotion?.12:.7)) {
        s=TL.advance(s,selected);FunSound.clack();
        if(animation.goals.some(Boolean))FP.sfx.right();nextTurn();
      }
    }
  },()=>{
    let opts={preview};
    if(animation) {
      const p=Math.min(1,elapsed/(FP.reducedMotion?.05:.5));
      opts={positions:TLRender.interpolate(animation.frames,p),tip:FP.reducedMotion?[0,0]:TL.DIRS[selected].map(v=>v*Math.sin(p*Math.PI)),sink:p===1?animation.goals:null};
    }
    TLRender.paint(g,s,opts);
  });
  FP.input.tap($('roll'),()=>{if(active())roll();});
  FP.input.tap($('play'),start);FP.input.tap($('rematch'),start);
  function setup(){loop.stop();phase='idle';FP.screens.go('title');setupUI();}
  FP.input.tap($('setup'),setup);FP.input.tap($('leave'),setup);
  const keys={};
  for(const [key,d] of Object.entries({ArrowUp:0,ArrowRight:1,ArrowDown:2,ArrowLeft:3,w:0,d:1,s:2,a:3,W:0,D:1,S:2,A:3})) keys[key]=()=>{
    if(!active()||(mode==='2p'&&(key.startsWith('Arrow')?s.turn!==1:s.turn!==0)))return false;select(d);
  };
  for(const key of ['Enter',' '])keys[key]=()=>{
    if(!active()||(mode==='2p'&&(key==='Enter'?s.turn!==1:s.turn!==0)))return false;roll();
  };
  FP.input.keys(keys);
  FP.ready.then(()=>{
    mode=['1p','2p'].includes(store.get('modes'))?store.get('modes'):'1p';
    level=TL.LEVELS.includes(store.get('levels'))?store.get('levels'):'medium';
    layout=Number(store.get('layouts',0));if(!TL.layouts[layout])layout=0;
    starter=Number(store.get('starter',0))===1?1:0;setup();
  });
})();

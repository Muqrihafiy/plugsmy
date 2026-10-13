(() => {
  const game = document.querySelector('.dust-game');
  if (!game) return;
  function initialize() {
    const canvas = game.querySelector('canvas');
    const ctx = canvas.getContext('2d');
    const mask = document.createElement('canvas');
    mask.width = 720; mask.height = 360;
    const coverage = mask.getContext('2d', { willReadFrequently: true });
    const percent = game.querySelector('.dust-percent');
    const meter = game.querySelector('progress');
    const message = game.querySelector('.dust-message');
    const finish = game.querySelector('.dust-finish');
    const book = game.querySelector('.dust-book');
    const artwork = game.querySelector('.dust-board svg');
    const desktop = artwork.innerHTML;
    const laptop = `<rect width="720" height="360" fill="#162635"/><ellipse cx="360" cy="306" rx="243" ry="18" fill="#0b151f"/><rect x="190" y="39" width="340" height="214" rx="12" fill="#344e61" stroke="#8099aa" stroke-width="4"/><rect x="207" y="55" width="306" height="180" rx="3" fill="#0a1620"/><circle cx="360" cy="47" r="3" fill="#adbcbe"/><path d="m241 112 35 28-35 28m56 0h54" fill="none" stroke="#cbf466" stroke-width="9"/><path d="M190 254h340l72 48q-242 25-484 0z" fill="#7692a2"/><path d="M211 261h298l32 20H180z" fill="#263e4d"/><path d="M310 286h100l8 13H302z" fill="#a8bac4"/><path d="M118 302q242 25 484 0v10q-242 20-484 0z" fill="#405d70"/>`;
    let keys = '';
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 14; col++) {
        const x = 137 + col * 32, y = 117 + row * 32;
        keys += `<rect x="${x}" y="${y}" width="26" height="25" rx="3" fill="${col < 3 ? '#a9c977' : '#3b5869'}" stroke="#7893a2"/><path d="M${x+8} ${y+9}h9" stroke="#d2dedf" stroke-width="2"/>`;
      }
    }
    const keyboardArt = `<rect width="720" height="360" fill="#162635"/><ellipse cx="360" cy="283" rx="265" ry="20" fill="#0b151f"/><path d="M360 90V50q0-18 24-18h63" fill="none" stroke="#7c95a5" stroke-width="5"/><rect x="112" y="93" width="496" height="178" rx="12" fill="#253d4f" stroke="#839dad" stroke-width="4"/>${keys}<rect x="137" y="245" width="59" height="16" rx="3" fill="#3b5869"/><rect x="208" y="245" width="247" height="16" rx="3" fill="#b9d68c"/><rect x="467" y="245" width="117" height="16" rx="3" fill="#3b5869"/>`;
    const objects = [{name:'desktop PC', art:desktop}, {name:'laptop', art:laptop}, {name:'keyboard', art:keyboardArt}];
    let pointer = null, last = null, complete = false, sampleAt = 0;
    let keyboard = {x:360,y:180}, space = false;
    function reset() {
      if (pointer !== null && canvas.hasPointerCapture(pointer)) canvas.releasePointerCapture(pointer);
      pointer = null; last = null; space = false; complete = false; sampleAt = 0;
      keyboard = {x:360,y:180};
      const object = objects[Math.floor(Math.random() * objects.length)];
      artwork.innerHTML = object.art;
      canvas.setAttribute('aria-label', `Dusty ${object.name}. Drag to wipe, or use arrow keys and hold Space to clean.`);
      canvas.style.opacity = '1';
      ctx.globalCompositeOperation = 'source-over';
      ctx.clearRect(0,0,720,360);
      ctx.fillStyle = '#b7a082'; ctx.fillRect(0,0,720,360);
      for (let i=0;i<1600;i++) {
        ctx.fillStyle = i % 2 ? '#d7c6a0' : '#857660';
        ctx.beginPath(); ctx.arc(Math.random()*720,Math.random()*360,Math.random()*3+.4,0,Math.PI*2); ctx.fill();
      }
      coverage.globalCompositeOperation = 'source-over';
      coverage.fillStyle = '#000'; coverage.fillRect(0,0,720,360);
      meter.value=0; meter.textContent='0%'; percent.textContent='0%';
      message.textContent=''; finish.hidden=true; book.hidden=true;
    }
    function point(event) {
      const rect=canvas.getBoundingClientRect();
      return {x:(event.clientX-rect.left)*720/rect.width,y:(event.clientY-rect.top)*360/rect.height};
    }
    function wipe(from,to,force=false) {
      if (complete) return;
      [ctx,coverage].forEach(context => {
        context.globalCompositeOperation='destination-out';
        context.lineWidth=62; context.lineCap='round'; context.lineJoin='round';
        context.beginPath(); context.moveTo(from.x,from.y); context.lineTo(to.x,to.y); context.stroke();
        context.beginPath(); context.arc(to.x,to.y,31,0,Math.PI*2); context.fill();
      });
      if (!force && performance.now()-sampleAt<160) return;
      sampleAt=performance.now();
      const data=coverage.getImageData(0,0,720,360).data;
      let clear=0,total=0;
      for(let y=0;y<360;y+=8) for(let x=0;x<720;x+=8) {total++; if(data[(y*720+x)*4+3]<100) clear++;}
      const value=Math.round(clear/total*100);
      meter.value=value; meter.textContent=`${value}%`; percent.textContent=`${value}%`;
      if(value>=90) {
        complete=true; ctx.clearRect(0,0,720,360); meter.value=100; meter.textContent='100%'; percent.textContent='100%';
        message.textContent='All clean. Ready for a fresh start!'; finish.hidden=false; book.hidden=false;
      }
    }
    canvas.addEventListener('pointerdown',event => {
      if (complete || pointer!==null) return;
      if (event.pointerType==='mouse' && event.button!==0) return;
      pointer=event.pointerId; canvas.setPointerCapture(pointer); last=point(event); wipe(last,last,true);
    });
    canvas.addEventListener('pointermove',event => {
      if(event.pointerId!==pointer || !last) return;
      const next=point(event); wipe(last,next); last=next;
    });
    const release=event => {
      if(event.pointerId!==pointer) return;
      if(last) wipe(last,last,true);
      pointer=null; last=null;
    };
    canvas.addEventListener('pointerup',release);
    canvas.addEventListener('pointercancel',release);
    canvas.addEventListener('lostpointercapture',release);
    canvas.addEventListener('keydown',event => {
      if(event.code==='Space') {event.preventDefault(); space=true; wipe(keyboard,keyboard,true); return;}
      const directions={ArrowLeft:[-20,0],ArrowRight:[20,0],ArrowUp:[0,-20],ArrowDown:[0,20]};
      const direction=directions[event.key]; if(!direction) return;
      event.preventDefault(); const previous={...keyboard};
      keyboard.x=Math.max(0,Math.min(720,keyboard.x+direction[0])); keyboard.y=Math.max(0,Math.min(360,keyboard.y+direction[1]));
      if(space) wipe(previous,keyboard,true);
      canvas.setAttribute('aria-label',`Dusty desktop PC. Brush at ${Math.round(keyboard.x/720*100)}% across, ${Math.round(keyboard.y/360*100)}% down. Hold Space and use arrows to clean.`);
    });
    canvas.addEventListener('keyup',event => {if(event.code==='Space') space=false;});
    canvas.addEventListener('blur',()=>{space=false;});
    game.querySelector('.dust-reset').addEventListener('click',reset);
    reset();
  }
  initialize();
})();

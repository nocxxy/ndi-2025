(() => {
  const COLUMNS = 3;
  const SPAWN_BASE_INTERVAL = 1000;
  const FALL_SPEED_BASE = 120;
  const LIVES_MAX = 3;
  const MAX_SCORE = 10000;
  const ERROR_CODES = ["301","302","307","308","400","401","403","404","405","408","429","500","501","502","503","504"];
  const HTTP_METHODS = ["GET","POST","DELETE","PUT","PATCH"];

  const stage = document.getElementById('stage');
  const limitLine = document.getElementById('limitLine');
  const scoreEl = document.getElementById('score');
  const livesEl = document.getElementById('lives');
  const speedEl = document.getElementById('speed');
  const startBtn = document.getElementById('startBtn');
  const pauseBtn = document.getElementById('pauseBtn');
  const overlay = document.getElementById('overlay');
  const overlayText = document.getElementById('overlayText');
  const overlayRestart = document.getElementById('overlayRestart');

  let cols = Array.from(stage.querySelectorAll('.column'));
  let limitSegments = Array.from(limitLine.querySelectorAll('.limit-segment'));
  let tiles = [];
  let lastFrame = null;
  let running = false;
  let spawnTimer = 0;
  let spawnInterval = SPAWN_BASE_INTERVAL;
  let fallSpeedMul = 1.0;
  let score = 0;
  let lives = LIVES_MAX;
  let paused = false;

  const HIT_WINDOW = 36;
  const MISS_THRESHOLD = 48;
  let limitY;

  function resetState(){
    tiles.forEach(t => t.dom.remove());
    tiles = [];
    spawnTimer = 0;
    spawnInterval = SPAWN_BASE_INTERVAL;
    fallSpeedMul = 1.0;
    score = 0;
    lives = LIVES_MAX;
    updateHUD();
    hideOverlay();
  }

  function updateHUD(){
    scoreEl.textContent = score;
    livesEl.innerHTML = '❤️'.repeat(lives);
    speedEl.textContent = fallSpeedMul.toFixed(2) + "x";
  }

  function showOverlay(text){
    overlayText.textContent = text;
    overlay.style.display = 'flex';
  }
  function hideOverlay(){ overlay.style.display = 'none'; }

  function spawnTile(){
    const colIndex = Math.floor(Math.random()*COLUMNS);
    const code = ERROR_CODES[Math.floor(Math.random()*ERROR_CODES.length)];
    const method = HTTP_METHODS[Math.floor(Math.random()*HTTP_METHODS.length)];
    const severity = code.startsWith("5") ? 'error-5xx' : (code.startsWith("4") ? 'error-4xx' : 'error-3xx');

    const col = cols[colIndex];
    const dom = document.createElement('div');
    dom.className = `tile ${severity}`;
    dom.innerHTML = `${method} ${code}`;
    stage.appendChild(dom);

    dom.style.left = `${col.offsetLeft}px`;
    dom.style.width = `${col.clientWidth}px`;
    dom.style.top = '0px';

    const tile = { dom, colIndex, code, y:0, height: dom.clientHeight || 40, hit:false };
    tiles.push(tile);
  }

  function limitFlash(colIndex){
    const seg = limitSegments[colIndex];
    if(!seg) return;

    const newSeg = seg.cloneNode(true);
    seg.parentNode.replaceChild(newSeg, seg);

    newSeg.classList.add('limit-flash');

    limitSegments[colIndex] = newSeg;
  }

  function flashKeyOverlay(colIndex){
    const key = document.querySelector(`.key-overlay .key[data-key="${colIndex}"]`);
    if(!key) return;
    key.classList.add('active');
    setTimeout(()=>key.classList.remove('active'), 200);
  }

  function lifeLostAnim(colIndex){
    stage.classList.add('shake');
    setTimeout(()=>stage.classList.remove('shake'),500);

    if(colIndex!==undefined){
      const seg = limitSegments[colIndex];
      if(seg){
        seg.classList.remove('miss-flash');
        void seg.offsetWidth;
        seg.classList.add('miss-flash');
      }
    }

    if(navigator.vibrate) navigator.vibrate([80,40,120]);
    new Audio('sounds/miss.mp3').play();
  }

  function gameOver(){ running=false; showOverlay("💥 Le serveur a succombé aux erreurs !"); }
  function gameWin(){ running=false; showOverlay("🎉 Serveur protégé ! Bravo !"); }

  function onKeyPress(colIndex){
    const colTiles = tiles.filter(t => t.colIndex===colIndex && !t.hit);
    if(colTiles.length===0) return;

    limitFlash(colIndex);
    flashKeyOverlay(colIndex);

    let best = null, bestDist = Infinity;
    for(const t of colTiles){
      const tileCenterY = t.y + t.height/2;
      const dist = Math.abs(tileCenterY - limitY);
      if(dist<bestDist){ bestDist=dist; best=t; }
    }
    if(!best) return;

    const dist = Math.abs(best.y + best.height/2 - limitY);
    if(dist<=HIT_WINDOW){
      best.hit=true;
      const points = Math.max(1,Math.round((HIT_WINDOW-dist)/HIT_WINDOW*100));
      score+=points;
      showPop(best.dom,`+${points}`);
      best.dom.style.setProperty('--ty',`${best.y}px`);
      best.dom.classList.add('hit-anim');
      setTimeout(()=>best.dom.remove(),260);
      tiles=tiles.filter(t=>t!==best);

      fallSpeedMul=Math.min(3,fallSpeedMul+0.015);
      spawnInterval=Math.max(380,SPAWN_BASE_INTERVAL*(1/(1+score/800)));
      updateHUD();

      // SON HIT
      new Audio('sounds/hit.mp3').play();
    } else {
      spawnInterval=Math.max(380,SPAWN_BASE_INTERVAL*(1/(1+score/800)));
      updateHUD();
    }
  }

  function showPop(dom,text){
    const pop = document.createElement('div');
    pop.className='pop';
    pop.textContent=text;
    stage.appendChild(pop);
    const x=dom.offsetLeft+dom.clientWidth/2;
    const y=dom.offsetTop;
    pop.style.left=(x-30)+'px';
    pop.style.top=(y-10)+'px';

    requestAnimationFrame(()=>{
      pop.style.opacity='1';
      pop.style.transform='translateY(-28px)';
    });
    setTimeout(()=>{
      pop.style.opacity='0';
      pop.style.transform='translateY(-8px)';
      setTimeout(()=>pop.remove(),220);
    },420);
  }

  function update(delta){
    spawnTimer+=delta;
    if(spawnTimer>=spawnInterval){ spawnTimer=0; spawnTile(); }

    const dy=FALL_SPEED_BASE*fallSpeedMul*delta/1000;
    for(let i=tiles.length-1;i>=0;i--){
      const t=tiles[i];
      t.y+=dy;
      t.dom.style.transform=`translateY(${t.y}px)`;

      if(!t.hit && t.y+t.height/2>limitY+MISS_THRESHOLD){
        t.dom.remove();
        tiles.splice(i,1);
        lives = Math.max(0,lives-1);
        lifeLostAnim(t.colIndex);
        updateHUD();
        fallSpeedMul = Math.max(0.6,fallSpeedMul-0.07);
        if(lives<=0){ gameOver(); return; }
      }
    }

    fallSpeedMul=Math.min(3.0, fallSpeedMul + delta/100000);
    if(score>=MAX_SCORE) gameWin();
  }

  function frame(now){
    if(!lastFrame) lastFrame=now;
    const delta=now-lastFrame;
    lastFrame=now;
    if(running && !paused) update(delta);
    requestAnimationFrame(frame);
  }

  const KEY_MAP={'q':0,'Q':0,'s':1,'S':1,'d':2,'D':2};
  window.addEventListener('keydown',e=>{
    if(e.repeat) return;
    if(e.key==='p'||e.key==='P'){ togglePause(); return; }
    if(KEY_MAP.hasOwnProperty(e.key)) onKeyPress(KEY_MAP[e.key]);
  });

  function recalcSizes(){ limitY=limitLine.offsetTop + limitLine.offsetHeight/2; }

  function startGame(){
    resetState();
    running=true;
    lastFrame=null;
    recalcSizes();
    requestAnimationFrame(frame);
  }

  startBtn.addEventListener('click',()=> startGame());
  pauseBtn.addEventListener('click',()=>togglePause());
  overlayRestart.addEventListener('click',()=> startGame());

  function togglePause(){
    if(!running) return;
    paused=!paused;
    pauseBtn.textContent=paused?'Reprendre':'Pause';
    if(paused) showOverlay('Pause — appuyez Reprendre');
    else hideOverlay();
  }

  function init(){
    recalcSizes();
    window.addEventListener('resize',recalcSizes);
    updateHUD();
    showOverlay('Cliquez Démarrer pour protéger le serveur de Cloudflare');
  }

  init();
})();

/* ── ANIMATED BACKGROUND ── */
const cv=document.getElementById('bg');
const ctx=cv ? cv.getContext('2d') : null;
let W,H,pts=[],t=0,mx=0,my=0;
if(cv) {
    function resize(){W=cv.width=window.innerWidth;H=cv.height=window.innerHeight;}
    resize();window.addEventListener('resize',resize);
    document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;});

    class Pt{
      constructor(){this.reset();}
      reset(){
        this.x=Math.random()*W;this.y=Math.random()*H;
        this.r=Math.random()*1.4+0.3;
        this.vx=(Math.random()-.5)*.28;this.vy=(Math.random()-.5)*.28;
        this.a=Math.random()*.55+.1;
        this.hue=Math.random()<.5?265+Math.random()*40:215+Math.random()*30;
      }
      step(){this.x+=this.vx;this.y+=this.vy;if(this.x<0||this.x>W||this.y<0||this.y>H)this.reset();}
      draw(){ctx.beginPath();ctx.arc(this.x,this.y,this.r,0,Math.PI*2);ctx.fillStyle=`hsla(${this.hue},80%,65%,${this.a})`;ctx.fill();}
    }
    for(let i=0;i<130;i++)pts.push(new Pt());

    function drawBg(){
      ctx.clearRect(0,0,W,H);
      const bg=ctx.createRadialGradient(W/2,H/2,0,W/2,H/2,Math.max(W,H)*.85);
      bg.addColorStop(0,'#020712');bg.addColorStop(.5,'#040a18');bg.addColorStop(1,'#000000');
      ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
      const mo=ctx.createRadialGradient(mx,my,0,mx,my,320);
      mo.addColorStop(0,'rgba(124,58,237,0.07)');mo.addColorStop(.6,'rgba(37,99,235,0.03)');mo.addColorStop(1,'transparent');
      ctx.fillStyle=mo;ctx.fillRect(0,0,W,H);
      t+=.004;
      const ax=W*.18+Math.sin(t)*W*.05,ay=H*.28+Math.cos(t*.7)*H*.04;
      const g1=ctx.createRadialGradient(ax,ay,0,ax,ay,210);
      g1.addColorStop(0,'rgba(168,85,247,0.09)');g1.addColorStop(1,'transparent');
      ctx.fillStyle=g1;ctx.fillRect(0,0,W,H);
      const bx=W*.78+Math.cos(t*.8)*W*.04,by=H*.68+Math.sin(t)*H*.05;
      const g2=ctx.createRadialGradient(bx,by,0,bx,by,190);
      g2.addColorStop(0,'rgba(37,99,235,0.07)');g2.addColorStop(1,'transparent');
      ctx.fillStyle=g2;ctx.fillRect(0,0,W,H);
      const cx2=W*.5+Math.sin(t*1.2)*W*.06,cy2=H*.5+Math.cos(t*.9)*H*.04;
      const g3=ctx.createRadialGradient(cx2,cy2,0,cx2,cy2,160);
      g3.addColorStop(0,'rgba(232,121,249,0.04)');g3.addColorStop(1,'transparent');
      ctx.fillStyle=g3;ctx.fillRect(0,0,W,H);
      ctx.strokeStyle='rgba(168,85,247,0.028)';ctx.lineWidth=1;
      const gs=55;
      for(let x=0;x<W;x+=gs){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
      for(let y=0;y<H;y+=gs){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
      pts.forEach(p=>{p.step();p.draw();});
      for(let i=0;i<pts.length;i++)for(let j=i+1;j<pts.length;j++){
        const dx=pts[i].x-pts[j].x,dy=pts[i].y-pts[j].y,d=Math.sqrt(dx*dx+dy*dy);
        if(d<85){ctx.beginPath();ctx.strokeStyle=`rgba(168,85,247,${.055*(1-d/85)})`;ctx.lineWidth=.5;ctx.moveTo(pts[i].x,pts[i].y);ctx.lineTo(pts[j].x,pts[j].y);ctx.stroke();}
      }
      requestAnimationFrame(drawBg);
    }
    drawBg();
}

/* ── GAME LOGIC ── */
const ROWS = 15;
const COLS = 20;
let grid = [];
let playerPos = [0, 0];
let enemyPos = [14, 19];
let goalPos = [7, 10];
let score = 0;
let moves = 0;
let currentMode = 'basic';
let isGameOver = false;
let isMuddy = false; // Player is stuck in mud
let aiPath = []; // Enemy -> Player
let playerPath = []; // Player -> Goal
let highScore = localStorage.getItem('highScore') || 0;
let history = JSON.parse(localStorage.getItem('gameHistory')) || [];

const gridElement = document.getElementById('game-grid');
const scoreElement = document.getElementById('score-val');
const movesElement = document.getElementById('moves-val');
const strategyInfo = document.getElementById('strategy-info');

// Cell types: 0: empty, 1: wall, 2: trap, 3: mud, 4: coin
function initGrid() {
    grid = Array(ROWS).fill().map(() => Array(COLS).fill(0));
    
    // Add more random walls for difficulty
    for (let i = 0; i < 60; i++) {
        let r = Math.floor(Math.random() * ROWS);
        let c = Math.floor(Math.random() * COLS);
        if ((r !== playerPos[0] || c !== playerPos[1]) && 
            (r !== enemyPos[0] || c !== enemyPos[1]) && 
            (r !== goalPos[0] || c !== goalPos[1])) {
            grid[r][c] = 1;
        }
    }

    // Add more traps and mud
    for (let i = 0; i < 25; i++) {
        let r = Math.floor(Math.random() * ROWS);
        let c = Math.floor(Math.random() * COLS);
        if (grid[r][c] === 0) grid[r][c] = Math.random() > 0.4 ? 2 : 3;
    }

    // Add coins
    for (let i = 0; i < 10; i++) {
        let r = Math.floor(Math.random() * ROWS);
        let c = Math.floor(Math.random() * COLS);
        if (grid[r][c] === 0) grid[r][c] = 4;
    }

    renderGrid();
}

function renderGrid(paths = {}) {
    gridElement.innerHTML = '';
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            
            if (grid[r][c] === 1) cell.classList.add('wall');
            if (grid[r][c] === 2) cell.classList.add('trap');
            if (grid[r][c] === 3) cell.classList.add('mud');
            if (grid[r][c] === 4) cell.classList.add('coin');
            
            if (r === playerPos[0] && c === playerPos[1]) cell.classList.add('player');
            else if (r === enemyPos[0] && c === enemyPos[1]) cell.classList.add('enemy');
            else if (r === goalPos[0] && c === goalPos[1]) cell.classList.add('goal');
            
            // Highlight paths if in strategy mode
            if (currentMode === 'strategy') {
                if (paths.bfs && paths.bfs.some(p => p[0] === r && p[1] === c)) {
                    cell.classList.add('path-bfs');
                }
                if (paths.dp && paths.dp.some(p => p[0] === r && p[1] === c)) {
                    cell.classList.add('path-dp');
                }
            } else if (currentMode === 'bfs' || currentMode === 'smart') {
                if (playerPath && playerPath.some(p => p[0] === r && p[1] === c)) {
                    cell.classList.add('path-bfs'); // Show player's path in blue
                }
                if (aiPath && aiPath.some(p => p[0] === r && p[1] === c)) {
                    cell.classList.add('path-enemy'); // Show enemy's path in red
                }
            }
            
            gridElement.appendChild(cell);
        }
    }
}

async function setMode(mode) {
    currentMode = mode;
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('sel'));
    document.getElementById(`mode-${mode}`).classList.add('sel');
    
    const modeNames = {
        'basic': 'GREEDY BEST-FIRST',
        'bfs': 'BREADTH-FIRST SEARCH',
        'smart': 'DIJKSTRA',
        'strategy': 'STRATEGY MODE'
    };
    document.getElementById('hudAlgo').innerText = `MODE: ${modeNames[mode]}`;
    document.getElementById('apill').innerText = modeNames[mode];
    
    aiPath = []; // Clear old path
    if (mode === 'strategy') {
        if (strategyInfo) strategyInfo.style.display = 'flex';
        updateStrategyPaths();
    } else {
        if (strategyInfo) strategyInfo.style.display = 'none';
        if (mode === 'bfs' || mode === 'smart') {
            await updateAIPathVisualization();
        } else {
            renderGrid();
        }
    }
}

async function updateAIPathVisualization() {
    // Enemy path
    if (currentMode === 'bfs') {
        const res = await API.getBFSPath(enemyPos, playerPos, grid);
        aiPath = res.path;
        const playerRes = await API.getBFSPath(playerPos, goalPos, grid);
        playerPath = playerRes.path;
    } else if (currentMode === 'smart') {
        const res = await API.getDijkstraPath(enemyPos, playerPos, grid);
        aiPath = res.path;
        const playerRes = await API.getDijkstraPath(playerPos, goalPos, grid);
        playerPath = playerRes.path;
    }
    renderGrid();
}

async function updateStrategyPaths() {
    const bfsRes = await API.getBFSPath(playerPos, goalPos, grid);
    const dpRes = await API.getDPPath(playerPos, goalPos, grid);
    
    document.getElementById('bfs-dist').innerText = `Distance: ${bfsRes.path.length || '--'}`;
    const coins = dpRes.path.filter(p => grid[p[0]][p[1]] === 4).length;
    document.getElementById('dp-coins').innerText = `Coins: ${coins}`;
    
    renderGrid({ bfs: bfsRes.path, dp: dpRes.path });
}

async function movePlayer(dr, dc) {
    if (isGameOver) return;

    // Mud logic: if stuck in mud, it takes two moves to get out
    if (isMuddy) {
        isMuddy = false;
        console.log("Struggling to get out of mud...");
        return; // Skip this turn's movement
    }
    
    const nr = playerPos[0] + dr;
    const nc = playerPos[1] + dc;
    
    if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS || grid[nr][nc] === 1) return;
    
    playerPos = [nr, nc];
    moves++;
    movesElement.innerText = moves;
    
    // Collect coin
    console.log(`Stepping on cell: [${nr}, ${nc}] type: ${grid[nr][nc]}`);
    if (grid[nr][nc] === 4) {
        score += 10;
        grid[nr][nc] = 0;
        scoreElement.innerText = score;
    } else if (grid[nr][nc] === 2) {
        score -= 5; // Trap penalty
        scoreElement.innerText = score;
        
        // Visual feedback
        gridElement.classList.add('shake');
        setTimeout(() => gridElement.classList.remove('shake'), 500);
    } else if (grid[nr][nc] === 3) {
        // Step into mud
        isMuddy = true;
        console.log("Stepped into mud! Next move will be slow.");
    }
    
    // Check if player moved onto enemy
    if (playerPos[0] === enemyPos[0] && playerPos[1] === enemyPos[1]) {
        showResults(false);
        return;
    }
    
    if (nr === goalPos[0] && nc === goalPos[1]) {
        showResults(true);
        return;
    }
    
    await enemyTurn();
    
    // Check if enemy moved onto player
    if (playerPos[0] === enemyPos[0] && playerPos[1] === enemyPos[1]) {
        showResults(false);
        return;
    }

    if (currentMode === 'strategy') {
        updateStrategyPaths();
    } else if (currentMode === 'bfs' || currentMode === 'smart') {
        await updateAIPathVisualization();
    } else {
        renderGrid();
    }
}


async function enemyTurn() {
    let nextMove;
    
    if (currentMode === 'basic') {
        const res = await API.getGreedyMove(enemyPos, playerPos, grid);
        nextMove = res.next_move;
    } else if (currentMode === 'bfs') {
        const res = await API.getBFSPath(enemyPos, playerPos, grid);
        nextMove = res.path.length > 1 ? res.path[1] : enemyPos;
        aiPath = res.path;
    } else if (currentMode === 'smart' || currentMode === 'strategy') {
        const res = await API.getDijkstraPath(enemyPos, playerPos, grid);
        nextMove = res.path.length > 1 ? res.path[1] : enemyPos;
        if (currentMode === 'smart') aiPath = res.path;
    }
    
    enemyPos = nextMove;
}

function checkGameOver() {
    if (playerPos[0] === enemyPos[0] && playerPos[1] === enemyPos[1]) {
        showResults(false);
    }
}

function showResults(won) {
    if (isGameOver) return; // Prevent double trigger
    console.log(`Game Over. Won: ${won}`);
    isGameOver = true;
    
    if (won && score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
    }
    
    // Save to history
    const entry = {
        won,
        score,
        moves,
        date: new Date().toLocaleTimeString()
    };
    history.unshift(entry);
    if (history.length > 5) history.pop();
    localStorage.setItem('gameHistory', JSON.stringify(history));
    updateHistoryUI();
    document.getElementById('result-title').innerText = won ? '🏆 You Reached the Goal!' : '💀 Caught by the AI!';
    document.getElementById('res-score').innerText = score;
    document.getElementById('res-moves').innerText = moves;
    document.getElementById('results-modal').style.display = 'flex';
    document.getElementById('led').className = won ? 'led done' : 'led ready';
    document.getElementById('stxt').innerText = won ? `✦ GOAL REACHED — FINAL SCORE: ${score}` : 'CAUGHT BY AI';
}

function updateHistoryUI() {
    const list = document.getElementById('history-list');
    if (!list) return;
    list.innerHTML = history.map(h => `
        <div class="history-item ${h.won ? 'win' : 'loss'}">
            <div>
                <div class="date">${h.date}</div>
                <div>${h.won ? 'Win' : 'Loss'} (${h.moves} moves)</div>
            </div>
            <div class="score">${h.score} pts</div>
        </div>
    `).join('');
}

function closeResults() {
    document.getElementById('results-modal').style.display = 'none';
}

function resetGame() {
    playerPos = [0, 0];
    enemyPos = [14, 19];
    score = 0;
    moves = 0;
    isGameOver = false;
    isMuddy = false;
    aiPath = [];
    scoreElement.innerText = score;
    movesElement.innerText = moves;
    document.getElementById('led').className = 'led ready';
    document.getElementById('stxt').innerText = 'READY — USE WASD TO MOVE';
    initGrid();
    if (currentMode === 'strategy') updateStrategyPaths();
}

function closeModal() {
    document.getElementById('instructions-modal').style.display = 'none';
}

window.addEventListener('keydown', (e) => {
    switch(e.key) {
        case 'ArrowUp': case 'w': movePlayer(-1, 0); break;
        case 'ArrowDown': case 's': movePlayer(1, 0); break;
        case 'ArrowLeft': case 'a': movePlayer(0, -1); break;
        case 'ArrowRight': case 'd': movePlayer(0, 1); break;
    }
});

// Start the game
updateHistoryUI();
const highEl = document.getElementById('res-high');
if(highEl) highEl.innerText = highScore;
initGrid();


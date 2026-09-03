/* ============================================================================
   bug-hunt.js  —  the "Bug Hunt" mini-game
   ============================================================================

   PLAIN-LANGUAGE SUMMARY
   ----------------------
   A 15-second click game. Open it via the "found a bug? click to play" chip
   (bottom-left), the terminal `play` command, or the command palette. Small
   "ERR" squares spawn at random spots in the arena; click one to squash it and
   score a point. Bugs spawn a touch faster and live a touch shorter as the
   clock runs down. When time hits 0 the end panel shows your score.

   TWEAKS
   ------
   • Round length:  the two `15` values in startGame() and `gState` init,
                    plus the countdown math (`15 - elapsed`).
   • Spawn rate:    the `550` (ms) in `setInterval(spawnBug, 550)`.
   • Difficulty ramp: the `lifespan` formula in spawnBug().
   • End-screen text: the markup in index.html (#gameEnd).
   • Look of a bug / the arena grid: CSS section 6g.

   DEPENDS ON: nothing.
   PROVIDES: openGame() — called by terminal.js (`play`) and command-palette.js.
   ========================================================================= */

// --- element references (all live in index.html under #gameOverlay) ---
const gameTrigger  = document.getElementById('gameTrigger');
const gameOverlay  = document.getElementById('gameOverlay');
const gameArena    = document.getElementById('gameArena');
const gameEnd      = document.getElementById('gameEnd');
const gScoreEl     = document.getElementById('gScore');
const gTimeEl      = document.getElementById('gTime');
const gFinalScoreEl = document.getElementById('gFinalScore');
const gameClose    = document.getElementById('gameClose');
const gameReplay   = document.getElementById('gameReplay');

// --- game state. Reset at the start of every round. ---
let gState = { score: 0, timeLeft: 15, spawnTimer: null, countdownTimer: null, running: false };

// Create one bug at a random position, remove it after `lifespan` ms (or on click).
function spawnBug() {
  if (!gState.running) return;

  const bug = document.createElement('div');
  bug.className = 'bug';

  const arenaRect = gameArena.getBoundingClientRect();
  const pad = 40;   // keep bugs away from the very edges
  const x = pad + Math.random() * (arenaRect.width  - pad * 2);
  const y = pad + Math.random() * (arenaRect.height - pad * 2);
  bug.style.left = x + 'px';
  bug.style.top  = y + 'px';
  bug.textContent = 'ERR';

  // Bugs get shorter-lived as the round progresses (min 500ms).
  const lifespan = Math.max(500, 1000 - (15 - gState.timeLeft) * 30);
  const timeout = setTimeout(() => { bug.remove(); }, lifespan);

  bug.addEventListener('click', () => {
    clearTimeout(timeout);
    bug.classList.add('squash');          // triggers the pop-out animation
    gState.score++;
    gScoreEl.textContent = gState.score;
    setTimeout(() => bug.remove(), 160);  // remove after the animation
  });

  gameArena.appendChild(bug);
}

// Begin (or restart) a round.
function startGame() {
  gState = { score: 0, timeLeft: 15, running: true };
  gScoreEl.textContent = '0';
  gTimeEl.textContent = '15.0s';
  gameEnd.classList.remove('show');
  document.querySelectorAll('.bug').forEach(b => b.remove());

  gState.spawnTimer = setInterval(spawnBug, 550);
  spawnBug();

  // requestAnimationFrame-based countdown so the timer display is smooth.
  const start = performance.now();
  function countdown() {
    if (!gState.running) return;
    const elapsed = (performance.now() - start) / 1000;
    gState.timeLeft = Math.max(0, 15 - elapsed);
    gTimeEl.textContent = gState.timeLeft.toFixed(1) + 's';
    if (gState.timeLeft <= 0) { endGame(); return; }
    requestAnimationFrame(countdown);
  }
  requestAnimationFrame(countdown);
}

// Stop spawning, clear bugs, show the score panel.
function endGame() {
  gState.running = false;
  clearInterval(gState.spawnTimer);
  document.querySelectorAll('.bug').forEach(b => b.remove());
  gFinalScoreEl.textContent = gState.score;
  gameEnd.classList.add('show');
}

// Open the overlay and immediately start a round. (Called from other scripts.)
function openGame() {
  gameOverlay.classList.add('open');
  startGame();
}

// Close the overlay and tear the round down.
function closeGame() {
  gState.running = false;
  clearInterval(gState.spawnTimer);
  document.querySelectorAll('.bug').forEach(b => b.remove());
  gameOverlay.classList.remove('open');
}

// --- wiring ---
gameTrigger.addEventListener('click', openGame);
gameClose.addEventListener('click', closeGame);
gameReplay.addEventListener('click', startGame);
addEventListener('keydown', e => {
  if (e.key === 'Escape' && gameOverlay.classList.contains('open')) closeGame();
});

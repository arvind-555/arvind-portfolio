/* ============================================================================
   speedrun.js  —  the "Typing Speedrun" mini-game
   ============================================================================

   PLAIN-LANGUAGE SUMMARY
   ----------------------
   Open it via the "test your typing speed" chip (bottom-left), the terminal
   `play` command, or the command palette. A short real line of code appears;
   type it out. The clock starts on your first keystroke and stops the moment
   you've typed enough characters. Score is WPM — (characters / 5) / minutes,
   the standard typing-test formula — plus a live error count while you go.

   TWEAKS
   ------
   • Snippet pool: the SNIPPETS array below. Add/remove freely.
   • WPM formula: standard (chars / 5) / minutes — see finishRound().
   • Look of the snippet / caret / error colour: CSS section 6g.

   DEPENDS ON: nothing.
   PROVIDES: openGame() — called by terminal.js (`play`) and command-palette.js.
   ========================================================================= */

const SNIPPETS = [
  "const bugs = []; while (alive) bugs.push(fix());",
  "git commit -m 'fix: actually fix it this time'",
  "sudo rm -rf ./doubts",
  "try { ship(); } catch (e) { blame(wifi); }",
  "SELECT * FROM excuses WHERE valid = true;",
  "console.log('it works on my machine');",
  "if (coffee < 1) { productivity = 0; }",
];

// --- element references (all live in index.html under #gameOverlay) ---
const gameTrigger   = document.getElementById('gameTrigger');
const gameOverlay   = document.getElementById('gameOverlay');
const gameArena     = document.getElementById('gameArena');
const gameEnd       = document.getElementById('gameEnd');
const gameClose     = document.getElementById('gameClose');
const gameReplay    = document.getElementById('gameReplay');
const typeSnippet   = document.getElementById('typeSnippet');
const typeInput     = document.getElementById('typeInput');
const gErrorsEl     = document.getElementById('gErrors');
const gTimeEl       = document.getElementById('gTime');
const gFinalScoreEl = document.getElementById('gFinalScore');

// --- round state. Reset at the start of every round. ---
let rState = { snippet: '', startTime: null, running: false, rafId: null };

// Turn <, >, & into harmless entities (a snippet is fixed data we wrote, but
// cheap insurance costs nothing).
function escapeChar(c) { return c.replace(/[&<>]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m])); }

// Re-render the target snippet as one <span> per character, coloured by
// whether it's already typed-correct, typed-wrong, or still pending. The
// first untyped character gets the blinking caret.
function renderSnippet(typed) {
  typeSnippet.innerHTML = rState.snippet.split('').map((ch, i) => {
    let cls;
    if (i < typed.length) cls = typed[i] === ch ? 'correct' : 'wrong';
    else if (i === typed.length) cls = 'pending current';
    else cls = 'pending';
    return `<span class="${cls}">${ch === ' ' ? '&nbsp;' : escapeChar(ch)}</span>`;
  }).join('');
}

// requestAnimationFrame loop that keeps the elapsed-time display live.
function tick() {
  if (!rState.running) return;
  const elapsed = (performance.now() - rState.startTime) / 1000;
  gTimeEl.textContent = elapsed.toFixed(1) + 's';
  rState.rafId = requestAnimationFrame(tick);
}

// Begin (or restart) a round.
function startRound() {
  rState = {
    snippet: SNIPPETS[Math.floor(Math.random() * SNIPPETS.length)],
    startTime: null, running: true, rafId: null,
  };
  gErrorsEl.textContent = '0';
  gTimeEl.textContent = '0.0s';
  gameEnd.classList.remove('show');
  typeInput.value = '';
  renderSnippet('');
  setTimeout(() => typeInput.focus(), 10);   // focus after the open animation starts
}

// Stop the clock, compute WPM, show the score panel.
function finishRound() {
  rState.running = false;
  cancelAnimationFrame(rState.rafId);
  const minutes = Math.max((performance.now() - rState.startTime) / 60000, 1 / 6000); // guard against div-by-~0
  const wpm = Math.round((rState.snippet.length / 5) / minutes);
  gFinalScoreEl.textContent = wpm;
  gameEnd.classList.add('show');
}

typeInput.addEventListener('input', () => {
  if (!rState.running) return;
  if (rState.startTime === null) { rState.startTime = performance.now(); tick(); }

  const typed = typeInput.value;

  // Recount errors from scratch each keystroke — cheap at snippet length.
  let errors = 0;
  for (let i = 0; i < typed.length; i++) if (typed[i] !== rState.snippet[i]) errors++;
  gErrorsEl.textContent = errors;
  renderSnippet(typed);

  if (typed.length >= rState.snippet.length) finishRound();
});

// Open the overlay and immediately start a round. (Called from other scripts.)
function openGame() {
  gameOverlay.classList.add('open');
  startRound();
}

// Close the overlay and tear the round down.
function closeGame() {
  rState.running = false;
  cancelAnimationFrame(rState.rafId);
  gameOverlay.classList.remove('open');
}

// --- wiring ---
gameTrigger.addEventListener('click', openGame);
gameClose.addEventListener('click', closeGame);
gameReplay.addEventListener('click', startRound);
// The real input is visually hidden (CSS), so clicking anywhere in the arena
// should refocus it — otherwise a mis-click loses your keystrokes.
gameArena.addEventListener('click', () => typeInput.focus());
addEventListener('keydown', e => {
  if (e.key === 'Escape' && gameOverlay.classList.contains('open')) closeGame();
});

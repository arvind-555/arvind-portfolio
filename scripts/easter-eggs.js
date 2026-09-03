/* ============================================================================
   easter-eggs.js  —  the Konami code
   ============================================================================

   PLAIN-LANGUAGE SUMMARY
   ----------------------
   Listens for the classic Konami sequence:
       ↑ ↑ ↓ ↓ ← → ← → B A
   Get it right and the whole page briefly inverts its colours, and a line is
   printed into the terminal log. Resets itself after ~1.4s.

   `konamiProgress` tracks how many correct keys in a row you've pressed. Any
   wrong key resets it (to 1 if that wrong key happened to be the first key of
   the sequence, otherwise 0).

   The terminal-only easter-egg COMMANDS (sudo, coffee, rm -rf, vim, exit) live
   in scripts/terminal.js, not here.

   DEPENDS ON: terminal.js (uses printLine).
   ========================================================================= */

const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let konamiProgress = 0;

addEventListener('keydown', e => {
  // Single characters are lower-cased so "B"/"A" match; named keys pass through.
  const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;

  if (key === KONAMI[konamiProgress]) {
    konamiProgress++;
    if (konamiProgress === KONAMI.length) {
      konamiProgress = 0;

      // The payoff: invert + hue-rotate the entire page for a beat.
      document.body.style.transition = 'filter .3s ease';
      document.body.style.filter = 'invert(1) hue-rotate(180deg)';
      printLine(`&gt; secret unlocked. you actually typed the konami code on a portfolio site.`, 'out');
      setTimeout(() => { document.body.style.filter = ''; }, 1400);
    }
  } else {
    konamiProgress = (key === KONAMI[0]) ? 1 : 0;
  }
});

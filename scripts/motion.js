/* ============================================================================
   motion.js  —  four small scroll/entrance effects
   ============================================================================

   Contains:
     1. Scroll reveal   — sections fade + rise + un-blur as they enter view.
     2. Hero decode     — the name headline "unscrambles" itself on load.
     3. Scroll progress — the thin amber bar at the very top of the window.
     4. Role cycle      — the line under the name types/erases through SITE.roles.

   All four respect the OS "reduce motion" accessibility setting.

   DEPENDS ON: render.js must run first (this file tags .dirrow / .stackitem /
   .social / .offrow elements, which render.js creates from config.js).
   Also reads SITE.roles from config.js for effect 4.
   ========================================================================= */


/* ---- 1. SCROLL REVEAL ---------------------------------------------------- */
// Step A: tag every element we want to animate with class="reveal" (the CSS in
// section 6c starts them hidden/blurred). Add selectors here to reveal more.
document.querySelectorAll(
  '.sec-head, .hero .desc, .hero .status, .pinned, .dirrow, .stackitem, .offrow, .social, #sec-contact p'
).forEach(el => el.classList.add('reveal'));

// Step B: an IntersectionObserver watches those elements and adds class="in"
// (which triggers the CSS transition) the first time each scrolls into view.
// The `i * 40` gives a slight stagger so a group doesn't all pop at once.
const io = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('in'), i * 40);
      io.unobserve(entry.target);   // animate once, then stop watching
    }
  });
}, { threshold: 0.15 });   // fire when ~15% of the element is visible

document.querySelectorAll('.reveal').forEach(el => io.observe(el));


/* ---- 2. HERO TEXT DECODE ----------------------------------------------------
   Briefly replaces each letter of the headline with random symbols, then
   "resolves" them left-to-right into the real text. Purely on page load. */
function decodeText(el) {
  const finalText = el.textContent;                 // the real headline
  const chars = '!<>-_\\/[]{}—=+*^?#0123456789';    // pool of scramble characters
  let frame = 0;
  const totalFrames = 24;

  function render() {
    let out = '';
    for (let i = 0; i < finalText.length; i++) {
      const charProgress = (frame - i * 1.2);       // each letter starts a bit later
      if (finalText[i] === ' ')                   { out += ' '; }
      else if (charProgress > totalFrames * 0.4)  { out += finalText[i]; }   // resolved
      else if (charProgress > 0)                  { out += chars[Math.floor(Math.random() * chars.length)]; }
      else                                        { out += ' '; }            // not started yet
    }
    el.textContent = out;
    frame++;
    if (frame < totalFrames + finalText.length) requestAnimationFrame(render);
    else el.textContent = finalText;               // safety: force the exact final text
  }
  render();
}

const heroTitleEl = document.getElementById('heroTitle');
if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
  decodeText(heroTitleEl);
}
// (If reduce-motion is on, we skip the effect and the headline just shows as-is.)


/* ---- 3. SCROLL PROGRESS BAR ------------------------------------------------
   Sets the width of #progress to "how far down the page you've scrolled", 0–100%. */
const progressBar = document.getElementById('progress');

function updateProgress() {
  const h = document.documentElement;
  const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
  progressBar.style.width = (scrolled || 0) + '%';   // `|| 0` guards against NaN on short pages
}
addEventListener('scroll', updateProgress, { passive: true });
updateProgress();


/* ---- 4. HERO ROLE CYCLE ---------------------------------------------------
   The line under the name (#heroRole) types itself out, holds, erases, and
   moves to the next entry in SITE.roles (config.js) — looping forever, with a
   blinking caret. Skipped entirely when reduce-motion is on, which leaves the
   first role (the text hard-coded in index.html) showing statically.

   Tuning: HOLD_MS (pause on a full line), TYPE_MS / ERASE_MS (per-character). */
const heroRoleEl = document.getElementById('heroRole');
const roles = (typeof SITE !== 'undefined' && Array.isArray(SITE.roles)) ? SITE.roles : [];

if (heroRoleEl && roles.length > 1 && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const HOLD_MS = 2800, TYPE_MS = 45, ERASE_MS = 25;
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  // Rebuild #heroRole as [ text span ][ caret span ] so the caret can sit
  // inline at the end of the text while we only rewrite the text span.
  heroRoleEl.textContent = '';
  const textSpan = document.createElement('span');
  const caret = document.createElement('span');
  caret.className = 'role-caret';
  caret.textContent = '_';
  textSpan.textContent = roles[0];
  heroRoleEl.append(textSpan, caret);

  (async function cycleRoles() {
    let idx = 0, text = roles[0];
    while (true) {
      await sleep(HOLD_MS);
      for (let i = text.length; i >= 0; i--) { textSpan.textContent = text.slice(0, i); await sleep(ERASE_MS); }
      idx = (idx + 1) % roles.length;
      text = roles[idx];
      for (let i = 1; i <= text.length; i++) { textSpan.textContent = text.slice(0, i); await sleep(TYPE_MS); }
    }
  })();
}

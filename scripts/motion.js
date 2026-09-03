/* ============================================================================
   motion.js  —  three small scroll/entrance effects
   ============================================================================

   Contains:
     1. Scroll reveal   — sections fade + rise + un-blur as they enter view.
     2. Hero decode     — the name headline "unscrambles" itself on load.
     3. Scroll progress — the thin amber bar at the very top of the window.

   All three respect the OS "reduce motion" accessibility setting.

   DEPENDS ON: render.js must run first (this file tags .dirrow / .stackitem /
   .social / .offrow elements, which render.js creates from config.js).
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

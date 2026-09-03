/* ============================================================================
   hover-preview.js  —  the little panel that follows the mouse over projects
   ============================================================================

   PLAIN-LANGUAGE SUMMARY
   ----------------------
   When you hover a project row, a small 180×130 box (#hoverPreview) fades in
   and trails the cursor. Right now it shows a GENERATED stripe pattern, unique
   per project (the angle/colour are derived from the project's position in the
   list, so it's stable, not random). The panel label shows the project status.

   The box position is eased toward the mouse (the `* 0.2` in hpLoop), same
   trick as the custom cursor ring.

   ── TODO: SHOW REAL SCREENSHOTS INSTEAD OF THE PATTERN ──────────────────────
   1. Put images in  assets/  (e.g. assets/hhgoa-card.png).
   2. Add an `image` field to each project in config.js, e.g.
          { id:'hhgoa-card', …, image:'assets/hhgoa-card.png' }
   3. In the `mouseenter` handler below, replace the
          hoverPattern.style.background = `repeating-linear-gradient(...)`
      line with something like:
          hoverPattern.style.background = `center/cover url("${proj.image}")`;
      (keep a fallback for projects that don't have an image yet.)
   ───────────────────────────────────────────────────────────────────────────

   DEPENDS ON: config.js (PROJECTS) and render.js (creates the .dirrow elements).
   Desktop only — hidden under 860px.
   ========================================================================= */

const hoverPreview = document.getElementById('hoverPreview');
const hoverPattern = document.getElementById('hoverPattern');
const hoverLabel   = document.getElementById('hoverLabel');

// Eased follow: current position (hpX/hpY) chases the target (hpTX/hpTY).
let hpX = 0, hpY = 0, hpTX = 0, hpTY = 0;

function hpLoop() {
  hpX += (hpTX - hpX) * 0.2;
  hpY += (hpTY - hpY) * 0.2;
  hoverPreview.style.left = hpX + 'px';
  hoverPreview.style.top  = hpY + 'px';
  requestAnimationFrame(hpLoop);
}
hpLoop();
addEventListener('mousemove', e => { hpTX = e.clientX; hpTY = e.clientY; });

// Wire each project row to show/hide + restyle the panel. Desktop only.
if (matchMedia('(min-width: 861px)').matches) {
  document.querySelectorAll('.dirrow').forEach((row, i) => {
    const proj = PROJECTS[i];         // rows are built in the same order as PROJECTS
    if (!proj) return;

    const hue = (i * 47) % 360;       // deterministic hue per project (not random)

    row.addEventListener('mouseenter', () => {
      // Generated placeholder art. See the TODO block above to use real images.
      hoverPattern.style.background =
        `repeating-linear-gradient(${45 + i * 15}deg, rgba(245,166,35,.15) 0 2px, transparent 2px 10px), hsl(${hue} 30% 10%)`;
      hoverLabel.textContent = proj.status;
      hoverPreview.classList.add('show');
    });

    row.addEventListener('mouseleave', () => hoverPreview.classList.remove('show'));
  });
}

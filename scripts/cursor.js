/* ============================================================================
   cursor.js  —  the custom amber cursor (dot + trailing ring)
   ============================================================================

   PLAIN-LANGUAGE SUMMARY
   ----------------------
   The real mouse pointer is hidden by CSS (`body { cursor: none }`). This file
   drives two <div>s instead:
     • #cursorDot  — a small solid dot that sits exactly on the mouse.
     • #cursorRing — a hollow ring that CHASES the mouse with a slight lag,
                     which is what gives it that smooth, weighty feel.
   The ring also grows (class "hover") when the pointer is over anything
   clickable — links, buttons, inputs, project rows.

   Only runs on screens wider than 860px (on mobile the normal cursor is back).

   TWEAKS
   ------
   • Lag amount: the `* 0.18` in cursorLoop(). Lower = more lag/floatier,
     higher = snappier. 1.0 would remove the lag entirely.
   • Ring size / hover size / colours: CSS section 6b (.cursor-ring etc).
   • What counts as "hoverable": the querySelectorAll list near the bottom.

   DEPENDS ON: nothing. (Elements #cursorDot / #cursorRing are in index.html.)
   ========================================================================= */

const cursorDot  = document.getElementById('cursorDot');
const cursorRing = document.getElementById('cursorRing');

// Where the mouse actually is right now:
let mouseX = innerWidth / 2, mouseY = innerHeight / 2;
// Where the lagging ring currently is (it eases toward mouseX/mouseY each frame):
let ringX = mouseX, ringY = mouseY;

addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; });

// Runs ~60 times a second. The dot snaps to the mouse; the ring moves a
// fraction (0.18) of the remaining distance each frame — classic easing.
function cursorLoop() {
  cursorDot.style.left = mouseX + 'px';
  cursorDot.style.top  = mouseY + 'px';

  ringX += (mouseX - ringX) * 0.18;
  ringY += (mouseY - ringY) * 0.18;
  cursorRing.style.left = ringX + 'px';
  cursorRing.style.top  = ringY + 'px';

  requestAnimationFrame(cursorLoop);
}

// Desktop only. matchMedia mirrors the CSS breakpoint that hides these divs.
if (matchMedia('(min-width: 861px)').matches) {
  cursorLoop();

  // Grow the ring while hovering anything interactive.
  document.querySelectorAll('a, button, input, .dirrow').forEach(el => {
    el.addEventListener('mouseenter', () => cursorRing.classList.add('hover'));
    el.addEventListener('mouseleave', () => cursorRing.classList.remove('hover'));
  });
}

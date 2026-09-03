/* ============================================================================
   background.js  —  the drifting particle-mesh behind everything
   ============================================================================

   PLAIN-LANGUAGE SUMMARY
   ----------------------
   Fills the full-screen <canvas id="mesh"> with a set of slow-moving dots.
   Every frame it: moves each dot a little, bounces it off the edges, then
   draws a faint line between any two dots that are close together. The result
   is that shifting "constellation" look.

   TWEAKS
   ------
   • Density:      the `18000` divisor in resizeCanvas() — bigger = fewer dots.
                   `Math.min(70, …)` also hard-caps it at 70 dots.
   • Speed:        the `* 0.25` on vx/vy in resizeCanvas().
   • Link range:   the `130` in drawMesh() — how close two dots must be to
                   get a connecting line.
   • Colour:       the two `rgba(245,166,35, …)` values in drawMesh()
                   (that's the amber accent as raw RGB).
   • Overall fade: `opacity: .55` on `#mesh` in the CSS (section 6a).

   DEPENDS ON: nothing.
   NOTE: this runs an animation loop continuously. It's cheap, but if you ever
   want it fully off, delete the <canvas> from index.html and this file's line
   in the <script> list.
   ========================================================================= */

const canvas = document.getElementById('mesh');
const ctx = canvas.getContext('2d');
let particles = [];

// Called once at start and again on every window resize. Recreates the dots
// sized to the new viewport.
function resizeCanvas() {
  canvas.width = innerWidth;
  canvas.height = innerHeight;

  // Number of dots scales with screen area, capped at 70.
  const count = Math.min(70, Math.floor((innerWidth * innerHeight) / 18000));

  particles = Array.from({ length: count }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: (Math.random() - 0.5) * 0.25,   // small random velocity, -0.125..0.125 px/frame
    vy: (Math.random() - 0.5) * 0.25,
  }));
}
resizeCanvas();
addEventListener('resize', resizeCanvas);

// The render loop.
function drawMesh() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 1. move + edge-bounce
  particles.forEach(p => {
    p.x += p.vx; p.y += p.vy;
    if (p.x < 0 || p.x > canvas.width)  p.vx *= -1;
    if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
  });

  // 2. draw links between near pairs, then the dot itself
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const a = particles[i], b = particles[j];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d < 130) {
        // closer pairs → more opaque line (fades out toward the 130px limit)
        ctx.strokeStyle = `rgba(245,166,35,${(1 - d / 130) * 0.12})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
    ctx.fillStyle = 'rgba(245,166,35,0.35)';
    ctx.beginPath();
    ctx.arc(particles[i].x, particles[i].y, 1.4, 0, Math.PI * 2);
    ctx.fill();
  }

  requestAnimationFrame(drawMesh);
}
drawMesh();

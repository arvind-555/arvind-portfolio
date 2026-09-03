/* ============================================================================
   command-palette.js  —  the Cmd/Ctrl+K "jump to anything" overlay
   ============================================================================

   PLAIN-LANGUAGE SUMMARY
   ----------------------
   Press Cmd+K (Mac), Ctrl+K (Windows/Linux), or "/" anywhere (or click the
   chip bottom-right) to open a search box. Type to filter a flat list of
   actions; Up/Down to move the highlight, Enter to run it, Esc to close.

   Each entry is `{ label, cat, action }`:
     label  — the text shown and searched.
     cat    — the small grey tag on the right ('section' | 'action' | 'social' | 'project').
     action — a function that runs when the entry is chosen.

   Most entries are built from config.js so they stay in sync with the rest of
   the site. To add a one-off command, push another object into PALETTE_ITEMS.

   DEPENDS ON: config.js (SITE, SOCIALS, PROJECTS), terminal.js (scrollToSection),
   bug-hunt.js (openGame — only needed when that entry is chosen).
   ========================================================================= */

const paletteOverlay = document.getElementById('palette-overlay');
const paletteInput   = document.getElementById('paletteInput');
const paletteList    = document.getElementById('paletteList');

// Helper: scroll to the projects section AND open a specific project's drawer.
function jumpToProject(id) {
  scrollToSection('sec-projects');
  const r = document.getElementById('row-' + id);
  if (r) { r.classList.add('open'); r.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
}

const PALETTE_ITEMS = [
  // --- sections ---
  { label: 'Home',     cat: 'section', action: () => scrollToSection('sec-home') },
  { label: 'Projects', cat: 'section', action: () => scrollToSection('sec-projects') },
  { label: 'Stack',    cat: 'section', action: () => scrollToSection('sec-stack') },
  { label: 'Off-duty', cat: 'section', action: () => scrollToSection('sec-offduty') },
  { label: 'Socials',  cat: 'section', action: () => scrollToSection('sec-socials') },
  { label: 'Contact',  cat: 'section', action: () => scrollToSection('sec-contact') },

  // --- actions ---
  { label: 'Play bug hunt', cat: 'action', action: () => openGame() },

  // --- socials (built from SOCIALS in config.js) ---
  ...SOCIALS.map(s => ({
    label: s.name, cat: 'social',
    action: () => window.open(s.url, '_blank'),
  })),

  // --- one entry per project (built from PROJECTS in config.js) ---
  ...PROJECTS.map(p => ({
    label: p.name, cat: 'project',
    action: () => jumpToProject(p.id),
  })),

  // --- more actions ---
  { label: 'Copy email',    cat: 'action', action: () => { navigator.clipboard?.writeText(SITE.email); } },
  { label: 'Open Storyphy', cat: 'action', action: () => window.open(SITE.storyphy.url, '_blank') },
];

// --- state ---
let paletteActive = 0;               // index of the highlighted row
let paletteFiltered = PALETTE_ITEMS; // current visible subset

// Rebuild the visible list from the search box contents.
function renderPalette() {
  const q = paletteInput.value.toLowerCase();
  paletteFiltered = PALETTE_ITEMS.filter(i => i.label.toLowerCase().includes(q));
  paletteActive = 0;
  paletteList.innerHTML = '';

  paletteFiltered.forEach((item, i) => {
    const el = document.createElement('div');
    el.className = 'p-item' + (i === paletteActive ? ' active' : '');
    el.innerHTML = `<span>${item.label}</span><span class="pi-cat">${item.cat}</span>`;
    el.addEventListener('click', () => selectPaletteItem(i));
    el.addEventListener('mouseenter', () => { paletteActive = i; refreshActive(); });
    paletteList.appendChild(el);
  });
}

// Move the .active highlight to match paletteActive (used by arrow keys / hover).
function refreshActive() {
  [...paletteList.children].forEach((el, i) => el.classList.toggle('active', i === paletteActive));
}

// Run the chosen entry's action and close.
function selectPaletteItem(i) {
  const item = paletteFiltered[i];
  if (item) { item.action(); closePalette(); }
}

function openPalette() {
  paletteOverlay.classList.add('open');
  paletteInput.value = '';
  renderPalette();
  setTimeout(() => paletteInput.focus(), 10);   // focus after the open animation starts
}

function closePalette() {
  paletteOverlay.classList.remove('open');
}

// --- events ---
paletteInput.addEventListener('input', renderPalette);

paletteInput.addEventListener('keydown', e => {
  if (e.key === 'ArrowDown') { e.preventDefault(); paletteActive = Math.min(paletteActive + 1, paletteFiltered.length - 1); refreshActive(); }
  if (e.key === 'ArrowUp')   { e.preventDefault(); paletteActive = Math.max(paletteActive - 1, 0); refreshActive(); }
  if (e.key === 'Enter')     { e.preventDefault(); selectPaletteItem(paletteActive); }
  if (e.key === 'Escape')    { closePalette(); }
});

// Click the dark backdrop (but not the panel itself) to close.
paletteOverlay.addEventListener('click', e => { if (e.target === paletteOverlay) closePalette(); });

// The bottom-right chip opens it too.
document.getElementById('cmdkHint').addEventListener('click', openPalette);

// Global shortcuts: Cmd/Ctrl+K toggles; "/" opens (unless you're typing in a field).
addEventListener('keydown', e => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    paletteOverlay.classList.contains('open') ? closePalette() : openPalette();
  }
  if (e.key === '/' && document.activeElement.tagName !== 'INPUT') {
    e.preventDefault();
    openPalette();
  }
});

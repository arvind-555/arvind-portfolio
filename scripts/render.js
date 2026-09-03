/* ============================================================================
   render.js  —  turns the data in config.js into actual HTML on the page
   ============================================================================

   PLAIN-LANGUAGE SUMMARY
   ----------------------
   index.html ships with a few EMPTY containers:
       <div id="dirlist">     — where project rows go
       <div id="stackgrid">   — where the tools grid goes
       <div id="socialgrid">  — where the social links go
   This file loops over PROJECTS / STACK / SOCIALS (from config.js) and fills
   those containers in. It also starts the little clock in the terminal bar,
   stamps the year in the footer, and points the contact link at your email.

   DEPENDS ON: config.js (must load before this file).

   If a project/stack/social ever "disappears" from the page, the cause is
   almost always a typo in config.js, not this file.
   ========================================================================= */


/* ---- Projects: build one .dirrow per entry in PROJECTS -------------------- */
const dirlist = document.getElementById('dirlist');

PROJECTS.forEach(p => {
  const row = document.createElement('div');
  row.className = 'dirrow';

  // The row's DOM id is derived from the project id. This is the link between
  // config.js and the rest of the app: the terminal `open <id>` command and
  // the command palette both look up `row-<id>`. Keep project ids unique.
  row.id = 'row-' + p.id;

  // Build the "live site · source" links. `event.stopPropagation()` stops a
  // click on the link from also toggling the row open/closed.
  const links = [
    p.url  ? `<a href="${p.url}"  target="_blank" rel="noopener" onclick="event.stopPropagation()">live site</a>` : '',
    p.repo ? `<a href="${p.repo}" target="_blank" rel="noopener" onclick="event.stopPropagation()">source</a>`    : '',
  ].filter(Boolean).join(' · ');

  row.innerHTML = `
    <div class="name">${p.name}</div>
    <div class="stack">${p.stack}</div>
    <div class="status-tag ${p.status === 'live' ? 'live' : ''}">${p.status}</div>
    <div class="detail"><div class="detail-inner">${p.desc} ${links ? `— ${links}` : ''}</div></div>
  `;

  // Click anywhere on the row to expand/collapse its description drawer.
  row.addEventListener('click', () => row.classList.toggle('open'));

  dirlist.appendChild(row);
});


/* ---- Stack: one .stackitem per tool, grouped by category ----------------- */
const stackgrid = document.getElementById('stackgrid');

STACK.forEach(group => {
  group.items.forEach(item => {
    const el = document.createElement('div');
    el.className = 'stackitem';
    el.innerHTML = `<span class="cat">${group.cat}</span>${item}`;
    stackgrid.appendChild(el);
  });
});


/* ---- Socials: one .social card per entry -------------------------------- */
const socialgrid = document.getElementById('socialgrid');

SOCIALS.forEach(s => {
  const a = document.createElement('a');
  a.className = 'social';
  a.href = s.url;
  a.target = '_blank';
  a.rel = 'noopener';
  a.innerHTML = `
    <span class="mono-badge">${s.key}</span>
    <div><div class="s-name">${s.name}</div><div class="s-handle">${s.handle}</div></div>
  `;
  socialgrid.appendChild(a);
});


/* ---- Contact link: point it at SITE.email ------------------------------- */
// The <a id="contactEmail"> lives in index.html with no href. We fill it in
// here so the email address only has to be written once (in config.js).
const contactEmail = document.getElementById('contactEmail');
if (contactEmail) {
  contactEmail.href = 'mailto:' + SITE.email;
  contactEmail.textContent = SITE.email;
}


/* ---- Footer year ------------------------------------------------------- */
document.getElementById('year').textContent = new Date().getFullYear();


/* ---- Terminal bar clock ---------------------------------------------------
   Updates once a second. Purely cosmetic. */
function tickClock() {
  const el = document.getElementById('clock');
  const d = new Date();
  el.textContent = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}
tickClock();
setInterval(tickClock, 1000);

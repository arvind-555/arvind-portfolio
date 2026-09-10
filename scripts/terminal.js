/* ============================================================================
   terminal.js  —  the fake-but-functional terminal in the left pane
   ============================================================================

   PLAIN-LANGUAGE SUMMARY
   ----------------------
   The left column is a text box (#cmdInput) plus a scrolling output area
   (#log). You type a word, press Enter, and this file looks the word up in the
   COMMANDS object and runs the matching function. Each command function prints
   lines into #log and/or scrolls the main page to a section.

   HOW TO ADD A COMMAND
   --------------------
   Add a property to the COMMANDS object below:
       myword(arg) { printLine('hello'); }
   `arg` is everything the user typed after the command word (a single string).
   That's it — it's now typeable. Consider also adding it to the `help()` list
   and, if it's navigation, to the command palette (scripts/command-palette.js).

   DEPENDS ON: config.js (SITE, SOCIALS, PROJECTS).
   PROVIDES (used by later scripts): scrollToSection(), printLine(), `input`.
   ========================================================================= */

const log   = document.getElementById('log');
const input = document.getElementById('cmdInput');


/* ---- output helpers ---------------------------------------------------- */

// Print one line into the terminal log.
//   text — may contain HTML (used for links). Caller is responsible for safety.
//   cls  — 'out' (default, dim), 'cmd' (what the user typed), or 'err' (red).
function printLine(text, cls) {
  const div = document.createElement('div');
  div.className = 'line ' + (cls || 'out');
  div.innerHTML = text;
  log.appendChild(div);
  log.scrollTop = log.scrollHeight;   // keep the newest line in view
}

// Echo the command the user just typed, with a "> " prompt in front.
function printCmd(text) {
  printLine(`<span class="prompt">&gt;</span> ${escapeHtml(text)}`, 'cmd');
}

// Turn <, >, &, quotes into harmless entities so user input can't inject HTML.
function escapeHtml(s) {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// Smoothly scroll the main content pane to a section by its id.
function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}


/* ---- the commands ----------------------------------------------------------
   Each key is a word you can type. Some also scroll the page. A few are
   "easter eggs" deliberately left out of `help`. */
const COMMANDS = {

  help() {
    printLine(`Available commands:`);
    printLine(`  ls              list sections`);
    printLine(`  open &lt;target&gt;   jump to a section or project`);
    printLine(`  whoami          about me`);
    printLine(`  storyphy        what I'm building right now`);
    printLine(`  off-duty        what I do when I'm not building`);
    printLine(`  socials         where else to find me`);
    printLine(`  contact         how to reach me`);
    printLine(`  clear           clear this log`);
    printLine(`  (a few more exist. poke around.)`);
  },

  ls() {
    printLine(`home/  projects/  stack/  off-duty/  socials/  contact/`);
    // Lists project ids so the user knows what to pass to `open`.
    printLine(`projects: ${PROJECTS.map(p => p.id).join('  ')}`);
  },

  socials() {
    scrollToSection('sec-socials');
    // Build the link line from the SOCIALS array (config.js) so it stays in sync.
    const links = SOCIALS
      .map(s => `<a href="${s.url}" target="_blank" rel="noopener">${s.name.toLowerCase()}</a>`)
      .join(' · ');
    printLine(links);
  },

  whoami() {
    scrollToSection('sec-home');
    printLine(SITE.whoami);   // TODO: real text lives in config.js -> SITE.whoami
  },

  storyphy() {
    scrollToSection('sec-projects');
    printLine(SITE.storyphy.blurb);
    printLine(`<a href="${SITE.storyphy.url}" target="_blank" rel="noopener">${SITE.storyphy.url.replace('https://', '')}</a>`);
  },

  'off-duty'() {
    scrollToSection('sec-offduty');
    printLine(`gym, travel, stand-up (spectator), doom scrolling, solo walks.`);
  },

  contact() {
    scrollToSection('sec-contact');
    printLine(`email: <a href="mailto:${SITE.email}">${SITE.email}</a>`);
  },

  clear() {
    log.innerHTML = '';
  },

  /* --- easter eggs: not listed in help() on purpose --- */
  sudo() {
    printLine(`nice try. this isn't that kind of website.`, 'err');
  },
  coffee() {
    printLine(`brewing ... here you go: (metaphorical coffee, sorry)`);
  },
  rm(arg) {
    if ((arg || '').includes('-rf')) {
      printLine(`absolutely not. nice try though.`, 'err');
    } else {
      printLine(`rm: missing operand`, 'err');
    }
  },
  vim() {
    printLine(`brave choice. you're stuck here now. (jk, try 'exit')`);
  },
  exit() {
    printLine(`there is no escape. this is a portfolio, not a shell.`);
  },

  /* --- `open <something>` : jump to a project row or a section --- */
  open(arg) {
    if (!arg) { printLine(`usage: open &lt;section|project-id&gt;`, 'err'); return; }

    // First try to match a project by its id or (case-insensitive) name.
    const proj = PROJECTS.find(p => p.id === arg || p.name.toLowerCase() === arg.toLowerCase());
    if (proj) {
      scrollToSection('sec-projects');
      const row = document.getElementById('row-' + proj.id);   // <- the id link again
      if (row) { row.classList.add('open'); row.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
      printLine(`opened ${proj.name} — ${proj.desc}`);
      return;
    }

    // Otherwise treat it as a section name.
    const sectionMap = {
      home: 'sec-home', projects: 'sec-projects', stack: 'sec-stack',
      'off-duty': 'sec-offduty', socials: 'sec-socials', contact: 'sec-contact',
    };
    if (sectionMap[arg]) {
      scrollToSection(sectionMap[arg]);
      printLine(`→ ${arg}`);
    } else {
      printLine(`not found: ${escapeHtml(arg)}`, 'err');
    }
  },
};


/* ---- input handling: split "cmd arg arg" and dispatch ----------------- */
function runCommand(raw) {
  const trimmed = raw.trim();
  if (!trimmed) return;
  printCmd(trimmed);

  const [cmd, ...rest] = trimmed.split(/\s+/);   // first word = command, rest = arg
  const arg = rest.join(' ');

  if (COMMANDS[cmd]) {
    COMMANDS[cmd](arg);
  } else {
    printLine(`command not found: ${escapeHtml(cmd)} — type 'help'`, 'err');
  }
}

input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    runCommand(input.value);
    input.value = '';
  }
});

/* ---- mobile quick-command chips (index.html #quickCmds, mobile-only via
   CSS) — run a command the same way typing it would, since a phone keyboard
   is enough friction that most mobile visitors won't type into the terminal
   otherwise. ---- */
document.querySelectorAll('#quickCmds button').forEach(btn => {
  btn.addEventListener('click', () => runCommand(btn.dataset.cmd));
});

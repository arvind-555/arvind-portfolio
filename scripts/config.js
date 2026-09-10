/* ============================================================================
   config.js  —  EDIT THIS FILE TO MAKE THE SITE YOURS
   ============================================================================

   This is the one file you should need to touch for normal content changes.
   Everything here is plain data. The other scripts read from it — they build
   the projects list, the stack grid, the socials, the command palette and the
   terminal commands out of these values.

   LOAD ORDER: this file is listed FIRST in index.html on purpose. Every other
   script assumes SITE / PROJECTS / STACK / SOCIALS already exist.

   ⚠️  THINGS THAT MUST STAY IN SYNC (change one, change the other):
   -----------------------------------------------------------------
   • A project's `id` (below) is also used to build its row's HTML id
     ("row-<id>") and is what you type into the terminal: `open <id>`.
     If you rename an `id`, nothing breaks automatically, but any place you
     *hard-coded* that id stops working. Right now nothing hard-codes ids —
     they're all derived from this array — so you're free to rename them.
   • `SITE.email` is used in 3 places (the contact link, the terminal
     `contact` command, and the palette "Copy email" action). It's read from
     here in all 3, so changing it here changes it everywhere.
   • Social links: same deal. Defined once in SOCIALS below, used by the
     socials section, the terminal `socials` command, and the palette.
   ========================================================================= */


/* ----------------------------------------------------------------------------
   SITE — the handful of single values used in more than one place.
   (Most prose — the hero paragraph, off-duty lines, the Storyphy card — lives
   directly in index.html where you can see it next to the layout. Look for
   "TODO" comments there.)
   ------------------------------------------------------------------------- */
const SITE = {
  // Your public contact email. Used by: the contact section link,
  // the terminal `contact` command, the palette "Copy email" action.
  email: 'ard.arvind.2005@gmail.com',

  // Shown by the terminal `whoami` command.
  whoami: 'uid=1(arvind) groups=(builder,overthinker,chai-enthusiast) — co-founder & CTO @ Storyphy, shipping things that occasionally work on the first try.',

  // The line under your name in the hero. It types itself out, waits, erases,
  // and moves to the next — looping forever. scripts/motion.js drives it.
  //  • The FIRST entry is the "real" one. Keep it matching the text hard-coded
  //    in index.html (.role) so the page reads right before JS runs and when
  //    "reduce motion" is on (in that case it just stays on the first entry).
  //  • Add / remove / reword freely. Keep them short — one line each.
  roles: [
    'Co-founder & CTO @ Storyphy',
    'occasional Rust apologist',
    'full-time bug author, part-time bug fixer',
    'professional context-switcher',
    'turns chai into commits',
    'still refactoring my sleep schedule',
  ],

  // The "currently building" project. Used by the terminal `storyphy` command.
  // (The visible card for this is in index.html, in the projects section.)
  storyphy: {
    url: 'https://storyphy.in',
    blurb: "Storyphy — personalised kids' storybooks. Co-founder & CTO.",
  },
};


/* ----------------------------------------------------------------------------
   PROJECTS — the directory-style list in the "Selected work" section.
   ----------------------------------------------------------------------------
   Each object becomes one clickable row (built in scripts/render.js).

   Fields:
     id     — short slug, letters/numbers/dashes only. Also the thing you type
              in the terminal: `open <id>`. Keep it unique.
     name   — display name shown on the row.
     stack  — the little monospace tech line under/beside the name.
     status — 'live'  → green tag + the row is treated as a live project
              anything else ('internal', 'archived', 'wip', …) → grey tag.
     repo   — source code URL, or null to hide the "source" link.
     url    — live site URL, or null to hide the "live site" link.
     desc   — 1–2 sentences shown in the drawer when the row is expanded.

   ⚠️  TODO for you: the `stack` values below are placeholders ("— add stack")
       and two of the three `desc` values are generic. Fill in the real tech
       and real descriptions. Don't guess — put what these projects actually use.
   ------------------------------------------------------------------------- */
const PROJECTS = [
  {
    id: 'storyphy-engine',
    name: 'Storyphy Engine',
    stack: 'Python',
    status: 'internal',
    repo: 'https://github.com/arvind-555/storyphy_engine_v3',
    url: null,
    desc: 'The internal engine powering Storyphy — not public-facing, so no live link, just the repo.',
  },
  {
    id: 'hhgoa-card',
    name: 'HHGOA ID Card Generator',
    stack: 'Python · Playwright · Polygon (Amoy) · Web3',
    status: 'live',
    repo: 'https://github.com/arvind-555/hhgoa-card',
    url: 'https://hhgoa-card-alpha.vercel.app/',
    desc: 'Generates ID cards for HH Goa with two anti-fraud layers baked into the pipeline: a Bing reverse-image-search fallback that flags reused/fake photos, and an on-chain (Polygon Amoy) tamper-verification hash so any card\'s authenticity can be checked independently.',
  },
  {
    id: 'campuslore',
    name: 'CampusLore',
    stack: 'Next.js · Tailwind · PWA',
    status: 'live',
    repo: 'https://github.com/arvind-555/campus-app',
    url: 'https://campus-app-self.vercel.app/',
    desc: 'An anonymous confessions board and social feed scoped to a campus — students post anonymously, scroll the feed, and keep a lightweight profile. Mobile-first, installable as a PWA.',
  },
];


/* ----------------------------------------------------------------------------
   STACK — the "Tools & languages" grid.
   ----------------------------------------------------------------------------
   Grouped by category. Each string becomes one cell. Add/remove freely;
   the grid re-flows automatically.
   TODO: adjust these to your actual toolkit.
   ------------------------------------------------------------------------- */
const STACK = [
  { cat: 'languages', items: ['TypeScript', 'Python', 'Rust'] },
  { cat: 'frontend',  items: ['React', 'Svelte'] },
  { cat: 'backend',   items: ['Postgres', 'Redis', 'Docker'] },
  { cat: 'tools',     items: ['Claude Code', 'Git', 'Linux'] },
];


/* ----------------------------------------------------------------------------
   SOCIALS — the "Elsewhere" grid, and also the source for the terminal
   `socials` command and the command palette.
   ----------------------------------------------------------------------------
   Fields:
     key    — 2-letter badge shown in the square (GH, IN, IG, X …).
     name   — label.
     handle — the small grey text under the label.
     url    — where it links.
   ------------------------------------------------------------------------- */
const SOCIALS = [
  { key: 'GH', name: 'GitHub',    handle: '@arvind-555',   url: 'https://github.com/arvind-555' },
  { key: 'IN', name: 'LinkedIn',  handle: '/in/arvind-pal', url: 'https://www.linkedin.com/in/arvind-pal-1b156527b/' },
  { key: 'IG', name: 'Instagram', handle: '@arvind.env',   url: 'https://www.instagram.com/arvind.env' },
  { key: 'X',  name: 'X',         handle: '@gamer_ard_',    url: 'https://x.com/gamer_ard_' },
];

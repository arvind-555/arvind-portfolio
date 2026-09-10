/* ============================================================================
   jokebot.js  —  the "Joke Bot" mini-game
   ============================================================================

   PLAIN-LANGUAGE SUMMARY
   ----------------------
   Open it via the "need a laugh?" chip (bottom-left), the terminal `play`
   command, or the command palette. The bot asks what kind of joke you want,
   riffs on your pick, tells one (setup ... beat ... punchline), then asks how
   it landed and lets you go again. No timer, no score to chase — close it
   with the ✕ or Esc whenever you're done. The top bar just tallies how many
   jokes you sat through and how many made you groan.

   EDIT THE JOKES
   --------------
   Everything is in the JOKES / CATEGORIES / REACTIONS data below — plain
   text, add or swap freely. `s` = setup, `p` = punchline. The 'any' category
   isn't a real list; it pulls at random from all the others.

   DEPENDS ON: nothing.
   PROVIDES: openGame() — called by terminal.js (`play`) and command-palette.js.
   ========================================================================= */

const JOKES = {
  dad: [
    { s: '"Dad, I\'m hungry."', p: '"Hi Hungry, I\'m Dad."' },
    { s: 'I kept wondering why the baseball was getting bigger.', p: 'Then it hit me.' },
    { s: 'Dogs can\'t operate MRI machines.', p: 'But catscan.' },
    { s: 'Why did the Energizer Bunny get arrested?', p: 'It was charged with battery.' },
    { s: 'What do you call a fly with no wings?', p: 'A walk.' },
    { s: 'I only know 25 letters of the alphabet.', p: 'I don\'t know y.' },
  ],
  prog: [
    { s: 'Why do programmers prefer dark mode?', p: 'Light attracts bugs.' },
    { s: 'There are 10 kinds of people in the world:', p: 'those who understand binary, and those who don\'t.' },
    { s: 'A SQL query walks into a bar, sidles up to two tables and asks:', p: '"mind if I join you?"' },
    { s: 'Why do programmers confuse Halloween and Christmas?', p: 'Because Oct 31 == Dec 25.' },
    { s: 'I have a great UDP joke.', p: 'But you might not get it.' },
    { s: 'How do you generate a random string?', p: 'Sit a first-year CS student in front of vim and tell them to quit.' },
    { s: 'How many programmers does it take to change a light bulb?', p: 'None. That\'s a hardware problem.' },
  ],
  oneliner: [
    { s: 'I\'m reading a book about anti-gravity.', p: 'It\'s impossible to put down.' },
    { s: 'Did you hear about the guy who stole a wig and ran?', p: 'Police are combing the area.' },
    { s: 'Why are libraries so tall?', p: 'Too many stories.' },
    { s: 'I have a joke about time travel.', p: 'But you didn\'t like it.' },
    { s: 'I told my wife she drew her eyebrows too high.', p: 'She looked surprised.' },
    { s: 'I used to hate facial hair.', p: 'Then it grew on me.' },
  ],
};

const CATEGORIES = [
  { key: 'dad',      label: 'dad jokes',          quip: 'a bold choice. everyone\'s going to leave the room.' },
  { key: 'prog',     label: 'programmer',         quip: 'finally. my target audience.' },
  { key: 'oneliner', label: 'one-liners',         quip: 'short and painful. my specialty.' },
  { key: 'any',      label: 'just make me laugh', quip: 'no pressure then. setting the bar right on the floor.' },
];

// Bot's reply after you rate a joke. Picked at random from the matching list.
const REACTIONS = {
  lol:   ['knew you had taste.', 'that one\'s going on the résumé.', 'we\'re keeping you.'],
  meh:   ['i\'ll take the pity smile.', 'lukewarm. noted.', 'the bar was on the floor and we cleared it.'],
  groan: ['groan logged. wear it with pride.', 'that\'s the correct response, honestly.', 'yeah, i\'d have thrown something too.'],
};

// --- element references (all live in index.html under #gameOverlay) ---
const gameTrigger = document.getElementById('gameTrigger');
const gameOverlay = document.getElementById('gameOverlay');
const gameArena   = document.getElementById('gameArena');
const gameClose   = document.getElementById('gameClose');
const jokeStage   = document.getElementById('jokeStage');
const jCountEl     = document.getElementById('jCount');
const jGroansEl    = document.getElementById('jGroans');

const pick = arr => arr[Math.floor(Math.random() * arr.length)];

// --- session state. Reset every time the overlay is opened. ---
let jState = { count: 0, groans: 0, lastIdx: {} };

/* ---- tiny DOM helpers ------------------------------------------------------
   Everything the bot shows is one of these, appended to #jokeStage. */

function esc(s) {
  return s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
}

// Keep the newest line in view as the transcript grows.
function scrollDown() { gameArena.scrollTop = gameArena.scrollHeight; }

function say(text, dim) {
  const el = document.createElement('div');
  el.className = 'jline' + (dim ? ' dim' : '');
  el.innerHTML = `<span class="p">&gt;</span> ${esc(text)}`;
  jokeStage.appendChild(el);
  scrollDown();
  return el;
}

function punch(text) {
  const el = document.createElement('div');
  el.className = 'jpunch';
  el.textContent = text;
  jokeStage.appendChild(el);
  scrollDown();
}

// Build a row of buttons. `opts` is [{ label, onClick }].
function buttons(opts, extraClass) {
  const row = document.createElement('div');
  row.className = 'jbtns' + (extraClass ? ' ' + extraClass : '');
  opts.forEach(o => {
    const b = document.createElement('button');
    b.textContent = o.label;
    b.addEventListener('click', o.onClick);
    row.appendChild(b);
  });
  jokeStage.appendChild(row);
  scrollDown();
  return row;
}

// Drop whatever button row is currently on screen (there's only ever one).
function dropButtons() {
  const row = jokeStage.querySelector('.jbtns');
  if (row) row.remove();
}

function clearStage() { jokeStage.innerHTML = ''; }

/* ---- the flow ----------------------------------------------------------
   The stage is an accumulating transcript. It's only wiped on open and on
   "switch it up" (both go through renderAsk). Every other step appends. */

// Step 1 — ask what they want.
function renderAsk() {
  clearStage();
  say('joke_bot online. i only do the classics, and i do them badly.', true);
  say('what are we working with?');
  buttons(CATEGORIES.map(c => ({
    label: c.label,
    onClick: () => pickCategory(c),
  })));
}

// Step 2 — echo the pick, riff on it, then tell one.
function pickCategory(cat) {
  dropButtons();
  say(cat.label + '.', true);      // echo their choice, chat-style
  say(cat.quip, true);
  setTimeout(() => tellJoke(cat.key), 750);
}

// Pick a joke from a category without immediately repeating the last one.
function drawJoke(key) {
  const pool = key === 'any'
    ? Object.values(JOKES).flat()
    : JOKES[key];
  let i, guard = 0;
  do { i = Math.floor(Math.random() * pool.length); }
  while (pool.length > 1 && i === jState.lastIdx[key] && guard++ < 10);
  jState.lastIdx[key] = i;
  return pool[i];
}

// Step 3 — setup ... beat ... punchline ... "how'd it land?"
function tellJoke(key) {
  const joke = drawJoke(key);
  say(joke.s);

  setTimeout(() => {
    punch(joke.p);
    jState.count++;
    jCountEl.textContent = jState.count;

    setTimeout(() => {
      say('how\'d that land?', true);
      buttons([
        { label: '😂', onClick: () => react('lol', key) },
        { label: '🙂', onClick: () => react('meh', key) },
        { label: '🙄', onClick: () => react('groan', key) },
      ], 'react');
    }, 700);
  }, 1150);
}

// Step 4 — bot's comeback to your rating, then "go again?"
function react(kind, key) {
  dropButtons();   // so you can't spam reactions

  if (kind === 'groan') {
    jState.groans++;
    jGroansEl.textContent = jState.groans;
  }

  say(pick(REACTIONS[kind]));

  setTimeout(() => {
    buttons([
      { label: 'another', onClick: () => { dropButtons(); tellJoke(key); } },
      { label: 'switch it up', onClick: renderAsk },
    ]);
  }, 450);
}

/* ---- open / close ----------------------------------------------------- */

function openGame() {
  jState = { count: 0, groans: 0, lastIdx: {} };
  jCountEl.textContent = '0';
  jGroansEl.textContent = '0';
  gameOverlay.classList.add('open');
  renderAsk();
}

function closeGame() {
  gameOverlay.classList.remove('open');
}

// --- wiring ---
gameTrigger.addEventListener('click', openGame);
gameClose.addEventListener('click', closeGame);
addEventListener('keydown', e => {
  if (e.key === 'Escape' && gameOverlay.classList.contains('open')) closeGame();
});

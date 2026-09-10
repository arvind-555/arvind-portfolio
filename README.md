# arvind-portfolio

A single-page personal site. Plain HTML + CSS + JavaScript — **no build step, no
framework, no dependencies**. You can open `index.html` and it just works.

---

## Why it's built this way

Everything on this site is hand-written vanilla JavaScript (the terminal, the
custom cursor, the particle background, the mini-game). React/Vite would mean
rewriting all of that for no benefit and adding a build pipeline you'd have to
maintain. Plain files are the least fragile option and the easiest to come back
to later. The trade-off: no hot-reload while editing (you refresh the browser
yourself) and no CSS/JS minification (irrelevant at this size).

---

## Project layout

```
index.html              The page structure. Hand-written prose lives here,
                         marked with "TODO CONTENT" comments.

styles/
  main.css               The ENTIRE design system. Colours, fonts, spacing,
                         animations. Heavily commented; there's a "QUICK
                         REFERENCE" block at the top.

scripts/                 Plain <script> files, loaded in order by index.html.
                         Each file starts with a plain-language explanation
                         and lists what it depends on.
  config.js              ← EDIT THIS for normal content changes. Projects,
                            stack, socials, email — all just data.
  render.js              Builds the projects/stack/socials HTML from config.js.
  terminal.js            The left-pane terminal and all its commands.
  cursor.js              The custom amber cursor.
  background.js          The drifting particle mesh.
  motion.js              Scroll reveal + hero "decode" + scroll progress bar.
  hover-preview.js       The panel that follows the mouse over project rows.
  command-palette.js     The Cmd/Ctrl+K quick-nav palette.
  jokebot.js             The "Joke Bot" mini-game (edit the jokes in there).
  easter-eggs.js         The Konami code.
  boot.js                The terminal's intro text (loads last).

assets/
  avatar.jpg             Your photo (used in the hero and the terminal bar).
  favicon.svg            Browser-tab icon (+ favicon.png / apple-touch-icon.png
                         fallbacks). og-image.png is the link-share preview.
```

---

## Editing it

### The common stuff → `scripts/config.js`
Projects, tech stack, social handles, and your contact email are all plain data
in that one file. It has detailed comments. **Projects and their tech stacks are
still placeholders** — look for `TODO` in `config.js`.

### Colours, fonts, spacing → `styles/main.css`
Open it and read the "QUICK REFERENCE" comment block at the very top. Almost
every colour tweak is a one-line change to a variable in the `:root` block.

### Wording (bio, headline, off-duty lines, Storyphy blurb) → `index.html`
Search the file for `TODO CONTENT` — every hand-written passage is marked.

### One thing that must stay in sync
A project's `id` in `config.js` is reused to build its row's HTML id
(`row-<id>`) and is what you type in the terminal (`open <id>`). Nothing
hard-codes those ids, so you can rename them freely — but if you ever add code
that refers to `row-something` directly, keep it matching `config.js`.

---

## Previewing locally

**Easiest:** double-click `index.html`. It opens in your browser and everything
works. (The Vercel analytics script will show a harmless 404 in the console —
ignore it; it only runs on the deployed site.)

**Nicer (auto-refresh on save):** install the "Live Server" extension in VS
Code, right-click `index.html` → "Open with Live Server".

**Or from a terminal**, if you have Node:
```
npx serve .
```
then open the URL it prints.

---

## Deploying to Vercel

This repo needs **no configuration** — Vercel serves the files as-is.

### First time
1. Push this folder to a GitHub repo.
2. Go to [vercel.com/new](https://vercel.com/new), import the repo.
3. On the config screen: **Framework Preset = "Other"**, and leave the Build
   Command and Output Directory **empty**. Click Deploy.
4. You get a `your-project.vercel.app` URL in ~20 seconds.

### After that
Every `git push` to the main branch auto-deploys. Pull requests get their own
preview URL.

### Turning on analytics
The page already includes the Vercel Web Analytics script. To make it collect
data: in your Vercel project dashboard → **Analytics** tab → **Enable Web
Analytics**. Free tier is plenty for a portfolio. It's cookie-free and doesn't
need a banner. To remove analytics, delete the two `<script>` lines at the
bottom of `index.html` (they're commented).

### A custom domain later
Vercel project → **Settings → Domains** → add your domain and follow the DNS
instructions. Then update the `og:*` / canonical URLs in `index.html` (there's a
commented block in `<head>`).

---

## Alternatives to Vercel (all fine for this site)

| Host | Notes |
|------|-------|
| **Netlify** | Same drag-and-drop / git flow. Has its own analytics (paid). |
| **Cloudflare Pages** | Fast, generous free tier, free analytics. |
| **GitHub Pages** | Free, simplest if the repo is already on GitHub. No built-in analytics; the Vercel analytics script won't work there — you'd swap in [umami](https://umami.is) or [Plausible](https://plausible.io). |

Vercel is the recommended default: zero-config for this setup, instant preview
deploys, and the analytics is already wired in.

---

## Accessibility / browser support

- Works in current Chrome, Firefox, Safari, Edge.
- Respects the OS "reduce motion" setting (disables the hero decode, scroll
  reveals, and the pulsing status dot).
- Below 860px the layout collapses to one column and the desktop-only bits
  (custom cursor, hover preview, palette chip, game chip) are hidden.

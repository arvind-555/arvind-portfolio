/* ============================================================================
   boot.js  —  the terminal "boot sequence" that runs on page load
   ============================================================================

   PLAIN-LANGUAGE SUMMARY
   ----------------------
   Prints the four intro lines into the terminal, one every 220ms, then puts
   the text cursor in the input box. This is the one scripted motion moment in
   the terminal — everything after it is user-driven.

   To change the intro text, edit the BOOT array. To change the typing pace,
   edit the `220` in setTimeout.

   DEPENDS ON: terminal.js (uses printLine and `input`).
   LOAD ORDER: listed LAST in index.html so everything it touches exists.
   ========================================================================= */

const BOOT = [
  ['out', 'booting portfolio.sys ...'],
  ['out', 'checking for imposter syndrome ... found, ignoring'],
  ['out', 'loading projects ... done'],
  ['out', "type 'help' to see available commands"],
];

let bootIndex = 0;

function playBoot() {
  if (bootIndex >= BOOT.length) { input.focus(); return; }
  const [cls, text] = BOOT[bootIndex++];
  printLine(text, cls);
  setTimeout(playBoot, 220);
}
playBoot();

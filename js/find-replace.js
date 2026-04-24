/**
 * find-replace.js
 * Owns the Find & Replace panel: search, navigation (prev/next),
 * single replacement, replace-all. Works by directly mutating the
 * editor textarea value and re-rendering.
 */

'use strict';

let frMatches   = [];
let frIndex     = -1;

// ── OPEN / CLOSE ──
function toggleFindReplace() {
  const panel = document.getElementById('findReplacePanel');
  const btn   = document.getElementById('findBtn');
  const isOpen = panel.classList.contains('open');

  if (isOpen) {
    closeFindReplace();
  } else {
    panel.classList.add('open');
    if (btn) btn.style.color = 'var(--accent)';
    const findInput = document.getElementById('findInput');
    findInput.focus();

    // Pre-fill with selected text
    const editor   = document.getElementById('editor');
    const selected = editor.value.substring(editor.selectionStart, editor.selectionEnd);
    if (selected && selected.length < 100) {
      findInput.value = selected;
    }
    doFind();
  }
}

function closeFindReplace() {
  const panel = document.getElementById('findReplacePanel');
  const btn   = document.getElementById('findBtn');
  panel.classList.remove('open');
  if (btn) btn.style.color = '';
  frMatches = [];
  frIndex   = -1;
  updateFrCount();
  document.getElementById('editor').focus();
}

// ── FIND LOGIC ──
function buildSearchRegex() {
  const findInput = document.getElementById('findInput');
  const query     = findInput.value;
  if (!query) return null;

  const isCaseSensitive = document.getElementById('frCase').checked;
  const isRegex         = document.getElementById('frRegex').checked;
  const isWholeWord     = document.getElementById('frWord').checked;

  let pattern = isRegex ? query : query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  if (isWholeWord) pattern = '\\b' + pattern + '\\b';

  try {
    return new RegExp(pattern, isCaseSensitive ? 'g' : 'gi');
  } catch(e) {
    return null;
  }
}

function doFind() {
  const editor = document.getElementById('editor');
  const text   = editor.value;
  const regex  = buildSearchRegex();

  frMatches = [];
  frIndex   = -1;

  if (!regex) {
    updateFrCount();
    return;
  }

  let m;
  while ((m = regex.exec(text)) !== null) {
    frMatches.push({ start: m.index, end: m.index + m[0].length });
    if (frMatches.length > 5000) break; // safety limit
  }

  // Set index to nearest match to cursor
  const cursor = editor.selectionStart;
  frIndex = frMatches.findIndex(function(match) { return match.start >= cursor; });
  if (frIndex === -1 && frMatches.length > 0) frIndex = 0;

  updateFrCount();
  highlightCurrent();
}

function findNext() {
  if (frMatches.length === 0) { doFind(); return; }
  frIndex = (frIndex + 1) % frMatches.length;
  updateFrCount();
  highlightCurrent(true);
}

function findPrev() {
  if (frMatches.length === 0) { doFind(); return; }
  frIndex = (frIndex - 1 + frMatches.length) % frMatches.length;
  updateFrCount();
  highlightCurrent(true);
}

// focusEditor=true only when user explicitly navigates (Next/Prev/Replace)
// When called from doFind() while typing, focus stays in the find input.
function highlightCurrent(focusEditor) {
  if (frIndex < 0 || !frMatches[frIndex]) return;
  const editor = document.getElementById('editor');
  const match  = frMatches[frIndex];
  if (focusEditor) editor.focus();
  editor.setSelectionRange(match.start, match.end);

  // Scroll into view
  const linesBefore = editor.value.substring(0, match.start).split('\n').length;
  const lineHeight  = parseFloat(getComputedStyle(editor).lineHeight) || 23.8;
  const targetScroll = (linesBefore - 3) * lineHeight;
  editor.scrollTop  = Math.max(0, targetScroll);
}

function updateFrCount() {
  const el = document.getElementById('frCount');
  if (!el) return;
  if (frMatches.length === 0) {
    const findInput = document.getElementById('findInput');
    el.textContent = findInput.value ? 'No results' : '';
    el.style.color = findInput.value ? 'var(--danger)' : '';
  } else {
    el.textContent = (frIndex + 1) + ' / ' + frMatches.length;
    el.style.color = 'var(--success)';
  }
}

// ── REPLACE ──
function replaceCurrent() {
  if (frIndex < 0 || !frMatches[frIndex]) return;
  const editor      = document.getElementById('editor');
  const replaceWith = document.getElementById('replaceInput').value;
  const match       = frMatches[frIndex];

  snapshotUndo();
  editor.value = editor.value.substring(0, match.start) + replaceWith + editor.value.substring(match.end);
  editor.setSelectionRange(match.start, match.start + replaceWith.length);
  scheduleRender();
  markUnsaved();
  doFind();
  highlightCurrent(true);
}

function replaceAll() {
  const editor      = document.getElementById('editor');
  const replaceWith = document.getElementById('replaceInput').value;
  const regex       = buildSearchRegex();
  if (!regex || frMatches.length === 0) return;

  snapshotUndo();
  const count = frMatches.length;
  editor.value = editor.value.replace(regex, replaceWith);
  scheduleRender();
  markUnsaved();
  doFind();
  showToast('Replaced ' + count + ' occurrence' + (count !== 1 ? 's' : ''));
}

// ── INIT ──
function initFindReplace() {
  const findInput    = document.getElementById('findInput');
  const replaceInput = document.getElementById('replaceInput');
  const frCase       = document.getElementById('frCase');
  const frRegex      = document.getElementById('frRegex');
  const frWord       = document.getElementById('frWord');

  findInput.addEventListener('input', doFind);
  findInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') { e.shiftKey ? findPrev() : findNext(); }
    if (e.key === 'Escape') closeFindReplace();
  });
  replaceInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') replaceCurrent();
    if (e.key === 'Escape') closeFindReplace();
  });
  frCase.addEventListener('change', doFind);
  frRegex.addEventListener('change', doFind);
  frWord.addEventListener('change', doFind);
}

/**
 * statusbar.js
 * Updates all status bar and toolbar statistics: word count, line count,
 * character count, estimated read time, and cursor position (Ln/Col).
 */

'use strict';

function updateStatusBar() {
  const editor = document.getElementById('editor');
  if (!editor) return;

  const md    = editor.value;
  const chars = md.length;
  const words = md.trim() ? md.trim().split(/\s+/).length : 0;
  const lines = md.split('\n').length;

  // Reading time: average 200 wpm
  const readMinutes = Math.ceil(words / 200);

  const charCountEl = document.getElementById('charCount');
  const wordCountEl = document.getElementById('wordCount');
  const lineCountEl = document.getElementById('lineCount');
  const readTimeEl  = document.getElementById('readTime');

  if (charCountEl) charCountEl.textContent = chars.toLocaleString() + ' chars';
  if (wordCountEl) wordCountEl.textContent = words.toLocaleString() + ' words';
  if (lineCountEl) lineCountEl.textContent = lines + ' line' + (lines !== 1 ? 's' : '');
  if (readTimeEl)  readTimeEl.textContent  = '~' + readMinutes + ' min read';
}

function updateCursor() {
  const editor = document.getElementById('editor');
  const el     = document.getElementById('cursorPos');
  if (!editor || !el) return;

  const text  = editor.value.substring(0, editor.selectionStart);
  const lines = text.split('\n');
  const line  = lines.length;
  const col   = lines[lines.length - 1].length + 1;
  el.textContent = 'Ln ' + line + ', Col ' + col;
}

// ── FOCUS MODE ──
let focusModeActive = false;

function toggleFocusMode() {
  focusModeActive = !focusModeActive;
  document.body.classList.toggle('focus-mode', focusModeActive);
  if (focusModeActive) {
    document.getElementById('editor').focus();
    showToast('Focus mode — click overlay to exit');
  }
}

// ── TOAST ──
let toastTimer = null;

function showToast(msg, isError) {
  const t = document.getElementById('toast');
  if (!t) return;

  clearTimeout(toastTimer);
  t.textContent = msg;
  t.className   = 'toast show' + (isError ? ' error' : '');

  toastTimer = setTimeout(function () {
    t.classList.remove('show', 'error');
  }, 2800);
}

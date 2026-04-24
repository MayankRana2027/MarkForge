/**
 * autosave.js
 * Manages auto-save to localStorage with debouncing, restore on load,
 * and visual status indicators. Also tracks the "modified" state.
 */

'use strict';

const AUTOSAVE_KEY     = 'markforge_content_v2';
const AUTOSAVE_META    = 'markforge_meta_v2';
const AUTOSAVE_DELAY   = 1500; // ms after last keystroke

let autosaveTimer  = null;
let isDocModified  = false;

// ── STATUS INDICATOR ──
function setAutosaveStatus(state, label) {
  const el   = document.getElementById('autosaveStatus');
  const text = el && el.querySelector('.save-text');
  if (!el) return;

  el.className = 'autosave-status ' + (state || '');
  if (text) text.textContent = label || '';
}

// ── MARK DOCUMENT AS UNSAVED ──
function markUnsaved() {
  isDocModified = true;
  const badge = document.getElementById('modifiedBadge');
  if (badge) badge.style.display = 'inline';
  setAutosaveStatus('unsaved', 'Unsaved');
  scheduleAutosave();
}

// ── SCHEDULE AUTO-SAVE ──
function scheduleAutosave() {
  clearTimeout(autosaveTimer);
  setAutosaveStatus('saving', 'Saving…');
  autosaveTimer = setTimeout(performSave, AUTOSAVE_DELAY);
}

// ── PERFORM SAVE ──
function performSave() {
  const editor = document.getElementById('editor');
  if (!editor) return;

  try {
    const content = editor.value;
    const meta    = {
      savedAt:   Date.now(),
      wordCount: content.trim() ? content.trim().split(/\s+/).length : 0,
      charCount: content.length
    };

    localStorage.setItem(AUTOSAVE_KEY, content);
    localStorage.setItem(AUTOSAVE_META, JSON.stringify(meta));

    isDocModified = false;
    const badge = document.getElementById('modifiedBadge');
    if (badge) badge.style.display = 'none';

    setAutosaveStatus('', 'Saved');
    updateLastSaved(meta.savedAt);
  } catch (e) {
    setAutosaveStatus('error', 'Save failed');
    console.warn('MarkForge: localStorage save failed', e);
  }
}

// ── FORCE SAVE (Ctrl+S) ──
function forceSave() {
  clearTimeout(autosaveTimer);
  performSave();
  showToast('Saved to local storage');
}

// ── UPDATE LAST SAVED DISPLAY ──
function updateLastSaved(timestamp) {
  const el = document.getElementById('lastSaved');
  if (!el) return;

  const now  = Date.now();
  const diff = now - timestamp;
  let label;

  if (diff < 5000)        label = 'Saved just now';
  else if (diff < 60000)  label = 'Saved ' + Math.floor(diff / 1000) + 's ago';
  else if (diff < 3600000)label = 'Saved ' + Math.floor(diff / 60000) + 'm ago';
  else                    label = 'Saved ' + new Date(timestamp).toLocaleTimeString();

  el.textContent = label;
}

// ── RESTORE ON LOAD ──
function restoreFromLocalStorage() {
  try {
    const saved = localStorage.getItem(AUTOSAVE_KEY);
    const meta  = JSON.parse(localStorage.getItem(AUTOSAVE_META) || 'null');
    return { content: saved, meta };
  } catch (e) {
    return { content: null, meta: null };
  }
}

// ── PERIODIC "X ago" REFRESH ──
function startLastSavedRefresh() {
  setInterval(function () {
    try {
      const meta = JSON.parse(localStorage.getItem(AUTOSAVE_META) || 'null');
      if (meta && meta.savedAt && !isDocModified) {
        updateLastSaved(meta.savedAt);
      }
    } catch (e) {}
  }, 30000);
}

// ── INIT ──
function initAutosave() {
  startLastSavedRefresh();

  // Initialize status
  try {
    const meta = JSON.parse(localStorage.getItem(AUTOSAVE_META) || 'null');
    if (meta && meta.savedAt) {
      updateLastSaved(meta.savedAt);
      setAutosaveStatus('', 'Saved');
    } else {
      const el = document.getElementById('lastSaved');
      if (el) el.textContent = 'Not saved';
    }
  } catch(e) {}
}

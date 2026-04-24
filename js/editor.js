/**
 * editor.js
 * Owns the textarea experience: line numbers, cursor tracking,
 * tab handling, keyboard shortcuts, undo/redo stack, scroll sync.
 */

'use strict';

// ── UNDO / REDO ──
const undoStack = [];
const redoStack = [];
let undoTimer   = null;
let lastSavedForUndo = '';

function snapshotUndo() {
  const editor = document.getElementById('editor');
  const val = editor.value;
  if (val === lastSavedForUndo) return;
  undoStack.push({ value: val, start: editor.selectionStart, end: editor.selectionEnd });
  if (undoStack.length > 200) undoStack.shift();
  redoStack.length = 0;
  lastSavedForUndo = val;
}

function undoAction() {
  const editor = document.getElementById('editor');
  if (undoStack.length === 0) return;
  const current = { value: editor.value, start: editor.selectionStart, end: editor.selectionEnd };
  redoStack.push(current);
  const state = undoStack.pop();
  editor.value = state.value;
  editor.setSelectionRange(state.start, state.end);
  lastSavedForUndo = state.value;
  scheduleRender(0);
  updateLineNumbers();
  updateStatusBar();
}

function redoAction() {
  const editor = document.getElementById('editor');
  if (redoStack.length === 0) return;
  const state = redoStack.pop();
  snapshotUndo();
  editor.value = state.value;
  editor.setSelectionRange(state.start, state.end);
  lastSavedForUndo = state.value;
  scheduleRender(0);
  updateLineNumbers();
  updateStatusBar();
}

// ── LINE NUMBERS ──
function updateLineNumbers() {
  const editor      = document.getElementById('editor');
  const lineNumbers = document.getElementById('lineNumbers');
  if (!editor || !lineNumbers) return;

  const lines        = editor.value.split('\n').length;
  const currentLine  = editor.value.substring(0, editor.selectionStart).split('\n').length;
  let html           = '';

  for (let i = 1; i <= lines; i++) {
    html += '<span' + (i === currentLine ? ' class="active"' : '') + '>' + i + '</span>';
  }

  lineNumbers.innerHTML = html;
  lineNumbers.scrollTop = editor.scrollTop;
}

// ── CLEAR EDITOR ──
function clearEditor() {
  const editor = document.getElementById('editor');
  if (confirm('Clear all content? This cannot be undone.')) {
    snapshotUndo();
    editor.value = '';
    scheduleRender(0);
    updateLineNumbers();
    updateStatusBar();
    editor.focus();
    showToast('Editor cleared');
  }
}

// ── EDITOR INIT ──
function initEditor() {
  const editor      = document.getElementById('editor');
  const lineNumbers = document.getElementById('lineNumbers');
  const frame       = document.getElementById('preview-frame');

  // Input → render + autosave + line nums
  editor.addEventListener('input', function () {
    clearTimeout(undoTimer);
    undoTimer = setTimeout(snapshotUndo, 600);

    scheduleRender(80);
    updateLineNumbers();
    updateStatusBar();
    markUnsaved();
  });

  // Scroll → sync line numbers + preview
  editor.addEventListener('scroll', function () {
    if (lineNumbers) lineNumbers.scrollTop = editor.scrollTop;
    syncPreviewScroll(editor, frame);
  });

  // Cursor move
  editor.addEventListener('keyup',  function() { updateLineNumbers(); updateCursor(); });
  editor.addEventListener('click',  function() { updateLineNumbers(); updateCursor(); });

  // Tab → insert 2 spaces
  editor.addEventListener('keydown', function (e) {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = editor.selectionStart;
      const end   = editor.selectionEnd;

      if (end > start) {
        // Indent multiple lines
        const text   = editor.value;
        const before = text.lastIndexOf('\n', start - 1) + 1;
        const chunk  = text.substring(before, end);
        const indented = chunk.replace(/^/gm, '  ');
        editor.value = text.substring(0, before) + indented + text.substring(end);
        editor.setSelectionRange(before, before + indented.length);
      } else {
        editor.value = editor.value.substring(0, start) + '  ' + editor.value.substring(end);
        editor.selectionStart = editor.selectionEnd = start + 2;
      }
      scheduleRender();
      updateLineNumbers();
    }

    // Ctrl/Cmd shortcuts
    const mod = e.ctrlKey || e.metaKey;
    if (mod && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undoAction(); }
    if (mod && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); redoAction(); }
    if (mod && e.key === 'b') { e.preventDefault(); insertMd('**', '**'); }
    if (mod && e.key === 'i') { e.preventDefault(); insertMd('*', '*'); }
    if (mod && e.key === 'h') { e.preventDefault(); toggleFindReplace(); }
    if (mod && e.key === 's') { e.preventDefault(); forceSave(); }
    if (e.key === 'Escape')   { closeFindReplace(); }

    // Auto-close pairs
    const pairs = { '(': ')', '[': ']', '{': '}', '"': '"', "'": "'" };
    if (pairs[e.key]) {
      const start = editor.selectionStart;
      const end   = editor.selectionEnd;
      if (start !== end) {
        e.preventDefault();
        const selected = editor.value.substring(start, end);
        editor.value = editor.value.substring(0, start) + e.key + selected + pairs[e.key] + editor.value.substring(end);
        editor.setSelectionRange(start + 1, end + 1);
        scheduleRender();
      }
    }

    // Auto-continue list items on Enter
    if (e.key === 'Enter') {
      const pos    = editor.selectionStart;
      const before = editor.value.substring(0, pos);
      const lines  = before.split('\n');
      const last   = lines[lines.length - 1];
      const listMatch = last.match(/^(\s*)([-*+]|\d+\.)\s/);
      if (listMatch) {
        if (last.trim() === listMatch[0].trim()) {
          // Empty list item — remove it
          e.preventDefault();
          const newVal = editor.value.substring(0, pos - last.length) + '\n' + editor.value.substring(pos);
          editor.value = newVal;
          editor.selectionStart = editor.selectionEnd = pos - last.length + 1;
        } else {
          e.preventDefault();
          let next;
          const numMatch = last.match(/^(\s*)(\d+)\.\s/);
          if (numMatch) {
            next = '\n' + numMatch[1] + (parseInt(numMatch[2], 10) + 1) + '. ';
          } else {
            next = '\n' + listMatch[1] + listMatch[2] + ' ';
          }
          editor.value = editor.value.substring(0, pos) + next + editor.value.substring(pos);
          editor.selectionStart = editor.selectionEnd = pos + next.length;
        }
        scheduleRender();
        updateLineNumbers();
      }
    }
  });
}

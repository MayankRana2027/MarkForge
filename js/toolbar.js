/**
 * toolbar.js
 * All toolbar insertion helpers. Each function wraps selected text
 * or inserts at cursor position. No rendering logic here — it calls
 * scheduleRender() from preview.js after modifying editor value.
 */

'use strict';

/**
 * @param {string} before       - Markdown to insert before selection
 * @param {string} after        - Markdown to insert after selection
 * @param {boolean} linePrefix  - If true, inserts at start of line (headings, lists, etc.)
 */
function insertMd(before, after, linePrefix) {
  const editor   = document.getElementById('editor');
  const start    = editor.selectionStart;
  const end      = editor.selectionEnd;
  const selected = editor.value.substring(start, end) || (linePrefix ? '' : 'text');

  snapshotUndo();

  if (linePrefix) {
    // Insert prefix at beginning of each selected line
    const lineStart = editor.value.lastIndexOf('\n', start - 1) + 1;
    const lineEnd   = editor.value.indexOf('\n', end);
    const chunk     = editor.value.substring(lineStart, lineEnd === -1 ? undefined : lineEnd);
    const lines     = chunk.split('\n');
    const toggling  = lines.every(l => l.startsWith(before.trimEnd()));

    const newLines = toggling
      ? lines.map(l => l.replace(before.trimEnd() + (before.endsWith(' ') ? ' ' : ''), ''))
      : lines.map(l => before + l);

    const newChunk = newLines.join('\n');
    const actualEnd = lineEnd === -1 ? editor.value.length : lineEnd;
    editor.value = editor.value.substring(0, lineStart) + newChunk + editor.value.substring(actualEnd);
    editor.setSelectionRange(lineStart, lineStart + newChunk.length);
  } else {
    editor.value = editor.value.substring(0, start) + before + selected + after + editor.value.substring(end);
    editor.selectionStart = start + before.length;
    editor.selectionEnd   = start + before.length + selected.length;
  }

  editor.focus();
  scheduleRender();
  updateLineNumbers();
  markUnsaved();
}

function insertCodeBlock() {
  const editor = document.getElementById('editor');
  const start  = editor.selectionStart;
  const end    = editor.selectionEnd;
  const sel    = editor.value.substring(start, end) || '// your code here';

  snapshotUndo();
  const code = '\n```javascript\n' + sel + '\n```\n';
  editor.value = editor.value.substring(0, start) + code + editor.value.substring(end);
  editor.setSelectionRange(start + 15, start + 15 + sel.length);
  editor.focus();
  scheduleRender();
  updateLineNumbers();
  markUnsaved();
}

function insertTable() {
  const editor = document.getElementById('editor');
  const start  = editor.selectionStart;
  snapshotUndo();
  const table = [
    '',
    '| Column 1 | Column 2 | Column 3 |',
    '|:---------|:--------:|----------:|',
    '| Left     | Center   | Right    |',
    '| Cell 4   | Cell 5   | Cell 6   |',
    ''
  ].join('\n');
  editor.value = editor.value.substring(0, start) + table + editor.value.substring(start);
  editor.focus();
  scheduleRender();
  updateLineNumbers();
  markUnsaved();
}

function insertMath() {
  const editor = document.getElementById('editor');
  const start  = editor.selectionStart;
  snapshotUndo();
  const math = '\n$$\nE = mc^2\n$$\n';
  editor.value = editor.value.substring(0, start) + math + editor.value.substring(start);
  editor.setSelectionRange(start + 5, start + 11);
  editor.focus();
  scheduleRender();
  updateLineNumbers();
  markUnsaved();
}

function copyHTML() {
  const editor = document.getElementById('editor');
  const html   = marked.parse(editor.value);
  navigator.clipboard.writeText(html).then(function () {
    showToast('HTML copied to clipboard!');
  }).catch(function() {
    showToast('Failed to copy', true);
  });
}

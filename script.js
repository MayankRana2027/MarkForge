// ── PREVIEW STYLES injected into iframe ──
const previewCSS = [
  ":root {",
  "  --body-font: 'Georgia', 'Times New Roman', serif;",
  "  --mono-font: 'Courier New', monospace;",
  "  --text: #1a1a2e;",
  "  --bg: #fafaf8;",
  "  --accent: #4a3f9f;",
  "  --border: #e2e2e8;",
  "  --code-bg: #f0f0f5;",
  "  --quote-border: #c4b9f0;",
  "  --quote-bg: #f5f3ff;",
  "  --link: #4a3f9f;",
  "  --h-color: #0f0f1a;",
  "}",
  "* { box-sizing: border-box; }",
  "body {",
  "  font-family: var(--body-font);",
  "  color: var(--text);",
  "  background: var(--bg);",
  "  padding: 40px 48px;",
  "  line-height: 1.8;",
  "  max-width: 820px;",
  "  margin: 0 auto;",
  "  font-size: 16px;",
  "}",
  "h1,h2,h3,h4,h5,h6 {",
  "  font-family: var(--body-font);",
  "  color: var(--h-color);",
  "  line-height: 1.3;",
  "  margin: 1.8em 0 0.6em;",
  "  font-weight: 700;",
  "}",
  "h1 { font-size: 2.2em; border-bottom: 3px solid var(--accent); padding-bottom: 0.3em; margin-top: 0; }",
  "h2 { font-size: 1.65em; border-bottom: 1px solid var(--border); padding-bottom: 0.2em; }",
  "h3 { font-size: 1.3em; }",
  "h4 { font-size: 1.1em; }",
  "p { margin: 0 0 1.2em; }",
  "a { color: var(--link); text-decoration: underline; text-decoration-color: rgba(74,63,159,0.4); }",
  "a:hover { text-decoration-color: var(--link); }",
  "code {",
  "  background: var(--code-bg);",
  "  padding: 0.15em 0.4em;",
  "  border-radius: 4px;",
  "  font-family: var(--mono-font);",
  "  font-size: 0.875em;",
  "  color: #6b21a8;",
  "}",
  "pre {",
  "  background: #1a1a2e;",
  "  color: #d4d4f0;",
  "  padding: 20px 24px;",
  "  border-radius: 8px;",
  "  overflow-x: auto;",
  "  margin: 1.5em 0;",
  "  font-family: var(--mono-font);",
  "  font-size: 0.875em;",
  "  line-height: 1.6;",
  "  border-left: 4px solid var(--accent);",
  "}",
  "pre code { background: none; color: inherit; padding: 0; font-size: inherit; }",
  "blockquote {",
  "  border-left: 4px solid var(--quote-border);",
  "  background: var(--quote-bg);",
  "  margin: 1.5em 0;",
  "  padding: 14px 20px;",
  "  border-radius: 0 6px 6px 0;",
  "  color: #4a4a6a;",
  "  font-style: italic;",
  "}",
  "blockquote p { margin: 0; }",
  "ul, ol { padding-left: 1.8em; margin: 0 0 1.2em; }",
  "li { margin: 0.3em 0; }",
  "li::marker { color: var(--accent); }",
  "table { border-collapse: collapse; width: 100%; margin: 1.5em 0; font-size: 0.95em; }",
  "th { background: var(--accent); color: white; padding: 10px 16px; text-align: left; font-size: 0.9em; }",
  "td { padding: 9px 16px; border-bottom: 1px solid var(--border); }",
  "tr:last-child td { border-bottom: none; }",
  "tr:nth-child(even) td { background: #f5f5fa; }",
  "img { max-width: 100%; border-radius: 8px; margin: 1em 0; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }",
  "hr { border: none; border-top: 2px solid var(--border); margin: 2em 0; }",
  "strong { color: var(--h-color); }",
  "del { color: #888; }"
].join("\n");

// ── DEFAULT CONTENT (no backtick template literals) ──
const defaultMD = [
  "# Welcome to MarkForge \u2726",
  "",
  "A **live** Markdown editor with instant HTML preview.",
  "",
  "## Features",
  "",
  "- \u26a1 **Real-time** preview as you type",
  "- \ud83c\udfa8 Beautiful styled output with typography",
  "- \ud83d\udccb Toolbar for quick formatting",
  "- \ud83d\udce4 Export to standalone HTML",
  "",
  "## Quick Start",
  "",
  "Write your Markdown in the **left panel** and see the rendered HTML on the **right**.",
  "",
  "### Code Example",
  "",
  "```javascript",
  "function greet(name) {",
  "  return 'Hello, ' + name + '!';",
  "}",
  "",
  "console.log(greet('World'));",
  "```",
  "",
  "### Blockquote",
  "",
  "> *\"The best code is the code that doesn't need to be written.\"*",
  "> \u2014 Unknown",
  "",
  "### Table",
  "",
  "| Feature       | Status    |",
  "|---------------|-----------|",
  "| Live Preview  | \u2705 Active  |",
  "| Toolbar       | \u2705 Active  |",
  "| Export HTML   | \u2705 Active  |",
  "| Dark Editor   | \u2705 Active  |",
  "",
  "---",
  "",
  "Start editing to see your changes instantly!"
].join("\n");

// ── DOM REFERENCES ──
const editor       = document.getElementById('editor');
const frame        = document.getElementById('preview-frame');
const lineNumbers  = document.getElementById('lineNumbers');

// ── MARKED CONFIG ──
marked.setOptions({ breaks: true, gfm: true });

// ── RENDER ──
function render() {
  var md   = editor.value;
  var html = marked.parse(md);

  var doc = "<!DOCTYPE html><html lang='en'><head><meta charset='UTF-8'>" +
    "<meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
    "<style>" + previewCSS + "</style></head><body>" + html + "</body></html>";

  frame.srcdoc = doc;
  updateStats(md);
  updateLineNumbers(md);
}

// ── STATS ──
function updateStats(md) {
  var chars = md.length;
  var words = md.trim() ? md.trim().split(/\s+/).length : 0;
  var lines = md.split('\n').length;
  document.getElementById('charCount').textContent  = chars.toLocaleString() + ' chars';
  document.getElementById('wordCount').textContent  = words.toLocaleString() + ' words';
  document.getElementById('lineCount').textContent  = lines + ' lines';
}

// ── LINE NUMBERS ──
function updateLineNumbers(md) {
  var lines = md.split('\n').length;
  var html  = '';
  for (var i = 1; i <= lines; i++) {
    html += '<span>' + i + '</span>';
  }
  lineNumbers.innerHTML   = html;
  lineNumbers.scrollTop   = editor.scrollTop;
}

// ── CURSOR POSITION ──
function updateCursor() {
  var text  = editor.value.substring(0, editor.selectionStart);
  var lines = text.split('\n');
  var line  = lines.length;
  var col   = lines[lines.length - 1].length + 1;
  document.getElementById('cursorPos').textContent = 'Ln ' + line + ', Col ' + col;
}

editor.addEventListener('keyup',   updateCursor);
editor.addEventListener('click',   updateCursor);
editor.addEventListener('scroll',  function () {
  lineNumbers.scrollTop = editor.scrollTop;
});

// ── REAL-TIME RENDER ──
var renderTimer;
editor.addEventListener('input', function () {
  clearTimeout(renderTimer);
  renderTimer = setTimeout(render, 80);
});

// ── TAB SUPPORT ──
editor.addEventListener('keydown', function (e) {
  if (e.key === 'Tab') {
    e.preventDefault();
    var start = editor.selectionStart;
    var end   = editor.selectionEnd;
    editor.value          = editor.value.substring(0, start) + '  ' + editor.value.substring(end);
    editor.selectionStart = editor.selectionEnd = start + 2;
    render();
  }
});

// ── TOOLBAR HELPERS ──
function insertMd(before, after) {
  var start    = editor.selectionStart;
  var end      = editor.selectionEnd;
  var selected = editor.value.substring(start, end) || 'text';
  editor.value = editor.value.substring(0, start) + before + selected + after + editor.value.substring(end);
  editor.selectionStart = start + before.length;
  editor.selectionEnd   = start + before.length + selected.length;
  editor.focus();
  render();
}

function insertCodeBlock() {
  var start = editor.selectionStart;
  var end   = editor.selectionEnd;
  var sel   = editor.value.substring(start, end) || '// your code here';
  var code  = '\n```javascript\n' + sel + '\n```\n';
  editor.value = editor.value.substring(0, start) + code + editor.value.substring(end);
  editor.focus();
  render();
}

function insertTable() {
  var table = '\n| Column 1 | Column 2 | Column 3 |\n|----------|----------|----------|\n| Cell 1   | Cell 2   | Cell 3   |\n| Cell 4   | Cell 5   | Cell 6   |\n';
  var start = editor.selectionStart;
  editor.value = editor.value.substring(0, start) + table + editor.value.substring(start);
  editor.focus();
  render();
}

// ── ACTIONS ──
function clearEditor() {
  if (confirm('Clear all content?')) {
    editor.value = '';
    render();
    editor.focus();
  }
}

function copyHTML() {
  var html = marked.parse(editor.value);
  navigator.clipboard.writeText(html).then(function () {
    showToast('HTML copied to clipboard!');
  });
}

function downloadHTML() {
  var html = marked.parse(editor.value);
  var full = "<!DOCTYPE html><html lang='en'><head><meta charset='UTF-8'>" +
    "<meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
    "<title>Exported Document</title>" +
    "<style>" + previewCSS + "</style></head><body>" + html + "</body></html>";

  var blob = new Blob([full], { type: 'text/html' });
  var a    = document.createElement('a');
  a.href     = URL.createObjectURL(blob);
  a.download = 'document.html';
  a.click();
  showToast('HTML exported!');
}

function showToast(msg) {
  var t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(function () { t.classList.remove('show'); }, 2500);
}

// ── RESIZE HANDLE ──
var handle      = document.getElementById('resizeHandle');
var editorPane  = document.getElementById('editorPane');
var previewPane = document.getElementById('previewPane');
var panesEl     = document.querySelector('.panes');
var isDragging  = false;

handle.addEventListener('mousedown', function () {
  isDragging = true;
  handle.classList.add('dragging');
  document.body.style.cursor     = 'col-resize';
  document.body.style.userSelect = 'none';
});

document.addEventListener('mousemove', function (e) {
  if (!isDragging) return;
  var rect   = panesEl.getBoundingClientRect();
  var offset = e.clientX - rect.left;
  var total  = rect.width - 4;
  var pct    = Math.min(Math.max((offset / total) * 100, 20), 80);
  editorPane.style.flex    = 'none';
  editorPane.style.width   = pct + '%';
  previewPane.style.flex   = '1';
});

document.addEventListener('mouseup', function () {
  if (isDragging) {
    isDragging = false;
    handle.classList.remove('dragging');
    document.body.style.cursor     = '';
    document.body.style.userSelect = '';
  }
});

// ── INIT ──
editor.value = defaultMD;
render();
updateCursor();

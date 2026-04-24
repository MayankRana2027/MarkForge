/**
 * preview.js
 * Handles markdown → HTML rendering and injects styled content into the preview iframe.
 * Owns: previewCSS generation (theme-aware), render(), scroll-sync logic.
 */

'use strict';

// ── PREVIEW STYLESHEET (injected into iframe) ──
function getPreviewCSS(isDark) {
  if (isDark) {
    return [
      ":root{--body-font:'Georgia','Times New Roman',serif;--mono-font:'Courier New',monospace;",
      "--text:#c8c8d8;--bg:#0c0c10;--accent:#7b6ff0;--border:#2a2a38;",
      "--code-bg:#1a1a28;--code-text:#c084fc;--pre-bg:#0a0a14;--pre-text:#d4d4f0;",
      "--quote-border:#4a3f9f;--quote-bg:#13101e;--link:#9b8ff5;--h-color:#e8e8f8;",
      "--mark-bg:rgba(232,197,71,0.25);--mark-text:#e8c547;",
      "--table-head:#1e1a2e;--table-even:#131320;--td-border:#252535;}",
      "*{box-sizing:border-box;}",
      "body{font-family:var(--body-font);color:var(--text);background:var(--bg);",
      "padding:40px 48px;line-height:1.85;max-width:820px;margin:0 auto;font-size:16px;}",
      "h1,h2,h3,h4,h5,h6{font-family:var(--body-font);color:var(--h-color);line-height:1.3;",
      "margin:1.8em 0 0.6em;font-weight:700;}",
      "h1{font-size:2.2em;border-bottom:2px solid var(--accent);padding-bottom:0.3em;margin-top:0;}",
      "h2{font-size:1.65em;border-bottom:1px solid var(--border);padding-bottom:0.2em;}",
      "h3{font-size:1.3em;}h4{font-size:1.1em;}",
      "p{margin:0 0 1.2em;}",
      "a{color:var(--link);text-decoration:underline;text-underline-offset:3px;text-decoration-color:rgba(155,143,245,0.4);}",
      "a:hover{text-decoration-color:var(--link);}",
      "code{background:var(--code-bg);padding:0.15em 0.45em;border-radius:4px;",
      "font-family:var(--mono-font);font-size:0.875em;color:var(--code-text);}",
      "pre{background:var(--pre-bg);color:var(--pre-text);padding:20px 24px;border-radius:10px;",
      "overflow-x:auto;margin:1.5em 0;font-family:var(--mono-font);font-size:0.875em;",
      "line-height:1.6;border-left:4px solid var(--accent);border:1px solid var(--border);}",
      "pre code{background:none;color:inherit;padding:0;font-size:inherit;}",
      "blockquote{border-left:4px solid var(--quote-border);background:var(--quote-bg);",
      "margin:1.5em 0;padding:14px 20px;border-radius:0 8px 8px 0;color:#9090b0;font-style:italic;}",
      "blockquote p{margin:0;}",
      "ul,ol{padding-left:1.8em;margin:0 0 1.2em;}li{margin:0.35em 0;}",
      "li::marker{color:var(--accent);}",
      "input[type=checkbox]{accent-color:var(--accent);margin-right:6px;}",
      "table{border-collapse:collapse;width:100%;margin:1.5em 0;font-size:0.95em;}",
      "th{background:var(--table-head);color:var(--h-color);padding:10px 16px;text-align:left;",
      "font-size:0.9em;border-bottom:2px solid var(--border);}",
      "td{padding:9px 16px;border-bottom:1px solid var(--td-border);}",
      "tr:last-child td{border-bottom:none;}tr:nth-child(even) td{background:var(--table-even);}",
      "img{max-width:100%;border-radius:10px;margin:1em 0;box-shadow:0 4px 20px rgba(0,0,0,0.4);}",
      "hr{border:none;border-top:1px solid var(--border);margin:2.5em 0;}",
      "strong{color:var(--h-color);}del{color:#555575;}",
      "mark{background:var(--mark-bg);color:var(--mark-text);padding:0.1em 0.2em;border-radius:3px;}",
    ].join('');
  } else {
    return [
      ":root{--body-font:'Georgia','Times New Roman',serif;--mono-font:'Courier New',monospace;",
      "--text:#2a2a3a;--bg:#fdfcf8;--accent:#5046a6;--border:#e0dfd8;",
      "--code-bg:#f0eef8;--code-text:#7c3aed;--pre-bg:#1a1a2e;--pre-text:#d4d4f0;",
      "--quote-border:#a89ed0;--quote-bg:#f5f3ff;--link:#5046a6;--h-color:#111120;",
      "--mark-bg:#fef3c7;--mark-text:#92400e;",
      "--table-head:#5046a6;--table-even:#f5f5fb;--td-border:#e8e8f0;}",
      "*{box-sizing:border-box;}",
      "body{font-family:var(--body-font);color:var(--text);background:var(--bg);",
      "padding:40px 48px;line-height:1.85;max-width:820px;margin:0 auto;font-size:16px;}",
      "h1,h2,h3,h4,h5,h6{font-family:var(--body-font);color:var(--h-color);line-height:1.3;",
      "margin:1.8em 0 0.6em;font-weight:700;}",
      "h1{font-size:2.2em;border-bottom:3px solid var(--accent);padding-bottom:0.3em;margin-top:0;}",
      "h2{font-size:1.65em;border-bottom:1px solid var(--border);padding-bottom:0.2em;}",
      "h3{font-size:1.3em;}h4{font-size:1.1em;}",
      "p{margin:0 0 1.2em;}",
      "a{color:var(--link);text-decoration:underline;text-underline-offset:3px;text-decoration-color:rgba(80,70,166,0.35);}",
      "a:hover{text-decoration-color:var(--link);}",
      "code{background:var(--code-bg);padding:0.15em 0.45em;border-radius:4px;",
      "font-family:var(--mono-font);font-size:0.875em;color:var(--code-text);}",
      "pre{background:var(--pre-bg);color:var(--pre-text);padding:20px 24px;border-radius:10px;",
      "overflow-x:auto;margin:1.5em 0;font-family:var(--mono-font);font-size:0.875em;",
      "line-height:1.6;border-left:4px solid var(--accent);}",
      "pre code{background:none;color:inherit;padding:0;font-size:inherit;}",
      "blockquote{border-left:4px solid var(--quote-border);background:var(--quote-bg);",
      "margin:1.5em 0;padding:14px 20px;border-radius:0 8px 8px 0;color:#4a4a6a;font-style:italic;}",
      "blockquote p{margin:0;}",
      "ul,ol{padding-left:1.8em;margin:0 0 1.2em;}li{margin:0.35em 0;}",
      "li::marker{color:var(--accent);}",
      "input[type=checkbox]{accent-color:var(--accent);margin-right:6px;}",
      "table{border-collapse:collapse;width:100%;margin:1.5em 0;font-size:0.95em;}",
      "th{background:var(--accent);color:#fff;padding:10px 16px;text-align:left;font-size:0.9em;}",
      "td{padding:9px 16px;border-bottom:1px solid var(--td-border);}",
      "tr:last-child td{border-bottom:none;}tr:nth-child(even) td{background:var(--table-even);}",
      "img{max-width:100%;border-radius:10px;margin:1em 0;box-shadow:0 4px 20px rgba(0,0,0,0.1);}",
      "hr{border:none;border-top:2px solid var(--border);margin:2.5em 0;}",
      "strong{color:var(--h-color);}del{color:#999;}",
      "mark{background:var(--mark-bg);color:var(--mark-text);padding:0.1em 0.2em;border-radius:3px;}",
    ].join('');
  }
}

// ── MARKED CONFIG ──
marked.setOptions({ breaks: true, gfm: true });

// ── SCROLL SYNC STATE ──
let scrollSyncEnabled = true;

// ── RENDER ──
let renderTimer = null;

function render() {
  const editor = document.getElementById('editor');
  const frame  = document.getElementById('preview-frame');
  if (!editor || !frame) return;

  const md   = editor.value;
  const html = marked.parse(md);
  const isDark = document.documentElement.getAttribute('data-theme') !== 'light';

  const doc = [
    "<!DOCTYPE html><html lang='en'><head><meta charset='UTF-8'>",
    "<meta name='viewport' content='width=device-width,initial-scale=1.0'>",
    "<style>", getPreviewCSS(isDark), "</style></head><body>",
    html, "</body></html>"
  ].join('');

  frame.srcdoc = doc;
}

function scheduleRender(delay) {
  clearTimeout(renderTimer);
  renderTimer = setTimeout(render, delay || 80);
}

function toggleScrollSync() {
  scrollSyncEnabled = !scrollSyncEnabled;
  const btn = document.getElementById('scrollSyncBtn');
  if (btn) btn.classList.toggle('active', scrollSyncEnabled);
  showToast(scrollSyncEnabled ? 'Scroll sync on' : 'Scroll sync off');
}

function syncPreviewScroll(editorEl, frameEl) {
  if (!scrollSyncEnabled) return;
  try {
    const pct = editorEl.scrollTop / (editorEl.scrollHeight - editorEl.clientHeight);
    const fw  = frameEl.contentWindow;
    if (!fw || !fw.document || !fw.document.body) return;
    const body = fw.document.body;
    const maxScroll = body.scrollHeight - fw.innerHeight;
    if (maxScroll > 0) fw.scrollTo(0, pct * maxScroll);
  } catch(e) {}
}

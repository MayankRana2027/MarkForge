/**
 * export.js
 * Handles all export operations: HTML, Markdown (.md), and PDF (via print).
 * Also owns the export dropdown menu toggle.
 */

'use strict';

// ── EXPORT MENU ──
function toggleExportMenu() {
  const menu = document.getElementById('exportMenu');
  if (!menu) return;
  menu.classList.toggle('open');

  if (menu.classList.contains('open')) {
    // Close on outside click
    setTimeout(function() {
      document.addEventListener('click', closeExportOnOutsideClick, { once: true });
    }, 0);
  }
}

function closeExportOnOutsideClick(e) {
  const menu = document.getElementById('exportMenu');
  const btn  = document.getElementById('exportBtn');
  if (menu && !menu.contains(e.target) && e.target !== btn) {
    closeExportMenu();
  }
}

function closeExportMenu() {
  const menu = document.getElementById('exportMenu');
  if (menu) menu.classList.remove('open');
}

// ── SHARED: get current preview CSS ──
function getFullPreviewHTML(title) {
  const editor = document.getElementById('editor');
  const html   = marked.parse(editor.value || '');
  const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
  const css    = getPreviewCSS(isDark);

  return [
    "<!DOCTYPE html><html lang='en'><head>",
    "<meta charset='UTF-8'>",
    "<meta name='viewport' content='width=device-width,initial-scale=1.0'>",
    "<title>", (title || 'Exported Document'), "</title>",
    "<style>", css, "</style>",
    "</head><body>", html, "</body></html>"
  ].join('');
}

// ── DOWNLOAD HELPER ──
function triggerDownload(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const a    = document.createElement('a');
  a.href     = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(function() {
    URL.revokeObjectURL(a.href);
    document.body.removeChild(a);
  }, 100);
}

// ── EXPORT HTML ──
function downloadHTML() {
  const full = getFullPreviewHTML('Exported Document');
  triggerDownload(full, 'document.html', 'text/html;charset=utf-8');
  showToast('Exported as HTML');
}

// ── EXPORT MARKDOWN ──
function downloadMarkdown() {
  const editor  = document.getElementById('editor');
  const content = editor.value;

  // Prepend a YAML front-matter block
  const date    = new Date().toISOString().split('T')[0];
  const words   = content.trim() ? content.trim().split(/\s+/).length : 0;
  const meta = [
    '---',
    'exported: ' + date,
    'words: ' + words,
    '---',
    '',
  ].join('\n');

  triggerDownload(meta + content, 'document.md', 'text/markdown;charset=utf-8');
  showToast('Exported as .md');
}

// ── EXPORT PDF (print dialog) ──
function exportPDF() {
  const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
  // Always use light CSS for PDF (print)
  const editor = document.getElementById('editor');
  const html   = marked.parse(editor.value || '');

  const lightCSS = getPreviewCSS(false) + [
    '@media print {',
    '  body { padding: 20px 30px; font-size: 14px; }',
    '  pre { white-space: pre-wrap; word-break: break-word; }',
    '  a { color: #5046a6 !important; }',
    '  @page { margin: 1in; }',
    '}'
  ].join('');

  const doc = [
    "<!DOCTYPE html><html lang='en'><head>",
    "<meta charset='UTF-8'>",
    "<title>MarkForge Export</title>",
    "<style>", lightCSS, "</style>",
    "</head><body>", html, "</body></html>"
  ].join('');

  const win = window.open('', '_blank');
  if (!win) {
    showToast('Pop-up blocked — allow pop-ups for PDF export', true);
    return;
  }
  win.document.write(doc);
  win.document.close();
  win.focus();
  setTimeout(function() {
    win.print();
    win.close();
  }, 350);
  showToast('Opening print dialog for PDF…');
}

/**
 * main.js
 * Application entry point. Initializes all modules in the correct order,
 * loads saved content or default placeholder, and wires up global events.
 */

'use strict';

// ── DEFAULT CONTENT ──
const DEFAULT_MD = [
  '# Welcome to MarkForge ✦',
  '',
  'A **live** Markdown editor with real-time preview, theme switching, find & replace, auto-save, and multi-format export.',
  '',
  '## ✨ Features',
  '',
  '- ⚡ **Real-time preview** — renders as you type',
  '- 🎨 **Dark / Light theme** — toggle in the header (or use your OS preference)',
  '- 🔍 **Find & Replace** — `Ctrl+H` to open, supports regex & whole-word',
  '- 💾 **Auto-save** — your work is saved to localStorage automatically',
  '- 📤 **Export** — HTML, Markdown (.md), or PDF via print dialog',
  '- ↕️ **Scroll sync** — preview follows editor position',
  '- ⌨️ **Smart editor** — auto-list continuation, bracket pairing, indent selection',
  '',
  '## Keyboard Shortcuts',
  '',
  '| Shortcut | Action |',
  '|:---------|:-------|',
  '| `Ctrl+B` | **Bold** |',
  '| `Ctrl+I` | *Italic* |',
  '| `Ctrl+H` | Find & Replace |',
  '| `Ctrl+S` | Force save |',
  '| `Ctrl+Z` | Undo |',
  '| `Ctrl+Y` | Redo |',
  '| `Tab`    | Indent selection |',
  '',
  '## Code Example',
  '',
  '```javascript',
  'function greet(name) {',
  "  return `Hello, ${name}! 👋`;",
  '}',
  '',
  "console.log(greet('MarkForge'));",
  '```',
  '',
  '## Blockquote',
  '',
  '> *"The best code is no code at all."*',
  '> — Jeff Atwood',
  '',
  '## Task List',
  '',
  '- [x] Live markdown preview',
  '- [x] Find & Replace',
  '- [x] Auto-save to localStorage',
  '- [x] Export HTML / .md / PDF',
  '- [x] Dark & light themes',
  '- [ ] Your next great document ✨',
  '',
  '## Table',
  '',
  '| Feature         | Status     | Notes              |',
  '|:----------------|:----------:|-------------------:|',
  '| Live Preview    | ✅ Active  | 80ms debounce      |',
  '| Toolbar         | ✅ Active  | 15+ insert helpers |',
  '| Auto-save       | ✅ Active  | localStorage       |',
  '| Export HTML     | ✅ Active  | Standalone file    |',
  '| Export .md      | ✅ Active  | With front-matter  |',
  '| Export PDF      | ✅ Active  | Via print dialog   |',
  '| Dark Mode       | ✅ Active  | + OS preference    |',
  '',
  '---',
  '',
  'Start editing to see your changes instantly! 🚀',
].join('\n');

// ── BOOT ──
document.addEventListener('DOMContentLoaded', function () {

  // 1. Apply saved theme (before anything renders)
  initTheme();

  // 2. Restore content from localStorage, or load default
  const { content, meta } = restoreFromLocalStorage();
  const editor = document.getElementById('editor');

  if (content !== null && content !== undefined) {
    editor.value = content;
    if (meta && meta.savedAt) {
      updateLastSaved(meta.savedAt);
    }
    setAutosaveStatus('', 'Restored');
  } else {
    editor.value = DEFAULT_MD;
    setAutosaveStatus('unsaved', 'Unsaved');
  }

  // 3. Init modules (order matters — preview must be first)
  initEditor();
  initAutosave();
  initFindReplace();
  initResize();

  // 4. Initial render + UI update
  render();
  updateLineNumbers();
  updateStatusBar();
  updateCursor();

  // 5. Welcome message if fresh session
  if (content === null) {
    setTimeout(function() { showToast('Welcome to MarkForge!'); }, 400);
  }

  // 6. Close export menu on outside click
  document.addEventListener('click', function(e) {
    const menu = document.getElementById('exportMenu');
    const btn  = document.getElementById('exportBtn');
    if (menu && menu.classList.contains('open') && !menu.contains(e.target) && e.target !== btn) {
      closeExportMenu();
    }
  });

  // 7. Warn before unload if unsaved (belt-and-suspenders; autosave usually catches this)
  window.addEventListener('beforeunload', function(e) {
    if (isDocModified) {
      e.preventDefault();
      e.returnValue = '';
    }
  });

});

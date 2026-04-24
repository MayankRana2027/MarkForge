/**
 * themes.js
 * Owns the dark/light theme toggle. Reads and writes the data-theme
 * attribute on <html>, persists choice to localStorage, and
 * triggers a preview re-render so the iframe styles update too.
 */

'use strict';

const THEME_KEY = 'markforge_theme';

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_KEY, theme);

  // Re-render preview with correct theme CSS
  scheduleRender(0);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  const next    = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  showToast(next === 'dark' ? '🌙 Dark mode' : '☀️ Light mode');
}

function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);

  // Also respect OS preference if no saved preference
  if (saved) {
    applyTheme(saved);
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(prefersDark ? 'dark' : 'light');
  }

  // Listen for OS preference changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
    if (!localStorage.getItem(THEME_KEY)) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });
}

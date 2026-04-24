/**
 * resize.js
 * Manages the draggable resize handle between the editor and preview panes.
 * Persists the split ratio to localStorage so it's remembered across sessions.
 */

'use strict';

const SPLIT_KEY = 'markforge_split_v1';

function initResize() {
  const handle      = document.getElementById('resizeHandle');
  const editorPane  = document.getElementById('editorPane');
  const previewPane = document.getElementById('previewPane');
  const panesEl     = document.getElementById('panesContainer');

  if (!handle || !editorPane || !previewPane || !panesEl) return;

  let isDragging = false;

  // Restore saved split
  const savedPct = parseFloat(localStorage.getItem(SPLIT_KEY));
  if (!isNaN(savedPct) && savedPct > 0) {
    applySplit(editorPane, previewPane, savedPct);
  }

  // Mouse / touch events
  handle.addEventListener('mousedown', startDrag);
  handle.addEventListener('touchstart', startDrag, { passive: true });

  function startDrag(e) {
    isDragging = true;
    handle.classList.add('dragging');
    document.body.style.cursor     = 'col-resize';
    document.body.style.userSelect = 'none';
    // Prevent iframe from eating pointer events
    const frame = document.getElementById('preview-frame');
    if (frame) frame.style.pointerEvents = 'none';
  }

  document.addEventListener('mousemove', onDrag);
  document.addEventListener('touchmove', onDrag, { passive: true });

  function onDrag(e) {
    if (!isDragging) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const rect    = panesEl.getBoundingClientRect();
    const offset  = clientX - rect.left;
    const total   = rect.width - handle.offsetWidth;
    const pct     = Math.min(Math.max((offset / total) * 100, 20), 80);
    applySplit(editorPane, previewPane, pct);
  }

  document.addEventListener('mouseup',  stopDrag);
  document.addEventListener('touchend', stopDrag);

  function stopDrag() {
    if (!isDragging) return;
    isDragging = false;
    handle.classList.remove('dragging');
    document.body.style.cursor     = '';
    document.body.style.userSelect = '';
    const frame = document.getElementById('preview-frame');
    if (frame) frame.style.pointerEvents = '';

    // Save split ratio
    const w = editorPane.style.width || '50%';
    localStorage.setItem(SPLIT_KEY, parseFloat(w));
  }

  // Double-click to reset to 50/50
  handle.addEventListener('dblclick', function() {
    applySplit(editorPane, previewPane, 50);
    localStorage.setItem(SPLIT_KEY, 50);
    showToast('Split reset to 50/50');
  });
}

function applySplit(editorPane, previewPane, pct) {
  editorPane.style.flex  = 'none';
  editorPane.style.width = pct + '%';
  previewPane.style.flex = '1';
}

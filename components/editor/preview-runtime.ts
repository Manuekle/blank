/**
 * Runtime injected into the sandboxed preview. It draws the design-mode layer:
 * hover/selection outlines, centre guides, drag-to-move with grid + centre
 * snapping, arrow-key nudges, and the child-node outline the Layers panel
 * lists. Selection, offsets and measurements travel to the editor through
 * postMessage; this script never touches the parent document.
 *
 * Offsets use `translate` (relative positioning for plain inline boxes, which
 * ignore transforms), so moving a child never reflows its siblings or resizes
 * its parent.
 */
export const previewRuntimeScript = `
window.blankSelectedKey = window.blankSelectedKey ?? null;
window.blankSelection = null;
window.blankGrid = window.blankGrid ?? true;
window.blankGuides = window.blankGuides ?? false;

const send = (message) => parent.postMessage(message, '*');

function canvasRoot() {
  return document.querySelector('#root > *');
}

function nodeKey(node) {
  return [...node.classList].find(name => /^blank-[A-Za-z0-9_-]+__[A-Za-z0-9_-]+$/.test(name)) || null;
}

/** The nearest child node under the pointer, so an icon or text inside a node selects the node. */
function selectable(target) {
  const root = canvasRoot();
  let node = target instanceof Element ? target : null;
  while (node && root && node !== root && root.contains(node)) {
    const key = nodeKey(node);
    if (key) return { node, key };
    node = node.parentElement;
  }
  return null;
}

/** Overrides target a class, so every instance of it moves together. */
function instances(key) {
  const root = document.getElementById('root');
  return root ? [...root.querySelectorAll('.' + CSS.escape(key))] : [];
}

function label(node, key) {
  return key.replace('__', ' · ').replace(/^blank-/, '') + ' (' + node.tagName.toLowerCase() + ')';
}

const layer = document.createElement('div');
layer.id = 'blank-layer';
layer.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:2147483647';
document.body.appendChild(layer);

const guides = document.createElement('div');
guides.id = 'blank-guides';
guides.style.cssText = 'position:fixed;inset:0;pointer-events:none;display:none';
const guideY = document.createElement('span');
guideY.style.cssText = 'position:absolute;top:50%;left:0;right:0;height:1px;background:rgba(46,111,255,.55);opacity:.35';
const guideX = document.createElement('span');
guideX.style.cssText = 'position:absolute;left:50%;top:0;bottom:0;width:1px;background:rgba(255,255,255,.55);opacity:.35';
guides.append(guideY, guideX);
document.body.appendChild(guides);

const box = document.createElement('div');
box.style.cssText = 'position:fixed;pointer-events:none;outline:1px solid rgba(46,111,255,.9);outline-offset:1px;display:none';
const tag = document.createElement('span');
tag.style.cssText = 'position:absolute;top:-17px;left:-1px;padding:2px 5px;border-radius:3px;background:#2e6fff;color:#fff;font:10px/1.2 ui-sans-serif,system-ui,sans-serif;white-space:nowrap';
box.appendChild(tag);
layer.appendChild(box);

const hover = document.createElement('div');
hover.style.cssText = 'position:fixed;pointer-events:none;outline:1px dashed rgba(46,111,255,.75);display:none';
layer.appendChild(hover);

/** The marquee band the user draws to select whatever falls inside it. */
const band = document.createElement('div');
band.style.cssText = 'position:fixed;pointer-events:none;display:none;background:rgba(46,111,255,.12);border:1px solid rgba(46,111,255,.85);border-radius:2px';
layer.appendChild(band);

function place(element, rect) {
  element.style.display = 'block';
  element.style.left = rect.left + 'px';
  element.style.top = rect.top + 'px';
  element.style.width = rect.width + 'px';
  element.style.height = rect.height + 'px';
}

function setGuidesVisible(visible) {
  guides.style.display = visible ? 'block' : 'none';
  if (!visible) {
    guideX.style.opacity = '.35';
    guideY.style.opacity = '.35';
  }
}

/** Guides cross at the component's centre, the point centre snapping aims for. */
function positionGuides() {
  const root = canvasRoot();
  if (!root) return;
  const rect = root.getBoundingClientRect();
  guideX.style.left = Math.round(rect.left + rect.width / 2) + 'px';
  guideY.style.top = Math.round(rect.top + rect.height / 2) + 'px';
}

const px = value => {
  const number = parseFloat(value);
  return Number.isFinite(number) ? Math.round(number * 100) / 100 : 0;
};

function hex(color) {
  const match = /^rgba?[(]([^)]*)[)]$/.exec(color);
  if (!match) return color;
  const parts = match[1].split(/[ ,/]+/).filter(Boolean).map(Number);
  const alpha = parts.length > 3 ? parts[3] : 1;
  if (alpha === 0) return 'transparent';
  const byte = value => Math.round(Math.max(0, Math.min(255, value))).toString(16).padStart(2, '0');
  return '#' + byte(parts[0]) + byte(parts[1]) + byte(parts[2]) + (alpha < 1 ? byte(alpha * 255) : '');
}

/** Plain inline boxes ignore translate, so they are offset with relative positioning. */
function readOffset(node, style) {
  if (style.display === 'inline') {
    const relative = style.position === 'relative';
    return { mode: 'relative', x: relative ? px(style.left) : 0, y: relative ? px(style.top) : 0 };
  }
  const parts = style.translate === 'none' ? [] : style.translate.split(' ');
  return { mode: 'translate', x: px(parts[0] || '0'), y: px(parts[1] || '0') };
}

const alignments = { auto: 'auto', normal: 'auto', start: 'start', 'flex-start': 'start', 'self-start': 'start', center: 'center', end: 'end', 'flex-end': 'end', 'self-end': 'end', stretch: 'stretch' };
const textAlignments = { start: 'start', left: 'start', center: 'center', '-webkit-center': 'center', end: 'end', right: 'end' };

/** The selected child's computed style, so the inspector shows real values for anything not overridden. */
function measure(entry) {
  const { node, key } = entry;
  const style = getComputedStyle(node);
  const offset = readOffset(node, style);
  const rect = node.getBoundingClientRect();
  const fontSize = px(style.fontSize);
  const tracking = style.letterSpacing === 'normal' ? 0 : px(style.letterSpacing) / (fontSize || 16);
  return {
    key,
    x: offset.x,
    y: offset.y,
    width: style.width === 'auto' ? Math.round(rect.width) : px(style.width),
    height: style.height === 'auto' ? Math.round(rect.height) : px(style.height),
    paddingX: px(style.paddingLeft),
    paddingY: px(style.paddingTop),
    background: hex(style.backgroundColor),
    color: hex(style.color),
    radius: px(style.borderTopLeftRadius),
    opacity: Math.round(Number(style.opacity) * 100),
    fontSize,
    fontWeight: Number(style.fontWeight) || 400,
    letterSpacing: Math.round(tracking * 1000) / 1000,
    alignSelf: alignments[style.alignSelf] || 'auto',
    textAlign: textAlignments[style.textAlign] || 'start',
    display: style.display,
    parentDisplay: node.parentElement ? getComputedStyle(node.parentElement).display : 'block',
  };
}

let lastMetrics = '';
function reportMetrics(entry) {
  const metrics = entry ? measure(entry) : null;
  const serialized = JSON.stringify(metrics);
  if (serialized === lastMetrics) return;
  lastMetrics = serialized;
  send({ type: 'blank:metrics', metrics });
}

let lastNodes = '';
/** Every child class once, in document order, with its nesting depth for the Layers panel. */
function reportNodes() {
  const root = canvasRoot();
  if (!root) return;
  const found = new Map();
  for (const element of root.querySelectorAll('*')) {
    const key = nodeKey(element);
    if (!key) continue;
    const known = found.get(key);
    if (known) { known.count++; continue; }
    let depth = 0;
    for (let ancestor = element.parentElement; ancestor && ancestor !== root; ancestor = ancestor.parentElement) {
      if (nodeKey(ancestor)) depth++;
    }
    found.set(key, { key, tag: element.tagName.toLowerCase(), depth, count: 1 });
  }
  const nodes = [...found.values()];
  const serialized = JSON.stringify(nodes);
  if (serialized === lastNodes) return;
  lastNodes = serialized;
  send({ type: 'blank:nodes', nodes });
}

let drag = null;
let pending = null;
let suppressClick = false;
let cursorNode = null;
let cursorBefore = '';

let bandDrag = null;

function placeBand(x1, y1, x2, y2) {
  band.style.left = Math.min(x1, x2) + 'px';
  band.style.top = Math.min(y1, y2) + 'px';
  band.style.width = Math.abs(x2 - x1) + 'px';
  band.style.height = Math.abs(y2 - y1) + 'px';
}

/** Closes the marquee: a plain click clears the selection, a real band
    picks the deepest node it touches, like the click's own pick rule. */
function finishBand(event, cancelled) {
  if (!bandDrag) return;
  if (event && event.pointerId !== bandDrag.pointerId) return;

  const entry = bandDrag;
  bandDrag = null;
  band.style.display = 'none';
  document.body.style.cursor = '';
  if (entry.previousSelect) document.body.style.userSelect = entry.previousSelect;
  else document.body.style.removeProperty('user-select');

  if (!entry.moved || cancelled) {
    if (window.blankSelectedKey) setSelection(null);
    return;
  }

  const left = Math.min(entry.startX, entry.x);
  const top = Math.min(entry.startY, entry.y);
  const right = Math.max(entry.startX, entry.x);
  const bottom = Math.max(entry.startY, entry.y);
  const root = canvasRoot();
  let best = null;
  let bestArea = Infinity;
  if (root) {
    for (const element of root.querySelectorAll('*')) {
      const key = nodeKey(element);
      if (!key) continue;
      const rect = element.getBoundingClientRect();
      if (rect.right < left || rect.left > right || rect.bottom < top || rect.top > bottom) continue;
      const area = rect.width * rect.height;
      if (area < bestArea) { bestArea = area; best = { node: element, key }; }
    }
  }

  // A real marquee must not also trigger the component's own onClick.
  suppressClick = true;
  window.setTimeout(() => { suppressClick = false; }, 400);
  setSelection(best);
}

/** Keeps the instance the user clicked while it still carries the selected class. */
function resolveSelection() {
  const key = window.blankSelectedKey;
  const current = window.blankSelection;
  if (!key) window.blankSelection = null;
  else if (!current || current.key !== key || !current.node.isConnected || !current.node.classList.contains(key)) {
    const node = instances(key)[0];
    window.blankSelection = node ? { node, key } : null;
  }
  return window.blankSelection;
}

function refresh() {
  // While a drag is in flight the box tracks the pointer instead.
  if (drag && drag.moved) return;
  setGuidesVisible(window.blankGuides);
  positionGuides();
  const selected = resolveSelection();
  if (!selected) {
    box.style.display = 'none';
    reportMetrics(null);
    return;
  }
  place(box, selected.node.getBoundingClientRect());
  tag.textContent = label(selected.node, selected.key);
  reportMetrics(selected);
}

let frame = 0;
function scheduleRefresh() {
  if (frame) return;
  frame = requestAnimationFrame(() => {
    frame = 0;
    refresh();
  });
}

function setSelection(entry) {
  setCursor(null);
  window.blankSelectedKey = entry ? entry.key : null;
  window.blankSelection = entry;
  refresh();
  send({ type: 'blank:select', key: entry ? entry.key : null });
}

function setCursor(node, next) {
  if (cursorNode && cursorNode !== node) cursorNode.style.cursor = cursorBefore;
  if (!node) { cursorNode = null; cursorBefore = ''; return; }
  if (cursorNode !== node) { cursorBefore = node.style.cursor; cursorNode = node; }
  node.style.cursor = next;
}

/** Pixels that would centre the node on the component, when it is close enough to snap. */
function centreSnap(node) {
  const root = canvasRoot();
  if (!root) return { x: null, y: null };
  const rect = node.getBoundingClientRect();
  const bounds = root.getBoundingClientRect();
  const dx = Math.round(bounds.left + bounds.width / 2 - (rect.left + rect.width / 2));
  const dy = Math.round(bounds.top + bounds.height / 2 - (rect.top + rect.height / 2));
  return { x: Math.abs(dx) <= 4 ? dx : null, y: Math.abs(dy) <= 4 ? dy : null };
}

const OFFSET_PROPERTIES = ['translate', 'position', 'left', 'top'];
const INLINE_PROPERTIES = [...OFFSET_PROPERTIES, 'transition', 'touch-action'];

function saveInline(node) {
  return Object.fromEntries(INLINE_PROPERTIES.map(property => [property, node.style.getPropertyValue(property)]));
}

function restoreInline(entry, properties = INLINE_PROPERTIES) {
  entry.targets.forEach((node, index) => {
    for (const property of properties) node.style.setProperty(property, entry.saved[index][property]);
  });
}

function applyOffset(entry, x, y) {
  for (const node of entry.targets) {
    if (entry.mode === 'relative') {
      node.style.position = 'relative';
      node.style.left = x + 'px';
      node.style.top = y + 'px';
    } else {
      node.style.translate = x + 'px ' + y + 'px';
    }
  }
}

/** Drops the held drop position once the editor's CSS places the node there too, or when forced. */
function settle(force) {
  if (!pending) return;
  const entry = pending;
  if (!force) {
    const node = entry.node;
    const saved = entry.saved[entry.targets.indexOf(node)];
    const held = saveInline(node);
    for (const property of OFFSET_PROPERTIES) node.style.setProperty(property, saved[property]);
    const offset = readOffset(node, getComputedStyle(node));
    const arrived = Math.abs(offset.x - entry.x) < 0.5 && Math.abs(offset.y - entry.y) < 0.5;
    if (!arrived) {
      for (const property of OFFSET_PROPERTIES) node.style.setProperty(property, held[property]);
      return;
    }
  }
  clearTimeout(entry.timer);
  pending = null;
  restoreInline(entry);
  refresh();
}

function finish(event, cancelled) {
  if (!drag) return;
  if (event && event.pointerId !== drag.pointerId) return;

  const entry = drag;
  drag = null;

  if (entry.previousSelect) document.body.style.userSelect = entry.previousSelect;
  else document.body.style.removeProperty('user-select');
  if (entry.node.hasPointerCapture?.(entry.pointerId)) entry.node.releasePointerCapture(entry.pointerId);
  restoreInline(entry, ['touch-action']);
  setCursor(null);

  if (entry.moved) {
    // A real drag must not also trigger the component's own onClick.
    suppressClick = true;
    window.setTimeout(() => { suppressClick = false; }, 400);
  }

  const dx = entry.x - entry.base.x;
  const dy = entry.y - entry.base.y;
  if (!entry.moved || cancelled || (dx === 0 && dy === 0)) {
    restoreInline(entry);
    refresh();
    return;
  }

  // The dropped position is held until the editor's CSS arrives, so the node never jumps back.
  pending = entry;
  entry.timer = window.setTimeout(() => settle(true), 2000);
  send({ type: 'blank:drag', key: entry.key, dx, dy, mode: entry.mode });
  refresh();
}

let panDrag = null;
let spaceDown = false;

window.addEventListener('keydown', event => { if (event.code === 'Space') spaceDown = true; }, true);
window.addEventListener('keyup', event => { if (event.code === 'Space') spaceDown = false; }, true);

window.addEventListener('wheel', event => {
  event.preventDefault();
  send({ type: 'blank:viewport', event: {
    kind: 'zoom',
    deltaY: event.deltaY,
    x: event.clientX,
    y: event.clientY,
    width: window.innerWidth,
    height: window.innerHeight,
  } });
}, { passive: false });

document.addEventListener('pointerdown', event => {
  if ((spaceDown || event.button === 1) && !drag) {
    event.preventDefault();
    panDrag = { x: event.clientX, y: event.clientY };
    document.body.style.cursor = 'grabbing';
    return;
  }
  if (event.button !== 0 || !event.isPrimary || drag) return;
  settle(true);

  const target = selectable(event.target);
  // An empty canvas starts a marquee band; a plain click on it clears the child selection.
  if (!target) {
    bandDrag = {
      startX: event.clientX,
      startY: event.clientY,
      x: event.clientX,
      y: event.clientY,
      moved: false,
      pointerId: event.pointerId,
      previousSelect: document.body.style.userSelect,
    };
    document.body.style.cursor = 'crosshair';
    document.body.style.userSelect = 'none';
    event.preventDefault();
    return;
  }

  const offset = readOffset(target.node, getComputedStyle(target.node));
  const targets = instances(target.key);
  suppressClick = false;
  drag = {
    node: target.node,
    key: target.key,
    targets,
    saved: targets.map(saveInline),
    mode: offset.mode,
    base: { x: offset.x, y: offset.y },
    x: offset.x,
    y: offset.y,
    startX: event.clientX,
    startY: event.clientY,
    moved: false,
    pointerId: event.pointerId,
    previousSelect: document.body.style.userSelect,
  };
  target.node.setPointerCapture?.(event.pointerId);
  target.node.style.touchAction = 'none';
  document.body.style.userSelect = 'none';
  hover.style.display = 'none';
  setSelection(target);
}, true);

document.addEventListener('pointermove', event => {
  if (panDrag) {
    send({ type: 'blank:viewport', event: { kind: 'pan', dx: event.clientX - panDrag.x, dy: event.clientY - panDrag.y } });
    panDrag = { x: event.clientX, y: event.clientY };
    return;
  }
  if (bandDrag && event.pointerId === bandDrag.pointerId) {
    if (!bandDrag.moved && Math.abs(event.clientX - bandDrag.startX) + Math.abs(event.clientY - bandDrag.startY) > 3) {
      bandDrag.moved = true;
      band.style.display = 'block';
    }
    if (bandDrag.moved) {
      bandDrag.x = event.clientX;
      bandDrag.y = event.clientY;
      placeBand(bandDrag.startX, bandDrag.startY, event.clientX, event.clientY);
    }
    return;
  }
  if (drag && event.pointerId === drag.pointerId) {
    setCursor(drag.node, 'grabbing');

    let rawX = event.clientX - drag.startX;
    let rawY = event.clientY - drag.startY;
    if (!drag.moved && Math.abs(rawX) + Math.abs(rawY) <= 3) return;
    if (!drag.moved) {
      drag.moved = true;
      // Guides only appear once the drag is real, so a plain click stays quiet.
      setGuidesVisible(true);
      positionGuides();
      for (const node of drag.targets) node.style.transition = 'none';
    }

    // Shift keeps the move on its main axis.
    const lockX = event.shiftKey && Math.abs(rawY) > Math.abs(rawX);
    const lockY = event.shiftKey && !lockX;
    if (lockX) rawX = 0;
    if (lockY) rawY = 0;

    // The offset itself lands on the grid, whatever it started from. Alt (Option) moves freely.
    const step = window.blankGrid && !event.altKey ? 8 : 1;
    let x = lockX ? drag.base.x : Math.round((drag.base.x + rawX) / step) * step;
    let y = lockY ? drag.base.y : Math.round((drag.base.y + rawY) / step) * step;
    applyOffset(drag, x, y);

    const snap = event.altKey ? { x: null, y: null } : centreSnap(drag.node);
    const snapX = snap.x !== null && !lockX;
    const snapY = snap.y !== null && !lockY;
    if (snapX) x += snap.x;
    if (snapY) y += snap.y;
    if ((snapX && snap.x) || (snapY && snap.y)) applyOffset(drag, x, y);
    guideX.style.opacity = snapX ? '1' : '.35';
    guideY.style.opacity = snapY ? '1' : '.35';

    drag.x = x;
    drag.y = y;
    place(box, drag.node.getBoundingClientRect());
    tag.textContent = label(drag.node, drag.key) + '  ' + x + ', ' + y;
    return;
  }

  const target = selectable(event.target);
  if (!target) { hover.style.display = 'none'; setCursor(null); return; }
  setCursor(target.node, 'move');
  place(hover, target.node.getBoundingClientRect());
}, true);

document.addEventListener('pointerup', event => {
  if (panDrag) {
    panDrag = null;
    document.body.style.cursor = '';
    return;
  }
  if (bandDrag) { finishBand(event, false); return; }
  finish(event, false);
}, true);
document.addEventListener('pointercancel', event => { finishBand(event, true); finish(event, true); }, true);

document.documentElement.addEventListener('pointerleave', () => {
  if (drag) return;
  hover.style.display = 'none';
  setCursor(null);
});

window.addEventListener('blur', () => {
  finish(null, true);
  finishBand(null, true);
  panDrag = null;
  spaceDown = false;
  document.body.style.cursor = '';
});

document.addEventListener('click', event => {
  if (!suppressClick) return;
  suppressClick = false;
  event.stopPropagation();
  event.preventDefault();
}, true);

// Arrow keys belong to the component while one of its own controls has focus.
const KEY_OWNERS = 'input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="radio"], [role="slider"], [role="tab"], [role="option"], [role="menuitem"], [role="menuitemradio"], [role="menuitemcheckbox"], [role="spinbutton"], [role="combobox"], [role="listbox"], [role="grid"], [role="gridcell"], [role="tree"], [role="treeitem"], [role="scrollbar"]';
const NUDGES = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    if (drag) { finish(null, true); return; }
    if (bandDrag) { finishBand(null, true); return; }
    if (window.blankSelectedKey) setSelection(null);
    return;
  }

  // Undo and redo belong to the editor; forward them unless a component
  // field is using its own undo stack.
  if (event.metaKey || event.ctrlKey) {
    if (event.altKey) return;
    const key = event.key.toLowerCase();
    if (key !== 'z' && key !== 'y') return;
    if (event.target instanceof Element && event.target.closest('input, textarea, select, [contenteditable]')) return;
    event.preventDefault();
    send({ type: 'blank:undo', redo: key === 'y' || event.shiftKey });
    return;
  }

  const nudge = NUDGES[event.key];
  if (!nudge || drag || event.metaKey || event.ctrlKey || event.altKey) return;
  if (event.target instanceof Element && event.target.closest(KEY_OWNERS)) return;
  const selected = resolveSelection();
  if (!selected) return;

  event.preventDefault();
  settle(true);
  const step = event.shiftKey ? 8 : 1;
  const offset = readOffset(selected.node, getComputedStyle(selected.node));
  send({ type: 'blank:drag', key: selected.key, dx: nudge[0] * step, dy: nudge[1] * step, mode: offset.mode });
}, true);

window.addEventListener('message', event => {
  if (event.source !== parent) return;
  const type = event.data?.type;

  // The pointer can be released outside the preview; the editor forwards it.
  if (type === 'blank:release') finish(null, false);
  else if (type === 'blank:cancel') finish(null, true);
  else if (type === 'blank:update') {
    // New CSS may be the dropped offset arriving.
    settle(false);
    refresh();
    scheduleRefresh();
  } else if (type === 'blank:design') {
    window.blankGrid = !!event.data.grid;
    window.blankGuides = !!event.data.guides;
    window.blankSelectedKey = event.data.selected || null;
    if (!drag) setCursor(null);
    refresh();
  }
});

// Only the component subtree is observed, so the overlay's own DOM updates
// never re-enter refresh().
const observed = document.getElementById('root') ?? document.body;
new MutationObserver(records => {
  refresh();
  if (records.some(record => record.type === 'childList' || record.attributeName === 'class')) reportNodes();
}).observe(observed, { subtree: true, childList: true, attributes: true });

// Transitions, scrolling and resizes move nodes without touching the DOM.
document.addEventListener('transitionend', scheduleRefresh, true);
document.addEventListener('scroll', scheduleRefresh, true);
window.addEventListener('resize', scheduleRefresh);

refresh();
reportNodes();
`;

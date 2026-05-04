// ─── main.js — UI Controller ──────────────────────────────────────────────────

// ── State ─────────────────────────────────────────────────────────────────────

const avl    = new AVLTree();
const rbt    = new RBTree();

let activeMode  = 'avl';   // 'avl' | 'rbt' | 'both'
let steps       = [];      // current operation's step snapshots
let stepIndex   = 0;       // which step we're on
let autoTimer   = null;    // setInterval handle for auto-play
let searchPath  = [];      // highlighted search path nodes

// ── DOM refs ──────────────────────────────────────────────────────────────────

const inputEl     = document.getElementById('inputVal');
const logEl       = document.getElementById('log');
const stepLabelEl = document.getElementById('stepLabel');
const canvasAVL   = document.getElementById('canvasAVL');
const canvasRBT   = document.getElementById('canvasRBT');
const avlPanel    = document.getElementById('avlPanel');
const rbtPanel    = document.getElementById('rbtPanel');
const speedEl     = document.getElementById('speed');

// ── Helpers ───────────────────────────────────────────────────────────────────

function logMsg(msg, type = 'info') {
  const div = document.createElement('div');
  div.className = `log-entry log-${type}`;
  div.textContent = msg;
  logEl.prepend(div);
  // Keep log short
  while (logEl.children.length > 30) logEl.removeChild(logEl.lastChild);
}

function getVal() {
  const v = parseInt(inputEl.value);
  if (isNaN(v)) { logMsg('⚠ Enter a valid number', 'warn'); return null; }
  return v;
}

function redraw(highlight = null, nilRef = null) {
  if (activeMode !== 'rbt') {
    drawTree(canvasAVL, avl.root, 'avl', highlight, null, searchPath);
  }
  if (activeMode !== 'avl') {
    drawTree(canvasRBT, rbt.root, 'rbt', highlight, rbt.NIL, searchPath);
  }
}

function showStep(idx) {
  if (!steps.length) return;
  const s = steps[idx];
  stepLabelEl.textContent = `Step ${idx + 1} / ${steps.length}: ${s.message}`;

  if (activeMode === 'avl' || activeMode === 'both') {
    // For AVL steps, use AVL step tree
    if (activeMode !== 'rbt')
      drawTree(canvasAVL, s.tree, 'avl', s.highlight, null, []);
  }
  if (activeMode === 'rbt' || activeMode === 'both') {
    // For RBT steps
    if (activeMode !== 'avl')
      drawTree(canvasRBT, s.tree, 'rbt', s.highlight, s.nil || rbt.NIL, []);
  }
}

function startStepMode(newSteps) {
  stopAuto();
  searchPath = [];
  steps      = newSteps;
  stepIndex  = 0;
  document.getElementById('stepControls').style.display = 'flex';
  showStep(0);
}

function stopAuto() {
  if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
  document.getElementById('autoBtn').textContent = '▶ Auto';
}

// ── Layout: show/hide panels ──────────────────────────────────────────────────

function setMode(mode) {
  activeMode = mode;
  avlPanel.style.display = (mode === 'avl' || mode === 'both') ? 'flex' : 'none';
  rbtPanel.style.display = (mode === 'rbt' || mode === 'both') ? 'flex' : 'none';

  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.getElementById(`tab-${mode}`).classList.add('active');

  steps     = [];
  stepIndex = 0;
  stepLabelEl.textContent = '';
  document.getElementById('stepControls').style.display = 'none';

  redraw();
}

// ── Operations ────────────────────────────────────────────────────────────────

function doInsert() {
  const val = getVal();
  if (val === null) return;
  searchPath = [];

  if (activeMode === 'avl' || activeMode === 'both') avl.insert(val);
  if (activeMode === 'rbt' || activeMode === 'both') rbt.insert(val);

  const src   = activeMode === 'rbt' ? rbt : avl;
  const allSteps = src.steps;

  logMsg(`➕ Inserted ${val}`, 'success');
  inputEl.value = '';

  if (allSteps.length > 1) {
    startStepMode(allSteps);
  } else {
    steps = [];
    document.getElementById('stepControls').style.display = 'none';
    stepLabelEl.textContent = `Inserted ${val} — no rotations needed`;
    redraw(val);
  }
}

function doDelete() {
  const val = getVal();
  if (val === null) return;
  searchPath = [];

  if (activeMode === 'avl' || activeMode === 'both') avl.delete(val);
  if (activeMode === 'rbt' || activeMode === 'both') rbt.delete(val);

  const src = activeMode === 'rbt' ? rbt : avl;
  logMsg(`⌫ Deleted ${val}`, 'warn');
  inputEl.value = '';
  startStepMode(src.steps);
}

function doSearch() {
  const val = getVal();
  if (val === null) return;
  steps = [];
  document.getElementById('stepControls').style.display = 'none';

  let result;
  if (activeMode === 'avl' || activeMode === 'both') {
    result     = avl.search(val);
    searchPath = result.path;
    drawTree(canvasAVL, avl.root, 'avl', result.found ? val : null, null, searchPath);
    logMsg(result.found ? `🔍 Found ${val} — path: ${result.path.join(' → ')}` : `✗ ${val} not found`, result.found ? 'success' : 'warn');
  }
  if (activeMode === 'rbt' || activeMode === 'both') {
    result     = rbt.search(val);
    searchPath = result.path;
    drawTree(canvasRBT, rbt.root, 'rbt', result.found ? val : null, rbt.NIL, searchPath);
    if (activeMode === 'rbt')
      logMsg(result.found ? `🔍 Found ${val} — path: ${result.path.join(' → ')}` : `✗ ${val} not found`, result.found ? 'success' : 'warn');
  }
  stepLabelEl.textContent = result.found ? `Found ${val} in ${result.path.length} steps` : `${val} not in tree`;
}

function doReset() {
  avl.root  = null;
  rbt.root  = rbt.NIL;
  steps     = [];
  searchPath = [];
  stepIndex = 0;
  stopAuto();
  stepLabelEl.textContent = '';
  document.getElementById('stepControls').style.display = 'none';
  redraw();
  logMsg('🔄 Tree cleared', 'info');
}

function doRandom() {
  doReset();
  const count  = 9;
  const values = [];
  while (values.length < count) {
    const v = Math.floor(Math.random() * 99) + 1;
    if (!values.includes(v)) values.push(v);
  }
  values.forEach(v => {
    if (activeMode === 'avl' || activeMode === 'both') avl.insert(v);
    if (activeMode === 'rbt' || activeMode === 'both') rbt.insert(v);
  });
  steps = [];
  document.getElementById('stepControls').style.display = 'none';
  stepLabelEl.textContent = `Random: ${values.join(', ')}`;
  logMsg(`🎲 Random: ${values.join(', ')}`, 'info');
  redraw();
}

// Preset sequences that trigger specific rotations
const PRESETS = {
  ll:  [30, 20, 10],
  rr:  [10, 20, 30],
  lr:  [30, 10, 20],
  rl:  [10, 30, 20],
  full:[50, 30, 70, 20, 40, 60, 80, 10, 25]
};

function doPreset(key) {
  doReset();
  PRESETS[key].forEach(v => {
    if (activeMode === 'avl' || activeMode === 'both') avl.insert(v);
    if (activeMode === 'rbt' || activeMode === 'both') rbt.insert(v);
  });
  steps = [];
  document.getElementById('stepControls').style.display = 'none';
  stepLabelEl.textContent = `Preset "${key}": ${PRESETS[key].join(', ')}`;
  logMsg(`📌 Preset ${key.toUpperCase()}: ${PRESETS[key].join(', ')}`, 'info');
  redraw();
}

// ── Step controls ─────────────────────────────────────────────────────────────

function stepPrev() {
  stopAuto();
  if (stepIndex > 0) { stepIndex--; showStep(stepIndex); }
}

function stepNext() {
  if (stepIndex < steps.length - 1) {
    stepIndex++;
    showStep(stepIndex);
  } else {
    stopAuto();
    // Show final committed tree
    redraw(steps[steps.length - 1]?.highlight);
  }
}

function stepAuto() {
  if (autoTimer) { stopAuto(); return; }
  document.getElementById('autoBtn').textContent = '⏸ Pause';
  const delay = 1600 - parseInt(speedEl.value) * 15;  // 100ms–1600ms range
  autoTimer = setInterval(() => {
    if (stepIndex < steps.length - 1) {
      stepIndex++;
      showStep(stepIndex);
    } else {
      stopAuto();
      redraw(steps[steps.length - 1]?.highlight);
    }
  }, delay);
}

function stepFirst() { stopAuto(); stepIndex = 0; showStep(0); }
function stepLast()  { stopAuto(); stepIndex = steps.length - 1; showStep(stepIndex); }

// ── Keyboard shortcut ─────────────────────────────────────────────────────────

document.addEventListener('keydown', e => {
  if (e.target === inputEl) {
    if (e.key === 'Enter') doInsert();
    return;
  }
  if (e.key === 'ArrowRight') stepNext();
  if (e.key === 'ArrowLeft')  stepPrev();
});

// ── Init ──────────────────────────────────────────────────────────────────────

window.addEventListener('load', () => {
  // Small delay so browser has painted and canvas has real CSS dimensions
  setTimeout(() => {
    setMode('avl');
    logMsg('Ready — insert values to begin', 'info');
  }, 50);
});

// Redraw on window resize so tree stays centered
window.addEventListener('resize', () => {
  redraw();
});

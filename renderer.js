// ─── Renderer ─────────────────────────────────────────────────────────────────

const RADIUS    = 22;
const V_GAP     = 75;
const MIN_H_GAP = 58;

function computeLayout(root, nilRef) {
  if (!root || root === nilRef || root.val === null) return [];

  function subtreeWidth(node) {
    if (!node || node === nilRef || node.val === null) return 0;
    const l = subtreeWidth(node.left);
    const r = subtreeWidth(node.right);
    node._w = Math.max(l + r, 1);
    return node._w;
  }
  subtreeWidth(root);

  let counter = 0;
  function assignX(node) {
    if (!node || node === nilRef || node.val === null) return;
    assignX(node.left);
    node._x = counter * MIN_H_GAP;
    counter++;
    assignX(node.right);
  }
  function assignY(node, depth) {
    if (!node || node === nilRef || node.val === null) return;
    node._y = depth * V_GAP;
    assignY(node.left,  depth + 1);
    assignY(node.right, depth + 1);
  }
  assignX(root);
  assignY(root, 0);

  const positions = [];
  function collect(node) {
    if (!node || node === nilRef || node.val === null) return;
    positions.push(node);
    collect(node.left);
    collect(node.right);
  }
  collect(root);
  return positions;
}

function drawTree(canvas, root, mode, highlight, nilRef, searchPath = []) {
  // Always use the HTML attribute dimensions — these are the actual pixel buffer
  // CSS may scale the display but drawing coords use attribute width/height
  const W   = canvas.width;   // 1200
  const H   = canvas.height;  // 450
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, W, H);

  // Background fill (in case CSS background doesn't show)
  ctx.fillStyle = '#1a1d27';
  ctx.fillRect(0, 0, W, H);

  if (!root || root === nilRef || root.val === null) {
    ctx.fillStyle    = '#4a5568';
    ctx.font         = '20px monospace';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Empty — insert a value or click a preset', W / 2, H / 2);
    return;
  }

  const positions = computeLayout(root, nilRef);
  if (!positions.length) return;

  const xs   = positions.map(n => n._x);
  const ys   = positions.map(n => n._y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const treeW = (maxX - minX) || 1;
  const treeH = (maxY - minY) || 1;

  const padX  = RADIUS * 4;
  const padY  = RADIUS * 4;
  const scale = Math.min(
    (W - padX * 2) / treeW,
    (H - padY * 2) / treeH,
    2.0
  );

  const offX = (W - treeW * scale) / 2 - minX * scale;
  const offY = padY - minY * scale;

  function tx(x) { return x * scale + offX; }
  function ty(y) { return y * scale + offY; }

  // Draw edges
  positions.forEach(node => {
    ['left', 'right'].forEach(dir => {
      const child = node[dir];
      if (!child || child === nilRef || child.val === null) return;
      ctx.beginPath();
      ctx.moveTo(tx(node._x), ty(node._y));
      ctx.lineTo(tx(child._x), ty(child._y));
      ctx.strokeStyle = '#3a4055';
      ctx.lineWidth   = 2;
      ctx.stroke();
    });
  });

  // Draw nodes
  const r = Math.max(RADIUS * Math.min(scale, 1), 18);

  positions.forEach(node => {
    const cx = tx(node._x);
    const cy = ty(node._y);

    const isHighlight  = highlight !== null && node.val === highlight;
    const isSearchPath = searchPath.includes(node.val);

    let fill = '#4a5568';
    if (mode === 'rbt') fill = node.color === 'red' ? '#c0392b' : '#2c3e50';
    if (isSearchPath && !isHighlight) fill = '#6b46c1';
    if (isHighlight) fill = '#d97706';

    // Glow
    if (isHighlight) {
      ctx.beginPath();
      ctx.arc(cx, cy, r + 8, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(217,119,6,0.25)';
      ctx.fill();
    }

    // Circle
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle   = fill;
    ctx.strokeStyle = isHighlight ? '#f6ad55' : '#0f1117';
    ctx.lineWidth   = isHighlight ? 3 : 2;
    ctx.fill();
    ctx.stroke();

    // Value
    const fontSize = Math.max(Math.floor(r * 0.7), 12);
    ctx.fillStyle    = '#ffffff';
    ctx.font         = `bold ${fontSize}px 'Courier New', monospace`;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(node.val, cx, cy);

    // Sub-label
    const lblSize = Math.max(fontSize - 4, 10);
    ctx.font = `${lblSize}px monospace`;
    if (mode === 'avl') {
      ctx.fillStyle = '#a0aec0';
      ctx.fillText(`h:${node.height || 1}`, cx, cy + r + 14);
    } else {
      ctx.fillStyle = node.color === 'red' ? '#fc8181' : '#a0aec0';
      ctx.fillText(node.color === 'red' ? 'R' : 'B', cx, cy + r + 14);
    }
  });
}

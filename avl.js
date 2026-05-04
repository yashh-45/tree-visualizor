// ─── AVL Tree ───────────────────────────────────────────────────────────────

class AVLNode {
  constructor(val) {
    this.val = val;
    this.left = null;
    this.right = null;
    this.height = 1;
  }
}

class AVLTree {
  constructor() {
    this.root = null;
    this.steps = [];   // snapshot history for step-by-step mode
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

  height(n) {
    return n ? n.height : 0;
  }

  updateHeight(n) {
    n.height = 1 + Math.max(this.height(n.left), this.height(n.right));
  }

  balanceFactor(n) {
    return n ? this.height(n.left) - this.height(n.right) : 0;
  }

  // Deep-clone tree for step snapshots
  clone(node) {
    if (!node) return null;
    const c = new AVLNode(node.val);
    c.height = node.height;
    c.left  = this.clone(node.left);
    c.right = this.clone(node.right);
    return c;
  }

  snapshot(root, highlight, message) {
    this.steps.push({
      tree: this.clone(root),
      highlight,
      message
    });
  }

  // ── Rotations ────────────────────────────────────────────────────────────

  rotateRight(y) {
    const x  = y.left;
    const T2 = x.right;
    x.right = y;
    y.left  = T2;
    this.updateHeight(y);
    this.updateHeight(x);
    return x;
  }

  rotateLeft(x) {
    const y  = x.right;
    const T2 = y.left;
    y.left  = x;
    x.right = T2;
    this.updateHeight(x);
    this.updateHeight(y);
    return y;
  }

  // ── Insert ───────────────────────────────────────────────────────────────

  insert(val) {
    this.steps = [];
    this.root  = this._insert(this.root, val);
    this.snapshot(this.root, val, `✓ Insert ${val} complete`);
  }

  _insert(node, val) {
    // Standard BST insert
    if (!node) return new AVLNode(val);
    if (val < node.val)      node.left  = this._insert(node.left,  val);
    else if (val > node.val) node.right = this._insert(node.right, val);
    else return node; // duplicates ignored

    this.updateHeight(node);
    const bf = this.balanceFactor(node);

    // LL — right rotation
    if (bf > 1 && val < node.left.val) {
      this.snapshot(node, val, `⟳ LL imbalance at ${node.val} → Right Rotation`);
      return this.rotateRight(node);
    }
    // RR — left rotation
    if (bf < -1 && val > node.right.val) {
      this.snapshot(node, val, `⟲ RR imbalance at ${node.val} → Left Rotation`);
      return this.rotateLeft(node);
    }
    // LR — left-right rotation
    if (bf > 1 && val > node.left.val) {
      this.snapshot(node, val, `⟲⟳ LR imbalance at ${node.val} → Left-Right Rotation`);
      node.left = this.rotateLeft(node.left);
      return this.rotateRight(node);
    }
    // RL — right-left rotation
    if (bf < -1 && val < node.right.val) {
      this.snapshot(node, val, `⟳⟲ RL imbalance at ${node.val} → Right-Left Rotation`);
      node.right = this.rotateRight(node.right);
      return this.rotateLeft(node);
    }

    return node;
  }

  // ── Delete ───────────────────────────────────────────────────────────────

  delete(val) {
    this.steps = [];
    this.snapshot(this.root, val, `⌫ Deleting ${val}…`);
    this.root = this._delete(this.root, val);
    this.snapshot(this.root, null, `✓ Delete ${val} complete`);
  }

  _minNode(node) {
    let cur = node;
    while (cur.left) cur = cur.left;
    return cur;
  }

  _delete(node, val) {
    if (!node) return null;

    if (val < node.val)      node.left  = this._delete(node.left,  val);
    else if (val > node.val) node.right = this._delete(node.right, val);
    else {
      // Node to delete found
      if (!node.left || !node.right) {
        node = node.left || node.right; // one child or leaf
      } else {
        // Two children: replace with in-order successor
        const successor = this._minNode(node.right);
        this.snapshot(node, successor.val, `↑ Replacing ${node.val} with in-order successor ${successor.val}`);
        node.val   = successor.val;
        node.right = this._delete(node.right, successor.val);
      }
    }

    if (!node) return null;

    this.updateHeight(node);
    const bf = this.balanceFactor(node);

    if (bf > 1 && this.balanceFactor(node.left) >= 0) {
      this.snapshot(node, node.val, `⟳ LL fix after delete at ${node.val}`);
      return this.rotateRight(node);
    }
    if (bf > 1 && this.balanceFactor(node.left) < 0) {
      this.snapshot(node, node.val, `⟲⟳ LR fix after delete at ${node.val}`);
      node.left = this.rotateLeft(node.left);
      return this.rotateRight(node);
    }
    if (bf < -1 && this.balanceFactor(node.right) <= 0) {
      this.snapshot(node, node.val, `⟲ RR fix after delete at ${node.val}`);
      return this.rotateLeft(node);
    }
    if (bf < -1 && this.balanceFactor(node.right) > 0) {
      this.snapshot(node, node.val, `⟳⟲ RL fix after delete at ${node.val}`);
      node.right = this.rotateRight(node.right);
      return this.rotateLeft(node);
    }

    return node;
  }

  // ── Search ───────────────────────────────────────────────────────────────

  search(val) {
    let cur  = this.root;
    const path = [];
    while (cur) {
      path.push(cur.val);
      if (val === cur.val) return { found: true, path };
      cur = val < cur.val ? cur.left : cur.right;
    }
    return { found: false, path };
  }
}

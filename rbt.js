// ─── Red-Black Tree ──────────────────────────────────────────────────────────
// Rules:
//  1. Every node is RED or BLACK
//  2. Root is always BLACK
//  3. No two consecutive RED nodes
//  4. Every path root→leaf has equal BLACK nodes
//  5. NULL nodes count as BLACK

const RED   = 'red';
const BLACK = 'black';

class RBTNode {
  constructor(val) {
    this.val    = val;
    this.color  = RED;   // new nodes always start RED
    this.left   = null;
    this.right  = null;
    this.parent = null;
  }
}

class RBTree {
  constructor() {
    // Sentinel NIL node — cleaner than null checks everywhere
    this.NIL        = new RBTNode(null);
    this.NIL.color  = BLACK;
    this.root       = this.NIL;
    this.steps      = [];
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

  clone(node, nilRef) {
    if (node === this.NIL) return nilRef;
    const c     = new RBTNode(node.val);
    c.color     = node.color;
    c.left      = this.clone(node.left,  nilRef);
    c.right     = this.clone(node.right, nilRef);
    if (c.left  !== nilRef) c.left.parent  = c;
    if (c.right !== nilRef) c.right.parent = c;
    return c;
  }

  snapshot(highlight, message) {
    const nilRef  = new RBTNode(null);
    nilRef.color  = BLACK;
    const treeCopy = this.clone(this.root, nilRef);
    this.steps.push({ tree: treeCopy, nil: nilRef, highlight, message });
  }

  // ── Rotations ────────────────────────────────────────────────────────────

  rotateLeft(x) {
    const y  = x.right;
    x.right  = y.left;
    if (y.left !== this.NIL) y.left.parent = x;
    y.parent = x.parent;
    if (!x.parent)               this.root    = y;
    else if (x === x.parent.left) x.parent.left  = y;
    else                          x.parent.right = y;
    y.left   = x;
    x.parent = y;
  }

  rotateRight(x) {
    const y  = x.left;
    x.left   = y.right;
    if (y.right !== this.NIL) y.right.parent = x;
    y.parent = x.parent;
    if (!x.parent)                this.root    = y;
    else if (x === x.parent.right) x.parent.right = y;
    else                           x.parent.left  = y;
    y.right  = x;
    x.parent = y;
  }

  // ── Insert ───────────────────────────────────────────────────────────────

  insert(val) {
    this.steps = [];

    const z    = new RBTNode(val);
    z.left     = this.NIL;
    z.right    = this.NIL;

    // Standard BST insert
    let y = null;
    let x = this.root;
    while (x !== this.NIL) {
      y = x;
      if (z.val < x.val)      x = x.left;
      else if (z.val > x.val) x = x.right;
      else return; // duplicate
    }

    z.parent = y;
    if (!y)              this.root   = z;
    else if (z.val < y.val) y.left  = z;
    else                    y.right = z;

    this.snapshot(val, `➕ Inserted ${val} as RED node`);

    if (!z.parent) {
      z.color = BLACK;
      this.snapshot(val, `⬛ ${val} is root → color BLACK`);
      return;
    }
    if (!z.parent.parent) return;

    this._insertFixup(z);
    this.snapshot(val, `✓ Insert ${val} complete — tree balanced`);
  }

  _insertFixup(z) {
    while (z.parent && z.parent.color === RED) {
      if (z.parent === z.parent.parent.left) {
        const uncle = z.parent.parent.right;

        if (uncle.color === RED) {
          // Case 1: Uncle is RED → recolor
          z.parent.color         = BLACK;
          uncle.color            = BLACK;
          z.parent.parent.color  = RED;
          this.snapshot(z.val, `🎨 Recolor: uncle RED → flip colors at ${z.parent.parent.val}`);
          z = z.parent.parent;
        } else {
          if (z === z.parent.right) {
            // Case 2: Uncle BLACK, z is right child → rotate left
            z = z.parent;
            this.snapshot(z.val, `⟲ Case 2: Left rotate at ${z.val}`);
            this.rotateLeft(z);
          }
          // Case 3: Uncle BLACK, z is left child → rotate right
          z.parent.color        = BLACK;
          z.parent.parent.color = RED;
          this.snapshot(z.val, `⟳ Case 3: Right rotate at ${z.parent.parent.val}`);
          this.rotateRight(z.parent.parent);
        }
      } else {
        // Mirror cases (parent is right child)
        const uncle = z.parent.parent.left;

        if (uncle.color === RED) {
          z.parent.color        = BLACK;
          uncle.color           = BLACK;
          z.parent.parent.color = RED;
          this.snapshot(z.val, `🎨 Recolor: uncle RED → flip colors at ${z.parent.parent.val}`);
          z = z.parent.parent;
        } else {
          if (z === z.parent.left) {
            z = z.parent;
            this.snapshot(z.val, `⟳ Case 2 (mirror): Right rotate at ${z.val}`);
            this.rotateRight(z);
          }
          z.parent.color        = BLACK;
          z.parent.parent.color = RED;
          this.snapshot(z.val, `⟲ Case 3 (mirror): Left rotate at ${z.parent.parent.val}`);
          this.rotateLeft(z.parent.parent);
        }
      }
      if (z === this.root) break;
    }
    this.root.color = BLACK;
  }

  // ── Delete ───────────────────────────────────────────────────────────────

  delete(val) {
    this.steps = [];
    const z    = this._findNode(val);
    if (!z) {
      this.steps.push({ tree: this.clone(this.root, new RBTNode(null)), nil: null, highlight: null, message: `⚠ ${val} not found` });
      return;
    }
    this.snapshot(val, `⌫ Deleting ${val}…`);
    this._delete(z);
    this.snapshot(null, `✓ Delete ${val} complete`);
  }

  _findNode(val) {
    let cur = this.root;
    while (cur !== this.NIL) {
      if (val === cur.val) return cur;
      cur = val < cur.val ? cur.left : cur.right;
    }
    return null;
  }

  _transplant(u, v) {
    if (!u.parent)              this.root        = v;
    else if (u === u.parent.left) u.parent.left  = v;
    else                          u.parent.right = v;
    v.parent = u.parent;
  }

  _delete(z) {
    let y         = z;
    let yOrigColor = y.color;
    let x;

    if (z.left === this.NIL) {
      x = z.right;
      this._transplant(z, z.right);
    } else if (z.right === this.NIL) {
      x = z.left;
      this._transplant(z, z.left);
    } else {
      // In-order successor
      y = z.right;
      while (y.left !== this.NIL) y = y.left;
      yOrigColor = y.color;
      x          = y.right;
      this.snapshot(y.val, `↑ Replacing with in-order successor ${y.val}`);

      if (y.parent === z) {
        x.parent = y;
      } else {
        this._transplant(y, y.right);
        y.right        = z.right;
        y.right.parent = y;
      }
      this._transplant(z, y);
      y.left        = z.left;
      y.left.parent = y;
      y.color       = z.color;
    }

    if (yOrigColor === BLACK) this._deleteFixup(x);
  }

  _deleteFixup(x) {
    while (x !== this.root && x.color === BLACK) {
      if (x === x.parent.left) {
        let w = x.parent.right;
        if (w.color === RED) {
          w.color        = BLACK;
          x.parent.color = RED;
          this.snapshot(x.val, `⟲ Delete fix: Left rotate at ${x.parent.val}`);
          this.rotateLeft(x.parent);
          w = x.parent.right;
        }
        if (w.left.color === BLACK && w.right.color === BLACK) {
          w.color = RED;
          this.snapshot(x.val, `🎨 Delete fix: Recolor sibling ${w.val} RED`);
          x = x.parent;
        } else {
          if (w.right.color === BLACK) {
            w.left.color = BLACK;
            w.color      = RED;
            this.snapshot(x.val, `⟳ Delete fix: Right rotate at ${w.val}`);
            this.rotateRight(w);
            w = x.parent.right;
          }
          w.color        = x.parent.color;
          x.parent.color = BLACK;
          w.right.color  = BLACK;
          this.snapshot(x.val, `⟲ Delete fix: Left rotate at ${x.parent.val}`);
          this.rotateLeft(x.parent);
          x = this.root;
        }
      } else {
        let w = x.parent.left;
        if (w.color === RED) {
          w.color        = BLACK;
          x.parent.color = RED;
          this.snapshot(x.val, `⟳ Delete fix (mirror): Right rotate at ${x.parent.val}`);
          this.rotateRight(x.parent);
          w = x.parent.left;
        }
        if (w.right.color === BLACK && w.left.color === BLACK) {
          w.color = RED;
          x = x.parent;
        } else {
          if (w.left.color === BLACK) {
            w.right.color = BLACK;
            w.color       = RED;
            this.rotateLeft(w);
            w = x.parent.left;
          }
          w.color        = x.parent.color;
          x.parent.color = BLACK;
          w.left.color   = BLACK;
          this.snapshot(x.val, `⟳ Delete fix (mirror): Right rotate at ${x.parent.val}`);
          this.rotateRight(x.parent);
          x = this.root;
        }
      }
    }
    x.color = BLACK;
  }

  // ── Search ───────────────────────────────────────────────────────────────

  search(val) {
    let cur = this.root;
    const path = [];
    while (cur !== this.NIL && cur.val !== null) {
      path.push(cur.val);
      if (val === cur.val) return { found: true, path };
      cur = val < cur.val ? cur.left : cur.right;
    }
    return { found: false, path };
  }
}

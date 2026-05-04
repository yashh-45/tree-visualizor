// ═══════════════════════════════════════════════════════════════════
//  🔴 RED-BLACK TREE MODULE
// ═══════════════════════════════════════════════════════════════════
const R='red', B='black';
class RBNode{constructor(v){this.val=v;this.color=R;this.left=null;this.right=null;this.parent=null;this._state=null;}}
class RBTree{
  constructor(){this.NIL=new RBNode(null);this.NIL.color=B;this.root=this.NIL;}
  _state(n){if(n===this.NIL||n.val===null)return null;if(n._state)return n._state;return n.color===R?'n-rb-red':'n-rb-black';}
  _render(){renderTree(this.root,this.NIL,n=>this._state(n),n=>n.color==='red'?'R':'B');}
  _mark(val,cls){this._walk(this.root,n=>{if(n.val===val)n._state=cls;});}
  _clearStates(){this._walk(this.root,n=>n._state=null);}
  _walk(n,fn){if(!n||n===this.NIL)return;fn(n);this._walk(n.left,fn);this._walk(n.right,fn);}
  rotL(x){const y=x.right;x.right=y.left;if(y.left!==this.NIL)y.left.parent=x;y.parent=x.parent;if(!x.parent)this.root=y;else if(x===x.parent.left)x.parent.left=y;else x.parent.right=y;y.left=x;x.parent=y;}
  rotR(x){const y=x.left;x.left=y.right;if(y.right!==this.NIL)y.right.parent=x;y.parent=x.parent;if(!x.parent)this.root=y;else if(x===x.parent.right)x.parent.right=y;else x.parent.left=y;y.right=x;x.parent=y;}
  insert(val){
    const S=[];const z=new RBNode(val);z.left=this.NIL;z.right=this.NIL;let y=null,x=this.root;
    while(x!==this.NIL){y=x;if(z.val<x.val){S.push({msg:`${val} < ${x.val} → go LEFT`,why:'BST property: smaller values go left.',draw:()=>{this._clearStates();this._mark(x.val,'n-path');this._render();}});x=x.left;}else if(z.val>x.val){S.push({msg:`${val} > ${x.val} → go RIGHT`,why:'BST property: larger values go right.',draw:()=>{this._clearStates();this._mark(x.val,'n-path');this._render();}});x=x.right;}else return S;}
    z.parent=y;if(!y)this.root=z;else if(z.val<y.val)y.left=z;else y.right=z;
    S.push({msg:`Inserted ${val} as RED node`,why:'New nodes are always inserted RED to minimize RBT property violations.',draw:()=>{this._clearStates();this._mark(val,'n-new');this._render();}});
    if(!z.parent){z.color=B;S.push({msg:`${val} is root → colored BLACK`,why:'Property 2: The root must always be BLACK.',draw:()=>{this._render();}});return S;}
    if(!z.parent.parent)return S;
    this._fixup(z,S);
    S.push({msg:`✓ Insert ${val} complete — all 5 RBT properties satisfied`,why:'All properties verified.',draw:()=>{this._clearStates();this._mark(val,'n-highlight');this._render();}});
    return S;
  }
  _fixup(z,S){
    while(z.parent&&z.parent.color===R){
      if(z.parent===z.parent.parent.left){
        const u=z.parent.parent.right;
        if(u.color===R){S.push({msg:`Case 1: Uncle ${u.val} is RED → Recolor`,why:'Recolor parent+uncle BLACK, grandparent RED.',draw:()=>{this._clearStates();this._mark(u.val,'n-recolor');this._mark(z.parent.val,'n-recolor');this._mark(z.parent.parent.val,'n-recolor');this._render();}});z.parent.color=B;u.color=B;z.parent.parent.color=R;z=z.parent.parent;}
        else{if(z===z.parent.right){S.push({msg:`Case 2: Inner child → Left Rotate at ${z.parent.val}`,why:'Convert to Case 3.',draw:()=>{this._clearStates();this._mark(z.parent.val,'n-rotate');this._render();}});z=z.parent;this.rotL(z);}S.push({msg:`Case 3: Outer child → Recolor + Right Rotate at ${z.parent.parent.val}`,why:'Fixes consecutive-red violation permanently.',draw:()=>{this._clearStates();this._mark(z.parent.val,'n-rotate');this._mark(z.parent.parent.val,'n-rotate');this._render();}});z.parent.color=B;z.parent.parent.color=R;this.rotR(z.parent.parent);}
      }else{
        const u=z.parent.parent.left;
        if(u.color===R){S.push({msg:`Case 1 (mirror): Uncle ${u.val} is RED → Recolor`,why:'Mirror of Case 1.',draw:()=>{this._clearStates();this._mark(u.val,'n-recolor');this._mark(z.parent.val,'n-recolor');this._render();}});z.parent.color=B;u.color=B;z.parent.parent.color=R;z=z.parent.parent;}
        else{if(z===z.parent.left){S.push({msg:`Case 2 (mirror): Right Rotate at ${z.parent.val}`,why:'Convert to Case 3 mirror.',draw:()=>{this._clearStates();this._mark(z.parent.val,'n-rotate');this._render();}});z=z.parent;this.rotR(z);}S.push({msg:`Case 3 (mirror): Recolor + Left Rotate at ${z.parent.parent.val}`,why:'Fixes violation permanently.',draw:()=>{this._clearStates();this._mark(z.parent.parent.val,'n-rotate');this._render();}});z.parent.color=B;z.parent.parent.color=R;this.rotL(z.parent.parent);}
      }
      if(z===this.root)break;
    }
    this.root.color=B;
  }
  search(val){
    const S=[];let cur=this.root;this._clearStates();
    while(cur!==this.NIL){if(val===cur.val){S.push({msg:`✓ Found ${val}! Color: ${cur.color.toUpperCase()}`,why:'Search complete.',draw:()=>{this._clearStates();this._mark(val,'n-found');this._render();}});return S;}const dir=val<cur.val?'left':'right';S.push({msg:`${val} ${val<cur.val?'<':'>'} ${cur.val} → go ${dir.toUpperCase()}`,why:'BST search.',draw:()=>{this._clearStates();this._mark(cur.val,'n-path');this._render();}});cur=cur[dir];}
    S.push({msg:`✗ ${val} not found`,why:'Reached NIL node.',draw:()=>this._render()});return S;
  }
}
const rbtTree=new RBTree();
function initRBT(){
  currentTree='rbt';
  buildControls({placeholder:'Number…',buttons:[{label:'Insert',cls:'btn-blue',fn:()=>{const v=getInput();if(!v)return;clearInput();loadSteps(rbtTree.insert(v));}},{label:'Search',cls:'btn-green',fn:()=>{const v=getInput();if(!v)return;loadSteps(rbtTree.search(v));}}],
    presets:[{label:'Demo 1',fn:()=>{rbtTree.root=rbtTree.NIL;[10,20,30,15].forEach(v=>rbtTree.insert(v));rbtTree._clearStates();rbtTree._render();obs('Demo: 10,20,30,15','Shows recoloring and rotation.');}},{label:'Demo 2',fn:()=>{rbtTree.root=rbtTree.NIL;[7,3,18,10,22,8,11,26].forEach(v=>rbtTree.insert(v));rbtTree._clearStates();rbtTree._render();obs('Demo 2: 8-node RBT','Complex tree.');}}],
    onReset:()=>{rbtTree.root=rbtTree.NIL;svgClear();clearObs();steps=[];document.getElementById('step-bar').style.display='none';},
    onRandom:()=>{rbtTree.root=rbtTree.NIL;const vals=[...new Set(Array.from({length:7},()=>Math.floor(Math.random()*90)+5))];vals.forEach(v=>rbtTree.insert(v));rbtTree._clearStates();rbtTree._render();obs(`Random RBT: ${vals.join(', ')}`,'');}
  });
  rbtTree._render();
}

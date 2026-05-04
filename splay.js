// ═══════════════════════════════════════════════════════════════════
//  🌀 SPLAY TREE MODULE
// ═══════════════════════════════════════════════════════════════════
class SplayNode{constructor(v){this.val=v;this.left=null;this.right=null;this._state='n-default';}}
class SplayTree{
  constructor(){this.root=null;}
  _walk(n,fn){if(!n)return;fn(n);this._walk(n.left,fn);this._walk(n.right,fn);}
  _render(){renderTree(this.root,null,n=>n._state||'n-default',null);}
  _clearStates(){this._walk(this.root,n=>n._state='n-default');}
  rotR(x){const y=x.left;x.left=y.right;y.right=x;return y;}
  rotL(x){const y=x.right;x.right=y.left;y.left=x;return y;}
  splay(root,val,S){
    if(!root||root.val===val)return root;
    if(val<root.val){
      if(!root.left)return root;
      if(val<root.left.val){root.left.left=this.splay(root.left.left,val,S);S.push({msg:`Zig-Zig (Left-Left): Right rotate at ${root.val}`,why:'Target in left-left position. Double right rotation.',draw:()=>{this._clearStates();if(root.left)root.left._state='n-rotate';this._render();}});root=this.rotR(root);}
      else if(val>root.left.val){root.left.right=this.splay(root.left.right,val,S);if(root.left.right){S.push({msg:`Zig-Zag (Left-Right): Left rotate at ${root.left.val}`,why:'Target in left-right position. Two different rotations.',draw:()=>{this._clearStates();root.left._state='n-rotate';this._render();}});root.left=this.rotL(root.left);}}
      return root.left?this.rotR(root):root;
    }else{
      if(!root.right)return root;
      if(val>root.right.val){root.right.right=this.splay(root.right.right,val,S);S.push({msg:`Zig-Zig (Right-Right): Left rotate at ${root.val}`,why:'Target in right-right position. Double left rotation.',draw:()=>{this._clearStates();if(root.right)root.right._state='n-rotate';this._render();}});root=this.rotL(root);}
      else if(val<root.right.val){root.right.left=this.splay(root.right.left,val,S);if(root.right.left){S.push({msg:`Zig-Zag (Right-Left): Right rotate at ${root.right.val}`,why:'Target in right-left position. Mirror Zig-Zag case.',draw:()=>{this._clearStates();root.right._state='n-rotate';this._render();}});root.right=this.rotR(root.right);}}
      return root.right?this.rotL(root):root;
    }
  }
  insert(val){
    const S=[];
    if(!this.root){this.root=new SplayNode(val);S.push({msg:`Insert ${val} as root`,why:'Empty tree — first node becomes root.',draw:()=>this._render()});return S;}
    this.root=this.splay(this.root,val,S);
    if(this.root.val===val){S.push({msg:`${val} already exists`,why:'',draw:()=>this._render()});return S;}
    const node=new SplayNode(val);
    if(val<this.root.val){node.right=this.root;node.left=this.root.left;this.root.left=null;}
    else{node.left=this.root;node.right=this.root.right;this.root.right=null;}
    this.root=node;
    S.push({msg:`✓ ${val} inserted and splayed to root`,why:'After insertion, new node is always at root. O(log n) amortized.',draw:()=>{this._clearStates();this.root._state='n-highlight';this._render();}});
    return S;
  }
  search(val){
    const S=[];
    S.push({msg:`Searching for ${val} — will splay to root if found`,why:'Splay Tree: every accessed node moves to root.',draw:()=>this._render()});
    this.root=this.splay(this.root,val,S);
    if(this.root&&this.root.val===val){S.push({msg:`✓ Found ${val} — now at ROOT`,why:'Splaying moves found node to root. Search again = O(1).',draw:()=>{this._clearStates();this.root._state='n-found';this._render();}});}
    else{S.push({msg:`✗ ${val} not found`,why:'Value absent from tree.',draw:()=>this._render()});}
    return S;
  }
}
const splayTree=new SplayTree();
function initSplay(){
  currentTree='splay';
  buildControls({placeholder:'Number…',buttons:[
    {label:'Insert',cls:'btn-blue',fn:()=>{const v=getInput();if(!v)return;clearInput();loadSteps(splayTree.insert(v));}},
    {label:'Search (Splay)',cls:'btn-green',fn:()=>{const v=getInput();if(!v)return;loadSteps(splayTree.search(v));}},
  ],presets:[{label:'Demo',fn:()=>{splayTree.root=null;[20,10,30,5,15,25,35].forEach(v=>splayTree.insert(v));splayTree._clearStates();splayTree._render();obs('7-node splay tree loaded','Search for 5 to watch it splay to root!');}}],
    onReset:()=>{splayTree.root=null;svgClear();clearObs();steps=[];document.getElementById('step-bar').style.display='none';},
    onRandom:()=>{splayTree.root=null;const vals=[...new Set(Array.from({length:7},()=>Math.floor(Math.random()*90)+5))];vals.forEach(v=>splayTree.insert(v));splayTree._clearStates();splayTree._render();obs(`Random: ${vals.join(', ')}`,'');}
  });
  splayTree._render();
}

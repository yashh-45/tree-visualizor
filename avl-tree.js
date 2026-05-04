// ═══════════════════════════════════════════════════════════════════
//  ⚖️ AVL TREE MODULE
// ═══════════════════════════════════════════════════════════════════

class AVLNode{ constructor(v){this.val=v;this.left=null;this.right=null;this.height=1;this._state='n-default';} }
class AVLTree{
  constructor(){this.root=null;}
  h(n){return n?n.height:0;}
  upH(n){n.height=1+Math.max(this.h(n.left),this.h(n.right));}
  bf(n){return n?this.h(n.left)-this.h(n.right):0;}
  clone(n){
    if(!n)return null;
    const c=new AVLNode(n.val); c.height=n.height; c._state=n._state;
    c.left=this.clone(n.left); c.right=this.clone(n.right); return c;
  }
  rotR(y){const x=y.left,T=x.right;x.right=y;y.left=T;this.upH(y);this.upH(x);return x;}
  rotL(x){const y=x.right,T=y.left;y.left=x;x.right=T;this.upH(x);this.upH(y);return y;}

  insert(val){
    const S=[];
    this.root=this._ins(this.root,val,S);
    // reset states
    this._walk(this.root,n=>n._state='n-default');
    return S;
  }
  _ins(n,val,S){
    if(!n){
      const node=new AVLNode(val); node._state='n-new'; node._anim='node-new-anim';
      S.push({msg:`Inserted ${val} as a new leaf node`,
              why:`In BST insertion, we always start by placing the new node as a leaf. It starts highlighted in green.`,
              draw:()=>{this._mark(val,'n-new');this._render();}});
      return node;
    }
    if(val<n.val){
      S.push({msg:`${val} < ${n.val} → go LEFT`,
              why:`Binary Search Tree property: smaller values go to the left subtree.`,
              draw:()=>{this._mark(n.val,'n-path');this._render();}});
      n.left=this._ins(n.left,val,S);
    } else if(val>n.val){
      S.push({msg:`${val} > ${n.val} → go RIGHT`,
              why:`Binary Search Tree property: larger values go to the right subtree.`,
              draw:()=>{this._mark(n.val,'n-path');this._render();}});
      n.right=this._ins(n.right,val,S);
    } else return n;

    this.upH(n);
    const bf=this.bf(n);

    if(bf>1&&val<n.left.val){
      S.push({msg:`⚠ LL Imbalance at node ${n.val} (balance factor = ${bf})`,
              why:`Left-Left case: The left subtree is 2 levels deeper than the right. We fix this with a single Right Rotation at node ${n.val}.`,
              draw:()=>{this._mark(n.val,'n-rotate');this._render();}});
      const r=this.rotR(n);
      S.push({msg:`✓ Right Rotation complete — ${r.val} is now the new root of this subtree`,
              why:`After rotation, the tree is balanced. The balance factor at every node is now -1, 0, or +1.`,
              draw:()=>{this._walk(this.root,x=>x._state='n-default');this._mark(r.val,'n-highlight');this._render();}});
      return r;
    }
    if(bf<-1&&val>n.right.val){
      S.push({msg:`⚠ RR Imbalance at node ${n.val} (balance factor = ${bf})`,
              why:`Right-Right case: The right subtree is 2 levels deeper. We fix this with a single Left Rotation at node ${n.val}.`,
              draw:()=>{this._mark(n.val,'n-rotate');this._render();}});
      const r=this.rotL(n);
      S.push({msg:`✓ Left Rotation complete — ${r.val} is the new subtree root`,
              why:`After rotation, balance is restored. All balance factors return to the valid range [-1, 0, +1].`,
              draw:()=>{this._walk(this.root,x=>x._state='n-default');this._mark(r.val,'n-highlight');this._render();}});
      return r;
    }
    if(bf>1&&val>n.left.val){
      S.push({msg:`⚠ LR Imbalance at node ${n.val} — Left Rotate at ${n.left.val} first`,
              why:`Left-Right case: Two rotations needed. First, Left Rotate the left child to convert it to the LL case.`,
              draw:()=>{this._mark(n.val,'n-rotate');this._mark(n.left.val,'n-recolor');this._render();}});
      n.left=this.rotL(n.left);
      S.push({msg:`Now Right Rotate at ${n.val} to finish LR fix`,
              why:`After the first rotation we have an LL case. Now apply a Right Rotation at the imbalanced node.`,
              draw:()=>{this._mark(n.val,'n-rotate');this._render();}});
      const r=this.rotR(n);
      S.push({msg:`✓ LR Double Rotation complete — ${r.val} is new subtree root`,
              why:`Two rotations resolved the Left-Right imbalance. Tree is now balanced.`,
              draw:()=>{this._walk(this.root,x=>x._state='n-default');this._mark(r.val,'n-highlight');this._render();}});
      return r;
    }
    if(bf<-1&&val<n.right.val){
      S.push({msg:`⚠ RL Imbalance at node ${n.val} — Right Rotate at ${n.right.val} first`,
              why:`Right-Left case: Two rotations needed. First, Right Rotate the right child to convert to the RR case.`,
              draw:()=>{this._mark(n.val,'n-rotate');this._mark(n.right.val,'n-recolor');this._render();}});
      n.right=this.rotR(n.right);
      S.push({msg:`Now Left Rotate at ${n.val} to finish RL fix`,
              why:`After the first rotation we have an RR case. Apply Left Rotation at the imbalanced node.`,
              draw:()=>{this._mark(n.val,'n-rotate');this._render();}});
      const r=this.rotL(n);
      S.push({msg:`✓ RL Double Rotation complete — ${r.val} is new subtree root`,
              why:`Two rotations resolved the Right-Left imbalance. Balance restored.`,
              draw:()=>{this._walk(this.root,x=>x._state='n-default');this._mark(r.val,'n-highlight');this._render();}});
      return r;
    }
    return n;
  }

  search(val){
    const S=[]; let cur=this.root;
    this._walk(this.root,n=>n._state='n-default');
    while(cur){
      if(val===cur.val){
        S.push({msg:`✓ Found ${val}!`,why:`Search complete. The value was located in the tree.`,
                draw:()=>{this._mark(val,'n-found');this._render();}});
        break;
      }
      const dir=val<cur.val?'left':'right';
      S.push({msg:`${val} ${val<cur.val?'<':'>'} ${cur.val} → go ${dir.toUpperCase()}`,
              why:`BST search: compare with current node and follow the correct child.`,
              draw:()=>{this._mark(cur.val,'n-path');this._render();}});
      cur=cur[dir];
      if(!cur){
        S.push({msg:`✗ ${val} not found in tree`,why:`Reached a null node — the value does not exist in the tree.`,
                draw:()=>{this._render();}});
      }
    }
    return S;
  }

  delete(val){
    const S=[];
    S.push({msg:`Deleting ${val}…`,why:`We will locate the node, remove it, and rebalance if needed.`,
            draw:()=>{this._mark(val,'n-delete');this._render();}});
    this.root=this._del(this.root,val,S);
    this._walk(this.root,n=>n._state='n-default');
    S.push({msg:`✓ Delete ${val} complete. Tree rebalanced.`,why:`All balance factors are back in [-1,0,+1] range.`,
            draw:()=>{this._render();}});
    return S;
  }
  _min(n){while(n.left)n=n.left;return n;}
  _del(n,val,S){
    if(!n)return null;
    if(val<n.val) n.left=this._del(n.left,val,S);
    else if(val>n.val) n.right=this._del(n.right,val,S);
    else{
      if(!n.left||!n.right) return n.left||n.right;
      const suc=this._min(n.right);
      S.push({msg:`Node ${val} has two children — replacing with in-order successor ${suc.val}`,
              why:`When a node has two children, we replace its value with its in-order successor (smallest value in right subtree), then delete the successor.`,
              draw:()=>{this._mark(suc.val,'n-highlight');this._render();}});
      n.val=suc.val; n.right=this._del(n.right,suc.val,S);
    }
    this.upH(n);
    const bf=this.bf(n);
    if(bf>1&&this.bf(n.left)>=0) return this.rotR(n);
    if(bf>1&&this.bf(n.left)<0){n.left=this.rotL(n.left);return this.rotR(n);}
    if(bf<-1&&this.bf(n.right)<=0) return this.rotL(n);
    if(bf<-1&&this.bf(n.right)>0){n.right=this.rotR(n.right);return this.rotL(n);}
    return n;
  }

  _mark(val,cls){this._walk(this.root,n=>{if(n.val===val)n._state=cls;});}
  _walk(n,fn){if(!n)return;fn(n);this._walk(n.left,fn);this._walk(n.right,fn);}
  _render(){
    renderTree(this.root,null,
      n=>n._state||'n-default',
      n=>`bf:${this.bf(n)}`);
  }
}

const avlTree=new AVLTree();

function initAVL(){
  currentTree='avl';
  buildControls({
    placeholder:'Number…',
    buttons:[
      {label:'Insert',cls:'btn-blue',fn:()=>{
        const v=getInput(); if(!v)return; clearInput();
        const S=avlTree.insert(v);
        S.push({msg:`✓ Insert ${v} complete`,why:`Tree is fully balanced. Height: ${avlTree.h(avlTree.root)}`,
                draw:()=>{avlTree._walk(avlTree.root,n=>n._state='n-default');avlTree._render();}});
        loadSteps(S);
      }},
      {label:'Delete',cls:'btn-red',fn:()=>{
        const v=getInput(); if(!v)return; clearInput();
        loadSteps(avlTree.delete(v));
      }},
      {label:'Search',cls:'btn-green',fn:()=>{
        const v=getInput(); if(!v)return;
        loadSteps(avlTree.search(v));
      }},
    ],
    presets:[
      {label:'LL',fn:()=>{avlTree.root=null;[30,20,10].forEach(v=>avlTree.insert(v));avlTree._walk(avlTree.root,n=>n._state='n-default');avlTree._render();obs('LL Preset loaded: 30→20→10','Triggers a Right Rotation at node 30.');}},
      {label:'RR',fn:()=>{avlTree.root=null;[10,20,30].forEach(v=>avlTree.insert(v));avlTree._walk(avlTree.root,n=>n._state='n-default');avlTree._render();obs('RR Preset loaded: 10→20→30','Triggers a Left Rotation at node 10.');}},
      {label:'LR',fn:()=>{avlTree.root=null;[30,10,20].forEach(v=>avlTree.insert(v));avlTree._walk(avlTree.root,n=>n._state='n-default');avlTree._render();obs('LR Preset loaded: 30→10→20','Triggers Left then Right rotation.');}},
      {label:'RL',fn:()=>{avlTree.root=null;[10,30,20].forEach(v=>avlTree.insert(v));avlTree._walk(avlTree.root,n=>n._state='n-default');avlTree._render();obs('RL Preset loaded: 10→30→20','Triggers Right then Left rotation.');}},
      {label:'Full',fn:()=>{avlTree.root=null;[50,30,70,20,40,60,80,10,25].forEach(v=>avlTree.insert(v));avlTree._walk(avlTree.root,n=>n._state='n-default');avlTree._render();obs('Full tree loaded','9-node balanced AVL tree.');}}
    ],
    onReset:()=>{avlTree.root=null;svgClear();clearObs();steps=[];document.getElementById('step-bar').style.display='none';},
    onRandom:()=>{
      avlTree.root=null;
      const vals=[...new Set(Array.from({length:8},()=>Math.floor(Math.random()*90)+10))];
      vals.forEach(v=>avlTree.insert(v));
      avlTree._walk(avlTree.root,n=>n._state='n-default');avlTree._render();
      obs(`Random tree: ${vals.join(', ')}`,'8 random values inserted.');
    }
  });
  avlTree._render();
}

// ═══════════════════════════════════════════════════════════════════
//  🏔️ HEAP MODULE
// ═══════════════════════════════════════════════════════════════════
class MinHeap{
  constructor(){this.arr=[];this.mode='min';}
  cmp(a,b){return this.mode==='min'?a<b:a>b;}
  insert(val){
    const S=[];this.arr.push(val);let i=this.arr.length-1;
    S.push({msg:`Insert ${val} at index ${i} (end of array)`,why:'New elements added at end to maintain Complete Binary Tree property.',draw:()=>{this._renderHeap([i]);}});
    while(i>0){
      const par=Math.floor((i-1)/2);
      if(this.cmp(this.arr[i],this.arr[par])){
        S.push({msg:`${this.arr[i]} ${this.mode==='min'?'<':'>'} parent ${this.arr[par]} → SWAP (Heapify-Up)`,why:`Heap property violated. Swap and continue upward.`,draw:()=>{this._renderHeap([i,par],true);}});
        [this.arr[i],this.arr[par]]=[this.arr[par],this.arr[i]];i=par;
        S.push({msg:`After swap — ${this.arr[i]} is now at index ${i}`,why:'Check parent again.',draw:()=>{this._renderHeap([i]);}});
      }else break;
    }
    S.push({msg:`✓ ${val} inserted. ${this.mode==='min'?'Min':'Max'} Heap property restored.`,why:'All parent-child relationships satisfy heap property.',draw:()=>{this._renderHeap([]);}});
    return S;
  }
  extractRoot(){
    if(!this.arr.length)return[];const S=[];const root=this.arr[0];
    S.push({msg:`Extract ${this.mode==='min'?'Min':'Max'}: remove root ${root}`,why:`The ${this.mode==='min'?'minimum':'maximum'} is always at index 0.`,draw:()=>{this._renderHeap([0]);}});
    this.arr[0]=this.arr.pop();
    S.push({msg:`Move last element ${this.arr[0]} to root`,why:'Replace root with last element, then restore heap order.',draw:()=>{this._renderHeap([0]);}});
    let i=0;
    while(true){
      const l=2*i+1,r=2*i+2;let target=i;
      if(l<this.arr.length&&this.cmp(this.arr[l],this.arr[target]))target=l;
      if(r<this.arr.length&&this.cmp(this.arr[r],this.arr[target]))target=r;
      if(target===i)break;
      S.push({msg:`${this.arr[i]} violates heap at index ${i} → swap with ${this.arr[target]} (Heapify-Down)`,why:`Swap with ${this.mode==='min'?'smallest':'largest'} child.`,draw:()=>{this._renderHeap([i,target],true);}});
      [this.arr[i],this.arr[target]]=[this.arr[target],this.arr[i]];i=target;
    }
    S.push({msg:`✓ Extracted ${root}. Heap restored.`,why:'Heap property satisfied at all levels.',draw:()=>{this._renderHeap([]);}});
    return S;
  }
  _renderHeap(highlight=[],isSwap=false){
    if(!this.arr.length){svgClear();return;}
    const n=this.arr.length;
    const self=this;
    function build(i){
      if(i>=n)return null;
      const node={val:self.arr[i],left:build(2*i+1),right:build(2*i+2)};
      node._state=highlight.includes(i)?(isSwap?'n-rotate':'n-highlight'):'n-default';
      return node;
    }
    const root=build(0);
    renderTree(root,null,n=>n._state||'n-default',null);
    const ha=document.getElementById('heap-array');ha.style.display='flex';
    ha.innerHTML=this.arr.map((v,i)=>`<div class="heap-cell ${highlight.includes(i)?(isSwap?'swap':'active'):''}"><div class="heap-cell-val">${v}</div><div class="heap-cell-idx">[${i}]</div></div>`).join('');
  }
}
const heap=new MinHeap();
function initHeap(){
  currentTree='heap';
  const modeBtn=document.createElement('button');modeBtn.className='btn btn-sm';modeBtn.id='heapModeBtn';
  modeBtn.textContent='Mode: MIN';modeBtn.style.marginLeft='8px';
  modeBtn.onclick=()=>{heap.mode=heap.mode==='min'?'max':'min';heap.arr=[];heap._renderHeap([]);modeBtn.textContent=`Mode: ${heap.mode.toUpperCase()}`;clearObs();obs(`Switched to ${heap.mode.toUpperCase()} Heap. Tree reset.`,'');};
  buildControls({placeholder:'Number…',buttons:[
    {label:'Insert',cls:'btn-blue',fn:()=>{const v=getInput();if(v===null)return;clearInput();loadSteps(heap.insert(v));}},
    {label:'Extract Root',cls:'btn-red',fn:()=>{loadSteps(heap.extractRoot());}},
  ],presets:[{label:'Build Heap',fn:()=>{heap.arr=[];[15,10,20,8,25,3,18].forEach(v=>heap.insert(v));heap._renderHeap([]);obs('Heap built from: 15,10,20,8,25,3,18','');}}],
    onReset:()=>{heap.arr=[];heap._renderHeap([]);clearObs();steps=[];document.getElementById('step-bar').style.display='none';},
    onRandom:()=>{heap.arr=[];const vals=Array.from({length:7},()=>Math.floor(Math.random()*90)+5);vals.forEach(v=>heap.insert(v));heap._renderHeap([]);obs(`Random heap: ${vals.join(', ')}`,'');}
  });
  document.getElementById('controls').querySelector('.btn:last-child').after(modeBtn);
  document.getElementById('heap-array').style.display='flex';heap._renderHeap([]);
}

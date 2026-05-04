// ═══════════════════════════════════════════════════════════════════
//  📦 HUFFMAN TREE MODULE
// ═══════════════════════════════════════════════════════════════════
class HuffNode{constructor(ch,freq){this.val=ch?`${ch}:${freq}`:freq;this.char=ch;this.freq=freq;this.left=null;this.right=null;this._state='n-default';}}

function buildHuffman(text){
  const S=[];if(!text)return S;
  const freq={};for(const c of text)freq[c]=(freq[c]||0)+1;
  S.push({msg:`Character frequencies: ${Object.entries(freq).map(([c,f])=>`'${c}'=${f}`).join(', ')}`,why:'First step: count character frequencies. More frequent chars get shorter codes.',draw:()=>svgClear()});
  let nodes=Object.entries(freq).map(([c,f])=>new HuffNode(c,f));
  nodes.sort((a,b)=>a.freq-b.freq);
  S.push({msg:`Created ${nodes.length} leaf nodes, sorted by frequency`,why:'Each unique character becomes a leaf. Use Min-Heap to merge lowest-frequency nodes.',draw:()=>{
    const root={val:nodes[0].val,left:null,right:null,_state:'n-new'};let cur=root;
    for(let i=1;i<Math.min(nodes.length,6);i++){cur.right={val:nodes[i].val,left:null,right:null,_state:'n-default'};cur=cur.right;}
    renderTree(root,null,'n-default',null);
  }});
  while(nodes.length>1){
    const a=nodes.shift(),b=nodes.shift();
    const merged=new HuffNode(null,a.freq+b.freq);merged.left=a;merged.right=b;merged.val=`${a.freq+b.freq}`;
    S.push({msg:`Merge '${a.val}' (${a.freq}) + '${b.val}' (${b.freq}) → internal node [${merged.freq}]`,why:'Always merge two smallest frequencies. Greedy choice guarantees minimum total code length.',draw:()=>{
      a._state='n-rotate';b._state='n-rotate';merged._state='n-highlight';
      renderTree(merged,null,n=>n._state||'n-default',null);
    }});
    nodes.push(merged);nodes.sort((a,b)=>a.freq-b.freq);
  }
  const root=nodes[0];const codes={};
  function genCodes(n,code){if(!n)return;if(n.char){codes[n.char]=code||'0';return;}genCodes(n.left,code+'0');genCodes(n.right,code+'1');}
  genCodes(root,'');
  S.push({msg:`✓ Huffman Tree built! Codes: ${Object.entries(codes).map(([c,cd])=>`'${c}'→${cd}`).join(', ')}`,why:'Left edges = 0, Right edges = 1. Shorter codes for frequent chars = compression.',draw:()=>{root._state='n-highlight';renderTree(root,null,n=>n._state||'n-default',n=>n.char?codes[n.char]:'');}});
  const encoded=text.split('').map(c=>codes[c]).join('');
  const ratio=((1-encoded.length/(text.length*8))*100).toFixed(1);
  S.push({msg:`Encoded "${text}" = ${encoded} (${encoded.length} bits vs ${text.length*8} raw bits = ${ratio}% saved)`,why:'Each character replaced by its Huffman code → compression achieved.',draw:()=>renderTree(root,null,n=>n._state||'n-default',n=>n.char?codes[n.char]:'')});
  return S;
}

function initHuffman(){
  currentTree='huffman';
  buildControls({input:false,strInput:true,strPlaceholder:'Enter text…',buttons:[
    {label:'Build Tree',cls:'btn-blue',fn:()=>{const w=document.getElementById('strInput')?.value?.trim();if(!w)return;loadSteps(buildHuffman(w));}},
  ],presets:[
    {label:'"ABRACADABRA"',fn:()=>{document.getElementById('strInput').value='ABRACADABRA';loadSteps(buildHuffman('ABRACADABRA'));}},
    {label:'"MISSISSIPPI"',fn:()=>{document.getElementById('strInput').value='MISSISSIPPI';loadSteps(buildHuffman('MISSISSIPPI'));}},
    {label:'"HELLO WORLD"',fn:()=>{document.getElementById('strInput').value='HELLO WORLD';loadSteps(buildHuffman('HELLO WORLD'));}},
  ],onReset:()=>{svgClear();clearObs();steps=[];document.getElementById('step-bar').style.display='none';},reset:false,onRandom:false});
  const rb=document.createElement('button');rb.className='btn btn-sm';rb.textContent='Reset';
  rb.onclick=()=>{svgClear();clearObs();steps=[];document.getElementById('step-bar').style.display='none';};
  document.getElementById('controls').firstChild.appendChild(rb);
  svgClear();
  const t=svgEl('text',{x:450,y:250,'text-anchor':'middle',fill:'#4a5d7a','font-family':'JetBrains Mono','font-size':14});
  t.textContent='Enter text or pick a preset to build the Huffman Tree';
  document.getElementById('svg-root').appendChild(t);
}

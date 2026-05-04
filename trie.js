// ═══════════════════════════════════════════════════════════════════
//  🌿 TRIE MODULE
// ═══════════════════════════════════════════════════════════════════
class TrieNode{constructor(){this.children={};this.isEnd=false;this.val='';}}
class Trie{
  constructor(){this.root=new TrieNode();this.words=[];}
  insert(word){
    const S=[];let cur=this.root;const W=word.toUpperCase();
    S.push({msg:`Inserting word "${W}"`,why:'Traverse trie character by character, creating nodes as needed.',draw:()=>this._render(null,[])});
    for(let i=0;i<W.length;i++){
      const ch=W[i];
      if(!cur.children[ch]){cur.children[ch]=new TrieNode();cur.children[ch].val=ch;
        S.push({msg:`Create node '${ch}' (char ${i+1}/${W.length})`,why:`Character '${ch}' doesn't exist. Create new node.`,draw:()=>this._render(W.slice(0,i+1),[])});
      }else{S.push({msg:`Node '${ch}' exists — follow it (char ${i+1}/${W.length})`,why:`Character '${ch}' already has a node.`,draw:()=>this._render(W.slice(0,i+1),[])});}
      cur=cur.children[ch];
    }
    cur.isEnd=true;if(!this.words.includes(W))this.words.push(W);
    S.push({msg:`✓ "${W}" inserted — marked as end of word`,why:'isEnd=true marks a complete word.',draw:()=>this._render(W,this.words)});
    return S;
  }
  search(word){
    const S=[];let cur=this.root;const W=word.toUpperCase();
    for(let i=0;i<W.length;i++){const ch=W[i];
      if(!cur.children[ch]){S.push({msg:`✗ "${W}" not found — '${ch}' missing at depth ${i+1}`,why:'Character has no node.',draw:()=>this._render(W.slice(0,i),[])});return S;}
      S.push({msg:`Following '${ch}' (depth ${i+1})`,why:'Character found, continue.',draw:()=>this._render(W.slice(0,i+1),[])});cur=cur.children[ch];
    }
    if(cur.isEnd)S.push({msg:`✓ "${W}" found in Trie!`,why:'isEnd=true. Complete word exists.',draw:()=>this._render(W,this.words)});
    else S.push({msg:`"${W}" is a prefix but not a complete word`,why:'isEnd=false.',draw:()=>this._render(W,[])});
    return S;
  }
  prefix(word){
    const S=[];let cur=this.root;const W=word.toUpperCase();
    for(let i=0;i<W.length;i++){const ch=W[i];if(!cur.children[ch]){S.push({msg:`No words with prefix "${W}"`,why:'',draw:()=>this._render(null,[])});return S;}cur=cur.children[ch];}
    const matches=this.words.filter(w=>w.startsWith(W));
    S.push({msg:`Prefix "${W}" → ${matches.length} match(es): ${matches.join(', ')||'none'}`,why:`All words starting with "${W}".`,draw:()=>this._render(W,matches)});
    return S;
  }
  _render(highlight,matchWords){
    function buildViz(node,char){
      const n={val:char||'∅',left:null,right:null,_state:'n-default',isEnd:node.isEnd};
      if(highlight&&highlight.length>0&&char&&highlight[0]===char)n._state='n-path';
      const kids=Object.keys(node.children);if(kids.length===0)return n;
      let cur=n;kids.forEach((k,i)=>{const child=buildViz(node.children[k],k);if(i===0)cur.left=child;else cur.right=child;});
      return n;
    }
    const root={val:'ROOT',left:null,right:null,_state:'n-default'};
    const kids=Object.keys(this.root.children);
    if(kids.length>0){root.left=buildViz(this.root.children[kids[0]],kids[0]);let cur=root;for(let i=1;i<kids.length;i++){cur.right=buildViz(this.root.children[kids[i]],kids[i]);cur=cur.right;}}
    renderTree(root,null,n=>n._state||'n-default',n=>n.isEnd?'*':'');
    const tw=document.getElementById('trie-words');tw.style.display='flex';
    tw.innerHTML='<span class="preset-label" style="margin-right:4px;">Words:</span>'+this.words.map(w=>`<span class="trie-word" onclick="trieSearch('${w}')">${w}</span>`).join('');
  }
}
const trie=new Trie();
function trieSearch(w){loadSteps(trie.search(w));}
function initTrie(){
  currentTree='trie';
  buildControls({input:false,strInput:true,strPlaceholder:'Type word…',buttons:[
    {label:'Insert',cls:'btn-blue',fn:()=>{const w=getStr();if(!w)return;loadSteps(trie.insert(w));}},
    {label:'Search',cls:'btn-green',fn:()=>{const w=getStr();if(!w)return;loadSteps(trie.search(w));}},
    {label:'Prefix',cls:'btn btn-sm',fn:()=>{const w=getStr();if(!w)return;loadSteps(trie.prefix(w));}},
  ],presets:[{label:'CS Words',fn:()=>{['TREE','TRIE','DATA','DART','DARK','DO','DOG','DOGS','CAT'].forEach(w=>trie.insert(w));trie._render(null,trie.words);obs('Loaded: CS word set','Try searching TREE, prefix DA');}}],
    onReset:()=>{trie.root=new TrieNode();trie.words=[];svgClear();document.getElementById('trie-words').style.display='none';clearObs();steps=[];document.getElementById('step-bar').style.display='none';},onRandom:false,reset:false
  });
  const rb=document.createElement('button');rb.className='btn btn-sm';rb.textContent='Reset';
  rb.onclick=()=>{trie.root=new TrieNode();trie.words=[];svgClear();document.getElementById('trie-words').style.display='none';clearObs();steps=[];document.getElementById('step-bar').style.display='none';};
  document.getElementById('controls').firstChild.appendChild(rb);
  document.getElementById('trie-words').style.display='flex';trie._render(null,[]);
}

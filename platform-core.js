// ═══════════════════════════════════════════════════════════════════
// DS2 Platform — Core Module
// State, Navigation, SVG Helpers, Tree Layout, Observations, Steps
// ═══════════════════════════════════════════════════════════════════

// ── AUTH CHECK ──
(function(){
  const SESSION_KEY = 'ds2_session';
  try {
    const session = JSON.parse(localStorage.getItem(SESSION_KEY));
    if (!session) { window.location.href = 'login.html'; return; }
  } catch { window.location.href = 'login.html'; }
})();

// ── STATE ──
let currentPage = 'dashboard';
let currentTree = null;
let steps = [];
let stepIdx = 0;
let autoTimer = null;
let obsCount = 0;

// ── DASHBOARD DATA ──
const TREES = [
  {id:'avl',  name:'AVL Tree',       icon:'⚖️',  unit:'Unit 1',color:'#22c55e',ready:true,
   desc:'Height-balanced BST. Guarantees O(log n) ops via rotations.',
   topics:['LL Rotation','RR Rotation','LR Rotation','RL Rotation','Balance Factor']},
  {id:'rbt',  name:'Red-Black Tree', icon:'🔴',  unit:'Unit 1',color:'#ef4444',ready:true,
   desc:'Self-balancing BST using color properties. Used in Linux scheduler, Java TreeMap.',
   topics:['Recoloring','Uncle Cases','Fix-up','5 Properties']},
  {id:'heap', name:'Heap (Min/Max)', icon:'🏔️',  unit:'Unit 2',color:'#f97316',ready:true,
   desc:'Complete binary tree satisfying heap property. Foundation of priority queues.',
   topics:['Heapify-Up','Heapify-Down','Extract-Min','Build Heap']},
  {id:'trie', name:'Trie',           icon:'🌿',  unit:'Unit 3',color:'#06b6d4',ready:true,
   desc:'Prefix tree for string storage. O(L) search where L is string length.',
   topics:['Insert Word','Search','Prefix Query','Autocomplete']},
  {id:'huffman',name:'Huffman Tree', icon:'📦',  unit:'Unit 1',color:'#a855f7',ready:true,
   desc:'Optimal prefix-free encoding. Used in ZIP, JPEG, MP3 compression.',
   topics:['Frequency Count','Min-Heap Build','Tree Merge','Encoding Table']},
  {id:'splay', name:'Splay Tree',    icon:'🌀',  unit:'Unit 1',color:'#eab308',ready:true,
   desc:'Self-adjusting BST. Recently accessed nodes moved to root via splaying.',
   topics:['Zig','Zig-Zig','Zig-Zag','Amortized O(log n)']},
  {id:'btree', name:'B-Tree',        icon:'🌳',  unit:'Unit 1',color:'#ec4899',ready:false,
   desc:'Multi-way search tree. Used in databases and file systems.',
   topics:['Split','Merge','Order-m','Disk I/O']},
];

// ── USER MENU ──
function setupUserMenu() {
  const SESSION_KEY = 'ds2_session';
  try {
    const session = JSON.parse(localStorage.getItem(SESSION_KEY));
    if (session) {
      const nameEl = document.getElementById('user-display-name');
      const avatarEl = document.getElementById('user-avatar-text');
      if (nameEl) nameEl.textContent = session.name;
      if (avatarEl) avatarEl.textContent = session.name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2);
      // Welcome message
      const welcomeEl = document.getElementById('dash-welcome-name');
      if (welcomeEl) welcomeEl.textContent = `Welcome back, ${session.name.split(' ')[0]}! 👋`;
    }
  } catch {}
}

function logout() {
  localStorage.removeItem('ds2_session');
  window.location.href = 'login.html';
}

// ── DASHBOARD BUILD ──
function buildDashboard(){
  const g=document.getElementById('dash-grid');
  g.innerHTML=TREES.map(t=>`
    <div class="dash-card ${t.ready?'ready':'soon'}" onclick="${t.ready?`showPage('${t.id}')`:''}">
      <div class="card-badge ${t.ready?'status-ready':'status-soon'}">${t.ready?'● ready':'○ soon'}</div>
      <div class="card-icon">${t.icon}</div>
      <div class="card-name">${t.name}</div>
      <div class="card-unit">${t.unit}</div>
      <div class="card-desc">${t.desc}</div>
      <div class="card-topics">${t.topics.map(x=>`<span class="topic-tag">${x}</span>`).join('')}</div>
    </div>
  `).join('');
}

// ── PAGE NAVIGATION ──
function showPage(id){
  currentPage=id;
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  const nav=document.getElementById('nav-'+id);
  if(nav)nav.classList.add('active');

  if(id==='dashboard'){
    document.getElementById('page-dashboard').style.display='block';
    document.getElementById('page-tree').style.display='none';
    document.getElementById('topbar-name').textContent='Dashboard';
    document.getElementById('topbar-unit').textContent='';
    document.getElementById('topbar-actions-dynamic').innerHTML='';
    return;
  }

  document.getElementById('page-dashboard').style.display='none';
  document.getElementById('page-tree').style.display='flex';

  const t=TREES.find(x=>x.id===id);
  if(t){
    document.getElementById('topbar-name').textContent=t.name;
    document.getElementById('topbar-unit').textContent=t.unit;
  }

  stopAuto(); steps=[]; stepIdx=0;
  clearObs();
  document.getElementById('step-bar').style.display='none';
  document.getElementById('heap-array').style.display='none';
  document.getElementById('trie-words').style.display='none';
  svgClear();

  document.getElementById('topbar-actions-dynamic').innerHTML='';

  if(id==='avl')     initAVL();
  if(id==='rbt')     initRBT();
  if(id==='heap')    initHeap();
  if(id==='trie')    initTrie();
  if(id==='huffman') initHuffman();
  if(id==='splay')   initSplay();
  if(id==='btree')   initBTree();
}

// ── SVG HELPERS ──
const SVG_NS='http://www.w3.org/2000/svg';
function svgEl(tag,attrs={}){
  const el=document.createElementNS(SVG_NS,tag);
  for(const[k,v]of Object.entries(attrs))el.setAttribute(k,v);
  return el;
}
function svgClear(){document.getElementById('svg-root').innerHTML='';}

// Tree layout constants
const NODE_R=22, H_GAP=48, V_GAP=72;

// Compute positions via in-order traversal
function layoutTree(root, isNil){
  if(!root||root===isNil||root.val===null)return[];
  let ctr=0;
  function assignX(n){
    if(!n||n===isNil||n.val===null)return;
    assignX(n.left); n._x=ctr*H_GAP; ctr++; assignX(n.right);
  }
  function assignY(n,d){
    if(!n||n===isNil||n.val===null)return;
    n._y=d*V_GAP; assignY(n.left,d+1); assignY(n.right,d+1);
  }
  assignX(root); assignY(root,0);
  const pos=[];
  function col(n){
    if(!n||n===isNil||n.val===null)return;
    pos.push(n); col(n.left); col(n.right);
  }
  col(root); return pos;
}

function centerTree(positions){
  if(!positions.length)return{offX:0,offY:0,scale:1};
  const xs=positions.map(p=>p._x), ys=positions.map(p=>p._y);
  const minX=Math.min(...xs),maxX=Math.max(...xs);
  const minY=Math.min(...ys),maxY=Math.max(...ys);
  const W=900,H=480,pad=60;
  const tW=(maxX-minX)||1, tH=(maxY-minY)||1;
  const scale=Math.min((W-pad*2)/tW,(H-pad*2)/tH,1.8);
  const offX=(W-tW*scale)/2-minX*scale;
  const offY=pad-minY*scale;
  return{offX,offY,scale};
}

function renderTree(root, isNil, nodeClass, subLabel){
  svgClear();
  if(!root||root===isNil||root.val===null){
    const t=svgEl('text',{x:450,y:250,'text-anchor':'middle',fill:'#4a5d7a','font-family':'JetBrains Mono','font-size':14});
    t.textContent='Empty — insert a value to begin';
    document.getElementById('svg-root').appendChild(t); return;
  }
  const pos=layoutTree(root,isNil);
  const {offX,offY,scale}=centerTree(pos);
  const R=NODE_R;
  const g=document.getElementById('svg-root');

  // edges first
  pos.forEach(n=>{
    ['left','right'].forEach(dir=>{
      const ch=n[dir];
      if(!ch||ch===isNil||ch.val===null)return;
      const line=svgEl('line',{
        x1:n._x*scale+offX, y1:n._y*scale+offY,
        x2:ch._x*scale+offX, y2:ch._y*scale+offY,
        class:'edge-line'
      });
      g.appendChild(line);
    });
  });

  // nodes
  pos.forEach(n=>{
    const cx=n._x*scale+offX, cy=n._y*scale+offY;
    const cls=typeof nodeClass==='function'?nodeClass(n):nodeClass;
    const ng=svgEl('g',{class:`node-group ${cls}`,transform:`translate(${cx},${cy})`});
    if(n._anim){ng.classList.add(n._anim);n._anim=null;}

    // glow
    const glow=svgEl('circle',{r:R+10,fill:'rgba(59,130,246,0.15)',class:'node-glow'});
    ng.appendChild(glow);
    // circle
    const circ=svgEl('circle',{r:R,class:'node-circle'});
    ng.appendChild(circ);
    // value
    const txt=svgEl('text',{class:'node-text','text-anchor':'middle','dominant-baseline':'middle'});
    txt.textContent=n.val;
    ng.appendChild(txt);
    // sub label
    if(subLabel){
      const sub=svgEl('text',{class:'node-sub','text-anchor':'middle',y:R+13});
      sub.textContent=typeof subLabel==='function'?subLabel(n):'';
      ng.appendChild(sub);
    }
    g.appendChild(ng);
  });
}

// ── OBSERVATIONS ──
function obs(text, why=''){
  obsCount++;
  document.getElementById('obs-text').textContent=text;
  document.getElementById('obs-why').textContent=why;
  const hist=document.getElementById('obs-history');
  const div=document.createElement('div');
  div.className='obs-entry';
  div.innerHTML=`<div class="obs-entry-num">#${obsCount}</div>
    <div class="obs-entry-text">${text}</div>
    ${why?`<div class="obs-entry-why">${why}</div>`:''}`;
  hist.prepend(div);
}
function clearObs(){
  obsCount=0;
  document.getElementById('obs-text').textContent='Perform an operation to see step-by-step explanations here.';
  document.getElementById('obs-why').textContent='';
  document.getElementById('obs-history').innerHTML='';
}

// ── STEP PLAYER ──
function loadSteps(s){ steps=s; stepIdx=0; if(s.length)showStep(0); }

function showStep(i){
  if(!steps.length)return;
  const s=steps[i];
  document.getElementById('stepCounter').textContent=`Step ${i+1}/${steps.length}`;
  document.getElementById('stepMsg').textContent=s.msg||'';
  document.getElementById('step-bar').style.display='flex';
  if(s.draw)s.draw();
  obs(s.msg||'', s.why||'');
}
function stepNext(){
  if(stepIdx<steps.length-1){stepIdx++;showStep(stepIdx);}
  else{stopAuto(); if(steps[steps.length-1]?.finalDraw)steps[steps.length-1].finalDraw();}
}
function stepPrev(){stopAuto();if(stepIdx>0){stepIdx--;showStep(stepIdx);}}
function stepFirst(){stopAuto();stepIdx=0;showStep(0);}
function stepLast(){stopAuto();stepIdx=steps.length-1;showStep(stepIdx);}
function stepAuto(){
  if(autoTimer){stopAuto();return;}
  document.getElementById('autoBtn').textContent='⏸ Pause';
  const spd=parseInt(document.getElementById('speedSlider').value);
  const delay=1200-spd*100;
  autoTimer=setInterval(()=>{
    if(stepIdx<steps.length-1){stepIdx++;showStep(stepIdx);}
    else stopAuto();
  },delay);
}
function stopAuto(){
  if(autoTimer){clearInterval(autoTimer);autoTimer=null;}
  document.getElementById('autoBtn').textContent='▶ Auto';
}

// ── CONTROLS BUILDER ──
function buildControls(cfg){
  const c=document.getElementById('controls');
  c.innerHTML='';
  const row=document.createElement('div');
  row.style.cssText='display:flex;flex-wrap:wrap;gap:6px;align-items:center;';

  if(cfg.input!==false){
    const inp=document.createElement('input');
    inp.className='inp'; inp.type='number'; inp.id='mainInput';
    inp.placeholder=cfg.placeholder||'Value…'; inp.min=0; inp.max=999;
    inp.onkeydown=e=>{if(e.key==='Enter')cfg.onInsert&&cfg.onInsert();};
    row.appendChild(inp);
  }
  if(cfg.strInput){
    const inp=document.createElement('input');
    inp.className='inp'; inp.type='text'; inp.id='strInput';
    inp.placeholder=cfg.strPlaceholder||'Word…'; inp.style.width='120px';
    row.appendChild(inp);
  }

  (cfg.buttons||[]).forEach(b=>{
    const btn=document.createElement('button');
    btn.className=`btn ${b.cls||''}`;
    btn.textContent=b.label;
    btn.onclick=b.fn;
    row.appendChild(btn);
  });

  if(cfg.presets){
    const sep=document.createElement('div');
    sep.style.cssText='width:1px;height:20px;background:#1e2d45;margin:0 4px;';
    row.appendChild(sep);
    const lbl=document.createElement('span');
    lbl.className='preset-label'; lbl.textContent='Presets:';
    row.appendChild(lbl);
    cfg.presets.forEach(p=>{
      const btn=document.createElement('button');
      btn.className='btn btn-sm'; btn.textContent=p.label; btn.onclick=p.fn;
      row.appendChild(btn);
    });
  }

  if(cfg.reset!==false){
    const sep=document.createElement('div');
    sep.style.cssText='width:1px;height:20px;background:#1e2d45;margin:0 2px;';
    row.appendChild(sep);
    const rb=document.createElement('button');
    rb.className='btn btn-sm'; rb.textContent='Reset'; rb.onclick=cfg.onReset||function(){};
    row.appendChild(rb);
    const rand=document.createElement('button');
    rand.className='btn btn-sm'; rand.textContent='🎲 Random'; rand.onclick=cfg.onRandom||function(){};
    row.appendChild(rand);
  }
  c.appendChild(row);
}

function getInput(){ return parseInt(document.getElementById('mainInput')?.value)||null; }
function getStr(){ return (document.getElementById('strInput')?.value||'').trim().toUpperCase(); }
function clearInput(){ const i=document.getElementById('mainInput'); if(i)i.value=''; }

// ── MOBILE SIDEBAR TOGGLE ──
function toggleSidebar(){
  document.getElementById('sidebar').classList.toggle('open');
}

// ── INIT ──
document.addEventListener('DOMContentLoaded', () => {
  setupUserMenu();
  buildDashboard();
  showPage('dashboard');

  document.addEventListener('keydown',e=>{
    if(e.target.tagName==='INPUT')return;
    if(e.key==='ArrowRight')stepNext();
    if(e.key==='ArrowLeft')stepPrev();
  });
});

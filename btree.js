// ═══════════════════════════════════════════════════════════════════
//  🌳 B-TREE MODULE (Coming Soon)
// ═══════════════════════════════════════════════════════════════════
function initBTree(){
  svgClear();
  const g=document.getElementById('svg-root');
  const t1=svgEl('text',{x:450,y:220,'text-anchor':'middle',fill:'#4a5d7a','font-family':'JetBrains Mono','font-size':18,'font-weight':'600'});
  t1.textContent='B-Tree Visualizer';
  const t2=svgEl('text',{x:450,y:255,'text-anchor':'middle',fill:'#4a5d7a','font-family':'JetBrains Mono','font-size':13});
  t2.textContent='Coming soon — multi-way search tree used in databases & file systems';
  g.appendChild(t1);g.appendChild(t2);
  buildControls({input:false,buttons:[],presets:[],onReset:()=>{},onRandom:()=>{},reset:false});
  obs('B-Tree coming soon','Covers: Split, Merge, Order-m tree, disk block optimization.');
}

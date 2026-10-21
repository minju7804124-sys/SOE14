'use strict';
(() => {
 const esc2=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const projects=window.PROJECTS||[];
 const mode=document.createElement('div');mode.className='view-switch';mode.setAttribute('role','group');mode.setAttribute('aria-label','작품 보기 방식');
 mode.innerHTML='<button id="scrollMode" type="button" aria-pressed="false">↓ SCROLL</button><button id="slideMode" type="button" aria-pressed="true">↔ SLIDE</button>';
 document.body.appendChild(mode);
 const gallery=document.createElement('section');gallery.className='scroll-archive';gallery.id='scrollArchive';gallery.setAttribute('aria-label','스크롤로 보는 전체 작품');
 gallery.innerHTML='<div class="archive-intro"><h2>Selected<br>works<span style="color:#727579">.</span></h2><p>SOE! / MOVING IMAGE ARCHIVE<br>SCROLL TO EXPLORE / CLICK TO WATCH</p></div>'+
 ['film','commercial'].map(section=>{
  const collection=projects.filter(p=>p.section===section);
  return '<div class="archive-group" id="scroll-'+section+'"><div class="archive-group-head"><h3>'+section.charAt(0).toUpperCase()+section.slice(1)+'</h3><span>'+String(collection.length).padStart(2,'0')+' WORKS / '+section.toUpperCase()+'</span></div><div class="archive-list">'+collection.map((p,i)=>{
   const recognition=(p.recognition||[]).map(a=>'<span>'+esc2(a.label)+' · '+esc2(a.type)+'</span>').join('');
   return '<article class="archive-item"><a class="archive-photo" href="'+esc2(p.url||'#')+'" '+(p.url?'target="_blank" rel="noopener noreferrer"':'aria-disabled="true"')+'><img loading="lazy" src="'+esc2(p.poster)+'" alt="'+esc2(p.title)+' 작품 이미지"><span class="number">'+String(i+1).padStart(2,'0')+' / '+String(collection.length).padStart(2,'0')+'</span></a><div class="archive-details"><h4>'+esc2(p.title)+'</h4><span>'+esc2(p.duration)+'</span></div><div class="archive-recognition">'+recognition+'</div><p class="archive-description">'+esc2(p.summary||p.caption)+'</p><div class="archive-actions">'+(p.url?'<a href="'+esc2(p.url)+'" target="_blank" rel="noopener noreferrer">WATCH FILM ↗</a>':'')+'<button type="button" data-view-project="'+esc2(p.slug)+'">CINEMATIC VIEW ↗</button></div></article>';
  }).join('')+'</div></div>';
 }).join('');
 const finale=document.getElementById('contact-finale');finale.parentNode.insertBefore(gallery,finale);
 const accolades=document.createElement('div');accolades.className='scene-recognition';accolades.setAttribute('aria-label','수상 및 상영 이력');document.getElementById('exhibition').appendChild(accolades);
 const updateAccolades=()=>{
  const slug=document.body.dataset.scene;const p=projects.find(x=>x.slug===slug);accolades.innerHTML=(p?.recognition||[]).map(a=>'<span>'+esc2(a.label)+' · '+esc2(a.type)+'</span>').join('');
 };
 const observer=new MutationObserver(updateAccolades);observer.observe(document.body,{attributes:true,attributeFilter:['data-scene']});updateAccolades();
 function setMode(scroll,keepPosition=false){
  document.body.classList.toggle('scroll-view',scroll);
  document.getElementById('scrollMode').setAttribute('aria-pressed',String(scroll));
  document.getElementById('slideMode').setAttribute('aria-pressed',String(!scroll));
  if(scroll){document.getElementById('scrollArchive').hidden=false;if(!keepPosition)gallery.scrollIntoView({behavior:'smooth',block:'start'});}
  else{if(!keepPosition)window.scrollTo({top:0,behavior:'smooth'});}
 }
 document.getElementById('scrollMode').onclick=()=>setMode(true);
 document.getElementById('slideMode').onclick=()=>setMode(false);
 gallery.addEventListener('click',e=>{const b=e.target.closest('[data-view-project]');if(!b)return;const slug=b.dataset.viewProject;setMode(false,true);window.scrollTo(0,0);const nav=projects.find(x=>x.slug===slug);if(nav){location.hash=slug;window.dispatchEvent(new HashChangeEvent('hashchange'));}});
 // In gallery mode, use the original header category buttons as direct scroll navigation.
 document.addEventListener('click',e=>{
  const b=e.target.closest('header [data-section]');
  if(!b||!document.body.classList.contains('scroll-view'))return;
  e.preventDefault();e.stopImmediatePropagation();
  document.getElementById('scroll-'+b.dataset.section)?.scrollIntoView({behavior:'smooth',block:'start'});
 },true);
 // Desktop starts in the natural vertical reading mode; phones keep the cinematic swipe mode.
 setMode(window.innerWidth>=900,true);
})();

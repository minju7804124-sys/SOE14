'use strict';
/* soE! / Kinetic editorial layer: renders without dependencies, respects FX and reduced motion. */
(function(){
 const main=document.getElementById('exhibition');
 const groups=document.querySelectorAll('.archive-group');
 if(!main || !window.PROJECTS) return;
 const butterfly=document.createElement('div');
 butterfly.className='soe-butterfly-stage';
 butterfly.setAttribute('aria-hidden','true');
 butterfly.innerHTML=[
 '<svg class="soe-butterfly-svg" viewBox="0 0 900 740" xmlns="http://www.w3.org/2000/svg" role="presentation">',
 '<defs>',
 '<radialGradient id="soeAura"><stop offset="0" stop-color="#d9eaff" stop-opacity=".54"/><stop offset=".36" stop-color="#827fd4" stop-opacity=".23"/><stop offset="1" stop-color="#4a5fbc" stop-opacity="0"/></radialGradient>',
 '<linearGradient id="soeGlass" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#a7bbec" stop-opacity=".05"/><stop offset=".3" stop-color="#a8c4ed" stop-opacity=".26"/><stop offset=".6" stop-color="#b8acee" stop-opacity=".09"/><stop offset="1" stop-color="#b8dfff" stop-opacity=".36"/></linearGradient>',
 '<linearGradient id="soeEdge" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#e4f7f2" stop-opacity=".04"/><stop offset=".3" stop-color="#d1daff" stop-opacity=".93"/><stop offset=".65" stop-color="#aface8" stop-opacity=".8"/><stop offset="1" stop-color="#d6fff1" stop-opacity=".09"/></linearGradient>',
 '<linearGradient id="soeVein" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#a9d9ff" stop-opacity=".9"/><stop offset=".5" stop-color="#c2c0e9" stop-opacity=".28"/><stop offset="1" stop-color="#a8cdef" stop-opacity=".1"/></linearGradient>',
 '<filter id="soeGlow" x="-70%" y="-70%" width="240%" height="240%"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>',
 '<g id="soeWing">',
 '<path d="M448 345 C364 223 286 88 161 92 C62 88 33 184 71 252 C107 313 252 349 447 366 Z" fill="url(#soeGlass)" stroke="url(#soeEdge)" stroke-width="2.1"/>',
 '<path d="M443 368 C329 358 215 362 135 418 C82 453 93 527 145 557 C215 595 338 551 449 409 Z" fill="url(#soeGlass)" stroke="url(#soeEdge)" stroke-width="1.8"/>',
 '<path d="M438 356 C314 238 216 163 125 161 M437 354 C296 290 165 260 75 253 M436 356 C306 346 228 334 151 300 M437 369 C310 395 219 430 134 483 M441 372 C339 435 286 496 208 547" fill="none" stroke="url(#soeVein)" stroke-width="1.35"/>',
 '<path d="M161 92 C185 189 282 253 441 360 M71 250 C173 224 309 278 442 357 M144 556 C189 481 298 403 441 385" fill="none" stroke="#e2ddff" stroke-opacity=".25" stroke-width=".8"/>',
 '<path d="M433 352 C366 271 325 224 294 168 C261 111 210 109 165 139 M432 391 C365 413 327 452 296 510 C257 552 194 553 155 522" fill="none" stroke="#b1f5f3" stroke-opacity=".45" stroke-width="2.2" class="soe-glow-line"/>',
 '<circle cx="160" cy="92" r="3" fill="#e4edff"/><circle cx="132" cy="483" r="2.5" fill="#c5e8ff"/><circle cx="208" cy="547" r="2" fill="#bfeef1"/>',
 '</g>',
 '</defs>',
 '<ellipse cx="450" cy="365" rx="365" ry="323" fill="url(#soeAura)"/>',
 '<g class="soe-wing-left"><use href="#soeWing"/></g>',
 '<g transform="translate(900 0) scale(-1 1)"><g class="soe-wing-right"><use href="#soeWing"/></g></g>',
 '<path d="M450 320 C443 357 441 420 451 484 C463 413 460 346 450 320Z" fill="#d2deef" fill-opacity=".88" stroke="#e5f9fc" stroke-opacity=".64"/>',
 '<ellipse cx="450" cy="349" rx="9" ry="31" fill="#c8dcff" opacity=".5" filter="url(#soeGlow)"/>',
 '<path d="M449 332 Q427 274 396 275 M452 332 Q474 274 504 275" fill="none" stroke="#c5e8ff" stroke-opacity=".65" stroke-width="1.2"/>',
 '<circle class="soe-spark" cx="95" cy="113" r="2.3" fill="#c4e9f9"/>',
 '<circle class="soe-spark" cx="793" cy="150" r="3" fill="#c4e9f9"/>',
 '<circle class="soe-spark" cx="745" cy="533" r="2.4" fill="#d9ceff"/>',
 '<circle class="soe-spark" cx="176" cy="548" r="2.8" fill="#d1e9f5"/>',
 '<path d="M47 377 H141 M752 296 H865 M657 113 H711 M203 613 H262" stroke="#c0d3e5" stroke-opacity=".18" stroke-width=".8"/>',
 '</svg>',
 '<span class="soe-butterfly-caption">BEYOND THE VISIBLE / soE!</span>'
 ].join('');
 main.insertBefore(butterfly,main.querySelector('.stage-top'));

 const awarded=[];
 window.PROJECTS.forEach(function(project){
   (project.recognition||[]).forEach(function(record){
     const keyword=record.label.split(' ')[0].toLowerCase();
     const image=(project.laurels||[]).find(function(laurel){return laurel.name.toLowerCase().includes(keyword)});
     awarded.push({project:project,record:record,image:image});
   });
 });
 if(awarded.length){
   const feature=document.createElement('section');
   feature.className='soe-award-feature reveal-on-scroll';
   feature.setAttribute('aria-label','soE! 영화제 수상 및 상영 성과');
   const label=function(text){return String(text).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]})};
   feature.innerHTML='<div class="soe-award-intro"><div><p>SELECTED / RECOGNIZED / SCREENED</p><h2>Beyond<br><em>the frame.</em></h2></div><p class="soe-award-aside">상영과 수상으로 이어진 장면들.<br>Selected achievements from soE! films.</p></div>'+
      '<div class="soe-award-grid">'+awarded.slice(0,6).map(function(item){
         const awardType=/AWARD|수상/i.test(item.record.type)?'is-award':'';
         return '<button class="soe-award-card '+awardType+'" type="button" data-award-project="'+label(item.project.slug)+'" aria-label="'+label(item.project.title+', '+item.record.label+', '+item.record.type)+' 보기">'+
          '<span class="soe-award-type">'+label(item.record.label)+' / '+label(item.record.type)+'</span><div><strong>'+label(item.project.title)+'</strong><small>VIEW THE FILM / '+label(item.project.duration)+'</small></div>'+
          (item.image?'<img src="'+label(item.image.src)+'" alt="" loading="lazy">':'')+'</button>';
      }).join('')+'</div>';
   const sections=main.querySelector('.home-sections');
   if(sections)sections.insertAdjacentElement('afterend',feature);
   feature.addEventListener('click',function(e){
      const button=e.target.closest('[data-award-project]');
      if(!button)return;
      if(document.body.classList.contains('scroll-view'))document.getElementById('slideMode')?.click();
      const slug=button.dataset.awardProject;
      if(location.hash!=='#'+slug)location.hash=slug;
      else window.dispatchEvent(new HashChangeEvent('hashchange'));
      window.scrollTo({top:0,behavior:'auto'});
   });
 }

 groups.forEach(function(group){
    const section=group.id.replace('scroll-','');
    const items=group.querySelectorAll('.archive-item');
    const projects=window.PROJECTS.filter(function(p){return p.section===section});
    items.forEach(function(item,i){
       item.dataset.issue=String(i+1).padStart(2,'0');
       if(projects[i] && (projects[i].recognition||[]).length)item.classList.add('is-awarded');
       item.classList.add('reveal-on-scroll');
    });
 });
 const prefersReduced=window.matchMedia('(prefers-reduced-motion: reduce)');
 if('IntersectionObserver' in window && !prefersReduced.matches){
   const observer=new IntersectionObserver(function(entries){
      entries.forEach(function(entry){if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target)}});
   },{rootMargin:'0px 0px -8% 0px',threshold:.08});
   document.querySelectorAll('.reveal-on-scroll').forEach(function(el){observer.observe(el)});
   document.body.classList.add('motion-ready');
 }

 let nextFrame=0;
 main.addEventListener('pointermove',function(e){
  if(e.pointerType!=='mouse' || !document.body.classList.contains('home-view') || document.body.classList.contains('no-fx') || prefersReduced.matches)return;
  const r=main.getBoundingClientRect();
  const dx=((e.clientX-r.left)/r.width-.5)*23;
  const dy=((e.clientY-r.top)/r.height-.5)*15;
  if(nextFrame)cancelAnimationFrame(nextFrame);
  nextFrame=requestAnimationFrame(function(){
    main.style.setProperty('--butterfly-x',dx.toFixed(1)+'px');
    main.style.setProperty('--butterfly-y',dy.toFixed(1)+'px');
    nextFrame=0;
  });
 },{passive:true});
 main.addEventListener('pointerleave',function(){
   main.style.setProperty('--butterfly-x','0px');
   main.style.setProperty('--butterfly-y','0px');
 });
})();
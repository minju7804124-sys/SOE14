'use strict';
const $=s=>document.querySelector(s),P=[{id:'home',slug:'home',title:'soE!',subtitle:'CHOI MINJU / IMAGE MAKER',category:'FILMMAKER / AI ARTIST',duration:'DREAM SIGNAL / 00',poster:'../assets/soe-butterfly.jpg',caption:'현실에 없는 장면으로, 현실에 남는 감정을.',summary:'영화와 애니메이션, 브랜드 필름. soE!가 만드는 낯설고 아름다운 세계.',description:'',home:true},...window.PROJECTS],screen=$('#screen'),canvas=$('#visual'),poster=$('#poster'),drawer=$('#drawer'),player=$('#player');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let signalMix=.35,draggingReality=false;
let current=Math.max(0,P.findIndex(p=>p.slug===location.hash.slice(1))),busy=false,previousFocus=null;
if(['film','commercial'].includes(location.hash.slice(1)))current=P.findIndex(p=>p.section===location.hash.slice(1));
let activeSection=P[current].section||'film';
const reduced=matchMedia('(prefers-reduced-motion:reduce)');let fx=!reduced.matches&&innerWidth>760;let textureReady=false,gl=null,program=null,texture=null,locations={},imageAspect=16/9,imageTicket=0,frame=0,last=0,energy=0,burst=0,px=.5,py=.5,tx=.5,ty=.5;
// Local image navigation: preserve the main cinematic frame, but let visitors jump.
const previews=document.createElement('section');
previews.id='workPreviews';
previews.className='work-previews';
previews.setAttribute('aria-label','현재 섹션의 작품 미리보기');
screen.closest('.media-column').appendChild(previews);
function renderPreviews(){
  if(current===0){previews.hidden=true;previews.replaceChildren();return}
  previews.hidden=false;
  const indices=sectionIndices();
  const position=indices.indexOf(current);
  const visible=Array.from({length:Math.min(3,indices.length)},(_,n)=>indices[(position+n)%indices.length]);
  previews.innerHTML='<div class="preview-bar"><span>NEXT / '+esc(activeSection.toUpperCase())+'</span><span>'+String(position+1).padStart(2,'0')+' / '+String(indices.length).padStart(2,'0')+'</span></div>'+
    '<div class="preview-list">'+visible.map(i=>{
      const item=P[i],isActive=i===current;
      return '<button type="button" class="preview-tile'+(isActive?' is-current':'')+'" data-preview-jump="'+i+'" aria-label="'+esc(item.title)+' 보기"'+(isActive?' aria-current="true"':'')+'>'+
        '<img src="'+esc(item.poster)+'" alt="" loading="lazy"><span class="preview-name">'+esc(item.title)+'</span></button>';
    }).join('')+
    '<button type="button" class="preview-index" data-preview-all aria-label="모든 작품 목록 열기"><span>ALL</span><strong>↗</strong><small>'+String(indices.length).padStart(2,'0')+' WORKS</small></button></div>';
}
previews.addEventListener('click',event=>{
  const jump=event.target.closest('[data-preview-jump]');
  if(jump){go(Number(jump.dataset.previewJump));return}
  if(event.target.closest('[data-preview-all]'))panel('index');
});
function initGL(){try{gl=canvas.getContext('webgl',{alpha:false,antialias:false,powerPreference:'low-power'});if(!gl)return;const vs=`attribute vec2 aPosition;varying vec2 vUV;void main(){vUV=aPosition*.5+.5;gl_Position=vec4(aPosition,0.,1.);}`;const fs=`precision mediump float;
varying vec2 vUV;uniform sampler2D uImage;uniform vec2 uResolution;uniform vec2 uMouse;uniform float uAspect;uniform float uTime;uniform float uEnergy;uniform float uBurst;uniform float uSignal;uniform float uHome;
float hash(float n){return fract(sin(n*127.1)*43758.5453);}
void main(){vec2 q=vUV*2.-1.;vec2 bent=q*(1.+.006*dot(q,q));vec2 uv=bent*.5+.5;float edge=step(0.,uv.x)*step(uv.x,1.)*step(0.,uv.y)*step(uv.y,1.);float aspect=uResolution.x/uResolution.y;vec2 fit=vec2(min(1.,aspect/uAspect),min(1.,uAspect/aspect));
float band=floor(uv.y*45.);float noise=hash(band+floor(uTime*9.)*3.);float local=exp(-abs(uv.y-uMouse.y)*13.)*exp(-abs(uv.x-uMouse.x)*3.);
float wave=sin(uv.y*92.+uTime*3.7)*.003*local;
float displacement=(noise-.5)*local*uEnergy*.055+wave*uEnergy;
displacement+=(hash(band+floor(uTime*18.))-.5)*uBurst*.095*step(.38,noise);
uv.x+=displacement;uv.y+=sin(uv.x*12.+uTime*.35)*.0015;
vec2 source=(uv-.5)*fit+.5;float split=.0007+local*uEnergy*.004+uBurst*.009;
float r=texture2D(uImage,clamp(source+vec2(split,0.),.001,.999)).r;float g=texture2D(uImage,clamp(source,.001,.999)).g;float b=texture2D(uImage,clamp(source-vec2(split,0.),.001,.999)).b;
vec3 color=vec3(r,g,b);
if(uHome>.5){
 float field=1.-smoothstep(uSignal-.004,uSignal+.004,vUV.x);
 float slice=floor(vUV.y*68.);
 float noiseLine=hash(slice+floor(uTime*3.));
 float tear=step(.89,noiseLine)*(.009+.022*uEnergy)*(noiseLine-.5);
 vec2 signalUV=clamp(source+vec2(tear,0.),.001,.999);
 float separation=.0025+.005*uEnergy;
 vec3 shifted=vec3(texture2D(uImage,clamp(signalUV+vec2(separation,0.),.001,.999)).r,texture2D(uImage,signalUV).g,texture2D(uImage,clamp(signalUV-vec2(separation,0.),.001,.999)).b);
 float signalLine=step(.78,fract(vUV.y*uResolution.y/4.));
 shifted*=1.-signalLine*.18;
 shifted=mix(shifted,texture2D(uImage,clamp(signalUV+vec2(.006,0.),.001,.999)).rgb,.18);
 color=mix(color,shifted,field);
}

vec3 bloom=(texture2D(uImage,clamp(source+vec2(.0025,.0025),.001,.999)).rgb+texture2D(uImage,clamp(source-vec2(.0025,.0025),.001,.999)).rgb)*.5;color=mix(color,bloom,.12);color+=max(bloom-.58,0.)*.14;float grain=(hash(dot(vUV,vec2(91.73,473.9))+floor(uTime*12.))-.5)*.018;color+=grain;
float scan=sin(vUV.y*uResolution.y*1.3)*.018;float roll=exp(-pow((vUV.y-fract(uTime*.055))*17.,2.))*.018;color-=scan;color+=vec3(.75,.60,1.)*roll;color*=1.-.09*dot(q,q);gl_FragColor=vec4(color*edge,1.);}`;
function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s}
program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vs));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fs));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));gl.useProgram(program);
const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);const pos=gl.getAttribLocation(program,'aPosition');gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);['uResolution','uMouse','uAspect','uTime','uEnergy','uBurst','uImage','uSignal','uHome'].forEach(n=>locations[n]=gl.getUniformLocation(program,n));
texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.uniform1i(locations.uImage,0);
canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();textureReady=false;screen.classList.remove('gl-ready');cancelAnimationFrame(frame)});
canvas.addEventListener('webglcontextrestored',()=>{initGL();setTexture(P[current].poster)});
}catch(e){gl=null;screen.classList.remove('gl-ready')}}
function resize(){if(!gl)return;const r=screen.getBoundingClientRect(),ratio=Math.min(devicePixelRatio||1,innerWidth<=760?1.3:1.6);canvas.width=Math.round(r.width*ratio);canvas.height=Math.round(r.height*ratio);gl.viewport(0,0,canvas.width,canvas.height)}
function setTexture(url){const ticket=++imageTicket;textureReady=false;screen.classList.remove('gl-ready');if(!gl)return;const im=new Image();im.onload=()=>{if(ticket!==imageTicket)return;try{gl.bindTexture(gl.TEXTURE_2D,texture);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,im);imageAspect=im.width/im.height;textureReady=true;resize();screen.classList.add('gl-ready');startRender()}catch{screen.classList.remove('gl-ready')}};im.src=url}
function render(now){frame=0;if(!gl||!textureReady||!fx||document.hidden||drawer.open||player.open)return;if(now-last<32){frame=requestAnimationFrame(render);return}const dt=Math.min((now-last)/16.67,3);last=now;px+=(tx-px)*.09;py+=(ty-py)*.09;energy*=Math.pow(.94,dt);burst*=Math.pow(.89,dt);gl.useProgram(program);gl.uniform2f(locations.uResolution,canvas.width,canvas.height);gl.uniform2f(locations.uMouse,px,py);gl.uniform1f(locations.uAspect,imageAspect);gl.uniform1f(locations.uTime,now*.001);gl.uniform1f(locations.uEnergy,Math.min(energy,.85)*(current===0?1:.25));gl.uniform1f(locations.uBurst,burst*(current===0?1:.34));gl.uniform1f(locations.uSignal,signalMix);gl.uniform1f(locations.uHome,current===0?1:0);gl.drawArrays(gl.TRIANGLES,0,6);frame=requestAnimationFrame(render)}
function startRender(){cancelAnimationFrame(frame);if(fx&&!drawer.open&&!player.open&&!document.hidden){last=performance.now();frame=requestAnimationFrame(render)}}
function updateFX(){document.body.classList.toggle('no-fx',!fx);$('#motion').setAttribute('aria-pressed',String(fx));$('#motion span').textContent=fx?'ON':'OFF';$('#signalPulse').disabled=!fx;if(fx)startRender();else{cancelAnimationFrame(frame);document.body.classList.remove('screen-hover')}}
function sectionIndices(section=activeSection){return P.map((p,i)=>p.section===section?i:-1).filter(i=>i>=0)}
function laurelMarkup(p,detailed=false){return (p.laurels||[]).map(l=>{
 const tag=l.url?'a':detailed?'span':'button';
 const attributes=l.url?`href="${esc(l.url)}" target="_blank" rel="noopener noreferrer"`:(detailed?'':`type="button" data-award aria-label="${esc(l.name)} 상세 보기"`);
 return `<figure class="laurel"><${tag} ${attributes}><img class="laurel-image ${l.tone==='black'?'laurel-invert':''}" src="${esc(l.src)}" alt="${esc(l.name)}" loading="eager"></${tag}><figcaption>${esc(l.name.replace(' · Official Selection',''))}</figcaption></figure>`
}).join('')}

function updateSectionUI(){
 const indices=sectionIndices();const pos=indices.indexOf(current);
 $('#filmCount').textContent=String(sectionIndices('film').length).padStart(2,'0');$('#commercialCount').textContent=String(sectionIndices('commercial').length).padStart(2,'0');$('#archiveCount').textContent=P.length-1;
 document.querySelectorAll('[data-count]').forEach(n=>n.textContent=String(sectionIndices(n.dataset.count).length).padStart(2,'0'));
 $('#counter').textContent=String(current===0?0:pos+1).padStart(2,'0');
 $('#sectionLabel').textContent=current===0?'ARCHIVE':activeSection.toUpperCase();
 document.querySelectorAll('.totalCount').forEach(n=>n.textContent=String(indices.length).padStart(2,'0'));
 document.querySelectorAll('[data-section]').forEach(b=>{const on=current!==0&&b.dataset.section===activeSection;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on))});
 $('#progress').replaceChildren();
 indices.forEach((index,n)=>{const b=document.createElement('button');b.dataset.jump=index;b.setAttribute('aria-label',`${activeSection} ${n+1}. ${P[index].title}`);b.classList.toggle('active',index===current);if(index===current)b.setAttribute('aria-current','true');b.title=P[index].title;b.addEventListener('click',()=>go(index));$('#progress').append(b)});
}
function selectSection(section){if(busy)return;const i=P.findIndex(p=>p.section===section);if(i<0)return;if(drawer.open)drawer.close();go(i)}
function step(direction){const ids=sectionIndices();if(current===0){go(direction<0?ids.at(-1):ids[0]);return}const pos=ids.indexOf(current);go(ids[(pos+direction+ids.length)%ids.length])}
function display(i){
 current=i;const p=P[i];if(p.section)activeSection=p.section;
 document.body.dataset.scene=p.slug;document.body.dataset.section=p.section||'home';
 document.body.classList.toggle('has-laurels',!!p.laurels?.length);document.body.classList.toggle('company-work',!!p.studio);document.body.classList.toggle('vertical-work',!!p.vertical);
 document.documentElement.style.setProperty('--scene-image',`url("${p.poster}")`);
 $('#artWord').textContent=p.artWord||'';document.body.classList.toggle('home-view',i===0);
 $('#signalValue').textContent='SIGNAL '+String(Math.round(signalMix*100)).padStart(3,'0')+'%';
 $('#screenPlay span:last-child').textContent=i===0?'VIEW SELECTED WORK':'PLAY FILM';
 $('#watch').innerHTML=(i===0?'EXPLORE FILM':'WATCH FILM')+' <span class="small-play" aria-hidden="true"></span>';
 $('#details').innerHTML=(i===0?'Artist note':p.studio?'Project & credits':'About the work')+' <span>↗</span>';
 poster.src=p.poster;poster.alt=i===0?'soE!의 상징인 빛나는 홀로그램 나비':p.title+' 작품 이미지';setTexture(p.poster);
 $('#title').textContent=p.displayTitle||p.title;$('#title').setAttribute('aria-label',p.title);$('#title').dataset.text=p.displayTitle||p.title;$('#title').className=p.title.length>17?'long':p.title.length>11?'medium':'';
 $('#projectSubtitle').textContent=p.subtitle;$('#genre').textContent=p.category;$('#duration').textContent=p.duration;
 $('#frameLabel').textContent='FRAME / '+p.slug.toUpperCase().replaceAll('-','_');
 $('#projectNumber').textContent=i===0?'∞':String(sectionIndices().indexOf(i)+1).padStart(2,'0');
 $('#caption').textContent=p.caption;$('#summary').textContent=p.summary;
 $('#projectCredit').textContent=p.credit||'';$('#projectCredit').hidden=!p.credit;
 $('#sceneCredit').textContent=p.studio?'AI ARTIST / MINJU CHOI\n'+p.studio:'A FILM BY soE!\nIMAGE · RHYTHM · FEELING';
 $('#projectLaurels').innerHTML=laurelMarkup(p);$('#projectLaurels').hidden=!p.laurels?.length;$('#awardsRow').hidden=!p.laurels?.length;
 $('#screenPlay').setAttribute('aria-label',i===0?'Film 섹션 열기':p.title+' 재생');updateSectionUI();renderPreviews();
 $('#status').textContent=i===0?'soE! 메인페이지. Film 또는 Commercial을 선택해주세요.':`${activeSection}. ${sectionIndices().indexOf(i)+1} / ${sectionIndices().length}. ${p.title}. ${p.category}`;
 document.title=i===0?'soE! — Film & Commercial':p.title+' — soE!';history.replaceState(null,'','#'+p.slug);
 const ids=sectionIndices();const preload=new Image();preload.src=P[ids[(ids.indexOf(i)+1)%ids.length]].poster;
}
function go(i){
 if(busy)return;document.body.classList.remove('intro');const next=(i+P.length)%P.length;if(next===current)return;
 const reveal=()=>{display(next);window.scrollTo({top:0,behavior:'auto'})};
 if(!fx){reveal();return}busy=true;burst=1;
 $('#transitionNumber').textContent=next===0?'00':String(sectionIndices(P[next].section).indexOf(next)+1).padStart(2,'0');
 document.body.classList.add('switching');setTimeout(reveal,210);setTimeout(()=>{document.body.classList.remove('switching');busy=false},520)
}
function openPlayer(){if(current===0){selectSection('film');return}previousFocus=document.activeElement;if(drawer.open)drawer.close();const p=P[current];player.dataset.format=p.vertical?'portrait':'landscape';$('#playerTitle').textContent=p.title;$('#youtubeLink').href=p.url;const iframe=document.createElement('iframe');iframe.title=p.title+' — YouTube 영상';iframe.src=`https://www.youtube-nocookie.com/embed/${p.id}?autoplay=1&rel=0&playsinline=1&origin=${encodeURIComponent(location.origin)}`;iframe.allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';iframe.allowFullscreen=true;iframe.referrerPolicy='strict-origin-when-cross-origin';$('#playerMount').replaceChildren(iframe);player.showModal();cancelAnimationFrame(frame);player.querySelector('.close').focus()}
function panel(type){if(current===0&&type==='details')type='about';previousFocus=document.activeElement;const p=P[current];let html='';if(type==='index'){html=`<div class="drawer-eyebrow">SELECTED WORK / ${P.length-1} PROJECTS</div><h2 id="drawerTitle">Film &<br>Commercial.</h2>${['film','commercial'].map(section=>`<section class="index-section"><div class="index-section-heading"><h3>${section==='film'?'Film':'Commercial'}</h3><span>${sectionIndices(section).length} WORKS</span></div><div class="index-list">${sectionIndices(section).map((i,n)=>{const x=P[i];return `<button class="index-row ${i===current?'active':''}" data-select="${i}"><span class="row-number">${String(n+1).padStart(2,'0')}</span><img class="row-thumb" src="${esc(x.poster)}" alt="" loading="lazy"><span class="row-title">${esc(x.title)}<span class="row-type">${esc(x.studio?'AI ARTIST / '+x.studio:x.category)}</span></span><span class="row-time">${esc(x.duration)}</span></button>`}).join('')}</div></section>`).join('')}<div class="drawer-links"><button data-panel="about">ABOUT ↗</button><button data-panel="contact">CONTACT ↗</button><a href="https://www.youtube.com/@soezip" target="_blank" rel="noopener noreferrer">YOUTUBE / @SOEZIP</a></div>`}
if(type==='details'){const caseHtml=p.caseStudy?'<div class="case-study" aria-label="작품 핵심 정보"><div class="case-study-head">PROJECT SNAPSHOT <span>↗</span></div>'+[['PROJECT',p.caseStudy.project],['CREATIVE FOCUS',p.caseStudy.focus],['ROLE',p.caseStudy.role]].map(([k,v])=>'<div class="case-study-row"><span>'+esc(k)+'</span><p>'+esc(v)+'</p></div>').join('')+'</div>':'';html=`<div class="drawer-eyebrow">${esc(p.section.toUpperCase())} / ${esc(p.category)}</div><h2 id="drawerTitle">${esc(p.title)}</h2>${p.laurels?.length?`<div class="detail-laurels">${laurelMarkup(p,true)}</div>`:''}<p class="drawer-copy lead">${esc(p.caption)}</p><p class="drawer-copy">${esc(p.description)}</p>${caseHtml}<div class="data-rows"><div class="data-row"><span>${p.studio?'MY ROLE':'CREATOR'}</span><span>${p.studio?'AI Artist · 최민주':'soE! / 최민주'}</span></div>${p.studio?`<div class="data-row"><span>PRODUCTION</span><span>${esc(p.studio)}</span></div><div class="data-row"><span>CLIENT</span><span>${esc(p.client)}</span></div><div class="data-row"><span>AI DIRECTOR</span><span>${esc(p.director)}</span></div>`:''}<div class="data-row"><span>FORMAT</span><span>${esc(p.category)}</span></div><div class="data-row"><span>RUNTIME</span><span>${esc(p.duration)}</span></div></div>${p.fullCredits?`<details class="full-credits"><summary>Full production credits</summary><p>${esc(p.fullCredits)}</p></details>`:''}<button class="drawer-action" data-play>PLAY FILM</button><a class="drawer-action" href="${esc(p.url)}" target="_blank" rel="noopener noreferrer">OPEN IN YOUTUBE</a>${p.shortUrl?`<div class="drawer-links"><a href="${esc(p.shortUrl)}" target="_blank" rel="noopener noreferrer">WATCH THE SHORT VERSION</a></div>`:''}`}
if(type==='about'){html=`<div class="drawer-eyebrow">THE ARTIST / CHOI MINJU</div><h2 id="drawerTitle">BEYOND<br>THE FRAME.</h2><img class="about-portrait" src="../assets/portrait.webp" alt="soE! 최민주"><p class="drawer-copy lead">현실에 없는 장면으로,<br>현실에 남는 감정을.</p><p class="drawer-copy">AI 비주얼 디렉터이자 제너레이티브 필름메이커 최민주, soE!입니다. 영화와 애니메이션, 브랜드 필름을 통해 현실과 초현실 사이의 이야기를 만듭니다.</p><p class="drawer-copy">의미가 전해지는 연출, 장면의 리듬과 호흡, 음악과 이미지의 결합. 이미지 너머에 남는 감정을 설계합니다.</p><div class="data-rows"><div class="data-row"><span>PRACTICE</span><span>Film / Animation / Commercial</span></div><div class="data-row"><span>FOCUS</span><span>Visual direction / Storytelling / Sound</span></div><div class="data-row"><span>CHANNEL</span><a href="https://www.youtube.com/@soezip" target="_blank" rel="noopener noreferrer">@soezip</a></div></div><button class="drawer-action" data-panel="contact">START A CONVERSATION</button>`}
if(type==='contact'){html=`<div class="drawer-eyebrow">FOR THE NEXT REALITY</div><h2 id="drawerTitle">LET’S<br>MAKE IT<br>UNREAL.</h2><p class="drawer-copy">영화, 브랜드, 혹은 아직 이름 없는 아이디어.<br>다음 장면을 함께 만들어보세요.</p><a class="contact-email" href="mailto:soezip0001@gmail.com">soezip0001@gmail.com</a><button class="contact-copy" id="copyEmail">COPY EMAIL</button><span class="copy-status" id="copyStatus" role="status"></span><div class="data-rows"><div class="data-row"><span>PHONE</span><a href="tel:+821064767804">+82 10 6476 7804</a></div><div class="data-row"><span>INSTAGRAM</span><a href="https://www.instagram.com/xx_soe.zip/" target="_blank" rel="noopener noreferrer">@xx_soe.zip</a></div><div class="data-row"><span>YOUTUBE</span><a href="https://www.youtube.com/@soezip" target="_blank" rel="noopener noreferrer">@soezip</a></div></div><a class="drawer-action" href="mailto:soezip0001@gmail.com">WRITE TO soE!</a>`}
$('#drawerContent').innerHTML=html;if(!drawer.open)drawer.showModal();drawer.scrollTop=0;cancelAnimationFrame(frame);drawer.querySelector('.close').focus();$('#drawerContent').querySelectorAll('[data-select]').forEach(b=>b.addEventListener('click',()=>{drawer.close();go(Number(b.dataset.select))}));$('[data-play]')?.addEventListener('click',openPlayer);$('#drawerContent').querySelectorAll('[data-panel]').forEach(b=>b.addEventListener('click',e=>panel(e.currentTarget.dataset.panel)));$('#copyEmail')?.addEventListener('click',async()=>{try{await navigator.clipboard.writeText('soezip0001@gmail.com');$('#copyStatus').textContent='복사했어요.'}catch{$('#copyStatus').textContent='주소를 선택해 복사해주세요.'}})}
document.querySelectorAll('[data-section]').forEach(b=>b.addEventListener('click',()=>selectSection(b.dataset.section)));document.querySelectorAll('[data-open]').forEach(b=>b.addEventListener('click',()=>panel(b.dataset.open)));$('#details').addEventListener('click',()=>panel('details'));$('#watch').addEventListener('click',openPlayer);$('#screenPlay').addEventListener('click',openPlayer);$('#prev').addEventListener('click',()=>step(-1));$('#next').addEventListener('click',()=>step(1));document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>$('#'+b.dataset.close).close()));
[drawer,player].forEach(d=>{d.addEventListener('click',e=>{if(e.target!==d)return;const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close()});d.addEventListener('close',()=>{if(d===player)$('#playerMount').replaceChildren();previousFocus?.focus();startRender()})});
let lastPointerX=.5,lastPointerY=.5,swiping=false,touchStart=null;
screen.addEventListener('pointermove',e=>{if(draggingReality){setSignal((e.clientX-screen.getBoundingClientRect().left)/screen.clientWidth);return}if(e.pointerType==='touch'||!fx)return;const r=screen.getBoundingClientRect();tx=(e.clientX-r.left)/r.width;ty=1-(e.clientY-r.top)/r.height;energy=Math.min(1,energy+Math.hypot(tx-lastPointerX,ty-lastPointerY)*18);lastPointerX=tx;lastPointerY=ty;$('#coordinate').textContent=`[ ${String(Math.round(tx*100)).padStart(3,'0')} : ${String(Math.round((1-ty)*100)).padStart(3,'0')} ]`;document.body.classList.add('screen-hover')});screen.addEventListener('pointerleave',()=>{document.body.classList.remove('screen-hover');energy*=.3});
screen.addEventListener('click',e=>{if(current===0||e.target.closest('button,a')||swiping)return;openPlayer()});
$('#exhibition').addEventListener('touchstart',e=>{if(current===0||e.touches.length!==1||e.target.closest('input,button,a'))return;touchStart={x:e.touches[0].clientX,y:e.touches[0].clientY};swiping=false},{passive:true});$('#exhibition').addEventListener('touchmove',e=>{if(!touchStart)return;if(Math.hypot(e.touches[0].clientX-touchStart.x,e.touches[0].clientY-touchStart.y)>20)swiping=true},{passive:true});$('#exhibition').addEventListener('touchend',e=>{if(!touchStart)return;const dx=e.changedTouches[0].clientX-touchStart.x,dy=e.changedTouches[0].clientY-touchStart.y;if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.3)step(dx<0?1:-1);touchStart=null;setTimeout(()=>swiping=false,250)},{passive:true});
let wheelSum=0,wheelGated=false,wheelTimer;window.addEventListener('wheel',e=>{if(current===0||drawer.open||player.open||e.ctrlKey||innerHeight<800||innerWidth<=760||document.documentElement.scrollHeight>innerHeight+4)return;e.preventDefault();clearTimeout(wheelTimer);wheelTimer=setTimeout(()=>{wheelGated=false;wheelSum=0},220);if(wheelGated||busy)return;wheelSum+=e.deltaY;if(Math.abs(wheelSum)>60){step(wheelSum>0?1:-1);wheelSum=0;wheelGated=true}},{passive:false});
window.addEventListener('keydown',e=>{if(e.target.matches('input')||drawer.open||player.open||e.altKey||e.ctrlKey||e.metaKey)return;if(e.key==='ArrowRight'||e.key==='ArrowDown'||e.key==='PageDown'){e.preventDefault();step(1)}else if(e.key==='ArrowLeft'||e.key==='ArrowUp'||e.key==='PageUp'){e.preventDefault();step(-1)}else if(e.key==='Home'){e.preventDefault();go(0)}else if(e.key==='End'){e.preventDefault();go(sectionIndices().at(-1))}});window.addEventListener('hashchange',()=>{const slug=location.hash.slice(1);if(['film','commercial'].includes(slug)){selectSection(slug);return}const i=P.findIndex(p=>p.slug===slug);if(i>=0)go(i)});document.querySelector('.logo').addEventListener('click',e=>{e.preventDefault();go(0)});
$('#motion').addEventListener('click',()=>{fx=!fx;updateFX()});reduced.addEventListener('change',e=>{fx=!e.matches;updateFX()});document.addEventListener('visibilitychange',()=>{if(document.hidden)cancelAnimationFrame(frame);else startRender()});window.addEventListener('resize',resize);initGL();updateFX();display(current);new ResizeObserver(resize).observe(screen);

setTimeout(()=>document.body.classList.remove("intro"),1300);

function setSignal(value){signalMix=Math.max(0,Math.min(1,value));document.documentElement.style.setProperty('--reality',signalMix*100+'%');$('#reality').value=Math.round(signalMix*100);$('#reality').setAttribute('aria-valuetext','글리치 '+Math.round(signalMix*100)+'퍼센트');$('#signalValue').textContent='SIGNAL '+String(Math.round(signalMix*100)).padStart(3,'0')+'%';energy=Math.max(energy,.15);}
$('#reality').addEventListener('input',e=>setSignal(Number(e.target.value)/100));
$('#originalMode').addEventListener('click',()=>setSignal(0));$('#signalMode').addEventListener('click',()=>setSignal(1));
screen.addEventListener('pointerdown',e=>{if(current!==0||e.target.closest('button')||e.button!==0)return;draggingReality=true;screen.setPointerCapture(e.pointerId);document.body.classList.add('dragging');setSignal((e.clientX-screen.getBoundingClientRect().left)/screen.clientWidth)});
function releaseReality(){draggingReality=false;document.body.classList.remove('dragging')}
screen.addEventListener('pointerup',releaseReality);screen.addEventListener('pointercancel',releaseReality);screen.addEventListener('lostpointercapture',releaseReality);
setSignal(.35);

$('#projectLaurels').addEventListener('click',e=>{if(e.target.closest('[data-award]')){e.stopPropagation();panel('details')}});

let pulseTimer;
function pulseSignal(){
 if(!fx)return;burst=current===0?.9:.45;energy=current===0?.8:.38;document.body.classList.remove('glitching');void screen.offsetWidth;document.body.classList.add('glitching');clearTimeout(pulseTimer);pulseTimer=setTimeout(()=>document.body.classList.remove('glitching'),550);startRender();
}
$('#signalPulse').addEventListener('click',pulseSignal);

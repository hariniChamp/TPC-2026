/* SPLIT — rendering, motion, event handling, and startup */
'use strict';
/* ---------- render ---------- */
const VIEWS={week:vWeek,diagnosis:vDiagnosis,applications:vApps,resume:vResume,skills:vSkills,interviews:vInterviews,history:vHistory};
const NAV=[['week','This week','Plan'],['diagnosis','Diagnosis','Diagnosis'],['applications','Applications','Apps'],['resume','Resume','Resume'],['skills','Skills','Skills'],['interviews','Interviews','Prep']];
function initials(){return S.profile.name.split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0].toUpperCase()).join('')||'?'}
function renderTop(){
 const el=document.getElementById('top');
 if(ui.flow){el.innerHTML=`<div class="top-in"><span class="wm">split</span>${ui.flow.step==='welcome'?'<div class="top-r"><button class="hbtn" data-a="example">See an example</button><button class="hbtn go" data-a="begin">Get started</button></div>':''}</div>`;return}
 el.innerHTML=`<div class="top-in"><button class="wm" data-a="go" data-v="week" aria-label="This week">split</button><div class="top-r"><button class="hbtn" data-a="checkin">Check in</button><button class="hav" data-a="settings" aria-label="Settings">${esc(initials())}</button></div></div>`;
}
function renderChrome(){
 renderTop();
 document.getElementById('rail').innerHTML=`<div class="nav"><span class="nav-ind" aria-hidden="true"></span>${NAV.map(([v,l])=>`<button class="nav-i ${ui.view===v?'on':''}" data-a="go" data-v="${v}" ${ui.view===v?'aria-current="page"':''}>${ico(v)}<span class="lbl">${l}</span></button>`).join('')}</div>
  <div class="rail-foot"><button class="me" data-a="settings"><span class="av">${esc(initials())}</span><span><b>${esc(S.profile.name)}</b><small>${esc(R().short)} · ${esc(S.profile.season)}</small></span></button></div>`;
 document.getElementById('tabbar').innerHTML=`<span class="tab-ind" aria-hidden="true"></span>`+NAV.map(([v,,sh])=>`<button class="tab ${ui.view===v?'on':''}" data-a="go" data-v="${v}">${ico(v)}<span>${sh}</span></button>`).join('');
}
function renderMain(){if(ui.flow)return render();document.getElementById('main').innerHTML=(VIEWS[ui.view]||vWeek)();renderChrome();postRender()}
function renderOverlay(){
 const el=document.getElementById('overlay'),o=ui.overlay;
 const M={app:ovApp,checkin:ovCheckin,settings:ovSettings,hours:ovHours,debrief:ovDebrief,story:ovStory,resume:ovResume};
 el.innerHTML=o&&M[o.type]?M[o.type]():'';
 document.body.style.overflow=o?'hidden':'';
 const key=o?o.type+(o.step||''):null,fresh=o&&(!ui.lastOv||ui.lastOv.split('|')[0]!==o.type);
 if(o&&!RM()){
  if(fresh){const d=el.querySelector('.drawer'),m=el.querySelector('.modal'),s=el.querySelector('.scrim');
   if(s)s.animate([{backgroundColor:'rgba(8,14,18,0)'},{backgroundColor:'rgba(8,14,18,.55)'}],{duration:260});
   if(d)d.animate([{transform:'translateX(60px)',opacity:0},{transform:'none',opacity:1}],{duration:380,easing:EASE});
   if(m)m.animate([{transform:'translateY(20px) scale(.96)',opacity:0},{transform:'none',opacity:1}],{duration:380,easing:EASE});}
  else if(ui.lastOv!==o.type+'|'+key){const b=el.querySelector('.ov-b');if(b)b.animate([{transform:'translateX(24px)',opacity:0},{transform:'none',opacity:1}],{duration:320,easing:EASE})}
 }
 ui.lastOv=o?o.type+'|'+key:null;
}
function render(){
 const fl=ui.flow;
 document.body.classList.toggle('flow',!!fl);document.body.classList.toggle('welcome',!!fl&&fl.step==='welcome');
 if(fl){const main=document.getElementById('main');main.innerHTML=flowHTML();renderTop();document.getElementById('rail').innerHTML='';document.getElementById('tabbar').innerHTML='';ui.overlay=null;renderOverlay();
  if(fl.step==='q'){if(ui.qEnter&&!RM()){let i=0;main.querySelectorAll('.q-body > *, .q-body .opts > *, .q-body .chips > *').forEach(e=>{e.style.setProperty('--i',i++);e.classList.add('in')})}
   const qb=main.querySelector('.qbar>div');if(qb){const w=parseFloat(qb.style.width);if(ui.qPrevW!=null&&ui.qPrevW!==w&&!RM())qb.animate([{width:ui.qPrevW+'%'},{width:w+'%'}],{duration:450,easing:EASE});ui.qPrevW=w}}
  if(fl.step==='welcome')initLanding();
  ui.qEnter=false;ui.justPicked=null;ui.bump=null;return}
 document.getElementById('main').innerHTML=(VIEWS[ui.view]||vWeek)();renderChrome();renderOverlay();postRender();
}
/* ---------- motion ---------- */
const RM=()=>!!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);
const EASE='cubic-bezier(.22,1,.36,1)';
function countUp(el){const to=+el.dataset.count,suf=el.dataset.suffix||'';if(RM()||!isFinite(to)){return}const t0=performance.now(),dur=1000;
 (function f(t){const k=Math.min(1,(t-t0)/dur),e=1-Math.pow(1-k,3);el.textContent=Math.round(to*e)+suf;if(k<1)requestAnimationFrame(f)})(t0)}
function countAll(root){root.querySelectorAll('[data-count]').forEach(countUp)}
function postRender(){
 const main=document.getElementById('main'),rm=RM();
 if(!rm){
  if(ui.enter){let i=0;main.querySelectorAll('.wrap > *, .task, .li, .sk2, .rc, .stage, .stack > .card').forEach(el=>{el.style.setProperty('--i',Math.min(i++,14));el.classList.add('in')});
   main.querySelectorAll('.pbar>div[data-w]:not([data-from])').forEach((el,k)=>{el.animate([{width:'0%'},{width:el.dataset.w+'%'}],{duration:900,delay:250+k*40,easing:EASE,fill:'backwards'})});
   countAll(main);}
  main.querySelectorAll('.pbar>div[data-from]').forEach(el=>{const f=+el.dataset.from,to=+el.dataset.w;if(Math.abs(f-to)>.1)el.animate([{width:f+'%'},{width:to+'%'}],{duration:650,easing:EASE})});
  const jo=main.querySelector('.just-open');
  if(jo){const p=jo.querySelector('.task-more,.rc-b,.sk2-more');if(p){const h=p.scrollHeight;p.animate([{height:'0px',opacity:0,overflow:'hidden'},{height:h+'px',opacity:1,overflow:'hidden'}],{duration:340,easing:EASE})}const c=jo.querySelector('.chev');if(c)c.animate([{transform:'rotate(0deg)'},{transform:'rotate(90deg)'}],{duration:260,easing:EASE})}
  const jc=main.querySelector('.just-closed .chev');if(jc)jc.animate([{transform:'rotate(90deg)'},{transform:'rotate(0deg)'}],{duration:260,easing:EASE});
 }
 placeIndicators(rm);
 ui.enter=false;ui.justOpen=null;ui.justClosed=null;ui.justDone=null;
}
function placeIndicators(rm){
 const nav=document.querySelector('.rail .nav'),ind=nav&&nav.querySelector('.nav-ind'),on=nav&&nav.querySelector('.nav-i.on');
 if(ind&&on&&on.offsetHeight){const y=on.offsetTop,h=on.offsetHeight;ind.style.height=h+'px';ind.style.transform=`translateY(${y}px)`;if(!rm&&ui.prevNavY!=null&&ui.prevNavY!==y)ind.animate([{transform:`translateY(${ui.prevNavY}px)`},{transform:`translateY(${y}px)`}],{duration:450,easing:EASE});ui.prevNavY=y}
 const tb=document.getElementById('tabbar'),ti=tb.querySelector('.tab-ind'),to=tb.querySelector('.tab.on');
 if(ti&&to&&to.offsetWidth){const x=to.offsetLeft+to.offsetWidth*.22,w=to.offsetWidth*.56;ti.style.width=w+'px';ti.style.transform=`translateX(${x}px)`;if(!rm&&ui.prevTabX!=null&&ui.prevTabX!==x)ti.animate([{transform:`translateX(${ui.prevTabX}px)`},{transform:`translateX(${x}px)`}],{duration:450,easing:EASE});ui.prevTabX=x}
}
let toastT;
function toast(msg,win){const el=document.getElementById('toast');el.textContent=msg;el.classList.toggle('win',!!win);el.classList.remove('show');void el.offsetWidth;el.classList.add('show');clearTimeout(toastT);toastT=setTimeout(()=>el.classList.remove('show'),2300)}
function confetti(){if(RM())return;const c=document.createElement('canvas');c.className='confetti';document.body.appendChild(c);const W=innerWidth,Hh=innerHeight,dpr=Math.min(2,devicePixelRatio||1);c.width=W*dpr;c.height=Hh*dpr;const x=c.getContext('2d');x.scale(dpr,dpr);
 const cols=['#58CC02','#1CB0F6','#FF9600','#FFC800','#CE82FF','#FF4B4B'];const P=Array.from({length:140},()=>({x:W/2+(Math.random()-.5)*80,y:Hh*.4,vx:(Math.random()-.5)*16,vy:-Math.random()*14-5,r:Math.random()*7+5,c:cols[Math.random()*cols.length|0],a:Math.random()*6,va:(Math.random()-.5)*.35}));const t0=performance.now();
 (function f(t){const k=(t-t0)/1800;x.clearRect(0,0,W,Hh);P.forEach(p=>{p.vy+=.38;p.x+=p.vx;p.y+=p.vy;p.vx*=.985;p.a+=p.va;x.save();x.globalAlpha=Math.max(0,1-k*k);x.translate(p.x,p.y);x.rotate(p.a);x.fillStyle=p.c;x.fillRect(-p.r/2,-p.r/4,p.r,p.r/2);x.restore()});if(k<1)requestAnimationFrame(f);else c.remove()})(t0)}
function swapQ(dir,change){const b=document.querySelector('.q-body');
 const go=()=>{change();ui.qEnter=true;render();window.scrollTo(0,0);const nb=document.querySelector('.q-body');if(nb&&!RM())nb.animate([{opacity:0,transform:`translateX(${dir*48}px)`},{opacity:1,transform:'none'}],{duration:340,easing:EASE});focusQ()};
 if(!b||RM())return go();
 b.animate([{opacity:1,transform:'none'},{opacity:0,transform:`translateX(${-dir*48}px)`}],{duration:170,easing:'cubic-bezier(.4,0,1,1)',fill:'forwards'}).onfinish=go}
let landObs=null,rafS=0;
function initLanding(){
 if(landObs)landObs.disconnect();
 if('IntersectionObserver' in window&&!RM()){landObs=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('seen');landObs.unobserve(e.target)}}),{rootMargin:'0px 0px -8% 0px'});document.querySelectorAll('.l-card,.l-cta').forEach(e=>landObs.observe(e))}
 onLandScroll();
}
function onLandScroll(){if(rafS)return;rafS=requestAnimationFrame(()=>{rafS=0;const how=document.getElementById('how');if(!how||!document.body.classList.contains('welcome'))return;
 const r=how.getBoundingClientRect(),tot=Math.max(1,how.offsetHeight-innerHeight),p=clamp(-r.top/tot,0,1),st=p<.34?0:p<.67?1:2;
 how.style.setProperty('--p',p.toFixed(3));how.style.setProperty('--fill',clamp(p/.26,0,1).toFixed(3));
 if(how.dataset.step!==String(st)){how.dataset.step=st;how.querySelectorAll('.l-step').forEach((e,i)=>e.classList.toggle('on',i===st))}})}
addEventListener('scroll',onLandScroll,{passive:true});addEventListener('resize',()=>{onLandScroll();placeIndicators(true)});
addEventListener('pointermove',e=>{
 const hero=e.target.closest&&e.target.closest('.l-hero');if(hero){const r=hero.getBoundingClientRect();hero.style.setProperty('--mx',((e.clientX-r.left)/r.width*100).toFixed(1)+'%');hero.style.setProperty('--my',((e.clientY-r.top)/r.height*100).toFixed(1)+'%')}
 if(RM())return;const t=e.pointerType==='mouse'&&e.target.closest?e.target.closest('[data-tilt]'):null;
 document.querySelectorAll('[data-tilt].tilting').forEach(el=>{if(el!==t){el.classList.remove('tilting');el.style.transform=''}});
 if(!t)return;const r=t.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5,m=+t.dataset.tilt||8;
 t.classList.add('tilting');t.style.transform=`perspective(1000px) rotateX(${(-y*m).toFixed(2)}deg) rotateY(${(x*m).toFixed(2)}deg)`;
},{passive:true});
document.addEventListener('pointerleave',()=>document.querySelectorAll('[data-tilt].tilting').forEach(el=>{el.classList.remove('tilting');el.style.transform=''}));
const PRAISE=['Nice.','Good work.','Done.','Keep going.','One more down.'];
function focusQ(){setTimeout(()=>{const el=document.querySelector('.q-body input');if(el)el.focus()},40)}

/* ---------- events ---------- */
const kwFrom=txt=>Object.keys(SYN).filter(k=>SYN[k].test(txt)&&Object.values(ROLES).some(r=>r.skills.some(s=>s.name===k)));
const fixCounts=d=>{d.sent=Math.max(0,Math.round(+d.sent||0));d.replies=clamp(Math.round(+d.replies||0),0,d.sent);d.interviews=clamp(Math.round(+d.interviews||0),0,d.replies);d.offers=clamp(Math.round(+d.offers||0),0,d.interviews)};
const H={
 go(t){if(!S)return;ui.view=t.dataset.v;ui.prep=null;ui.overlay=null;ui.enter=true;render();window.scrollTo(0,0);try{history.replaceState(null,'','#'+ui.view)}catch(e){}},
 done(t){const P=S.current.plan,id=t.dataset.id,was=!!P.done[id];P.done[id]=!was;save();
  if(!was){ui.justDone=id;const acts=planActions(P),n=acts.filter(a=>P.done[a.id]).length;if(n===acts.length){toast('Week complete. Time to check in.',true);confetti()}else toast(`${PRAISE[n%PRAISE.length]} ${n} of ${acts.length} done.`)}
  renderMain()},
 why(t){const k=t.dataset.id,o=!ui.why[k];ui.why[k]=o;ui[o?'justOpen':'justClosed']=k;renderMain()},
 hours(){ui.overlay={type:'hours'};renderOverlay()},
 split(t){const P=S.current.plan,k=t.dataset.k;P.split[k]=Math.max(0,Math.min(40,P.split[k]+ +t.dataset.d));save();renderMain();renderOverlay()},
 rebuild(){const P=S.current.plan;S.current.plan=buildPlan(diagnose(),P.done);save();renderMain();renderOverlay()},
 filter(t){ui.filter=t.dataset.v;ui.enter=true;renderMain()},
 cause(t){const k=t.dataset.id,o=t.dataset.open!=='true';ui.cause[k]=o;ui[o?'justOpen':'justClosed']=k;renderMain()},
 allCauses(){ui.allCauses=true;renderMain()},
 openApp(t){ui.overlay={type:'app',id:t.dataset.id};ui.confirm=null;ui.err='';renderOverlay()},
 addApp(){ui.newApp={id:'new',co:'',title:'',url:'',applied:TODAY,posted:'',tailored:false,referral:false,reached:0,closed:false,notes:'',kw:[],jd:'',interviewDate:''};ui.overlay={type:'app',id:'new'};ui.err='';renderOverlay();setTimeout(()=>{const f=document.getElementById('f-co');f&&f.focus()},30)},
 close(t,e){if(t.classList.contains('scrim')&&e.target!==t)return;ui.overlay=null;ui.confirm=null;ui.err='';renderOverlay();renderMain()},
 stage(t){const a=t.dataset.id==='new'?ui.newApp:appById(t.dataset.id);a.reached=+t.dataset.v;if(a.reached>=3)a.closed=false;if(a.reached===2&&!a.interviewDate)a.interviewDate=addD(TODAY,7);if(t.dataset.id!=='new'){save();renderMain()}renderOverlay()},
 kw(t){const a=t.dataset.id==='new'?ui.newApp:appById(t.dataset.id);a.kw=kwFrom(a.jd||'');if(t.dataset.id!=='new'){save();renderMain()}renderOverlay()},
 saveNew(){const a=ui.newApp;if(!a.co.trim()){ui.err='Add a company name to save this application.';renderOverlay();return}
  a.id=uid();a.week=mondayOf(a.applied||TODAY);if(!a.url)a.url=searchUrl(a.co,a.title||'');S.apps.push(a);ui.newApp=null;ui.overlay=null;save();render()},
 askDel(t){ui.confirm=t.dataset.id;renderOverlay()},
 askReset(){ui.confirm='reset';renderOverlay()},
 cancelDel(){ui.confirm=null;renderOverlay()},
 delApp(t){S.apps=S.apps.filter(a=>a.id!==t.dataset.id);S.debriefs=S.debriefs.filter(d=>d.appId!==t.dataset.id);ui.overlay=null;ui.confirm=null;save();render()},
 skillOpen(t){const k=t.dataset.n,o=!ui.skill[k];ui.skill[k]=o;ui[o?'justOpen':'justClosed']=k;renderMain()},
 allSkills(){ui.allSkills=true;renderMain()},
 skillSt(t){const n=t.dataset.n,v=t.dataset.v;S.skillLog[n]=Object.assign({hours:0,goal:8},S.skillLog[n]||{},{status:v});S.profile.skills=S.profile.skills.filter(s=>lc(s)!==lc(n));if(v==='have')S.profile.skills.push(n);save();renderMain()},
 skillH(t){const n=t.dataset.n;const l=S.skillLog[n]||(S.skillLog[n]={status:'learning',hours:0,goal:8});l.hours=(l.hours||0)+1;save();renderMain()},
 itab(t){ui.itab=t.dataset.v;ui.enter=true;renderMain()},
 storyOpen(t){const k=t.dataset.id,o=!ui.story[k];ui.story[k]=o;ui[o?'justOpen':'justClosed']=k;renderMain()},
 wkOpen(t){const k=t.dataset.id,o=!ui.wk[k];ui.wk[k]=o;ui[o?'justOpen':'justClosed']=k;renderMain()},
 newDebrief(){ui.overlay={type:'debrief'};renderOverlay()},
 newStory(){ui.overlay={type:'story'};renderOverlay()},
 rate(t){t.parentElement.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b===t))},
 // The plan is rebuilt here if it is missing. Before, a state saved without one
 // made this throw and the button looked dead.
 checkin(){if(!S)return;if(!S.current)S.current={id:mondayOf(TODAY),plan:null};
  if(!S.current.plan)S.current.plan=buildPlan(diagnose());
  const P=S.current.plan;
  ui.overlay={type:'checkin',weekId:S.current.id,step:1,done:Object.assign({},P.done||{}),logged:{apply:0,build:0,prep:0},upd:{}};renderOverlay()},
 ckDone(t){const o=ui.overlay;o.done[t.dataset.id]=!o.done[t.dataset.id];renderOverlay()},
 ckNext(){const o=ui.overlay;o.step=Math.min(3,(o.step||1)+1);o.err='';renderOverlay()},
 ckBack(){const o=ui.overlay;o.step=Math.max(1,(o.step||1)-1);o.err='';renderOverlay()},
 ckHrs(t){const o=ui.overlay,k=t.dataset.k;o.logged[k]=Math.max(0,Math.round((o.logged[k]+ +t.dataset.d)*2)/2);renderOverlay()},
 ckUpd(t){const o=ui.overlay;o.upd[t.dataset.id]=t.dataset.v;if(t.dataset.v==='keep')delete o.upd[t.dataset.id];renderOverlay()},
 // A throw in commitCheckin used to leave the button looking dead. Surface it
 // instead, and never lose the week the user just logged.
 ckFinish(){const o=ui.overlay;
  try{o.result=commitCheckin(o);o.step=4;o.err=''}
  catch(err){o.err='Something went wrong saving this check-in. Your answers are still here — try Finish again.';console.error('check-in failed',err)}
  renderOverlay();renderMain()},
 ckClose(){ui.overlay=null;ui.view='week';ui.enter=true;ui.lastProg=null;render();window.scrollTo(0,0)},
 settings(){ui.overlay={type:'settings'};ui.confirm=null;renderOverlay()},
 startOver(){try{localStorage.removeItem(LS)}catch(e){}S=null;ui.confirm=null;ui.overlay=null;ui.flow={step:'welcome'};render();window.scrollTo(0,0)},
 example(){seed();ui.overlay=null;ui.view='week';Object.assign(ui,{why:{},cause:{},skill:{},story:{},wk:{},allCauses:false,allSkills:false,itab:null});startLoading()},
 begin(){ui.overlay=null;ui.qEnter=true;ui.qPrevW=null;ui.flow={step:'q',i:0,draft:{name:'',school:'',year:'',major:'',gpa:'',role:'da',season:defSeason(),skills:[],resume:'',resumeName:'',hours:5,sent:0,replies:0,interviews:0,offers:0,confidence:0,timing:'',tailor:'',referral:''}};render();window.scrollTo(0,0);focusQ()},
 qExit(){ui.flow={step:'welcome'};render();window.scrollTo(0,0)},
 qPick(t){const d=ui.flow.draft,f=t.dataset.f;d[f]=(f==='hours'||f==='confidence')?+t.dataset.v:t.dataset.v;ui.justPicked=f+':'+t.dataset.v;if(f==='role')d.skills=d.skills.filter(s=>ROLES[d.role].skills.some(x=>x.name===s));render()},
 qSkill(t){const d=ui.flow.draft,v=t.dataset.v;ui.justPicked='skill:'+v;d.skills=d.skills.includes(v)?d.skills.filter(s=>s!==v):d.skills.concat(v);render()},
 qCount(t){const d=ui.flow.draft,f=t.dataset.f;d[f]=(+d[f]||0)+ +t.dataset.d;fixCounts(d);ui.bump=f;render()},
 qBack(){const f=ui.flow,vis=visibleQ(f.draft),p=vis.indexOf(f.i);if(p>0)swapQ(-1,()=>{f.i=vis[p-1]})},
 qNext(){const f=ui.flow,d=f.draft;fixCounts(d);if(!Q[f.i].valid(d))return;const vis=visibleQ(d),p=vis.indexOf(f.i);
  if(Q[f.i].id==='resume'&&d.resume&&!d.prefilled){detectSkills(d.resume,d.role).forEach(n=>{if(!d.skills.includes(n))d.skills.push(n)});d.prefilled=true}
  if(p<vis.length-1){swapQ(1,()=>{f.i=vis[p+1]});return}
  const b=d.sent?{sent:d.sent,replies:d.replies,interviews:d.interviews,offers:d.offers,timing:d.timing,tailor:d.tailor,referral:d.referral}:null;
  freshState({name:d.name.trim(),school:d.school.trim(),year:d.year.trim(),major:d.major.trim(),gpa:(d.gpa||'').trim(),role:d.role,season:d.season||defSeason(),hours:d.hours,skills:d.skills.slice()},b,d.resume?{text:d.resume,name:d.resumeName||'Resume'}:null,d.confidence);
  Object.assign(ui,{view:'week',why:{},cause:{},skill:{},story:{},wk:{},allCauses:false,allSkills:false,itab:null});startLoading()},
 revealGo(){ui.flow=null;ui.view='week';ui.enter=true;ui.lastProg=null;render();window.scrollTo(0,0);try{history.replaceState(null,'','#week')}catch(e){}}
};
ui.story={};ui.wk={};
document.addEventListener('click',e=>{
 if(e.target.closest('a[href]')&&!e.target.closest('a[data-a]'))return;
 const t=e.target.closest('[data-a]');if(!t)return;
 if(t.tagName==='A')e.preventDefault();
 if(t.disabled)return;
 const fn=H[t.dataset.a];if(fn)fn(t,e);
});
document.addEventListener('keydown',e=>{
 if(e.key==='Escape'&&ui.overlay&&ui.overlay.type!=='checkin'){ui.overlay=null;ui.confirm=null;renderOverlay();renderMain()}
 if(e.key==='Enter'&&ui.flow&&ui.flow.step==='q'&&e.target.matches('.q-body input')){e.preventDefault();H.qNext()}
});
document.addEventListener('input',e=>{
 const t=e.target;
 if(t.dataset.af){const isNew=t.dataset.id==='new',a=isNew?ui.newApp:appById(t.dataset.id);if(!a)return;const f=t.dataset.af;a[f]=t.type==='checkbox'?t.checked:t.value;
  if(f==='applied'&&!isNew)a.week=mondayOf(a.applied||TODAY);
  if(!isNew){save();renderMain()}
  if(t.type==='checkbox'||t.type==='date')renderOverlay();
 }
 if(t.dataset.pf){const p=S.profile,f=t.dataset.pf;p[f]=f==='hours'?Math.max(1,Math.min(40,+t.value||p.hours)):t.value;
  if(f==='role'||f==='hours')S.current.plan=buildPlan(diagnose(),S.current.plan.done);save();renderMain()}
 if(ui.flow&&ui.flow.draft&&(t.dataset.of||t.dataset.ofn)){const d=ui.flow.draft;if(t.dataset.of)d[t.dataset.of]=t.value;else d[t.dataset.ofn]=t.value===''?0:+t.value;
  const nb=document.querySelector('[data-a=qNext]');if(nb)nb.disabled=!Q[ui.flow.i].valid(d)}
});
document.addEventListener('change',e=>{if(e.target.dataset&&e.target.dataset.ofn&&ui.flow){fixCounts(ui.flow.draft);setTimeout(()=>{if(ui.flow&&ui.flow.step==='q')render()},0)}});
document.addEventListener('submit',e=>{
 const f=e.target.closest('form[data-form]');if(!f)return;e.preventDefault();
 const fd=new FormData(f);
 if(f.dataset.form==='debrief'){const appId=fd.get('app');if(!appId)return;const r=f.querySelector('#db-rating .on');
  S.debriefs.push({id:uid(),appId,date:fd.get('date')||TODAY,type:fd.get('type'),questions:String(fd.get('q')||'').split('\n').map(s=>s.trim()).filter(Boolean),rating:r?+r.dataset.v:3,struggled:String(fd.get('s')||'').trim()});ui.itab2='mine'}
 if(f.dataset.form==='story'){const title=String(fd.get('title')||'').trim();if(!title)return;S.stories.push({id:uid(),title,tags:fd.getAll('tag'),s:fd.get('s')||'',t:fd.get('t')||'',a:fd.get('a')||'',r:fd.get('r')||''});ui.itab='st'}
 ui.overlay=null;save();render();
});


/* ---------- handlers ---------- */
function findEdit(id){const fb=S.answers[ui.prep]&&S.answers[ui.prep].fb;return fb?fb.edits.find(e=>e.id===id):null}
function acceptAns(id){const a=S.answers[ui.prep],fb=a.fb,e=fb.edits.find(x=>x.id===id);if(!e)return;
 const r=applyEdit(a.fields[e.part]||'',e);fb.edits=fb.edits.filter(x=>x!==e);if(!r.ok)return;a.fields[e.part]=r.text;
 fb.edits=fb.edits.filter(x=>{if(x.part!==e.part)return true;if(x.at>r.at)x.at+=r.delta;const p=locate(r.text,x);if(p<0)return false;x.at=p;x.find=r.text.substr(p,x.find.length);return true})}
async function runCheck(){const q=qFind(ui.prep);if(!q)return;const a=ensureAns(q.id,q),f=Object.assign({},a.fields);ui.checking=q.id;renderMain();
 let fb;if(canAI()){try{fb=fromAI(await aiJSON(starPrompt(q,f,fieldsOf(q))),q,f)}catch(e){fb=checkRules(q,f);if(!(e&&e.code==='cancelled'))fb.note=aiNote(e)}}else fb=checkRules(q,f);
 a.fb=fb;ui.checking=null;ui.ptab='fb';save();if(ui.prep===q.id){renderMain();window.scrollTo({top:0,behavior:RM()?'auto':'smooth'})}}
async function runTech(){const q=qFind(ui.prep);if(!q)return;const a=ensureAns(q.id,q),txt=a.tech||'';ui.checking=q.id;renderMain();
 const rules=()=>{const covered=q.points.map((p,i)=>p[1].test(txt)?i:-1).filter(i=>i>=0),r=covered.length/q.points.length;return{src:'rules',covered,verdict:r>=0.99?'strong':r>=0.5?'getting_there':'needs_work',summary:r>=0.99?'You hit every key point.':`Missing: ${q.points.filter((p,i)=>!covered.includes(i)).map(p=>lc(p[0])).join('; ')}.`,improved:null}};
 let fb;if(canAI()){try{const raw=await aiJSON(`A college student preparing for ${R().name} interviews answered this technical question.\n\nQuestion: ${q.q}\nTheir answer:\n${txt}\n\nKey points a strong answer covers, by index:\n${q.points.map((p,i)=>`${i}: ${p[0]}`).join('\n')}\n\nReply with only JSON: {"covered":[indexes of key points their answer gets right],"verdict":"needs_work|getting_there|strong","summary":"one plain sentence on what to fix","improved":"their answer rewritten to be correct and strong, same format, under 120 words"}. Judge correctness, not keywords.`);
  fb={src:'claude',covered:(Array.isArray(raw.covered)?raw.covered:[]).map(Number).filter(i=>i>=0&&i<q.points.length),verdict:['needs_work','getting_there','strong'].includes(raw.verdict)?raw.verdict:'getting_there',summary:String(raw.summary||''),improved:typeof raw.improved==='string'?raw.improved:null}}catch(e){fb=rules();if(!(e&&e.code==='cancelled'))fb.note=aiNote(e)}}else fb=rules();
 a.fb=fb;ui.checking=null;save();if(ui.prep===q.id)renderMain()}
async function runResumeAI(){const A=resumeAnalysis();if(!A)return;ui.checking='resume';renderMain();
 try{const raw=await aiJSON(`Review this college student's resume bullets for ${R().name} internships.\n\nBullets:\n${A.bullets.map(b=>'- '+b.body).join('\n')}\n\nReply with only JSON: {"summary":"two plain sentences on the biggest improvements","bullets":[{"original":"bullet copied exactly","edits":[{"find":"exact words from that bullet","replace":"better words or empty","kind":"verb|vague|filler|own|concise","why":"under 12 words"}]}]}. Include only bullets that need changes, at most 12. Start bullets with strong past-tense verbs. Never invent numbers; use [brackets] like [number] where one is needed.`);
  const map={};(Array.isArray(raw.bullets)?raw.bullets:[]).forEach(b=>{const body=String(b&&b.original||'').replace(BUL_RE,'').trim();const hit=A.bullets.find(x=>x.body===body);if(!hit)return;const used={};
   map[hit.body]=(Array.isArray(b.edits)?b.edits:[]).filter(e=>e&&typeof e.find==='string'&&e.find).map(e=>{const at=hit.body.indexOf(e.find,used[e.find]||0);used[e.find]=at+1;return{part:'b',at,find:e.find,rep:typeof e.replace==='string'?e.replace:'',kind:KIND[e.kind]?e.kind:'verb',why:String(e.why||'')}}).filter(e=>e.at>=0)});
  S.resume.over=map;S.resume.ai={summary:String(raw.summary||'')};toast('Claude’s review is in.')}catch(e){if(!(e&&e.code==='cancelled'))toast(aiNote(e).replace(', so this is the quick check',''))}
 ui.checking=null;save();renderMain()}
function rbEdit(id){const[bi]=id.slice(1).split(':');const A=resumeAnalysis(),b=A.bullets[+bi];if(!b)return{};const eid=id.split(':')[1];return{A,b,e:b.edits.find(x=>x.id===eid)}}
Object.assign(H,{
 openQ(t){ui.prep=t.dataset.id;ui.ptab=null;ui.mkOn=null;const q=qFind(ui.prep),a=S.answers&&S.answers[ui.prep];ui.ptab=a&&a.fb&&!a.fb.stale&&q.kind!=='tech'?'fb':'write';ui.enter=true;renderMain();window.scrollTo(0,0)},
 prepBack(){ui.prep=null;ui.enter=true;renderMain();window.scrollTo(0,0)},
 itab2(t){ui.itab2=t.dataset.v;ui.enter=true;renderMain()},
 pickCo(t){ui.icomp=t.dataset.v;ui.itab2='tech';ui.enter=true;renderMain()},
 ptab(t){if(t.disabled)return;ui.ptab=t.dataset.v;ui.enter=true;renderMain()},
 starter(t){const ta=document.getElementById('qf-'+t.dataset.k);if(!ta)return;const v=ta.value;ta.value=v+(v&&!/\s$/.test(v)?' ':'')+t.dataset.v+' ';ta.dispatchEvent(new Event('input',{bubbles:true}));ta.focus();ta.setSelectionRange(ta.value.length,ta.value.length)},
 checkAns(){runCheck()},checkTech(){runTech()},
 mk(t){const id=t.dataset.id;ui.mkOn=ui.mkOn===id?null:id;document.querySelectorAll('.mk.on,.sug.on').forEach(e=>e.classList.remove('on'));if(ui.mkOn){t.classList.add('on');const c=document.getElementById('sug-'+id);if(c){c.classList.add('on');c.scrollIntoView({block:'nearest',behavior:RM()?'auto':'smooth'})}}},
 mkAlt(t){const id=t.dataset.id;if(id.startsWith('r')){const{b,e}=rbEdit(id);if(e){S.resume.over=S.resume.over||{};S.resume.over[b.body]=b.edits.map(x=>({part:'b',at:x.at,find:x.find,rep:x===e?t.dataset.v:x.rep,kind:x.kind,why:x.why,alt:x.alt}));save();renderMain()}return}
  const e=findEdit(id);if(e){e.rep=t.dataset.v;save();renderMain()}},
 mkAccept(t){acceptAns(t.dataset.id);ui.mkOn=null;const a=S.answers[ui.prep];a.fb.snap=JSON.stringify(a.fields);save();renderMain();toast('Fixed.')},
 mkDismiss(t){const a=S.answers[ui.prep];a.fb.edits=a.fb.edits.filter(e=>e.id!==t.dataset.id);save();renderMain()},
 mkAll(){const a=S.answers[ui.prep];const n=a.fb.edits.length;a.fb.edits.slice().forEach(e=>acceptAns(e.id));a.fb.edits=[];save();renderMain();toast(`${n} ${pl(n,'fix','fixes')} applied.`)},
 rbOpen(t){const k=+t.dataset.i,o=!ui.rb[k];ui.rb[k]=o;ui[o?'justOpen':'justClosed']='rb'+k;renderMain()},
 rbAccept(t){const{b,e}=rbEdit(t.dataset.id);if(!b||!e)return;const r=applyEdit(b.body,e);if(!r.ok)return;
  const ov=S.resume.over=S.resume.over||{};if(ov[b.body]){const rest=ov[b.body].filter(x=>!(x.at===e.at&&x.find===e.find)).map(x=>Object.assign({},x,{at:x.at>e.at?x.at+r.delta:x.at}));delete ov[b.body];ov[r.text]=rest}
  S.resume.text=S.resume.text.replace(b.raw,b.prefix+r.text);save();renderMain();toast('Bullet updated.')},
 rbDismiss(t){const{b,e}=rbEdit(t.dataset.id);if(!b||!e)return;S.resume.dismissed=(S.resume.dismissed||[]).concat(b.body+'|'+e.find);save();renderMain()},
 rbCopy(t){const A=resumeAnalysis(),b=A.bullets[+t.dataset.i];if(!b)return;const txt=b.fixed;try{navigator.clipboard.writeText(txt).then(()=>toast('Copied.'),()=>toast('Select the text to copy it.'))}catch(e){toast('Select the text to copy it.')}},
 rsAI(){runResumeAI()},
 rsReplace(){ui.rd={};ui.rmsg={};ui.overlay={type:'resume'};renderOverlay()},
 rsSave(){const h=ui.rd;if(!h||!h.resume)return;S.resume={text:h.resume,name:h.resumeName||'Pasted text',added:TODAY,dismissed:[],ai:null,over:{}};ui.rd={};ui.overlay=null;save();render();toast('Resume saved. Skills updated.')},
 rsRemove(){S.resume=null;ui.overlay=null;save();render()},
 toSkill(t){ui.view='skills';ui.skill={};ui.skill[t.dataset.n]=true;ui.allSkills=true;ui.enter=true;render();window.scrollTo(0,0)},
 skillSt(t){const n=t.dataset.n,v=t.dataset.v;S.profile.skills=S.profile.skills.filter(s=>lc(s)!==lc(n));S.skillLog[n]=Object.assign({hours:0,goal:8},S.skillLog[n]||{});
  if(v==='know'){S.profile.skills.push(n);delete S.skillLog[n].status}else S.skillLog[n].status=v;save();renderMain()}
});
document.addEventListener('input',e=>{const t=e.target;
 if(t.dataset.qf&&ui.prep){const q=qFind(ui.prep),a=ensureAns(q.id,q),k=t.dataset.qf;a.fields[k]=t.value;if(a.fb&&a.fb.snap!==JSON.stringify(a.fields))a.fb.stale=true;save();
  const d=fieldsOf(q).find(x=>x.k===k),n=wc(t.value),c=document.getElementById('qc-'+k),h=document.getElementById('qh-'+k);if(c){c.textContent=`${n} / ${d.target[0]}–${d.target[1]} words`;c.className='wcount '+wcClass(d,n)}if(h)h.innerHTML=liveHints(d,t.value);
  const cb=document.querySelector('[data-a=checkAns]');if(cb&&!ui.checking)cb.disabled=!fieldsOf(q).some(x=>a.fields[x.k])}
 if(t.dataset.tq&&ui.prep){const q=qFind(ui.prep),a=ensureAns(q.id,q);a.tech=t.value;if(a.fb)a.fb.stale=true;save();const c=document.getElementById('tq-c');if(c)c.textContent=wc(t.value)+' words';const cb=document.querySelector('[data-a=checkTech]');if(cb&&!ui.checking)cb.disabled=!wc(t.value)}
 if(t.dataset.rpaste){const ctx=t.dataset.rpaste,h=rHolder(ctx);if(!h)return;h.resume=t.value.trim()?t.value:'';h.resumeName=h.resume?'Pasted text':'';h.prefilled=false;
  const m=document.getElementById('rmsg-'+ctx);if(m){const n=detectSkills(t.value,h.role).length;m.hidden=!h.resume;m.className='rmsg ok';m.textContent=h.resume?`${wc(t.value)} words, ${n} ${pl(n,'skill')} found.`:''}
  const sb=document.getElementById('rs-save');if(sb)sb.disabled=!h.resume;const nb=document.querySelector('[data-a=qNext]');if(nb&&ui.flow)nb.textContent=h.resume?'Continue':'Skip for now'}
});
document.addEventListener('change',e=>{const t=e.target;
 if(t.dataset&&t.dataset.rfile&&t.files&&t.files[0])handleResumeFile(t.files[0],t.dataset.rfile);
 if(t.id==='ip-co'){ui.icomp=t.value;ui.enter=true;renderMain()}});
['dragenter','dragover'].forEach(ev=>document.addEventListener(ev,e=>{const d=e.target.closest&&e.target.closest('.drop');if(d){e.preventDefault();d.classList.add('over')}}));
document.addEventListener('dragleave',e=>{const d=e.target.closest&&e.target.closest('.drop');if(d)d.classList.remove('over')});
document.addEventListener('drop',e=>{const d=e.target.closest&&e.target.closest('.drop');if(!d)return;e.preventDefault();d.classList.remove('over');const f=e.dataTransfer&&e.dataTransfer.files&&e.dataTransfer.files[0];if(f)handleResumeFile(f,d.dataset.drop)});
document.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches&&e.target.matches('[role=button][data-a]')){e.preventDefault();e.target.click()}});
ui.rb={};


/* ---------- boot ---------- */
load();
if(!S)ui.flow={step:'welcome'};
else{const hv=(location.hash||'').slice(1);if(VIEWS[hv])ui.view=hv}
ui.enter=true;
const pre=document.getElementById('pre');
if(pre){if(RM()){pre.remove();render()}else{setTimeout(()=>{render();pre.classList.add('out')},950);setTimeout(()=>pre.remove(),1700)}}else render();

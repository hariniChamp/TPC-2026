/* SPLIT — shared UI pieces, pages, onboarding, and panels */
'use strict';
/* ---------- small components ---------- */
const ICON={
 week:'<rect x="4" y="5" width="16" height="15" rx="3"/><path d="M4 10h16M9 3v4M15 3v4"/>',
 diagnosis:'<path d="M3 12h4l3-6 4 12 3-6h4"/>',
 applications:'<path d="M21 3 3 10.5l7.5 3L14 21z"/><path d="M21 3 10.5 13.5"/>',
 skills:'<path d="M6 20v-6M12 20V9M18 20V4"/>',
 interviews:'<path d="M4 5h16v11H10l-5 4v-4H4z"/>',
 history:'<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>'
};
const TILE={week:'blue',diagnosis:'red',applications:'blue',skills:'green',interviews:'orange',history:'purple',apply:'blue',build:'green',prep:'orange'};
const CAT_ICON={apply:'applications',build:'skills',prep:'interviews'};
function ico(name,size){const k=CAT_ICON[name]||name;return `<span class="tile ${size||''}" style="--tc:var(--${TILE[name]})" aria-hidden="true"><svg viewBox="0 0 24 24">${ICON[k]}</svg></span>`}

function statusOf(a){
 if(a.reached>=3)return['Offer','good'];
 if(a.closed)return[a.reached===0?'Rejected':a.reached===1?'Rejected after screen':'Rejected after interview','bad'];
 if(a.reached===2)return[a.interviewDate?`Interview ${fmt(a.interviewDate)}`:'Interviewing','accent'];
 if(a.reached===1)return['Responded','good'];
 return[diffD(TODAY,a.applied)>=21?'No reply · 3+ wks':'Waiting','muted'];
}
const pill=(t,c)=>`<span class="pill ${c}">${esc(t)}</span>`;
function ageChip(a){const g=ageAt(a);if(g==null)return '<span class="no">—</span>';const c=g<=7?'good':g<=14?'warn':'bad';return `<span class="age ${c}">${g}d</span>`}
const learnedPill=c=>c.learned==='worked'?pill('Working · keep doing it','good'):c.learned==='no_effect'?pill('Tried · no change yet','warn'):'';
function catHead(cat,h){return `<div class="act-group"><span class="cat">${ico(cat,'sm')}${CATS[cat]}</span><span class="act-h">${hrs(h)}</span></div>`}
function splitBar(sp){const t=sp.apply+sp.build+sp.prep||1;return `<div class="split-bar" role="img" aria-label="Applying ${sp.apply} hours, building skills ${sp.build} hours, interview prep ${sp.prep} hours">${['apply','build','prep'].map(k=>sp[k]?`<div style="flex-grow:${sp[k]/t};background:var(--c-${k})"></div>`:'').join('')}</div>`}
function weekNum(){return S.weeks.length+1}

/* ---------- views ---------- */
const GOAL={resp:'Get more replies',intv:'Turn replies into interviews',offer:'Turn interviews into offers',start:'Build your pipeline',ok:'Keep it steady'};
const STAGE_TXT={resp:'Applications that get a reply',intv:'Replies that become interviews',offer:'Interviews that become offers'};
const chev=open=>`<svg class="chev${open?' open':''}" viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>`;
const bar=(w,cls,from)=>{w=clamp(+w||0,0,100);return `<div class="pbar ${cls||''}"><div data-w="${w.toFixed(1)}"${from!=null?` data-from="${(+from).toFixed(1)}"`:''} style="width:${w}%"></div></div>`};
const words=(t,d)=>esc(t).split(' ').map((w,i)=>`<span class="w" style="--i:${i}${d?`;--d:${d}ms`:''}">${w}</span>`).join(' ');
const oc=k=>(ui.justOpen===k?' just-open':'')+(ui.justClosed===k?' just-closed':'');
const defSeason=()=>{const d=parse(TODAY);return `Summer ${d.getMonth()>=5?d.getFullYear()+1:d.getFullYear()}`};

function vWeek(){
 const dx=diagnose(),P=S.current.plan,acts=planActions(P).map(a=>renderAct(a,dx));
 const total=P.split.apply+P.split.build+P.split.prep;
 const doneA=acts.filter(a=>P.done[a.id]),doneH=doneA.reduce((s,a)=>s+a.h,0);
 const L=dx.lead,up=dx.upcoming[0];
 const dueDay=addD(S.current.id,6),dd=diffD(dueDay,TODAY);
 const progNow=acts.length?doneA.length/acts.length*100:0;setTimeout(()=>{ui.lastProg=progNow},0);
 const groups=['apply','build','prep'].map(cat=>{const g=acts.filter(a=>a.cat===cat);if(!g.length)return '';
  return `<div class="grp"><div class="grp-h">${ico(cat,'sm')}<span>${CATS[cat]}</span><span class="act-h">${hrs(P.split[cat])}</span></div><div class="tasks">${g.map(a=>{const on=!!P.done[a.id],open=!!ui.why[a.id];
   return `<div class="task${on?' done':''}${ui.justDone===a.id?' just-done':''}${oc(a.id)}"><button class="chk${on?' on':''}" data-a="done" data-id="${esc(a.id)}" role="checkbox" aria-checked="${on}" aria-label="Mark done: ${esc(a.title)}"></button>
   <div class="task-c"><button class="task-b" data-a="why" data-id="${esc(a.id)}" aria-expanded="${open}"><span class="task-t"><span class="tt">${esc(a.title)}</span></span><span class="act-h">${hrs(a.h)}</span>${chev(open)}</button>
   ${open?`<div class="task-more">${a.detail?`<p>${esc(a.detail)}${a.url?` <a class="link" href="${esc(a.url)}" target="_blank" rel="noopener">Open resource ↗</a>`:''}</p>`:''}<dl class="why"><dt>Why</dt><dd>${esc(a.why)}</dd><dt>Working if</dt><dd>${esc(a.metric)}</dd></dl></div>`:''}</div></div>`}).join('')}</div></div>`}).join('');
 return `<div class="wrap narrow">
 ${up?`<button class="notice" data-a="go" data-v="interviews">${ico('interviews','sm')}<span class="notice-t"><b>${esc(up.co)} interview</b> · ${fmtDay(up.interviewDate)}</span><span class="link small">Prep →</span></button>`:''}
 <section class="focus"><div class="eyebrow">Week ${weekNum()} · ${fmtRange(S.current.id)}</div>
  <h1 class="h-display${ui.enter?' anim-words':''}">${words(GOAL[dx.bottleneck])}</h1>
  ${L&&L.short&&dx.bottleneck!=='ok'?`<p class="h-sub">Main reason: <span class="hl${ui.enter?' anim-mark':''}">${esc(L.short)}</span>.</p>`:''}
  <a class="link small" href="#diagnosis" data-a="go" data-v="diagnosis">Why we think so →</a></section>
 <div class="prog"><div class="prog-top"><b>${doneA.length} of ${acts.length} done</b><span class="muted small">${hrs(doneH)} of ${hrs(total)}</span></div>${bar(progNow,'good big',ui.enter||ui.lastProg==null?null:ui.lastProg)}</div>
 ${acts.length?groups:`<div class="empty"><h3>No time planned</h3><button class="btn" data-a="hours">Adjust hours</button></div>`}
 <div class="checkin-cta"><div><b>Done for the week?</b><span class="muted small">${dd<0?`Check-in overdue since ${fmt(dueDay)}`:dd===0?'Check-in is due today':`Check-in due ${fmtDay(dueDay)}`}</span></div><button class="btn primary" data-a="checkin">Check in</button></div>
 <div class="quiet"><button class="link small" data-a="hours">Adjust hours</button><button class="link small" data-a="go" data-v="history">Past weeks</button>${S.sample?'<button class="link small" data-a="begin">Start my own</button>':''}</div>
 </div>`;
}

function vDiagnosis(){
 const dx=diagnose(),role=R();
 const causes=dx.causes.filter(c=>c.score>=0.2&&c.ev.length),low=dx.causes.filter(c=>!(c.score>=0.2&&c.ev.length));
 const shown=ui.allCauses?causes:causes.slice(0,3);
 const anyAns=causes.some(c=>c.basis);
 return `<div class="wrap narrow">
 <div class="eyebrow">Diagnosis · ${esc(role.name)}</div>
 <h1 class="h-page${ui.enter?' anim-words':''}">${words(dx.head)}</h1>
 <p class="muted lead">Based on ${dx.sN} ${pl(dx.sN,'application')}${anyAns?' and your answers':''}.${dx.recent.length?` ${dx.recent.length} newer ${pl(dx.recent.length,'one is','ones are')} still waiting on replies, so ${dx.recent.length===1?'it isn’t':'they aren’t'} counted yet.`:''}</p>
 <section class="sec"><h2>Where it breaks</h2><div class="stages">${dx.stages.map(s=>{const bn=s.k===dx.bottleneck;return `<div class="stage${bn?' bn':''}"><div class="stage-l"><b>${STAGE_TXT[s.k]}</b><small>${s.enough?`Typical: ${s.bench[0]}–${s.bench[1]}%`:'Not enough data yet'}</small></div><span class="stage-n"${s.enough?` data-count="${Math.round(s.rate*100)}" data-suffix="%"`:''}>${s.enough?pct(s.rate):'—'}</span>${s.enough?(s.status==='below'?pill(bn?'Weak spot':'Low','bad'):pill('On track','good')):''}</div>`}).join('')}</div></section>
 <section class="sec"><h2>Most likely reasons</h2>
 ${shown.length?`<div class="rcs">${shown.map((c,i)=>{const open=ui.cause[c.id]===undefined?i===0:ui.cause[c.id];return `<div class="rc${i===0?' top':''}${oc(c.id)}"><button class="rc-h" data-a="cause" data-id="${c.id}" data-open="${open}" aria-expanded="${open}"><span class="rank">${i+1}</span><span class="rc-t"><b>${esc(c.title)}</b><span class="rc-sub">${pill('Confidence: '+c.conf,c.conf==='High'?'good':c.conf==='Medium'?'muted':'warn')}${c.basis?pill('From your answers','muted'):''}${learnedPill(c)}</span></span>${chev(open)}</button>
  ${open?`<div class="rc-b"><ul class="ev">${c.ev.map(e=>`<li class="${e.startsWith('Caution')?'caution':''}">${esc(e)}</li>`).join('')}</ul>${c.fix?`<div class="fixgrid"><div><b>What to try</b>${esc(c.fix)}</div><div><b>How SPLIT checks</b>${esc(c.check)}</div></div>`:''}</div>`:''}</div>`}).join('')}</div>`:`<div class="empty"><p>Nothing stands out yet. Log a few more applications.</p></div>`}
 ${causes.length>3&&!ui.allCauses?`<button class="btn" data-a="allCauses" style="align-self:flex-start">Show ${causes.length-3} more</button>`:''}
 ${ui.allCauses&&low.length?`<h3 style="margin-top:10px">Probably not the problem</h3><div class="notfactor">${low.map(c=>`<div><b>${esc(c.id==='skills'?'Skill gaps':c.title)}</b><span>${esc(c.ok)}</span></div>`).join('')}</div>`:''}
 </section></div>`;
}

function vApps(){
 const f=ui.filter,b=S.baseline;
 const match=a=>f==='all'||(f==='waiting'&&a.reached===0&&!a.closed)||(f==='responded'&&a.reached>=1&&!a.closed)||(f==='closed'&&a.closed);
 const list=S.apps.filter(match).sort((a,b)=>a.applied<b.applied?1:-1);
 const n=k=>S.apps.filter(a=>k==='all'||(k==='waiting'&&a.reached===0&&!a.closed)||(k==='responded'&&a.reached>=1&&!a.closed)||(k==='closed'&&a.closed)).length;
 const F=[['all','All'],['waiting','Waiting'],['responded','Active'],['closed','Closed']];
 return `<div class="wrap narrow"><div class="page-h"><div><h1 class="h-page">Applications</h1><p class="muted">${S.apps.length} logged${b&&b.sent?` · ${b.sent} from before you joined`:''}</p></div><button class="btn primary" data-a="addApp">Add</button></div>
 ${S.apps.length?`<div class="seg tabs" role="tablist">${F.map(([k,l])=>`<button class="${f===k?'on':''}" data-a="filter" data-v="${k}" role="tab" aria-selected="${f===k}">${l} <span>${n(k)}</span></button>`).join('')}</div>
 <div class="list">${list.map(a=>{const[s,c]=statusOf(a);return `<button class="li" data-a="openApp" data-id="${a.id}"><span class="li-main"><b>${esc(a.co)}</b><small>${esc(a.title)} · ${fmt(a.applied)}</small></span>${pill(s,c)}${chev(false)}</button>`}).join('')||'<p class="muted" style="padding:16px">Nothing in this view.</p>'}</div>`
 :`<div class="empty">${ico('applications','lg')}<h3>Log applications as you send them</h3><p>Add the posting date, whether you tailored your resume, and whether you had a referral. That’s how SPLIT figures out what’s working.</p><button class="btn primary" data-a="addApp">Add an application</button></div>`}</div>`;
}

function vSkills(){
 const role=R(),all=role.skills,shown=ui.allSkills?all:all.slice(0,6),hasR=!!(S.resume&&S.resume.text);
 const stP=st=>st==='have'?pill('On resume','good'):st==='missing'?pill('Not on resume','warn'):st==='learning'?pill('Learning','accent'):pill('Gap','bad');
 return `<div class="wrap narrow"><h1 class="h-page">Skills</h1><p class="muted lead">What ${esc(role.name)} postings ask for most, checked against ${hasR?'your resume':'the skills you picked'}. Tap one to see how to build it.</p>
 ${hasR?'':`<button class="notice" data-a="go" data-v="resume" style="margin:18px 0 0">${ico('resume','sm')}<span class="notice-t"><b>Add your resume</b> so SPLIT can check what’s actually on it.</span><span class="link small">Add →</span></button>`}
 <div class="list" style="margin-top:22px">${shown.map((s,i)=>{const st=skillStatus(s.name),open=!!ui.skill[s.name],log=S.skillLog[s.name]||{hours:0,goal:8},pj=projLink(s.name),ev=resumeLine(s.name),sel=st==='have'||st==='missing'?'know':st;
  return `<div class="sk2${open?' open':''}${oc(s.name)}"><button class="sk2-h" data-a="skillOpen" data-n="${esc(s.name)}" aria-expanded="${open}"><span class="ix">${i+1}</span><span class="sk2-m"><b>${esc(s.name)}</b><span class="sk2-bar">${bar(s.pct)}<small>${s.pct}% of postings</small></span></span>${stP(st)}${chev(open)}</button>
  ${open?`<div class="sk2-more">
   ${st==='have'&&ev?`<div class="kv"><b>On your resume</b><span>“${esc(ev)}”</span></div>`:st==='missing'?`<div class="kv"><b>Not on your resume</b><span>You said you know this, but recruiters can’t see it. Add it to your skills section and write one bullet that shows it.</span></div>`:hasR?`<div class="kv"><b>Not on your resume</b><span>Build it with the resource and project below, then add it.</span></div>`:''}
   <div class="seg">${[['know','I know it'],['learning','Learning'],['gap','Not yet']].map(([k,l])=>`<button class="${sel===k?'on':''}" data-a="skillSt" data-n="${esc(s.name)}" data-v="${k}">${l}</button>`).join('')}</div>
   ${st==='learning'?`<div class="hrs"><span>${hrs(log.hours||0)} of ${hrs(log.goal||8)}</span>${bar((log.hours||0)/(log.goal||8)*100,'good')}<button class="btn sm" data-a="skillH" data-n="${esc(s.name)}">+1 h</button></div>`:''}
   <div class="kv"><b>Focus on</b><span>${esc(s.focus)}</span></div>
   <div class="kv"><b>Free resource</b><span>${esc(s.res)}${s.url?` <a class="link" href="${esc(s.url)}" target="_blank" rel="noopener">Open ↗</a>`:''}</span></div>
   <div class="kv"><b>Resume project</b><span>${esc(s.project)}${pj?` <a class="link" href="${esc(pj[0])}" target="_blank" rel="noopener">Open ${esc(pj[1])} ↗</a>`:''}</span></div></div>`:''}</div>`}).join('')}</div>
 ${!ui.allSkills&&all.length>6?`<button class="btn" data-a="allSkills" style="margin-top:14px">Show all ${all.length}</button>`:''}
 <p class="small muted" style="margin-top:18px">Posting shares are sample figures for this prototype.</p></div>`;
}

function vHistory(){
 const weeks=S.weeks.slice().reverse();
 return `<div class="wrap narrow"><h1 class="h-page">Past weeks</h1><p class="muted lead">What you planned, what happened, and what SPLIT changed.</p>
 ${weeks.length?`<div class="list" style="margin-top:22px">${weeks.map(w=>{const wa=S.apps.filter(a=>a.week===w.id),r=nResp(wa),acts=w.actions||[],done=acts.filter(a=>a.done).length,open=!!ui.wk[w.id];
  const notes=(w.notes||[]).concat((w.tests||[]).filter(t=>t.msg&&!(w.notes||[]).includes(t.msg)).map(t=>t.msg));
  return `<div class="sk2${open?' open':''}${oc(w.id)}"><button class="sk2-h" data-a="wkOpen" data-id="${w.id}" aria-expanded="${open}"><span class="sk2-m"><b>${fmtRange(w.id)}</b><small class="muted">${wa.length} ${pl(wa.length,'application')} · ${r} ${pl(r,'reply','replies')} · ${done} of ${acts.length} tasks</small></span>${chev(open)}</button>
  ${open?`<div class="sk2-more" style="padding-left:16px">${splitBar(w.split)}<ul class="wk-acts">${acts.map(a=>`<li class="${a.done?'':'x'}"><span class="m">${a.done?'✓':'–'}</span><span>${esc(a.t)}</span></li>`).join('')}</ul><div class="kv"><b>What the results showed</b>${notes.map(n=>`<span>${esc(n)}</span>`).join('')}</div><div class="kv"><b>What SPLIT changed</b>${(w.changes||[]).map(n=>`<span>${esc(n)}</span>`).join('')}</div></div>`:''}</div>`}).join('')}</div>`:`<div class="empty" style="margin-top:22px">${ico('history','lg')}<h3>Nothing yet</h3><p>Each weekly check-in adds a week here.</p></div>`}
 <p style="margin-top:18px"><button class="link small" data-a="go" data-v="week">← Back to this week</button></p></div>`;
}

/* ---------- first-run flow ---------- */
const RICON={da:['skills','blue'],swe:['code','green'],pm:['target','orange'],consult:['case','purple'],ba:['chart','red']};
ICON.code='<path d="m8 7-5 5 5 5M16 7l5 5-5 5"/>';ICON.target='<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/>';ICON.case='<rect x="3" y="7" width="18" height="13" rx="3"/><path d="M9 7V4.5h6V7"/>';ICON.chart='<path d="M4 4v16h16"/><path d="m8 15 4-5 3 3 5-6"/>';
const rTile=k=>`<span class="tile" style="--tc:var(--${RICON[k][1]})" aria-hidden="true"><svg viewBox="0 0 24 24">${ICON[RICON[k][0]]}</svg></span>`;
const opt=(f,v,label,sub,on,icon)=>`<button class="opt${on?' on':''}${ui.justPicked===f+':'+v?' just':''}" data-a="qPick" data-f="${f}" data-v="${esc(v)}" aria-pressed="${on}">${icon||''}<span><b>${esc(label)}</b>${sub?`<small>${esc(sub)}</small>`:''}</span></button>`;
const ctr=(f,label,sub,v)=>`<div class="ctr"><span><b>${label}</b><small>${sub}</small></span><div class="ctr-c"><button data-a="qCount" data-f="${f}" data-d="-1" aria-label="Fewer">−</button><input id="q-${f}" class="${ui.bump===f?'bump':''}" type="number" min="0" inputmode="numeric" data-ofn="${f}" value="${v}" aria-label="${label}"><button data-a="qCount" data-f="${f}" data-d="1" aria-label="More">+</button></div></div>`;
const Q=[
 {title:'What should we call you?',sub:'Your first name is fine.',valid:d=>d.name.trim().length>0,html:d=>`<input class="big-in" id="q-name" data-of="name" value="${esc(d.name)}" placeholder="Your name" autocomplete="given-name">`},
 {title:'What role are you going for?',sub:'SPLIT compares you against postings for this role.',valid:d=>!!d.role,html:d=>`<div class="opts two-col">${Object.entries(ROLES).map(([k,r])=>opt('role',k,r.name,'',d.role===k,rTile(k))).join('')}</div>`},
 {id:'resume',title:'Add your resume',sub:'SPLIT reads it to see which skills you already have and which bullets could be stronger. It stays in this browser.',valid:()=>true,next:d=>d.resume?'Continue':'Skip for now',html:d=>`<div class="stack">${resumeInput('ob')}</div>`},
 {title:'Which of these can you show on your resume?',sub:d=>d.resume?'SPLIT found the highlighted ones on your resume. Add any it missed.':'Pick the ones you could talk about in an interview.',valid:()=>true,html:d=>{const found=d.resume?detectSkills(d.resume,d.role):[];return `<div class="chips">${ROLES[d.role].skills.map(s=>`<button class="chipbtn${d.skills.includes(s.name)?' on':''}${found.includes(s.name)?' found':''}${ui.justPicked==='skill:'+s.name?' just':''}" data-a="qSkill" data-v="${esc(s.name)}" aria-pressed="${d.skills.includes(s.name)}">${esc(s.name)}</button>`).join('')}</div>`}},
 {title:'How many hours a week can you give recruiting?',sub:'SPLIT divides this between applying, building skills, and interview prep.',valid:d=>d.hours>0,html:d=>`<div class="opts">${[[3,'Light','About 30 minutes a day'],[5,'Steady','An hour most weekdays'],[8,'Serious','A real part of your week'],[12,'Intense','Peak recruiting mode']].map(([h,l,s])=>opt('hours',h,`${h} hours · ${l}`,s,d.hours===h)).join('')}</div>`},
 {title:'How has it gone so far?',sub:'Rough numbers are fine. Count everything since you started this cycle.',valid:()=>true,html:d=>`<div class="opts">${ctr('sent','Applications sent','Every one, even quick applies',d.sent)}${ctr('replies','Got a reply','Any reply: email, screen, or assessment',d.replies)}${ctr('interviews','Reached an interview','First round or later',d.interviews)}</div>`},
 {skip:d=>d.sent===0,title:'How soon after a posting goes up do you usually apply?',sub:'Be honest. This is one of the biggest factors.',valid:d=>!!d.timing,html:d=>`<div class="opts">${[['week','Within a week'],['2wk','One to two weeks later'],['later','More than two weeks later'],['unsure','I don’t check']].map(([v,l])=>opt('timing',v,l,'',d.timing===v)).join('')}</div>`},
 {skip:d=>d.sent===0,title:'Do you change your resume for each application?',sub:'Tailoring means matching the posting’s keywords and order.',valid:d=>!!d.tailor,html:d=>`<div class="opts">${[['usually','Usually'],['sometimes','Sometimes'],['rarely','Rarely or never']].map(([v,l])=>opt('tailor',v,l,'',d.tailor===v)).join('')}</div>`},
 {skip:d=>d.sent===0,title:'Have you applied with a referral?',sub:'Someone at the company passed your name along.',valid:d=>!!d.referral,html:d=>`<div class="opts">${[['often','Yes, often'],['few','A few times'],['never','Never']].map(([v,l])=>opt('referral',v,l,'',d.referral===v)).join('')}</div>`}
];
const visibleQ=d=>Q.map((q,i)=>i).filter(i=>!(Q[i].skip&&Q[i].skip(d)));

function flowWelcome(){
 const fun=(cls,rows)=>`<div class="${cls}">${rows.map(([l,w,c,bad],k)=>`<div class="w-row${bad?' bad':''}"><span>${l}</span><div class="w-track">${w?`<div class="w-bar" style="--w:${w}%;--c:var(--${c});--i:${k}"></div>`:''}${bad?'<em class="w-flag">Here’s the problem</em>':''}</div></div>`).join('')}</div>`;
 const ROWS=[['Applied',100,'blue'],['Replied',12,'green',1],['Interview',5,'orange'],['Offer',0,'purple']];
 const STEPS=[['blue','Tell SPLIT where you are','Your role, your skills, and rough numbers. About two minutes.'],['red','See exactly where it breaks','SPLIT compares each step of your search with typical ranges and finds the weak spot.'],['green','Get a plan for this week','Specific tasks, split into hours, each with the reason it’s there.']];
 return `<div class="land">
 <section class="l-hero" id="hero">
  <div class="l-hero-in">
   <div class="l-copy">
    <span class="l-kicker">Recruiting, diagnosed</span>
    <h1 class="l-h anim-words">${words('Find out why recruiting isn’t',150)} <span class="w hl-w" style="--i:5;--d:150ms">working.</span></h1>
    <p class="l-p">Answer a few quick questions. SPLIT finds where your search breaks down and tells you what to do this week.</p>
    <div class="l-btns"><button class="btn primary big" data-a="begin">Get started</button><button class="btn big" data-a="example">See an example</button></div>
   </div>
   <div class="l-art"><div class="tilt-card" data-tilt="10">${fun('w-card',ROWS)}
    <div class="chip-f a"><div class="chip">${ico('diagnosis','sm')}<span>Reply rate <b>4%</b></span></div></div>
    <div class="chip-f b"><div class="chip">${ico('applications','sm')}<span>Applied 18 days late</span></div></div></div></div>
  </div>
  <div class="l-scroll" aria-hidden="true"><i></i>Scroll</div>
 </section>
 <section class="l-how" id="how" data-step="0">
  <div class="l-sticky">
   <div class="l-steps"><span class="l-kicker l-how-k">How it works</span>${STEPS.map(([c,h,p],k)=>`<div class="l-step${k===0?' on':''}"><span class="num" style="--tc:var(--${c})">${k+1}</span><div><h3>${h}</h3><p>${p}</p></div></div>`).join('')}</div>
   <div class="l-stage"><div class="flip">
    <div class="face front">${fun('face-rows',ROWS)}<div class="scanline" aria-hidden="true"></div></div>
    <div class="face back"><div class="face-h"><span>This week</span>${pill('Get more replies','good')}</div>
     ${['Apply to 4 roles posted this week','Tailor your resume for 2 of them','Ask 1 person for a referral'].map((x,k)=>`<div class="mini-task" style="--i:${k}"><span class="chk"></span><span>${x}</span></div>`).join('')}
     <p class="small muted">Each task shows why it’s there.</p></div>
   </div></div>
   <div class="l-prog" aria-hidden="true"><div></div></div>
  </div>
 </section>
 <section class="l-diff">
  <h2 class="l-h2">Not another job tracker.</h2>
  <div class="l-cards">
   <div class="l-card" data-tilt="6">${ico('diagnosis','lg')}<h3>Trackers log. SPLIT explains.</h3><p>It compares your results with typical ranges for your role and tells you which step is breaking.</p></div>
   <div class="l-card" data-tilt="6">${ico('skills','lg')}<h3>Every task shows its work.</h3><p>Tap any task to see the evidence behind it and what result would mean it’s working.</p></div>
   <div class="l-card" data-tilt="6">${ico('history','lg')}<h3>The plan learns from you.</h3><p>Each weekly check-in tests what you changed and moves your hours toward what worked.</p></div>
  </div>
 </section>
 <section class="l-cta"><h2 class="l-h2" style="margin:0">Find your weak spot in two minutes.</h2><button class="btn primary big" data-a="begin">Get started</button></section>
 <footer class="l-foot">SPLIT · Built by Team 1 for the TPC Product Project</footer>
 </div>`;
}
function flowQ(){
 const f=ui.flow,d=f.draft,vis=visibleQ(d),pos=vis.indexOf(f.i),q=Q[f.i];
 return `<div class="q-wrap"><div class="q-top"><button class="x" data-a="qExit" aria-label="Back to start">×</button><div class="qbar" role="progressbar" aria-valuenow="${pos+1}" aria-valuemax="${vis.length}"><div style="width:${(pos+1)/vis.length*100}%"></div></div></div>
 <div class="q-body${ui.qEnter?' q-enter':''}"><h1 class="q-title">${q.title}</h1>${q.sub?`<p class="q-sub">${typeof q.sub==='function'?q.sub(d):q.sub}</p>`:''}${q.html(d)}</div>
 <div class="q-foot"><div class="q-foot-in">${pos>0?'<button class="btn" data-a="qBack">Back</button>':'<span></span>'}<button class="btn primary" data-a="qNext" ${q.valid(d)?'':'disabled'}>${pos===vis.length-1?'Diagnose me':q.next?q.next(d):'Continue'}</button></div></div></div>`;
}
const LOAD_LINES=()=>[S&&S.sample?`Reading ${S.apps.length} applications`:'Reading your answers','Checking your reply rate against typical ranges','Looking for what’s holding you back','Building this week’s plan'];
function flowLoading(){
 const k=ui.flow.k,lines=LOAD_LINES();
 return `<div class="center-screen"><div class="load" role="status" aria-live="polite">
 <div class="scan-card" aria-hidden="true">${[['blue',100],['green',38],['orange',18],['purple',6]].map(([c,w],i)=>`<div class="sc-track"><div class="sc-bar" style="--c:var(--${c});--w:${w}%;--i:${i}"></div></div>`).join('')}<div class="scanline"></div></div>
 <h1 class="h-page">Diagnosing the issue<span class="dots"><i>.</i><i>.</i><i>.</i></span></h1>${bar(k/lines.length*100,'good big')}
 <ul class="load-steps" id="load-steps">${lines.map((t,i)=>`<li class="${i<k?'done':i===k?'now':''}"><span class="ls-dot"></span>${esc(t)}</li>`).join('')}</ul></div></div>`;
}
function flowReveal(){
 const dx=diagnose(),L=dx.lead,rs=dx.stages[0],role=R();
 return `<div class="center-screen"><div class="reveal"><span style="--i:0">${ico('diagnosis','lg')}</span><div class="eyebrow" style="--i:1">Diagnosis complete</div>
 <h1 class="h-display anim-words" style="--i:2">${words(dx.head,200)}</h1>
 ${L&&L.short&&dx.bottleneck!=='ok'?`<p class="h-sub" style="--i:5">${dx.bottleneck==='start'?'Right now':'Most likely reason'}: <span class="hl anim-mark" style="animation-delay:1.3s">${esc(L.short)}</span>.</p>`:''}
 ${rs.enough?`<div class="rv-stat" style="--i:7"><b data-count="${Math.round(rs.rate*100)}" data-suffix="%">${pct(rs.rate)}</b> of your applications get a reply. Typical for ${esc(role.short)} roles: ${rs.bench[0]}–${rs.bench[1]}%.</div>`:''}
 <button class="btn primary big" data-a="revealGo" style="max-width:360px;--i:8">See my plan for this week</button></div></div>`;
}
function flowHTML(){const s=ui.flow.step;return s==='welcome'?flowWelcome():s==='q'?flowQ():s==='loading'?flowLoading():flowReveal()}
function startLoading(){
 const rm=RM(),step=rm?300:900,n=LOAD_LINES().length;
 ui.flow={step:'loading',k:0};render();window.scrollTo(0,0);
 const tick=()=>{if(!ui.flow||ui.flow.step!=='loading')return;const k=++ui.flow.k;
  document.querySelectorAll('#load-steps li').forEach((li,i)=>{li.className=i<k?'done':i===k?'now':''});
  const b=document.querySelector('.load .pbar>div');if(b)b.style.width=(k/n*100)+'%';
  if(k<n)setTimeout(tick,step);else setTimeout(()=>{if(ui.flow&&ui.flow.step==='loading'){ui.flow={step:'reveal'};render();countAll(document.getElementById('main'))}},rm?200:700)};
 setTimeout(tick,step);
}
/* ---------- overlays ---------- */
function drawer(title,eyebrow,body,foot){return `<div class="scrim" data-a="close"><div class="drawer" role="dialog" aria-modal="true" aria-labelledby="ovt" data-stop="1"><div class="ov-h"><div>${eyebrow?`<div class="eyebrow">${eyebrow}</div>`:''}<h2 id="ovt">${title}</h2></div><button class="x" data-a="close" aria-label="Close">×</button></div><div class="ov-b">${body}</div>${foot?`<div class="ov-f">${foot}</div>`:''}</div></div>`}
function ovApp(){
 const isNew=ui.overlay.id==='new',a=isNew?ui.newApp:appById(ui.overlay.id);if(!a)return '';
 const id=isNew?'new':a.id,[s,c]=statusOf(a),g=ageAt(a);
 const have=new Set(S.profile.skills.map(lc));R().skills.forEach(x=>{if(skillStatus(x.name)==='have')have.add(lc(x.name))});
 const matched=(a.kw||[]).filter(k=>have.has(lc(k))),missing=(a.kw||[]).filter(k=>!have.has(lc(k)));
 const conf=ui.confirm===id;
 const body=`${isNew?'':`<div>${pill(s,c)}</div>`}
  <div class="row"><label class="field"><span>Company</span><input id="f-co" data-af="co" data-id="${id}" value="${esc(a.co)}" placeholder="e.g. Capital One"></label><label class="field"><span>Role</span><input id="f-title" data-af="title" data-id="${id}" value="${esc(a.title)}" placeholder="e.g. Data Analyst Intern"></label></div>
  <div class="row"><label class="field"><span>Posted on</span><input id="f-posted" type="date" data-af="posted" data-id="${id}" value="${esc(a.posted)}"></label><label class="field"><span>Applied on</span><input id="f-applied" type="date" data-af="applied" data-id="${id}" value="${esc(a.applied)}"></label></div>
  <p class="small muted">${g==null?'Add the posting date so SPLIT can check timing.':`Applied ${g} ${pl(g,'day')} after it was posted. ${g<=7?'That counts as early.':'That counts as late.'}`}</p>
  <div class="row"><label class="toggle"><input id="f-tail" type="checkbox" data-af="tailored" data-id="${id}" ${a.tailored?'checked':''}>Tailored resume</label><label class="toggle"><input id="f-ref" type="checkbox" data-af="referral" data-id="${id}" ${a.referral?'checked':''}>Had a referral</label></div>
  <div class="field"><span>How far it got</span><div class="seg">${['Applied','Reply','Interview','Offer'].map((l,i)=>`<button class="${a.reached===i?'on':''}" data-a="stage" data-id="${id}" data-v="${i}">${l}</button>`).join('')}</div></div>
  ${a.reached===2?`<label class="field"><span>Interview date</span><input id="f-idate" type="date" data-af="interviewDate" data-id="${id}" value="${esc(a.interviewDate)}"></label>`:''}
  <label class="toggle"><input id="f-closed" type="checkbox" data-af="closed" data-id="${id}" ${a.closed?'checked':''}>Rejected or closed</label>
  <details class="more"${(a.kw||[]).length||a.jd||a.notes?' open':''}><summary>Link, keywords, and notes</summary><div class="more-b">
   <label class="field"><span>Link to posting</span><input id="f-url" data-af="url" data-id="${id}" value="${esc(a.url)}" placeholder="https://…"><small>${a.url&&!isNew?`<a class="link" href="${esc(a.url)}" target="_blank" rel="noopener">Open posting ↗</a>`:'Paste the link so you can jump back to it.'}</small></label>
   <div class="field"><span>Keyword match</span><textarea id="f-jd" data-af="jd" data-id="${id}" placeholder="Paste the job description">${esc(a.jd||'')}</textarea><div><button class="btn sm" data-a="kw" data-id="${id}">Check keywords</button></div>
    ${(a.kw||[]).length?`<p class="small">${matched.length} of ${a.kw.length} skills from this posting are on your resume.</p><div class="kw">${matched.map(k=>`<span class="kwc have">${esc(k)}</span>`).join('')}${missing.map(k=>`<span class="kwc miss">${esc(k)}</span>`).join('')}</div>`:''}</div>
   <label class="field"><span>Notes</span><textarea id="f-notes" data-af="notes" data-id="${id}">${esc(a.notes)}</textarea></label></div></details>
  ${ui.err?`<p class="err">${esc(ui.err)}</p>`:''}`;
 const foot=isNew?`<span></span><button class="btn primary" data-a="saveNew">Save</button>`:conf?`<span class="small">Delete ${esc(a.co)}? This can’t be undone.</span><span class="row"><button class="btn sm" data-a="cancelDel">Cancel</button><button class="btn sm danger" data-a="delApp" data-id="${id}">Delete</button></span>`:`<button class="btn sm danger" data-a="askDel" data-id="${id}">Delete</button><button class="btn" data-a="close">Done</button>`;
 return drawer(isNew?'Add application':esc(a.co),isNew?'New':'',body,foot);
}
function ovCheckin(){
 const o=ui.overlay;
 const head=(t,step)=>`<div class="ov-h"><div><div class="eyebrow">Check-in · ${fmtRange(o.weekId||S.current.id)}</div><h2 id="ovt">${t}</h2><div class="steps">${[1,2,3].map(i=>`<i class="${i<=step?'on':''}"></i>`).join('')}</div></div>${step<3?'<button class="x" data-a="close" aria-label="Close">×</button>':''}</div>`;
 let body='',foot='';
 if(o.step===1){const dx=diagnose(),acts=planActions(S.current.plan).map(a=>renderAct(a,dx));
  body=`<p class="small muted">Tick everything you finished.</p>${acts.map(a=>`<button class="ck-act" data-a="ckDone" data-id="${esc(a.id)}"><span class="chk ${o.done[a.id]?'on':''}"></span><span style="flex:1"><span class="task-t">${esc(a.title)}</span><br><span class="small muted">${CATS[a.cat]} · ${hrs(a.h)}</span></span></button>`).join('')}`;
  foot=`<span class="small muted">${acts.filter(a=>o.done[a.id]).length} of ${acts.length} done</span><button class="btn primary" data-a="ckNext">Next</button>`}
 if(o.step===2){const open=S.apps.filter(a=>!a.closed&&a.reached<3).sort((a,b)=>a.applied<b.applied?1:-1);
  const opts=[['keep','No news'],['responded','Reply'],['interview','Interview'],['offer','Offer'],['rejected','Rejected']];
  body=`<p class="small muted">Only change the ones that moved this week.</p>${open.map(a=>{const cur=o.upd[a.id]||'keep';return `<div class="ck-app"><span class="co">${esc(a.co)}<small>${statusOf(a)[0]} · applied ${fmt(a.applied)}</small></span><div class="seg">${opts.filter(([k])=>!(k==='responded'&&a.reached>=1)&&!(k==='interview'&&a.reached>=2)).map(([k,l])=>`<button class="${cur===k?'on':''}" data-a="ckUpd" data-id="${a.id}" data-v="${k}">${l}</button>`).join('')}</div></div>`}).join('')||'<p>No open applications to update.</p>'}`;
  foot=`<button class="btn" data-a="ckBack">Back</button><button class="btn primary" data-a="ckFinish">Finish</button>`}
 if(o.step===3){const r=o.result,L=r.dx1.lead;
  body=`<p class="result-big">${esc(r.dx1.head)}</p>${L&&L.short&&r.dx1.bottleneck!=='ok'?`<p class="h-sub" style="margin-top:0">Main reason: <span class="hl">${esc(L.short)}</span>.</p>`:''}
  ${r.verdicts.length?`<div class="card flat"><h3>What your results showed</h3><ul>${r.verdicts.map(v=>`<li>${esc(v.msg)}</li>`).join('')}</ul></div>`:''}
  <div class="card flat"><h3>How next week changes</h3><div class="compare"><span>This week</span>${splitBar(r.plan0.split)}<span>Next week</span>${splitBar(r.plan1.split)}</div><ul>${r.changes.slice(0,4).map(c=>`<li>${esc(c)}</li>`).join('')}</ul></div>`;
  foot=`<span></span><button class="btn primary" data-a="ckClose">See next week’s plan</button>`}
 return `<div class="scrim center"><div class="modal" role="dialog" aria-modal="true" aria-labelledby="ovt">${head(o.step===1?'What did you get done?':o.step===2?'Any replies?':'Here’s what changed',o.step)}<div class="ov-b">${body}</div><div class="ov-f">${foot}</div></div></div>`;
}
function ovHours(){
 const P=S.current.plan,t=P.split.apply+P.split.build+P.split.prep;
 return drawer('Adjust hours',`This week · ${hrs(t)}`,`${splitBar(P.split)}${['apply','build','prep'].map(k=>`<div class="hrow">${ico(k,'sm')}<b>${CATS[k]}</b><span class="stepper"><button data-a="split" data-k="${k}" data-d="-0.5" aria-label="Less ${CATS[k]}">−</button><span>${hrs(P.split[k])}</span><button data-a="split" data-k="${k}" data-d="0.5" aria-label="More ${CATS[k]}">+</button></span></div>`).join('')}
  <div class="kv"><b>Why SPLIT suggested this split</b>${P.reasons.map(r=>`<span>${esc(r)}</span>`).join('')}</div>`,`<button class="btn sm" data-a="rebuild">Reset to suggested</button><button class="btn primary" data-a="close">Done</button>`);
}
function ovDebrief(){
 const respApps=S.apps.filter(a=>a.reached>=1);
 return drawer('Log a debrief','Interviews',`<form data-form="debrief" id="debrief-form" class="stack">
  <label class="field"><span>Company</span><select id="db-app" name="app">${respApps.length?respApps.map(a=>`<option value="${a.id}">${esc(a.co)}</option>`).join(''):'<option value="">Mark an application as replied first</option>'}</select></label>
  <div class="row"><label class="field"><span>Type</span><select id="db-type" name="type">${['Recruiter screen','Online assessment','Technical','Behavioral','Case','Final round'].map(t=>`<option>${t}</option>`).join('')}</select></label><label class="field"><span>Date</span><input id="db-date" type="date" name="date" value="${TODAY}"></label></div>
  <label class="field"><span>Questions they asked</span><textarea id="db-q" name="q" placeholder="One per line"></textarea></label>
  <div class="field"><span>How did it go?</span><div class="seg" id="db-rating">${[1,2,3,4].map(r=>`<button type="button" class="${r===3?'on':''}" data-a="rate" data-v="${r}">${RATING[r]}</button>`).join('')}</div></div>
  <label class="field"><span>What was hard?</span><textarea id="db-s" name="s" placeholder="e.g. Blanked on a window-function question"></textarea></label></form>`,`<span></span><button class="btn primary" type="submit" form="debrief-form" ${respApps.length?'':'disabled'}>Save</button>`);
}
function ovStory(){
 return drawer('Write a story','Story bank',`<form data-form="story" id="story-form" class="stack">
  <label class="field"><span>Title</span><input id="st-title" name="title" required placeholder="e.g. Found the bug in the club’s survey data"></label>
  <div class="field"><span>Question types it answers</span><div class="chips">${TAGS.map(t=>`<label class="toggle"><input type="checkbox" name="tag" value="${t}">${t}</label>`).join('')}</div></div>
  <label class="field"><span>Situation</span><textarea id="st-s" name="s"></textarea></label><label class="field"><span>Task</span><textarea id="st-t" name="t"></textarea></label>
  <label class="field"><span>Action</span><textarea id="st-a" name="a"></textarea></label><label class="field"><span>Result</span><textarea id="st-r" name="r" placeholder="Include a number if you can"></textarea></label></form>`,`<span></span><button class="btn primary" type="submit" form="story-form">Save</button>`);
}
function ovSettings(){
 const p=S.profile;
 return drawer(esc(p.name),'Settings',`<label class="field"><span>Name</span><input id="s-name" data-pf="name" value="${esc(p.name)}"></label>
  <label class="field"><span>Target role</span><select id="s-role" data-pf="role">${Object.entries(ROLES).map(([k,r])=>`<option value="${k}" ${p.role===k?'selected':''}>${r.name}</option>`).join('')}</select></label>
  <div class="row"><label class="field"><span>Recruiting for</span><input id="s-season" data-pf="season" value="${esc(p.season)}"></label><label class="field"><span>Hours per week</span><input id="s-hours" type="number" min="1" max="40" step="0.5" data-pf="hours" value="${p.hours}"></label></div>
  <p class="small muted">Changing role or hours rebuilds this week’s plan. Finished tasks stay checked.</p>
  <div class="card flat"><h3>Your data</h3><p class="small muted">Saved in this browser only.</p>${ui.confirm==='reset'?`<p class="small">This erases everything and starts setup over. Continue?</p><div class="row"><button class="btn sm" data-a="cancelDel">Cancel</button><button class="btn sm danger" data-a="startOver">Start over</button></div>`:`<div class="row"><button class="btn sm" data-a="askReset">Start over</button><button class="btn sm" data-a="example">Load example data</button></div>`}</div>`,'');
}


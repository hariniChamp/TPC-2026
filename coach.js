/* SPLIT — answer checker, Claude review, interview practice, and resume reader */
'use strict';
/* ---------- coach: helpers ---------- */
Object.assign(ICON,{resume:'<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5M10 13h6M10 17h6"/>',spark:'<path d="M12 4v4M12 16v4M4 12h4M16 12h4M7 7l2 2M15 15l2 2M7 17l2-2M15 9l2-2"/>',doc:'<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5"/>'});
TILE.resume='purple';TILE.spark='orange';
const wc=s=>(String(s||'').trim().match(/\S+/g)||[]).length;
const escRe=s=>String(s).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const capF=s=>s?s.charAt(0).toUpperCase()+s.slice(1):s;
const VB={make:'made',build:'built',run:'ran',write:'wrote',lead:'led',set:'set',find:'found',plan:'planned',get:'got',do:'did',give:'gave',take:'took',put:'put',teach:'taught',bring:'brought',begin:'began',choose:'chose',draw:'drew',map:'mapped',ship:'shipped'};
const BASE=['make','build','create','design','run','write','lead','organize','plan','clean','analyze','collect','set','find','fix','test','develop','launch','manage','prepare','present','track','research','review','update','improve','coordinate','recruit','train','code','implement','model','edit','draft','gather','host','market','promote','teach','visualize','automate','streamline','reduce','increase','schedule','survey','map','measure','calculate','merge','compile','summarize','identify','resolve','support','maintain','monitor','process','deliver','produce','redesign','prototype','grow','raise','ship','plot','chart','graph'];
const past=v=>{v=v.toLowerCase();if(VB[v])return VB[v];if(/e$/.test(v))return v+'d';if(/[^aeiou]y$/.test(v))return v.slice(0,-1)+'ied';return v+'ed'};
const baseOf=w=>{w=String(w).toLowerCase();if(BASE.includes(w))return w;if(/ing$/.test(w)){const s=w.slice(0,-3);if(BASE.includes(s))return s;if(BASE.includes(s+'e'))return s+'e';if(/(.)\1$/.test(s)&&BASE.includes(s.slice(0,-1)))return s.slice(0,-1)}return null};
const WEMAP={'we were':'I was','we are':'I am',"we're":"I'm","we've":"I've","we'd":"I'd","we'll":"I'll",'we':'I'};
const KIND={filler:['Cut filler','filler'],own:['Take ownership','own'],verb:['Stronger verb','verb'],vague:['Be specific','vague'],concise:['Tighten','concise'],structure:['Structure','vague']};
const VLABEL={strong:'Strong answer',getting_there:'Getting there',needs_work:'Needs work'};

/* ---------- rule checker ---------- */
const RULES=[
 {k:'filler',re:/(^|[.!?]\s+)(So|Um|Uh|Like|Well|Okay|OK),?\s+/g,fn:m=>({at:m.index+m[1].length,find:m[0].slice(m[1].length),rep:''}),why:'Verbal filler. Start with the point.'},
 {k:'filler',re:/\b(?:basically|actually|literally|honestly|really|very|just|pretty much|kind of|sort of)\b\s*/gi,rep:'',why:'Filler word. Cutting it makes you sound more sure.'},
 {k:'filler',re:/\bI (?:think|feel like|believe|guess)(?: that)?\s+/gi,rep:'',why:'Hedging. Say it directly.'},
 {k:'concise',re:/\bin order to\b/gi,rep:'to',why:'Shorter, same meaning.'},
 {k:'concise',re:/\bdue to the fact that\b/gi,rep:'because',why:'Shorter, same meaning.'},
 {k:'verb',f:['a','r','p2','b'],re:/\b(I was |was |were )?(?:responsible for|in charge of)(?: (\w+ing)\b)?/gi,fn:m=>{const b=m[2]&&baseOf(m[2]),i=/^I /i.test(m[0])?'I ':'';return b?{rep:i+past(b)}:{find:m[0].slice(0,m[0].length-(m[2]?m[2].length+1:0)),rep:i+'owned',alt:[i+'owned',i+'led',i+'ran',i+'managed']}},why:'Describes a duty, not an action. Say what you did.'},
 {k:'verb',re:/\bhelped(?: to| with)? (\w+)/gi,fn:m=>{const b=baseOf(m[1]);return b?{rep:past(b)}:{find:m[0].slice(0,m[0].length-m[1].length).trimEnd(),rep:'handled',alt:['handled','ran','led','built']}},why:'“Helped” hides your part. Name your action.'},
 {k:'verb',re:/\bworked on(?: (\w+ing)\b)?/gi,fn:m=>{const b=m[1]&&baseOf(m[1]);return b?{rep:past(b)}:{find:m[0].slice(0,9),rep:'built',alt:['built','analyzed','ran','led']}},why:'Vague. Name the action: built, analyzed, ran.'},
 {k:'verb',re:/\bassisted (?:with|in)\b/gi,rep:'handled',alt:['handled','ran','built'],why:'“Assisted” hides your part. Name your action.'},
 {k:'verb',re:/\b(?:participated in|was involved in|was part of)\b/gi,rep:'contributed to',alt:['contributed to','led','ran'],why:'Passive. Say what you did in it.'},
 {k:'own',re:/\btried to (\w+)/gi,fn:m=>{const b=baseOf(m[1]);return b?{rep:past(b)}:{find:'tried to ',rep:''}},why:'Say what you did, not what you attempted.'},
 {k:'own',f:['a'],re:/\b(?:we were|we are|we're|we've|we'd|we'll|we)\b/gi,fn:m=>({rep:WEMAP[m[0].toLowerCase()]||'I'}),why:'Say what you did. They’re hiring you, not your team.'},
 {k:'vague',re:/\b(?:a lot of|lots of|a bunch of|many|several|some|a few|various)\s+(?=(\w+))/gi,fn:m=>({rep:/s$/i.test(m[1]||'')?'[number] ':'[how much] '}),why:'Vague amount. A real number makes it believable.'},
 {k:'vague',f:['r'],re:/\b(?:it |this |that )?(?:went (?:really |very )?well|was (?:a |very |really )?success(?:ful)?|turned out (?:great|well|good)|was (?:really |very )?(?:good|great))\b/gi,rep:'[what changed, with a number]',why:'Says it went well without proof. Show the result.'},
 {k:'vague',f:['r'],re:/\s*\b(?:and )?(?:the |my |our )?(?:professor|teacher|manager|boss|client|team) (?:liked|loved|was happy with|appreciated) (?:it|our work|my work|the project)\b/gi,rep:'',why:'Someone liking it isn’t a result. Say what changed.'},
 {k:'vague',re:/\b(?:stuff|things)\b/gi,rep:'[name it]',why:'Too general. Name the actual thing.'}
];
function ruleEdits(text,part,extra){
 const out=[];if(!text)return out;
 [...(extra||[]),...RULES].forEach(r=>{if(r.f&&!r.f.includes(part))return;const re=r.re.global?r.re:(r.re=new RegExp(r.re.source,r.re.flags+'g'));re.lastIndex=0;let m;
  while((m=re.exec(text))){if(m[0]===''){re.lastIndex++;continue}
   let res=r.fn?r.fn(m):{rep:r.rep,alt:r.alt};if(!res)continue;
   const find=res.find!=null?res.find:m[0],at=res.at!=null?res.at:m.index;if(!find)continue;
   let rep=res.rep;if(rep&&/^[A-Z]/.test(find)&&/^[a-z]/.test(rep))rep=capF(rep);
   out.push({part,at,find,rep,kind:r.k,why:r.why,alt:res.alt||r.alt||null})}});
 out.sort((a,b)=>a.at-b.at||b.find.length-a.find.length);
 const keep=[];let end=-1;out.forEach(e=>{if(e.at>=end){keep.push(e);end=e.at+e.find.length}});return keep;
}
function fieldsOf(q){return q.kind==='pitch'?PITCHF(q.co):STARF}
function structNotes(q,f){
 const N={},w=k=>wc(f[k]);
 if(q.kind==='pitch'){
  N.p1=!f.p1?['fix','Missing.']:!new RegExp(escRe(q.co),'i').test(f.p1)?['fix',`Name ${q.co} and one specific thing about it.`]:/\[[^\]]+\]/.test(f.p1)?['fix','Fill in the [brackets] with something specific.']:['good','Specific about the company.'];
  const sk=R().skills.some(s=>SYN[s.name]&&SYN[s.name].test(f.p2||''));
  N.p2=!f.p2?['fix','Missing.']:!sk&&!/\d/.test(f.p2)?['fix','Name a skill or experience that fits this role.']:['good','Connects you to the role.'];
  N.p3=!f.p3?['fix','Missing.']:w('p3')<8?['fix','Too short. Say what you hope to do there.']:['good','Ends looking forward.'];
  return N}
 N.s=!f.s?['fix','Missing. Set the scene in a sentence or two.']:w('s')>60?['fix','Runs long. Keep it to one or two sentences.']:['good','Sets the scene quickly.'];
 N.t=!f.t?['fix','Missing. Say what you were responsible for.']:w('t')>40?['fix','Long for a Task. One sentence is enough.']:['good','Clear goal.'];
 const we=((f.a||'').match(/\bwe\b/gi)||[]).length;
 N.a=!f.a?['fix','Missing. This is the most important part.']:w('a')<35?['fix','Too thin. List two or three specific steps you took.']:w('a')<w('s')?['fix','Shorter than your Situation. Spend most of your time here.']:we>1?['fix',`Says “we” ${we} times. Say what you did.`]:['good','Specific steps in your own voice.'];
 N.r=!f.r?['fix','Missing. End with what changed.']:!/\d/.test(f.r)?['fix','No number. Show what changed: time saved, percent improved, people reached.']:['good','Measurable result.'];
 return N;
}
function checkRules(q,f){
 const defs=fieldsOf(q),edits=[];defs.forEach(d=>edits.push(...ruleEdits(f[d.k]||'',d.k)));
 const N=structNotes(q,f),parts={};defs.forEach(d=>parts[d.k]={status:N[d.k][0],note:N[d.k][1]});
 const fixes=defs.filter(d=>parts[d.k].status==='fix').length,empty=defs.some(d=>!f[d.k]);
 const score=edits.length+fixes*2,verdict=empty||score>8?'needs_work':score>2?'getting_there':'strong';
 const top=defs.filter(d=>parts[d.k].status==='fix').slice(0,2).map(d=>{const n=parts[d.k].note.split('. ')[0].replace(/\.$/,'');return `${d.label} (${n.charAt(0).toLowerCase()+n.slice(1)})`});
 const summary=verdict==='strong'?'Clear, specific, and in your own voice.':top.length?`Biggest fixes: ${join(top)}.`:`${edits.length} line edits will tighten it up.`;
 const strong={};defs.forEach(d=>strong[d.k]=applyAll(f[d.k]||'',edits.filter(e=>e.part===d.k)));
 return {src:'rules',verdict,summary,parts,edits:edits.map((e,i)=>Object.assign(e,{id:'e'+i})),fixed:strong,strong:null,whyStrong:[]};
}
function locate(text,e){const L=e.find.length;if(text.substr(e.at,L)===e.find)return e.at;const lt=text.toLowerCase(),lf=e.find.toLowerCase();if(lt.substr(e.at,L)===lf)return e.at;let best=-1,bd=1e9,k=lt.indexOf(lf);while(k>=0){const d=Math.abs(k-e.at);if(d<bd){bd=d;best=k}k=lt.indexOf(lf,k+1)}return best}
function applyEdit(text,e){const at=locate(text,e);if(at<0)return{text,ok:false};const find=text.substr(at,e.find.length);
 let rep=e.rep||'';if(rep&&/^[A-Z]/.test(find)&&/^[a-z]/.test(rep))rep=capF(rep);
 const before=text.slice(0,at);let after=text.slice(at+find.length);
 if(!rep){if(/\s$/.test(before)&&/^\s/.test(after))after=after.replace(/^\s+/,'');else if(/\w$/.test(before)&&/^\w/.test(after))rep=' '}
 if(/\s$/.test(rep)&&/^\s/.test(after))after=after.replace(/^\s+/,'');
 let mid=rep+after;if((at===0||/[.!?]\s+$/.test(before))&&/^[a-z]/.test(mid))mid=capF(mid);
 const out=(before+mid).replace(/ {2,}/g,' ').replace(/ +([.,!?;:])/g,'$1');return{text:out,ok:true,delta:out.length-text.length,at}}
function applyAll(text,edits){let t=text;edits.slice().sort((a,b)=>b.at-a.at).forEach(e=>{const r=applyEdit(t,e);t=r.text});return t}

/* ---------- Claude (when the viewer allows it) ---------- */
let SAMPLE=null,SAMPLE_OFF=false;
try{if(window.claude&&typeof window.claude.use==='function')window.claude.use('sample').then(s=>{SAMPLE=s||null;if(s&&!ui.flow&&(ui.view==='interviews'||ui.view==='resume'))renderMain()}).catch(()=>{})}catch(e){}
const canAI=()=>!!SAMPLE&&!SAMPLE_OFF&&typeof SAMPLE.json==='function';
const HARD=['not_granted','sampling_disabled','not_declared','capability_disabled','capability_removed'];
async function aiJSON(prompt){try{return await SAMPLE.json(prompt,{modelTier:'default'})}catch(e){if(e&&HARD.includes(e.code))SAMPLE_OFF=true;throw e}}
const aiNote=e=>e&&e.code==='rate_limited'?'Claude is busy right now, so this is the quick check. Try again in a bit.':e&&e.code==='not_granted'?'Claude wasn’t allowed, so this is the quick check.':'Claude couldn’t answer, so this is the quick check.';
function starPrompt(q,f,defs){return `You are an interview coach. A college student is preparing for ${R().name} interviews and wrote this answer.

Question: "${q.q}"
Their answer, by part:
${defs.map(d=>`${d.k} (${d.label}): ${f[d.k]||'(empty)'}`).join('\n')}

Review it the way a strong recruiter would. Reply with only JSON in this shape:
{"verdict":"needs_work|getting_there|strong","summary":"one plain sentence on the biggest fix","parts":{${defs.map(d=>`"${d.k}":{"status":"good|fix","note":"one short sentence"}`).join(',')}},"edits":[{"part":"${defs.map(d=>d.k).join('|')}","find":"exact words copied from that part","replace":"better words, or empty to delete","kind":"filler|own|verb|vague|concise|structure","why":"under 12 words"}],"strong":{${defs.map(d=>`"${d.k}":"..."`).join(',')}},"why_strong":["up to 3 short points"]}

Rules: copy "find" exactly from the student's text and keep it short (a word or phrase). At most 10 edits. Keep the student's own facts. Never invent numbers, names, or results; where one is needed, write a placeholder in square brackets like [number of users]. "strong" rewrites THEIR story as a strong answer of 150 to 250 words in total, saying "I" for their own actions. Plain, direct language.`}
function fromAI(raw,q,f){
 const defs=fieldsOf(q),keys=defs.map(d=>d.k);if(!raw||typeof raw!=='object')throw {code:'invalid_json'};
 const verdict=['needs_work','getting_there','strong'].includes(raw.verdict)?raw.verdict:'getting_there';
 const parts={},N=structNotes(q,f);keys.forEach(k=>{const p=raw.parts&&raw.parts[k];parts[k]=p&&typeof p.note==='string'?{status:p.status==='good'?'good':'fix',note:p.note}:{status:N[k][0],note:N[k][1]}});
 const used={},edits=[];(Array.isArray(raw.edits)?raw.edits:[]).slice(0,14).forEach(e=>{if(!e||!keys.includes(e.part)||typeof e.find!=='string'||!e.find)return;const txt=f[e.part]||'';const from=used[e.part+'|'+e.find]||0;const at=txt.indexOf(e.find,from);if(at<0)return;used[e.part+'|'+e.find]=at+e.find.length;
  edits.push({part:e.part,at,find:e.find,rep:typeof e.replace==='string'?e.replace:'',kind:KIND[e.kind]?e.kind:'concise',why:String(e.why||'').slice(0,140)})});
 const keep=[];keys.forEach(k=>{let end=-1;edits.filter(e=>e.part===k).sort((a,b)=>a.at-b.at).forEach(e=>{if(e.at>=end){keep.push(e);end=e.at+e.find.length}})});
 const strong=raw.strong&&typeof raw.strong==='object'&&keys.every(k=>typeof raw.strong[k]==='string')?raw.strong:null;
 return {src:'claude',verdict,summary:String(raw.summary||'').slice(0,300),parts,edits:keep.map((e,i)=>Object.assign(e,{id:'e'+i})),strong,fixed:null,whyStrong:Array.isArray(raw.why_strong)?raw.why_strong.slice(0,3).map(String):[]};
}

/* ---------- answers ---------- */
function ensureAns(id,q){S.answers=S.answers||{};if(!S.answers[id])S.answers[id]=q.kind==='tech'?{tech:''}:{fields:{}};return S.answers[id]}
function qStatus(id){const a=S.answers&&S.answers[id];if(!a)return['Not started','muted'];const n=a.tech!=null?wc(a.tech):Object.values(a.fields||{}).reduce((s,v)=>s+wc(v),0);if(!n)return['Not started','muted'];
 if(a.fb&&!a.fb.stale)return a.fb.verdict==='strong'?['Strong','good']:a.fb.verdict==='getting_there'?['Getting there','accent']:['Needs work','warn'];return['Draft','muted']}
function liveHints(d,v){const out=[],n=wc(v);if(!n)return '';
 if(n<d.target[0])out.push(['warn',`A bit short. Aim for ${d.target[0]}+ words.`]);else if(n>d.target[1])out.push(['warn',`Running long. Aim for under ${d.target[1]}.`]);
 const we=(v.match(/\bwe\b/gi)||[]).length;if(d.k==='a'&&we)out.push(['warn',`“We” ${we}×. Say what you did.`]);
 if(d.k==='r'&&!/\d/.test(v))out.push(['warn','Add a number.']);
 if(/\[[^\]]*\]/.test(v))out.push(['warn','Fill in the [brackets].']);
 const ed=ruleEdits(v,d.k).length;if(ed)out.push(['warn',`${ed} quick ${pl(ed,'fix','fixes')} found`]);
 if(!out.length)out.push(['ok','Looks good']);
 return out.map(([c,t])=>`<span class="lh ${c}">${esc(t)}</span>`).join('');}
const wcClass=(d,n)=>!n?'':n<d.target[0]?'':n>d.target[1]?'over':'ok';

function markHTML(text,edits,scope){
 if(!text)return '<i class="muted">Empty</i>';let out='',pos=0;
 edits.slice().sort((a,b)=>a.at-b.at).forEach(e=>{if(e.at<pos||text.substr(e.at,e.find.length)!==e.find)return;out+=esc(text.slice(pos,e.at));
  const ph=e.rep&&/^\[[^\]]*\]\s?$/.test(e.rep);
  out+=`<span class="mk k-${KIND[e.kind]?KIND[e.kind][1]:'verb'}${ui.mkOn===scope+e.id?' on':''}" role="button" tabindex="0" data-a="mk" data-id="${scope}${e.id}"><s>${esc(e.find)}</s>${e.rep?`<ins class="${ph?'ph':''}">${esc(e.rep.trim())}</ins>`:''}</span>`;pos=e.at+e.find.length});
 return out+esc(text.slice(pos));}
function sugCard(e,scope,acc,dis){const k=KIND[e.kind]||KIND.verb;
 return `<div class="sug k-${k[1]}${ui.mkOn===scope+e.id?' on':''}" id="sug-${scope}${e.id}"><span class="sug-k">${k[0]}</span>
 <p class="sug-d"><s>${esc(e.find.trim())}</s> → ${e.rep?`<ins>${esc(e.rep.trim())}</ins>`:'<i class="muted">remove</i>'}</p>
 ${e.alt?`<div class="alts">${e.alt.map(x=>`<button class="alt${x.toLowerCase()===String(e.rep).toLowerCase()?' on':''}" data-a="mkAlt" data-id="${scope}${e.id}" data-v="${esc(x)}">${esc(x)}</button>`).join('')}</div>`:''}
 <p class="sug-why">${esc(e.why)}</p><div class="sug-b"><button class="btn sm primary" data-a="${acc}" data-id="${scope}${e.id}">Accept</button><button class="btn sm" data-a="${dis}" data-id="${scope}${e.id}">Dismiss</button></div></div>`}

/* ---------- interviews ---------- */
function coList(){const seen=new Set(),out=[];S.apps.slice().sort((a,b)=>(b.reached-a.reached)||(a.applied<b.applied?1:-1)).forEach(a=>{if(!seen.has(a.co)){seen.add(a.co);out.push(a)}});return out}
function techFor(kw){const ids=(TECHQ[S.profile.role]||[]).slice();const list=ids.map(qFind);
 if(kw&&kw.length){const covered=new Set(list.map(q=>q.skill));kw.forEach(k=>{if(!covered.has(k))list.push(kwQ(k))});
  list.sort((a,b)=>(kw.includes(b.skill)?1:0)-(kw.includes(a.skill)?1:0))}return list}
function vInterviews(){
 if(ui.prep)return vPrep();
 const dx=diagnose(),role=R();if(ui.icomp===undefined)ui.icomp=dx.upcoming[0]?dx.upcoming[0].co:'';
 const co=ui.icomp,app=co?coList().find(a=>a.co===co):null,kw=app&&app.kw||[];
 const tab=ui.itab2||'beh';
 const L={beh:[...(co?[whyQ(co)]:[]),...BEH.map(b=>qFind(b.id))],role:(ROLEQ[S.profile.role]||[]).map(r=>qFind(r.id)),tech:techFor(kw)};
 const T=[['beh','Behavioral',L.beh.length],['role','Role-specific',L.role.length],['tech','Technical',L.tech.length],['mine','Your interviews',dx.upcoming.length+S.debriefs.length]];
 const row=q=>{const[s,c]=qStatus(q.id),inP=q.kind==='tech'&&kw.includes(q.skill);return `<button class="li" data-a="openQ" data-id="${esc(q.id)}"><span class="li-main"><b>${esc(q.kind==='tech'?q.skill:q.type)}</b><small class="qq">${esc(q.q)}</small></span>${inP?pill('In posting','accent'):''}${pill(s,c)}${chev(false)}</button>`};
 let body='';
 if(tab==='mine'){
  const respApps=S.apps.filter(a=>a.reached>=1);
  body=`${dx.upcoming.map(a=>`<div class="card"><div class="sec-h"><h3>${esc(a.co)}</h3>${pill(fmtDay(a.interviewDate),'accent')}</div><p class="muted small">${esc(a.title)}</p>${a.notes?`<p class="small">${esc(a.notes)}</p>`:''}<button class="link small" data-a="pickCo" data-v="${esc(a.co)}">Practice for ${esc(a.co)} →</button></div>`).join('')}
  <div class="sec-h" style="margin-top:6px"><h2>Debriefs</h2><button class="btn sm primary" data-a="newDebrief" ${respApps.length?'':'disabled'}>Log a debrief</button></div>
  ${S.debriefs.length?S.debriefs.slice().reverse().map(d=>{const a=appById(d.appId);return `<div class="card"><div class="sec-h"><h3>${esc(a?a.co:'Interview')} · ${esc(d.type)}</h3>${pill(RATING[d.rating],d.rating<=2?'warn':'good')}</div><p class="small muted">${fmtDay(d.date)}</p>${d.questions.length?`<ul class="qlist">${d.questions.map(q=>`<li>${esc(q)}</li>`).join('')}</ul>`:''}${d.struggled?`<p class="small"><b>Struggled with:</b> ${esc(d.struggled)}</p>`:''}</div>`}).join(''):'<p class="muted">After each screen or interview, write down what they asked and what was hard. SPLIT uses it to plan your prep.</p>'}`;
 }else{
  const list=L[tab],done=list.filter(q=>qStatus(q.id)[0]!=='Not started').length,strong=list.filter(q=>qStatus(q.id)[0]==='Strong').length;
  const intro={beh:'Questions every interviewer asks. Write one strong STAR answer for each.',role:`Behavioral questions ${role.short} interviewers ask most.`,tech:co&&kw.length?`Matched to the ${co} posting first.`:`Common technical questions for ${role.short} roles.`}[tab];
  body=`<p class="muted small">${intro} ${done} of ${list.length} started${strong?` · ${strong} strong`:''}.</p><div class="list">${list.map(row).join('')}</div>`;
 }
 const cos=coList();
 return `<div class="wrap narrow"><h1 class="h-page">Interviews</h1>
 <label class="co-pick" for="ip-co"><span>Practicing for</span><select id="ip-co"><option value="">Any company</option>${cos.map(a=>`<option value="${esc(a.co)}" ${a.co===co?'selected':''}>${esc(a.co)}${a.reached>=2?' · interview':''}</option>`).join('')}</select></label>
 ${co&&app?`<div class="co-card">${ico('applications','sm')}<div><b>${esc(co)}</b><small>${esc(app.title)} · ${esc(statusOf(app)[0])}</small></div><p class="small">${kw.length?`Technical questions are matched to this posting: ${esc(join(kw))}. A “Why ${esc(co)}?” question is added to Behavioral.`:`Paste the job description into this application and SPLIT will match technical questions to it.`} <button class="link small" data-a="openApp" data-id="${app.id}">Open application</button></p></div>`:''}
 <div class="seg tabs" role="tablist" style="margin-top:18px">${T.map(([k,l,n])=>`<button class="${tab===k?'on':''}" data-a="itab2" data-v="${k}" role="tab" aria-selected="${tab===k}">${l} <span>${n}</span></button>`).join('')}</div>
 <div class="stack">${body}</div></div>`;
}
function vPrep(){
 const q=qFind(ui.prep);if(!q){ui.prep=null;return vInterviews()}
 const a=ensureAns(q.id,q);if(q.kind==='tech')return vTech(q,a);
 const defs=fieldsOf(q),f=a.fields,fb=a.fb,tab=ui.ptab||'write',empty=!defs.some(d=>f[d.k]),busy=ui.checking===q.id;
 const head=`<button class="back" data-a="prepBack">← All questions</button><div class="eyebrow">${esc(q.cat)} · ${esc(q.type)}</div><h1 class="h-page">${esc(q.q)}</h1><p class="muted lead">${esc(q.look)}</p>
 <div class="seg tabs" role="tablist" style="margin-top:18px"><button class="${tab==='write'?'on':''}" data-a="ptab" data-v="write">Write</button><button class="${tab==='fb'?'on':''}" data-a="ptab" data-v="fb" ${fb?'':'disabled'}>Feedback${fb&&fb.edits.length?` <span>${fb.edits.length}</span>`:''}</button><button class="${tab==='ex'?'on':''}" data-a="ptab" data-v="ex">Strong example</button></div>`;
 let body='';
 if(tab==='write'){
  body=`<details class="guide"${empty?' open':''}><summary>${ico('spark','sm')}How to write a strong answer</summary><ul>${GUIDE.map(g=>`<li>${esc(g)}</li>`).join('')}</ul>${q.pick?`<p class="small"><b>Pick a story:</b> ${esc(q.pick)}</p>`:''}</details>
  <div class="fields">${defs.map(d=>{const v=f[d.k]||'',n=wc(v);return `<div class="fld"><div class="fld-h"><label class="fld-l" for="qf-${d.k}"><b class="fld-k">${d.short}</b>${esc(d.label)}</label><span class="wcount ${wcClass(d,n)}" id="qc-${d.k}">${n} / ${d.target[0]}–${d.target[1]} words</span></div>
   <p class="fld-hint">${esc(d.hint)}</p><div class="starters">${d.starters.map(s=>`<button class="starter" data-a="starter" data-k="${d.k}" data-v="${esc(s)}">${esc(s)}…</button>`).join('')}</div>
   <textarea id="qf-${d.k}" data-qf="${d.k}" rows="${d.k==='a'?5:3}">${esc(v)}</textarea><div class="live" id="qh-${d.k}">${liveHints(d,v)}</div></div>`}).join('')}</div>
  <div class="check-bar"><button class="btn primary" data-a="checkAns" ${busy||empty?'disabled':''}>${busy?'Checking…':'Check my answer'}</button>${busy?'<span class="thinking">Reviewing your answer</span>':`<span class="small muted">${canAI()?'Claude reviews it if you allow it. Otherwise a quick check runs here.':'A quick check runs right here in your browser.'}</span>`}</div>`;
 }else if(tab==='fb'&&fb){
  const cur=a.fields,stale=fb.stale;
  const cards=fb.edits.map(e=>sugCard(e,'',`mkAccept`,`mkDismiss`)).join('');
  const strongTxt=fb.strong||null;
  body=`<div class="verdict v-${fb.verdict}"><div><span class="eyebrow">${fb.src==='claude'?'Reviewed by Claude':'Quick check'}</span><h2>${VLABEL[fb.verdict]}</h2><p>${esc(fb.summary)}</p></div><div class="pparts">${defs.map(d=>`<span class="pp ${fb.parts[d.k].status}" title="${esc(d.label)}: ${esc(fb.parts[d.k].note)}">${d.short}</span>`).join('')}</div></div>
  ${fb.note?`<p class="small muted" style="margin-top:8px">${esc(fb.note)}</p>`:''}
  ${stale?`<div class="notice-plain">You changed your answer after this check. <button class="link small" data-a="checkAns">Check again</button></div>`:''}
  <div class="fbgrid"><div class="doc">${defs.map(d=>`<div class="doc-part"><div class="doc-h"><b>${esc(d.label)}</b>${pill(fb.parts[d.k].status==='good'?'Good':'Fix','good'===fb.parts[d.k].status?'good':'warn')}</div><p class="doc-t">${stale?esc(cur[d.k]||''):markHTML(cur[d.k]||'',fb.edits.filter(e=>e.part===d.k),'')}</p><p class="doc-note">${esc(fb.parts[d.k].note)}</p></div>`).join('')}</div>
  <aside class="sugs"><div class="sugs-h"><b>${fb.edits.length} ${pl(fb.edits.length,'suggestion')}</b>${fb.edits.length&&!stale?'<button class="link small" data-a="mkAll">Accept all</button>':''}</div>${stale?'<p class="small muted">Check again to see suggestions for your new text.</p>':cards||'<p class="small muted">No line edits left. Check the notes on each part.</p>'}</aside></div>
  <section class="sec" style="margin-top:30px"><h2>Yours vs. ${strongTxt?'your story, rewritten':'a strong example'}</h2>
   ${strongTxt?'':'<p class="small muted">Here’s a strong answer to the same question from a different story. Compare how each part is built.</p>'}
   <div class="cmps">${defs.map(d=>`<div class="cmp"><div class="cmp-l"><span class="eyebrow">${esc(d.label)} · yours</span><p>${esc(cur[d.k]||'')||'<i class="muted">Empty</i>'}</p></div><div class="cmp-r"><span class="eyebrow">${esc(d.label)} · strong</span><p>${esc((strongTxt||q.ex)[d.k]||'')}</p></div><p class="cmp-why"><b>${fb.parts[d.k].status==='good'?'✓':'Fix'}:</b> ${esc(fb.parts[d.k].note)}</p></div>`).join('')}</div>
   ${(fb.whyStrong&&fb.whyStrong.length?fb.whyStrong:q.why||[]).length?`<div class="card flat"><h3>Why the strong version works</h3><ul>${(fb.whyStrong&&fb.whyStrong.length?fb.whyStrong:q.why).map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>`:''}</section>
  <div class="check-bar"><button class="btn" data-a="ptab" data-v="write">Edit answer</button><button class="btn primary" data-a="checkAns" ${busy?'disabled':''}>${busy?'Checking…':'Check again'}</button>${busy?'<span class="thinking">Reviewing your answer</span>':''}</div>`;
 }else{
  body=`<div class="ex">${defs.map(d=>`<div class="doc-part"><div class="doc-h"><b>${esc(d.label)}</b></div><p class="doc-t">${esc(q.ex[d.k]||'')}</p></div>`).join('')}</div>
  <div class="card flat" style="margin-top:16px"><h3>Why it works</h3><ul>${(q.why||[]).map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>
  <p class="small muted" style="margin-top:12px">Use the structure, not the story. Interviewers can tell when an answer isn’t yours.</p>`;
 }
 return `<div class="wrap narrow prep">${head}<div class="stack" style="margin-top:6px">${body}</div></div>`;
}
function vTech(q,a){
 const fb=a.fb,busy=ui.checking===q.id,co=ui.icomp,app=co?coList().find(x=>x.co===co):null,inP=app&&(app.kw||[]).includes(q.skill);
 const cov=fb?fb.covered:[];
 return `<div class="wrap narrow prep"><button class="back" data-a="prepBack">← All questions</button><div class="eyebrow">Technical · ${esc(q.skill)}${inP?` · in the ${esc(co)} posting`:''}</div><h1 class="h-page">${esc(q.q)}</h1>
 <div class="stack" style="margin-top:18px"><details class="guide"><summary>${ico('spark','sm')}Hint</summary><p style="margin-top:8px">${esc(q.hint)}</p></details>
 <div class="fld"><div class="fld-h"><label class="fld-l" for="tq">Your answer</label><span class="wcount" id="tq-c">${wc(a.tech)} words</span></div>
 <textarea id="tq" data-tq="1" class="${q.code?'mono-ta':''}" rows="7" placeholder="${q.code?'Write the query, then a sentence on how it works.':'Write it the way you’d say it out loud.'}">${esc(a.tech||'')}</textarea></div>
 <div class="check-bar"><button class="btn primary" data-a="checkTech" ${busy||!wc(a.tech)?'disabled':''}>${busy?'Comparing…':'Compare to a strong answer'}</button>${busy?'<span class="thinking">Reviewing your answer</span>':''}</div>
 ${fb?`<div class="verdict v-${fb.verdict}"><div><span class="eyebrow">${fb.src==='claude'?'Reviewed by Claude':'Quick check'}</span><h2>${cov.length} of ${q.points.length} key points</h2><p>${esc(fb.summary)}</p></div></div>${fb.note?`<p class="small muted">${esc(fb.note)}</p>`:''}${fb.stale?'<div class="notice-plain">You changed your answer after this check. <button class="link small" data-a="checkTech">Compare again</button></div>':''}
 <ul class="kp">${q.points.map((p,i)=>`<li class="${cov.includes(i)?'ok':'miss'}"><span class="kp-i">${cov.includes(i)?'✓':'✕'}</span>${esc(p[0])}</li>`).join('')}</ul>
 ${fb.improved?`<div class="card flat"><h3>Your answer, improved</h3><div class="pre ${q.code?'code':''}">${esc(fb.improved)}</div></div>`:''}
 <div class="card flat"><h3>A strong answer</h3><div class="pre ${q.code?'code':''}">${esc(q.ans)}</div></div>`:''}</div></div>`;
}

/* ---------- resume ---------- */
const SEC_RE=/^(education|experience|work experience|professional experience|relevant experience|projects|academic projects|leadership|leadership experience|activities|involvement|skills|technical skills|certifications|awards|honors)\b[:\s]*$/i;
const BUL_RE=/^([•\-\*–▪●◦·‣■□➢►]\s*)/;
function resumeAnalysis(){
 if(!S.resume||!S.resume.text)return null;
 const text=S.resume.text,raw=text.split('\n'),role=R(),bullets=[];let sec='',cur=null;const secs=new Set();
 raw.forEach(line=>{const t=line.trim();if(!t){cur=null;return}
  if(SEC_RE.test(t)&&t.length<40){sec=t.toLowerCase();secs.add(sec.split(' ').pop()==='experience'?'experience':sec.split(/\s/)[0]);cur=null;return}
  const m=t.match(BUL_RE);
  if(m){cur={raw:line,prefix:line.slice(0,line.indexOf(t))+m[1],body:t.slice(m[1].length).trim()};bullets.push(cur);return}
  if(cur&&/^[a-z(]/.test(t)){cur.raw+='\n'+line;cur.body+=' '+t;return}
  cur=null;
 });
 if(bullets.length<2){let s='';raw.forEach(line=>{const t=line.trim();if(SEC_RE.test(t)){s=t.toLowerCase();return}if(/experience|project|leadership|activit|involve/.test(s)&&wc(t)>=7&&t.length<=260&&!/\b(19|20)\d{2}\b/.test(t))bullets.push({raw:line,prefix:line.slice(0,line.indexOf(t)),body:t})})}
 const dis=new Set(S.resume.dismissed||[]),ai=S.resume.over||{};
 const extra=[{k:'own',re:/(^|\s)(?:I|my|me)\b\s*/g,fn:m=>({at:m.index+m[1].length,find:m[0].slice(m[1].length),rep:''}),why:'Resumes leave out “I” and “my”.'},
  {k:'verb',re:/^(?:Responsible for|In charge of|Duties included|Tasked with)\s+(?:(\w+ing)\b)?/i,fn:m=>{const b=m[1]&&baseOf(m[1]);return b?{rep:capF(past(b))}:{rep:'Managed ',alt:['Managed ','Owned ','Led ','Ran ']}},why:'Starts with a duty. Start with what you did.'}];
 bullets.forEach((b,i)=>{b.i=i;let ed;if(ai[b.body])ed=ai[b.body].map(e=>Object.assign({},e));else ed=ruleEdits(b.body,'b',extra);
  ed=ed.filter(e=>b.body.substr(e.at,e.find.length)===e.find&&!dis.has(b.body+'|'+e.find)).map((e,j)=>Object.assign(e,{id:`${i}-${j}`}));
  b.edits=ed;b.notes=[];if(!/\d/.test(b.body))b.notes.push('No number. Add how many, how much, or how often.');if(wc(b.body)>32)b.notes.push('Long. Keep bullets to one or two lines.');
  b.issues=ed.length+b.notes.length;b.fixed=applyAll(b.body,ed)});
 const skills=role.skills.map(s=>{const re=SYN[s.name];let ev='';if(re&&re.test(text)){const ln=raw.find(l=>re.test(l));ev=(ln||'').trim().replace(BUL_RE,'')}return{name:s.name,pct:s.pct,found:!!ev,ev}});
 const tot=skills.reduce((n,s)=>n+s.pct,0),got=skills.filter(s=>s.found).reduce((n,s)=>n+s.pct,0),match=tot?Math.round(got/tot*100):0;
 const words=wc(text),withNum=bullets.filter(b=>/\d/.test(b.body)).length;
 const has=k=>[...secs].some(s=>s.startsWith(k));
 const checks=[['Email address',/@[\w.-]+\.\w+/.test(text)],['Phone number',/\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/.test(text)],['LinkedIn or GitHub link',/linkedin\.com|github\.com/i.test(text)],['Education section',has('education')],['Experience or projects section',has('experience')||has('projects')||has('relevant')||has('academic')],['Skills section',has('skills')||has('technical')],[`Fits on one page (${words} words)`,words<=650],[`Bullets with a number: ${withNum} of ${bullets.length}`,bullets.length>0&&withNum/bullets.length>=0.5]];
 return {bullets,skills,match,checks,words};
}
let pdfP=null,mamP=null;const PDFJS='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/',MAM='https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js';
const loadScript=src=>new Promise((res,rej)=>{const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=()=>rej(new Error('load'));document.head.appendChild(s)});
async function readResumeFile(file){
 const name=file.name||'',ext=(name.split('.').pop()||'').toLowerCase();
 if(ext==='pdf'||file.type==='application/pdf'){
  pdfP=pdfP||loadScript(PDFJS+'pdf.min.js').then(()=>loadScript(PDFJS+'pdf.worker.min.js')).then(()=>{window.pdfjsLib.GlobalWorkerOptions.workerSrc=PDFJS+'pdf.worker.min.js'});
  await pdfP;const pdf=await window.pdfjsLib.getDocument({data:new Uint8Array(await file.arrayBuffer())}).promise;let out='';
  for(let p=1;p<=Math.min(pdf.numPages,6);p++){const pg=await pdf.getPage(p),c=await pg.getTextContent();let lastY=null;
   c.items.forEach(it=>{const y=it.transform?Math.round(it.transform[5]):null;if(lastY!==null&&y!==null&&Math.abs(y-lastY)>2&&!out.endsWith('\n'))out+='\n';out+=it.str;if(it.hasEOL)out+='\n';lastY=y});out+='\n'}
  return out.replace(/[ \t]+\n/g,'\n').replace(/\n{3,}/g,'\n\n');
 }
 if(ext==='docx'){mamP=mamP||loadScript(MAM);await mamP;const r=await window.mammoth.extractRawText({arrayBuffer:await file.arrayBuffer()});return r.value}
 if(['txt','md','text'].includes(ext)||/^text\//.test(file.type))return await file.text();
 throw new Error('type');
}
const rHolder=ctx=>ctx==='ob'?ui.flow&&ui.flow.draft:(ui.rd=ui.rd||{});
function resumeInput(ctx){const h=rHolder(ctx)||{},m=(ui.rmsg||{})[ctx];
 return `<div class="drop" data-drop="${ctx}">${ico('resume','lg')}<b>${h.resume?`${esc(h.resumeName||'Resume')} added`:'Drop your resume here'}</b><small>PDF, Word (.docx), or a text file</small>
 <input type="file" id="rf-${ctx}" accept=".pdf,.docx,.txt,.md,application/pdf" data-rfile="${ctx}" class="vh"><label for="rf-${ctx}" class="btn sm blue">${h.resume?'Replace file':'Choose file'}</label></div>
 ${m?`<p class="rmsg ${m.k}" id="rmsg-${ctx}">${esc(m.t)}</p>`:`<p class="rmsg" id="rmsg-${ctx}" hidden></p>`}
 <details class="more"${h.resume&&h.resumeName==='Pasted text'?' open':''}><summary>Or paste the text</summary><div class="more-b"><textarea class="ta" id="rp-${ctx}" data-rpaste="${ctx}" rows="7" placeholder="Paste your resume text here">${h.resumeName==='Pasted text'?esc(h.resume):''}</textarea></div></details>`}
async function handleResumeFile(file,ctx){if(!file)return;ui.rmsg=ui.rmsg||{};ui.rmsg[ctx]={k:'busy',t:`Reading ${file.name}…`};rerenderResumeInput(ctx);
 try{const text=await readResumeFile(file);if(wc(text)<40)throw new Error(/pdf$/i.test(file.name)?'scan':'short');
  if(ctx==='rs'){S.resume={text,name:file.name,added:TODAY,dismissed:[],ai:null,over:{}};ui.rmsg[ctx]=null;ui.overlay=null;save();render();toast('Resume added. Skills updated.');return}
  const h=rHolder(ctx);h.resume=text;h.resumeName=file.name;h.prefilled=false;const n=detectSkills(text,h.role).length;ui.rmsg[ctx]={k:'ok',t:`Read ${file.name}: ${wc(text)} words, ${n} ${pl(n,'skill')} found.`};render();
 }catch(e){ui.rmsg[ctx]={k:'err',t:e&&e.message==='scan'?'This PDF has no readable text (it may be a scanned image). Paste the text instead.':e&&e.message==='type'?'That file type isn’t supported. Use a PDF, .docx, or text file, or paste the text.':'Couldn’t read that file. Try a PDF or .docx, or paste the text below.'};rerenderResumeInput(ctx)}}
function rerenderResumeInput(ctx){if(ctx==='ob'&&ui.flow)render();else if(ui.overlay&&ui.overlay.type==='resume')renderOverlay();else renderMain()}
const detectSkills=(text,role)=>(ROLES[role||S&&S.profile.role||'da']||ROLES.da).skills.filter(s=>SYN[s.name]&&SYN[s.name].test(text||'')).map(s=>s.name);
function vResume(){
 const role=R();
 if(!S.resume)return `<div class="wrap narrow"><h1 class="h-page">Resume</h1><p class="muted lead">Add your resume and SPLIT checks it against ${esc(role.name)} postings: which skills show up, which are missing, and which bullets could be stronger.</p><div class="stack" style="margin-top:22px">${resumeInput('rs')}<div><button class="btn primary" data-a="rsSave" id="rs-save" ${ui.rd&&ui.rd.resume?'':'disabled'}>Save resume</button></div></div></div>`;
 const A=resumeAnalysis(),found=A.skills.filter(s=>s.found),miss=A.skills.filter(s=>!s.found).sort((a,b)=>b.pct-a.pct);
 const weak=A.bullets.filter(b=>b.issues),busy=ui.checking==='resume';
 const brow=b=>{const open=!!ui.rb[b.i];return `<div class="sk2${open?' open':''}${oc('rb'+b.i)}"><button class="sk2-h" data-a="rbOpen" data-i="${b.i}" aria-expanded="${open}"><span class="bl-t">${esc(b.body)}</span>${b.issues?pill(`${b.issues} ${pl(b.issues,'fix','fixes')}`,'warn'):pill('Strong','good')}${chev(open)}</button>
  ${open?`<div class="sk2-more" style="padding-left:16px"><p class="doc-t">${markHTML(b.body,b.edits,'r'+b.i+':')}</p>${b.notes.map(n=>`<p class="lh warn" style="align-self:flex-start">${esc(n)}</p>`).join('')}
  ${b.edits.length?`<div class="sugs-in">${b.edits.map(e=>sugCard(e,'r'+b.i+':','rbAccept','rbDismiss')).join('')}</div>`:''}
  ${b.edits.length?`<div class="kv"><b>With all fixes</b><span>${esc(b.fixed)}</span></div>`:''}
  <div><button class="btn sm" data-a="rbCopy" data-i="${b.i}">Copy ${b.edits.length?'improved ':''}bullet</button></div></div>`:''}</div>`};
 return `<div class="wrap narrow"><div class="page-h"><div><h1 class="h-page">Resume</h1><p class="muted">${esc(S.resume.name||'Your resume')} · added ${fmt(S.resume.added)}</p></div><button class="btn" data-a="rsReplace">Replace</button></div>
 <div class="match"><div class="match-n" data-count="${A.match}" data-suffix="%">${A.match}%</div><div><b>Skill match for ${esc(role.name)} postings</b><small class="muted">${found.length} of ${A.skills.length} skills these postings ask for are on your resume, weighted by how often they’re asked for.</small>${bar(A.match,'good')}</div></div>
 <section class="sec" style="margin-top:28px"><h2>Skills</h2>
  <div class="kv"><b>On your resume</b><div class="chips2">${found.map(s=>`<span class="sc have" title="${esc(s.ev)}">✓ ${esc(s.name)}</span>`).join('')||'<span class="muted small">None of the top skills yet.</span>'}</div></div>
  <div class="kv"><b>Missing</b><div class="chips2">${miss.map(s=>`<button class="sc ${skillStatus(s.name)==='missing'?'know':'miss'}" data-a="toSkill" data-n="${esc(s.name)}">${esc(s.name)} <small>${s.pct}%</small></button>`).join('')}</div><small class="muted">${miss.some(s=>skillStatus(s.name)==='missing')?'Orange: you said you know it, but it isn’t on your resume. ':''}Tap a skill to see how to build or show it.</small></div></section>
 <section class="sec"><div class="sec-h"><h2>Bullets</h2><span class="muted small">${weak.length} of ${A.bullets.length} could be stronger</span></div>
  ${canAI()?`<div class="check-bar" style="margin-top:0"><button class="btn blue sm" data-a="rsAI" ${busy?'disabled':''}>${busy?'Reviewing…':S.resume.ai?'Review again with Claude':'Get Claude’s line-by-line review'}</button>${busy?'<span class="thinking">Reading your bullets</span>':S.resume.ai?'<span class="small muted">Showing Claude’s suggestions.</span>':''}</div>`:''}
  ${S.resume.ai&&S.resume.ai.summary?`<p class="small">${esc(S.resume.ai.summary)}</p>`:''}
  ${A.bullets.length?`<div class="list">${A.bullets.map(brow).join('')}</div>`:'<p class="muted">SPLIT couldn’t find bullet points. Make sure each one starts on its own line with a bullet (•).</p>'}</section>
 <section class="sec"><h2>Checks</h2><ul class="checks">${A.checks.map(([t,ok])=>`<li class="${ok?'ok':'miss'}"><span class="kp-i">${ok?'✓':'✕'}</span>${esc(t)}</li>`).join('')}</ul></section></div>`;
}
function ovResume(){return drawer('Replace resume','Resume',`<div class="stack">${resumeInput('rs')}</div>`,`<button class="btn sm danger" data-a="rsRemove">Remove resume</button><button class="btn primary" data-a="rsSave" id="rs-save" ${ui.rd&&ui.rd.resume?'':'disabled'}>Save</button>`)}


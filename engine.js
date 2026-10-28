/* SPLIT — saved state, diagnosis, weekly planner, and check-ins */
'use strict';
/* ---------- state ---------- */
const LS='split.app.v2';
let S;
const ui={view:'week',filter:'all',why:{},cause:{},skill:{},overlay:null,newApp:null,confirm:null,err:''};
function save(){try{localStorage.setItem(LS,JSON.stringify(S))}catch(e){}}
function load(){try{const r=localStorage.getItem(LS);if(r){const s=JSON.parse(r);if(s&&(s.v===2||s.v===3)&&s.profile){S=s;if(S.v===2){S.answers={};(S.stories||[]).forEach(st=>{const id=lc((st.tags||[])[0]||'');if(BEH.some(b=>b.id===id)&&!S.answers[id])S.answers[id]={fields:{s:st.s||'',t:st.t||'',a:st.a||'',r:st.r||''}}});S.resume=null;S.v=3}S.answers=S.answers||{};return}}}catch(e){}S=null}
const R=()=>ROLES[S.profile.role]||ROLES.da;
const roleSkill=n=>R().skills.find(s=>s.name===n)||{name:n,pct:0,focus:'practice',res:'',project:''};
const appById=id=>S.apps.find(a=>a.id===id);

function seed(){
 const cur=mondayOf(TODAY),W=[addD(cur,-21),addD(cur,-14),addD(cur,-7),cur];
 const apps=[];
 const A=(w,d,co,title,age,o={})=>{const dd=Math.min(d,Math.max(0,diffD(TODAY,W[w])));const applied=addD(W[w],dd);apps.push(Object.assign({id:uid(),co,title,url:searchUrl(co,title),applied,posted:age==null?'':addD(applied,-age),tailored:false,referral:false,reached:0,closed:false,week:W[w],notes:'',kw:[],jd:'',interviewDate:''},o))};
 A(0,0,'Dell Technologies','Data Analyst Intern',21,{kw:['SQL','Excel','Tableau','Python'],closed:true});
 A(0,0,'AT&T','Business Data Analyst Intern',17);
 A(0,1,'Charles Schwab','Data Analytics Intern',26,{kw:['SQL','Excel','Power BI'],closed:true});
 A(0,1,'Texas Instruments','Data Analyst Intern',12);
 A(0,2,'Oracle','Data Analyst Intern',30,{closed:true});
 A(0,2,'Visa','Data Analytics Intern',19);
 A(0,3,'H-E-B','Analytics Intern',14);
 A(0,3,'Expedia Group','Data Analyst Intern',23,{closed:true});
 A(0,4,'Deloitte','Analytics & Cognitive Intern',11);
 A(0,4,'Toyota Financial Services','Data Analyst Intern',16);
 A(0,5,'Tesla','Data Analyst Intern',9,{closed:true});
 A(0,5,'Samsung Austin Semiconductor','Data Analyst Intern',22);
 A(0,6,'Whole Foods Market','Business Analyst Intern',18);
 A(0,6,'Workday','Data Analyst Intern',13);
 A(0,6,'Bumble','Data Analyst Intern',28);
 A(1,0,'Indeed','Data Analyst Intern',3,{tailored:true,reached:1,closed:true,kw:['SQL','Python','A/B testing','Statistics'],notes:'Recruiter screen, then a rejection email two days later.'});
 A(1,1,'Q2','Data Analyst Intern',5,{kw:['SQL','Excel','Communication']});
 A(1,1,'Hilton','Revenue Analytics Intern',15);
 A(1,2,'Paycom','Data Analyst Intern',2,{tailored:true});
 A(1,3,'7-Eleven','Data Analyst Intern',18);
 A(1,3,'Frost Bank','Data Analyst Intern',6);
 A(1,4,'Zillow','Data Analyst Intern',14);
 A(1,5,'Spectrum','Data Analyst Intern',25);
 A(1,6,'Apple','Data Analyst Intern',12);
 A(2,0,'Capital One','Data Analyst Intern',4,{tailored:true,referral:true,reached:2,interviewDate:addD(TODAY,4),kw:['SQL','Python','Statistics','Excel'],notes:'Referral from a UT alum on the card analytics team. First-round interview: one SQL exercise plus behavioral.'});
 A(2,1,'USAA','Data Analyst Intern',2,{tailored:true,reached:1,kw:['SQL','Tableau','Excel'],notes:'Online assessment invite (SQL + Excel).'});
 A(2,2,'Nike','Data Analyst Intern',6,{tailored:true});
 A(2,3,'Ally','Data Analyst Intern',3);
 A(2,4,'CrowdStrike','Data Analyst Intern',11);
 A(2,5,'Accenture','Data Analyst Intern',5,{tailored:true});
 A(3,0,'Atlassian','Data Analyst Intern',2,{tailored:true});
 A(3,1,'Cisco','Data Analyst Intern',4);
 A(3,2,'Dropbox','Data Analyst Intern',1);
 const indeed=apps.find(a=>a.co==='Indeed');
 S={v:3,sample:true,baseline:null,
  profile:{name:'Jordan Lee',school:'UT Austin',year:'Junior',major:'Statistics & Data Science',role:'da',season:'Summer 2027',hours:10,skills:['Python','R','Excel','Statistics','Communication']},
  apps,
  skillLog:{SQL:{status:'learning',hours:5,goal:12},Tableau:{status:'gap',hours:0,goal:8}},
  debriefs:[{id:uid(),appId:indeed.id,date:addD(W[1],9),type:'Recruiter screen',questions:['Walk me through your resume','Tell me about a time you used data to change a decision','Why Indeed?'],rating:2,struggled:'Didn’t have a data story ready and rambled on the second question.'}],
  answers:{
   conflict:{fields:{s:'For my SDS final project, our team of four had two weeks left when one teammate stopped replying to messages.',t:'I needed to keep the project on track without dumping his part on one person.',a:'I messaged him directly instead of in the group chat and learned he was overloaded with a job and two other projects. I split his section into two smaller pieces, took the visualization half myself, and set a check-in two days later for his half.',r:'We submitted on time and earned a 94. He finished his half and thanked me for not calling him out in front of the group.'}},
   leadership:{fields:{s:'Orientation needed 40 volunteer shifts covered in one week.',t:'I volunteered to recruit and schedule everyone.',a:'I built a sign-up sheet with a backup for every slot and sent reminders the night before each shift.',r:'All 40 shifts were covered with zero no-shows.'}},
   da1:{fields:{s:'So basically in my stats class we had a project where we had to analyze some data about campus dining.',t:'We needed to figure out stuff about when people eat.',a:'We worked on cleaning the data and I helped make some charts. We presented it to the class.',r:'It went really well and the professor liked it.'}}
  },
  resume:{name:'Jordan_Lee_Resume.pdf',added:addD(W[0],-2),dismissed:[],ai:null,over:{},text:`JORDAN LEE
Austin, TX · jordan.lee@example.com · (512) 555-0142 · linkedin.com/in/jordanlee-example

EDUCATION
The University of Texas at Austin, B.S. Statistics & Data Science, expected May 2028
GPA: 3.6 · Coursework: Regression Analysis, Data Science Lab, Probability, Databases

EXPERIENCE
Student Assistant, UT Recreational Sports, Austin, TX (Aug 2025 – Present)
• Responsible for front desk check-ins and member questions
• Helped manage weekly attendance spreadsheets in Excel for 3 facilities
• Worked on a survey of 400 members about new class times

Research Assistant, Department of Statistics (Jan 2026 – May 2026)
• Cleaned and merged survey data in R for a faculty study on student housing
• Assisted with the literature review and basically created charts for the final report

PROJECTS
Austin Rent Price Model (Python, pandas, scikit-learn)
• Built a regression model predicting rent from 4,200 listings, reducing error by 18% vs. baseline
• Worked on data cleaning and feature engineering with a team of 4

LEADERSHIP
Member, Texas Data Science Club
• Helped organize a lot of workshops for new members

SKILLS
Python (pandas), R, Excel, Statistics, Communication`},
  learned:{volume:'no_effect'},
  weeks:[
   {id:W[0],split:{apply:7,build:2,prep:1},actions:[{t:'Send 14 applications',cat:'apply',h:6,done:true},{t:'Update resume with summer job',cat:'apply',h:1,done:true},{t:'Excel: pivot tables refresher',cat:'build',h:2,done:false},{t:'Draft “Tell me about yourself”',cat:'prep',h:1,done:true}],notes:['You sent 15 applications, the most of any week. None got a response.','Volume alone didn’t move anything, so SPLIT stopped making it the focus.'],changes:['Started logging posting dates so timing could be tested.','Moved 2 hours from applying to SQL.'],tests:[]},
   {id:W[1],split:{apply:5,build:4,prep:1},actions:[{t:'Apply to 8 roles and log posting dates',cat:'apply',h:4,done:true},{t:'Tailor your resume for 2 roles',cat:'apply',h:1,done:true},{t:'SQL: Mode tutorial basics',cat:'build',h:4,done:true},{t:'Prepare for Indeed recruiter screen',cat:'prep',h:1,done:true}],notes:['Your one response (Indeed) came from an application sent 3 days after posting. It was also tailored.','One data point, so SPLIT treated it as a lead to test, not a conclusion.'],changes:['Next week tested three things: applying within 7 days, tailoring, and one referral.'],tests:[]},
   {id:W[2],split:{apply:5,build:3,prep:2},actions:[{t:'Apply to 6 roles posted in the last 7 days',cat:'apply',h:3,done:true},{t:'Tailor your resume for 4 of them',cat:'apply',h:1.5,done:true},{t:'Ask 1 person for a referral',cat:'apply',h:0.5,done:true},{t:'SQL: joins and GROUP BY',cat:'build',h:3,done:true},{t:'Write 2 STAR stories',cat:'prep',h:2,done:false}],notes:[`Too early to judge. Responses usually take 1–3 weeks, so SPLIT checks these applications at your ${fmt(addD(W[3],6))} check-in.`],changes:['Kept the 7-day rule and the referral ask.','Split tailoring into a cleaner test: tailor some fresh applications, send others as-is.'],tests:[{cause:'timing',status:'pending'},{cause:'tailoring',status:'pending'},{cause:'referral',status:'pending'}]}
  ],
  current:{id:cur,plan:null}
 };
 S.current.plan=buildPlan(diagnose());
 planActions(S.current.plan).forEach(a=>{if(a.kind==='apply_fresh'||a.kind==='skill_learn')S.current.plan.done[a.id]=true});
 save();
}

function freshState(p,b,res){
 S={v:3,sample:false,baseline:b||null,answers:{},resume:res?{text:res.text,name:res.name,added:TODAY,dismissed:[],ai:null,over:{}}:null,profile:p,apps:[],skillLog:{},debriefs:[],stories:[],learned:{},weeks:[],current:{id:mondayOf(TODAY),plan:null}};
 S.current.plan=buildPlan(diagnose());save();
}

/* ---------- diagnostic engine ---------- */
const ageAt=a=>a.posted?diffD(a.applied,a.posted):null;
const settledApp=a=>diffD(TODAY,a.applied)>=14;
const nResp=arr=>arr.filter(x=>x.reached>=1).length;
const rate=arr=>arr.length?nResp(arr)/arr.length:null;
const conf=n=>n>=12?'High':n>=4?'Medium':'Low';
function phase(){const m=parse(TODAY).getMonth();if(m>=7&&m<=10)return{k:'peak',name:'peak season for summer internships'};if(m===11||m<=1)return{k:'late',name:'the late-cycle window'};return{k:'off',name:'the off-season'}}
const skillStatus=n=>{const log=S.skillLog[n]&&S.skillLog[n].status,self=S.profile.skills.some(s=>lc(s)===lc(n));
 if(S.resume&&S.resume.text){if(SYN[n]&&SYN[n].test(S.resume.text))return 'have';if(log==='learning'||log==='gap')return log;return self?'missing':'gap'}
 if(log)return log;return self?'have':'gap'};
const resumeLine=n=>{if(!S.resume||!S.resume.text||!SYN[n])return '';const ln=S.resume.text.split('\n').find(l=>SYN[n].test(l));return ln?ln.trim().replace(/^[•\-\*–▪●◦·‣■□➢►]\s*/,''):''};

function diagnose(){
 const role=R(),apps=S.apps,B=role.bench;
 const settled=apps.filter(settledApp),recent=apps.filter(a=>!settledApp(a));
 const b=Object.assign({sent:0,replies:0,interviews:0},S.baseline||{});
 const F={a:apps.length+b.sent,r:nResp(apps)+b.replies,i:apps.filter(x=>x.reached>=2).length+b.interviews,o:apps.filter(x=>x.reached>=3).length};
 const sN=settled.length+b.sent,sR=nResp(settled)+b.replies;
 const rates={resp:sN?sR/sN:null,intv:F.r?F.i/F.r:null,offer:F.i?F.o/F.i:null};
 const stages=[
  {k:'resp',label:'Applied → Response',rate:rates.resp,bench:B.resp,n:sN,num:sR,enough:sN>=8,unit:'applications'},
  {k:'intv',label:'Response → Interview',rate:rates.intv,bench:B.intv,n:F.r,num:F.i,enough:F.r>=3,unit:'responses'},
  {k:'offer',label:'Interview → Offer',rate:rates.offer,bench:B.offer,n:F.i,num:F.o,enough:F.i>=3,unit:'interviews'}];
 let bottleneck=sN<8?'start':'ok',worst=1;
 stages.forEach(s=>{if(s.enough&&s.rate!=null){const v=s.rate*100;s.status=v<s.bench[0]?'below':v>s.bench[1]?'above':'within';const ratio=v/s.bench[0];if(ratio<worst){worst=ratio;bottleneck=s.k}}else s.status='nodata'});
 const ph=phase();
 const causes=[];
 const recentResp=recent.filter(a=>a.reached>=1);
 // 1. timing
 {let fromAns=false;const wa=settled.filter(a=>a.posted),early=wa.filter(a=>ageAt(a)<=7),late=wa.filter(a=>ageAt(a)>7);
  let score=0,ev=[],why='Applications sent soon after a posting goes up get read before the pile builds.';
  const re=rate(early)||0,rl=rate(late)||0;
  if(wa.length>=4){
   ev.push(`${late.length} of your ${wa.length} settled applications went in more than 7 days after the posting appeared. ${nResp(late)} got a response (${pct(rl)}).`);
   if(early.length){ev.push(`The ${early.length} you sent within 7 days got ${nResp(early)} (${pct(re)}).`);score=Math.max(0,re-rl)*2.2+(late.length/wa.length)*0.35;why=`Your applications sent within 7 days got a response ${pct(re)} of the time. Later ones: ${pct(rl)}.`}
   else{ev.push('None went in within 7 days of posting, so there is nothing to compare yet.');score=0.3*(late.length/wa.length)}
  }
  else if(b.timing){const m={week:[0.05,'within a week of the posting'],'2wk':[0.45,'one to two weeks after the posting goes up'],later:[0.7,'more than two weeks after the posting goes up'],unsure:[0.3,'without checking when it was posted']}[b.timing];score=m[0];ev.push(`You said you usually apply ${m[1]}.`);if(score>=0.3)ev.push('Applications that arrive after a posting has filled up are easy to miss.');why=ev.join(' ');fromAns=true}
  const rr=recentResp.filter(a=>a.posted&&ageAt(a)<=7);
  if(rr.length){ev.push(`Early sign: ${rr.length} recent ${pl(rr.length,'application')} sent within 7 days of posting already ${rr.length===1?'has':'have'} a response (${join(rr.map(a=>a.co))}).`);score+=0.15*rr.length}
  causes.push({id:'timing',stage:'resp',title:'Applying after postings are a week old',short:'you’re applying after postings are already a week old',score,conf:fromAns?'Low':conf(Math.min(early.length,late.length)+rr.length),basis:fromAns,ev,why,
   fix:'Apply within 7 days of a posting going up. Check new postings twice a week.',check:'Compares responses for applications sent within 7 days against later ones.',ok:`Most of your applications go in within a week of posting.`});}
 // 2. tailoring
 {let fromAns=false;const tl=settled.filter(a=>a.tailored),ut=settled.filter(a=>!a.tailored);let score=0,ev=[],c='Low';
  const rt=rate(tl)||0,ru=rate(ut)||0;
  if(settled.length>=4){
   ev.push(`${ut.length} of ${settled.length} settled applications used your general resume. ${nResp(ut)} got a response (${pct(ru)}).`);
   if(tl.length){ev.push(`The ${tl.length} tailored ${pl(tl.length,'one')} got ${nResp(tl)} (${pct(rt)}).`);score=Math.max(0,rt-ru)*1.6+(ut.length/settled.length)*0.25;c=conf(Math.min(tl.length,ut.length))}
   else score=0.25;
   const early=tl.filter(a=>a.posted&&ageAt(a)<=7).length;
   if(tl.length&&early/tl.length>=0.7){ev.push(`Caution: ${early===tl.length?'every':'almost every'} tailored application was also sent early, so SPLIT can’t yet tell which one made the difference.`);c='Low';score*=0.6;}
  }
  else if(b.tailor){const m={usually:[0.05,'usually'],sometimes:[0.35,'only sometimes'],rarely:[0.6,'rarely']}[b.tailor];score=m[0];ev.push(`You said you ${m[1]} change your resume for each posting.`);if(score>=0.3)ev.push('A general resume often misses the keywords a posting screens for.');fromAns=true}
  const rr=recentResp.filter(a=>a.tailored);
  if(rr.length){ev.push(`Recent: ${rr.length} tailored ${pl(rr.length,'application')} already responded.`);score+=0.1*rr.length}
  causes.push({id:'tailoring',stage:'resp',title:'Sending the same resume everywhere',short:'your resume isn’t tailored to each posting',score,conf:c,basis:fromAns,ev,why:fromAns?ev.join(' '):tl.length?`Tailored applications got a response ${pct(rt)} of the time vs ${pct(ru)} for your general resume.`:'Matching a posting’s keywords helps your resume get past the first screen.',
   fix:'Tailor your resume to the top keywords in each posting. Use Keyword match on an application to check.',check:'Compares tailored vs. untailored applications sent in the same week.',ok:'You already tailor most applications.'});}
 // 3. referral
 {const rf=apps.filter(a=>a.referral),nonS=settled.filter(a=>!a.referral);let score=0,ev=[],why;
  let fromAns=false;
  if(!rf.length&&b.referral){const m={often:[0.05,'you often apply with a referral'],few:[0.25,'you’ve used a referral a few times'],never:[0.45,'you’ve never applied with a referral']}[b.referral];score=m[0];ev.push(`You said ${m[1]}.`);if(score>=0.25)ev.push('A referral is one of the few ways to get a person, not a filter, to read your application.');why=ev.join(' ');fromAns=true}
  else if(!rf.length){score=sN>=8?0.4:0.2;ev.push(`None of your ${apps.length} applications had a referral.`);why='A referral is one of the few ways to get a person, not a filter, to read your application.'}
  else{const r=nResp(rf);ev.push(`${rf.length} ${pl(rf.length,'application')} had a referral and ${r} got a response.`);if(nonS.length)ev.push(`Without a referral, your settled response rate is ${pct(rate(nonS))}.`);
   score=Math.max(0,r/rf.length-(rate(nonS)||0))*0.9+(rf.length/Math.max(1,apps.length)<0.2?0.2:0);
   why=`${r} of your ${rf.length} referred ${pl(rf.length,'application')} got a response, compared with ${pct(rate(nonS))} without one.`;
   if(r)ev.push(`Only ${Math.round(rf.length/Math.max(1,apps.length)*100)}% of your applications use one.`);}
  causes.push({id:'referral',stage:'resp',title:'Applying without referrals',short:'almost none of your applications have a referral',score,conf:fromAns?'Low':conf(rf.length*2),basis:fromAns,ev,why,
   fix:'Ask one or two people a week at companies already on your list.',check:'Tracks responses on referred applications.',ok:'You use referrals regularly.'});}
 // 4. skills gap
 {const kwApps=apps.filter(a=>a.kw&&a.kw.length);
  const gaps=role.skills.filter(s=>s.pct>=40&&skillStatus(s.name)!=='have').map(s=>Object.assign({},s,{jd:kwApps.filter(a=>a.kw.includes(s.name)).length}));
  gaps.sort((a,b)=>(b.pct+b.jd*8)-(a.pct+a.jd*8));
  let score=0,ev=[],why='';
  if(gaps.length){const g=gaps[0];score=Math.min(kwApps.length?0.9:0.55,gaps.reduce((s,x)=>s+x.pct,0)/100*0.45)+(kwApps.length?g.jd/kwApps.length*0.4:0.1);
   gaps.slice(0,2).forEach(x=>ev.push(`${x.name} appears in ${x.pct}% of ${role.name} postings${kwApps.length?` and in ${x.jd} of the ${kwApps.length} job descriptions you checked`:''}. It’s ${skillStatus(x.name)==='learning'?'in progress, not on your resume yet':skillStatus(x.name)==='missing'?'something you know, but it isn’t on your resume':'not on your resume'}.`));
   why=`${g.name} is in ${g.pct}% of ${role.name} postings${kwApps.length?` and ${g.jd} of the ${kwApps.length} job descriptions you checked`:''}.`;}
  causes.push({id:'skills',stage:'resp',skill:gaps[0]&&gaps[0].name,title:gaps[0]?`Missing ${gaps[0].name}`:'Skill gaps',short:gaps[0]?`postings ask for ${gaps[0].name}, and it isn’t on your resume`:'',score,conf:kwApps.length>=4?'High':'Medium',ev,why,
   fix:gaps[0]?`Learn ${gaps[0].name} (${gaps[0].focus}) and prove it with one small project.`:'',check:'Watches whether your keyword match rises and responses follow.',ok:'Your resume covers the skills most postings for this role ask for.'});}
 // 5. volume
 {const last14=apps.filter(a=>diffD(TODAY,a.applied)<14).length,target=ph.k==='off'?6:12;let score=0,ev=[];
  if(!apps.length&&S.baseline){ev.push(`You’ve sent ${b.sent} so far. Log new ones here as you send them, so SPLIT can see timing and tailoring.`);score=0.2}
  else{ev.push(`You sent ${last14} ${pl(last14,'application')} in the last 14 days. During ${ph.name}, about ${target/2} a week keeps enough in the pipeline.`);if(last14<target)score=(1-last14/target)*0.6}
  if(bottleneck==='start'){score+=0.5;ev.push(`Patterns show up after about 8 applications that are two weeks old. You have ${sN}.`)}
  causes.push({id:'volume',stage:'start',title:'Not enough applications out',short:bottleneck==='start'?`you’ve sent ${sN} so far, and patterns show up after about 8`:'you don’t have enough applications out yet',score,conf:'Medium',ev,why:ev[0],
   fix:`Send about ${target/2} a week, prioritizing fresh postings.`,check:'Counts applications per week.',ok:`You’re sending enough (${last14} in the last 14 days).`});}
 // 6. interviews
 {const weak=S.debriefs.filter(d=>d.rating<=2);let score=weak.length?0.2+0.15*weak.length:0;const ev=weak.map(d=>{const a=appById(d.appId);return `${a?a.co+' ':''}${lc(d.type)} (${RATING[d.rating].toLowerCase()}): “${d.struggled}”`});
  causes.push({id:'interview',stage:'intv',title:'Interview answers need practice',short:'your interview answers need more practice',score,conf:conf(weak.length*3),ev,why:ev[0]?`Your debrief notes: ${ev[0]}`:'Practice under realistic conditions.',fix:'Do one mock interview a week and debrief every real one.',check:'Tracks your debrief ratings and response-to-interview rate.',ok:'Your debriefs don’t show a weak spot.'});}
 // 7. story bank
 {const done=id=>{const a=S.answers&&S.answers[id];return !!(a&&a.fields&&Object.values(a.fields).reduce((n,v)=>n+wc(v),0)>=30)};
  const missing=BEH.filter(b=>!done(b.id)).map(b=>b.type);let score=missing.length/BEH.length*0.45;const ev=[];
  if(missing.length)ev.push(`You don’t have answers ready for ${join(missing.map(lc))} questions.`);
  const weakA=Object.values(S.answers||{}).filter(a=>a.fb&&!a.fb.stale&&a.fb.verdict==='needs_work').length;
  if(weakA){ev.push(`${weakA} of your checked ${pl(weakA,'answer')} still ${weakA===1?'needs':'need'} work.`);score+=0.1}
  const rq=(ROLEQ[S.profile.role]||[])[0],dataQ=S.debriefs.find(d=>d.questions.some(q=>/data|decision/i.test(q))&&d.rating<=2);
  if(dataQ&&rq&&!done(rq.id)){const a=appById(dataQ.appId);ev.push(`Your ${a?a.co+' ':''}${lc(dataQ.type)} asked for a data-driven story and you didn’t have one ready.`);score+=0.15}
  causes.push({id:'stories',stage:'intv',tags:missing,title:'Gaps in your story bank',short:'you don’t have stories ready for common questions',score,conf:'Medium',ev,why:ev.join(' '),fix:'Write one STAR answer for each missing type, then check it on the Interviews page.',check:'Counts ready answers per question type.',ok:'You have at least one story for every common question type.'});}

 const upcoming=apps.filter(a=>a.reached===2&&!a.closed&&a.interviewDate&&a.interviewDate>=TODAY).sort((a,b)=>a.interviewDate<b.interviewDate?-1:1);
 if(upcoming.length)causes.forEach(c=>{if(c.id==='stories'||c.id==='interview')c.score+=0.15});
 causes.forEach(c=>{if(c.stage===bottleneck||(bottleneck==='offer'&&c.stage==='intv'))c.score*=1.4;c.learned=S.learned[c.id]||null;if(c.learned==='no_effect')c.score*=0.55;c.score=Math.min(1.6,c.score)});
 causes.sort((a,b)=>b.score-a.score);
 const respCauses=causes.filter(c=>c.stage==='resp'||c.stage==='start');
 const top=(bottleneck==='intv'||bottleneck==='offer')?causes.filter(c=>c.stage==='intv'&&c.score>=0.2):causes.filter(c=>c.score>=0.2);
 const lead=(bottleneck==='resp'?respCauses:bottleneck==='start'?causes.filter(c=>c.id==='volume'):top)[0]||top[0];
 const HEAD={resp:'Your applications aren’t getting responses.',intv:'You get responses, but they don’t turn into interviews.',offer:'You reach interviews, but not offers yet.',start:'First step: get more applications out.',ok:'Your recruiting funnel looks healthy.'};
 return {F,sN,settled,recent,recentResp,rates,stages,bottleneck,causes,top,lead,upcoming,ph,head:HEAD[bottleneck]};
}
const cause=(dx,id)=>dx.causes.find(c=>c.id===id);

/* ---------- planner ---------- */
const ACT={
 apply_fresh:{cat:'apply',r(h,c,dx){const n=Math.max(1,Math.round(h/0.5)),k=cause(dx,'timing');return{title:`Apply to ${n} ${pl(n,'role')} posted in the last 7 days`,detail:'Filter Handshake and LinkedIn by “past week.” Log the posting date with each one so SPLIT can compare.',why:k.why,metric:'At least 1 response from this week’s applications within 3 weeks.'}}},
 tailor_test:{cat:'apply',r(h,c,dx){const n=Math.max(1,Math.round(h/0.75)),k=cause(dx,'tailoring'),conf=k.ev.some(e=>e.startsWith('Caution'));return{title:`Tailor your resume for ${n} of ${pl(n,'them','them')}`,detail:conf?'Send the others as-is. All of them are fresh postings, so this separates the effect of tailoring from the effect of timing.':'Match the top keywords in each posting. Paste the posting into Keyword match to check.',why:k.why+(conf?' Tailoring and timing have overlapped so far, so this week tests them apart.':''),metric:'Tailored applications get more responses than untailored ones sent the same week.'}}},
 referral_ask:{cat:'apply',r(h,c,dx){const n=Math.max(1,Math.round(h/0.5));return{title:`Ask ${n} ${pl(n,'person','people')} for a referral`,detail:'Pick companies already on your list. Message an alum or past intern there, ask for 15 minutes about the team, then ask about a referral.',why:cause(dx,'referral').why,metric:'One referral secured within 2 weeks.'}}},
 volume:{cat:'apply',r(h,c,dx){const n=Math.max(1,Math.round(h/0.4));return{title:`Send ${n} applications`,detail:'Prioritize postings from the last 7 days and log each one here.',why:cause(dx,'volume').why,metric:'About 8 applications at least two weeks old, so SPLIT can find a pattern.'}}},
 skill_learn:{cat:'build',r(h,c,dx){const s=roleSkill(c.skill),k=cause(dx,'skills');if(skillStatus(s.name)==='missing')return{title:`Add ${s.name} to your resume`,detail:'Put it in your skills section and write one bullet that shows you using it. Your Resume page checks it.',why:`You know ${s.name}, but recruiters can’t see it. It shows up in ${s.pct}% of ${R().name} postings.`,metric:`${s.name} shows as “On resume” on the Skills page.`};return{title:`${s.name}: ${s.focus}`,detail:s.res?`Use ${s.res}.`:'',url:s.url,why:k.skill===s.name?k.why:`${s.name} shows up in ${s.pct}% of ${R().name} postings.`,metric:`${hrs(h)} logged on the Skills tab and two practice sets done.`}}},
 skill_project:{cat:'build',r(h,c){const s=roleSkill(c.skill);return{title:`Start a resume project with ${s.name}`,detail:s.project,why:'A project is how a new skill gets onto your resume with proof behind it.',metric:'A first version you can link from your resume within 3 weeks.'}}},
 interview_prep:{cat:'prep',r(h,c){const a=appById(c.appId);if(!a)return{title:'Interview prep',detail:'',why:'',metric:''};const d=diffD(a.interviewDate,TODAY);return{title:`Prepare for ${a.co} (${fmtDay(a.interviewDate)})`,detail:`Re-read the posting. Practice ${a.kw&&a.kw.includes('SQL')?'two SQL questions out loud, ':''}your three strongest stories, and two questions to ask them.`,why:`Your interview is ${d<=0?'today':d===1?'tomorrow':`in ${d} days`}. The week of an interview, prep comes first.`,metric:'Log a debrief within a day of the interview.'}}},
 stories:{cat:'prep',r(h,c,dx){const t=(c.tags&&c.tags.length?c.tags:TAGS).slice(),n=Math.min(t.length,Math.max(1,Math.round(h/0.5)));return{title:`Write ${n} STAR ${pl(n,'answer')}: ${join(t.slice(0,n).map(lc))}`,detail:'Go to Interviews → Behavioral. Write each one, then check it: SPLIT marks what to fix and shows a strong version.',why:cause(dx,'stories').why||'Every common question type should have a story ready.',metric:'Every common question type has at least one story.'}}},
 mock:{cat:'prep',r(h,c,dx){return{title:'Do one mock interview and debrief it',detail:'Ask a friend or use the career center. Log it as a debrief so SPLIT can track your ratings.',why:cause(dx,'interview').why,metric:'Debrief ratings move up from “Shaky.”'}}}
};
const aid=p=>p.kind+(p.ctx&&(p.ctx.skill||p.ctx.appId)?'-'+(p.ctx.skill||p.ctx.appId):'');

function buildPlan(dx,keepDone){
 const H=S.profile.hours||8,ph=dx.ph,reasons=[];
 let f={resp:[.45,.40,.15],intv:[.25,.25,.50],offer:[.20,.20,.60],start:[.55,.35,.10],ok:[.45,.30,.25]}[dx.bottleneck].slice();
 reasons.push({resp:'The weak point is getting responses, so most time goes to applying better and closing your biggest skill gap.',intv:'You get responses but few interviews, so more time goes to assessments and screens.',offer:'You reach interviews but not offers, so interview prep gets the most time.',start:'There isn’t enough history to diagnose yet, so the first weeks build a pipeline of applications.',ok:'Nothing is clearly broken, so the split stays balanced.'}[dx.bottleneck]);
 if(ph.k==='peak'&&dx.bottleneck!=='offer'){f[0]+=.1;f[1]-=.1;reasons.push(`It’s ${ph.name}, so applying gets extra time.`)}
 if(ph.k==='off'){f[0]-=.15;f[1]+=.15;reasons.push('Fewer postings this time of year, so skill building gets more time.')}
 if(dx.upcoming.length){const a=dx.upcoming[0];if(f[2]<.3){const d=.3-f[2];f[2]=.3;f[0]-=d*.6;f[1]-=d*.4}reasons.push(`Interview prep is up because ${a.co} is on ${fmtDay(a.interviewDate)}.`)}
 f=f.map(x=>Math.max(0,x));const sum=f.reduce((a,b)=>a+b,0);f=f.map(x=>x/sum);
 let h=f.map(x=>Math.round(x*H*2)/2);const diff=H-h.reduce((a,b)=>a+b,0);h[h.indexOf(Math.max(...h))]+=diff;
 const pool=[];const add=(kind,w,ctx)=>{if(!pool.some(p=>aid(p)===aid({kind,ctx})))pool.push({kind,w:+w.toFixed(2),ctx:ctx||null})};
 dx.causes.forEach(c=>{if(c.score<0.2)return;
  if(c.id==='timing')add('apply_fresh',3+c.score);
  if(c.id==='tailoring')add('tailor_test',2+c.score);
  if(c.id==='referral')add('referral_ask',1+c.score*.5);
  if(c.id==='volume')add('volume',3+c.score);
  if(c.id==='skills'&&c.skill){add('skill_learn',3+c.score,{skill:c.skill});add('skill_project',1.5,{skill:c.skill})}
  if(c.id==='stories'&&c.tags.length)add('stories',2+c.score,{tags:c.tags});
  if(c.id==='interview')add('mock',1.5+c.score);
 });
 if(pool.some(p=>p.kind==='apply_fresh')){const i=pool.findIndex(p=>p.kind==='volume');if(i>=0)pool.splice(i,1)}
 dx.upcoming.slice(0,2).forEach(a=>add('interview_prep',5,{appId:a.id}));
 const has=cat=>pool.some(p=>ACT[p.kind].cat===cat);
 if(!has('apply'))add('volume',2);
 if(!has('build')){const s=R().skills.find(x=>skillStatus(x.name)!=='have')||R().skills[0];add('skill_learn',2,{skill:s.name})}
 if(!has('prep')){const st=cause(dx,'stories');st.tags.length?add('stories',1,{tags:st.tags}):add('mock',1)}
 return {split:{apply:h[0],build:h[1],prep:h[2]},pool,done:keepDone||{},reasons};
}
function planActions(plan){
 const out=[];
 ['apply','build','prep'].forEach(cat=>{
  const list=plan.pool.filter(p=>ACT[p.kind]&&ACT[p.kind].cat===cat).sort((a,b)=>b.w-a.w);
  const total=plan.split[cat]||0;
  while(list.length&&total<list.length*0.5)list.pop();
  if(!list.length)return;
  const sw=list.reduce((s,p)=>s+p.w,0);
  const hs=list.map(p=>Math.max(0.5,Math.round(p.w/sw*total*2)/2));
  let diff=total-hs.reduce((a,b)=>a+b,0),i=0,g=0;
  while(Math.abs(diff)>=0.25&&g++<80){const st=diff>0?0.5:-0.5,j=i%hs.length;if(hs[j]+st>=0.5){hs[j]+=st;diff-=st}i++}
  list.forEach((p,k)=>out.push(Object.assign({},p,{id:aid(p),cat,h:hs[k]})));
 });
 return out;
}
const renderAct=(a,dx)=>Object.assign({},a,ACT[a.kind].r(a.h,a.ctx||{},dx));

/* ---------- check-in logic ---------- */
function evaluateTests(){
 const out=[];
 S.weeks.forEach(w=>(w.tests||[]).forEach(t=>{
  if(t.status!=='pending'||diffD(S.current.id,w.id)<7)return;
  const wa=S.apps.filter(a=>a.week===w.id);let v=null,msg='';
  if(t.cause==='timing'){const e=wa.filter(a=>a.posted&&ageAt(a)<=7),r=nResp(e);if(!e.length)return;v=r?'worked':'no_effect';msg=r?`Applying within 7 days worked: ${r} of ${e.length} early applications from the week of ${fmt(w.id)} got a response.`:`Applying early hasn’t produced a response yet (${e.length} applications from the week of ${fmt(w.id)}).`}
  if(t.cause==='tailoring'){const tl=wa.filter(a=>a.tailored),ut=wa.filter(a=>!a.tailored);if(!tl.length)return;v=(rate(tl)||0)>(rate(ut)||0)?'worked':'no_effect';msg=`Tailoring, week of ${fmt(w.id)}: ${nResp(tl)} of ${tl.length} tailored applications responded vs ${nResp(ut)} of ${ut.length} untailored.${v==='worked'?' Tailoring looks like it helps.':' No difference yet.'}`}
  if(t.cause==='referral'){const rf=wa.filter(a=>a.referral);if(!rf.length)return;const r=rf.filter(a=>a.reached>=1);v=r.length?'worked':'no_effect';msg=r.length?`Your referral at ${join(r.map(a=>a.co))} turned into a response.`:'The referral hasn’t led to a response yet.'}
  if(t.cause==='volume'){const r=nResp(wa);v=r?'worked':'no_effect';msg=`${wa.length} applications from the week of ${fmt(w.id)} produced ${r} ${pl(r,'response')}.`}
  if(v){t.status=v;t.msg=msg;S.learned[t.cause]=v;out.push({cause:t.cause,v,msg})}
 }));
 return out;
}
function commitCheckin(ck){
 const dx0=diagnose(),plan0=S.current.plan;
 const acts=planActions(plan0).map(a=>renderAct(a,dx0));
 Object.entries(ck.upd).forEach(([id,c])=>{const a=appById(id);if(!a)return;
  if(c==='responded')a.reached=Math.max(a.reached,1);if(c==='interview'){a.reached=Math.max(a.reached,2)}if(c==='offer')a.reached=3;if(c==='rejected')a.closed=true});
 plan0.done=Object.assign({},ck.done);
 const verdicts=evaluateTests();
 const tests=[];acts.forEach(a=>{const cz=KIND_CAUSE[a.kind];if(plan0.done[a.id]&&['timing','tailoring','referral','volume'].includes(cz)&&!tests.some(t=>t.cause===cz))tests.push({cause:cz,status:'pending'})});
 const dx1=diagnose();
 const nextId=addD(S.current.id,7);
 const plan1=buildPlan(dx1);
 const changes=[];
 const r0=dx0.rates.resp,r1=dx1.rates.resp;
 if(r0!=null&&r1!=null&&Math.round(r0*100)!==Math.round(r1*100))changes.push(`Response rate moved from ${pct(r0)} to ${pct(r1)}.`);
 if(dx0.bottleneck!==dx1.bottleneck)changes.push(`The main problem changed: ${dx1.head}`);
 ['apply','build','prep'].forEach(k=>{const a=plan0.split[k],b=plan1.split[k];if(Math.abs(a-b)>=1)changes.push(`${CATS[k]}: ${hrs(a)} → ${hrs(b)}.`)});
 plan1.reasons.forEach(r=>changes.push(r));
 const sent=S.apps.filter(a=>a.week===S.current.id).length;
 const notes=verdicts.length?verdicts.map(v=>v.msg):[`${sent} ${pl(sent,'application')} sent. Too early to judge them; SPLIT checks again in two weeks.`];
 S.weeks.push({id:S.current.id,split:Object.assign({},plan0.split),actions:acts.map(a=>({t:a.title,cat:a.cat,h:a.h,done:!!plan0.done[a.id]})),notes,changes,tests});
 S.current={id:nextId,plan:plan1};
 save();
 return {dx0,dx1,verdicts,changes,plan0,plan1};
}


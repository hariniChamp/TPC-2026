/* SPLIT — helpers, role data, and the interview question bank */
'use strict';
/* ---------- utilities ---------- */
const DAY=864e5;
const pad=n=>String(n).padStart(2,'0');
const iso=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const parse=s=>{const[y,m,d]=String(s).split('-').map(Number);return new Date(y,(m||1)-1,d||1)};
const addD=(s,n)=>{const d=parse(s);d.setDate(d.getDate()+n);return iso(d)};
const diffD=(a,b)=>Math.round((parse(a)-parse(b))/DAY);
const mondayOf=s=>{const d=parse(s);d.setDate(d.getDate()-((d.getDay()+6)%7));return iso(d)};
const fmt=s=>s?parse(s).toLocaleDateString('en-US',{month:'short',day:'numeric'}):'';
const fmtDay=s=>s?parse(s).toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'}):'';
const fmtRange=s=>{const e=addD(s,6),a=parse(s),b=parse(e);return a.getMonth()===b.getMonth()?`${fmt(s)} – ${b.getDate()}`:`${fmt(s)} – ${fmt(e)}`};
const TODAY=iso(new Date());
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pct=x=>x==null?'—':`${Math.round(x*100)}%`;
const lc=s=>String(s).toLowerCase();
const pl=(n,a,b)=>n===1?a:(b||a+'s');
const join=a=>a.length<=1?a.join(''):a.length===2?`${a[0]} and ${a[1]}`:`${a.slice(0,-1).join(', ')}, and ${a[a.length-1]}`;
const uid=()=>Math.random().toString(36).slice(2,10);
const hrs=h=>`${(+h).toFixed(h%1?1:0)} h`;
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const searchUrl=(co,t)=>`https://www.google.com/search?q=${encodeURIComponent(co+' '+t+' careers')}`;

/* ---------- reference data ---------- */
const ROLES={
 da:{name:'Data Analyst intern',short:'Data Analyst',bench:{resp:[8,15],intv:[40,60],offer:[20,35]},skills:[
  {name:'SQL',pct:81,focus:'joins, GROUP BY, window functions',res:'Mode SQL Tutorial, then LeetCode SQL 50',url:'https://mode.com/sql-tutorial',project:'Load a public dataset (Austin 311 calls works) into SQLite and answer three questions a city manager would ask.'},
  {name:'Excel',pct:66,focus:'pivot tables, XLOOKUP, charts',res:'Microsoft Excel training videos',url:'https://support.microsoft.com/en-us/excel',project:'Turn a messy CSV into a one-page budget dashboard.'},
  {name:'Python',pct:58,focus:'pandas cleaning and grouping',res:'Kaggle Learn: Pandas',url:'https://www.kaggle.com/learn/pandas',project:'Clean a messy dataset in a notebook and put it on GitHub with a short README.'},
  {name:'Communication',pct:52,focus:'explaining a finding in three sentences',res:'Write a three-sentence summary for every analysis you do',project:'Publish a short write-up of one analysis for a non-technical reader.'},
  {name:'Tableau',pct:47,focus:'one dashboard with filters',res:'Tableau free training videos',url:'https://www.tableau.com/learn/training',project:'Build a Tableau Public dashboard from your SQL project.'},
  {name:'Statistics',pct:43,focus:'confidence intervals, regression',res:'Your SDS coursework plus Khan Academy statistics',url:'https://www.khanacademy.org/math/statistics-probability',project:'Run a regression on a public dataset and explain what it does and doesn’t show.'},
  {name:'Power BI',pct:34,focus:'data model and one report',res:'Microsoft Learn: Power BI',url:'https://learn.microsoft.com/en-us/training/powerplatform/power-bi',project:'Rebuild your Tableau dashboard in Power BI.'},
  {name:'A/B testing',pct:23,focus:'sample size and significance',res:'Udacity’s free A/B Testing course',project:'Analyze a public A/B test dataset and write a ship / don’t-ship call.'},
  {name:'R',pct:21,focus:'tidyverse basics',res:'R for Data Science (free online book)',url:'https://r4ds.hadley.nz',project:'Redo one Python analysis in R.'},
  {name:'Git',pct:12,focus:'commit, branch, pull request',res:'GitHub Skills',url:'https://skills.github.com',project:'Put every project above in its own repo.'}]},
 swe:{name:'Software Engineering intern',short:'SWE',bench:{resp:[5,12],intv:[35,55],offer:[15,30]},skills:[
  {name:'Data structures & algorithms',pct:88,focus:'arrays, hashing, trees, graphs',res:'NeetCode roadmap',url:'https://neetcode.io/roadmap',project:'Solve 50 patterns-first problems; keep notes in a repo.'},
  {name:'Python',pct:61,focus:'idiomatic Python, testing',res:'Official Python tutorial',url:'https://docs.python.org/3/tutorial/',project:'Ship a small CLI tool with tests.'},
  {name:'Java',pct:54,focus:'collections, OOP',res:'Java MOOC (University of Helsinki)',url:'https://java-programming.mooc.fi',project:'Build a REST API in Spring Boot.'},
  {name:'Git',pct:49,focus:'branching, pull requests',res:'GitHub Skills',url:'https://skills.github.com',project:'Contribute one fix to an open-source repo.'},
  {name:'SQL',pct:38,focus:'joins, indexes',res:'Mode SQL Tutorial',url:'https://mode.com/sql-tutorial',project:'Add a database to your API project.'},
  {name:'JavaScript',pct:36,focus:'async, DOM, one framework',res:'MDN JavaScript guide',url:'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide',project:'Build and deploy a small web app.'},
  {name:'Cloud (AWS/Azure/GCP)',pct:31,focus:'deploy one service',res:'AWS free tier tutorials',project:'Deploy your API to the cloud.'},
  {name:'Testing',pct:27,focus:'unit tests, CI',res:'pytest docs',project:'Add CI that runs tests on every push.'},
  {name:'C++',pct:26,focus:'pointers, STL',res:'learncpp.com',url:'https://www.learncpp.com',project:'Rewrite a hot loop from Python in C++.'},
  {name:'React',pct:22,focus:'components, state',res:'react.dev tutorial',url:'https://react.dev/learn',project:'Rebuild your web app’s UI in React.'}]},
 pm:{name:'Product Management intern',short:'PM',bench:{resp:[4,10],intv:[30,50],offer:[15,30]},skills:[
  {name:'Communication',pct:84,focus:'crisp written updates',res:'Write a weekly update for one of your projects',project:'Write a one-page product brief for an app you use.'},
  {name:'User research',pct:58,focus:'running 5 user interviews',res:'The Mom Test (book)',project:'Interview 5 users and synthesize the findings.'},
  {name:'Prioritization',pct:55,focus:'RICE, trade-off writing',res:'Practice prioritizing a public roadmap',project:'Prioritize 10 feature requests and defend the top 3.'},
  {name:'Writing specs',pct:44,focus:'PRDs with success metrics',res:'Read public PRD examples',project:'Write a PRD for a feature in an app you use.'},
  {name:'SQL',pct:42,focus:'funnels and retention queries',res:'Mode SQL Tutorial',url:'https://mode.com/sql-tutorial',project:'Compute a signup funnel from a public dataset.'},
  {name:'Product analytics',pct:38,focus:'funnels, cohorts',res:'Amplitude or Mixpanel free academy',project:'Build a funnel dashboard for a demo app.'},
  {name:'Agile',pct:35,focus:'sprints, tickets',res:'Atlassian Agile Coach',url:'https://www.atlassian.com/agile',project:'Run your team project in two-week sprints.'},
  {name:'A/B testing',pct:31,focus:'designing a test',res:'Udacity’s free A/B Testing course',project:'Design an experiment for a feature idea.'},
  {name:'Figma',pct:29,focus:'wireframes',res:'Figma’s free courses',project:'Wireframe your PRD feature.'},
  {name:'Python',pct:12,focus:'scripting basics',res:'Kaggle Learn: Python',url:'https://www.kaggle.com/learn/python',project:'Automate one recurring task.'}]},
 consult:{name:'Consulting intern',short:'Consulting',bench:{resp:[5,12],intv:[30,50],offer:[15,30]},skills:[
  {name:'Excel',pct:79,focus:'modeling, lookups, sensitivity tables',res:'Wall Street Prep free Excel crash course',project:'Build a market model with three scenarios.'},
  {name:'Communication',pct:77,focus:'top-down answers',res:'Practice answer-first emails',project:'Turn one analysis into a 3-slide storyline.'},
  {name:'PowerPoint',pct:71,focus:'action titles, clean charts',res:'Study a public consulting deck',project:'Rebuild one ugly slide three ways.'},
  {name:'Structured problem solving',pct:68,focus:'issue trees, hypotheses',res:'Case in Point (book)',project:'Write an issue tree for a local business problem.'},
  {name:'Market sizing',pct:41,focus:'top-down and bottom-up',res:'Practice 2 sizings a week',project:'Size the market for a campus business.'},
  {name:'Financial modeling',pct:36,focus:'3-statement basics',res:'Corporate Finance Institute free courses',project:'Model a simple business case.'},
  {name:'Tableau',pct:18,focus:'one dashboard',res:'Tableau free training videos',url:'https://www.tableau.com/learn/training',project:'Visualize your market sizing.'},
  {name:'SQL',pct:15,focus:'basic queries',res:'Mode SQL Tutorial',url:'https://mode.com/sql-tutorial',project:'Pull data for a case from a public dataset.'}]},
 ba:{name:'Business Analyst intern',short:'Business Analyst',bench:{resp:[8,15],intv:[40,60],offer:[20,35]},skills:[
  {name:'Excel',pct:78,focus:'pivots, lookups, charts',res:'Microsoft Excel training videos',url:'https://support.microsoft.com/en-us/excel',project:'Build an operations dashboard from a CSV.'},
  {name:'SQL',pct:69,focus:'joins, aggregations',res:'Mode SQL Tutorial',url:'https://mode.com/sql-tutorial',project:'Answer 5 business questions on a public dataset.'},
  {name:'Communication',pct:60,focus:'stakeholder updates',res:'Write a weekly status update',project:'Present one analysis in 5 minutes.'},
  {name:'Power BI',pct:44,focus:'one report',res:'Microsoft Learn: Power BI',url:'https://learn.microsoft.com/en-us/training/powerplatform/power-bi',project:'Rebuild your Excel dashboard in Power BI.'},
  {name:'Requirements gathering',pct:42,focus:'user stories',res:'Interview a club officer about a process',project:'Write requirements for a club tool.'},
  {name:'Tableau',pct:38,focus:'one dashboard',res:'Tableau free training videos',url:'https://www.tableau.com/learn/training',project:'Publish a Tableau Public dashboard.'},
  {name:'Python',pct:31,focus:'pandas basics',res:'Kaggle Learn: Pandas',url:'https://www.kaggle.com/learn/pandas',project:'Automate a weekly report.'},
  {name:'Process mapping',pct:25,focus:'swimlane diagrams',res:'Lucidchart tutorials',project:'Map a campus process and propose a fix.'},
  {name:'Statistics',pct:22,focus:'descriptive stats',res:'Khan Academy statistics',url:'https://www.khanacademy.org/math/statistics-probability',project:'Summarize a dataset with the right stats.'}]}
};
const SYN={'SQL':/\bsql\b|postgres|mysql|sqlite/i,'Excel':/\bexcel\b|spreadsheet/i,'Python':/\bpython\b|pandas/i,'Communication':/communicat|present(ing|ation)|storytell/i,'Tableau':/tableau/i,'Statistics':/statistic|regression|hypothesis/i,'Power BI':/power ?bi/i,'A/B testing':/a\/b|ab test|experimentation/i,'R':/\bR\b/,'Git':/\bgit(hub)?\b/i,'Data structures & algorithms':/data structure|algorithm/i,'Java':/\bjava\b(?!script)/i,'JavaScript':/javascript|typescript|\bnode/i,'Cloud (AWS/Azure/GCP)':/\baws\b|azure|\bgcp\b|cloud/i,'Testing':/unit test|testing/i,'C++':/c\+\+/i,'React':/\breact\b/i,'User research':/user research|interview users|usability/i,'Prioritization':/prioriti/i,'Writing specs':/\bprd\b|spec/i,'Product analytics':/amplitude|mixpanel|product analytics/i,'Agile':/agile|scrum|sprint/i,'Figma':/figma/i,'PowerPoint':/powerpoint|slides|deck/i,'Structured problem solving':/problem.solving|structured/i,'Market sizing':/market siz/i,'Financial modeling':/financial model/i,'Requirements gathering':/requirement/i,'Process mapping':/process (map|improvement)/i};
const TAGS=['Teamwork','Conflict','Failure','Leadership','Data-driven decision','Ambiguity'];
const CATS={apply:'Applying',build:'Building skills',prep:'Interview prep'};
const RATING=['','Rough','Shaky','Solid','Strong'];
const KIND_CAUSE={apply_fresh:'timing',tailor_test:'tailoring',referral_ask:'referral',volume:'volume',skill_learn:'skills',skill_project:'skills',stories:'stories',mock:'interview',interview_prep:'interview'};


/* ---------- interview question bank ---------- */
const BEH=[
 {id:'teamwork',type:'Teamwork',q:'Tell me about a time you worked on a team to reach a goal.',look:'Whether you make a team better: how you coordinate, communicate, and pick up slack.',pick:'A class project, club, or job where you had a clear role.',
  ex:{s:'In my statistics capstone, four of us had three weeks to build a model predicting campus housing prices.',t:'I owned the data cleaning and kept our shared timeline on track.',a:'I set up a shared tracker with an owner and date for every task. I cleaned 4,200 listings in Python and documented each step so teammates could reuse my code. I also ran a 15-minute check-in each Monday to catch blockers early.',r:'We submitted two days early and earned the top grade in the section. Two other teams in the class reused my tracker.'},
  why:['The Action is mostly “I” statements, even in a team story.','Specific numbers: 4,200 listings, 15-minute check-ins, two days early.','The Result shows impact beyond the grade.']},
 {id:'conflict',type:'Conflict',q:'Tell me about a time you disagreed with a teammate.',look:'That you can disagree respectfully, listen, and reach a decision without drama.',pick:'A real disagreement about an approach, not a personality clash.',
  ex:{s:'On a club marketing project, a teammate wanted to spend our whole $300 budget on Instagram ads.',t:'I thought tabling would reach more freshmen, and we had one week to decide.',a:'I asked her to walk me through her reasoning first. Then I suggested we test both: $50 on ads and one afternoon of tabling. I tracked sign-ups from each with separate QR codes and shared the numbers with the team.',r:'Tabling brought in 41 sign-ups and the ads brought in 9, so we moved the budget. She ran the next tabling day, and we still work together.'},
  why:['Listens before arguing.','Settles the disagreement with data, not opinion.','Ends with the relationship intact.']},
 {id:'failure',type:'Failure',q:'Tell me about a time you made a mistake.',look:'Honesty, ownership, and what you changed afterward. Avoid a fake failure.',pick:'A real mistake with a real fix. Small is fine.',
  ex:{s:'In my first month as a research assistant, I sent my professor a summary table with the wrong filter applied.',t:'She was about to use it in a grant draft, so I had to fix it fast and make sure it didn’t happen again.',a:'I told her within the hour and sent the corrected table that afternoon. Then I wrote a short checklist I now run before sharing any numbers: row counts, filters, and a spot check against the raw data.',r:'The grant went out with correct figures, and no error has reached her since. She later trusted me to run the full analysis for her next paper.'},
  why:['Owns the mistake right away.','The fix is a system, not a promise to “be more careful.”','The result rebuilds trust.']},
 {id:'leadership',type:'Leadership',q:'Tell me about a time you took the lead without being asked.',look:'Initiative: you noticed a problem and moved people toward a fix.',pick:'A time you weren’t in charge but stepped up anyway.',
  ex:{s:'Our data science club’s workshops were drawing about 8 people out of 120 members.',t:'I wasn’t an officer, but I wanted to find out why and fix it.',a:'I surveyed members and found most wanted hands-on projects, not lectures. I pitched a 4-week Kaggle mini-series to the officers, wrote the starter notebooks, and recruited two seniors to mentor teams.',r:'Attendance went from 8 to 35 per session, and the officers made the series a permanent part of each semester.'},
  why:['Starts from evidence, not a hunch.','Shows influence without a title.','Clear before-and-after numbers.']},
 {id:'ambiguity',type:'Ambiguity',q:'Tell me about a time you had to work with unclear instructions.',look:'How you create clarity: asking the right questions and checking in early.',pick:'A vague assignment you had to turn into a clear plan.',
  ex:{s:'During my internship, my manager asked me to “look into why customer complaints went up,” with no other direction.',t:'I needed to turn that into a concrete question and an answer within two weeks.',a:'I set up a 20-minute meeting to ask what decision this would inform. I pulled six months of complaint tickets and grouped them by category. After day two I sent a one-paragraph plan so she could correct my direction early.',r:'I found 60% of the increase came from one shipping partner. The team renegotiated that contract, and complaints dropped 25% the next quarter.'},
  why:['Turns a vague ask into a clear question.','Checks in early instead of guessing for two weeks.','Lands on a specific finding and a business result.']},
 {id:'pressure',type:'Pressure',q:'Tell me about a time you juggled competing deadlines.',look:'How you prioritize and communicate when you can’t do everything at once.',pick:'A busy week where you had to choose what came first.',
  ex:{s:'In one week I had two midterms, a club event I was running, and a 20-hour work schedule.',t:'I had to get through all of it without dropping anything important.',a:'I listed every task with its deadline and how much it mattered. I asked a coworker to swap one shift, handed event setup to two volunteers with a written checklist, and blocked study time in two-hour chunks.',r:'I scored above the class average on both midterms, and the event started on time with 60 attendees. I still plan busy weeks this way.'},
  why:['Shows a method for prioritizing.','Delegates and communicates instead of just working harder.','A concrete outcome for each commitment.']}
];
const RQ=(id,type,q,look,ex,why)=>({id,type,q,look,ex,why});
const ROLEQ={
 da:[
  RQ('da1','Data-driven decision','Tell me about a time you used data to change someone’s decision.','That your analysis leads to action, and that you can persuade with evidence.',
   {s:'At my campus rec center job, the manager planned to cut morning hours because they “felt empty.”',t:'I offered to check the actual usage before the change went through.',a:'I pulled three months of card-swipe data and charted visits by hour and weekday. Mornings were slow on weekends but busy Monday through Thursday. I shared a one-page summary with a recommendation.',r:'She cut weekend mornings only. That kept about 900 weekday visits a month and still saved 12 staff hours a week.'},
   ['Challenges a gut feeling with real data.','Turns the analysis into a specific recommendation.','The result has both sides: what was kept and what was saved.']),
  RQ('da2','Data quality','Tell me about a time you found an error in data.','Attention to detail, and how you handle data you can’t trust.',
   {s:'For a class project on Austin rent prices, our dataset had some listings priced at $1.',t:'I needed to find out how big the problem was before we built our model.',a:'I wrote Python checks for impossible values, duplicates, and missing fields. I found that 3% of rows were placeholders or duplicates, documented each rule, and removed them with a note in our report.',r:'Our model’s error dropped by 18%, and the professor used our cleaning notes as an example for the next class.'},
   ['Sizes the problem before fixing it.','Documents the rules so others can trust the result.','Shows the cleanup mattered with a number.']),
  RQ('da3','Explaining results','Tell me about a time you explained a technical finding to a non-technical audience.','Whether you can make numbers useful to people who don’t care how you got them.',
   {s:'Our student org’s treasurer wanted to know if raising dues would cost us members.',t:'I had run a regression on past semesters, and I needed to explain it to officers with no stats background.',a:'I skipped the coefficients and led with one sentence: each $10 increase lost about four members. I showed one chart with the trend and laid out three options with the expected budget for each.',r:'The officers chose a $5 increase. Membership held steady and the budget grew 15%.'},
   ['Leads with the answer, not the method.','Gives options instead of a lecture.','The audience made a decision because of it.']),
  RQ('da4','Prioritizing requests','Tell me about a time you had to prioritize several data requests at once.','How you decide what matters most and keep people informed.',
   {s:'As a research assistant, I got three data requests in one week from two professors and a PhD student.',t:'I couldn’t finish all three by Friday, so I had to choose an order.',a:'I asked each person what the work was for and when they truly needed it. I did the grant-deadline request first, sent the PhD student a quick version with the full one promised Monday, and told the second professor the timeline up front.',r:'The grant data went out on time and all three were satisfied. I started a shared request sheet that the lab still uses.'},
   ['Asks why before deciding.','Communicates timelines instead of going silent.','Leaves behind a better process.'])],
 swe:[
  RQ('swe1','Debugging','Tell me about a challenging bug you fixed.','How you investigate: reproducing, narrowing down, and preventing the bug from coming back.',
   {s:'In a group web app for a class, users were getting logged out every few minutes.',t:'I owned the login code, so I had to find the cause before our demo in four days.',a:'I reproduced it by logging timestamps and noticed it only happened after a server restart. I traced it to session tokens stored in memory, moved sessions to the database, and added a test that restarts the server mid-session.',r:'The logouts stopped, the demo went smoothly, and the new test caught a related bug two weeks later.'},
   ['Reproduces before guessing.','Explains the root cause in one line.','Adds a test so it stays fixed.']),
  RQ('swe2','Trade-offs','Tell me about a technical decision you made and its trade-offs.','That you weigh options against real constraints instead of picking what’s trendy.',
   {s:'At a hackathon, my team built a study-room booking app that needed live updates.',t:'I had to choose between websockets and simple polling, with 24 hours to build.',a:'I compared them on setup time and how fresh the data needed to be. Rooms change every 15 minutes at most, so I chose polling every 30 seconds and wrote down when we’d switch if we grew.',r:'We shipped a working demo with time left to polish the interface and placed second of 40 teams.'},
   ['Names the options and the constraint.','Picks the simpler choice for a clear reason.','Plans for when the decision should change.']),
  RQ('swe3','Learning fast','Tell me about a time you learned a new technology quickly.','How you ramp up: your learning plan and how soon you deliver.',
   {s:'My internship team wrote everything in Go, which I had never used.',t:'I had two weeks before I would own a small service.',a:'I worked through the official Go tour in two evenings. I read the service’s code and wrote notes on its patterns, then asked my mentor to review a small first pull request that week.',r:'I merged my first feature on day nine, and by the end of the summer I owned the service’s logging changes.'},
   ['A concrete plan, not “I’m a fast learner.”','Asks for review early.','A dated, specific outcome.']),
  RQ('swe4','Code review','Tell me about a time you received critical feedback on your code.','Whether you take feedback well and actually improve.',
   {s:'In my first code review at my internship, a senior engineer left 23 comments on my pull request.',t:'I needed to address them and not repeat the same mistakes.',a:'I grouped the comments into themes and fixed them in one pass. I asked follow-up questions on the two I didn’t understand, then turned the themes into a checklist I run before every pull request.',r:'My next three pull requests needed fewer than five comments each, and my mentor noted the improvement in my review.'},
   ['No defensiveness.','Turns feedback into a habit.','Shows measurable improvement.'])],
 pm:[
  RQ('pm1','Incomplete information','Tell me about a time you made a decision with incomplete information.','How you gather enough signal fast and set a checkpoint to change course.',
   {s:'While organizing a campus hackathon, we had to pick a date two months out without knowing midterm schedules.',t:'I had to choose the weekend most likely to get high turnout.',a:'I polled 80 past attendees in two days, checked the registrar’s exam windows, and picked the weekend with the fewest conflicts. I set a checkpoint: if sign-ups were under 100 a month out, we’d move the date.',r:'We passed 100 sign-ups three weeks early and had 160 attendees, our largest event.'},
   ['Gathers quick evidence instead of waiting.','Sets a checkpoint to revisit the call.','Clear outcome.']),
  RQ('pm2','Saying no','Tell me about a time you had to say no to a stakeholder.','That you protect the plan while still solving the real need.',
   {s:'As product lead for a student app, a club president asked us to add event ticketing a week before launch.',t:'Adding it would have pushed launch past finals.',a:'I met with him to understand the need and found he mostly wanted to track RSVPs. I offered a simple RSVP list we could build in a day and put full ticketing on the roadmap with a date.',r:'We launched on time with RSVPs, and 12 clubs used it in the first month.'},
   ['Finds the need behind the request.','Offers an alternative, not just a no.','Keeps the launch on track.']),
  RQ('pm3','Customer feedback','Tell me about a time you used customer feedback to change a product.','That you talk to users and act on what you learn.',
   {s:'Our team built a meal-swipe sharing app for a class, and only 20% of users came back after the first week.',t:'I wanted to understand why before we added more features.',a:'I interviewed eight users who had stopped using it. Most didn’t know when swipes were available, so I pushed the team to add a notification when a swipe was posted.',r:'Week-two retention rose from 20% to 45%.'},
   ['Talks to the users who left.','Finds one clear cause.','Retention number proves it.']),
  RQ('pm4','Alignment','Tell me about a time you aligned a team with different goals.','How you get people with different priorities onto one plan.',
   {s:'On our project team, designers wanted a polished interface while engineers wanted to ship the core feature first.',t:'As PM, I had to get everyone on one plan for a four-week build.',a:'I ran a 30-minute session where each side listed its must-haves, and we ranked them together against our launch goal. I wrote a one-page plan that scheduled design polish for week four.',r:'We shipped the core feature in week two and the polished version on time, with no reopened debates.'},
   ['Makes both sides heard.','Uses a shared goal to rank options.','Writes the decision down.'])],
 consult:[
  RQ('c1','Structured problem solving','Tell me about a time you solved a problem with a structured approach.','That you break big problems into parts and follow the evidence.',
   {s:'Our campus coffee cart’s profits fell 20% over one semester.',t:'Through my business club, I had three weeks to find out why.',a:'I split the problem into revenue and costs, then split revenue into customers and spend per visit. Visits were flat but spending per visit dropped, so I interviewed 15 customers and learned a popular pastry had been removed.',r:'The cart brought the pastry back, and profits recovered 15% the next month.'},
   ['A clear issue tree.','Lets data pick which branch to explore.','Concrete fix and result.']),
  RQ('c2','Difficult client','Tell me about a time you worked with a difficult client or stakeholder.','How you manage expectations and keep work on track.',
   {s:'During a pro bono project for a local nonprofit, the director kept changing what she wanted.',t:'I had to keep the project on track for our final presentation in five weeks.',a:'I set up a 20-minute weekly call and wrote a one-page summary after each with decisions and open questions, which she confirmed by email. New ideas went on a later-phase list.',r:'We delivered on time, she approved every recommendation, and she invited our club back the next year.'},
   ['Creates structure instead of complaining.','Gets decisions in writing.','Relationship ends stronger.']),
  RQ('c3','Persuading with data','Tell me about a time you persuaded your team with data.','That you can change minds with clear, sourced numbers.',
   {s:'In a case competition, my team disagreed on whether our client should enter a new market.',t:'I believed the market was too small and had one day to convince them.',a:'I built a quick bottom-up market size: target customers times purchase rate times price, with a source for every number. I walked the team through it in five minutes.',r:'The team changed our recommendation, the judges called the sizing the strongest part of our deck, and we placed second of 24.'},
   ['Shows the math simply.','Sources every number.','Outside validation of the result.']),
  RQ('c4','Tight deadline','Tell me about a time you delivered under a tight deadline.','How you cut scope and still deliver quality.',
   {s:'In a 48-hour case competition, our team lost a member on the first morning.',t:'I picked up her financial analysis on top of my market research.',a:'I cut the scope to the three numbers our recommendation depended on and built a simple model with clear assumptions. I asked a teammate to check my math while I drafted slides.',r:'We submitted two hours early, and the judges singled out our financial logic.'},
   ['Cuts scope on purpose.','Builds in a check.','Delivers early.'])],
 ba:[
  RQ('ba1','Process improvement','Tell me about a time you improved a process.','That you can map how work happens and make it faster or less error-prone.',
   {s:'At my part-time job, the store tracked inventory in a paper log that took three hours each week.',t:'My manager asked if I could make it faster.',a:'I mapped every step of the current process and moved the log into a shared spreadsheet with dropdowns and a reorder formula. I trained the three other staff in 15 minutes each.',r:'The weekly count dropped to 40 minutes, and stockouts fell from about five a month to one.'},
   ['Maps the current process first.','Simple, practical fix.','Before-and-after numbers.']),
  RQ('ba2','Requirements','Tell me about a time you gathered requirements from stakeholders.','How you find out what people actually need before anything is built.',
   {s:'Our student government wanted a new way to handle club funding requests.',t:'I had to find out what each group needed before anyone built anything.',a:'I interviewed six club treasurers and two student government officers and wrote 12 user stories. I reviewed them with everyone in one meeting to cut the list to the must-haves.',r:'The team built a simple form from the five must-haves, and processing time dropped from three weeks to one.'},
   ['Talks to both sides.','Writes requirements down.','Cuts scope to must-haves.']),
  RQ('ba3','Data-driven recommendation','Tell me about a time you used data to recommend a business decision.','That your analysis ends in a clear recommendation.',
   {s:'A local café I volunteered for wanted to shorten its menu to save money.',t:'The owner asked me which items to drop.',a:'I pulled six months of sales from the register and calculated revenue and margin per item. I flagged items that were both low-selling and low-margin and presented a short list with expected savings.',r:'They removed seven items, food waste dropped by about a third, and profit rose 8% the next quarter.'},
   ['Uses two measures, not one.','Gives a clear list, not a data dump.','Business result in numbers.']),
  RQ('ba4','Conflicting priorities','Tell me about a time you handled conflicting priorities between teams.','How you find common ground and design for both sides.',
   {s:'On a class consulting project, the client’s sales and operations leads wanted different things from our dashboard.',t:'I had to deliver one dashboard both teams would use.',a:'I met each lead separately to learn which decisions they made each week. I found four metrics both needed and designed a shared view with a tab for each team’s extras.',r:'Both teams adopted it, and the client asked us to extend it to finance.'},
   ['Starts from the decisions people make.','Finds the overlap.','Both sides adopt it.'])]
};
const P=(t,re)=>[t,re];
const TQ={
 t_where:{skill:'SQL',code:false,q:'What is the difference between WHERE and HAVING in SQL?',hint:'Think about when each filter runs compared to GROUP BY.',
  points:[P('WHERE filters individual rows before grouping',/before|each row|individual rows|row.level/i),P('HAVING filters groups after GROUP BY',/after|group/i),P('HAVING can use aggregates like COUNT or SUM',/aggregate|count|sum|avg/i)],
  ans:'WHERE filters individual rows before any grouping happens, so it can’t use aggregate functions. HAVING filters groups after GROUP BY, so it can.\n\nExample: WHERE state = \'TX\' keeps only Texas rows, then HAVING COUNT(*) > 10 keeps only the cities with more than 10 of them.'},
 t_second:{skill:'SQL',code:true,q:'Write a query to find the second-highest salary in an employees table.',hint:'A subquery with MAX works. So does a window function like DENSE_RANK.',
  points:[P('Uses a subquery or a window function',/select[\s\S]*select|over\s*\(|rank/i),P('Handles ties (DISTINCT, MAX, or DENSE_RANK)',/distinct|dense_rank|max\s*\(/i),P('Returns one value',/max\s*\(|limit|offset|fetch|= *2/i)],
  ans:'SELECT MAX(salary)\nFROM employees\nWHERE salary < (SELECT MAX(salary) FROM employees);\n\n-- Or with a window function:\nSELECT DISTINCT salary\nFROM (\n  SELECT salary, DENSE_RANK() OVER (ORDER BY salary DESC) AS rnk\n  FROM employees\n) t\nWHERE rnk = 2;\n\nBoth handle ties: equal salaries share a rank, so you get the true second-highest value.'},
 t_spend:{skill:'SQL',code:true,q:'Write a query to find each customer’s total spending from an orders table.',hint:'You need one row per customer.',
  points:[P('Uses SUM on the amount',/sum\s*\(/i),P('Groups by customer',/group by/i),P('Sorts or joins for readability',/order by|join/i)],
  ans:'SELECT customer_id, SUM(amount) AS total_spent\nFROM orders\nGROUP BY customer_id\nORDER BY total_spent DESC;\n\nJoin to a customers table if you need names.'},
 t_lookup:{skill:'Excel',code:false,q:'How would you combine data from two Excel sheets that share a customer ID?',hint:'Think lookups.',
  points:[P('Uses XLOOKUP, INDEX/MATCH, or VLOOKUP',/xlookup|index|match|vlookup/i),P('Matches on the shared ID',/\bid\b|key|customer/i),P('Handles IDs with no match',/missing|not found|iferror|n\/a|no match/i)],
  ans:'Use XLOOKUP on the customer ID:\n=XLOOKUP(A2, Sheet2!A:A, Sheet2!C:C, "Not found")\n\nIt finds the ID in the second sheet and returns the matching column. The last argument handles IDs that don’t exist. INDEX/MATCH does the same in older Excel. For large data, a Power Query merge is cleaner.'},
 t_pvalue:{skill:'Statistics',code:false,q:'How would you explain a p-value to a non-technical manager?',hint:'Start by assuming there is no real effect. What does the p-value measure then?',
  points:[P('Starts from “no real effect”',/no (real )?(effect|difference)|null|by chance|just chance/i),P('Probability of a result at least this extreme',/probab|how often|likely|chance/i),P('Says what it doesn’t mean',/not|doesn.?t|isn.?t/i)],
  ans:'If there were really no difference, the p-value is how often we’d see a result at least this big just by chance. A p-value of 0.03 means about a 3% chance.\n\nSmall p-values suggest the effect is probably real. It doesn’t tell you how big or important the effect is, and it isn’t the chance that the finding is true.'},
 t_drop:{skill:'Analytics case',code:false,q:'Website sign-ups dropped 20% last week. How would you investigate?',hint:'Make sure the drop is real first. Then narrow down where it happened.',
  points:[P('Checks tracking or data issues first',/track|bug|data quality|logging|broken|instrument|real/i),P('Segments by device, channel, or region',/segment|device|channel|source|region|mobile|browser/i),P('Checks for releases, campaigns, or seasonality',/release|launch|change|holiday|season|competitor|campaign|outage/i),P('Finds the funnel step that dropped',/funnel|step|page|conversion/i)],
  ans:'First, make sure it’s real: check for tracking bugs or logging changes. Compare with the same week last year for seasonality.\n\nThen segment by traffic source, device, region, and new versus returning users to see where the drop is concentrated. Walk through the sign-up funnel to find which step lost people.\n\nFinally, check for releases, marketing changes, or outages that line up with the timing.'},
 t_twosum:{skill:'Data structures & algorithms',code:false,q:'How would you find two numbers in an array that add up to a target?',hint:'Can you do better than checking every pair?',
  points:[P('Uses a hash map or set',/hash|map|dict|set/i),P('Checks for the complement (target − x)',/complement|target\s*-|minus|difference/i),P('States O(n) time',/o\(n\)|linear/i)],
  ans:'Loop through the array once and keep a hash map from value to index. For each number, check whether target − number is already in the map. If it is, return both indexes; if not, add the current number.\n\nThat’s O(n) time and O(n) space, compared with O(n²) for checking every pair.'},
 t_thread:{skill:'Operating systems',code:false,q:'What is the difference between a process and a thread?',hint:'Think about memory.',
  points:[P('A process has its own memory space',/memory|address space/i),P('Threads share their process’s memory',/share/i),P('Mentions synchronization or isolation trade-offs',/lock|race|synchron|mutex|isolat|crash/i)],
  ans:'A process is a running program with its own memory space. Threads live inside a process and share its memory, so they communicate easily but need synchronization, like locks, to avoid race conditions.\n\nProcesses are more isolated, so one crashing doesn’t take down the others, but switching between them and sharing data costs more.'},
 t_url:{skill:'Networking',code:false,q:'What happens when you type a URL into a browser and press Enter?',hint:'Go step by step from the domain name to pixels on screen.',
  points:[P('DNS lookup',/dns/i),P('TCP connection and TLS handshake',/tcp|tls|https|handshake/i),P('HTTP request and response',/http|request|response|server/i),P('Browser parses and renders',/render|html|dom|pars/i)],
  ans:'The browser looks up the domain’s IP address through DNS. It opens a TCP connection and, for HTTPS, does a TLS handshake. It sends an HTTP request, and the server responds with HTML.\n\nThe browser parses the HTML, fetches CSS, JavaScript, and images, builds the DOM, and renders the page.'},
 t_bsearch:{skill:'Data structures & algorithms',code:false,q:'What is the Big O of binary search, and why?',hint:'What happens to the search space at each step?',
  points:[P('O(log n)',/log/i),P('Halves the search space each step',/half|halv|divide/i),P('Requires sorted data',/sort/i)],
  ans:'Binary search is O(log n). Each step compares with the middle element and throws away half the remaining items, so the number of steps grows with the logarithm of n. It only works on sorted data.'},
 t_measure:{skill:'Product analytics',code:false,q:'How would you measure the success of a new feature?',hint:'Start from the goal, not the metric.',
  points:[P('Ties the metric to a goal',/goal|objective|why/i),P('Picks a primary metric',/metric|kpi|adoption|retention|engagement|usage/i),P('Adds guardrail metrics',/guardrail|counter|trade.?off|side effect|harm/i),P('Compares to a baseline or A/B test',/baseline|a\/b|experiment|control/i)],
  ans:'Start with the goal the feature serves. Pick one primary metric tied to that goal, like weekly use of the feature or retention. Add guardrail metrics to catch harm, like support tickets or load time.\n\nCompare against a baseline, ideally with an A/B test, and set the success threshold before launch.'},
 t_prior:{skill:'Prioritization',code:false,q:'How do you decide what to build next?',hint:'Name a framework, but lead with the user problem.',
  points:[P('Starts from user problems or goals',/user|customer|problem|goal/i),P('Weighs impact',/impact|value|reach/i),P('Weighs effort or cost',/effort|cost|time/i),P('Uses a framework like RICE',/rice|ice|score|framework|matrix/i)],
  ans:'I start from user problems and business goals, then score the options on reach, impact, confidence, and effort, for example with RICE. I check the top choices against strategy and dependencies, and share the reasoning so the team understands the trade-offs.'},
 t_dau:{skill:'Analytics case',code:false,q:'Daily active users dropped 10% this week. What do you do?',hint:'Is it real? Where is it? Why now?',
  points:[P('Checks whether the data is right',/track|bug|data|logging|real/i),P('Segments the drop',/segment|platform|device|region|country|cohort|new|returning/i),P('Looks for internal or external causes',/release|change|holiday|season|competitor|outage|news/i)],
  ans:'First, confirm it’s real: check for tracking issues and compare with seasonal patterns. Then segment by platform, region, and new versus returning users to see where it’s concentrated. Finally, line the timing up against releases, outages, holidays, or competitor news, and form a hypothesis you can test.'},
 t_improve:{skill:'Product sense',code:false,q:'How would you improve Spotify for college students?',hint:'Goal, user, pain point, solution, metric.',
  points:[P('Sets a goal',/goal|retention|engage|grow/i),P('Picks a user segment',/student|segment|user/i),P('Names a pain point',/pain|problem|need|frustrat/i),P('Proposes and prioritizes a solution',/feature|solution|idea|build/i),P('Says how to measure it',/metric|measure|track/i)],
  ans:'Clarify the goal, for example retention of student subscribers. Pick a segment, like students who listen while studying. Name a pain point: building focus playlists takes time. Propose a few solutions and choose one, like a study mode that adapts a playlist to session length. Measure it with study-mode usage and student-plan retention.'},
 t_coffee:{skill:'Market sizing',code:false,q:'Estimate how many cups of coffee are bought in Austin each day.',hint:'Population, coffee drinkers, cups per day, share bought rather than made.',
  points:[P('Starts from population',/population|people|residents/i),P('Applies percentages for who drinks coffee',/percent|share|%|fraction|half|third/i),P('Uses cups per person per day',/cups?|per day|a day/i),P('States assumptions or sanity-checks',/assum|sanity|check|round/i)],
  ans:'Start with Austin’s population, about 1 million. Assume 75% are adults and 60% of adults drink coffee, at about 2 cups a day. Maybe a third of those cups are bought rather than made at home.\n\n1,000,000 × 0.75 × 0.6 × 2 × ⅓ ≈ 300,000 cups bought per day.\n\nState each assumption out loud and sanity-check the result against the number of coffee shops.'},
 t_profit:{skill:'Structured problem solving',code:false,q:'A client’s profits are falling. How would you structure the problem?',hint:'Profit = revenue − costs. Keep splitting.',
  points:[P('Splits into revenue and costs',/revenue/i),P('Splits revenue into price and volume',/price|volume|quantity|units/i),P('Splits costs into fixed and variable',/fixed|variable/i),P('Uses data to pick a branch',/data|which|where|compare|trend/i)],
  ans:'Profit = revenue − costs. Split revenue into price × volume, and volume by product, customer segment, or channel. Split costs into fixed and variable. Use data to find which branch changed, then dig into why, like a competitor’s pricing or a rising input cost.'},
 t_market:{skill:'Structured problem solving',code:false,q:'How would you decide whether a client should enter a new market?',hint:'Market, competition, capabilities, economics.',
  points:[P('Market size and growth',/size|grow|attractive/i),P('Competition',/compet/i),P('Client capabilities or advantage',/capabilit|fit|advantage|strength/i),P('Economics: costs, profit, payback',/profit|cost|payback|return|financ/i)],
  ans:'Look at four things: how big and fast-growing the market is, how competitive it is, whether the client has the capabilities or an advantage to win, and the economics, meaning entry costs, expected profit, and payback time. Then compare entry options: build, buy, or partner.'},
 t_sens:{skill:'Excel',code:false,q:'How would you build a sensitivity table in Excel?',hint:'There’s a built-in What-If tool.',
  points:[P('Uses Data Table (What-If Analysis)',/data table|what.?if/i),P('Varies one or two inputs',/input|assumption|variable/i),P('Links to the output cell',/output|result|cell/i)],
  ans:'Put the model’s key output in one cell. Lay out values for one or two input assumptions along a row and a column, and point the corner cell at the output. Then use Data → What-If Analysis → Data Table with the matching input cells. Excel fills in the output for every combination.'},
 t_process:{skill:'Process mapping',code:false,q:'How would you document a current business process?',hint:'Talk to the people who do the work.',
  points:[P('Interviews or observes the people involved',/stakeholder|interview|observe|shadow|talk/i),P('Maps steps, owners, and hand-offs',/step|flow|map|swimlane|diagram|owner|hand.?off/i),P('Marks bottlenecks or pain points',/pain|bottleneck|delay|issue|rework/i),P('Validates the map with stakeholders',/validat|review|confirm|check/i)],
  ans:'Interview the people who do the work and watch it happen. Map each step, owner, and hand-off in a swimlane diagram. Mark delays, rework, and pain points, then review the map with stakeholders to confirm it matches reality before proposing changes.'}
};
const TECHQ={da:['t_where','t_second','t_lookup','t_pvalue','t_drop'],swe:['t_twosum','t_bsearch','t_thread','t_url'],pm:['t_measure','t_prior','t_dau','t_improve'],consult:['t_coffee','t_profit','t_market','t_sens'],ba:['t_where','t_spend','t_lookup','t_process']};
const GUIDE=['Aim for about 1.5 to 2 minutes out loud, roughly 200 to 300 words.','Spend most of your time, about 60%, on the Action.','Say “I” for what you did. Save “we” for team context.','End with a number: time saved, percent improved, people reached.','Pick a story where your choice made the difference.'];
const STARF=[
 {k:'s',short:'S',label:'Situation',hint:'Where and when. Set the scene in one or two sentences.',target:[15,50],starters:['During my internship at','In my ___ class,','As a member of']},
 {k:'t',short:'T',label:'Task',hint:'What you were responsible for, or the goal.',target:[8,30],starters:['I was responsible for','My goal was to','I needed to']},
 {k:'a',short:'A',label:'Action',hint:'What you did, step by step. This should be the longest part. Say “I”, not “we”.',target:[40,120],starters:['First, I','Then I','To make sure ___, I']},
 {k:'r',short:'R',label:'Result',hint:'What changed, with a number. Add what you learned if there’s room.',target:[12,50],starters:['As a result,','This cut ___ from ___ to ___.','I learned']}
];
const PITCHF=co=>[
 {k:'p1',short:'1',label:`What draws you to ${co}`,hint:'Name something specific: a product, a team, or how they use data.',target:[15,50],starters:[`I’ve been following how ${co}`,`What stands out to me about ${co} is`]},
 {k:'p2',short:'2',label:'Why you fit',hint:'Connect one or two of your skills or experiences to this role.',target:[15,50],starters:['In my ___ project, I','My experience with ___ fits because']},
 {k:'p3',short:'3',label:'What you want to learn or contribute',hint:'End on what you hope to do there.',target:[10,40],starters:['I’m hoping to learn','I want to contribute by']}
];
const whyQ=co=>({id:'why:'+co,kind:'pitch',cat:'Company',type:`Why ${co}`,co,q:`Why do you want to work at ${co}?`,look:'That you’ve done your homework and this is more than a generic application.',pick:'Look up one recent product, project, or news item from the company before you write.',
 ex:{p1:`I’ve been following how ${co} uses data in [a specific product or decision], and I want to work somewhere analysis shapes real decisions.`,p2:`In my [project or job], I [specific thing you did with a skill from the posting], which is close to what this team does day to day.`,p3:`I’m hoping to learn how a team at ${co}’s scale [does something specific], and to contribute by [a concrete way you’d help].`},
 why:['Names something specific about the company.','Links your experience to the role.','Ends looking forward, not backward.']});
const kwQ=skill=>({id:'kw:'+skill,kind:'tech',skill,gen:true,q:`Walk me through a project where you used ${skill}.`,hint:'Goal, what you did with the tool, and the result.',
 points:[P('Names the project and its goal',/project|goal|built|wanted|needed/i),P(`Explains how you used ${skill}`,new RegExp(skill.replace(/[.*+?^${}()|[\]\\]/g,'\\$&').split(' ')[0],'i')),P('Gives a concrete result',/\d/)],
 ans:`Pick one project and keep it to about a minute:\n1. The goal: what question you were answering or what you built.\n2. How you used ${skill}: one or two specific things you did with it.\n3. The result: a number if you can, and what you’d do differently.`});
function qFind(id){if(!id)return null;if(id.startsWith('why:'))return whyQ(id.slice(4));if(id.startsWith('kw:'))return kwQ(id.slice(3));
 const b=BEH.find(x=>x.id===id);if(b)return Object.assign({kind:'star',cat:'Behavioral'},b);
 for(const k in ROLEQ){const r=ROLEQ[k].find(x=>x.id===id);if(r)return Object.assign({kind:'star',cat:'Role-specific'},r)}
 if(TQ[id])return Object.assign({id,kind:'tech',cat:'Technical',type:TQ[id].skill},TQ[id]);return null}
const PROJ={'SQL':['https://www.kaggle.com/datasets?search=sql','Find a dataset'],'Excel':['https://www.kaggle.com/datasets?search=sales','Sample sales data'],'Python':['https://www.kaggle.com/datasets','Kaggle datasets'],'Communication':['https://pages.github.com','GitHub Pages'],'Tableau':['https://public.tableau.com','Tableau Public'],'Statistics':['https://www.kaggle.com/datasets?search=regression','Regression datasets'],'Power BI':['https://learn.microsoft.com/en-us/power-bi/create-reports/sample-datasets','Power BI sample data'],'A/B testing':['https://www.kaggle.com/datasets?search=ab+test','A/B test datasets'],'R':['https://posit.cloud','Posit Cloud'],'Git':['https://github.com/new','New GitHub repo'],'Data structures & algorithms':['https://neetcode.io/practice','NeetCode practice'],'Java':['https://start.spring.io','Spring Initializr'],'JavaScript':['https://pages.github.com','GitHub Pages'],'Cloud (AWS/Azure/GCP)':['https://aws.amazon.com/free','AWS Free Tier'],'Testing':['https://docs.github.com/en/actions','GitHub Actions'],'C++':['https://www.learncpp.com','learncpp.com'],'React':['https://react.dev/learn/tutorial-tic-tac-toe','React tutorial'],'User research':['https://www.nngroup.com/articles/user-interviews/','User interview guide'],'Prioritization':['https://www.productplan.com/glossary/rice-scoring-model/','RICE guide'],'Writing specs':['https://www.atlassian.com/agile/product-management/requirements','PRD guide'],'Product analytics':['https://www.kaggle.com/datasets?search=ecommerce+events','Event datasets'],'Agile':['https://www.atlassian.com/agile/scrum/sprints','Sprint guide'],'Figma':['https://www.figma.com','Figma'],'PowerPoint':['https://slides.google.com','Google Slides'],'Structured problem solving':['https://miro.com','Miro whiteboard'],'Market sizing':['https://data.census.gov','US Census data'],'Financial modeling':['https://www.sec.gov/edgar/search/','Company filings (SEC)'],'Requirements gathering':['https://www.atlassian.com/agile/project-management/user-stories','User stories guide'],'Process mapping':['https://www.lucidchart.com','Lucidchart']};
const PROJ_ROLE={'da:SQL':['https://data.austintexas.gov','Austin open data'],'swe:SQL':['https://www.sqlite.org/quickstart.html','SQLite quickstart'],'swe:Python':['https://docs.pytest.org/en/stable/getting-started.html','pytest quickstart']};
const projLink=n=>PROJ_ROLE[S.profile.role+':'+n]||PROJ[n]||null;


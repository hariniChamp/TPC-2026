process.env.SPLIT_FILES = 'js/data.js,js/engine.js,js/ui.js,js/coach.js,js/app.js';
const { run } = require('./harness.js');

let fails = 0;
const ok = (name, cond, extra) => {
  if (cond) console.log('  pass  ' + name);
  else { fails++; console.log('  FAIL  ' + name + (extra ? '  → ' + extra : '')); }
};
const btn = k => ({ dataset: { k }, classList: { contains: () => false } });

console.log('\nevery view renders (sample student)');
run('seed();ui.flow=null');  // mirror what startLoading() does after the real example() path
for (const v of ['vWeek', 'vHistory', 'vDiagnosis', 'vApps', 'vSkills', 'vInterviews', 'vResume']) {
  try { ok(v, typeof run(v + '()') === 'string'); }
  catch (e) { ok(v, false, e.message); }
}

console.log('\ncheck-in overlay renders at every step');
run('H.checkin()');
ok('opens at step 1', run('ui.overlay.step') === 1);
ok('seeds logged hours', JSON.stringify(run('ui.overlay.logged')) === '{"apply":0,"build":0,"prep":0}');
for (const s of [1, 2, 3]) {
  run('ui.overlay.step=' + s);
  try { ok('step ' + s + ' renders', run('ovCheckin()').length > 50); }
  catch (e) { ok('step ' + s + ' renders', false, e.message); }
}

console.log('\nlogging hours through the real handler');
run('ui.overlay.step=2');
run("H.ckHrs({dataset:{k:'apply',d:'0.5'}})");
run("H.ckHrs({dataset:{k:'apply',d:'0.5'}})");
run("H.ckHrs({dataset:{k:'build',d:'0.5'}})");
run("H.ckHrs({dataset:{k:'prep',d:'-0.5'}})");
ok('apply accumulated to 1', run('ui.overlay.logged.apply') === 1, run('ui.overlay.logged.apply') + '');
ok('prep cannot go below 0', run('ui.overlay.logged.prep') === 0, run('ui.overlay.logged.prep') + '');

console.log('\nfinishing the check-in');
run('ui.overlay.step=3');
run('H.ckFinish()');
ok('no error surfaced', !run('ui.overlay.err'), run('ui.overlay.err') || '');
ok('advanced to the result step', run('ui.overlay.step') === 4, run('ui.overlay.step') + '');
ok('step 4 renders', run('ovCheckin()').length > 50);
const w = run('S.weeks[S.weeks.length-1]');
ok('snapshot stored logged hours', w.logged && w.logged.apply === 1, JSON.stringify(w.logged));
ok('snapshot stored the funnel', !!w.funnel, JSON.stringify(w.funnel));
ok('snapshot stored the diagnosis', !!(w.dx && w.dx.head), JSON.stringify(w.dx));
ok('snapshot stored sent/replies', w.sent !== undefined && w.replies !== undefined);

console.log('\nhistory reflects the new week');
const hist = run('vHistory()');
ok('history mentions logged hours', /logged/.test(hist));
ok('history renders the funnel chart once 2+ weeks exist',
   run('S.weeks.length') >= 2 ? /fc-stack/.test(hist) : true);

console.log('\ncheck-in survives a missing plan (the reported bug)');
run('S.current.plan=null');
try { run('H.checkin()'); ok('rebuilds the plan instead of throwing', !!run('S.current.plan')); }
catch (e) { ok('rebuilds the plan instead of throwing', false, e.message); }

console.log('\ncheck-in reports failure instead of going dead');
run('ui.overlay.step=3');
run('const _cc=commitCheckin;commitCheckin=()=>{throw new Error("boom")}');
run('H.ckFinish()');
ok('error surfaced to the user', !!run('ui.overlay.err'), run('ui.overlay.err') || '(none)');
ok('stayed on step 3 so answers survive', run('ui.overlay.step') === 3);
run('commitCheckin=_cc');

console.log('\nonboarding questions all render');
run("H.begin()");
const nq = run('Q.length');
for (let i = 0; i < nq; i++) {
  try {
    run(`ui.flow.i=${i}`);
    const h = run(`Q[${i}].html(ui.flow.draft)`);
    ok(`Q${i + 1}: ${run(`Q[${i}].title`).slice(0, 44)}`, typeof h === 'string' && h.length > 10);
  } catch (e) { ok('Q' + (i + 1), false, e.message); }
}
ok('visibleQ works on a fresh draft', run('visibleQ(ui.flow.draft).length') >= 1);

console.log('\nfull onboarding to a working plan');
run(`ui.flow.draft=Object.assign(ui.flow.draft,{name:'Sam',school:'UT Austin',year:'Sophomore',major:'Econ',gpa:'3.4',role:'pm',season:'Summer 2027',hours:1,confidence:2,sent:0,replies:0,interviews:0,offers:0})`);
run(`freshState({name:'Sam',school:'UT Austin',year:'Sophomore',major:'Econ',gpa:'3.4',role:'pm',season:'Summer 2027',hours:1,skills:[]},null,null,2)`);
ok('profile keeps school', run('S.profile.school') === 'UT Austin');
ok('profile keeps gpa', run('S.profile.gpa') === '3.4');
ok('1-hour plan has tasks', run('planActions(S.current.plan).length') >= 1);
ok('vWeek renders for the 1-hour user', run('vWeek()').length > 50);

console.log(fails ? `\n${fails} FAILED\n` : '\nall passed\n');
process.exit(fails ? 1 : 0);

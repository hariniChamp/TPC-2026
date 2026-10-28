const { run } = require('./harness.js');

let fails = 0;
const ok = (name, cond, extra) => {
  if (cond) console.log('  pass  ' + name);
  else { fails++; console.log('  FAIL  ' + name + (extra ? '  → ' + extra : '')); }
};

console.log('\nsample student (seed)');
run('seed()');
const dx = run('diagnose()');
ok('diagnose returns a bottleneck', !!dx.bottleneck, dx.bottleneck);
const split = run('S.current.plan.split');
const H = run('S.profile.hours');
ok('split totals the profile hours',
   Math.abs(split.apply + split.build + split.prep - H) < 0.01,
   JSON.stringify(split) + ' vs ' + H);

const acts = run('planActions(S.current.plan)');
ok('every task gets at least 0.5 h', acts.every(a => a.h >= 0.5),
   JSON.stringify(acts.map(a => a.h)));
ok('task hours sum to the split',
   Math.abs(acts.reduce((s, a) => s + a.h, 0) - H) < 0.01,
   acts.reduce((s, a) => s + a.h, 0) + ' vs ' + H);

console.log('\ntwo full check-in cycles');
for (let i = 1; i <= 2; i++) {
  const before = run('S.weeks.length');
  run('commitCheckin({done:{},upd:{}})');
  const after = run('S.weeks.length');
  ok('cycle ' + i + ' recorded a week', after === before + 1);
  const s = run('S.current.plan.split');
  ok('cycle ' + i + ' split still totals hours',
     Math.abs(s.apply + s.build + s.prep - H) < 0.01, JSON.stringify(s));
  ok('cycle ' + i + ' snapshot has hours logged',
     run('S.weeks[S.weeks.length-1].logged') !== undefined);
}

console.log('\nhours floor: a 1-hour week');
run("S.profile.hours=1;S.current.plan=buildPlan(diagnose())");
const low = run('planActions(S.current.plan)');
ok('1-hour week still produces at least one task', low.length >= 1, low.length + ' tasks');
ok('1-hour week totals 1 h', Math.abs(low.reduce((s, a) => s + a.h, 0) - 1) < 0.01,
   low.reduce((s, a) => s + a.h, 0) + '');
ok('no task under 0.5 h', low.every(a => a.h >= 0.5), JSON.stringify(low.map(a => a.h)));

console.log('\nunder 4 hours: at most 3 tasks');
for (const h of [1, 2, 3, 3.5]) {
  run(`S.profile.hours=${h};S.current.plan=buildPlan(diagnose())`);
  const a = run('planActions(S.current.plan)');
  ok(`${h} h → ${a.length} tasks (max 3)`, a.length <= 3 && a.length >= 1);
  ok(`${h} h → totals ${a.reduce((s, x) => s + x.h, 0)}`,
     Math.abs(a.reduce((s, x) => s + x.h, 0) - h) < 0.01);
}

console.log('\nbrand-new user (freshState, no history)');
run(`freshState({name:'Test',school:'UT',year:'Junior',major:'Econ',gpa:'',role:'da',season:'Summer 2027',hours:5,skills:[]},null,null,3)`);
ok('new user gets a plan', !!run('S.current.plan'));
ok('signup confidence recorded', run('S.survey.confidence.length') === 1,
   JSON.stringify(run('S.survey')));
const nActs = run('planActions(S.current.plan)');
ok('new user gets tasks', nActs.length >= 1, nActs.length + '');
// A new user has sent nothing in the last 2 weeks, so the PRD's "too few
// applications" row applies, not "not enough data".
ok('new user bottleneck is "thin"', run('diagnose().bottleneck') === 'thin',
   run('diagnose().bottleneck'));
ok('new user split is 60/25/15 before season adjust',
   JSON.stringify(run('SPLIT_BASE.thin')) === JSON.stringify([0.6, 0.25, 0.15]));
run('commitCheckin({done:{},upd:{}})');
ok('new user can check in', run('S.weeks.length') === 1);

console.log('\nsplit rules match the PRD table');
const table = run(`(function(){
  const out={};
  // force each bottleneck and read the base split before season/hours adjust
  out.start=SPLIT_BASE.start; out.resp=SPLIT_BASE.resp;
  out.intv=SPLIT_BASE.intv; out.offer=SPLIT_BASE.offer; out.thin=SPLIT_BASE.thin;
  return out;
})()`);
ok('too few applications → 60/25/15',
   JSON.stringify(table.thin) === JSON.stringify([0.6, 0.25, 0.15]), JSON.stringify(table.thin));
ok('applied, few replies → 30/50/20',
   JSON.stringify(table.resp) === JSON.stringify([0.3, 0.5, 0.2]), JSON.stringify(table.resp));
ok('replies, few offers → 20/25/55',
   JSON.stringify(table.offer) === JSON.stringify([0.2, 0.25, 0.55]), JSON.stringify(table.offer));
ok('not enough data → 40/40/20',
   JSON.stringify(table.start) === JSON.stringify([0.4, 0.4, 0.2]), JSON.stringify(table.start));

console.log(fails ? `\n${fails} FAILED\n` : '\nall passed\n');
process.exit(fails ? 1 : 0);

/* Loads data.js + engine.js in Node with a localStorage stub, so the core
   loop (diagnose → buildPlan → commitCheckin) can be exercised without a
   browser. ui.js/app.js need the DOM and are not loaded. */
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const root = process.env.SPLIT_ROOT || require('path').join(__dirname,'..');
const store = {};
const sandbox = {
  console,
  localStorage: {
    getItem: k => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: k => { delete store[k]; },
  },
};
// engine.js calls wc(), which is defined in coach.js (loaded later in the
// browser). Mirror it here so engine.js can run on its own.
sandbox.wc = s => (String(s || '').trim().match(/\S+/g) || []).length;
sandbox.globalThis = sandbox;
vm.createContext(sandbox);

// Enough of a DOM for the view functions to be defined and called. They build
// HTML strings, so nothing needs to actually render.
const noop = () => {};
const fakeEl = { innerHTML: '', style: {}, classList: { add: noop, remove: noop, toggle: noop, contains: () => false }, querySelector: () => null, querySelectorAll: () => [], addEventListener: noop, animate: noop, setAttribute: noop, focus: noop, getBoundingClientRect: () => ({ left: 0, top: 0, width: 0, height: 0 }) };
sandbox.document = { addEventListener: noop, getElementById: () => fakeEl, querySelector: () => null, querySelectorAll: () => [], body: fakeEl, documentElement: fakeEl, createElement: () => fakeEl };
sandbox.window = sandbox;
sandbox.addEventListener = noop;
sandbox.setTimeout = (fn) => { try { fn(); } catch (e) {} return 0; };
sandbox.matchMedia = () => ({ matches: false, addEventListener: noop });
sandbox.requestAnimationFrame = noop;
sandbox.navigator = { userAgent: 'node' };
sandbox.history = { replaceState: noop };
sandbox.scrollTo = noop;
sandbox.fetch = () => Promise.reject(new Error('no network in harness'));

for (const f of (process.env.SPLIT_FILES || 'js/data.js,js/engine.js').split(',')) {
  const src = fs.readFileSync(path.join(root, f), 'utf8');
  // 'use strict' at file scope would make top-level const file-local in vm;
  // the browser treats each script as a shared global scope, so strip it.
  vm.runInContext(src.replace(/^\s*'use strict';?/m, ''), sandbox, { filename: f });
}

// `let S` in engine.js is a script-scope binding, not a global property, so
// assertions have to be evaluated inside the same context.
module.exports = { sandbox, run: code => vm.runInContext(code, sandbox, { filename: 'test' }) };

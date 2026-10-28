# Tests

No framework and no dependencies — just Node. From the repo root:

```bash
node tests/test.js      # diagnosis, planner, split rules, check-in cycles
node tests/test-ui.js   # every view renders, the check-in flow, onboarding
```

Both print `all passed` or list failures, and exit non-zero on failure.

## How it works

`harness.js` loads the real `js/*.js` files into a Node VM context in the same
order as `index.html`, with a `localStorage` stub and a DOM stub. The view
functions build HTML strings, so nothing needs a real browser.

Assertions run **inside** the context via `run('...')`, because `let S` in
`engine.js` is a script-scope binding rather than a property of the global
object — reaching in from outside gets `undefined`.

Two quirks worth knowing:

- `engine.js` calls `wc()`, which is defined in `coach.js` and loaded after it.
  The harness defines `wc` up front so `engine.js` can run on its own.
- `app.js` boots into the welcome flow when there is no saved state, and
  `renderMain()` delegates to `render()` while `ui.flow` is set, which clears
  any open overlay. Tests do `run('seed();ui.flow=null')` to mirror what
  `startLoading()` does on the real path.

## What this does not cover

Clicks, layout, animation, CSS, file uploads, and anything that needs a real
browser. **Still click through the pages you touched before opening a PR.**

These tests exist mainly to protect the diagnosis and planner maths during the
Supabase migration (stage 4), where the PRD requires the `S` object shape to
stay identical. Run them before and after and compare.

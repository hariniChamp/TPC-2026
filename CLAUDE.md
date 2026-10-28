# SPLIT — working notes for Claude Code

SPLIT is a recruiting diagnostic for college students. It works out *why* a
student's recruiting is stalling and tells them how to split their time this
week. Target: V1 live for demo day, **12/5/2026**.

Read `docs/PRD.md` before any stage. Open each session with:
"Read CLAUDE.md and docs/PRD.md, then do stage N."

## Stack

Plain HTML, CSS and JavaScript. **No build step, no framework, no package
manager, no tests.** Open `index.html` or serve the folder.

```bash
python -m http.server 8000   # then http://localhost:8000
```

Planned for V1 (not yet wired up): Supabase for auth, Postgres and edge
functions; Vercel or Netlify for hosting. Nothing in the repo talks to a
backend today.

## Layout

```
index.html     Page shell. Loads the scripts in a fixed order.
css/styles.css Design tokens (light + dark), layout, components, motion.
js/data.js     Helpers, ROLES, SYN skill dictionary, interview questions.
js/engine.js   State, save/load, diagnose(), buildPlan(), commitCheckin().
js/ui.js       View functions (vWeek, vHistory, …), overlays, onboarding Q[].
js/coach.js    Answer checker, Claude review, interview practice, resume reader.
js/app.js      Rendering, the H{} action map, event delegation, startup.
```

## How it fits together

- **One global scope.** The five scripts share globals and depend on the load
  order in `index.html`. There are no modules and no exports. Moving a function
  between files is safe; reordering the `<script>` tags is not.
- **One state object, `S`.** Everything the user has lives on it. `save()` and
  `load()` ([js/engine.js](js/engine.js)) are the only persistence, currently
  one `localStorage` key (`split.app.v2`). Stage 4 replaces exactly these two
  functions with Supabase calls — keep `S`'s shape identical when you do.
- **`ui` holds view state** (current view, open panels, the active overlay). It
  is deliberately not persisted.
- **Rendering is full-redraw.** `renderMain()` rewrites `#main` from
  `VIEWS[ui.view]()`. There is no diffing. After mutating `S`, call `save()`
  then the matching `render*()`.
- **Events are delegated.** One click listener in [js/app.js](js/app.js) reads
  `data-a="name"` off the nearest ancestor and calls `H[name](target, event)`.
  To add a behaviour: add a `data-a` in the markup and a key to `H`.

## Conventions

- Dates are `YYYY-MM-DD` strings throughout, never `Date` objects. Use the
  helpers in `data.js` (`addD`, `diffD`, `mondayOf`, `fmt`) — they avoid
  timezone drift. `TODAY` is captured once at load.
- Escape every interpolated value with `esc()`. Templates are raw
  `innerHTML`, so an unescaped user string is an XSS hole.
- The house style is dense: single-line functions, short names, few comments.
  Match it. Do not reformat existing lines you are not changing — it makes
  review impossible.
- No dependencies. pdf.js and mammoth.js load from a CDN on demand, only when
  a user uploads a file.

## Rules for this project

- **One stage per branch and pull request.** Merge only after a teammate clicks
  through it on the preview link.
- **Plan first and wait for approval** before editing, for stages 2, 4, 6 and 7.
- **Never put an API key in the repo or in chat.** The Claude key and the
  Supabase service key live only in Supabase secrets. Only the public anon key
  ships in the browser.
- **Test by hand before pushing.** There is no test suite. Serve the folder,
  click the path you changed, and check the browser console for errors. Use
  **See an example** on the start page to load sample data.
- `S.sample === true` means the example student is loaded. Never let sample
  data reach a real account (see F2 in the PRD).

## Known gaps (as of 10/28/2026)

- Skill percentages and funnel ranges in `data.js` are **placeholder
  estimates**, not real data. Stages 6–8 replace them.
- AI feedback only works inside a Claude artifact. Stage 5 moves it server-side.
- Data is browser-only and lost when storage is cleared. Stage 4 fixes this.

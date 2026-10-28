# SPLIT

SPLIT is a recruiting diagnostic for college students. Instead of only tracking applications, it works out **why recruiting is stalling and what to do differently this week**, explains every recommendation, and adjusts the plan based on what happens next.

## What it does

- **Onboarding:** a few questions (role, resume, hours, results so far), then a "Diagnosing the issue" step.
- **Diagnosis:** compares each stage of the student's funnel (applied → reply → interview → offer) with typical ranges, finds the weak spot, and ranks likely causes using the student's own data. Causes include late applications, untailored resumes, no referrals, skill gaps, and weak interview stories.
- **Weekly plan:** splits the student's available hours across applying, building skills, and interview prep. Every task has a "Why this?" explanation.
- **Weekly check-in:** the student logs what they did and any replies. SPLIT tests what changed, re-runs the diagnosis, and shows how next week's plan shifts.
- **Resume:** upload a PDF, Word file, or text. SPLIT shows which role skills are on the resume (and the line where it found each one), what's missing, and Grammarly-style fixes for each bullet.
- **Interview practice:** behavioral, role-specific, and technical questions. A guided STAR editor, then line-by-line feedback with suggested replacements and a side-by-side strong version. Picking a company matches technical questions to that job posting.

## Run it

There is no build step. Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

Data is saved in the browser's local storage. Use **See an example** on the start page to load a sample student.

## Project structure

```
index.html        Page shell: fonts, stylesheet, and scripts in load order
css/styles.css    Design tokens (light and dark), layout, components, and motion
js/data.js        Helpers, role and skill data, and the interview question bank
js/engine.js      Saved state, sample data, diagnosis, weekly planner, and check-ins
js/ui.js          Shared UI pieces, pages, onboarding, and panels
js/coach.js       Answer checker, Claude review, interview practice, and resume reader
js/app.js         Rendering, animations, event handling, and startup
```

The scripts share one global scope, so the order in `index.html` matters.

## Notes

- **AI feedback:** when SPLIT runs as a Claude artifact, answer and resume reviews use Claude, with the viewer's permission. Anywhere else, including GitHub Pages, a built-in rule checker runs instead. It catches filler words, "we" instead of "I", weak verbs, vague amounts, and missing numbers.
- **Libraries:** PDF and Word reading load [pdf.js](https://mozilla.github.io/pdf.js/) and [mammoth.js](https://github.com/mwilliamson/mammoth.js) from cdnjs, and only when a file is uploaded.
- **Placeholder figures:** "typical range" conversion rates and "% of postings" skill shares are illustrative estimates for this prototype. A production version would compute them from real outcome and posting data.
- **Company questions:** company-specific question banks are a planned next step. Today, choosing a company adds a "Why [company]?" question and matches technical questions to the skills in that posting.

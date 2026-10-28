# SPLIT PRD: V1 for Demo Day (12/5)

Oct 28, 2026 · @Ryan · Team: Harini, Michelle, Samara, Abhinav, Jonathan

> Markdown export of the source PRD, kept in the repo so every Claude Code
> session can read it. The source doc is authoritative; update this file when
> it changes.

## Overview

By demo day on 12/5, SPLIT V1 is a hosted web app where a student signs up, gets a skill list ranked from real job postings for their target role, and follows a weekly plan that adapts to their results. V1 builds on the existing prototype rather than starting over.

**Problem.** College students and early career professionals struggle to decide how to spend limited time between applying and building skills. Recruiting rewards application volume and speed over ability, and fast changing tools (especially AI) give no clear signal of which skills matter for a role. The result is scattered effort, less real improvement, and anxiety about falling behind.

**Evidence from interviews.**

- Keerti: finding jobs feels more about how early you apply than about your skills.
- Victoria: with so many opportunities, students have to be far more selective with their time than in high school.
- Meera: with new AI tools every day, she can't tell which ones matter and wishes she knew what to keep up with.

**Positioning.** For students recruiting for internships and entry-level roles who don't know where their effort should go, SPLIT is a weekly career coach that finds where their recruiting funnel breaks and tells them how to split their time. Unlike Handshake and LinkedIn (find jobs) or Huntr and spreadsheets (log applications), SPLIT explains why results are stalling and changes the plan based on what actually happens.

## Goals and success metrics

The demo day goal is a live product with real users and real data behind the skill rankings, not a polished mock.

**Goals for V1 (by 12/5)**

1. **Accounts:** a student can sign up, log in on any device, and find their data waiting.
2. **Real skill signal:** skill rankings for each role come from actual job postings pulled online, with the posting count and date shown.
3. **A full weekly loop that works:** onboarding, plan, check-in, updated plan, and a history of past weeks.
4. **The user testing notes are fixed** (check-in button, hour clarity, past weeks, clickable applications).
5. **At least 10 real students** using it for 2+ weeks before demo day.

**Non-goals for V1**

- Mobile apps (the web app must work on phones, but no native app)
- Automatic application tracking through a Chrome extension or email parsing
- Mentor matching, social features, or company-specific question banks
- Paid plans or monetization

### Success metrics

| Metric | Target for demo day | How we measure |
| --- | --- | --- |
| Active pilot users | 10+ students, 2+ weeks each | Accounts with 2+ check-ins |
| Weekly check-in rate | 60% of active users each week | Check-ins / active users |
| Plan follow-through | Logged hours within 25% of the recommended split | Check-in hours vs. plan |
| Trust in the skill list | 70% agree it matches what their role needs | 1 question survey after onboarding |
| Skill acted on | 50% can name one skill they worked on because of SPLIT | Exit survey |
| Anxiety reduced | Average confidence rises by 1+ point on a 1 to 5 scale | Survey at signup and at week 2 |

The original goal that 40% of users land a role is a long term metric. It can't be measured in a 5 week pilot, so it moves to post-launch tracking.

**How we measure.** Survey questions live inside the product, so no separate form is needed: confidence (1 to 5) at signup and again in the week 2 check-in, and "Does this list match what your role needs?" right after the skill list first loads. Check-in rate and follow-through come from `week_snapshots` through one saved SQL query. The pilot lead pulls the numbers every Monday starting 11/16.

## Users

V1 serves college students recruiting for internships and entry-level roles in five roles: data analyst, software engineer, product manager, consulting, and business analyst.

| Persona | Who | What they need from SPLIT |
| --- | --- | --- |
| The mass applier | Sophomore or junior, 50+ applications sent, few replies | Proof of where the funnel breaks and permission to apply less but better |
| The unsure upskiller | Freshman or sophomore, few applications, worried about AI tools | A short ranked list of what to learn for their role, with a project to show it |
| The interview staller | Junior or senior, gets interviews but no offers | Targeted interview practice and a story bank |

**Expected scale.** About 10 to 30 pilot users through 12/5, recruited from TPC, HBA, BHP, and friends. The architecture should support a few hundred users at no cost, but V1 is not built for thousands.

**How they find it.** Direct invite links from the team, a TPC or HBA announcement, and a QR code at demo day.

## Current state

The TPC-2026 repo already holds a working prototype of about 2,300 lines of plain HTML, CSS, and JavaScript, with no backend and no build step.

### Already built

| Area | What works today |
| --- | --- |
| Onboarding | Role, school, year, weekly hours, results so far, resume upload |
| Diagnosis | Compares the funnel (applied, reply, interview, offer) to typical ranges; ranks causes: timing, tailoring, referrals, volume, skill gaps, stories, interviews |
| Weekly plan | Splits hours across applying, building skills, and interview prep; each task has a "Why this?" |
| Check-in | Logs the week, tests whether last week's change worked, re-runs the diagnosis |
| Resume reader | PDF and Word upload; finds role skills and the resume line for each; suggests bullet fixes |
| Interview practice | Behavioral, role-specific, and technical questions; STAR editor; line-by-line feedback and a strong example |
| AI feedback | Uses Claude when run as a Claude artifact; falls back to a rule checker elsewhere |

### Known issues

- **The app does not load as uploaded.** `index.html` loads `css/styles.css` and `js/*.js`, but every file sits in the repo root. On GitHub Pages it shows an unstyled, empty page.
- **Skill data is placeholder.** The "% of postings" numbers and typical funnel ranges in `data.js` are illustrative, and the diagnosis depends on them.
- **Browser-only storage.** All data lives in `localStorage` under one key, so it is lost across devices or when the browser is cleared.
- **AI only works inside a Claude artifact.** Hosted elsewhere, users only get the rule checker.
- **One global scope.** Five scripts share globals and depend on load order, which makes parallel work risky.

### Open user testing notes (from Deliverable #5 and team testing)

- Hour numbers in the to-do list are unclear, and users can't allocate less than 3 hours
- The check-in button doesn't reliably work
- No way to look at past weeks
- Can't easily see applications or the resume; clicking an application should open it
- Number of internships should show on the home page
- Skill and project tracking with progress bars
- Some skills confuse users ("missing" but no explanation of what it is)
- Resources must match the suggested skill; resume projects need a guided doc
- Application logging is manual; users want import from their Google Sheets tracker

## V1 scope

V1 ships nine features: six P0s that must work on demo day, and three P1s that ship only if the P0s are done by 11/23.

| # | Feature | Priority | Status today |
| --- | --- | --- | --- |
| F1 | Accounts and login | P0 | New |
| F2 | Cloud saved data | P0 | New (replaces localStorage) |
| F3 | Real skill rankings by role | P0 | New (replaces placeholder data) |
| F4 | Onboarding | P0 | Exists, needs updates |
| F5 | Weekly plan and check-in loop | P0 | Exists, needs fixes |
| F6 | Week history and progress | P0 | New |
| F7 | Applications tracker and Sheets import | P1 | Partly exists |
| F8 | Skill tracking and guided projects | P1 | Partly exists |
| F9 | Job description fit check | P1 | New |

Resume reading and interview practice already work and stay as they are, except that AI feedback moves to a server call (F2) so it works outside a Claude artifact.

### F1. Accounts and login (P0)

- Sign up and log in with email and password, or with Google.
- Password reset by email.
- Each user sees only their own data.
- **Done when:** a user signs up on a laptop, logs in on a phone, and sees the same plan.

### F2. Cloud saved data (P0)

- All user data is saved to the database, not the browser. For V1, the prototype's whole state object is stored as one JSON record per user, so the existing code changes as little as possible.
- Writes save automatically after each change, with a visible "Saved" state.
- A one time import moves existing `localStorage` data into the account on first login; the "See an example" sample data is never imported.
- AI feedback (resume and interview review) runs through a server function that holds the Claude API key, never in the browser.
- **Done when:** clearing the browser and logging back in loses nothing, and AI feedback works on the hosted site.

### F3. Real skill rankings by role (P0)

- For each of the 5 roles, show the top 10 to 15 skills ranked by the share of real job postings that mention them.
- Each skill shows its share (for example, "SQL: in 72% of 140 data analyst postings"), a one line plain English explanation of what it is, and when the data was last refreshed.
- Each skill is marked **Have** or **Gap** from the user's resume and onboarding answers, so the list doubles as a gap analysis.
- Rankings refresh weekly from online sources (see Skill data pipeline).
- **Done when:** every role has rankings built from at least 100 currently open postings, every skill has an explanation, and no placeholder numbers remain in the UI.

### F4. Onboarding (P0)

- Keep: role, school, year, major, weekly hours, results so far, resume upload.
- Add: GPA (optional), recruiting season, and current number of internships or offers.
- Show a short "why we ask" note next to sensitive fields.
- **Done when:** a new user finishes onboarding in under 5 minutes and lands on a plan.

### F5. Weekly plan and check-in loop (P0)

- Fix the check-in button so it always opens and saves.
- Check-ins ask for hours spent in each category (applying, skills, interview prep), so follow-through can be measured.
- Show hours as clear numbers per task and per category, with a total that matches the user's weekly hours.
- Allow weekly hours as low as 1 (remove the 3 hour floor).
- Show the number of internships applied to and offers on the home page.
- After a check-in, show what changed in next week's plan and why.
- **Done when:** a test user completes 2 full check-in cycles with no bugs, and can explain from the screen why their plan changed.

**How the weekly split is calculated.** The weakest funnel stage sets the starting split; the recruiting season and the user's hours then adjust it, and the existing cause scores pick the tasks inside each category.

| Weakest stage | Signal | Applying | Skills | Interview prep |
| --- | --- | --- | --- | --- |
| Too few applications | Fewer than 8 sent in the last 2 weeks | 60% | 25% | 15% |
| Applied, few replies | Reply rate below the role's range | 30% | 50% | 20% |
| Replies, few offers | Interviews but no next round or offer | 20% | 25% | 55% |
| Not enough data | Fewer than 8 applications at least 2 weeks old | 40% | 40% | 20% |

- Peak season (August to November) moves 10 points from skills to applying; the off season moves 10 points the other way.
- Under 4 hours a week, the plan shows at most 3 tasks of at least 0.5 hours each.
- If last week's change worked, the plan keeps it; if it shows no effect for 2 weeks, it swaps in the next ranked cause.
- **Evidence card.** For users applying in high volume, the plan shows their own reply rate on tailored versus untailored applications, to make the case for fewer, stronger applications. This directly tests the key assumption.

### F6. Week history and progress (P0)

- A History page listing every past week: plan, hours logged, applications sent, replies, and the diagnosis at the time.
- Funnel chart over time (applied, replies, interviews, offers).
- Progress bars for each weekly goal.
- **Done when:** a user can open any past week and see exactly what they planned and did.

### F7. Applications tracker and Sheets import (P1)

- Clickable application cards that open a detail view (company, role, dates, status, posting link, tailored or not, referral or not).
- Import from a Google Sheets tracker by uploading a CSV export, with a column mapping step.
- Applications older than 30 days with no reply can be marked "No longer in consideration" with one click.
- **Done when:** a user imports a real 20+ row tracker in under 2 minutes.

### F8. Skill tracking and guided projects (P1)

- Mark a skill as "learning" and log hours toward a goal, with a progress bar.
- Every skill links to one free resource that actually teaches that skill.
- Each top skill has one resume-ready project with a short guided doc (goal, steps, what to put on the resume).
- **Done when:** every top 5 skill for every role has a matching resource and project guide.

### F9. Job description fit check (P1)

- Paste a job posting; SPLIT shows which of its skills the resume covers, which are missing, and a simple match score.
- Repeated rejections for postings with the same missing skill feed into the diagnosis.
- **Done when:** a pasted posting returns a fit result in under 10 seconds.

### Out of scope for V1

| Idea | Why not now | Bring back if |
| --- | --- | --- |
| Chrome extension that logs applications | Separate codebase and store review; CSV import covers the need | Pilot users stop logging by hand |
| Email or phone reminders | Needs an email service and opt-in flows | Weekly check-in rate drops below 50% |
| Google Calendar sync | OAuth scopes and scheduling logic | Users ask when to do their tasks |
| Mentor and alumni matching | Needs supply on both sides | Users don't trust the skill list without a person behind it |
| Company-specific question banks | Hard to source legally at scale | Users name specific target companies |
| Recruiting calendars by role | Needs curated dates per firm | Onboarding timeline answers are often wrong |
| Transcript upload | Sensitive data, little value for the plan | Users want coursework counted as skills |
| Streaks, badges, celebrations | Not core to the problem | Engagement is low but satisfaction is high |
| Networking and social features | Peer comparison can raise anxiety | Users say they want to see what's normal |
| More roles beyond the 5 | Data pipeline must prove itself first | Pilot users outside the 5 roles ask for it |

## Technical architecture

V1 keeps the existing front end and adds Supabase for accounts, the database, and server functions, so the team writes almost no backend code and pays nothing at pilot scale.

The browser talks only to Supabase. The Claude API key and the job board calls live in server functions, and row level security stops any user from reading another user's data.

### Stack

| Layer | Choice | Why |
| --- | --- | --- |
| Front end | Existing HTML, CSS, JS, plus `supabase-js` from a CDN | No rewrite; keeps the no build setup |
| Hosting | Vercel or Netlify (free) | Preview link for every pull request |
| Accounts | Supabase Auth | Email, Google login, and password reset built in |
| Database | Supabase Postgres with row level security | Free tier covers the pilot; SQL the team can read |
| Server functions | Supabase Edge Functions | Hold the Claude key; run the collector |
| Scheduling | Supabase cron | Runs the collector every Monday in batches of about 10 companies, because each function run has a time limit |
| AI | Claude API | Already used in the prototype's review prompts; a small, low cost model for skill extraction |

### Data model

| Table | Key fields | Owner |
| --- | --- | --- |
| `profiles` | name, school, year, major, GPA (optional), role, season, weekly hours | User |
| `user_state` | the prototype's full state object as JSON (applications, plans, skill log, answers, resume text, debriefs), last updated | User |
| `week_snapshots` | week start, plan, hours by category, applications sent, replies, interviews, diagnosis | User |
| `ai_usage` | date, number of AI reviews | User (written by server) |
| `sources` | company, board type, board token, active | System |
| `job_postings` | source, company, posting ID, title, role, text, first seen, closed | System |
| `skill_stats` | role, skill, share of postings, posting count, refresh date | System |

User tables allow access only to the row owner. `week_snapshots` is written at each check-in and powers both the History page and the pilot metrics. Splitting `user_state` into separate tables is post demo work. System tables are read-only to users and written only by server functions.

### Privacy

- Collect only what the plan uses; GPA is optional and transcripts are out of scope.
- A "Delete my account" button removes every user row and the stored resume.
- Resume text and answers go to the Claude API only when the user asks for a review.
- Only the public Supabase key ships in the browser; the service key and the Claude key live only in server secrets.
- The AI function rejects anyone not logged in and caps reviews at 20 per user per day.

## Skill data pipeline

Skill rankings come from public job board APIs that return full posting text, refreshed weekly, and never from scraping sites whose terms forbid it.

### Sources

| Source | What it gives | Use in V1 |
| --- | --- | --- |
| Greenhouse Job Board API | Every open job at a company that uses Greenhouse, with full HTML descriptions (`content=true`); no auth needed to read | Primary source |
| Lever and Ashby public job boards | Similar public posting feeds for companies on those systems | Secondary source (confirm endpoints and terms in M2) |
| Adzuna API | Broad job search by keyword and country; self-serve keys, but results carry only a description excerpt and usage has rate caps | Optional: posting volume by title, not skill counting |
| Lightcast Open Skills | A standard skills taxonomy and a free Skills API that maps text to skill IDs | Normalize skill names (confirm free tier limits) |

**Not used:** LinkedIn, Indeed, Glassdoor, and Handshake. Their terms prohibit scraping, and a demo day product built on scraped data is a risk for the team and TPC.

### How it works

1. **Company list.** The team curates 80 to 150 companies that hire interns and new grads in the 5 roles and use Greenhouse, Lever, or Ashby, stored in a `sources` table. Many large consulting and banking firms use Workday, which has no public feed, so those roles lean on boutique firms, startups, and in-house strategy teams.
2. **Collect.** Every Monday, the collector pulls every open posting from each company in small batches and stores the raw text in `job_postings`, deduplicated by company and posting ID. Postings that disappear are marked closed, not deleted.
3. **Filter and classify.** Keep only internship and entry-level postings (title keywords such as intern, new grad, analyst, associate, early career). Assign each to one of the 5 roles by title rules, with Claude as a tiebreaker for unclear titles.
4. **Extract skills.** Run the existing keyword dictionary (`SYN` in `data.js`, expanded) on every posting, then a Claude pass that returns any further skills as JSON. Map every skill to one canonical name. Each posting is extracted once and cached.
5. **Aggregate.** For each role, compute the share of currently open postings that mention each skill, and write the result to `skill_stats` with the posting count and refresh date.
6. **Serve.** The app reads `skill_stats`; it never calls job APIs from the browser.

### Quality rules

- A role's rankings show only when it has 100 or more open postings; otherwise the UI says "Not enough data yet".
- Show a skill only if at least 5% of that role's postings mention it.
- Every ranking displays its sample size and refresh date, so users can judge it.
- A team member spot checks 20 extracted postings per role before demo day and records the accuracy.
- Postings per role are tracked weekly; if consulting or business analyst is still under 100 on 11/15, they merge into one "Business and consulting" ranking for V1.

**Typical funnel ranges.** Job postings don't reveal reply or interview rates, and 10 to 30 pilot users are too few to pool. For V1, the diagnosis keeps clearly labeled estimates, cites a published source for each range where one exists, and compares each user mainly to their own trend week over week.

## Milestones and timeline

All P0 features land by 11/20, P1 work happens only if that date holds, and features freeze on 12/1 so the last four days go to bug fixes and demo prep.

The skill pipeline starts in the first week of November, in parallel with accounts, so 3+ weeks of postings build up before demo day. Pilot users join on 11/11, right after cloud saving works, so each can log three Monday check-ins (11/16, 11/23, 11/30) before demo day; core loop fixes reach them as they ship.

| Milestone | Build stages | Exit criteria |
| --- | --- | --- |
| Setup and accounts | 1 to 3 | Live URL loads; users log in on two devices |
| Cloud data and AI | 4 to 5 | No data lost on browser clear; AI reviews work on the live site |
| Skill data pipeline | 6 to 8 | Every role ranked from 100+ real postings; no placeholders in the UI |
| Plan, check-in, history | 9 to 11 | Two clean check-in cycles; past weeks viewable |
| P1 go or no-go (11/23) | none | All P0 exit criteria met; otherwise P1 is cut |
| P1 features | 12 to 14 | Whichever P1s fit before 11/30 |
| Bug bash and demo prep | 15 | Full demo runs twice with no errors; metrics slide built from pilot data |

Key dates: Oct 28 – Nov 3 setup and accounts · Nov 2 – Nov 9 cloud data and AI · Nov 2 – Nov 15 skill pipeline · Nov 9 – Nov 20 plan, check-in, history · **Nov 11 pilot starts (20+ users)** · Nov 18 – Nov 30 P1 features · **Nov 23 P1 go/no-go** · Nov 23 – Nov 29 Thanksgiving break · **Dec 1 feature freeze** · Dec 1 – Dec 4 bug bash and demo prep · **Dec 5 demo day**.

**Suggested workstreams for 5 people:** one on accounts and data (stages 2 to 5), two on the skill pipeline (6 to 8), one on the core loop UI (1, 9 to 11), and one on pilot users, testing, and the demo story throughout.

### Demo story (5 minutes)

1. The problem, in Keerti's and Meera's words.
2. Live: sign up and finish onboarding as a new student.
3. The skill list for that role, built from real postings, with the sample size on screen.
4. The weekly split and why, then a check-in that changes next week's plan.
5. Pilot results: check-in rate, follow-through, trust in the skill list, and change in confidence.

## Build stages for Claude Code

Each stage below is one Claude Code session: start a fresh session per stage, point it at this PRD and the stage, and stop when its "done when" is true.

**Before stage 1:** add two files to the repo. `CLAUDE.md` holds the stack, how to run the app, folder layout, and team rules. `docs/PRD.md` holds an export of this doc. Open every session with: "Read CLAUDE.md and docs/PRD.md, then do stage N."

| Stage | Session goal | Done when | Feature |
| --- | --- | --- | --- |
| 1 | Fix the folder layout (`css/`, `js/`), deploy to Vercel or Netlify | The live URL loads the full app | Setup |
| 2 | Create the Supabase project, schema, and row level security | All tables exist; a test user can't read another user's rows | F1, F2 |
| 3 | Add sign up, log in, Google login, password reset | A user logs in on two devices | F1 |
| 4 | Replace `save()` and `load()` with Supabase reads and writes, plus the one time localStorage import | Clearing the browser loses nothing | F2 |
| 5 | Move AI feedback to a server function holding the Claude API key | Resume and interview reviews work on the live site | F2 |
| 6 | Build the Greenhouse collector and the weekly schedule | 500+ raw postings stored with no duplicates | F3 |
| 7 | Classify roles, extract skills, aggregate into `skill_stats` | Each role has rankings from 100+ postings | F3 |
| 8 | Point the Skills page and diagnosis at `skill_stats`, add skill explanations | No placeholder numbers left in the UI | F3 |
| 9 | Onboarding updates | New fields saved; flow under 5 minutes | F4 |
| 10 | Plan and check-in fixes | 2 full check-in cycles with no bugs | F5 |
| 11 | History page, funnel over time, goal progress bars | Any past week opens with its plan and results | F6 |
| 12 | Application detail view and CSV import | A 20+ row tracker imports in under 2 minutes | F7 |
| 13 | Skill tracking, resources, guided project docs | Top 5 skills per role all have a resource and a guide | F8 |
| 14 | Job description fit check | A pasted posting returns a fit result in under 10 seconds | F9 |
| 15 | Bug bash, demo account with seed data, demo script | A full demo runs start to finish twice with no errors | Demo |

### Working rules

- One stage per branch and pull request; merge only after another teammate clicks through it on the preview link.
- Ask Claude to plan first and wait for approval before editing, for stages 2, 4, 6, and 7.
- Never paste API keys into chat or code; keys live in Supabase secrets and the hosting dashboard.

## Risks and open questions

The biggest risk is time: accounts, a database, and a data pipeline in 5 weeks, with Thanksgiving in the middle.

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Migration to Supabase breaks working features | High | Stage 4 keeps the same `S` object shape; test every page before merging |
| Too few entry-level postings per role | High | Start collecting in week 2; add companies to the source list; merge thin roles (see Quality rules) |
| Skill extraction is inaccurate | Medium | Keyword dictionary first, Claude second, plus a 20 posting spot check per role |
| Claude API costs | Low | Use a small model for extraction, cache results per posting, cap AI reviews per user per day |
| Not enough pilot users for metrics | Medium | Recruit 20+ by 11/11 through TPC, HBA, and BHP so 10 stay active |
| Thanksgiving week (11/23 to 11/29) loses capacity | Medium | P1 features are cut first; feature freeze on 12/1 |
| Sensitive data (resumes, GPA) in a student-built app | Medium | Row level security, no data sharing, a short privacy note, a delete account button |
| Key assumption: students change behavior given a clear plan | High | Measure plan follow-through from week 1; if low, add the "fewer, stronger applications" evidence to the plan screen |

### Open questions

- [ ] By 10/30: who owns each workstream (accounts and data, skill pipeline, core loop UI, pilot and demo)?
- [ ] By 10/30: does TPC provide a budget or API credits for the Claude API?
- [ ] By 10/30: Vercel or Netlify for hosting?
- [ ] By 11/4: which 80 to 150 companies go on the source list, and who builds it?
- [ ] By 11/11: which published sources back the typical funnel ranges for each role?
- [ ] What do judges score on demo day (live product, metrics, story)?

## Revision history

This version went through three review passes on 10/28; each found gaps and fixed them in place.

| Pass | Weakness found | Fix |
| --- | --- | --- |
| 1. Product logic | The weekly time split, SPLIT's core promise, had no rules | Added split rules by weakest funnel stage, season, and hours (F5) |
| 1. Product logic | Nothing in the product tested the key assumption | Added the evidence card comparing tailored and untailored reply rates |
| 1. Product logic | Check-ins didn't capture hours per category, so follow-through couldn't be measured | Check-ins now log hours by category |
| 1. Product logic | Skill list didn't show what the user already has | Added Have and Gap labels (F3) |
| 1. Product logic | Pooling funnel data from 10 to 30 users isn't valid | Labeled estimates with sources, plus each user's own trend |
| 2. Technical | Splitting the state into 7 tables in week 2 risked breaking working features | Store the prototype state as one JSON record; add week snapshots for history and metrics |
| 2. Technical | One long collector run could hit function time limits | Collector runs in batches of about 10 companies; extraction is cached |
| 2. Technical | Consulting and banking firms often aren't on public job boards | Source guidance plus a fallback that merges thin roles |
| 2. Technical | No limits or key rules on the AI function | Login required, 20 reviews per user per day, keys only in server secrets |
| 2. Technical | Sample data could leak into real accounts on import | Import skips the example data |
| 3. Execution | Pilot started 11/15, too late for 2+ weeks of check-ins | Pilot starts 11/11 with Monday check-ins on 11/16, 11/23, 11/30 |
| 3. Execution | Metrics had no collection plan or owner | Added in-product survey questions and a weekly metrics pull |
| 3. Execution | No plan for the demo itself | Added a 5 minute demo story |
| 3. Execution | Open questions had no deadlines | Each now has a decide-by date |

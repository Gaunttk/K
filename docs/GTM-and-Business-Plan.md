# Go-To-Market & Business Plan
### (Working name: RecruitPath → rename candidates inside)
Prepared 2026-05-30 · Kevin Gauntt (eng) + Greg Raney (product)


## 0. The one-sentence thesis

The recruiting-software market is large, growing, and dominated by players that sell exposure. There is an open lane for a product that sells truth — an accurate, data-driven, honest assessment of where an athlete can actually compete — and uses that credibility as the wedge into a profitable freemium business and, later, a coach-side product.

Everything below ladders up to that thesis.


## 1. Market reality (so we build with eyes open)

Size & growth. The sports-recruiting software market was valued around $1.06B in 2024 and is projected near $2.05B by 2032 (~10% CAGR), with North America holding ~42% share. This is a real, expanding market — not a niche.

Who we're up against:

| Player | What they are | Where they're weak |
|---|---|---|
| NCSA (owned by IMG Academy, ~1,100 employees) | The 800-lb gorilla on the athlete side. Network + advisors + upsell. | Perceived as a high-pressure sales machine. Athletes/parents distrust the "pay-to-play exposure" model. |
| SportsRecruits | Verified profiles, club/coach connections. | Public stumbles on data accuracy/sync (stale tournament stats confusing scouts, Feb 2026). Accuracy is their soft underbelly — and our wedge. |
| FieldLevel | Recruiting marketplace / network. | Network-effect product; less about honest self-assessment. |
| Hudl | Video analysis — the de facto highlight tool. | Not a fit/assessment engine. Partner, not competitor. |
| Front Rush / Stack Athlete (ex-CaptainU) | Coach-side CRM / athlete profiles. | Front Rush owns the coach CRM lane — informs our eventual coach product, but they don't do athlete-facing honest fit. |

The strategic read: The incumbents compete on exposure and network size. None of them lead with "here is the honest, data-backed truth about your division fit, and the specific gap between you and your target." That is exactly what RecruitPath's calibration engine + fit score + program score already do. Accuracy and honesty are the positioning — and the market just handed us a live example (SportsRecruits' data trust problem) of why it matters.


## 2. Brand & rename

"RecruitPath" is serviceable but generic and crowded (every competitor has "recruit" in it). The brand should signal the wedge: measurement, honesty, fit. Below are directions, not a decree — pick the one that feels right and then verify availability before committing (see the checklist).

Direction A — Measurement / athletic caliber
- Caliber — conveys both skill level and precise measurement. Athletic, confident, one word. "Know your Caliber."
- Risk: common English word → trademark/domain harder.

Direction B — The core question the product answers (my favorite for word-of-mouth & SEO)
- Recruitable — maps 1:1 to the question every athlete and parent is actually asking: "Am I recruitable, and at what level?" It's a natural search phrase and a natural sentence ("Recruitable says I'm a D2 fit"). Built-in marketing.

Direction C — Honest north-star / clarity
- TrueFit, Northstar Recruiting, Clearside — lean into honesty + direction.

Direction D — Proving ground
- Provingground / The Proving Ground — athletic grit, "earn your spot." Strong identity, but longer.

Recommendation: Shortlist Recruitable (category-defining, conversational, SEO-native) and Caliber (premium, brandable). Run the verification checklist on both.

Pre-commit verification checklist (do this — don't skip):
1. USPTO trademark search (TESS) in the relevant classes (software/SaaS = Class 9, 42; possibly 41).
2. Domain availability (.com ideally; .app/.io acceptable fallback).
3. Handle availability (IG, TikTok, X, YouTube) — same string everywhere.
4. Google the name + "recruiting" for live conflicts.
5. App Store / Play Store name collision check.

Brand voice (whatever the name): Straight-talking coach, not a hype man. We tell athletes the truth — including hard truths — because that's what actually gets them recruited. This voice is the moat.


## 3. Positioning & the wedge

Positioning statement:
For high-school athletes and their families who want to compete in college, [Name] is the recruiting assistant that gives you an honest, data-driven assessment of where you can actually play — and the exact plan to get there — unlike exposure platforms that just sell you a bigger megaphone.

Three pillars (these become marketing, product, and the agent mandates):
1. Accurate — the data is right, fresh, and we can prove it. (Directly attacks the incumbent weakness.)
2. Honest — the fit/division assessment tells the truth, including the gap. We are the athlete's advocate, not a salesperson.
3. Actionable — every assessment ends in a plan (close the 40-time gap, target these 12 programs, contact these coaches).


## 4. Target customer & what we must learn

Primary buyer: the parent of a 14-18 y/o athlete (they pay). Primary user: the athlete (they engage). Different messages for each — parent wants ROI and safety; athlete wants status and a real shot.

Beachhead: Pick one or two sports + one or two regions to dominate before going broad. Recommendation: Soccer and Baseball/Softball (large club/travel ecosystems, motivated parents, year-round seasons → continuous engagement) in your home region (Kansas City / Midwest) where you can show up at events in person. Football is huge but NCSA-saturated; enter it second once you have proof and the performance-metrics engine (Greg's spec) is sharp.

What we must learn (and the calibration engine already collects the raw material):
- Which factors actually drive a family's school decision (distance? scholarship $? academic fit? playing time?). The 6 shared preference questions are a goldmine — instrument them.
- Where users drop off in the profile builder (every empty field is lost fit-score accuracy).
- Which assessments users trust vs. dispute (trust is the product).
- Willingness to pay and the moment it occurs (what triggers the upgrade).

This is the Data Analytics agent's charter (Section 8.4).


## 5. Business model & pricing

Model: freemium → subscription, with a clear "aha" before the paywall.

- Free: full profile + calibration interview + division-fit band + a limited number of school fit-scores and saved schools. (Give away the insight — the honest assessment — because it builds trust and word-of-mouth. Gate scale and workflow.)
- Pro (~$15-25/mo or a season pass ~$99-149): unlimited schools, full coach contact database + AI email drafting, pipeline/Kanban with drag-to-move, Scout Reports, gap-closing plan, alerts.
- Family / multi-athlete tier later.
- Season pass framing beats monthly for this audience — recruiting is seasonal and parents think in school years, not months. It also smooths churn.

Unit-economics watch-items:
- AI cost per user (Haiku is the right call — keep email drafting + Scout Reports on Haiku; reserve bigger models for nothing user-facing unless it pays for itself).
- Supabase SMTP cap (3 emails/hr free tier) will throttle you — budget for custom SMTP (e.g., Resend/Postmark) before any real launch.
- CAC: in-person at clubs/tournaments + organic ("Am I recruitable?" SEO) should keep CAC far below NCSA's sales-heavy model. That cost advantage is the business.

Do not monetize by selling athlete data or running third-party targeted ads. Beyond being legally radioactive with minors (Section 7), it would destroy the trust that is our entire moat.


## 6. Credibility in the athlete community (the hardest, most important part)

Trust is earned, not bought. Concrete plays:

1. Show your work. Every fit/division assessment should be explainable: "You're a D2 fit because X, Y, Z; here's your gap to FCS." Transparency = credibility.
2. Data-accuracy as a public promise. Show "coach info last verified on [date]" on every coach record. Make freshness visible. This directly contrasts with the stale-data trust problems competitors have had.
3. Be present where the trust lives. Club coaches, travel-team directors, and HS coaches are the gatekeepers of parent trust. Win a handful of respected club programs as design partners → they vouch for you.
4. Free value first. The honest assessment, free, no sales call. The anti-NCSA. Let the product's honesty market itself.
5. Outcomes flywheel. Capture commitments ("I committed to ___"). Real outcomes → testimonials → credibility → more athletes. Build the data capture for this now.


## 7. Data security & privacy (you are storing minors' data — this is not optional)

This is a strategic asset AND a liability. Treated right, "we protect your kid's data better than anyone" becomes a parent-facing selling point.

The legal landscape as of 2026 (verify with counsel — this is orientation, not legal advice):
- COPPA governs personal info from children under 13. Most of your athletes are 14-18, so the strict COPPA regime applies mainly to any under-13 signups — but the 2025 COPPA amendments (effective June 23, 2025; compliance deadline April 22, 2026 — already in force) reset the baseline expectation for all kids' data products: expanded definition of "personal information" (now includes biometric and government-issued identifiers), separate opt-in parental consent before any third-party disclosure / targeted ads, a mandatory written information security program, a written data-retention policy (no indefinite retention — delete when purpose is fulfilled), and stricter parental notice/consent.
- Teens 13-17 are increasingly covered by state laws (state comprehensive privacy acts with teen-specific provisions, age-appropriate design codes, and student-data-privacy laws). Several states require heightened treatment for minors up to 16/17/18.
- FERPA becomes relevant if/when you integrate with schools or handle education records — keep this in mind for the coach/school-facing roadmap.
- NIL (name/image/likeness) is adjacent: relevant if athletes ever monetize profiles; flag for later, not launch-blocking.

Practical guardrails to build now (cheaper than retrofitting):
- Verifiable parental consent flow for younger users; capture and store consent records. The 2025 rules even permit text-message-based consent — design for it.
- A written, published data-retention policy and a written security program — not because you're huge, but because the rule now expects it and it's a trust signal.
- Data minimization — collect only what improves the fit assessment. Every field should earn its place.
- Encryption at rest + in transit, least-privilege DB access, audit logging. (Supabase/Postgres + Prisma gives you good primitives — use RLS.)
- No third-party ad trackers on minors. Period.
- Deletion / export self-service for families.

This is the Privacy & Governance agent's charter (Section 8.3).


## 8. The agent operating model (how you run this as a solo-ish founder)

What a Claude Code subagent actually is: a named, isolated Claude instance with its own system prompt, its own context window, its own tool permissions, and optionally its own model. It lives as a Markdown file with YAML frontmatter in .claude/agents/ (project-scoped, commit it to the repo) or ~/.claude/agents/ (user-scoped, all your projects). Claude Code reads each agent's description to decide when to delegate — so the description is the most important line. You invoke them by asking ("have the privacy agent review this migration") or Claude Code routes automatically. Files load at startup, so restart the session after adding one. Each agent returns only its final summary to your main session, which keeps your main context clean.

Two cost facts to internalize:
- Route cheap/read-only work to Haiku via the model: field; reserve Sonnet/Opus for heavy reasoning. There's no reason a "check the schema for PII fields" task burns Opus tokens.
- Multi-agent workflows use ~4-7x more tokens than single-agent. Use agents for separation of concerns and constraint enforcement, not for everything.

These four agents are advisory/analytical, not autonomous operators. They review, suggest, draft, and report. A human (you) approves changes. That's the right posture for a product handling minors' data.

### 8.1 product-strategist — accuracy & algorithm tuning
Reviews the fit engine, calibration scoring, and program-score composite. Proposes concrete, testable tweaks ("weight athletic-div-fit higher for football once 40-time data exists"; "your fit score has no recency decay on coach interest"). Read-only on code; output is a prioritized list of suggested experiments with hypotheses.

### 8.2 growth-bizdev — sales & business development
Owns customer acquisition strategy: channel ideas, club/tournament partnership playbooks, SEO/content angles ("Am I recruitable?" content engine), referral mechanics, season-pass campaigns. Outputs concrete experiments with expected CAC/LTV implications.

### 8.3 privacy-governance — minors' data & compliance
The conscience of the product. Reviews any feature touching user data against COPPA (2025 rules), state teen-privacy laws, FERPA (school integrations), and data-minimization/retention principles. Flags risks, drafts policies, never rubber-stamps. Read-only on code.

### 8.4 data-analytics — usage analytics & insight reporting
Your domain — built detailed. Defines the metric taxonomy (activation, profile-completeness, calibration-completion, fit-trust, upgrade triggers, retention/cohorts), designs the event schema, writes SQL against the Postgres/Prisma data, and produces recurring insight reports. Turns the TrackingEvent table and calibration answers into product direction.


## 9. Product roadmap (sequenced)

Now → launch (athlete side):
1. Greg's performance-metrics engine (academic + sport-specific athletic fields + structured awards) — "that's the product." This is what makes the division-fit engine real. Prioritize it.
2. Data-freshness infrastructure (Section 10 / the visual) — accuracy is the brand.
3. Custom SMTP (unblock real coach outreach).
4. Pipeline drag-to-move (table-stakes UX).
5. Parental consent + retention/security baseline (Section 7).
6. Outcomes capture (commitments) for the credibility flywheel.

Later (coach side — the multidimensional expansion):
- A coach-facing view turns you from a tool families buy into a two-sided network (the NCSA/Front Rush territory). But earn the athlete data and trust first — the coach product is only valuable because of the verified athlete pool and honest assessments you'll have built. Don't split focus early.


## 10. Data operations & update cadence

The principle: match update frequency to how fast each data source actually changes, and make freshness visible to users.

| Tier | Data | Source | Cadence |
|---|---|---|---|
| Real-time | Athlete profiles, calibration answers, saved schools, pipeline, tracking events | User-generated | Continuous |
| Weekly-Monthly | Coach email verification / bounce handling, social-handle checks, logo gap-fill | Bounce data, Clearbit, scraping | Rolling |
| Seasonal / Post-season | Coaching changes (highest churn — football Nov-Jan, others spring), roster size, win%, recruiting rank, postseason results | Athletics sites, sports data | Per sport season |
| Annual | NCAA APR release, tuition/net price (College Scorecard), IPEDS campus data, conference realignment, school core records | Gov + NCAA releases | Yearly (on release) |
| Event-driven | Conference realignment announcements, coach hires/fires as they break, program score recompute | News / triggers | As events occur |

Governance rules:
- Coach data is the highest-value, highest-liability, highest-churn dataset. Verify aggressively; stamp every record with lastVerifiedAt; surface that date in the UI.
- Recompute programScore whenever an input changes (APR drop, postseason result) — don't let composites drift stale.
- Log every data update for auditability (and so the analytics agent can measure freshness as a metric).


## 11. Claude Code working tips

1. Commit a CLAUDE.md at repo root with your architecture rules (TS strict, shadcn-only, Prisma-only DB, Supabase-only auth, mobile-first, no hardcoded data, AI via /api routes). Claude Code reads it automatically every session.
2. Commit the four agents to .claude/agents/ so they're versioned and travel with the repo.
3. Use the /agents command to create/edit agents interactively if you'd rather not hand-edit YAML.
4. Restart the session after adding/editing an agent — they load at startup.
5. Give risky agents read-only tools (privacy + strategist get Read, Grep, Glob — no Edit/Bash).
6. Route by model: haiku for read/scan/report agents, sonnet for ones that draft substantive code or analysis.
7. Keep a /specs or /docs folder of feature specs (Greg's performance-metrics spec belongs there) and point agents at them.
8. Use plan mode before big changes; review the plan before letting it write.
9. Don't over-spawn. Multi-agent runs cost 4-7x tokens.


## 12. First 90 days (concrete)

- Weeks 1-2: Lock the name (run the checklist) + brand voice. Stand up CLAUDE.md + the four agents. Privacy agent does a baseline audit of current data handling.
- Weeks 3-6: Build Greg's performance-metrics engine. Wire up the analytics event schema (data-analytics agent designs it). Custom SMTP.
- Weeks 7-10: Parental consent + retention/security baseline. Data-freshness stamping on coach records. Pipeline drag-to-move.
- Weeks 11-13: Recruit 2-3 club programs as design partners in your beachhead sport/region. Turn on the "Am I recruitable?" free assessment as the top-of-funnel. First analytics insight report.


This plan is a living document. Re-run it through the strategist and bizdev agents quarterly and let the analytics agent tell you which assumptions in Sections 4-6 were wrong.

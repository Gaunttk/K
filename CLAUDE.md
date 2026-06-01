# RecruitPath — Claude Code Reference

This file is the authoritative context for Claude Code sessions on this project.
Read it before every session. It is version-controlled and should be kept current.

---

## What this product is

**RecruitPath** is a college sports recruiting CRM for high-school student athletes and their families. The core value proposition is honest, data-backed division-fit assessment — telling athletes the truth about where they can realistically compete and exactly what they need to close the gap — positioned directly against incumbent platforms (NCSA, SportsRecruits) that sell exposure and network size instead of accuracy.

One-sentence thesis from the business plan:
> "There is an open lane for a product that sells truth — an accurate, data-driven, honest assessment of where an athlete can actually compete — and uses that credibility as the wedge into a profitable freemium business and, later, a coach-side product."

---

## Current state of the repository (as of 2026-06-01)

This is a **pre-launch, planning-stage repository**. It contains:
- Strategic documentation (`docs/GTM-and-Business-Plan.md`)
- Four Claude Code advisory agents (`.claude/agents/`)
- This CLAUDE.md

There is **no application source code yet**. References to `src/`, `prisma/schema.prisma`, and `scripts/` throughout the agent files describe the architecture we are building toward, not files that currently exist.

---

## What the product does (feature set)

1. **Athlete profile builder** — Athletic performance data, academic stats (GPA, test scores), sport/position, graduation year, preferences.
2. **Calibration interview** — Six preference questions that determine which factors (distance, scholarship $, academic fit, playing time, etc.) drive the athlete's school decision. This data is instrumented for analytics.
3. **Division-fit assessment** — Algorithm produces an honest band (D1 / D2 / D3 / NAIA / JUCO) with explainable reasoning and the specific gap between current performance and target. This is the product's moat.
4. **School search & fit scoring** — Athletes search schools, view program-fit scores, and filter by division, sport, location, and academic criteria.
5. **Coach pipeline CRM** — Kanban-style tracking of coach contacts, outreach stages (drag-to-move), and AI-drafted email outreach.
6. **Scout Reports** — Detailed per-school profile + gap-closing action plan for the athlete.
7. **Outcomes capture** — Athletes log commitments; feeds the credibility flywheel (real outcomes → testimonials → more athletes).

### What is NOT built yet (roadmap)
- Greg's performance-metrics engine (academic + sport-specific athletic fields + structured awards) — **highest priority; this is what makes the division-fit engine real**
- Data-freshness infrastructure (coach records stamped with `lastVerifiedAt`, visible in UI)
- Custom SMTP (currently blocked at Supabase free tier: 3 emails/hr)
- Pipeline drag-to-move UX
- Parental consent flow and data-retention policy implementation
- Coach-facing product (phase 2 — after athlete side is established)

---

## Tech stack (planned/in-progress)

| Layer | Choice |
|---|---|
| Language | TypeScript (strict) |
| Frontend | Next.js (App Router), shadcn/ui only for components |
| Backend | Next.js API routes (`/api`) |
| Database | PostgreSQL via Supabase (production) |
| ORM | Prisma (all DB access goes through Prisma — no raw SQL in product code) |
| Auth | Supabase Auth only |
| AI features | Claude API — Haiku for user-facing features (email drafting, Scout Reports); Sonnet for internal/analytical work |
| SMTP | Supabase free tier now → Resend or Postmark before launch |
| Deployment | Vercel (implied) |
| Enrichment scripts | TypeScript, run with `npx ts-node` |

### Hard rules for code
- TypeScript strict — no `any`, no implicit returns
- shadcn/ui only for UI components — no importing other component libraries
- Prisma only for DB access — no raw SQL, no direct Supabase client for data
- Supabase Auth only — no rolling custom auth
- Mobile-first responsive design
- No hardcoded data — all config is environment-driven
- AI features go through `/api` routes — no direct Anthropic SDK calls from client components
- Row-level security (RLS) on all Supabase tables that hold user data

---

## Target users

| Role | Who | What they want |
|---|---|---|
| Primary user | 14–18 y/o athlete | Status, a real shot, honest assessment |
| Primary buyer | Athlete's parent | ROI, safety, no sales pressure |
| Secondary (future) | College coach | Verified athlete pool (phase 2 only) |

**Beachhead market**: Soccer and Baseball/Softball in the Kansas City / Midwest region before expanding broadly. Football is large but NCSA-saturated — enter second.

---

## Business model

**Freemium → subscription**

- **Free tier**: Full profile + calibration interview + division-fit band + limited school fit scores + limited saved schools. Free because the honest assessment is the top-of-funnel trust builder.
- **Pro tier** (~$15–25/mo or ~$99–149 season pass): Unlimited schools, full coach contact database, AI email drafting, pipeline/Kanban CRM, Scout Reports, gap-closing plan, alerts.
- **Season pass framing** preferred over monthly — recruiting is seasonal, parents think in school years, and it smooths churn.
- Family / multi-athlete tier is a later addition.

**Do not monetize via athlete data sales or third-party ads.** It is legally radioactive with minors and destroys the trust moat.

---

## Competitive landscape

| Competitor | Weakness we exploit |
|---|---|
| NCSA (~1,100 employees, owned by IMG Academy) | Perceived as high-pressure sales machine; "pay-to-play exposure" distrust |
| SportsRecruits | Had a public data accuracy/sync problem (stale stats, Feb 2026) — accuracy is their soft underbelly |
| FieldLevel | Network-effect product; no honest self-assessment |
| Hudl | Video analysis only — a partner, not a competitor |
| Front Rush / Stack Athlete | Coach-side CRM; no athlete-facing honest fit assessment |

---

## Brand & naming

The current working name is **RecruitPath** — serviceable but generic. Rename candidates under evaluation:
- **Recruitable** (leading candidate) — maps to the exact question families are asking; natural search phrase; SEO-native
- **Caliber** — premium feel, precise measurement connotation
- **TrueFit / Northstar** — honesty + direction framing

**Brand voice**: Straight-talking coach, not a hype man. Tell athletes the truth, including hard truths, because that's what actually gets them recruited.

Before committing to any name: USPTO trademark search (Classes 9, 41, 42), .com domain, social handles (IG/TikTok/X/YouTube), Google collision check, App Store / Play Store check.

---

## Privacy & compliance (non-negotiable)

Users are often minors. This is not optional.

- **COPPA (2025 amendments, in force April 22, 2026)**: Expanded PII definition, parental consent before third-party disclosure, mandatory written security program and data-retention policy, stricter notice/consent.
- **State teen-privacy laws**: Heightened treatment for minors 13–17 (some states up to 18) under state comprehensive privacy acts and age-appropriate design codes.
- **FERPA**: Relevant when integrating with schools or handling education records — flag for coach/school product.
- **NIL**: Adjacent if athletes ever monetize profiles — not launch-blocking but flag early.

**Guardrails to build now**:
- Verifiable parental consent flow for users under 13 (and best-practice notice for 13–17)
- Consent records stored with timestamps
- Written, published data-retention policy and security program
- Data minimization — every profile field must justify its existence by improving fit accuracy
- Encryption at rest and in transit; RLS on all user tables; audit logging
- No third-party ad trackers on minors, period
- Self-service deletion and data export for families

The `privacy-governance` agent reviews every schema change and feature touching user data before it ships.

---

## Data operations

| Tier | Data | Cadence |
|---|---|---|
| Real-time | Athlete profiles, calibration answers, saved schools, pipeline, tracking events | Continuous (user-generated) |
| Weekly-Monthly | Coach email verification, social-handle checks, logo gap-fill | Rolling |
| Seasonal | Coaching changes (football Nov–Jan, others spring), roster size, win%, recruiting rank, postseason | Per sport season |
| Annual | NCAA APR, tuition/net price (College Scorecard), IPEDS, conference realignment | Yearly on release |
| Event-driven | Conference realignment announcements, coach hires/fires, programScore recompute triggers | As events occur |

**Coach data is the highest-value, highest-liability, highest-churn dataset.** Every coach record must have a `lastVerifiedAt` timestamp surfaced in the UI. Recompute `programScore` whenever any input changes — don't let composites go stale.

---

## Advisory agents (`.claude/agents/`)

Four read-only advisory agents are committed to `.claude/agents/`. They review, suggest, and report. A human approves all changes.

| Agent | Trigger it for | Tools |
|---|---|---|
| `product-strategist` | Fit algorithm accuracy, scoring logic, division-fit engine design, program score audits | Read, Glob, Grep |
| `growth-bizdev` | Sales strategy, GTM, pricing, partnership targets, funnel conversion | Read, Glob, Grep |
| `privacy-governance` | Any schema change or feature touching user data; COPPA/FERPA/state law review; NCAA contact rules | Read, Glob, Grep |
| `data-analytics` | Usage analytics, data quality audits, insight reports, SQL against the schema | Read, Glob, Grep, Bash |

Call explicitly: *"Have the privacy-governance agent review this migration."*
Or Claude Code routes automatically based on your request.

**Model routing**: All four agents use `claude-sonnet-4-6`. For cheap read/scan tasks, route to Haiku by overriding the model field temporarily. Multi-agent runs cost ~4–7× tokens — don't over-spawn.

---

## Key source files (once the codebase exists)

| Path | What it contains |
|---|---|
| `prisma/schema.prisma` | Full data model — start here before any feature work |
| `src/lib/program-score.ts` | Program scoring / composite logic |
| `src/lib/calibration/types.ts` | Calibration interview types |
| `src/lib/toolkit/position-profiles.ts` | Position-level athletic benchmarks |
| `src/app/profile/` | Athlete profile builder UI |
| `src/app/dashboard/` | Post-login landing, fit summary |
| `src/app/schools/` | School search and fit browsing |
| `src/app/pipeline/` | Coach contact CRM / Kanban |
| `scripts/` | Enrichment and audit scripts (`npx ts-node`) |
| `docs/GTM-and-Business-Plan.md` | Product strategy and business plan |

---

## Development priorities (ordered)

1. Greg's **performance-metrics engine** — sport-specific athletic fields, academic fields, structured awards. This is the foundation of the fit engine.
2. **Data-freshness infrastructure** — `lastVerifiedAt` on coach records, visible in UI.
3. **Custom SMTP** — unblock real coach outreach volume.
4. **Pipeline drag-to-move** — table-stakes UX.
5. **Parental consent + data-retention baseline** — required before any real launch.
6. **Outcomes capture** — commitment logging for the credibility flywheel.
7. **Coach-facing product** — phase 2, after athlete side is established.

---

## Working conventions

- Use **plan mode** before any large change; review the plan before writing.
- Commit specs for major features in `docs/` and point agents at them.
- The `privacy-governance` agent reviews any schema change or new data field before it ships — not after.
- Keep this CLAUDE.md current. When architecture decisions change, update this file in the same commit.

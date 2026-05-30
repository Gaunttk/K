# RecruitPath

College sports recruiting CRM for student athletes and families.

## Claude Code Agents

Four advisory agents live in `.claude/agents/`. They review, suggest, and report — a human approves changes.

| Agent | Role | Tools | Model |
|---|---|---|---|
| product-strategist | Fit/algorithm accuracy tuning | Read-only | sonnet |
| growth-bizdev | Sales & business development | Read-only | sonnet |
| privacy-governance | Minors' data & compliance (COPPA/state/FERPA) | Read-only | sonnet |
| data-analytics | Usage analytics & insight reports | Read + Bash | sonnet |

### Setup
1. Agents are already in `.claude/agents/` — they load automatically.
2. Restart your Claude Code session to pick up any changes.
3. Confirm with the `/agents` command.

### Usage
Call an agent explicitly: *"Have the privacy-governance agent review this migration."*
Or Claude Code routes automatically based on your request.

## Docs
- `docs/GTM-and-Business-Plan.md` — go-to-market strategy and business plan

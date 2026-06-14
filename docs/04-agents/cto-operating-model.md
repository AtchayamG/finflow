# CTO Operating Model

Codex is the CTO and project owner for FinFlow.

## Role Boundaries

| Actor | Role | Use For | Guardrail |
|---|---|---|---|
| Codex | CTO, architect, integrator, reviewer | Rules, architecture, task slicing, final truth checks, repo integration | Does not final-submit legal forms without explicit confirmation |
| Hermes Step Flash | Low-cost worker | Docs, checklists, demo script drafts, lightweight QA | Bounded task packets only |
| Hermes Nemotron | Reasoning worker | Architecture critique, hidden risk review, submission review | Reserve for complex review |
| Antigravity | High-value implementation or UI review | Narrow build slices after contracts stabilize | Use sparingly due to usage limits |
| User | Legal/account owner | Eligibility, final Devpost submit, platform identity, payments/tax | Human-controlled decisions |

## Delegation Rules

- No broad "build everything" prompts.
- Every worker receives a task packet with goal, allowed files, forbidden files, acceptance criteria, and verification commands.
- Workers must report using DONE, BLOCKED, RISK, NEXT.
- Codex reviews worker output before merging or using it.
- Worker output cannot claim public repo, live UiPath, CI, demo video, or Devpost completion unless verified.
- Antigravity is reserved for implementation slices with high leverage or visual polish.
- Hermes is the default for docs, checklists, and first-pass reviews.

## Task Packet Template

```md
# TASK-ID: Title

## Agent
Hermes Step Flash / Hermes Nemotron / Antigravity

## Goal
One concrete outcome.

## Files Allowed
- path list

## Files Forbidden
- path list

## Acceptance Criteria
- exact checks

## Verification
- commands or manual checks

## Reporting Format
DONE:
BLOCKED:
RISK:
NEXT:
```

## Stop Conditions

- Eligibility or legal acknowledgements are unresolved.
- UiPath Labs access is not available for platform-proof work.
- A worker edits unassigned files.
- Tests cannot run and the failure is unexplained.
- Docs claim functionality not yet implemented.
- Any secret, key, token, private account detail, or judge-only data is about to be committed or pasted publicly.
